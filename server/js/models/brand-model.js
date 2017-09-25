var Q = require('q');
var forEachAsync = require('forEachAsync');
// DB Drivers / packages
var mongoose = require('../util/connection');
var Schema = mongoose.Schema;
mongoose.Promise = Q.Promise;

// Import Models 
var logger = require('../util/log').get();
var utils = require('../util/utils');
var customerModel = require('./customer-model');
var roleModel = require('./role-model');
var env = require('../conf/config.js').env;
var brandImageUrl = require("../conf/v1/config-" + env +".js").const.CLOUD_IMAGE_URL + "brand_img/";

var roleSchema = new Schema({
  role_type: {type: String, required: true, trim: true}, 
  feedbackReasons: [{type: String, trim: true, required: true}],
  brandId: {type: Schema.Types.ObjectId, ref: 'brands'},
  img: String, 
  isActive: {type: Number, default: 1},
  isDeleted: {type: Number, default: 0}
}, {
  timestamps: true
});
// model creation for user schema
var Roles = mongoose.model('brand_roles', roleSchema);


// create a schema
var brandSchema = new Schema({
  name: {type: String, index: true, required: true, trim: true},
  logo_img: {type: String, default: null},
  backgroundColor: {
    _id: {id: false},
    r: {type: Number, trim: true}, g: {type: Number, trim: true}, 
    b: {type: Number, trim: true}, a: {type: Number, trim: true}
  },
  fontColor: {
    _id: {id: false},
    r: {type: Number, trim: true}, g: {type: Number, trim: true}, 
    b: {type: Number, trim: true}, a: {type: Number, trim: true}
  },
  primaryContact: {
    _id: {id: false},
    name: {type: String, trim: true, min: 2, max: 30, default: null},
    email: {type: String, trim: true, default: null},
    contactNo: {type: String, trim :true, default: null},
    userId: {type: Schema.Types.ObjectId, ref:"users", default: null},
  },
  adminContact: {
    _id: {id: false},
    name: {type: String, trim: true, min: 2, max: 30, default: null},
    email: {type: String, trim: true, default: null},
    contactNo: {type: String, trim :true, default: null},
    userId: {type: Schema.Types.ObjectId, ref:"users", default: null},
  },
  ratingImgId: {type: Schema.Types.ObjectId, required: true},
  empPersonlizationPrefix: {type: String, trim: true, max: 20, default: null},
  brandType : {type: Schema.Types.ObjectId, ref: 'brand_types'},
  defaultReasons: [{type: String}],
  locationReasons: [{type: String}],
  roles: [{type: Schema.Types.ObjectId, ref: 'brand_roles'}],
  locations: [{
    id: {type: Schema.Types.ObjectId, ref: 'locations'},
    _id: false
  }],
  customer: {type: Schema.Types.ObjectId, ref:"customers", default:null},
  isActive: { type: Number, default: 1},
  isDeleted: { type: Number, default: 0}
},
{
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});
//Transform
brandSchema.options.toJSON.transform = function (doc, ret, options) {
  // remove the _id of every document before returning the result
  ret.id = ret._id;
  //delete ret._id;
  delete ret.__v;
};
brandSchema.options.toObject.transform = function (doc, ret, options) {
  // remove the _id of every document before returning the result
  ret.id = ret._id;
  //delete ret._id;
  delete ret.__v;
};

brandSchema.virtual('logoImgUrl') // employee full name alias
.get(function () {
  if(this.logo_img) {
    return brandImageUrl + this.logo_img;
  } else {
    return this.logo_img;
  }
});


// model creation for user schema
var Brand = mongoose.model('brands', brandSchema);

