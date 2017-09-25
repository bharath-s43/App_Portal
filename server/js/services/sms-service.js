// import npm packages
var Q = require('q');
var https = require('https');
// import files
var logger = require('../util/log').get();
var utils = require('../util/utils');
var userService = require('./user-service');

var sendPin = function (userDetails) {
	var deferred = Q.defer();

    var data = JSON.stringify({
      api_key: '00d851b1',
      api_secret: '7a03ff121bfe14e5',
      number: userDetails.contactNo,
      brand: 'Applause'
    });

    var options = {
      host: 'api.nexmo.com',
      path: '/verify/json',
      port: 443,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    var req = https.request(options);

    req.write(data);
    req.end();

    var responseData = '';
    req.on('response', function(res){
      res.on('data', function(chunk){
        responseData += chunk;
      });

      res.on('end', function(){
       var nexmoResponse = JSON.parse(responseData);
       var smsResponse = {};
       console.log(nexmoResponse);
        //
        if(nexmoResponse.status == 0 && nexmoResponse.request_id) { //success
        	smsResponse.requestId = nexmoResponse.request_id;
        	deferred.resolve(smsResponse);
        } else { //someting went wrong
        	var err = new Error("Send pin error: Error send Pin !!!");
    			logger.error(err.message);
    			deferred.reject(err);
        }

      });
    });

    return deferred.promise;
};

var confirmPin = function(userPinDetails) {
	var deferred = Q.defer();

    var data = JSON.stringify({
      api_key: '00d851b1',
      api_secret: '7a03ff121bfe14e5',
      request_id: userPinDetails.requestId,
      code: userPinDetails.pin
    });

  var options = {
    host: 'api.nexmo.com',
    path: '/verify/check/json',
    port: 443,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  var req = https.request(options);

  req.write(data);
  req.end();

  var responseData = '';
  req.on('response', function(res){
    res.on('data', function(chunk){
      responseData += chunk;
    });

    res.on('end', function(){
      var nexmoResponse = JSON.parse(responseData);
      var confirmResponse = {};

      if(nexmoResponse.status == 0) { //success
      	confirmResponse.eventId = nexmoResponse.event_id;

        userService.verifyContactNumber(userPinDetails.contactNo)
        .then(function (result) {
          deferred.resolve(confirmResponse);
        }, function (err) {
          deferred.reject(err);
        });

      } else {
        var err = "Error";
        if (nexmoResponse.status == 6) {
          err = new Error("Pin was not found or it has been verified already.");
          err.code = 300;
        } else {
          err = new Error("Confirm pin error... Nexmo Response: " + responseData);
          err.code = 200;
        };
    		deferred.reject(err);
      }
    });
  });

  return deferred.promise;
};

var sendSms = function (to, text) {

  var data = JSON.stringify({
  api_key: '00d851b1',
  api_secret: '7a03ff121bfe14e5',
  to: to,
  from: '5445453453',
  text: text
  });

  var options = {
  host: 'rest.nexmo.com',
  path: '/sms/json',
  port: 443,
  method: 'POST',
  headers: {
   'Content-Type': 'application/json',
   'Content-Length': Buffer.byteLength(data)
  }
  };

  var req = https.request(options);

  req.write(data);
  req.end();

  var responseData = '';
  req.on('response', function(res){
  res.on('data', function(chunk){
   responseData += chunk;
  });

  res.on('end', function(){
   //console.log(JSON.parse(responseData));
  });
  });
}

exports.sendPin = sendPin;
exports.confirmPin = confirmPin;
exports.sendSms = sendSms;