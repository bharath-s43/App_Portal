var Q = require('q');
// DB Drivers / packages
//var mongoose = require('mongoose');
var mongoose = require('../util/connection');
var Schema = mongoose.Schema;

// create a schema
var otpSchema = new Schema({
	otp: {type: String, required: true, trim: true},
	user: {type: Schema.Types.ObjectId, ref:"users"}
},
{
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});

//Transform
otpSchema.options.toJSON.transform = function (doc, ret, options) {
  // remove the _id of every document before returning the result
  ret.id = ret._id;
  delete ret._id;
  delete ret.__v;
};
otpSchema.options.toObject.transform = function (doc, ret, options) {
  // remove the _id of every document before returning the result
  ret.id = ret._id;
  delete ret._id;
  delete ret.__v;
};

// model creation for user schema
var Otp = mongoose.model('otp', otpSchema);

// save user details
var saveOtp = function (otpDetails) {
  var deferred = Q.defer();

  // create location details
  var otpObj = new Otp({
      // required parameters
      otp: otpDetails.otp,
      user: otpDetails.userId
  });

  otpObj.save(function (err) {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve(otpObj);
      };
    });

  return deferred.promise;
};

var confirmOtp = function (otpDetails) {
	var deferred = Q.defer();

	var query = Otp.findOne();
	query.where("_id").eq(otpDetails.otpId);
	query.where("otp").eq(otpDetails.otp);
	query.exec()
	.then(function (result) {
	deferred.resolve(result);
	}, function (err) {
	deferred.reject(err);
	});

	return deferred.promise;
}

exports.saveOtp = saveOtp;
exports.confirmOtp = confirmOtp;