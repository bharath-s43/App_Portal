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
var error = require('../../util/error-message').error;
var display = require('../../util/display-message').display;
var brandService = require('../../services/brand-service');

var roleConstants = require('../../util/role-constants');
var userRoleService = require('../../services/user-role-service');

// POST API - For customer Registration
router.post(['/'], function (req, res) {
	var message = utils.messageFactory();

	var brandDetails = req.reqBody || null;	// brand details data in POST Request body

	if (brandDetails && ((req.searchParams && req.searchParams['custId'] === brandDetails.custId)
		|| (req.searchParams && req.searchParams['brandId'] === brandDetails.brandId)  
		|| (req.userData.role_id.roleName === roleConstants["SA"])))
	{
		var brandName = brandDetails.name || null;
		brandService.checkBrand(brandName)	// check brand if already exists
		.then(function success(result) {
			if (result && result.length > 0) {	// if exists
				utils.throwError(true, error.E0209, 200, error.E0209, {"id": result[0]._id, "bid": result[0].bid}, res);
			} else {	// else save brand in db
				brandService.configureBrand(brandDetails)
				.then(function success(result) {
					message.displayMessage = display.D0201.replace("<brandName>", result.name);
					message.data = {"id": result._id, "bid": result.bid};
					utils.jsonWriter(message, 200, res);
				}, function failure (err) {
					if(err.code && err.code == 901) {
						logger.error("Brand Configuration: Error in registering brand: " + err);
						utils.throwError(999, error.E0014, 200, error.E0014, null, res);
					} else if(err.code && err.code == 902){
						logger.error("Brand Configuration: Error in registering brand: " + err);
						utils.throwError(999, error.E0015, 200, error.E0015, null, res);
					} else {
						logger.error("Brand Configuration: Error in configuring brand: " + err);
						utils.throwError(true, error.E0201, 200, error.E0201, null, res);
					}
				});
			}
		}, function failure (err) {
			logger.error("Brand Registration: Error in checking brand in database: " + err);
			utils.throwError(999, err.message, 200, error.E0201, null, res);
		});
	} else {
		var errMsg = "Auth Error: Error in authorizing brand registration";
		logger.error(errMsg);
		utils.throwError(999, errMsg, 403, error.E0906.replace(/<entity>/g, req.userRelation.key), null, res);
	};
});

