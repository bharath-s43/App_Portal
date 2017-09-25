// Express router
var router = require('express').Router();
var Q = require('q');
// services and other utilities
var logger = require('../../util/log').get();
var utils = require('../../util/utils');
var ratingService = require('../../services/rating-service');


// POST API - For customer Registration
router.post(['/'], function (req, res) {
	var message = utils.messageFactory();

	var ratingDetails = req.reqBody || null;	// customer details data in POST Request body

	ratingService.saveRatingDetails(ratingDetails)
	.then(function success(result) {
		message.displayMessage = "rating saved successfully.";
		message.data = result;
		utils.jsonWriter(message, 200, res);
	}, function failure (err) {
		logger.error("Rating Save: Error in saving user role: " + err);
		utils.throwError(true, "Error saving rating details. Please try again after sometime.", 500, "Error saving rating details. Please try again after sometime.", null, res);
	});
});

// GET API For fetching brand details
router.get(['/', '/:ratingId'], function (req, res) {
	var message = utils.messageFactory();

	var ratingId = req.params['ratingId'] || null;

	ratingService.fetchRatingDetails(ratingId)
	.then (function success(result) {
		if (result) {
			message.displayMessage = "rating details fetched successfully.";
			message.data = result;
			utils.jsonWriter(message, 200, res);
		} else {
			var err = true;
			var errorMessage = "rating Details not found for query parameters";
			var displayMessage = "rating details not found !!!";
			var data = [];
			utils.throwError(err, errorMessage, 200, displayMessage, data, res);
		}
	}, function failure(err) {
		logger.error("rating fetch: Error in searching rating in database: " + err);
		utils.throwError(999, "Error fetching rating details. Please try again after sometime.", 500, "Error fetching rating details. Please try again after sometime.", null, res);
	});
});

// exports section
module.exports = router;