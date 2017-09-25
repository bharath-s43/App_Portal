// import npm packages
var Q = require('q');
// import files
var logger = require('../util/log').get();
var utils = require('../util/utils');
// models
var reasonModel = require('../models/reason-model');

// check feedback details validations and then save
var saveReasons = function (feedbackReasons) {
	
};


var fetchReasons = function (searchParams) {
	var deferred = Q.defer();

	reasonModel.fetchReasons(searchParams)
	.then(function success(result) {
		deferred.resolve(result);
	}, function failure(err) {
		logger.error("Reason fetch: Reason fetch failure: " + err);
		deferred.reject(err);
	});

	return deferred.promise;
};

// exports section 
exports.saveReasons = saveReasons;
exports.fetchReasons = fetchReasons;