define({ "api": [
  {
    "type": "get",
    "url": "/brand",
    "title": "Retrieve brands",
    "sampleRequest": [
      {
        "url": "http://test.github.com/some_path/"
      },
      {
        "url": "http://test.github.com/some_path1/"
      }
    ],
    "description": "<p>This api retrieves brands. It is used to get the details of brands based on parameters provided. If no parameter is provided it returns all brands. If brand id is provided it retrieves specific brand with that brand id. If customer id is provided it returns all brands belonging to that customer.</p>",
    "name": "GetBrands",
    "group": "Brands",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>user jwt authorization header</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<ul> <li></li> </ul>",
            "optional": false,
            "field": "no-param",
            "description": "<p>retrieve all brands.<br> eg - https://applause-dev.appspot.com/api/v1/brand</p>"
          },
          {
            "group": "Parameter",
            "type": "api-parameter",
            "optional": false,
            "field": "/:brandId",
            "description": "<p>retrieve brand based on brand id.<br> eg - https://applause-dev.appspot.com/api/v1/brand/42ffffwrwer2344</p>"
          },
          {
            "group": "Parameter",
            "type": "query-parameter",
            "optional": false,
            "field": "custId",
            "description": "<p>retrieve brand based on brand id.<br> eg - https://applause-dev.appspot.com/api/v1/brand/?custId=42fffgtevgjhj44</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": " \t{\n\t  \"code\": 0,\n\t  \"errorMessage\": \"\",\n\t  \"displayMessage\": \"Brand details fetched successfully.\",\n\t  \"data\": [\n\t    {\n\t      \"_id\": \"58be7c2ff468391000c13a4e\",\n\t      \"bid\": 157,\n\t      \"name\": \"Applebee's\",\n\t      \"ratingImgId\": \"57d9640125c8c3b8087b4386\",\n\t      \"brandType\": {\n\t        \"updatedAt\": \"2016-10-21T09:08:28.258Z\",\n\t        \"createdAt\": \"2016-10-21T09:08:28.258Z\",\n\t        \"isDeleted\": 0,\n\t        \"isActive\": 1,\n\t        \"feedbackReasonsLocation\": [\n\t          \"Food\",\n\t          \"Beverages\",\n\t          \"Service\",\n\t          \"Cleanliness\",\n\t          \"Design/Decor or Ambiance\",\n\t          \"Noise level\",\n\t          \"Other\"\n\t        ],\n\t        \"feedbackReasonsEmployee\": [\n\t          \"Speed Of Service\",\n\t          \"Communication\",\n\t          \"Knowledge\",\n\t          \"Attention to Details\",\n\t          \"Courtesy\",\n\t          \"Other\"\n\t        ],\n\t        \"brandType\": \"Restaurant\",\n\t        \"id\": \"5809db0cf24ab2600dbb3714\"\n\t      },\n\t      \"customer\": {\n\t        \"_id\": \"58be7aaff468391000c13a46\",\n\t        \"name\": \"Dine Equity, Inc.\",\n\t        \"id\": \"58be7aaff468391000c13a46\"\n\t      },\n\t      \"locations\": [\n\t        {\n\t          \"id\": \"58be8275f468391000c13a6b\",\n\t          \"lid\": 183\n\t        },\n\t        {\n\t          \"id\": \"58be8297f468391000c13a6c\",\n\t          \"lid\": 184\n\t        }\n\t      ],\n\t      \"roles\": [\n\t        {\n\t          \"_id\": \"58d8fcff3d72ed901a82baee\",\n\t          \"role_type\": \"Manager\",\n\t          \"brandId\": \"58be7c2ff468391000c13a4e\",\n\t          \"updatedAt\": \"2017-03-27T11:52:31.676Z\",\n\t          \"feedbackReasons\": [\n\t            \"SpeedOfService  \",\n\t            \"Communication  \",\n\t            \"Knowledge  \",\n\t            \"AttentiontoDetails  \",\n\t            \"Courtesy  \",\n\t            \"Other  \"\n\t          ]\n\t        }\n\t      ],\n\t      \"locationReasons\": [\n\t        \"Food \",\n\t        \"Beverages \",\n\t        \"Service \",\n\t        \"Cleanliness \",\n\t        \"Design/DecororAmbiance \",\n\t        \"Noiselevel \",\n\t        \"Other\"\n\t      ],\n\t      \"defaultReasons\": [\n\t        \"SpeedOfService  \",\n\t        \"Communication  \",\n\t        \"Knowledge  \",\n\t        \"AttentiontoDetails  \",\n\t        \"Courtesy  \",\n\t        \"Other  \"\n\t      ],\n\t      \"empPersonlizationPrefix\": \"Eating good means\",\n\t      \"adminContact\": {\n\t        \"userId\": {\n\t          \"verificationStatus\": \"PV\",\n\t          \"emailVerified\": 0,\n\t          \"id\": \"58d8fcff3d72ed901a82baec\"\n\t        },\n\t        \"contactNo\": null,\n\t        \"email\": \"admin.two@applebees.com\",\n\t        \"name\": \"admin two\"\n\t      },\n\t      \"primaryContact\": {\n\t        \"userId\": {\n\t          \"verificationStatus\": \"PV\",\n\t          \"emailVerified\": 0,\n\t          \"id\": \"58d8fcff3d72ed901a82baed\"\n\t        },\n\t        \"contactNo\": null,\n\t        \"email\": \"admin.one@applebees.com\",\n\t        \"name\": \"admin one\"\n\t      },\n\t      \"fontColor\": {\n\t        \"r\": 0,\n\t        \"g\": 0,\n\t        \"b\": 0,\n\t        \"a\": 1\n\t      },\n\t      \"backgroundColor\": {\n\t        \"r\": 255,\n\t        \"g\": 255,\n\t        \"b\": 255,\n\t        \"a\": 1\n\t      },\n\t      \"logo_img\": \"BkFxGM2qx.png\",\n\t      \"logoImgUrl\": \"http://storage.googleapis.com/applause-dev-img-sneha/brand_img/BkFxGM2qx.png\",\n\t      \"id\": \"58be7c2ff468391000c13a4e\"\n\t    }\n\t  ]\n\t}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Errors - code": [
          {
            "group": "Errors - code",
            "type": "Object",
            "optional": false,
            "field": "true",
            "description": "<p>brand not found for parameters.</p>"
          },
          {
            "group": "Errors - code",
            "type": "Object",
            "optional": false,
            "field": "999",
            "description": "<p>All errors.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "server/js/routes/v1/brand.js",
    "groupTitle": "Brands"
  },
  {
    "type": "get",
    "url": "/customer",
    "title": "Retrieve customers",
    "description": "<p>This api retrieves customer information. If no parameter is provided all customers are returned. If customer id is provided it retrieves specific customer with that customer id.</p>",
    "name": "GetCustomers",
    "group": "Customers",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>user jwt authorization header</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<ul> <li></li> </ul>",
            "optional": false,
            "field": "no-param",
            "description": "<p>retrieve all customers.<br> eg - https://applause-dev.appspot.com/api/v1/customer</p>"
          },
          {
            "group": "Parameter",
            "type": "api-parameter",
            "optional": false,
            "field": "/:custId",
            "description": "<p>retrieve customer based on customer id.<br> eg - https://applause-dev.appspot.com/api/v1/customer/42ffffwrwer2344</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": " {\n  \"code\": 0,\n  \"errorMessage\": \"\",\n  \"displayMessage\": \"Customer details fetched successfully.\",\n  \"data\": [\n    {\n      \"_id\": \"58be7e08f468391000c13a55\",\n      \"cid\": 226,\n      \"name\": \"Emtarang\",\n      \"add\": \"banglore\",\n      \"brands\": [\n        {\n          \"id\": \"58be7e37f468391000c13a57\",\n          \"bid\": 165\n        }\n      ],\n      \"adminContact\": {\n        \"userId\": {\n          \"verificationStatus\": \"PV\",\n          \"emailVerified\": 0,\n          \"id\": \"58d8f74d3d72ed901a82baea\"\n        },\n        \"contactNo\": null,\n        \"email\": \"gaurav.bora@logituit.com\",\n        \"name\": \"Gaurav bora\"\n      },\n      \"primaryContact\": {\n        \"userId\": {\n          \"verificationStatus\": \"PV\",\n          \"emailVerified\": 0,\n          \"id\": \"58d8f74d3d72ed901a82baeb\"\n        },\n        \"contactNo\": null,\n        \"email\": \"pratik.kale@logituit.com\",\n        \"name\": \"Pratik Kale\"\n      },\n      \"id\": \"58be7e08f468391000c13a55\"\n    }\n  ]\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Errors - code": [
          {
            "group": "Errors - code",
            "type": "Object",
            "optional": false,
            "field": "true",
            "description": "<p>customer not found for parameters.</p>"
          },
          {
            "group": "Errors - code",
            "type": "Object",
            "optional": false,
            "field": "999",
            "description": "<p>All other unhandled errors.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "server/js/routes/v1/customer.js",
    "groupTitle": "Customers"
  },
  {
    "type": "get",
    "url": "/employee",
    "title": "Retrieve employees",
    "description": "<p>retrieve employees. This api returns all employees if no parameter is provided. If some parameter is provided it returns specific employees based on the parameters.</p>",
    "name": "GetEmployees",
    "group": "Employees",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>user jwt authorization header</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<ul> <li></li> </ul>",
            "optional": false,
            "field": "no-param",
            "description": "<p>retrieve all employees.<br> eg - https://applause-dev.appspot.com/api/v1/employee</p>"
          },
          {
            "group": "Parameter",
            "type": "query-parameter",
            "optional": false,
            "field": "beaconId",
            "description": "<p>retrieve employee based on beacon id.<br> eg - https://applause-dev.appspot.com/api/v1/employee/?beaconId=42ffffwrwer2344</p>"
          },
          {
            "group": "Parameter",
            "type": "query-parameter",
            "optional": false,
            "field": "locId",
            "description": "<p>retrieve employees based on location id.<br> eg - https://applause-dev.appspot.com/api/v1/employee/?locId=42fffgtevgjhj44</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": " {\n  \"code\": 0,\n  \"errorMessage\": \"\",\n  \"displayMessage\": \"Employee fetched successfully.\",\n  \"data\": [\n    {\n      \"_id\": \"58be7eaef468391000c13a5c\",\n      \"eid\": 1702,\n      \"custId\": \"58be7e08f468391000c13a55\",\n      \"brandId\": {\n        \"_id\": \"58be7e37f468391000c13a57\",\n        \"bid\": 165,\n        \"name\": \"Logituit\",\n        \"ratingImgId\": \"57d9640625c8c3b8087b4387\",\n        \"brandType\": \"5809dce8f24ab2600dbb3717\",\n        \"isDeleted\": 0,\n        \"isActive\": 1,\n        \"customer\": \"58be7e08f468391000c13a55\",\n        \"locationReasons\": [\n          \"Service\",\n          \"Quality\",\n          \"Ambience\",\n          \"Price\",\n          \"Other\"\n        ],\n        \"defaultReasons\": [\n          \"SpeedOfService\",\n          \"Communication\",\n          \"Knowledge\",\n          \"AttentiontoDetails\",\n          \"Courtesy\",\n          \"Other\"\n        ],\n        \"empPersonlizationPrefix\": \"Strengths\",\n        \"adminContact\": {\n          \"userId\": null,\n          \"contactNo\": null,\n          \"email\": null,\n          \"name\": null\n        },\n        \"primaryContact\": {\n          \"userId\": null,\n          \"contactNo\": null,\n          \"email\": null,\n          \"name\": null\n        },\n        \"fontColor\": {\n          \"r\": 0,\n          \"g\": 0,\n          \"b\": 0,\n          \"a\": 1\n        },\n        \"backgroundColor\": {\n          \"r\": 255,\n          \"g\": 255,\n          \"b\": 255,\n          \"a\": 1\n        },\n        \"logo_img\": null,\n        \"logoImgUrl\": null,\n        \"id\": \"58be7e37f468391000c13a57\"\n      },\n      \"locationId\": {\n        \"_id\": \"58be7e51f468391000c13a59\",\n        \"lid\": 182,\n        \"lname\": \"Pune\",\n        \"add\": \"Baner\",\n        \"customer\": \"58be7e08f468391000c13a55\",\n        \"brand\": \"58be7e37f468391000c13a57\",\n        \"isDeleted\": 0,\n        \"isActive\": 1,\n        \"adminContact\": {\n          \"userId\": \"58d8ff6c3d72ed901a82baef\",\n          \"contactNo\": null,\n          \"email\": \"admin_pune_2@logituit.com\",\n          \"name\": \"admin two\"\n        },\n        \"primaryContact\": {\n          \"userId\": \"58d8ff6c3d72ed901a82baf0\",\n          \"contactNo\": null,\n          \"email\": \"admin_pune_1@logituit.com\",\n          \"name\": \"admin one\"\n        },\n        \"interactionRadius\": 15,\n        \"loc\": {\n          \"lng\": \"12.22222\",\n          \"lat\": \"12.22222\"\n        },\n        \"img\": null,\n        \"locImgUrl\": null,\n        \"id\": \"58be7e51f468391000c13a59\"\n      },\n      \"phoneNo\": null,\n      \"email\": \"sneha.firodiya@logituit.com\",\n      \"employeeId\": \"1702\",\n      \"roleId\": {\n        \"_id\": \"58be7eaef468391000c13a5b\",\n        \"brandId\": \"58be7e37f468391000c13a57\",\n        \"role_type\": \"developer\",\n        \"isDeleted\": 0,\n        \"isActive\": 1,\n        \"feedbackReasons\": [\n          \"Speed Of Service\",\n          \"Communication\",\n          \"Knowledge\",\n          \"Attention to Details\",\n          \"Courtesy\",\n          \"Other\"\n        ]\n      },\n      \"feedback\": null,\n      \"startDt\": \"2017-03-04T00:00:00.000Z\",\n      \"prefix\": {\n        \"value\": \"ios\",\n        \"key\": \"Strengths:::::\"\n      },\n      \"department\": \"it\",\n      \"beaconId\": \"d16cf8041c98cfca\",\n      \"img\": \"S1QfOW3cl.png\",\n      \"password\": null,\n      \"fullName\": {\n        \"fname\": \"Sneha\",\n        \"lname\": \"Firodiya\",\n        \"full\": \"Sneha Firodiya\"\n      },\n      \"empImgUrl\": \"http://storage.googleapis.com/applause-dev-img/emp_img/S1QfOW3cl.png\",\n      \"id\": \"58be7eaef468391000c13a5c\"\n    }\n  ]\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Errors - code": [
          {
            "group": "Errors - code",
            "type": "Object",
            "optional": false,
            "field": "800",
            "description": "<p>employees not found for parameters.</p>"
          },
          {
            "group": "Errors - code",
            "type": "Object",
            "optional": false,
            "field": "999",
            "description": "<p>All other unhandled errors.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "server/js/routes/v1/employee.js",
    "groupTitle": "Employees"
  },
  {
    "type": "get",
    "url": "/feedback/feedbackDetails",
    "title": "Get feedback details",
    "description": "<p>This api retrieves feedback details posted by specific user. This api returns aggregates of each feedback and the last five feedbacks posted.</p>",
    "name": "GetFeedback",
    "group": "Feedback",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>user's jwt authorization token</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n  \"code\": 0,\n  \"errorMessage\": \"\",\n  \"displayMessage\": \"Feedback fetched successfully.\",\n  \"data\": [\n    {\n      \"locId\": \"58be7e51f468391000c13a59\",\n      \"ratingCountEmployee\": [\n        {\n          \"ratingVal\": 1,\n          \"count\": 0\n        },\n        {\n          \"ratingVal\": 2,\n          \"count\": 1\n        },\n        {\n          \"ratingVal\": 3,\n          \"count\": 0\n        },\n        {\n          \"ratingVal\": 4,\n          \"count\": 0\n        },\n        {\n          \"ratingVal\": 5,\n          \"count\": 0\n        }\n      ],\n      \"ratingCountLocation\": [\n        {\n          \"ratingVal\": 1,\n          \"count\": 0\n        },\n        {\n          \"ratingVal\": 2,\n          \"count\": 0\n        },\n        {\n          \"ratingVal\": 3,\n          \"count\": 0\n        },\n        {\n          \"ratingVal\": 4,\n          \"count\": 1\n        },\n        {\n          \"ratingVal\": 5,\n          \"count\": 0\n        }\n      ],\n      \"feedbackDetails\": [\n        {\n          \"fid\": 1321,\n          \"updatedAt\": \"2017-03-28T06:20:02.660Z\",\n          \"createdAt\": \"2017-03-28T06:20:02.660Z\",\n          \"brand\": {\n            \"_id\": \"58be7e37f468391000c13a57\",\n            \"name\": \"Logituit\",\n            \"ratingImgId\": {\n              \"_id\": \"57d9640625c8c3b8087b4387\",\n              \"name\": \"Smiley\",\n              \"count\": 5,\n              \"img\": null,\n              \"id\": \"57d9640625c8c3b8087b4387\"\n            },\n            \"fontColor\": {\n              \"r\": 0,\n              \"g\": 0,\n              \"b\": 0,\n              \"a\": 1\n            },\n            \"backgroundColor\": {\n              \"r\": 255,\n              \"g\": 255,\n              \"b\": 255,\n              \"a\": 1\n            },\n            \"logo_img\": null,\n            \"logoImgUrl\": null,\n            \"id\": \"58be7e37f468391000c13a57\"\n          },\n          \"location\": {\n            \"_id\": \"58be7e51f468391000c13a59\",\n            \"lname\": \"Pune\",\n            \"add\": \"Baner\",\n            \"img\": null,\n            \"locImgUrl\": null,\n            \"id\": \"58be7e51f468391000c13a59\"\n          },\n          \"feedbackType\": \"LOCATION\",\n          \"feedbackMode\": \"INTERACTION\",\n          \"additionalComment\": \"Shahabuddin\",\n          \"feedbackReasons\": [\n            \"Cleaning\"\n          ],\n          \"ratingVal\": 4,\n          \"user\": {\n            \"id\": \"58be7f79f468391000c13a60\",\n            \"role_id\": \"58a720fb4c5dd253754e0e33\"\n          },\n          \"employee\": null,\n          \"customer\": null,\n          \"id\": \"58da0092ce2270b40bdb01a2\"\n        },\n        {\n          \"fid\": 1320,\n          \"updatedAt\": \"2017-03-28T06:19:34.641Z\",\n          \"createdAt\": \"2017-03-28T06:19:34.641Z\",\n          \"brand\": {\n            \"_id\": \"58be7e37f468391000c13a57\",\n            \"name\": \"Logituit\",\n            \"ratingImgId\": {\n              \"_id\": \"57d9640625c8c3b8087b4387\",\n              \"name\": \"Smiley\",\n              \"count\": 5,\n              \"img\": null,\n              \"id\": \"57d9640625c8c3b8087b4387\"\n            },\n            \"fontColor\": {\n              \"r\": 0,\n              \"g\": 0,\n              \"b\": 0,\n              \"a\": 1\n            },\n            \"backgroundColor\": {\n              \"r\": 255,\n              \"g\": 255,\n              \"b\": 255,\n              \"a\": 1\n            },\n            \"logo_img\": null,\n            \"logoImgUrl\": null,\n            \"id\": \"58be7e37f468391000c13a57\"\n          },\n          \"location\": {\n            \"_id\": \"58be7e51f468391000c13a59\",\n            \"lname\": \"Pune\",\n            \"add\": \"Baner\",\n            \"img\": null,\n            \"locImgUrl\": null,\n            \"id\": \"58be7e51f468391000c13a59\"\n          },\n          \"feedbackType\": \"EMPLOYEE\",\n          \"feedbackMode\": \"INTERACTION\",\n          \"additionalComment\": \"Shahabuddin\",\n          \"feedbackReasons\": [\n            \"Speed Of Service\"\n          ],\n          \"ratingVal\": 2,\n          \"user\": {\n            \"id\": \"58be7f79f468391000c13a60\",\n            \"role_id\": \"58a720fb4c5dd253754e0e33\"\n          },\n          \"employee\": {\n            \"_id\": \"58be7eaef468391000c13a5c\",\n            \"img\": \"S1QfOW3cl.png\",\n            \"fullName\": {\n              \"fname\": \"Sneha\",\n              \"lname\": \"Firodiya\",\n              \"full\": \"Sneha Firodiya\"\n            },\n            \"empImgUrl\": \"http://storage.googleapis.com/applause-dev-img/emp_img/S1QfOW3cl.png\",\n            \"id\": \"58be7eaef468391000c13a5c\"\n          },\n          \"customer\": null,\n          \"id\": \"58da0076ce2270b40bdb01a1\"\n        }\n      ]\n    }\n  ]\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Errors - code": [
          {
            "group": "Errors - code",
            "type": "Object",
            "optional": false,
            "field": "999",
            "description": "<p>Error fetching feedback.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "server/js/routes/v1/feedback.js",
    "groupTitle": "Feedback"
  },
  {
    "type": "post",
    "url": "/feedback",
    "title": "Post Feedback",
    "description": "<p>This api is used to post feedbacks through the app. The feedback can be of location or employee.</p>",
    "name": "PostFeedback",
    "group": "Feedback",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>user's jwt authorization token</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Added field for employee": [
          {
            "group": "Added field for employee",
            "type": "String",
            "optional": false,
            "field": "euId",
            "description": "<p>employee unique id</p>"
          }
        ],
        "Common fields for employee and location": [
          {
            "group": "Common fields for employee and location",
            "type": "Number",
            "allowedValues": [
              "\"1-5\""
            ],
            "optional": false,
            "field": "ratingVal",
            "description": "<p>rating value from 1 to 5</p>"
          },
          {
            "group": "Common fields for employee and location",
            "type": "String",
            "optional": false,
            "field": "brandId",
            "description": "<p>brand id of the employee</p>"
          },
          {
            "group": "Common fields for employee and location",
            "type": "String",
            "optional": false,
            "field": "locId",
            "description": "<p>location id of the employee</p>"
          },
          {
            "group": "Common fields for employee and location",
            "type": "Array",
            "optional": false,
            "field": "feedbackReasons",
            "description": "<p>feedback reasons array</p>"
          },
          {
            "group": "Common fields for employee and location",
            "type": "String",
            "allowedValues": [
              "\"EMPLOYEE\"",
              "\"LOCATION\""
            ],
            "optional": false,
            "field": "feedbackType",
            "description": "<p>feedback type either employee or location</p>"
          },
          {
            "group": "Common fields for employee and location",
            "type": "String",
            "allowedValues": [
              "\"INTERACTION\"",
              "\"KIOSK\""
            ],
            "optional": false,
            "field": "feedbackMode",
            "description": "<p>feedback mode either interaction or kiosk</p>"
          },
          {
            "group": "Common fields for employee and location",
            "type": "String",
            "optional": true,
            "field": "additionalComment",
            "description": "<p>additional comments if any</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": " {\n\t\"custId\":null,\n\t\"ratingVal\":2,\n\t\"brandId\":\"58be7e37f468391000c13a57\",\n\t\"feedbackReasons\":[\"Speed Of Service\"],\n\t\"feedbackType\":\"EMPLOYEE\",\n\t\"feedbackMode\":\"INTERACTION\",\n\t\"additionalComment\":\"Shahabuddin\",\n\t\"locId\":\"58be7e51f468391000c13a59\",\n\t\"euId\":\"58be7eaef468391000c13a5c\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n\t\"code\":0,\n\t\"errorMessage\":\"\",\n\t\"displayMessage\":\"Your feedback is recorded successfully. Thank you!\",\n\t\"data\":{\n\t\t\"id\":\"58d9f01a72ff44100090ac8e\",\n\t\t\"fid\":1544\n\t}\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Errors - code": [
          {
            "group": "Errors - code",
            "type": "Object",
            "optional": false,
            "field": "999",
            "description": "<p>Error submitting feedback.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "server/js/routes/v1/feedback.js",
    "groupTitle": "Feedback"
  },
  {
    "type": "post",
    "url": "/forgotPassword/reset",
    "title": "2.Reset Password",
    "description": "<p>Provide the otp obtained on email id or contact number, otpId obtained in the response of the send otp api and the password to reset. It will verify that the otp is correct and reset the password.</p>",
    "name": "resetPasswordWithOtpApi",
    "group": "Forgot_Password",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "otpId",
            "description": "<p>otp id obtained from sendOtpApi</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "otp",
            "description": "<p>otp received on email or phone number</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>password to reset</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n\t\"otpId\" : \"58da021fce2270b40bdb01a3\",\n\t\"otp\" : \"9244\",\n\t\"password\" : \"password\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": " {\n  \"code\": 0,\n  \"errorMessage\": \"\",\n  \"displayMessage\": \"Congratulations password for user 'sneha f' updated successfully.\",\n  \"data\": {\n    \"success\": 1\n  }\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Errors - code": [
          {
            "group": "Errors - code",
            "type": "Object",
            "optional": false,
            "field": "999",
            "description": "<p>Password reset failure.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "server/js/routes/v1/forgot-password.js",
    "groupTitle": "Forgot_Password"
  },
  {
    "type": "post",
    "url": "/forgotPassword",
    "title": "1. Send Otp",
    "description": "<p>Provide the contact number or email in the api. It will send the otp to the user's contact number or email id as well as the otpId in the response object.</p>",
    "name": "sendOtpApi",
    "group": "Forgot_Password",
    "parameter": {
      "fields": {
        "email": [
          {
            "group": "email",
            "type": "String",
            "allowedValues": [
              "\"EMAIL\""
            ],
            "optional": false,
            "field": "regType",
            "description": "<p>registration type of user</p>"
          },
          {
            "group": "email",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>email id of user</p>"
          }
        ],
        "contactNo": [
          {
            "group": "contactNo",
            "type": "String",
            "allowedValues": [
              "\"CONTACTNO\""
            ],
            "optional": false,
            "field": "regType",
            "description": "<p>registration type of user</p>"
          },
          {
            "group": "contactNo",
            "type": "String",
            "optional": false,
            "field": "phoneNo",
            "description": "<p>phone number of user</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": " {\n\t\"regType\": \"EMAIL\",\n\t\"email\" : \"sneha.firodiya@logituit.com\"\n }",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": " {\n  \"code\": 0,\n  \"errorMessage\": \"\",\n  \"displayMessage\": \"OTP sent to email. Please verify.\",\n  \"data\": {\n    \"otpId\": \"58da021fce2270b40bdb01a3\"\n  }\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Errors - code": [
          {
            "group": "Errors - code",
            "type": "Object",
            "optional": false,
            "field": "801",
            "description": "<p>The <code>email</code> is not registered.</p>"
          },
          {
            "group": "Errors - code",
            "type": "Object",
            "optional": false,
            "field": "802",
            "description": "<p>The <code>phone number</code> is not registered.</p>"
          },
          {
            "group": "Errors - code",
            "type": "Object",
            "optional": false,
            "field": "999",
            "description": "<p>All other unhandled errors.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "server/js/routes/v1/forgot-password.js",
    "groupTitle": "Forgot_Password"
  },
  {
    "type": "post",
    "url": "/guest",
    "title": "Save guest user details",
    "description": "<p>This api saves guest user details. If user is not signed up and still wants to submit feedback, we save the user information as guest user through guest login.</p>",
    "name": "saveGuestUserDetails",
    "group": "Guest",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "deviceId",
            "description": "<p>user's device id</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "appVer",
            "description": "<p>user's application version</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "deviceInfo",
            "description": "<p>user's device information</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "deviceInfo.osName",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "deviceInfo.osVer",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "deviceInfo.deviceName",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "deviceInfo.deviceVer",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": true,
            "field": "location",
            "description": "<p>user's location</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "location.lat",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "location.lng",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n\t\"appVer\" : \"4.4.1\",\n\t\"deviceInfo\" : {\n\t\t\"osName\": \"ios\",\n        \"osVer\": \"9.3.4\",\n        \"deviceName\": \"iPhone\",\n        \"deviceVer\": \"6\"\n\t},\n\t\"location\" : {\n\t\t\"lat\": \"12.2222\",\n\t\t\"lng\": \"12.2222\"\n\t}\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "response-headers": [
          {
            "group": "response-headers",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>authorization token for user</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": " {\n  \"code\": 0,\n  \"errorMessage\": \"\",\n  \"displayMessage\": \"Guest user saved in successfully.\",\n  \"data\": {\n    \"deviceInfo\": {\n      \"_id\": {},\n      \"deviceVer\": \"6\",\n      \"deviceName\": \"iPhone\",\n      \"osVer\": \"9.3.4\",\n      \"osName\": \"ios\"\n    },\n    \"location\": {\n      \"lng\": \"12.2222\",\n      \"lat\": \"12.2222\"\n    },\n    \"role_id\": {\n      \"_id\": \"58a721024c5dd253754e0e34\",\n      \"roleName\": \"guest\",\n      \"id\": \"58a721024c5dd253754e0e34\"\n    },\n    \"__v\": 0,\n    \"appVer\": \"4.4.1\",\n    \"deviceId\": \"abcdef\",\n    \"createdAt\": \"2017-03-28T04:40:29.573Z\",\n    \"updatedAt\": \"2017-03-28T04:40:29.573Z\",\n    \"_id\": \"58d9e93dce2270b40bdb019f\"\n  }\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Errors - code": [
          {
            "group": "Errors - code",
            "type": "Object",
            "optional": false,
            "field": "999",
            "description": "<p>guest user save error.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "server/js/routes/v1/guest.js",
    "groupTitle": "Guest"
  },
  {
    "type": "get",
    "url": "/location",
    "title": "Retrieve locations",
    "description": "<p>This api retrieves locations information. If no parameter is provided it returns all locations. If some parameter is provided it returns locations based on those parameters.</p>",
    "name": "GetLocations",
    "group": "Locations",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>user jwt authorization header</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<ul> <li></li> </ul>",
            "optional": false,
            "field": "no-param",
            "description": "<p>retrieve all locations.<br> eg - https://applause-dev.appspot.com/api/v1/location</p>"
          },
          {
            "group": "Parameter",
            "type": "api-parameter",
            "optional": false,
            "field": "/:locId",
            "description": "<p>retrieve location based on location id.<br> eg - https://applause-dev.appspot.com/api/v1/location/42ffffwrwer2344</p>"
          },
          {
            "group": "Parameter",
            "type": "query-parameter",
            "optional": false,
            "field": "custId",
            "description": "<p>retrieve locations based on customer id.<br> eg - https://applause-dev.appspot.com/api/v1/location/?custId=42fffgtevgjhj44</p>"
          },
          {
            "group": "Parameter",
            "type": "query-parameter",
            "optional": false,
            "field": "brandId",
            "description": "<p>retrieve locations based on brand id.<br> eg - https://applause-dev.appspot.com/api/v1/location/?brandId=42fffgtevgjhj44</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": " \t{\n  \"code\": 0,\n  \"errorMessage\": \"\",\n  \"displayMessage\": \"Location details fetched successfully.\",\n  \t\"data\": [\n\t    {\n\t      \"_id\": \"58be7e51f468391000c13a59\",\n\t      \"lid\": 182,\n\t      \"lname\": \"Pune\",\n\t      \"add\": \"Baner\",\n\t      \"customer\": {\n\t        \"_id\": \"58be7e08f468391000c13a55\",\n\t        \"name\": \"Emtarang\",\n\t        \"id\": \"58be7e08f468391000c13a55\"\n\t      },\n\t      \"brand\": {\n\t        \"_id\": \"58be7e37f468391000c13a57\",\n\t        \"name\": \"Logituit\",\n\t        \"customer\": {\n\t          \"_id\": \"58be7e08f468391000c13a55\",\n\t          \"name\": \"Emtarang\",\n\t          \"id\": \"58be7e08f468391000c13a55\"\n\t        },\n\t        \"fontColor\": {\n\t          \"r\": 0,\n\t          \"g\": 0,\n\t          \"b\": 0,\n\t          \"a\": 1\n\t        },\n\t        \"backgroundColor\": {\n\t          \"r\": 255,\n\t          \"g\": 255,\n\t          \"b\": 255,\n\t          \"a\": 1\n\t        },\n\t        \"logo_img\": null,\n\t        \"logoImgUrl\": null,\n\t        \"id\": \"58be7e37f468391000c13a57\"\n\t      },\n\t      \"employees\": [\n\t        {\n\t          \"id\": \"58be7eaef468391000c13a5c\",\n\t          \"eid\": 1702\n\t        }\n\t      ],\n\t      \"adminContact\": {\n\t        \"userId\": {\n\t          \"verificationStatus\": \"PV\",\n\t          \"emailVerified\": 0,\n\t          \"id\": \"58d8ff6c3d72ed901a82baef\"\n\t        },\n\t        \"contactNo\": null,\n\t        \"email\": \"admin_pune_2@logituit.com\",\n\t        \"name\": \"admin two\"\n\t      },\n\t      \"primaryContact\": {\n\t        \"userId\": {\n\t          \"verificationStatus\": \"PV\",\n\t          \"emailVerified\": 0,\n\t          \"id\": \"58d8ff6c3d72ed901a82baf0\"\n\t        },\n\t        \"contactNo\": null,\n\t        \"email\": \"admin_pune_1@logituit.com\",\n\t        \"name\": \"admin one\"\n\t      },\n\t      \"interactionRadius\": 15,\n\t      \"loc\": {\n\t        \"lng\": \"12.22222\",\n\t        \"lat\": \"12.22222\"\n\t      },\n\t      \"img\": null,\n\t      \"locImgUrl\": null,\n\t      \"id\": \"58be7e51f468391000c13a59\"\n\t    },\n\t    {\n\t      \"_id\": \"58be8275f468391000c13a6b\",\n\t      \"lid\": 183,\n\t      \"lname\": \"Fairfax, VA\",\n\t      \"add\": \"12970 Fair Lakes Shopping Center, Fairfax, VA 22033\",\n\t      \"customer\": {\n\t        \"_id\": \"58be7aaff468391000c13a46\",\n\t        \"name\": \"Dine Equity, Inc.\",\n\t        \"id\": \"58be7aaff468391000c13a46\"\n\t      },\n\t      \"brand\": {\n\t        \"_id\": \"58be7c2ff468391000c13a4e\",\n\t        \"name\": \"Applebee's\",\n\t        \"customer\": {\n\t          \"_id\": \"58be7aaff468391000c13a46\",\n\t          \"name\": \"Dine Equity, Inc.\",\n\t          \"id\": \"58be7aaff468391000c13a46\"\n\t        },\n\t        \"fontColor\": {\n\t          \"r\": 0,\n\t          \"g\": 0,\n\t          \"b\": 0,\n\t          \"a\": 1\n\t        },\n\t        \"backgroundColor\": {\n\t          \"r\": 255,\n\t          \"g\": 255,\n\t          \"b\": 255,\n\t          \"a\": 1\n\t        },\n\t        \"logo_img\": \"BkFxGM2qx.png\",\n\t        \"logoImgUrl\": \"http://storage.googleapis.com/applause-dev-img/brand_img/BkFxGM2qx.png\",\n\t        \"id\": \"58be7c2ff468391000c13a4e\"\n\t      },\n\t      \"employees\": [],\n\t      \"adminContact\": {\n\t        \"userId\": null,\n\t        \"contactNo\": null,\n\t        \"email\": null,\n\t        \"name\": null\n\t      },\n\t      \"primaryContact\": {\n\t        \"userId\": null,\n\t        \"contactNo\": null,\n\t        \"email\": null,\n\t        \"name\": null\n\t      },\n\t      \"interactionRadius\": null,\n\t      \"loc\": {\n\t        \"lng\": null,\n\t        \"lat\": null\n\t      },\n\t      \"img\": \"HJirofh5l.png\",\n\t      \"locImgUrl\": \"http://storage.googleapis.com/applause-dev-img/loc_img/HJirofh5l.png\",\n\t      \"id\": \"58be8275f468391000c13a6b\"\n\t    }\n\t  ]\n\t}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Errors - code": [
          {
            "group": "Errors - code",
            "type": "Object",
            "optional": false,
            "field": "true",
            "description": "<p>location not found for parameters.</p>"
          },
          {
            "group": "Errors - code",
            "type": "Object",
            "optional": false,
            "field": "999",
            "description": "<p>All other errors.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "server/js/routes/v1/location.js",
    "groupTitle": "Locations"
  },
  {
    "type": "post",
    "url": "/users",
    "title": "Registration",
    "description": "<p>Registration api with email, contact number or facebook.</p>",
    "name": "UserRegister",
    "group": "Users",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "allowedValues": [
              "\"USER\"",
              "\"EMP\""
            ],
            "optional": false,
            "field": "usrType",
            "description": "<p>employee or app consumer</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "email": [
          {
            "group": "email",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>email id of user</p>"
          },
          {
            "group": "email",
            "type": "String",
            "optional": true,
            "field": "phoneNo",
            "description": "<p>mobile number of user</p>"
          },
          {
            "group": "email",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>user's password</p>"
          }
        ],
        "contact number": [
          {
            "group": "contact number",
            "type": "String",
            "optional": true,
            "field": "email",
            "description": "<p>email id of user</p>"
          },
          {
            "group": "contact number",
            "type": "String",
            "optional": false,
            "field": "phoneNo",
            "description": "<p>mobile number of user</p>"
          },
          {
            "group": "contact number",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>user's password</p>"
          }
        ],
        "facebook": [
          {
            "group": "facebook",
            "type": "String",
            "optional": false,
            "field": "fbUniqId",
            "description": "<p>user's unique facebook id</p>"
          },
          {
            "group": "facebook",
            "type": "String",
            "optional": true,
            "field": "email",
            "description": "<p>email id of user</p>"
          },
          {
            "group": "facebook",
            "type": "String",
            "optional": true,
            "field": "phoneNo",
            "description": "<p>mobile number of user</p>"
          }
        ],
        "Comman fields": [
          {
            "group": "Comman fields",
            "type": "Object",
            "optional": true,
            "field": "deviceInfo",
            "description": "<p>user's device information</p>"
          },
          {
            "group": "Comman fields",
            "type": "String",
            "optional": false,
            "field": "deviceInfo.osName",
            "description": ""
          },
          {
            "group": "Comman fields",
            "type": "String",
            "optional": false,
            "field": "deviceInfo.osVer",
            "description": ""
          },
          {
            "group": "Comman fields",
            "type": "String",
            "optional": false,
            "field": "deviceInfo.deviceName",
            "description": ""
          },
          {
            "group": "Comman fields",
            "type": "String",
            "optional": false,
            "field": "deviceInfo.deviceVer",
            "description": ""
          },
          {
            "group": "Comman fields",
            "type": "Object",
            "optional": true,
            "field": "location",
            "description": "<p>user's location</p>"
          },
          {
            "group": "Comman fields",
            "type": "String",
            "optional": false,
            "field": "location.lat",
            "description": ""
          },
          {
            "group": "Comman fields",
            "type": "String",
            "optional": false,
            "field": "location.lng",
            "description": ""
          },
          {
            "group": "Comman fields",
            "type": "String",
            "optional": true,
            "field": "appVer",
            "description": "<p>user's application version</p>"
          },
          {
            "group": "Comman fields",
            "type": "Object",
            "optional": false,
            "field": "personalInfo",
            "description": "<p>user's personal information</p>"
          },
          {
            "group": "Comman fields",
            "type": "String",
            "optional": false,
            "field": "personalInfo.fullName",
            "description": "<p>user's full name</p>"
          },
          {
            "group": "Comman fields",
            "type": "String",
            "optional": false,
            "field": "roleId",
            "description": "<p>roleId for the user (app_consumer, customer/brand/location admin, employee)</p>"
          },
          {
            "group": "Comman fields",
            "type": "String",
            "allowedValues": [
              "\"FB\"",
              "\"CONTACTNO\"",
              "\"EMAIL\""
            ],
            "optional": false,
            "field": "regType",
            "description": "<p>registration type for registration.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n    \"phoneNo\": \"917507684060\",\n    \"email\": null,\n    \"deviceInfo\": {\n        \"osName\": \"ios\",\n        \"osVer\": \"9.3.4\",\n        \"deviceName\": \"iPhone\",\n        \"deviceVer\": \"6\"\n    },\n    \"location\": {\n        \"lng\": \"23.333\",\n        \"lat\": \"12.33\"\n    },\n    \"appVer\": \"0.0.1\",\n    \"password\": \"password\",\n    \"personalInfo\": {\n        \"fullName\": \"Contact User\"\n    },\n    \"roleId\": \"57d2a5351f70895c10d7eda7\",\n    \"regType\": \"CONTACTNO\",\n    \"fbUniqId\": null\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": " {\n  \"code\": 0,\n  \"errorMessage\": \"\",\n  \"displayMessage\": \"Congratulations, account created succesfully.\",\n  \"data\": {\n    \"id\": \"58d9f602ce2270b40bdb01a0\",\n    \"uid\": 712\n  }\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Errors - code": [
          {
            "group": "Errors - code",
            "type": "Object",
            "optional": false,
            "field": "800",
            "description": "<p>details not available in employee records.</p>"
          },
          {
            "group": "Errors - code",
            "type": "Object",
            "optional": false,
            "field": "801",
            "description": "<p>The <code>email</code> is already registered.</p>"
          },
          {
            "group": "Errors - code",
            "type": "Object",
            "optional": false,
            "field": "802",
            "description": "<p>The <code>phone number</code> is already registered.</p>"
          },
          {
            "group": "Errors - code",
            "type": "Object",
            "optional": false,
            "field": "600",
            "description": "<p>error validating user registration type.</p>"
          },
          {
            "group": "Errors - code",
            "type": "Object",
            "optional": false,
            "field": "999",
            "description": "<p>All other unhandled errors.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "server/js/routes/v1/user.js",
    "groupTitle": "Users"
  },
  {
    "type": "put",
    "url": "/users",
    "title": "Update User",
    "description": "<p>update user api with email, contact</p>",
    "name": "UserUpdate",
    "group": "Users",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>authorization token of user</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "email": [
          {
            "group": "email",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>email id of user</p>"
          },
          {
            "group": "email",
            "type": "String",
            "optional": true,
            "field": "phoneNo",
            "description": "<p>mobile number of user</p>"
          }
        ],
        "contact no": [
          {
            "group": "contact no",
            "type": "String",
            "optional": true,
            "field": "email",
            "description": "<p>email id of user</p>"
          },
          {
            "group": "contact no",
            "type": "String",
            "optional": false,
            "field": "phoneNo",
            "description": "<p>mobile number of user</p>"
          }
        ],
        "common fields": [
          {
            "group": "common fields",
            "type": "Object",
            "optional": true,
            "field": "deviceInfo",
            "description": "<p>user's device information</p>"
          },
          {
            "group": "common fields",
            "type": "String",
            "optional": false,
            "field": "deviceInfo.osName",
            "description": ""
          },
          {
            "group": "common fields",
            "type": "String",
            "optional": false,
            "field": "deviceInfo.osVer",
            "description": ""
          },
          {
            "group": "common fields",
            "type": "String",
            "optional": false,
            "field": "deviceInfo.deviceName",
            "description": ""
          },
          {
            "group": "common fields",
            "type": "String",
            "optional": false,
            "field": "deviceInfo.deviceVer",
            "description": ""
          },
          {
            "group": "common fields",
            "type": "Object",
            "optional": true,
            "field": "location",
            "description": "<p>user's location</p>"
          },
          {
            "group": "common fields",
            "type": "String",
            "optional": false,
            "field": "location.lat",
            "description": ""
          },
          {
            "group": "common fields",
            "type": "String",
            "optional": false,
            "field": "location.lng",
            "description": ""
          },
          {
            "group": "common fields",
            "type": "String",
            "optional": true,
            "field": "appVer",
            "description": "<p>user's application version</p>"
          },
          {
            "group": "common fields",
            "type": "String",
            "optional": true,
            "field": "password",
            "description": "<p>user's password currentPassword</p>"
          },
          {
            "group": "common fields",
            "type": "String",
            "optional": false,
            "field": "currentPassword",
            "description": "<p>user's current password (mandatory if password is present)</p>"
          },
          {
            "group": "common fields",
            "type": "Object",
            "optional": true,
            "field": "personalInfo",
            "description": "<p>user's personal information</p>"
          },
          {
            "group": "common fields",
            "type": "String",
            "optional": false,
            "field": "personalInfo.fullName",
            "description": "<p>user's full name</p>"
          },
          {
            "group": "common fields",
            "type": "String",
            "allowedValues": [
              "\"CONTACTNO\"",
              "\"EMAIL\""
            ],
            "optional": false,
            "field": "regType",
            "description": "<p>registration type of user.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n\"password\":\"password\",\n\"regType\":\"EMAIL\",\n\"email\":\"admin@meimodo.com\",\n\"currentPassword\": \"welcome123\",\n\"deviceInfo\": {\n    \"osName\": \"ios\",\n    \"osVer\": \"9.3.4\",\n    \"deviceName\": \"iPhone\",\n    \"deviceVer\": \"6\"\n},\n\"location\": {\n\t\"lng\": \"23.333\",\n\t\"lat\": \"12.33\"\n},\n\"appVer\": \"0.0.1\",\n\"personalInfo\": {\n\t\"fullName\": \"Contact User\"\n\t}\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": " {\n  \"code\": 0,\n  \"errorMessage\": \"\",\n  \"displayMessage\": \"Congratulations, user Meimodo Admin updated successfully.\",\n  \"data\": {\n    \"uid\": 630,\n    \"updatedAt\": \"2017-03-28T07:04:01.748Z\",\n    \"createdAt\": \"2017-02-25T10:26:51.450Z\",\n    \"phoneNo\": null,\n    \"email\": \"admin@meimodo.com\",\n    \"fbUniqId\": null,\n    \"appVer\": \"0.0.1\",\n    \"userName\": \"admin@meimodo.com\",\n    \"role_id\": \"57c8c534488d6788133f61f1\",\n    \"regType\": \"EMAIL\",\n    \"userRelation\": null,\n    \"isDeleted\": 0,\n    \"verificationStatus\": \"PV\",\n    \"phoneNoVerified\": 1,\n    \"emailVerified\": 1,\n    \"isActive\": 1,\n    \"empUniqId\": null,\n    \"personalInfo\": {\n      \"fullName\": \"Meimodo Admin\",\n      \"img\": null\n    },\n    \"location\": {\n      \"lat\": \"12.33\",\n      \"lng\": \"23.333\"\n    },\n    \"password\": \"$2a$10$FC5363TWd4fvDAI6dZxxWetc0xRHM/C/QislydgFlseTYp1RxjDDm\",\n    \"deviceInfo\": {\n      \"deviceVer\": \"6\",\n      \"deviceName\": \"iPhone\",\n      \"osVer\": \"9.3.4\",\n      \"osName\": \"ios\"\n    },\n    \"id\": \"58b15beb67af631000bd4381\"\n  }\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Errors - code": [
          {
            "group": "Errors - code",
            "type": "Object",
            "optional": false,
            "field": "500",
            "description": "<p>current password does not match</p>"
          },
          {
            "group": "Errors - code",
            "type": "Object",
            "optional": false,
            "field": "999",
            "description": "<p>Error updating user.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "server/js/routes/v1/user.js",
    "groupTitle": "Users"
  },
  {
    "type": "post",
    "url": "/pin/confirm",
    "title": "2.Confirm Pin",
    "description": "<p>This api confirms the otp received on contact number. Provide request id obtained in send pin api along with the otp received on contact number to confirm the contact number.</p>",
    "name": "confirmPinApi",
    "group": "Verify_Contact_Number",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "pin",
            "description": "<p>pin received on contact number</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "requestId",
            "description": "<p>requestId obtained from sendPinApi</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n  \"pin\" : \"9201\",\n  \"requestId\" : \"9a8eaa10bcb34a12a65f0e0a6aa321b9\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n  \"code\": 0,\n  \"errorMessage\": \"\",\n  \"displayMessage\": \"Phone number validated successfully.\",\n  \"data\": {\n    \"eventId\": \"b60e692bc593a21604ccede6dce7bcc3\"\n  }\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Errors - code": [
          {
            "group": "Errors - code",
            "type": "Object",
            "optional": false,
            "field": "300",
            "description": "<p>Pin was not found or it has been verified already.</p>"
          },
          {
            "group": "Errors - code",
            "type": "Object",
            "optional": false,
            "field": "200",
            "description": "<p>Confirm pin error.</p>"
          },
          {
            "group": "Errors - code",
            "type": "Object",
            "optional": false,
            "field": "999",
            "description": "<p>All other unhandled errors.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "server/js/routes/v1/pin.js",
    "groupTitle": "Verify_Contact_Number"
  },
  {
    "type": "post",
    "url": "/pin",
    "title": "1.Send Pin",
    "description": "<p>This api sends an otp to contact number to verify the contact number. This api returns request id in response object which needs to be provided in confirm pin api along with otp received.</p>",
    "name": "sendPinApi",
    "group": "Verify_Contact_Number",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "contactNo",
            "description": "<p>contact number of user</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n  \"contactNo\" : \"917507684060\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": " {\n  \"code\": 0,\n  \"errorMessage\": \"\",\n  \"displayMessage\": \"PIN sent to your phone number successfully.\",\n  \"data\": {\n    \"requestId\": \"9a8eaa10bcb34a12a65f0e0a6aa321b9\"\n  }\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Errors - code": [
          {
            "group": "Errors - code",
            "type": "Object",
            "optional": false,
            "field": "800",
            "description": "<p>unable to generate pin.</p>"
          },
          {
            "group": "Errors - code",
            "type": "Object",
            "optional": false,
            "field": "999",
            "description": "<p>All other unhandled errors.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "server/js/routes/v1/pin.js",
    "groupTitle": "Verify_Contact_Number"
  },
  {
    "type": "post",
    "url": "/login",
    "title": "Login",
    "description": "<p>Login api with email or contact number.</p>",
    "name": "UserLogin",
    "group": "user_login",
    "parameter": {
      "fields": {
        "email": [
          {
            "group": "email",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>email id of user</p>"
          },
          {
            "group": "email",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>password of user</p>"
          }
        ],
        "contactNo": [
          {
            "group": "contactNo",
            "type": "String",
            "optional": false,
            "field": "contactNo",
            "description": "<p>contact number of user</p>"
          },
          {
            "group": "contactNo",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>password of user</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n    \"email\": \"sneha.firodiya@logituit.com\",\n    \"password\": \"applause123\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "response-headers": [
          {
            "group": "response-headers",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>authorization token for user</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n  \"code\": 0,\n  \"errorMessage\": \"\",\n  \"displayMessage\": \"User logged in successfully.\",\n  \"data\": {\n    \"deviceInfo\": {\n      \"osName\": \"iPhone OS\",\n      \"osVer\": \"9.3.2\",\n      \"deviceName\": \"iPhone\",\n      \"deviceVer\": \"\"\n    },\n    \"password\": \"$2a$10$ZpbMfKYcd32wSbVNB7NKWO9/ADpCpRkiMD3MTDkqeTVCGmxleIID2\",\n    \"location\": {\n      \"lng\": \"23.333\",\n      \"lat\": \"12.33\"\n    },\n    \"personalInfo\": {\n      \"img\": null,\n      \"fullName\": \"sneha f\"\n    },\n    \"empUniqId\": {\n      \"_id\": \"58be7eaef468391000c13a5c\",\n      \"eid\": 1702,\n      \"updatedAt\": \"2017-03-07T11:09:28.618Z\",\n      \"createdAt\": \"2017-03-07T09:34:38.876Z\",\n      \"custId\": \"58be7e08f468391000c13a55\",\n      \"brandId\": {\n        \"_id\": \"58be7e37f468391000c13a57\",\n        \"name\": \"Logituit\",\n        \"empPersonlizationPrefix\": \"Strengths\",\n        \"id\": \"58be7e37f468391000c13a57\"\n      },\n      \"locationId\": {\n        \"_id\": \"58be7e51f468391000c13a59\",\n        \"lname\": \"Pune\",\n        \"id\": \"58be7e51f468391000c13a59\"\n      },\n      \"phoneNo\": null,\n      \"email\": \"sneha.firodiya@logituit.com\",\n      \"employeeId\": \"1702\",\n      \"roleId\": {\n        \"_id\": \"58be7eaef468391000c13a5b\",\n        \"role_type\": \"developer\"\n      },\n      \"isDeleted\": 0,\n      \"isActive\": 1,\n      \"feedback\": null,\n      \"startDt\": \"2017-03-04T00:00:00.000Z\",\n      \"prefix\": {\n        \"value\": \"ios\",\n        \"key\": \"Strengths:::::\"\n      },\n      \"department\": \"it\",\n      \"beaconId\": \"d16cf8041c98cfca\",\n      \"img\": \"S1QfOW3cl.png\",\n      \"password\": null,\n      \"fullName\": {\n        \"fname\": \"Sneha\",\n        \"lname\": \"Firodiya\",\n        \"full\": \"Sneha Firodiya\"\n      },\n      \"empImgUrl\": \"http://storage.googleapis.com/applause-dev-img/emp_img/S1QfOW3cl.png\",\n      \"id\": \"58be7eaef468391000c13a5c\"\n    },\n    \"isActive\": 1,\n    \"emailVerified\": 1,\n    \"phoneNoVerified\": 0,\n    \"verificationStatus\": \"AV\",\n    \"isDeleted\": 0,\n    \"userRelation\": null,\n    \"__v\": 0,\n    \"regType\": \"EMAIL\",\n    \"role_id\": {\n      \"_id\": \"58a720fb4c5dd253754e0e33\",\n      \"roleName\": \"employee\",\n      \"id\": \"58a720fb4c5dd253754e0e33\"\n    },\n    \"userName\": \"sneha.firodiya@logituit.com\",\n    \"appVer\": \"1\",\n    \"fbUniqId\": null,\n    \"email\": \"sneha.firodiya@logituit.com\",\n    \"phoneNo\": null,\n    \"createdAt\": \"2017-03-07T09:38:01.649Z\",\n    \"updatedAt\": \"2017-03-28T06:35:13.036Z\",\n    \"uid\": 705,\n    \"_id\": \"58be7f79f468391000c13a60\"\n  }\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Errors - code": [
          {
            "group": "Errors - code",
            "type": "Object",
            "optional": false,
            "field": "100",
            "description": "<p>incorrect password.</p>"
          },
          {
            "group": "Errors - code",
            "type": "Object",
            "optional": false,
            "field": "800",
            "description": "<p>The <code>email</code> is not registered.</p>"
          },
          {
            "group": "Errors - code",
            "type": "Object",
            "optional": false,
            "field": "801",
            "description": "<p>The <code>number</code> is not registered.</p>"
          },
          {
            "group": "Errors - code",
            "type": "Object",
            "optional": false,
            "field": "802",
            "description": "<p>The <code>email</code> is not verified.</p>"
          },
          {
            "group": "Errors - code",
            "type": "Object",
            "optional": false,
            "field": "999",
            "description": "<p>All other unhandled errors.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "error-response:",
          "content": "\t{\n   \"code\": 800,\n   \"errorMessage\": \"This email is not registered with us.\\nPlease re-enter your email and try again.\",\n   \"displayMessage\": \"This email is not registered with us.\\nPlease re-enter your email and try again.\",\n   \"data\": null\n }",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "server/js/routes/v1/user-login.js",
    "groupTitle": "user_login"
  }
] });
