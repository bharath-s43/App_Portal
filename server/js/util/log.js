var winston = require('winston');

exports.init = function (config) {

	var transports = [];

	if (config.log.enabled) {
		if (config.log.outputs.console.enabled) {
			transports.push(new (winston.transports.Console)({
				timestamp : true,
				colorize : true,
				prettyPrint : true
			}));
		}

		if (config.log.outputs.file.enabled) {
			transports.push(new (winston.transports.File)({
				timestamp : true,
				filename : './logs/iter5.log',
				maxsize : config.log.outputs.file.fileMaxSize,
				maxFiles : config.log.outputs.file.maxFiles,
				json : false
			}));
		}
	}

	this.logger = new (winston.Logger)({transports : transports});

	return this.logger;
};

exports.get = function () {
	return this.logger;
};
