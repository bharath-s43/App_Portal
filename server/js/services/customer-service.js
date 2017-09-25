// import npm packages
var Q = require('q');
// import files
var logger = require('../util/log').get();
var utils = require('../util/utils');
var siteBase = utils.getConstants().SERVER_PATH;

// models
var customerModel = require('../models/customer-model');

// services
var brandService = require('./brand-service');
var userService = require('./user-service');
var mailService = require('./mail-service');
var inviteService = require('./invite-service');
var userRoleService = require('./user-role-service');


// // POST User operation to register / save user
// var createCustomer = function (customerDetails) {
// 	var deferred = Q.defer();

// 	if (validateCustomerDetails(customerDetails)) {
// 		customerModel.createCustomer(customerDetails)
// 		.then(function success(result) {
// 			var primaryContactEmail = result.primaryContact.email;
// 			var adminContactEmail = result.adminContact.email;
// 			deferred.resolve(result);
// 		}, function failure(err) {
// 			logger.error("Customer registration: Customer save failure: " + err);
// 			deferred.reject(err);
// 		});
// 	} else {
// 		var err = new Error("customer details validation failed !!!");
// 		logger.error(err);
// 		deferred.reject(err);
// 	};

// 	return deferred.promise;
// };

var createCustomer = function (customerDetails) {
	var deferred = Q.defer();

	(function (exports) {
	  'use strict';
	 
	  var Sequence = exports.Sequence || require('sequence').Sequence
	    , sequence = Sequence.create()
	    , err
	    ;

	/* Using sequence package to make callback sync for maintaining atomic DB transactions */
	sequence
		.then(function (next) {
					var relationIdsToCheck = [];
					inviteService.createContactUser(customerDetails, userRoleService.getIdfromRole('cust'), relationIdsToCheck)
					.then(function (updatedCustomerDetails) {
						customerDetails = updatedCustomerDetails;
						next(customerDetails);
					}, function (err) {
						logger.error(err);
						deferred.reject(err);
					});
				}
		)
		.then(function (next) {
				if (validateCustomerDetails(customerDetails)) {
					customerModel.createCustomer(customerDetails)
					.then(function success(result) {
						var primaryContactEmail = result.primaryContact.email;
						var adminContactEmail = result.adminContact.email;

						//Update contact user relation
						if(customerDetails.newCreatedUserIds.length) {
							var userRelation = {};
							userRelation.id = result.id;
							userRelation.key = "customer";
							inviteService.updateContactRelation(customerDetails.newCreatedUserIds, userRelation);
						}

						deferred.resolve(result);
					}, function failure(err) {
						logger.error("Customer registration: Customer save failure: " + err);
						deferred.reject(err);
					});
				} else {
					var err = new Error("customer details validation failed !!!");
					logger.error(err);
					deferred.reject(err);
				};
			}
		)
	}('undefined' !== typeof exports && exports || new Function('return this')()));

	return deferred.promise;
};

// check if user already exists in db
var checkCustomer= function (custName, customerId) {
	var deferred = Q.defer();

	customerModel.checkCustomer(custName, customerId)
	.then(function success(result) {
		deferred.resolve(result);
	}, function failure(err) {
		logger.error("Customer registration: Customer check failure: " + err);
		deferred.reject(err);
	});

	return deferred.promise;
}

// Validating user details send in requests
var validateCustomerDetails = function (customerDetails) {
	if (!customerDetails || !customerDetails.name 
		// || !customerDetails.primaryContact || !customerDetails.adminContact
		// || !customerDetails.primaryContact.name || !customerDetails.primaryContact.email 
		// || !customerDetails.adminContact.name || !customerDetails.adminContact.email 
		//|| !customerDetails.add
		) {
		return(false);
	} else {
		return(true);
	}
};

var fetchCustomerDetails = function (searchParams, custId) {
	var deferred = Q.defer();

	customerModel.fetchCustomerDetails(searchParams, custId)
	.then (function success(result) {
		result.forEach(function (element, index) {
			if(element.adminContact && element.adminContact.userId && element.adminContact.userId.inviteSentAt && element.adminContact.userId.verificationStatus === "IS") {
				var diffInHours = utils.getTimeDiffInHours(element.adminContact.userId.inviteSentAt, new Date())
				if(diffInHours > 48) {
					element.adminContact.userId.verificationStatus = "NA"; //Not Accepted status
				}
			}
			if(element.primaryContact && element.primaryContact.userId && element.primaryContact.userId.inviteSentAt && element.primaryContact.userId.verificationStatus === "IS") {
				var diffInHours = utils.getTimeDiffInHours(element.primaryContact.userId.inviteSentAt, new Date())
				if(diffInHours > 48) {
					element.primaryContact.userId.verificationStatus = "NA"; //Not Accepted status
				}
			}
		});
		deferred.resolve(result);
	}, function failure(err) {
		logger.error("Customer Fetch: Customer fetch details failure: " + err);
		deferred.reject(err);
	});

	return deferred.promise;
};

