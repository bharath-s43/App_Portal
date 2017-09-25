// import npm packages
var Q = require('q');
// import files
var logger = require('../util/log').get();
var utils = require('../util/utils');

// models
var locModel = require('../models/location-model');

// services
var imageService = require('./image-service');
var employeeService = require('./employee-service');
var inviteService = require('./invite-service');
var userRoleService = require('./user-role-service');
var userService = require('./user-service');

// POST location operation to create a new location
var createLocation = function (locDetails) {
	var deferred = Q.defer();

	if (validateLocDetails(locDetails)) {
		
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
					if(locDetails.custId) {
						relationIdsToCheck.push(locDetails.custId);
					}

					if(locDetails.brandId) {
						relationIdsToCheck.push(locDetails.brandId);
					}

					inviteService.createContactUser(locDetails, userRoleService.getIdfromRole('loc'), relationIdsToCheck)
					.then(function (updatedLocDetails) {
						locDetails = updatedLocDetails;
						next();
					}, function (err) {
						logger.error(err.message);
						deferred.reject(err);
					});
				}
			)
			.then(function (next) {
					if (locDetails.img) {
						imageService.uploadImage(locDetails.img, locDetails.img_type, "loc")
						.then(function (imgPath) {
							next(imgPath);
						}, function (err) {
							var err = new Error("Location Creation: Error uploading Image !!!");
							logger.error(err.message);
							deferred.reject(err);
						});
					} else {
						next(null);
					}
				}
			)
			.then(function (next, imgPath) {
					if ((locDetails.img && imgPath) || !locDetails.img) {
						locDetails.img = imgPath;
						locModel.createLocation(locDetails)
						.then(function success(result) {

							//Update contact user relation
							if(locDetails.newCreatedUserIds.length) {
								var userRelation = {};
								userRelation.id = result.id;
								userRelation.key = "location";
								inviteService.updateContactRelation(locDetails.newCreatedUserIds, userRelation);
							}

							deferred.resolve(result);
						}, function failure(err) {
							logger.error("Location creation: Location details save failure: " + err);
							deferred.reject(err);
						});
					} else {
						var err = new Error("Location Image Upload failed !!!");
						logger.error(err);
						deferred.reject(err);
					}
				}
			)
		}('undefined' !== typeof exports && exports || new Function('return this')()));
	} else {
		var err = new Error("location details validation failed !!!");
		logger.error(err);
		deferred.reject(err);
	};

	return deferred.promise;
};

// Validating location details send in requests
var validateLocDetails = function (locDetails) {
	if (!locDetails.custId || !locDetails.brandId || !locDetails.name || !(locDetails.add || (locDetails.lat && locDetails.lng))) {
		return(false);
	} else {
		return(true);
	}
};


// Fetch operations for employee profiles
var fetchLocationDetails = function (searchParams, locId) {
	var deferred = Q.defer();

	locModel.fetchLocationDetails(searchParams, locId)
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
		logger.error("Location Fetch: Location fetch details failure: " + err);
		deferred.reject(err);
	});

	return deferred.promise;
};

var deleteLocation = function (locationIds) {
	var deferred = Q.defer();

	var deleteResult = {};
	deleteResult.locationsDeleted = false;
	deleteResult.employeesDeleted = false;

	(function (exports) {
		  'use strict';
		 
		  var Sequence = exports.Sequence || require('sequence').Sequence
		    , sequence = Sequence.create()
		    , err
		    ;

		/* Using sequence package to make callback sync for maintaining atomic DB transactions */
		sequence
			.then(function (next) {
					locModel.deleteLocation(locationIds)
					.then (function success(deleteLocationResult) {
						deleteResult.locationsDeleted = true;
						next(deleteLocationResult);
					}, function failure(err) {
						logger.error("Location Delete: Location delete failure: " + err);
						deferred.reject(err);
					});
				}
			)
			.then(function (next, deleteLocationResult) {

				var employeeIds = [];
				var userIds = [];

				deleteLocationResult.forEach(function(element, index) {
					if(element.adminContact && element.adminContact.userId) {
						userIds.push(element.adminContact.userId);
					}

					if(element.primaryContact && element.primaryContact.userId) {
						userIds.push(element.primaryContact.userId);
					}
					if(element.employees.length) {
						element.employees.forEach(function (elementEmp, indexEmp){
							employeeIds.push(elementEmp.id);
						});
					}
				});

				//Delete contact user from users.
				userService.deteteUser(userIds, 'location');

				if(employeeIds && employeeIds.length) {
					employeeService.deleteEmployee(employeeIds)
					.then (function success(deleteEmployeesResult) {
						deleteResult.employeesDeleted = true;
						deferred.resolve(deleteResult);
					}, function failure(err) {
						logger.error("Location Delete: employee delete failure: " + err);
						deferred.resolve(deleteResult);
					});
				} else {
					deleteResult.employeesDeleted = true;
					deferred.resolve(deleteResult);
				}
			}
			)
		}('undefined' !== typeof exports && exports || new Function('return this')()));

	return deferred.promise;
};

