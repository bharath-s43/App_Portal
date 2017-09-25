var Q = require('q');
var nodemailer = require('nodemailer');
//reference the plugin 
var hbs = require('nodemailer-express-handlebars');

var logger = require('../../util/log').get();
var utils = require('../../util/utils');
var otvcDAO = require('../../dao/otvc-dao');

var validateUser = function (userDetails) {
	
	var result = false;

	if(!userDetails.email) {
		result = false;
	}	
	else {
		result = true;
	}

	return result;
}

var validateInsert = function (OTVC) {
	var result = false;

	if(!OTVC.userId || !OTVC.otvc) {
		result = false;
	}
	else {
		result = true;
	}
	return result;
}
 
var getId = function (userDetails) {
	var deferred = Q.defer();

	if(validateUser(userDetails)) {
		otvcDAO.getId (userDetails)
			.then(
				function success(result) {
					deferred.resolve(result);
				}, function failue(err) {
					logger.error('DB Fail:', err);
					deferred.reject(new Error(err));
				}
			);
	}
	else {
		var err = 'otvc: Incomplete information in request !!!'; 
		logger.error(err);
		deferred.reject(new Error(err));
	}

	return deferred.promise;
}

var insertOTVC = function (OTVC, firstName) {
	var deferred = Q.defer();

	if(validateInsert(OTVC)) {
		otvcDAO.insertOTVC (OTVC)
			.then(
				function success(result) {

//					create reusable transporter object using the default SMTP transport 
					// var transporter = nodemailer.createTransport({
					// 	service : 'Yahoo',
					// 	auth : {
					// 		user : 'cashkan2016@yahoo.com',
					// 		pass : '2016cash'
					// 	}
					// });

					var transporter = nodemailer.createTransport({
						    host: 'smtpout.secureserver.net',
						    port: 465,
						    secure: true, // use SSL 
						    auth: {
						        user: 'activate@cashkan.com',
						        pass: 'c#Kan135'
						    },
						    tls: {rejectUnauthorized: false}
					});

					transporter.use('compile', hbs({
						viewPath : './public',
						extName : '.hbs'
					}));
					 
					// setup e-mail data with unicode symbols 
					var mailOptions = {
					    from: '"Cashkan Admin" <activate@cashkan.com>', // sender address 
					    to: OTVC.email, // list of receivers 
					    subject: 'Cashkan OTP', // Subject line
					    template: 'otp_email',
						context : {
						 	firstName : firstName,
							otp : OTVC.otvc
						},  
					    text: 'OTP is' // plaintext body 
					};
					 
					// send mail with defined transport object 
					transporter.sendMail(mailOptions, function(error, info){
					    if(error){
					        return console.log(error);
					    }
					    console.log('Message sent: ' + info.response);
					});

					deferred.resolve(result);
				}, function failue(err) {
					logger.error('DB Fail:', err);
					deferred.reject(new Error(err));
				}
			);
	}
	else {
		var err = 'otvc: Incomplete information in request !!!'; 
		logger.error(err);
		deferred.reject(new Error(err));
	}

	return deferred.promise;
}

exports.getId = getId;
exports.insertOTVC = insertOTVC;