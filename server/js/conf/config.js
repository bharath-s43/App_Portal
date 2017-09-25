var compression = require('compression');
var path = require('path');

exports.env = '';

exports.set = function (env) {
	exports.env = env;
	return exports;
};

exports.get = function (v) {
	var version = v || 1;
	var config;

	try {
		config = require('./v' + version.toString() + '/config-' + exports.env);
	} catch (e) {
		console.error('Error getting config for API version ' + v + '. Reverting to version 1.');
		config = require('./v1/config-' + exports.env);
	}

	return config;
};

exports.appInit = function (app, express, __dirname, callback) {

	var bodyParser = require('body-parser');
	app.use(bodyParser.json({limit: '10mb'})); // support json encoded bodies
	app.use(bodyParser.urlencoded({limit: '10mb',extended : true}));
	//app.use(bodyParser({uploadDir:'./public/uploads'}));
	app.use(express.static(__dirname + '/public'));
	app.use(compression());
	app.use(express.static(path.join(__dirname, 'public')));
	app.enable('trust proxy');

	app.use(function (req, res, next) {
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Allow', 'POST GET DELETE PUT HEAD');
		res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
		res.setHeader('Access-Control-Expose-Headers', 'X-Requested-With, Content-Type, Authorization');
		res.setHeader('Content-Type', 'application/json;charset=utf-8');
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('BigNodeI5', true);
		res.setHeader('Cache-Control', 'no-cache');
		next();
	});
};
