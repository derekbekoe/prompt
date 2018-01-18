const express = require("express");
const fs = require("fs");
const sgMail = require('@sendgrid/mail');

const bodyParser = require('body-parser');
var cookieSession = require('cookie-session')

const querystring = require('querystring');
const uuidv4 = require('uuid/v4');

const fetch = require('node-fetch');

const app = express();

// TODO This key should be env var that's passed in
app.use(cookieSession({
  name: 'session',
  keys: ['8VCyVMntHQHHgcRkau5w7utg'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.set("port", process.env.PORT || 3001);

// Express only serves static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const GH_CLIENT_ID = process.env.GH_CLIENT_ID;
const GH_CLIENT_SECRET = process.env.GH_CLIENT_SECRET;

sgMail.setApiKey(SENDGRID_API_KEY);

app.post("/api/register-interest", (req, res) => {
  var msg = {
    to: req.body.email,
    bcc: ['debekoe@microsoft.com'],
    from: 'no-reply@prompt.ws',
    subject: 'Hello from Prompt!',
    text: "Hi! Thank you for your interest. We'll be in touch.",
    html: '<p>Hi <strong>'+req.body.email+'</strong></p><p>Thank you for your interest. We recorded your interest as <strong>'+req.body.msg+"</strong></p><p>We'll be in touch!</p>",
  };
  sgMail.send(msg).then(() => {
        res.json(['ok']);
    })
    .catch(error => {
        //Log friendly error
        console.error(error.toString());
        res.json(['error']);
    });
});

app.post("/api/login", (req, res) => {
  var callback_url = req.body.callback;
  var auth_state = uuidv4();
  req.session.auth_state = auth_state;
  var data = {
    client_id: GH_CLIENT_ID,
    scope: 'read:user read:org',
    state: auth_state,
    allow_signup: 'false',
    redirect_uri: 'http://localhost:' + app.get("port") + '/api/gh_oauth?' + querystring.stringify({callback: callback_url}),
  };
  var sdata = querystring.stringify(data);
  res.send({uri: 'https://github.com/login/oauth/authorize?' + sdata});
});

app.get("/api/gh_oauth", (req, res) => {
  const code = req.query.code;
  const state = req.query.state;
  const callback = req.query.callback;
  var data = {
    client_id: GH_CLIENT_ID,
    client_secret: GH_CLIENT_SECRET,
    code: code,
    state: state,
  };
  if (req.session.auth_state != state) {
    req.session = null;
    res.sendStatus(403);
    return;
  }
  sdata = querystring.stringify(data);
  fetch('https://github.com/login/oauth/access_token?'+sdata, {
    accept: "application/json",
    headers: {"Accept": "application/json"},
  })
  .then(function(r) {
    return r.json();
  }).then(function(a) {
    req.session.gh_token = a.access_token;
    fetch('https://api.github.com/user', {
      accept: "application/json",
      headers: {'Authorization': 'token ' + a.access_token, "Accept": "application/json"},
    })
    .then((r) => {return r.json()})
    .then(function(b) {
      req.session.user = {id: b.id, name: b.name, username: b.login};
      res.redirect(callback);
    });
  });
});

app.get(`/api/user`, (req, res) => {
  if (!req.session.user || !req.session.gh_token) {
    res.sendStatus(400);
    return;
  }
  res.json(req.session.user);
});

app.post("/api/logout", (req, res) => {
  req.session = null;
  res.sendStatus(200);
});

// ACI Endpoints - Start

var msRestAzure = require('ms-rest-azure');
var ContainerInstanceManagementClient = require("azure-arm-containerinstance");

const AZURE_SUB_ID = process.env.AZURE_SUB_ID;
const AZURE_CLIENT_ID = process.env.AZURE_CLIENT_ID;
const AZURE_CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET;
const AZURE_TENANT_ID = process.env.AZURE_TENANT_ID;
const AZURE_RESOURCE_GROUP = process.env.AZURE_RESOURCE_GROUP;
const AZURE_DNS_ZONE = process.env.AZURE_DNS_ZONE;

var getAzureClient = (clientClass, cb) => {
  msRestAzure.loginWithServicePrincipalSecret(AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID, (err, credentials) => {
    const client = new clientClass(credentials, AZURE_SUB_ID);
    cb(client);
  });
};


var apiGetContainer = (req, res) => {
  const prNumber = req.query.pr;
  if (!req.session || !req.session.user.id) {
    res.sendStatus(403);
    return;
  }
  if (!prNumber) {
    res.sendStatus(400);
    return;
  }
  // TODO use the one from the session
  // const userId = req.session.user.id;
  const userId = '6c35b389-284a-4416-ab4d-c6ba5f44ea27';
  getAzureClient(ContainerInstanceManagementClient, (aciClient) => {
    aciClient.containerGroups.listByResourceGroup(AZURE_RESOURCE_GROUP)
    .then((containers) => {
      const foundContainers = containers.filter((el) => {
        return el.tags['prNumber'] == prNumber && el.tags['userId'] == userId;
      });
      if (foundContainers && foundContainers.length == 1) {
        const candidate = foundContainers[0];
        const instanceToken = candidate.containers[0].environmentVariables.filter((el) => {
          return el.name == 'INSTANCE_TOKEN';
        })[0].value;
        const containerUrl = 'https://'+candidate.name+'.'+AZURE_DNS_ZONE+':'+candidate.ipAddress.ports[0].port+'/?token='+instanceToken
        res.json({instanceSrc: containerUrl});
      } else {
        res.sendStatus(404);
      }
    });
  });
};

app.get("/api/container", apiGetContainer);

// ACI Endpoints - End

app.listen(app.get("port"), () => {
  console.log(`Find the server at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
});
