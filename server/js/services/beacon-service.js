// import npm packages
var Q = require('q');
var fs = require("fs");
var csv = require('csv-parser')
var forEachAsync = require('forEachAsync');
// import files
var logger = require('../util/log').get();
var utils = require('../util/utils');
// import models
var employeeModel = require('../models/employee-model');
var beaconModel = require('../models/beacon-model');
var imageService = require('./image-service');

var errorMessages = require('../util/error-message.js').error;

var bulkUploadBeaconHeaders = ["EmployeeId", "BeaconId"];

const ASSUMED_CSV_COL_SEQ = {
 'beaconId': {'key': "BeaconId", 'required': true}
};

const ASSUMED_CSV_COL_SEQ_PAIR = {
 'beaconId': {'key': "BeaconId", 'required': true},
 'employeeId': {'key': "EmployeeId", 'required': true}
};

var validateBulkFileHeaders = function(row, isPair) {
	var result = true;

	if(isPair) {
		if(!row.hasOwnProperty(ASSUMED_CSV_COL_SEQ_PAIR.beaconId['key']) || !row.hasOwnProperty(ASSUMED_CSV_COL_SEQ_PAIR.employeeId['key'])) {
			return (result = false);
		};
	} else {
		if(!row.hasOwnProperty(ASSUMED_CSV_COL_SEQ.beaconId['key'])) {
			return (result = false);
		};
	}
	return result;
};	

// Check / Fetch Beacons By beaconId
var checkBeacons = function (beaconIds) {
	var deferred = Q.defer();

	beaconModel.checkBeacons(beaconIds)
	.then(function (result) {
		deferred.resolve(result);
	}, function (err) {
		logger.error("Beacons Check: " + err);
		deferred.reject(err);
	});

	return deferred.promise;
};

// Validate Beacon Details
var validateBeaconDetails = function (beaconDetails) {
	if (!beaconDetails.custId || !beaconDetails.brandId 
		|| !beaconDetails.locId || (!beaconDetails.data && !beaconDetails.beaconIdsArray && !beaconDetails.beaconId)) {
		return false;
	} else {
		return true;
	};
};

// Assign Beacons
var beaconAction = function (beaconDetails, actionParams) {
	var deferred = Q.defer();

	if (validateBeaconDetails(beaconDetails)) {
		if (actionParams['qty'] === "bulk") { // Bulk upload of beacons assignment
			switch (actionParams['action']) {
				case "assign": 
					assignBeaconsBulk(beaconDetails)
					.then(function (result) {
						deferred.resolve(result);
					}, function (err) {
						deferred.reject(err);
					});
					break;
				case "unassign": 
					unassignBeaconsBulk(beaconDetails)
					.then(function (result) {
						deferred.resolve(result);
					}, function (err) {
						deferred.reject(err);
					});
					break;
				case "unpair": 
					unpairBeaconsBulk(beaconDetails)
					.then(function (result) {
						deferred.resolve(result);
					}, function (err) {
						deferred.reject(err);
					});
					break;
				case "pair": 
					pairBeaconsBulk(beaconDetails)
					.then(function (result) {
						deferred.resolve(result);
					}, function (err) {
						deferred.reject(err);
					});
					break;
			};
			
		} else {					// Indiviual beacons assignment
			if (beaconDetails.empId || beaconDetails.beaconId || beaconDetails.beaconIdsArray.length) {
				switch (actionParams['action']) {
					case "assign": 
						assignBeaconInd(beaconDetails)
						.then(function (result) {
							deferred.resolve(result);
						}, function (err) {
							deferred.reject(err);
						});	
						break;
					case "unassign": 
						unassignBeaconInd(beaconDetails)
						.then(function (result) {
							deferred.resolve(result);
						}, function (err) {
							deferred.reject(err);
						});	
						break;
					case "unpair": 
						unpairBeaconInd(beaconDetails)
						.then(function (result) {
							deferred.resolve(result);
						}, function (err) {
							deferred.reject(err);
						});	
						break;
					default: 
						logger.error("Beacon Action not understood !!!");
						deferred.reject(new Error("Beacon Action missing !!!"));
				};
			} else {
				logger.error("Beacon Assignment: Indiviual assignment EmployeeId missing");
				var err = new Error("Employee Id missing in Indiviual Beacon assignment !!!");
				err.code = 200;
				deferred.reject(err);
			};
		};
	} else {
			logger.error("Beacon Assignment: Indiviual assignment EmployeeId missing");
			var err = new Error("Beacon Assignment details Validation failed !!!");
			err.code = 200;
			deferred.reject(new Error(err));
	};

	return deferred.promise;
};

