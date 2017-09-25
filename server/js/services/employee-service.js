// import npm packages
var Q = require('q');

var fs = require("fs");
var csv = require('csv-parser');
var transform = require('stream-transform');

var forEachAsync = require('forEachAsync');
var dateFormat = require('dateformat');
var moment = require('moment');

// import files
var logger = require('../util/log').get();
var utils = require('../util/utils');
var siteBase = utils.getConstants().ASSET_PATH;
var mongoose = require('../util/connection');

// models
var employeeModel = require('../models/employee-model');
var beaconModel = require('../models/beacon-model');
var roleModel = require('../models/role-model');
var imageService = require('./image-service');
var beaconService = require('./beacon-service');

// Message files
var errorMessages = require('../util/error-message').error;

const ASSUMED_CSV_COL_SEQ = {
	'firstName': {'key': "FIRST NAME", 'required': true},
	'lastName': {'key': "LAST NAME", 'required': true},
	'employeeId': {'key': "EMPLOYEE ID", 'required': true},
	'roleName': {'key': "ROLE", 'required': true},
	'beaconId': {'key': "BEACON ID", 'required': false},
	'department': {'key': "DEPARTMENT", 'required': false},
	'imageName': {'key': "IMAGE NAME", 'required': false},
	'startDate': {'key': "START DATE", 'required': false},
	'prefixValue': {'key': "PERSONALISATION VALUE", 'required': false},
	'phoneNo': {'key': "PHONE NUMBER", 'required': false},
	'email': {'key': "EMAIL", 'required': false}
};

var createEmployee = function (employeeDetails, actionParams) {
	var deferred = Q.defer();

	if (actionParams['qty'] === "bulk") { // Bulk upload of Employee creation
		if (validateEmployeeDetailsBulk(employeeDetails)) {
			createEmployeeBulk(employeeDetails)
			.then(function (result) {
				deferred.resolve(result);
			}, function (err) {
				err.code = 777;
				deferred.reject(err);
			});	
		} else {
			var err = new Error("Validation errors for employee details in bulk upload !!!");
			err.code = 888;
			deferred.reject(err);
		};
		
	} else {
		if (validateEmployeeDetailsInd(employeeDetails)) {

			(function (exports) {
			  'use strict';
			 
			  var Sequence = exports.Sequence || require('sequence').Sequence
			    , sequence = Sequence.create()
			    , err
			    ;

			/* Using sequence package to make callback sync for maintaining atomic DB transactions */
			sequence
				.then(function (next) {
					if (employeeDetails.roleId) {
						next(employeeDetails);
					} else { // roleName,,, so check in db if not exists then insert into db
						var roleName = employeeDetails.roleName;
						roleModel.fetchRoleDetailsByRoleName(roleName, employeeDetails.brandId)
						.then(function (roleDoc) {
							if (roleDoc) {
								employeeDetails.roleId = roleDoc.id;
								next(employeeDetails);
							} else {
								var roleDetails = {};
								roleDetails.role_type = roleName;
								roleDetails.brandId = employeeDetails.brandId;
								roleModel.createRole(roleDetails)
								.then(function (roleDoc) {
									if (!roleDoc) {
										employeeDetails.roleId = null;
										next(employeeDetails);
									} else {
										employeeDetails.roleId = roleDoc.id;
										next(employeeDetails);
									};
								}, function (err) {
									logger.error("Employee Creation Indiviual: Role creation error: "+ err);
									deferred.reject(err);
								});
							}
						}, function (err) {
							logger.error("Employee Creation Indiviual: Role search error: "+ err);
							deferred.reject(err);
						});
					}
				})
				.then(function (next, employeeDetails) {
					createEmployeeInd(employeeDetails)
						.then(function (result) {
							deferred.resolve(result);
						}, function (err) {
							if(!err.code) {
								err.code = 666;
							}
							deferred.reject(err);
						});
				})
			}('undefined' !== typeof exports && exports || new Function('return this')()));
		} else {
			var err = new Error("Validation errors for employee creation !!!");
			err.code = 888;
			deferred.reject(err);
		};
	};

	return deferred.promise;
};

