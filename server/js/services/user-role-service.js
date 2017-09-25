// import npm packages
var Q = require('q');
// import files
var logger = require('../util/log').get();
var utils = require('../util/utils');
// models
var userRoleModel = require('../models/user-role-model');
var USER_ROLES = {};

// Fetch operations for employee profiles
var fetchUserRoleDetails = function (roleId) {
	var deferred = Q.defer();

	userRoleModel.fetchUserRoleDetails(roleId)
	.then (function success(result) {
		deferred.resolve(result);
	}, function failure(err) {
		logger.error("Role Fetch: Role fetch details failure: " + err);
		deferred.reject(err);
	});

	return deferred.promise;
};

var createUserRole = function (userRoleDetails) {
	var deferred = Q.defer();

	if (validateUserRoleDetails(userRoleDetails)) {
		userRoleModel.createUserRole(userRoleDetails) 
		.then(function success(result) {
			deferred.resolve(result);
		}, function failure(err) {
			logger.error("User Role: User Role details save failure: " + err);
			deferred.reject(err);
		});
	} else {
		var err = new Error("User Role details validation failed !!!");
		logger.error(err);
		deferred.reject(err);
	};

	return deferred.promise;
};

var validateUserRoleDetails = function (userRoleDetails) {
	if (!userRoleDetails || !userRoleDetails.roleName ) {
		return false;
	} else {
		return true;
	}
};

// Populate user roles from database into object while app deploy process
var populateRoleConstants = function () {

    fetchUserRoleDetails(null)
    .then(function (result) {
    	if (result && result.length > 0) {
    		result.forEach(function (element, index) {
    			USER_ROLES[element.id] = element.roleName;
    		});
    		logger.info("User role constants initialized.");
    	} else {
    		logger.error("No user roles in the system");
    		// if no roles present in the system.
    	}
    }, function (err) {
    	logger.error("Error in initializing roles: "+ err);
    });

};

var getIdfromRole = function (roleName) {
	roleName = roleName.toLowerCase();
	var ur = userRoleService.USER_ROLES;
	for(var key in ur) {
		if (ur[key].indexOf(roleName) !== -1) {
			console.log(key);
			return key;
		};
	}
};

// exports section 
exports.USER_ROLES = USER_ROLES;  // userids -> roles mapping  constants
exports.fetchUserRoleDetails = fetchUserRoleDetails;
exports.createUserRole = createUserRole;
exports.populateRoleConstants = populateRoleConstants;
exports.getIdfromRole = getIdfromRole;