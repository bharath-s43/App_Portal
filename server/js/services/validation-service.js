// import npm packages
var Q = require('q');
var mongoose = require('../util/connection');

// import files
var logger = require('../util/log').get();
var utils = require('../util/utils');

// Service simport
var customerService = require('./customer-service');
var brandService = require('./brand-service');
var locationService = require('./location-service');
var employeeService = require('./employee-service');

// Match entity ids recieved in JWT Token (user object) with Id in request
// tokenEntId: Entity Id found inside JWT token
// reqEntId: Entity Id found i request
// entity: Entities (customer, brand, location, employee)
var validateEntities = function (tokenEntId, reqEntId, entity, resource, req) {
    var deferred = Q.defer();

    var isMatched = false;
        switch (entity) {
            case "customer" :
                validateCustomerResources(tokenEntId, reqEntId, resource, req)
                .then(function (result) {
                    if (result) {
                        isMatched = true;
                    } else {
                        isMatched = false;
                    };
                    deferred.resolve(isMatched);
                }, function (err) {
                    logger.error("Validation Customer check failed : " + err);
                    isMatched = false;
                    deferred.reject(isMatched);
                });
                break;
            case "brand" : 
                validateBrandResources(tokenEntId, reqEntId, resource, req)
                .then(function (result) {
                    if (result) {
                        isMatched = true;
                    } else {
                        isMatched = false;
                    };
                    deferred.resolve(isMatched);
                }, function (err) {
                    logger.error("Validation Brand check failed : " + err);
                    isMatched = false;
                    deferred.reject(isMatched);
                });
                break;
            case "location" : 
                validateLocationResources(tokenEntId, reqEntId, resource, req)
                .then(function (result) {
                    if (result) {
                        isMatched = true;
                    } else {
                        isMatched = false;
                    };
                    deferred.resolve(isMatched);
                }, function (err) {
                    logger.error("Validation Location check failed : " + err);
                    isMatched = false;
                    deferred.reject(isMatched);
                });
                break;
            case "employee" : 
                validateEmployeeResources(tokenEntId, reqEntId, resource, req)
                .then(function (result) {
                    if (result) {
                        isMatched = true;
                    } else {
                        isMatched = false;
                    };
                    deferred.resolve(isMatched);
                }, function (err) {
                    logger.error("Validation Employee check failed : " + err);
                    isMatched = false;
                    deferred.reject(isMatched);
                });
                break;
            default : 
                isMatched = false;
                deferred.resolve(isMatched);
        };

    return deferred.promise;
};

// Validate all the customer related resources
var validateCustomerResources = function (tokenEntId, reqEntId, resource, req) {
    var deferred = Q.defer();
    var isCorrectMapping = false;

    switch(resource) {
        case "customer" : 
            customerService.checkCustomer(null, tokenEntId)
            .then(function (result) {
                if (result && result.length > 0) {
                    req.searchParams = populateReqSearchParams(tokenEntId);
                    isCorrectMapping = tokenEntId === reqEntId ? true : false;
                } else {
                    isCorrectMapping = false;
                };
                deferred.resolve(isCorrectMapping);
            }, function (err) {
                logger.error("Validation Customer check failed : " + err);
                isCorrectMapping = false;
                deferred.reject(isCorrectMapping);
            });
            break;
        case "brand" : 
            brandService.checkBrand(null, reqEntId)
            .then(function (result) {
                if (result && result.length > 0) {
                    if (result[0]._doc.customer.toString() === tokenEntId)
                    {
                        req.searchParams = populateReqSearchParams(tokenEntId, reqEntId);
                        isCorrectMapping = true;
                    } else  {
                        isCorrectMapping = false;
                    };
                } else {
                    isCorrectMapping = false;
                };
                deferred.resolve(isCorrectMapping);
            }, function (err) {
                logger.error("Validation Brand check failed : " + err);
                isCorrectMapping = false;
                deferred.reject(isCorrectMapping);
            });
            break;
        case "location" : 
            locationService.checkLocation(null, null, reqEntId)
            .then(function (result) {
                if (result && result.length > 0) {
                    if (result[0]._doc.customer.toString() === tokenEntId) {
                        req.searchParams = populateReqSearchParams(tokenEntId, result[0]._doc.brand, reqEntId);
                        isCorrectMapping = true;
                    } else {
                        isCorrectMapping = false;
                    };
                    isCorrectMapping = true;
                } else {
                    isCorrectMapping = false;
                };
                deferred.resolve(isCorrectMapping);
            }, function (err) {
                logger.error("Validation Location check failed : " + err);
                isMatched = false;
                deferred.reject(isCorrectMapping);
            });
            break;
        case "employee" : 
            employeeService.checkEmployeeId(reqEntId)
            .then(function (result) {
                if (result && result.length > 0) {
                    if (result[0]._doc.custId.toString() === tokenEntId) {
                        req.searchParams = populateReqSearchParams(tokenEntId, result[0]._doc.brandId, result[0]._doc.locationId, reqEntId);
                        isCorrectMapping = true;
                    } else {
                        isCorrectMapping = false;
                    };
                } else {
                    isCorrectMapping = false;
                };
                deferred.resolve(isMatched);
            }, function (err) {
                logger.error("Validation Employee check failed : " + err);
                isCorrectMapping = false;
                deferred.reject(isCorrectMapping);
            });
            break;
        case "beacon" : 
            break;
        default: 
            isCorrectMapping = true;
            deferred.resolve(isCorrectMapping);
    };

    return deferred.promise;
};

