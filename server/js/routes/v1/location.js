// Express router
var router = require('express').Router();
var Q = require('q');
var mongoose = require('mongoose');
// mail funcionality
var nodemailer = require('nodemailer');
var hbs = require('nodemailer-express-handlebars');
// services and other utilities
var logger = require('../../util/log').get();
var utils = require('../../util/utils');
var error = require('../../util/error-message').error;
var display = require('../../util/display-message').display;
var locService = require('../../services/location-service');

var roleConstants = require('../../util/role-constants');
var userRoleService = require('../../services/user-role-service');


// POST API - For Location creation
router.post(['/'], function (req, res) {
	var message = utils.messageFactory();

	var locDetails = req.reqBody || null;	// customer details data in POST Request body
	var locName = locDetails.name || null;
	var locBrand = mongoose.mongo.ObjectId(locDetails.brandId) || null;

	if (locDetails)
	{
		locService.checkLocation(locName, locBrand)	// check location if already exists
		.then(function success(result) {
			if (result && result.length > 0) {	// if exists
				utils.throwError(true, error.E0307, 200, error.E0307, {"id": result[0]._id, "lid": result[0].lid}, res);
			} else {	// else save location in db
				locService.createLocation(locDetails)
				.then(function success(result) {
					message.displayMessage = display.D0301.replace("<locationName>", result.lname);
					message.data = {"id": result._id, "lid": result.lid};
					utils.jsonWriter(message, 200, res);
				}, function failure (err) {
					if(err.code && err.code == 901) {
						logger.error("Location creation: Error in creating location: " + err);
						utils.throwError(999, error.E0014, 200, error.E0014, null, res);
					} else if(err.code && err.code == 902){
						logger.error("Brand creation: Error in creating location: " + err);
						utils.throwError(999, error.E0015, 200, error.E0015, null, res);
					} else {
						logger.error("Location creation: Error in creating location: " + err);
						utils.throwError(true, error.E0301, 200, error.E0301, null, res);
					}
				});
			}
		}, function failure (err) {
			logger.error("Location Registration: Error in checking location in database: " + err);
			utils.throwError(999, err.message, 200, error.E0301, null, res);
		});
	} else {
		var errMsg = "Auth Error: Error in authorizing location creation";
		logger.error(errMsg);
		utils.throwError(999, errMsg, 403, error.E0906.replace(/<entity>/g, req.userRelation.key), null, res);
	};
});

// GET API For fetching location details
/**
 * @api {get} /location Retrieve locations
 * @apiDescription This api retrieves locations information. If no parameter is provided it returns all locations.
 * If some parameter is provided it returns locations based on those parameters.
 * @apiName GetLocations
 * @apiGroup Locations
 * @apiHeader {String} Authorization user jwt authorization header
 * @apiParam {-} no-param retrieve all locations.<br> eg - https://applause-dev.appspot.com/api/v1/location
 * @apiParam {api-parameter} /:locId retrieve location based on location id.<br> eg - https://applause-dev.appspot.com/api/v1/location/42ffffwrwer2344
 * @apiParam {query-parameter} custId retrieve locations based on customer id.<br> eg - https://applause-dev.appspot.com/api/v1/location/?custId=42fffgtevgjhj44
 * @apiParam {query-parameter} brandId retrieve locations based on brand id.<br> eg - https://applause-dev.appspot.com/api/v1/location/?brandId=42fffgtevgjhj44
 * @apiSuccessExample {json} Success-Response:
 	{
  "code": 0,
  "errorMessage": "",
  "displayMessage": "Location details fetched successfully.",
  	"data": [
	    {
	      "_id": "58be7e51f468391000c13a59",
	      "lid": 182,
	      "lname": "Pune",
	      "add": "Baner",
	      "customer": {
	        "_id": "58be7e08f468391000c13a55",
	        "name": "Emtarang",
	        "id": "58be7e08f468391000c13a55"
	      },
	      "brand": {
	        "_id": "58be7e37f468391000c13a57",
	        "name": "Logituit",
	        "customer": {
	          "_id": "58be7e08f468391000c13a55",
	          "name": "Emtarang",
	          "id": "58be7e08f468391000c13a55"
	        },
	        "fontColor": {
	          "r": 0,
	          "g": 0,
	          "b": 0,
	          "a": 1
	        },
	        "backgroundColor": {
	          "r": 255,
	          "g": 255,
	          "b": 255,
	          "a": 1
	        },
	        "logo_img": null,
	        "logoImgUrl": null,
	        "id": "58be7e37f468391000c13a57"
	      },
	      "employees": [
	        {
	          "id": "58be7eaef468391000c13a5c",
	          "eid": 1702
	        }
	      ],
	      "adminContact": {
	        "userId": {
	          "verificationStatus": "PV",
	          "emailVerified": 0,
	          "id": "58d8ff6c3d72ed901a82baef"
	        },
	        "contactNo": null,
	        "email": "admin_pune_2@logituit.com",
	        "name": "admin two"
	      },
	      "primaryContact": {
	        "userId": {
	          "verificationStatus": "PV",
	          "emailVerified": 0,
	          "id": "58d8ff6c3d72ed901a82baf0"
	        },
	        "contactNo": null,
	        "email": "admin_pune_1@logituit.com",
	        "name": "admin one"
	      },
	      "interactionRadius": 15,
	      "loc": {
	        "lng": "12.22222",
	        "lat": "12.22222"
	      },
	      "img": null,
	      "locImgUrl": null,
	      "id": "58be7e51f468391000c13a59"
	    },
	    {
	      "_id": "58be8275f468391000c13a6b",
	      "lid": 183,
	      "lname": "Fairfax, VA",
	      "add": "12970 Fair Lakes Shopping Center, Fairfax, VA 22033",
	      "customer": {
	        "_id": "58be7aaff468391000c13a46",
	        "name": "Dine Equity, Inc.",
	        "id": "58be7aaff468391000c13a46"
	      },
	      "brand": {
	        "_id": "58be7c2ff468391000c13a4e",
	        "name": "Applebee's",
	        "customer": {
	          "_id": "58be7aaff468391000c13a46",
	          "name": "Dine Equity, Inc.",
	          "id": "58be7aaff468391000c13a46"
	        },
	        "fontColor": {
	          "r": 0,
	          "g": 0,
	          "b": 0,
	          "a": 1
	        },
	        "backgroundColor": {
	          "r": 255,
	          "g": 255,
	          "b": 255,
	          "a": 1
	        },
	        "logo_img": "BkFxGM2qx.png",
	        "logoImgUrl": "http://storage.googleapis.com/applause-dev-img/brand_img/BkFxGM2qx.png",
	        "id": "58be7c2ff468391000c13a4e"
	      },
	      "employees": [],
	      "adminContact": {
	        "userId": null,
	        "contactNo": null,
	        "email": null,
	        "name": null
	      },
	      "primaryContact": {
	        "userId": null,
	        "contactNo": null,
	        "email": null,
	        "name": null
	      },
	      "interactionRadius": null,
	      "loc": {
	        "lng": null,
	        "lat": null
	      },
	      "img": "HJirofh5l.png",
	      "locImgUrl": "http://storage.googleapis.com/applause-dev-img/loc_img/HJirofh5l.png",
	      "id": "58be8275f468391000c13a6b"
	    }
	  ]
	}
 * @apiError (Errors - code) {Object} true location not found for parameters.
 * @apiError (Errors - code) {Object} 999 All other errors.
 */

