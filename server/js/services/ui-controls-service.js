// import npm packages
var Q = require('q');
var mongoose = require('../util/connection');

// import files
var logger = require('../util/log').get();
var utils = require('../util/utils');
var uiControlModel = require('../models/ui-controls-model');
/*
	GET the ui controls from db based upon roleName 
	Parameters: roleName : <String>
*/
var getUiControls = function (roleName) {
	var deferred = Q.defer();

	if (null !== roleName && roleName !== '') {
		uiControlModel.getUiControls(roleName)
		.then (function (result){
			deferred.resolve(result);
		}, function (err){
			logger.error("UI Control request failure: " + err.message);
			deferred.reject(err);
		});
	} else { 
		var err = new Error("UI Control request validation failed !!!");
		logger.error(err);
		deferred.reject(err);
	};

	return deferred.promise;
};

// exports section
exports.getUiControls = getUiControls;