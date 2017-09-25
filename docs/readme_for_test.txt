1. We need to have a valid user token for accessing all services... So, 
	a. Create user by providing necessary user details in create user API
	b. Once user created successfully, fetch the userId (uid), email and password from the success response.
	c. Then , put the same email and password in the user login API.
	d. Fetch the "Authorization" token in the response header and "uid" of user login API response.
2. Use this user id (uid) in the other REST API's - 
	format - http://54.173.120.23:6002/api/v1/<:uid>/<end-point>
	header format - 
	content-type: application/json
	Authorization: <jwt token>
3. For create customer - 
	a. Provide customer details, 
	b. Request headers information for Authorization header and content-type header
	c. format - http://54.173.120.23:6002/api/v1/1/customer
	d. Upon success response, fetch custId field from response as "_id"
4. Follow Same steps for the brand, location, employee creation in order since each 	API needs unique ID of earlier API's 