var createEmployeeBulk = function (employeeDetails) {
	var deferred = Q.defer();
	var validationErrors = [];
	var empNoFound = [];
	var empDup = [];
	var beaconDup = [];
	var creationError = [];
	var empCreation = [];
	var empImgEmpIdError = [];

	(function (exports) {
	  'use strict';
	 
	  var Sequence = exports.Sequence || require('sequence').Sequence
	    , sequence = Sequence.create()
	    , err
	    ;

	/* Using sequence package to make callback sync for maintaining atomic DB transactions */
	sequence
		.then(function (next) {
				imageService.uploadZipFile(employeeDetails.imgZip)
				.then(function (empIdsObj) {
					logger.info("Files Array : "+ empIdsObj);
					next(empIdsObj);
				}, function (err) {
					var err = new Error("Employee Creation Bulk: Error creating employees !!!");
					logger.error(err.message);
					deferred.reject(err);
				});
			}
		)
		.then(function (next, empIdsObj) {
				imageService.uploadCSVFile(employeeDetails.data, employeeDetails.data_type)
				.then(function (filePath) {
					next(filePath, empIdsObj);
				}, function (err) {
					var err = new Error("Employee Creation Bulk: Error creating employees !!!");
					logger.error(err.message);
					deferred.reject(err);
				});
			}
		)
		.then(function (next, filePath, empIdsObj) {
				//var stream = fs.createReadStream(filePath);
			    var counter = 1;
			    
			    var errorBulkObject = {}; // {rowId: [{'columnName': 'asas', 'erroMessage': 'sdsd'}]}
			    
			    var modelEmployeeObject = {}; // [{'empDoc': empDocObject, 'beaconDoc': beaconDocObject}]
			    var modelBeaconObject = {};
			    var modelRolesObj = {};

			    // For tracking duplicate emails and phoneNos
			    var empEmails = [];
			    var empPhoneNos = [];

			    var transformer = transform(function(lineDataObject, callback){
				  
			    	try {
						console.log(counter + "-" + JSON.stringify(lineDataObject));
						stream.pause();
						
						var errors = [];

				    	(function (exports) {
						  'use strict';
						 
						var Sequence = exports.Sequence || require('sequence').Sequence
						    , sequence = Sequence.create()
						    , err
						    ;

						/* Using sequence package to make callback sync for maintaining atomic DB transactions */
						sequence
						.then(function employeeCheck(nextSeq) {
							// I - Check if employee is duplicated in any file records
								// First name
								var firstName = lineDataObject[ASSUMED_CSV_COL_SEQ.firstName['key']] || null;
								if (firstName < 3 || firstName > 30) {
									errors.push({
										'columnName': ASSUMED_CSV_COL_SEQ.firstName['key'],
										'erroMessage': errorMessages.E0437
									});
								};

								// Last name
								var lastName = lineDataObject[ASSUMED_CSV_COL_SEQ.lastName['key']] || null;
								if (lastName < 3 || lastName > 30) {
									errors.push({
										'columnName': ASSUMED_CSV_COL_SEQ.lastName['key'],
										'erroMessage': errorMessages.E0438
									});
								};

								// Image name validations same as in processed zip images array.
								var imageName = lineDataObject[ASSUMED_CSV_COL_SEQ.imageName['key']] || null;
								if (imageName) {
									if (!empIdsObj[imageName.toLowerCase()]) {
										errors.push({
											'columnName': ASSUMED_CSV_COL_SEQ.imageName['key'],
											'erroMessage': errorMessages.E0434
										});
									} else {
										imageName = empIdsObj[imageName.toLowerCase()].file;
									};
								};

								// employee start date transformation and validation handling
								var startDt = lineDataObject[ASSUMED_CSV_COL_SEQ.startDate['key']] || null;
								if (startDt) {
									if (startDt.match(/^([1-9]|0[1-9]|1[0-2])\/([1-9]|0[1-9]|[1-2]\d|3[0-1])\/\d\d\d\d$/)) {
										var mydate = moment(startDt, 'M/D/YYYY');	
										startDt = dateFormat(mydate, "yyyy/mm/dd");
									} else {
										errors.push({
											'columnName': ASSUMED_CSV_COL_SEQ.startDate['key'],
											'erroMessage': errorMessages.E0435
										});
									};
								};

								// validation of employee email id
								var emailRegex = new RegExp("^[a-zA-Z]*[a-zA-Z0-9._]+@[a-zA-Z]+\.[a-zA-Z.]{2,5}$");
								var emailId = lineDataObject[ASSUMED_CSV_COL_SEQ['email'].key] || null;
								if (emailId && !emailId.match(emailRegex)) {
									errors.push({
										'columnName': ASSUMED_CSV_COL_SEQ.email['key'],
										'erroMessage': errorMessages.E0433
									});
								};

								// validation of employee phone number
								var phoneRegex = new RegExp("^\d+[-]\d+[-]\d+$|^\d+[-]\d+$|^[0-9]*$");
								var phoneNo = lineDataObject[ASSUMED_CSV_COL_SEQ['phoneNo'].key] || null;
								if (phoneNo && !phoneNo.match(phoneRegex)) {
									errors.push({
										'columnName': ASSUMED_CSV_COL_SEQ.phoneNo['key'],
										'erroMessage': errorMessages.E0433
									});
								}

								var employeeId = lineDataObject[ASSUMED_CSV_COL_SEQ.employeeId['key']];
								if (!employeeId) {
									errors.push({
										'columnName': ASSUMED_CSV_COL_SEQ.employeeId['key'],
										'erroMessage': errorMessages.E0433
									});
									nextSeq(errors);
								} else if (modelEmployeeObject[employeeId]) {
									errors.push({
										'columnName': ASSUMED_CSV_COL_SEQ.employeeId['key'],
										'erroMessage': errorMessages.E0429
									});
									nextSeq(errors);
								} else {	// if not duplicated in file then search db
									if (employeeId.length < 3 || employeeId.length > 60) {
										errors.push({
											'columnName': ASSUMED_CSV_COL_SEQ.employeeId['key'],
											'erroMessage': errorMessages.E0436
										});
										nextSeq(errors);
									} else {
										employeeModel.checkEmployee(employeeId, employeeDetails.brandId, null, lineDataObject[ASSUMED_CSV_COL_SEQ.email['key']], lineDataObject[ASSUMED_CSV_COL_SEQ.phoneNo['key']])
										.then(function employeeSearchSuccess(empDoc) {
											if (empDoc) {
												if (employeeId === empDoc.employeeId) {
													errors.push({
														'columnName': ASSUMED_CSV_COL_SEQ.employeeId['key'],
														'erroMessage': errorMessages.E0426
													});
												};
												if (lineDataObject[ASSUMED_CSV_COL_SEQ.email['key']] === empDoc.email) {
													errors.push({
														'columnName': ASSUMED_CSV_COL_SEQ.email['key'],
														'erroMessage': errorMessages.E0427
													});
												};
												if (lineDataObject[ASSUMED_CSV_COL_SEQ.phoneNo['key']] === empDoc.phoneNo) {
													errors.push({
														'columnName': ASSUMED_CSV_COL_SEQ.phoneNo['key'],
														'erroMessage': errorMessages.E0428
													});
												};
											} else if (!errors.length) { // no new employee details found in db and no validation errors so far, so gather in employee doc object
												var empObj = {
												      // required parameters
												      custId: employeeDetails.custId,
												      brandId: employeeDetails.brandId,
												      locationId: employeeDetails.locId,
												      fullName: {
												      	fname: lineDataObject[ASSUMED_CSV_COL_SEQ['firstName'].key],
												      	lname: lineDataObject[ASSUMED_CSV_COL_SEQ['lastName'].key]
												      },
												      phoneNo: phoneNo,
												      email: emailId,
												      password: null, 
												      img: imageName,
												      employeeId: lineDataObject[ASSUMED_CSV_COL_SEQ['employeeId'].key],
												      roleId: null,
												      department: lineDataObject[ASSUMED_CSV_COL_SEQ['department'].key],
												      prefix: lineDataObject[ASSUMED_CSV_COL_SEQ['prefixValue'].key],
												      startDt: startDt,
												      // OPTIONAL PARAMETERS
												      beaconId: lineDataObject[ASSUMED_CSV_COL_SEQ['beaconId'].key] ? lineDataObject[ASSUMED_CSV_COL_SEQ['beaconId'].key] : null
												    };

												modelEmployeeObject[employeeId] = empObj;
												
											};

											nextSeq(errors);
										}, function employeeSearchFailure(err) {
											stream && stream.removeAllListeners("data") && stream.removeAllListeners("end");
											logger.error("Bulk Employee upload error - Check Employees: " + err);
											var err = new Error(errorMessages.E0402);
						        			err.code = 999;
						        			deferred.reject(err);
										});	
									};
								};
						})
						.then(function beaconCheck(nextSeq, errors) {
							/* II - Beacon Check - (If beacon is mentioned in CSV record then)
					    	  1. Check beacon is in file records and if yes its not repeated
					    	  2. Beacon should exists in database and in "UNPAIRED" status
					    	*/
								var beaconId = lineDataObject[ASSUMED_CSV_COL_SEQ.beaconId['key']] || null;
						    	var locationId = employeeDetails.locId;
						    	if (beaconId) {
						    		if (modelBeaconObject[beaconId]) {
							    		errors.push({
											'columnName': ASSUMED_CSV_COL_SEQ.beaconId['key'],
											'erroMessage': errorMessages.E0430
										});
										nextSeq(errors);
						    		} else {
								    	/*
								    		Beacon database Check
								    	*/
							    		beaconModel.checkBeacons(beaconId, locationId)
								    	.then(function checkBeaconSuccess(beaconDoc) {
								    		if (beaconDoc) {
												if (beaconDoc.status !== 'UNPAIRED') {
													errors.push({
														'columnName': ASSUMED_CSV_COL_SEQ.beaconId['key'],
														'erroMessage': errorMessages.E0518
													});
												} else {
													beaconDoc.status = "PAIRED";
													beaconDoc.employeeId = lineDataObject[ASSUMED_CSV_COL_SEQ.employeeId['key']];
													modelBeaconObject[beaconId] = beaconDoc;
												};
											} else {	// no beacon details found in db, so error
												errors.push({
													'columnName': ASSUMED_CSV_COL_SEQ.beaconId['key'],
													'erroMessage': errorMessages.E0519
												});
											};
											nextSeq(errors);
								    	}, function checkBeaconFailure(err) {
								    		logger.error("Bulk Employee upload error - Check beacons: " + err);
								    		stream && stream.removeAllListeners("data") && stream.removeAllListeners("end");
								    		deferred.reject(err);
								    	});
							    	};
						    	} else {
						    		nextSeq(errors);
						    	};
						})
						.then(function roleCheck(nextSeq, errors) {
				    		/* III - Role name check
					    		1. Check if given role name exist in database
					    		2. Assign existing rolename's roleId to employee doc
					    		3. If role name does not exists then maintain roleModelObject
					    			with roleDetails.
					    	*/
					    		var roleName = lineDataObject[ASSUMED_CSV_COL_SEQ.roleName['key']] || null;
						    	var brandId = employeeDetails.brandId;
						    	var employeeId = lineDataObject[ASSUMED_CSV_COL_SEQ.employeeId['key']] || null;

						    	if (!roleName) {
						    		errors.push({
										'columnName': ASSUMED_CSV_COL_SEQ.roleName['key'],
										'erroMessage': errorMessages.E0212
									});
									nextSeq(errors);
						    	} else {
						    		// Check if rolename is already not included in new roles list
							    	// If yes then ignore and if not in new roles list then search DB
							    	// If not found in db too then include as new entry in new roles list.
							    	if (modelRolesObj && !modelRolesObj.hasOwnProperty(roleName)) {
							    		roleModel.fetchRoleDetailsByRoleName(roleName, brandId)
								    	.then(function roleNameSearchSuccess(roleDoc) {
								    		var employeeDoc = modelEmployeeObject[employeeId] || null;
								    		if (roleDoc) {
								    			employeeDoc ? employeeDoc.roleId = roleDoc._id : employeeDoc = null;
								    		} else {
								    			employeeDoc ? employeeDoc.roleId = roleName : employeeDoc = null;
								    			modelRolesObj[roleName] = null;
								    		};
							    			nextSeq(errors);
								    	}, function roleNameSearchFailure(err) {
								    		logger.error("Bulk Employee upload error - roleNameSearch: " + err);
								    		stream && stream.removeAllListeners("data") && stream.removeAllListeners("end");
								    		deferred.reject(err);
								    	});
							    	} else {
							    		nextSeq(errors);
							    	};
						    	}
						})
						.then(function resumeStream(nextSeq, errors) {
							// Maintaing Bulk validation Errors object with row index 
					    	// and column wise errors array
					    	if (errors.length > 0) {
					    		errorBulkObject[counter] = errors
					    	};
					    	
					    	counter++; // row counter
					    	callback(null, lineDataObject);
					    	stream.resume();
						})
						}('undefined' !== typeof exports && exports || new Function('return this')()));
						// end of try catch for bulk employee upload block - read data stream
			    	} catch (err) {
			    		logger.error("Bulk Employee upload error - " + err);
			    		stream && stream.removeAllListeners("data");
			    		deferred.reject(err);
			    	};
				}, {parallel: 25});


				var stream = fs.createReadStream(filePath)
				.pipe(csv())
				.pipe(transformer)
				.on("error",function(err) {
					logger.error("Bulk Employee upload error - Error reading CSV File: " + err);
		    		stream && stream.removeAllListeners("data");
		    		deferred.reject(err);
				})
				.on("headers", function(headerList) {
					// Validate only mandatory headers in bulk file
					if (!validateBulkFileHeaders(headerList)) {
						logger.error("Mandatory headers are absent.");
						stream && stream.removeAllListeners("data") && stream.removeAllListeners("end");
						var err = new Error(errorMessages.E0425);
	        			err.code = 100;
	        			deferred.reject(err);
					};
				})
				.on("end",function() {
			    	logger.info('Bulk Employee upload end.');
			    	
			    	var errorKeys = Object.keys(errorBulkObject) || null;
			    	if (errorKeys && errorKeys.length > 0) {
			    		logger.info("debug Error bulk- " + JSON.stringify(errorBulkObject));
			    		deferred.resolve(errorBulkObject);
			    	} else {
			    		logger.info("debug employee bulk- " + JSON.stringify(modelEmployeeObject));
				    	logger.info("debug beacon bulk- " + JSON.stringify(modelBeaconObject));
				    	logger.info("debug Roles bulk- " + JSON.stringify(modelRolesObj));

				    	(function (exports) {
						  'use strict';
						 
						var Sequence = exports.Sequence || require('sequence').Sequence
						    , sequence = Sequence.create()
						    , err
						    ;

						/* Using sequence package to make callback sync for maintaining atomic DB transactions */
						sequence
						.then(function roleInsert(nextSeq) {
							// Write all the role names in database
					    	var modelRoleKeys = Object.keys(modelRolesObj);
					    	if (modelRoleKeys && modelRoleKeys.length > 0) {
					    		roleModel.createRolesBulk(modelRoleKeys, employeeDetails.brandId)
					    		.then(function roleInsertSuccess (roleDocs) {
					    			// populate model role object with role id which can be used in employee insert to populate roleId
					    			roleDocs.forEach(function (element, index) {
					    				if (modelRolesObj.hasOwnProperty(element.role_type)) {
					    					modelRolesObj[element.role_type] = element._id;
					    				}
					    			});
					    			nextSeq();
					    		}, function roleInsertFailure (error) {
					    			logger.error("Bulk Employee upload error - Role bulk insert: " + error);
					    			stream && stream.removeAllListeners("data") && stream.removeAllListeners("end");
									var err = new Error(errorMessages.E0402);
				        			err.code = 100;
				        			deferred.reject(err);
					    		});
					    	} else {
					    		nextSeq();
					    	};
						})
						.then(function employeeInsert(nextSeq) {
							// Save employee details
							var employeeKeys = Object.keys(modelEmployeeObject);
							if (employeeKeys.length > 0) {
								var employeeDetailsArr = [];
						    	for (var key in modelEmployeeObject) {
						    		// asign role id to employee objects where roleid was not available at that time
						    		if (modelRolesObj[modelEmployeeObject[key].roleId]) {
						    			modelEmployeeObject[key].roleId = modelRolesObj[modelEmployeeObject[key].roleId];
						    		};
						    		employeeDetailsArr.push(modelEmployeeObject[key]);
						    	};
						    	employeeModel.createEmployeesBulk(employeeDetailsArr)
						    	.then(function empInsertSuccess (empDocs) {
						    			console.log(empDocs);
						    			nextSeq();
						    		}, function empInsertFailure (error) {
						    			logger.error("Bulk Employee upload error - Employee bulk insert: " + error);
						    			stream && stream.removeAllListeners("data") && stream.removeAllListeners("end");
										var err = new Error	(errorMessages.E0402);
					        			err.code = 100;
					        			deferred.reject(err);
						    		});
							} else {
								nextSeq();
							};
						})
						.then(function beaconUpdate(nextSeq) {

							var beaconDocsArr = [];
							for (var obj in modelBeaconObject) {
								beaconDocsArr.push(modelBeaconObject[obj]);
							};

							beaconModel.updateBeaconDataBulk(beaconDocsArr)
							.then(function beaconUpdateSuccess(result) {
								deferred.resolve(errorBulkObject);
							}, function beaconUpdateFailure(error) {
								logger.error("Bulk Employee upload error - Beacon bulk update: " + error);
				    			stream && stream.removeAllListeners("data") && stream.removeAllListeners("end");
								var err = new Error(errorMessages.E0402);
			        			err.code = 100;
			        			deferred.reject(err);
							});
						})
						}('undefined' !== typeof exports && exports || new Function('return this')()));
			    	};
					
					stream.removeAllListeners("data");
					stream = null;

					// removal of csv file			        
                	imageService.removeFile(filePath)
	                .then(function (fileOps) {
		            	deferred.resolve(resObj);
	                }, function (err) {
	                	logger.error("Employee Creation: Bulk upload File removal error: "+ err);
	                	deferred.reject(err);
	                });
			    })
			}
		)
	}('undefined' !== typeof exports && exports || new Function('return this')()))

	return deferred.promise;
};

