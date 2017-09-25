// import npm packages
var Q = require('q');
// import files
var logger = require('../util/log').get();
var utils = require('../util/utils');
// models
var guestModel = require('../models/guest-model');


// POST User operation to register / save user
var saveGuestUser = function (guestUserDetails, deviceId) {
	var deferred = Q.defer();
	if (validateGuestDetails(guestUserDetails)) {
		guestModel.saveGuestUser(guestUserDetails, deviceId)
		.then(function success(result) {
			deferred.resolve(result);
		}, function failure(err) {
			logger.error("Guest User Registration: Guest User details save failure: " + err);
			deferred.reject(err);
		});	
	} else {
		var err = new Error("guest user details validation failed !!!");
		logger.error(err);
		deferred.reject(err);
	}
	
	return deferred.promise;
};

var validateGuestDetails = function (guestUserDetails) {
	if (!guestUserDetails || 
		!guestUserDetails.appVer || !guestUserDetails.deviceInfo) {
		return false;
	} else {
		return true;
	}
};

// exports section 
exports.saveGuestUser = saveGuestUser;