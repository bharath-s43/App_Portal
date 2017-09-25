var Q = require('q');
// DB Drivers / packages
var mongoose = require('../util/connection');
var Schema = mongoose.Schema;
mongoose.Promise = Q.Promise;

var userRoleSchema = new Schema({
  roleName: {type: String, required: true, trim: true},
  isActive: {type: Number, default: 1}
},
{
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});
// model creation for user schema
var UserRole = mongoose.model('user_roles', userRoleSchema);

// fetch brand
var fetchUserRoleDetails = function (roleId) {

  var deferred = Q.defer();

  var query = UserRole.find();
  if (roleId) {
    query.where("_id").eq(roleId);
  };
  query.where("isActive").eq(1);
  query.exec()
  .then(function (result) {
    deferred.resolve(result);
  }, function (err) {
    deferred.resolve(err);
  });

  return deferred.promise;
};

var createUserRole = function (userRoleDetails) {
  var deferred = Q.defer();

  var userRoleDetailsObj = new UserRole({
    roleName: userRoleDetails.roleName,
  });
  
  userRoleDetailsObj.save(function (err) {
    if (err) {
      deferred.reject(err);
    };

    deferred.resolve(userRoleDetailsObj._doc);

  });

  return deferred.promise;
};

// exports section
exports.UserRole = UserRole;
exports.fetchUserRoleDetails = fetchUserRoleDetails;
exports.createUserRole = createUserRole;