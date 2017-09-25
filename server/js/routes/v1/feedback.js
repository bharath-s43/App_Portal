// Express router
var router = require('express').Router();
var Q = require('q');
// services and other utilities
var logger = require('../../util/log').get();
var utils = require('../../util/utils');
var error = require('../../util/error-message').error;
var display = require('../../util/display-message').display;
var feedbackService = require('../../services/feedback-service');

/**
 * @api {post} /feedback Post Feedback
 * @apiDescription This api is used to post feedbacks through the app. The feedback can be of location or employee.
 * @apiName PostFeedback
 * @apiGroup Feedback
 * @apiHeader {String} Authorization user's jwt authorization token
 * @apiParam (Added field for employee) {String} euId employee unique id

 * @apiParam (Common fields for employee and location) {Number="1-5"} ratingVal rating value from 1 to 5
 * @apiParam (Common fields for employee and location) {String} brandId brand id of the employee
 * @apiParam (Common fields for employee and location) {String} locId location id of the employee
 * @apiParam (Common fields for employee and location) {Array} feedbackReasons feedback reasons array
 * @apiParam (Common fields for employee and location) {String="EMPLOYEE", "LOCATION"} feedbackType feedback type either employee or location
 * @apiParam (Common fields for employee and location) {String="INTERACTION", "KIOSK"} feedbackMode feedback mode either interaction or kiosk
 * @apiParam (Common fields for employee and location) {String} [additionalComment] additional comments if any

 * @apiParamExample {json} Request-Example:
	 {
		"custId":null,
		"ratingVal":2,
		"brandId":"58be7e37f468391000c13a57",
		"feedbackReasons":["Speed Of Service"],
		"feedbackType":"EMPLOYEE",
		"feedbackMode":"INTERACTION",
		"additionalComment":"Shahabuddin",
		"locId":"58be7e51f468391000c13a59",
		"euId":"58be7eaef468391000c13a5c"
	}
 * @apiSuccessExample {json} Success-Response:
	{
		"code":0,
		"errorMessage":"",
		"displayMessage":"Your feedback is recorded successfully. Thank you!",
		"data":{
			"id":"58d9f01a72ff44100090ac8e",
			"fid":1544
		}
	}
 * @apiError (Errors - code) {Object} 999 Error submitting feedback.
 */

// POST API - For Feedback submission
router.post(['/'], function (req, res) {
	var message = utils.messageFactory();

	var feedbackDetails = req.reqBody || null;	// Feedback details data in POST Request body

	feedbackService.submitFeedback(feedbackDetails, req.userData)
	.then(function success (result) {
		if (result) {
			message.displayMessage = display.D0701;
			message.data = {"id": result._id, "fid": result.fid};
			utils.jsonWriter(message, 200, res);
		} else {
			utils.throwError(999, error.E0701, 200, error.E0701, {}, res);
		};
	}, function failure (err) {
		var errMsg = "Feedback Submission: Error in saving employee feedback in database: " + err;
		logger.error(errMsg);
		utils.throwError(999, errMsg, 500, error.E0702, null, res);
	});
});


// GET Request for fetching feedback details
router.get(['/'], function (req, res) {
	var message = utils.messageFactory();

	var searchParams = req.query || [];
	var feedbackId = req.params['feedbackId'] || null;

	feedbackService.fetchFeedbackDetails(searchParams, feedbackId)
	.then(function success (result) {
		if (result && result.length > 0) {
			message.displayMessage = display.D0702;
			message.data = result;
			utils.jsonWriter(message, 200, res);
		} else {
			utils.throwError(200, error.E0703, 200, error.E0703, result, res);
		};
	}, function failure (err) {
		logger.error("Feedback Fetch: Error in fetching employee feedback: " + err);
		utils.throwError(999, err.message, 500, error.E0704, null, res);
	});
});

