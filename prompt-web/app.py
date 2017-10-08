import os
import logging
import requests
import time
import random
import string
import pymongo
import datetime

from flask import Flask, jsonify, request, render_template, redirect, make_response, session
from flask_cors import CORS, cross_origin

from adal import AuthenticationContext

# The hostname where the app is running. e.g. https://myapp.azurewebsites.net/
REDIRECT_BASE = os.environ.get('REDIRECT_BASE')
# This is random. You can make it whatever you want.
APP_SECRET = os.environ.get('APP_SECRET')

# Auth information for registration
AUTH_TENANT = os.environ.get('AUTH_TENANT')
AUTH_CLIENTID = os.environ.get('AUTH_CLIENTID')
AUTH_CLIENTSECRET = os.environ.get('AUTH_CLIENTSECRET')
AUTH_AUTHORITYURL = os.environ.get('AUTH_AUTHORITYURL')
SUBSCRIPTION_ID = os.environ.get('SUBSCRIPTION_ID')

# Env vars for ACI instances
INSTANCE_IMAGE_NAME = os.environ.get('INSTANCE_IMAGE_NAME')
INSTANCE_RESOURCE_GROUP = os.environ.get('INSTANCE_RESOURCE_GROUP')
# Token for clean-up function
ACI_FUNCTION_TOKEN = os.environ.get('ACI_FUNCTION_TOKEN')

assert AUTH_TENANT and AUTH_CLIENTID and AUTH_CLIENTSECRET and AUTH_AUTHORITYURL and SUBSCRIPTION_ID, "Set the auth environment variables."

TEMPLATE_AUTHZ_URL = ('https://login.windows.net/{}/oauth2/authorize?'+
                      'response_type=code&client_id={}&redirect_uri={}&'+
                      'state={}&resource={}')
RESOURCE = 'https://management.core.windows.net/'

def get_random_guid():
    return ''.join(random.SystemRandom().choice(string.ascii_uppercase + string.digits) for _ in range(48))

def get_redirect_uri(url_root):
    return (REDIRECT_BASE or url_root) + 'login-token'

def myredirect(location, code=307):
    if location.startswith('http'):
        mylocation = location
    else:
        mylocation = (REDIRECT_BASE or '') + location
    if mylocation.endswith('//'):
        mylocation = mylocation[:-1]
    return redirect(mylocation, code=code)

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
app.secret_key = APP_SECRET

@app.route('/login')
def register_login():
    redirect_uri = get_redirect_uri(request.url_root)
    auth_state = get_random_guid()
    authorization_url = TEMPLATE_AUTHZ_URL.format(AUTH_TENANT, AUTH_CLIENTID, redirect_uri, auth_state, RESOURCE)
    session['auth_state'] = auth_state
    return myredirect(authorization_url, code=307)

@app.route('/login-token')
def handle_login_token():
    code = request.args.get('code')
    state = request.args.get('state')
    auth_state = session.get('auth_state')
    if auth_state != state:
        return myredirect('login', code=307)
    redirect_uri = get_redirect_uri(request.url_root)
    authority_url = (AUTH_AUTHORITYURL + '/' + AUTH_TENANT)
    auth_context = AuthenticationContext(authority_url, api_version=None)
    token_response = auth_context.acquire_token_with_authorization_code(code, redirect_uri, RESOURCE, AUTH_CLIENTID, AUTH_CLIENTSECRET)
    session['oid'] = token_response.get('oid')
    session['userId'] = token_response.get('userId')
    session['givenName'] = token_response.get('givenName')
    session['familyName'] = token_response.get('familyName')
    session['fullName'] = '{} {}'.format(token_response.get('givenName'), token_response.get('familyName'))
    return myredirect('/', code=307)

@app.route('/logout')
def register_logout():
    session.pop('oid', None)
    session.pop('userId', None)
    session.pop('givenName', None)
    session.pop('familyName', None)
    session.pop('fullName', None)
    return myredirect('/', code=307)

@app.route('/')
def root():
    full_name = session['fullName'] if 'userId' in session and 'fullName' in session else None
    return render_template('index.html', full_name=full_name)

