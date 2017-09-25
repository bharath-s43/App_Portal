// import npm packages
var Q = require('q');
// import files
var logger = require('../util/log').get();
var utils = require('../util/utils');
// models
var roleModel = require('../models/role-model');

// Fetch operations for employee profiles
var fetchRoleDetails = function (searchParams, roleId) {
	var deferred = Q.defer();

	roleModel.fetchRoleDetails(searchParams, roleId)
	.then (function success(result) {
		deferred.resolve(result);
	}, function failure(err) {
		logger.error("Role Fetch: Role fetch details failure: " + err);
		deferred.reject(err);
	});

	return deferred.promise;
};


// exports section 
exports.fetchRoleDetails = fetchRoleDetails;