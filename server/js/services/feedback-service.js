// import npm packages
var Q = require('q');
var forEachAsync = require('forEachAsync');

// import files
var logger = require('../util/log').get();
var utils = require('../util/utils');
// models
var feedbackModel = require('../models/feedback-model');
var FEEDBACK_TYPES = feedbackModel.FEEDBACK_TYPES;
// check feedback details validations and then save
var submitFeedback = function (feedbackDetails, usrDetails) {
	var deferred = Q.defer();

	if (validateFeedbackDetails(feedbackDetails, usrDetails)) {
		feedbackModel.submitFeedback(feedbackDetails, usrDetails)	// uuId- unique user Id
		.then(function success(result) {
			deferred.resolve(result);
		}, function failure(err) {
			logger.error("Feedback submission: Employee Feedback submit failure: " + err);
			deferred.reject(err);
		});
	} else {
		var err = new Error("Employee Feedback Details Validation failed !!!");
		logger.error(err);
		deferred.reject(err);
	}

	return deferred.promise;
};

var validateFeedbackDetails = function (feedbackDetails, usrDetails) {
	if (!feedbackDetails || !usrDetails 
		|| !feedbackDetails.ratingVal || !feedbackDetails.feedbackReasons
		|| !feedbackDetails.brandId || !feedbackDetails.locId 
		|| !((feedbackDetails.feedbackType && feedbackDetails.feedbackType.toLowerCase()==='employee' && feedbackDetails.euId)
		|| (feedbackDetails.feedbackType && feedbackDetails.feedbackType.toLowerCase()==='location'))
		|| !feedbackDetails.feedbackMode) {
		return(false);
	} else {
		return(true);
	}
};

// Fetch feedback details
var fetchFeedbackDetails = function (searchParams, feedbackId, userId) {
	var deferred = Q.defer();

	feedbackModel.fetchFeedbackDetails(searchParams, feedbackId, userId)
	.then(function (result) {
		deferred.resolve(result);
	}, function (err) {
		deferred.reject(err);
	});

	return deferred.promise;
};

// Fetch counts for each rating id based upon search parameters
var ratingcounts = function (searchParams) {
	var deferred = Q.defer();

	feedbackModel.ratingcounts(searchParams)
	.then(function (result) {
		deferred.resolve(result);
	}, function (err) {
		deferred.reject(err);
	});

	return deferred.promise;
};

// Fetch feedbacks of a user ... limited to recLimit variable
var userBasedFeedbackDetails = function (userId, searchCustomParams) {
	var deferred = Q.defer();

	feedbackModel.userBasedFeedbackDetails(userId, searchCustomParams)
	.then(function (result) {
		deferred.resolve(result);
	}, function (err) {
		deferred.reject(err);
	});

	return deferred.promise;
};

