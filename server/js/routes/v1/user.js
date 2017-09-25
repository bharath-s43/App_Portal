// Express router
var router = require('express').Router();
var Q = require('q');
var mongoose = require('mongoose');
// mail funcionality
var nodemailer = require('nodemailer');
var hbs = require('nodemailer-express-handlebars');
var jwt = require('../../util/jwt');
// services and other utilities
var logger = require('../../util/log').get();
var utils = require('../../util/utils');
var error = require('../../util/error-message').error;
var display = require('../../util/display-message').display;
var userService = require('../../services/user-service');
var employeeService = require('../../services/employee-service');
var mailService = require('../../services/mail-service');

/**
 * @api {post} /users Registration
 * @apiDescription Registration api with email, contact number or facebook.
 * @apiName UserRegister
 * @apiGroup Users
 * @apiHeader {String="USER","EMP"} usrType employee or app consumer

 * @apiParam (email) {String} email email id of user
 * @apiParam (email) {String} [phoneNo] mobile number of user
 * @apiParam (email) {String} password user's password

 * @apiParam (contact number) {String} [email] email id of user
 * @apiParam (contact number) {String} phoneNo mobile number of user
 * @apiParam (contact number) {String} password user's password

 * @apiParam (facebook) {String} fbUniqId user's unique facebook id
 * @apiParam (facebook) {String} [email] email id of user
 * @apiParam (facebook) {String} [phoneNo] mobile number of user

 * @apiParam (Comman fields) {Object} [deviceInfo] user's device information
 * @apiParam (Comman fields) {String} deviceInfo.osName
 * @apiParam (Comman fields) {String} deviceInfo.osVer
 * @apiParam (Comman fields) {String} deviceInfo.deviceName
 * @apiParam (Comman fields) {String} deviceInfo.deviceVer
 * @apiParam (Comman fields) {Object} [location] user's location
 * @apiParam (Comman fields) {String} location.lat 
 * @apiParam (Comman fields) {String} location.lng
 * @apiParam (Comman fields) {String} [appVer] user's application version
 * @apiParam (Comman fields) {Object} personalInfo user's personal information
 * @apiParam (Comman fields) {String} personalInfo.fullName user's full name
 * @apiParam (Comman fields) {String} roleId roleId for the user (app_consumer, customer/brand/location admin, employee)
 * @apiParam (Comman fields) {String="FB","CONTACTNO","EMAIL"} regType registration type for registration.
 * @apiParamExample {json} Request-Example:
	{
	    "phoneNo": "917507684060",
	    "email": null,
	    "deviceInfo": {
	        "osName": "ios",
	        "osVer": "9.3.4",
	        "deviceName": "iPhone",
	        "deviceVer": "6"
	    },
	    "location": {
	        "lng": "23.333",
	        "lat": "12.33"
	    },
	    "appVer": "0.0.1",
	    "password": "password",
	    "personalInfo": {
	        "fullName": "Contact User"
	    },
	    "roleId": "57d2a5351f70895c10d7eda7",
	    "regType": "CONTACTNO",
	    "fbUniqId": null
	}
 * @apiSuccessExample {json} Success-Response:
	 {
	  "code": 0,
	  "errorMessage": "",
	  "displayMessage": "Congratulations, account created succesfully.",
	  "data": {
	    "id": "58d9f602ce2270b40bdb01a0",
	    "uid": 712
	  }
	}
 * @apiError (Errors - code) {Object} 800 details not available in employee records.
 * @apiError (Errors - code) {Object} 801 The <code>email</code> is already registered.
 * @apiError (Errors - code) {Object} 802 The <code>phone number</code> is already registered.
 * @apiError (Errors - code) {Object} 600 error validating user registration type.
 * @apiError (Errors - code) {Object} 999 All other unhandled errors.
 */

