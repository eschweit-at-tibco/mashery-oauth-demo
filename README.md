# mashery-oauth-demo 

This is a simple set of applications written in Node.js Express aimed at demonstrating API Management with end-user, OAuth2-based security with TIBCO Mashery. The server application acts as an OAuth2 Authorization Server and leverages the Mashery OAuth2 API (also called the OAuth2 Accelerator).

Note that only the authorization code grant is illustrated, whereas TIBCO Mashery would support the three other grant types.

## Getting Started

### Understanding OAuth2 grant workflows

A lot of good material is available on OAuth2, but be advised that it takes a bit of time to settle in if you are very new to the subject:
* Aaron Parecki's [OAuth2 Simplified](https://aaronparecki.com/oauth-2-simplified/)
* Aaron Parecki's [OAuth2 Servers](https://oauth.com), even though you will come to realise that TIBCO Mashery covers the vast majority of what is required.
* Johann Reinke's [Understanding OAuth2](http://www.bubblecode.net/en/2016/01/22/understanding-oauth2/)
* IETF [OAuth 2.0 Authorization Framework](https://tools.ietf.org/html/rfc6749), aka RF6749.

There is also a series of articles written by Andy Hampshire that give a lot more details about how TIBCO Mashery supports OAuth2 (including a lot of background required to understand how the server part of the code works) and how to configure your APIs in the Mashery Command Centre to accept OAuth2:

* [Getting Started with OAuth2](https://community.tibco.com/wiki/tibco-masheryr-getting-started-guide-working-oauth-2)
* [OAuth 2.0 Implementation Guide](https://community.tibco.com/wiki/tibco-mashery-oauth-20-implementation-guide)
* [OAuth 2.0 API](https://community.tibco.com/wiki/tibco-masheryr-oauth-20-api)

### Prerequisites

In order to use this demo, you will need a running, OAuth2-enabled instance on which you have administration rights. Note that some trial instances do not come with OAuth2 enabled.

You will need to procure an API key for the API of the TIBCO Mashery product itself.
This is done on the developer.mashery.com website by [registering](https://developer.mashery.com/apps/register). It will be send with a secret value that is also required.

The Site ID of your Mashery instance will also to be procured from [TIBCO Support](https://support.tibco.com).

Finally you will need to select one of your TIBCO Mashery API Definitions and make good note of its Service ID. This is fairly to do as it is part of URL when you edit an API Definition in Mashery Control Centre as in `https://yourdomain.admin.mashery.com/control-center/api-definitions/ServiceID`. This API (and its endpoints) will need to be configured for use with OAuth2, please refer to Andy Hampshire's [tutorial](https://community.tibco.com/wiki/tibco-masheryr-getting-started-guide-working-oauth-2) for guidance.

### Configuring

A file containing all the necessary configuration items has been set up in `config/config.json`. That file is in JSON format and contains three sections:

* `client`
    * `client_id`: The ID of the partner developer application this client app impersonates, as declared on your Mashery instance. This ID will be visible in the URL when you edit the application details in the `Manage > Applications` section of Mashery Control Centre.
    * `auth_url`: refer to the `server` section; this should hold the same value prefixed with the protocol, hostname, and port.
    * `token_url`: refer to the `server` section; this should hold the same value prefixed with the protol, hostname, and port.
    * `service_key`: The Mashery Service ID of the resource the client tries do get access to. This ID will be visible at the end of the URL when you edit the API details in the `Design > APIs`section fo Mashery Control Centre.
* `server`
    * `mashery`
        * `api_key`: cut and paste your Mashery V2+V3 API Key here.
        * `api_secret`: cut and paster your Mashery API Key secret here.
        * `api_URL`: the URL to invoke Mashery V2 API operations, add your Site ID. 
    * `server_name`: the label to be displayed on the Authorisation Server's web page.
    * `port`: the port on which the server application will listen.
    * `auth_url`: the URL the server will use to serve OAuth2 code requests.
    * `login_url`: the URL the server will use to serve its login page.
    * `token_url`: the URL the server will use to serve OAuth2 token requests.
* services
    * This section is not used yet. The main idea is to define list the resources that can be subject to an OAuth2 access grant, and associate them with some label, description, and list of scopes that could be granted.

### Starting up the demonstration

You will need to have `node` and `npm` available.

Perform (only once) the installation of dependencies by running `npm install` in the demonstration's directory.

Once the configuration is complete, you will just need to run two node.js instances:
* server: `node server.js`
* client: `node client.js`

**Important**: due to the way OAuth2 workflows are performed, it is necessary that your authorisation server uses `https`.

To initiate a grant workflow, use your browser and type `http://your.hostna.me:yourport/client/authorize` and follow the different steps.

The very last page to be displayed in your browser is the full JSON content for the access token that was produced. You can then use that token (the value associated to `access_token` in the JSON) to invoke your target back-end service API. Just place the token in a HTTP header named `Authorization` when making the request in the following way: `Bearer your_access_token`.

One of the planned improvements is to add that API call directly in the client application. Client applications would typically store the token for subsequent use by the current application user.
 
### What happens in the back-end

If the back-end service you exposed on TIBCO Mashery is called, then you are certain that the OAuth2 grant was successful. That back-end still needs to act accordingly based on the identity of the resource owner and the granted scope.

These details will be passed by Mashery using HTTP headers:
* `X-Mashery-Oauth-Access-Token`: the access token used to invoke the API,
* `X-Mashery-Oauth-Client-Id`: the `client_id`, i.e. the application the call was made from,
* `X-Mashery-Oauth-User-Context`: the user context, in our case this is the login name the user authenticated herself with on the login page,
* `X-Mashery-Oauth-Scope`: the scope that was granted, a series of labels separated by whitespace characters.

Your implementation should leverage these to serve the request.

## Built With

* Node.js
* [TIBCO Mashery](https://www.mashery.com)

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgemnts

* Andy Hampshire for his excellent Mashery OAuth2 content on [TIBCO Community](https://community.tibco.com)
* Brian Antonelli and Cox Automotive whose [Mashery Node](https://github.com/Cox-Automotive/mashery-node) code inspired the V2 client.


