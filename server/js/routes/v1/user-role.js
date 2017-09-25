// Express router
var router = require('express').Router();
var Q = require('q');
// services and other utilities
var logger = require('../../util/log').get();
var utils = require('../../util/utils');
var error = require('../../util/error-message').error;
var display = require('../../util/display-message').display;
var userRoleService = require('../../services/user-role-service');


// POST API - For customer Registration
router.post(['/'], function (req, res) {
	var message = utils.messageFactory();

	var userRoleDetails = req.reqBody || null;	// customer details data in POST Request body

	userRoleService.createUserRole(userRoleDetails)
	.then(function success(result) {
		message.displayMessage = display.D0008;
		message.data = result;
		utils.jsonWriter(message, 200, res);
	}, function failure (err) {
		logger.error("User Role Save: Error in saving user role: " + err);
		utils.throwError(true, error.E0007, 500, error.E0007, null, res);
	});
});

// GET API For fetching brand details
router.get(['/', '/:roleId'], function (req, res) {
	var message = utils.messageFactory();

	var roleId = req.params['roleId'] || null;

	userRoleService.fetchUserRoleDetails(roleId)
	.then (function success(result) {
		if (result && result.length > 0) {
			message.displayMessage = display.D0009;
			message.data = result;
			utils.jsonWriter(message, 200, res);
		} else {
			var err = true;
			var errorMessage = error.E0008;
			var displayMessage = error.E0009;
			var data = [];
			utils.throwError(err, errorMessage, 200, displayMessage, data, res);
		}
	}, function failure(err) {
		logger.error("user role fetch: Error in searching role in database: " + err);
		utils.throwError(999, error.E0010, 500, error.E0010, null, res);
	});
});

// exports section
module.exports = router;