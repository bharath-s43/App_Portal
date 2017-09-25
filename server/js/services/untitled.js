(function (exports) {
  'use strict';
 
  	var Sequence = exports.Sequence || require('sequence').Sequence
	    , sequence = Sequence.create()
	    , err
	    ;

	/* Using sequence package to make callback sync for maintaining atomic DB transactions */
	sequence
		.then(function (next) {
			}
		)
		.then(function (next, cashkanSessionId) {
				
	 		}
		)
}('undefined' !== typeof exports && exports || new Function('return this')()));