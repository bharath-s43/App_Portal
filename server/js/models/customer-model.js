var Q = require('q');
// DB Drivers / packages
var mongoose = require('../util/connection');
var Schema = mongoose.Schema;
mongoose.Promise = Q.Promise;

// Import Models
var Contact = require('./contact-model');

// create a schema
var customerSchema = new Schema({
  name: {type: String, trim: true},
  add: {type: String, trim: true, min: 2, max: 80},
  primaryContact: {
    name: {type: String, trim: true, min: 2, max: 30, default: null},
    email: {type: String, trim: true, default: null},
    contactNo: {type: String, trim :true, default: null},
    userId: {type: Schema.Types.ObjectId, ref:"users", default: null},
    _id: {id: false}
  },
  adminContact: {
    name: {type: String, trim: true, min: 2, max: 30, default: null},
    email: {type: String, trim: true, default: null},
    contactNo: {type: String, trim :true, default: null},
    userId: {type: Schema.Types.ObjectId, ref:"users", default: null},
    _id: {id: false}
  },
  brands: [{
    id: {type: Schema.Types.ObjectId, ref: 'brands'},
    _id: false
  }],
  isActive: { type: Number, default: 1},
  isDeleted: { type: Number, default: 0}
},
{
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});
//Transform
customerSchema.options.toJSON.transform = function (doc, ret, options) {
  // remove the _id of every document before returning the result
  ret.id = ret._id;
  //delete ret._id;
  delete ret.__v;
};
customerSchema.options.toObject.transform = function (doc, ret, options) {
  // remove the _id of every document before returning the result
  ret.id = ret._id;
  //delete ret._id;
  delete ret.__v;
};

// model creation for user schema
var Customer = mongoose.model('customers', customerSchema);

// check if user exists
var checkCustomer = function (custName, customerId) {

  var deferred = Q.defer();

  var query = Customer.find();

  if (custName) {
    query.where('name').eq(custName);
  };

  if(customerId) {
    query.where('_id').eq(customerId);
  };

  query.select('name');
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

// save user details
var createCustomer = function (customerDetails) {
  var deferred = Q.defer();

  var customerObj = new Customer({
      // required parameters
      name: customerDetails.name,
      add: customerDetails.add,
      // primaryContact: { 
      //   name: customerDetails.primaryContact.name,
      //   email: customerDetails.primaryContact.email,
      //   contactNo: customerDetails.primaryContact.contactNo,
      //   userId: customerDetails.primaryContact.userId ? customerDetails.primaryContact.userId : null 
      // },
      // adminContact: {
      //   name: customerDetails.adminContact.name,
      //   email: customerDetails.adminContact.email,
      //   contactNo: customerDetails.adminContact.contactNo,
      //   userId: customerDetails.adminContact.userId ? customerDetails.adminContact.userId : null
      // }
      primaryContact: customerDetails.primaryContact,
      adminContact: customerDetails.adminContact
    });

    customerObj.save(function (err) {
      if (err) {
        deferred.reject(err);
      };
      deferred.resolve(customerObj);
    });

  return deferred.promise;
};

// fetch Customer
var fetchCustomerDetails = function (searchParams, custId) {

  var deferred = Q.defer();
  var select = [];
  var custIds = [];

  if (searchParams && Object.keys(searchParams).length !== 0) {
    // when search params added, add it here in similar maner as of employee-model (fetchEmplyeeDetails())
    try {
      custIds = (searchParams.hasOwnProperty('custId') && searchParams.custId) ? searchParams.custId.split(',') : [];
    } catch(err) {
      if(searchParams && searchParams.custId) {
        custIds.push(searchParams.custId);
      }
    }
    select = (searchParams.hasOwnProperty('select') && searchParams.select) ? searchParams.select.split(',') : [];
    select = select.join(' ');
  };
  
  var query = Customer.find();

  query.where('isDeleted').eq(0);
  
  if (select && select.length > 0) {
    query.select(select);
  } else {
    query.select('-__v -updatedAt -createdAt -isDeleted -isActive');
  };

  if (custId || custIds.length > 0) {
    if (custId) {
      custIds.push(custId);
    };
    query.where('_id').in(custIds);
  };

    //User info for email verified
    query.populate({
      path: 'adminContact.userId',
      select: 'emailVerified verificationStatus inviteSentAt',
      as: 'user'
    });

    //User info for email verified
    query.populate({
      path: 'primaryContact.userId',
      select: 'emailVerified verificationStatus inviteSentAt',
      as: 'user'
    });

  query.exec()
  .then(function success(result) {
    deferred.resolve(result);
  }, function failure(err) {
    deferred.reject(err);
  });

  return deferred.promise;
};

var deleteCustomer = function (customerIds) {
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
            var query = Customer.find();
            query.where('isDeleted').eq(0);
            query.where('_id').in(customerIds);
            query.exec()
            .then(function success (customerResult) {
                next(customerResult)
              }, function failure(err) {
                deferred.reject(err);
              });
        }
      )
      .then(function (next, customerResult) {

          var bulk = Customer.collection.initializeOrderedBulkOp();
          bulk.find({'_id': {$in: customerIds}}).update({$set: {isDeleted: 1}});
          bulk.execute(function (err) {
               if(err) {
                deferred.reject(err);
               } else {
                deferred.resolve(customerResult);
               }                   
          });
        }
      )
    }('undefined' !== typeof exports && exports || new Function('return this')()));

  return deferred.promise;
}

