var Q = require('q');
// DB Drivers / packages
var mongoose = require('../util/connection');
var Schema = mongoose.Schema;
mongoose.Promise = Q.Promise;

// Import Models 
var brandModel = require('./brand-model');
//var Role = brandModel.Role;

var feedbackReasons = ["Speed Of Service", "Communication", 
                      "Knowledge", "Attention to Details", 
                      "Courtesy", "Other"];

var Role = brandModel.Role;

// Create role as per role details
var createRole = function (roleDetails) {
  var deferred = Q.defer();

  var roleObj = new brandModel.Role({
    brandId: roleDetails.brandId,
    role_type: roleDetails.role_type,
    feedbackReasons: roleDetails.feedbackReasons ? roleDetails.feedbackReasons : feedbackReasons
  });

  roleObj.save(function (err) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(roleObj);
    };
  });

  return deferred.promise;
};

// Create roles in bulk - Role names array as parameter
var createRolesBulk = function (roleNameArr, brandId) {
  var roleObjArr = [];
  var deferred = Q.defer();

  if (roleNameArr && roleNameArr.length > 0) {
    roleNameArr.forEach(function (element, index) {
      var roleObj = new brandModel.Role({
        brandId: brandId,
        role_type: element,
        feedbackReasons: feedbackReasons
      });
      roleObjArr.push(roleObj);
    });
  }
  brandModel.Role.insertMany(roleObjArr, function (error, docs) {
    if (error) {
      deferred.reject(error);
    } else {
      deferred.resolve(docs);
    };
  });

  return deferred.promise;
};

// fetch brand
var fetchRoleDetails = function (searchParams, roleId) {

  var Role = brandModel.Role;

  var deferred = Q.defer();
  var roleIds = null;
  var brandId = null;
  var roleName = null;

  if (searchParams && Object.keys(searchParams).length !== 0) {
    // when search params added, add it here in similar maner as of employee-model (fetchEmplyeeDetails())
    roleIds = searchParams.hasOwnProperty('roleId') ? searchParams.roleId.split(',') : null;
    brandId = searchParams.hasOwnProperty('brandId') ? searchParams.brandId.split(',') : null;
  };

  if (roleIds && roleIds.length > 0) { // Fetch role Details for particular search params
    
      var query = brandModel.Role.find();
      query.where("_id").in(roleIds);
      query.exec()
      .then(function success(result) {
        deferred.resolve(result);
      }, function failure(err) {
        deferred.reject(err);
      });

  } else { // fetch role details irrespective of Brands

    var query = brandModel.Role.find();
    query.where('isDeleted').eq(0);
    if (roleId) {
      query.where('_id').eq(roleId);
    };
    if (brandId && brandId.length > 0) {
      brandId.forEach(function (element, index) {
        brandId[index] = mongoose.mongo.ObjectId(element);
      });
      query.where('brandId').in(brandId);
    }
    query.exec()
    .then(function success(result) {
      deferred.resolve(result);
    }, function failure(err) {
      deferred.reject(err);
    });

  };

  return deferred.promise;
};

var fetchRoleDetailsByRoleName = function (roleName, brandId) {
   var deferred = Q.defer();
   
   var query = brandModel.Role.findOne();
    query.where('isDeleted').eq(0);
    if (roleName) {
      query.where({'role_type': { "$regex": "^"+roleName+"$", "$options": "i" }});
      query.where('brandId').eq(brandId);
    };
    query.exec()
    .then(function success(result) {
      deferred.resolve(result);
    }, function failure(err) {
      deferred.reject(err);
    });

   return deferred.promise;
};

var deleteRoles = function (roleIds) {
   var deferred = Q.defer();

   var query = brandModel.Role.remove({"_id": {$in: roleIds}});
    query.exec()
    .then(function success(result) {
      deferred.resolve(result);
    }, function failure(err) {
      deferred.reject(err);
    });

   return deferred.promise;
};

// exports section
exports.Role = brandModel.Role;
exports.createRole = createRole;
exports.deleteRoles = deleteRoles;
exports.fetchRoleDetails = fetchRoleDetails;
exports.fetchRoleDetailsByRoleName = fetchRoleDetailsByRoleName;
exports.createRolesBulk = createRolesBulk;