// Express router
var router = require('express').Router();
var Q = require('q');

// services and other utilities
var logger = require('../../util/log').get();
var utils = require('../../util/utils');
var staticContentService = require('../../services/static-content-service');

// GET API For fetching brand details
router.get(['/'], function (req, res) {
	var message = utils.messageFactory();

	staticContentService.getStaticContent()
	.then (function success(result) {
		if (result) {
			message.displayMessage = "static content fetched successfully.";
			message.data = result;
			utils.jsonWriter(message, 200, res);
		} else {
			var err = true;
			var errorMessage = "No static content found...";
			var displayMessage = "Sorry, there is no static content available !!!";
			var data = [];
			utils.throwError(err, errorMessage, 200, displayMessage, data, null);
		}
	}, function failure(err) {
		logger.error("static content: Error in getting static content: " + err);
		utils.throwError(999, "Error fetching static content. Please try again after sometime.", 500, "Error fetching static content. Please try again after sometime.", null, res);
	});
});

// Update user details
router.put(['/'], function (req, res) {
	var message = utils.messageFactory();
	var contentDetails = req.reqBody || null;	// content details data in PUT Request body

	staticContentService.updateStaticContent(contentDetails)
	.then(function (result) {
		message.displayMessage = "static content updated successfully.";
		message.data = result;
		utils.jsonWriter(message, 200, res);
	}, function (err) {
		if (err.code) {
			logger.error("Static content Update: Error in updating content: " + err.message);
			utils.throwError(err.code, err.message, 500, err.message, null, res);
		} else {
			logger.error("Static Content Update: Error in updating content: " + err);
			utils.throwError(999, "Error updating content. Please try again after sometime.", 500, "Error updating content. Please try again after sometime.", null, res);
		};
	});
});

// exports section
module.exports = router;