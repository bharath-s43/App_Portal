// Express router
var router = require('express').Router();
var Q = require('q');
var mongoose = require('mongoose');
// services and other utilities
var logger = require('../../util/log').get();
var utils = require('../../util/utils');
var error = require('../../util/error-message').error;
var display = require('../../util/display-message').display;
var interactionService = require('../../services/interaction-service');

// POST API - For interaction
router.post(['/'], function (req, res) {
	var message = utils.messageFactory();

	var interactionDetails = req.reqBody || null;	// interaction details data in POST Request body

	interactionService.saveInteraction(interactionDetails)	// save interaction
	.then(function success(result) {
		message.displayMessage = display.D0801;
		message.data = result;
		utils.jsonWriter(message, 200, res);
	}, function failure (err) {
		logger.error("Interaction: Error saving interaction: " + err);
		if(err.code) {
			utils.throwError(err.code, err.message, 500, error.E0801, null, res);
		} else {
			utils.throwError(999, err.message, 500, error.E0801, null, res);
		}
	});
});

// POST API - For interaction
router.get(['/'], function (req, res) {
	var message = utils.messageFactory();

	var searchParams = req.query || [];

	interactionService.fetchInteractions(searchParams)	// save interaction
	.then(function success(result) {
		message.displayMessage = display.D0802;
		message.data = {};
		message.data.interactions = result
		utils.jsonWriter(message, 200, res);
	}, function failure (err) {
		logger.error("Interaction: Error fetching interactions: " + err);
		utils.throwError(999, err.message, 500, error.E0802, null, res);
	});
});

// exports section
module.exports = router;