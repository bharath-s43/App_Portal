// Express router
var router = require('express').Router();
var Q = require('q');
// services and other utilities
var logger = require('../../util/log').get();
var utils = require('../../util/utils');
var jwt = require('../../util/jwt');
var error = require('../../util/error-message').error;
var display = require('../../util/display-message').display;
var userLoginService = require('../../services/user-login-service');



// POST API - For user Registration

/**
 * @api {post} /login Login
 * @apiDescription Login api with email or contact number.
 * @apiName UserLogin
 * @apiGroup user login
 * @apiParam (email) {String} email email id of user
 * @apiParam (email) {String} password password of user
 * @apiParam (contactNo) {String} contactNo contact number of user
 * @apiParam (contactNo) {String} password password of user
 * @apiParamExample {json} Request-Example:
  {
      "email": "sneha.firodiya@logituit.com",
      "password": "applause123"
  }
 * @apiSuccess (response-headers) {String} Authorization authorization token for user
 * @apiSuccessExample {json} Success-Response:
  {
    "code": 0,
    "errorMessage": "",
    "displayMessage": "User logged in successfully.",
    "data": {
      "deviceInfo": {
        "osName": "iPhone OS",
        "osVer": "9.3.2",
        "deviceName": "iPhone",
        "deviceVer": ""
      },
      "password": "$2a$10$ZpbMfKYcd32wSbVNB7NKWO9/ADpCpRkiMD3MTDkqeTVCGmxleIID2",
      "location": {
        "lng": "23.333",
        "lat": "12.33"
      },
      "personalInfo": {
        "img": null,
        "fullName": "sneha f"
      },
      "empUniqId": {
        "_id": "58be7eaef468391000c13a5c",
        "eid": 1702,
        "updatedAt": "2017-03-07T11:09:28.618Z",
        "createdAt": "2017-03-07T09:34:38.876Z",
        "custId": "58be7e08f468391000c13a55",
        "brandId": {
          "_id": "58be7e37f468391000c13a57",
          "name": "Logituit",
          "empPersonlizationPrefix": "Strengths",
          "id": "58be7e37f468391000c13a57"
        },
        "locationId": {
          "_id": "58be7e51f468391000c13a59",
          "lname": "Pune",
          "id": "58be7e51f468391000c13a59"
        },
        "phoneNo": null,
        "email": "sneha.firodiya@logituit.com",
        "employeeId": "1702",
        "roleId": {
          "_id": "58be7eaef468391000c13a5b",
          "role_type": "developer"
        },
        "isDeleted": 0,
        "isActive": 1,
        "feedback": null,
        "startDt": "2017-03-04T00:00:00.000Z",
        "prefix": {
          "value": "ios",
          "key": "Strengths:::::"
        },
        "department": "it",
        "beaconId": "d16cf8041c98cfca",
        "img": "S1QfOW3cl.png",
        "password": null,
        "fullName": {
          "fname": "Sneha",
          "lname": "Firodiya",
          "full": "Sneha Firodiya"
        },
        "empImgUrl": "http://storage.googleapis.com/applause-dev-img/emp_img/S1QfOW3cl.png",
        "id": "58be7eaef468391000c13a5c"
      },
      "isActive": 1,
      "emailVerified": 1,
      "phoneNoVerified": 0,
      "verificationStatus": "AV",
      "isDeleted": 0,
      "userRelation": null,
      "__v": 0,
      "regType": "EMAIL",
      "role_id": {
        "_id": "58a720fb4c5dd253754e0e33",
        "roleName": "employee",
        "id": "58a720fb4c5dd253754e0e33"
      },
      "userName": "sneha.firodiya@logituit.com",
      "appVer": "1",
      "fbUniqId": null,
      "email": "sneha.firodiya@logituit.com",
      "phoneNo": null,
      "createdAt": "2017-03-07T09:38:01.649Z",
      "updatedAt": "2017-03-28T06:35:13.036Z",
      "uid": 705,
      "_id": "58be7f79f468391000c13a60"
    }
  }
 * @apiError (Errors - code) {Object} 100 incorrect password.
 * @apiError (Errors - code) {Object} 800 The <code>email</code> is not registered.
 * @apiError (Errors - code) {Object} 801 The <code>number</code> is not registered.
 * @apiError (Errors - code) {Object} 802 The <code>email</code> is not verified.
 * @apiError (Errors - code) {Object} 999 All other unhandled errors.
 * @apiErrorExample {json} error-response:
 	{
    "code": 800,
    "errorMessage": "This email is not registered with us.\nPlease re-enter your email and try again.",
    "displayMessage": "This email is not registered with us.\nPlease re-enter your email and try again.",
    "data": null
  }
 */
router.post(['/'], function (req, res) {
	var message = utils.messageFactory();

	var userLoginDetails = req.reqBody || null;	// user details data in POST Request body

	userLoginService.loginUser(userLoginDetails)	// check user if already exists
	.then(function success(result) {
		if (result) {	// if exists
			var token = jwt.create(req, res, result._doc);
			message.displayMessage = display.D0007;
			message.data = result._doc;
			utils.jsonWriter(message, 200, res);
		} else {	// else user does not exists
			utils.throwError(900, error.E0005, 401, error.E0005, null, res);
		}
	}, function failure (err) {
		if (err.code) {
			if(err.code == 800) {
				logger.error("User Login: Error in login user: " + err);
				utils.throwError(err.code, error.E0017, 401, error.E0017, null, res);
			} else if(err.code == 801) {
				logger.error("User Login: Error in login user: " + err);
				utils.throwError(err.code, error.E0016, 401, error.E0016, null, res);
			} else if(err.code == 802) {
				logger.error("User Login: Error in login user: " + err);
				utils.throwError(err.code, error.E0018, 401, error.E0018, null, res);
			} else {
				logger.error("User Login: Error in login user: " + err);
				utils.throwError(err.code, err.message, 401, err.message, null, res);
			}
		} else {
			logger.error("User Login: Error in login user: " + err);
			utils.throwError(999, err.message, 500, error.E0006, null, res);
		};
	});
});

// exports section
module.exports = router;