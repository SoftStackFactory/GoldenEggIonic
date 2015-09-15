/*global angular*/
/*global cordova*/

angular.module('starter.controllers', [])

.controller('SideMenuCtrl',['$scope', function($scope) {
    $scope.isCasino = true;
}])

.controller('LoginCtrl', ['$scope', function($scope) {
    
    $scope.registerCasinoButtonTapped = function() {
        console.log(cordova.plugins);
        if(cordova.plugins.email && cordova.plugins.email.isAvailable) {
            cordova.plugins.email.open({
                to:      'aaguilar@softstackfactory.com',
                subject: 'Casino Registration',
                body:    '<p>Casino name:</p>'+
                         '<p>Manager name:</p>'+
                         '<p>Manager email:</p>'+
                         '<p>Casino address</p>'+
                         '<p>Password</p>',
                isHtml: true
            },  function () {
                console.log('email view dismissed');
            }, this);
        }
    };
    
}])

.controller('RegisterCtrl', ['$scope','$state', 'UserService', '$ionicHistory','$window', 'SSFAlertsService', 'GeopointService', 'ReverseGeocodingService',
function($scope, $state, UserService, $ionicHistory, $window, SSFAlertsService, GeopointService, ReverseGeocodingService) {
    $scope.user = {};
    $scope.repeatPassword = {};
    
    $scope.$on('$ionicView.enter', function() {
     // Code you want executed every time view is opened
        if(GeopointService.isEmpty() == false) {
            $scope.user.location = GeopointService.getGeopoint();
            ReverseGeocodingService.reverseGeocodeWithCoordinates($scope.user.location.lat, $scope.user.location.lng)
            .then(function(response){
                console.log(response);
            });
        }
    });
    
    $scope.submitForm = function(form)
    {
        if(form.$valid)
        {   
            if($scope.user.password !== $scope.repeatPassword.password)
            {
                SSFAlertsService.showAlert("Warning","Passwords must match");
            }else {
                UserService.create($scope.user)
                .then(function(response) {
                    if (response.status === 200) {
                        loginAfterRegister();
                        form.$setPristine();
                    } else {
                        // status 422 in this case corresonds to the email already registered to the DB
                        if(response.status === 422)
                        {
                            SSFAlertsService.showAlert("Warning","The email is already taken.");
                        }else if(response.data === null){
                             //If the data is null, it means there is no internet connection.
                            SSFAlertsService.showAlert("Error","The connection with the server was unsuccessful, check your internet connection and try again later.");
                        }else {
                            SSFAlertsService.showAlert("Error","Something went wrong, try again.");
                        }
                    }
                }, function(response) {
                    // status 422 in this case corresonds to the email already registered to the DB
                    if(response.status === 422)
                    {
                        SSFAlertsService.showAlert("Warning","The email is already taken.");
                    }else if(response.data === null){
                         //If the data is null, it means there is no internet connection.
                        SSFAlertsService.showAlert("Error","The connection with the server was unsuccessful, check your internet connection and try again later.");
                    }else {
                        SSFAlertsService.showAlert("Error","Something went wrong, try again.");
                    }
                });
            }
        }
    };
    //Required to get the access token
    function loginAfterRegister()
    {
        UserService.login($scope.user)
        .then(function(response) {
            if (response.status === 200) {
                //Should return a token
                $window.localStorage["userID"] = response.data.userId;
                $window.localStorage['token'] = response.data.id;
                $ionicHistory.nextViewOptions({
                    historyRoot: true,
                    disableBack: true
                });
   //             $state.go('lobby');
            } else {
                // invalid response
  //              $state.go('landing');
            }
            resetFields();
        }, function(response) {
            // something went wrong
   //         $state.go('landing');
            resetFields();
        });
    }
    
    function resetFields()
    {
        $scope.user.email = "";
        $scope.user.firstName = "";
        $scope.user.lastName = "";
        $scope.user.hometown = "";
        $scope.user.country = "";
        $scope.user.location = {};
        $scope.user.hometown = "";
        $scope.user.username = "";
        $scope.user.password = "";
        $scope.repeatPassword.password = "";
    }
    
}])

