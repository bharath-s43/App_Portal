var shortid = require('shortid');
var Q = require('q');
var mkdirp = require('mkdirp');
var glob = require('glob');
var fs = require('fs');
var path = require('path');
var forEachAsync = require('forEachAsync');
var unzip = require('unzip2');
var utils = require('../util/utils');
var logger = require('../util/log').get();
var siteBase = utils.getConstants().ASSET_PATH;
var gcloud = require('google-cloud');
var config = require('../conf/v1/config-dev' );

var CLOUD_BUCKET = config.const.CLOUD_BUCKET ;
var projectId = config.const.projectId;

var storage = gcloud.storage({
  projectId: "applause-dev"
  // , keyFilename: './keys/Applause-UAT-1654e7ee31dd.json'
});

var bucket = storage.bucket(CLOUD_BUCKET); 

// Image upload functionality
var uploadImage = function (imgBinaryData, img_type, prefix) {
	
         
	var deferred = Q.defer();
	var ext = ".png";
	if(img_type) {
		img_type = img_type.toLowerCase();
		if(img_type.includes('jpeg') || img_type.includes('jpg')) {
			ext = ".jpg";
		} else {
			ext = ".png";
		}
	}

	var base64Data = imgBinaryData.replace(/^data:image\/[a-z]+;base64,/, "");
	
	// prefix can be - brand, loc, emp, cust, user
	if (imgBinaryData) {
		var filename = shortid.generate();
		var dirPath = "/"+ prefix +"_img/";
		var filepath = dirPath + filename+ ext;
		filepath = path.normalize(filepath);
		var bitmap = new Buffer(imgBinaryData,'base64');
		//fs.writeFile("/opt/applause_backend_portal/server/public/assets"+filepath, base64Data, 'base64', function(err) {
		fs.writeFile("./public/assets"+filepath, base64Data, 'base64', function(err) {
			if (err) deferred.reject(err);
			//   var localReadStream = fs.createReadStream("./public/assets"+dirPath + filename+".png");
			// var remoteWriteStream = bucket.file(prefix +"_img/" +filename+".png").createWriteStream();
			// localReadStream.pipe(remoteWriteStream);
             bucket.upload("./public/assets"+dirPath + filename+ext, { destination: prefix +"_img/" +filename+ext} ,function(err, file) {
			  if (!err) {
			    logger.info("file uploaded")
			    // "zebra.jpg" is now in your bucket.
			  }
			});
			var imgPath = filename + ext;
			deferred.resolve(imgPath);
		});
	} else {
		deferred.resolve(null);
	};

	return deferred.promise;
};


// CSV upload functionality
var uploadCSVFile = function (fileData, file_type) {
	var deferred = Q.defer();
	var ext = ".csv";

	//var base64Data = fileData.replace(/^data:text\/[a-z]+;base64,/, "");
	var base64Data = fileData.replace(/^data:text\/[a-z]+.*;base64,/, "");
  	base64Data = fileData.replace(/^data:application\/[a-z]+.*;base64,/, "");
  	base64Data = fileData.replace(/^data:[\/a-z]?.*;base64,/, "");


	
	// prefix can be - brand, loc, emp, cust
	if (fileData) {
		var filename = shortid.generate();
		var dirPath = "./temp/";
		var filepath = dirPath + filename+".csv";
		filepath = path.normalize(filepath);
		var bitmap = new Buffer(fileData,'base64');
		fs.writeFile(filepath, base64Data, 'base64', function(err) {
			if (err) deferred.reject(err);
			deferred.resolve(filepath);
		});
	} else {
		deferred.resolve(null);
	};

	return deferred.promise;
};

var removeFile = function (filepath) {
	var deferred = Q.defer();
	try {
		fs.stat(filepath, function (err, stats) {
		   if (err) {
			   	logger.error("Error in searching file from filesystem: " + err);
				deferred.reject(err);
		   };

		   fs.unlink(filepath,function(err){
		        if (err) {
				   	logger.error("Error in removing file from filesystem: " + err);
					deferred.reject(err);
			   	};
		        logger.debug('file deleted successfully');
		        deferred.resolve();
		   });  
		});
	} catch (err) {
		logger.error("Error in removing file from filesystem: " + err);
		deferred.reject(err);
	};

	return deferred.promise;
};


