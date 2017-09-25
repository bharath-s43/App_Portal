// Express router
var router = require('express').Router();
var Q = require('q');
// services and other utilities
var logger = require('../../util/log').get();
var utils = require('../../util/utils');
var error = require('../../util/error-message').error;
var display = require('../../util/display-message').display;
var brandTypeService = require('../../services/brand-type-service');

// POST API - For saving brand type
router.post(['/'], function (req, res) {
	var message = utils.messageFactory();

	var brandTypeDetails = req.reqBody || null;	// brand type details data in POST Request body

	brandTypeService.insertBrandType(brandTypeDetails)
	.then (function (result) {
		message.displayMessage = display.D0206;
		message.data = result;
		utils.jsonWriter(message, 200, res);
	}, function (err) {
		if (err.code) {
			logger.error("Brand Type: Error in saving brand type: " + err);
			utils.throwError(err.code, err.message, 500, err.message, null, res);
		} else {
			logger.error("Brand Type: Error in saving brand type: " + err);
			utils.throwError(999, error.E0207, 500, error.E0207, null, res);
		};
	});
});

// GET API - For fetching all brand types
router.get(['/'], function (req, res) {
	var message = utils.messageFactory();

	brandTypeService.getAllBrandTypes()
	.then (function (result) {
		message.displayMessage = display.D0207;
		message.data = result;
		utils.jsonWriter(message, 200, res);
	}, function (err) {
		if (err.code) {
			logger.error("Brand Type: Error fetching brand types: " + err);
			utils.throwError(err.code, err.message, 500, err.message, null, res);
		} else {
			logger.error("Brand Type: Error fetching brand types: " + err);
			utils.throwError(999, error.E0208, 500, error.E0208, null, res);
		};
	});
});

// exports section
module.exports = router;