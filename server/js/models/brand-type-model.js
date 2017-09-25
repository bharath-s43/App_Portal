var Q = require('q');
// DB Drivers / packages
var mongoose = require('../util/connection');
var Schema = mongoose.Schema;
mongoose.Promise = Q.Promise;
const escapeStringRegexp = require('escape-string-regexp');

// create a schema
var brandTypeSchema = new Schema({
  brandType: {type: String, index: true, required: true, default: null},
  feedbackReasonsEmployee: [{type: String, trim: true, required: true, unique: true}],
  feedbackReasonsLocation: [{type: String, trim: true, required: true, unique: true}],
  isActive: { type: Number, default: 1},
  isDeleted: { type: Number, default: 0}
},
{
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});

//Transform
brandTypeSchema.options.toJSON.transform = function (doc, ret, options) {
  // remove the _id of every document before returning the result
  ret.id = ret._id;
  delete ret._id;
  delete ret.__v;
};
brandTypeSchema.options.toObject.transform = function (doc, ret, options) {
  // remove the _id of every document before returning the result
  ret.id = ret._id;
  delete ret._id;
  delete ret.__v;
};

// model creation for user schema
var brandType = mongoose.model('brand_types', brandTypeSchema);

//Insert feedbackrea
var insertBrandType = function (brandTypeDetails) {
  var deferred = Q.defer();

  var brandTypeObj = new brandType({
      // required parameters
      brandType: brandTypeDetails.brandType,
      feedbackReasonsEmployee: brandTypeDetails.feedbackReasonsEmployee,
      feedbackReasonsLocation: brandTypeDetails.feedbackReasonsLocation
    });

    // beacon save
    brandTypeObj.save(function (err) {
      if (err) {
        deferred.reject(err);
      };

      deferred.resolve(brandTypeObj);
    }); //

  return deferred.promise;
};

var getAllBrandTypes = function () {
	var deferred = Q.defer();

	var query = brandType.find();
	query.where('isDeleted').eq(0);
	query.where('isActive').eq(1);
	query.exec()
	.then(function success(result) {
	    deferred.resolve(result);
	}, function failre(err) {
	    deferred.reject(err);
	});

	return deferred.promise;
};

exports.insertBrandType = insertBrandType;
exports.getAllBrandTypes = getAllBrandTypes;