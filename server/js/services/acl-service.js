// import npm packages
var Q = require('q');
var mongoose = require('../util/connection');
var acl = require("acl");
acl = new acl(new acl.mongodbBackend(mongoose.connection.db, 'acl_', true));

// import files
var logger = require('../util/log').get();
var utils = require('../util/utils');


// To initializa all roles in database if ran for first time
// To know initialization status so checking for staticContent access to superadmin role
acl.whatResources('superadmin', function(err, resources) {
	if (err) {
		logger.error("Error initializing roles: "+ err);
	} else {
		logger.info("resources: "+ resources);
		if (resources && resources.hasOwnProperty('staticcontent')) {
			logger.info("All user roles ACL are already initialized");
		} else {
			logger.info("Initializing Applause user roles ACL in database...");
            acl.allow([
            {
                roles:['guest'],
                allows:[
                 {resources:['customer', 'brand', 'brandtype', 'location', 'employee', 'employeehistory', 'role', 'rating', 'beacon', 'beaconstatus', 'staticcontent', 'userrole', 'reason', 'assetpath'], permissions:['get']},
                 {resources:['guest', 'feedback', 'interaction'], permissions:['post', 'get']}
                ]
            }]);

            acl.allow([
            {
                roles:['superadmin'],
                allows:[
                    {resources:['users', 'guest', 'login', 'pin', 'customer', 'brand', 'brandtype', 'location', 'employee', 'employeehistory', 'feedback', 'role', 'userrole', 'rating', 'beacon', 'beaconstatus', 'forgotpassword', 'reason', 'staticcontent', 'invite', 'interaction', 'generatelist', 'uicontrols', 'assetPath'], permissions:['get', 'post', 'put', 'delete']},
                ]
            }]);

            acl.allow([
            {
                roles:['cust_admin'],
                allows:[
                    {resources:['customer', 'staticcontent'], permissions:['get', 'put']},
                    {resources:['pin', 'brand', 'brandtype', 'location', 'employee', 'employeehistory', 'role', 'rating', 'beacon', 'beaconstatus', 'feedback', 'interaction', 'reason', 'invite'], permissions:['get', 'post', 'put', 'delete']},
                     {resources: ['uicontrols', 'assetpath'], permissions: ['get']}
                ]
            }]);

            acl.allow([
            {
                roles:['brand_admin'],
                allows:[
                    {resources:['customer', 'staticcontent', 'uicontrols', 'userrole', 'assetpath'], permissions:['get']},
                    {resources:['brand'], permissions:['get', 'put']},
                    {resources:['pin', 'brandtype', 'location', 'employee', 'employeehistory', 'role', 'rating', 'beacon', 'beaconstatus', 'feedback', 'interaction', 'reason', 'invite'], permissions:['get', 'post', 'put', 'delete']}
                ]
            }]);

            acl.allow([
            {
                roles:['loc_admin'],
                allows:[
                    {resources:['customer', 'brand', 'staticcontent', 'brandtype', 'rating', 'uicontrols', 'userrole', 'assetpath'], permissions:['get']},
                    {resources:['location'], permissions:['get', 'put']},
                    {resources:['feedback'], permissions:['get', 'post']},
                    {resources:['pin', 'employee', 'employeehistory', 'role', 'beacon', 'beaconstatus', 'interaction'], permissions:['get', 'post', 'put', 'delete']}
                ]
            }]);

            acl.allow([
            {
                roles:['employee'],
                allows:[
                    {resources:['customer', 'brand', 'location', 'employeehistory', 'brandtype', 'staticcontent', 'rating', 'role', 'uicontrols', 'userrole', 'assetpath'], permissions:['get']},

                    {resources:['employee', 'beacon', 'beaconstatus'], permissions:['get', 'put']},
                    {resources:['pin', 'feedback', 'interaction'], permissions:['get', 'post', 'put', 'delete']}
                ]
            }]);

            acl.allow([
            {
                roles:['app_consumer'],
                allows:[
                    {resources:['customer', 'brand', 'location', 'brandtype', 'staticcontent', 'rating', 'role', 'userrole', 'employee', 'beacon', 'beaconstatus', 'assetpath'], permissions:['get']},
                    {resources:['pin', 'feedback', 'interaction', 'users'], permissions:['get', 'post', 'put', 'delete']}
                ]
            }]);
		};
	};
})


/*
Adds roles to a given user id.
Arguments
    userId   {String|Number} User id.
    roles    {String|Array} Role(s) to add to the user id.
    callback {Function} Callback called when finished.
*/
var addUserRoles = function (userId, role) {
	// acl package method
	acl.addUserRoles(userId, role);
	//acl.addUserRoles("58ac0f3dc37990f055fb23da", "cust_admin");
};

/*
Checks if the given user is allowed to access the resource for the given permissions (note: it must fulfill all the permissions).
Arguments
    userId      {String|Number} User id.
    resource    {String} resource to ask permissions for.
    permissions {String|Array} asked permissions.
    callback    {Function} Callback called with the result.
*/
var isAllowed = function (userId, resource, permissions) {
	var deferred = Q.defer();

	acl.isAllowed(userId, resource, permissions, function (err, allowed) {
		if (err) {
			logger.error("Error in ACL isAllowed(). Error -> " + err);
			deferred.reject(err);
		} else {
			deferred.resolve(allowed);
		};
	});
	return deferred.promise;
};

// exports section
exports.addUserRoles = addUserRoles;
exports.isAllowed = isAllowed;