var uploadZipFile = function (fileData) {
	var deferred = Q.defer();

	(function (exports) {
	  'use strict';
	 
	  var Sequence = exports.Sequence || require('sequence').Sequence
	    , sequence = Sequence.create()
	    , err
	    ;

	/* Using sequence package to make callback sync for maintaining atomic DB transactions */
	sequence
		.then(function (next) {
			//var base64Data = fileData.replace(/^data:application\/[a-z]+;base64,/, "");
			var base64Data = fileData.replace(/^data:application\/[a-z]+.*;base64,/, "");
    		base64Data = fileData.replace(/^data:[\/a-z]?.*;base64,/, "");

    		
			
			// prefix can be - brand, loc, emp, cust
			if (fileData) {
				var filename = shortid.generate();
				var dirPath = "./temp/";
				var filepath = dirPath + filename+".zip";
				filepath = path.normalize(filepath);
				var bitmap = new Buffer(fileData,'base64');
				fs.writeFile(filepath, base64Data, 'base64', function(err) {
					if (err) 
						deferred.reject(err);
					next(filepath);
				});
			} else {
				var err = new Error("Employee Image bulk zip empty.");
				logger.error(err);
				deferred.reject(err);
			};		
		})
		.then(function (next, filepath) {
			var unzipPath = './temp/unzip/';
			unzipPath = path.normalize(unzipPath);
			try {
				fs.createReadStream(filepath)
				.pipe(unzip.Extract({ path: unzipPath }))
				.on('close', function () {
					next(filepath, unzipPath);
				})
				.on('error', function (err) {
					logger.error(err);
					deferred.reject(err);
				});

			} catch (err) {
				logger.error("Employee Bulk: Unhandled error in unzipping employee images: "+ err);
				deferred.reject(err);
			};
		})
		.then(function (next, filepath, unzipPath) {
			removeFile(filepath)
			.then(function (result) {
				next(unzipPath);
			}, function (err) {
				logger.error("Employee Bulk: Error removing zip file: "+ err);
				next(unzipPath);
			});
		})
		.then(function (next, unzipPath) {

			var mypath = unzipPath;
			var newPath = './public/assets/emp_img/';
			newPath = path.normalize(newPath);
			var ext = ['jpg','jpeg','png', 'JPG', 'PNG', 'JPEG'];
			//var newPrefix = 'newPrefix';
			var imageFiles = [];
			

			var myFun = function(mypath) {
			 fs.readdir(mypath, function(error, files) {
			     if (error)
			         logger.error('error ' + error.code + ' : ' + error.message);
			     else {
			     	var imgObj = {};
			         files.map(function(file) {
			             return path.join(mypath, file)
			         }).filter(function(file) {
			             if(fs.statSync(file).isFile())
			                 return file;
			             else
			                 return myFun(file);
			         }).forEach(function(file, index, fileArr){
			             var origFilename = file.replace(/^.*[\\\/]/, '') || "";
			             var extension = origFilename.split('.');
			             if (ext.includes(extension[1])) {
			             	 var filename = shortid.generate() + "." + extension[1];
					   // var source = fs.createReadStream(file);
					   // var target = fs.createWriteStream(newPath + filename);
					   // source.pipe(target);
						 // var localReadStream = fs.createReadStream("./public/assets/emp_img/"+ filename);
						// var remoteWriteStream = bucket.file("emp_img/" +filename).createWriteStream();
						// source.pipe(remoteWriteStream);
						// fs.writeFile("./public/assets/emp_img/"+file, base64Data, 'base64', function(err) {
						// 			if (err) deferred.reject(err);
                        // 		})
							var Sequence = exports.Sequence || require('sequence').Sequence
								    , sequence1 = Sequence.create()
								    , err
								    ;
							sequence1
							.then(function (next) {
							 bucket.upload("./"+file, { destination: "emp_img/" +filename} ,function(err, file) {
							  if (!err) {
							    logger.info("file uploaded")
							    next()
							    // "zebra.jpg" is now in your bucket.
							  }
							})
							})
							.then(function (next) {
							      fs.unlink(file);
							});
			                 var fname = extension[0] ? extension[0].toLowerCase() : null;
     			         	 imgObj[fname] = {};
			                 imgObj[fname].file = filename;
			                 imgObj[fname].imgName = fname;

			                 //console.log(JSON.stringify(imgObj));

			                 if (index == (fileArr.length-1)) {
			                 	deferred.resolve(imgObj);
			                 };

			                 //console.log(imageFiles);
			             };
			         });
			     }
			 });
			};

			myFun(mypath);
		})
	}('undefined' !== typeof exports && exports || new Function('return this')()));

	return deferred.promise;
};
// exports section
exports.uploadImage = uploadImage;
exports.uploadCSVFile = uploadCSVFile;
exports.removeFile = removeFile;
exports.uploadZipFile = uploadZipFile;