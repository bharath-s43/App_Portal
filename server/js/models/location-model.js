var Q = require('q');
// DB Drivers / packages
var mongoose = require('../util/connection');
var Schema = mongoose.Schema;
mongoose.Promise = Q.Promise;

var env = require('../conf/config.js').env;
var locationImageUrl = require("../conf/v1/config-" + env +".js").const.CLOUD_IMAGE_URL + "loc_img/";

// Import Models 
var brandModel = require('./brand-model');
var beaconModel = require('./beacon-model');

// create a schema
var locSchema = new Schema({
  lname: {type: String, required: true, trim: true},
  add: {type: String, required: true, trim: true},
  img: {type: String, default: null},
  loc: {
    _id: {id: false},
    lat: { type: String, trim: true, default: null },
    lng: { type: String, trim: true, default: null }
  },
  interactionRadius : {type: Number, default: null},
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
  employees: [{
    id: {type: Schema.Types.ObjectId, ref: 'employees'},
    _id: {id: false}
  }],
  customer: {type: Schema.Types.ObjectId, ref:"customers"},
  brand: {type: Schema.Types.ObjectId, ref:"brands"},
  isActive: { type: Number, default: 1},
  isDeleted: { type: Number, default: 0}
},
{
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});
//Transform
locSchema.options.toJSON.transform = function (doc, ret, options) {
  // remove the _id of every document before returning the result
  ret.id = ret._id;
  //delete ret._id;
  delete ret.__v;
};
locSchema.options.toObject.transform = function (doc, ret, options) {
  // remove the _id of every document before returning the result
  ret.id = ret._id;
  //delete ret._id;
  delete ret.__v;
};

locSchema.virtual('locImgUrl') // employee full name alias
.get(function () {
  if(this.img) {
    return locationImageUrl + this.img;
  } else {
    return this.img;
  }
});

// model creation for user schema
var Location = mongoose.model('locations', locSchema);

// save user details
var createLocation = function (locDetails) {
  var deferred = Q.defer();

  // create location details
  var locObj = new Location({
      // required parameters
      lname: locDetails.name,
      add: locDetails.add,
      img: locDetails.img,
      interactionRadius: locDetails.interactionRadius ? locDetails.interactionRadius : null,
      // primaryContact: { 
      //   name: locDetails.primaryContact.name,
      //   email: locDetails.primaryContact.email,
      //   contactNo: locDetails.primaryContact.contactNo,
      //   userId: locDetails.primaryContact.userId ? locDetails.primaryContact.userId : null
      // },
      // adminContact: { 
      //   name: locDetails.adminContact.name,
      //   email: locDetails.adminContact.email,
      //   contactNo: locDetails.adminContact.contactNo,
      //   userId: locDetails.adminContact.userId ? locDetails.adminContact.userId : null
      // },
      primaryContact: locDetails.primaryContact,
      adminContact: locDetails.adminContact,
      customer: locDetails.custId,
      brand: locDetails.brandId,
      loc: (locDetails.lat && locDetails.lng) ? {lat: locDetails.lat,lng: locDetails.lng} : {}
  });

  locObj.save(function (err) {
    if (err) {
      deferred.reject(err);
    };
     // update brand location array details
    var query = brandModel.Brand.findOne({"_id": locDetails.brandId});
    query.where("isDeleted").eq(0);
    query.exec()
    .then(function success(brandDoc) {
      if (brandDoc && brandDoc._doc && brandDoc._doc.locations) {
        brandDoc.locations.push({id: locObj._id, lid: locObj.lid});
      } else {
        var err = new Error("Brand does not exists for selected brand !!!");
        deferred.reject(err);
      };
      // Save updated brand object
      brandDoc.save(function (err) {
        if (err) {
           deferred.reject(err);
        };
        deferred.resolve(locObj);
      });
    }, function failure(err) {
      deferred.reject(err);
    });
  });

  return deferred.promise;
};

// Check Location existence
var findLocationDetails = function (locId) {
  var deferred = Q.defer();

  var query = Location.find();
  query.where("_id").eq(locId);
  query.where("isDeleted").eq(0);
  query.exec()
  .then(function (result) {
    deferred.resolve(result);
  }, function (err) {
    deferred.reject(err);
  });

  return deferred.promise;
};


