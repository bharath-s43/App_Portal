// import npm packages
var Q = require('q');
// import files
var logger = require('../util/log').get();
var utils = require('../util/utils');
// models
var otpModel = require('../models/otp-model');

// POST otp operation to save otp
var saveOtp = function (otpDetails) {
	var deferred = Q.defer();

	if (validateOtpDetails(otpDetails)) {

		otpModel.saveOtp(otpDetails)
		.then(function success(result) {
			deferred.resolve(result);
		}, function failure(err) {
			logger.error("Otp: otp save failure: " + err);
			deferred.reject(err);
		});

	} else {
		var err = new Error("otp details validation failed !!!");
		logger.error(err);
		deferred.reject(err);
	};

	return deferred.promise;
};

var confirmOtp = function (otpDetails) {
	var deferred = Q.defer();

	if (validateOtpDetailsOfConfirm(otpDetails)) {

		otpModel.confirmOtp(otpDetails)
		.then(function success(result) {
			deferred.resolve(result);
		}, function failure(err) {
			logger.error("Otp: otp confirm failure: " + err);
			deferred.reject(err);
		});

	} else {
		var err = new Error("otp details validation failed !!!");
		logger.error(err);
		deferred.reject(err);
	};

	return deferred.promise;
}

// Validating otp details in requests
var validateOtpDetails = function (otpDetails) {
	if (!otpDetails || !otpDetails.otp || !otpDetails.userId) {
		return(false);
	} else {
		return(true);
	}
};

// Validating otp details for confirm request
var validateOtpDetailsOfConfirm = function (otpDetails) {
	if (!otpDetails || !otpDetails.otp || !otpDetails.otpId) {
		return(false);
	} else {
		return(true);
	}
};

exports.saveOtp = saveOtp;
exports.confirmOtp = confirmOtp;