// POST API - For user Registration
router.post(['/'], function (req, res) {

	var message = utils.messageFactory();

	var userType = req.get('usrType') || null;
	var userDetails = req.reqBody || null;	// user details data in POST Request body
	var siteBase = utils.getServerPath(req);


	(function (exports) {
	  'use strict';
	 
	  var Sequence = exports.Sequence || require('sequence').Sequence
	    , sequence = Sequence.create()
	    , err
	    ;

	/* Using sequence package to make callback sync for maintaining atomic DB transactions */
	sequence
	.then(function (next) {	// check user type related information
				if(userType === 'USER') {
					next();
				}
				//If registration type is employee check if employee is present in employees else throw error
				if(userType === 'EMP') {
					employeeService.checkEmailContactEmployee(userDetails)
						.then(function success(result) {
							if (result) {	// if email present in employees
								userDetails.empUniqId = result.id;
								next();
							} else {	// throw error
								utils.throwError(800, error.E0001, 200, error.E0001, null, res);
							};
						}, function failure(err) {
							logger.error("User Registration: Error in checking email user in database: " + err);
							utils.throwError(999, err.message, 200, error.E0002, null, res);
						});
				}		
			}
		)
		.then(function (next) {	// check email if already exists
				if (userDetails.regType) {
					if (userDetails.regType === 'EMAIL') {
						userService.checkEmailUser(userDetails)
						.then(function success(result) {
							if (result) {	// if exists
								if(result.emailVerified) {
									utils.throwError(801, error.E0003, 403, error.E0003, {"id": result._id, "uid": result.cid}, res);
								} else {
									//Send verification email again
									//Create token for account activation
									var activationTokenDecrypred = result.id + "+" + userDetails.email;
									var activationTokenEncrypred = utils.encryptAES(activationTokenDecrypred);

									var activationLink = siteBase + "/api/v1/users/activate/"+ activationTokenEncrypred;
									//Configure mail options
									var mailOptions = {};
									mailOptions.to = userDetails.email;
									mailOptions.subject = "Applause Activation";
									mailOptions.template = "activate_email";
									mailOptions.context = {};
									mailOptions.context.firstName = userDetails.personalInfo.fullName;
									mailOptions.context.activationLink = activationLink;
									mailOptions.context.logoPath = siteBase;

									//send email
									mailService.sendMail(mailOptions);
									message.displayMessage = display.D0013;
									message.data = {"id": result.id};
									utils.jsonWriter(message, 200, res);
								}
							} else {	// else save user in db
								next();
							};
						}, function failure(err) {
							logger.error("User Registration: Error in checking email user in database: " + err);
							utils.throwError(999, err.message, 200, error.E0002, null, res);
						});
					} else {	// IF regType !== EMAIL
						next();
					}
				} else {
					var err = new Error("User Registration: Error in validating user registration type");
					err.code = 600;
					logger.error(err.message);
					utils.throwError(err.code, err.message, 200, error.E0002, null, res);
				};
			}
		)
		.then(function (next) {	// check contact No if already exists
				if (userDetails.regType) {
					if (userDetails.regType === 'CONTACTNO') {
						userService.checkContactUser(userDetails)
						.then(function success(result) {
							if (result) {
								utils.throwError(802, error.E0004, 403, error.E0004, {"id": result._id, "uid": result.cid}, res);
							} else {
								next();
							};
						}, function failure(err) {
							logger.error("User Registration: Error in checking contact number user in database: " + err);
							utils.throwError(999, err.message, 200, error.E0002, null, res);
						});
					} else {	// IF regType !== EMAIL
						next();
					}
				} else {
					var err = new Error("User Registration: Error in validating user registration type");
					err.code = 600;
					logger.error(err.message);
					utils.throwError(err.code, err.message, 200, error.E0002, null, res);
				};
			}
		)
		.then(function (next) {	// check FB unique id already exists
				if (userDetails.regType) {
					if (userDetails.regType === 'FB') {
						userService.checkFBUser(userDetails)
						.then(function success(result) {
							if (result) {
								//Create jwt token and login user
								var token = jwt.create(req, res, result._doc);
								message.displayMessage = display.D0001;
								message.data = result._doc;
								utils.jsonWriter(message, 200, res);
							} else {
								next();
							};
						}, function failure(err) {
							logger.error("User Registration: Error in checking FB user in database: " + err);
							utils.throwError(999, err.message, 200, error.E0002, null, res);
						});
					} else {	// IF regType !== EMAIL
						next();
					}
				} else {
					var err = new Error("User Registration: Error in validating user registration type");
					err.code = 600;
					logger.error(err.message);
					utils.throwError(err.code, err.message, 200, error.E0002, null, res);
				};
			}
		)
		.then(function (next) {	// Register user
			userService.saveUser(userDetails, 0, siteBase) //isContactUser flag false
			.then(function success(result) {
				if(userDetails.regType === 'EMAIL') {
					message.displayMessage = display.D0002;
				} else {
					message.displayMessage = display.D0012;
				}
				message.data = {"id": result._id, "uid": result.uid};
				utils.jsonWriter(message, 200, res);
			}, function failure (err) {
				if (err.code) {
					logger.error("User Registration: Error in registering user: " + err.message);
					utils.throwError(err.code, err.message, 200, error.E0002, null, res);
				} else {
					logger.error("User Registration: Error in registering user: " + err);
					utils.throwError(999, err.message, 200, error.E0002, null, res);
				};
			});
		})
	}('undefined' !== typeof exports && exports || new Function('return this')()));
});

