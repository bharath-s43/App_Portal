/*
 0001 - 0100 -> User error messages
 0101 - 0200 -> Customer error messages
 0201 - 0300 -> Brand Error messages
 0301 - 0400 -> Location Error messages
 0401 - 0500 -> Employee Error messages
 0501 - 0600 -> Beacon Error messages
 0601 - 0700 -> Forgot password error messages ( includes Pin error messages)
 0701 - 0800 -> feedback error messages
 0801 - 0900 -> Interaction error messages
*/

exports.error = {
	//User error messages
	// E0001 : "Sorry, your details are not available in employee records. Please get it updated and try again.",
	// E0002 : "Error registering user. Please try again after sometime.",
	// E0003 : "Email address already registered.",
	// E0004 : "Contact Number already registered.",
	// E0005 : "Incorrect Login credentials",
	// E0006 : "Error logging user. Please try again after sometime.",
	// E0007 : "Error saving user role. Please try again after sometime.",
	// E0008 : "user role Details not found for query parameters",
	// E0009 : "user role not found.",
	// E0010 : "Error fetching user role details. Please try again after sometime.",
	E0001 : "Sorry, your details are not available in employee records. Please get it updated and try again.",
	E0002 : "Sorry, unable to register at the moment. Please try again after sometime.",
	E0003 : "Email address entered is already registered. Please sign in or use 'Forgot Password?'",
	E0004 : "Phone number entered is already registered. Please sign in or use 'Forgot Password?'",
	E0005 : "Login credentials are not valid.",
	E0006 : "Sorry, unable to login at the moment. Please try again after sometime.",
	E0007 : "Sorry, unable to activate user at the moment. Please try again after some time.",
	E0008 : "Sorry, unable to set password at the moment. Please try again after some time.",
	E0009 : "Sorry, unable to update user details at the moment. Please try again after some time.",
	E0010 : "Sorry, there is an internal error. Please try again after some time.",
	E0011 : "Sorry, error in fetching users",
	E0012 : "Sorry, error deleting users",
	E0013 : "Password already set for this user.",
	E0014 : "Admin contact already exist.",
	E0015 : "Primary contact already exist.",
	E0016 : "This number is not registered with us.\nPlease re-enter your 10-digit mobile number and try again.",
	E0017 : "This email is not registered with us.\nPlease re-enter your email and try again.",
	E0018 : "This email has not been verified. Please check your email for the confirmation email we sent you and click to verify before you can login.",
	//Customer error messages
	E0101 : "Customer already exists.",
	E0102 : "Sorry, unable to register a new customer at the moment. Please try again after some time.",
	E0103 : "Customer Details are not found for query parameters.",
	E0104 : "Sorry, unable to fetch customer details. Please try again after some time.",
	E0105 : "Sorry, unable to delete customer at the moment. Please try again after some time.",
	E0106 : "Sorry, unable to update customer at the moment. Please try again after some time.",
	E0107 : "Customer Id is absent in request.",
	//Brand error messages
	E0201 : "Sorry, unable to create a new brand at the moment. Please try again after some time.",
	E0202 : "Brand Details are not found for query parameters",
	E0203 : "There is no brand created for a customer.",
	E0204 : "Sorry, unable to fetch brand details. Please try again after some time.",
	E0205 : "Sorry, unable to delete brand at the moment. Please try again after some time.",
	E0206 : "Sorry, unable to update brand at the moment. Please try again after some time.",
	E0207 : "Sorry, unable to save brand type at the moment. Please try again after some time.",
	E0208 : "Sorry, unable to fetch brand type at the moment. Please try again after some time.",
	E0209 : "Brand already exists.",
	E0210 : "",
	E0211 : "Brand Id is absent in request.",

	// Employee Bulk upload - Role name validation messages
	E0212: "Role name is absent.",

	//Location error messages
	E0301 : "Sorry, unable to create a new location at the moment. Please try again after some time.",
	E0302 : "Location Details are not found for query parameters.",
	E0303 : "Sorry, there is no location available.",
	E0304 : "Sorry, unable to fetch location details. Please try again after some time.",
	E0305 : "Sorry, unable to delete locaiton at the moment. Please try again after some time.",
	E0306 : "Sorry, unable to update location at the moment. Please try again after some time.",
	E0307 : "Location already exists.",
	E0308 : "",
	E0309 : "Location Id is absent in request.",
	//Employee error message
	E0401 : "Sorry, unable to create a new employee at the moment. Please try again after some time.",
	E0402 : "Sorry, unable to create employees in bulk at the moment. Please try again after some time.",
	E0403 : "Sorry, validation check failed for an employee.",
	E0404 : "Sorry, unable to on-board an employees at the moment. Please try again after some time.",
	E0405 : "Sorry, employee is already present for the selected brand.",
	E0406 : "Sorry, beacon already mapped to another employee.",
	E0407 : "Sorry, unable to assign a beacon to the employee.",
	E0408 : "Sorry, unable to on-board an employees at the moment. Please try again after some time.",
	E0409 : "Employee Details are not found for query parameters.",
	E0410 : "Sorry, employee record is not available.",
	E0411 : "Sorry, unable to fetch employee details. Please try again after some time.",
	E0412 : "Sorry, unable to delete employee at the moment. Please try again after some time.",
	E0413 : "Sorry, unable to update employee at the moment. Please try again after some time.",
	E0414 : "Sorry, unable to update employee history records. Please try again after some time.",
	E0415 : "Sorry, no record is available for employee history.",
	E0416 : "Sorry, unable to fetch employee hisotry details. Please try again after some time.",
	E0417 : "Sorry, unable to update employee. Beacon alredy assigned to another employee.",
	E0418 : "Employee ID must be unique for a particular brand. This employee ID already exists for this brand. Please correct and retry.",
	E0419 : "Sorry, unable to update employee. Beacon location is different from employee location.",
	E0420 : "Sorry, unable to create employee. Beacon location is different from employee location.",
	E0421 : "Employee Id is absent in request.",
	E0422 : "Sorry, unable to update employee. Beacon provided is not assigned to location.",
	E0423 : "Sorry, unable to assign beacon. Beacon provided is not assigned to location. Employee created without beacon.",
	E0424 : "Sorry, unable to unpair beacon. Please try updating the employee again after some time.",

	// Employee Bulk upload functionality - employee validation messages
	E0425: "Mandatory Column names are missing.",
	E0426: "Employee ID is already present for selected brand.",
	E0427: "Employee email is already registered in our system.",
	E0428: "Employee phone number is already registered in our system.",
	E0429: "Employee Id is repeated in file records.",
	E0430: "Beacon Id is repeated in file records.",
	E0431: "email is repeated in file records.",
	E0432: "Phone number is repeated in file records.",
	E0433: "Employee Id is absent.",
	E0434: "Image name mismatch or absent in CSV file.",
	E0435: "Start date validation failed. Start date format is (mm/dd/yyyy).",
	E0436: "Employee ID validation failed. EmployeeIt must be in between 3-60 charecters.",
	E0437: "Employee First name validation failed. It must be in between 3-30 charecters.",
	E0438: "Employee Last name validation failed. It must be in between 3-30 charecters.",


	//Beacon error messages
	E0501 : "Sorry, unable to assign a beacon to the employee.",
	E0502 : "Beacons are not found for query parameters.",
	E0503 : "Beacons not found.",
	E0504 : "Sorry, unable to fetch beacon details. Please try again after some time.",
	E0505 : "Sorry, unable to update beacon details. Please try again after some time.",
	E0506 : "Beacon Status list is empty.",
	E0507 : "Sorry, unable to fetch beacon status. Please try again after some time.",
	E0508 : "CSV schema invalid. BeaconId header is not present.",
	E0509 : "Beacon Id already assigned.",
	E0510 : "Beacon duplicate in csv file.",
	E0511 : "Beacon id absent.",
	E0512 : "Beacon is not assigned to your location.",
	E0513 : "CSV schema invalid. BeaconId or EmployeeId header is not present",
	E0514 : "Beacon is already paired with other employee",
	E0515 : "Employeee id absent.",
	E0516 : "Employee is already paired with another beacon.",
	E0517 : "Employee is not present in your brand.",
	// Employee Bulk upload functionality - beacon validation messages
	E0518 : "Beacon Id is already paired in our system.",
	E0519 : "Beacon Id not found for selected location.",

	E0540 : "Beacon already unpaired.",
	E0541 : "Employee not found for the Beacon Id.",
	E0542 : "Employee Id duplicate in csv file.",
	//Forgot password error messages ( includes Pin error messages)
	E0601 : "Sorry, unable to generate PIN at the moment, please try again after some time.",
	E0602 : "Sorry, unable to send PIN at the moment, please try again after some time.",
	E0603 : "Sorry, unable to confirm PIN at the moment, please try again after some time.",
	E0604 : "Sorry, PIN validation has failed, please enter the right PIN.",
	E0605 : "Sorry, you are not registered with us. Please signup and proceed.",
	E0606 : "Sorry, unable to generate OTP at the moment, please try again after some time.",
	E0607 : "Sorry, unable to confirm OTP at the moment, please try again after some time.",
	E0608 : "Sorry, unable to confirm PIN at the moment, please try again after some time.",
	E0609 : "Sorry, unable to change password at the moment, please try again after some time.",
	E0610 : "Otp does not match. Please try again later.",
	//Feedback error messages
	E0701 : "Sorry, unable to save feedback for an employee, please try again after some time.",
	E0702 : "Sorry, unable to save feedback for an employee, please try again after some time.",
	E0703 : "Sorry, unable to retrieve feedback for employees, please try again after some time.",
	E0704 : "Sorry, unable to retrieve feedback for employees, please try again after some time.",
	E0705 : "",
	//Interaction error messages
	E0801 : "Sorry, unable to save interaction, please try again after some time.",
	E0802 : "Sorry, unable to retrieve interaction, please try again after some time.",
	E0803 : "",
	//ACL Error messages
	E0901 : "Sorry, unable to authorize, please try again after some time.",
	E0902 : "Unauthorized user.",
	E0903 : "Sorry, unable to process your request, please try again after some time.",
	E0904 : "Sorry, unable to access authorized resource, authorization headers is absent.",
	E0905 : "Sorry, role name not found.",
	E0906 : "Sorry, <entity> is not authorized."
}