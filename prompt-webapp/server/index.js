const express = require("express");
const fs = require("fs");
const sgMail = require('@sendgrid/mail');

const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.set("port", process.env.PORT || 3001);

// Express only serves static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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

app.listen(app.get("port"), () => {
  console.log(`Find the server at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
});
