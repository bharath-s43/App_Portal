// import npm packages
var Q = require('q');
var fs = require("fs");
var forEachAsync = require('forEachAsync');
var dateFormat = require('dateformat');

// import files
var logger = require('../util/log').get();
var utils = require('../util/utils');
var mongoose = require('../util/connection');

// models
var employeeHistoryModel = require('../models/employee-history-model');

var postEmployeeHistory = function (employeeDetails) {
	var deferred = Q.defer();
	if (validateEmployeeHistoryDeatils(employeeDetails)) {
		employeeHistoryModel.postEmployeeHistory(searchParams)
		.then(function (result) {
			deferred.resolve(result);
		}, function (err) {
			deferred.reject(err);
		});
	};

	return deferred.promise;
};

// Validate employee history details
var validateEmployeeHistoryDeatils = function (employeeDetails) {
	if (!(employeeDetails.euId || employeeDetails.empId) || !employeeDetails.oldVal || !employeeDetails.newVal) {
		return false;
	} else {
		return true;
	};
};

// Fetch Employee with Beacon Details
var fetchEmployeeHistrory = function (searchParams, empUniqId) {
	var deferred = Q.defer();

	employeeHistoryModel.fetchEmployeeHistrory(searchParams, empUniqId)
	.then(function (result) {
		deferred.resolve(result);
	}, function (err) {
		deferred.reject(err);
	});

	return deferred.promise;
};


// exports section 
exports.postEmployeeHistory = postEmployeeHistory;
exports.fetchEmployeeHistrory = fetchEmployeeHistrory;