// App customised service method - feedback rating counts and userbased feedback details
var getFeedbackDetailsForApp = function (searchParams, userId) {
	var deferred = Q.defer();
	var serviceResult = [];

	var idsArr = [];
	var idKey = null;
	try {	
			(function (exports) {
				  'use strict';
				 
				  var Sequence = exports.Sequence || require('sequence').Sequence
				    , sequence = Sequence.create()
				    , err
				    ;

				/* Using sequence package to make callback sync for maintaining atomic DB transactions */
				sequence
					.then(function (nextSeq1) {
						if (searchParams && searchParams.hasOwnProperty('custId')) {
					    	idsArr = searchParams.custId.split(",");
					    	idKey = 'custId';
					    	nextSeq1(idsArr);
				    	} else if (searchParams && searchParams.hasOwnProperty('brandId')) {
				    		idsArr = searchParams.brandId.split(",");
				    		idKey = 'brandId';
				    		nextSeq1(idsArr);
				    	} else if (searchParams && searchParams.hasOwnProperty('locId')) {
				    		idsArr = searchParams.locId.split(",");
				    		idKey = 'locId';
				    		nextSeq1(idsArr);
				    	} else {
				    		var sp = {};
				    		sp.select = 'location';
				    		fetchFeedbackDetails(sp, null, userId)
				    		.then(function (feedResult) {
				    			if (feedResult && feedResult.length > 0) {
				    				idKey = 'locId';
					    			feedResult.forEach(function (element, index) {
					    				if (element.location && !idsArr.includes(element.location.toString())) {
					    					idsArr.push(element.location.toString());
					    				};
					    			});
					    			nextSeq1(idsArr);
				    			} else {
				    				var err = new Error("No feedback have been submitted !!!");
				    				err.code = 222;
				    				logger.error("Feedback History App serivce: " + err);
				    				deferred.reject(err);
				    			}
				    		}, function (err) {
				    			logger.error("Feedback History App serivce: " + err);
								deferred.reject(err);
				    		});
				    	};
					})
					.then(function (nextSeq1, idsArr) {
						forEachAsync.forEachAsync(idsArr, function (next, element, index, idsArr) {
							var searchCustomParams = {};
							if (element) {
								searchCustomParams[idKey] = element;
							};

							searchCustomParams.recLimit = (searchParams && searchParams.hasOwnProperty('recLimit') && searchParams.recLimit) || null;

							// sequence for fetching rating count and feedback details for each element (id of maybe cust, brand, loc)
							(function (exports) {
								  'use strict';
								 
								  var Sequence = exports.Sequence || require('sequence').Sequence
								    , sequence = Sequence.create()
								    , err
								    ;

								/* Using sequence package to make callback sync for maintaining atomic DB transactions */
								sequence
									//get rating count for EMPLOYEE
									.then(function (nextSeq) {
											searchCustomParams.feedbackType = "EMPLOYEE";
											ratingcounts(searchCustomParams)
											.then(function (result) {
												nextSeq(result);
											}, function (err) {
												logger.error("Feedback rating counts: Error: "+ err);
												deferred.reject(err);
											});
										}
									)
									//get rating count for LOCATION
									.then(function (nextSeq,ratingCountEmployee) {
											searchCustomParams.feedbackType = "LOCATION";
											ratingcounts(searchCustomParams)
											.then(function (result) {
												nextSeq(ratingCountEmployee, result);
											}, function (err) {
												logger.error("Feedback rating counts: Error: "+ err);
												deferred.reject(err);
											});
										}
									)
									.then(function (nextSeq, ratingCountEmp, ratingCountLoc) {
											try {
												userBasedFeedbackDetails(userId, searchCustomParams)
												.then(function (result) {
													var resultObj = {};
													resultObj[idKey] = searchCustomParams[idKey];
													if (result) {
														resultObj.ratingCountEmployee = ratingCountEmp;
														resultObj.ratingCountLocation = ratingCountLoc;
														resultObj.feedbackDetails = result;
													} else {
														resultObj.ratingCountEmployee = [];
														resultObj.ratingCountLocation = [];
														resultObj.feedbackDetails = [];
													};
													serviceResult.push(resultObj);
													next();
												}, function (err) {
													logger.error("Feedback details user based: Error: "+ err);
													deferred.reject(err);
												});
											} catch (err) {
												deferred.reject(err);
											}
										}
									)
								}('undefined' !== typeof exports && exports || new Function('return this')()));

						}).then(function () {
							deferred.resolve(serviceResult);
						});
					})
				}('undefined' !== typeof exports && exports || new Function('return this')()));
	} catch (err) {
		logger.error("Feedback History App serivce: " + err);
		deferred.reject(err);
	};

	return deferred.promise;
};

// exports section 
exports.submitFeedback = submitFeedback;
exports.ratingcounts = ratingcounts;
exports.fetchFeedbackDetails = fetchFeedbackDetails;
exports.userBasedFeedbackDetails = userBasedFeedbackDetails;
exports.getFeedbackDetailsForApp = getFeedbackDetailsForApp;