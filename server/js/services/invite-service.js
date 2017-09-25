// import npm packages
var Q = require('q');
// import files
var logger = require('../util/log').get();
var utils = require('../util/utils');
var userService = require('./user-service');
var userModel = require('../models/user-models');
var mailService = require('./mail-service');
var forEachAsync = require('forEachAsync');

var verifyContactEmail = function(email, userId, siteBase) {
	var setPasswordLink = siteBase + "/#/setPassword?userId="+ userId;
	//Configure mail options
	var mailOptions = {};
	mailOptions.to = email;
	mailOptions.subject = "Applause Activation";
	mailOptions.template = "setPassword";
	mailOptions.context = {};
	mailOptions.context.activationLink = setPasswordLink;
	//send email
	mailService.sendMail(mailOptions);
}

var inviteEmail = function(contactDetails, siteBase) {
	var deferred = Q.defer();

	userService.checkEmailUser(contactDetails)
	.then(function success(result) {
		if(result && result.email && result.id) {
			verifyContactEmail(result.email, result.id, siteBase);
			deferred.resolve(result);
		}
	}, function failure(err) {
		logger.error("Invite User: User check failure: " + err);
		deferred.reject(err);
	});

	return deferred.promise;
}

var inviteEmailBulk = function(contactDetails, siteBase) {
	var deferred = Q.defer();

	var response = {};
		response.emailSent = 0;
		response.emailFailed = 0;
		response.alreadyVerified = 0;
	// waits for one request to finish before beginning the next 
	forEachAsync.forEachAsync(contactDetails.emailIds, function (nextForEach, element, index, array) {
		var details = {};
		details.email = element;

		(function (exports) {
		  'use strict';
		 
		  var Sequence = exports.Sequence || require('sequence').Sequence
		    , sequence = Sequence.create()
		    , err
		    ;

		/* Using sequence package to make callback sync for maintaining atomic DB transactions */
		sequence
			.then(function (nextSeq) {
					userService.checkEmailUser(details)
					.then(function success(result) {
						if(result && result.email && result.id && !result.emailVerified) {
							verifyContactEmail(result.email, result.id);
							response.emailSent = response.emailSent + 1;
							nextSeq();
						} else {
							if(result && result.email && result.id && result.emailVerified) {
								response.alreadyVerified = response.alreadyVerified + 1;
							} else {
								response.emailFailed = response.emailFailed + 1;
							}
							nextForEach();
						}
					}, function failure(err) {
						response.emailFailed = response.emailFailed + 1;
						nextForEach();
					});
				}
			)
			.then(function (nextSeq) {
					userService.setEmailSent(details)
					.then(function success(result) {
						nextForEach();
					}, function failure(err) {
						response.emailFailed = response.emailFailed + 1;
						nextForEach();
					});
				}
			)
		}('undefined' !== typeof exports && exports || new Function('return this')()));

	}).then(function () {
		deferred.resolve(response);
	});

	return deferred.promise;
}

