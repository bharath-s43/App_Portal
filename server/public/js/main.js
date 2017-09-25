/**
 * Main AngularJS Web Application
 */
var app = angular.module('applauseWebApp', [
  'ngRoute', 'ngCookies', 'angularModalService', 'ui.grid', 'ngTouch', 'ui.grid', 'ui.grid.selection','ui.grid.pagination',
]);


app.directive('validFile',function(){
  return {
    require:'ngModel',
    link:function(scope,el,attrs,ngModel){
      //change event is fired when file is selected
      el.bind('change',function(){
        scope.$apply(function(){
          ngModel.$setViewValue(el.val());
          ngModel.$render();
          if(scope.filenameCSV !== "" && scope.filenameIMAGE !== "")
            scope.filesSelected = false;
          else
            scope.filesSelected = true;
        })
      })
    }
  }
})


app.directive('numberMask', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            $(element).numeric();
        }
    }
});

var compareTo = function() {
    return {
        require: "ngModel",
        scope: {
            otherModelValue: "=compareTo"
        },
        link: function(scope, element, attributes, ngModel) {
             
            ngModel.$validators.compareTo = function(modelValue) {
                return modelValue == scope.otherModelValue;
            };
 
            scope.$watch("otherModelValue", function() {
                ngModel.$validate();
            });
        }
    };
};
 
app.directive("compareTo", compareTo);

app.run(function ($rootScope, $location, $cookies, HTTP_HEADERS) {
    $rootScope.$on('routeChange', function (event) {
      if (!$cookies.get('ujwt')) {
        //$location.path('/signin');
        HTTP_HEADERS['Authorization'] = null;
        $window.location.href = '/login.html';
      } else {
        HTTP_HEADERS['Authorization'] = $cookies.get('ujwt');
      };
    });
});

angular.module('applauseWebApp')
  .constant('API_URI', "/api/v1/")
  .constant('HTTP_HEADERS', {'Content-Type': 'application/json; charset=UTF-8', 'Authorization' : null})
  .constant('FILE_SIZES', {'EMPLOYEE_IMG': 100, "BRAND_IMG": 300, "LOCATION_IMG": 300, 'CSV_FILE_SIZE': 200, 'ZIP_IMG_FILE_SIZE': 15000}); // Sizes are in KB
/**
 * Configure the Routes
 */
app.config(['$routeProvider', function ($routeProvider) {
  $routeProvider
    // Home
    .when("/", {templateUrl: "templates/partials/dashboard.html", controller: "indexCtrl"})
    // Pages
    .when("/signin", {templateUrl: "templates/partials/login.html", controller: "signInCtrl"})
    .when("/dashboard", {templateUrl: "templates/partials/dashboard.html", controller: "dashCtrl"})
    .when("/userProfile", {templateUrl: "templates/partials/user-profile.html", controller: "dashCtrl"})
    .when("/myCustomers", {templateUrl: "templates/partials/my-customers.html", controller: "custCtrl"})
    .when("/createCustomer", {templateUrl: "templates/partials/create-customer.html", controller: "custCtrl"})
    .when("/editCustomer", {templateUrl: "templates/partials/create-customer.html", controller: "custCtrl"})
    .when("/myBrands", {templateUrl: "templates/partials/my-brands.html", controller: "brandCtrl"})
    .when("/createBrand", {templateUrl: "templates/partials/create-brand.html", controller: "brandCtrl"})
    .when("/editBrand", {templateUrl: "templates/partials/create-brand.html", controller: "brandCtrl"})
    .when("/createEmployee", {templateUrl: "templates/partials/create-employee.html", controller: "empCtrl"})
    .when("/createEmployeeBulk", {templateUrl: "templates/partials/create-employee-bulk.html", controller: "empCtrl"})
    .when("/editEmployee", {templateUrl: "templates/partials/edit-employee.html", controller: "empCtrl"})
    .when("/searchEmployee", {templateUrl: "templates/partials/search-employee.html", controller: "empCtrl"})
    .when("/employeeHistory", {templateUrl: "templates/partials/employee-history.html", controller: "empCtrl"})
    .when("/blog/post", {templateUrl: "templates/partials/blog_item.html", controller: "dashCtrl"})
    .when("/myLocations", {templateUrl: "templates/partials/my-locations.html", controller: "locCtrl"})
    .when("/createLocation", {templateUrl: "templates/partials/create-location.html", controller: "locCtrl"})
    .when("/editLocation", {templateUrl: "templates/partials/edit-location.html", controller: "locCtrl"})
    .when("/assignBeaconBulk", {templateUrl: "templates/partials/assign-beacons-bulk.html", controller: "beaconCtrl"})
    .when("/pairBeaconBulk", {templateUrl: "templates/partials/pair-beacons-bulk.html", controller: "beaconCtrl"})
    .when("/unassignBeaconBulk", {templateUrl: "templates/partials/unassign-beacons-bulk.html", controller: "beaconCtrl"})
    .when("/unpairBeaconBulk", {templateUrl: "templates/partials/unpair-beacons-bulk.html", controller: "beaconCtrl"})
    .when("/viewAndSearchBeacon", {templateUrl: "templates/partials/beacon-view-search.html", controller: "beaconCtrl"})
    .when("/beaconAssignIndiviual", {templateUrl: "templates/partials/beacon-assign-indiviual.html", controller: "beaconCtrl"})
    .when("/beaconPairIndiviual", {templateUrl: "templates/partials/beacon-pair-individual.html", controller: "beaconCtrl"})
    .when("/updateContactDetails", {templateUrl: "templates/partials/update-contact-details.html", controller: "taskCtrl"})
    .when("/updateAboutUs", {templateUrl: "templates/partials/update-about-us.html", controller: "taskCtrl"})
    .when("/updateTerms", {templateUrl: "templates/partials/update-terms.html", controller: "taskCtrl"})
    .when("/updatePrivacy", {templateUrl: "templates/partials/update-privacy.html", controller: "taskCtrl"})
    .when("/setPassword", {templateUrl: "templates/partials/set-password.html", controller: "setPassCtrl"})
    .when("/viewUsers", {templateUrl: "templates/partials/view-users.html", controller: "userCtrl"})
    .when("/viewInteractions", {templateUrl: "templates/partials/view-interactions.html", controller: "interactionCtrl"})
    .when("/createlist", {templateUrl: "templates/partials/createlist.html", controller: "genlistCtrl"})
    // else 404
    .otherwise("/404", {templateUrl: "templates/partials/404.html", controller: "PageCtrl"});
}]);

/**
 * Controls the Blog
 */
 app.controller('indexCtrl', 
  function ($scope, $cookies, $location, $http, $rootScope, $timeout, $route, $window, HTTP_HEADERS, FILE_SIZES) {

    console.log("Index Controller reporting for duty.");

    $scope.init = function () {
      $scope.name = $cookies.get('unme');
      $scope.role = $cookies.get('urle');
    };
    $rootScope.userAccess = $cookies.get('uaccess');
    if($rootScope.userAccess) {
      $rootScope.userAccess = JSON.parse($rootScope.userAccess);
    }
    $rootScope.userRelation = $cookies.get('urel');
    if($rootScope.userRelation) {
      $rootScope.userRelation = JSON.parse($rootScope.userRelation);
    }
    $rootScope.userRole = $cookies.get('urle');

    $scope.name = $scope.name ? $scope.name : $cookies.get('unme');
    $scope.role = $cookies.get('urle');

    $scope.logout = function () {
      $scope.name = "";
      $scope.role = "";

      $cookies.remove('ujwt');
      $cookies.remove('unme');
      $cookies.remove('urle');
      $cookies.remove('uid');

      HTTP_HEADERS['Authorization'] = null;
      //$location.path('/signin');

       $window.sessionStorage.setItem("rootCustomer", null); 
       $window.sessionStorage.setItem("rootBrand", null); 
       $window.sessionStorage.setItem("rootLocation", null); 

       $window.sessionStorage.setItem("optionSelected",null);
       $window.sessionStorage.setItem("path",null);
       $window.location.href = '/login.html';
    };
    
   


    $scope.onInactive = function(millisecond, callback){
        var wait = setTimeout(callback, millisecond);               
        document.onmousemove = 
        document.mousedown = 
        document.mouseup = 
        document.onkeydown = 
        document.onkeyup = 
        document.focus = function(){
            clearTimeout(wait);
            wait = setTimeout(callback, millisecond);                       
        };
    } ; 

    $scope.$on("userSignIn", function (event, args) {
       $rootScope.name = args.fullName;
       $rootScope.role = args.role_id;
       $rootScope.roleAccess = args.role_access;
       $scope.init();
    });
    var path = $location.path();

    if (path === '/setPassword') {
      $rootScope.bypassLogin = true;
    };

    // Keep it in last
    if ($cookies.get('ujwt')) {
      // Find tomorrow's date.
      var expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + 1);
      // Setting a cookie
      $cookies.put('ujwt', $cookies.get('ujwt'), {'expires': expireDate});
      $cookies.put('unme', $cookies.get('unme'), {'expires': expireDate});
      $cookies.put('urle', $cookies.get('urle'), {'expires': expireDate});
      $cookies.put('uid', $cookies.get('uid'), {'expires': expireDate});
      HTTP_HEADERS['Authorization'] = $cookies.get('ujwt');

      //$location.path('/dashboard');
    } else if ($rootScope.bypassLogin) {
      $location.path(path);
    } else {
      //$location.path('/signin'); // path not hash
      $window.location.href = '/login.html';
    };

    $scope.custClass = $scope.brandClass = $scope.locClass = $scope.empClass = $scope.beaconClass = $scope.taskClass = $scope.userClass = $scope.iteractionClass = $scope.reportsClass = "";
    

    $rootScope.navOptions = [
  {
    "option" : "Customers",
    "subOptions" : [
     {"key" : "", "path": "myCustomers", "value": "My Customers"},
     {"key" : "", "path": "createCustomer", "value": "Create Customer"}, 
     {"key" : "", "path": "editCustomer", "value": "Edit Customer"}, 
     {"key" : "", "path": "deleteCustomer", "value": "Delete Customer"}
    ],
    "subNavFlag" : false,
    "icon": "fa fa-home fa-fw",
    "ngClass": "custClass"
  }, {
    "option" : "Brands",
    "subOptions" : [
      {"key" : "", "path": "myBrands", "value": "My Brands"},
      {"key" : "", "path": "createBrand", "value": "Create Brand"}, 
      {"key" : "", "path": "editBrand", "value": "Edit Brand"}, 
      {"key" : "", "path": "deleteBrand", "value": "Delete Brand"}
    ],
    "subNavFlag" : false,
    "icon": "fa fa-tags fa-fw",
    "ngClass": "brandClass"
  }, {
    "option" : "Locations",
    "subOptions" : [
      {"key" : "", "path": "myLocations", "value": "My Locations"},
      {"key" : "", "path": "createLocation", "value": "Create Location"}, 
      {"key" : "", "path": "editLocation", "value": "Edit Location"}, 
      {"key" : "", "path": "deleteLocation", "value": "Delete Location"}
    ],
    "subNavFlag" : false,
    "icon": "fa fa-location-arrow fa-fw",
    "ngClass": "locClass"
  }, {
    "option" : "Employees",
    "subOptions" : [
      {"key" : "", "path": "searchEmployee", "value": "Search"},
      {"key" : "", "path": "createEmployeeBulk", "value": "Bulk Upload"}, 
      {"key" : "", "path": "createEmployee", "value": "Create Employee"}, 
      {"key" : "", "path": "editEmployee", "value": "Edit Employee"}, 
      {"key" : "", "path": "employeeHistory", "value": "History"}
    ],
    "subNavFlag" : false,
    "icon": "fa fa-group fa-fw",
    "ngClass": "empClass"
  }, {
    "option" : "Beacons",
    "subOptions" : [
      {"key" : "", "path": "viewAndSearchBeacon", "value": "View and Search"},
      {"key" : "", "path": "assignBeaconBulk", "value": "Assign"}, 
      {"key" : "", "path": "unassignBeaconBulk", "value": "Unassign"},  
      {"key" : "", "path": "beaconAssignIndiviual", "value": "Assign Indiviual"}
    ],
    "subNavFlag" : false,
    "icon": "fa fa-qrcode fa-fw",
    "ngClass": "beaconClass"
  }, {
    "option" : "Applause Task",
    "subOptions" : [
      {"key" : "", "path": "updateContactDetails", "value": "Update Contact Details"}, 
      {"key" : "", "path": "updateAboutUs", "value": "Update About Us"}, 
      {"key" : "", "path": "updateTerms", "value": "Update Terms"}, 
      {"key" : "", "path": "updatePrivacy", "value": "Update Privacy Policy Text"}, 
      {"key" : "", "path": "updateCountryList", "value": "Update Country List"}
    ],
    "subNavFlag" : false,
    "icon": "fa fa-tasks fa-fw",
    "ngClass": "taskClass"
  }, {
    "option" : "Reports",
    "subOptions" : [],
    "subNavFlag" : false,
    "icon" : "fa fa-bar-chart-o fa-fw",
    "ngClass": "reportsClass"
  }, {
    "option" : "Users",
    "subOptions" : [{"key" : "", "path": "viewUsers", "value": "Users"}],
    "subNavFlag" : false,
    "icon" : "fa fa-bar-chart-o fa-fw",
    "ngClass": "userClass"
  }, {
    "option" : "Interactions",
    "subOptions" : [{"key" : "", "path": "viewInteractions", "value": "Interactions"}],
    "subNavFlag" : false,
    "icon" : "fa fa-bar-chart-o fa-fw",
    "ngClass": "iteractionClass"
  }];


  
  function clearNavSelection () {
    $scope.custClass = $scope.brandClass = $scope.locClass = $scope.empClass = $scope.beaconClass = $scope.taskClass = $scope.userClass = $scope.iteractionClass = $scope.reportsClass = "";  
  }

   
  $scope.traverse = function (optionSelected, path, index, navIndex) {
    clearNavSelection();

    if(optionSelected === "Customers")
        $scope.custClass = "alternativeSelection";
    else if(optionSelected === "Brands")
        $scope.brandClass = "alternativeSelection";  
    else if(optionSelected === "Locations")
        $scope.locClass = "alternativeSelection";
    else if(optionSelected === "Employees")
        $scope.empClass = "alternativeSelection";
    else if(optionSelected === "Beacons")
        $scope.beaconClass = "alternativeSelection";
    else if(optionSelected === "Applause Task")
        $scope.taskClass = "alternativeSelection";
    else if(optionSelected === "Users")
        $scope.userClass = "alternativeSelection";
    else if(optionSelected === "Interactions")
        $scope.iteractionClass = "alternativeSelection";
    else if(optionSelected === "Reports")
        $scope.reportsClass = "alternativeSelection";                          
    $location.path(path);
    $window.sessionStorage.setItem("optionSelected",optionSelected);
  };

  //when page is refreshed we are setting the page where it was && highlight left menu 
  if (!$rootScope.bypassLogin) {

    var opt = $window.sessionStorage.getItem("optionSelected");
    var path = $window.sessionStorage.getItem("path");
      
      if(opt === 'null' || path === undefined || opt === undefined || $window.sessionStorage.length === 0)
      {
          if($rootScope.userRole) {
            switch ($rootScope.userRole) {
              case "brand_admin" : path='myBrands';
                                  opt='Brands';
                                  break;
              case "loc_admin" : path='myLocations';
                                  opt='Locations';
                                  break;
              default : path='myCustomers';
                        opt='Customers';

            }
          } else {
            path='myCustomers';
            opt='Customers';
          }
      }
      
      if(path === '/editCustomer')
          {
            path = "myCustomers";
          }
      else if(path === '/editLocation')
          {
            path = "myLocations";
          }
      else if(path === '/editBrand')
          {
            path = "myBrands";
          } 
      else if(path === '/editEmployee')
          {
            path = "searchEmployee";
          }    

      $scope.traverse(opt, path, 1, null);

  };

  // Validatoin of Image file size
  $rootScope.validateFileSize = function (size, key) {

    var result = false;

    switch (key) {
      case "EMPLOYEE_IMG" : 
        result = ((size/1024) < FILE_SIZES.EMPLOYEE_IMG) ? true : false;
        break;
      case "BRAND_IMG" : 
        result = ((size/1024) < FILE_SIZES.BRAND_IMG) ? true : false;
        break;
      case "LOCATION_IMG" : 
        result = ((size/1024) < FILE_SIZES.LOCATION_IMG) ? true : false;
        break;
      case "CSV_FILE_SIZE" : 
        result = ((size/1024) < FILE_SIZES.CSV_FILE_SIZE) ? true : false;
        break;
      case 'ZIP_IMG_FILE_SIZE' : 
        result = ((size/1024) < FILE_SIZES.ZIP_IMG_FILE_SIZE) ? true : false;
        break;
      default : 
        result = false;

    }

    return result;
  };

  $rootScope.setSubNavOptions = function (navOptions, index) {
    //console.log(navOptions.option);
    $rootScope.navOptions.forEach(function (element, index1) {
      element.subNavFlag = false;
    });
    if (navOptions) {
      navOptions.subNavFlag = true;
      $scope.subNavOptions = navOptions.subOptions;
    } else {
      $scope.subNavOptions = null;
    };
    if(navOptions.option == 'Customers' || navOptions.option == 'Brands' || navOptions.option == 'Locations') {
      var path = '/my' + navOptions.option;
      $location.path(path);
    }
  };

  $rootScope.$on('$viewContentLoaded', function(){
    $rootScope.loaded = true;
  });

  $scope.clearSessionValues = function()
  {
       $window.sessionStorage.setItem("optionSelected",null);
       $window.sessionStorage.setItem("path",null);
  }


   // $window.onbeforeunload = $scope.clearSessionValues; //when window close

  });

 app.controller('signInCtrl', 
  function ($scope, $cookies, $location, $timeout, $http, HTTP_HEADERS, FILE_SIZES, API_URI, $rootScope, $window) {
    console.log("SignIn Controller reporting for duty.");
    $scope.showSuccessAlert = false;
    $scope.showFailureAlert = false;
    $scope.incorrectPwd = false;
    // switch flag
    $scope.switchBool = function (value) {
        $scope[value] = !$scope[value];
    };

    // login button click
    $scope.login = function(user) {

        $http({
          method: 'POST',
          headers: HTTP_HEADERS,
          url: API_URI + 'login',
          data: user
        }).then(function (result) {
            $scope.incorrectPwd = false;
            var isAdmin = false;
            if(result.data && result.data.data && result.data.data.role_id && result.data.data.role_id.roleName.includes('admin')) {
              isAdmin = true;
            }

            if (result.data && result.data.code === 0 && isAdmin) {
              $scope.showSuccessAlert = true;
              $scope.successTextAlert = result.data.displayMessage;
              // Find tomorrow's date.
              var expireDate = new Date();
              expireDate.setDate(expireDate.getDate() + 1);
              // Setting a cookie
              $cookies.put('ujwt', result.headers('Authorization'), {'expires': expireDate});
              $cookies.put('unme', result.data.data.personalInfo.fullName, {'expires': expireDate});
              $cookies.put('urle', result.data.data.role_id.roleName, {'expires': expireDate});
              $cookies.put('uid', result.data.data._id, {'expires': expireDate});
              $cookies.put('uemail', result.data.data.email);
              $cookies.put('urel', JSON.stringify(result.data.data.userRelation), {'expires': expireDate});

              // set auth header
              HTTP_HEADERS['Authorization'] = result.headers('Authorization');
              //Call ui controls api for access control.

              $http({
                method: 'GET',
                headers: HTTP_HEADERS,
                url: API_URI + 'uicontrols/' + $cookies.get('urle'),
                data: user
              }).then(function (resultAccess) {
                $timeout(function () {
                  $scope.showSuccessAlert = false;
                 $window.location.href = '/index.html';
                }, 1000);
                //resultAccess.data.data.controls.Customers.visible = 0;
                $cookies.put('uaccess', JSON.stringify(resultAccess.data.data.controls), {'expires': expireDate});
                $rootScope.$broadcast("userSignIn", {fullName: result.data.data.personalInfo.fullName, role_id: result.data.data.role_id, role_access: resultAccess.data.data.controls});
              }, function(errAccess) {
                $scope.showFailureAlert = true;
                $scope.failureTextAlert = result.data.displayMessage;
                $scope.incorrectPwd = true;
                $scope.incorrectMessage = result.data.displayMessage;
                $timeout(function () {
                  $scope.showFailureAlert = false;
                }, 2000);
              })

              //$rootScope.$broadcast("userSignIn", {fullName: result.data.data.personalInfo.fullName, role_id: result.data.data.role_id, role_access: result.data.data.controls});

              //$location.path('#/dashboard');
            } else {
              if(!isAdmin) {
                $scope.showFailureAlert = true;
                $scope.failureTextAlert = "Invalid Credentials.";
                $scope.incorrectPwd = true;
                $scope.incorrectMessage = "Invalid Credentials.";
                $timeout(function () {
                  $scope.showFailureAlert = false;
                }, 2000);

              } else {
                $scope.showFailureAlert = true;
                $scope.failureTextAlert = result.data.displayMessage;
                $scope.incorrectPwd = true;
                $scope.incorrectMessage = result.data.displayMessage;
                $timeout(function () {
                  $scope.showFailureAlert = false;
                }, 2000);
              }
            };
          }, function (err) {
               $scope.showFailureAlert = true;
              if (err && err.data.code == 100) {
                $scope.failureTextAlert = "Invalid Login Credentials.";
              } else {
                $scope.failureTextAlert = err.data.displayMessage;
              };
              $timeout(function () {
                $scope.showFailureAlert = false;
              }, 2000);
          });
    };
    
    var serialize = function(obj, prefix) {
      var str = [];
      for(var p in obj) {
        if (obj.hasOwnProperty(p)) {
          var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
          str.push(typeof v == "object" ?
            serialize(v, k) :
            encodeURIComponent(k) + "=" + encodeURIComponent(v));
        }
      }
      return str.join("&");
    };

  });