// save user details
var configureBrand = function (brandDetails) {
  var deferred = Q.defer();
  var brandDetails = brandDetails;

    (function (exports) {
      'use strict';
     
      var Sequence = exports.Sequence || require('sequence').Sequence
        , sequence = Sequence.create()
        , err
        ;

    /* Using sequence package to make callback sync for maintaining atomic DB transactions */
    sequence
      .then(function (next) {
          if (brandDetails.roles && brandDetails.roles.length>0) {
            brandDetails.roles.forEach(function (element, index) {
              element.isActive = 1;
              element.isDeleted = 0;
            });

            saveRoles(brandDetails.roles)
            .then(function (result) {
              var roleIds = [];
              result.ops.forEach(function (element, index) {
                roleIds.push(element._id);
              });
              next(roleIds);
            }, function (err) {
              deferred.reject(err);
            });
          } else {
            next(null);
          };
        }
      )
      .then(function (next, roleIds) {
          var brandDetailsObj = { // required parameters
              name: brandDetails.name,
              ratingImgId: brandDetails.ratingImgId,
              roles: roleIds,
              customer: brandDetails.custId,
              logo_img: brandDetails.logo_img,
            };

            // optinal parameters check
            if (brandDetails.bckColor) {
              brandDetailsObj.backgroundColor = {
                r: brandDetails.bckColor.r, g: brandDetails.bckColor.g, 
                b: brandDetails.bckColor.b, a: brandDetails.bckColor.a
              };
            };

            if (brandDetails.fntColor) {
              brandDetailsObj.fontColor = {
                r: brandDetails.fntColor.r, g: brandDetails.fntColor.g, 
                b: brandDetails.fntColor.b, a: brandDetails.fntColor.a
              };
            };

            if (brandDetails.empPersPref) {
              brandDetailsObj.empPersonlizationPrefix = brandDetails.empPersPref;
            };

            if (brandDetails.defaultReasons) {
              brandDetailsObj.defaultReasons = brandDetails.defaultReasons;
            };
    
            if(brandDetails.primaryContact) {
              brandDetailsObj.primaryContact = brandDetails.primaryContact
            };

            if(brandDetails.adminContact) {
              brandDetailsObj.adminContact = brandDetails.adminContact
            };

            if (brandDetails.locationReasons) {
              brandDetailsObj.locationReasons = brandDetails.locationReasons;
            };
            if(brandDetails.reasons && brandDetails.reasons.id) {
              brandDetailsObj.brandType = brandDetails.reasons.id
            }

            var brandObj = new Brand(brandDetailsObj);

            brandObj.save(function (err) {  // saving brand details in db
              if (err) {
                deferred.reject(err);
              };

              Roles.update({ _id: { $in: brandObj.roles } }, { $set: { "brandId" : brandObj.id } }, { multi: true }, function (err) {
                  if (err) {
                    deferred.reject(err);
                  } else {
                        // on brand save -- save brand ids in customer objects
                        var query = customerModel.Customer.findOne({"_id": brandDetails.custId});
                        query.where("isDeleted").eq(0);
                        query.exec()
                        .then(function success(custDoc) {
                          if (custDoc && custDoc._doc && custDoc._doc.brands) {
                            custDoc.brands.push({id: brandObj._id, bid: brandObj.bid});
                          } else {
                            var err = new Error("Customer does not exists for selected customer !!!");
                            deferred.reject(err);
                          };
                          // Save updated customer object
                          custDoc.save(function (err) {
                            if (err) {
                               deferred.reject(err);
                            };
                            deferred.resolve(brandObj);
                          })
                        }, function failure(err) {
                          deferred.reject(err);
                        });
                  };
               });
            });
        }
      )
    }('undefined' !== typeof exports && exports || new Function('return this')()));

  return deferred.promise;
};


