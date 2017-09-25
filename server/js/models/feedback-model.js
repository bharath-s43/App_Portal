var Q = require('q');
// DB Drivers / packages
var mongoose = require('../util/connection');
var Schema = mongoose.Schema;
mongoose.Promise = Q.Promise;

// import models
var employeeModel = require('./employee-model');
var locationModel = require('./location-model');
const ratingValues = [1,2,3,4,5]; //Rating Values allowed for users to input
const FEEDBACK_TYPES = ['EMPLOYEE', 'LOCATION'];
const FEEDBACK_MODES = ['INTERACTION', 'MANUAL', 'KIOSK'];

// create a schema
var feedbackSchema = new Schema({
  customer: {type: Schema.Types.ObjectId, ref: 'customers', index: true, default: null},
  brand: {type: Schema.Types.ObjectId, ref: 'brands', index: true, required: "true"},
  location: {type: Schema.Types.ObjectId, ref: 'locations', index: true, required: "true"},
  employee: {type: Schema.Types.ObjectId, ref: 'employees', index: true, default: null},
  user: {
    id: {type: Schema.Types.ObjectId, ref: 'users', index: true},
    role_id: { type: Schema.Types.ObjectId, ref: 'user_roles', index: true, default: null}
  },
  ratingVal: {type: Number, default: 0},
  feedbackReasons: [{type: String, trim: true}],
  additionalComment: {type: String, trim: true, min: 3, max: 100, default: null},
  feedbackType: {type: String, trim: true, uppercase: true, enum: FEEDBACK_TYPES, required: true},
  feedbackMode: {type: String, trim: true, uppercase: true, enum: FEEDBACK_MODES, required: true}
},
{
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});
//Transform
feedbackSchema.options.toJSON.transform = function (doc, ret, options) {
  // remove the _id of every document before returning the result
  ret.id = ret._id;
  delete ret._id;
  delete ret.__v;
};
feedbackSchema.options.toObject.transform = function (doc, ret, options) {
  // remove the _id of every document before returning the result
  ret.id = ret._id;
  delete ret._id;
  delete ret.__v;
};

// model creation for feedback schema
var Feedback = mongoose.model('feedbacks', feedbackSchema);

// Submit feedback for employee
var submitFeedback = function (feedbackDetails, usrDetails) {
  var deferred = Q.defer();

  if(!usrDetails.role_id) {
    usrDetails.role_id = null;
  }

  var feedbackObj = new Feedback({
    // required parameters
    customer: feedbackDetails.custId ? feedbackDetails.custId : null,
    brand: feedbackDetails.brandId,
    location: feedbackDetails.locId,
    employee: feedbackDetails.euId ? feedbackDetails.euId : null,
    user: usrDetails ? {id: usrDetails._id, role_id: usrDetails.role_id} : null,
    ratingVal: feedbackDetails.ratingVal,
    feedbackReasons: feedbackDetails.feedbackReasons,
    feedbackType: feedbackDetails.feedbackType,
    feedbackMode: feedbackDetails.feedbackMode,
    // OPTIONAL PARAMETERS
    additionalComment: feedbackDetails.additionalComment ? feedbackDetails.additionalComment : null
  });



  feedbackObj.save(feedbackObj, function (err) {
    if (err) {
       deferred.reject(err);
    } else {
      deferred.resolve(feedbackObj);
    };
  });

  return deferred.promise;
};

// Fetch Feedback details
var fetchFeedbackDetails = function (searchParams, feedbackId, userId) {
  var deferred = Q.defer();

  var custId = null;
  var brandId = null;
  var locId = null;
  var euId = null; // employee unique Id
  var select = [];

  if (searchParams && Object.keys(searchParams).length !== 0) {
    // when search params added, add it here in similar maner as of employee-model (fetchEmplyeeDetails())
    custId = searchParams.hasOwnProperty('custId') ? searchParams.custId.split(",") : null;
    brandId = searchParams.hasOwnProperty('brandId') ? searchParams.brandId.split(",") : null;
    locId = searchParams.hasOwnProperty('locId') ? searchParams.locId.split(",") : null;
    euId = searchParams.hasOwnProperty('euId') ? searchParams.euId.split(",") : null;
    select = searchParams.hasOwnProperty('select') ? searchParams.select.split(",") : null;
    select = select.join(' ');
  };

  var query = Feedback.find();
  if (feedbackId) {
    query.where('_id').eq(feedbackId);  
  };

  if (custId) {
    query.where('customer').in(custId);
  };

  if (brandId) {
    query.where('brand').in(brandId);
  };

  if (locId) {
    query.where('location').in(locId);
  };

  if (euId) {
    query.where('employee').in(euId);
  };

  if (userId) {
    query.where('user.id').eq(userId);
  };
  
  if (select && select.length > 0) {
    query.select(select);
  };

  query.exec()
  .then(function (result) {
    deferred.resolve(result);
  }, function (err) {
    deferred.reject(err);
  });

  return deferred.promise;
};

