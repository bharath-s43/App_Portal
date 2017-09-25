// import npm packages
var Q = require('q');
// import files
var logger = require('../util/log').get();
var utils = require('../util/utils');
// models
var userModel = require('../models/user-models');
//services
var mailService = require('./mail-service');
var aclService =  require('./acl-service');
var forgotPasswordService = require('./forgot-password-service');
var customerService = require('./customer-service');
var brandService = require('./brand-service');
var locationService = require('./location-service');

// POST User operation to register / save user
var saveUser = function (userDetails, contactUserFlag, siteBase) {
	var deferred = Q.defer();

	if (validateUserDetails(userDetails)) {
		
		if(userDetails.password) {
			//decrypt password
			try{
				userDetails.password = utils.decryptAES(userDetails.password);
			} catch(err) {

			}
		}

		userModel.saveUser(userDetails)
		.then(function success(result) {
			if (result.regType === 'EMAIL' && contactUserFlag !== 1) {
				//Create token for account activation
				var activationTokenDecrypred = result._id + "+" + userDetails.email;
				var activationTokenEncrypred = utils.encryptAES(activationTokenDecrypred);

				var activationLink = siteBase + "/api/v1/users/activate/"+ activationTokenEncrypred;
				//Configure mail options
				var mailOptions = {};
				mailOptions.to = userDetails.email;
				mailOptions.subject = "Applause Activation";
				mailOptions.template = "activate_email";
				mailOptions.context = {};
				mailOptions.context.firstName = userDetails.personalInfo.fullName;
				mailOptions.context.activationLink = activationLink;
				mailOptions.context.logoPath = siteBase;

				//send email
				mailService.sendMail(mailOptions);
			}

			deferred.resolve(result);
		}, function failure(err) {
			logger.error("User Registration: User details save failure: " + err);
			deferred.reject(err);
		});

	} else {
		var err = new Error("user details validation failed !!!");
		logger.error(err);
		deferred.reject(err);
	};

	return deferred.promise;
};

// check if user already exists in db
var checkEmailUser= function (userDetails) {
	var deferred = Q.defer();

	if (!userDetails.email) {
		var err = new Error("Email absent in user request !!!");
		err.code = 300;
		deferred.reject(err);
	} else {
		userModel.checkEmailUser(userDetails.email)
		.then(function success(result) {
			deferred.resolve(result);
		}, function failure(err) {
			deferred.reject(err);
		});
	};

	return deferred.promise;
};


// check if user already exists in db
var checkContactUser= function (userDetails) {
	var deferred = Q.defer();

	if (!userDetails.phoneNo) {
		var err = new Error("Contact Number absent in user request !!!");
		err.code = 400;
		deferred.reject(err);
	} else {
		userModel.checkContactUser(userDetails.phoneNo)
		.then(function success(result) {
			deferred.resolve(result);
		}, function failure(err) {
			deferred.reject(err);
		});
	};

	return deferred.promise;
};

// check if user already exists in db
var checkFBUser= function (userDetails) {
	var deferred = Q.defer();

	if (!userDetails.fbUniqId) {
		var err = new Error("FB unique id absent in user request !!!");
		err.code = 400;
		deferred.reject(err);
	} else {
		userModel.checkFBUser(userDetails.fbUniqId)
		.then(function success(result) {
			deferred.resolve(result);
		}, function failure(err) {
			deferred.reject(err);
		});
	};

	return deferred.promise;
};


// Validating user details send in requests
var validateUserDetails = function (userDetails) {
	if (!userDetails || !userDetails.regType || !((userDetails.phoneNo && userDetails.regType === 'CONTACTNO') || (userDetails.email && userDetails.regType === 'EMAIL') || (userDetails.fbUniqId && userDetails.regType === 'FB')) || !userDetails.roleId
		|| !userDetails.personalInfo 
		|| !userDetails.personalInfo.fullName) {
		return(false);
	} else {
		return(true);
	}
};

var validateUserId = function (userId) {
	if(!userId) {
		return(false);
	} else {
		return(true);
	}
}

//activate account
/*
 * ACTIVATE account i.e. set is_active flag to 1  
 */
var activateUser = function (userId, email) {
	var deferred = Q.defer();

	if(validateUserId(userId)) {
		userModel.activateUser(userId, email)
		.then(
			function success(result) {
				deferred.resolve(result);
			}, function failue(err) {
				logger.error('User Activation Error :' + err);
				deferred.reject(err);
			}
		);
	}
	else {
		var err = 'Users: Incomplete information in request !!!';
		err.code = 400; 
		logger.error(err);
		deferred.reject(new Error(err));
	}

	return deferred.promise;
};

