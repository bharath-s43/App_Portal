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
var userRoleService = require('../../services/user-role-service');
var error = require('../../util/error-message').error;
var display = require('../../util/display-message').display;
var customerService = require('../../services/customer-service');


// POST API - For customer Registration
router.post(['/'], function (req, res) {
	var message = utils.messageFactory();

	var customerDetails = req.reqBody || null;	// customer details data in POST Request body

	var custName = customerDetails.name || null;
	customerService.checkCustomer(custName)	// check customer if already exists
	.then(function success(result) {
		if (result && result.length > 0) {	// if exists
			utils.throwError(true, error.E0101, 200, error.E0101, {"id": result[0]._id, "cid": result[0].cid}, res);
		} else {	// else save customer in db
			customerService.createCustomer(customerDetails)
			.then(function success(result) {
				message.displayMessage = display.D0101.replace("<customerName>", result.name);
				message.data = {"id": result._id, "cid": result.cid};
				utils.jsonWriter(message, 200, res);
			}, function failure (err) {
				if(err.code && err.code == 901) {
					logger.error("customer Registration: Error in registering customer: " + err);
					utils.throwError(999, error.E0014, 200, error.E0014, null, res);
				} else if(err.code && err.code == 902){
					logger.error("customer Registration: Error in registering customer: " + err);
					utils.throwError(999, error.E0015, 200, error.E0015, null, res);
				} else {
					logger.error("customer Registration: Error in registering customer: " + err);
					utils.throwError(999, err.message, 200, error.E0102, null, res);
				}
			});
		}
	}, function failure (err) {
		logger.error("customer Registration: Error in checking customer in database: " + err);
		utils.throwError(999, err.message, 200, error.E0102, null, res);
	});
});

 /**
 * @api {get} /customer Retrieve customers
 * @apiDescription This api retrieves customer information. If no parameter is provided all customers are returned.
 * If customer id is provided it retrieves specific customer with that customer id.
 * @apiName GetCustomers
 * @apiGroup Customers
 * @apiHeader {String} Authorization user jwt authorization header
 * @apiParam {-} no-param retrieve all customers.<br> eg - https://applause-dev.appspot.com/api/v1/customer
 * @apiParam {api-parameter} /:custId retrieve customer based on customer id.<br> eg - https://applause-dev.appspot.com/api/v1/customer/42ffffwrwer2344
 * @apiSuccessExample {json} Success-Response:
 {
  "code": 0,
  "errorMessage": "",
  "displayMessage": "Customer details fetched successfully.",
  "data": [
    {
      "_id": "58be7e08f468391000c13a55",
      "cid": 226,
      "name": "Emtarang",
      "add": "banglore",
      "brands": [
        {
          "id": "58be7e37f468391000c13a57",
          "bid": 165
        }
      ],
      "adminContact": {
        "userId": {
          "verificationStatus": "PV",
          "emailVerified": 0,
          "id": "58d8f74d3d72ed901a82baea"
        },
        "contactNo": null,
        "email": "gaurav.bora@logituit.com",
        "name": "Gaurav bora"
      },
      "primaryContact": {
        "userId": {
          "verificationStatus": "PV",
          "emailVerified": 0,
          "id": "58d8f74d3d72ed901a82baeb"
        },
        "contactNo": null,
        "email": "pratik.kale@logituit.com",
        "name": "Pratik Kale"
      },
      "id": "58be7e08f468391000c13a55"
    }
  ]
}
 * @apiError (Errors - code) {Object} true customer not found for parameters.
 * @apiError (Errors - code) {Object} 999 All other unhandled errors.
 */
