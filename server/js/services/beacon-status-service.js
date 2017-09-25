// import npm packages
var Q = require('q');
// import files
var logger = require('../util/log').get();
var utils = require('../util/utils');
// models
var beaconStatusList = ["PAIRED", "UNPAIRED"];

// Fetch operations for employee profiles
var fetchBeaconStatusList = function (ratingId) {
	return beaconStatusList;
};

// exports section 
exports.fetchBeaconStatusList = fetchBeaconStatusList;
