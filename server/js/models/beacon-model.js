var Q = require('q');
// DB Drivers / packages
var mongoose = require('../util/connection');
var Schema = mongoose.Schema;
mongoose.Promise = Q.Promise;
const escapeStringRegexp = require('escape-string-regexp');

//Import models
var employeeModel = require('./employee-model');

// create a schema
var beaconSchema = new Schema({
  customer: {type: Schema.Types.ObjectId, ref: 'customers', index: true, required: true},
  brand: {type: Schema.Types.ObjectId, ref: 'brands', index: true, default: null},
  location: {type: Schema.Types.ObjectId, ref: 'locations', index: true, default: null},
  employeeId: {type: String, ref: 'employees', index: true, default: null},
  beaconId: {type: String, required: "true", unique: "true", index: true, default: null},
  status: {type: String, default: "unassigned", trim: true, uppercase: true, enum: ['PAIRED', 'UNPAIRED']},
  isActive: { type: Number, default: 1},
  isDeleted: { type: Number, default: 0}
},
{
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});
//Transform
beaconSchema.options.toJSON.transform = function (doc, ret, options) {
  // remove the _id of every document before returning the result
  ret.id = ret._id;
  delete ret._id;
  delete ret.__v;
};
beaconSchema.options.toObject.transform = function (doc, ret, options) {
  // remove the _id of every document before returning the result
  ret.id = ret._id;
  delete ret._id;
  delete ret.__v;
};

// model creation for user schema
var Beacon = mongoose.model('beacons', beaconSchema);

// check if beacon exists
var checkBeacons = function (beaconId, locId) {

  var deferred = Q.defer();

  var query = Beacon.findOne();
  query.where('isDeleted').eq(0);
  query.where('isActive').eq(1);
  query.where({"beaconId": { "$regex": "^"+escapeStringRegexp(beaconId)+"$", "$options": "i" }});
  if (locId) {
    query.where("location").eq(locId);
  }
  query.exec()
    .then(function success(result) {
        deferred.resolve(result);
    }, function failre(err) {
        deferred.reject(err);
    });

  return deferred.promise;
};


// Assign Beacons
var assignBeaconInd = function (beaconDetails) {
  var deferred = Q.defer();

  var beaconObj = new Beacon({
      // required parameters
      customer: beaconDetails.custId,
      brand: beaconDetails.brandId,
      location: beaconDetails.locId,
      employeeId: beaconDetails.empId,
      status: 'PAIRED',
      beaconId: beaconDetails.beaconId
    });

    // beacon save
    beaconObj.save(function (err) {
      if (err) {
        deferred.reject(err);
      };

      deferred.resolve(beaconObj);
    }); //

  return deferred.promise;
};


// Update Beacon Status
var updateBeaconData = function (beaconDetails) {
    var deferred = Q.defer();
    var query = Beacon.findOne();
    query.where('isDeleted').eq(0);
    query.where('isActive').eq(1);
    query.where({"beaconId": { "$regex": "^"+escapeStringRegexp(beaconDetails.beaconId)+"$", "$options": "i" }});
    query.exec()
      .then(function success(beaconDoc) {
        if (beaconDoc) {
          if (beaconDetails.status) {
             beaconDoc.status = beaconDetails.status;
          };
          if (beaconDetails.brandId) {
            beaconDoc.brand = beaconDetails.brandId;
          };
          if (beaconDetails.locId) {
            beaconDoc.location = beaconDetails.locId;
          };
          if (beaconDetails.empId) {
            beaconDoc.employeeId = beaconDetails.empId;
          };
          if (beaconDetails.custId) {
            beaconDoc.customer = beaconDetails.custId;
          };

          beaconDoc.save(function (err) {
            if (err) {
              deferred.reject(err);
            } else {
              deferred.resolve(beaconDoc);
            };
          });
        } else {
          deferred.resolve(beaconDoc);
        };
      }, function failre(err) {
          deferred.reject(err);
      });

  return deferred.promise;
};

