var Q = require('q');
// DB Drivers / packages
var mongoose = require('../util/connection');
var Schema = mongoose.Schema;
mongoose.Promise = Q.Promise;

// create a schema
var staticContentSchema = new Schema({
  type: {type: String, required: true, trim: true},
  description: Schema.Types.Mixed
},
{
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});
//Transform
staticContentSchema.options.toJSON.transform = function (doc, ret, options) {
  // remove the _id of every document before returning the result
  ret.id = ret._id;
  delete ret._id;
  delete ret.__v;
};
staticContentSchema.options.toObject.transform = function (doc, ret, options) {
  // remove the _id of every document before returning the result
  ret.id = ret._id;
  delete ret._id;
  delete ret.__v;
};

// model creation for user schema
var StaticContent = mongoose.model('static_contents', staticContentSchema);

// Check Location existence
var getStaticContent = function () {
  var deferred = Q.defer();

  var query = StaticContent.find();
  query.exec()
  .then(function (result) {
    deferred.resolve(result);
  }, function (err) {
    deferred.reject(err);
  });

  return deferred.promise;
};

var updateStaticContent = function (contentDetails) {
  var deferred = Q.defer();

  var query = StaticContent.findOne();
  query.where('type').eq(contentDetails.type);
  
  query.exec()
  .then(function success(contentDoc) {
        if(contentDoc) {
          if(contentDetails.type==="aboutUs") {
            contentDoc.description = {};
            contentDoc.description.aboutUsText = contentDetails.aboutUsText;
          } else if (contentDetails.type==="termsConditions") {
            contentDoc.description = {};
            contentDoc.description.termsConditionsText = contentDetails.termsConditionsText;
          } else if (contentDetails.type==="privacyPolicy") {
            contentDoc.description = {};
            contentDoc.description.privacyPolicyText = contentDetails.privacyPolicyText;
          }
          else if (contentDetails.type==="contactUs") {
            contentDoc.description = {};
            var contactDetails = {};
            contactDetails = contentDetails.contactDetails;
            contentDoc.description = contactDetails;
          }
          // Save the updated User document
            contentDoc.save(function (err) {
              if (err) {
                deferred.reject(err);
              } else {
                deferred.resolve(contentDoc);
              };
            });

        } else {
          var err = new Error("content not found !!!");
          err.code = 200;
          deferred.reject(err);
        }
    }, function failre(err) {
        deferred.reject(err);
    });

  return deferred.promise;
};

exports.getStaticContent = getStaticContent;
exports.updateStaticContent = updateStaticContent;