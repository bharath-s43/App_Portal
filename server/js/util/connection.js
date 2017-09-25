var mongoose = require('mongoose'),
	dateFormat = require('dateformat'),
	logger = require('./log').get(),
	Q = require('q');
	
mongoose.initDB = function (config) {
	//mongodb://NEW USERNAME:NEW PASSWORD@127.0.0.1:27017/game
	// Build the connection string 
	//var dbURI = "mongodb://" + config.database.host + "/" + config.database.database;
	var dbURI = "mongodb://" + config.database.user+":"+config.database.password+"@"+config.database.host + "/" + config.database.database; 
	var dbconnection = mongoose.connect(dbURI);
	// CONNECTION EVENTS
	// When successfully connected
	mongoose.connection.on('connected', function () {
		logger.info('Database pool created for MongoDB host: ' + config.database.host);
	}); 

	// If the connection throws an error
	mongoose.connection.on('error',function (err) {  
	  logger.info('Database connection error: ' + err);
	  dbconnection = null;
	}); 

	// When the connection is disconnected
	mongoose.connection.on('disconnected', function () {  
	  logger.info('Database connection disconnected');
	  dbconnection = null;
	});

	// If the Node process ends, close the Mongoose connection 
	process.on('SIGINT', function() {  
	  mongoose.connection.close(function () { 
	    logger.info('Mongoose default connection disconnected through app termination'); 
	    process.exit(0); 
	  });
	});
};

// exports section
module.exports = mongoose;