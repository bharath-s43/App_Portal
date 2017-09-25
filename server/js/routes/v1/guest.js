// Express router
var router = require('express').Router();
var Q = require('q');
// services and other utilities
var logger = require('../../util/log').get();
var utils = require('../../util/utils');
var jwt = require('../../util/jwt');
var guestService = require('../../services/guest-service');

 /**
 * @api {post} /guest Save guest user details
 * @apiDescription This api saves guest user details. If user is not signed up and still wants to submit feedback,
 * we save the user information as guest user through guest login. 
 * @apiName saveGuestUserDetails
 * @apiGroup Guest
 * @apiHeader {String} deviceId user's device id
 * @apiParam {String} appVer user's application version
 * @apiParam {Object} deviceInfo user's device information
 * @apiParam {String} deviceInfo.osName
 * @apiParam {String} deviceInfo.osVer
 * @apiParam {String} deviceInfo.deviceName
 * @apiParam {String} deviceInfo.deviceVer
 * @apiParam {Object} [location] user's location
 * @apiParam {String} location.lat 
 * @apiParam {String} location.lng
 * @apiParamExample {json} Request-Example:
	{
		"appVer" : "4.4.1",
		"deviceInfo" : {
			"osName": "ios",
	        "osVer": "9.3.4",
	        "deviceName": "iPhone",
	        "deviceVer": "6"
		},
		"location" : {
			"lat": "12.2222",
			"lng": "12.2222"
		}
	}
 * @apiSuccess (response-headers) {String} Authorization authorization token for user
 * @apiSuccessExample {json} Success-Response:
	 {
	  "code": 0,
	  "errorMessage": "",
	  "displayMessage": "Guest user saved in successfully.",
	  "data": {
	    "deviceInfo": {
	      "_id": {},
	      "deviceVer": "6",
	      "deviceName": "iPhone",
	      "osVer": "9.3.4",
	      "osName": "ios"
	    },
	    "location": {
	      "lng": "12.2222",
	      "lat": "12.2222"
	    },
	    "role_id": {
	      "_id": "58a721024c5dd253754e0e34",
	      "roleName": "guest",
	      "id": "58a721024c5dd253754e0e34"
	    },
	    "__v": 0,
	    "appVer": "4.4.1",
	    "deviceId": "abcdef",
	    "createdAt": "2017-03-28T04:40:29.573Z",
	    "updatedAt": "2017-03-28T04:40:29.573Z",
	    "_id": "58d9e93dce2270b40bdb019f"
	  }
	}
 * @apiError (Errors - code) {Object} 999 guest user save error.
 */

// POST API - For user Registration
router.post(['/'], function (req, res) {
	var message = utils.messageFactory();

	var guestUserDetails = req.reqBody || null;	// user details data in POST Request body

	guestService.saveGuestUser(guestUserDetails, req.deviceId)
	.then(function success(result) {
		if (result) {	// if exists
			var token = jwt.create(req, res, result._doc);
			message.displayMessage = "Guest user saved in successfully.";
			message.data = result._doc;
			utils.jsonWriter(message, 200, res);
		} else {	// else user does not exists
			utils.throwError(999, "Guest user save error.", 401, "Guest user save error.", null, res);
		}
	}, function failure (err) {
		logger.error("Guest user save: Error in saving guest user details: " + err);
		utils.throwError(999, "something went wrong. Please try again after sometime.", 500, "something went wrong. Please try again after sometime.", null ,res);
	});
});

// exports section
module.exports = router;