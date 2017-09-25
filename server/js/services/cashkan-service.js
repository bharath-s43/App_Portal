var Q = require('q');

var logger = require('../../util/log').get();
var utils = require('../../util/utils');

var cashkanSummaryService = require("./cashkan-summary-service");
var cashkanDAO = require('../../dao/cashkan-dao');


var validateCashkan = function (cashkanDetails) {
	var result = false;

	if (!Array.isArray(cashkanDetails)) {
		cashkanDetails = [cashkanDetails];
	};
	
	cashkanDetails.forEach( function(element, index) {
		if (!element || (!element.localeId || !element.currencyId 
		|| !element.denomination || !element.currencyNo))
		{
			result = false;
			return result;
		} else {
			result = true;
		}
	});

	return result;
};


/*
 * Insert Cashkan details and cashkan_summary details (currency_number, tdt)
 */
var insertCashkan = function (cashkanDetails, lat, lng) {
	var deferred = Q.defer();

	if (validateCashkan(cashkanDetails)) {
		// first insert into cashkan_summary  and then in cashkan - verified
		cashkanSummaryService.insertOrUpdateTDTCashkanSummary(cashkanDetails, lat, lng)
			.then(
				function success(result) {

					cashkanDAO.insertCashkan(cashkanDetails)
						.then(
							function (result) {
								deferred.resolve(result);
							}, function (err) {
								logger.error('CASHKAN SUMMARY Insert/update records Error: \n', err);
								deferred.reject(new Error(err));
							}
						);
				}, function failue(err) {
					logger.error('CASHKAN Insert records Error:', err);
					deferred.reject(new Error(err));
				}
			);
	} else {
		var err = 'Cashkan: Incomplete information in request !!!'; 
		logger.error(err);
		deferred.reject(new Error(err));
	}

	return deferred.promise;
};


/*
 * Get Cashkan details based upoin Id or get all cashkans for user
 */
 var getCashkanDetails = function (userId, cashkanId, filterParams) {

 	var deferred = Q.defer();

 	var cashkanIdsArr = [];

 		/* Sequencing actions - 
 		 *  1. Fetch all cashkanIds from sessions-cashkan mapping
 		 *  2. Based upon cashkanIds fetched / provided, Fetch Cashkan details for each cashkanId
 		 */
 		(function (exports) {
		  'use strict';
		 
		  	var Sequence = exports.Sequence || require('sequence').Sequence
			    , sequence = Sequence.create()
			    , err
			    ;

			/* Using sequence package to make callback sync for maintaining atomic DB transactions */
			sequence
				.then(function (next) {
						cashkanDAO.getUserBasedCashkanIds(userId, cashkanId, null)
				 			.then(
				 				function (result) {
				 					if (result && result.length > 0) {
				 						result.forEach( function(element, index) {
											cashkanIdsArr.push(element.cashkanIds);
										});
										next(cashkanIdsArr);
				 					} else {
				 						deferred.resolve(result);
				 					}
				 				}, function (err) {
				 					logger.error('User CashkanIds Details Fecth data Fail:', err);
									deferred.reject(new Error(err));
				 				});		
					}
				)
				.then(function (next, cashkanIdsArr) {
					var denominations = !!filterParams ? filterParams['denominations'] : null ;
						if (denominations && !Array.isArray(denominations)) {
				      		denominations = denominations.split(",");
				      	};
				      	
						cashkanDAO.getCashkanDetails(cashkanIdsArr, denominations)
					 		.then(
					 			function (result) {
					 				deferred.resolve(result);
						 		}, function (err) {
						 			logger.error('Cashkan Details Fecth data Fail:', err);
									deferred.reject(new Error(err));
						 		});	
				 	}
				)
		}('undefined' !== typeof exports && exports || new Function('return this')()));

 		return deferred.promise;
 };


/*
 * Edit Cashkan Details Data
 */
var editCashkanDetails = function (cashkanId, cashkanData) {
	var deferred = Q.defer();

	if (!!cashkanId && validateCashkan(cashkanData)) {
		cashkanDAO.editCashkanDetails(cashkanId, cashkanData)
		.then(
			function (result) {
				deferred.resolve(result.changedRows);
 		}, function (err) {
 			logger.error('Particular Cashkan Details Update data Fail:', err);
			deferred.reject(new Error(err));
 		});
	} else {
		var err = 'Cashkans: Incomplete / Improper information in request !!!'; 
		logger.error(err);
		deferred.reject(new Error(err));
	}

	return deferred.promise;
}


/*
 * Delete Cashkan Details Data
 */
var deleteCashkanDetails = function (cashkanId) {
	var deferred = Q.defer();

	if (!!cashkanId) {
		cashkanDAO.deleteCashkanDetails(cashkanId)
		.then(
			function (result) {
				deferred.resolve(result.changedRows);
 		}, function (err) {
 			logger.error('Particular Cashkan Details Delete data Fail:', err);
			deferred.reject(new Error(err));
 		});
	} else {
		var err = 'Cashkans: Incorrect Cashkan Id !!!'; 
		logger.error(err);
		deferred.reject(new Error(err));
	}

	return deferred.promise;
};


/*
 * GET currencies mapped to user or based upon selected denomination / denominations (csv)
 */
var getUserCurrencies = function (userId, denominations, currencyNos) {
	var deferred = Q.defer();

	cashkanDAO.getUserCurrencies(userId, denominations, currencyNos)
		.then(
			function (result) {
				deferred.resolve(result);
			}, function (err) {
				logger.error("Error in fetching currency numbers based upon filter params!!!");
				deferred.reject(err);
			}
		);

	return deferred.promise;
};

//exports section
exports.insertCashkan = insertCashkan;
exports.getCashkanDetails = getCashkanDetails;
exports.editCashkanDetails = editCashkanDetails;
exports.deleteCashkanDetails = deleteCashkanDetails;
exports.getUserCurrencies = getUserCurrencies;