// Bulk update of beacon documents. Input - Array of beacon documents
var updateBeaconDataBulk = function (beaconDocsArr) {
  var deferred = Q.defer();
  var isResolve = true;

  beaconDocsArr.forEach(function (element, index) {
    element.save(function (error) {
      if (error) {
        logger.error("Beacon bulk update error: " + error);
        deferred.reject(error);
      } else if (isResolve) {
        isResolve = false;
        deferred.resolve();
      };
    });
  });

  return deferred.promise;
  
};

var unAssignPreviousBeacon = function (empId, newBeaconId) {
    var deferred = Q.defer();

    Beacon.update({ employeeId: { $eq: empId }, beaconId:{ $ne: newBeaconId} }, { $set: { "status" : "UNPAIRED", "employeeId" : null } }, { multi: true }, function (err, res) {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve(res);
      };
   });

  return deferred.promise;
};


// Un-Assign Beacons
var unAssignBeaconInd = function (beaconId) {
 var deferred = Q.defer();

  if (!beaconId) {
    deferred.reject(err);
  };

  var query = Beacon.find();
  query.where('isDeleted').eq(0);
  query.where({"beaconId": { "$regex": "^"+escapeStringRegexp(beaconId)+"$", "$options": "i" }});
  query.exec()
    .then(function success(result) {
        deferred.resolve(result);
    }, function failre(err) {
        deferred.reject(err);
    });

  return deferred.promise;
};


// Fetch Beacon Details
var fetchBeaconDetails = function (searchParams, beaconUniqId) {
  var deferred = Q.defer();
  
  var custId = null,
      brandId = null,
      locId = null,
      beaconId = null,
      beaconStatus = null,
      operator = null;  // values can be exact or like or lastcharslike(string ending with these chars)

  if (searchParams && Object.keys(searchParams).length !== 0) {
    // when search params added, add it here in similar maner as of employee-model (fetchEmplyeeDetails())
    custId = (searchParams.hasOwnProperty('custId') && searchParams.custId) ? searchParams.custId.split(',') : null;
    brandId = (searchParams.hasOwnProperty('brandId') && searchParams.brandId) ? searchParams.brandId.split(',') : null;
    locId = (searchParams.hasOwnProperty('locId') && searchParams.locId) ? searchParams.locId.split(',') : null;
    beaconId = (searchParams.hasOwnProperty('beaconId') && searchParams.beaconId) ? searchParams.beaconId : null;
    beaconStatus = (searchParams.hasOwnProperty('beaconStatus') && searchParams.beaconStatus) ? searchParams.beaconStatus.split(',')  : null;
    operator = (searchParams.hasOwnProperty('operator') && searchParams.operator) ? searchParams.operator.toLowerCase() : null;
  };

  var query = Beacon.find();
  query.where('isDeleted').eq(0);
  query.where('isActive').eq(1);
  
  if (beaconUniqId) {
    query.where("_id").eq(beaconUniqId);
  };

  if (custId && custId.length > 0) {
    query.where("customer").in(custId);
  };

  if (brandId && brandId.length > 0) {
    query.where("brand").in(brandId);
  };

  if (locId && locId.length > 0) {
    query.where("location").in(locId);
  };

  if (beaconId && (operator ? operator === 'exact' : true)) {
    query.where({"beaconId": { "$regex": "^"+escapeStringRegexp(beaconId)+"$", "$options": "i" }});
  } else if (beaconId && (operator ? operator === 'startcharslike' : true)) {
    // BeaconId starting with mentioned search string -- <string>%
    query.where({"beaconId": { "$regex": escapeStringRegexp(beaconId)+".*", "$options": "i" }});
  } else if (beaconId && (operator ? operator === 'like' : true)) {
    // BeaconId contains mentioned search string -- %<string>%
   query.where({"beaconId": { "$regex": escapeStringRegexp(beaconId), "$options": "i" }});
  } else if (beaconId && (operator ? operator === 'lastcharslike' : true)) {
    // BeaconId ending with mentioned search string -- %<string>
    query.where({"beaconId": { "$regex": ".*"+escapeStringRegexp(beaconId)+"$", "$options": "i" }});
  };

  if (beaconStatus && beaconStatus.length > 0) {
    query.where("status").in(beaconStatus);
  };

  query.populate({
    path: 'customer',
    select: '_id name'
  });

  query.populate({
    path: 'brand',
    select: '_id name logo_img'
  });

  query.populate({
    path: 'location',
    select: '_id lname'
  });

  query.exec()
    .then(function success(beaconDoc) {
        deferred.resolve(beaconDoc);
    }, function failre(err) {
        deferred.reject(err);
    });

  return deferred.promise;
};

