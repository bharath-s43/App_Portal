var Q = require('q');
// DB Drivers / packages
var mongoose = require('../util/connection');
var Schema = mongoose.Schema;
mongoose.Promise = Q.Promise;

// create a schema
var uiControlSchema = new Schema({
  roleName: { type: String, default: null },
  controls: { any: Schema.Types.Mixed }
});

// model creation for user schema
var uiControlsModel = mongoose.model('acl_ui', uiControlSchema, 'acl_ui');


// GET UI Controls based upon role name
var getUiControls = function (roleName) {
   var deferred = Q.defer();
   var query = uiControlsModel.findOne();
    query.where('roleName').eq(roleName);
    query.exec()
    .then(function success(result) {
      deferred.resolve(result);
    }, function failure(err) {
      deferred.reject(err);
    });

   return deferred.promise;
}

// exports section
exports.getUiControls = getUiControls;