// POST User operation to register / save user
var createEmployeeInd = function (employeeDetails) {
	var deferred = Q.defer();
	try {
		(function (exports) {
		  'use strict';
		 
		  var Sequence = exports.Sequence || require('sequence').Sequence
		    , sequence = Sequence.create()
		    , err
		    ;

		/* Using sequence package to make callback sync for maintaining atomic DB transactions */
		sequence
			.then(function (next) {
				if(employeeDetails.img && employeeDetails.img_type) {
					imageService.uploadImage(employeeDetails.img, employeeDetails.img_type, "emp")
					.then(function (imgPath) {
						next(imgPath);
					}, function (err) {
						var err = new Error("Employee Creation: Error uploading Image !!!");
						logger.error(err.message);
						deferred.reject(err);
					});
				} else {
					next(null);
				}
				}
			)
			.then(function (next, imgPath) {
					employeeDetails.img = imgPath;
					employeeDetails.startDt = employeeDetails.startDt ? dateFormat(employeeDetails.startDt, "yyyy/mm/dd") : null;
					employeeModel.createEmployee(employeeDetails)
					.then(function success(result) {
						next(result);
					}, function failure(err) {
						logger.error("Employee registration: Employee save failure: " + err);
						deferred.reject(err);
					});	
				}
			)
			.then(function (next, empDoc) {
				if (employeeDetails.beaconId) {
					beaconModel.checkBeacons(employeeDetails.beaconId, employeeDetails.locId)
					.then(function (beaconDoc) {
						if(beaconDoc && beaconDoc.location != employeeDetails.locId) {
							//If the location of employee and beacon is different
							var err = new Error("Beacon Assignment Error. Beacon location is different.");
							err.code = 779;
							deferred.reject(err);
						} else {
							if (beaconDoc && beaconDoc.status === 'UNPAIRED') {
								var beaconObj = {};
								beaconObj.status = 'PAIRED';
								beaconObj.empId = employeeDetails.empId;
								beaconObj.beaconId = employeeDetails.beaconId;
								beaconModel.updateBeaconData(beaconObj)
								.then(function (beaconDoc) {
									if (beaconDoc) {
										deferred.resolve(empDoc);
									} else {
										var err = new Error("Beacon Assignment Error.. Employee Created without Beacon Assignment !!!");
										err.code = 300;
										deferred.reject(err);
									}
								}, function (err) {
									logger.error("Employee creation Indiviual: Error in beacon update: " + err);
									var err = new Error("Beacon Assignment Error.. Employee Created without Beacon Assignment !!!");
									err.code = 300;
									deferred.reject(err);
								});

							} else if(beaconDoc && beaconDoc.status === 'PAIRED') {
								var err = new Error("Beacon Assignment Error. Beacon already assigned.");
								err.code = 777;
								deferred.reject(err);
							} else { // throw error for this beaconid not available for this location
								var err = new Error("Beacon Assignment Error. beacon not present for location.");
								empDoc.beaconId = null;
								empDoc.save(function(error){
									err.code = 780;
									deferred.reject(err);
								});
							}
						}
					}, function (err) {
						logger.error("Employee creation Indiviual: Error in beacon search: " + err);
						var err = new Error("Beacon Assignment Error.. Employee Created without Beacon Assignment !!!");
						err.code = 300;
						deferred.reject(err);
					});
				} else {
					deferred.resolve(empDoc);
				}
			})
		}('undefined' !== typeof exports && exports || new Function('return this')()));
	} catch (err) {
		var errCustom = "Error caught in employee creation Indiviual: "+ err;
		logger.error(errCustom);
		deferred.reject(errCustom);
	};

	return deferred.promise;
};

