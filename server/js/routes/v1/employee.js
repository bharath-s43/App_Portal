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
var roleConstants = require('../../util/role-constants');
var error = require('../../util/error-message').error;
var display = require('../../util/display-message').display;
var employeeService = require('../../services/employee-service');
var userRoleService = require('../../services/user-role-service');



// POST API - For employee Registration
router.post(['/'], function (req, res) {
	var message = utils.messageFactory();
	var actionParams = req.query || [];
	var employeeDetails = req.reqBody || null;	// employee details data in POST Request body

	if (actionParams['qty'] === "bulk") {
		employeeService.createEmployee(employeeDetails, actionParams)
		.then(function success(empResult) {
			message.displayMessage = display.D0401;
			message.data = empResult
			utils.jsonWriter(message, 200, res);
		}, function (err) {
			if (err.code === 666) {
				logger.error("employee creation: Error in creating employee Indiviual: " + err);
				utils.throwError(999, err.message, 200, error.E0401, null, res);
			} else if (err.code === 777) {
				logger.error("employee creation: Error in bulk employee creation: " + err);
				utils.throwError(999, err.message, 200, error.E0402, null, res);
			} else if (err.code === 888) {
				logger.error(err);
				utils.throwError(999, err.message, 200, error.E0403, null, res);
			} else {
				logger.error("employee on-boarding: Error in on-boarding employee: " + err);
				utils.throwError(999, err.message, 200, error.E0404, null, res);
			};
		});
	} else {
		var empId = employeeDetails.empId;
		var brandId = employeeDetails.brandId;
		if (empId && brandId) {
			employeeService.checkEmployee(empId, brandId)	// check employee if already exists
			.then(function success(result) {
				if (result) {	// if exists
					utils.throwError(true, error.E0418, 200, error.E0418, {"id": result._id, "eid": result.eid}, res);
				} else {	// else check employee beacon in db
					employeeService.checkEmployeeBeacon(employeeDetails)
					.then(function success (beaconRes) {
						if (beaconRes) {
							if(beaconRes.location != employeeDetails.locId) {
								utils.throwError(true, error.E0420, 200, error.E0420, {"id": beaconRes._id, "eid": beaconRes.eid, "name": beaconRes.fullName, "beaconId": beaconRes.beaconId}, res);
							} else {
								utils.throwError(true, error.E0406, 200, error.E0406, {"id": beaconRes._id, "eid": beaconRes.eid, "name": beaconRes.fullName, "beaconId": beaconRes.beaconId}, res);
							}

						} else {
							employeeService.createEmployee(employeeDetails, actionParams)
							.then(function success(empResult) {	
								message.displayMessage = display.D0402.replace("<fullName>", empResult.fullName.full);
								message.data = {"id": empResult._id, "empId": empResult.empid, "eid": empResult.eid};
								utils.jsonWriter(message, 200, res);
							}, function failure (err) {
								if (err.code === 666) {
									logger.error("employee creation: Error in creating employee Indiviual: " + err);
									utils.throwError(999, err.message, 200, error.E0401, null, res);
								} else if (err.code === 888) {
									logger.error(err);
									utils.throwError(999, err.message, 200, error.E0403, null, res);
								} else if (err.code === 300) {
									logger.error("employee creation: Error in creating employee: " + err);
									utils.throwError(err.code, err.message, 200, error.E0407, null, res);
								} else if(err.code == 780){
									logger.error("Employee Update: Error in updating employee: " + err);
									utils.throwError(999, error.E0423, 200, error.E0423, null, res);
								}else {
									logger.error("employee on-boarding: Error in on-boarding employee: " + err);
									utils.throwError(999, err.message, 200, error.E0404, null, res);
								}
							});
						};
					}, function failure (err) {
						logger.error("employee on-boarding: Error in checking employee beacon in database: " + err);
						utils.throwError(999, error.E0408, 200, error.E0408, null, res);
					});
				};
			}, function failure (err) {
				logger.error("employee on-boarding: Error in checking employee id in database: " + err);
				utils.throwError(999, error.E0408, 200, error.E0408, null, res);
			});
		} else {
			var err = new Error("Employee Create check : Employee Id / BrandId are missing");
			logger.error(err.message);
			utils.throwError(true, err.message, 200, error.E0403, null, res);
		}
	};
});

