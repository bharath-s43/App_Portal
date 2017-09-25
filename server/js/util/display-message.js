/*
 0001 - 0100 -> User display messages
 0101 - 0200 -> Customer display messages
 0201 - 0300 -> Brand display messages
 0301 - 0400 -> Location display messages
 0401 - 0500 -> Employee display messages
 0501 - 0600 -> Beacon Display messages
 0601 - 0700 -> Forgot password display messages (includes pin messages)
 0701 - 0800 -> Feedback display messages
 0801 - 0900 -> Interaction display messages
*/

exports.display = {
	//User display messages
	D0001 : "User logged in successfully.",
	D0002 : "Congratulations, we have sent you a verification email. Please verify and proceed to login.",
	D0003 : "Your email has been verified. Please enter your email and password in the Applause app to login.",
	D0004 : "User does not exist.",
	D0005 : "Password set succesfully.",
	D0006 : "Congratulations, user <fullName> updated successfully.",
	D0007 : "User logged in successfully.",
	D0008 : "User role saved successfully.",
	D0009 : "User role details fetched successfully.",
	D0010 : "Users fetched succesfully.",
	D0011 : "Users deleted succesfully.",
	D0012 : "Congratulations, account created succesfully.",
	D0013 : "You are already registered with us. We have sent a verification email. Please verify your email.",
	//Customer display messages
	D0101 : "Congratulations, new customer <customerName> created successfully.",
	D0102 : "Customer details fetched successfully.",
	D0103 : "Customer deleted successfully.",
	D0104 : "Something went wrong.- TO BE REMOVED/REPLACED",
	D0105 : "Congratulations, customer <customerName> updated successfully.",
	//Brand display messages
	D0201 : "Congratulations, new brand <brandName> created successfully.",
	D0202 : "Brand details fetched successfully.",
	D0203 : "Brand deleted successfully.",
	D0204 : "Something went wrong.- TO BE REMOVED/REPLACED",
	D0205 : "Congratulations, brand <brandName> updated successfully.",
	D0206 : "Brand type saved successfully.",
	D0207 : "Brand type fetched successfully.",
	//Location display messages
	D0301 : "Congratulations, new location <locationName> created successfully.",
	D0302 : "Location details fetched successfully.",
	D0303 : "Location deleted successfully.",
	D0304 : "Something went wrong.- TO BE REMOVED/REPLACED",
	D0305 : "Congratulations, location <locationName> updated successfully.",
	//Employee display messages
	D0401 : "Congratulations, Employee bulk creation was successfull.",
	D0402 : "Congratulations, new employee '<fullName>' created successfully.",
	D0403 : "Employee fetched successfully.",
	D0404 : "Congratulations, employee '<fullName>' info updated successfully.",
	D0405 : "Employee deleted successfully.",
	D0406 : "Something went wrong.- TO BE REMOVED/REPLACED",
	D0407 : "Employee history details successfully saved.",
	D0408 : "Employee history fetched successfully.",
	//Beacon display messages
	D0501 : "Beacons Assignment successfull.",
	D0502 : "Beacon details fetched successfully.",
	D0503 : "Beacon / Employee details updated successfully.",
	D0504 : "Beacon statuses fetched successfully.",
	//Forgot password display messages (includes pin messages)
	D0601 : "PIN sent to your phone number successfully.",
	D0602 : "Phone number validated successfully.",
	D0603 : "OTP sent to email. Please verify.",
	D0604 : "OTP sent to contact number. Please verify.",
	D0605 : "OTP confirmed succesfully.",
	D0606 : "Congratulations password for user '<fullName>' updated successfully.",
	//Feedback display messages
	D0701 : "Your feedback is recorded successfully. Thank you!",
	D0702 : "Feedback fetched successfully.",
	D0703 : "",
	//Interaction display messages
	D0801 : "Interaction saved succesfully.",
	D0802 : "Interaction fetched succesfully.",
	D0803 : ""
}