app.controller('dashCtrl', function ($scope, $location, $route, $timeout, $http, $filter,  HTTP_HEADERS, FILE_SIZES, API_URI, $cookies, $rootScope, $window) {
  console.log("Dash Controller reporting for duty.");
  $scope.name = $cookies.get('unme');
  $scope.role = $cookies.get('urle');
  $scope.email = $cookies.get('uemail');

  $scope.custDropdownDisable = false;
  $scope.brandDropdownDisable = false;
  $scope.locDropdownDisable = false;
//checking for session storage 
  if($window.sessionStorage.getItem("rootcustomer") === "null" || $window.sessionStorage.getItem("rootcustomer") === "undefined")    
    $rootScope.rootCustomer = null;
  else
    $rootScope.rootCustomer = JSON.parse($window.sessionStorage.getItem("rootCustomer"));

  if($window.sessionStorage.getItem("rootBrand") === "null" || $window.sessionStorage.getItem("rootBrand") === "undefined")  
    $rootScope.rootBrand = null;
  else
    $rootScope.rootBrand = JSON.parse($window.sessionStorage.getItem("rootBrand"));

  if($window.sessionStorage.getItem("rootLocation") === "null" || $window.sessionStorage.getItem("rootLocation") === "undefined")
    $rootScope.rootLocation = null;
  else
    $rootScope.rootLocation = JSON.parse($window.sessionStorage.getItem("rootLocation"));




//storing to session when user change the value of select dropdown
  $rootScope.$watch('rootCustomer', function (val) {
    if(val)
    $window.sessionStorage.setItem("rootCustomer", JSON.stringify($rootScope.rootCustomer));
  });
  $rootScope.$watch('rootBrand', function (val) {
    if(val)
    $window.sessionStorage.setItem("rootBrand", JSON.stringify($rootScope.rootBrand));
  });
  $rootScope.$watch('rootLocation', function (val) {
    if(val)
    $window.sessionStorage.setItem("rootLocation", JSON.stringify($rootScope.rootLocation));
  });

  //Access control.


  $rootScope.getCustomers = function () {
      var queryUrl;
      if($rootScope.userRole && $rootScope.userRole == 'superadmin') {
        queryUrl = 'customer';
      } else if($rootScope.userRole && $rootScope.userRole == 'cust_admin' && $rootScope.userRelation && $rootScope.userRelation.key == 'customer'){
        queryUrl = 'customer/' + $rootScope.userRelation.id;
        $rootScope.rootCustomer = {};
        $rootScope.rootCustomer.id = $rootScope.userRelation.id;
        $scope.custDropdownDisable = true;
      } else if($rootScope.userRole && $rootScope.userRole == 'brand_admin' && $rootScope.userRelation && $rootScope.userRelation.key == 'brand') {
        $rootScope.getBrands(null, $rootScope.userRelation.id);
      } else if($rootScope.userRole && $rootScope.userRole == 'loc_admin' && $rootScope.userRelation && $rootScope.userRelation.key == 'location') {
        $rootScope.getLocations(null, $rootScope.userRelation.id);
      } else {
        queryUrl = null;
      }
      // saveSelectStates();
      $timeout(function () {
            // Fetch all customers to populate dropdown list for update
            if(queryUrl) {
                $http({
                    method: 'GET',
                    headers: HTTP_HEADERS,
                    url: API_URI + queryUrl
                  }).then(function (result) {
                      if (result.data && result.data.code === 0) {
                        $rootScope.customersList = result.data.data;
                        $rootScope.customersList = $filter('orderBy')($rootScope.customersList, "name", false);
                        if($rootScope.rootCustomer) //if restored from session
                            {
                                $rootScope.getBrands($rootScope.rootCustomer);
                            }
                      } else {
                        $scope.showSuccessAlert = false;
                        $scope.showFailureAlert = true;
                        $scope.failureTextAlert = result.data.displayMessage;
                        $timeout(function () {
                            $scope.showFailureAlert = false;
                          }, 2000);
                      };
                    }, function failure (err) {
                        $scope.showSuccessAlert = false;
                        $scope.showFailureAlert = true;
                        $scope.failureTextAlert = "Error Fetching customers.. Please try again after sometime !!!";
                        $timeout(function () {
                           $scope.showFailureAlert = false;
                          }, 2000);
                    });
              }
          }, 0);
  };

  $rootScope.getBrands = function (custId, brandId) {
     $rootScope.rootCustomer = custId;
     // saveSelectStates();
     var queryUrl;
     if(brandId) {
        queryUrl = 'brand/' + brandId;
        $rootScope.rootBrand = {};
        if($rootScope.userRelation && $rootScope.userRelation.id) {
          $rootScope.rootBrand.id = $rootScope.userRelation.id;
        } else {
           $rootScope.rootBrand.id = brandId;
        }
        $scope.brandDropdownDisable = true;
        $scope.custDropdownDisable = true;

     } else if($rootScope.rootCustomer && $rootScope.rootCustomer.id && $rootScope.rootCustomer.id != 0) {
        queryUrl = 'brand?custId=' + custId.id;
     } else {
        queryUrl = null;
     }
     //if($rootScope.rootCustomer && $rootScope.rootCustomer.id && $rootScope.rootCustomer.id != 0) {
      if(queryUrl) {
        $timeout(function () {
          // Fetch all Brands first to populate dropdown list
         $http({
                method: 'GET',
                headers: HTTP_HEADERS,
                url: API_URI + queryUrl
              }).then(function (result) {
                  if (result.data && result.data.code === 0) {
                    $rootScope.brandsList = [];
                    if (result.data.data.length > 0) {
                    $rootScope.brandsList = result.data.data;
                    if(brandId) {
                      $rootScope.customersList = [];
                      $rootScope.customersList.push($rootScope.brandsList[0].customer);
                      $rootScope.rootCustomer = {};
                      $rootScope.rootCustomer.id = $rootScope.brandsList[0].customer.id;
                    }
                    $rootScope.brandsList = $filter('orderBy')($rootScope.brandsList, "name", false);
                    if($rootScope.rootBrand && $rootScope.rootBrand.id) {
                      $rootScope.brandsList.forEach(function(element, index) {
                        if(element.id == $rootScope.rootBrand.id) {
                          $rootScope.rootBrand = element;
                        }
                      });
                    }
                      if($rootScope.rootBrand) //if restored from session
                          {

                              $rootScope.getLocations($rootScope.rootBrand);
                          }
                    }
                  } else {
                    $rootScope.brandsList = [];
                    $scope.showSuccessAlert = false;
                    $scope.showFailureAlert = true;
                    $scope.failureTextAlert = result.data.displayMessage;
                    $timeout(function () {
                       $scope.showFailureAlert = false;
                      }, 2000);
                  };
                }, function failure (err) {
                    $rootScope.brandsList = [];
                    $scope.showSuccessAlert = false;
                    $scope.showFailureAlert = true;
                    $scope.failureTextAlert = "Error Fetching brands.. Please try again after sometime !!!";
                    $timeout(function () {
                        $scope.showFailureAlert = false;
                      }, 0);
                });
        }, 0);
        console.log("IF check brand",$rootScope.brandsList);
     }
     else{
      $rootScope.brandsList = [];
      $rootScope.rootBrand = null;
      $rootScope.rootLocation = null;
      $rootScope.locationsList = [];
      
      $window.sessionStorage.setItem("rootCustomer", null);
      $window.sessionStorage.setItem("rootBrand", null);
      $window.sessionStorage.setItem("rootLocation", null);
      // $rootScope.rootCustomer = null;
      // var item = {name: '--ALL--',id: 0};
      // $rootScope.brandsList = [];
      // $rootScope.rootBrand = item;
      // $rootScope.brandsList[0] = item;
      // console.log("ELSE check brand",$rootScope.brandsList[0]);
     }  
  };

  $rootScope.getLocations = function (brandId, locId) {
    
      $rootScope.rootBrand = brandId;
      // saveSelectStates();

     var queryUrl;
     if(locId) {
        queryUrl = 'location/' + locId;
        $rootScope.rootLocation = {};
        if($rootScope.userRelation && $rootScope.userRelation.id) {
          $rootScope.rootLocation.id = $rootScope.userRelation.id;
        } else {
          $rootScope.rootLocation.id = locId;
        }
        $scope.brandDropdownDisable = true;
        $scope.custDropdownDisable = true;
        $scope.locDropdownDisable = true;

     } else if($rootScope.rootBrand && $rootScope.rootBrand.id && $rootScope.rootBrand.id != 0) {
        queryUrl = 'location?brandId=' + brandId.id
     } else {
        queryUrl = null;
     }

      $scope.showSuccessAlert = false;
      $scope.showFailureAlert = false;

      if(queryUrl) {
        $timeout(function () {
          // Fetch all Locations first to populate dropdown list
          $http({
            method: 'GET',
            headers: HTTP_HEADERS,
            url: API_URI + queryUrl
          }).then(function (result) {
              $rootScope.locationsList = [];
              if (result.data && result.data.code === 0) {
                if (result.data.data.length > 0) {
                 // var item = {lname: '--ALL--',id: 0};
                  $rootScope.locationsList = result.data.data;
                  $rootScope.locationsList = $filter('orderBy')($rootScope.locationsList, "lname", false);
                  if(locId) {
                      $rootScope.customersList = [];
                      $rootScope.customersList.push($rootScope.locationsList[0].customer);
                      $rootScope.rootCustomer = {};
                      $rootScope.rootCustomer.id = $rootScope.locationsList[0].customer.id;

                      $rootScope.brandsList = [];
                      $rootScope.brandsList.push($rootScope.locationsList[0].brand);
                      $rootScope.rootBrand = {};
                      $rootScope.rootBrand.id = $rootScope.locationsList[0].brand.id;
                    }
                  //$rootScope.locationsList.splice(0, 0, item);
                  //$rootScope.rootLocation = item;
                };
              } else {
                $rootScope.locationsList = [];
                $scope.showSuccessAlert = false;
                $scope.showFailureAlert = true;
                $scope.failureTextAlert = result.data.displayMessage;
      
              };
            }, function failure (err) {
                $rootScope.locationsList = [];
                $scope.showSuccessAlert = false;
                $scope.showFailureAlert = true;
                $scope.failureTextAlert = "Error Fetching Locations.. Please try again after sometime !!!";
      
            }); 
        }, 0);

        console.log("IF check locatin",$rootScope.locationsList);
      }
     else{
      $rootScope.rootLocation = null;
      $rootScope.locationsList = [];
      $window.sessionStorage.setItem("rootBrand", null);
      $window.sessionStorage.setItem("rootLocation", null);
      // var item = {lname: '--ALL--',id: 0};
      // $rootScope.locationsList = "";
      // $rootScope.locationsList[0] = item;
      // console.log("ELSE check location",$rootScope.locationsList[0]);
     }  
  };

  $scope.setRootLocation = function (locId) {
    $rootScope.rootLocation = locId;
    if(!$rootScope.rootLocation)
      $window.sessionStorage.setItem("rootLocation", null);
    // saveSelectStates();
  };
  $scope.initUserProfile = function () {
    $scope.userProfile = {};
    $scope.userProfile.personalInfo = {};
    $scope.userProfile.email = $scope.email;
    $scope.userProfile.regType = "EMAIL";
    $scope.userProfile.personalInfo.fullName = $scope.name;
  }

  $scope.updateUserProfile = function() {
    $http({
        method: 'PUT',
        headers: HTTP_HEADERS,
        url: API_URI + 'users',
        data: $scope.userProfile
      }).then(function (result) {
          if (result.data && result.data.code === 0) {
            $scope.showSuccessAlert = true;
           // $scope.lists.showButton = false;
            $scope.successTextAlert = result.data.displayMessage;

            var expireDate = new Date();
            expireDate.setDate(expireDate.getDate() + 1);
              // Setting a cookie
            $cookies.put('unme', result.data.data.personalInfo.fullName, {'expires': expireDate});
            //$route.reload();
            $timeout(function () {
              $window.location.reload();
            }, 4000);
          } else {
            $scope.showSuccessAlert = false;
            $scope.showFailureAlert = true;
            $scope.failureTextAlert = "Error updating profile. Please try again after sometime.";
          };
        }, function failure (err) {
            $scope.showSuccessAlert = false;
            $scope.showFailureAlert = true;
            $scope.failureTextAlert = "Error updating profile. Please try again after sometime.";
        });
  }

  //when route path is changed updating field to session storage
  $rootScope.$on('$routeChangeSuccess', function() {
        if($location.$$path !== "/")
          $window.sessionStorage.setItem("path", $location.$$path);
    });

  $rootScope.$broadcast('routeChange', {}); // For login check purposes -- added security
  if($location.path() == '/setPassword') {
    $rootScope.isBypassedForSetPassword = 1;
  } else {
    // $location.path('/myCustomers');
  }

});

app.controller('setPassCtrl', function ($scope, $cookies, $location, $timeout, $http, HTTP_HEADERS, API_URI, $rootScope, $window) {
  console.log("Set Password Controller reporting for duty.");
  // $scope.setPassDetails.userId = $location.search().userId; 
  $scope.setPassword = function() {
    $scope.setPassDetails.userId = $location.search().userId;
    $http({
        method: 'POST',
        headers: HTTP_HEADERS,
        url: API_URI + 'users/setPassword',
        data: $scope.setPassDetails
      }).then(function (result) {
          if (result.data && result.data.code === 0) {
            $scope.showSuccessAlert = true;
           // $scope.lists.showButton = false;
            $scope.successTextAlert = result.data.displayMessage;
            $timeout(function () {
              $window.location.href = '/login.html';
            }, 3000);
          } else {
            $scope.showSuccessAlert = false;
            $scope.showFailureAlert = true;
            $scope.failureTextAlert = result.data.displayMessage;
            $timeout(function () {
              $window.location.href = '/login.html';
            }, 3000);
          };
        }, function failure (err) {
            $scope.showSuccessAlert = false;
            $scope.showFailureAlert = true;
            $scope.failureTextAlert = "Error setting password.. Please try again after sometime !!!";
        });
  }

});

// customer controller
app.controller('custCtrl', function ($scope, $location, $route, $timeout, $http, $rootScope, $filter, $window, API_URI, HTTP_HEADERS, ModalService,uiGridConstants) {
  console.log("Customer Controller reporting for duty.");

  $rootScope.$broadcast('routeChange', {}); // For login check purposes -- added security
  $scope.showSuccessAlert = false;
  $scope.showFailureAlert = false;

  // switch flag
  $scope.switchBool = function (value) {
      $scope[value] = !$scope[value];
  };

  $scope.highlightFilteredHeader = function( row, rowRenderIndex, col, colRenderIndex ) {
    if( col.filters[0].term ){
      return 'header-filtered';
    } else {
      return '';
    }
  };

  $rootScope.$watch('rootCustomer', function (val) {
    if($location.path() == '/myCustomers') {
      $timeout(function () {
        $scope.populateCustomers();
      }, 0);
    }
  });

  $scope.gridOptions = {
    paginationPageSizes: [20, 30, 50],
    paginationPageSize: 20,
    enableRowSelection: true,
    enableSelectAll: true,
    selectionRowHeaderWidth: 35,
    rowHeight: 50,
    showGridFooter:false,
    enableFiltering: true,
    enableSorting: true,

    minRowsToShow : 10,
     
    enableScrollbars: true,
    disableHorizontalScrollbar: true, 
    virtualizationThreshold: 1000,
    beforeSelectionChange: function (row) {
      if ($scope.gridOptions.selectedItems.length > 10) {
        return false;
      }
      return true;
    }

  }; 
  

  $scope.gridOptions.columnDefs = [
    { field: 'name', width:500, displayName: 'Customer', headerCellClass: $scope.highlightFilteredHeader , cellTemplate : '<div class="ui-grid-cell-contents textVerticalAlign">{{row.entity.name}}</div>' },
    {name: 'primaryContact.name', displayName: 'Primary Contact', cellTemplate: '<div class="ui-grid-cell-contents"><i class="fa fa-paper-plane {{row.entity.pcClass}} tooltips" aria-hidden="true"><span >{{row.entity.toolTipTextP}}</span></i>{{row.entity.primaryContact.name}}<br> <i style="visibility: hidden;" class="fa fa-paper-plane"></i><span class="list-v-email">{{row.entity.primaryContact.email}}</span></div>'},
    {name: 'adminContact.name', displayName: 'Admin Contact', cellTemplate: '<div class="ui-grid-cell-contents"><i class="fa fa-paper-plane {{row.entity.acClass}} tooltips" aria-hidden="true"><span>{{row.entity.toolTipTextA}}</span></i>{{row.entity.adminContact.name}}<br> <i style="visibility: hidden;" class="fa fa-paper-plane"></i><span class="list-v-email">{{row.entity.adminContact.email}}</span></div>'}
  ];
  $scope.countRows=0;

   $scope.gridOptions.enableHorizontalScrollbar = 0;
$scope.gridOptions.enableVerticalScrollbar = 0;

  $scope.gridOptions.onRegisterApi = function(gridApi) {
   $scope.myGridApi = gridApi;
    $scope.gridApi = gridApi;




   gridApi.selection.on.rowSelectionChanged($scope, function(row){ 
    $scope.countRows = $scope.gridApi.selection.getSelectedRows().length;
    });

   gridApi.selection.on.rowSelectionChangedBatch($scope, function(row){ 
    $scope.countRows = $scope.gridApi.selection.getSelectedRows().length;
    });
  };

  $scope.initCustCreateAndEdit = function() {
    if($rootScope.company) {
      $scope.company = {};
      $scope.company = $rootScope.company;
      $scope.company.custId = {};
      $scope.company.custId.id = $rootScope.company.id;
      $scope.hideDropDown = true;
      $scope.company.isEditCompany = true;
      $rootScope.company = null;
    }
  }

  $scope.goToEditCustomer = function () {
      if($scope.myGridApi.selection.getSelectedRows().length == 1) {
        $rootScope.company = $scope.myGridApi.selection.getSelectedRows()[0];
        $location.path('/editCustomer');
      } else {
        alert("Please select only 1 customer to edit.");
      }
    };

  $scope.getTableStyle= function() {
            var marginHeight = 20; // optional
            var length = $('img:visible').length; // this is unique to my cellTemplate
            return {
                height: (length * $scope.gridOptions.rowHeight + $scope.gridOptions.headerRowHeight + marginHeight ) + "px",
                    overflow: 'hidden'
            };
        };


  $scope.populateCustomers = function() {

    if($rootScope.showCustViewMessage && $rootScope.custViewMessage) {
      $scope.showSuccessAlert = true;
      $scope.successTextAlert = $rootScope.custViewMessage;
      $timeout(function () {
         $scope.showSuccessAlert = false;
         $rootScope.showCustViewMessage = false; 
         $rootScope.custViewMessage = null;
      }, 4000);
    }
    
    if($rootScope.userRole == 'superadmin' || $rootScope.userRole == 'cust_admin') {
        if($rootScope.rootCustomer && $rootScope.rootCustomer.id) {
          var api = 'customer/' + $rootScope.rootCustomer.id;
        } else {
          var api = 'customer';
        }
        $scope.loaded = false;
        // Fetch all customers to populate dropdown list for update
        $http({
              method: 'GET',
              headers: HTTP_HEADERS,
              url: API_URI + api
            }).then(function (result) {
                $scope.loaded = true;
                if (result.data && result.data.code === 0) {
                  $scope.customersList = result.data.data;
                  $scope.customersList.forEach(function(element, index) {
                    if (element.primaryContact && element.primaryContact.userId) {
                      element.pcClass = element.primaryContact.userId.verificationStatus;
                      if(element.pcClass == 'PV') {
                        element.toolTipTextP = "Verification invite not sent";
                      } else if (element.pcClass == 'AV') {
                        element.toolTipTextP = "Verified";
                      } else if (element.pcClass == 'IS') {
                        element.toolTipTextP = "Pending Verification";
                      } else if (element.pcClass == 'NA') {
                        element.toolTipTextP = "Verification failed";
                      }
                    } else {
                      element.pcClass = "PV";
                      element.toolTipTextP = "Verification invite not sent";
                    }
                    if (element.adminContact && element.adminContact.userId) {
                      element.acClass = element.adminContact.userId.verificationStatus; 
                      if(element.acClass == 'PV') {
                        element.toolTipTextA = "Verification invite not sent";
                      } else if (element.acClass == 'AV') {
                        element.toolTipTextA = "Verified";
                      } else if (element.acClass == 'IS') {
                        element.toolTipTextA = "Pending Verification";
                      } else if (element.acClass == 'NA') {
                        element.toolTipTextA = "Verification failed";
                      }
                    } else {
                      element.acClass = "PV";
                      element.toolTipTextA = "Verification invite not sent";
                    }
                  });
                   // $scope.gridOptions.data = result.data.data;
                   //sorting it asc by name and then setting it to grid
                  $scope.gridOptions.data = $filter('orderBy')($scope.customersList, "name", false);

                   if($scope.gridOptions.data.length <=20){
                       $scope.gridOptions.enableHorizontalScrollbar = 0;
                       $scope.gridOptions.enableVerticalScrollbar = 0;
                    } else{
                        $scope.gridOptions.enableHorizontalScrollbar = 1;
                        $scope.gridOptions.enableVerticalScrollbar = 1;
                    }
                   $scope.noOfItems = result.data.data.length;
                } else {
                  $scope.loaded = true;
                  $scope.showSuccessAlert = false;
                  $scope.showFailureAlert = true;
                  $scope.failureTextAlert = result.data.displayMessage;
                  $timeout(function () {
                      $scope.showFailureAlert = false;
                    }, 4000);
                };
              }, function failure (err) {
                  $scope.loaded = true;
                  $scope.showSuccessAlert = false;
                  $scope.showFailureAlert = true;
                  $scope.failureTextAlert = "Error Fetching customers.. Please try again after sometime !!!";
                  $timeout(function () {
                     $scope.showFailureAlert = false;
                    }, 4000);
              });
    }
  }

  $scope.submitCustomer = function (company) {
      $(document).scrollTop(0);
    $scope.loaded = false;
    $http({
          method: 'POST',
          headers: HTTP_HEADERS,
          url: API_URI + 'customer',
          data: company,
        }).then(function (result) {
            $scope.loaded = true;
            $scope.customerForm = {};
            if (result.data && result.data.code === 0) {
              // $scope.showFailureAlert = false;
              // $scope.showSuccessAlert = true;
              // $scope.successTextAlert = result.data.displayMessage;

              $rootScope.getCustomers();//for changing the dropdowns values once customer is added 
              //$location.hash('res');
              $rootScope.custViewMessage = result.data.displayMessage;
              $rootScope.showCustViewMessage = true;
              $location.path('/myCustomers');
              // $timeout(function () {
              //      $scope.showSuccessAlert = false;
              //       //$route.reload();
              //       $location.path('/myCustomers');
              //   }, 4000);
            } else {
              $scope.showSuccessAlert = false;
              $scope.showFailureAlert = true;
              $scope.failureTextAlert = result.data.displayMessage;
              $timeout(function () {
                  $scope.showFailureAlert = false;
                }, 4000);
            };
          }, function failure (err) {
              $scope.loaded = true;
              $scope.showSuccessAlert = false;
              $scope.showFailureAlert = true;
              $scope.failureTextAlert = "Error creating customer.. Please try again after sometime !!!";
              $timeout(function () {
                  $scope.showFailureAlert = false;
                }, 4000);
          });
  };

  /* ---- EDIT CUSTOMER OPERATIONS ---- */
  $scope.editCustomer = function (editCompany) {
      $(document).scrollTop(0);
      $scope.loaded = false;
      $http({
          method: 'PUT',
          headers: HTTP_HEADERS,
          url: API_URI + 'customer/' + editCompany.custId.id,
          data: editCompany,
        }).then(function (result) {
          $scope.loaded = true;
            if (result.data && result.data.code === 0) {
             // $scope.company = {};
              $rootScope.getCustomers();//for changing the dropdowns values once customer is added
              $rootScope.custViewMessage = result.data.displayMessage;
              $rootScope.showCustViewMessage = true;
              $location.path('/myCustomers');
            } else {
              $scope.showSuccessAlert = false;
              $scope.showFailureAlert = true;
              $scope.failureTextAlert = result.data.displayMessage;
              $timeout(function () {
                  $scope.showFailureAlert = false;
                }, 4000);
            };
          }, function failure (err) {
            $scope.loaded = true;
              $scope.showSuccessAlert = false;
              $scope.showFailureAlert = true;
              $scope.failureTextAlert = "Error editing customer.. Please try again after sometime !!!";
              $timeout(function () {
                  $scope.showFailureAlert = false;
                }, 4000);
          });
  };

  /* ---- INVITE CONTACT ---- */
 

  $scope.inviteContact = function () {
    var emailIds = [];
    var flag = 1;
 
    var filterMailType = $('#radioGroup label.active input').val();

    $scope.myGridApi.selection.getSelectedRows().forEach(function (element, index) {
      if(filterMailType === "1" || filterMailType === undefined) {
        emailIds.push(element.primaryContact.email);
      } else {
        emailIds.push(element.adminContact.email);
      }
    });
    
    var details = {};
    details.emailIds = emailIds;
    $http({
          method: 'POST',
          headers: HTTP_HEADERS,
          url: API_URI + 'invite',
          data: details,
        }).then(function (result) {
            if (result.data && result.data.code === 0) {
              $scope.showFailureAlert = false;
              $scope.showSuccessAlert = true;
              $scope.successTextAlert = result.data.displayMessage;
              $timeout(function () {
                $scope.populateCustomersDropdown();
                $scope.countRows=0;
              }, 0);
              $timeout(function () {
                   $scope.showSuccessAlert = false;
                }, 10000);
            } else {
              $scope.showSuccessAlert = false;
              $scope.showFailureAlert = true;
              $scope.failureTextAlert = result.data.displayMessage;
              $timeout(function () {
                  $scope.showFailureAlert = false;
                }, 10000);
            };
          }, function failure (err) {
              $scope.showSuccessAlert = false;
              $scope.showFailureAlert = true;
              $scope.failureTextAlert = "Error inviting contact.. Please try again after sometime !!!";
              $timeout(function () {
                  $scope.showFailureAlert = false;
                }, 4000);
          });
  };

  $scope.resetMessages = function () {
    $scope.showSuccessAlert = false;
    $scope.showFailureAlert = false;
  };

  /*---- Delete Customer Operations ----*/
  $scope.customer = null;
    // Fetch all customers to populate delete dropdown list
    if ($location.path().indexOf("delete") !== -1) {
      $http({
        method: 'GET',
        headers: HTTP_HEADERS,
        url: API_URI + 'customer'
      }).then(function (result) {
          if (result.data && result.data.code === 0) {
            $scope.customersList = result.data.data;
          } else {
            $scope.showSuccessAlert = false;
            $scope.showFailureAlert = true;
            $scope.failureTextAlert = result.data.displayMessage;
  
          };
        }, function failure (err) {
            $scope.showSuccessAlert = false;
            $scope.showFailureAlert = true;
            $scope.failureTextAlert = "Error Fetching customers.. Please try again after sometime !!!";
       
        });

    };

  /* ---- Cancel Modal ---- */
  $scope.showCancelModal = function () {
    // Cancel Modal
      ModalService.showModal({
          templateUrl: 'templates/partials/cancel-modal.html',
          controller: "deleteModalCtrl"
      }).then(function(modal) {
          modal.element.modal();
          modal.scope.modalOptions = {
              closeButtonText: 'No',
              actionButtonText: 'Yes',
              headerText: 'Confirm',
             // bodyText: 'Your changes will not be saved? Do you want to continue?'
          };

          if(($scope.editCustomerForm && $scope.editCustomerForm.$pristine) || ($scope.customerForm && $scope.customerForm.$pristine)) {
            modal.scope.modalOptions.bodyText = "Are you sure you want to cancel?";
          } else {
            modal.scope.modalOptions.bodyText = 'Your changes will not be saved? Do you want to continue?';
          }

          modal.close.then(function(action) {
              $('.modal-backdrop').remove();
              if (action === 'YES') {
                $location.path('/myCustomers');
              };
          });
      });
  }
  
  $( "#cancelModal" ).click(function( event ) {
    event.preventDefault();
  });

  /* ---- Delete  CUSTOMER OPERATIONS ---- */
  $scope.showDelModal = function (customer, isMultiple) {
      // Delete modal
      ModalService.showModal({
          templateUrl: 'templates/partials/delete-modal.html',
          controller: "deleteModalCtrl"
      }).then(function(modal) {
          modal.element.modal();
          modal.scope.modalOptions = {
              closeButtonText: 'Cancel',
              actionButtonText: 'Yes',
              headerText: 'Confirm',
              //bodyText: 'Are you sure you want to delete the customer "'+ customer.custId.name +'"?'
          };

              var warningMessage = "As these will delete all brands, locations and employees related to it.";
              modal.scope.modalOptions.warningText = warningMessage;
              var customersSelected = [];
              var customerSelectedCount = $scope.myGridApi.selection.getSelectedRows().length;
              customersSelected = $scope.myGridApi.selection.getSelectedRows();
              if(customerSelectedCount === 1) {
                modal.scope.modalOptions.bodyText = 'Are you sure you want to delete the customer "'+ customersSelected[0].name +'"?';
              }
              else 
                if(customerSelectedCount === 2) {
                  modal.scope.modalOptions.bodyText = 'Are you sure you want to delete the customers "'+ customersSelected[0].name +'" and "'+ customersSelected[1].name +'"?';
              }
              else
                if(customerSelectedCount === 3) {
                  modal.scope.modalOptions.bodyText = 'Are you sure you want to delete the customers "'+ customersSelected[0].name +'" , "'+ customersSelected[1].name +'" and '+customersSelected[2].name+'"?';
              }
              else
              {
                if(customerSelectedCount !== 0)
                  modal.scope.modalOptions.bodyText = 'Are you sure you want to delete the customers "'+ customersSelected[0].name +'" , "'+ customersSelected[1].name +'" and '+(customerSelectedCount-2)+' others?';
              }


          modal.close.then(function(action) {
              $('.modal-backdrop').remove();
              if (action === 'YES') {
                if(isMultiple) {
                  $scope.deleteArray = [];
                  $scope.myGridApi.selection.getSelectedRows().forEach(function(element, index) {
                    $scope.deleteArray.push(element.id);
                  });
                  
                  if($scope.deleteArray.length === 1)
                    deleteCustomer($scope.deleteArray, false);
                  else  
                    deleteCustomer($scope.deleteArray, true);
                } 
              };
          });
      });
  };

  var deleteCustomer = function (customer, isMultiple) {
    $scope.loaded = false;
    var deleteCustomer = {};
    deleteCustomer.customerIds = [];

    if(Array.isArray(customer)) {
      deleteCustomer.customerIds = customer;
    } else {
      deleteCustomer.customerIds.push(customer.custId.id);
    }


    if(!isMultiple && $rootScope.rootCustomer && customer[0] === $rootScope.rootCustomer._id)
    {
      $rootScope.rootCustomer = ""; 
      $window.sessionStorage.setItem("rootCustomer", JSON.stringify($rootScope.rootCustomer));
    }
    var time = new Date().getTime();
    $http({
          method: 'DELETE',
          headers: HTTP_HEADERS,
          url: API_URI + 'customer?q='+time,
          data: deleteCustomer
        }).then(function (result) {
          $scope.loaded = true;
          $scope.customer = {};
            if(result.data.code == 0) {
              if(!isMultiple) {
                var x = document.getElementById("custSelect") || null;
                if(x) {
                  x.remove(x.selectedIndex);
                }
              } 

              $rootScope.getCustomers();//for changing the dropdowns values once customer is added 
              $scope.gridOptions.enableSelectAll = false;//grid mark all selected mark invisible
              $rootScope.showCustViewMessage = true;
              $rootScope.custViewMessage = result.data.displayMessage;
              $scope.populateCustomers();
            } else {
              $scope.showFailureAlert = true;
              $scope.showSuccessAlert = false;
              $scope.failureTextAlert = result.data.displayMessage;
              $timeout(function () {
               $scope.showFailureAlert = false;
              }, 4000);
            }
          }, function failure (err) {
              $scope.loaded = true;
              $scope.showSuccessAlert = false;
              $scope.showFailureAlert = true;
              $scope.failureTextAlert = "Error deleting customer.. Please try again after sometime !!!";
              $timeout(function () {
               $scope.showFailureAlert = false;
              }, 4000);
          });
  }

});

