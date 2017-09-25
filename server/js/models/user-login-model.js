var Q = require('q');
// DB Drivers / packages
var mongoose = require('../util/connection');
mongoose.Promise = Q.Promise;
const escapeStringRegexp = require('escape-string-regexp');

var userModel = require('./user-models');
var User = userModel.User;

// check if user exists
var loginUser = function (userLoginDetails) {

  var deferred = Q.defer();

  var query = User.findOne();
  query.populate({
      path: 'role_id',
      select: '-__v -updatedAt -createdAt -isActive -isDeleted'
  });
  // where conditions
  if (userLoginDetails.email) {
    query.where({'email': { "$regex": "^"+escapeStringRegexp(userLoginDetails.email)+"$", "$options": "i" }});
    query.where('regType').eq('EMAIL');
  } else if (userLoginDetails.contactNo) {
    query.where('phoneNo').eq(userLoginDetails.contactNo);
    query.where('regType').eq('CONTACTNO');
  };
 // query.where('password').eq(userLoginDetails.password);
  query.where('isDeleted').eq(0);
  // Employee Information if employee
    query.populate({
      path: 'empUniqId',
      model: 'employees',
      populate :{
        path: 'roleId',
        model: 'brand_roles',
        select: 'role_type',
        as: 'roles'
      }
    });
    query.populate({
      path: 'empUniqId',
      model: 'employees',
      populate :{
        path: 'roleId',
        model: 'brand_roles',
        select: 'role_type',
        as: 'roles'
      }
    });
    query.populate({
      path: 'empUniqId',
      model: 'employees',
      populate :{
        path: 'brandId',
        model: 'brands',
        select: 'name empPersonlizationPrefix',
        as: 'brand'
      }
    });
    query.populate({
      path: 'empUniqId',
      model: 'employees',
      populate :{
        path: 'locationId',
        model: 'locations',
        select: 'lname',
        as: 'location'
      }
    });


  // query execution
  query.exec()
    .then(function success(result) {
        if(result) {
          if (result.isActive) {
            var passDecRes = false;
            try {
              passDecRes = result.validatePassword(userLoginDetails.password)
            } catch (err) {
              var err = new Error("Error in decrypting user password: " + err);
              deferred.reject(err);
            }
            if(passDecRes) {
              deferred.resolve(result);
            } else {
              var err = new Error("Incorrect Login credentials !!!");
              err.code = 100;
              deferred.reject(err);
            }
          } else { // Ask user to verify email / mobile number
            var err = new Error("Please verify your account using email.");
            err.code = 802;
            deferred.reject(err);
          };
        } else {
          if(userLoginDetails.email) {
            var err = new Error(userLoginDetails.email + " is not registered.");
            err.code = 800;
          } else if(userLoginDetails.contactNo) {
            var err = new Error(userLoginDetails.contactNo + " is not registered.");
            err.code = 801;
          }
          deferred.reject(err);
        }
    }, function failre(err) {
        deferred.reject(err);
    });

  return deferred.promise;
};

// exports section
exports.loginUser = loginUser;