var assignBeaconsBulk = function (beaconDetails) {
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
				imageService.uploadCSVFile(beaconDetails.data, beaconDetails.data_type)
				.then(function (filePath) {
					next(filePath);
				}, function (err) {
					var err = new Error("Beacon Assignment: Error assigning beacon !!!");
					logger.error(err.message);
					deferred.reject(err);
				});
			}
		)
		.then(function (next, filePath) {
				var stream = fs.createReadStream(filePath)
							 .pipe(csv());

			    var allObjects = [];
			    var errors = [];
			    var errorObject = {};
			    var errorDesc = {};
			    var modelBeaconObject = {};

			    stream.on("error",function(err) {
			    	logger.error("Beacon Assignment: Bulk Upload file read error: " + err);
			        deferred.reject(err);
			    });

			    stream.on("data",function(dataObject) {
			    	allObjects.push(dataObject);
			    });

			    stream.on("end",function() {
			    	//Process the data
			    	forEachAsync.forEachAsync(allObjects, function (nextFor, dataObject, index, allObjects) {
			    		(function (exports) {
						  'use strict';
						 
						  var Sequence = exports.Sequence || require('sequence').Sequence
						    , sequence = Sequence.create()
						    , err
						    ;

						/* Using sequence package to make callback sync for maintaining atomic DB transactions */
						sequence
							.then(function (nextSeq) {
									if(index == 0) {
										if(validateBulkFileHeaders(dataObject)) {
											nextSeq();
										} else {
									        var err = new Error(errorMessages.E0508);
									        err.code = 100;
									        deferred.reject(err);
										}
									} else {
										nextSeq();
									}	
								}
							)
							.then(function (nextSeq) {
								var beaconId = dataObject[ASSUMED_CSV_COL_SEQ.beaconId['key']];
									if(modelBeaconObject[beaconId]) {
										errorDesc = {};
										errorDesc.columnName = "beaconId";
										errorDesc.errorMessage = errorMessages.E0510;
										errors.push(errorDesc);
										nextSeq();
									} else {
										nextSeq();
									}	
								}
							)
							.then(function (nextSeq) {
									if(dataObject[ASSUMED_CSV_COL_SEQ.beaconId['key']]) {
										var beaconId = dataObject[ASSUMED_CSV_COL_SEQ.beaconId['key']];
										beaconModel.checkBeacons(beaconId)
										.then(function (beaconDoc) {
											if (beaconDoc && beaconDoc.status) {
												errorDesc = {};
												errorDesc.columnName = "beaconId";
												errorDesc.errorMessage = errorMessages.E0509;
												errors.push(errorDesc);
												nextSeq();
											} else {
												var beaconDocNew = new beaconModel.Beacon({
										        	customer: beaconDetails.custId,
										        	brand: beaconDetails.brandId,
										        	location: beaconDetails.locId,
										        	employeeId: null,
										        	beaconId: beaconId,
										        	status: 'UNPAIRED'
									        	});

										       	modelBeaconObject[beaconId] = beaconDocNew;
										       	nextSeq();
											};
										}, function (err) {
											logger.error("Beacon Assignment Bulk: Beacon search error: "+ err);
											errorFlag = 1;
								        	deferred.reject(err);											
										});
									} else {
										errorDesc = {};
										errorDesc.columnName = "beaconId";
										errorDesc.errorMessage = errorMessages.E0511;
										errors.push(errorDesc);
										nextSeq();
									}
								}
							)
							.then(function (nextSeq) {
									if(errors.length) {
										errorObject[index+1] = errors;
										errors = [];
									}
									nextFor();	
								}
							)
						}('undefined' !== typeof exports && exports || new Function('return this')()));

			    	}).then(function () {
					  	// removal of csv file			        
	                	imageService.removeFile(filePath)
		                .then(function (fileOps) {
		                }, function (err) {
		                	logger.error("Beacon Assignment: Bulk upload File removal error: "+ err);
		                	//deferred.reject(err);
		                });

		                if(Object.keys(errorObject).length) {
		            		deferred.resolve(errorObject);
		            	} else {
		            		var beaconDocObjects = [];
		            		for(var obj in modelBeaconObject) {
		            			beaconDocObjects.push(modelBeaconObject[obj]);
		            		}

		            		beaconModel.updateBeaconDataBulk(beaconDocObjects)
	            			.then(function (isSuccess) {
	            				deferred.resolve(errorObject);
			                }, function (err) {
			                	deferred.reject(err);
			                });
		            	}

					  });
			    });
			}
		)
	}('undefined' !== typeof exports && exports || new Function('return this')()));

	return deferred.promise;
};

