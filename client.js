exports.printMsg = function() {
  console.log('This is a message from the demo package');
};

var bodyParser = require('body-parser');
var express = require('express');
var path = require('path');
var fileSystem = require('fs');
var stringify = require('json-stringify');
const uuid = require('uuid/v4');
const nodeCache = require('node-cache');
const config = require('./config/config.json');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/static', express.static('content/static'));
app.set('views', __dirname + '/content/views');
app.set('view engine', 'ejs');

// validate config
// ...
//

const contextCache = new nodeCache({
  stdTTL: 300,
  checkperiod: 60,
  useClones: false 
});

app.get('/client', function(req, res) {
  res.send('Healthy.');
});

app.get('/client/authorize', function(req, res) {
  var redirect_uri = req.protocol + '://' +
                     req.get('host') +
                     '/client/authorized';
  var context = {
    state: uuid(),
    client_id: config.client.client_id,
    redirect_uri: redirect_uri,
    service_key: config.client.service_key
  };

  contextCache.set(context.state, context);

  res.render('client/pages/authorize', {
    state: context.state,
    client_id: config.client.client_id,
    redirect_uri: context.redirect_uri,
    service_key: context.service_key,
    scope: '',
    auth_url: config.client.auth_url,
    client_name: config.client.client_name
  });
});

app.get('/client/authorized', function(req, res) {
  // verify state
 
  var context = contextCache.get(req.query.state); 
  if (!context) {
    res.status(401);
    res.send('Inconsistent state ' + req.query.state);
    return;
  }

  res.render('client/pages/authorized', {
    code: req.query.code,
    state: req.query.state,
    client_id: context.client_id,
    redirect_uri: context.redirect_uri,
    service_key: context.service_key,
    token_url: config.client.auth_url + "/token",
    client_name: config.client.client_name
  });
});

app.listen(config.client.port);