def create_container(name, image, pr_number, user_id, resource_group, port=None, location='westus'):
    from azure.mgmt.containerinstance.models import (ContainerGroup, Container, ContainerPort, Port, IpAddress,
                                                 ImageRegistryCredential, ResourceRequirements, ResourceRequests,
                                                 ContainerGroupNetworkProtocol, OperatingSystemTypes, EnvironmentVariable)
    from random import randint
    import secrets
    pr_number = str(pr_number)
    if port is None:
        port = randint(1000, 65000)
    instance_token = secrets.token_urlsafe(256)
    environment_variables = [EnvironmentVariable('PR_NUM', pr_number),
                             EnvironmentVariable('PORT', port),
                             EnvironmentVariable('INSTANCE_TOKEN', instance_token)]
    tags = {'userId': user_id, 'prNumber': pr_number}
    container_resource_requests = ResourceRequests(memory_in_gb='1.5', cpu='1')
    container_resource_requirements = ResourceRequirements(requests=container_resource_requests)
    container = Container(name=name,
                          image=image,
                          resources=container_resource_requirements,
                          ports=[ContainerPort(port=port)],
                          environment_variables=environment_variables)
    cgroup_ip_address = IpAddress(ports=[Port(protocol=ContainerGroupNetworkProtocol.tcp, port=port)])
    cgroup_os_type = OperatingSystemTypes.linux
    cgroup = ContainerGroup(location=location,
                            containers=[container],
                            os_type=cgroup_os_type,
                            ip_address=cgroup_ip_address,
                            tags=tags)
    return get_aci_client().container_groups.create_or_update(resource_group, name, cgroup)

def get_aci_client():
    from azure.common.credentials import ServicePrincipalCredentials
    from azure.mgmt.containerinstance import ContainerInstanceManagementClient
    credentials = ServicePrincipalCredentials(
        client_id = AUTH_CLIENTID,
        secret = AUTH_CLIENTSECRET,
        tenant = AUTH_TENANT
    )
    return ContainerInstanceManagementClient(credentials, SUBSCRIPTION_ID)

def get_container_url(repo_name, user_id, pr_number, resource_group):
    client = get_aci_client()
    containers = client.container_groups.list_by_resource_group(resource_group)
    found_containers = [c for c in containers if c.tags and c.tags['prNumber']==pr_number and c.tags['userId']==user_id]
    if found_containers and len(found_containers) == 1:
        candidate = found_containers[0]
        instance_token = next((x.value for x in candidate.containers[0].environment_variables if x.name == 'INSTANCE_TOKEN'), None)
        container_url = 'http://{}:{}/?token={}'.format(candidate.ip_address.ip, candidate.ip_address.ports[0].port, instance_token)
        return container_url
    import uuid
    # The name can't be too long
    name = '{}-{}-{}-{}'.format(repo_name, user_id, pr_number, uuid.uuid4().hex[:5])
    candidate = create_container(name, INSTANCE_IMAGE_NAME, pr_number, user_id, resource_group)
    instance_token = next((x.value for x in candidate.containers[0].environment_variables if x.name == 'INSTANCE_TOKEN'), None)
    container_url = 'http://{}:{}/?token={}'.format(candidate.ip_address.ip, candidate.ip_address.ports[0].port, instance_token)
    return container_url

def delete_old_containers(resource_group):
    import datetime
    EXPIRY_DELTA = datetime.timedelta(minutes=15)
    client = get_aci_client()
    all_containers = client.container_groups.list_by_resource_group(resource_group)
    to_delete = []
    for c in all_containers:
        a = client.container_groups.get(resource_group, c.name)
        now = datetime.datetime.now(datetime.timezone.utc)
        stime = a.containers[0].instance_view.current_state.start_time
        if stime and stime + EXPIRY_DELTA < now:
            to_delete.append(a)
    for c in to_delete:
        client.container_groups.delete(resource_group, c.name)
    return len(to_delete)

@app.route('/r/Azure/azure-cli/<int:pr_number>')
def azure_cli(pr_number):
    if 'oid' not in session:
        return myredirect('login', code=307)
    pr_number = str(pr_number)
    container_url = get_container_url('azure-cli', session['oid'], pr_number, INSTANCE_RESOURCE_GROUP)
    return render_template('console.html', container_url=container_url)

@app.route('/aci-delete', methods=['POST'])
def aci_delete():
    f_token = request.args.get('function_token')
    if f_token != ACI_FUNCTION_TOKEN:
        return jsonify(error='Invalid token.'), 401
    num_deleted = delete_old_containers(INSTANCE_RESOURCE_GROUP)
    return jsonify(num_deleted=num_deleted)

if __name__ == "__main__":
    app.run()
