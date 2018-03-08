exports.printMsg = function() {
  console.log('This is a message from the demo package');
};

var bodyParser = require('body-parser');
var express = require('express');
var path = require('path');
var fileSystem = require('fs');
var stringify = require('json-stringify');
var mv2api = require('./lib/mashery-v2-api.js');
const config = require('./config/config.json');
var app = express();

mv2api.setConfiguration({
  serviceKey: 'nil',
  clientId: 'nil',
  clientSecret: config.client.client_secret,
  apiKey: config.server.mashery.api_key,
  apiSecret: config.server.mashery.api_secret,
  masheryApiUrl: config.server.mashery.api_URL
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/static', express.static('content/static'));
app.set('views', __dirname + '/content/views');
app.set('view engine', 'ejs');

app.get('/server', function(req, res) {
  res.send('Healthy.');
});

app.post(config.server.auth_url, function(req, res) {
  var conf = mv2api.getConfiguration();
  conf.clientId = req.body.client_id;
  mv2api.setConfiguration(conf);
  
  mv2api.fetchApplication(req.body.redirect_uri)
  .then(function(body) {
//    console.log('success fetchApplication: ' + stringify(body));
    res.render('server/pages/login', { 
      client_name: body.result.name,
      server_name: config.server.server_name,
      login_url: config.server.login_url,
      client_id: req.body.client_id,
      service_key: req.body.service_key,
      redirect_uri: req.body.redirect_uri,
      state: req.body.state
    });
  })
  .catch(function(err) {
//    console.log('failure fetchApplication: ' + stringify(err));
    res.status(401);
  });
});

app.post(config.server.login_url, function(req, res) {
  var user = req.body.login;

  // Here we could validate the login credentials
  // TODO: validate credentials

  var conf = mv2api.getConfiguration();
  conf.clientId = req.body.client_id;
  conf.serviceKey = req.body.service_key;
  mv2api.setConfiguration(conf);

  mv2api.createAuthorizationCode(req.body.redirect_uri, req.body.scope, user)
  .then(function(body) {
//    console.log('success createAuthorizationCode: ' + stringify(body));
    res.redirect(body.result.uri.redirect_uri + '&state=' + req.body.state);
  })
  .catch(function(err) {
    if (err) {
      console.log('failure createAuthorizationCode: ' + stringify(err));
      res.status(401);
    }
  });
});

app.post(config.server.token_url, function(req, res) {
//  console.log("POST " + config.server.token_url + " " + stringify(req.body));

  var code = req.body.code;
  var redirect_uri = req.body.redirect_uri;

  mv2api.createAccessToken(code, redirect_uri)
    .then(function(body) {
//      console.log('success createAccessToken ' + stringify(body));
      res.end(stringify(body.result));
    })
    .catch(function(err) {
      console.log('failure createAccessToken ' + stringify(err));
      res.status(401);
    });
});

app.listen(config.server.port);
