var router = require('express').Router();
var utils = require('../../util/utils');
var env = require('../../conf/config.js').env;
var assetUri = require("../../conf/v1/config-" + env +".js").const.CLOUD_IMAGE_URL;
/*
 * GET API for asset uri
 */
router.get(['/'], function (req, res) {
	var message = utils.messageFactory();

	message.displayMessage = "Got the url succesfully.";
	message.data = {};
	message.data.assetUri = assetUri;
	utils.jsonWriter(message, 200, res);
});

// exports section
module.exports = router;