// fetch brand
var fetchBrandDetails = function (searchParams, brandId, reqSearchParams) {

  var deferred = Q.defer();
  var custId = null;
  var brandIds = [];
  var select = [];

  if (searchParams && Object.keys(searchParams).length !== 0) {
    // when search params added, add it here in similar maner as of employee-model (fetchEmplyeeDetails())
    custId = (searchParams.hasOwnProperty('custId') && searchParams.custId) ? searchParams.custId : null;
    brandIds = (searchParams.hasOwnProperty('brandId') && searchParams.brandId) ? searchParams.brandId.split(',') : [];
    select = (searchParams.hasOwnProperty('select') && searchParams.select) ? searchParams.select.split(',') : [];
    select = select.join(' ');
  };

  if (custId) { // Fetch brand Details for particular customers

    custId = mongoose.mongo.ObjectId(custId);

    (function (exports) {
      'use strict';
     
      var Sequence = exports.Sequence || require('sequence').Sequence
        , sequence = Sequence.create()
        , err
        ;

    /* Using sequence package to make callback sync for maintaining atomic DB transactions */
    sequence
      .then(function (next) {
            var query = customerModel.Customer.findOne();
            query.where('_id').eq(custId);
            query.exec()
            .then(function success(result) {
              if (result) {
                var brandIds = [];
                result._doc.brands.forEach(function (element, index) {
                  brandIds.push(element.id);
                });
                next(brandIds);
              } else {
                var err = "No matching Customer found !!!"
                logger.error("Brand Details Fetch: " + err);
                deferred.resolve([]);
              };
            }, function failure(err) {
              deferred.reject(err);
            });
        }
      )
      .then(function (next, brandIds) {
            var query = Brand.find();
            
            if (select && select.length > 0) {
                  query.select(select);
            } else {
                  query.select('-__v -updatedAt -createdAt -isDeleted -isActive');
            };
            query.populate({
              path: 'customer',
              select: 'name',
              as: 'customer'
            });
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

            query.populate({
              path: 'brandType',
              as: 'brandType'
            });

            query.populate({
              path: 'roles',
              select: '-isDeleted -isActive'
            });
            query.where("_id").in(brandIds);
            query.where("isDeleted").eq(0);
            query.exec()
            .then(function success(result) {
              deferred.resolve(result);
            }, function failure(err) {
              deferred.reject(err);
            });
        }
      )
    }('undefined' !== typeof exports && exports || new Function('return this')()));

  } else { // fetch brand details irrespective of customers
    
    var query = Brand.find();
    query.populate({
      path: 'roles',
      select: '-isDeleted -isActive'
    });
    
    if (select && select.length > 0) {
          query.select(select);
    } else {
          query.select('-__v -updatedAt -createdAt -isDeleted -isActive');
    };

    // Customer Information
    query.populate({
      path: 'customer',
      select: 'name',
      as: 'customer'
    });

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

    query.populate({
              path: 'brandType',
              as: 'brandType'
            });
    
    query.where('isDeleted').eq(0);
    if (brandId || brandIds.length > 0) {
      if (brandId) {
        brandIds.push(brandId);
      };
      query.where('_id').in(brandIds);
    };
    query.exec()
    .then(function success(result) {
      deferred.resolve(result);
    }, function failure(err) {
      deferred.reject(err);
    });

  };

  return deferred.promise;
};


var saveRoles = function (brandroles) {
  var deferred = Q.defer();


  Roles.collection.insert(brandroles, function (err, docs) {
      if (err) {
         deferred.reject(err);
      } else {
        deferred.resolve(docs);
      }
  });

  return deferred.promise;
};

var deleteBrand = function (brandIds, custId) {
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
            var query = Brand.find();

            if (custId) {
              custId = mongoose.mongo.ObjectId(custId);
              query.where('customer').eq(custId);
            };

            query.where('isDeleted').eq(0);
            query.where('_id').in(brandIds);
            query.exec()
            .then(function success (brandResult) {
                if (brandResult && brandResult.length > 0) {
                  next(brandResult)
                } else {
                  var err = new Error("Brands not found for logged in user and mentioned brandIds");
                  err.code = 222;
                  deferred.reject(err);
                }
              }, function failure(err) {
                deferred.reject(err);
              });
        }
      )
      .then(function (next, brandResult) {

          var bulk = Brand.collection.initializeOrderedBulkOp();
          bulk.find({'_id': {$in: brandIds}}).update({$set: {isDeleted: 1}});
          bulk.execute(function (err) {
               if(err) {
                deferred.reject(err);
               } else {
                deferred.resolve(brandResult);
               }                   
          });
        }
      )
    }('undefined' !== typeof exports && exports || new Function('return this')()));

  return deferred.promise;
};

