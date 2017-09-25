// Express router
var router = require('express').Router();
var Q = require('q');
// services and other utilities
var logger = require('../../util/log').get();
var utils = require('../../util/utils');
var error = require('../../util/error-message').error;
var display = require('../../util/display-message').display;
var smsService = require('../../services/sms-service');

/**
 * @api {post} /pin 1.Send Pin
 * @apiDescription This api sends an otp to contact number to verify the contact number.
 * This api returns request id in response object which needs to be provided in confirm pin api along with otp received.
 * @apiName sendPinApi
 * @apiGroup Verify Contact Number
 * @apiParam {String} contactNo contact number of user
 * @apiParamExample {json} Request-Example:
	{
	  "contactNo" : "917507684060"
	}
 * @apiSuccessExample {json} Success-Response:
	 {
	  "code": 0,
	  "errorMessage": "",
	  "displayMessage": "PIN sent to your phone number successfully.",
	  "data": {
	    "requestId": "9a8eaa10bcb34a12a65f0e0a6aa321b9"
	  }
	}
 * @apiError (Errors - code) {Object} 800 unable to generate pin.
 * @apiError (Errors - code) {Object} 999 All other unhandled errors.
 */
// POST API - confirm pin
router.post(['/'], function (req, res) {
	var message = utils.messageFactory();

	var userDetails = req.reqBody || null;	// user pin data in POST Request body

	smsService.sendPin(userDetails)
	.then(function success(result) {
		if (result) {	// if succesfull
			message.displayMessage = display.D0601;
			message.data = result;
			utils.jsonWriter(message, 200, res);
		} else {	// else user does not exists
			utils.throwError(800, error.E0601, 401, error.E0601, null, res);
		}
	}, function failure (err) {
		logger.error("Confirm Pin: Error in confirm pin: " + err);
		utils.throwError(999, error.E0602, 500, error.E0602, null, res);
	});
});

// POST API - confirm pin

/**
 * @api {post} /pin/confirm 2.Confirm Pin
 * @apiDescription This api confirms the otp received on contact number. Provide request id obtained in 
 * send pin api along with the otp received on contact number to confirm the contact number.
 * @apiName confirmPinApi
 * @apiGroup Verify Contact Number
 * @apiParam {String} pin pin received on contact number
 * @apiParam {String} requestId requestId obtained from sendPinApi
 * @apiParamExample {json} Request-Example:
	{
	  "pin" : "9201",
	  "requestId" : "9a8eaa10bcb34a12a65f0e0a6aa321b9"
	}
 * @apiSuccessExample {json} Success-Response:
	{
	  "code": 0,
	  "errorMessage": "",
	  "displayMessage": "Phone number validated successfully.",
	  "data": {
	    "eventId": "b60e692bc593a21604ccede6dce7bcc3"
	  }
	}
 * @apiError (Errors - code) {Object} 300 Pin was not found or it has been verified already.
 * @apiError (Errors - code) {Object} 200 Confirm pin error.
 * @apiError (Errors - code) {Object} 999 All other unhandled errors.
 */
router.post(['/confirm'], function (req, res) {
	var message = utils.messageFactory();

	var userPinDetails = req.reqBody || null;	// user pin data in POST Request body

	smsService.confirmPin(userPinDetails)
	.then(function success(result) {
		if (result) {	// if succesfull
			message.displayMessage = display.D0602;
			message.data = result;
			utils.jsonWriter(message, 200, res);
		} else {	// else user does not exists
			utils.throwError(100, error.E0603, 401, error.E0603, null, res);
		}
	}, function failure (err) {
		if (err.code) {
			var displayMessage = "";
			if (err.code === 300) {
				displayMessage = err.message;
			} else {
				displayMessage = error.E0604;
			};
			
			logger.error(err.message);
			utils.throwError(err.code, err.message, 500, displayMessage, null, res);
		} else {
			logger.error("Confirm Pin Error: " + err);
			utils.throwError(999, err.message, 500, error.E0604, null, res);
		};
	});
});

// exports section
module.exports = router;
