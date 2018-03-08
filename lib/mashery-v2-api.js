const crypto = require('crypto');
const rpn = require('request-promise-native');
const stringify = require('json-stringify');

module.exports.setConfiguration = function(configuration) {
  configuration = configuration || {};

  if (!configuration.apiKey) {
    throw 'Missing parameter: `apiKey`';
  }

  if (!configuration.apiSecret) {
    throw 'Missing parameter: `apiSecret`';
  }

  if (!configuration.masheryApiUrl) {
    throw 'Missing parameter: `masheryApiUrl`';
  }

  if (!configuration.serviceKey) {
    throw new 'Missing parameter: `serviceKey`';
  }

  if (!configuration.clientId) {
    throw new 'Missing parameter: `clientId`';
  }

  this.configuration = configuration;
};


module.exports.getConfiguration = function() {
  return this.configuration;
};

module.exports.postMashery = function(operation, parameters) {
  var now = Date.now();
  var timestamp = Math.floor(now / 1000);
  var composite = this.configuration.apiKey +
                  this.configuration.apiSecret +
                  timestamp;
  var signature = crypto.createHash('MD5').update(composite).digest('hex');
  var requestUrl = [ this.configuration.masheryApiUrl,
                    '?apikey=',
                    this.configuration.apiKey,
                    '&sig=',
                    signature].join('');

  var requestOptions = {
    url: requestUrl,
    method: 'POST',
    body: {
      jsonrpc: '2.0',
      method: operation,
      params: parameters,
      id: 1
    },
    json: true
  };

//  console.log('postMashery ' + stringify(requestOptions));
  return rpn(requestOptions);
};

module.exports.fetchApplication = function(redirectUri) {
  var fetchAppParams = {
    service_key: this.configuration.serviceKey,
    client : {
      client_id: this.configuration.clientId
    },
    response_type: 'code',
    uri: {
      redirect_uri: redirectUri,
      state: ''
    }
  };

  return this.postMashery('oauth2.fetchApplication', fetchAppParams);
};

module.exports.createAuthorizationCode = function(redirectUri, scope, userContext) {
  var createAuthorizationCodeParams = {
    service_key: this.configuration.serviceKey,
    client: {
      client_id: this.configuration.clientId
    },
    uri: {
      redirect_uri: redirectUri
    },
    scope: scope,
    user_context: userContext,
    response_type: 'code'
  };

  return this.postMashery('oauth2.createAuthorizationCode', createAuthorizationCodeParams);
};

module.exports.createAccessToken = function(authorizationCode, redirectUri) {
  var createAccessTokenParams = {
    service_key: this.configuration.serviceKey,
    client: {
      client_id: this.configuration.clientId,
      client_secret: this.configuration.clientSecret
    },
    token_data: {
      grant_type: 'authorization_code',
      code: authorizationCode,
      reponse_type: null,
      refresh_token: null,
      scope: ""
    },
    uri: {
      redirect_uri: redirectUri 
    }
  };
  //console.log('createAccessToken ' + stringify(createAccessTokenParams));
  return this.postMashery('oauth2.createAccessToken', createAccessTokenParams);
};
