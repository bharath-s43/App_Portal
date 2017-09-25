var MobileDetect = require('mobile-detect');
var replace = require("replace");

/** Get runtime settings based on command-line arguments: dev, prod, etc. with defaults */
var commandLineArgs = require('minimist')(process.argv.slice(2));
var env = commandLineArgs['env'] || 'dev';
var forcePort = commandLineArgs['forcePort'];

var cloud_bucket = process.env.CLOUD_BUCKET || 'applause-dev-img';
var project_id = process.env.PROJECT_ID || 'applause-dev';
var db_host = process.env.DB_HOST || '127.0.0.1';

replace({
    regex: "<host>",
    replacement: db_host,
    paths: ['./js/conf/v1/config-dev.js'],
    recursive: true,
    silent: true,
});
replace({
    regex: "<project_id>",
    replacement: project_id,
    paths: ['./js/conf/v1/config-dev.js'],
    recursive: true,
    silent: true,
});
replace({
    regex: "<cloud_bucket>",
    replacement: cloud_bucket,
    paths: ['./js/conf/v1/config-dev.js'],
    recursive: true,
    silent: true,
});

var configV1 = require('./js/conf/config').set(env).get(1);

// for gcp debugging
require('@google-cloud/debug-agent').start({ allowExpressions: true });

var os = require('os'),
	express = require('express'),
	cfenv = require('cfenv'),

	http = require('http'),

	utils = require('./js/util/utils'),
	logger = require('./js/util/log').init(configV1),
	jwt = require('./js/util/jwt');

	db = require('./js/util/connection').initDB(configV1);

	aclService = require('./js/services/acl-service'),
	userService = require('./js/services/user-service'),
	userRoleService = require('./js/services/user-role-service'),
	validationService = require('./js/services/validation-service'),
	
	userRoleService.populateRoleConstants();
	/** routes */
	// USER API
	users = require('./js/routes/v1/user'),
	login = require('./js/routes/v1/user-login'),
	pin = require('./js/routes/v1/pin'),
	guest = require('./js/routes/v1/guest'),
	//to generate image list on google server
	generatelist=require('./js/routes/v1/generatelist'),
	// CUSTOMER API
	customer = require('./js/routes/v1/customer'),
	// BRAND API
	brand = require('./js/routes/v1/brand'),
	brandType = require('./js/routes/v1/brand-type'),
	// LOCATION API
	location = require('./js/routes/v1/location'),
	// EMPLOYEE API
	employee = require('./js/routes/v1/employee');
	employeeHistory = require('./js/routes/v1/employee-history');
	// FEEDBACK API
	feedback = require('./js/routes/v1/feedback');
	// Roles
	role = require('./js/routes/v1/role');
	// USER ROLES
	userRole = require('./js/routes/v1/user-role');
	// RATING
	rating = require('./js/routes/v1/rating');
	// BEACON
	beacon = require('./js/routes/v1/beacon');
	beaconStatus = require('./js/routes/v1/beacon-status');
	//Forgot Password
	forgotPassword = require('./js/routes/v1/forgot-password');
	//Static Content
	reason = require('./js/routes/v1/reason');
	staticContent = require('./js/routes/v1/static-content');
	//Invite Api
	invite = require('./js/routes/v1/invite');
	//Interaction Api
	interaction = require('./js/routes/v1/interaction');
	// ui controls rendering based upon roles
	uiControls = require('./js/routes/v1/ui-controls');
	//Asset uri api
	assetPath = require('./js/routes/v1/asset-path');
	//Messages
	errorMessages = require('./js/util/error-message').error;
	displayMessages = require('./js/util/display-message').display;
	/** Published production routes */

var app = express();
var appEnv = cfenv.getAppEnv();

//set constant in utils to be used across app
utils.setConstants(configV1.const);

if (forcePort) {
	logger.warn('Port forced to ' + forcePort + '.');
}
var port = forcePort || appEnv.port || configV1.app.port;

require('./js/conf/config').appInit(app, express, __dirname);

if (!commandLineArgs['env']) {
	logger.warn('Environment switch not passed in - defaulting to `dev`.');
} else {
	logger.info('Received environment switch for env: ' + commandLineArgs['env'] + '.');
}

app.use(function (req, res, next) {
	req.fullPath = req.path;
	next();
});

// app.use('*', function (req, res, next) {
// 	jwt.verify(req, res, next);
// });