router.get(['/', '/:custId'], function (req, res) {
	var message = utils.messageFactory();
	var searchParams = req.query || [];

	if(req.params) {
		var custId = req.params['custId'] || null;
	} else {
		var custId = null;
	}
	
	if (req.userData && userRoleService.USER_ROLES[req.userData.role_id._id] !== roleConstants["SA"]) {
		// logger.error("Customer Fetch: Customer ID is absent in request.");
		// utils.throwError(true, error.E0107, 200, error.E0107, null, res);
		if (Object.keys(searchParams).length !== 0) {
			for (var key in searchParams) {
				if (req.searchParams[key]) {
					searchParams[key] = req.searchParams[key];
				};
			};
		} else { 
			searchParams = req.searchParams;
		}
	};

	customerService.fetchCustomerDetails(searchParams, custId)
	.then (function success(result) {
		if (result && result.length > 0) {
			message.displayMessage = display.D0102;
			message.data = result;
			utils.jsonWriter(message, 200, res);
		} else {
			var err = true;
			var data = [];
			utils.throwError(err, error.E0103, 200, error.E0103, data, res);
		}
	}, function failure(err) {
		logger.error("customer fetch: Error in searching customer in database: " + err);
		utils.throwError(999, error.E0104, 200, error.E0104, null, res);
	});
});

// DELETE API - For customer deletion
router.delete(['/'], function (req, res) {
	var message = utils.messageFactory();

	var custDetails = req.reqBody || null;
	// var customerDetails = req.reqBody || null;	// location Id to delete

	var customerIds = [];
	custDetails.customerIds.forEach(function(element, index){
		customerIds.push(mongoose.mongo.ObjectId(element));
	});

	customerService.deleteCustomer(customerIds)
	.then(function success(result) {
		if(result && result.customersDeleted) {
			message.displayMessage = display.D0103;
		} else {
			message.displayMessage = display.D0104;
		}
		utils.jsonWriter(message, 200, res);
	}, function failure (err) {
		logger.error("Customer Deletion: Error in deleteing customer: " + err);
		utils.throwError(true, error.E0105, 500, error.E0105, null, res);
	});
});

// PUT API - For customer updation
router.put('/:custId', function (req, res) {
	var message = utils.messageFactory();
	if(req.params) {
		var custUniqId = req.params['custId'] || null;
	} else {
		var custUniqId = null;
	}
	
	// customer in request matching with customer in jwt token
	if ((req.userData && userRoleService.USER_ROLES[req.userData.role_id._id] == roleConstants["SA"])||(custUniqId === req.searchParams['custId'])) {
		var customerDetails = req.reqBody || null;	// customer details data in PUT Request body
		var custName = customerDetails.name || null;
		var customerId = customerDetails.id;
		
		customerService.checkCustomer(custName)	// check customer if already exists
		.then(function success(result) {
			if (result && result.length && result[0].id != customerId) {	// if exists
				utils.throwError(true, error.E0101, 200, error.E0101, {"id": result._id, "cid": result.cid}, res);
			} else {	// else update customer in db
				customerService.updateCustomer(customerDetails, custUniqId)
				.then(function success(custResult) {
					message.displayMessage = display.D0105.replace("<customerName>", custResult.name);
					message.data = {"id": custResult._id, "cid": custResult.cid};
					utils.jsonWriter(message, 200, res);
				}, function failure (err) {
					if(err.code && err.code == 901) {
						logger.error("customer Update: Error in updating customer: " + err);
						utils.throwError(999, error.E0014, 200, error.E0014, null, res);
					} else if(err.code && err.code == 902){
						logger.error("customer Update: Error in updating customer: " + err);
						utils.throwError(999, error.E0015, 200, error.E0015, null, res);
					} else {
						logger.error("Customer Update: Error in updating customer: " + err);
						utils.throwError(999, error.E0106, 500, error.E0106, null, res);
					}
				});
			};
		}, function failure (err) {
			logger.error("Customer updation: Error in checking customer in database: " + err);
			utils.throwError(999, err.message, 200, error.E0102, null, res);
		});
	} else {
		var errMsg = "Customer Update: Customer not allowed to update different custoemr.";	
		logger.error(errMsg);
		utils.throwError(999, errMsg, 403, error.E0906.replace(/<entity>/g, req.userRelation.key), null, res);
	};
});


// exports section
module.exports = router;