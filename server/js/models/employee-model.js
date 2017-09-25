var Q = require('q');
// DB Drivers / packages
var mongoose = require('../util/connection');
var Schema = mongoose.Schema;
var dateFormat = require('dateformat');

mongoose.Promise = Q.Promise;

var env = require('../conf/config.js').env;
var employeeImageUrl = require("../conf/v1/config-" + env +".js").const.CLOUD_IMAGE_URL + "emp_img/";

const escapeStringRegexp = require('escape-string-regexp');
// import models
var locationModel = require('./location-model');
var brandModel = require('./brand-model');
var employeeHistoryModel = require('./employee-history-model');

// create a schema
var employeeSchema = new Schema({
  custId: {type: Schema.Types.ObjectId, ref: 'customers', index: true},
  brandId: {type: Schema.Types.ObjectId, ref: 'brands', index: true},
  locationId: {type: Schema.Types.ObjectId, ref: 'locations', index: true},
  fullName: {
    fname: {type: String, trim: true, required: true},
    lname: {type: String, trim: true, required: true},
    _id: {id: false}
  },
  email: { type: String, index: { sparse: true } },
  phoneNo: { type: String, index: true},
  password: { type: String, default: null},
  img: {type: String, trim: true, default: null},
  employeeId: {type: String, trim: true, index: true},
  beaconId: {type: String, trim: true, index: true, default: null},
  roleId: {type: Schema.Types.ObjectId, ref: 'brand_roles', index: true},
  department: {type: String, trim: true, default: null},
  prefix: {
    _id: {id: false},
    key: {type: String, trim: true, default: null},
    value: {type: String, trim: true, default: null}
  },  // prefix field set in while creating customer
  startDt: {type: Date, default: null},
  feedback: {type: Schema.Types.ObjectId, ref: 'feedbacks', index: true, default: null},
  isActive: { type: Number, default: 1},
  isDeleted: { type: Number, default: 0}
},
{
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});
//Transform
employeeSchema.options.toJSON.transform = function (doc, ret, options) {
  // remove the _id of every document before returning the result
  ret.id = ret._id;
  //delete ret._id;
  delete ret.__v;
};
employeeSchema.options.toObject.transform = function (doc, ret, options) {
  // remove the _id of every document before returning the result
  ret.id = ret._id;
  //delete ret._id;
  delete ret.__v;
};
employeeSchema.virtual('fullName.full') // employee full name alias
.get(function () {
  return this.fullName.fname + ' ' + this.fullName.lname;
});

employeeSchema.virtual('empImgUrl') // employee full name alias
.get(function () {
  if(this.img) {
    return employeeImageUrl + this.img;
  } else {
    return this.img;
  }
});

// model creation for user schema
var Employee = mongoose.model('employees', employeeSchema);

