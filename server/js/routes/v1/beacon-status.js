// Express router
var router = require('express').Router();
var Q = require('q');
// services and other utilities
var logger = require('../../util/log').get();
var utils = require('../../util/utils');
var error = require('../../util/error-message').error;
var display = require('../../util/display-message').display;
var beaconStatusService = require('../../services/beacon-status-service');


// GET API For fetching beacon status list
router.get(['/'], function (req, res) {
	var message = utils.messageFactory();

	var beaconStatusList = beaconStatusService.fetchBeaconStatusList();
	if (beaconStatusList && beaconStatusList.length > 0) {
		message.displayMessage = display.D0504;
		message.data = beaconStatusList;
		utils.jsonWriter(message, 200, res);
	} else {
		logger.error("Beacon Status list is empty !!!");
		utils.throwError(999, error.E0506, 500, error.E0507, null, res);
	};
});

// exports section
module.exports = router;