var unassignBeaconsBulk = function(beaconDetails) {
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
				imageService.uploadCSVFile(beaconDetails.data, beaconDetails.data_type)
				.then(function (filePath) {
					next(filePath);
				}, function (err) {
					var err = new Error("Beacon Unassignment: Error unassigning beacons.");
					logger.error(err.message);
					deferred.reject(err);
				});
			}
		)
		.then(function (next, filePath) {
				var stream = fs.createReadStream(filePath)
							 .pipe(csv());

			    var allObjects = [];
			    var errors = [];
			    var errorObject = {};
			    var errorDesc = {};
			    var modelBeaconObject = {};
			    var modelEmployeeObject = [];

			    stream.on("error",function(err) {
			    	logger.error("Beacon Unassignment: Bulk Upload file read error: " + err);
			        deferred.reject(err);
			    });

			    stream.on("data",function(dataObject) {
			    	allObjects.push(dataObject);
			    });

			    stream.on("end",function() {
			    	//Process the data
			    	forEachAsync.forEachAsync(allObjects, function (nextFor, dataObject, index, allObjects) {
			    		(function (exports) {
						  'use strict';
						 
						  var Sequence = exports.Sequence || require('sequence').Sequence
						    , sequence = Sequence.create()
						    , err
						    ;

						/* Using sequence package to make callback sync for maintaining atomic DB transactions */
						sequence
							.then(function (nextSeq) {
									if(index == 0) {
										if(validateBulkFileHeaders(dataObject)) {
											nextSeq();
										} else {
									        var err = new Error(errorMessages.E0508);
									        err.code = 100;
									        deferred.reject(err);
										}
									} else {
										nextSeq();
									}	
								}
							)
							.then(function (nextSeq) {
								var beaconId = dataObject[ASSUMED_CSV_COL_SEQ.beaconId['key']];

								if(beaconId) {
									beaconModel.checkBeacons(beaconId, beaconDetails.locId)
										.then(function (beaconDoc) {
											if (!beaconDoc) {
												errorDesc = {};
												errorDesc.columnName = "beaconId";
												errorDesc.errorMessage = errorMessages.E0512;
												errors.push(errorDesc);
											} else {
												if(modelBeaconObject[beaconId]) {
													errorDesc = {};
													errorDesc.columnName = "beaconId";
													errorDesc.errorMessage = errorMessages.E0510;
													errors.push(errorDesc);
												} else {
													modelBeaconObject[beaconId] = beaconDoc;
												}
											}
											nextSeq();
										}, function (err) {
											logger.error("Beacon Un-Assignment Bulk: Beacon search error: "+ err);
											deferred.resolve(err);
										});
									} else {
										errorDesc = {};
										errorDesc.columnName = "beaconId";
										errorDesc.errorMessage = errorMessages.E0511;
										errors.push(errorDesc);
										nextSeq();
									}
								}
							)
							.then(function (nextSeq) {
								    var beaconId = dataObject[ASSUMED_CSV_COL_SEQ.beaconId['key']];
								    if(beaconId) {
								    	employeeModel.checkEmployeeBeacon(beaconId, beaconDetails.locId)
										.then(function (empDoc) {
											if (empDoc) {
												empDoc.beaconId = null;
												modelEmployeeObject.push(empDoc);
											}
											nextSeq();
										}, function (err) {
											logger.error("Beacon Un-Assignment Bulk: Employee Beacon search error: "+ err);
											deferred.reject(err);
										});
								    } else {
										nextSeq();
								    }
								}
							)
							.then(function (nextSeq) {
									if(errors.length) {
										errorObject[index+1] = errors;
										errors = [];
									}
									nextFor();	
								}
							)
						}('undefined' !== typeof exports && exports || new Function('return this')()));
			    	}).then(function () {

					  	// removal of csv file			        
	                	imageService.removeFile(filePath)
		                .then(function (fileOps) {
		                }, function (err) {
		                	logger.error("Beacon Assignment: Bulk upload File removal error: "+ err);
		                });

		                if(Object.keys(errorObject).length) {
		            		deferred.resolve(errorObject);
		            	} else {
		            		(function (exports) {
							  'use strict';
							 
							  var Sequence = exports.Sequence || require('sequence').Sequence
							    , sequence = Sequence.create()
							    , err
							    ;

							 //Using sequence package to make callback sync for maintaining atomic DB transactions 
							sequence
								.then(function (nextSeqSuccess) {
										if(modelEmployeeObject && modelEmployeeObject.length) {
											employeeModel.updateEmployeeDataBulk(modelEmployeeObject)
											.then(function (isSuccess) {
												nextSeqSuccess();
											}, function (err) {
												var err = new Error("Beacon Un-Assignment: Error updating employees");
												logger.error(err.message);
												deferred.reject(err);
											});
										} else {
											nextSeqSuccess();
										}
									}
								)
								.then(function (nextSeqSuccess) {
										var beaconDocObjects = [];
					            		for(var obj in modelBeaconObject) {
					            			beaconDocObjects.push(modelBeaconObject[obj]);
					            		}
										beaconModel.removeBeaconDataBulk(beaconDocObjects)
										.then(function (isSuccess) {
											deferred.resolve(errorObject);
										}, function (err) {
											var err = new Error("Beacon Un-Assignment: Error removing beacons.");
											logger.error(err.message);
											deferred.reject(err);
										});
									}
								)
							}('undefined' !== typeof exports && exports || new Function('return this')()));
		            	}

					  });
			    });
			}
		)
	}('undefined' !== typeof exports && exports || new Function('return this')()));

	return deferred.promise;
}