// Update location details
var updateLocation = function (locDetails, locUniqId) {
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
					if(locDetails.customer && locDetails.customer.id) {
						relationIdsToCheck.push(locDetails.customer.id);
					}

					if(locDetails.brand && locDetails.brand.id) {
						relationIdsToCheck.push(locDetails.brand.id);
					}

					if(locDetails.id) {
						relationIdsToCheck.push(locDetails.id);
					}

					inviteService.createContactUser(locDetails, userRoleService.getIdfromRole('loc'), relationIdsToCheck)
					.then(function (updatedLocDetails) {
						locDetails = updatedLocDetails;
						next();
					}, function (err) {
						logger.error(err.message);
						deferred.reject(err);
					});
				}
			)
			.then(function (next) {
					if (locDetails.img) {
						imageService.uploadImage(locDetails.img, locDetails.img_type, "loc")
						.then(function (imgPath) {
							next(imgPath);
						}, function (err) {
							var err = new Error("Location Update: Error uploading Image !!!");
							logger.error(err.message);
							deferred.reject(err);
						});
					} else {
						next(null);
					}
					
				}
			)
			.then(function (next, imgPath) {
					if(imgPath) {
						locDetails.img = imgPath;
					}
					locModel.updateLocation(locDetails, locUniqId)
					.then(function success(result) {

						if(locDetails.newCreatedUserIds.length) {
							var userRelation = {};
							userRelation.id = result.id;
							userRelation.key = "location";
							inviteService.updateContactRelation(locDetails.newCreatedUserIds, userRelation);
						}

						if(locDetails.oldUserIds && locDetails.oldUserIds.length) {
							//Delete old contact user from users.
							userService.deteteUser(locDetails.oldUserIds, 'location');
						}

						deferred.resolve(result);
					}, function failure(err) {
						logger.error("Location updating: Location update failure: " + err);
						deferred.reject(err);
	 				});	
				}
			)
		}('undefined' !== typeof exports && exports || new Function('return this')()));
	
	return deferred.promise;
};

// check if location already exists in db
var checkLocation = function (locName, locBrand, locUniqId) {
	var deferred = Q.defer();

	locModel.checkLocation(locName, locBrand, locUniqId)
	.then(function success(result) {
		deferred.resolve(result);
	}, function failure(err) {
		logger.error("Location registration: Location check failure: " + err);
		deferred.reject(err);
	});

	return deferred.promise;
};

// DELETE primary / admin contact details
var deleteAdminUsers = function (userIds) {
	var deferred = Q.defer();

	locModel.deleteAdminUsers(userIds)
		.then(function success(result) {
			deferred.resolve(result);
		}, function failure(err) {
			logger.error("Location admins deletion failure: " + err);
			deferred.reject(err);
		});

	return deferred.promise;
};


// exports section 
exports.createLocation = createLocation;
exports.fetchLocationDetails = fetchLocationDetails;
exports.deleteLocation = deleteLocation;
exports.updateLocation = updateLocation;
exports.checkLocation = checkLocation;
exports.deleteAdminUsers = deleteAdminUsers;