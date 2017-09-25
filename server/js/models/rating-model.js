var Q = require('q');
// DB Drivers / packages
var mongoose = require('../util/connection');
var Schema = mongoose.Schema;
mongoose.Promise = Q.Promise;

var ratingSchema = new Schema({
  img: {type: String, default: null},
  name: {type: String, required: true},
  count: {type: Number, required: true, default: 5},
  isActive: {type: Number, default: 1}
},
{
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});
// model creation for user schema
var Rating = mongoose.model('ratings', ratingSchema);


// fetch brand
var fetchRatingDetails = function (ratindId) {

  var deferred = Q.defer();

  var query = Rating.find();
  if (ratindId) {
    query.where("_id").eq(ratindId);
  };
  query.exec()
  .then(function (result) {
    deferred.resolve(result);
  }, function (err) {
    deferred.resolve(err);
  });

  return deferred.promise;
};


var saveRatingDetails = function (ratingDetails) {
  var deferred = Q.defer();

  var ratingDetailsObj = new Rating({
    img: ratingDetails.img,
    name: ratingDetails.name,
    count: ratingDetails.count
  });
  
  ratingDetailsObj.save(function (err) {
    if (err) {
      deferred.reject(err);
    };

    deferred.resolve(ratingDetailsObj);

  });

  return deferred.promise;
};

// exports section
exports.Rating = Rating;
exports.fetchRatingDetails = fetchRatingDetails;
exports.saveRatingDetails = saveRatingDetails;