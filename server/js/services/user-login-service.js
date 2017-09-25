// import npm packages
var Q = require('q');
// import files
var logger = require('../util/log').get();
var utils = require('../util/utils');
// models
var userLoginModel = require('../models/user-login-model');


// POST User operation to register / save user
var loginUser = function (userLoginDetails) {
	var deferred = Q.defer();

	if (validateUserLoginDetails(userLoginDetails)) {
		try {
		  userLoginDetails.password = utils.decryptAES(userLoginDetails.password);
		} catch (err) {
		}
		userLoginModel.loginUser(userLoginDetails)
		.then(function success(result) {
			deferred.resolve(result);
		}, function failure(err) {
			deferred.reject(err);
		});
	} else {
		var err = new Error("Incomplete login details !!!");
		logger.error(err);
		deferred.reject(err);
	};

	return deferred.promise;
};

// Validating user details send in requests
var validateUserLoginDetails = function (userLoginDetails) {
	if ((userLoginDetails.email && userLoginDetails.password) 
		|| (userLoginDetails.contactNo && userLoginDetails.password)) {
		return(true);
	} else {
		return(false);
	}
};


// exports section 
exports.loginUser = loginUser;