var fetchAssignedBeaconDetails = function(beaconDetails) {
  var deferred = Q.defer();

  var query = Beacon.findOne();
  query.where('isDeleted').eq(0);
  query.where('isActive').eq(1);
  query.where('status').eq('PAIRED');
  if(beaconDetails && beaconDetails.beaconId) {
   query.where({"beaconId": { "$regex": "^"+escapeStringRegexp(beaconDetails.beaconId)+"$", "$options": "i" }});
  }
  query.exec()
    .then(function success(result) {
        deferred.resolve(result);
    }, function failre(err) {
        deferred.reject(err);
    });

  return deferred.promise;
}

var unAssignEmpBeacons = function (empIds) {
  var deferred = Q.defer();

  (function (exports) {
      'use strict';
     
      var Sequence = exports.Sequence || require('sequence').Sequence
        , sequence = Sequence.create()
        , err
        ;

    /* Using sequence package to make callback sync for maintaining atomic DB transactions */
    sequence
      .then(function (next) {
          var query = employeeModel.Employee.find();
            query.select('beaconId');
            query.where('_id').in(empIds);
            query.exec()
            .then(function success(result) {
              if (result) {
                var beaconIds = [];
                result.forEach(function(element, index) {
                  if(element.beaconId) {
                    beaconIds.push(element.beaconId);
                  }
                });
                next(beaconIds);
              } else {
                deferred.resolve(result);
              };
            }, function failure(err) {
              deferred.reject(err);
            });
        }
      )
      .then(function (next, beaconIds) {
          Beacon.update({ beaconId: { $in: beaconIds } }, { $set: { "status" : "UNPAIRED" } }, { multi: true }, function (err, res) {
              if (err) {
                deferred.reject(err);
              } else {
                  deferred.resolve(res);
              };
           });
        }
      )
    }('undefined' !== typeof exports && exports || new Function('return this')()));

  return deferred.promise;
};

// Bulk update of beacon documents. Input - Array of beacon documents
var updateBeaconDataBulk = function (beaconDocsArr) {
  var deferred = Q.defer();
  var isResolve = true;

  beaconDocsArr.forEach(function (element, index) {
    element.save(function (error) {
      if (error) {
        logger.error("Beacon bulk update error: " + error);
        deferred.reject(error);
      } else if (isResolve) {
        isResolve = false;
        deferred.resolve(1);
      };
    });
  });

  return deferred.promise;
  
};

// Bulk remove of beacon documents. Input - Array of beacon documents
var removeBeaconDataBulk = function (beaconDocsArr) {
  var deferred = Q.defer();
  var isResolve = true;

  beaconDocsArr.forEach(function (element, index) {
    element.remove(function (error) {
      if (error) {
        logger.error("Beacon bulk remove error: " + error);
        deferred.reject(error);
      } else if (isResolve) {
        isResolve = false;
        deferred.resolve(1);
      };
    });
  });

  return deferred.promise;
  
};

// exports section
exports.Beacon = Beacon;
exports.checkBeacons = checkBeacons;
exports.assignBeaconInd = assignBeaconInd;
exports.updateBeaconData = updateBeaconData;
exports.updateBeaconDataBulk = updateBeaconDataBulk;
exports.unAssignPreviousBeacon = unAssignPreviousBeacon;
exports.unAssignBeaconInd = unAssignBeaconInd;
exports.fetchBeaconDetails = fetchBeaconDetails;
exports.fetchAssignedBeaconDetails = fetchAssignedBeaconDetails;
exports.unAssignEmpBeacons = unAssignEmpBeacons;
exports.updateBeaconDataBulk = updateBeaconDataBulk;
exports.removeBeaconDataBulk = removeBeaconDataBulk;