// brand controller
app.controller('brandCtrl', function ($scope, $location, $route, $timeout, $http, $rootScope, $filter, uiGridConstants, HTTP_HEADERS, FILE_SIZES, API_URI, ModalService) {
  console.log("Brand Controller reporting for duty.");

  $rootScope.$broadcast('routeChange', {}); // For login check purposes -- added security

  $scope.isValidFile = true;
  $scope.showSuccessAlert = false;
  $scope.showFailureAlert = false;
  $scope.showMessageAlert = false;
  $scope.toolTipText = "Please select a customer to add new brand";
  $scope.cursor_change = "pointer";

  $scope.messageTextAlert ="";

  $scope.customersList = [];
  $scope.brandsList = [];
  $scope.lists = {};

  $scope.brand = {};
  // Reasons
  //$scope.reasons = [];
  $scope.locReasons = ["Speed Of Service", "Communication", 
                      "Knowledge", "Attention to Details", 
                      "Courtesy", "Other"];
  $scope.empReasons = ["Speed Of Service", "Communication", 
                      "Knowledge", "Attention to Details", 
                      "Courtesy", "Other"];

  $scope.brand.roles = [];
  $scope.brand.ratingsList = []; // default
  $scope.brand.defaultReasons = [];
  $scope.previousImg = "/assets/brand_default1.png"

  $scope.goToCreate = function() {
    if(!$rootScope.rootCustomer) {
      $scope.showCreateModal();
    } else {
      $location.path("/createBrand");
    }
  }


      $scope.showCreateModal = function () {
          // Delete modal
          var brands = [];
          ModalService.showModal({
              templateUrl: 'templates/partials/create-modal.html',
              controller: "deleteModalCtrl"
          }).then(function(modal) {
              modal.element.modal();
              modal.scope.modalOptions = {
                  // closeButtonText: 'Cancel',
                  actionButtonText: 'Ok',
                  headerText: 'Warning',
                  bodyText: 'Please select customer to add a new brand.'
              };
          });
      };

   

  $scope.baChanged = function() {
    if($scope.brand.bckColor.a > 1) {
      $scope.brand.bckColor.a = 1;
      $('#ba').val(1);
    }
  }

  $scope.faChanged = function() {
    if($scope.brand.fntColor.a > 1) {
      $scope.brand.fntColor.a = 1;
      $('#fa').val(1);
    }
  }
  if(!$scope.brand.isEditBrand)
    $scope.brand.bcolor = "#ffffff";

  $scope.bgInputChanged = function(){
    var r = $scope.brand.bckColor.r;
    var g = $scope.brand.bckColor.g;
    var b = $scope.brand.bckColor.b;
    if(r === null) r = 0;
    if(g === null) g = 0;
    if(b === null) b = 0;

    if(r === undefined) {
      r = 255;
      $scope.brand.bckColor.r = 255;
      $('#br').val(255);
    }
    if(g === undefined) {
      g = 255;
      $scope.brand.bckColor.g = 255;
      $('#bg').val(255);
    }
    if(b === undefined) {
      b = 255;
      $scope.brand.bckColor.b = 255;
      $('#bb').val(255);
    }

    var color  =  rgbToHex(r, g, b);
    $scope.brand.bcolor = color;
  }

  if(!$scope.brand.isEditBrand)
    $scope.brand.fcolor = "#000000";
  
  $scope.fntInputChanged = function(){
    var r = $scope.brand.fntColor.r;
    var g = $scope.brand.fntColor.g;
    var b = $scope.brand.fntColor.b;
    if(r === null) r = 0;
    if(g === null) g = 0;
    if(b === null) b = 0;

    if(r === undefined) {
      r = 255;
      $scope.brand.fntColor.r = 255;
      $('#fr').val(255);
    }
    if(g === undefined) {
      g = 255;
      $scope.brand.fntColor.g = 255;
      $('#fg').val(255);
    }
    if(b === undefined) {
      b = 255;
      $scope.brand.fntColor.b = 255;
      $('#fb').val(255);
    }

    var color  =  rgbToHex(r, g, b);
    $scope.brand.fcolor = color;
  }

  $rootScope.$watch('rootCustomer', function (val) {

   //if($location.path() == '/myBrands' && $rootScope.rootCustomer  && $rootScope.rootCustomer.id == 0) {
   if($location.path() == '/myBrands') {
     $timeout(function () {
        $scope.getAllBrands();
      }, 0);

     if($rootScope.rootCustomer)
     {
      $scope.toolTipText = "Add New Brand";
      $scope.cursor_change = "";
     }
     else
     {
      $scope.toolTipText = "Please select a customer to add new brand";
      $scope.cursor_change = "pointer";
     }
    }


   //show warning to select customer from brand 
    if($location.path() == '/createBrand' &&  $rootScope.rootCustomer )
      $scope.showMessageAlert = false;

    if($location.path() == '/createBrand' &&  $rootScope.rootCustomer === null )
     {
          $scope.messageTextAlert ="Please select customer to add a new brand";
          $scope.showMessageAlert = true;
      }    

    //default hidding warning on editBrand 
    if($location.path() == '/createBrand' && $scope.brand.isEditBrand)
      {
        $scope.showMessageAlert = false;
      }

  });

  $rootScope.$watch('rootBrand', function (val) {
    if($rootScope.rootBrand && ($location.path() == '/myBrands' &&  $rootScope.rootBrand.id || $location.path() == '/myBrands' &&  $rootScope.rootBrand.id === 0)) {
      $timeout(function () {
        $scope.getAllBrands();
      }, 0);
    }

    if($location.path() == '/myBrands' && $rootScope.rootBrand == null) {
      $timeout(function () {
        $scope.getAllBrands();
      }, 0);
    }
  });

  $scope.gridOptions = {};
  $scope.gridOptions = {
    paginationPageSizes: [20, 30, 50],
    paginationPageSize: 20,
    enableRowSelection: true,
    enableSelectAll: true,
    selectionRowHeaderWidth: 35,
    rowHeight: 50,
    showGridFooter:false,
    enableFiltering: true,
    minRowsToShow : 20
  };

  $scope.gridOptions.enableHorizontalScrollbar = 2;
  $scope.gridOptions.enableVerticalScrollbar = 2;



  $scope.gridOptions.columnDefs = [
    {name: 'name', displayName:'Brand' , width:250, cellTemplate: '<div class="ui-grid-cell-contents " style="color:{{row.entity.fntColorCell}};background-color:{{row.entity.bckColorCell}}; margin: 2px 2px; line-height:39px;"><img src="{{row.entity.imgToShowInCell}}" style="width:20%; margin-right:5px;" onerror="this.src=&#39;/assets/brand_default1.png&#39;">{{row.entity.name}}</div>' },
    {field: 'customer.name', width:250, displayName:'Customer', headerCellClass: $scope.highlightFilteredHeader , cellTemplate:'<div class="ui-grid-cell-contents textVerticalAlign">{{row.entity.customer.name}}</div>' },
    {name: 'primaryContact.name', displayName: 'Primary Contact', cellTemplate: '<div class="ui-grid-cell-contents"><i class="fa fa-paper-plane {{row.entity.pcClass}} tooltips" aria-hidden="true"><span >{{row.entity.toolTipTextP}}</span></i>{{row.entity.primaryContact.name}}<br><i style="visibility: hidden;" class="fa fa-paper-plane"></i><span class="list-v-email">{{row.entity.primaryContact.email}}</span></div>'},
    {name: 'adminContact.name', displayName: 'Admin Contact', cellTemplate: '<div class="ui-grid-cell-contents"><i class="fa fa-paper-plane {{row.entity.acClass}} tooltips" aria-hidden="true"><span >{{row.entity.toolTipTextA}}</span></i>{{row.entity.adminContact.name}}<br> <i style="visibility: hidden;" class="fa fa-paper-plane"></i><span class="list-v-email">{{row.entity.adminContact.email}}</span></div>'}
  ];


   $scope.gridOptions.enableHorizontalScrollbar = 0;
   $scope.gridOptions.enableVerticalScrollbar = 0;
 

  $scope.countRows=0;
  $scope.gridOptions.onRegisterApi = function(gridApi) {
   $scope.myGridApi = gridApi;
    $scope.gridApi = gridApi;

   gridApi.selection.on.rowSelectionChanged($scope, function(row){ 
    $scope.countRows = $scope.gridApi.selection.getSelectedRows().length;
    });

   gridApi.selection.on.rowSelectionChangedBatch($scope, function(row){ 
    $scope.countRows = $scope.gridApi.selection.getSelectedRows().length;
    });
   
  };



  if( $rootScope.rootCustomer === null &&  $location.path() == '/createBrand')
        {
          $scope.messageTextAlert ="Please select customer to add a new brand";
          $scope.showMessageAlert = true;
        }
  
  $scope.testPallet = function() {
    var colorInput;
    colorInput = $('<input type="color" value="!" />')[0];
    return colorInput.type === 'color' && colorInput.value !== '!';
  };

  // switch flag
  $scope.switchBool = function (value) {
      $scope[value] = !$scope[value];
  };

  if ($location.path().indexOf('editBrand') !== -1) {
    $scope.brand.isEditBrand = true;
  } else if ($location.path().indexOf('deleteBrand') !== -1) {
    $scope.brand.isDelBrand = true;
  }else {
    $scope.brand.isEditBrand = false;
    $scope.brand.isDelBrand = false;
  };

  $scope.gotoListView = function() {
    $location.path('/myBrands');
  };

  $scope.populateCustomersDropdown = function() {

    if($rootScope.brand) {
      // $scope.brand = {};
      // $scope.brand = $rootScope.brand;
       $rootScope.brand.brandId = {};
       $rootScope.brand.custId = {};
       $rootScope.brand.brandId.id = $rootScope.brand.id;
       $rootScope.brand.custId.id = $rootScope.brand.customer.id;
       $scope.brand.isEditBrand = true;
       $scope.hideDropDown = true;
      // $rootScope.brand = null;
      // $scope.getRatings();
      $scope.getRatings($rootScope.brand.ratingImgId);
      $timeout(function () {
        $scope.getBrandDetails();
      }, 0);
    } else {
      $scope.previousImg = "/assets/brand_default1.png";
      // Fetch all customers to populate dropdown list for update
      $http({
            method: 'GET',
            headers: HTTP_HEADERS,
            url: API_URI + 'customer'
          }).then(function (result) {
              if (result.data && result.data.code === 0) {
                $scope.customersList = result.data.data;
                $scope.getRatings();
                // $scope.getReasons();
              } else {
                $scope.showSuccessAlert = false;
                $scope.showFailureAlert = true;
                $scope.failureTextAlert = result.data.displayMessage;
                $timeout(function () {
                    $scope.showFailureAlert = false;
                  }, 4000);
              };
            }, function failure (err) {
                $scope.showSuccessAlert = false;
                $scope.showFailureAlert = true;
                $scope.failureTextAlert = "Error Fetching customers.. Please try again after sometime !!!";
                $timeout(function () {
                   $scope.showFailureAlert = false;
                  }, 4000);
            });
    }

  }

  $scope.getRatings = function (ratingImgId) {
    $scope.showSuccessAlert = false;
    $scope.showFailureAlert = false;
     $http({
        method: 'GET',
        headers: HTTP_HEADERS,
        url: API_URI + 'rating'
      }).then(function (result) {
          if (result && result.data && result.data.code === 0) {
            $scope.ratingsList = result.data.data;
            if(ratingImgId) {
              $scope.ratingsList.forEach(function(element, index) {
                if(element._id == ratingImgId) {
                  $scope.rating = element;
                  $scope.brand.ratingImgId = element; 
                }
              });
            }
             $scope.getReasons();
          } else {
            $scope.showSuccessAlert = false;
            $scope.showFailureAlert = true;
            $scope.failureTextAlert = result.data.displayMessage;
            $timeout(function () {
                $scope.showFailureAlert = false;
              }, 4000);
          };
        }, function failure (err) {
            $scope.showSuccessAlert = false;
            $scope.showFailureAlert = true;
            $scope.failureTextAlert = "Error Fetching Ratings.. Please try again after sometime !!!";
            $timeout(function () {
               $scope.showFailureAlert = false;
              }, 4000);
        });
  };

  $scope.getReasons = function () {

     $http({
        method: 'GET',
        headers: HTTP_HEADERS,
        url: API_URI + 'brandType'
      }).then(function (result) {
          if (result && result.data && result.data.code === 0 && Array.isArray(result.data.data)) {
            $scope.allReasons = result.data.data;
          } else {
           // $scope.allReasons = ["Speed of Service ","Communication ","Knowledge ","Attention to Details ","Courtesy ","Other"];
          };
        }, function failure (err) {
           console.log("Reasons Fetch Error: " + err);
        });
  };

  $scope.setReasons = function (reasons) {
    $scope.locReasons = reasons.feedbackReasonsLocation;
    $scope.empReasons = reasons.feedbackReasonsEmployee;
  };

  $scope.getBrands = function (custId) {
     // Fetch all Brands first to populate dropdown list
     if ($scope.brand.isEditBrand || $scope.brand.isDelBrand) {
        $scope.showSuccessAlert = false;
        $scope.showFailureAlert = false;
         $scope.lists.brandsList = [];
         $scope.editableFields();
         $('#brandSelect').find('option').remove();

          $http({
            method: 'GET',
            headers: HTTP_HEADERS,
            url: API_URI + 'brand?custId=' + custId.id
          }).then(function (result) {
              if (result.data && result.data.code === 0) {
                if (result.data.data.length > 0) {
                  $scope.lists.brandsList = result.data.data;
                };
              } else {
                $scope.showSuccessAlert = false;
                $scope.showFailureAlert = true;
                $scope.failureTextAlert = result.data.displayMessage;
                $timeout(function () {
                   $scope.showFailureAlert = false;
                  }, 4000);
              };
            }, function failure (err) {
                $scope.showSuccessAlert = false;
                $scope.showFailureAlert = true;
                $scope.failureTextAlert = "Error Fetching brands.. Please try again after sometime !!!";
                $timeout(function () {
                    $scope.showFailureAlert = false;
                  }, 4000);
            });
      };
  };

  $scope.getAllBrands = function() {

    if($rootScope.showBrandViewMessage && $rootScope.brandViewMessage) {
      $scope.showSuccessAlert = true;
      $scope.successTextAlert = $rootScope.brandViewMessage;
      $timeout(function () {
         $scope.showSuccessAlert = false;
         $rootScope.showBrandViewMessage = false; 
         $rootScope.brandViewMessage = null;
      }, 4000);
    }

    if($rootScope.rootBrand && $rootScope.rootBrand.id) {
      var api = 'brand/' + $rootScope.rootBrand.id;
    } else if($rootScope.rootCustomer && $rootScope.rootCustomer.id) {
      var api = 'brand?custId=' + $rootScope.rootCustomer.id;
    } else {
      var api = 'brand';
    }
    $scope.loaded = false;
    // Fetch all customers to populate dropdown list for update
    $http({
          method: 'GET',
          headers: HTTP_HEADERS,
          url: API_URI + api
        }).then(function (result) {
            $scope.loaded = true;
            if (result.data && result.data.code === 0) {
              $scope.showFailureAlert = false;

              $scope.brandsList = result.data.data;
              
              //sorting it asc by name and then setting it to grid
              $scope.gridOptions.data = $filter('orderBy')($scope.brandsList, "name", false);

              $scope.gridOptions.data.forEach(function(element, index){

                if (element.primaryContact && element.primaryContact.userId) {
                    element.pcClass = element.primaryContact.userId.verificationStatus;
                    if(element.pcClass == 'PV') {
                      element.toolTipTextP = "Verification invite not sent";
                    } else if (element.pcClass == 'AV') {
                      element.toolTipTextP = "Verified";
                    } else if (element.pcClass == 'IS') {
                      element.toolTipTextP = "Pending Verification";
                    } else if (element.pcClass == 'NA') {
                      element.toolTipTextP = "Verification failed";
                    }
                  } else {
                    element.pcClass = "PV";
                    element.toolTipTextP = "Verification invite not sent";
                  }
                  if (element.adminContact && element.adminContact.userId) {
                    element.acClass = element.adminContact.userId.verificationStatus; 
                    if(element.acClass == 'PV') {
                      element.toolTipTextA = "Verification invite not sent";
                    } else if (element.acClass == 'AV') {
                      element.toolTipTextA = "Verified";
                    } else if (element.acClass == 'IS') {
                      element.toolTipTextA = "Pending Verification";
                    } else if (element.acClass == 'NA') {
                      element.toolTipTextA = "Verification failed";
                    }
                  } else {
                    element.acClass = "PV";
                    element.toolTipTextA = "Verification invite not sent";
                  }

                element.imgToShowInCell = element.logoImgUrl;
                if(element.backgroundColor && element.backgroundColor.hasOwnProperty('r') && element.backgroundColor.hasOwnProperty('g') && element.backgroundColor.hasOwnProperty('b')) {
                  element.bckColorCell = rgbToHex(element.backgroundColor.r, element.backgroundColor.g, element.backgroundColor.b);
                 } //else {
                //   element.bckColorCell = "#ffffff";
                // }

                if(element.fontColor && element.fontColor.hasOwnProperty('r') && element.fontColor.hasOwnProperty('g') && element.fontColor.hasOwnProperty('b')) {
                  element.fntColorCell = rgbToHex(element.fontColor.r, element.fontColor.g, element.fontColor.b);
                 } //else {
                //   element.fntColorCell = "#000000";
                // }

              });
              $scope.noOfItems = result.data.data.length;
            } else {
              $scope.loaded = true;
              $scope.showSuccessAlert = false;
              $scope.showFailureAlert = true;
              $scope.failureTextAlert = result.data.displayMessage;
              $scope.gridOptions.data = []; //table reset to blank , when no details available
                  
                
            };
          }, function failure (err) {
              $scope.loaded = true;
              $scope.showSuccessAlert = false;
              $scope.showFailureAlert = true;
              $scope.failureTextAlert = "Error Fetching brands.. Please try again after sometime !!!";
              $scope.gridOptions.data = []; //table reset to blank, when error in fetching details 
          });
  }

  /* ---- INVITE CONTACT ---- */
  $scope.inviteContact = function () {
    var emailIds = [];
    var filterMailType = $('#radioGroup label.active input').val()

    $scope.myGridApi.selection.getSelectedRows().forEach(function (element, index) {
      if(filterMailType === "1" || filterMailType == undefined) {
        emailIds.push(element.primaryContact.email);
      } else {
        emailIds.push(element.adminContact.email);
      }
    });
    
    var details = {};
    details.emailIds = emailIds;
    $http({
          method: 'POST',
          headers: HTTP_HEADERS,
          url: API_URI + 'invite',
          data: details,
        }).then(function (result) {
            if (result.data && result.data.code === 0) {
              $scope.showFailureAlert = false;
              $scope.showSuccessAlert = true;
              $scope.successTextAlert = result.data.displayMessage;
              $timeout(function () {
                $scope.getAllBrands();
                $scope.countRows=0;
              }, 0);
              $timeout(function () {
                   $scope.showSuccessAlert = false;
                }, 10000);
            } else {
              $scope.showSuccessAlert = false;
              $scope.showFailureAlert = true;
              $scope.failureTextAlert = result.data.displayMessage;
              $timeout(function () {
                  $scope.showFailureAlert = false;
                }, 10000);
            };
          }, function failure (err) {
              $scope.showSuccessAlert = false;
              $scope.showFailureAlert = true;
              $scope.failureTextAlert = "Error inviting contact.. Please try again after sometime !!!";
              $timeout(function () {
                  $scope.showFailureAlert = false;
                }, 4000);
          });
  };

  $scope.goToEdit = function () {
      if($scope.myGridApi.selection.getSelectedRows().length == 1) {
        $rootScope.brand = $scope.myGridApi.selection.getSelectedRows()[0];
        $location.path('/editBrand');
      } else {
        alert("Please select only 1 location to edit.");
      }
    };

  $scope.$watch('indexRating', function (val) {
    $timeout(function () {
          if (val) {
            $('#ratingSelect')[0].options[val].selected = true;
          };

          if ($scope.new_rows && $scope.new_rows.length > 0) {
             $scope.new_rows.forEach(function (element, index) {
                $("#roleTable tr:last").after(element);
              });
          };


          $("#roleTable tr").click(function(val){
            console.log(val);
            $scope.roleTableRowClick(this, val);
          });
        });
  });

  $scope.getBrandDetails = function(brandId) {
    if($rootScope.brand) {
      brandId = $rootScope.brand
      $rootScope.brand = null;
      $scope.brand.name = brandId.name;
    }
    // Fetch all customers to populate dropdown list for update
    if(brandId.brandType) {
      if(brandId.locationReasons && brandId.locationReasons.length) {
        brandId.brandType.feedbackReasonsLocation = brandId.locationReasons;
      }
      if(brandId.defaultReasons && brandId.defaultReasons.length) {
        brandId.brandType.feedbackReasonsEmployee = brandId.defaultReasons;
      }
      $scope.brand.reasons = brandId.brandType;
    }
    $scope.brand.brandId = brandId.brandId;
    $scope.brand.custId = brandId.custId;

    $scope.previousImg = brandId.logoImgUrl ? brandId.logoImgUrl : $scope.previousImg;

    $scope.brand.bckColor = brandId.backgroundColor;
    $scope.brand.fntColor = brandId.fontColor;
    $scope.empReasons = [];
    $scope.locReasons = [];

    if($scope.brand.bckColor && $scope.brand.bckColor.hasOwnProperty('r') && $scope.brand.bckColor.hasOwnProperty('g') && $scope.brand.bckColor.hasOwnProperty('b')) {
      var clr = rgbToHex($scope.brand.bckColor.r, $scope.brand.bckColor.g, $scope.brand.bckColor.b);
      //document.getElementById("bckColor").value = clr;
      $scope.brand.bcolor = clr;
     } 

    if($scope.brand.fntColor && $scope.brand.fntColor.hasOwnProperty('r') && $scope.brand.fntColor.hasOwnProperty('g') && $scope.brand.fntColor.hasOwnProperty('b')) {
      var clr1 = rgbToHex($scope.brand.fntColor.r, $scope.brand.fntColor.g, $scope.brand.fntColor.b);
      //document.getElementById("fntColor").value = clr1;
      $scope.brand.fcolor = clr1;
     } 

    $scope.brand.adminContact = brandId.adminContact;
    $scope.brand.primaryContact = brandId.primaryContact;
    $scope.brand.empPersPref = brandId.empPersonlizationPrefix;
    brandId.defaultReasons.forEach(function (element, index) {
        $scope.empReasons.push(element.replace(/\s/g, " "));
    });

    brandId.locationReasons.forEach(function (element, index) {
        $scope.locReasons.push(element.replace(/\s/g, " "));
    });

    $("#roleTable tr:gt(0)").remove();
    $scope.brand.roles = brandId.roles || [];
    $scope.new_rows = [];
    $scope.brand.roles.forEach(function (element, index) {
      element.asIs = true;
      var new_row = '<tr style="border: 1px solid black;"><td style="width: 140px; height: 60px;vertical-align: center; text-align: left;padding:5px;" id="roleName">'+element.role_type+'</td>';
      new_row = new_row + '<td style="width: 120px; height: 60px;vertical-align: center; text-align: left;padding:5px;">';
      element.feedbackReasons.forEach(function (element1, index) {
        new_row = new_row + '<label class="xs-btn btn-default" style="font-weight: inherit;">' +element1+ '</label>&nbsp;&nbsp;';
       });
       new_row = new_row + '</td>';
       new_row = new_row + '<td style="width: 120px; height: 60px;vertical-align: center; text-align: center;padding:5px;"><label align="center" ng-click=""><span id="editRole" class="glyphicon glyphicon-edit" aria-hidden="true" style="color:#428bca;cursor: pointer;font-size:1.3em;"></span></label>&nbsp;&nbsp;<label align="center" ng-click=""><span id="delRole" class="glyphicon glyphicon-trash" aria-hidden="true" style="color:#a94442;cursor: pointer;font-size:1.3em;"></span></label></td></tr>';
       $scope.new_rows.push(new_row);
    });

    // Ratings Listing selection

    $scope.brand.ratingImgId = brandId.ratingImgId;
    if($scope.ratingsList)
    {
      $scope.ratingsList.forEach(function (element, index) {
        if (element._id === brandId.ratingImgId) {
          $scope.indexRating = index;
          $scope.brand.ratingImgId = element;
        };
      });
    }
  }

  var hexToRgb = function hexToRGBa(hex, alpha){
    var rgbColor = {};
    rgbColor.r = parseInt( hex.slice(1,3), 16 ),
    rgbColor.g = parseInt( hex.slice(3,5), 16 ),
    rgbColor.b = parseInt( hex.slice(5,7), 16 ),
    rgbColor.a = alpha || 1;
    return rgbColor;
  };

  function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }

  function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
  }


  $scope.$watch('brand.bcolor', function (val) {
    $scope.brand.bckColor = val ? hexToRgb(val) : null;
  });

  $scope.$watch('brand.fcolor', function (val) {
    $scope.brand.fntColor = val ? hexToRgb(val) : null;
  });

  var defaultText = '' + '&nbsp;<span class="glyphicon glyphicon-edit" aria-hidden="true"></span>';
  var endEdit = function (e) {
      var input = $(e.target),
          label = input && input.prev();
      label.html(input.val() === '' ? defaultText : input.val()+'&nbsp;<span class="glyphicon glyphicon-edit" aria-hidden="true"></span>');
      input.hide();
      input.val('');
      label.show();
      e.stopImmediatePropagation();
  };

  $scope.editableFields = function () {

    $('table tr td .clickedit').hide()
    .focusout(endEdit)
    .keyup(function (e) {
      //e.stopImmediatePropagation();
        if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
            endEdit(e);
            return false;
        } else {
            return true;
        };
    })
    .prev().click(function (e) {  // for label box click
          if ($(this).text().trim() != 'Other') {
            $(this).hide();
            defaultText = $(this).text()+'<span class="glyphicon glyphicon-edit" aria-hidden="true"></span>';
            $(this).next().show().focus();
            e.stopImmediatePropagation();
          };
        })
    .next().click(function (e) {  // for input text box click
            if ($(this).val() && $(this).val() === "") {
              $(this).val($scope.reasons[parseInt($(this)[0].name)]);
            }
            $(this).hide();
            $(this).next().show().focus();
            endEdit(e);
            e.stopImmediatePropagation();
        });
  };
   
  $scope.editableFields();
