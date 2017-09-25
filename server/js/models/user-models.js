var Q = require('q');
// DB Drivers / packages
//var mongoose = require('mongoose');
var mongoose = require('../util/connection');
var bcrypt = require('bcrypt-nodejs');
var logger = require('../util/log').get();
var utils = require('../util/utils');
var Schema = mongoose.Schema;
mongoose.Promise = Q.Promise;

const escapeStringRegexp = require('escape-string-regexp');

// Import services
var acl = require('../services/acl-service');
var userRoleService = require('../services/user-role-service');

// create a schema
var userSchema = new Schema({
  email: { type: String, index: { sparse: true } },
  fbUniqId : { type: String},
  deviceInfo: {
      osName: {type: String, default: null},
      osVer: {type: String, default: null},
      deviceName: {type: String, default: null},
      deviceVer: {type: String, default: null},
      _id: false
  },
  appVer: String,
  phoneNo: { type: String, index: true},
  regType: { type: String, required: true, uppercase: true, enum: ['EMAIL', 'CONTACTNO','FB'] },
  password: { type: String, default: null},
  userName: { type: String, index: true },
  location: {
      lng:  { type: String, default: null },
      lat: { type: String, default: null },
      _id: false
  },
  personalInfo: {
      fullName: String,
      img: {type: String, default: null},
      _id: false
  },
  role_id: {type: Schema.Types.ObjectId, ref:"user_roles", required: true},
  empUniqId: {type: Schema.Types.ObjectId, ref:"employees", default: null},
  isActive: { type: Number, default: 0},
  emailVerified: {type: Number, default: 0},
  phoneNoVerified: {type: Number, default: 0},
  verificationStatus : {type: String, uppercase: true, trim: true, enum: ['PV', 'IS', 'AV'], default: 'PV'},
  inviteSentAt : {type: Date},
  isDeleted: { type: Number, default: 0},
  userRelation: {
    _id: false,
    type: {}, default: null,
    key: { type: String, lowercase: true, enum: ['customer', 'brand', 'location', 'employee'], default: undefined }, // entities defined for accesing portal
    id: {type: Schema.Types.ObjectId, default: null}
  }
},
{
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});
//Transform
userSchema.options.toJSON.transform = function (doc, ret, options) {
  // remove the _id of every document before returning the result
  ret.id = ret._id;
  delete ret._id;
  delete ret.__v;
};
userSchema.options.toObject.transform = function (doc, ret, options) {
  // remove the _id of every document before returning the result
  ret.id = ret._id;
  delete ret._id;
  delete ret.__v;
};

userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}

userSchema.methods.validatePassword = function(password) {
  return bcrypt.compareSync(password, this.password);
}


// model creation for user schema
var User = mongoose.model('users', userSchema);

// check if user exists
var checkEmailUser = function (email) {

  var deferred = Q.defer();

  var query = User.findOne();
  query.or([{"email": { "$regex": "^"+escapeStringRegexp(email)+"$", "$options": "i" }}]);
  query.select('personalInfo email phoneNo emailVerified userRelation');
  query.where('isDeleted').eq(0);
  query.exec()
    .then(function success(result) {
        deferred.resolve(result);
    }, function failre(err) {
        deferred.reject(err);
    });

  return deferred.promise;
};

// check if user exists
var checkContactUser = function (phoneNo) {

  var deferred = Q.defer();

  var query = User.findOne();
  query.or([{"phoneNo": phoneNo}]);
  query.select('personalInfo email phoneNo');
  query.where('isDeleted').eq(0);
  query.exec()
    .then(function success(result) {
        deferred.resolve(result);
    }, function failre(err) {
        deferred.reject(err);
    });

  return deferred.promise;
};

// check if user exists
var checkFBUser = function (fbUniqId) {

  var deferred = Q.defer();

  var query = User.findOne();
  query.populate({
      path: 'role_id',
      select: '-__v -updatedAt -createdAt -isActive -isDeleted'
  });
  // where conditions
  query.where('fbUniqId').eq(fbUniqId);
  query.where('isDeleted').eq(0);
  // query execution
  query.exec()
    .then(function success(result) {
        deferred.resolve(result);
    }, function failre(err) {
        deferred.reject(err);
    });

  return deferred.promise;
};

