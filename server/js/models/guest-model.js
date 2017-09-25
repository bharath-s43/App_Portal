var Q = require('q');
// DB Drivers / packages
//var mongoose = require('mongoose');
var mongoose = require('../util/connection');
var Schema = mongoose.Schema;
mongoose.Promise = Q.Promise;

var userRoleService = require("../services/user-role-service");
var aclService = require("../services/acl-service");

// create a schema
var guestUserSchema = new Schema({
  deviceId: {type: String, trim: true, index: true},
  deviceInfo: {
      osName: String,
      osVer: String,
      deviceName: String,
      deviceVer: String,
      _id: {id: false}
  },
  appVer: String,
  location: {
      lng:  { type: String },
      lat: { type: String },
      _id: false,
      id: false
  },
  role_id: { type: Schema.Types.ObjectId, ref: 'user_roles', default: "58ac13d40f949520d99e6843"}
},
{
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});
//Transform
guestUserSchema.options.toJSON.transform = function (doc, ret, options) {
  // remove the _id of every document before returning the result
  ret.id = ret._id;
  delete ret._id;
  delete ret.__v;
};
guestUserSchema.options.toObject.transform = function (doc, ret, options) {
  // remove the _id of every document before returning the result
  ret.id = ret._id;
  delete ret._id;
  delete ret.__v;
};

// model creation for guest user schema
var GuestUser = mongoose.model('guest_users', guestUserSchema);

// save user details
var saveGuestUser = function (guestUserDetails, deviceId) {
  var deferred = Q.defer();

  var guestRoleId = userRoleService.getIdfromRole("guest");

  var guestUserObj = new GuestUser({
      // required parameters
      deviceId: deviceId,
      deviceInfo: guestUserDetails.deviceInfo,
      location: guestUserDetails.location ? guestUserDetails.location : {},
      appVer: guestUserDetails.appVer,
      role_id: mongoose.mongo.ObjectId(guestRoleId)
    });

    guestUserObj.save(function (err) {
      if (err) {
        deferred.reject(err);
      };

      var query = GuestUser.findOne({"_id" : guestUserObj._id});
      query.populate({
          path: 'role_id',
          select: '-__v -updatedAt -createdAt -isActive -isDeleted'
      });
      query.exec()
      .then(function (result) {
        aclService.addUserRoles(result._id.toString(), result.role_id.roleName);
        deferred.resolve(result);
      }, function (err) {
        deferred.reject(err);
      });
    });

  return deferred.promise;
};


// exports section
exports.GuestUser = GuestUser;
exports.saveGuestUser = saveGuestUser;