var pairBeaconsBulk = function (beaconDetails) {
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
				imageService.uploadCSVFile(beaconDetails.data, beaconDetails.data_type)
				.then(function (filePath) {
					next(filePath);
				}, function (err) {
					var err = new Error("Beacon Pair: Error assigning beacon !!!");
					logger.error(err.message);
					deferred.reject(err);
				});
			}
		)
		.then(function (next, filePath) {
				var stream = fs.createReadStream(filePath)
							.pipe(csv());

			    var allObjects = [];
			    var errors = [];
			    var errorObject = {};
			    var errorDesc = {};
			    var modelBeaconObject = {};
			    var modelEmployeeObject = {};


			    stream.on("error",function(err) {
			    	logger.error("Beacon Pair: Bulk Upload file read error: " + err);
			        deferred.reject(err);
			    });

			    stream.on("data",function(dataObject) {
			    	allObjects.push(dataObject);
			    });

			    stream.on("end",function() {
	                //Process the data
			    	forEachAsync.forEachAsync(allObjects, function (nextFor, dataObject, index, allObjects) {
			    		(function (exports) {
						  'use strict';
						 
						  var Sequence = exports.Sequence || require('sequence').Sequence
						    , sequence = Sequence.create()
						    , err
						    ;

						/* Using sequence package to make callback sync for maintaining atomic DB transactions */
						sequence
							.then(function (nextSeq) {
									if(index == 0) {
										if(validateBulkFileHeaders(dataObject, true)) { // true for isPair
											nextSeq();
										} else {
									        var err = new Error(errorMessages.E0513);
									        err.code = 100;
									        logger.error("Beacon Pair: CSV schema error: "+ err)
									        deferred.reject(err);
										}
									} else {
										nextSeq();
									}	
								}
							)
							.then(function (nextSeq) {
								var beaconId = dataObject[ASSUMED_CSV_COL_SEQ_PAIR.beaconId['key']];

								if(beaconId) {
									employeeModel.checkEmployeeBeacon(beaconId, beaconDetails.locId)
										.then(function (resDoc) {
											if (resDoc) {
												errorDesc = {};
												errorDesc.columnName = ASSUMED_CSV_COL_SEQ_PAIR.beaconId['key'];
												errorDesc.errorMessage = errorMessages.E0514;
												errors.push(errorDesc);
											} 
											nextSeq();
										}, function (err) {
											logger.error("Beacon Pair Bulk: Beacon search in employee error: "+ err);
											deferred.resolve(err);
										});
									} else {
										errorDesc = {};
										errorDesc.columnName = ASSUMED_CSV_COL_SEQ_PAIR.beaconId['key'];
										errorDesc.errorMessage = errorMessages.E0511;
										errors.push(errorDesc);
										nextSeq();
									}
								}
							)
							.then(function (nextSeq) {
								    var beaconId = dataObject[ASSUMED_CSV_COL_SEQ_PAIR.beaconId['key']];
								    if(beaconId) {
								    	beaconModel.checkBeacons(beaconId, beaconDetails.locId)
										.then(function (beaconDoc) {
											if (!beaconDoc) {
												errorDesc = {};
												errorDesc.columnName = ASSUMED_CSV_COL_SEQ_PAIR.beaconId['key'];
												errorDesc.errorMessage = errorMessages.E0512;
												errors.push(errorDesc);
											}
											nextSeq(beaconDoc);
										}, function (err) {
											logger.error("Beacon Pair Bulk: Beacon search error: "+ err);
											deferred.reject(err);
										});
								    } else {
										nextSeq();
								    }
								}
							)
							.then(function (nextSeq, beaconDoc) {
								    var employeeId = dataObject[ASSUMED_CSV_COL_SEQ_PAIR.employeeId['key']];
								    var beaconId = dataObject[ASSUMED_CSV_COL_SEQ_PAIR.beaconId['key']];
								    if(employeeId) {
								    	employeeModel.checkEmployee(employeeId, beaconDetails.brandId)
										.then(function (empDoc) {
											if (empDoc) {
												if (empDoc.beaconId) {
													errorDesc = {};
													errorDesc.columnName = ASSUMED_CSV_COL_SEQ_PAIR.employeeId['key'];
													errorDesc.errorMessage = errorMessages.E0516;
													errors.push(errorDesc);
												} else {
													empDoc.beaconId = beaconId;
													beaconDoc.employeeId = employeeId;
													beaconDoc.status = 'PAIRED';

													if(modelEmployeeObject[employeeId]) {
														errorDesc = {};
														errorDesc.columnName = ASSUMED_CSV_COL_SEQ_PAIR.employeeId['key'];
														errorDesc.errorMessage = errorMessages.E0542;
														errors.push(errorDesc);
													} else {
														modelEmployeeObject[employeeId] = empDoc;
													}

													if(modelBeaconObject[beaconId]) {
														errorDesc = {};
														errorDesc.columnName = ASSUMED_CSV_COL_SEQ_PAIR.beaconId['key'];
														errorDesc.errorMessage = errorMessages.E0510;
														errors.push(errorDesc);
													} else {
														modelBeaconObject[beaconId] = beaconDoc;
													}

												};
											} else {
												errorDesc = {};
												errorDesc.columnName = ASSUMED_CSV_COL_SEQ_PAIR.employeeId['key'];
												errorDesc.errorMessage = errorMessages.E0517;
												errors.push(errorDesc);
											}
											nextSeq();
										}, function (err) {
											logger.error("Beacon Assignment Bulk: Employee search error: "+ err);
											stream ? stream.removeAllListeners("data") : logger.error("Beacon Assignment: Bulk upload stream null");
											deferred.reject(err);
										});
								    } else {
								    	errorDesc = {};
										errorDesc.columnName = ASSUMED_CSV_COL_SEQ_PAIR.employeeId['key'];
										errorDesc.errorMessage = errorMessages.E0515;
										errors.push(errorDesc);
										nextSeq();
								    }
								}
							)
							.then(function (nextSeq) {
									if(errors.length) {
										errorObject[index+1] = errors;
										errors = [];
									}
									nextFor();	
								}
							)
						}('undefined' !== typeof exports && exports || new Function('return this')()));
			    	}).then(function () {
					  	// removal of csv file			        
	                	imageService.removeFile(filePath)
		                .then(function (fileOps) {
		                }, function (err) {
		                	logger.error("Beacon Assignment: Bulk upload File removal error: "+ err);
		                	deferred.reject(err);
		                });

		                if(Object.keys(errorObject).length) {
		            		deferred.resolve(errorObject);
		            	} else {
		            		(function (exports) {
							  'use strict';
							 
							  var Sequence = exports.Sequence || require('sequence').Sequence
							    , sequence = Sequence.create()
							    , err
							    ;

							 //Using sequence package to make callback sync for maintaining atomic DB transactions 
							sequence
								.then(function (nextSeqSuccess) {
										var beaconDocObjects = [];
					            		for(var obj in modelBeaconObject) {
					            			beaconDocObjects.push(modelBeaconObject[obj]);
					            		}
					            		if(beaconDocObjects && beaconDocObjects.length) {
					            			beaconModel.updateBeaconDataBulk(beaconDocObjects)
											.then(function (isSuccess) {
												nextSeqSuccess();
											}, function (err) {
												var err = new Error("Beacon Pair: Error updating beacons.");
												logger.error(err.message);
												deferred.reject(err);
											});
					            		} else {
					            			nextSeqSuccess();
					            		}
									}
								)
								.then(function (nextSeqSuccess) {
										var employeeDocObjects = [];
					            		for(var obj in modelEmployeeObject) {
					            			employeeDocObjects.push(modelEmployeeObject[obj]);
					            		}
										if(employeeDocObjects && employeeDocObjects.length) {
											employeeModel.updateEmployeeDataBulk(employeeDocObjects)
											.then(function (isSuccess) {
												deferred.resolve(errorObject);
											}, function (err) {
												var err = new Error("Beacon Pair: Error updating employees.");
												logger.error(err.message);
												deferred.reject(err);
											});
										} else {
											deferred.resolve(errorObject);
										}
									}
								)
							}('undefined' !== typeof exports && exports || new Function('return this')()));
		             	}

					  });
			    });
			}
		)
	}('undefined' !== typeof exports && exports || new Function('return this')()));

	return deferred.promise;
};