// save user details
var saveUser = function (userDetails) {
  var deferred = Q.defer();

  var userDetailsObj = {};
  userDetailsObj = {
    // required parameters
    phoneNo: userDetails.phoneNo ? userDetails.phoneNo : null,
    email: userDetails.email ? userDetails.email : null,
    fbUniqId : userDetails.fbUniqId ? userDetails.fbUniqId : null,
    deviceInfo: userDetails.deviceInfo,
    location: userDetails.location,
    appVer: userDetails.appVer,
    userName: (userDetails.regType === 'EMAIL') ? userDetails.email : userDetails.phoneNo,
    personalInfo: userDetails.personalInfo,
    role_id: userDetails.roleId,
    empUniqId : userDetails.empUniqId ? userDetails.empUniqId : null,
    regType: userDetails.regType.toUpperCase(),
    phoneNoVerified: (userDetails.regType === 'CONTACTNO') ? true : false,
    isActive: (userDetails.regType === 'EMAIL') ? 0 : 1
  };

  if (userDetails && (null === userDetails.userRelation || undefined === userDetails.userRelation)) {
    userDetailsObj.userRelation = null;
  } else {
    userDetailsObj.userRelation = {
      key: userDetails.userRelation.key,
      id: userDetails.userRelation.id,
    };
  };

  var userObj = new User(userDetailsObj);

  if(userDetails.password) {
    // Hash the password
    try {  
      userObj.password = userObj.generateHash(userDetails.password);
    } catch (err) {
      var err = new Error("Error in encrypting password: "+ err);
      err.code = 500;
      deferred.reject(err);
    }
  }

  var roleName = userRoleService.USER_ROLES[userObj.role_id] || null;

  if (roleName) {
    userObj.save(function (err) {
      if (err) {
        deferred.reject(err);
      } else {
        acl.addUserRoles(userObj._id.toString(), roleName);
        deferred.resolve(userObj);
      }
    });   
  } else {
    var er1 = "Sorry, role name not found while user creation.";
    logger.error(er1);
    deferred.reject(new Error(er1));
  };

  return deferred.promise;
};

// Actiate user - required for email verification
var activateUser = function (userId, email) {
  var deferred = Q.defer();

  var query = User.find();
  query.where('_id').eq(userId);
  query.where('isDeleted').eq(0);
  query.exec()
  .then(function (result) {
    if (result && result.length > 0) {
      userDoc = result[0];
      if (userDoc.isActive) {
        var err = new Error("User already Active !!!");
        err.code = 200;
        deferred.reject(err);
      } else {
        userDoc.isActive = 1;
        userDoc.emailVerified = 1;
        userDoc.verificationStatus = "AV"; //Account Verified

        userDoc.save(function (err) {
          if (err) {
            deferred.error(err);
          } else {
            deferred.resolve(result);
          }
        });
      };
    } else {
      deferred.resolve(result);
    };
  }, function (err) {
      deferred.reject(err);
  });

  return deferred.promise;
};

var setEmailSent = function(userDetails) {
  var deferred = Q.defer();

  var query = User.findOne();
  query.where('email').eq(userDetails.email);
  query.exec()
  .then(function (userDoc) {
    userDoc.verificationStatus = "IS"; //Invite Sent
    userDoc.inviteSentAt = new Date();

    userDoc.save(function (err) {
      if (err) {
        deferred.error(err);
      } else {
        deferred.resolve(userDoc);
      }
    });
  }, function (err) {
      deferred.reject(err);
  });

  return deferred.promise;
};