$scope.resetDefaultsEmployee = function () {
  $scope.empReasons.forEach(function (element, index) {
        if(element !== "Other"){
            $('label[name=defReasons]')[index].innerHTML = $scope.empReasons[index]+'&nbsp;<span class="glyphicon glyphicon-edit" aria-hidden="true"></span>';
        }
        else
        {
            $('label[name=defReasons]')[index].innerHTML = $scope.empReasons[index]+'&nbsp;<span class="glyphicon" aria-hidden="true"></span>';
        }
      });
};

  $scope.resetDefaultsLocation = function () {
      $scope.locReasons.forEach(function (element, index) {
        if(element !== "Other"){
            $('label[name=locReasons]')[index].innerHTML = $scope.locReasons[index]+'&nbsp;<span class="glyphicon glyphicon-edit" aria-hidden="true"></span>';
        }
        else
        {
            $('label[name=locReasons]')[index].innerHTML = $scope.locReasons[index]+'&nbsp;<span class="glyphicon" aria-hidden="true"></span>';
        }
      });
         
  };
  var roleCounter = 0;

  // brand role modal
  $scope.showModal = function() {
        ModalService.showModal({
            templateUrl: 'templates/partials/brand-role-modal.html',
            controller: "roleModalController"
        }).then(function(modal) {
            modal.scope.role.reasonModifiedFlag = $scope.reasonModifiedFlag;
            modal.scope.role = {};
           
            if ($scope.editRole) {  /// edit role call
              modal.scope.role = $scope.editRole.roleObj;
              modal.scope.reasons = $scope.editRole.roleObj.reasons;
            } else {
              modal.scope.reasons = [];
              $('label[name=defReasons]').each(function (index, element) {
                if (element.innerText !== 'Other') {
                  modal.scope.reasons.push(element.innerText);
                }
              });
              modal.scope.pushedRoles = [];
              $('#roleName').each(function (index, element) {
                if (element.innerText !== 'Other') {
                  modal.scope.pushedRoles.push(element.innerText);
                }
              });
            };

            modal.element.modal();
            modal.close.then(function(result) {
                $('.modal-backdrop').remove();
                if (result && result.role_type) {
                  roleCounter++;
                  if (!result.reasonModifiedFlag) {
                    $('label[name=defReasons]').each(function (index, element) {
                        result.feedbackReasons.push(element.innerText);
                    });
                  };

                  if ($scope.editRole) {
                    var prevRoleType = $scope.editRowData.cells[0].childNodes[0].data.trim();
                    $scope.brand.roles.forEach(function (element, index) {
                      if (element.role_type === prevRoleType) {
                        element.asIs = false;
                        element.editRoleFlag = true;
                        element.role_type = result.role_type;
                        element.feedbackReasons = result.feedbackReasons;
                      };
                    });
                  } else {
                    $scope.brand.roles.push({
                      feedbackReasons : result.feedbackReasons,
                      role_type : result.role_type
                    });
                  };

                  var new_row = '<tr style="border: 1px solid black;"><td style="width: 140px; height: 60px;vertical-align: center; text-align: left;padding:5px;" id="roleName">'+result.role_type+'</td>';
                  var rowIndex = null;

                  if ($scope.editRole) {
                    rowIndex = $scope.editRowData.rowIndex + 1;
                    $($scope.editRowData).replaceWith(new_row);
                  } else {
                    $('#roleTable tr:last').after(new_row);
                  };

                var col = '<td style="width: 120px; height: 60px;vertical-align: center; text-align: left;padding:5px;">';
                   
                   if (result.reasonModifiedFlag) {
                     result.feedbackReasons.forEach(function (element, index) {
                      col = col + '<label class="xs-btn btn-default" style="font-weight: inherit;">' +element+ '</label>&nbsp;&nbsp;';
                     });
                     col = col + '</td></tr>';
                   } else {
                     col = col + '<label class="xs-btn btn-default" style="font-weight: inherit;">Default</label>&nbsp;&nbsp;';
                     col = col + '</td></tr>';
                   }
                    
                  if ($scope.editRole) {
                    var findQuery = '#roleTable tr:nth-child('+rowIndex+') td:last';
                    $(findQuery).after(col);
                    $(findQuery).after('<td style="width: 120px; height: 60px;vertical-align: center; text-align: center;padding:5px;"><label align="center" ng-click=""><span id="editRole" class="glyphicon glyphicon-edit" aria-hidden="true" style="color:#428bca;cursor: pointer;font-size:1.3em;"></span></label>&nbsp;&nbsp;<label align="center" ng-click=""><span id="delRole" class="glyphicon glyphicon-trash" aria-hidden="true" style="color:#a94442;cursor: pointer;font-size:1.3em;"></span></label></td>');

                        $('#roleTable tr:nth-child('+rowIndex+')').click(function(val){
                          console.log(val);
                          $scope.roleTableRowClick(this, val);
                        });
                  } else {
                    var findQuery = '#roleTable td:last';
                    $(findQuery).after(col);
                    $(findQuery).after('<td style="width: 120px; height: 60px;vertical-align: center; text-align: center;padding:5px;"><label align="center" ng-click=""><span id="editRole" class="glyphicon glyphicon-edit" aria-hidden="true" style="color:#428bca;cursor: pointer;font-size:1.3em;"></span></label>&nbsp;&nbsp;<label align="center" ng-click=""><span id="delRole" class="glyphicon glyphicon-trash" aria-hidden="true" style="color:#a94442;cursor: pointer;font-size:1.3em;"></span></label></td>');

                        $("#roleTable tr:last").click(function(val){
                          console.log(val);
                          $scope.roleTableRowClick(this, val);
                        });
                  };
                  $scope.editRole = null; // to end edit functionality
                };
            });
        });
    };

    $scope.roleTableRowClick = function (rowData, val) {
      $scope.editRowData = rowData;
      if (val.target.id === "editRole") {
        $scope.editRoleDetailsListing(rowData, rowData.rowIndex);
      } else if (val.target.id === "delRole") {
        $scope.deleteRoleDetailsListing(rowData, rowData.rowIndex);
      };
    };

    $scope.editRoleDetailsListing = function (rowData,rowIndex) {

      var roleObj = {};
      roleObj.reasons = [];
      try {
        roleObj.role_type = rowData.cells[0].childNodes[0].data.trim();
        var reasonsNodes = rowData.cells[1].childNodes;

        reasonsNodes.forEach(function (element, index) {
          if (element.nodeName === 'LABEL') {
            if (element.textContent.trim() === "Default") {
              $('label[name=defReasons]').each(function (index, element) {
                if (element.innerText !== 'Other') {
                  roleObj.reasons.push(element.innerText.trim());
                }
              });
            } else if (element.innerText.trim() !== 'Other') {
              roleObj.reasons.push(element.innerText.trim());
            };
          };
        });
        $scope.editRole = {};
        $scope.editRole.roleObj = roleObj;
        $scope.editRole.rowIndex = rowIndex;

        $scope.showModal();
      } catch (err) {
        console.log("Edit Role Error: " + err);
      };

    };

    $scope.deleteRoleDetailsListing = function (rowData, rowIndex) {
      $scope.deletedRolesList = [];

      if ($scope.brand.roles[rowIndex-1] && $scope.brand.roles[rowIndex-1]._id) {
        $scope.deletedRolesList.push($scope.brand.roles[rowIndex-1]._id);
      }

       var prevRoleType = $(rowData)[0].cells[0].childNodes[0].data.trim();
        $scope.brand.roles.forEach(function (element, index) {
            if (element.role_type === prevRoleType) {
              $scope.brand.roles.splice(index, 1);
            };
        });

        $(rowData).remove();
    };


    $scope.getImageBinaryData = function() {
      var f = document.getElementById('fileLogo').files[0],
          r = new FileReader();
      
      $scope.$apply(function(){
        $scope.isValidFile = $rootScope.validateFileSize(f.size, "BRAND_IMG");
      });

      if ($scope.isValidFile) {
        r.onloadend = function(e){
          $scope.brand.logo_img = e.target.result;
          $('#fileLogoImg')
            .attr('src', e.target.result)
            .addClass('logo-img');
        };

        $scope.brand.imageModifiedFlag = true;
        $scope.brand.img_type=f.type;
        r.readAsDataURL(f);
      } else {
        document.getElementById('fileLogo').value = "";
        f= null;
      };
    };

    // Brand Form submit
    $scope.saveBrandDetails = function (brand) {
      // convert image file into binary data first
      $scope.loaded = false;
      $scope.brand.custId = $rootScope.rootCustomer.id;
      $scope.brand.defaultReasons = $scope.defaultReasons;
      $scope.brand.ratingImgId = $scope.brand.ratingImgId ? $scope.brand.ratingImgId.id : null;
      $scope.brand.defaultReasons =[];
      $scope.brand.locationReasons = [];

      $('label[name=defReasons]').each(function (index, element) {
        $scope.brand.defaultReasons.push(element.innerText.replace(/\s/g, ""));
      });
      $('label[name=locReasons]').each(function (index, element) {
        $scope.brand.locationReasons.push(element.innerText.replace(/\s/g, ""));
      });
      postDetails();

    };

    var postDetails = function () {
      $http({
        method: 'POST',
        headers: HTTP_HEADERS,
        url: API_URI + 'brand',
        data: $scope.brand,
      }).then(function (result) {
          $scope.loaded = true;
          
          if (result.data && result.data.code === 0) {

            //$location.hash('res');

            if($rootScope.rootCustomer) 
              {
                  $rootScope.getBrands($rootScope.rootCustomer);//when new brand added , brand list refresh
              }

            $(document).scrollTop(0);
            $rootScope.showBrandViewMessage = true;
            $rootScope.brandViewMessage = result.data.displayMessage;
            $location.path('/myBrands');

          } else {
            $(document).scrollTop(0);
            $scope.showSuccessAlert = false;
            $scope.showFailureAlert = true;
            $scope.failureTextAlert = result.data.displayMessage;
            $timeout(function () {
              $scope.showFailureAlert = false;
              }, 4000);
          };
        }, function failure (err) {
          $scope.loaded = true;
          $(document).scrollTop(0);
            $scope.showSuccessAlert = false;
            $scope.showFailureAlert = true;
            $scope.failureTextAlert = "Error saving brand details.. Please try again after sometime !!!";
            $timeout(function () {
               $scope.showFailureAlert = false;
              }, 4000);
        });
    };

    $scope.editBrandDetails = function () {
      $(document).scrollTop(0);
      $scope.loaded = false;
      $scope.brand.custId = $scope.brand.custId.id ? $scope.brand.custId.id : $scope.brand.custId;
      $scope.brand.defaultReasons = [];
      $scope.brand.locationReasons = [];
      $scope.brand.ratingImgId = $scope.brand.ratingImgId ? $scope.brand.ratingImgId.id : null;
      $('label[name=defReasons]').each(function (index, element) {
        $scope.brand.defaultReasons.push(element.innerText);
      });
      $('label[name=locReasons]').each(function (index, element) {
        $scope.brand.locationReasons.push(element.innerText);
      });
      $scope.brand.deletedRolesList = $scope.deletedRolesList;
      $http({
        method: 'PUT',
        headers: HTTP_HEADERS,
        url: API_URI + 'brand/' + $scope.brand.brandId.id,
        data: $scope.brand
      }).then(function (result) {
          $scope.loaded = true;
          $scope.brand = {};
          if (result.data && result.data.code === 0) {
            if($rootScope.rootCustomer) 
            { 
                if($rootScope.rootBrand && $rootScope.rootBrand.id) {
                  $rootScope.getBrands($rootScope.rootCustomer, $rootScope.rootBrand.id);//when a brand is edited , brand list refresh
                } else {
                  $rootScope.getBrands($rootScope.rootCustomer);
                }
            }

            $rootScope.showBrandViewMessage = true;
            $rootScope.brandViewMessage = result.data.displayMessage;
            $location.path('/myBrands');
          } else {
            $scope.showSuccessAlert = false;
            $scope.showFailureAlert = true;
            $scope.failureTextAlert = result.data.displayMessage;
            $timeout(function () {
              $scope.showFailureAlert = false;
              }, 4000);
          };
        }, function failure (err) {
            $scope.loaded = true;
            $scope.showSuccessAlert = false;
            $scope.showFailureAlert = true;
            $scope.failureTextAlert = "Error updating brand details.. Please try again after sometime !!!";
            $timeout(function () {
               $scope.showFailureAlert = false;
              }, 4000);
        });
    };

     /*---- Delete Brand Operations ----*/

      $scope.showDelModal = function (brand, isMultiple) {
          // Delete modal
          var brands = [];
          ModalService.showModal({
              templateUrl: 'templates/partials/delete-modal.html',
              controller: "deleteModalCtrl"
          }).then(function(modal) {
              modal.element.modal();
              modal.scope.modalOptions = {
                  closeButtonText: 'Cancel',
                  actionButtonText: 'Yes',
                  headerText: 'Confirm',
                  //bodyText: 'Are you sure you want to delete the brand "'+ brand.brandId.name +'" of "'+ brand.custId.name +'" customer?'
              };
              var warningMessage = "As these will delete all locations and employees related to it.";
              modal.scope.modalOptions.warningText = warningMessage;
              var brandsSelected = $scope.myGridApi.selection.getSelectedRows().length;
              brands = $scope.myGridApi.selection.getSelectedRows();
              if(brandsSelected === 1) {
                modal.scope.modalOptions.bodyText = 'Are you sure you want to delete the brand "'+ brands[0].name +'"?';
              }
              else 
                if(brandsSelected === 2) {
                  modal.scope.modalOptions.bodyText = 'Are you sure you want to delete the brand "'+ brands[0].name +'" and "'+ brands[1].name +'"?';
              }
              else
                if(brandsSelected === 3) {
                  modal.scope.modalOptions.bodyText = 'Are you sure you want to delete the brand "'+ brands[0].name +'" , "'+ brands[1].name +'" and '+brands[2].name+'"?';
              }
              else
              {
                if(brandsSelected !== 0)
                  modal.scope.modalOptions.bodyText = 'Are you sure you want to delete the brand "'+ brands[0].name +'" , "'+ brands[1].name +'" and '+(brandsSelected-2)+' others?';
              }
              

              modal.close.then(function(action) {
                  $('.modal-backdrop').remove();
                  if (action === 'YES') {
                    if(isMultiple) {
                      $scope.deleteArray = [];
                      $scope.myGridApi.selection.getSelectedRows().forEach(function(element, index) {
                        $scope.deleteArray.push(element.id);
                      });
                      deleteBrand($scope.deleteArray, true);
                    } else {
                      deleteBrand($scope.brand);
                    }
                  };
              });
          });
      };
      /** ---- DELETE Operations ---- **/
      var deleteBrand = function (brand, isMultiple) {
        $scope.loaded = false;
        var deleteBrandData = {};
        deleteBrandData.brandIds = [];
        if(Array.isArray(brand)) {
          deleteBrandData.brandIds = brand;
        } else {
          deleteBrandData.brandIds.push(brand.brandId.id);
        }

        var time = new Date().getTime();
        $http({
            method: 'DELETE',
            headers: HTTP_HEADERS,
            url: API_URI + 'brand?q='+time,
            data: deleteBrandData,
          }).then(function (result) {
              $scope.loaded = true;
              if(result) {
                  //delete deleted brand from select
                  if(!isMultiple) {
                    var x = document.getElementById("brandSelect");
                    x.remove(x.selectedIndex);
                  }
          
                  $scope.gridOptions.enableSelectAll = false;//grid mark all selected mark invisible

                  if($rootScope.rootCustomer) 
                  {
                      $rootScope.getBrands($rootScope.rootCustomer);//when a brand is deleted , brand list refresh
                  }
                  $rootScope.showBrandViewMessage = true;
                  $rootScope.brandViewMessage = result.data.displayMessage;        
                  $scope.getAllBrands();
                } else {
                  $scope.showFailureAlert = true;
                  $scope.showSuccessAlert = false;
                  $scope.failureTextAlert = result.data.displayMessage;
                }
            }, function failure (err) {
                $scope.loaded = true;
                $scope.showSuccessAlert = false;
                $scope.showFailureAlert = true;
                $scope.failureTextAlert = "Error deleting brand.. Please try again after sometime !!!";
            });
      };

       $("#cancelModal").click(function( event ) {
        event.preventDefault();
      });
      /* ---- Cancel Modal ---- */
      $scope.showCancelModal = function () {
        // Cancel Modal
          ModalService.showModal({
              templateUrl: 'templates/partials/cancel-modal.html',
              controller: "deleteModalCtrl"
          }).then(function(modal) {
              modal.element.modal();
              modal.scope.modalOptions = {
                  closeButtonText: 'No',
                  actionButtonText: 'Yes',
                  headerText: 'Confirm',
                 // bodyText: 'Your changes will not be saved? Do you want to continue?'
              };

              if($scope.brandForm && $scope.brandForm.$pristine) {
                modal.scope.modalOptions.bodyText = "Are you sure you want to cancel?";
              } else {
                modal.scope.modalOptions.bodyText = 'Your changes will not be saved? Do you want to continue?';
              }

              modal.close.then(function(action) {
                  $('.modal-backdrop').remove();
                  if (action === 'YES') {
                    $location.path('/myBrands');
                  };
              });
          });
      }

});

// Modal Controller for Role pop-up on brand creation page
app.controller('roleModalController', function($scope, close, FILE_SIZES) {

  $scope.role = {};
  $scope.isValidFile = true;

 $scope.close = function(roleDetails) {
  if (roleDetails === 'Cancel') {
    close(null, 500); // close, but give 500ms for bootstrap to animate  
  } else {


      $scope.role.feedbackReasons =[];
      if ($scope.role.reasonModifiedFlag) {
        $('label[name=feedReasons]').each(function (index, element) {
          $scope.role.feedbackReasons.push(element.innerText);
        });  
      };
      
      $scope.role.role_type = roleDetails.role_type;
      close($scope.role, 500); // close, but give 500ms for bootstrap to animate  
  }
  
 };

 $scope.getImageBinaryData = function(){
      var f = document.getElementById('fileIcon').files[0],
          r = new FileReader();
      $scope.role.img_name = (f && f.name) ? f.name : "No Image File selected";

      $scope.$apply(function(){
        $scope.isValidFile = $rootScope.validateFileSize(f.size, "ROLE_IMG");
      });

      if ($scope.isValidFile) {
          r.onloadend = function(e){
          $scope.role.img = e.target.result;
          $('#roleIcoImg')
            .attr('src', e.target.result)
            .addClass('logo-img');
        }
        $scope.role.img_type=f.type;
        r.readAsDataURL(f);
      } else {
        document.getElementById('fileIcon').value = "";
        f = null;
      };

    };
    
  var defaultText = '';

  var endEdit = function (e) {
      var input = $(e.target),
          label = input && input.prev();
          $scope.role.reasonModifiedFlag = true;
      label.html(input.val() === '' ? defaultText : input.val()+'&nbsp;<span class="glyphicon glyphicon-edit" aria-hidden="true"></span>');
      input.hide();
      input.val('');
      label.show();
      e.stopImmediatePropagation();
  };

  $scope.editableFields = function () {

    $('table tr td .clickedit').hide()
    .focusout(endEdit)
    .keyup(function (e) {
      //e.stopImmediatePropagation();
        if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
            endEdit(e);
            return false;
        } else {
            return true;
        };
    })
    .prev().click(function (e) {  // for label box click
            $(this).hide();
            defaultText = $(this).text()+'<span class="glyphicon glyphicon-edit" aria-hidden="true"></span>';
            $(this).next().show().focus();
            e.stopImmediatePropagation();
        })
    .next().click(function (e) {  // for input text box click
            if ($(this).val() && $(this).val() === "") {
              $(this).val($scope.reasons[parseInt($(this)[0].name)]);
            };
            $(this).hide();
            $(this).next().show().focus();
            endEdit(e);
            e.stopImmediatePropagation();
        });
  };
   
  $scope.editableFields();

  $scope.resetDefaults = function () {
    $scope.role.reasonModifiedFlag = false;
      $scope.reasons.forEach(function (element, index) {
        $('label[name=feedReasons]')[index].innerHTML = $scope.reasons[index]+'&nbsp;<span class="glyphicon glyphicon-edit" aria-hidden="true"></span>';
      });
  };



});