// Un-Pair Beacon Bulk
var unpairBeaconsBulk = function (beaconDetails) {
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
				imageService.uploadCSVFile(beaconDetails.data, beaconDetails.file_type)
				.then(function (filePath) {
					next(filePath);
				}, function (err) {
					var err = new Error("Beacon Un-Assignment File: Error un-assigning beacon !!!");
					logger.error(err.message);
					deferred.reject(err);
				});
			}
		)
		.then(function (next, filePath) {
				var stream = fs.createReadStream(filePath)
							.pipe(csv());

			    var allObjects = [];
			    var errors = [];
			    var errorObject = {};
			    var errorDesc = {};
			    var modelBeaconObject = {};
			    var modelEmployeeObject = {};


			    stream.on("error",function(err) {
			    	logger.error("Beacon Unpair: Bulk Upload file read error: " + err);
			        deferred.reject(err);
			    });

			    stream.on("data",function(dataObject) {
			    	allObjects.push(dataObject);
			    });

			    stream.on("end",function() {
                	//Process the data
			    	forEachAsync.forEachAsync(allObjects, function (nextFor, dataObject, index, allObjects) {
			    		(function (exports) {
						  'use strict';
						 
						  var Sequence = exports.Sequence || require('sequence').Sequence
						    , sequence = Sequence.create()
						    , err
						    ;

						/* Using sequence package to make callback sync for maintaining atomic DB transactions */
						sequence
							.then(function (nextSeq) {
									if(index == 0) {
										if(validateBulkFileHeaders(dataObject)) {
											nextSeq();
										} else {
									        var err = new Error(errorMessages.E0513);
									        err.code = 100;
									        logger.error("Beacon Unpair: CSV schema error: "+ err)
									        deferred.reject(err);
										}
									} else {
										nextSeq();
									}	
								}
							)
							.then(function (nextSeq) {
								    var beaconId = dataObject[ASSUMED_CSV_COL_SEQ.beaconId['key']];
								    if(beaconId) {
								    	beaconModel.checkBeacons(beaconId, beaconDetails.locId)
										.then(function (beaconDoc) {
											if (!beaconDoc) {
												errorDesc = {};
												errorDesc.columnName = ASSUMED_CSV_COL_SEQ.beaconId['key'];
												errorDesc.errorMessage = errorMessages.E0512;
												errors.push(errorDesc);
											} else if(beaconDoc.status !== 'PAIRED') {
												errorDesc = {};
												errorDesc.columnName = ASSUMED_CSV_COL_SEQ.beaconId['key'];
												errorDesc.errorMessage = errorMessages.E0540;
												errors.push(errorDesc);
											}
											nextSeq(beaconDoc);
										}, function (err) {
											logger.error("Beacon Unpair Bulk: Beacon search error: "+ err);
											deferred.reject(err);
										});
								    } else {
										nextSeq(null);
								    }
								}
							)
							.then(function (nextSeq, beaconDoc) {
								var beaconId = dataObject[ASSUMED_CSV_COL_SEQ.beaconId['key']];

								if(beaconId) {
									employeeModel.checkEmployeeBeacon(beaconId, beaconDetails.locId)
										.then(function (empDoc) {
											if (!empDoc) {
												if(beaconDoc && beaconDoc.status == 'PAIRED') {
													errorDesc = {};
													errorDesc.columnName = ASSUMED_CSV_COL_SEQ.beaconId['key'];
													errorDesc.errorMessage = errorMessages.E0541;
													errors.push(errorDesc);
												}
											} else {
												var employeeId = empDoc.employeeId;
												empDoc.beaconId = null;
												beaconDoc.status = 'UNPAIRED';
												beaconDoc.employeeId = null;

												if(modelEmployeeObject[employeeId]) {
													
												} else {
													modelEmployeeObject[employeeId] = empDoc;
												}

												if(modelBeaconObject[beaconId]) {
													errorDesc = {};
													errorDesc.columnName = ASSUMED_CSV_COL_SEQ.beaconId['key'];
													errorDesc.errorMessage = errorMessages.E0510;
													errors.push(errorDesc);
												} else {
													modelBeaconObject[beaconId] = beaconDoc;
												}
											} 
											nextSeq();
										}, function (err) {
											logger.error("Beacon Unpair Bulk: Beacon search in employee error: "+ err);
											deferred.resolve(err);
										});
									} else {
										errorDesc = {};
										errorDesc.columnName = ASSUMED_CSV_COL_SEQ.beaconId['key'];
										errorDesc.errorMessage = errorMessages.E0511;
										errors.push(errorDesc);
										nextSeq();
									}
								}
							)
							.then(function (nextSeq) {
									if(errors.length) {
										errorObject[index+1] = errors;
										errors = [];
									}
									nextFor();	
								}
							)
						}('undefined' !== typeof exports && exports || new Function('return this')()));
			    	}).then(function () {
					  	// removal of csv file			        
	                	imageService.removeFile(filePath)
		                .then(function (fileOps) {
		                }, function (err) {
		                	logger.error("Beacon Assignment: Bulk upload File removal error: "+ err);
		                	deferred.reject(err);
		                });

		                if(Object.keys(errorObject).length) {
		            		deferred.resolve(errorObject);
		            	} else {
		            		(function (exports) {
							  'use strict';
							 
							  var Sequence = exports.Sequence || require('sequence').Sequence
							    , sequence = Sequence.create()
							    , err
							    ;

							 //Using sequence package to make callback sync for maintaining atomic DB transactions 
							sequence
								.then(function (nextSeqSuccess) {
										var beaconDocObjects = [];
					            		for(var obj in modelBeaconObject) {
					            			beaconDocObjects.push(modelBeaconObject[obj]);
					            		}
					            		if(beaconDocObjects && beaconDocObjects.length) {
					            			beaconModel.updateBeaconDataBulk(beaconDocObjects)
											.then(function (isSuccess) {
												nextSeqSuccess();
											}, function (err) {
												var err = new Error("Beacon Pair: Error updating beacons.");
												logger.error(err.message);
												deferred.reject(err);
											});
					            		} else {
					            			nextSeqSuccess();
					            		}
									}
								)
								.then(function (nextSeqSuccess) {
										var employeeDocObjects = [];
					            		for(var obj in modelEmployeeObject) {
					            			employeeDocObjects.push(modelEmployeeObject[obj]);
					            		}
										if(employeeDocObjects && employeeDocObjects.length) {
											employeeModel.updateEmployeeDataBulk(employeeDocObjects)
											.then(function (isSuccess) {
												deferred.resolve(errorObject);
											}, function (err) {
												var err = new Error("Beacon Pair: Error updating employees.");
												logger.error(err.message);
												deferred.reject(err);
											});
										} else {
											deferred.resolve(errorObject);
										}
									}
								)
							}('undefined' !== typeof exports && exports || new Function('return this')()));
		             	}

					  });
			    });
			}
		)
	}('undefined' !== typeof exports && exports || new Function('return this')()));

	return deferred.promise;
};

