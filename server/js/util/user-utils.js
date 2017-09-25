exports.attachRoles = function (users) {
	var currentUserToken = '';
	var usersWithRoles = [];
	users.forEach(function (user) {
		if (user.userToken !== currentUserToken) {
			usersWithRoles.push({
				userToken : user.userToken,
				loginToken : user.loginToken,
				userTitle : user.userTitle,
				firstName : user.firstName,
				lastName : user.lastName,
				email : user.email,
				roles : [
					{
						roleToken : user.roleToken,
						roleTitle : user.roleTitle,
						roleName : user.roleName
					}
				]
			});
		} else {
			usersWithRoles[usersWithRoles.length - 1].roles.push({
				roleToken : user.roleToken,
				roleTitle : user.roleTitle,
				roleName : user.roleName
			});
		}

		currentUserToken = user.userToken;
	});

	return usersWithRoles;
};
