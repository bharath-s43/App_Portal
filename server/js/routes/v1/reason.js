// Express router
var router = require('express').Router();
var Q = require('q');
// services and other utilities
var logger = require('../../util/log').get();
var utils = require('../../util/utils');
var reasonService = require('../../services/reason-service');


// GET API - For Feedback submission
router.get(['/'], function (req, res) {
	var message = utils.messageFactory();
	var searchParams = req.query || [];

	reasonService.fetchReasons(searchParams)
	.then(function success (result) {
		if (result && result.length > 0) {
			message.displayMessage = "Reasons fetched successfully !!!";
			message.data = result;
			utils.jsonWriter(message, 200, res);
		} else {
			var err = true;
			var errorMessage = "Reasons not found for query parameters";
			var displayMessage = "Reasons not found !!!";
			var data = [];
			utils.throwError(err, errorMessage, 200, displayMessage, data, null);
		}
	}, function failure (err) {
		var errMsg = "Reasons Fetch: Error in saving Reasons in database: " + err;
		logger.error(errMsg);
		utils.throwError(999, errMsg, 200, "Error in saving Reasons. Please try again after sometime.", null, res);
	});
});

// exports section
module.exports = router;