// location controller
app.controller('locCtrl', function ($scope, $location, $route, $timeout, $http, $rootScope, $filter, $window,  API_URI, HTTP_HEADERS, FILE_SIZES, ModalService) {
  console.log("Location Controller reporting for duty.");
  $rootScope.$broadcast('routeChange', {}); // For login check purposes -- added security

  $scope.showSuccessAlert = false;
  $scope.showFailureAlert = false;
  $scope.showMessageAlert = true;
  $scope.messageTextAlert ="Please select customer & brand to add a new location";

  $scope.lists = {};
  $scope.lists.customersList = [];
  $scope.lists.brandsList = [];
  $scope.locationsList = [];

  $scope.previousImg = '/assets/brand_default1.png';



   $scope.goToCreate = function() {
    if(!$rootScope.rootCustomer || !$rootScope.rootBrand) {
      $scope.showCreateModal();
    } else {
      $location.path("/createLocation");
    }
  }


      $scope.showCreateModal = function () {
          // Delete modal
          var brands = [];
          ModalService.showModal({
              templateUrl: 'templates/partials/create-modal.html',
              controller: "deleteModalCtrl"
          }).then(function(modal) {
              modal.element.modal();
              modal.scope.modalOptions = {
                  // closeButtonText: 'Cancel',
                  actionButtonText: 'Ok',
                  headerText: 'Warning',
                  bodyText: 'Please select customer and brand to add a new location.'
              };
          });
      };


  // switch flag
  $scope.switchBool = function (value) {
      $scope[value] = !$scope[value];
  };

  $scope.gotoListView = function() {
    $location.path('/myLocations');
  }

  $rootScope.$watch('rootCustomer', function (val) {

  if($rootScope.rootCustomer && $rootScope.rootBrand    && $location.path() == '/createLocation')
    {
      $scope.showMessageAlert = false;
    }
 
  if(( $rootScope.rootCustomer === null || $rootScope.rootBrand === null ) && $location.path() == '/createLocation')
    {
      $scope.showMessageAlert = true;
    }


    if($rootScope.rootCustomer && ($rootScope.rootCustomer.id && $location.path() == '/myLocations' || $rootScope.rootCustomer === null && $location.path() == '/myLocations')) {
      $scope.getAllLocations();
    }
  });

  $rootScope.$watch('rootBrand', function (val) {
    if($rootScope.rootBrand && $rootScope.rootBrand.id && $location.path() == '/myLocations') {
      $timeout(function () {
        $scope.getAllLocations();
      }, 0);
    }
    if($rootScope.rootBrand == null && $location.path() == '/myLocations') {
     $timeout(function () {
        $scope.getAllLocations();
      }, 0);
    }
    if($rootScope.rootCustomer && $rootScope.rootBrand    && $location.path() == '/createLocation')
    {
      $scope.showMessageAlert = false;
    }
 
    if(( $rootScope.rootCustomer === null || $rootScope.rootBrand === null ) && $location.path() == '/createLocation')
    {
      $scope.showMessageAlert = true;
    }
   

  });

  $rootScope.$watch('rootLocation', function (val) {
    if($location.path() == '/myLocations' && $rootScope.rootCustomer && $rootScope.rootCustomer.id && $rootScope.rootBrand  && $rootScope.rootBrand.id && $rootScope.rootLocation  && $rootScope.rootLocation.id  )
    {
        $timeout(function () {
            $scope.getAllLocations();
          }, 0);
    }
    if($location.path() == '/myLocations' && $rootScope.rootLocation === null) {
      $timeout(function () {
            $scope.getAllLocations();
          }, 0);
    }

  });


  $scope.gridOptions = {
    paginationPageSizes: [20, 30, 50],
    paginationPageSize: 20,
    enableRowSelection: true,
    enableSelectAll: true,
    selectionRowHeaderWidth: 35,
    rowHeight: 50,
    showGridFooter:false,
    enableFiltering: true,
    minRowsToShow : 10,
    virtualizationThreshold: 1000,

    beforeSelectionChange: function (row) {
      if ($scope.gridOptions.selectedItems.length > 10) {
        return false;
      }
      return true;
    }
  };

  $scope.gridOptions.enableHorizontalScrollbar = 0;
  console.log("Location Controller reporting duty.");

  $scope.isValidFile = true;
  $scope.gridOptions.enableVerticalScrollbar = 0;

  $scope.gridOptions.columnDefs = [
    { field: 'lname', width:200, displayName:'Location', headerCellClass: $scope.highlightFilteredHeader ,cellTemplate:'<div class="ui-grid-cell-contents textVerticalAlign"><img src="{{row.entity.locImgUrl}}" style="width:20%; margin-right:5px;" onerror="this.src=&#39;/assets/brand_default1.png&#39;">{{row.entity.lname}} </div>'},
    { field: 'brand.name', width:200, displayName:'Brand', headerCellClass: $scope.highlightFilteredHeader, cellTemplate:'<div class="ui-grid-cell-contents" style="line-height:39px;">{{row.entity.brand.name}}</div>' },
    { field: 'brand.customer.name', width:200, displayName:'Customer', headerCellClass: $scope.highlightFilteredHeader ,cellTemplate:'<div class="ui-grid-cell-contents textVerticalAlign">{{row.entity.brand.customer.name}} </div>'},
    {name: 'primaryContact.name', displayName: 'Primary Contact', cellTemplate: '<div class="ui-grid-cell-contents"><i class="fa fa-paper-plane {{row.entity.pcClass}} tooltips" aria-hidden="true"><span>{{row.entity.toolTipTextP}}</span></i>{{row.entity.primaryContact.name}}<br> <i style="visibility: hidden;" class="fa fa-paper-plane"></i><span class="list-v-email">{{row.entity.primaryContact.email}}</span></div>'},
    {name: 'adminContact.name', displayName: 'Admin Contact', cellTemplate: '<div class="ui-grid-cell-contents"><i class="fa fa-paper-plane {{row.entity.acClass}} tooltips" aria-hidden="true"><span>{{row.entity.toolTipTextA}}</span></i>{{row.entity.adminContact.name}}<br> <i style="visibility: hidden;" class="fa fa-paper-plane"></i><span class="list-v-email">{{row.entity.adminContact.email}}</span></div>'}
  ];



  //checking weather user has selected a customer and brand 
    if(( $rootScope.rootCustomer === null || $rootScope.rootBrand === null ) && $location.path() == '/createLocation')
        {
          $scope.showMessageAlert = true;
        }

  $scope.countRows=0;
  $scope.gridOptions.onRegisterApi = function(gridApi) {
   $scope.myGridApi = gridApi;
    $scope.gridApi = gridApi;

   gridApi.selection.on.rowSelectionChanged($scope, function(row){ 
    $scope.countRows = $scope.gridApi.selection.getSelectedRows().length;
    });

   gridApi.selection.on.rowSelectionChangedBatch($scope, function(row){ 
    $scope.countRows = $scope.gridApi.selection.getSelectedRows().length;
    });
  };

  $scope.getTableStyle= function() {
      var marginHeight = 20; // optional
      var length = $('img:visible').length; // this is unique to my cellTemplate
      return {
          height: (length * $scope.gridOptions.rowHeight + $scope.gridOptions.headerRowHeight + marginHeight ) + "px"
      };
  };

   $scope.goToEdit = function () {
      if($scope.myGridApi.selection.getSelectedRows().length == 1) {
        $rootScope.editLocation = $scope.myGridApi.selection.getSelectedRows()[0];
        $location.path('/editLocation');
      } else {
        alert("Please select only 1 location to edit.");
      }
    };

  /* ---- Cancel Modal location---- */

  $("#cancelModal").click(function( event ) {
    event.preventDefault();
  });

  $scope.showCancelModal = function () {
    // Cancel Modal
      ModalService.showModal({
          templateUrl: 'templates/partials/cancel-modal.html',
          controller: "deleteModalCtrl"
      }).then(function(modal) {
          modal.element.modal();
          modal.scope.modalOptions = {
              closeButtonText: 'No',
              actionButtonText: 'Yes',
              headerText: 'Confirm',
             // bodyText: 'Your changes will not be saved? Do you want to continue?'
          };

          if(($scope.locationForm && $scope.locationForm.$pristine) || ($scope.editLocationForm && $scope.editLocationForm.$pristine)) {
            modal.scope.modalOptions.bodyText = "Are you sure you want to cancel?";
          } else {
            modal.scope.modalOptions.bodyText = 'Your changes will not be saved? Do you want to continue?';
          }

          modal.close.then(function(action) {
              $('.modal-backdrop').remove();
              if (action === 'YES') {
                $location.path('/myLocations');
              };
          });
      });
  }

  $scope.gpsMandatoryClass = "";
  // create location :if latitude or longitude has input value then both are mandatory 
  $scope.latLongBlurCreate = function(){
    if(( $scope.location.lng !== '' && $scope.location.lng !== undefined)  || ( $scope.location.lat !== '' && $scope.location.lat !== undefined))
      {
        $scope.longRequired = true; //if latitude selected longitude is mandatory
        $scope.latRequired = true; //if longitude selected latitude is mandatory
        $scope.gpsMandatoryClass = "mandatory";
      }
    else
      { 
        $scope.longRequired = false;
        $scope.latRequired = false;  
        $scope.gpsMandatoryClass = "";  
      }

      if($scope.location.lng === undefined && $scope.location.lat === undefined){
         $scope.longRequired = false;  
         $scope.latRequired = false; 
         $scope.gpsMandatoryClass = ""; 
    }
  }

  // Edit location :if latitude or longitude has input value then both are mandatory 
  $scope.latLongBlurEdit = function(){
    if(( $scope.editLocation.lng !== '' && $scope.editLocation.lng !== undefined) || ( $scope.editLocation.lat !== '' && $scope.editLocation.lat !== undefined))
       {
         $scope.longRequiredEdit = true; //if latitude selected longitude is mandatory
         $scope.latRequiredEdit = true; //if longitude selected latitude is mandatory
         $scope.gpsMandatoryClass = "mandatory";
       } 
    else 
      {
         $scope.longRequiredEdit = false;  
         $scope.latRequiredEdit = false; 
         $scope.gpsMandatoryClass = ""; 
      }
    if($scope.editLocation.lng === undefined && $scope.editLocation.lat === undefined){
         $scope.longRequiredEdit = false;  
         $scope.latRequiredEdit = false; 
         $scope.gpsMandatoryClass = ""; 
    }
      
  }

  $scope.editLocationInit = function() {
    if($rootScope.editLocation) {
      $scope.editLocation = {};
      $scope.editLocation = $rootScope.editLocation;
      $scope.editDetails = {};
      $scope.editDetails.locId = {};
      $scope.editDetails.locId.id = $rootScope.editLocation.id;
      $scope.editLocation.lat =  $scope.editLocation.loc.lat
      $scope.editLocation.lng =  $scope.editLocation.loc.lng
      $scope.editLocation.oldLname =  $scope.editLocation.lname;

      $scope.previousImg = $scope.editLocation.locImgUrl ? $scope.editLocation.locImgUrl : $scope.previousImg;
      $scope.editLocation.img = null;
      $('#editLocImg')
        .attr('src', $scope.previousImg)
        .addClass('logo-img');

      $scope.hideDropDown = true;
      $rootScope.editLocation = null;
    } else {
      $scope.location.lat = "";
      $scope.location.lng = "";
      $scope.longRequired = false;
      $scope.latRequired = false;
      // Fetch all customers to populate dropdown list for update
      $http({
            method: 'GET',
            headers: HTTP_HEADERS,
            url: API_URI + 'customer'
          }).then(function (result) {
              if (result.data && result.data.code === 0) {
                $scope.lists.customersList = result.data.data;
              } else {
                $scope.showSuccessAlert = false;
                $scope.showFailureAlert = true;
                $scope.failureTextAlert = result.data.displayMessage;
                $timeout(function () {
                    $scope.showFailureAlert = false;
                  }, 4000);
              };
            }, function failure (err) {
                $scope.showSuccessAlert = false;
                $scope.showFailureAlert = true;
                $scope.failureTextAlert = "Error Fetching customers.. Please try again after sometime !!!";
                $timeout(function () {
                   $scope.showFailureAlert = false;
                  }, 4000);
            });
    }
  }

      $scope.getBrands = function (custId) {
        $scope.showSuccessAlert = false;
        $scope.showFailureAlert = false;
     // Fetch all Brands first to populate dropdown list
     $scope.lists.brandsList = [];
     $('#brandSelect').find('option').remove();

      $http({
        method: 'GET',
        headers: HTTP_HEADERS,
        url: API_URI + 'brand?custId=' + custId.id
      }).then(function (result) {
          if (result.data && result.data.code === 0) {
            if (result.data.data.length > 0) {
              $scope.lists.brandsList = result.data.data;
            };
          } else {
            $scope.showSuccessAlert = false;
            $scope.showFailureAlert = true;
            $scope.failureTextAlert = result.data.displayMessage;
      
          };
        }, function failure (err) {
            $scope.showSuccessAlert = false;
            $scope.showFailureAlert = true;
            $scope.failureTextAlert = "Error Fetching brands.. Please try again after sometime !!!";
  
        });
  };

  $scope.getLocations = function (brandId) {
      $scope.showSuccessAlert = false;
      $scope.showFailureAlert = false;
     // Fetch all Locations first to populate dropdown list
      $http({
        method: 'GET',
        headers: HTTP_HEADERS,
        url: API_URI + 'location?brandId=' + brandId.id
      }).then(function (result) {
          if (result.data && result.data.code === 0) {
            if (result.data.data.length > 0) {
              $scope.lists.locationList = result.data.data;
            };
          } else {
            $scope.showSuccessAlert = false;
            $scope.showFailureAlert = true;
            $scope.failureTextAlert = result.data.displayMessage;
  
          };
        }, function failure (err) {
            $scope.showSuccessAlert = false;
            $scope.showFailureAlert = true;
            $scope.failureTextAlert = "Error Fetching Locations.. Please try again after sometime !!!";
  
        });
  };

  function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }

  function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
  }

  $scope.getAllLocations = function() {

    if($rootScope.showLocViewMessage && $rootScope.locViewMessage) {
      $scope.showSuccessAlert = true;
      $scope.successTextAlert = $rootScope.locViewMessage;
      $timeout(function () {
         $scope.showSuccessAlert = false;
         $rootScope.showLocViewMessage = false; 
         $rootScope.locViewMessage = null;
      }, 4000);
    }

    if($rootScope.rootLocation && $rootScope.rootLocation.id) {
      var api = 'location/'+$rootScope.rootLocation.id ;
    }
    else if($rootScope.rootBrand && $rootScope.rootBrand.id ){
      var api = 'location?brandId=' + $rootScope.rootBrand.id;
    }else if($rootScope.rootCustomer && $rootScope.rootCustomer.id){
      var api = 'location?custId=' + $rootScope.rootCustomer.id;
    }else  {
      var api = 'location';
    }
    $scope.loaded = false;
    // Fetch all customers to populate dropdown list for update
    $http({
          method: 'GET',
          headers: HTTP_HEADERS,
          url: API_URI + api
        }).then(function (result) {
            $scope.loaded = true;
            if (result.data && result.data.code === 0) {
              $scope.showFailureAlert = false;

              $scope.locationsList = [];
              $scope.locationsList = result.data.data;

              $scope.locationsList.forEach(function(element, index) {
                  if (element.primaryContact && element.primaryContact.userId) {
                    element.pcClass = element.primaryContact.userId.verificationStatus;
                    if(element.pcClass == 'PV') {
                      element.toolTipTextP = "Verification invite not sent";
                    } else if (element.pcClass == 'AV') {
                      element.toolTipTextP = "Verified";
                    } else if (element.pcClass == 'IS') {
                      element.toolTipTextP = "Pending Verification";
                    } else if (element.pcClass == 'NA') {
                      element.toolTipTextP = "Verification failed";
                    }
                  } else {
                    element.pcClass = "PV";
                    element.toolTipTextP = "Verification invite not sent";
                  }
                  if (element.adminContact && element.adminContact.userId) {
                    element.acClass = element.adminContact.userId.verificationStatus; 
                    if(element.acClass == 'PV') {
                      element.toolTipTextA = "Verification invite not sent";
                    } else if (element.acClass == 'AV') {
                      element.toolTipTextA = "Verified";
                    } else if (element.acClass == 'IS') {
                      element.toolTipTextA = "Pending Verification";
                    } else if (element.acClass == 'NA') {
                      element.toolTipTextA = "Verification failed";
                    }
                  } else {
                    element.acClass = "PV";
                    element.toolTipTextA = "Verification invite not sent";
                  }
                });

               //sorting it asc by name and then setting it to grid
              $scope.gridOptions.data = $filter('orderBy')($scope.locationsList, "lname", false);


              // $scope.gridOptions.data = result.data.data;
              $scope.noOfItems = result.data.data.length;

              $scope.gridOptions.data.forEach(function(element, index){
                element.brand.imgToShowInCell = element.brand.logoImgUrl;
                if(element.brand.backgroundColor && element.brand.backgroundColor.hasOwnProperty('r') && element.brand.backgroundColor.hasOwnProperty('g') && element.brand.backgroundColor.hasOwnProperty('b')) {
                  element.brand.bckColorCell = rgbToHex(element.brand.backgroundColor.r, element.brand.backgroundColor.g, element.brand.backgroundColor.b);
                 } //else {
                //   element.bckColorCell = "#ffffff";
                // }

                if(element.brand.fontColor && element.brand.fontColor.hasOwnProperty('r') && element.brand.fontColor.hasOwnProperty('g') && element.brand.fontColor.hasOwnProperty('b')) {
                  element.brand.fntColorCell = rgbToHex(element.brand.fontColor.r, element.brand.fontColor.g, element.brand.fontColor.b);
                 } //else {
                //   element.fntColorCell = "#000000";
                // }

              });

            } else {
              $scope.showSuccessAlert = false;
              $scope.showFailureAlert = true;
              $scope.failureTextAlert = result.data.displayMessage;
              $scope.gridOptions.data = []; //when response is not available, table reset to blank
            };
          }, function failure (err) {
              $scope.loaded = true;
              $scope.showSuccessAlert = false;
              $scope.showFailureAlert = true;
              $scope.failureTextAlert = "Error Fetching locations.. Please try again after sometime !!!";
              $scope.gridOptions.data = []; //if any error in calling api, table reset to blank
          });
  }

  $scope.getLocationDetails = function() {
    $http({
          method: 'GET',
          headers: HTTP_HEADERS,
          url: API_URI + 'location?locId=' + $scope.editDetails.locId.id
        }).then(function (result) {
            if (result.data && result.data.code === 0) {
              $scope.editLocation = result.data.data[0];
              //Format location object for edit
              $scope.previousImg = $scope.editLocation.locImgUrl ? $scope.editLocation.locImgUrl : $scope.previousImg;
              $scope.editLocation.img = null;
              $scope.editLocation.lat =  $scope.editLocation.loc.lat
              $scope.editLocation.lng =  $scope.editLocation.loc.lng
              $('#editLocImg')
                .attr('src', $scope.previousImg)
                .addClass('logo-img');
            } else {
              $scope.showSuccessAlert = false;
              $scope.showFailureAlert = true;
              $scope.failureTextAlert = result.data.displayMessage;
              $timeout(function () {
                  $scope.showFailureAlert = false;
                }, 4000);
            };
          }, function failure (err) {
              $scope.showSuccessAlert = false;
              $scope.showFailureAlert = true;
              $scope.failureTextAlert = "Error Fetching location Details.. Please try again after sometime !!!";
              $timeout(function () {
                 $scope.showFailureAlert = false;
                }, 4000);
          });
  }

  $scope.getImageBinaryData = function(){
      var f = document.getElementById('locImg').files[0],
          r = new FileReader();
      
      $scope.$apply(function(){
        $scope.isValidFile = $rootScope.validateFileSize(f.size, "LOCATION_IMG");
      });

      if ($scope.isValidFile) {
        r.onloadend = function(e){
          $scope.location.img = e.target.result;
          $('#fileLocImg')
            .attr('src', e.target.result)
            .addClass('logo-img');
        }
        $scope.location.img_type=f.type;
        r.readAsDataURL(f);
      } else {
        document.getElementById('locImg').value = "";
        f = null;
      };

    };

    $scope.getImgBinaryForUpdate = function(){
      var f = document.getElementById('locImg').files[0],
          r = new FileReader();

      $scope.$apply(function(){
        $scope.isValidFile = $rootScope.validateFileSize(f.size, "LOCATION_IMG");
      });
      
      if ($scope.isValidFile) {
        r.onloadend = function(e){
          $scope.editLocation.img = e.target.result;
          $('#editLocImg')
            .attr('src', e.target.result)
            addClass('logo-img');
        }
        $scope.editLocation.img_type=f.type;
        r.readAsDataURL(f);
      } else {
        document.getElementById('locImg').value = "";
        f = null;
      };
    };

  var postDetails = function () {
    $http({
          method: 'POST',
          headers: HTTP_HEADERS,
          url: API_URI + 'location',
          data: $scope.location,
        }).then(function (result) {
            $scope.loaded = true;
            if (result.data && result.data.code === 0) {
              $(document).scrollTop(0);
              $scope.location.brandId = null;

              if($rootScope.rootBrand) 
              {
                 $rootScope.getLocations($rootScope.rootBrand);//when new location , refreshing location list
              }

              $rootScope.showLocViewMessage = true;
              $rootScope.locViewMessage = result.data.displayMessage;
              $location.path('/myLocations');
            } else {
              $scope.showSuccessAlert = false;
              $scope.showFailureAlert = true;
              $scope.failureTextAlert = result.data.displayMessage;
              $timeout(function () {
               $scope.showFailureAlert = false;
              }, 4000);
            };
          }, function failure (err) {
              $scope.loaded = true;
              $scope.showSuccessAlert = false;
              $scope.showFailureAlert = true;
              $scope.failureTextAlert = "Error creating location.. Please try again after sometime !!!";
              $timeout(function () {
               $scope.showFailureAlert = false;
              }, 4000);
          });
  };

  $scope.editLocationDetails = function (editLocation) {
      $(document).scrollTop(0);
      $scope.loaded = false;

    $http({
          method: 'PUT',
          headers: HTTP_HEADERS,
          url: API_URI + 'location/' + $scope.editDetails.locId.id,
          data: editLocation,
        }).then(function (result) {
            $scope.loaded = true;
            if (result.data && result.data.code === 0) {
              if($rootScope.rootBrand) 
              {
                if($rootScope.rootLocation && $rootScope.rootLocation.id) {
                 $rootScope.getLocations($rootScope.rootBrand, $rootScope.rootLocation.id);//when edit location , refreshing location list
                } else {
                  $rootScope.getLocations($rootScope.rootBrand);
                }
              }
              $rootScope.showLocViewMessage = true;
              $rootScope.locViewMessage = result.data.displayMessage;
              $location.path('/myLocations');
            } else {
              $scope.showSuccessAlert = false;
              $scope.showFailureAlert = true;
              $scope.failureTextAlert = result.data.displayMessage;
              $timeout(function () {
                  $scope.showFailureAlert = false;
                }, 4000);
            };
          }, function failure (err) {
              $scope.loaded = true;
              $scope.showSuccessAlert = false;
              $scope.showFailureAlert = true;
              $scope.failureTextAlert = "Error editing location.. Please try again after sometime !!!";
              $timeout(function () {
                  $scope.showFailureAlert = false;
                }, 4000);
          });
  };

  /* ---- INVITE CONTACT LOCATION ---- */
  $scope.inviteContact = function () {
    var emailIds = [];
    var flag = 1;
    var filterMailType = $('#radioGroup label.active input').val();

    
    $scope.myGridApi.selection.getSelectedRows().forEach(function (element, index) {
      if(filterMailType === "1" || filterMailType == undefined) {
        emailIds.push(element.primaryContact.email);
      } else {
        emailIds.push(element.adminContact.email);
      }
    });
    
    var details = {};
    details.emailIds = emailIds;
    $http({
          method: 'POST',
          headers: HTTP_HEADERS,
          url: API_URI + 'invite',
          data: details,
        }).then(function (result) {
            if (result.data && result.data.code === 0) {
              $scope.showFailureAlert = false;
              $scope.showSuccessAlert = true;
              $scope.successTextAlert = result.data.displayMessage;
              $timeout(function () {
                $scope.getAllLocations();
                $scope.countRows=0;
              }, 0);
              $timeout(function () {
                   $scope.showSuccessAlert = false;
                }, 10000);
            } else {
              $scope.showSuccessAlert = false;
              $scope.showFailureAlert = true;
              $scope.failureTextAlert = result.data.displayMessage;
              $timeout(function () {
                  $scope.showFailureAlert = false;
                }, 10000);
            };
          }, function failure (err) {
              $scope.showSuccessAlert = false;
              $scope.showFailureAlert = true;
              $scope.failureTextAlert = "Error inviting contact.. Please try again after sometime !!!";
              $timeout(function () {
                  $scope.showFailureAlert = false;
                }, 4000);
          });
  };

   /*---- Delete Brand Operations ----*/
   $scope.location = {};

  $scope.showDelModal = function (location, isMultiple) {
      // Delete modal
      ModalService.showModal({
          templateUrl: 'templates/partials/delete-modal.html',
          controller: "deleteModalCtrl"
      }).then(function(modal) {
          modal.element.modal();
          modal.scope.modalOptions = {
              closeButtonText: 'Cancel',
              actionButtonText: 'Yes',
              headerText: 'Confirm',
             // bodyText: 'Are you sure you want to delete the location "'+ location.locId.lname +'" for "'+ location.brandId.name +'" of "'+ location.custId.name +'" customer?'
          };

          // if(isMultiple) {
          //   var locationsSelected = $scope.myGridApi.selection.getSelectedRows().length;
          //   modal.scope.modalOptions.bodyText = 'Are you sure you want to delete '+ locationsSelected+' location(s)?';
          // } else {
          //   modal.scope.modalOptions.bodyText = 'Are you sure you want to delete the location "'+ location.locId.lname +'" for "'+ location.brandId.name +'" of "'+ location.custId.name +'" customer?';
          // }
              var warningMessage = "As these will delete all employees related to it.";
              modal.scope.modalOptions.warningText = warningMessage;
              var locationSelected = [];
              var locationSelectedCount = $scope.myGridApi.selection.getSelectedRows().length;
              locationSelected = $scope.myGridApi.selection.getSelectedRows();
              if(locationSelectedCount === 1) {
                modal.scope.modalOptions.bodyText = 'Are you sure you want to delete the location "'+ locationSelected[0].lname +'"?';
              }
              else 
                if(locationSelectedCount === 2) {
                  modal.scope.modalOptions.bodyText = 'Are you sure you want to delete the locations "'+ locationSelected[0].lname +'" and "'+ locationSelected[1].lname +'"?';
              }
              else
                if(locationSelectedCount === 3) {
                  modal.scope.modalOptions.bodyText = 'Are you sure you want to delete the locations "'+ locationSelected[0].lname +'" , "'+ locationSelected[1].lname +'" and '+locationSelected[2].lname+'"?';
              }
              else
              {
                if(locationSelectedCount !== 0)
                  modal.scope.modalOptions.bodyText = 'Are you sure you want to delete the locations "'+ locationSelected[0].lname +'" , "'+ locationSelected[1].lname +'" and '+(locationSelectedCount-2)+' others?';
              }

          modal.close.then(function(action) {
              $('.modal-backdrop').remove();
              if (action === 'YES') {
                if(isMultiple) {
                  $scope.deleteArray = [];
                  $scope.myGridApi.selection.getSelectedRows().forEach(function(element, index) {
                    $scope.deleteArray.push(element.id);
                  });
                  deleteLocation($scope.deleteArray);
                } else {
                  deleteLocation($scope.location);
                }
              };
          });
      });
  };

  var deleteLocation = function (location) {
    $scope.loaded = false;
    var deleteLocation = {};
    deleteLocation.locationIds = [];
    if(Array.isArray(location)) {
      deleteLocation.locationIds = location;
    } else {
      deleteLocation.locationIds.push(location.locId.id);
    }
    var time = new Date().getTime();

    $http({
          method: 'DELETE',
          headers: HTTP_HEADERS,
          url: API_URI + 'location?q='+time,
          data: deleteLocation,
        }).then(function (result) {
          $scope.loaded = true;
          $scope.loc = {};
            if(result.data.code == 0) {
              //delete deleted brand from select
              var x = document.getElementById("locSelect") || null;
              if(x) {
                x.remove(x.selectedIndex);
              }
              $scope.gridOptions.enableSelectAll = false;//grid mark all selected mark invisible
              $scope.loaded = true;       
              
              if($rootScope.rootBrand) 
              {
                 $rootScope.getLocations($rootScope.rootBrand);//when delete location , refreshing location list
              }
              $rootScope.showLocViewMessage = true;
              $rootScope.locViewMessage = result.data.displayMessage;
              $scope.getAllLocations();
            } else {
              $scope.showFailureAlert = true;
              $scope.showSuccessAlert = false;
              $scope.failureTextAlert = result.data.displayMessage;
            }
          }, function failure (err) {
              $scope.loaded = true;
              $scope.showSuccessAlert = false;
              $scope.showFailureAlert = true;
              $scope.failureTextAlert = "Error deleting location.. Please try again after sometime !!!";
          });
  };

  $scope.submitLocation = function (location) {
    $scope.loaded = false;
    $scope.location.custId = $rootScope.rootCustomer.id;
    $scope.location.brandId = $scope.rootBrand.id;
    
    $timeout(function () {
        postDetails();
    }, 0);
    
    
  };

});

// Delete Controller Modal - Common for Delete operations for Customer, Brand, Location
app.controller('deleteModalCtrl', function ($scope, close) {
  $scope.close = function(action) {
      $scope.action = action;
      close($scope.action, 500); // close, but give 500ms for bootstrap to animate
  };
});


