// DB Drivers / packages
var mongoose = require('../util/connection');
var Schema = mongoose.Schema;

// admin contact schema for brand records inside customer
var contactSchema = new Schema({
  	name: {type: String, required: true},
	email: {type: String, required: true},
	contactNo: {type: String, required: true},
	_id: {id: false}
});
var Contact = mongoose.model("contact", contactSchema);

// export schema
exports.Contact = Contact;