var createContactUser = function (contactDetails, role, relationIdsToCheck) {
	var deferred = Q.defer();

	var contactUserFlag = 1;

	var newCreatedUserIds = [];
	var oldUserIds = [];

	(function (exports) {
	  'use strict';
	 
	  var Sequence = exports.Sequence || require('sequence').Sequence
	    , sequence = Sequence.create()
	    , err
	    ;

	/* Using sequence package to make callback sync for maintaining atomic DB transactions */
	sequence
		.then(function (next) {
				var userDetailsAdmin = {};
				var registerFlag = {};
				registerFlag.admin = false;
				registerFlag.primary = false;
				if(contactDetails.adminContact && contactDetails.adminContact.email) {
					userDetailsAdmin.email = contactDetails.adminContact.email;
					//check Admin Contact Email
					userService.checkEmailUser(userDetailsAdmin)
					.then(function (result) {
						if(!result) {
							registerFlag.admin = true;
							next(registerFlag, userDetailsAdmin);
						} else {
							if(relationIdsToCheck.length && result.userRelation && relationIdsToCheck.includes(result.userRelation.id.toString())) {
								if(contactDetails.adminContact && contactDetails.adminContact.userId && contactDetails.adminContact.userId.id) {
									if(contactDetails.adminContact.userId.id != result._id) {
										oldUserIds.push(contactDetails.adminContact.userId.id)
									}

								}
								contactDetails.adminContact.userId = result._id;
								next(registerFlag, userDetailsAdmin);
							} else {
								var err = new Error("Create contact admin: email already present");
								err.code = 901;
								logger.error(err.message);
								deferred.reject(err);
							}
						}
					}, function (err) {
						var err = new Error("Create Customer: Error in getting admin user !!!");
						logger.error(err.message);
						deferred.reject(err);
					});
				} else {
					if(contactDetails.adminContact && contactDetails.adminContact.userId && contactDetails.adminContact.userId.id) {
						oldUserIds.push(contactDetails.adminContact.userId.id);
						contactDetails.adminContact.email = null;
						contactDetails.adminContact.userId = null;
					}
					next(registerFlag, userDetailsAdmin);
				}
			}
		)
		.then(function (next, registerFlag, userDetailsAdmin) {
				var userDetailsPrimary = {};

				if(contactDetails.primaryContact && contactDetails.primaryContact.email) {
					userDetailsPrimary.email = contactDetails.primaryContact.email;

					//check Primary Contact Email
					userService.checkEmailUser(userDetailsPrimary)
					.then(function (result) {
						if(!result) {
							registerFlag.primary = true;
							next(registerFlag, userDetailsAdmin, userDetailsPrimary);
						} else {
							if(relationIdsToCheck.length && result.userRelation && relationIdsToCheck.includes(result.userRelation.id.toString())) {
								if(contactDetails.primaryContact && contactDetails.primaryContact.userId && contactDetails.primaryContact.userId.id) {
									if(contactDetails.primaryContact.userId.id != result._id) {
										oldUserIds.push(contactDetails.primaryContact.userId.id)
									}

								}
								contactDetails.primaryContact.userId = result._id;
								next(registerFlag, userDetailsAdmin, userDetailsPrimary);
							} else {
								var err = new Error("Create contact admin: email already present");
								err.code = 902;
								logger.error(err.message);
								deferred.reject(err);
							}
						}
					}, function (err) {
						var err = new Error("Create Customer: Error in getting primary user !!!");
						logger.error(err.message);
						deferred.reject(err);
					});
				} else {
					if(contactDetails.primaryContact && contactDetails.primaryContact.userId && contactDetails.primaryContact.userId.id) {
						oldUserIds.push(contactDetails.primaryContact.userId.id);
						contactDetails.primaryContact.email = null;
						contactDetails.primaryContact.userId = null;
					}
					next(registerFlag, userDetailsAdmin, userDetailsPrimary);
				}
			}
		)
		.then(function (next, registerFlag, userDetailsAdmin, userDetailsPrimary) {
				if(registerFlag.admin) {
					userDetailsAdmin.regType = "EMAIL";
					userDetailsAdmin.roleId = role;
					userDetailsAdmin.personalInfo = {};
					userDetailsAdmin.personalInfo.fullName = contactDetails.adminContact.name;
					userService.saveUser(userDetailsAdmin, 1)
					.then(function (result) {
						if(contactDetails.adminContact && contactDetails.adminContact.userId && contactDetails.adminContact.userId.id) {
							if(contactDetails.primaryContact.userId != contactDetails.adminContact.userId.id) {
								//If admin contact is different than primary and changed then only delete old
								oldUserIds.push(contactDetails.adminContact.userId.id);
							}
						}

						contactDetails.adminContact.userId = result._id;
						newCreatedUserIds.push(result._id);
						next(registerFlag, userDetailsAdmin, userDetailsPrimary);
					}, function (err) {
						var err = new Error("Create User: Error in creating user for admin contact !!!");
						logger.error(err.message);
						deferred.reject(err);
					});
				} else {
					next(registerFlag, userDetailsAdmin, userDetailsPrimary);
				}
			}
		)
		.then(function (next, registerFlag, userDetailsAdmin, userDetailsPrimary) {
				if(registerFlag.primary && (userDetailsAdmin.email != userDetailsPrimary.email)) {
					userDetailsPrimary.regType = "EMAIL";
					userDetailsPrimary.roleId = role;
					userDetailsPrimary.personalInfo = {};
					userDetailsPrimary.personalInfo.fullName = contactDetails.primaryContact.name;
					userService.saveUser(userDetailsPrimary, 1)
					.then(function (result) {
						if(contactDetails.primaryContact && contactDetails.primaryContact.userId && contactDetails.primaryContact.userId.id) {
							if(contactDetails.adminContact.userId != contactDetails.primaryContact.userId.id) {
								//If primary contact is different than admin and changed then only delete old
								oldUserIds.push(contactDetails.primaryContact.userId.id);
							}
						}

						contactDetails.primaryContact.userId = result._id;
						newCreatedUserIds.push(result._id);
						contactDetails.newCreatedUserIds = newCreatedUserIds;
						contactDetails.oldUserIds = oldUserIds;
						deferred.resolve(contactDetails);
					}, function (err) {
						var err = new Error("Create User: Error in creating user for primary contact !!!");
						logger.error(err.message);
						deferred.reject(err);
					});
				} else {
					if(contactDetails.primaryContact && contactDetails.primaryContact.userId && contactDetails.primaryContact.userId.id) {
						if(oldUserIds.includes(contactDetails.primaryContact.userId.id.toString())) {
							oldUserIds = [];
						}
					}
					if(userDetailsPrimary.email && userDetailsAdmin.email && userDetailsPrimary.email == userDetailsAdmin.email) {
						contactDetails.primaryContact.userId = contactDetails.adminContact.userId
					}
					contactDetails.newCreatedUserIds = newCreatedUserIds;
					contactDetails.oldUserIds = oldUserIds;
					deferred.resolve(contactDetails);
				}
			}
		)
	}('undefined' !== typeof exports && exports || new Function('return this')()));

	return deferred.promise;
};

var updateContactRelation = function(userIds, userRelation){
	var deferred = Q.defer();

	userModel.updateContactRelation(userIds, userRelation)
	.then(function (result){
		deferred.resolve(result);
	}, function(err){
		logger.error("Update contact relation: Error in updating contact relation." + err);
		deferred.reject(err);
	});

	return deferred.promise;
}

exports.verifyContactEmail = verifyContactEmail;
exports.inviteEmail = inviteEmail;
exports.inviteEmailBulk = inviteEmailBulk;
exports.createContactUser = createContactUser;
exports.updateContactRelation = updateContactRelation;