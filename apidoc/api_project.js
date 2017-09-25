define({
  "name": "Applause",
  "version": "0.1.0",
  "description": "api documentation for applause \n<h4><b>Authentication:</b><br><ul><li>The end-user posts the credentials (username and password) to the server applications.</li><li>The application receives the credentials from a Http request and validates these credentials by querying the database. If the user is validated, the token will be created based on the user information. This token is stored in the response header. This token information, which consist of token, expiration, etc. will be stored on the client-side application.</li><li>The token will be used for making each request from client to the application. This token information will be present in the request header. The server application is now responsible for validating an incoming token.</li><li>If the token is valid, then the response for the desired result will be send by the service to the client.</li><li>npm package used - jsonwebtoken</li></ul><b>Authorization:</b><br><ul><li>npm package used - acl</li><li>acl assigns roles to users (superadmin, customer/brand/location admin, employee, end consumer)</li><li>We assign permissions to each role for specific resources (i.e. API's) eg.<ul><li>api/v1/employee [get] to end consumer</li><li>api/v1/employee [post] to superadmin, customer admin, brand admin</li></ul></li><li>Whenever any request is made, we check if that user has permission for the resouce. If yes then the request is passed forward else authorization error is thrown.</li></ul><b>Security:</b><br><ul><li>HTTPS (HTTP over SSL or HTTP Secure) is the use of Secure Socket Layer (SSL) or Transport Layer Security (TLS) as a sublayer under regular HTTP application layering.</li><li>Request and response communication between client and server is encrypted. </li></ul><b>Response Format:</b><br><ul><li>Every response contains code, displayMessage, errorMessage & data</li><li>For succesfull request <ul> <li>code = 0</li> <li>errorMessage = empty</li> <li>displayMessage = message to display</li> <li>data will contain the objects or data to be sent</li> </ul></li><li>For unsuccesfull request <ul> <li>code = nonzero</li> <li>errorMessage = error occured on server</li> <li>displayMessage = message to display</li> </ul></li></ul><b>Http status codes:</b><br><ul><li>200 - OK</li><li>404 - Not Found</li></ul><b>Response codes:</b><br><ul><li>0 - Successfull request</li><li>non-zero - unsuccessfull request</li></ul></h4>",
  "title": "Custom apiDoc browser title",
  "url": "https://applause-dev.appspot.com/api/v1",
  "order": [
    "Customers",
    "Brands",
    "Locations",
    "Employees",
    "Feedback",
    "Users",
    "sendOtpApi",
    "resetPasswordWithOtpApi",
    "Forgot Password",
    "user login",
    "Guest"
  ],
  "sampleUrl": false,
  "defaultVersion": "0.0.0",
  "apidoc": "0.3.0",
  "generator": {
    "name": "apidoc",
    "time": "2017-03-29T10:24:16.075Z",
    "url": "http://apidocjs.com",
    "version": "0.17.5"
  }
});