// check if employee already exists in db for the mentioned brandId
var checkEmployee = function (empId, brandId, empUniqId) {
	var deferred = Q.defer();

	employeeModel.checkEmployee(empId, brandId, empUniqId)
	.then(function success(result) {
		deferred.resolve(result);
	}, function failure(err) {
		logger.error("Employee check failure: " + err);
		deferred.reject(err);
	});

	return deferred.promise;
};

// check if employee present
var checkEmailContactEmployee= function (employeeDetails) {
	var deferred = Q.defer();

	if (!employeeDetails.email && !employeeDetails.phoneNo) {
		var err = new Error("Email or Phone no should be present in request !!!");
		err.code = 300;
		deferred.reject(err);
	} else {
		var email = employeeDetails.email || null;
		var phoneNo = employeeDetails.phoneNo || null;

		employeeModel.checkEmailContactEmployee(email, phoneNo)
		.then(function success(result) {
			deferred.resolve(result);
		}, function failure(err) {
			deferred.reject(err);
		});
	};

	return deferred.promise;
};

var checkEmployeeBeacon = function (employeeDetails) {
	var deferred = Q.defer();
	
	if (employeeDetails.beaconId) {
		// directly query since validation check done in employee check method
		employeeModel.checkEmployeeBeacon(employeeDetails.beaconId)
		.then(function success(result) {
			deferred.resolve(result);
		}, function failure(err) {
			logger.error("Employee registration: Employee beacon check failure: " + err);
			deferred.reject(err);
		});
	} else {
		deferred.resolve(false);
	};

	return deferred.promise;
};

