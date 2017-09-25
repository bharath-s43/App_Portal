// import npm packages
var Q = require('q');
// import files
var logger = require('../util/log').get();
var utils = require('../util/utils');

//services
var otpService = require('./otp-service');
var smsService = require('./sms-service');
var mailService = require('./mail-service');
var userService = require('./user-service');

var sendOtpToEmail = function(userDetails) {
	var deferred = Q.defer();

	var otpDetails = {};
	otpDetails.userId = userDetails.userId;
	otpDetails.otp = Math.floor(Math.random() * 9000) + 1000;

	otpService.saveOtp(otpDetails)
	.then(function success(result) {
		var otpResult = {};
		otpResult.otpId = result._id;
		if (result._id) {
			//Configure mail options
			var mailOptions = {};
			mailOptions.to = userDetails.email;
			mailOptions.subject = "Applause OTP";
			mailOptions.template = "otp_email";
			mailOptions.context = {};
			mailOptions.context.otp = result.otp;

			//send email
			mailService.sendMail(mailOptions);
		};

			deferred.resolve(otpResult);
	}, function failure(err) {
		logger.error("Otp: otp save failure: " + err);
		deferred.reject(err);
	});

	return deferred.promise;
}

var sendOtpToContact = function (userDetails) {
	var deferred = Q.defer();

	var otpDetails = {};
	otpDetails.userId = userDetails.userId;
	otpDetails.otp = Math.floor(Math.random() * 9000) + 1000;

	otpService.saveOtp(otpDetails)
	.then(function success(result) {
		var otpResult = {};
		otpResult.otpId = result._id;
		if (result._id) {
			//configure message to send
			var messageText = result.otp + " is your otp to reset Applause password."
			var to = userDetails.phoneNo;
			smsService.sendSms(to, messageText);
		};

		deferred.resolve(otpResult);
	}, function failure(err) {
		logger.error("Otp: otp save failure: " + err);
		deferred.reject(err);
	});

	return deferred.promise;
}

var confirmOtp = function (otpDetails) {
	var deferred = Q.defer();

	otpService.confirmOtp(otpDetails)
	.then(function success(result) {
		var confirmResult = {};
		if(result) {
			confirmResult.userId = result.user;
			deferred.resolve(confirmResult);
		} else {
			deferred.resolve(confirmResult);
		}
	}, function failure(err) {
		logger.error("Otp: otp confirm failure: " + err);
		deferred.reject(err);
	});

	return deferred.promise;
}

exports.sendOtpToEmail = sendOtpToEmail;
exports.sendOtpToContact = sendOtpToContact;
exports.confirmOtp = confirmOtp;