// Verify contact number
var verifyContactNumber = function (contactNo) {
  var deferred = Q.defer();

  var query = User.find();
  query.where('phoneNo').eq(contactNo);
  query.where('isDeleted').eq(0);
  query.exec()
  .then(function (result) {
    if (result && result.length > 0) {
      userDoc = result[0];
      if (userDoc.phoneNoVerified) {
        var err = new Error("Contact Number already verified !!!");
        err.code = 300;
        deferred.reject(err);
      } else {
        userDoc.isActive = 1;
        userDoc.phoneNoVerified = 1;

        userDoc.save(function (err) {
          if (err) {
            deferred.error(err);
          } else {
            deferred.resolve(result);
          }
        });
      };
    } else {
      deferred.resolve(result);
    };
  }, function (err) {
      deferred.reject(err);
  });

  return deferred.promise;
};

var updateUser = function (userDetails) {
  var deferred = Q.defer();

  var query = User.findOne();
  query.where('isDeleted').eq(0);
  
  // where conditions
  if (userDetails.regType === "EMAIL") {
    query.where({'email': { "$regex": "^"+escapeStringRegexp(userDetails.email)+"$", "$options": "i" }});
    query.where('regType').eq("EMAIL");
    query.where('_id').eq(userDetails.id);
  } else if (userDetails.regType === "CONTACTNO") {
    query.where('phoneNo').eq(userDetails.phoneNo);
    query.where('regType').eq("CONTACTNO");
    query.where('_id').eq(userDetails.id);
  };

  query.exec()
  .then(function success(userDoc) {
        if(userDoc) {
          if (userDoc.isActive) {
            if(userDetails.currentPassword) {
              var passDecRes;
              try {
                curPassRes = userDoc.validatePassword(userDetails.currentPassword);
              } catch (err) {
                var err = new Error("Error in validating current password: " + err);
                deferred.reject(err);
              }

              if(curPassRes) {
                if (userDetails.password) {
                   // Hash the password
                  try {  
                    userDoc.password = userDoc.generateHash(userDetails.password);
                  } catch (err) {
                    var err = new Error("Error in encrypting password: "+ err);
                    err.code = 500;
                    deferred.reject(err);
                  }
                };
              } else {
                var err = new Error("Current password does not match:");
                err.code = 500;
                deferred.reject(err);
              }
            }

            if (userDetails.deviceInfo) {
              userDoc.deviceInfo = userDetails.deviceInfo;
            };

            if (userDetails.location) {
              userDoc.location = userDetails.location;
            };

            if (userDetails.appVer) {
              userDoc.appVer = userDetails.appVer;
            };

            if (userDetails.personalInfo) {
              userDoc.personalInfo = userDetails.personalInfo;
            };

            if (userDoc.regType === 'EMAIL' && userDetails.phoneNo) {
              userDoc.phoneNo = userDetails.phoneNo;
            };

            if (userDoc.regType === 'CONTACTNO' && userDetails.email) {
              userDoc.email = userDetails.email;
            };

            // Save the updated User document
            userDoc.save(function (err) {
              if (err) {
                deferred.reject(err);
              } else {
                deferred.resolve(userDoc);
              };
            });

          } else { // Ask user to verify email / mobile number
            var err = new Error("Please verify your account !!!");
            err.code = 300;
            deferred.reject(err);
          };
        } else {
          var uname = userDetails.email ? userDetails.email : userDetails.contactNo;
          var err = new Error(uname + " not found !!!");
          err.code = 200;
          deferred.reject(err);
        }
    }, function failre(err) {
        deferred.reject(err);
    });

  return deferred.promise;
};

var resetPassword = function (userDetails) {
  var deferred = Q.defer();

  var query = User.findOne();
  query.where('isDeleted').eq(0);
  query.where('_id').eq(userDetails.userId);

  query.exec()
  .then(function success(userDoc) {
        if(userDoc) {
          if (userDoc.isActive) {
               // Hash the password
            try {  
              userDoc.password = userDoc.generateHash(userDetails.password);
            } catch (err) {
              var err = new Error("Error in encrypting password: "+ err);
              err.code = 500;
              deferred.reject(err);
            }
            // Save the updated User document
            userDoc.save(function (err) {
              if (err) {
                deferred.reject(err);
              } else {
                deferred.resolve(userDoc);
              };
            });

          } else { // Ask user to verify email / mobile number
            var err = new Error("Please verify your account !!!");
            err.code = 300;
            deferred.reject(err);
          };
        } else {
          var userId = userDetails.userId;
          var err = new Error(userId + " not found !!!");
          err.code = 200;
          deferred.reject(err);
        }
    }, function failre(err) {
        deferred.reject(err);
    });

  return deferred.promise;
};