app.use(function (req, res, next) {
	var ip, device, os = 'unknown';
	
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
	
	var ua = req.headers['user-agent'] || null;
	if (ua) {
		md = new MobileDetect(ua);
		if (null === md.mobile()) {	// Desktop device detection
			device = "Desktop ";
			if (ua.indexOf("Firefox/") !== -1) {
				device = "Firefox";
			} else if (ua.indexOf("Chrome/") !== -1 && ua.indexOf("Chromium/") === -1) {
				device = "Chrome";
			} else if (ua.indexOf("Chromium/") !== -1) {
				device = "Chromium";
			} else if (ua.indexOf("Safari/") !== -1 && (ua.indexOf("Chrome/") === -1 || ua.indexOf("Chromium/") === -1)) {
				device = "Safari";
			} else if (ua.indexOf("OPR/") !== -1 || ua.indexOf("Opera/") !== -1) {
				device = "Opera";
			} else if (ua.indexOf("MSIE ") !== -1) {
				device = "IE";
			}
		} else {	// mobile device detection
			if (md.phone()) {
				device = md.phone();
			} else if (md.tablet()) {
				device = md.tablet();
			} else {
				device = md.userAgent();
			}
			os = md.os();
		}
	};

	console.time(req.url);
	logger.info(req.method, req.url, res.statusCode, ip, device, os ? os : '', req.get('deviceId'));

	next();
});

app.use(function (req, res, next) {
	require('./js/util/utils').setResponse(res);
	require('./js/util/utils').setRequest(req);
	next();
});


app.use(function (req, res, next) {
	var reqBody = null;

	try {
		reqBody = req.body || null;
	} catch (e) {
		logger.error("Reuest body parsing error !!!");
		utils.throwError('Reuest error', 'Request body parsing error !!!', 400);
	} finally {
		req.reqBody = reqBody;
	}
	
	next();
});

app.use(function (req, res, next) {
	var usrType = req.get('usrType') || null;
	var deviceId = req.get('deviceId') || null;

	if (usrType === "GS" && !deviceId) {
		logger.error("Mandatory Request Headers absent!!!");
		utils.throwError(true, 'Mandatory Request Headers absent !!!', 401, "Mandatory Request Headers absent");
	} else {
		req.usrType = usrType;
		req.deviceId = deviceId;

		// Determine if auth needs to be bypass or not
		var isByapss = false;

		var bypass_method = null;
		for (var key in configV1.bypassAuth) {
			if (req['fullPath'].match(key)) {
				bypass_method = configV1.bypassAuth[key];
			}
		}
		var http_methods = bypass_method || null;
		(http_methods && Array.isArray(http_methods) && (http_methods.includes(req['method']))) ? isByapss = true : isByapss = false;
		
		if (isByapss) {
			next();
		} else {
			req.userData = jwt.getUserDataFromToken(req, res);
			if (!req.userData) {
				utils.throwError(true, "JWT Token absent / corrupted.", 401, errorMessages.E0904);
			} else {
				logger.info("User Role: " + req.userData.role_id.roleName);
				(function (exports) {
				  'use strict';
				 
				  	var Sequence = exports.Sequence || require('sequence').Sequence
					    , sequence = Sequence.create()
					    , err
					    ;

					/* Using sequence package to make callback sync for maintaining atomic DB transactions */
					sequence
						.then(function (nextSeq) {
							//aclService.addUserRoles();
							var resource = null;
							try {
								resource = req['fullPath'].split('/')[3];
								
								var reqArr = req['fullPath'] && req['fullPath'].split('/') || [];
								var strtInd = reqArr.length - configV1.const.SKIPPABLE_PATH_PARTS; // 4 parts to skip before id in path
								var reqId = reqArr[reqArr.length - strtInd] || null;
								logger.info("ReqId :" + reqId);

								// populate req object with needed data
								req.reqId = reqId;
								req.resource = resource;
								req.userRelation = null;

								if (req.userData.userRelation) {
									req.userRelation = {};
									req.userRelation.id = req.userData.userRelation.id && req.userData.userRelation.id || null;
									req.userRelation.key = req.userData.userRelation.key;
								} else {
									req.userRelation = null;
								};

								// check authorization
								aclService.isAllowed(req.userData._id.toString(), resource.toLowerCase(), req['method'].toLowerCase())
									.then(function (result) {
										nextSeq(result);
									}, function (err) {
										logger.error("ACL Error: " + err);
										utils.throwError(true, errorMessages.E901, 403, errorMessages.E901);	
									});
							} catch (err) {
								logger.error("ACL Error :" + err);
								utils.throwError(true, 'ACL Error: incorrect resource format.', 500, errorMessages.E0903);
							};
							}
						)
						.then(function (nextSeq, isAllowed) {
							if (isAllowed) {
								if (req.userData && req.userData._id) {
									if (req.userData.role_id.roleName === "guest") {
										next();
									} else {
										userService.checkUserById(req.userData._id)
										.then(function (userDoc) {
											if (userDoc) {
												next();
											} else {
												logger.error("User Authentication: User not found.");
												utils.throwError(true, 'User not found.', 403, "User not found.");	
											};
										}, function (err) {
											logger.error("User Authentication: " + err);
											utils.throwError(true, 'User Authentication failed.', 401, "User Authentication failed");
										});
									}
								} else {
									utils.throwError(true, 'User Authentication: User Token Data not found.', 403, "User Authentication: User Token Data not found.");
								};
							} else {
								utils.throwError(true, errorMessages.E0902, 403, errorMessages.E0902);
							};
					 		}
						)
				}('undefined' !== typeof exports && exports || new Function('return this')()));
			};

		}; // isBypass else loop end

	}; // header else loop end

});

