// Express router
var router = require('express').Router();
var Q = require('q');

// services and other utilities
var logger = require('../../util/log').get();
var utils = require('../../util/utils');
var error = require('../../util/error-message').error;
var display = require('../../util/display-message').display;
var forgotPasswordService = require('../../services/forgot-password-service');
var userService = require('../../services/user-service');

/**
 * @api {post} /forgotPassword 1. Send Otp
 * @apiDescription Provide the contact number or email in the api. It will send the otp to the user's contact number
 * or email id as well as the otpId in the response object.
 * @apiName sendOtpApi
 * @apiGroup Forgot Password
 * @apiParam (email) {String="EMAIL"} regType registration type of user
 * @apiParam (email) {String} email email id of user
 * @apiParam (contactNo) {String="CONTACTNO"} regType registration type of user
 * @apiParam (contactNo) {String} phoneNo phone number of user
 * @apiParamExample {json} Request-Example:
	 {
		"regType": "EMAIL",
		"email" : "sneha.firodiya@logituit.com"
	 }
 * @apiSuccessExample {json} Success-Response:
	 {
	  "code": 0,
	  "errorMessage": "",
	  "displayMessage": "OTP sent to email. Please verify.",
	  "data": {
	    "otpId": "58da021fce2270b40bdb01a3"
	  }
	}
 * @apiError (Errors - code) {Object} 801 The <code>email</code> is not registered.
 * @apiError (Errors - code) {Object} 802 The <code>phone number</code> is not registered.
 * @apiError (Errors - code) {Object} 999 All other unhandled errors.
 */
// POST API - For user Registration
router.post(['/'], function (req, res) {
	var message = utils.messageFactory();

	var userDetails = req.reqBody || null;	// user details data in POST Request body


	(function (exports) {
	  'use strict';
	 
	  var Sequence = exports.Sequence || require('sequence').Sequence
	    , sequence = Sequence.create()
	    , err
	    ;

	/* Using sequence package to make callback sync for maintaining atomic DB transactions */
	sequence
		.then(function (next) {	// check email if already exists
				if (userDetails.regType) {
					if (userDetails.regType === 'EMAIL') {
						userService.checkEmailUser(userDetails)
						.then(function success(result) {
							if (!result) {	// if not exists
								utils.throwError(801, error.E0605, 403, error.E0605, null, res);
							} else {	// else save user in db
								userDetails.userId = result._id;
								next();
							};
						}, function failure(err) {
							logger.error("Forgot Password: Error in checking email user in database: " + err);
							utils.throwError(999, err.message, 500, error.E0606, null, res);
						});
					} else if(userDetails.regType === 'CONTACTNO') {
						userService.checkContactUser(userDetails)
						.then(function success(result) {
							if (!result) {	// if not exists
								utils.throwError(802, error.E0605, 403, error.E0605, null, res);
							} else {	// else save user in db
								userDetails.userId = result._id;
								next();
							};
						}, function failure(err) {
							logger.error("Forgot Password: Error in checking contact number user in database: " + err);
							utils.throwError(999, err.message, 500, error.E0606, null, res);
						});

					} else {
						var err = new Error("Forgot Password: Error in validating user registration type");
						err.code = 600;
						logger.error(err.message);
						utils.throwError(err.code, err.message, 500, error.E0606, null, res);
					}
				} else {
					var err = new Error("Forgot Password: Error in validating user registration type");
					err.code = 600;
					logger.error(err.message);
					utils.throwError(err.code, err.message, 500, error.E0606, null, res);
				};
			}
		)
		.then(function (next) {	// check contact No if already exists
				if(userDetails.userId) {
					if(userDetails.regType === 'EMAIL') {
						forgotPasswordService.sendOtpToEmail(userDetails)
						.then(function success(result) {
							message.displayMessage = display.D0603;
							message.data = result;
							utils.jsonWriter(message, 200, res);

						}, function failure(err) {
							logger.error("Otp: otp save failure: " + err);
							utils.throwError(999, err.message, 500, error.E0607, null, res);
						});
					} else {
						forgotPasswordService.sendOtpToContact(userDetails)
						.then(function success(result) {
							message.displayMessage = display.D0604;
							message.data = result;
							utils.jsonWriter(message, 200, res);

						}, function failure(err) {
							logger.error("Otp: otp save failure: " + err);
							utils.throwError(999, err.message, 500, error.E0607, null, res);
						});
					}
				} else {
					logger.error("Forgot Password: Error in checking user in database ");
					utils.throwError(999, "Forgot Password: Error in checking user in database", 500, error.E0606, null, res);
				}
			}
		)
	}('undefined' !== typeof exports && exports || new Function('return this')()));
});

/**
 * @api {post} /forgotPassword/reset 2.Reset Password
 * @apiDescription Provide the otp obtained on email id or contact number, otpId obtained in the response
 * of the send otp api and the password to reset. It will verify that the otp is correct and reset the password.
 * @apiName resetPasswordWithOtpApi
 * @apiGroup Forgot Password
 * @apiParam {String} otpId otp id obtained from sendOtpApi
 * @apiParam {String} otp otp received on email or phone number
 * @apiParam {String} password password to reset
 * @apiParamExample {json} Request-Example:
	{
		"otpId" : "58da021fce2270b40bdb01a3",
		"otp" : "9244",
		"password" : "password"
	}
 * @apiSuccessExample {json} Success-Response:
	 {
	  "code": 0,
	  "errorMessage": "",
	  "displayMessage": "Congratulations password for user 'sneha f' updated successfully.",
	  "data": {
	    "success": 1
	  }
	}
 * @apiError (Errors - code) {Object} 999 Password reset failure.
 */

// POST API - For reset password.
router.post(['/reset'], function (req, res) {
	var message = utils.messageFactory();

	var resetDetails = req.reqBody || null;	// user details data in POST Request body

	userService.resetPassword(resetDetails)
	.then(function (result) {
		message.displayMessage = display.D0606.replace("<fullName>", result.personalInfo.fullName);
		message.data = {};
		message.data.success = 1;
		utils.jsonWriter(message, 200, res);
	}, function (err) {
		if (err.code && err.code == 800) { // otp does not match
			utils.throwError(200, error.E0610, 200, error.E0610, null, res);
		} else {
			logger.error("Reset password: Error in reset password: " + err);
			utils.throwError(999, error.E0609, 200, err.message, null, res);
		};
	});

});

// exports section
module.exports = router;