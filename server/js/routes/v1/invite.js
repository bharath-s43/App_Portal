// Express router
var router = require('express').Router();
var Q = require('q');
var mongoose = require('mongoose');

// services and other utilities
var logger = require('../../util/log').get();
var utils = require('../../util/utils');
var inviteService = require('../../services/invite-service');

// POST API - For customer Registration
router.post(['/'], function (req, res) {
	var message = utils.messageFactory();

	var contactDetails = req.reqBody || null;	// contact details data in POST Request body
	var siteBase = utils.getServerPath(req);

	inviteService.inviteEmailBulk(contactDetails, siteBase)	// check customer if already exists
	.then(function success(result) {
		// if(!result.emailFailed) {
		// 	message.displayMessage = "Attempted to send verification emails. " +result.emailSent+ " succeeded, and " + result.emailFailed + " failed.";
		// } else {
		// 	message.displayMessage = "Attempted to send verification emails. " +result.emailSent+ " succeeded, and " + result.emailFailed + " failed.";
		// }
		message.displayMessage = "Attempted to send verification emails. ";
		if(result.emailSent) {
			message.displayMessage = message.displayMessage + result.emailSent + " succeeded. ";
		}
		if(result.alreadyVerified) {
			message.displayMessage = message.displayMessage + result.alreadyVerified + " already verified. ";
		}
		if(result.emailFailed) {
			message.displayMessage = message.displayMessage + result.emailFailed + " failed due to invalid email ids. ";
		}
		utils.jsonWriter(message, 200, res);
	}, function failure (err) {
		logger.error("customer Registration: Error in checking customer in database: " + err);
		utils.throwError(999, err.message, 500, "Error registering customer. Please try again after sometime.", null ,res);
	});
});

// exports section
module.exports = router;