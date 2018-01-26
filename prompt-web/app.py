def create_container(name, image, pr_number, user_id, resource_group, port=None, location='westus'):
    from azure.mgmt.containerinstance.models import (ContainerGroup, Container, ContainerPort, Port, IpAddress,
                                                     ImageRegistryCredential, ResourceRequirements, ResourceRequests,
                                                     ContainerGroupNetworkProtocol, OperatingSystemTypes, EnvironmentVariable,
                                                     Volume, AzureFileVolume, VolumeMount)
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
                          environment_variables=environment_variables,
                          volume_mounts=[VolumeMount('volume1', '/cert', read_only=True)])
    cgroup_ip_address = IpAddress(ports=[Port(protocol=ContainerGroupNetworkProtocol.tcp, port=port)])
    cgroup_os_type = OperatingSystemTypes.linux
    afv = AzureFileVolume(SHARE_NAME, SHARE_STORAGE_ACCOUNT_NAME, read_only=True, storage_account_key=SHARE_STORAGE_ACCOUNT_KEY)
    cgroup = ContainerGroup(location=location,
                            containers=[container],
                            os_type=cgroup_os_type,
                            ip_address=cgroup_ip_address,
                            tags=tags,
                            volumes=[Volume('volume1', afv)])
    return get_aci_client().container_groups.create_or_update(resource_group, name, cgroup)
add_dns_a_record(candidate.name, candidate.ip_address.ip)


def delete_old_containers(resource_group):
    import datetime
    EXPIRY_DELTA = datetime.timedelta(minutes=60)
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
        remove_dns_a_record(c.name)
    return len(to_delete)

def remove_dns_a_record(record_set_name):
    from azure.mgmt.dns.models import (ARecord, RecordSet)
    record_type = 'a'
    ncf = get_dns_client().record_sets
    return ncf.delete(DNS_RESOURCE_GROUP, INSTANCE_DNS_ZONE, record_set_name, record_type)

def add_dns_a_record(record_set_name, ip):
    from azure.mgmt.dns.models import (ARecord, RecordSet)
    ncf =  get_dns_client().record_sets
    record = ARecord(ipv4_address=ip)
    record_type = 'a'
    record_set = RecordSet(name=record_set_name, type=record_type, ttl=3600)
    record_set.arecords = [record]
    return ncf.create_or_update(DNS_RESOURCE_GROUP, INSTANCE_DNS_ZONE, record_set_name,
                                record_type, record_set)

@app.route('/aci-delete', methods=['POST'])
def aci_delete():
    f_token = request.args.get('function_token')
    if f_token != ACI_FUNCTION_TOKEN:
        return jsonify(error='Invalid token.'), 401
    num_deleted = delete_old_containers(INSTANCE_RESOURCE_GROUP)
    return jsonify(num_deleted=num_deleted)
