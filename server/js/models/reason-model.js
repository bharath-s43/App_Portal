// DB Drivers / packages
var mongoose = require('../util/connection');
var Q = require('q');
var Schema = mongoose.Schema;
mongoose.Promise = Q.Promise;

var reasonSchema = new Schema({
  category: {type: String, trim: true, required: true, unique: true}, // Category -> Location, Customer, Brand
  type: {type: String, trim: true}, // Type -> Default, custom
  reason: [{type: String, trim: true, required: true, unique: true}]
}, {
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});
//Transform
reasonSchema.options.toJSON.transform = function (doc, ret, options) {
  // remove the _id of every document before returning the result
  ret.id = ret._id;
  delete ret._id;
  delete ret.__v;
};
reasonSchema.options.toObject.transform = function (doc, ret, options) {
  // remove the _id of every document before returning the result
  ret.id = ret._id;
  delete ret._id;
  delete ret.__v;
};

// model creation for feedback reasons schema
var Reasons = mongoose.model('reasons', reasonSchema);


// save user details
var saveReasons = function (feedbackReasons) {
  var deferred = Q.defer();

  return deferred.promise;
};


// fetch employees
var fetchReasons = function (searchParams) {

  var deferred = Q.defer();
  var reasonType = null;
  var reasonCategory = null;
  
  if (searchParams && Object.keys(searchParams).length !== 0) {
    reasonType = searchParams.hasOwnProperty('reasonType') ? searchParams.reasonType : null;
    reasonCategory = searchParams.hasOwnProperty('reasonCat') ? searchParams.reasonCat : null;
  };

  var query = Reasons.find();
  
  if (reasonType) {
    query.where({'type': reasonType});
  };
  
  if (reasonCategory) {
    query.where({'category': reasonCategory});
  };

  query.exec()
  .then(function success(result) {
      deferred.resolve(result);
    }, function failure(err) {
      deferred.reject(err);
    });

  return deferred.promise;
};

// exports section
exports.Reasons = Reasons;
exports.saveReasons = saveReasons;
exports.fetchReasons = fetchReasons;