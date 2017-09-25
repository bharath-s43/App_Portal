// Express router
var router = require('express').Router();
var Q = require('q');
// mail funcionality
var nodemailer = require('nodemailer');
var hbs = require('nodemailer-express-handlebars');
// services and other utilities
var logger = require('../../util/log').get();
var utils = require('../../util/utils');
var error = require('../../util/error-message').error;
var display = require('../../util/display-message').display;
var employeeHistoryService = require('../../services/employee-history-service');



// POST API - For employee Registration
router.post(['/'], function (req, res) {
	var message = utils.messageFactory();
	var employeeHistoryDetails = req.reqBody || null;	// employee details data in POST Request body

	employeeHistoryService.postEmployeeHistory(employeeDetails)
	.then(function success(empResult) {						
		message.displayMessage = display.D0407;
		message.data = {};
		utils.jsonWriter(message, 200, res);
	}, function failure (err) {
		if (err.code === 222) {
			logger.error("employee history post: " + err);
			utils.throwError(222, err.message, 200, err.message, null, res);
		} else {
			logger.error("employee on-boarding: Error in on-boarding employee: " + err);
			utils.throwError(999, err.message, 200, error.E0414, null, res);
		}
	});
});


// GET API For fetching employee profiles
router.get(['/', '/:euId'], function (req, res) {
	var message = utils.messageFactory();
	var searchParams = req.query || [];

	var empUniqId = req.params['euId'] || null;

	employeeHistoryService.fetchEmployeeHistrory(searchParams, empUniqId)
	.then (function success(result) {
		if (result && result.length > 0) {
			message.displayMessage = display.D0408;
			message.data = result;
			utils.jsonWriter(message, 200, res);
		} else {
			var err = 222;
			var errorMessage = error.E0415;
			var displayMessage = error.E0415;
			var data = [];
			utils.throwError(err, errorMessage, 200, displayMessage, data, res);
		}
	}, function failure(err) {
		logger.error("employee history fetch: " + err);
		utils.throwError(999, err.message, 200, error.E0416, null, res);
	});
});

// exports section
module.exports = router;