var setPassword = function (setPassDetails) {
  var deferred = Q.defer();

  var query = User.findOne();
  query.where('isDeleted').eq(0);
  query.where('_id').eq(setPassDetails.userId);

  query.exec()
  .then(function success(userDoc) {
      if(!userDoc.password) {
        if(userDoc) { 
            // Hash the password
            try {  
              userDoc.password = userDoc.generateHash(setPassDetails.password);
            } catch (err) {
              var err = new Error("Error in encrypting password: "+ err);
              err.code = 500;
              deferred.reject(err);
            }
            userDoc.isActive = 1;
            userDoc.emailVerified = 1;
            userDoc.verificationStatus = "AV"; //Account Verified
            // Save the updated User document
            userDoc.save(function (err) {
              if (err) {
                deferred.reject(err);
              } else {
                deferred.resolve(userDoc);
              };
            });
        } else {
          var userId = userDetails.userId;
          var err = new Error(userId + " not found !!!");
          err.code = 200;
          deferred.reject(err);
        }
      } else {
        var err = new Error("Password already set for this user.");
          err.code = 600;
          deferred.reject(err);
      }
    }, function failre(err) {
        deferred.reject(err);
    });

  return deferred.promise;
};

var checkUserById = function (userId) {
  var deferred = Q.defer();

  var query = User.findById(mongoose.mongo.ObjectId(userId));
  query.where('isDeleted').eq(0);
  query.where('isActive').eq(1);
  query.populate({
    path: 'role_id',
    match: {
      isDeleted: { $eq: 0 },
      isActive: { $eq: 1 }
    }
  });
  query.exec()
  .then(function (result) {
    deferred.resolve(result);
  }, function (err) {
    deferred.reject(err);
  });

  return deferred.promise;
};

var getUsers = function () {
  var deferred = Q.defer();

  var query = User.find();

  query.populate({
    path: 'role_id',
    select: 'roleName',
    as: 'role'
  });

  query.where('role_id').ne("57c8c534488d6788133f61f1");

  query.exec()
  .then(function (result) {
    deferred.resolve(result);
  }, function (err) {
    deferred.reject(err);
  });

  return deferred.promise;
}

var deleteUser = function (userIds, relationKey) {
  var deferred = Q.defer();

  if(relationKey) {
    var query = User.find({'_id': {$in: userIds}, 'userRelation.key': {$eq: relationKey}}).remove();
  } else {
    var query = User.find({'_id': {$in: userIds}}).remove();
  }
  
  query.exec()
  .then(function (result) {
    deferred.resolve(result);
  }, function (err) {
    deferred.reject(err);
  });

  return deferred.promise;
};

var updateContactRelation = function(userIds, userRelation) {
  var deferred = Q.defer();

  User.update({ _id: { $in:  userIds}}, { $set: { "userRelation" : userRelation } }, { multi: true }, function (err, res) {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve(res);
      };
   });  

  return deferred.promise;
}

// exports section
exports.User = User;
exports.checkEmailUser = checkEmailUser;
exports.checkContactUser = checkContactUser;
exports.checkFBUser = checkFBUser;
exports.saveUser = saveUser;
exports.activateUser = activateUser;
exports.setEmailSent = setEmailSent;
exports.verifyContactNumber = verifyContactNumber;
exports.updateUser = updateUser;
exports.resetPassword = resetPassword;
exports.setPassword = setPassword;
exports.checkUserById = checkUserById;
exports.getUsers = getUsers;
exports.deleteUser = deleteUser;
exports.updateContactRelation = updateContactRelation;