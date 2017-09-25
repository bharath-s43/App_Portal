// import npm packages
var Q = require('q');
var forEachAsync = require('forEachAsync');
// import files
var logger = require('../util/log').get();
var utils = require('../util/utils');
var env = require('../conf/config.js').env;
var brandImageUrl = require("../conf/v1/config-" + env +".js").const.CLOUD_IMAGE_URL + "brand_img/";
// models
var brandModel = require('../models/brand-model');

// services
var imageService = require('./image-service');
var locationService = require('./location-service');
var inviteService = require('./invite-service');
var userRoleService = require('./user-role-service');
var userService = require('./user-service');


// POST User operation to register / save user
var configureBrand = function (brandDetails) {
	var deferred = Q.defer();

	if (validateBrandDetails(brandDetails)) {

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
					if(brandDetails.custId) {
						relationIdsToCheck.push(brandDetails.custId);
					}
					inviteService.createContactUser(brandDetails, userRoleService.getIdfromRole('brand'), relationIdsToCheck)
					.then(function (updatedBrandDetails) {
						brandDetails = updatedBrandDetails;
						next();
					}, function (err) {
						logger.error(err.message);
						deferred.reject(err);
					});
				}
			)
			.then(function (next) {
					if(brandDetails.logo_img && brandDetails.img_type){
						imageService.uploadImage(brandDetails.logo_img, brandDetails.img_type, "brand")
						.then(function (imgPath) {
							next(imgPath);
						}, function (err) {
							var err = new Error("Brand Creation: Error uploading Image !!!");
							logger.error(err.message);
							deferred.reject(err);
						});
					} else {
						next(null);
					}
				}
			)
			.then(function (next, imgPath) {
					// if (imgPath) {
					// 	brandDetails.logo_img = imgPath;
					// } else {
					// 	var err = new Error("Brand Image Upload failed !!!");
					// 	logger.error(err);
					// 	deferred.reject(err);
					// }
					brandDetails.logo_img = imgPath;
					brandModel.configureBrand(brandDetails)
					.then(function success(result) {

						//Update contact user relation
						if(brandDetails.newCreatedUserIds.length) {
							var userRelation = {};
							userRelation.id = result.id;
							userRelation.key = "brand";
							inviteService.updateContactRelation(brandDetails.newCreatedUserIds, userRelation);
						}

						deferred.resolve(result);
					}, function failure(err) {
						logger.error("Brand configuration: Brand details save failure: " + err);
						deferred.reject(err);
					});
				}
			)
		}('undefined' !== typeof exports && exports || new Function('return this')()));
	} else {
		var err = new Error("Brand details validation failed !!!");
		logger.error(err);
		deferred.reject(err);
	};

	return deferred.promise;
};


// Validating brand details send in requests
// returns false - if validation fails
var validateBrandDetails = function (brandDetails) {
	if (!brandDetails.custId || !brandDetails.name //|| !brandDetails.logo_img 
		|| !brandDetails.ratingImgId 
		// || !brandDetails.primaryContact || !brandDetails.adminContact
		// || !brandDetails.primaryContact.name || !brandDetails.primaryContact.email
		// || !brandDetails.adminContact.name || !brandDetails.adminContact.email
		|| ((brandDetails.roles && brandDetails.roles.length >0) && !(validateBrandRoles(brandDetails.roles)))) {
		return(false);
	} else {
		return(true);
	}
};

// validation of roles configured for brand
// returns false - if validation fails
var validateBrandRoles = function (roles) {
	roles.forEach(function(element, index) {
		if (!element.role_type || !(element.feedbackReasons && element.feedbackReasons.length > 0)) {
			return (false);
		};
	});
	return (true);
};

// Fetch operations for brand profiles
var fetchBrandDetails = function (searchParams, brandId) {
	var deferred = Q.defer();

	brandModel.fetchBrandDetails(searchParams, brandId)
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
		logger.error("Brand Fetch: Brand fetch details failure: " + err);
		deferred.reject(err);
	});

	return deferred.promise;
};