// Validate all brand related resources
var validateBrandResources = function (tokenEntId, reqEntId, resource, req) {
    var deferred = Q.defer();
    var isCorrectMapping = false;

    switch(resource) {
        case "customer" : 
        case "brand" : 
             brandService.checkBrand(null, tokenEntId)
            .then(function (result) {
                if (result && result.length > 0) {
                    if ((result[0]._doc.customer.toString() === reqEntId) || (tokenEntId === reqEntId))
                    {
                        req.searchParams = populateReqSearchParams(result[0]._doc.customer, reqEntId);
                        isCorrectMapping = true;
                    } else  {
                        isCorrectMapping = false;
                    };
                } else {
                    isCorrectMapping = false;
                };
                deferred.resolve(isCorrectMapping);
            }, function (err) {
                logger.error("Validation Brand check failed : " + err);
                isCorrectMapping = false;
                deferred.reject(isCorrectMapping);
            });
            break;
        case "location" :
            locationService.checkLocation(null, null, reqEntId)
            .then(function (result) {
                if (result && result.length > 0) {
                    if (result[0]._doc.brand.toString() === tokenEntId) {
                        req.searchParams = populateReqSearchParams(result[0]._doc.customer, result[0]._doc.brand, reqEntId);
                        isCorrectMapping = true;
                    } else {
                        isCorrectMapping = false;
                    };
                    isCorrectMapping = true;
                } else {
                    isCorrectMapping = false;
                };
                deferred.resolve(isCorrectMapping);
            }, function (err) {
                logger.error("Validation Location check failed : " + err);
                isMatched = false;
                deferred.reject(isCorrectMapping);
            });
            break;
        case "employee" :
            employeeService.checkEmployeeId(reqEntId)
            .then(function (result) {
                if (result && result.length > 0) {
                    if (result[0]._doc.brandId.toString() === tokenEntId) {
                        req.searchParams = populateReqSearchParams(result[0]._doc.custId, result[0]._doc.brandId, result[0]._doc.locationId, reqEntId);
                        isCorrectMapping = true;
                    } else {
                        isCorrectMapping = false;
                    };
                } else {
                    isCorrectMapping = false;
                };
                deferred.resolve(isMatched);
            }, function (err) {
                logger.error("Validation Employee check failed : " + err);
                isCorrectMapping = false;
                deferred.reject(isCorrectMapping);
            });
            break;
        case "beacon" : 
            break;
        default : 
            isCorrectMapping = true;
            deferred.resolve(isCorrectMapping);
    };

    return deferred.promise;
};


// Validate all location related resources
var validateLocationResources = function (tokenEntId, reqEntId, resource, req) {
    var deferred = Q.defer();
    var isCorrectMapping = false;

    switch(resource) {
        case "customer" : 
        case "brand" : 
        case "location" :
            locationService.checkLocation(null, null, tokenEntId)
            .then(function (result) {
                if (result && result.length > 0) {
                    if ((result[0]._doc.customer.toString() === reqEntId)
                        || (result[0]._doc.brand.toString() === reqEntId)
                        || (tokenEntId === reqEntId)) {
                        req.searchParams = populateReqSearchParams(result[0]._doc.customer, result[0]._doc.brand, reqEntId);
                        isCorrectMapping = true;
                    } else {
                        isCorrectMapping = false;
                    };
                    isCorrectMapping = true;
                } else {
                    isCorrectMapping = false;
                };
                deferred.resolve(isCorrectMapping);
            }, function (err) {
                logger.error("Validation Location check failed : " + err);
                isMatched = false;
                deferred.reject(isCorrectMapping);
            });
            break;
        case "employee" :
            employeeService.checkEmployeeId(reqEntId)
            .then(function (result) {
                if (result && result.length > 0) {
                    if (result[0]._doc.brandId.toString() === tokenEntId) {
                        req.searchParams = populateReqSearchParams(result[0]._doc.custId, result[0]._doc.brandId, result[0]._doc.locationId, reqEntId);
                        isCorrectMapping = true;
                    } else {
                        isCorrectMapping = false;
                    };
                } else {
                    isCorrectMapping = false;
                };
                deferred.resolve(isMatched);
            }, function (err) {
                logger.error("Validation Employee check failed : " + err);
                isCorrectMapping = false;
                deferred.reject(isCorrectMapping);
            });
            break;
        case "beacon" : 
            break;
        default : 
            isCorrectMapping = true;
            deferred.resolve(isCorrectMapping);
    };

    return deferred.promise;
};

