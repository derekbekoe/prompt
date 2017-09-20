# Prompt
Instantly view changes to a PR.

Visit https://prompt.ws

## Azure Services

- Azure App Service for Linux - Frontend of the app.
- Azure Container Instances - Used to host your private instance.
- Azure Functions - Periodically delete old container instances.

## Manually starting the containers

### Web frontend

Example:
```bash
cd prompt-web
sudo docker build -t derekbekoe/prompt-web:0.15 .
docker run -d -p 5000:80 -e APP_SECRET=XXXX -e AUTH_TENANT=XXXX -e AUTH_CLIENTID=XXXX -e AUTH_CLIENTSECRET=4XXXX -e AUTH_AUTHORITYURL=XXXX -e HOSTNAME='' -e SUBSCRIPTION_ID=XXXX -e INSTANCE_IMAGE_NAME=XXXX -e INSTANCE_RESOURCE_GROUP=XXXX -e ACI_FUNCTION_TOKEN=XXXX derekbekoe/prompt-web:0.15
```

### Instance container

Example:
```bash
cd prompt-instance
sudo docker build -t derekbekoe/prompt-instance-azure-cli:0.5 .
sudo docker run -d -p 4999:1000 -e PR_NUM=XXXX -e PORT=1000 -e INSTANCE_TOKEN=XXXX derekbekoe/prompt-instance-azure-cli:0.5
```