/*
 * GET API for getting user accounts
 */
 router.get(['/'], function (req, res) {
	var message = utils.messageFactory();

	userService.getUsers()
		.then(
			function success(result) {
		    	message.displayMessage = display.D0010;
		    	message.data = result;
				utils.jsonWriter(message, 200, res);			
			},
			function failure(err) {
				logger.error("Users: Error in fetching users: " + err);
				utils.throwError(999, err.message, 200, error.E0011, null, res);
			}
		);
});

/*
 * GET API for activating a user account
 */
router.get(['/activate/:token'], function (req, res) {
	var message = utils.messageFactory();
	var activationToken = req.params.token; 
	var activationTokenDecrypred = utils.decryptAES(activationToken);
	var details = activationTokenDecrypred.split("+");
	var userId = details && details.length && details[0] || null ;
	var email = details && details.length && details[1] || null ;

	userService.activateUser(userId,email)
		.then(
			function success(result) {
				if(result && result.length && result[0].emailVerified == 1) {
			    	message.displayMessage = display.D0003;
					utils.jsonWriter(message, 200, res);			
				}
				else {
					message.displayMessage = display.D0004;
					utils.jsonWriter(message, 200, res);	
				}
			},
			function failure(err) {
				if (err.code) {
					logger.error("User Activation: Error in activating user: " + err.message);
					utils.throwError(err.code, err.message, 200, error.E0007, null, res);
				} else {
					logger.error("User Activation: Error in activating user: " + err);
					utils.throwError(999, err.message, 200, error.E0007, null, res);
				};
			}
		);
});

/*
 * GET API for activating a user account
 */
router.get(['/setPassword/:userId'], function (req, res) {
	var message = utils.messageFactory();
	var userId = req.params.userId; 
	res.redirect('/?valid=' + string);
});

router.post(['/setPassword/'], function (req, res) {
	var message = utils.messageFactory();
	var setPassDetails = req.reqBody;

	userService.setPassword(setPassDetails)
		.then(
			function success(result) {
				if(result.nModified == 1) {
			    	message.displayMessage = display.D0005;
					utils.jsonWriter(message, 200, res);			
				}
				else {
					message.displayMessage = display.D0005;
					utils.jsonWriter(message, 200, res);	
				}
			},
			function failure(err) {
				if (err.code) {
					if(err.code == 600) {
						logger.error("User Activation: Error in setting password: " + err.message);
						utils.throwError(err.code, err.message, 200, error.E0013, null, res);
					} else {
						logger.error("User Activation: Error in setting password: " + err.message);
						utils.throwError(err.code, err.message, 200, error.E0008, null, res);
					}
				} else {
					logger.error("User Activation: Error in setting password: " + err);
					utils.throwError(999, err.message, 200, error.E0008, null, res);
				};
			}
		);	
});

// Update user details

