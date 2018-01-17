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

SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
GH_CLIENT_ID = process.env.GH_CLIENT_ID;
GH_CLIENT_SECRET = process.env.GH_CLIENT_SECRET;

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
  var data = {
    client_id: GH_CLIENT_ID,
    client_secret: GH_CLIENT_SECRET,
    code: req.query.code,
    state: req.query.state,
  };
  if (req.session.auth_state != req.query.state) {
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
    res.redirect(req.query.callback);
  });
});

app.listen(app.get("port"), () => {
  console.log(`Find the server at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
});