// Validating user details send in Indiviual Employee create
var validateEmployeeDetailsInd = function (employeeDetails) {
	if (!employeeDetails.fullName || !employeeDetails.fullName.fname || !employeeDetails.empId 
		|| !(employeeDetails.roleId || employeeDetails.roleName)
		|| !employeeDetails.brandId || !employeeDetails.locId) {
		return(false);
	} else {
		return(true);
	}
};


// Validating employee details send in Bulk create employee
var validateEmployeeDetailsBulk = function (employeeDetails) {
	if (!employeeDetails.brandId || !employeeDetails.locId) {
		return(false);
	} else {
		return(true);
	};
};

// Validate bulk file headers
var validateBulkFileHeaders = function (headerList) {
	var result = true;
	
	if (headerList && headerList.length > 0) {
		for (var element in ASSUMED_CSV_COL_SEQ) {
			var headerDet = ASSUMED_CSV_COL_SEQ[element];
			if (headerDet.required && !headerList.includes(headerDet.key)) {
				return (result = false);
			}
		};
	} else {
		return (result = false);
	};
	return result;
};

// Fetch operations for employee profiles
var fetchEmployeeProfiles = function (searchParams, empUniqId) {
	var deferred = Q.defer();

	var page = (searchParams && searchParams.hasOwnProperty('page') && searchParams.page) || null;

	if (page === 'searchEmployee') {
		fetchEmployeeLikeIdOrName(searchParams)
		.then(function (result) {
			deferred.resolve(result);
		}, function (err) {
			deferred.reject(err);
		});
	} else {	// used mostly by app
		employeeModel.fetchEmployeeProfiles(searchParams, empUniqId)
		.then (function success(result) {
			deferred.resolve(result);
		}, function failure(err) {
			logger.error("Employee Fetch: Employee fetch profiles failure: " + err);
			deferred.reject(err);
		});
	};

	return deferred.promise;
};