// Employee Controller
app.controller('empCtrl', function ($scope, $location, $route, $timeout, $http, $rootScope, HTTP_HEADERS, FILE_SIZES, API_URI, ModalService, $filter) {
  console.log("Employee Controller reporting for duty.");
  
  $rootScope.$broadcast('routeChange', {}); // For login check purposes -- added security

  $scope.isValidFile = true;
  $scope.isValidFileCSV = true;
  $scope.isValidFileZIP = true;

  $scope.showSuccessAlert = false;
  $scope.showFailureAlert = false;
  $scope.showMessageAlert = false;

  $scope.messageTextAlert = "";

  $scope.lists = {};
  $scope.lists.customersList = [];
  $scope.lists.brandsList = [];
  $scope.lists.locationsList = [];
  $scope.lists.showSearchBtn = false;
  
  $scope.filenameCSV = "";
  $scope.filenameIMAGE = "";
  $scope.filesSelected = true;

  var initializing = true;


   $scope.goToCreate = function(isBulk) {
    if(!$rootScope.rootCustomer || !$rootScope.rootBrand || !$rootScope.rootLocation) {
      $scope.showCreateModal(isBulk);
    } else {
      if(isBulk)
      {
        $location.path("/createEmployeeBulk");
      }else
      {
        $location.path("/createEmployee");
      }
    }
  }

      $scope.showCreateModal = function (isBulk) {
          // Delete modal
          var brands = [];
          ModalService.showModal({
              templateUrl: 'templates/partials/create-modal.html',
              controller: "deleteModalCtrl"
          }).then(function(modal) {
              modal.element.modal();
              modal.scope.modalOptions = {
                  // closeButtonText: 'Cancel',
                  actionButtonText: 'Ok',
                  headerText: 'Warning',
                  //bodyText: 'Please select customer, brand and location to add a new employee.'
              };

              if(isBulk) {
                modal.scope.modalOptions.bodyText = "Please select customer, brand and location to add new employees in bulk.";
              }
              else
              {
                modal.scope.modalOptions.bodyText = "Please select customer, brand and location to add a new employee.";
              }

          });
      };

  // employee data object
  $scope.emp = {};

  // switch flag
  $scope.switchBool = function (value) {
      $scope[value] = !$scope[value];
  };

  $scope.reloadPage = function() {
    $route.reload();
  }

  //grid employee

  $scope.getTableStyle= function() {
      var marginHeight = 20; // optional
      var length = $('img:visible').length; // this is unique to my cellTemplate
      return {
          height: (length * $scope.gridOptions.rowHeight + $scope.gridOptions.headerRowHeight + marginHeight ) + "px"
      };
  };


    $scope.gridOptions = {
    paginationPageSizes: [20, 30, 50],
    paginationPageSize: 20,
    enableRowSelection: true,
    enableSelectAll: true,
    selectionRowHeaderWidth: 35,
    rowHeight: 50,
    showGridFooter:false,
    enableFiltering: true,
    minRowsToShow : 10,
    
    enableScrollbars: true,
   disableHorizontalScrollbar: true,
    virtualizationThreshold: 1000,
    beforeSelectionChange: function (row) {
      if ($scope.gridOptions.selectedItems.length > 10) {
        return false;
      }
      return true;
    }
  };

  

  $scope.gridOptions.columnDefs = [
    {name: 'fullName.full',  displayName: 'Name', headerCellClass: $scope.highlightFilteredHeader ,cellTemplate: '<div class="ui-grid-cell-contents" style="line-height:39px;"> <img style="width:20%; height:auto; max-height:100%; " src="{{row.entity.imgToShowInCell}}" onerror="this.src=&#39;/assets/imgpsh_smallsize.png&#39;" /> {{row.entity.fullName.full}}</div>'},
    {name: 'employeeId', displayName: 'Emp Id', cellTemplate: '<div class="ui-grid-cell-contents textVerticalAlign">{{row.entity.employeeId}}</div>'},
    {name: 'brandId.name', displayName: 'Brand', cellTemplate: '<div class="ui-grid-cell-contents textVerticalAlign" style="margin: 2px 2px;">{{row.entity.brandId.name}}</div>'},
    {name: 'locationId.lname', displayName: 'Location', cellTemplate: '<div class="ui-grid-cell-contents textVerticalAlign">{{row.entity.locationId.lname}}</div>'},
    {name: 'beaconId', displayName: 'Beacon', cellTemplate: "<div class='ui-grid-cell-contents textVerticalAlign'>{{row.entity.beaconId ? row.entity.beaconId : 'Not Paired'}}</div>"},
    {name: 'department', displayName: 'Department', cellTemplate: '<div class="ui-grid-cell-contents textVerticalAlign">{{row.entity.department}}</div>'},
    {name: 'roleId.role_type', displayName: 'Role', cellTemplate: '<div class="ui-grid-cell-contents textVerticalAlign">{{row.entity.roleId.role_type}}</div>'},
    {name: 'startDt', displayName: 'Start Date', cellFilter: 'date:"MM/dd/yyyy"', type: 'date', filterCellFiltered: true,  cellTemplate: '<div class="ui-grid-cell-contents textVerticalAlign">{{row.entity.startDt ? (row.entity.startDt | date:"MM/dd/yyyy") : "Not Available"}}</div>'},
    {name: 'prefix.value', width:120, displayName: 'Personalization Value', cellTemplate: '<div class="ui-grid-cell-contents textVerticalAlign">{{row.entity.prefix.value}}</div>'}
  ];
  
  $scope.countRows=0;


    $scope.gridOptions.onRegisterApi = function(gridApi) {
       $scope.myGridApi = gridApi;
       $scope.gridApi = gridApi;
       gridApi.selection.on.rowSelectionChanged($scope, function(row){ 
        $scope.countRows = $scope.gridApi.selection.getSelectedRows().length;
        });

       gridApi.selection.on.rowSelectionChangedBatch($scope, function(row){ 
        $scope.countRows = $scope.gridApi.selection.getSelectedRows().length;
        });

      //   $scope.myGridApi.selection.on.rowSelectionChanged($scope,function(row){
      //       if($scope.myGridApi.selection.getSelectedGridRows().length > 2) {
      //           row.setSelected(false);
      //       };
      // });
    };


  $scope.checkRootSelection = function()
  {
    if( ( $location.path() == '/createEmployeeBulk' ||  $location.path() == '/createEmployee' ) && $rootScope.rootCustomer && $rootScope.rootCustomer.id &&  $rootScope.rootBrand &&  $rootScope.rootBrand.id && $rootScope.rootLocation && $rootScope.rootLocation.id  )
      {
        $scope.showMessageAlert = false;
      }
  

    if( $location.path() == '/searchEmployee' && $rootScope.rootCustomer  && $rootScope.rootCustomer.id &&  $rootScope.rootBrand &&  $rootScope.rootBrand.id)
      {
        $scope.showMessageAlert = false;
      }


    //checking weather the cust, brand, loc dropdowns are selected are not when select value is changed 
     // if($location.path() == '/searchEmployee'   && $scope.gridOptions.data.length === 0 &&  ( $rootScope.rootCustomer === null ||  $rootScope.rootBrand === null  ))
     //  {
     //        $scope.showMessageAlert = true;
     //        $scope.showSuccessAlert = false;
     //        $scope.showFailureAlert = false;
     //        $scope.messageTextAlert = "Please select customer and brand";

     //  }
    
      if($location.path() == '/createEmployeeBulk'  &&  ( $rootScope.rootCustomer === null ||  $rootScope.rootBrand === null || $rootScope.rootLocation === null  ))
      {
            $scope.showMessageAlert = true;
            $scope.messageTextAlert = "Please select customer, brand and location for bulk upload";
      }
    
      if($location.path() == '/createEmployee'  &&  ( $rootScope.rootCustomer === null ||  $rootScope.rootBrand === null || $rootScope.rootLocation === null  ))
      {
            $scope.showMessageAlert = true;
            $scope.messageTextAlert = "Please select customer, brand and location for adding new employee";
      }
  }

  $rootScope.$watch('rootCustomer', function (val) {
     if($location.path() == '/searchEmployee') {

        if(initializing)
        {
          $timeout(function() { initializing = false; });
        }
        else
        {
          $scope.searchEmployees();
        }
     }
  });
  $rootScope.$watch('rootBrand', function (val) {
     if($location.path() == '/searchEmployee') {
        if(initializing)
        {
          $timeout(function() { initializing = false; });
        }
        else
        {
          $scope.searchEmployees();
        }
     }
  });
  $rootScope.$watch('rootLocation', function (val) {
     if($location.path() == '/searchEmployee') {
        if(initializing)
        {
          $timeout(function() { initializing = false; });
        }
        else
        {
          $scope.searchEmployees();
        }
     }
  });

  if($location.path() == '/createEmployeeBulk'  &&  ( $rootScope.rootCustomer === null ||  $rootScope.rootBrand === null || $rootScope.rootLocation === null  ))
  {
        $scope.showMessageAlert = true;
        $scope.messageTextAlert = "Please select customer, brand and location for bulk upload";
  }
  if($location.path() == '/createEmployee'  &&  ( $rootScope.rootCustomer === null ||  $rootScope.rootBrand === null || $rootScope.rootLocation === null  ))
  {
        $scope.showMessageAlert = true;
        $scope.messageTextAlert = "Please select customer, brand and location for adding new employee";
  }
    


  //for datepicker
  $scope.datePickerIconClicked =   function(){
        $('#datetimepicker4').click();
  }
  $(function() {
    $('input[name="sdate"]').daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        opens: "right",
        drops: "up",
        locale: {
            format: 'MM/DD/YYYY'
        }
    }, 
    function(start, end, label) {

      
      $('#datetimepicker4').val(start.format('MM/DD/YYYY'))
      $scope.emp.startDt = start.format('MM/DD/YYYY');
      
    });
  });
  
  $scope.getRolesList = function (brandId) {
     // Fetch all Locations first to populate dropdown list
     $scope.lists.rolesList = [];

      $http({
        method: 'GET',
        headers: HTTP_HEADERS,
        url: API_URI + 'role?brandId=' + brandId.id
      }).then(function (result) {
          if (result.data && result.data.code === 0) {
            if (result.data.data.length > 0) {
                $scope.lists.rolesList = result.data.data;
            };
          } else {
            $scope.showSuccessAlert = false;
            $scope.showFailureAlert = true;
            $scope.failureTextAlert = result.data.displayMessage;
             $timeout(function () {
               $scope.showFailureAlert = false;
              }, 4000);
            
          };
        }, function failure (err) {
            $scope.showSuccessAlert = false;
            $scope.showFailureAlert = true;
            $scope.failureTextAlert = "Error Fetching Locations.. Please try again after sometime !!!";
             $timeout(function () {
               $scope.showFailureAlert = false;
              }, 4000);
        });
  };

   var resetBrandDefaults = function () {
      $scope.emp.locId = null;
      $('#brandSelect').find('option:gt(0)').remove();
      $('#locSelect').find('option:gt(0)').remove();
      $scope.lists.locationsList = [];
      $scope.lists.brandsList = [];
      $scope.lists.rolesList = [];
      $('#postErrors').val('');
      $('#empCSV').val('');
      $scope.showFailureAlert = false;
      $scope.showSuccessAlert = false;
      // for bulk operations
      $scope.lists.validationErrors = [];
      $scope.lists.empNoFound = [];
      $scope.lists.empDup = [];
      $scope.lists.beaconDup = [];
      $scope.lists.creationError = [];
      $scope.lists.empCreation = [];
  };

  var resetLocationDefaults = function () {
      $scope.emp.locId = null;
      $('#locSelect').find('option:gt(0)').remove();
       $('#roleSelect').find('option:gt(0)').remove();
       $scope.lists.locationsList = [];
       $scope.lists.rolesList = [];
      $('#postErrors').val('');
      $('#empCSV').val('');
      $scope.showFailureAlert = false;
      $scope.showSuccessAlert = false;
      // for bulk operations
      $scope.lists.validationErrors = [];
      $scope.lists.empNoFound = [];
      $scope.lists.empDup = [];
      $scope.lists.beaconDup = [];
      $scope.lists.creationError = [];
      $scope.lists.empCreation = [];
  };

  /*----- Employee Creation Indiviual Operation -----*/
  var roleIds = [];

  var resetDefaultsEmpInd = function () {
    $scope.emp.locId = null;
    $(':input').val('');
      $('#custSelect').find('option')[0].selected = true;
      $('#brandSelect').find('option')[0].selected = true;
      $('#locSelect').find('option')[0].selected = true;
      $('#roleSelect').find('option:gt(0)').remove();
      $('#fileEmpImg')[0].src = ASSET_URI;
      $scope.lists.rolesList = [];
     $scope.showFailureAlert = false;
     $scope.showSuccessAlert = false;
  };

  $scope.initCreateEmp = function () {
    $scope.emp = {};
    $scope.emp.prefix = {"key" : $rootScope.rootBrand.empPersonlizationPrefix};
  }
  // Employee Indiviual Form submit
  $scope.createEmployee = function (emp) {
    // convert image file into binary data first
    $scope.loaded = false;
    if($rootScope.rootBrand && $rootScope.rootBrand.empPersonlizationPrefix && $scope.emp.prefix) {
      $scope.emp.prefix.key = $rootScope.rootBrand.empPersonlizationPrefix;
     }

    $scope.emp.custId = $rootScope.rootCustomer.id;
    $scope.emp.brandId = $rootScope.rootBrand.id;
    $scope.emp.locId = $rootScope.rootLocation.id;

    $scope.emp.roleId = $scope.emp.roleId ? $scope.emp.roleId._id : null;
    $scope.emp.roleName = $scope.emp.roleName ? $scope.emp.roleName : null;

    postDetailsInd();

  };

  $scope.getImageBinaryData = function(){
      var f = document.getElementById('fileImg').files[0],
          r = new FileReader();

      $scope.$apply(function(){
        $scope.isValidFile = $rootScope.validateFileSize(f.size, "EMPLOYEE_IMG");
      });

      if ($scope.isValidFile) {
        r.onloadend = function(e){
          $scope.emp.img = e.target.result;
          $('#fileEmpImg')
            .attr('src', e.target.result)
            .addClass('logo-img');
        };

        $scope.emp.img_type=f.type;
        r.readAsDataURL(f);
      } else {
        document.getElementById('fileImg').value = "";
        f = null;
      };

    };

    $scope.getImageBinaryDataInEdit = function(){
      var f = document.getElementById('fileImg').files[0],
          r = new FileReader();

      $scope.$apply(function(){
        $scope.isValidFile = $rootScope.validateFileSize(f.size, "EMPLOYEE_IMG");
      });

      if ($scope.isValidFile) {
        r.onloadend = function(e){
          $scope.emp.imageModifiedFlag = true;
          $scope.emp.img = e.target.result;
          $('#fileEmpImg')
            .attr('src', e.target.result)
            .addClass('logo-img');
        };

        $scope.emp.img_type=f.type;
        r.readAsDataURL(f);
      } else {
        document.getElementById('fileImg').value = "";
        f = null;
      };
    };

  var postDetailsInd = function () {
    $http({
      method: 'POST',
      headers: HTTP_HEADERS,
      url: API_URI + 'employee?qty=ind',
      data: $scope.emp,
    }).then(function (result) {
        $scope.loaded = true;
        $(document).scrollTop(0);
        if (result.data && result.data.code === 0) {
          $rootScope.showEmpViewMessage = true;
          $rootScope.empViewMessage = result.data.displayMessage;
          $location.path("/searchEmployee");
        } else {
          $scope.showSuccessAlert = false;
          $scope.showFailureAlert = true;
          $scope.failureTextAlert = result.data.displayMessage;
        };
      }, function failure (err) {
          $scope.loaded = true;
          $scope.showSuccessAlert = false;
          $scope.showFailureAlert = true;
          $scope.failureTextAlert = "Error creating employee.. Please try again after sometime !!!";
      });
  };

  $scope.initBulkUpload = function() {
    $http({
      method: 'GET',
      headers: HTTP_HEADERS,
      url: API_URI + 'assetPath',
      data: $scope.emp,
    }).then(function (result) {
        if(result && result.data && result.data.data && result.data.data.assetUri) {
          $scope.template_employee_bulk_link = result.data.data.assetUri + "templates/employee_bulk_template.csv";
        } else {
          $scope.template_employee_bulk_link = "http://storage.googleapis.com/applause-dev-img/templates/employee_bulk_template.csv";
        }
      }, function failure (err) {
         $scope.template_employee_bulk_link = "http://storage.googleapis.com/applause-dev-img/templates/employee_bulk_template.csv";
      });
  }

  /* ----- Bulk Employee Update Operations -----*/ 
  //$scope.template_employee_bulk_link = ASSET_URI + "templates/employee_bulk_template.csv";
  $scope.lists.validationErrors = [];
  $scope.lists.empNoFound = [];
  $scope.lists.empDup = [];
  $scope.lists.beaconDup = [];
  $scope.lists.creationError = [];
  $scope.lists.empCreation = [];
  




  // For Bulk upload employee Data
  $scope.getFileBinaryData = function(context){
    var f = null,
        r = null,
        domId = null;
    var sizeKey = null;

    if (context === 'EmployeeData') {
      domId = 'empCSV';
      sizeKey = "CSV_FILE_SIZE";

      f = document.getElementById(domId).files[0],
      r = new FileReader();

      $timeout(function () {
        $scope.$apply(function(){
            $scope.isValidFileCSV = $rootScope.validateFileSize(f.size, sizeKey);
        });
      }, 0);
    } else {
      domId = 'empImgBulk';
      sizeKey = "ZIP_IMG_FILE_SIZE";
      f = document.getElementById(domId).files[0],
      r = new FileReader();

      $timeout(function () {
        $scope.$apply(function(){
            $scope.isValidFileZIP = $rootScope.validateFileSize(f.size, sizeKey);
      });}, 0);
    }
    

    if ($scope.isValidFileCSV && $scope.isValidFileZIP) {

      r.onloadend = function(e) {
        if (context === 'EmployeeData') {
          $scope.emp.data = e.target.result;
          $scope.isValidFileCSV = true;
        } else {
          $scope.emp.imgZip = e.target.result;
          $scope.isValidFileZIP = true;
        };
      };

      $scope.emp.data_type=f.type;
      r.readAsDataURL(f);
    } else {
      document.getElementById(domId).value= "";
      f = null;
    }
  };

  $scope.createEmployeeBulk = function() {

      $scope.emp.custId = $rootScope.rootCustomer.id;
      $scope.emp.locId = $rootScope.rootLocation.id;
      $scope.emp.empPrefixKey = $rootScope.rootBrand.empPersonlizationPrefix;
      $scope.emp.brandId = $rootScope.rootBrand.id;

      postDetailsBulk();
  };

  var postDetailsBulk = function () {
    $rootScope.loaded = false;//to display loader
    // $('#contScreen').toggleClass('se-pre-con1');
    $http({
      method: 'POST',
      headers: HTTP_HEADERS,
      url: API_URI + 'employee?qty=bulk',
      data: $scope.emp,
    }).then(function (result) {
      
      // $('#contScreen').toggleClass('se-pre-con1');
        if (result.data && result.data.code === 0) {
          $rootScope.loaded = true;
          $scope.lists.validationErrors = result.data.data.validationErrors;
          $scope.lists.empNoFound = result.data.data.empNoFound;
          $scope.lists.empDup = result.data.data.empDup;
          $scope.lists.beaconDup = result.data.data.beaconDup;
          $scope.lists.creationError = result.data.data.creationError;
          $scope.lists.empCreation = result.data.data.empCreation;
         
         if (result.data.data.empCreation && result.data.data.empCreation.length > 0) {
          $scope.showFailureAlert = false;
          $scope.showSuccessAlert = true;
          $scope.successTextAlert = result.data.displayMessage;
          $timeout(function () {
           $scope.showSuccessAlert = false;
           //$route.reload();
          }, 4000);
         } else {
          $scope.showFailureAlert = true;
          $scope.showSuccessAlert = false;
          $scope.failureTextAlert = "Employee Creation Bulk operation failed !!!";
          $timeout(function () {
           $scope.showFailureAlert = false;
          }, 4000);
         };
        } else {
          $rootScope.loaded = true;
          $scope.showSuccessAlert = false;
          $scope.showFailureAlert = true;
          $scope.failureTextAlert = result.data.displayMessage;
          $timeout(function () {
           $scope.showFailureAlert = false;
          }, 4000);
        };
      }, function failure (err) {
          $rootScope.loaded = true;
          $scope.showSuccessAlert = false;
          $scope.showFailureAlert = true;
          $scope.failureTextAlert = "Error creating employee.. Please try again after sometime !!!";
      });
  };


  /*---- Search Employee Profiles ----*/
  $scope.lists.searchResults = false;
  $scope.lists.empSearchResults = [];

  var formQueryString = function (empData) {
    var empObj = {};
    var abc = null;

    empData.custId ? empObj.custId = empData.custId.id : abc= null;
    empData.locId ? empObj.locId = empData.locId.id : abc= null;
    empData.brandId ? empObj.brandId = empData.brandId.id : abc= null;

    var queryString = "";
    for (var key in empObj) {
      if (!queryString) {
        queryString = queryString + "?";
      } else {
        queryString = queryString + "&";
      }
      queryString = queryString + key + "=" + empObj[key];
    };

    return queryString;
  };


   function componentToHex(c) {
      var hex = c.toString(16);
      return hex.length == 1 ? "0" + hex : hex;
    }

    function rgbToHex(r, g, b) {
     return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }



  $scope.searchEmployees = function (emp) {

    if($rootScope.showEmpViewMessage && $rootScope.empViewMessage) {
      $scope.showSuccessAlert = true;
      $scope.successTextAlert = $rootScope.empViewMessage;
      $timeout(function () {
         $scope.showSuccessAlert = false;
         $rootScope.showEmpViewMessage = false; 
         $rootScope.empViewMessage = null;
      }, 4000);
    }

    //if($rootScope.rootCustomer && $rootScope.rootCustomer.id && $rootScope.rootBrand && $rootScope.rootBrand.id) {
      var queryFlag = 0; 

      $scope.emp = {};
      if($rootScope.rootCustomer && $rootScope.rootCustomer.id) {
        $scope.emp.custId = $rootScope.rootCustomer;
        queryFlag = 1;
      }
      if($rootScope.rootBrand && $rootScope.rootBrand.id) {
        $scope.emp.brandId = $rootScope.rootBrand;
        queryFlag = 1;
      }
      if($rootScope.rootLocation && $rootScope.rootLocation.id) {
        $scope.emp.locId = $rootScope.rootLocation;
        queryFlag = 1;
      }
      if(queryFlag) {
        var queryString = formQueryString($scope.emp) || "";
          queryString = queryString ? queryString + "&page=searchEmployee" : queryString + "?page=searchEmployee";
          queryString = $scope.emp.searchParams ? queryString + "&empData=" +  $scope.emp.searchParams : queryString;
      }

      var time = new Date().getTime();
      if(queryString) {
        queryString = queryString + "&q=" + time;
      } else {
        queryString = "?q=" + time;
      }
      $scope.loaded = false;
      
      $http({
          method: 'GET',
          headers: HTTP_HEADERS,
          url: API_URI + 'employee/' + queryString
        }).then(function (result) {
          $scope.loaded = true;
          if (result && result.data.data && result.data.data.length > 0) {
             $scope.showFailureAlert = false;
             $scope.showMessageAlert = false;
             // if(!$scope.showSuccessAlert)
             // {
             //   //$scope.showSuccessAlert = true;
             //   //$scope.successTextAlert = result.data.displayMessage;
             // }
             
             $scope.lists.searchResults = true;
             $scope.lists.empSearchResults = result.data.data;
             //$scope.lists.prefix = result.data.data[0].prefix.key;
             if($rootScope.rootBrand && $rootScope.rootBrand.empPersonlizationPrefix)
              {
                  $scope.lists.prefix = $rootScope.rootBrand.empPersonlizationPrefix;
              }  
             else   
               {
                  $scope.lists.prefix = "Personalization Value";
               }

              $scope.gridOptions.columnDefs.forEach(function (element, index) {
                if (element.name.indexOf('prefix') !== -1) {
                  $scope.gridOptions.columnDefs[index] = {name: 'prefix.value', width:120, displayName: $scope.lists.prefix, cellTemplate: '<div class="ui-grid-cell-contents textVerticalAlign">{{row.entity.prefix.value}}</div>'};
                }
              });

              $scope.gridOptions.data = result.data.data;
              //sorting it asc by name and then setting it to grid
              $scope.gridOptions.data = $filter('orderBy')($scope.lists.empSearchResults, "fullName.full", false);

              $scope.gridOptions.data.forEach(function(element, index){
                  element.imgToShowInCell = element.empImgUrl;
                  element.brandId.imgToShowInCell = element.brandId.logoImgUrl;

                });

            $scope.gridOptions.enableVerticalScrollbar = 0;
            $scope.gridOptions.enableHorizontalScrollbar = 0;

          } else {
             $scope.showSuccessAlert = false;
             $scope.showFailureAlert = true;
             $scope.failureTextAlert = result.data.displayMessage;
             $scope.lists.searchResults = false;
             $scope.gridOptions.data = []; //when response is not available, table reset to blank
          };
        }, function (err) {
            $scope.loaded = true;
            $scope.showSuccessAlert = false;
            $scope.showFailureAlert = true;
            $scope.failureTextAlert = "Error searching employee.. Please try again after sometime !!!";
            $scope.lists.searchResults = false;
            $scope.gridOptions.data = []; //if any error in calling api, table reset to blank


        });

  }; 

   /* ---- Edit Employee Profiles ---- */
   // $scope.editEmployee = function (row, rowIndex) {
    $scope.editEmployee = function () {

      if($scope.myGridApi.selection.getSelectedRows().length == 1) {
        //data = $scope.myGridApi.selection.getSelectedRows()[0];
        $rootScope.editEmployee = $scope.myGridApi.selection.getSelectedRows()[0];
        $location.path('/editEmployee');
      } else {
        alert("Please select only 1 customer to edit.");
      }
   };

   $scope.editEmpInit = function() {
      $scope.emp = {};
      $scope.emp = $rootScope.editEmployee;
      $scope.emp.oldBeaconId = $scope.emp.beaconId;
      $scope.emp.oldEmployeeId = $scope.emp.employeeId;
      $scope.emp.startDt = $scope.emp.startDt ? $filter('date')(new Date($scope.emp.startDt), 'MM/dd/yyyy') : null;
      $('#fileEmpImg')
        .attr('src', $rootScope.editEmployee.empImgUrl)
        .addClass('logo-img');

      //for datepicker
      $timeout(function() {
        $('input[name="sdate"]').daterangepicker({
            singleDatePicker: true,
            showDropdowns: true,
            opens: "right",
            drops: "up",
            locale: {
                format: 'MM/DD/YYYY'
            }
        }, 
        function(start, end, label) {
          $('#datetimepicker4').val(start.format('MM/DD/YYYY'))
          $scope.emp.startDt = start.format('MM/DD/YYYY');
        });
      
      });

      $scope.getRolesList($scope.emp.brandId);

     // console.log($scope.emp);

   }

   // Delete Employee actions

   /* ---- Delete  CUSTOMER OPERATIONS ---- */
  $scope.showDelModal = function () {
      // var rowId = rowIndex;
      // var data = row.res;
      $scope.deleteArray = [];
      $scope.myGridApi.selection.getSelectedRows().forEach(function(element, index) {
        $scope.deleteArray.push(element.id);
      });
      // Delete modal
      ModalService.showModal({
          templateUrl: 'templates/partials/delete-modal.html',
          controller: "deleteModalCtrl"
      }).then(function(modal) {
          modal.element.modal();
          modal.scope.modalOptions = {
              closeButtonText: 'Cancel',
              actionButtonText: 'Yes',
              headerText: 'Confirm',
              // bodyText: 'Are you sure you want to delete "' + $scope.deleteArray.length + '" employee(s)?'
          };


              var employeesSelected = [];
              var employeesSelectedCount = $scope.myGridApi.selection.getSelectedRows().length;
              employeesSelected = $scope.myGridApi.selection.getSelectedRows();
              if(employeesSelectedCount === 1) {
                modal.scope.modalOptions.bodyText = 'Are you sure you want to delete the Employee "'+ employeesSelected[0].fullName.full +'"?';
              }
              else 
                if(employeesSelectedCount === 2) {
                  modal.scope.modalOptions.bodyText = 'Are you sure you want to delete the Employees "'+ employeesSelected[0].fullName.full +'" and "'+ employeesSelected[1].fullName.full +'"?';
              }
              else
                if(employeesSelectedCount === 3) {
                  modal.scope.modalOptions.bodyText = 'Are you sure you want to delete the Employees "'+ employeesSelected[0].fullName.full +'" , "'+ employeesSelected[1].fullName.full +'" and '+employeesSelected[2].fullName.full+'"?';
              }
              else
              {
                if(employeesSelectedCount !== 0)
                  modal.scope.modalOptions.bodyText = 'Are you sure you want to delete the Employees "'+ employeesSelected[0].fullName.full +'" , "'+ employeesSelected[1].fullName.full +'" and '+(employeesSelectedCount-2)+' others?';
              }


          modal.close.then(function(action) {
              $('.modal-backdrop').remove();
              if (action === 'YES') {
                delEmployee();
              };
          });
      });
  };

  var delEmployee = function () {
    $scope.loaded = false;
    var delEmployee = {};
    delEmployee.empIds = $scope.deleteArray;
    $http({
          method: 'DELETE',
          headers: HTTP_HEADERS,
          url: API_URI + 'employee',
          data: delEmployee,
        }).then(function (result) {
            $scope.loaded = true;
            if(result.data.code == 0) {
              $rootScope.showEmpViewMessage = true;
              $rootScope.empViewMessage = result.data.displayMessage;
              $scope.searchEmployees();
              $scope.gridOptions.enableSelectAll = false;//grid mark all selected mark invisible
            } else {
              $scope.showFailureAlert = true;
              $scope.showSuccessAlert = false;
              $scope.failureTextAlert = result.data.displayMessage;
            }
          }, function failure (err) {
              $scope.loaded = true;
              $scope.showSuccessAlert = false;
              $scope.showFailureAlert = true;
              $scope.failureTextAlert = "Error deleting employee.. Please try again after sometime !!!";
          });
  };

  // Employee History
  $scope.showEmployeeHistory = function (row, rowIndex) {
    // var rowId = rowIndex;
    var rowSelected = [];
    rowSelected =  $scope.myGridApi.selection.getSelectedRows();
    $scope.rowData = rowSelected[0];
    $scope.rowData.custId = $rootScope.rootCustomer;

     $http({
          method: 'GET',
          headers: HTTP_HEADERS,
          url: API_URI + 'employeeHistory?empId=' + $scope.rowData.employeeId
        }).then(function (result) {
            $scope.showSuccessAlert = false;
            $scope.showFailureAlert = false;
            showHistoryModal(result.data);
          }, function failure (err) {
              $scope.showSuccessAlert = false;
              $scope.showFailureAlert = true;
              $scope.failureTextAlert = "Error searching employee hoistory.. Please try again after sometime !!!";
          });
  };

  var showHistoryModal = function (historyResult) {
     // Delete modal
      ModalService.showModal({
          templateUrl: 'templates/partials/employee-history-modal.html',
          controller: "empHistoryModal"
      }).then(function(modal) {
          modal.scope.historyResult = historyResult.data ? historyResult.data : [];
          modal.scope.rowData = $scope.rowData;
          modal.element.modal();
          modal.close.then(function(action) {
              $('.modal-backdrop').remove();
          });
      });
  };

  /* ---- Cancel Modal employee---- */
      $("#cancelModal").click(function( event ) {
        event.preventDefault();
      });

      $scope.showCancelModal = function () {
        // Cancel Modal
          ModalService.showModal({
              templateUrl: 'templates/partials/cancel-modal.html',
              controller: "deleteModalCtrl"
          }).then(function(modal) {
              modal.element.modal();
              modal.scope.modalOptions = {
                  closeButtonText: 'No',
                  actionButtonText: 'Yes',
                  headerText: 'Confirm',
                 // bodyText: 'Your changes will not be saved? Do you want to continue?'
              };

              if($scope.employeeForm && $scope.employeeForm.$pristine) {
                modal.scope.modalOptions.bodyText = "Are you sure you want to cancel?";
              } else {
                modal.scope.modalOptions.bodyText = 'Your changes will not be saved? Do you want to continue?';
              }

              modal.close.then(function(action) {
                  $('.modal-backdrop').remove();
                  if (action === 'YES') {
                    $location.path('/searchEmployee');
                  };
              });
          });
      }

         // Roles list 
   $scope.getRolesList = function (brandId) {
     // Fetch all Locations first to populate dropdown list
     console.log($scope.emp);
     $scope.rolesList = [];
      $http({
        method: 'GET',
        headers: HTTP_HEADERS,
        url: API_URI + 'role?brandId=' + brandId.id
      }).then(function (result) {
          if (result.data && result.data.code === 0) {
            if (result.data.data.length > 0) {
              $scope.lists = {};

                $scope.lists.rolesList = result.data.data;
                $scope.lists.rolesList.forEach(function (element, index) {
                  if (element._id == $scope.emp.roleId._id) {
                    $scope.emp.role = element;
                  };
                });
            };
          } else {
            $scope.showSuccessAlert = false;
            $scope.showFailureAlert = true;
            $scope.failureTextAlert = result.data.displayMessage;
             $timeout(function () {
               $scope.showFailureAlert = false;
              }, 4000);
            
          };
        }, function failure (err) {
            $scope.showSuccessAlert = false;
            $scope.showFailureAlert = true;
            $scope.failureTextAlert = "Error Fetching Locations.. Please try again after sometime !!!";
             $timeout(function () {
               $scope.showFailureAlert = false;
              }, 4000);
        });
  };

    $scope.updateEmployee = function (empData) {
    $(document).scrollTop(0);
    $scope.loaded = false;
    var empData1 = empData;
    if($rootScope.rootBrand && $rootScope.rootBrand.empPersonlizationPrefix && empData1.prefix) {
      empData1.prefix.key = $rootScope.rootBrand.empPersonlizationPrefix;
     }
    empData1.brandId = empData.brandId.id ? empData.brandId.id : empData.brandId;
    empData1.locationId = empData.locationId.id ? empData.locationId.id : empData.locationId;
    empData1.fname = empData.fullName.fname;
    empData1.lname = empData.fullName.lname;

    $http({
          method: 'PUT',
          headers: HTTP_HEADERS,
          url: API_URI + 'employee/' + empData1.id,
          data: empData1,
        }).then(function (result) {
            $scope.loaded = true;
            if (result.data && result.data.code === 0) {
              $scope.company = {};
              $rootScope.showEmpViewMessage = true;
              $rootScope.empViewMessage = result.data.displayMessage;
              $location.path("/searchEmployee");
            } else {
              $scope.showSuccessAlert = false;
              $scope.showFailureAlert = true;
              $scope.failureTextAlert = result.data.displayMessage;
            };
          }, function failure (err) {
              $scope.loaded = true;
              $scope.showSuccessAlert = false;
              $scope.showFailureAlert = true;
              $scope.failureTextAlert = "Error updating employee.. Please try again after sometime !!!";
          });
  };

  

});

