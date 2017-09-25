var dateFormat = require('dateformat');
var configConst = {};

// // Nodejs encryption with CTR
// var crypto = require('crypto'),
//     algorithm = 'aes-256-ctr',
//     password = 'd6F3Efeq';

// exports.encryptAES = function (text) {
// 	var cipher = crypto.createCipher(algorithm,password)
//   	var crypted = cipher.update(text,'utf8','hex')
//   	crypted += cipher.final('hex');
//   	return crypted;
// }

// exports.decryptAES = function (text) {
// 	var decipher = crypto.createDecipher(algorithm,password)
//   	var dec = decipher.update(text,'hex','utf8')
//   	dec += decipher.final('utf8');
//   	return dec;
// }

//convert string to hashmap
exports.toHash = function (text, secret) {
	const hash = crypto.createHmac('sha256', secret)
                   .update(text)
                   .digest('hex');
                   
    return hash;
}

//Nodejs encryption with cbc
var crypto = require('crypto')
  , key = 'abcdefghijklmnop'
  , iv = 'fdsfds85435nfdfs';

exports.encryptAES = function(text) {
	var cipher = crypto.createCipheriv('aes-128-cbc', key, iv)
	var crypted = cipher.update(text, 'utf-8', 'hex');
	crypted += cipher.final('hex');
	return crypted;
}

exports.decryptAES = function(text) {
	decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
	var decrypted = decipher.update(text, 'hex', 'utf-8');
	decrypted += decipher.final('utf-8');
	return decrypted;
}

exports.messageFactory = function () {
	return {
		code : 0,
		errorMessage : '',
		displayMessage : '',
		data : []
	};
};

exports.jsonWriter = function (message, statusCode, res) {
	if(!res) {
		console.log("Old writer.");
		var res = this.res;
	}
	var messageJSON = JSON.stringify(message);

	try {
		res.set("Connection", "close");
		res.contentType('json');
	} catch (e) {
		console.log('JSONWRITER', e);
	}

	if (statusCode) {
		console.timeEnd(res.req.originalUrl);
		try {
			res.status(statusCode).end(messageJSON);
		} catch (e) {
			res.end(messageJSON);
		}
	} else {
		res.end(messageJSON);
	}

	message.data = [];
	message.error = 0;
};

exports.setResponse = function (res) {
	this.res = res;
};

exports.getResponse = function () {
	return this.res;
};

exports.setRequest = function (req) {
	this.req = req;
};

exports.getRequest = function () {
	return this.req;
};

exports.throwError = function (code, errorMessage, statusCode, displayMessage, data, res) {
	var message = exports.messageFactory();
	message.code = code;
	message.errorMessage = errorMessage;
	message.displayMessage = displayMessage;
	message.data = data;
	exports.jsonWriter(message, 200, res);
};

exports.generateToken = function () {
	var rand = function () {
		return Math.random().toString(36).substr(2);
	};
	return rand() + rand();
};

exports.parseJSON = function (jsonString) {
	try {
		var obj = JSON.parse(jsonString);
		if (obj && (typeof obj === 'object')) {
			return obj;
		}
	}
	catch (e) {
	}
};

exports.formatDate = function (date) {
	if (date instanceof Date) {
		return dateFormat(date, 'dd mmmm yyyy');
	} else {
		return null;
	}
};

exports.dates = {
    convert:function(d) {
        // Converts the date in d to a date-object. The input can be:
        //   a date object: returned without modification
        //  an array      : Interpreted as [year,month,day]. NOTE: month is 0-11.
        //   a number     : Interpreted as number of milliseconds
        //                  since 1 Jan 1970 (a timestamp) 
        //   a string     : Any format supported by the javascript engine, like
        //                  "YYYY/MM/DD", "MM/DD/YYYY", "Jan 31 2009" etc.
        //  an object     : Interpreted as an object with year, month and date
        //                  attributes.  **NOTE** month is 0-11.
        return (
            d.constructor === Date ? d :
            d.constructor === Array ? new Date(d[0],d[1],d[2]) :
            d.constructor === Number ? new Date(d) :
            d.constructor === String ? new Date(d) :
            typeof d === "object" ? new Date(d.year,d.month,d.date) :
            NaN
        );
    },
    compare:function(a,b) {
        // Compare two dates (could be of any type supported by the convert
        // function above) and returns:
        //  -1 : if a < b
        //   0 : if a = b
        //   1 : if a > b
        // NaN : if a or b is an illegal date
        // NOTE: The code inside isFinite does an assignment (=).
        return (
            isFinite(a=this.convert(a).valueOf()) &&
            isFinite(b=this.convert(b).valueOf()) ?
            (a>b)-(a<b) :
            NaN
        );
    },
    inRange:function(d,start,end) {
        // Checks if date in d is between dates in start and end.
        // Returns a boolean or NaN:
        //    true  : if d is between start and end (inclusive)
        //    false : if d is before start or after end
        //    NaN   : if one or more of the dates is illegal.
        // NOTE: The code inside isFinite does an assignment (=).
       return (
            isFinite(d=this.convert(d).valueOf()) &&
            isFinite(start=this.convert(start).valueOf()) &&
            isFinite(end=this.convert(end).valueOf()) ?
            start <= d && d <= end :
            NaN
        );
    }
}

exports.escapeSingleQuotes = function (string, escapeChar) {
	escapeChar = escapeChar || '\\';
	return string ? string.replace(/'/g, escapeChar + "'") : null;
};

exports.csvToArray = function (string) {
	var arr = []; 
	if (string) {
  		arr = string.split(",");
  	};

  	return arr;
};

exports.setConstants = function (configConst) {
	this.configConst = configConst;
};

exports.getConstants = function () {
	return {
		IMG_ABS_PATH : "/assets/",
        //IMG_ABS_PATH : "http://192.168.0.15:6002",
        //IMG_ABS_PATH : "/",
        ASSET_PATH : "/assets/",
        // ASSET_PATH : "/",
        SERVER_PATH : "/",
        APP_MINIMUM_VERSION : "1.0",
        INVITE_LINK_PATH : "http://applause-dev.appspot.com",
        SET_PASSWORD_PATH : "http://applause-dev.appspot.com"
	};
	//return this.configConst;
};

exports.getServerPath = function (req) {
	try{
		var host = req.get('host');
    	var protocol = req.protocol;
    	return protocol + '://' + host;
	} catch(e) {
		return "http://applause-dev.appspot.com";
	}
}

exports.capitalize = function (str) {
      str = str.toLowerCase().split(' ');

	  for(var i = 0; i < str.length; i++){
	    str[i] = str[i].split('');
	    str[i][0] = str[i][0].toUpperCase(); 
	    str[i] = str[i].join('');
	  }	

	  return str.join(' ');
}

exports.getTimeDiffInHours = function (date1, date2) {
	var hours = Math.abs(date1 - date2) / 36e5;
    return(hours);
}