// Update Customer data
var updateCustomer = function (customerDetails, custUniqId) {
  var deferred = Q.defer();


  var query = Customer.findOne();
  query.where('isDeleted').eq(0);
  if (custUniqId) {
    query.where('_id').eq(custUniqId);
  }

  query.exec()
  .then(function success (custDoc) {
    
      if (customerDetails.name) {
        custDoc.name = customerDetails.name;
      };

      if (customerDetails.add) {
        custDoc.add = customerDetails.add;
      };

      if(customerDetails.primaryContact) {
        custDoc.primaryContact = customerDetails.primaryContact;
      };

      if(customerDetails.adminContact) {
        custDoc.adminContact = customerDetails.adminContact;
      };


      custDoc.save(function (err) {  //save updated customer
        if (err) {
          deferred.reject(err);
        };

        deferred.resolve(custDoc); 
      });
    }, function failure(err) {
      deferred.reject(err);
    });


  return deferred.promise;
};

// delete admin and primary contact details
var deleteAdminUsers = function (userIds) {
  var deferred = Q.defer();

  var emptyObject = {};
  emptyObject.name = null;
  emptyObject.email = null;
  emptyObject.contactNo = null;
  emptyObject.userId = null;

  (function (exports) {
      'use strict';
     
      var Sequence = exports.Sequence || require('sequence').Sequence
        , sequence = Sequence.create()
        , err
        ;

    /* Using sequence package to make callback sync for maintaining atomic DB transactions */
    sequence
      .then(function (next) {
           Customer.update({ "adminContact.userId": { $in: userIds } }, { $set: { "adminContact" : emptyObject } }, { multi: true }, function (err, res) {
              if (err) {
                deferred.reject(err);
              } else {
                next();
              };
           }); 
        }
      )
      .then(function (next) {
          Customer.update({ "primaryContact.userId": { $in: userIds } }, { $set: { "primaryContact" : emptyObject } }, { multi: true }, function (err, res) {
              if (err) {
                deferred.reject(err);
              } else {
                deferred.resolve(1);
              };
           }); 
        }
      )
    }('undefined' !== typeof exports && exports || new Function('return this')()));

  return deferred.promise;
};


// exports section
exports.Customer = Customer;
exports.checkCustomer = checkCustomer;
exports.createCustomer = createCustomer;
exports.fetchCustomerDetails = fetchCustomerDetails;
exports.deleteCustomer = deleteCustomer;
exports.updateCustomer = updateCustomer;
exports.deleteAdminUsers = deleteAdminUsers;