// Edit Employee Modal controller
app.controller('empEditModalCtrl', function ($scope, close, $http, $timeout, HTTP_HEADERS, FILE_SIZES, API_URI, $rootScope, ASSET_URI) {
  
  $scope.isValidFile = true;

   // Roles list 
   $scope.getRolesList = function (brandId) {
     // Fetch all Locations first to populate dropdown list
     $scope.rolesList = [];
      $http({
        method: 'GET',
        headers: HTTP_HEADERS,
        url: API_URI + 'role?brandId=' + brandId.id
      }).then(function (result) {
          if (result.data && result.data.code === 0) {
            if (result.data.data.length > 0) {
              $scope.lists = {};

                $scope.lists.rolesList = result.data.data;
                $scope.lists.rolesList.forEach(function (element, index) {
                  if (element._id == $scope.emp.roleId._id) {
                    $scope.emp.role = element;
                  };
                });
            };
          } else {
            $scope.showSuccessAlert = false;
            $scope.showFailureAlert = true;
            $scope.failureTextAlert = result.data.displayMessage;
             $timeout(function () {
               $scope.showFailureAlert = false;
              }, 4000);
            
          };
        }, function failure (err) {
            $scope.showSuccessAlert = false;
            $scope.showFailureAlert = true;
            $scope.failureTextAlert = "Error Fetching Locations.. Please try again after sometime !!!";
             $timeout(function () {
               $scope.showFailureAlert = false;
              }, 4000);
        });
  };


  $scope.changeSelectedItem = function(){
   console.log($scope.emp.role.role_type);
}

  // For Bulk upload employee Data
   $scope.getImageBinaryDataInEdit = function(){
      var f = document.getElementById('fileImg').files[0],
          r = new FileReader();

      $rootScope.validateImageFileSize(f.size, "EMPLOYEE_IMG");

      r.onloadend = function(e){
        $scope.emp.imageModifiedFlag = true;
        $scope.emp.img = e.target.result;
        $('#fileEmpImg')
          .attr('src', e.target.result)
          .addClass('logo-img');
      };

      $scope.emp.img_type=f.type;
      r.readAsDataURL(f);
    };

   $scope.close = function(action) {
      if (action === 'Cancel') {
        close(null, 500); // close, but give 500ms for bootstrap to animate  
      } else {
        close(null, 500);
      }
  };


  $scope.datePickerIconClicked =   function(){
        $('#datetimepicker4').click();
  }
  

});

// Employee shoe history controller 
app.controller('empHistoryModal', function ($scope, close) {
  console.log('Employee History Modal Controller.');

  $scope.close = function(action) {
     close(null, 500);
  };

});


// Beacon Controller
app.controller('beaconCtrl', function ($scope, $location, $route, $http, $timeout, $filter,  HTTP_HEADERS, FILE_SIZES, API_URI, $rootScope, ModalService) {
  console.log("Beacon Controller reporting for duty.");

  $scope.isValidFile = true;
  $rootScope.$broadcast('routeChange', {}); // For login check purposes -- added security

  $scope.intiBulk = function() {
    $http({
      method: 'GET',
      headers: HTTP_HEADERS,
      url: API_URI + 'assetPath',
      data: $scope.emp,
    }).then(function (result) {
        if(result && result.data && result.data.data && result.data.data.assetUri) {
          $scope.template_assign_link = result.data.data.assetUri + "templates/beacon_assign_template.csv";
          $scope.template_unassign_link = result.data.data.assetUri + "templates/beacon_unassign_template.csv";
          $scope.template_pair_link = result.data.data.assetUri + "templates/beacon_pair_template.csv";
          $scope.template_unpair_link = result.data.data.assetUri + "templates/beacon_unpair_template.csv";
        } else {
          $scope.template_assign_link = "http://storage.googleapis.com/applause-dev-img/templates/beacon_assign_template.csv";
          $scope.template_unassign_link = "http://storage.googleapis.com/applause-dev-img/templates/beacon_unassign_template.csv";
          $scope.template_pair_link =  "http://storage.googleapis.com/applause-dev-img/templates/beacon_pair_template.csv";
          $scope.template_unpair_link =  "http://storage.googleapis.com/applause-dev-img/templates/beacon_unpair_template.csv";
        }
      }, function failure (err) {
         $scope.template_assign_link = "http://storage.googleapis.com/applause-dev-img/templates/beacon_assign_template.csv";
          $scope.template_unassign_link = "http://storage.googleapis.com/applause-dev-img/templates/beacon_unassign_template.csv";
          $scope.template_pair_link =  "http://storage.googleapis.com/applause-dev-img/templates/beacon_pair_template.csv";
          $scope.template_unpair_link =  "http://storage.googleapis.com/applause-dev-img/templates/beacon_unpair_template.csv";
      });
  }

  $scope.showSuccessAlert = false;
  $scope.showFailureAlert = false;
  $scope.lists = {};
  $scope.lists.customersList = [];
  $scope.lists.brandsList = [];
  $scope.lists.locationsList = [];
  $scope.loaded = true;
  var initializing = true;

  $scope.goToCreate = function(bulkActionType) {
    if(!$rootScope.rootCustomer || !$rootScope.rootBrand || !$rootScope.rootLocation) {
      $scope.showCreateModal();
    } else { 
      if(bulkActionType == 1) {
        $location.path("/assignBeaconBulk");
      } else if(bulkActionType == 2) {
        $location.path("/unassignBeaconBulk");
      } else if(bulkActionType == 3) {
        $location.path("/pairBeaconBulk");
      } else if(bulkActionType == 4) {
        $location.path("/unpairBeaconBulk");
      } else {
        //Handle error here
        alert("Invalid Option");
      }
    }
  }

  $scope.goToAssign = function() {
    if(!$rootScope.rootCustomer || !$rootScope.rootBrand || !$rootScope.rootLocation) {
      $scope.showCreateModal();
    } else { 
      $location.path("/beaconAssignIndiviual");
    }
  }


      $scope.showCreateModal = function () {
          ModalService.showModal({
              templateUrl: 'templates/partials/create-modal.html',
              controller: "deleteModalCtrl"
          }).then(function(modal) {
              modal.element.modal();
              modal.scope.modalOptions = {
                  // closeButtonText: 'Cancel',
                  actionButtonText: 'Ok',
                  headerText: 'Warning',
                  bodyText: 'Please select customer, brand and location to perform this action.'
              };
          });
  };
  //grid beacon

  $scope.gridOptions = {
    paginationPageSizes: [20, 30, 50],
    paginationPageSize: 20,
    enableRowSelection: true,
    enableSelectAll: true,
    selectionRowHeaderWidth: 35,
    rowHeight: 50,
    showGridFooter:false,
    enableFiltering: true,
    minRowsToShow : 10,
     
   enableScrollbars: true,
   disableHorizontalScrollbar: true,
   enableHorizontalScrollbar:0,
    virtualizationThreshold: 1000,
    beforeSelectionChange: function (row) {
      if ($scope.gridOptions.selectedItems.length > 10) {
        return false;
      }
      return true;
    }
  };

 
  $scope.gridOptions.columnDefs = [
    {name: 'beaconId',  displayName: 'Beacon Id', headerCellClass: $scope.highlightFilteredHeader ,cellTemplate: '<div class="ui-grid-cell-contents textVerticalAlign">{{row.entity.beaconId}}</div>'},
    {name: 'customer.name', displayName: 'Customer', cellTemplate: '<div class="ui-grid-cell-contents textVerticalAlign">{{row.entity.customer.name}}</div>'},
    {name: 'brand.name', displayName: 'Brand',       cellTemplate: '<div class="ui-grid-cell-contents textVerticalAlign"><img src="{{row.entity.imgToShowInCell}}"  style="width:20%;margin-right:5px;" onerror="this.src=&#39;/assets/brand_default1.png&#39;">{{row.entity.brand.name}}</div>'},
    {name: 'location.lname', displayName: 'Location', cellTemplate: '<div class="ui-grid-cell-contents textVerticalAlign">{{row.entity.location.lname}}</div>'},
    {name: 'employeeId', displayName: 'Employee Id', cellTemplate: "<div class='ui-grid-cell-contents textVerticalAlign'>{{row.entity.employeeId ? row.entity.employeeId : 'Not Paired'}}</div>"},
    {name: 'employee.fullName.full', displayName: 'Employee', cellTemplate: '<div class="ui-grid-cell-contents textVerticalAlign">{{row.entity.employee ? row.entity.employee.fullName.full : "Not Paired"}}</div>'},
    {name: 'status', displayName: 'Status', cellTemplate: '<div class="ui-grid-cell-contents textVerticalAlign">{{row.entity.status}}</div>'},
    {name: 'updatedAt',width:200, displayName: 'Last Modified', cellFilter: 'date:"MM/dd/yyyy @ h:mma Z"', type: 'date', filterCellFiltered: true, cellTemplate: '<div class="ui-grid-cell-contents textVerticalAlign">{{row.entity.updatedAt | date:"MM/dd/yyyy @ h:mma Z"}}</div>'}
  ];

 
  
  $scope.countRows=0;
  // $scope.gridOptions.enableHorizontalScrollbar = 0;
  // $scope.gridOptions.enableVerticalScrollbar = 0;

  

  $scope.gridOptions.onRegisterApi = function(gridApi) {
   $scope.myGridApi = gridApi;
   $scope.gridApi = gridApi;
   gridApi.selection.on.rowSelectionChanged($scope, function(row){ 
    $scope.countRows = $scope.gridApi.selection.getSelectedRows().length;
    });

   gridApi.selection.on.rowSelectionChangedBatch($scope, function(row){ 
        $scope.countRows = $scope.gridApi.selection.getSelectedRows().length;
    });

   $scope.myGridApi.selection.on.rowSelectionChanged($scope,function(row){
        if($scope.myGridApi.selection.getSelectedGridRows().length > 2) {
           row.setSelected(false);
        };
      });
  };


  $scope.getTableStyle= function() {
      var marginHeight = 20; // optional
      var length = $('img:visible').length; // this is unique to my cellTemplate
      return {
          height: (length * $scope.gridOptions.rowHeight + $scope.gridOptions.headerRowHeight + marginHeight ) + "px"
      };
  };
  $scope.checkSelectValues = function(){
        // if($location.path() == '/viewAndSearchBeacon' && $scope.lists.beaconSearchResults.length === 0 &&   $rootScope.rootCustomer === null )
        //   {
        //         $scope.showMessageAlert = true;
        //         $scope.messageTextAlert = "Please select customer to fetch beacons ";

        //   }
          
          if(($location.path() == '/assignBeaconBulk' || $location.path() == '/unassignBeaconBulk')  &&  ( $rootScope.rootCustomer === null ||  $rootScope.rootBrand === null || $rootScope.rootLocation === null   ))
          {
                $scope.showMessageAlert = true;
                $scope.messageTextAlert = "Please select customer, brand and location";
          }
  }
  
  if(($location.path() == '/assignBeaconBulk' || $location.path() == '/unassignBeaconBulk')  &&  ( $rootScope.rootCustomer === null ||  $rootScope.rootBrand === null || $rootScope.rootLocation === null   ))
  {
        $scope.showMessageAlert = true;
        $scope.messageTextAlert = "Please select customer, brand and location";
  }

  $rootScope.$watch('rootCustomer', function (val) {
     $scope.checkSelectValues();

     if($location.path() == '/viewAndSearchBeacon')// && $rootScope.rootCustomer )
      {
        // $timeout(function() {
        if(initializing)
        {
          $timeout(function() { initializing = false; });
        }
        else
        {
          $scope.searchBeacons();
        }
            $scope.showMessageAlert = false;
          // }, 0);
      }

      if($location.path() == '/viewAndSearchBeacon' && $rootScope.rootCustomer === null)
      {
        $scope.gridOptions.data = []; //when select option for rootcustomer is --ALL--
      }
      // if($location.path() == '/viewAndSearchBeacon' &&   $rootScope.rootCustomer === null )
      // {
      //   $scope.showMessageAlert = true;
      //   $scope.messageTextAlert = "Please select customer to fetch beacons ";

      // }
      

  });

  $rootScope.$watch('rootBrand', function (val) {
    $scope.checkSelectValues();
    if(($location.path() == '/assignBeaconBulk' || $location.path() == '/unassignBeaconBulk')  &&   $rootScope.rootCustomer &&   $rootScope.rootCustomer.id &&  $rootScope.rootBrand && $rootScope.rootBrand.id && $rootScope.rootLocation && $rootScope.rootLocation.id)
    {
        $scope.showMessageAlert = false;
        
    }

    if($location.path() == '/viewAndSearchBeacon')// && $rootScope.rootCustomer  && $rootScope.rootCustomer.id && $rootScope.rootBrand  && $rootScope.rootBrand.id)
      {
          //  $scope.checkSelectValues();
        if(initializing)
        {
            $timeout(function() { initializing = false; });
        }
        else
        {
            $scope.searchBeacons();
        }
            $scope.showMessageAlert = false;
          
      }
  });
  $rootScope.$watch('rootLocation', function (val) {
    $scope.checkSelectValues();
    if(($location.path() == '/assignBeaconBulk' || $location.path() == '/unassignBeaconBulk')  &&   $rootScope.rootCustomer &&   $rootScope.rootCustomer.id &&  $rootScope.rootBrand && $rootScope.rootBrand.id && $rootScope.rootLocation && $rootScope.rootLocation.id)
    {
        $scope.showMessageAlert = false;
        
    }

    if($location.path() == '/viewAndSearchBeacon') //&& $rootScope.rootCustomer  && $rootScope.rootCustomer.id && $rootScope.rootBrand  && $rootScope.rootBrand.id && $rootScope.rootLocation  && $rootScope.rootLocation.id)
      {
        
        if(initializing)
        {
          $timeout(function() { initializing = false; });
        }
        else
        {
          $scope.searchBeacons();
        }
        $scope.showMessageAlert = false;
          
      }
  });



  // switch flag
  $scope.switchBool = function (value) {
      $scope[value] = !$scope[value];
  };

  $scope.beacon = {};

   var resetBrandDefaults = function () {
      $scope.beacon.locId = null;
      $scope.empNoFound = [];
      $scope.empBeaconsReAssign = [];
      $scope.beaconsReAssign = [];
      $scope.beaconsDup = [];
      $('#brandSelect').find('option:gt(0)').remove();
      $('#locSelect').find('option:gt(0)').remove();
      $scope.lists.locationsList = [];
      $scope.lists.brandsList = [];
      $('#postErrors').val('');
      $('#beaconCSV').val('');
      $scope.showFailureAlert = false;
      $scope.showSuccessAlert = false;
  };

  var resetLocationDefaults = function () {
      $scope.showFailureAlert = false;
      $scope.showSuccessAlert = false;
      $scope.beacon.locId = null;
      $('#locSelect').find('option:gt(0)').remove();
       $scope.lists.locationsList = [];
      $('#postErrors').val('');
      $('#beaconCSV').val('');
  };

  $scope.getFileBinaryData = function(action){
      var f = document.getElementById('beaconCSV').files[0],
          r = new FileReader();

      
       $scope.$apply(function(){
          $scope.isValidFile = $rootScope.validateFileSize(f.size, "CSV_FILE_SIZE");
        });

      if ($scope.isValidFile) {
        r.onloadend = function(e){
          $scope.beacon.data = e.target.result;
        };

        $scope.beacon.data_type = f.type;
        r.readAsDataURL(f);
      } else {
        document.getElementById('beaconCSV').value = "";
        f= null;
      };
    };

  $scope.postAssignDetails = function (action) {

    $scope.beacon.custId = $rootScope.rootCustomer.id;
    $scope.beacon.brandId = $rootScope.rootBrand.id;
    $scope.beacon.locId = $rootScope.rootLocation.id;

    $http({
      method: 'POST',
      headers: HTTP_HEADERS,
      url: API_URI + 'beacon?qty=bulk&action='+ action,
      data: $scope.beacon,
    }).then(function (result) {
        if (result.data && result.data.code === 0) {
          $scope.bW = result.data.data;
          if (result.data.data && !Object.keys(result.data.data).length) {
            $scope.showSuccessAlert = true;
            $scope.showFailureAlert = false;
            if(action == 'pair') {
              $scope.successTextAlert = "Beacon Pair Successfull.";
            } else {
              $scope.successTextAlert = "Beacon Assignment Successfull.";
            }
          } else {
            var bulkAssignPairErrors = result.data.data;

            $scope.errorsAssign = [];
            for(var obj in bulkAssignPairErrors) {
               var errorObj = {};
              errorObj.lineNo = obj;
              errorObj.errors = [];
              bulkAssignPairErrors[obj].forEach(function(element, index){
                errorObj.errors.push("ColumnName: " + element.columnName + " error: " + element.errorMessage + "\n");
              });
              $scope.errorsAssign.push(errorObj);
            }

            $scope.showSuccessAlert = false;
            $scope.showFailureAlert = true;
            if(action == 'pair') {
              $scope.failureTextAlert = "No Beacons Paired";
            } else {
              $scope.failureTextAlert = "No Beacons Assigned";
            }
          }
        } else {
          $scope.showSuccessAlert = false;
          $scope.showFailureAlert = true;
          $scope.failureTextAlert = result.data.displayMessage;

        };
      }, function failure (err) {
          $scope.showSuccessAlert = false;
          $scope.showFailureAlert = true;
          if (err.data.code) {
             $scope.failureTextAlert = err.data.displayMessage;
   
          } else {
            $scope.failureTextAlert = "Error assigning Beacons.. Please try again after sometime !!!";
       
          };         
      });
  };

  // Un-Assign Beacons Bulk
  $scope.postUnAssignDetails = function (action) {

    $scope.beacon.custId = $rootScope.rootCustomer.id;
    $scope.beacon.brandId = $rootScope.rootBrand.id;
    $scope.beacon.locId = $rootScope.rootLocation.id;

    $http({
      method: 'POST',
      headers: HTTP_HEADERS,
      url: API_URI + 'beacon?qty=bulk&action=' + action,
      data: $scope.beacon,
    }).then(function (result) {
        if (result.data && result.data.code === 0) {
          $scope.beaconsNoFound = result.data.data.beaconsNoFound;
          $scope.beaconsUnAssign = result.data.data.beaconsUnAssign;
          $scope.empNoFound = result.data.data.empNoFound;
          $scope.updateError = result.data.data.updateError;
          if (result.data.data && !Object.keys(result.data.data).length) {
            $scope.showSuccessAlert = true;
            $scope.showFailureAlert = false;
            if(action == 'unpair') {
              $scope.successTextAlert = "Beacon Un-Pair Successfull.";
            } else {
              $scope.successTextAlert = "Beacon Un-Assignment Successfull.";
            }
            $timeout(function () {
              $scope.showSuccessAlert = false;
              //$route.reload();
            }, 4000);
          } else {
            var bulkUnassignUnpairErrors = result.data.data;
            $scope.errorsUnassign = [];
            for(var obj in bulkUnassignUnpairErrors) {
               var errorObj = {};
              errorObj.lineNo = obj;
              errorObj.errors = [];
              bulkUnassignUnpairErrors[obj].forEach(function(element, index){
                errorObj.errors.push("ColumnName: " + element.columnName + " error: " + element.errorMessage);
              });
              $scope.errorsUnassign.push(errorObj);
            }
            $scope.showSuccessAlert = false;
            $scope.showFailureAlert = true;
            if(action == 'unpair') {
              $scope.failureTextAlert = "No Beacons Un-Paired";
            } else {
              $scope.failureTextAlert = "No Beacons Un-Assigned";
            }
       
          }
        } else {
          $scope.showSuccessAlert = false;
          $scope.showFailureAlert = true;
          $scope.failureTextAlert = result.data.displayMessage;

        };
      }, function failure (err) {
          $scope.showSuccessAlert = false;
          $scope.showFailureAlert = true;
          if (err.data.code) {
             $scope.failureTextAlert = err.data.displayMessage;
          } else {
            $scope.failureTextAlert = "Error un-assigning Beacons.. Please try again after sometime !!!";
          };

      });
  };


  /* ---- VIEW AND SEARCH OPERATIONS ---- */
  $scope.lists.searchResults = false;
  $scope.beacon.beaconStatus = null;
  $scope.lists.beaconStatusList = [];
  $scope.lists.beaconSearchResults = [];

  var getStatusList = function () {  // GET status to display in dropdown
    $http({
        method: 'GET',
        headers: HTTP_HEADERS,
        url: API_URI + 'beaconStatus'
      }).then(function (result) {
          if (result.data && result.data.code === 0) {
            if (result.data.data.length > 0) {
                $scope.lists.beaconStatusList = result.data.data;
            };
          } else {
            $scope.showSuccessAlert = false;
            $scope.showFailureAlert = true;
            $scope.failureTextAlert = result.data.displayMessage;
          };
        }, function failure (err) {
            $scope.showSuccessAlert = false;
            $scope.showFailureAlert = true;
            $scope.failureTextAlert = "Error Fetching Locations.. Please try again after sometime !!!";
        });
  };

  $scope.$watch('lists.customersList', function (val) {
              $timeout(function () {
                   getStatusList();
              }, 2000);
  });

  var formQueryString = function (beaconData) {
    var beaconObj = {};
    var abc = null;
    beaconData.custId ? beaconObj.custId = beaconData.custId.id : abc= null;
    beaconData.locId ? beaconObj.locId = beaconData.locId.id : abc= null;
    beaconData.brandId ? beaconObj.brandId = beaconData.brandId.id : abc= null;
    beaconData.beaconStatus ? beaconObj.beaconStatus = beaconData.beaconStatus : abc= null;

    var queryString = "";
    for (var key in beaconObj) {
      if (!queryString) {
        queryString = queryString + "?";
      } else {
        queryString = queryString + "&";
      }
      queryString = queryString + key + "=" + beaconObj[key];
    };

    return queryString;
  };

  // Search beacons based upon selections
  $scope.searchBeacons = function (beaconData) {
    $scope.beacon = {};
    if($rootScope.rootCustomer && $rootScope.rootCustomer.id) {
      $scope.beacon.custId = $rootScope.rootCustomer;
    }

    if($rootScope.rootBrand && $rootScope.rootBrand.id) {
      $scope.beacon.brandId = $rootScope.rootBrand;
    }

    if($rootScope.rootLocation && $rootScope.rootLocation.id) {
      $scope.beacon.locId = $rootScope.rootLocation;
    }
    
    var queryString = formQueryString($scope.beacon);
    queryString = queryString ? queryString + "&page=viewAndSearch" : queryString + "?page=viewAndSearch";


    
    $scope.loaded = false; //loader on while fetching details 
    $scope.showSuccessAlert = false;
    $http({
        method: 'GET',
        headers: HTTP_HEADERS,
        url: API_URI + 'beacon' + (queryString ? queryString : "")
      }).then(function (result) {
          if (result.data && result.data.code === 0) {
            if (result.data.data.length > 0) {
                $scope.lists.searchResults = true;
                $scope.lists.beaconSearchResults = result.data.data;
                // $scope.successTextAlert = result.data.displayMessage;    
                // $scope.showSuccessAlert = true;
                $scope.loaded = true; //loader off after details fetched
                $scope.showFailureAlert = false;
                //assigning data to grid beacon

                // $scope.gridOptions.data = result.data.data;
                //sorting it asc by name and then setting it to grid
                $scope.gridOptions.data = $filter('orderBy')($scope.lists.beaconSearchResults, "customer.name", false);

                $scope.gridOptions.data.forEach(function(element, index){
                  element.imgToShowInCell = element.brand.logoImgUrl;
                });

                  $scope.gridOptions.enableVerticalScrollbar = 0;

            };
          } else {
            $scope.loaded = true; //loader off after details fetched
            $scope.lists.searchResults = false;
            $scope.showSuccessAlert = false;
            $scope.failureTextAlert = result.data.displayMessage;
            $scope.showFailureAlert = true;
            $scope.gridOptions.data = []; //when response is not available, table reset to blank
          };
        }, function failure (err) {
            $scope.loaded = true; //loader off after details fetched
            $scope.showSuccessAlert = false;
            $scope.lists.searchResults = false;
            $scope.showFailureAlert = true;
            $scope.failureTextAlert = "Error searching beacons.. Please try again after sometime !!!";
            $scope.gridOptions.data = []; //if any error in calling api, table reset to blank
        });
  };

  $scope.$watch('gridOptions.data', function (val) {
      $scope.countRows = 0;
  });

  /* ---- Assign Indiviual Beacon Operations ---- */
  $scope.lists.searchBeaconResults = false;
  $scope.lists.searchEmpResults = false;
  $scope.lists.beaconSearchResults = [];
  $scope.lists.empSearchResults = [];

  $scope.searchEmployeeAndBeacons = function (beaconData) {
    if($rootScope.rootCustomer && $rootScope.rootCustomer.id) {
      $scope.beacon.custId = $rootScope.rootCustomer;
    }
    if($rootScope.rootBrand && $rootScope.rootBrand.id) {
      $scope.beacon.brandId = $rootScope.rootBrand;
    }
    if($rootScope.rootLocation && $rootScope.rootLocation.id) {
      $scope.beacon.locId = $rootScope.rootLocation;
    }

    var queryString = formQueryString($scope.beacon) || "";
    queryString = queryString ? queryString + "&page=assignIndiviual" : queryString + "?page=assignIndiviual";
    queryString = $scope.beacon.empData ? queryString + "&empData=" +  $scope.beacon.empData : queryString;
    queryString = $scope.beacon.beaconId ? queryString + "&beaconId=" +  $scope.beacon.beaconId : queryString;
    queryString = $scope.beacon.beaconId ? queryString + "&operator=lastcharslike" : queryString;
    $http({
        method: 'GET',
        headers: HTTP_HEADERS,
        url: API_URI + 'beacon' + (queryString ? queryString : "")
      }).then(function (result) {
          if (result.data && result.data.code === 0) {
            // Beacon results 
            if (result.data.data && result.data.data.beaconDocs.length < 1) {
                $scope.lists.searchBeaconResults = false;
                $scope.lists.beaconSearchResults = result.data.data.beaconDocs;
                $scope.showFailureAlert = true;
                $scope.showSuccessAlert = false;
                $scope.failureTextAlert = "No Beacons Data Found";    
            } else if (result.data.data.beaconDocs.length > 1) {
                $scope.lists.searchBeaconResults = false;
                $scope.lists.beaconSearchResults = result.data.data.beaconDocs;
                $scope.showFailureAlert = true;
                $scope.showSuccessAlert = false;
                $scope.failureTextAlert = "More than One Beacons found... Please input exact Beacon Id to continue !!!";    
            }else if (result.data.data.beaconDocs.length === 1) {
                $scope.lists.searchBeaconResults = true;
                $scope.lists.beaconSearchResults = result.data.data.beaconDocs;
                $scope.showFailureAlert = false;
                $scope.lists.showButton = true;
                //$scope.showSuccessAlert = true;
                $scope.successTextAlert = "Beacon search successfully !!!";    
            };


            // Employee Search Manipulations
            if (result.data.data && result.data.data.empDocs.length < 1) {
                $scope.lists.searchEmpResults = false;
                $scope.lists.empSearchResults = result.data.data.empDocs;
                $scope.showFailureAlert = true;
                $scope.showSuccessAlert = false;
                $scope.failureTextAlert = "No Employees Data Found";    
            } else if (result.data.data.empDocs.length > 1) {
                $scope.lists.searchEmpResults = false;
                $scope.lists.empSearchResults = result.data.data.empDocs;
                $scope.showFailureAlert = true;
                $scope.showSuccessAlert = false;
                $scope.failureTextAlert = "More than One Employee found... Please input exact Employee Id / Name to continue !!!";    
            }else if (result.data.data.empDocs.length === 1) {
                $scope.lists.searchEmpResults = true;
                $scope.lists.empSearchResults = result.data.data.empDocs;
                //$scope.showSuccessAlert = true;
                $scope.lists.showButton = true;
                $scope.successTextAlert = "Employee search successfully !!!";    
            };
          } else {
            $scope.showSuccessAlert = false;
            $scope.showFailureAlert = true;
            $scope.failureTextAlert = result.data.displayMessage;
            
          };
        }, function failure (err) {
            $scope.showSuccessAlert = false;
            $scope.showFailureAlert = true;
            $scope.failureTextAlert = "Error searching... Please try again after sometime !!!";
        });
    };

      // Assign Beacon Indiviual
      $scope.assignIndiviualBeacon = function (empUnidId, empId, beaconId) {
        var beaconObj = {};
        beaconObj.empUnidId = empUnidId;
        beaconObj.empId = empId;
        beaconObj.beaconId = beaconId;

      $http({
        method: 'PUT',
        headers: HTTP_HEADERS,
        url: API_URI + 'beacon',
        data: beaconObj
      }).then(function (result) {
          if (result.data && result.data.code === 0) {
            $scope.showSuccessAlert = true;
            $scope.lists.showButton = false;
            $scope.successTextAlert = "Beacon and Employee successfully paired !!!"
            $('#empStatus').text("Assigned to Beacon ("+result.data.data.beaconId+")");
            $('#beaconStatus').text("Assigned to employee " + result.data.data.employee.fullName.full);
          } else {
            $scope.showSuccessAlert = false;
            $scope.showFailureAlert = true;
            $scope.failureTextAlert = result.data.displayMessage;
          };
        }, function failure (err) {
            $scope.showSuccessAlert = false;
            $scope.showFailureAlert = true;
            $scope.failureTextAlert = "Error searching beacons.. Please try again after sometime !!!";
        });
    };

    $scope.showUnpairAssignModal = function(actionInd) {
      var isLocationSelected = false;
      // Delete modal
      ModalService.showModal({
          templateUrl: 'templates/partials/delete-modal.html',
          controller: "deleteModalCtrl"
      }).then(function(modal) {
          modal.element.modal();
          modal.scope.modalOptions = {
              closeButtonText: 'Cancel',
              headerText: 'Confirm'
          };

          if($rootScope.rootLocation) {
            modal.scope.modalOptions.actionButtonText = 'Yes';
            isLocationSelected = true;
             modal.scope.modalOptions.bodyText = 'Are you sure you want to '+ actionInd +' ' + $scope.myGridApi.selection.getSelectedRows().length + ' beacon(s)?';
          } else {
            modal.scope.modalOptions.actionButtonText = 'Ok';
            modal.scope.modalOptions.bodyText = 'Please select customer, brand and location to perform this operation.';
          }


          modal.close.then(function(action) {
              $('.modal-backdrop').remove();
              if (action === 'YES') {
                if($rootScope.rootLocation) {
                  var beaconIdsArray = [];
                  $scope.myGridApi.selection.getSelectedRows().forEach(function(element, index) {
                     beaconIdsArray.push(element.beaconId);
                    });
                  $scope.postIndAction(actionInd, beaconIdsArray);
                }
                }
              });

    });
  }

  $scope.postIndAction = function(action, beaconIdsArray) {

    $scope.beacon.custId = $rootScope.rootCustomer.id;
    $scope.beacon.brandId = $rootScope.rootBrand.id;
    $scope.beacon.locId = $rootScope.rootLocation.id;
    if(action !== "assign") {
      $scope.beacon.beaconIdsArray = beaconIdsArray;
    }

    $http({
      method: 'POST',
      headers: HTTP_HEADERS,
      url: API_URI + 'beacon?action=' + action,
      data: $scope.beacon,
    }).then(function (result) {
        if (result.data && result.data.code === 0) {
          var beaconWarnings = result.data.data;
          if (result.data.data.updatedBeacons && result.data.data.updatedBeacons.length > 0) {
            $scope.showSuccessAlert = true;
            $scope.showFailureAlert = false;
            if(action == 'unpair') {
              $scope.successTextAlert = "Beacon Un-Pair Successfull with -";
              if(beaconWarnings.updatedBeacons.length) {
                $scope.successTextAlert = $scope.successTextAlert + "\n" + beaconWarnings.updatedBeacons.length + " success.";
              }
              if(beaconWarnings.beaconsNoFound.length) {
                $scope.successTextAlert = $scope.successTextAlert + "\n" + beaconWarnings.beaconsNoFound.length + " beacons not found."
              }
              if(beaconWarnings.beaconsUnAssign.length) {
                $scope.successTextAlert = $scope.successTextAlert + "\n" + beaconWarnings.beaconsUnAssign.length + " already unpaired."
              }
              if(beaconWarnings.empNoFound.length) {
                $scope.successTextAlert = $scope.successTextAlert + "\n" + beaconWarnings.empNoFound.length + " employees not found."
              }
              if(beaconWarnings.updateError.length) {
                $scope.successTextAlert = $scope.successTextAlert + "\n" + beaconWarnings.updateError.length + " update errors."
              }
            } else {
              var totalError = 0;
              totalError = beaconWarnings.beaconsNoFound.length + beaconWarnings.empUpdateError.length + beaconWarnings.beaconRemoveError.length;
              totalSuccess = beaconWarnings.updatedBeacons.length;
              $scope.successTextAlert = "Beacon Un-Assignment Successfull";
              if(totalSuccess) {
                $scope.successTextAlert = $scope.successTextAlert + " with " + totalSuccess + " unassigned.";
              }
              if(totalError) {
                $scope.successTextAlert = $scope.successTextAlert + " And " + totalError + " errors.";
              }
            }
            $timeout(function () {
              $scope.showSuccessAlert = false;
              $scope.searchBeacons(null);
            }, 4000);
          } else {
            $scope.showSuccessAlert = false;
            $scope.showFailureAlert = true;
            if(action == 'unpair') {
              $scope.failureTextAlert = "No Beacons Un-Paired with -";
              if(beaconWarnings.beaconsNoFound.length) {
                $scope.failureTextAlert = $scope.failureTextAlert + "\n" + beaconWarnings.beaconsNoFound.length + " beacons not found."
              }
              if(beaconWarnings.beaconsUnAssign.length) {
                $scope.failureTextAlert = $scope.failureTextAlert + "\n" + beaconWarnings.beaconsUnAssign.length + " already unpaired."
              }
              if(beaconWarnings.empNoFound.length) {
                $scope.failureTextAlert = $scope.failureTextAlert + "\n" + beaconWarnings.empNoFound.length + " employees not found."
              }
              if(beaconWarnings.updateError.length) {
                $scope.failureTextAlert = $scope.failureTextAlert + "\n" + beaconWarnings.updateError.length + " update errors."
              }
            } else {
              $scope.failureTextAlert = "No Beacons Un-Assigned";
            }
       
          }
        } else {
          $scope.showSuccessAlert = false;
          $scope.showFailureAlert = true;
          $scope.failureTextAlert = result.data.displayMessage;

        };
      }, function failure (err) {
          $scope.showSuccessAlert = false;
          $scope.showFailureAlert = true;
          if (err.data.code) {
             $scope.failureTextAlert = err.data.displayMessage;
          } else {
            $scope.failureTextAlert = "Error un-assigning Beacons.. Please try again after sometime !!!";
          };

      });    

  }






});


