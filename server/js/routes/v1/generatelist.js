// Express router
var router = require('express').Router();
var Q = require('q');
var fs=require('fs');
// var mongoose = require('mongoose');
// // mail funcionality
// var nodemailer = require('nodemailer');
// var hbs = require('nodemailer-express-handlebars');
// // services and other utilities
var logger = require('../../util/log').get();
var utils = require('../../util/utils');
// var error = require('../../util/error-message').error;
// var display = require('../../util/display-message').display;
// var customerService = require('../../services/customer-service');


function createlist(index,folder)
{
		const testFolder = './public/assets/'+folder;
  var str=""; var i=0;
fs.readdir(testFolder, (err, files) => {

  files.forEach(file => {

    str+="http://applause-143518.appspot.com/assets/"+folder+file+"\r\n";
    if(i==0){
    	
    	i=i+1;
    }
  });
  if(index==1)
  {
  	fs.writeFile('./public/assets/list.txt', str);
  }
  else
  {
  	fs.appendFile('./public/assets/list.txt', str)
  }


})
}
// POST API - For Generate List
router.post(['/'], function (req, res) {
	logger.info("posted to generate list ");
	if(req.body.status=="ajax")
	{
	
	createlist(1,'brand_img/');
	createlist(2,'emp_img/');
	createlist(2,'loc_img/');
	// .then(function success(result) {
		var message = utils.messageFactory();
				// message.displayMessage ="list created successfully";
				message = {"displayMessage": "list created successfully"};
				utils.jsonWriter(message, 200, res);
			}
		
});


module.exports = router;