var assignBeaconInd = function(beaconDetails) {
	var deferred = Q.defer();
	var errorObj = {};

	beaconModel.checkBeacons(beaconId)
	.then(function (beaconDoc) {
		if (beaconDoc && beaconDoc.status) {
			errorObj.error = errorMessages.E0509
		} else {
			var beaconDocNew = new beaconModel.Beacon({
	        	customer: beaconDetails.custId,
	        	brand: beaconDetails.brandId,
	        	location: beaconDetails.locId,
	        	employeeId: null,
	        	beaconId: beaconId,
	        	status: 'UNPAIRED'
        	});

	       	beaconDocNew.save(function (err) {	// save beacons
				if (err) {
					logger.error("Beacon Assignment: Bulk Beacon create error: "+ err);
					errorObj.error = "Error creating beacon."
				} else {
					deferred.resolve(errorObj);
				};
			});
		};
	}, function (err) {
		logger.error("Beacon Assignment: Beacon search error: "+ err);
    	deferred.reject(err);											
	});

	return deferred.promise;
}
// Assign Indiviual Beacon
var pairBeaconInd = function (beaconDetails) {
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
				beaconDetails.status = "PAIRED";
				beaconModel.updateBeaconData(beaconDetails)
				.then(function (beaconDoc) {
					next(beaconDoc);
				}, function (err) {
					logger.error("Beacon Assignment: Beacon assignment Indiviual failure: "+ err);
					deferred.reject(err);
				});
		})
		.then(function (next, beaconDoc) {
			//beaconModel.unAssignPreviousBeacon(employeeDetails.employeeId, empDoc.beaconId)
	      	var empDetails = {
		        beaconId: beaconDetails.beaconId,
		        empId: beaconDetails.empId
		      };

	     	employeeModel.updateEmployeeProfile(empDetails, beaconDetails.empUnidId)
			.then(function (empDoc) {
				beaconDoc._doc.employee = empDoc;
				//deferred.resolve(beaconDoc);
				next(empDoc, beaconDoc);
			}, function (err) {
				logger.error("Beacon Assignment: Beacon assignment Indiviual failure: "+ err);
				deferred.reject(err);
			});
		})
		.then(function (next, empDoc, beaconDoc) {
			beaconModel.unAssignPreviousBeacon(beaconDetails.empId, empDoc.beaconId)
			.then(function (res) {
				if (res) {
					deferred.resolve(beaconDoc);
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
		})
	}('undefined' !== typeof exports && exports || new Function('return this')()));

	return deferred.promise;
};

