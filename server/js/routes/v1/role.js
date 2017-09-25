// Express router
var router = require('express').Router();
var Q = require('q');
// services and other utilities
var logger = require('../../util/log').get();
var utils = require('../../util/utils');
var roleService = require('../../services/role-service');



// POST API - For customer Registration
router.post(['/'], function (req, res) {
	var message = utils.messageFactory();

	// var brandDetails = req.reqBody || null;	// customer details data in POST Request body

	// brandService.configureBrand(brandDetails)
	// .then(function success(result) {
	// 	message.displayMessage = "brand configured successfully !!!";
	// 	message.data = {"id": result._id, "bid": result.bid};
	// 	utils.jsonWriter(message, 200, res);
	// }, function failure (err) {
	// 	logger.error("Brand Configuration: Error in configuring brand: " + err);
	// 	utils.throwError(true, "Error configuring brand... Please try again after sometime !!!", 500, "Error configuring brand... Please try again after sometime !!!");
	// });
});

// GET API For fetching brand details
router.get(['/', '/:roleId'], function (req, res) {
	var message = utils.messageFactory();
	var searchParams = req.query || [];

	var roleId = req.params['roleId'] || null;

	roleService.fetchRoleDetails(searchParams, roleId)
	.then (function success(result) {
		if (result && result.length > 0) {
			message.displayMessage = "role details fetched successfully.";
			message.data = result;
			utils.jsonWriter(message, 200, res);
		} else {
			var err = true;
			var errorMessage = "role Details not found for query parameters";
			var displayMessage = "role not found !!!";
			var data = [];
			utils.throwError(err, errorMessage, 200, displayMessage, data, res);
		}
	}, function failure(err) {
		logger.error("role fetch: Error in searching role in database: " + err);
		utils.throwError(999, "Error fetching role details. Please try again after sometime.", 500, "Error fetching role details. Please try again after sometime.", null, res);
	});
});

// exports section
module.exports = router;