// applause task controller
app.controller('taskCtrl', function ($scope, $location, $route, $timeout, $http, $rootScope, API_URI, HTTP_HEADERS, ModalService) {
  console.log("Task Controller reporting for duty.");
  
  $rootScope.$broadcast('routeChange', {}); // For login check purposes -- added security

  $scope.showSuccessAlert = false;
  $scope.showFailureAlert = false;

  // switch flag
  $scope.switchBool = function (value) {
      $scope[value] = !$scope[value];
  };

  $scope.resetMessages = function () {
    $scope.showSuccessAlert = false;
    $scope.showFailureAlert = false;
  };

      $scope.populateUpdate = function(updateType) {
        // Fetch all static contents first to populate update
         if($rootScope.staticContent == null || $rootScope.staticContent == undefined) {
          $http({
              method: 'GET',
              headers: HTTP_HEADERS,
              url: API_URI + 'staticContent'
            }).then(function (result) {
                if (result.data && result.data.code === 0) {
                  $rootScope.staticContent = {};
                  result.data.data.forEach(function(element, index) {
                    $rootScope.staticContent[element.type] = element;
                  }); 
                   $scope[updateType] = $rootScope.staticContent[updateType].description;
                } else {
                  $scope.showSuccessAlert = false;
                  $scope.showFailureAlert = true;
                  $scope.failureTextAlert = result.data.displayMessage;
                  $timeout(function () {
                      $scope.showFailureAlert = false;
                    }, 4000);
                };
              }, function failure (err) {
                  $scope.showSuccessAlert = false;
                  $scope.showFailureAlert = true;
                  $scope.failureTextAlert = "Error Fetching static content.. Please try again after sometime !!!";
                  $timeout(function () {
                     $scope.showFailureAlert = false;
                    }, 4000);
              });
        } else {
            $scope[updateType] = $rootScope.staticContent[updateType].description;
        }

      //  $scope[updateType] = $rootScope[updateType].description;

      }

  // Update contact us
      $scope.updateContactUs = function (contactDetails) {
        contentDetails = {};
        contentDetails.type = "contactUs";
        contentDetails.contactDetails = contactDetails;

      $http({
        method: 'PUT',
        headers: HTTP_HEADERS,
        url: API_URI + 'staticContent',
        data: contentDetails
      }).then(function (result) {
            $scope.contactDetailsForm = {};
            $scope.contactDetails = {};

          if (result.data && result.data.code === 0) {
            $scope.showSuccessAlert = true;
           // $scope.lists.showButton = false;
            $scope.successTextAlert = result.data.displayMessage;
          } else {
            $scope.showSuccessAlert = false;
            $scope.showFailureAlert = true;
            $scope.failureTextAlert = result.data.displayMessage;
          };
        }, function failure (err) {
            $scope.showSuccessAlert = false;
            $scope.showFailureAlert = true;
            $scope.failureTextAlert = "Error updating contact details.. Please try again after sometime !!!";
        });
    };

    // Update About us
      $scope.updateAboutUs = function (aboutUs) {
        contentDetails = {};
        contentDetails.type = "aboutUs";
        contentDetails.aboutUsText = aboutUs.aboutUsText;

      $http({
        method: 'PUT',
        headers: HTTP_HEADERS,
        url: API_URI + 'staticContent',
        data: contentDetails
      }).then(function (result) {
          if (result.data && result.data.code === 0) {
            $scope.showSuccessAlert = true;
           // $scope.lists.showButton = false;
            $scope.successTextAlert = result.data.displayMessage;
          } else {
            $scope.showSuccessAlert = false;
            $scope.showFailureAlert = true;
            $scope.failureTextAlert = result.data.displayMessage;
          };
        }, function failure (err) {
            $scope.showSuccessAlert = false;
            $scope.showFailureAlert = true;
            $scope.failureTextAlert = "Error updating About Us.. Please try again after sometime !!!";
        });
    };

    // Update Terms And Conditions
      $scope.updateTerms = function (terms) {
        contentDetails = {};
        contentDetails.type = "termsConditions";
        contentDetails.termsConditionsText = terms.termsConditionsText;

      $http({
        method: 'PUT',
        headers: HTTP_HEADERS,
        url: API_URI + 'staticContent',
        data: contentDetails
      }).then(function (result) {
          if (result.data && result.data.code === 0) {
            $scope.showSuccessAlert = true;
           // $scope.lists.showButton = false;
            $scope.successTextAlert = result.data.displayMessage;
          } else {
            $scope.showSuccessAlert = false;
            $scope.showFailureAlert = true;
            $scope.failureTextAlert = result.data.displayMessage;
          };
        }, function failure (err) {
            $scope.showSuccessAlert = false;
            $scope.showFailureAlert = true;
            $scope.failureTextAlert = "Error updating terms and condition.. Please try again after sometime !!!";
        });
    };

    // Update Privacy Policy
      $scope.updatePrivacyPolicy = function (policy) {
        contentDetails = {};
        contentDetails.type = "privacyPolicy";
        contentDetails.privacyPolicyText = policy.privacyPolicyText;

      $http({
        method: 'PUT',
        headers: HTTP_HEADERS,
        url: API_URI + 'staticContent',
        data: contentDetails
      }).then(function (result) {
          if (result.data && result.data.code === 0) {
            $scope.showSuccessAlert = true;
           // $scope.lists.showButton = false;
            $scope.successTextAlert = result.data.displayMessage;
          } else {
            $scope.showSuccessAlert = false;
            $scope.showFailureAlert = true;
            $scope.failureTextAlert = result.data.displayMessage;
          };
        }, function failure (err) {
            $scope.showSuccessAlert = false;
            $scope.showFailureAlert = true;
            $scope.failureTextAlert = "Error updating Privacy Policy.. Please try again after sometime !!!";
        });
    };


});

//User controller
app.controller('userCtrl', function ($scope, $location, $route, $timeout, $http, $rootScope, API_URI, HTTP_HEADERS, FILE_SIZES, ModalService) {
  console.log("User Controller reporting for duty.");
  
  $scope.isValidFile = true;
  $rootScope.$broadcast('routeChange', {}); // For login check purposes -- added security

  $scope.showSuccessAlert = false;
  $scope.showFailureAlert = false;

  // switch flag
  $scope.switchBool = function (value) {
      $scope[value] = !$scope[value];
  };

  $scope.resetMessages = function () {
    $scope.showSuccessAlert = false;
    $scope.showFailureAlert = false;
  };

   $scope.gridOptions = {
    paginationPageSizes: [20, 30, 50],
    paginationPageSize: 20,
    enableRowSelection: true,
    enableSelectAll: true,
    selectionRowHeaderWidth: 35,
    rowHeight: 50,
    showGridFooter:false,
    enableFiltering: true,
    minRowsToShow : 10,
    enableHorizontalScrollbar: 1,//value 0 is never , 1 is always and 2 is when needed 
    enableVerticalScrollbar : 1,//value 0 is never , 1 is always and 2 is when needed
    virtualizationThreshold: 1000,
    beforeSelectionChange: function (row) {
      if ($scope.gridOptions.selectedItems.length > 10) {
        return false;
      }
      return true;
    }
  };

 
  $scope.gridOptions.columnDefs = [
    {name: 'personalInfo.fullName', displayName: 'Name', headerCellClass: $scope.highlightFilteredHeader ,cellTemplate: '<div class="ui-grid-cell-contents textVerticalAlign">{{row.entity.personalInfo.fullName}}</div>'},
    {name: 'email',  displayName: 'Email', cellTemplate: '<div class="ui-grid-cell-contents textVerticalAlign list-v-email">{{row.entity.email}}</div>'},
    {name: 'phoneNo',  displayName: 'Mobile Phone',       cellTemplate: '<div class="ui-grid-cell-contents textVerticalAlign">{{row.entity.phoneNo}}</div>'},
    {name: 'createdAt',  displayName: 'Registration Date', cellFilter: 'date:"MM/dd/yyyy"', type: 'date', filterCellFiltered: true, cellTemplate: '<div class="ui-grid-cell-contents textVerticalAlign">{{row.entity.createdAt | date:"MM/dd/yyyy"}}</div>'},
    {name: 'role_id.roleName',  displayName: 'Applause Role', cellTemplate: '<div class="ui-grid-cell-contents textVerticalAlign">{{row.entity.role_id.roleName}}</div>'},
    {name: 'verified',  displayName: 'User Verified', cellTemplate: '<div class="ui-grid-cell-contents textVerticalAlign">{{row.entity.verified}}</div>'}
  ];

 
  $scope.gridOptions.enableVerticalScrollbar = 0;
  $scope.countRows=0;
  
  

  $scope.gridOptions.onRegisterApi = function(gridApi) {
   $scope.myGridApi = gridApi;
   $scope.gridApi = gridApi;
   gridApi.selection.on.rowSelectionChanged($scope, function(row){ 
    $scope.countRows = $scope.gridApi.selection.getSelectedRows().length;
    });

   gridApi.selection.on.rowSelectionChangedBatch($scope, function(row){ 
        $scope.countRows = $scope.gridApi.selection.getSelectedRows().length;
    });


   gridApi.core.on.filterChanged( $scope, function() {
      gridApi.selection.clearSelectedRows();
    });

   // $scope.myGridApi.selection.on.rowSelectionChanged($scope,function(row){
   //      if($scope.myGridApi.selection.getSelectedGridRows().length > 2) {
   //         row.setSelected(false);
   //      };
   //    });
  };


  $scope.getTableStyle= function() {
      var marginHeight = 20; // optional
      var length = $('img:visible').length; // this is unique to my cellTemplate
      return {
          height: (length * $scope.gridOptions.rowHeight + $scope.gridOptions.headerRowHeight + marginHeight ) + "px"
      };
  };

  $scope.getAllUsers = function () {
    $http({
        method: 'GET',
        headers: HTTP_HEADERS,
        url: API_URI + 'users'
      }).then(function (result) {
          if (result.data && result.data.code === 0) {
            // $scope.showSuccessAlert = true;
            // $scope.successTextAlert = result.data.displayMessage;
            $scope.gridOptions.data = result.data.data;
            $scope.gridOptions.data.forEach(function(element, index){
              if(element.emailVerified || element.phoneNoVerified) {
                element.verified = "Yes";
              } else {
                element.verified = "No";
              }
            });
          } else {
            $scope.showSuccessAlert = false;
            $scope.showFailureAlert = true;
            $scope.failureTextAlert = result.data.displayMessage;
          };
        }, function failure (err) {
            $scope.showSuccessAlert = false;
            $scope.showFailureAlert = true;
            $scope.failureTextAlert = "Error fetching users. Please try again after sometime.";
        });
  };
  $scope.getTableStyle= function() {
      var marginHeight = 20; // optional
      var length = $('img:visible').length; // this is unique to my cellTemplate
      return {
          height: (length * $scope.gridOptions.rowHeight + $scope.gridOptions.headerRowHeight + marginHeight ) + "px"
      };
  };
       /* ---- Delete  CUSTOMER OPERATIONS ---- */
  $scope.showDelModal = function () {
      // var rowId = rowIndex;
      // var data = row.res;
      $scope.deleteArray = [];
      $scope.myGridApi.selection.getSelectedRows().forEach(function(element, index) {
        $scope.deleteArray.push(element.id);
      });
      // Delete modal
      ModalService.showModal({
          templateUrl: 'templates/partials/delete-modal.html',
          controller: "deleteModalCtrl"
      }).then(function(modal) {
          modal.element.modal();
          modal.scope.modalOptions = {
              closeButtonText: 'Cancel',
              actionButtonText: 'Yes',
              headerText: 'Confirm',
              bodyText: 'Are you sure you want to delete "' + $scope.deleteArray.length + '" user(s)?'
          };

              var usersSelected = [];
              var usersSelectedCount = $scope.myGridApi.selection.getSelectedRows().length;
              usersSelected = $scope.myGridApi.selection.getSelectedRows();
              if(usersSelectedCount === 1) {
                modal.scope.modalOptions.bodyText = 'Are you sure you want to delete the Employee "'+ usersSelected[0].personalInfo.fullName +'"?';
              }
              else 
                if(usersSelectedCount === 2) {
                  modal.scope.modalOptions.bodyText = 'Are you sure you want to delete the Employees "'+ usersSelected[0].personalInfo.fullName +'" and "'+ usersSelected[1].personalInfo.fullName +'"?';
              }
              else
                if(usersSelectedCount === 3) {
                  modal.scope.modalOptions.bodyText = 'Are you sure you want to delete the Employees "'+ usersSelected[0].personalInfo.fullName +'" , "'+ usersSelected[1].personalInfo.fullName +'" and '+usersSelected[2].personalInfo.fullName+'"?';
              }
              else
              {
                if(usersSelectedCount !== 0)
                  modal.scope.modalOptions.bodyText = 'Are you sure you want to delete the Employees "'+ usersSelected[0].personalInfo.fullName +'" , "'+ usersSelected[1].personalInfo.fullName +'" and '+(usersSelectedCount-2)+' others?';
              }






          modal.close.then(function(action) {
              $('.modal-backdrop').remove();
              if (action === 'YES') {
                delUsers();
              };
          });
      });
  };

  var delUsers = function () {
    var delUsers = {};
    delUsers.userIds = $scope.deleteArray;
    var time = new Date().getTime();
    $http({
          method: 'DELETE',
          headers: HTTP_HEADERS,
          url: API_URI + 'users',
          data: delUsers
        }).then(function (result) {
            if(result.data.code == 0) {
              //$("#empTable")[0].rows[rowId+1].remove();
              $scope.showFailureAlert = false;
              $scope.showSuccessAlert = true;
              $scope.successTextAlert = result.data.displayMessage;
               $timeout(function () {
                $route.reload();
              }, 0);

            } else {
              $scope.showFailureAlert = true;
              $scope.showSuccessAlert = false;
              $scope.failureTextAlert = result.data.displayMessage;
            }
          }, function failure (err) {
              $scope.showSuccessAlert = false;
              $scope.showFailureAlert = true;
              $scope.failureTextAlert = "Error deleting Users.. Please try again after sometime !!!";
          });
  };
});

app.controller('interactionCtrl', function ($scope, $location, $route, $timeout, $http, $rootScope, API_URI, HTTP_HEADERS, ModalService) {
  console.log("Interaction Controller reporting for duty.");
  
  $rootScope.$broadcast('routeChange', {}); // For login check purposes -- added security

  $scope.isValidFile = true;
  $scope.showSuccessAlert = false;
  $scope.showFailureAlert = false;

  // switch flag
  $scope.switchBool = function (value) {
      $scope[value] = !$scope[value];
  };

  $scope.resetMessages = function () {
    $scope.showSuccessAlert = false;
    $scope.showFailureAlert = false;
  };

    $scope.gridOptions = {
    paginationPageSizes: [20, 30, 50],
    paginationPageSize: 20,
    enableRowSelection: true,
    enableSelectAll: true,
    selectionRowHeaderWidth: 35,
    rowHeight: 50,
    showGridFooter:false,
    enableFiltering: true,
    minRowsToShow : 10,
     
   enableScrollbars: true,
   disableHorizontalScrollbar: true,
    virtualizationThreshold: 1000,
    beforeSelectionChange: function (row) {
      if ($scope.gridOptions.selectedItems.length > 10) {
        return false;
      }
      return true;
    }
  };

 
  $scope.gridOptions.columnDefs = [
    {name: 'beaconId', width:200, displayName: 'Beacon Id', headerCellClass: $scope.highlightFilteredHeader ,cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.beaconId}}</div>'},
    {name: 'rssi',width:100, displayName: 'rssi', cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.rssi}}</div>'},
    {name: 'enteredDate', displayName: 'Enter Date',       cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.enteredDate | date:"MM/dd/yyyy @ h:mma Z"}}</div>'},
    {name: 'exitDate', displayName: 'Exit Date', cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.exitDate | date:"MM/dd/yyyy @ h:mma Z"}}</div>'}
  ];

 
  
  $scope.countRows=0;
  $scope.gridOptions.enableHorizontalScrollbar = 0;
  $scope.gridOptions.enableVerticalScrollbar = 0;

  

  $scope.gridOptions.onRegisterApi = function(gridApi) {
   $scope.myGridApi = gridApi;
   $scope.gridApi = gridApi;
   gridApi.selection.on.rowSelectionChanged($scope, function(row){ 
    $scope.countRows = $scope.gridApi.selection.getSelectedRows().length;
    });

   gridApi.selection.on.rowSelectionChangedBatch($scope, function(row){ 
        $scope.countRows = $scope.gridApi.selection.getSelectedRows().length;
    });

   $scope.myGridApi.selection.on.rowSelectionChanged($scope,function(row){
        if($scope.myGridApi.selection.getSelectedGridRows().length > 2) {
           row.setSelected(false);
        };
      });
  };


  $scope.getTableStyle= function() {
      var marginHeight = 20; // optional
      var length = $('img:visible').length; // this is unique to my cellTemplate
      return {
          height: (length * $scope.gridOptions.rowHeight + $scope.gridOptions.headerRowHeight + marginHeight ) + "px"
      };
  };

  $scope.getInteractions = function () {
    $http({
        method: 'GET',
        headers: HTTP_HEADERS,
        url: API_URI + 'interaction?today=1'
      }).then(function (result) {
          if (result.data && result.data.code === 0) {
            // $scope.showSuccessAlert = true;
            // $scope.successTextAlert = result.data.displayMessage;
            $scope.gridOptions.data = result.data.data.interactions;
          } else {
            $scope.showSuccessAlert = false;
            $scope.showFailureAlert = true;
            $scope.failureTextAlert = result.data.displayMessage;
          };
        }, function failure (err) {
            $scope.showSuccessAlert = false;
            $scope.showFailureAlert = true;
            $scope.failureTextAlert = "Error fetching users. Please try again after sometime.";
        });
  };
  $scope.getTableStyle= function() {
      var marginHeight = 20; // optional
      var length = $('img:visible').length; // this is unique to my cellTemplate
      return {
          height: (length * $scope.gridOptions.rowHeight + $scope.gridOptions.headerRowHeight + marginHeight ) + "px"
      };
  };
});

//Get image list controller 
app.controller('genlistCtrl', function ($scope, $location, $route, $timeout, $http, $rootScope, API_URI, HTTP_HEADERS, ModalService) {
  $scope.showSuccessAlert = false;
  $scope.showFailureAlert = false;
  console.log("Generatelist Controller reporting for duty.");


  $scope.submitList = function () {

    $http({
          method: 'POST',
          headers: HTTP_HEADERS,
          url: API_URI + 'generatelist',
          data: {status:"ajax"},
        }).then(function (result) {
         
            
            if (result.data ) {
             
             $scope.showSuccessAlert = true;
              $scope.successTextAlert = result.data.displayMessage;
              
            }
          });
 
  };
});

/**
 * Controls all other Pages
 */
app.controller('PageCtrl', function ($scope, $location, $http) {
  console.log("Page Controller reporting for duty.");
});
