// import npm packages
var Q = require('q');
// import files
var logger = require('../util/log').get();
var utils = require('../util/utils');
// models
var ratingModel = require('../models/rating-model');

// Fetch operations for employee profiles
var fetchRatingDetails = function (ratingId) {
	var deferred = Q.defer();

	ratingModel.fetchRatingDetails(ratingId)
	.then (function success(result) {
		deferred.resolve(result);
	}, function failure(err) {
		logger.error("Rating Fetch: Rating fetch details failure: " + err);
		deferred.reject(err);
	});

	return deferred.promise;
};

var saveRatingDetails = function (ratingDetails) {
	var deferred = Q.defer();

	if (validateRatingDetails(ratingDetails)) {
		ratingModel.saveRatingDetails(ratingDetails) 
		.then(function success(result) {
			deferred.resolve(result);
		}, function failure(err) {
			logger.error("Rating: Rating details save failure: " + err);
			deferred.reject(err);
		});
	} else {
		var err = new Error("Rating details validation failed !!!");
		logger.error(err);
		deferred.reject(err);
	};

	return deferred.promise;
};

var validateRatingDetails = function (ratingDetails) {
	if (!ratingDetails || !ratingDetails.name) {
		return false;
	} else {
		return true;
	}
};

// exports section 
exports.fetchRatingDetails = fetchRatingDetails;
exports.saveRatingDetails = saveRatingDetails;