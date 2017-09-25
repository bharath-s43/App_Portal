var Q = require('q');
// DB Drivers / packages
var mongoose = require('../util/connection');
var Schema = mongoose.Schema;
mongoose.Promise = Q.Promise;
var logger = require('../util/log').get();
// Constants
const escapeStringRegexp = require('escape-string-regexp');

// Schema Definition
var employeeHistorySchema = new Schema({
  empUniqId: { type: Schema.Types.ObjectId, ref: 'employees', index: true, required: true, trim: true },
  employeeId: {type: String, trim: true, index: true, required: true},
  key: {type: String, trim: true, default: null},
  oldVal: {type: String, trim: true, default: null},
  newVal: {type: String, trim: true, default: null}
},
{
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});
//Transform
employeeHistorySchema.options.toJSON.transform = function (doc, ret, options) {
  // remove the _id of every document before returning the result
  ret.id = ret._id;
  delete ret._id;
  delete ret.__v;
};
employeeHistorySchema.options.toObject.transform = function (doc, ret, options) {
  // remove the _id of every document before returning the result
  ret.id = ret._id;
  delete ret._id;
  delete ret.__v;
};

// model creation for employee history schema
var EmployeeHistory = mongoose.model('employee_history', employeeHistorySchema);



// save employee history details
var postEmployeeHistory = function (employeeDetails) {
  var deferred = Q.defer();

  if (Array.isArray(employeeDetails)) {
     var bulk = EmployeeHistory.collection.initializeOrderedBulkOp();
    employeeDetails.forEach(function (element, index) {
      bulk.insert({
        // required parameters
        empUniqId: element.empUniqId,
        employeeId: element.empId,
        empAttribute: element.empAttribute,
        key: element.key,
        oldVal: element.oldVal,
        newVal: element.newVal,
        updatedAt: new Date(),
        createdAt: new Date()
      });
    });
    bulk.execute(function (err) {
         if(err) {
          logger.error("Employee history save error: " + err);
          deferred.reject(err);
         } else {
          deferred.resolve(bulk);
         }                   
    });
  } else {
    var employeeHistoryObj = new EmployeeHistory({
      // required parameters
      empUniqId: employeeDetails.empUniqId,
      employeeId: employeeDetails.empId,
      empAttribute: employeeDetails.empAttribute,
      key: employeeDetails.key,
      oldVal: employeeDetails.oldVal,
      newVal: employeeDetails.newVal
    });

     employeeHistoryObj.save(function (err) {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve(employeeObj);
      };
    }); // employee end
  };

  return deferred.promise;
};

// fetch employees history details
var fetchEmployeeHistrory = function (searchParams, empUniqId) {

  var deferred = Q.defer();
  var empId = null;

  if (searchParams && Object.keys(searchParams).length !== 0) {
    empId = searchParams.hasOwnProperty('empId') ? searchParams.empId : null;
  };

  var query = EmployeeHistory.find();
  // query.populate({
  //   path: "empUniqId",
  //   model: 'employees',
  //   select: "fullName",
  //   populate: {
  //     path : "brandId",
  //     model: 'brands',
  //     select: 'name',
  //     populate: {path : "custId" }
  //   },
  //   populate: {
  //     path : "locId",
  //     select: 'lname',
  //     model: 'locations',
  //   }
  // });

  if (empUniqId) {
    query.where('empUniqId').eq(empUniqId);
  };

  if (empId) {
    query.where('employeeId').eq(empId);
  };

  query.exec()
  .then(function success(result) {
    deferred.resolve(result);
  }, function failure(err) {
    deferred.reject(err);
  });

  return deferred.promise;
};


// exports section
exports.postEmployeeHistory = postEmployeeHistory;
exports.fetchEmployeeHistrory = fetchEmployeeHistrory;