// fetch brand
var fetchLocationDetails = function (searchParams, locId) {

  var deferred = Q.defer();
  var brandId = null;
  var locIds =[];
  var select = [];

  if (searchParams && Object.keys(searchParams).length !== 0) {
    // when search params added, add it here in similar maner as of employee-model (fetchEmplyeeDetails())
    brandId = (searchParams.hasOwnProperty('brandId') && searchParams.brandId) ? searchParams.brandId.split(',') : null;
    locIds = (searchParams.hasOwnProperty('locId') && searchParams.locId) ? searchParams.locId.split(',') : [];
    select = (searchParams.hasOwnProperty('select') && searchParams.select) ? searchParams.select.split(',') : [];
    select = select.join(' ');
  };

  if (brandId) { // Fetch location Details for particular Brands
    

    (function (exports) {
      'use strict';
     
      var Sequence = exports.Sequence || require('sequence').Sequence
        , sequence = Sequence.create()
        , err
        ;

    /* Using sequence package to make callback sync for maintaining atomic DB transactions */
    sequence
      .then(function (next) {
            var query = brandModel.Brand.find();
            query.where('_id').in(brandId);
            query.exec()
            .then(function success(result) {
              if (result) {
                var locationIds = [];
                // result._doc.locations.forEach(function (element, index) {
                //   locationIds.push(element.id);
                // });
                result.forEach(function (element, index) {
                  element.locations.forEach(function(elementBrand, indexBrand) {
                    locationIds.push(elementBrand.id);
                  });
                });
                next(locationIds);
              } else {
                var err = "No matching Brand found !!!"
                logger.error("Location Details Fetch: " + err);
                deferred.reject(new Error(err));
              };
            }, function failure(err) {
              deferred.reject(err);
            });
        }
      )
      .then(function (next, locationIds) {
            var query = Location.find();
            
            if (select && select.length > 0) {
              query.select(select);
            } else {
              query.select('-__v -updatedAt -createdAt -isDeleted -isActive');
            };
            query.populate({
              path: 'employees.id',
              select: '-isDeleted -isActive'
            });

            // Customer Information
            query.populate({
              path: 'customer',
              select: 'name',
              as: 'customer'
            });
            // Brand Information
            query.populate({
              path: 'brand',
              model: 'brands',
              select: 'name customer logo_img backgroundColor fontColor',
              populate :{
                path: 'customer',
                model: 'customers',
                select: 'name',
                as: 'customer'
              }
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
    
            query.where("_id").in(locationIds);
            query.where('isDeleted').eq(0);
            query.exec()
            .then(function success(result) {
              deferred.resolve(result);
            }, function failure(err) {
              deferred.reject(err);
            });
        }
      )
    }('undefined' !== typeof exports && exports || new Function('return this')()));

  } else { // fetch location details irrespective of Brands
    
    var query = Location.find();
    
    if (select && select.length > 0) {
      query.select(select);
    } else {
      query.select('-__v -updatedAt -createdAt -isDeleted -isActive');
    };

    query.where('isDeleted').eq(0);
    if (locId || locIds.length > 0) {
      if (locId) {
        locIds.push(locId);
      };
      query.where('_id').in(locIds);
    };
    if(searchParams && searchParams.custId) {
      query.where('customer').eq(searchParams.custId);
    }

    // Customer Information
    query.populate({
      path: 'customer',
      select: 'name',
      as: 'customer'
    });
                
    // Brand Information
    query.populate({
      path: 'brand',
      model: 'brands',
      select: 'name customer logo_img backgroundColor fontColor',
      populate :{
        path: 'customer',
        model: 'customers',
        select: 'name',
        as: 'customer'
      }
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

    query.exec()
    .then(function success(result) {
      deferred.resolve(result);
    }, function failure(err) {
      deferred.reject(err);
    });

  };

  return deferred.promise;
};


var deleteLocation = function (locationIds) {
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
            beaconModel.Beacon.update({ location: { $in: locationIds } }, { $set: { "isActive" : 0 } }, { multi: true }, function (err, res) {
              if (err) {
                deferred.reject(err);
              } else {
                next();
              };
           });
        }
      )
      .then(function (next) {
            var query = Location.find();
            query.where('isDeleted').eq(0);
            query.where('_id').in(locationIds);
            query.exec()
            .then(function success (locationResult) {
                next(locationResult)
              }, function failure(err) {
                deferred.reject(err);
              });
        }
      )
      .then(function (next, locationResult) {

          var bulk = Location.collection.initializeOrderedBulkOp();
          bulk.find({'_id': {$in: locationIds}}).update({$set: {isDeleted: 1}});
          bulk.execute(function (err) {
               if(err) {
                deferred.reject(err);
               } else {
                deferred.resolve(locationResult);
               }                   
          });
        }
      )
    }('undefined' !== typeof exports && exports || new Function('return this')()));

  return deferred.promise;
};