// GET API For fetching brand details
/**
 * @api {get} /brand Retrieve brands
 * @apiSampleRequest http://test.github.com/some_path/
 * @apiSampleRequest http://test.github.com/some_path1/
 * @apiDescription This api retrieves brands. It is used to get the details of brands based on parameters provided.
 * If no parameter is provided it returns all brands. If brand id is provided it retrieves specific brand with that brand id.
 * If customer id is provided it returns all brands belonging to that customer.
 * @apiName GetBrands
 * @apiGroup Brands
 * @apiHeader {String} Authorization user jwt authorization header
 * @apiParam {-} no-param retrieve all brands.<br> eg - https://applause-dev.appspot.com/api/v1/brand
 * @apiParam {api-parameter} /:brandId retrieve brand based on brand id.<br> eg - https://applause-dev.appspot.com/api/v1/brand/42ffffwrwer2344
 * @apiParam {query-parameter} custId retrieve brand based on brand id.<br> eg - https://applause-dev.appspot.com/api/v1/brand/?custId=42fffgtevgjhj44
 * @apiSuccessExample {json} Success-Response:
 	{
	  "code": 0,
	  "errorMessage": "",
	  "displayMessage": "Brand details fetched successfully.",
	  "data": [
	    {
	      "_id": "58be7c2ff468391000c13a4e",
	      "bid": 157,
	      "name": "Applebee's",
	      "ratingImgId": "57d9640125c8c3b8087b4386",
	      "brandType": {
	        "updatedAt": "2016-10-21T09:08:28.258Z",
	        "createdAt": "2016-10-21T09:08:28.258Z",
	        "isDeleted": 0,
	        "isActive": 1,
	        "feedbackReasonsLocation": [
	          "Food",
	          "Beverages",
	          "Service",
	          "Cleanliness",
	          "Design/Decor or Ambiance",
	          "Noise level",
	          "Other"
	        ],
	        "feedbackReasonsEmployee": [
	          "Speed Of Service",
	          "Communication",
	          "Knowledge",
	          "Attention to Details",
	          "Courtesy",
	          "Other"
	        ],
	        "brandType": "Restaurant",
	        "id": "5809db0cf24ab2600dbb3714"
	      },
	      "customer": {
	        "_id": "58be7aaff468391000c13a46",
	        "name": "Dine Equity, Inc.",
	        "id": "58be7aaff468391000c13a46"
	      },
	      "locations": [
	        {
	          "id": "58be8275f468391000c13a6b",
	          "lid": 183
	        },
	        {
	          "id": "58be8297f468391000c13a6c",
	          "lid": 184
	        }
	      ],
	      "roles": [
	        {
	          "_id": "58d8fcff3d72ed901a82baee",
	          "role_type": "Manager",
	          "brandId": "58be7c2ff468391000c13a4e",
	          "updatedAt": "2017-03-27T11:52:31.676Z",
	          "feedbackReasons": [
	            "SpeedOfService  ",
	            "Communication  ",
	            "Knowledge  ",
	            "AttentiontoDetails  ",
	            "Courtesy  ",
	            "Other  "
	          ]
	        }
	      ],
	      "locationReasons": [
	        "Food ",
	        "Beverages ",
	        "Service ",
	        "Cleanliness ",
	        "Design/DecororAmbiance ",
	        "Noiselevel ",
	        "Other"
	      ],
	      "defaultReasons": [
	        "SpeedOfService  ",
	        "Communication  ",
	        "Knowledge  ",
	        "AttentiontoDetails  ",
	        "Courtesy  ",
	        "Other  "
	      ],
	      "empPersonlizationPrefix": "Eating good means",
	      "adminContact": {
	        "userId": {
	          "verificationStatus": "PV",
	          "emailVerified": 0,
	          "id": "58d8fcff3d72ed901a82baec"
	        },
	        "contactNo": null,
	        "email": "admin.two@applebees.com",
	        "name": "admin two"
	      },
	      "primaryContact": {
	        "userId": {
	          "verificationStatus": "PV",
	          "emailVerified": 0,
	          "id": "58d8fcff3d72ed901a82baed"
	        },
	        "contactNo": null,
	        "email": "admin.one@applebees.com",
	        "name": "admin one"
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
	      "logo_img": "BkFxGM2qx.png",
	      "logoImgUrl": "http://storage.googleapis.com/applause-dev-img-sneha/brand_img/BkFxGM2qx.png",
	      "id": "58be7c2ff468391000c13a4e"
	    }
	  ]
	}
 * @apiError (Errors - code) {Object} true brand not found for parameters.
 * @apiError (Errors - code) {Object} 999 All errors.
 */