.controller('MapViewCtrl', ['$scope','$ionicSideMenuDelegate', '$ionicHistory','uiGmapIsReady', 'uiGmapGoogleMapApi', 'GeopointService',
function($scope, $ionicSideMenuDelegate, $ionicHistory, uiGmapIsReady, uiGmapGoogleMapApi, GeopointService) {
    //Didsable opening the sidemenu with a swipe, due to google maps not being able to scroll
    $ionicSideMenuDelegate.canDragContent(false);
    $scope.map = {};
    $scope.marker = {};
    //Google maps Methods
    var onSuccess = function(position) {
        
        $scope.map = { 
            center: { latitude: position.coords.latitude, longitude: position.coords.longitude }, 
            zoom: 14,
            events: {
                click: function (map, eventName, originalEventArgs) {
                    var e = originalEventArgs[0];
                    var lat = e.latLng.lat(),lon = e.latLng.lng();
                    $scope.marker.coords.latitude = lat;
                    $scope.marker.coords.longitude = lon;
                    $scope.$apply();
                }
            },
            control: {}
        };
        $scope.marker = {
            id: 0,
            coords: { 
                latitude: position.coords.latitude, 
                longitude: position.coords.longitude
            }
        };
    };
    //Wait until google maps is ready before asking for position
    uiGmapGoogleMapApi.then(function(maps) {
        
        navigator.geolocation.getCurrentPosition(onSuccess, null);

    });
    
    uiGmapIsReady.promise().then(function(instances) {
       
        $scope.map.control.refresh();
    });
    
    $scope.doneButtonTapped = function() {
        
        GeopointService.setGeopoint($scope.marker.coords.latitude, $scope.marker.coords.longitude); 
        console.log($ionicHistory);
        $ionicHistory.goBack();
    };
}])

.controller('ViewCasinoCtrl', ['$scope','$ionicSideMenuDelegate', 'uiGmapIsReady',
function($scope, $ionicSideMenuDelegate, uiGmapIsReady) {
    //Didsable opening the sidemenu with a swipe, due to google maps not being able to scroll
    $ionicSideMenuDelegate.canDragContent(false);
    $scope.casino = {
        name: "Casino Royale", 
        geopoint: {
            latitude: 36.116410,
            longitude:  -115.174524
        }
    };
    
    $scope.isCasino = true;
   
    
    $scope.buttons = {
        activeButton: 0
    };
    
    resetButton();
    
    $scope.infoButtonClicked = function(value){
         if($scope.buttons.activeButton!= value)
            $scope.buttons.activeButton = value;
        else $scope.buttons.activeButton = 0;
    };
    
    function resetButton() {
        $scope.buttons.activeButton = 0;
    }
     //Google maps parameters methods
    $scope.map = { 
        center: { latitude: $scope.casino.geopoint.latitude, longitude:$scope.casino.geopoint.longitude }, 
        zoom: 14,
        control: {}
    };
    $scope.marker = {
        id: 0,
        coords: { 
            latitude: $scope.casino.geopoint.latitude, 
            longitude: $scope.casino.geopoint.longitude
        }
    };
    $scope.windowOptions = { visible: false };
   
    uiGmapIsReady.promise().then(function(instances) {
        $scope.map.control.refresh();
    });
    
    $scope.markerClick = function() {
        $scope.windowOptions.visible = !$scope.windowOptions.visible;
    };
    
    $scope.closeClick = function() {
        $scope.windowOptions.visible = false;
    };

}])

.controller('ManageTodayCtrl', ['$scope', function($scope){
    $scope.tournaments = [
        {name:'Crazy Monday', displayed: false},
        {name:'TUES FUN NIGHT', displayed: false},
        {name:'CRAZY THURSDAY', displayed: false}
        ];
        
    $scope.cashGames = [
        {name:'Low Rider', displayed: false}, 
        {name:'High Baller', displayed: false},
        {name:'Millonaire Maker', displayed: false},
        ];
}])

.controller('ManageUsersCtrl',['$scope', 'SSFAlertsService', function($scope, SSFAlertsService) {
    $scope.selectedUser;
    
    $scope.users = [{"name":"Harold Gottschalk", "role":"Admin"}, {"name":"Ryn Corbiel", "role":"Admin"},
    {"name":"Alex Baker", "role":"Secondary"}, {"name":"Andres Aguilar", "role":"Secondary"}];
    
    $scope.buttons = {
        activeButton:0
    };
    
    $scope.managedUser = resetUser();
    
    $scope.newUser = resetUser();
    
    $scope.toolbarButtonClicked = function(value) {
        if($scope.buttons.activeButton!= value)
            $scope.buttons.activeButton = value;
        else $scope.buttons.activeButton = 0;
        if (value == 3) {
            deleteProcess();
        }
    };
    
    $scope.selectUser = function(user) {
        $scope.selectedUser = user; 
        $scope.managedUser.name = $scope.selectedUser.name;
        $scope.managedUser.email = $scope.selectedUser.email;
        $scope.managedUser.mainUser = ($scope.selectedUser.role == "Admin") ? true : false;
    };
    
    function resetUser() {
        var cleanUser = {
            name: "",
            email:"",
            mainUser:false
        };
        return cleanUser;
    }
    
    function deleteProcess() {
        if($scope.selectedUser) {
            SSFAlertsService.showConfirm("Warning", "Are you sure you want to delete "+$scope.selectedUser.name + " ?")
            .then(function(response) {
                if (response == true) {
                    var index = $scope.users.indexOf($scope.selectedUser);
                    $scope.users.splice(index, 1);
                    $scope.managedUser = resetUser();
                }
            });
        }else {
            SSFAlertsService.showAlert("Error", "Please select a user first");
        }
    }
}]);