// Assign Indiviual Beacon
var unassignBeaconInd = function (beaconDetails) {
	var deferred = Q.defer();

	var beaconsNoFound = [];
	var empUpdateError = [];
	var beaconRemoveError = [];
	var updatedBeacons = [];

	forEachAsync.forEachAsync(beaconDetails.beaconIdsArray, function (next, element, index, beacon) {	
		beaconModel.checkBeacons(element, beaconDetails.locId)
		.then(function (beaconDoc) {
			if (!beaconDoc) {
				beaconsNoFound.push(element);
				next();
			} else {
				employeeModel.checkEmployeeBeacon(element, beaconDetails.locId)
				.then(function (empDoc) {
					if (empDoc) {
						empDoc.beaconId = null;
						empDoc.save(function (err) {	// save updated employees
							if (err) {
								logger.error("Beacon Un-Assignment: employee update error: "+ err);
								empUpdateError.push(element);
								next();
							} else {
								beaconDoc.remove(function(err) {
									if(err) {
										logger.error("Beacon Un-Assignment: beacon remove error: "+ err);
										beaconRemoveError.push(element);
										next();
									} else {
										updatedBeacons.push(element);
										next();
									}
								});
							};
						});
					} else {
						beaconDoc.remove(function(err) {
							if(err) {
								logger.error("Beacon Un-Assignment: beacon remove error: "+ err);
								beaconRemoveError.push(element);
								next();
							} else {
								updatedBeacons.push(element);
								next();
							}
						});
					}
				}, function (err) {
					logger.error("Beacon Un-Assignment: Employee Beacon search error: "+ err);
					next();
				});
			}
		}, function (err) {
			logger.error("Beacon Un-Assignment: Beacon search error: "+ err);
			next();
		});

	  // then after all of the elements have been handled 
	  // the final callback fires to let you know it's all done 
	  }).then(function () {
	  	logger.info('Beacon Un-Assignment : processing finished');
	  	var resObj = {};
	  	resObj.beaconsNoFound = beaconsNoFound;
	  	resObj.empUpdateError = empUpdateError;
	  	resObj.beaconRemoveError = beaconRemoveError;
	  	resObj.updatedBeacons = updatedBeacons;
	  	deferred.resolve(resObj);
	  });

	return deferred.promise;
};

var unpairBeaconInd = function(beaconDetails) {
	var deferred = Q.defer();

	var beaconsNoFound = [];
	var beaconsUnAssign = [];
	var empNoFound = [];
	var updateError = [];
	var updatedBeacons = [];

	forEachAsync.forEachAsync(beaconDetails.beaconIdsArray, function (next, element, index, beacon) {	
		beaconModel.checkBeacons(element, beaconDetails.locId)
		.then(function (beaconDoc) {
			if (!beaconDoc) {
				beaconsNoFound.push(element);
				next();
			} else {	// beacon found with assigned status
				if (beaconDoc._doc.status !== 'PAIRED') {
					beaconsUnAssign.push(element);
					next();
				} else {
					employeeModel.checkEmployeeBeacon(element, beaconDetails.locId)
					.then(function (empDoc) {
						if (!empDoc) {
							empNoFound.push(element);
							next();
						} else {	// Employee found
							var oldBeaconId = empDoc._doc.beaconId;
							empDoc.beaconId = null;
							beaconDoc.status = 'UNPAIRED';
							beaconDoc.employeeId = null;
							empDoc.save(function (err) {	// save updated employees
								if (err) {
									logger.error("Beacon Un-pair: employee update error: "+ err);
									updateError.push(element);
									next();
								} else {
									beaconDoc.save(function (err) {	// save updated beacons
										if (err) {
											logger.error("Beacon Un-Pair: Beacon update error: "+ err);
											updateError.push(element);
											// revert changes for empDoc since error
											empDoc.beaconId = oldBeaconId;
											empDoc.save(function (err) {
												if (err) {
													logger.error("Beacon Un-Pair: Employee Beacon revert error: "+ err);
													deferred.reject(err);
												} else {
													next();
												};
											});
										} else {
											updatedBeacons.push(element);
											next();
										};
									});
								};
							});
						}
					}, function (err) {
						logger.error("Beacon Un-Pair: Employee Beacon search error: "+ err);
						next();
					});
				};
			}
		}, function (err) {
			logger.error("Beacon Un-Pair: Beacon search error: "+ err);
			next();
		});

	  // then after all of the elements have been handled 
	  // the final callback fires to let you know it's all done 
	  }).then(function () {
	  	logger.info('Beacon Un-Pair : processing finished');
	  	var resObj = {};
	  	resObj.beaconsNoFound = beaconsNoFound;
	  	resObj.beaconsUnAssign = beaconsUnAssign;
	  	resObj.empNoFound = empNoFound;
	  	resObj.updateError = updateError;
	  	resObj.updatedBeacons = updatedBeacons;
	  	deferred.resolve(resObj);
	  });	

	return deferred.promise;
}