// middleware to check if the usrRelation Id in decrypted JWT token and request Id matches and valid in database
app.use(function (req, res, next) {


	if (req.userRelation) {
		if (req.reqId) {
			validationService.validateEntities(req.userRelation.id, req.reqId, req.userRelation.key, req.resource, req)
			.then(function (result) {
				if (result) {
					logger.info("Context user relation Parameters: " + JSON.stringify(req.searchParams));
					next();
				} else {
					var errMsg = "<entity> Fetch: <entity> admin not authorized since token id and request id mismatch.";
					errMsg = errMsg.replace(/<entity>/g, req.userRelation.key);
					logger.error(errMsg);
					utils.throwError(999, errMsg, 403, errorMessages.E0906.replace(/<entity>/g, req.userRelation.key), null, res);
				};
			}, function (err) {
				var errMsg = "<entity> request validation check: " + err;
				errMsg = errMsg.replace("<entity>", req.userRelation.key);
				logger.error(errMsg);
				utils.throwError(999, errMsg, 200, errorMessages.E0903, null, res);
			});
		} else {
			validationService.setRequestNamespace(req)
			.then(function (result) {
				logger.info("Context user relation Parameters: " + JSON.stringify(req.searchParams));
				next();
			}, function (err) {
				var errMsg = "<entity> request validation check: " + err;
				errMsg = errMsg.replace("<entity>", req.userRelation.key);
				logger.error(errMsg);
				utils.throwError(999, errMsg, 200, errorMessages.E0903, null, res);
			});
		};
	} else {
		next();
		req.searchParams = {};
		logger.info("Context user relation Parameters: " + JSON.stringify(req.searchParams));
	};
});

// app.param("userId", function (req, res, next, userId) {
// 	req.userId = userId;
// 	next();
// });

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/public/docs/'));

// images uploaded paths -- used by app do not change
// app.use('/public/images/emp_img/', express.static(__dirname + '/public/images/emp_img/'));
// app.use('/public/images/loc_img/', express.static(__dirname + '/public/images/loc_img/'));
// app.use('/public/images/brand_img/', express.static(__dirname + '/public/images/brand_img/'));


/** REST endpoints - one per noun. */
// USER
app.use('/api/v1/users', users);
app.use('/api/v1/login', login);
app.use('/api/v1/guest', guest);
app.use('/api/v1/pin', pin);
// CUSTOMER
app.use('/api/v1/customer', customer);
// BRAND
app.use('/api/v1/brand', brand);
app.use('/api/v1/brandType', brandType);
// LOCATION
app.use('/api/v1/location', location);
// EMPLOYEE
app.use('/api/v1/employee', employee);
app.use('/api/v1/employeeHistory', employeeHistory);
// FEEDBACK
app.use('/api/v1/feedback', feedback);
// Roles
app.use('/api/v1/role', role);
// USER ROLES 
app.use('/api/v1/userRole', userRole);
// RATING
app.use('/api/v1/rating', rating);
// BEACON
app.use('/api/v1/beacon', beacon);
app.use('/api/v1/beaconStatus', beaconStatus);
//Forgot Password
app.use('/api/v1/forgotPassword', forgotPassword);
//static content
app.use('/api/v1/reason', reason);
app.use('/api/v1/staticContent', staticContent);
//Invite Contact
app.use('/api/v1/invite', invite);
//Interaction
app.use('/api/v1/interaction', interaction);
//Generate images list
app.use('/api/v1/generatelist', generatelist);
// ui-controls for ui rendering based upon roles
app.use('/api/v1/uiControls', uiControls);
//Get asset Path
app.use('/api/v1/assetPath', assetPath);

var server = http.createServer(app).listen(port, function () {
	logger.info('Operating System: ' + os.platform() + ' ' + os.arch() + '.');
	logger.info('HTTP/Express server listening on port ' + port + '.');
});

 
