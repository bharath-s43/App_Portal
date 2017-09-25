var Q = require('q');
// DB Drivers / packages
var mongoose = require('../util/connection');
var Schema = mongoose.Schema;
mongoose.Promise = Q.Promise;

var brandRoleSchema = new Schema({
	brandId: {type: Schema.Types.ObjectId, ref: "brands"},
	role_type: {type: String, required: true, trim: true}, 
  feedbackReasons: [{type: String, required: true, trim: true}], 
  img: String, 
  isActive: {type: Number, default: 1},
  isDeleted: {type: Number, default: 0}
}, {
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});
//Transform
brandRoleSchema.options.toJSON.transform = function (doc, ret, options) {
  // remove the _id of every document before returning the result
  ret.id = ret._id;
  delete ret._id;
  delete ret.__v;
};
brandRoleSchema.options.toObject.transform = function (doc, ret, options) {
  // remove the _id of every document before returning the result
  ret.id = ret._id;
  delete ret._id;
  delete ret.__v;
};
brandRoleSchema.index({brandId: 1, role_type: 1}, {unique: true});
//var BrandRole = mongoose.model('brand_roles', brandRoleSchema);

// check if role exists for mentioned brand
var checkBrandRoleType = function (brandId, brandRoles) {

};

// if role does not exists already then save new role for that brand 
var saveBrandRoles = function (brandId, brandRoles) {
	
};

// exports section
exports.checkBrandRoleType = checkBrandRoleType;
exports.saveBrandRoles = saveBrandRoles;