// import npm packages
var Q = require('q');
// import files
var logger = require('../util/log').get();
var utils = require('../util/utils');
//models
var interactionModel = require('../models/interaction-model');
var employeeService = require('./employee-service');
//services
var beaconService = require('./beacon-service');

var saveInteraction = function (interactionDetails) {
	var deferred = Q.defer();

	(function (exports) {
	  'use strict';
	 
	  var Sequence = exports.Sequence || require('sequence').Sequence
	    , sequence = Sequence.create()
	    , err
	    ;

	/* Using sequence package to make callback sync for maintaining atomic DB transactions */
	sequence
		.then(function (next) {
				var beaconDetails = {};
				beaconDetails.beaconId = interactionDetails.beaconId;

				//check Beacon
				beaconService.fetchAssignedBeaconDetails(beaconDetails)
				.then(function (result) {
					if(result) {
						interactionDetails.beaconUniqueId = result.id;
						next();
					} else {
						var err = new Error("Interaction: No beacon found.");
						err.code = 800;
						logger.error(err.message);
						deferred.reject(err);
					}
				}, function (err) {
					var err = new Error("Interaction: Error in getting beacon.");
					logger.error(err.message);
					deferred.reject(err);
				});
			}
		)
		.then(function (next) {
				var employeeDetails = {};
				employeeDetails.beaconId = interactionDetails.beaconId;
				employeeService.checkEmployeeBeacon(employeeDetails)
				.then(function (result) {
					if(result) {
						interactionDetails.employee = result;
					} else {
						interactionDetails.employee = null;
					}
					next();
				}, function (err) {
					var err = new Error("Interaction: Error in getting employee details.");
					logger.error(err.message);
					deferred.reject(err);
				});
			}
		)
		.then(function (next) {
				interactionModel.saveInteraction(interactionDetails)
				.then(function (result) {
					deferred.resolve(result);
				}, function (err) {
					var err = new Error("Interaction: Error in saving interaction.");
					logger.error(err.message);
					deferred.reject(err);
				});
			}
		)
	}('undefined' !== typeof exports && exports || new Function('return this')()));

	return deferred.promise;
}

var fetchInteractions = function(searchParams) {
	var deferred = Q.defer();

	interactionModel.fetchInteractions(searchParams)
	.then(function (result) {
		deferred.resolve(result);
	}, function (err) {
		var err = new Error("Interaction: Error in fetching interactions.");
		logger.error(err.message);
		deferred.reject(err);
	});
	return deferred.promise;
};
//exports section
exports.saveInteraction = saveInteraction;
exports.fetchInteractions = fetchInteractions;