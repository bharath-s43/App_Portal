// Express router
var router = require('express').Router();
var Q = require('q');
// services and other utilities
var logger = require('../../util/log').get();
var utils = require('../../util/utils');
var uiControlsService = require('../../services/ui-controls-service');
var errorMessages = require('../../util/error-message').error;
var displayMessages = require('../../util/display-message').display;


// GET API For fetching ui-controls acl details for ui role-based rendering of components
router.get('/:roleName', function (req, res) {
	var message = utils.messageFactory();
	var searchParams = req.query || [];

	var roleName = req.params['roleName'] || null;

	uiControlsService.getUiControls(roleName)
	.then (function success(result) {
		if (result) {
			message.displayMessage = "ui-controls fetched successfully.";
			message.data = result;
			utils.jsonWriter(message, 200, res);
		} else {
			var err = true;
			var errorMessage = errorMessages.E0905;
			var displayMessage = errorMessages.E0905;
			var data = {};
			logger.error("ui-controls not found for roleName: " + roleName);
			utils.throwError(err, errorMessage, 403, displayMessage, data, null);
		}
	}, function failure(err) {
		logger.error("UI-Controls fetch: Error in searching ui-controls for role in database: " + err);
		utils.throwError(999, errorMessages.E0903, 500, errorMessages.E0903, null, res);
	});
});

// exports section
module.exports = router;