var setEmailSent = function(userDetails){
	var deferred = Q.defer();

	userModel.setEmailSent(userDetails)
	.then(
		function success(result) {
			deferred.resolve(result);
		}, function failue(err) {
			logger.error('Set email sent :' + err);
			deferred.reject(err);
		}
	);

	return deferred.promise;
};

var verifyContactNumber = function (contactNo) {
	var deferred = Q.defer();

	userModel.verifyContactNumber(contactNo)
	.then(
		function success(result) {
			deferred.resolve(result);
		}, function failue(err) {
			logger.error('Contact Number Verification Error:' + err);
			deferred.reject(err);
		}
	);
	
	return deferred.promise;
};

var updateUser = function (userDetails) {
	var deferred = Q.defer();
	if ((userDetails.regType == "EMAIL" && userDetails.email) || (userDetails.regType == "CONTACTNO" && userDetails.phoneNo)) {
		userModel.updateUser(userDetails)
		.then(function (result) {
			deferred.resolve(result);
		}, function (err) {
			deferred.reject(err);
		});
	} else {
		var err = new Error("User should either enter contact number or email to update details.");
		err.code = 201;
		logger.error(err);
		deferred.reject(err);
	};

	return deferred.promise;
};

var resetPassword = function (resetDetails) {
	var deferred = Q.defer();

	if (resetDetails.otpId && resetDetails.otp && resetDetails.password) {
		(function (exports) {
		  'use strict';
		 
		  var Sequence = exports.Sequence || require('sequence').Sequence
		    , sequence = Sequence.create()
		    , err
		    ;

		/* Using sequence package to make callback sync for maintaining atomic DB transactions */
		sequence
			.then(function (next) {
					var otpDetails = {};
					otpDetails.otpId = resetDetails.otpId;
					otpDetails.otp = resetDetails.otp;
					forgotPasswordService.confirmOtp(otpDetails)
					.then(function success(confirmResult) {
						if(confirmResult.hasOwnProperty("userId")) {
							resetDetails.userId = confirmResult.userId;
							next();
						} else {
							var err = new Error("Otp does not match.");
							err.code = 800;
							logger.error(err);
							deferred.reject(err);
						}
					}, function failure(err) {
						logger.error("Forgot Password: Error in confirming otp: " + err);
						deferred.reject(err);
					});
				 }
			)
			.then(function (next) {
					try {
					  resetDetails.password = utils.decryptAES(resetDetails.password);
					} catch (err) {
					}
					userModel.resetPassword(resetDetails)
					.then(function (resetResult) {
						deferred.resolve(resetResult);
					}, function (err) {
						deferred.reject(err);
					});
				 }
			)
		}('undefined' !== typeof exports && exports || new Function('return this')()));
	} else {
		var err = new Error("Reset validation failed. Please try again later.");
		err.code = 201;
		logger.error(err);
		deferred.reject(err);
	};

	return deferred.promise;
}

var setPassword = function(setPassDetails) {
	var deferred = Q.defer();

	if (setPassDetails.userId && setPassDetails.password) {
		userModel.setPassword(setPassDetails)
		.then(function (result) {
			deferred.resolve(result);
		}, function (err) {
			deferred.reject(err);
		});
	} else {
		var err = new Error("User id or password not present in the request !!!");
		err.code = 201;
		logger.error(err);
		deferred.reject(err);
	};

	return deferred.promise;
};

var checkUserById = function (userId) {
	var deferred = Q.defer();

	userModel.checkUserById(userId)
	.then(function (result){
		deferred.resolve(result._doc);
	}, function (err){
		deferred.reject(err);
	});

	return deferred.promise;
};

var getUsers = function () {
	var deferred = Q.defer();

	userModel.getUsers()
	.then(function (result){
		deferred.resolve(result);
	}, function (err){
		deferred.reject(err);
	});

	return deferred.promise;
};

// DELETE user details
var deteteUser = function (userIds, relationKey) {
	var deferred = Q.defer();

	userModel.deleteUser(userIds, relationKey)
		.then(function success(result) {
			customerService.deleteAdminUsers(userIds);
			brandService.deleteAdminUsers(userIds);
			locationService.deleteAdminUsers(userIds);
			deferred.resolve(result);
		}, function failure(err) {
			logger.error("User deletion failure: " + err);
			deferred.reject(err);
		});

	return deferred.promise;
};

// exports section 
exports.saveUser = saveUser;
exports.checkEmailUser = checkEmailUser;
exports.checkContactUser = checkContactUser;
exports.checkFBUser = checkFBUser;
exports.activateUser = activateUser;
exports.setEmailSent = setEmailSent;
exports.verifyContactNumber = verifyContactNumber;
exports.updateUser = updateUser;
exports.resetPassword = resetPassword;
exports.setPassword = setPassword;
exports.checkUserById = checkUserById;
exports.getUsers = getUsers;
exports.deteteUser = deteteUser;