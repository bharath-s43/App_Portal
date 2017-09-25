var Q = require('q');
// import files
var logger = require('../util/log').get();
var utils = require('../util/utils');


var nodemailer = require('nodemailer');
//reference the plugin
var hbs = require('nodemailer-express-handlebars');

var sendMail = function (mailOptionsVariable) {

	var transporter = nodemailer.createTransport({
					    host: 'smtp-relay.gmail.com',
					    port: 587,
					    secure: false, // use SSL
					    auth: {
					        user: 'account-verification@applauseapi.com',
					        pass: 'App2016lause'
					    },
					    tls: {rejectUnauthorized: false}
					});

	// var transporter = nodemailer.createTransport({
	// 				    host: 'smtp.gmail.com',
	// 				    port: 465,
	// 				    secure: true, // use SSL 
 // 					    auth: {
	// 				        user: 'applause.pratik@gmail.com',
	// 				        pass: 'applause2016'
 // 					    },
 // 					    tls: {rejectUnauthorized: false}
 // 					});

					transporter.use('compile', hbs({
						viewPath : './public',
						extName : '.hbs'
					}));

					// setup e-mail data with unicode symbols
					var mailOptions = {
					    from: '"Applause Login" <account-verification@applauseapi.com>', // sender address
					    text: 'Please activate your account' // plaintext body
					};

					mailOptions.to = mailOptionsVariable.to;
					mailOptions.subject = mailOptionsVariable.subject;
					mailOptions.template = mailOptionsVariable.template;
					mailOptions.context = mailOptionsVariable.context;

					// send mail with defined transport object
					transporter.sendMail(mailOptions, function(error, info){
					    if(error){
					        return console.log(error);
					    }
					    console.log('Message sent: ' + info.response);
					});
}

exports.sendMail = sendMail;