// Validate all employee related resources
var validateEmployeeResources = function (tokenEntId, reqEntId, req) {
    var defer = Q.defer();
    var isCorrectMapping = false;

    switch(resource) {
        case "customer" : 
        case "brand" : 
        case "location" :
        case "employee" :
            employeeService.checkEmployeeId(tokenEntId)
            .then(function (result) {
                if (result && result.length > 0) {
                     if ((result[0]._doc.custId.toString() === reqEntId)
                        || (result[0]._doc.brandId.toString() === reqEntId)
                        || (result[0]._doc.locationId.toString() === reqEntId)
                        || (tokenEntId === reqEntId)) {
                        req.searchParams = populateReqSearchParams(result[0]._doc.custId, result[0]._doc.brandId, result[0]._doc.locationId, reqEntId);
                        isCorrectMapping = true;
                    } else {
                        isCorrectMapping = false;
                    };
                } else {
                    isCorrectMapping = false;
                };
                deferred.resolve(isMatched);
            }, function (err) {
                logger.error("Validation Employee check failed : " + err);
                isCorrectMapping = false;
                deferred.reject(isCorrectMapping);
            });
            break;
        case "beacon" : 
            break;
        default : 
            isCorrectMapping = true;
            deferred.resolve(isCorrectMapping);
    };

    return deferred.promise;
};

// set namespace for the API request
var setRequestNamespace = function (req) {
    var deferred = Q.defer();
    var tokenEntId = req.userRelation.id;

    switch (req.userRelation.key) {
        case "customer" : 
            customerService.checkCustomer(null, tokenEntId)
            .then(function (result) {
                if (result && result.length > 0) {
                    req.searchParams = populateReqSearchParams(tokenEntId);
                };
                deferred.resolve();
            }, function (err) {
                logger.error("Validation Customer check failed : " + err);
                deferred.reject();
            });
            break;
        case "brand" : 
            brandService.checkBrand(null, tokenEntId)
            .then(function (result) {
                if (result && result.length > 0) {
                   req.searchParams = populateReqSearchParams(result[0]._doc.customer, tokenEntId);
                }
                deferred.resolve();
            }, function (err) {
                logger.error("Validation Brand check failed : " + err);
                deferred.reject();
            });
            break;
        case "location" : 
            locationService.checkLocation(null, null, tokenEntId)
            .then(function (result) {
                if (result && result.length > 0) {
                    req.searchParams = populateReqSearchParams(result[0]._doc.customer, result[0]._doc.brand, tokenEntId);
                };
                deferred.resolve();
            }, function (err) {
                logger.error("Validation Location check failed : " + err);
                deferred.reject();
            });
            break;
        case "employee" : 
            employeeService.checkEmployeeId(reqEntId)
            .then(function (result) {
                if (result && result.length > 0) {
                    req.searchParams = populateReqSearchParams(result[0]._doc.custId, result[0]._doc.brandId, result[0]._doc.locationId, tokenEntId);
                };
                deferred.resolve();
            }, function (err) {
                logger.error("Validation Employee check failed : " + err);
                deferred.reject();
            });
            break;
        default : 
            deferred.resolve();
    };

    return deferred.promise;
};


// populate searchParams object based upon condition and return the same
var populateReqSearchParams = function (custId, brandId, locId, empUniqId) {
    var searchParams = {};

    if (custId) {
        searchParams['custId'] = custId;
    };

    if (brandId) {
        searchParams['brandId'] = brandId;
    };

    if (locId) {
        searchParams['locId'] = locId;
    };

    if (empUniqId) {
        searchParams['empUniqId'] = custId;
    };

    return searchParams;
};

// exports section
exports.validateEntities = validateEntities;
exports.setRequestNamespace = setRequestNamespace;