var deleteBrand = function(brandIds, custId) {
	var deferred = Q.defer();

	var deleteResult = {};
	deleteResult.brandsDeleted = false;
	deleteResult.locationsDeleted = false;

	(function (exports) {
		  'use strict';
		 
		  var Sequence = exports.Sequence || require('sequence').Sequence
		    , sequence = Sequence.create()
		    , err
		    ;

		/* Using sequence package to make callback sync for maintaining atomic DB transactions */
		sequence
			.then(function (next) {
					brandModel.deleteBrand(brandIds, custId)
					.then (function success(deleteBrandResult) {
						deleteResult.brandsDeleted = true;
						next(deleteBrandResult);
					}, function failure(err) {
						logger.error("Brand Delete: Brand delete failure: " + err);
						deferred.reject(err);
					});
				}
			)
			.then(function (next, deleteBrandResult) {

				var locationIds = [];
				var userIds = [];

				deleteBrandResult.forEach(function(element, index) {

					if(element.adminContact && element.adminContact.userId) {
						userIds.push(element.adminContact.userId);
					}

					if(element.primaryContact && element.primaryContact.userId) {
						userIds.push(element.primaryContact.userId);
					}

					if(element.locations.length) {
						element.locations.forEach(function (elementLoc, indexLoc){
							locationIds.push(elementLoc.id);
						});
					}
				});

				//Delete contact user from users.
				userService.deteteUser(userIds, 'brand');

				if(locationIds && locationIds.length) {
					locationService.deleteLocation(locationIds)
					.then (function success(deleteLocationResult) {
						deleteResult.locationsDeleted = true;
						deferred.resolve(deleteResult);
					}, function failure(err) {
						logger.error("Brand Delete: Location delete failure: " + err);
						deferred.resolve(deleteResult);
					});
				} else {
					deleteResult.locationsDeleted = true;
					deferred.resolve(deleteResult);
				}
			}
			)
		}('undefined' !== typeof exports && exports || new Function('return this')()));

	return deferred.promise;
};

// Update brand details
var updateBrand = function (brandDetails, brandUniqId) {
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
					if(brandDetails.custId) {
						relationIdsToCheck.push(brandDetails.custId);
					}

					if(brandDetails.brandId && brandDetails.brandId.id) {
						relationIdsToCheck.push(brandDetails.brandId.id);
					}

					inviteService.createContactUser(brandDetails, userRoleService.getIdfromRole('brand'), relationIdsToCheck)
					.then(function (updatedBrandDetails) {
						brandDetails = updatedBrandDetails;
						next();
					}, function (err) {
						logger.error(err.message);
						deferred.reject(err);
					});
				}
			)
			.then(function (next) {
					if (brandDetails.logo_img && brandDetails.imageModifiedFlag) {
						imageService.uploadImage(brandDetails.logo_img, brandDetails.img_type, "brand")
						.then(function (imgPath) {
							next(imgPath);
						}, function (err) {
							var err = new Error("Brand Update: Error uploading Image !!!");
							logger.error(err.message);
							deferred.reject(err);
						});
					} else {
						next(brandDetails.logo_img);
					}
					
				}
			)
			.then(function (next, imgPath) {
					brandDetails.logo_img = imgPath;
					brandModel.updateBrand(brandDetails, brandUniqId)
					.then(function success(result) {

						if(brandDetails.newCreatedUserIds.length) {
							var userRelation = {};
							userRelation.id = result.id;
							userRelation.key = "brand";
							inviteService.updateContactRelation(brandDetails.newCreatedUserIds, userRelation);
						}

						if(brandDetails.oldUserIds && brandDetails.oldUserIds.length) {
							//Delete old contact user from users.
							userService.deteteUser(brandDetails.oldUserIds, 'brand');
						}

						deferred.resolve(result);
					}, function failure(err) {
						logger.error("Brand updating: Brand update failure: " + err);
						deferred.reject(err);
	 				});	
				}
			)
		}('undefined' !== typeof exports && exports || new Function('return this')()));
	
	return deferred.promise;
};

// check if brand already exists in db
var checkBrand= function (brandName, brandId) {
	var deferred = Q.defer();
	
	brandModel.checkBrand(brandName, brandId)
	.then(function success(result) {
		deferred.resolve(result);
	}, function failure(err) {
		logger.error("Brand registration: Brand check failure: " + err);
		deferred.reject(err);
	});

	return deferred.promise;
}

// DELETE primary / admin contact details
var deleteAdminUsers = function (userIds) {
	var deferred = Q.defer();

	brandModel.deleteAdminUsers(userIds)
		.then(function success(result) {
			deferred.resolve(result);
		}, function failure(err) {
			logger.error("Brand admins deletion failure: " + err);
			deferred.reject(err);
		});

	return deferred.promise;
};

// exports section 
exports.configureBrand = configureBrand;
exports.fetchBrandDetails = fetchBrandDetails;
exports.deleteBrand = deleteBrand;
exports.updateBrand = updateBrand;
exports.checkBrand = checkBrand;
exports.deleteAdminUsers = deleteAdminUsers;
