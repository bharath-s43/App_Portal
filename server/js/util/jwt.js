var fs = require('fs');
var jwt = require('jsonwebtoken');

var config = require('../conf/config').get();
var logger = require('./log').get();

const CERT_PRIVATE = "541eDf+p6yrKMLkDUO33uIl2F/kHXDBN1uk8oJIBuMWGu1op1Z004jOdJubh7mKG6XH2DhM7v4MrlLphLGmYisLS3o+GRYA5MkROpoVaRk2z7zuahzkemTjcuZZBO2SK93K3CfXK2HmeGNohzdkLk48NQVKGUeSAAN0aMnxjKciz4B5vhpY6OMjvHtwfEbVTNdy2TYjzdhb634YhlK/9OL26i6eMtzgMV4XdafCaK1HAwBuuFW19/RTwXIsoju0lu+jeH8iPca8vwjpliLfEFaGPTOnziCnqaw6On4AJrHUzZHD46FMdy9V1sHac3WCe+rv+64DPvMroy8b+lB/oacVeWyAT42N+84K5PEvO6Ugk2YZMHjABSEMO4vd72nNP0RuUzXyX6d+m3Cw+LPpp+hWWoyxfJ5dRj0Ti7dAXd92wqwazhK0u+/EOWmNtvAB2ohi6cvHhhz52Hw9ilDS1SA4mXh5X4EDl2qEyILuE48LFr5/tyOIKUdDX11VIY9IvoUiq8DokGsh8fWw+C6t93l9oIPBPiT3Jee3Ph0igOpuExmPpr6+4gvitgI6CEeTubSDi5ESMR7+/aIjJxX0cmxbrCxoMtN1lg8b14PfHtx1GQAB8jK3Sf/srQY9+uepwL0SA21NDeyDiVyLTz8UtsS5cFHBqbZHr5l/b/K3iREDFcQCnWQKliayEMiRL94Thg6BXyJTRXfHkAoDbSnvYdCcFisD6LIRhy4kFSYhi4rwtQU06YMR3CscSTrL4AwozaKZn6+Tw+E9HUD136QjNZBetHJSIlgxYPfc0dGi2e8wgdZ3Jkdoq9mw4tVr6qzHzutST98/3C50qIMbUDGJfO+dl/1vPsFoGd4y7izjdKrEdV6+qj1Dukxhnw6l0JFy/Nf0cDPOXM9sDUyQcpsQH69dwTrq7vya0JF9Ae2ha9ZmhXXIoFabosgIhEFu/S0R10qWn82+E9eF3pfUWuz4AHoEQ6fkJ1isSftYy2W9ZKugou2W9M4qSeoTcGMmDpYqJnVBqBLwn2NEjFAsJg3UMgUwuMyag4LJIaSpBeB1nm+kg7Evb9zDcVRohQL2ATqD4/I40SoFLk7q5cYSeKuYYpZeJZRWmQVCRKQfU9fLtiqMvY3Y+gLfHbdRp9siVqq2djJymvrUYMKczd6ogVje5ajYn3pksqg0+xvHOBRiltkxrMsX66RdY+hZCRpXn9PR5bpAWi2O57SHqVh+vm5Y03XwD8/mzb9n4yag1rvUeQ6gAv9CLXuzqFiL9uY5ifxjfqokgLi/D+BWqkogK+0aF6KUeLxwWxnFeujw3fDoMFzTh/5VICSWtyP5boZlKJNJ2VVVt6gR2xe5CYj4tgAupI0jYb8L02AJU5QpQB0rKXiY3NCzy9qEIGunc8/ePnUTmBTy0F+uxcGj9eCRlnYRPlIBRc19sX1y3+rktpyKiSrI92SG/E4TxYDZTjnOeuowDcpS2WC83WhwBu8+Ufmw2snqPi+WdNZW8vTE32oAGNf/jmCYcG9Y6d05xcHVENcCqHI78ty6lT8Sca6FQ1OEGpRM/jtZ5jHUQBBuHJviOWIRY2T2g52c21McDLA/cnb6B";
//const CERT_PUBLIC = fs.readFileSync('keys/new_rsa.pub');

function isBypass(bypassScenario) {
	//return !!(_.findWhere(config.jwt.BYPASS_SCENARIOS, bypassScenario));
	return false;
}

exports.create = function (req, res, payload) {
	payload = payload || {
			payload : 'Nothing yet...'
		};
	var token = jwt.sign(payload, CERT_PRIVATE);
	res.setHeader('Authorization', token);
	return token;
};

exports.verify = function (req, res, next) {

	var token = req.headers.authorization;

	if (token) {
		logger.info('Got Authorization (JWT) header: ' + token + (!config.jwt.enabled ? ' although JWT disabled.' : ' and JWT is enabled.'));
	}

	if (!config.jwt.enabled) {
		return next();
	}

	var isVerified = false;

	var bypassScenario = {
		fullPath : req.fullPath,
		method : req.method
	};

	if (isBypass(bypassScenario)) {
		isVerified = true;
	} else {
		try {
			if (token) {
				token = token.split(' ')[1].trim();
			}
		} catch (e) {
			res.status(403).end('{"error":"Unauthorized - invalid token."}');
		}

		try {
			var decoded = jwt.verify(token, CERT_PRIVATE);
			isVerified = true;
		} catch (err) {
			res.status(403).end('{"error":"Unauthorized - unverified token."}');
		}

	}

	if (isVerified) {
		return next();
	}
};

exports.getUserDataFromToken = function (req, res) {
	var token = (req.headers && req.headers.authorization) || "";
	var decoded = null;
	
	if (token) {
		try {
			decoded = jwt.verify(token, CERT_PRIVATE);
		} catch (err) {
			logger.error("Error in decoding JWT Token." + err);
		};
	};

	return decoded;

};