// Upload Employee Profile photo
var updateEmployeeProfile = function (employeeDetails, empId, parentId) {
	var deferred = Q.defer();

	// update employee directly since validation check done inside checkemployee method
	(function (exports) {
		  'use strict';
		 
		  var Sequence = exports.Sequence || require('sequence').Sequence
		    , sequence = Sequence.create()
		    , err
		    ;

		/* Using sequence package to make callback sync for maintaining atomic DB transactions */
		sequence
			.then(function (next) {
					if (employeeDetails.img) {
						if(employeeDetails.imageModifiedFlag) {
							imageService.uploadImage(employeeDetails.img, employeeDetails.img_type, "emp")
							.then(function (imgPath) {
								next(imgPath);
							}, function (err) {
								var err = new Error("Employee Upload: Error uploading Image !!!");
								logger.error(err.message);
								deferred.reject(err);
							});
						} else {
							next(null);
						}
					} else {
						//console.log(employeeDetails.img);
						next(employeeDetails.img);
					}
					
				}
			)
			.then(function (next, imgPath) {
				if (employeeDetails.beaconId && employeeDetails.oldBeaconId != employeeDetails.beaconId) {
					beaconModel.checkBeacons(employeeDetails.beaconId)
					.then(function (beaconDoc) {
						if(beaconDoc && beaconDoc.location != employeeDetails.locationId) {
							//If the location of employee and beacon is different
							var err = new Error("Beacon Assignment Error. Beacon location is different.");
							err.code = 779;
							deferred.reject(err);
						} else {
							if (beaconDoc && beaconDoc.status === 'UNPAIRED') {
								var beaconObj = {};
								beaconObj.status = 'PAIRED';
								beaconObj.empId = employeeDetails.employeeId;
								beaconObj.beaconId = employeeDetails.beaconId;
								beaconModel.updateBeaconData(beaconObj)
								.then(function (beaconDoc) {
									if (beaconDoc) {
										//deferred.resolve(empDoc);
										next(imgPath);
									} else {
										var err = new Error("Beacon Assignment Error.. Employee Created without Beacon Assignment !!!");
										err.code = 300;
										deferred.reject(err);
									}
								}, function (err) {
									logger.error("Employee creation Indiviual: Error in beacon update: " + err);
									var err = new Error("Beacon Assignment Error.. Employee Created without Beacon Assignment !!!");
									err.code = 300;
									deferred.reject(err);
								});

							}
							else if(beaconDoc && beaconDoc.status === 'PAIRED') {
								var err = new Error("Beacon Assignment Error. Beacon already assigned.");
								err.code = 777;
								deferred.reject(err);
							} else { // save employee directly since validation check done inside checkemployee method
								var err = new Error("Beacon Assignment Error. beacon not present for location.");
								err.code = 780;
								deferred.reject(err);
							}

						}
					}, function (err) {
						logger.error("Employee creation Indiviual: Error in beacon search: " + err);
						var err = new Error("Beacon Assignment Error.. Employee Created without Beacon Assignment !!!");
						err.code = 300;
						deferred.reject(err);
					});
				} else {
					if(!employeeDetails.beaconId && employeeDetails.oldBeaconId) {
						beaconModel.checkBeacons(employeeDetails.oldBeaconId, employeeDetails.locationId)
						.then(function (beaconDoc) {
							if(beaconDoc && beaconDoc.status != 'UNPAIRED') {
								beaconDoc.status = 'UNPAIRED';
								beaconDoc.employeeId = null;
								beaconDoc.save(function (err) {	// save updated beacons
									if (err) {
										var err = new Error("Beacon unpair Error.");
										err.code = 781;
										deferred.reject(err);
									} else {
										next(imgPath);
									};
								});
							} else {
								next(imgPath);
							}
						}, function (err) {
							logger.error("Employee Update: Beacon search error: "+ err);
							var err = new Error("Beacon Search Error.");
							err.code = 782;
							deferred.reject(err);
						});
					} else {
						next(imgPath);	
					}
					//deferred.resolve(empDoc);
					//next(imgPath);
				}
			})
			.then(function (next, imgPath) {

				if(employeeDetails.oldEmployeeId !== employeeDetails.employeeId)
				{
					employeeModel.checkEmployee(employeeDetails.employeeId,employeeDetails.brandId)
					.then(function success(result) {
						//deferred.resolve(result);
						if(result)
						{
							var err = new Error("Update Employee Error. Employee Id already exists.");
							err.code = 778;
							deferred.reject(err);
						}else
						{
							next(imgPath);
						}
					}, function failure(err) {
						logger.error("Employee updating: Employee update failure: " + err);
						deferred.reject(err);
	 				});
				}else
				{
					next(imgPath);
				}
						
				}
			)
			.then(function (next, imgPath) {
					var roleName = employeeDetails.role.role_type;
						roleModel.fetchRoleDetailsByRoleName(roleName, employeeDetails.brandId)
						.then(function (roleDoc) {
							if (roleDoc) {
								employeeDetails.role._id = roleDoc.id;
								next(imgPath);
							} else {
								var roleDetails = {};
								roleDetails.role_type = roleName;
								roleDetails.brandId = employeeDetails.brandId;
								roleModel.createRole(roleDetails)
								.then(function (roleDoc) {
									if (!roleDoc) {
										employeeDetails.role = null;
										next(imgPath);
									} else {
										employeeDetails.role._id = roleDoc.id;
										next(imgPath);
									};
								}, function (err) {
									logger.error("Employee Update Indiviual: Role creation error: "+ err);
									deferred.reject(err);
								});
							}
						}, function (err) {
							logger.error("Employee Update Indiviual: Role search error: "+ err);
							deferred.reject(err);
						});
				}
			)
			.then(function (next, imgPath) {
					employeeDetails.img = imgPath;
					employeeModel.updateEmployeeProfile(employeeDetails, empId)
					.then(function success(result) {
						//deferred.resolve(result);
						next(result);
					}, function failure(err) {
						logger.error("Employee updating: Employee update failure: " + err);
						deferred.reject(err);
	 				});	
				}
			)
			.then(function (next, empDoc) {
				if(empDoc.beaconId) {
					beaconModel.unAssignPreviousBeacon(employeeDetails.employeeId, empDoc.beaconId)
					.then(function (res) {
						if (res) {
							deferred.resolve(empDoc);
						} else {
							var err = new Error("Beacon Unassign Error.. Employee Created without Beacon Unassignment.");
							err.code = 300;
							deferred.reject(err);
						}
					}, function (err) {
						logger.error("Employee creation Indiviual: Error in beacon unassign: " + err);
						var err = new Error("Beacon Assignment Error.. Employee Created without Beacon Unassignment.");
						err.code = 300;
						deferred.reject(err);
					});
				} else {
					deferred.resolve(empDoc);
				}
				}
			)
		}('undefined' !== typeof exports && exports || new Function('return this')()));
	
	return deferred.promise;
};