router.get(['/', '/:locId'], function (req, res) {

	var message = utils.messageFactory();
	var searchParams = req.query || [];

	var locId = req.params['locId'] || null;

	if (locId === null && req.userData && userRoleService.USER_ROLES[req.userData.role_id._id] !== roleConstants["SA"] && userRoleService.USER_ROLES[req.userData.role_id._id] !== roleConstants["BA"] && userRoleService.USER_ROLES[req.userData.role_id._id] !== roleConstants["CA"]) {
		logger.error("Location Fetch: Location ID is absent in request.");
		utils.throwError(true, error.E0309, 200, error.E0309, null, res);
	} else {
		locService.fetchLocationDetails(searchParams, locId)
		.then (function success(result) {
			if (result && result.length > 0) {
				message.displayMessage = display.D0302;
				message.data = result;
				utils.jsonWriter(message, 200, res);
			} else {
				var err = true;
				var errorMessage = error.E0302;
				var displayMessage = error.E0303;
				var data = [];
				utils.throwError(err, errorMessage, 200, displayMessage, data, res);
			}
		}, function failure(err) {
			logger.error("Location fetch: Error in searching Location in database: " + err);
			utils.throwError(999, error.E0304, 200, error.E0304, null, res);
		});
	};
});

// POST API - For Location creation
router.delete(['/'], function (req, res) {
	var message = utils.messageFactory();

	var locDetails = req.reqBody || null;

	var locationIds = [];
	locDetails.locationIds.forEach(function(element, index){
		locationIds.push(mongoose.mongo.ObjectId(element));
	});

	locService.deleteLocation(locationIds)
	.then(function success(result) {
		if(result && result.locationsDeleted) {
			message.displayMessage = display.D0303;
		} else {
			message.displayMessage = display.D0304;
		}
		utils.jsonWriter(message, 200, res);
	}, function failure (err) {
		logger.error("Location deletion: Error in deleting location: " + err);
		utils.throwError(true, error.E0305, 200, error.E0305, null, res);
	});
});

// PUT API - For location updation
router.put('/:locId', function (req, res) {
	var message = utils.messageFactory();
	var locUniqId = req.params['locId'] || null;
	var locDetails = req.reqBody || null;	// location details data in PUT Request body

	var locName = locDetails.lname || null;
	var locBrand = mongoose.mongo.ObjectId(locDetails.brand._id) || null;

	locService.checkLocation(locName, locBrand)	// check location if already exists
	.then(function success(result) {
		if (result && result.length && result[0].id != locUniqId) {	// if exists
			utils.throwError(true, error.E0307, 200, error.E0307, {"id": result._id, "lid": result.lid}, res);
		} else {	// else save location in db
			locService.updateLocation(locDetails, locUniqId)
			.then(function success(locResult) {
				message.displayMessage = display.D0305.replace("<locationName>", locResult.lname);
				message.data = {"id": locResult._id, "lid": locResult.lid};
				utils.jsonWriter(message, 200, res);
			}, function failure (err) {
				if(err.code && err.code == 901) {
					logger.error("Location Update: Error in updating location: " + err);
					utils.throwError(999, error.E0014, 200, error.E0014, null, res);
				} else if(err.code && err.code == 902){
					logger.error("Location Update: Error in updating location: " + err);
					utils.throwError(999, error.E0015, 200, error.E0015, null, res);
				} else {
					logger.error("Location Update: Error in updating Location: " + err);
					utils.throwError(999, error.E0306, 200, error.E0306, null, res);
				}
			});
		}
	}, function failure (err) {
		logger.error("Location Registration: Error in checking location in database: " + err);
		utils.throwError(999, err.message, 200, error.E0306, null, res);
	});
});


// exports section
module.exports = router;