router.get(['/', '/:brandId'], function (req, res) {
	var message = utils.messageFactory();
	var searchParams = req.query || {};

	var brandId = req.params['brandId'] || null;
	var isAuthError = false;

		if (Object.keys(searchParams).length === 0 
			&& brandId === null 
			&& req.userData 
			&& userRoleService.USER_ROLES[req.userData.role_id._id] !== roleConstants["SA"]) 
		{
			// logger.error("Brand Fetch: Brand ID is absent in request.");
			// utils.throwError(true, error.E0211, 200, error.E0211);
			if (Object.keys(searchParams).length !== 0) {
				for (var key in searchParams) {
					if (req.searchParams[key]) {
						searchParams[key] = req.searchParams[key];
					};
				};
			} else { 
				isAuthError = (Object.keys(req.searchParams).length > 0) ? false : true;
				searchParams = req.searchParams;
			}
		} else if (Object.keys(searchParams).length > 0 && Object.keys(req.searchParams).length > 0 ) {

			if (req.searchParams['custId'] && req.searchParams['custId'] !== searchParams['custId']) {
				isAuthError = true;
			};

			if (req.searchParams['brandId'] && req.searchParams['brandId'] !== searchParams['brandId']) {
				isAuthError = true;
			};
		};

		if (isAuthError) {
			var errMsg = "Auth Error: Error in authorizing brand fetch.";
			logger.error(errMsg);
			utils.throwError(999, errMsg, 403, error.E0906.replace(/<entity>/g, req.userRelation.key), null, res);
		} else {
			brandService.fetchBrandDetails(searchParams, brandId)
			.then (function success(result) {
				if (result && result.length > 0) {
					message.displayMessage = display.D0202;
					message.data = result;
					utils.jsonWriter(message, 200, res);
				} else {
					var err = true;
					var errorMessage = error.E0202;
					var displayMessage = error.E0203;
					var data = [];
					utils.throwError(err, errorMessage, 200, displayMessage, data, res);
				};
			}, function failure(err) {
				logger.error("brand fetch: Error in searching brand in database: " + err);
				utils.throwError(999, error.E0204, 200, error.E0204, null, res);
			});
		};
});

// DELETE API - For brand deletion
router.delete(['/'], function (req, res) {
	var message = utils.messageFactory();

	var brandDetails = req.reqBody || null;	// location Id to delete

	if(req.searchParams) {
		var custId = req.searchParams['custId'] ? req.searchParams['custId'] : null;
	} else {
		var custId = null;
	}

	var brandIds = [];

	brandDetails.brandIds.forEach(function(element, index){
		brandIds.push(mongoose.mongo.ObjectId(element));
	});

	brandService.deleteBrand(brandIds, custId)
	.then(function success(result) {
		if(result && result.brandsDeleted) {
			message.displayMessage = display.D0203;
		} else {
			message.displayMessage = display.D0204;
		}
		utils.jsonWriter(message, 200, res);
	}, function failure (err) {
		if (err.code === 222) {
			logger.error("Auth error: " + err);
			utils.throwError(999, err.message, 403, error.E0904.replace(/<entity>/g, req.userRelation.key), null, res);
		} else {
			logger.error("Brand Deletion: " + err);
			utils.throwError(true, error.E0205, 200, error.E0205, null, res);
		};
	});
});

// PUT API - For brand updation
router.put('/:brandId', function (req, res) {
	var message = utils.messageFactory();
	var brandUniqId = req.params['brandId'] || null;
	var brandDetails = req.reqBody || null;	// Brand details data in PUT Request body
	var brandName = brandDetails.name;

	brandService.checkBrand(brandName)	// check brand if already exists
		.then(function success(result) {
			if (result && result.length > 0 && result[0].id != brandUniqId) {	// if exists
				utils.throwError(true, error.E0209, 200, error.E0209, {"id": result[0]._id, "bid": result[0].bid}, res);
			} else {
				brandService.updateBrand(brandDetails, brandUniqId)
				.then(function success(brandResult) {
					message.displayMessage = display.D0205.replace("<brandName>", brandResult.name);
					message.data = {"id": brandResult._id, "lid": brandResult.bid};
					utils.jsonWriter(message, 200, res);
				}, function failure (err) {
					if(err.code && err.code == 901) {
						logger.error("Brand Update: Error in updating brand: " + err);
						utils.throwError(999, error.E0014, 200, error.E0014, null, res);
					} else if(err.code && err.code == 902){
						logger.error("Brand Update: Error in updating brand: " + err);
						utils.throwError(999, error.E0015, 200, error.E0015, null, res);
					} else {
						logger.error("Brand Update: Error in updating Location: " + err);
						utils.throwError(999, error.E0206, 200, error.E0206, null, res);
					}
				});
			}
		}, function failure (err) {
			logger.error("Brand Updation: Error in checking brand in database: " + err);
			utils.throwError(999, err.message, 200, error.E0201, null, res);
		});

});

// exports section
module.exports = router;