// Feedback details for a user
var userBasedFeedbackDetails = function (userId, searchParams) {
  var deferred = Q.defer();

  var custIds = null;
  var brandIds = null;
  var locIds = null;
  var euIds = null;

  if (searchParams && Object.keys(searchParams).length !== 0) {
    // when search params added, add it here in similar maner as of employee-model (fetchEmplyeeDetails())
    if (searchParams.hasOwnProperty('custId')) {
      custIds = searchParams.custId.split(",");
      custIds.forEach(function (element, index) {
        custIds[index] = mongoose.mongo.ObjectId(element);
      });
    };

    if (searchParams.hasOwnProperty('brandId')) {
      brandIds = searchParams.brandId.split(",");
      brandIds.forEach(function (element, index) {
        brandIds[index] = mongoose.mongo.ObjectId(element);
      });
    };

    if (searchParams.hasOwnProperty('locId')) {
      locIds = searchParams.locId.split(",");
      locIds.forEach(function (element, index) {
        locIds[index] = mongoose.mongo.ObjectId(element);
      });
    };

    if (searchParams.hasOwnProperty('euId')) {
      euIds = searchParams.euId.split(",");
      euIds.forEach(function (element, index) {
        euIds[index] = mongoose.mongo.ObjectId(element);
      });
    };
  };

  var recLimit = (searchParams && searchParams.hasOwnProperty('recLimit') && parseInt(searchParams.recLimit)) || null;

  var query = Feedback.find({"user.id" : userId});
  query.sort({'updatedAt': -1});

  if (custIds && custIds.length > 0) {
    query.where('customer').in(custIds);
  };

  if (brandIds && brandIds.length > 0) {
    query.where('brand').in(brandIds);
  };

  if (locIds && locIds.length > 0) {
    query.where('location').in(locIds);
  };

  if (euIds && euIds.length > 0) {
    query.where('employee').in(euIds);
  };

  if (recLimit) {
    query.limit(recLimit);
  };

  query.populate({
      path: "brand",
      select: 'name logo_img fontColor backgroundColor ratingImgId',
      as: "brands",
      model: "brands",
      populate: {
        path: 'ratingImgId',
        select: 'name count img',
        model: 'ratings'
      }
    });

  query.populate({
      path: "location",
      select: 'lname add img',
      as: "locations"
    });

   query.populate({
      path: "employee",
      select: 'fullName img',
      as: "employees"
    });

  query.exec()
  .then(function (result) {
    deferred.resolve(result);
  }, function (err) {
    deferred.reject(err);
  });

  return deferred.promise;
};


// Grouped by ratings count values
var ratingcounts = function (searchParams) {
  var deferred = Q.defer();

  
  var custId = null;
  var brandId = null;
  var locId = null;
  var euId = null; // employee unique Id
  var matchObj = {};

  // matchObj.ratingVal = {"$in": [1,2,3,4,5]};

  if (searchParams && Object.keys(searchParams).length !== 0) {
    // when search params added, add it here in similar maner as of employee-model (fetchEmplyeeDetails())
    if (searchParams.hasOwnProperty('custId')) {
      var custIds = searchParams.custId.split(",");
      custIds.forEach(function (element, index) {
        custIds[index] = mongoose.mongo.ObjectId(element);
      });
      matchObj.customer = {"$in": custIds};
    };

    if (searchParams.hasOwnProperty('brandId')) {
      var brandIds = searchParams.brandId.split(",");
      brandIds.forEach(function (element, index) {
        brandIds[index] = mongoose.mongo.ObjectId(element);
      });
      matchObj.brand = {"$in": brandIds};
    };

    if (searchParams.hasOwnProperty('locId')) {
      var locIds = searchParams.locId.split(",");
      locIds.forEach(function (element, index) {
        locIds[index] = mongoose.mongo.ObjectId(element);
      });
      matchObj.location = {"$in": locIds};
    };

    if (searchParams.hasOwnProperty('euId')) {
      var euIds = searchParams.euId.split(",");
      euIds.forEach(function (element, index) {
        euIds[index] = mongoose.mongo.ObjectId(element);
      });
      matchObj.employee = {"$in": euIds};
    };

    if (searchParams.hasOwnProperty('feedbackType')) {
      var feedbackType = searchParams.feedbackType;

      matchObj.feedbackType = {"$eq": feedbackType};
    };
  };

  Feedback.aggregate([
      // Match documents that contain the elements
      { 
        "$match": matchObj
      },
      // Count by the element as a key
      { 
        "$group": {
          "_id": "$ratingVal",
          "count": { "$sum": 1 }
        }
      },
      {
        "$project": {
          "ratingVal": "$_id",
          "count": 1,
          "_id": 0
        }
      },
      {
        "$sort": {
          "ratingVal": 1
        }
      }
    ], function (err, result) {
      if (err) {
        deferred.reject(err);
      } else {
        var completeRes = []; // For including count = 0 for whose ratings are absent
        var i = 0;
        for (var index = 0; index < ratingValues.length; index++) {
          var count = 0;
          if (result[i] && ratingValues[index] === result[i].ratingVal) {
            count = result[i].count;
            i++;
          };
          completeRes.push({"ratingVal":ratingValues[index], "count": count});
        };
        deferred.resolve(completeRes);
      };
  });

  return deferred.promise;
};

// exports section
exports.FEEDBACK_TYPES = FEEDBACK_TYPES;
exports.Feedback = Feedback;
exports.submitFeedback = submitFeedback;
exports.ratingcounts = ratingcounts;
exports.fetchFeedbackDetails = fetchFeedbackDetails;
exports.userBasedFeedbackDetails = userBasedFeedbackDetails;