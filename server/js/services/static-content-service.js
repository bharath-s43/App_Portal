// import npm packages
var Q = require('q');
// import files
var logger = require('../util/log').get();
var utils = require('../util/utils');
// models
var staticContentModel = require('../models/static-content-model');

var getStaticContent = function () {
	var deferred = Q.defer();

	staticContentModel.getStaticContent()
	.then(function success(result) {
		deferred.resolve(result);
	}, function failure(err) {
		logger.error("Static Content: get static content failure: " + err);
		deferred.reject(err);
	});

	return deferred.promise;
}

var updateStaticContent = function (contentDetails) {
	var deferred = Q.defer();
	if ((contentDetails.type === "aboutUs" && contentDetails.aboutUsText) 
		||(contentDetails.type === "termsConditions" && contentDetails.termsConditionsText) 
		||(contentDetails.type === "privacyPolicy" && contentDetails.privacyPolicyText)
		||(contentDetails.type === "contactUs" && contentDetails.contactDetails)) {
		staticContentModel.updateStaticContent(contentDetails)
		.then(function (result) {
			deferred.resolve(result);
		}, function (err) {
			deferred.reject(err);
		});
	} else {
		var err = new Error("missing content details!!!");
		err.code = 201;
		logger.error(err);
		deferred.reject(err);
	};

	return deferred.promise;
};

exports.getStaticContent = getStaticContent;
exports.updateStaticContent = updateStaticContent;