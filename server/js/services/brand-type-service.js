// import npm packages
var Q = require('q');
var fs = require("fs");
// import files
var logger = require('../util/log').get();
var utils = require('../util/utils');
// import models
var brandTypeService = require('../models/brand-type-model');

// Validate Brand Type Details
var validateBrandTypeDetails = function (brandTypeDetails) {
	if (!brandTypeDetails.brandType || !brandTypeDetails.feedbackReasonsEmployee.length
		|| !brandTypeDetails.feedbackReasonsLocation.length) {
		return false;
	} else {
		return true;
	};
};

var insertBrandType = function (brandTypeDetails) {
	var deferred = Q.defer();

	if (validateBrandTypeDetails(brandTypeDetails)) {
		brandTypeService.insertBrandType(brandTypeDetails)
		.then(function (result) {
			deferred.resolve(result);
		}, function (err) {
			var err = new Error("Brand Type: Error saving brand type.");
			logger.error(err.message);
			deferred.reject(err);
		});
	} else {
		logger.error("Brand Type: Validation failure.");
		var err = new Error("Brand Type: Validation failure.");
		err.code = 200;
		deferred.reject(err);
	};

	return deferred.promise;
};

var getAllBrandTypes = function () {
	var deferred = Q.defer();

	brandTypeService.getAllBrandTypes()
	.then(function (result) {
		deferred.resolve(result);
	}, function (err) {
		var err = new Error("Brand Type: Error fetching brand types.");
		logger.error(err.message);
		deferred.reject(err);
	});

	return deferred.promise;
};

exports.insertBrandType = insertBrandType;
exports.getAllBrandTypes = getAllBrandTypes;