// Update Brand data
var updateBrand = function (brandDetails, brandUniqId) {
  var deferred = Q.defer();

  var query = Brand.findOne();
  query.where('isDeleted').eq(0);
  if (brandUniqId) {
    query.where('_id').eq(brandUniqId);
  } 

  query.exec()
  .then(function success (brandDoc) {
    
      if (brandDetails.name) {
        brandDoc.name = brandDetails.name;
      };

      if (brandDetails.logo_img && (brandDetails.logo_img !== brandDoc.logo_img)) {
        brandDoc.logo_img = brandDetails.logo_img;
      };

      if (brandDetails.bckColor) {
        brandDoc.backgroundColor = brandDetails.bckColor;
      };

      if (brandDetails.fntColor) {
        brandDoc.fontColor = brandDetails.fntColor;
      };

      // if (brandDetails.primaryContact && (brandDetails.primaryContact.name || brandDetails.primaryContact.email || brandDetails.primaryContact.contactNo)) {
      //   brandDetails.primaryContact.userId = brandDetails.primaryContact.userId.id;
      //   brandDoc.primaryContact = brandDetails.primaryContact;
      // };

      // if (brandDetails.adminContact && (brandDetails.adminContact.name || brandDetails.adminContact.email || brandDetails.adminContact.contactNo)) {
      //   brandDetails.adminContact.userId = brandDetails.adminContact.userId.id;
      //   brandDoc.adminContact = brandDetails.adminContact;
      // };
      if(brandDetails.primaryContact) {
        brandDoc.primaryContact = brandDetails.primaryContact;
      }

      if(brandDetails.adminContact) {
        brandDoc.adminContact = brandDetails.adminContact;
      }

      if (brandDetails.ratingImgId && (brandDetails.ratingImgId !== brandDoc.ratingImgId)) {
        brandDoc.ratingImgId = brandDetails.ratingImgId;
      };

     // if (brandDetails.empPersPref && (brandDetails.empPersPref !== brandDoc.empPersPref)) {
        brandDoc.empPersonlizationPrefix = brandDetails.empPersPref;
      //};

      if(brandDetails.reasons && brandDetails.reasons.id) {
        brandDoc.brandType = brandDetails.reasons.id
      }

      if (brandDetails.defaultReasons) {
        brandDoc.defaultReasons = brandDetails.defaultReasons;
      };

      if (brandDetails.locationReasons) {
        brandDoc.locationReasons = brandDetails.locationReasons;
      };

      // Save roles - edited or new or may be remove roles
      if (brandDetails.roles) {
        var modRoles = [];
        var newRoles = [];
        var reqRoles = [];
        var splicedElements = 0;
        brandDetails.roles.forEach(function (element, index) {
          reqRoles.push(element);
        });
        // Update modified roles in role collections
        forEachAsync.forEachAsync(reqRoles, function (next, element, index, roles) {
          if (element && element.hasOwnProperty('_id') && element.asIs) {
            modRoles.push(element._id);
            brandDetails.roles.splice(index - splicedElements, 1);
            splicedElements = splicedElements + 1;
            next();
          } else {
            if (element && element.hasOwnProperty('_id') && element.editRoleFlag && !element.asIs) {
              var query = Roles.findOne({"_id": element._id});
              query.exec()
              .then(function (roleDoc) {
                roleDoc.role_type = element.role_type;
                roleDoc.feedbackReasons = element.feedbackReasons;
                roleDoc.save(function (err) {
                  if (err) {
                    logger.error("Brand Update Error Role update: "+ err);
                    deferred.reject(err);
                  } else {
                    brandDetails.roles.splice(index - splicedElements, 1);
                    splicedElements = splicedElements + 1;
                    modRoles.push(element._id);
                    next();
                  };
                });
              }, function (err) {
                logger.error("Brand Update Error Role Fetch: "+ err);
                deferred.reject(err);
              });
            } else if (element) {
              if (mongoose.Types.ObjectId.isValid(brandDoc.id)) {
                element.brandId = mongoose.Types.ObjectId(brandDoc.id);
              } else {
                logger.error("Brand Update Error Role Fetch: "+ 'brandId Object cannot be converted from string!');
                deferred.reject(err);
              };
              element.updatedAt = new Date();
              element.isActive = 1;
              element.isDeleted = 0;
              newRoles.push(element);
              brandDetails.roles.splice(index - splicedElements, 1);
              splicedElements = splicedElements + 1;
              next();
            } else {
              next();
            };
          };
        }).then(function () {

          // Remove deleted roles from the brand_roles collection
          if (brandDetails.deletedRolesList && brandDetails.deletedRolesList.length > 0) {
            var deletedRolesList = brandDetails.deletedRolesList.map(function (item) {
              return (mongoose.Types.ObjectId(item));
            });
            roleModel.deleteRoles(deletedRolesList);
          };

          (function (exports) {
              'use strict';
             
              var Sequence = exports.Sequence || require('sequence').Sequence
                , sequence = Sequence.create()
                , err
                ;

            /* Using sequence package to make callback sync for maintaining atomic DB transactions */
            sequence
              .then(function (next) { // add new roles
                  if (newRoles.length > 0) {
                    saveRoles(newRoles)
                    .then(function (result) {
                      if (result && result.ops.length > 0) {
                        result.ops.forEach(function (element, index) {
                          modRoles.push(result.ops[index]._id.toString());
                        });
                      };
                      next(result);
                    }, function (err) {
                      logger.error("Brand Update New Roles Save error: "+ err);
                      deferred.reject(err);
                    });
                  } else {
                    next();
                  }
                }
              )
              .then(function (next) { // delete if any removed roles
                if (brandDetails.roles.length > 0) {
                  var roleIds = [];
                  brandDetails.roles.forEach(function (element, index) {
                    roleIds.push(element._id);
                  });
                  var query = Roles.remove({"_id": {$in: roleIds}});
                    query.exec()
                    .then(function success(result) {
                      deferred.resolve(result);
                    }, function failure(err) {
                      deferred.reject(err);
                    });
                } else {
                  next();
                }
              }
            )
            .then(function (next) {   // Assign new or modified roles to brandDoc Object for updating brand record
              brandDoc.roles = modRoles;
              brandDoc.save(function (err) {  //save updated Brand.
                if (err) {
                  deferred.reject(err);
                };

                deferred.resolve(brandDoc); 
              });
            })
          }('undefined' !== typeof exports && exports || new Function('return this')()));

        });
      };
    }, function failure(err) {
      deferred.reject(err);
    });


  return deferred.promise;
};

// check if brand exists
var checkBrand = function (brandName, brandId) {
  var deferred = Q.defer();

  var query = Brand.find();
  
  if (brandName) {
    query.where("name").eq(brandName);
  };

  if (brandId) {
    query.where("_id").eq(brandId);
  };

  query.select('name customer');

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
           Brand.update({ "adminContact.userId": { $in: userIds } }, { $set: { "adminContact" : emptyObject } }, { multi: true }, function (err, res) {
              if (err) {
                deferred.reject(err);
              } else {
                next();
              };
           }); 
        }
      )
      .then(function (next) {
          Brand.update({ "primaryContact.userId": { $in: userIds } }, { $set: { "primaryContact" : emptyObject } }, { multi: true }, function (err, res) {
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
exports.Brand = Brand;
exports.Role = Roles;
exports.configureBrand = configureBrand;
exports.fetchBrandDetails = fetchBrandDetails;
exports.deleteBrand = deleteBrand;
exports.updateBrand = updateBrand;
exports.checkBrand = checkBrand;
exports.deleteAdminUsers = deleteAdminUsers;