// DELETE Employee details
var deleteEmployee = function (employeeIds) {
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
            beaconModel.unAssignEmpBeacons(employeeIds)
			.then(function success(result) {
				if(result.ok) {
					next();
				} else {
					var err = new Error("Error in assigning beacons.");
                    deferred.reject(err);
				}
			}, function failure(err) {
				logger.error("Employee deletion failure: " + err);
				deferred.reject(err);
			});
        }
      )
      .then(function (next) {
            employeeModel.deleteEmployee(employeeIds)
			.then(function success(result) {
				deferred.resolve(result);
			}, function failure(err) {
				logger.error("Employee deletion failure: " + err);
				deferred.reject(err);
			});
        }
      )
    }('undefined' !== typeof exports && exports || new Function('return this')()));

	return deferred.promise;
};


// Fetch Employee with Beacon Details
var fetchEmployeeLikeIdOrName = function (searchParams) {
	var deferred = Q.defer();

	employeeModel.fetchEmployeeLikeIdOrName(searchParams)
	.then(function (empDocs) {
		deferred.resolve(empDocs);
	}, function (err) {
		deferred.reject(err);
	});

	return deferred.promise;
};

// Check employees based upon employee unique ID
var checkEmployeeId = function (empUniqId) {
	var deferred = Q.defer();

	employeeModel.checkEmployeeId(empUniqId)
	.then(function (empDocs) {
		deferred.resolve(empDocs);
	}, function (err) {
		deferred.reject(err);
	});

	return deferred.promise;
};

// exports section 
exports.createEmployee = createEmployee;
exports.checkEmployeeBeacon = checkEmployeeBeacon;
exports.checkEmployee = checkEmployee;
exports.checkEmailContactEmployee = checkEmailContactEmployee;
exports.fetchEmployeeProfiles = fetchEmployeeProfiles;
exports.updateEmployeeProfile = updateEmployeeProfile;
exports.deleteEmployee = deleteEmployee;
exports.fetchEmployeeLikeIdOrName = fetchEmployeeLikeIdOrName;
exports.checkEmployeeId = checkEmployeeId;
