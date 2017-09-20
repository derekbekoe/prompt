# pylint: disable=line-too-long

import os
import logging
import docker
import hmac
from hashlib import sha1
from flask import Flask, jsonify, request, Response
from flask_cors import CORS, cross_origin

VERSION = '0.0.1'

WORKER_INFO = {
    'image': os.environ.get('INSTANCE_IMAGE_NAME'),
    'source_port': 3000,
}

docker_client = docker.from_env()
app = Flask(__name__)

logging.getLogger('flask_cors').level = logging.DEBUG

# GitHub API constants
GITHUB_UA_PREFIX = 'GitHub-Hookshot/'
GITHUB_EVENT_NAME_PING = 'ping'
GITHUB_EVENT_NAME_PR = 'pull_request'
GITHUB_ALLOWED_EVENTS = [GITHUB_EVENT_NAME_PING, GITHUB_EVENT_NAME_PR]

# Environment variables
ENV_REPO_NAME = os.environ.get('REPO_NAME') or "Azure/azure-cli"
ENV_GITHUB_SECRET_TOKEN = os.environ.get('GITHUB_SECRET_TOKEN')

def _verify_github_request(req):
    headers = req.headers
    raw_payload = req.data
    payload = req.get_json()
    # Verify User Agent
    ua = headers.get('User-Agent')
    assert ua.startswith(GITHUB_UA_PREFIX), "Invalid User-Agent '{}'".format(ua)
    # Verify Signature
    gh_sig = headers.get('X-Hub-Signature')
    computed_sig = 'sha1=' + hmac.new(bytearray(ENV_GITHUB_SECRET_TOKEN, 'utf-8'), msg=raw_payload, digestmod=sha1).hexdigest()
    assert hmac.compare_digest(gh_sig, computed_sig), "Signatures didn't match. Is the GitHub Secret Token correct?"
    # Verify GitHub event
    gh_event = headers.get('X-GitHub-Event')
    assert gh_event in GITHUB_ALLOWED_EVENTS, "Webhook does not support event '{}'".format(gh_event)
    # Verify the repository
    event_repo = payload['repository']['full_name']
    assert event_repo == ENV_REPO_NAME, "Not listening for events from repo '{}'".format(event_repo)
    return {'event': gh_event, 'payload': payload}

def _get_container(pr_number):
    container = docker_client.containers.create(WORKER_INFO['image'],
                                                ports={'{}/tcp'.format(WORKER_INFO['source_port']): int(pr_number)},
                                                environment={'PR_NUM': pr_number},
                                                labels={'PR_NUM': pr_number},
                                                detach=True,
                                                tty=True)
    return container, pr_number


def _stop_prev_container(pr_number):
    matches = docker_client.containers.list(filters={'label': 'PR_NUM={}'.format(pr_number)})
    if matches:
        # There should only be one match as the label and host port no. are the same.
        print("Removing already running container for PR {}".format(pr_number))
        matches[0].remove(v=True, force=True)


def _set_up_container_with_pr_num(pr_number):
    _stop_prev_container(pr_number)
    container, host_port = _get_container(pr_number)
    try:
        container.start()
        print("Started container for PR {}".format(pr_number))
        return host_port, container
    except docker.errors.APIError as e:
        # Failed (port binding might be taken)
        raise Exception("Unable to create container. Error={}".format(e))

@app.route("/")
def endpoint_hello():
    return jsonify(version=VERSION, message='All systems are go!')

@app.route('/github-webhook', methods=['POST'])
def handle_github_webhook():
    try:
        parsed_req = _verify_github_request(request)
        event = parsed_req['event']
        payload = parsed_req['payload']
        if event == GITHUB_EVENT_NAME_PING:
            return jsonify(ok=True)
        elif event == GITHUB_EVENT_NAME_PR:
            if payload['action'] not in ['opened', 'reopened', 'synchronize']:
                return jsonify(error="Action '{}' ignored.".format(payload['action']))
            pr_number = str(payload['pull_request']['number'])
            host_port, container = _set_up_container_with_pr_num(pr_number)
            return jsonify(port=host_port, container_id=container.id[:12])
        else:
            return jsonify(error="Event '{}' not supported.".format(event))
    except AssertionError as e:
        return jsonify(error=str(e))
    return jsonify(error='Unable to handle request.'), 500

@app.route('/create', methods=['POST'])
@cross_origin()
def endpoint_create():
    """ This is a test endpoint that takes a JSON object {"pr": "4509"}"""
    req_payload = request.get_json()
    if not req_payload:
        return jsonify(error=str("Invalid JSON object in request body. Is MIME type application/json?")), 400
    pr_number = str(req_payload['pr'])
    host_port, container = _set_up_container_with_pr_num(pr_number)
    return jsonify(port=host_port, container_id=container.id[:12])

if __name__ == "__main__":
    app.run()