/**
 * @api {get} /feedback/feedbackDetails Get feedback details
 * @apiDescription This api retrieves feedback details posted by specific user. This api returns aggregates of each feedback
 * and the last five feedbacks posted. 
 * @apiName GetFeedback
 * @apiGroup Feedback
 * @apiHeader {String} Authorization user's jwt authorization token
 * @apiSuccessExample {json} Success-Response:
	{
	  "code": 0,
	  "errorMessage": "",
	  "displayMessage": "Feedback fetched successfully.",
	  "data": [
	    {
	      "locId": "58be7e51f468391000c13a59",
	      "ratingCountEmployee": [
	        {
	          "ratingVal": 1,
	          "count": 0
	        },
	        {
	          "ratingVal": 2,
	          "count": 1
	        },
	        {
	          "ratingVal": 3,
	          "count": 0
	        },
	        {
	          "ratingVal": 4,
	          "count": 0
	        },
	        {
	          "ratingVal": 5,
	          "count": 0
	        }
	      ],
	      "ratingCountLocation": [
	        {
	          "ratingVal": 1,
	          "count": 0
	        },
	        {
	          "ratingVal": 2,
	          "count": 0
	        },
	        {
	          "ratingVal": 3,
	          "count": 0
	        },
	        {
	          "ratingVal": 4,
	          "count": 1
	        },
	        {
	          "ratingVal": 5,
	          "count": 0
	        }
	      ],
	      "feedbackDetails": [
	        {
	          "fid": 1321,
	          "updatedAt": "2017-03-28T06:20:02.660Z",
	          "createdAt": "2017-03-28T06:20:02.660Z",
	          "brand": {
	            "_id": "58be7e37f468391000c13a57",
	            "name": "Logituit",
	            "ratingImgId": {
	              "_id": "57d9640625c8c3b8087b4387",
	              "name": "Smiley",
	              "count": 5,
	              "img": null,
	              "id": "57d9640625c8c3b8087b4387"
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
	          "location": {
	            "_id": "58be7e51f468391000c13a59",
	            "lname": "Pune",
	            "add": "Baner",
	            "img": null,
	            "locImgUrl": null,
	            "id": "58be7e51f468391000c13a59"
	          },
	          "feedbackType": "LOCATION",
	          "feedbackMode": "INTERACTION",
	          "additionalComment": "Shahabuddin",
	          "feedbackReasons": [
	            "Cleaning"
	          ],
	          "ratingVal": 4,
	          "user": {
	            "id": "58be7f79f468391000c13a60",
	            "role_id": "58a720fb4c5dd253754e0e33"
	          },
	          "employee": null,
	          "customer": null,
	          "id": "58da0092ce2270b40bdb01a2"
	        },
	        {
	          "fid": 1320,
	          "updatedAt": "2017-03-28T06:19:34.641Z",
	          "createdAt": "2017-03-28T06:19:34.641Z",
	          "brand": {
	            "_id": "58be7e37f468391000c13a57",
	            "name": "Logituit",
	            "ratingImgId": {
	              "_id": "57d9640625c8c3b8087b4387",
	              "name": "Smiley",
	              "count": 5,
	              "img": null,
	              "id": "57d9640625c8c3b8087b4387"
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
	          "location": {
	            "_id": "58be7e51f468391000c13a59",
	            "lname": "Pune",
	            "add": "Baner",
	            "img": null,
	            "locImgUrl": null,
	            "id": "58be7e51f468391000c13a59"
	          },
	          "feedbackType": "EMPLOYEE",
	          "feedbackMode": "INTERACTION",
	          "additionalComment": "Shahabuddin",
	          "feedbackReasons": [
	            "Speed Of Service"
	          ],
	          "ratingVal": 2,
	          "user": {
	            "id": "58be7f79f468391000c13a60",
	            "role_id": "58a720fb4c5dd253754e0e33"
	          },
	          "employee": {
	            "_id": "58be7eaef468391000c13a5c",
	            "img": "S1QfOW3cl.png",
	            "fullName": {
	              "fname": "Sneha",
	              "lname": "Firodiya",
	              "full": "Sneha Firodiya"
	            },
	            "empImgUrl": "http://storage.googleapis.com/applause-dev-img/emp_img/S1QfOW3cl.png",
	            "id": "58be7eaef468391000c13a5c"
	          },
	          "customer": null,
	          "id": "58da0076ce2270b40bdb01a1"
	        }
	      ]
	    }
	  ]
	}
 * @apiError (Errors - code) {Object} 999 Error fetching feedback.
 */

// GET Request for fetching feedback details
router.get(['/feedbackDetails'], function (req, res) {
	var message = utils.messageFactory();

	var searchParams = req.query || [];

	feedbackService.getFeedbackDetailsForApp(searchParams, req.userData._id)
	.then(function success (result) {
		message.displayMessage = display.D0702;
		message.data = result;
		utils.jsonWriter(message, 200, res);
	}, function failure (err) {
		logger.error("Feedback Fetch: Error in fetching employee feedback: " + err);
		utils.throwError(999, err.message, 500, error.E0704, null, res);
	});
});
// exports section
module.exports = router;