// Update Location Profile data
var updateLocation = function (locDetails, locUniqId) {
  var deferred = Q.defer();


  var query = Location.findOne();
  query.where('isDeleted').eq(0);
  if (locUniqId) {
    query.where('_id').eq(locUniqId);
  } 

  query.exec()
  .then(function success (locDoc) {
    
      if (locDetails.brand) {
        locDoc.brand = locDetails.brand;
      };
      if (locDetails.img) {
        locDoc.img = locDetails.img;
      };
      if (locDetails.lname) {
        locDoc.lname = locDetails.lname;
      };
      if (locDetails.add) {
        locDoc.add = locDetails.add;
      };
      if (locDetails.interactionRadius) {
        locDoc.interactionRadius = locDetails.interactionRadius;
      };
      if (locDetails.lat && locDetails.lng) {
        var loc = {};
        loc.lat = locDetails.lat;
        loc.lng = locDetails.lng;
        locDoc.loc = loc;
      };
      // if (locDetails.primaryContact && (locDetails.primaryContact.name || locDetails.primaryContact.email || locDetails.primaryContact.contactNo)) {
      //   locDetails.primaryContact.userId = locDetails.primaryContact.userId.id;
      //   locDoc.primaryContact = locDetails.primaryContact;
      // };
      // if (locDetails.adminContact && (locDetails.adminContact.name || locDetails.adminContact.email || locDetails.adminContact.contactNo)) {
      //   locDetails.adminContact.userId = locDetails.adminContact.userId.id;
      //   locDoc.adminContact = locDetails.adminContact;
      // };
      if(locDetails.adminContact) {
        locDoc.adminContact = locDetails.adminContact;
      }

      if(locDetails.primaryContact) {
        locDoc.primaryContact = locDetails.primaryContact;
      }

      locDoc.save(function (err) {  //save updated employee profiles
        if (err) {
          deferred.reject(err);
        };

        deferred.resolve(locDoc); 
      });
    }, function failure(err) {
      deferred.reject(err);
    });


  return deferred.promise;
};

// check if location exists
var checkLocation = function (locName, locBrand, locUniqId) {
  var deferred = Q.defer();

  var query = Location.find();
  query.select('lid lname customer brand');

  query.where('isDeleted').eq(0);
  query.where('isActive').eq(1);
  
  if (locName) {
    query.where('lname').eq(locName);
  }

  if (locBrand) {
    query.where('brand').eq(locBrand);
  };

  if(locUniqId) {
    query.where('_id').eq(locUniqId);
  };

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
           Location.update({ "adminContact.userId": { $in: userIds } }, { $set: { "adminContact" : emptyObject } }, { multi: true }, function (err, res) {
              if (err) {
                deferred.reject(err);
              } else {
                next();
              };
           }); 
        }
      )
      .then(function (next) {
          Location.update({ "primaryContact.userId": { $in: userIds } }, { $set: { "primaryContact" : emptyObject } }, { multi: true }, function (err, res) {
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
exports.Location = Location;
exports.createLocation = createLocation;
exports.fetchLocationDetails = fetchLocationDetails;
exports.deleteLocation = deleteLocation;
exports.updateLocation = updateLocation;
exports.checkLocation = checkLocation;
exports.deleteAdminUsers = deleteAdminUsers;
