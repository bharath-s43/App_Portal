var Q = require('q');
// DB Drivers / packages
//var mongoose = require('mongoose');
var mongoose = require('../util/connection');
var Schema = mongoose.Schema;
mongoose.Promise = Q.Promise;

const escapeStringRegexp = require('escape-string-regexp');

// create a schema
var interactionSchema = new Schema({
  beaconId: { type: String, required: "true", default: null },
  beaconUniqueId: { type: Schema.Types.ObjectId, ref:"beacons", required: true },
  beaconMajor: { type: Number, default: null},
  beaconMinor: { type: Number, default: null},
  employee: { type: Object, default: null},
  enteredDate: {type: Date, default: null },
  exitDate: { type: Date, default: null },
  rssi: { type: String, default:null },
  loc: {
    _id: {id: false},
    latitude: { type: String, trim: true, default: null },
    longitude: { type: String, trim: true, default: null }
  },
  state: { type: String, default: null },
  hardwareVersion: { type: String, default: null },
  firmwareVersion: { type: String, default: null },
  power: { type: String, default: null },
  appVersion: {type: String, default: null},
  appOs: {type: String, default: null},
  deviceId: {type: String, default: null}
},
{
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});
//Transform
interactionSchema.options.toJSON.transform = function (doc, ret, options) {
  // remove the _id of every document before returning the result
  ret.id = ret._id;
  delete ret._id;
  delete ret.__v;
};
interactionSchema.options.toObject.transform = function (doc, ret, options) {
  // remove the _id of every document before returning the result
  ret.id = ret._id;
  delete ret._id;
  delete ret.__v;
};

// model creation for user schema
var Interaction = mongoose.model('interactions', interactionSchema);

// save user details
var saveInteraction = function (interactionDetails) {
  var deferred = Q.defer();

  var interactionObj = new Interaction({
    // required parameters
    beaconId: interactionDetails.beaconId,
	  beaconUniqueId: interactionDetails.beaconUniqueId,
	  beaconMajor: interactionDetails.beaconMajor ? interactionDetails.beaconMajor : null,
	  beaconMinor: interactionDetails.beaconMinor ? interactionDetails.beaconMinor : null,
    employee : interactionDetails.employee ? interactionDetails.employee : null,
	  enteredDate: interactionDetails.enteredDate ? interactionDetails.enteredDate : null,
	  exitDate: interactionDetails.exitDate ? interactionDetails.exitDate : null,
	  rssi: interactionDetails.rssi ? interactionDetails.rssi : null,
	  loc: (interactionDetails.latitude && interactionDetails.longitude) ? {latitude: interactionDetails.latitude,longitude: interactionDetails.longitude} : {},
	  state: interactionDetails.state ? interactionDetails.state : null,
	  hardwareVersion: interactionDetails.hardwareVersion ? interactionDetails.hardwareVersion : null,
	  firmwareVersion: interactionDetails.firmwareVersion ? interactionDetails.firmwareVersion : null,
	  power: interactionDetails.power ? interactionDetails.power : null,
	  appVersion: interactionDetails.appVersion ? interactionDetails.appVersion : null,
	  appOs: interactionDetails.appOs ? interactionDetails.appOs : null,
	  deviceId: interactionDetails.deviceId ? interactionDetails.deviceId : null
    });

    interactionObj.save(function (err) {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve(interactionObj);
      };
    });

  return deferred.promise;
};

var fetchInteractions = function (searchParams) {
	var deferred = Q.defer();
	var query = Interaction.find();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  //var today = new Date();
 // today.setHours(0,0,0,0);

 
  if(searchParams.hasOwnProperty("today")) {
    query.where('createdAt').gte(today);
  }
	query.exec()
	.then(function success(result) {
	    deferred.resolve(result);
	}, function failre(err) {
	    deferred.reject(err);
	});

	return deferred.promise;
};

//Exports section
exports.saveInteraction = saveInteraction;
exports.fetchInteractions = fetchInteractions;