/**
 * @api {get} /employee Retrieve employees
 * @apiDescription retrieve employees. This api returns all employees if no parameter is provided. If some parameter is
 * provided it returns specific employees based on the parameters. 
 * @apiName GetEmployees
 * @apiGroup Employees
 * @apiHeader {String} Authorization user jwt authorization header
 * @apiParam {-} no-param retrieve all employees.<br> eg - https://applause-dev.appspot.com/api/v1/employee
 * @apiParam {query-parameter} beaconId retrieve employee based on beacon id.<br> eg - https://applause-dev.appspot.com/api/v1/employee/?beaconId=42ffffwrwer2344
 * @apiParam {query-parameter} locId retrieve employees based on location id.<br> eg - https://applause-dev.appspot.com/api/v1/employee/?locId=42fffgtevgjhj44
 * @apiSuccessExample {json} Success-Response:
	 {
	  "code": 0,
	  "errorMessage": "",
	  "displayMessage": "Employee fetched successfully.",
	  "data": [
	    {
	      "_id": "58be7eaef468391000c13a5c",
	      "eid": 1702,
	      "custId": "58be7e08f468391000c13a55",
	      "brandId": {
	        "_id": "58be7e37f468391000c13a57",
	        "bid": 165,
	        "name": "Logituit",
	        "ratingImgId": "57d9640625c8c3b8087b4387",
	        "brandType": "5809dce8f24ab2600dbb3717",
	        "isDeleted": 0,
	        "isActive": 1,
	        "customer": "58be7e08f468391000c13a55",
	        "locationReasons": [
	          "Service",
	          "Quality",
	          "Ambience",
	          "Price",
	          "Other"
	        ],
	        "defaultReasons": [
	          "SpeedOfService",
	          "Communication",
	          "Knowledge",
	          "AttentiontoDetails",
	          "Courtesy",
	          "Other"
	        ],
	        "empPersonlizationPrefix": "Strengths",
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
	      "locationId": {
	        "_id": "58be7e51f468391000c13a59",
	        "lid": 182,
	        "lname": "Pune",
	        "add": "Baner",
	        "customer": "58be7e08f468391000c13a55",
	        "brand": "58be7e37f468391000c13a57",
	        "isDeleted": 0,
	        "isActive": 1,
	        "adminContact": {
	          "userId": "58d8ff6c3d72ed901a82baef",
	          "contactNo": null,
	          "email": "admin_pune_2@logituit.com",
	          "name": "admin two"
	        },
	        "primaryContact": {
	          "userId": "58d8ff6c3d72ed901a82baf0",
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
	      "phoneNo": null,
	      "email": "sneha.firodiya@logituit.com",
	      "employeeId": "1702",
	      "roleId": {
	        "_id": "58be7eaef468391000c13a5b",
	        "brandId": "58be7e37f468391000c13a57",
	        "role_type": "developer",
	        "isDeleted": 0,
	        "isActive": 1,
	        "feedbackReasons": [
	          "Speed Of Service",
	          "Communication",
	          "Knowledge",
	          "Attention to Details",
	          "Courtesy",
	          "Other"
	        ]
	      },
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
	    }
	  ]
	}
 * @apiError (Errors - code) {Object} 800 employees not found for parameters.
 * @apiError (Errors - code) {Object} 999 All other unhandled errors.
 */

// GET API For fetching employee profiles
router.get(['/', '/:empId'], function (req, res) {
	var message = utils.messageFactory();
	var searchParams = req.query || {};

	var empUniqId = req.params['empId'] || null;

	//if (empUniqId === null && req.userData && userRoleService.USER_ROLES[req.userData.role_id._id] !== roleConstants["SA"]) {
		if(false) {
		// logger.error("Employee Fetch: Employee ID is absent in request.");
		// utils.throwError(true, error.E0309, 200, error.E0309);
	} else {
		employeeService.fetchEmployeeProfiles(searchParams, empUniqId)
		.then (function success(result) {
			if (result && result.length > 0) {
				message.displayMessage = display.D0403;
				message.data = result;
				utils.jsonWriter(message, 200, res);
			} else {
				var err = 800;
				var errorMessage = error.E0409;
				var displayMessage = error.E0410;
				var data = [];
				utils.throwError(err, errorMessage, 200, displayMessage, data, res);
			}
		}, function failure(err) {
			logger.error("employee fetch: Error in searching employee in database: " + err);
			utils.throwError(999, err.message, 200, error.E0411, null, res);
		});
	};
});

router.put('/:empId', function (req, res) {
	var message = utils.messageFactory();
	var empUniqId = req.params['empId'] || null;
	var employeeDetails = req.reqBody || null;	// employee details data in POST Request body

	var parentId = req.userRelation ? req.userRelation.id : null;

	employeeService.updateEmployeeProfile(employeeDetails, empUniqId)
	.then(function success(empResult) {
		message.displayMessage = display.D0404.replace("<fullName>", empResult.fullName.full);
		message.data = empResult;
		utils.jsonWriter(message, 200, res);
	}, function failure (err) {
		if(err.code == 777) {
			logger.error("Employee Update: Error in updating employee: " + err);
			utils.throwError(999, error.E0417, 200, error.E0417, null, res);
		}
		else if(err.code == 778){
			logger.error("Employee Update: Error in updating employee: " + err);
			utils.throwError(999, error.E0418, 200, error.E0418, null, res);
		}
		else if(err.code == 779){
			logger.error("Employee Update: Error in updating employee: " + err);
			utils.throwError(999, error.E0419, 200, error.E0419, null, res);
		}
		else if(err.code == 780){
			logger.error("Employee Update: Error in updating employee: " + err);
			utils.throwError(999, error.E0422, 200, error.E0422, null, res);
		} else if(err.code == 781){
			logger.error("Employee Update: Error in updating employee: " + err);
			utils.throwError(999, error.E0424, 200, error.E0424, null, res);
		} else if(err.code == 782){
			logger.error("Employee Update: Error in updating employee: " + err);
			utils.throwError(999, error.E0424, 200, error.E0424, null, res);
		} else {
			logger.error("Employee Update: Error in updating employee: " + err);
			utils.throwError(999, error.E0412, 200, error.E0412, null, res);
		}
	});
});

// POST API - For Employee deletion
router.delete(['/'], function (req, res) {
	var message = utils.messageFactory();

	var employeeDetails = req.reqBody || null;	// employee Id to delete
	
	var employeeIds = [];
	employeeDetails.empIds.forEach(function(element, index){
		employeeIds.push(mongoose.mongo.ObjectId(element));
	});

	employeeService.deleteEmployee(employeeIds)
	.then(function success(result) {
		if(result.s.bulkResult.ok == 1) {
			message.displayMessage = display.D0405;
		} else {
			message.displayMessage = display.D0406;
		}
		utils.jsonWriter(message, 200, res);
	}, function failure (err) {
		logger.error("Employee deletion: Error in deleting employee: " + err);
		utils.throwError(999, err.message, 200, error.E0413, null, res);
	});
});
// exports section
module.exports = router;