/**
 * @api {put} /users Update User
 * @apiDescription update user api with email, contact
 * @apiName UserUpdate
 * @apiGroup Users
 * @apiHeader {String} Authorization authorization token of user
 
 * @apiParam (email) {String} email email id of user
 * @apiParam (email) {String} [phoneNo] mobile number of user

 * @apiParam (contact no) {String} [email] email id of user
 * @apiParam (contact no) {String} phoneNo mobile number of user

 * @apiParam (common fields) {Object} [deviceInfo] user's device information
 * @apiParam (common fields) {String} deviceInfo.osName
 * @apiParam (common fields) {String} deviceInfo.osVer
 * @apiParam (common fields) {String} deviceInfo.deviceName
 * @apiParam (common fields) {String} deviceInfo.deviceVer
 * @apiParam (common fields) {Object} [location] user's location
 * @apiParam (common fields) {String} location.lat 
 * @apiParam (common fields) {String} location.lng
 * @apiParam (common fields) {String} [appVer] user's application version
 * @apiParam (common fields) {String} [password] user's password currentPassword
 * @apiParam (common fields) {String} currentPassword user's current password (mandatory if password is present)
 * @apiParam (common fields) {Object} [personalInfo] user's personal information
 * @apiParam (common fields) {String} personalInfo.fullName user's full name
 * @apiParam (common fields) {String="CONTACTNO", "EMAIL"} regType registration type of user.
 * @apiParamExample {json} Request-Example:
	{
	"password":"password",
	"regType":"EMAIL",
	"email":"admin@meimodo.com",
	"currentPassword": "welcome123",
	"deviceInfo": {
	    "osName": "ios",
	    "osVer": "9.3.4",
	    "deviceName": "iPhone",
	    "deviceVer": "6"
	},
	"location": {
		"lng": "23.333",
		"lat": "12.33"
	},
	"appVer": "0.0.1",
	"personalInfo": {
		"fullName": "Contact User"
		}
	}
 * @apiSuccessExample {json} Success-Response:
	 {
	  "code": 0,
	  "errorMessage": "",
	  "displayMessage": "Congratulations, user Meimodo Admin updated successfully.",
	  "data": {
	    "uid": 630,
	    "updatedAt": "2017-03-28T07:04:01.748Z",
	    "createdAt": "2017-02-25T10:26:51.450Z",
	    "phoneNo": null,
	    "email": "admin@meimodo.com",
	    "fbUniqId": null,
	    "appVer": "0.0.1",
	    "userName": "admin@meimodo.com",
	    "role_id": "57c8c534488d6788133f61f1",
	    "regType": "EMAIL",
	    "userRelation": null,
	    "isDeleted": 0,
	    "verificationStatus": "PV",
	    "phoneNoVerified": 1,
	    "emailVerified": 1,
	    "isActive": 1,
	    "empUniqId": null,
	    "personalInfo": {
	      "fullName": "Meimodo Admin",
	      "img": null
	    },
	    "location": {
	      "lat": "12.33",
	      "lng": "23.333"
	    },
	    "password": "$2a$10$FC5363TWd4fvDAI6dZxxWetc0xRHM/C/QislydgFlseTYp1RxjDDm",
	    "deviceInfo": {
	      "deviceVer": "6",
	      "deviceName": "iPhone",
	      "osVer": "9.3.4",
	      "osName": "ios"
	    },
	    "id": "58b15beb67af631000bd4381"
	  }
	}
 * @apiError (Errors - code) {Object} 500 current password does not match
 * @apiError (Errors - code) {Object} 999 Error updating user.
 */
router.put(['/'], function (req, res) {
	var message = utils.messageFactory();
	var userDetails = req.reqBody || null;	// user details data in PUT Request body

	if(req.userData && req.userData._id) {
		userDetails.id = req.userData._id;
	}
	
	userService.updateUser(userDetails)
	.then(function (result) {
		message.displayMessage = display.D0006.replace("<fullName>", result.personalInfo.fullName);
		message.data = result;
		utils.jsonWriter(message, 200, res);
	}, function (err) {
		if (err.code) {
			logger.error("User Update: Error in updating user: " + err.message);
			utils.throwError(err.code, err.message, 200, err.message, null, res);
		} else {
			logger.error("User Registration: Error in registering user: " + err);
			utils.throwError(999, error.E0009, 200, error.E0009, null, res);
		};
	});
});

// POST API - For User deletion
router.delete(['/'], function (req, res) {
	var message = utils.messageFactory();
	console.log("here");

	var userDetails = req.reqBody || null;	// user Id to delete

	var userIds = [];
	userDetails.userIds.forEach(function(element, index){
		userIds.push(mongoose.mongo.ObjectId(element));
	});

	userService.deteteUser(userIds)
	.then(function success(result) {
		if(result) {
			message.displayMessage = display.D0011;
		}
		// } else {
		// 	message.displayMessage = display.D0406;
		// }
		utils.jsonWriter(message, 200, res);
	}, function failure (err) {
		logger.error("User deletion: Error in deleting users: " + err);
		utils.throwError(999, err.message, 200, error.E0012, null, res);
	});
});

// exports section
module.exports = router;