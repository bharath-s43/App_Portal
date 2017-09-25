// Express router
var router = require('express').Router();
var Q = require('q');
// services and other utilities
var logger = require('../../util/log').get();
var utils = require('../../util/utils');
var roleConstants = require('../../util/role-constants');
var error = require('../../util/error-message').error;
var display = require('../../util/display-message').display;
var beaconService = require('../../services/beacon-service');
var userRoleService = require('../../services/user-role-service');



// POST API - For employee Registration
router.post(['/'], function (req, res) {
	var message = utils.messageFactory();

	var beaconDetails = req.reqBody || null;	// employee details data in POST Request body
	var actionParams = req.query || [];

	beaconService.beaconAction(beaconDetails, actionParams)
	.then (function (result) {
		message.displayMessage = display.D0501;
		message.data = result;
		utils.jsonWriter(message, 200, res);
	}, function (err) {
		if (err.code) {
			logger.error("Beacon Assignment: Error in assigning beacon id in bulk upload: " + err);
			utils.throwError(err.code, err.message, 200, err.message, null, res);
		} else {
			logger.error("Beacon Assignment: Error in assigning beacon id in bulk upload: " + err);
			utils.throwError(999, error.E0501, 200, error.E0501, null, res);
		};
	});
});


// GET API For fetching employee profiles
router.get(['/', '/:beaconId'], function (req, res) {
	var message = utils.messageFactory();
	var searchParams = req.query || [];

	var beaconUniqId = req.params['beaconId'] || null;

	if (searchParams.length === 0 && req.userData && userRoleService.USER_ROLES[req.userData.role_id._id] !== roleConstants["SA"]) {
		logger.error("Beacon Fetch: Beacon ID is absent in request.");
		utils.throwError(true, error.E0107, 200, error.E0107, null, res);
	} else {
		if(req.userRelation && req.userRelation.key) {
			switch(req.userRelation.key) {
				case "customer" :
					searchParams['custId'] = req.userRelation.id;
					break;
				case "brand" : 
					searchParams['custId'] = null;
					searchParams['brandId'] = req.userRelation.id;
					break;
				case "location" : 
					searchParams['custId'] = null;
					searchParams['brandId'] = null;
					searchParams['locId'] = req.userRelation.id;
					break;
			};
		}
		
		beaconService.fetchSearchResults(searchParams, beaconUniqId)
		.then (function success(result) {
			if (Array.isArray(result) && result.length > 0) {
				message.displayMessage = display.D0502;
				message.data = result;
				utils.jsonWriter(message, 200, res);
			} else if (result && (result.hasOwnProperty('beaconDocs') || result.hasOwnProperty('empDocs'))) {
				message.displayMessage = display.D0502;
				message.data = result;
				utils.jsonWriter(message, 200, res);
			}else {
				var err = 222;
				var errorMessage = error.E0502;
				var displayMessage = error.E0503;
				var data = [];
				utils.throwError(err, errorMessage, 200, displayMessage, data, res);
			}
		}, function failure(err) {
			if (err.code) {
				logger.error("Beacon Search: " + err);
				utils.throwError(err.code, err.message, 200, error.E0504, null, res);
			} else {
				logger.error("Beacon fetch: Error in searching brand in database: " + err);
				utils.throwError(999, err.message, 200, error.E0504, null, res);
			};
		});
	};

});

// Update API
router.put(['/','/:beaconId'], function (req, res) {
	var message = utils.messageFactory();
	var beaconDetails = req.reqBody || null;	// employee details data in POST Request body

	beaconService.pairBeaconInd(beaconDetails)
	.then(function (result) {
		if (result) {
			message.displayMessage = display.D0503;
			message.data = result;
			utils.jsonWriter(message, 200, res);
		} else {
			logger.error("Beacon update: Beacon not updated: " + err);
			utils.throwError(999, err.message, 200, error.E0505, null, res);
		}
	}, function (err) {
		logger.error("Beacon update: Error in updating beacon in database: " + err);
		utils.throwError(999, err.message, 200, error.E0505, null, res);
	});

});

// exports section
module.exports = router;