// check if user exists
var checkEmployee = function (empId, brandId, empUniqId, email, phoneNo) {

  var deferred = Q.defer();

  brandId = mongoose.Types.ObjectId(brandId);
  
  if (empUniqId) {
    empUniqId = mongoose.Types.ObjectId(empUniqId);
  } else {
    empUniqId = null;  
  };

  var orConditions = [];
  if (empId && brandId) {
    orConditions.push({"brandId" : brandId, "employeeId" : { "$regex": "^"+escapeStringRegexp(empId)+"$", "$options": "i" }});  
  };

  if (empUniqId) {
    orConditions.push({"_id" : empUniqId});  
  };

  if (email) {
    orConditions.push({"email" : { "$regex": "^"+escapeStringRegexp(email)+"$", "$options": "i" }});  
  };
  
  if (phoneNo) {
    orConditions.push({"phoneNo": phoneNo});  
  };
  

  var query = Employee.findOne({$or: orConditions});
  query.populate({
    path: 'brandId',
    match: { isDeleted: { $eq: 0 }},
    select: 'name bid'
  });

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

// check if user exists
var checkEmailContactEmployee = function (email, phoneNo) {

  var deferred = Q.defer();

  var query = Employee.findOne();
  if(email) { 
    query.or([{"email": { "$regex": "^"+escapeStringRegexp(email)+"$", "$options": "i" }}]);
  } else {
    query.or([{"phoneNo": phoneNo}]);
  }
  query.select('email phoneNo');
  query.where('isDeleted').eq(0);
  query.exec()
    .then(function success(result) {
        deferred.resolve(result);
    }, function failre(err) {
        deferred.reject(err);
    });

  return deferred.promise;
};

var checkEmployeeBeacon = function (beaconId, locId) {
  var deferred = Q.defer();

  var query = Employee.findOne({"beaconId": { "$regex": "^"+escapeStringRegexp(beaconId)+"$", "$options": "i" }});
  query.where('isDeleted').eq(0);
  if (locId) {
    query.where('locationId').eq(locId);
  };

  query.populate({
      path: "roleId",
      select: '-updatedAt -createdAt -__v',
      as: "roles"
    });

    query.populate({
      path: "brandId",
      select: '-roles -locations -updatedAt -createdAt -__v',
      as: "brands"
    });

    query.populate({
      path: "locationId",
      select: '-employees -updatedAt -createdAt -__v',
      as: "locations"
    });
  
  query.exec()
  .then(function success(result) {
      deferred.resolve(result);
  }, function failre(err) {
      deferred.reject(err);
  });

  return deferred.promise;
};


// save user details
var createEmployee = function (employeeDetails) {
  var deferred = Q.defer();

  var employeeObj = new Employee({
      // required parameters
      custId: employeeDetails.custId,
      brandId: employeeDetails.brandId,
      locationId: employeeDetails.locId,
      fullName: employeeDetails.fullName,
      phoneNo: employeeDetails.phoneNo ? employeeDetails.phoneNo : null,
      email: employeeDetails.email ? employeeDetails.email : null,
      password: null, 
      img: employeeDetails.img,
      employeeId: employeeDetails.empId,
      roleId: employeeDetails.roleId,
      department: employeeDetails.dept,
      prefix: employeeDetails.prefix,
      startDt: employeeDetails.startDt ? dateFormat(employeeDetails.startDt, 'yyyy/mm/dd') : null,
      // OPTIONAL PARAMETERS
      beaconId: employeeDetails.beaconId ? employeeDetails.beaconId : null,
      feedback: employeeDetails.feedbackId ? employeeDetails.feedbackId : null
    });

    // on employee save -- save employee ids in location schema
    var query = locationModel.Location.findById(employeeDetails.locId);
    query.where("isDeleted").eq(0);
    query.exec()
    .then(function success (locDoc) {
        if (locDoc && locDoc._doc && locDoc._doc.employees) { // if location exists
          // Save employee
          employeeObj.save(function (err) {
            if (err) {
              deferred.reject(err);
            };

            locDoc.employees.push({id: employeeObj._id, eid: employeeObj.eid});
            // Save updated location object
            locDoc.save(function (err) {
              if (err) {
                 deferred.reject(err);
              };
              deferred.resolve(employeeObj);
            }); // location save end
          }); // employee end
        } else {
          var err = new Error("Location does not exists for selected location !!!");
          deferred.reject(err);
        };
    }, function failure(err) {
      deferred.reject(err);
    });

  return deferred.promise;
};

// Create employees in bulk - employee details object as parameter
var createEmployeesBulk = function (employeeDetailsArr) {
  var deferred= Q.defer();

  Employee.insertMany(employeeDetailsArr, function (error, docs) {
    if (error) {
      deferred.reject(error);
    } else {
      deferred.resolve(docs);
    };
  });

  return deferred.promise;
};

// fetch employees
var fetchEmployeeProfiles = function (searchParams, empUniqId) {

  var deferred = Q.defer();
  var empId, brandId, beaconId, locationId = null;

  var query = Employee.find();
    
    query.populate({
      path: "roleId",
      select: '-updatedAt -createdAt -__v',
      as: "roles"
    });

    query.populate({
      path: "brandId",
      select: '-roles -locations -updatedAt -createdAt -__v',
      as: "brands"
    });

    query.populate({
      path: "locationId",
      select: '-employees -updatedAt -createdAt -__v',
      as: "locations"
    });

    query.select('-updatedAt -createdAt -isDeleted -isActive -__v');
    query.where('isDeleted').eq(0);

  if (searchParams && Object.keys(searchParams).length !== 0) {
    empId = (searchParams.hasOwnProperty('empId') && searchParams.empId) ? searchParams.empId.split(',') : null;
    custId = (searchParams.hasOwnProperty('custId') && searchParams.custId) ? searchParams.brandId.split(',') : null;
    brandId = (searchParams.hasOwnProperty('brandId') && searchParams.brandId) ? searchParams.brandId.split(',') : null;
    beaconId = (searchParams.hasOwnProperty('beaconId') && searchParams.beaconId) ? searchParams.beaconId.split(',') : null;
    locationId = (searchParams.hasOwnProperty('locId') && searchParams.locId) ? searchParams.locId.split(',') : null;

    // employee cannot be found only using empId .. it should be matched with brandId also
    if (custId && custId.length > 0) {
      var regex = custId.map(function (e) { return new RegExp("^"+escapeStringRegexp(e)+"$", "i"); });
      query.where({'custId': { "$in": regex}});
    } else if (brandId && brandId.length > 0) {
      query.where('brandId').in(brandId);
      
      if (empId && empId.length > 0) {
        var regex = empId.map(function (e) { return new RegExp("^"+escapeStringRegexp(e)+"$", "i"); });
        query.where({'employeeId': { "$in": regex}});
      };
    } else if (beaconId && beaconId.length > 0) {  // beacon based search parameter
      var regex = beaconId.map(function (e) { return new RegExp("^"+escapeStringRegexp(e)+"$", "i"); });
      query.where({'beaconId': { "$in": regex}});
      //query.where('{"beaconId": { $regex: /'+beaconId[0]+'/, $options: "i" }}');
    } else if (locationId && locationId.length > 0) {
      query.where('locationId').in(locationId);
    };

    if (empUniqId) {
      query.where('_id').eq(empUniqId);
    };
  } else { // fetch brand details irrespective of customers
    if (empUniqId) {
      query.where('_id').eq(empUniqId);
    };
  };

  query.exec()
  .then(function success(result) {
    deferred.resolve(result);
  }, function failure(err) {
    deferred.reject(err);
  });

  return deferred.promise;
};


// Update Employee Profile data
var updateEmployeeProfile = function (employeeDetails, empUniqId) {
  var deferred = Q.defer();

  var empHistRecs = [];

  var query = Employee.findOne();
  query.where('isDeleted').eq(0);
  if (empUniqId) {
    query.where('_id').eq(empUniqId);
  } else if (employeeDetails.empId) {
    query.where({'employeeId': { "$regex": "^"+escapeStringRegexp(employeeDetails.empId)+"$", "$options": "i" }});
  };

  // Brand Information
    query.populate({
      path: 'brandId',
      select: 'name',
      as: 'brands'
    });

    // Location Information
    query.populate({
      path: 'locationId',
      select: 'lname',
      as: 'locations'
    });

    // Role Information
    query.populate({
      path: 'roleId',
      select: 'role_type',
      as: 'roles'
    });

  query.exec()
  .then(function success (empDoc) {
      // if (employeeDetails.brandId) {
      //   empDoc.brandId = employeeDetails.brandId;
      // };
      // if (employeeDetails.locId) {
      //   empDoc.locId = employeeDetails.locId
      // };
      
      if (employeeDetails.role && employeeDetails.role._id && empDoc.roleId && (employeeDetails.role._id !== empDoc.roleId._id)) {
        var empHistObj = {};
        empHistObj.empUniqId = empDoc.id;
        empHistObj.empId = empDoc.employeeId;
        empHistObj.key = 'Role';
        empHistObj.empAttribute = 'roleId';
        empHistObj.oldVal = (empDoc.roleId && empDoc.roleId.role_type) ? empDoc.roleId.role_type : 'not defined';
        empHistObj.newVal = employeeDetails.role.role_type;
        empHistRecs.push(empHistObj);

        empDoc.roleId = employeeDetails.role.roleId;
      };

      if (employeeDetails.department && (employeeDetails.department !== empDoc.department)) {
        var empHistObj = {};
        empHistObj.empUniqId = empDoc.id;
        empHistObj.empId = empDoc.employeeId;
        empHistObj.key = 'Department';
        empHistObj.empAttribute = 'department';
        empHistObj.oldVal = empDoc.department ? empDoc.department : 'not defined';
        empHistObj.newVal = employeeDetails.department;
        empHistRecs.push(empHistObj);

        empDoc.department = employeeDetails.department;
      };

      if(employeeDetails.fullName) {
        empDoc.fullName = employeeDetails.fullName;
      }

      if(employeeDetails.employeeId) {
        empDoc.employeeId = employeeDetails.employeeId;
      }

      if(employeeDetails.beaconId) {
        empDoc.beaconId = employeeDetails.beaconId;
      } else {
        empDoc.beaconId = null;
      }

      if(employeeDetails.prefix) {
        empDoc.prefix = employeeDetails.prefix;
      }

      if(employeeDetails.startDt) {
        empDoc.startDt = employeeDetails.startDt;
      }

      if(employeeDetails.img) {
        empDoc.img = employeeDetails.img;
      }

      if(employeeDetails.role && employeeDetails.role._id) {
        empDoc.roleId = employeeDetails.role._id;
      }

      empDoc.save(function (err) {  //save updated employee profiles
        if (err) {
          deferred.reject(err);
        } else {
          // on succesfuly updation of employee details save it in history table
          if (empHistRecs && empHistRecs.length > 0) {
            employeeHistoryModel.postEmployeeHistory(empHistRecs);
          };
          deferred.resolve(empDoc);
        };
      });
    }, function failure(err) {
      deferred.reject(err);
    });


  return deferred.promise;
};

var deleteEmployee = function (employeeIds) {
  var deferred = Q.defer();

  var bulk = Employee.collection.initializeOrderedBulkOp();
    bulk.find({'_id': {$in: employeeIds}}).update({$set: {isDeleted: 1}});
    bulk.execute(function (err) {
         if(err) {
          deferred.reject(err);
         } else {
          deferred.resolve(bulk);
         }                   
    });

  return deferred.promise;
};

// fetch Emnployees Profiles using like for emp name or id
var fetchEmployeeLikeIdOrName = function (searchParams) {
  var deferred = Q.defer();

  var brandId = null,
      locId = null;

  if (searchParams && Object.keys(searchParams).length !== 0) {
    // when search params added, add it here in similar maner as of employee-model (fetchEmplyeeDetails())
    custId = (searchParams.hasOwnProperty('custId') && searchParams.custId) ? searchParams.custId.split(',') : null;
    brandId = (searchParams.hasOwnProperty('brandId') && searchParams.brandId) ? searchParams.brandId.split(',') : null;
    locId = (searchParams.hasOwnProperty('locId') && searchParams.locId) ? searchParams.locId.split(',') : null;
  };

  var query = Employee.find();

  query.where('isDeleted').eq(0);
  if (custId && custId.length > 0) {
    query.where("custId").in(custId);
  };

  if (brandId && brandId.length > 0) {
    query.where("brandId").in(brandId);
  };

  if (locId && locId.length > 0) {
    query.where("locationId").in(locId);
  };
  
  if (searchParams.empData) {
    var empObj = searchParams.empData.split(' ');
    // empId or condition
    var orConditions = [{"employeeId": { "$regex": escapeStringRegexp(empObj[0]), "$options": "i" }}];
    // emp name or condition
    orConditions.push({"fullName.fname": { "$regex": escapeStringRegexp(empObj[0]), "$options": "i" }}, {"fullName.lname": { "$regex": empObj.length > 1 ? escapeStringRegexp(empObj[1]): escapeStringRegexp(empObj[0]), "$options": "i" }});
    // beaconId search
    if (searchParams.hasOwnProperty('page') && searchParams.page === 'searchEmployee') {
      orConditions.push({"beaconId": { "$regex": ".*"+escapeStringRegexp(empObj[0])+"$", "$options": "i" }});
    };

    query.or(orConditions);
  };

    // Brand Information
    query.populate({
      path: 'brandId',
      select: 'name backgroundColor fontColor logo_img',
      as: 'brands'
    });

    // Location Information
    query.populate({
      path: 'locationId',
      select: 'lname',
      as: 'locations'
    });

    // Role Information
    query.populate({
      path: 'roleId',
      select: 'role_type',
      as: 'roles'
    });

  query.exec()
  .then(function (empDoc) {
    deferred.resolve(empDoc);
  }, function (err) {
    deferred.reject(err);
  });

  return deferred.promise;
};

var checkEmployeeId = function (empUniqId) {
  var deferred = q.defer();

  if (empUniqId) {
    empUniqId = mongoose.Types.ObjectId(empUniqId);
  };

  var query = Employee.find();

  query.where('_id').eq(empUniqId);
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

// Bulk update of employee documents. Input - Array of employee documents
var updateEmployeeDataBulk = function (empDocsArr) {
  var deferred = Q.defer();
  var isResolve = true;

  empDocsArr.forEach(function (element, index) {
    element.save(function (error) {
      if (error) {
        logger.error("Employee bulk update error: " + error);
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
exports.Employee = Employee;
exports.checkEmployee = checkEmployee;
exports.checkEmailContactEmployee = checkEmailContactEmployee;
exports.createEmployee = createEmployee;
exports.createEmployeesBulk = createEmployeesBulk;
exports.checkEmployeeBeacon = checkEmployeeBeacon;
exports.fetchEmployeeProfiles = fetchEmployeeProfiles;
exports.updateEmployeeProfile = updateEmployeeProfile;
exports.deleteEmployee = deleteEmployee;
exports.fetchEmployeeLikeIdOrName = fetchEmployeeLikeIdOrName;
exports.checkEmployeeId = checkEmployeeId;
exports.updateEmployeeDataBulk = updateEmployeeDataBulk;