var deleteCustomer = function (customerIds) {
	var deferred = Q.defer();

	var deleteResult = {};
	deleteResult.customersDeleted = false;
	deleteResult.brandsDeleted = false;

	(function (exports) {
		  'use strict';
		 
		  var Sequence = exports.Sequence || require('sequence').Sequence
		    , sequence = Sequence.create()
		    , err
		    ;

		/* Using sequence package to make callback sync for maintaining atomic DB transactions */
		sequence
			.then(function (next) {
					customerModel.deleteCustomer(customerIds)
					.then (function success(deleteCustomerResult) {
						deleteResult.customersDeleted = true;
						next(deleteCustomerResult);
					}, function failure(err) {
						logger.error("Customer Delete: Customer delete failure: " + err);
						deferred.reject(err);
					});
				}
			)
			.then(function (next, deleteCustomerResult) {

				var brandIds = [];
				var userIds = [];
				deleteCustomerResult.forEach(function(element, index) {
					if(element.adminContact && element.adminContact.userId) {
						userIds.push(element.adminContact.userId);
					}

					if(element.primaryContact && element.primaryContact.userId) {
						userIds.push(element.primaryContact.userId);
					}
		
					if(element.brands.length) {
						element.brands.forEach(function (elementBrand, indexBrand){
							brandIds.push(elementBrand.id);
						});
					}
				});
				
				//Delete contact user from users.
				userService.deteteUser(userIds, 'customer');

				if(brandIds && brandIds.length) {
					brandService.deleteBrand(brandIds)
					.then (function success(deleteBrandResult) {

						deleteResult.brandsDeleted = true;

						deferred.resolve(deleteResult);
					}, function failure(err) {
						logger.error("Customer Delete: Brands delete failure: " + err);
						deferred.resolve(deleteResult)
					});
				} else {
					deleteResult.brandsDeleted = true;
					deferred.resolve(deleteResult);
				}
			}
			)
		}('undefined' !== typeof exports && exports || new Function('return this')()));

	return deferred.promise;
}

// Update customer
var updateCustomer = function (customerDetails, custUniqId) {
	var deferred = Q.defer();

	(function (exports) {
		  'use strict';
		 
		  var Sequence = exports.Sequence || require('sequence').Sequence
		    , sequence = Sequence.create()
		    , err
		    ;

		/* Using sequence package to make callback sync for maintaining atomic DB transactions */
		sequence
			.then(function (next) {
					var relationIdsToCheck = [];
					if(customerDetails.id) {
						relationIdsToCheck.push(customerDetails.id);
					}

					inviteService.createContactUser(customerDetails, userRoleService.getIdfromRole('cust'), relationIdsToCheck)
					.then(function (updatedCustomerDetails) {
						customerDetails = updatedCustomerDetails;
						next();
					}, function (err) {
						logger.error(err.message);
						deferred.reject(err);
					});
				}
			)
			.then(function (next) {
					customerModel.updateCustomer(customerDetails, custUniqId)
					.then(function success(result) {

						if(customerDetails.newCreatedUserIds && customerDetails.newCreatedUserIds.length) {
							var userRelation = {};
							userRelation.id = result.id;
							userRelation.key = "customer";
							inviteService.updateContactRelation(customerDetails.newCreatedUserIds, userRelation);
						}

						if(customerDetails.oldUserIds && customerDetails.oldUserIds.length) {
							//Delete old contact user from users.
							userService.deteteUser(customerDetails.oldUserIds, 'customer');
						}

						deferred.resolve(result);
					}, function failure(err) {
						logger.error("Customer updating: Customer update failure: " + err);
						deferred.reject(err);
					});		
				}
			)
		}('undefined' !== typeof exports && exports || new Function('return this')()));
	
	return deferred.promise;
};

// DELETE primary / admin contact details
var deleteAdminUsers = function (userIds) {
	var deferred = Q.defer();

	customerModel.deleteAdminUsers(userIds)
		.then(function success(result) {
			deferred.resolve(result);
		}, function failure(err) {
			logger.error("Customer admins deletion failure: " + err);
			deferred.reject(err);
		});

	return deferred.promise;
};

// exports section 
exports.createCustomer = createCustomer;
exports.checkCustomer = checkCustomer;
exports.fetchCustomerDetails = fetchCustomerDetails;
exports.deleteCustomer = deleteCustomer;
exports.updateCustomer = updateCustomer;
exports.deleteAdminUsers = deleteAdminUsers;