// Fetch Beacon Details
var fetchBeaconDetails = function (searchParams, beaconId) {
	var deferred = Q.defer();

	beaconModel.fetchBeaconDetails(searchParams, beaconId)
	.then(function (result) {
		deferred.resolve(result);
	}, function (err) {
		deferred.reject(err);
	});

	return deferred.promise;
};

// Fetch Beacon Details with Employee Details
var fetchBeaconWithEmployeeDetails = function (searchParams, beaconUniqId) {
	var deferred = Q.defer();
	var empNoFound = [];
	var searchResult = [];

	(function (exports) {
	  'use strict';
	 
	  var Sequence = exports.Sequence || require('sequence').Sequence
	    , sequence = Sequence.create()
	    , err
	    ;

	/* Using sequence package to make callback sync for maintaining atomic DB transactions */
	sequence
		.then(function (next) {
			fetchBeaconDetails(searchParams, beaconUniqId)
			.then(function (beaconDocs) {
				next(beaconDocs)
			}, function (err) {
				err.code = 901;
				deferred.reject(err);
			});
		})
		.then(function (next, beaconDocs) {
			if (beaconDocs && beaconDocs.length > 0) {
				forEachAsync.forEachAsync(beaconDocs, function (next, beaconDoc, index, beaconDocs) {
					if (beaconDoc.location && beaconDoc.employeeId) {
						employeeModel.checkEmployeeBeacon(beaconDoc.beaconId, beaconDoc.location)
						.then(function (empDoc) {
							beaconDoc._doc.employee = empDoc;
							next();
						}, function (err) { 
							err.code = 902;
							logger.error("Beacon Search: Error in finding employee: " + err);
							deferred.reject(err);
						});
					} else {	// No EmployeeID availabel .. since the  status would be unassigned.. so employee details available
						beaconDoc._doc.employee = null;
						next();
					};
				}).then(function () {
					deferred.resolve(beaconDocs);
				});
			} else { 
				deferred.resolve(beaconDocs);
			};
		})
	}('undefined' !== typeof exports && exports || new Function('return this')()));

	return deferred.promise;
};

// Fetch Employee Details and Beacon Details
var fetchEmployeeAndBeaconSearchResults = function (searchParams, beaconUniqId) {
	var deferred = Q.defer();
	var searchResult = {};

	(function (exports) {
	  'use strict';
	 
	  var Sequence = exports.Sequence || require('sequence').Sequence
	    , sequence = Sequence.create()
	    , err
	    ;

	/* Using sequence package to make callback sync for maintaining atomic DB transactions */
	sequence
		.then(function (next) {	// Search beacons with user input beacon values
			fetchBeaconWithEmployeeDetails(searchParams, beaconUniqId)
			.then(function (beaconDocs) {
				searchResult.beaconDocs = beaconDocs;
				next(searchResult);
			}, function (err) {
				err.code = 303;
				deferred.reject(err);
			});
		})
		.then(function (next, searchResult) {	// search employees with user input employeeid / name values
			employeeModel.fetchEmployeeLikeIdOrName(searchParams)
			.then(function (empDocs) {
				searchResult.empDocs = empDocs;
				deferred.resolve(searchResult);
			}, function (err) {
				err.code = 304;
				deferred.reject(err);
			});
		})
	}('undefined' !== typeof exports && exports || new Function('return this')()));

	return deferred.promise;
};

var fetchSearchResults = function (searchParams, beaconUniqId) {
	var deferred = Q.defer();

	var page = (searchParams && searchParams.hasOwnProperty('page')) ? searchParams.page : null;

	if (page === "assignIndiviual") {
		fetchEmployeeAndBeaconSearchResults(searchParams, beaconUniqId)
		.then(function (result) {
			deferred.resolve(result);
		}, function (err) {
			deferred.reject(err);
		});
	} else if (page === "viewAndSearch") {
		fetchBeaconWithEmployeeDetails(searchParams, beaconUniqId)
		.then(function (result) {
			deferred.resolve(result);
		}, function (err) {
			deferred.reject(err);
		});
	} else {
		var err = new Error("Incomplete Request Parameters: 'page' GET request parama missing");
		err.code = 301;
		deferred.reject(err);
	}

	return deferred.promise;
};

var fetchAssignedBeaconDetails = function(beaconDetails) {
	var deferred = Q.defer();

	beaconModel.fetchAssignedBeaconDetails(beaconDetails)
	.then(function (result) {
		deferred.resolve(result);
	}, function (err) {
		deferred.reject(err);
	});

	return deferred.promise;
}

// exports section 
exports.checkBeacons = checkBeacons;
exports.beaconAction = beaconAction;
exports.fetchBeaconDetails = fetchBeaconDetails;
exports.fetchSearchResults = fetchSearchResults;
exports.pairBeaconInd = pairBeaconInd;
exports.fetchAssignedBeaconDetails = fetchAssignedBeaconDetails;