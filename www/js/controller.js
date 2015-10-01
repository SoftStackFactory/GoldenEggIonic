/*global angular*/
/*global cordova*/

angular.module('starter.controllers', [])

.controller('SideMenuCtrl',['$scope', '$window','MenuButtonService', 'CasinoService', '$ionicHistory', '$state', 'CasinoUsersService', 'UserService', 'SSFAlertsService', 'CasinoPlayerInfoService',
function($scope, $window, MenuButtonService, CasinoService, $ionicHistory, $state, CasinoUsersService, UserService, SSFAlertsService, CasinoPlayerInfoService) {
    $scope.isCasino = $window.localStorage["isCasino"] === "true";
    //TODO: uncomment next line to the real information from the local storage
    //$scope.isCasino = $window.localStorage["isCasino"] === "true";
    $scope.titleInfo = {};
    
    settingMenuTitle();
   
    $scope.$on('$ionicView.beforeEnter', function (e, data) {
        $scope.hideMenuButton = MenuButtonService.isHidden;
    });
    
    //Listen for a custom $emit event, fired after the information of the player is received
    $scope.$on('SideMenuInfoReceived', function(event) {
        settingMenuTitle();
    });
    
    function settingMenuTitle(){
        if($scope.isCasino == true) {
            var casinoInfo = CasinoService.specificCasinoInfo();
            return $scope.titleInfo = casinoInfo["name"];
            //need to set this to the players table information    
        }else{
            $scope.titleInfo = CasinoPlayerInfoService.getPlayerName();
        }
    }
    
    $scope.logout = function() {
        SSFAlertsService.showConfirm("Warning","Are you sure you want to exit?")
        .then(function(response) {
            if (response == true) {
                var token = $window.localStorage["token"];
                if($scope.isCasino == true){
                    CasinoUsersService.logout(token);
                }else {
                    UserService.logout(token);
                }
                $ionicHistory.nextViewOptions({
                    disableBack: true,
                    historyRoot: true
                });
                MenuButtonService.isHidden = true;
                $state.go("app.login");
                delete $window.localStorage['token'];
                delete $window.localStorage['userID'];
            }
        });
    };
   
}])

.controller('MyCasinoCtrl',['$scope', '$state', '$window', 'CasinoService', 'UserService', 'CasinoPlayerInfoService', 'CasinoSubscriptionService',
function($scope, $state, $window, CasinoService, UserService, CasinoPlayerInfoService, CasinoSubscriptionService) {
    //TODO: get the real information for the casinos
    $scope.casinos = [];
    
    $scope.list = {
        shouldShowDelete: false
    };
    
    $scope.$on('$ionicView.enter', function() {
        getUserInfo();
        getMyCasinos();
    });
    
    function getMyCasinos() {
        UserService.getAllMyCasino($window.localStorage["token"],$window.localStorage["userID"])
        .then(function(response) {
            $scope.casinos = response.data;
        });
    }
    
    function getUserInfo() {
        if($window.localStorage["isCasino"] === "false") {
            UserService.userInfo($window.localStorage["token"], $window.localStorage["userID"])
            .then(function(response) {
                CasinoPlayerInfoService.setPlayer(response["data"]);
                //Emit that the information is received, to update the UI from the side menu ctrl
                $scope.$emit("SideMenuInfoReceived");
            });
        }
    }
    
    $scope.itemClicked = function(item) {
        //set favorited flag to hide the "Add" button
        item["favorited"] = true;
        CasinoService.setSpecific(item);
        $state.go("app.viewCasino");
    };
    
    $scope.deleteFavorite = function(item, $index) {
        var token = $window.localStorage["token"];
        var userID = $window.localStorage["userID"];
        
        CasinoSubscriptionService.findSubscription(token,userID,item["id"])
        .then(function(response){
            if(response["status"] === 200) {
                var firstElement = response.data[0];
                CasinoSubscriptionService.deleteCasinoSubscription(token,firstElement["id"])
                .then(function(subscriptionResponse) {
                    $scope.casinos.splice($index,1);
                });
            }
        });
    };
}])

.controller('SearchCasinoCtrl',['$scope', '$state', '$window', 'ServerCasinoService', 'CasinoService', 
function($scope, $state, $window, ServerCasinoService,CasinoService) {
    //TODO: get the real information for the casinos
    $scope.casinos = [];
    
    ServerCasinoService.getAll($window.localStorage['token'])
    .then(function(response) {
        $scope.casinos = response["data"];
    });
    
    $scope.itemClicked = function(item) {
        //TODO: Set info for the view casino page
        CasinoService.setSpecific(item);
        $state.go("app.viewCasino");
    };
    
}])

.controller('LoginCtrl', ['$scope', '$ionicHistory', '$state', '$window','UserService', 'CasinoUsersService', 'SSFAlertsService', 'MenuButtonService', 'CasinoService', 'ServerCasinoService',
function($scope, $ionicHistory, $state, $window, UserService, CasinoUsersService, SSFAlertsService,MenuButtonService, CasinoService, ServerCasinoService) {
   
    MenuButtonService.isHidden = true;
    $scope.user = {};
    var rememberMeValue;
     if($window.localStorage["rememberMe"] === undefined || $window.localStorage["rememberMe"] == "true") {
        rememberMeValue = true;
    }else {
        rememberMeValue = false;
    }
    
    $scope.checkbox = {
        rememberMe : rememberMeValue
    };
    
    $scope.registerCasinoButtonTapped = function() {
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
    
    
    $scope.submitForm = function(form) {
        if(form.$valid)
        {   
            
            var loginService;
            if($scope.user.requestType === "User") {
                loginService = UserService;
            }else {
                loginService = CasinoUsersService;
            }
            loginService.login($scope.user)
            .then(function(response) {
                if (response.status === 200) {
                    //Should return a token
                    $ionicHistory.nextViewOptions({
                      historyRoot: true,
                      disableBack: true
                    });
                    MenuButtonService.isHidden = false;
                    
                    console.log(response);
                    //This if and else statments surrounded by commits is important because this is how allows us differentiate
                    //between the user and casino and the specific calls to the backend required for each type of user
                    if($scope.user.requestType === "User") {
                        $window.localStorage["isCasino"] = "false";
                        $window.localStorage['userID'] = response.data.userId;
                        $window.localStorage['token'] = response.data.id;
                        
                        ServerCasinoService.getAll($window.localStorage["token"])
                            .then(function(response){
                                if(response.status === 200){
                                    CasinoService.setAll(response.data);
                                }else{
                                    if(response.status === 401){
                                        SSFAlertsService.showAlert("Error","Incorrect username or password");
                                    }else {
                                        SSFAlertsService.showAlert("Error", "Wasn't able to retrieve casino data.");
                                    }
                                }
                            }, function(response){
                                 if(response.status === 401){
                                        SSFAlertsService.showAlert("Error","Incorrect username or password");
                                    } else if(response.status === null){
                                        SSFAlertsService.showAlert("Error","The connection with the server was unsuccessful, check your internet connection and try again later.");
                                    } else {
                                        SSFAlertsService.showAlert("Error", "Wasn't able to retrieve casino data.");
                                    }
                        });
                        
                        $state.go('app.myCasino');
                    }else {
                        $window.localStorage["isCasino"] = "true";
                        $window.localStorage['userID'] = response.data.userId;
                        $window.localStorage['token'] = response.data.id;
                        
                        CasinoUsersService.getUsersCasino($window.localStorage["userID"], $window.localStorage["token"])
                            .then(function(response){
                                if(response.status === 200){
                                    $window.localStorage['casinoID'] = response.data.casinoId;
                                    ServerCasinoService.getSpecific($window.localStorage["casinoID"],$window.localStorage["token"])
                                    .then(function(response){
                                        if(response.status === 200){
                                            CasinoService.setSpecific(response.data);
                                            console.log(response.data);
                                        } else{
                                            if(response.status === 401){
                                                SSFAlertsService.showAlert("Error","Incorrect username or password");
                                            }else {
                                                SSFAlertsService.showAlert("Error", "Wasn't able to retrieve casino data.");
                                            }
                                        }
                                        
                                    }, function(response){
                                        if(response.status === 401){
                                                SSFAlertsService.showAlert("Error","Incorrect username or password");
                                            } else if(response.status === null){
                                                SSFAlertsService.showAlert("Error","The connection with the server was unsuccessful, check your internet connection and try again later.");
                                            } else {
                                                SSFAlertsService.showAlert("Error", "Wasn't able to retrieve casino data.");
                                            }
                                    });
                                }else{
                                    if(response.status === 401){
                                        SSFAlertsService.showAlert("Error","Incorrect username or password");
                                    }else {
                                        SSFAlertsService.showAlert("Error", "Wasn't able to retrieve casino data.");
                                    }
                                }
                            }, function(response){
                                 if(response.status === 401){
                                        SSFAlertsService.showAlert("Error","Incorrect username or password");
                                    } else if(response.status === null){
                                        SSFAlertsService.showAlert("Error","The connection with the server was unsuccessful, check your internet connection and try again later.");
                                    } else {
                                        SSFAlertsService.showAlert("Error", "Wasn't able to retrieve casino data.");
                                    }
                            });
                        //the end result of then http get call for the specific casino information
                        $state.go('app.manageToday');
                    } 
                    //---------------------------------------------------------
                    
                    if($scope.checkbox.rememberMe) {
                        $window.localStorage["username"] = $scope.user.username;
                    }else {
                        delete $window.localStorage["username"];
                        $scope.user.email = "";
                    }
                    $window.localStorage["rememberMe"] = $scope.checkbox.rememberMe;
                    $scope.user.password = "";
                    form.$setPristine();
                } else {
                    // invalid response
                    if(response.status === 401)
                    {
                        SSFAlertsService.showAlert("Error","Incorrect username or password");
                    }else {
                        SSFAlertsService.showAlert("Error", "Something went wrong, try again.");
                    }
                }
            }, function(response) {
                // Code 401 corresponds to Unauthorized access, in this case, the email/password combination was incorrect.
                if(response.status === 401)
                {
                    SSFAlertsService.showAlert("Error","Incorrect username or password");
                }else if(response.data === null) {
                //If the data is null, it means there is no internet connection.
                    SSFAlertsService.showAlert("Error","The connection with the server was unsuccessful, check your internet connection and try again later.");
                }else {
                    SSFAlertsService.showAlert("Error","Something went wrong, try again.");
                }
                
            });
        }
    };

}])

.controller('RegisterCtrl', ['$scope','$state', 'UserService', '$ionicHistory','$window', 'SSFAlertsService', 'GeopointService', 'ReverseGeocodingService', 'MenuButtonService', 'ServerCasinoService', 'CasinoService', '$stateParams', 'CasinoPlayerInfoService',
function($scope, $state, UserService, $ionicHistory, $window, SSFAlertsService, GeopointService, ReverseGeocodingService, MenuButtonService, ServerCasinoService, CasinoService, $stateParams, CasinoPlayerInfoService) {
    $scope.user = {};
    $scope.repeatPassword = {};
    //To know if this is a new register or an account edit. 
    $scope.editing = $stateParams.editing;
    
    if($scope.editing) {
        var savedUser = CasinoPlayerInfoService.getPlayer();
        $scope.user.country = savedUser.country;
        $scope.user.email = savedUser.email;
        $scope.user.firstName = savedUser.firstName;
        $scope.user.hometown = savedUser.hometown;
        $scope.user.lastName = savedUser.lastName;
        $scope.user.username = savedUser.username;
        $scope.submitButtonlabel = "Update";
    }else {
        $scope.submitButtonlabel = "Register";
    }
    
    $scope.$on('$ionicView.enter', function() {
     // Code you want executed every time view is opened
        if(GeopointService.isEmpty() == false) {
            $scope.user.location = GeopointService.getGeopoint();
            ReverseGeocodingService.reverseGeocodeWithCoordinates($scope.user.location.lat, $scope.user.location.lng)
            .then(function(response){
                console.log(response);
                response.data.results.forEach(function(addressObjects){ 
                    addressObjects.address_components.forEach(function(addressComponents) {
                        console.log(addressComponents.types.indexOf("locality"));
                       if(addressComponents.types.indexOf("locality")>-1 ) {
                            $scope.user.hometown = addressComponents.long_name;
                        }
                        if(addressComponents.types.indexOf("country")>-1) {
                            $scope.user.country = addressComponents.long_name;
                        } 
                    });
                });
            });
        }
    });
    
    $scope.submitForm = function(form)
    {
        if(form.$valid)
        {   
            if($scope.editing) {
                //If password is not undefined, its length is greater than 0, and passwords are different
                if(($scope.user.password !== $scope.repeatPassword.password) && 
                (($scope.user.password !== undefined && $scope.user.password.length>0) || 
                ($scope.repeatPassword.password !== undefined && $scope.repeatPassword.password.length>0))) 
                {
                    SSFAlertsService.showAlert("Warning","Passwords must match");
                }else {
                
                    if($scope.user.password !== undefined && $scope.user.password.length == 0) {
                        delete $scope.user["password"];
                    }
                    UserService.update($window.localStorage["token"], $window.localStorage["userID"], $scope.user)
                    .then(function(response) {
                        if (response.status === 200) {
                            form.$setPristine();
                            SSFAlertsService.showAlert("Good news!","Information updated successfully.");
                        } else {
                           failedResponse(response);
                        }
                    }, function(response) {
                        failedResponse(response);
                    });
                }
            }
            else {
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
                           failedResponse(response);
                        }
                    }, function(response) {
                        failedResponse(response);
                    });
                }
            }
        }else {
            SSFAlertsService.showAlert("Warning","Please enter the information required");
        }
    };
    
    function failedResponse(response) {
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
    //Required to get the access token
    function loginAfterRegister()
    {
        UserService.login($scope.user)
        .then(function(response) {
            if (response.status === 200) {
                //Should return a token
                $ionicHistory.nextViewOptions({
                  historyRoot: true,
                  disableBack: true
                });
                MenuButtonService.isHidden = false;

                $window.localStorage["isCasino"] = "false";
                $window.localStorage['userID'] = response.data.userId;
                $window.localStorage['token'] = response.data.id;
                
                ServerCasinoService.getAll($window.localStorage["token"])
                .then(function(response){
                    if(response.status === 200){
                        CasinoService.setAll(response.data);
                    }else{
                        if(response.status === 401){
                            SSFAlertsService.showAlert("Error","Incorrect username or password");
                        }else {
                            SSFAlertsService.showAlert("Error", "Wasn't able to retrieve casino data.");
                        }
                    }
                }, function(response){
                     if(response.status === 401){
                            SSFAlertsService.showAlert("Error","Incorrect username or password");
                        } else if(response.status === null){
                            SSFAlertsService.showAlert("Error","The connection with the server was unsuccessful, check your internet connection and try again later.");
                        } else {
                            SSFAlertsService.showAlert("Error", "Wasn't able to retrieve casino data.");
                        }
                });
                
                $state.go('app.myCasino');
                
                //---------------------------------------------------------
                
                $window.localStorage["username"] = $scope.user.username;
            }
            else {
                // invalid response
                $state.go('app.login');
            }
            resetFields();
        }, function(response) {
            // something went wrong
            $state.go('app.login');
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
        $ionicHistory.goBack();
    };
}])

.controller('TournamentTemplateCtrl', ['$scope', 'TournamentService', '$window', 'SSFAlertsService',
function($scope, TournamentService, $window, SSFAlertsService){
    $scope.tournament = {}
    
    function resetTemplate(){
        $scope.tournament.name = "";
        $scope.tournament.style = "";
        $scope.tournament.startTime = "";
        $scope.tournament.entryCost = "";
        $scope.tournament.startStack = "";
        $scope.tournament.numReloads = "";
        $scope.tournament.reloadCost = "";
        $scope.tournament.reloadStack = "";
        $scope.tournament.regEnd = "";
        $scope.tournament.regStart = "";
    }
    
    
    $scope.submitTemplate = function(tournament){
        if(tournament.$valid){
            
            $scope.tournament.casinoId = $window.localStorage["casinoID"];
            
            TournamentService.create($scope.tournament, $window.localStorage["token"])
            .then(function(response){
                if(response.status === 200){
                    tournament.$setPristine;
                }else{
                    if(response.status === 401){
                        SSFAlertsService.showAlert("Error", "You're unauthorized to perform such task.");
                    } else if (response.status === null){
                        SSFAlertsService.showAlert("Error", "The connection with the server was unsuccessful, check your internet connection and try again later.");
                    }
                    else{
                        SSFAlertsService.showAlert("Error", "Something went wrong, try again");
                    }
                }
                
                resetTemplate();
                
            }, function(response){
                if(response.status === 401){
                    SSFAlertsService.showAlert("Error", "You're unauthorized to perform such task.");
                } else if (response.status === null){
                    SSFAlertsService.showAlert("Error", "The connection with the server was unsuccessful, check your internet connection and try again later.");
                }
                else{
                    SSFAlertsService.showAlert("Error", "Something went wrong, try again");
                }
                resetTemplate();
            });
        }    
    };
    
}])

.controller('CashGameTemplateCtrl', ['$scope', 'CashGameService', '$window', 'SSFAlertsService',
function($scope, TournamentService, $window, SSFAlertsService){
    $scope.cashGame = {};
    
    function resetTemplate(){
        $scope.cashGame.name = "";
        $scope.cashGame.style = "";
        $scope.cashGame.min = "";
        $scope.cashGame.max = "";
        $scope.cashGame.smallBlind = "";
        $scope.cashGame.bigBlind = "";
    }
    
    
    $scope.submitTemplate = function(cashGame){ //i need the actual casino model 
        if(cashGame.$valid){
            
            $scope.cashGame.casinoId = $window.localStorage["casinoID"];
            
            TournamentService.create($scope.cashGame, $window.localStorage["token"])
            .then(function(response){
                if(response.status === 200){
                    cashGame.$setPristine;
                }else{
                    if(response.status === 401){
                        SSFAlertsService.showAlert("Error", "You're unauthorized to perform such task.");
                    } else if (response.status === null){
                        SSFAlertsService.showAlert("Error", "The connection with the server was unsuccessful, check your internet connection and try again later.");
                    }
                    else{
                        SSFAlertsService.showAlert("Error", "Something went wrong, try again");
                    }
                }
                
                resetTemplate();
                
            }, function(response){
                if(response.status === 401){
                    SSFAlertsService.showAlert("Error", "You're unauthorized to perform such task.");
                } else if (response.status === null){
                    SSFAlertsService.showAlert("Error", "The connection with the server was unsuccessful, check your internet connection and try again later.");
                }
                else{
                    SSFAlertsService.showAlert("Error", "Something went wrong, try again");
                }
                resetTemplate();
            });
        }    
    };
    
}])


.controller('ViewCasinoCtrl', ['$scope', '$window', 'CasinoService', '$ionicSideMenuDelegate', 'uiGmapIsReady', 
            'TournamentService', 'TodayTournamentService', 'CashGameService', 'TodayCashGamesService', 'SSFAlertsService', 'CasinoSubscriptionService', '$q', 'BlindService',
function($scope, $window, CasinoService, $ionicSideMenuDelegate, uiGmapIsReady, 
            TournamentService, TodayTournamentService, CashGameService, TodayCashGamesService, SSFAlertsService, CasinoSubscriptionService, $q, BlindService) {
    //Disable opening the sidemenu with a swipe, due to google maps not being able to scroll
    $ionicSideMenuDelegate.canDragContent(false);
    $scope.casino = {
        geopoint: {
            latitude: 36.116410,
            longitude:  -115.174524
        }
    };
    
    //there is a few things that needs to be changed to the backend relating to the tournament information. 
    // We need to keep timers that are stable and will continue the countdown once they're recieved but....
    // wouldn't take too much time to it on the client-side?
    
    $scope.casinoInfo = {};
    $scope.blindInfo = [];
    $scope.tournamentInfo = [];
    $scope.currentTournaments = [];
    $scope.cashGameInfo = [];
    $scope.currentCashGames = [];
    $scope.settingInfoCalls = [{
            serviceUsed: TournamentService, 
            infoUsed: [ ],
            infoStored: [ ]
          }, {
            serviceUsed: BlindService, 
            infoUsed: [ ],
            infoStored: [ ]
          },{
            serviceUsed: CashGameService, 
            infoUsed: [ ],
            infoStored: [ ] 
          }];
    $scope.currentHttpCalls = [
           {
            serviceUsed: TodayTournamentService, 
            infoStored: [ ]
          }, {
            serviceUsed: TodayCashGamesService, 
            infoStored: [ ]
          }];
    $scope.pos = 0;
    
    $scope.buttons = {
        activeButton: 0
    };
    
    resetButton();
    var fetchingInfo = getInformation($scope.currentHttpCalls[$scope.pos]);
    
    fetchingInfo.then(function(success){
        return getInformation($scope.currentHttpCalls[$scope.pos]);
    });
    
    $scope.infoButtonClicked = function(value){
         if($scope.buttons.activeButton!= value)
            $scope.buttons.activeButton = value;
        else $scope.buttons.activeButton = 0;
    };
    
    function resetButton() {
        $scope.buttons.activeButton = 0;
    }
    
    //getting casino information for the casino view page
    
    function getInformation(currentModel){//getting cashGame and Tournament information
        var nextService = $q.defer();
    
        $scope.isCasino = $window.localStorage["isCasino"] === "true";
        $scope.casinoInfo = CasinoService.specificCasinoInfo();
              
              currentModel.serviceUsed.getAll($window.localStorage["casinoID"], $window.localStorage["token"])
                .then(function(response){
                if(response.status === 200){
                    if($scope.pos === 0){
                        $scope.currentTournaments = response.data;
                        $scope.pos = 1;
                    } else if ($scope.pos === 1){
                        $scope.currentCashGames = response.data;
                        setInformation();
                    }
                    
                    nextService.resolve(true);
                    
                }else{
                    if(response.status === 401){
                        SSFAlertsService.showAlert("Error", "You're unauthorized to perform such task.");
                    } else if (response.status === null){
                        SSFAlertsService.showAlert("Error", "The connection with the server was unsuccessful, check your internet connection and try again later.");
                    }
                    else{
                        SSFAlertsService.showAlert("Error", "Something went wrong, try again");
                    }
                }
            }, function(response){
                if(response.status === 401){
                        SSFAlertsService.showAlert("Error", "You're unauthorized to perform such task.");
                    } else if (response.status === null){
                        SSFAlertsService.showAlert("Error", "The connection with the server was unsuccessful, check your internet connection and try again later.");
                    }
                    else{
                        SSFAlertsService.showAlert("Error", "Something went wrong, try again");
                    }
            });
            
            return nextService.promise;
        
    }
    
    function setInformation(){
        
            $scope.settingInfoCalls.forEach(function(call, index){
                if(index === 0 || index === 1){
                    call.infoUsed = angular.copy($scope.currentTournaments);
                } else if (index === 2){
                    call.infoUsed = angular.copy($scope.currentCashGames);
                }
                call.infoUsed.forEach(function(individualModel){
                    var objID; // the object ID I need
                    if(index === 0 || index === 1){
                        objID = individualModel.tournamentId;
                    } else if (index === 1){
                        objID = individualModel.cashGameId;
                    }

                    if(call.infoUsed.length != 0){
                        call.serviceUsed.getSpecific(objID, $window.localStorage["token"])
                            .then(function(response){
                            if(response.status === 200){
                                call.infoStored = response.data;
                                console.log(call.infoStored);
                                if(index === 0){
                                    $scope.tournamentInfo = call.infoStored;
                                } else if (index === 1){
                                    $scope.blindInfo = call.infoStored;
                                }
                                else if (index === 2){
                                    $scope.cashGameInfo = call.infoStored;
                                }
                            }else{
                                if(response.status === 401){
                                    SSFAlertsService.showAlert("Error", "You're unauthorized to perform such task.");
                                } else if (response.status === null){
                                    SSFAlertsService.showAlert("Error", "The connection with the server was unsuccessful, check your internet connection and try again later.");
                                }
                                else{
                                    SSFAlertsService.showAlert("Error", "Something went wrong, try again");
                                }
                            }
                        }, function(response){
                            if(response.status === 401){
                                    SSFAlertsService.showAlert("Error", "You're unauthorized to perform such task.");
                                } else if (response.status === null){
                                    SSFAlertsService.showAlert("Error", "The connection with the server was unsuccessful, check your internet connection and try again later.");
                                }
                                else{
                                    SSFAlertsService.showAlert("Error", "Something went wrong, try again");
                                }
                }); }
            });        
        });
        
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
    
    $scope.favoritesButtonTapped = function() {
        var playerID = $window.localStorage["userID"];
        var casinoID = $scope.casinoInfo["id"];
        var subscriptionInfo = {"casinoId":casinoID, "playerId": playerID};
        CasinoSubscriptionService.create(subscriptionInfo, $window.localStorage["token"])
        .then(function(response) {
            console.log(response);
            SSFAlertsService.showAlert("Well done!","This casino is now added to your casinos list.");
        });
    };
    
}])

.controller('ManageTodayCtrl', [ '$scope', '$window', '$state', '$q', 'TournamentService', 'CashGameService', 'SSFAlertsService', 'TodayTournamentService', 'TodayCashGamesService', '$ionicHistory',
    function($scope, $window, $state, $q, TournamentService, CashGameService, SSFAlertsService, TodayTournamentService, TodayCashGamesService, $ionicHistory){
    $scope.manageTournaments = [];
    $scope.currentTournaments = [];    
    $scope.manageCashGames = [];
    $scope.currentCashGames = [];
    $scope.httpCalls = [TodayTournamentService, TodayCashGamesService, TournamentService, CashGameService];
    $scope.todayModels = [{ 
            serviceUsed: TodayTournamentService,
            infoStored: [ ]
          }, {
            serviceUsed: TodayCashGamesService, 
            infoStored: [ ]
          }];
    $scope.n = 0;
    
    
    var promise = getInfo($scope.httpCalls[$scope.n]); //this assigns the getInfo function to my promise value
    
    promise.then(function(success){ return getInfo($scope.httpCalls[$scope.n]); })
    .then(function(success){ return getInfo($scope.httpCalls[$scope.n]); })
    .then(function(success){ return getInfo($scope.httpCalls[$scope.n]); } ,function(failure){
        //dont know if i need to fill info in here?
    });

    $scope.updatingView = function(){
        var deletingModels = deleteCurrentInfo();
        var updatingModels = settingForPush($scope.todayModels);
        
        deletingModels.then(function(success){
            
            $scope.n = 0;
            
            updatingModels.then(function(success){ 
                $ionicHistory.nextViewOptions({
                    disableBack: true
                });
                $state.go('app.viewCasino');
                SSFAlertsService.showAlert("Update", "You have just updated your Casinos page!");
            });
                
        }, function(error) {
            console.log("error");
        });
    }; 
    
    function settingForPush (todayModels){ //trying to control the flow of the post to the backend 
                                           // i believe that how fast i go to a different state is faster than a backend post
            var setPushes = $q.defer();                      
                
            todayModels.forEach(function(todayModel, index){
                if(index === 0 && $scope.manageTournaments.length != 0){
                    $scope.manageTournaments.forEach(function(tournament){
                        $scope.update = {};
                        
                        if(tournament.displayed === true){
                            $scope.update.tournamentId = angular.copy(tournament.id);
                            $scope.update.casinoId = angular.copy(tournament.casinoId);
                            todayModel.infoStored.push($scope.update);
                        }
                    });
                } else if (index === 1 && $scope.manageCashGames.length != 0){
                    $scope.manageCashGames.forEach(function(cashGame){
                        $scope.update = {};
                        
                        if(cashGame.displayed === true){
                            $scope.update.cashGameId = angular.copy(cashGame.id);
                            $scope.update.casinoId = angular.copy(cashGame.casinoId);
                            todayModel.infoStored.push($scope.update);
                        }
                    });
                }
                
                if(todayModel.infoStored.length != 0){
                    todayModel.infoStored.forEach(function(model, counter){
                       console.log(model);
                       // iterating through all of the models and sending them to back end creating new instances of that model.
                       todayModel.serviceUsed.create(model, $window.localStorage["token"]) 
                        .then(function(response){
                           if(response.status === 200){
                                if (index === 1 && todayModel.infoStored.length === counter) {
                                   setPushes.resolve(true);
                                 }
                               
                           } else {
                               if(response.status === 401){
                                    SSFAlertsService.showAlert("Error", "You're unauthorized to perform such task.");
                                }else if (response.status === null){
                                    SSFAlertsService.showAlert("Error", "The connection with the server was unsuccessful, check your internet connection and try again later.");
                                }else{
                                    SSFAlertsService.showAlert("Error", "Something went wrong, try again. Location: Inside the success loop.");
                                }
                           }
                           
                       }, function(response){
                           if(response.status === 401){
                                SSFAlertsService.showAlert("Error", "You're unauthorized to perform such task.");
                            }else if (response.status === null){
                                SSFAlertsService.showAlert("Error", "The connection with the server was unsuccessful, check your internet connection and try again later.");
                            }else{
                                SSFAlertsService.showAlert("Error", "Something went wrong, try again. Location: Inside failure loop.");
                            }
                       }); 
                       
                    }); 
                } else if(index === 1){
                    setPushes.resolve(true);
                }
            });
            return setPushes.promise;
        }
    
    function deleteCurrentInfo (){//deleting the current information displayed in the today models
        
        var controlFlow = $q.defer();
           
        $scope.todayModels.forEach(function(call, index){
            
            if(index === 0){
                call.infoStored = $scope.currentTournaments;
            } else if (index === 1){
                call.infoStored = $scope.currentCashGames;
            }
            
            if(call.infoStored.length != 0){
            
                call.infoStored.forEach(function(deleteModels, counter){
                    console.log(deleteModels);
                    call.serviceUsed.terminate(deleteModels.id, $window.localStorage["token"])
                    .then(function(response){
                        console.log(response);
                        if(response.status === 204){
                            console.log("deleted a model");
                            if(index === 1 && call.infoStored.length === counter){
                                controlFlow.resolve(true);
                            }
                            
                        }  else if(response.status === 401){
                            SSFAlertsService.showAlert("Error", "You're unauthorized to perform such task.");
                        } else if (response.status === null){
                            SSFAlertsService.showAlert("Error", "The connection with the server was unsuccessful, check your internet connection and try again later.");
                        } else{
                            SSFAlertsService.showAlert("Error", "Something went wrong, try again");
                        }
                    }, function(response){
                            if(response.status === 401){
                                SSFAlertsService.showAlert("Error", "You're unauthorized to perform such task.");
                            } else if (response.status === null){
                                SSFAlertsService.showAlert("Error", "The connection with the server was unsuccessful, check your internet connection and try again later.");
                            } else{
                                SSFAlertsService.showAlert("Error", "Something went wrong, try again");
                        }
                    });
                });
            } else if (index === 1) {
                controlFlow.resolve(true);
            }
        });
        
        return controlFlow.promise;
    }
    
    function getInfo(serviceUsed){
        var nextService = $q.defer();
        
        serviceUsed.getAll($window.localStorage["casinoID"], $window.localStorage["token"])
                    .then(function(response){
                    if(response.status === 200){
                        console.log(response.data);
                        nextService.resolve(true);
                        if($scope.n === 0){
                            $scope.currentTournaments = response.data;
                            $scope.n = 1;
                            
                        } else if($scope.n === 1){
                            $scope.currentCashGames = response.data;
                            $scope.n = 2;
                            
                        } else if($scope.n === 2){
                            $scope.manageTournaments = response.data;
                            $scope.n = 3;
                            
                        }else if ($scope.n === 3){
                            $scope.manageCashGames = response.data;
                            $scope.n = 4;
                            setInfo();
                        }
                        
                    }else{
                        if(response.status === 401){
                            SSFAlertsService.showAlert("Error", "You're unauthorized to perform such task.");
                        } else if (response.status === null){
                            SSFAlertsService.showAlert("Error", "The connection with the server was unsuccessful, check your internet connection and try again later.");
                        }
                        else{
                            SSFAlertsService.showAlert("Error", "Something went wrong, try again");
                        }
                        nextService.reject(false);
                    }
                }, function(response){
                    if(response.status === 401){
                            SSFAlertsService.showAlert("Error", "You're unauthorized to perform such task.");
                        } else if (response.status === null){
                            SSFAlertsService.showAlert("Error", "The connection with the server was unsuccessful, check your internet connection and try again later.");
                        }
                        else{
                            SSFAlertsService.showAlert("Error", "Something went wrong, try again");
                        }
                    });
                    
                return nextService.promise;
    }
    
    function setInfo() { //function that sets the checks and necessary properties in place
        
        $scope.manageTournaments.forEach(function(tournament){
            tournament.displayed = false;
            
            //make sure to change the tournament.name to tournament.tournamentId
                $scope.currentTournaments.forEach(function(currentTournament){
                    if(tournament.id === currentTournament.tournamentId){ 
                        tournament.displayed = true;
                    }
                });
        });
        
        $scope.manageCashGames.forEach(function(cashGame){
            cashGame.displayed = false;
            
            $scope.currentCashGames.forEach(function(currentCashGame){
                if(cashGame.id === currentCashGame.cashGameId){ 
                    cashGame.displayed = true;
                }
            });
        });
    }
    
}])

.controller('CreatePostCtrl', ['$scope', 'SSFAlertsService', '$window',
    function($scope, SSFAlertsService, $window){
        $scope.post = {};
        
        $scope.post.postDate = new Date();
        $scope.post.casinoId = $window.localStorage["casinoID"];
    
}])

.controller('ManageUsersCtrl',['$scope', '$window', 'SSFAlertsService', 'CasinoUsersService',
function($scope, $window, SSFAlertsService, CasinoUsersService) {
    $scope.selectedUser;
    
    $scope.users = [];
    
    $scope.buttons = {
        activeButton:0
    };
    
    $scope.managedUser = resetUser();
    
    $scope.newUser = resetUser();
    
    getCasinoUsers();
    
    function getCasinoUsers() {
        CasinoUsersService.getAll($window.localStorage["casinoID"],$window.localStorage["token"])
        .then(function(response) {
            console.log(response);
            if(response.status == 200) {
                $scope.users = response.data;
            }else {
                SSFAlertsService("Sorry!","We could not fetch the information at this moment. Try again later.");
            }
        }, function(response) {
            SSFAlertsService("Sorry!","We could not fetch the information at this moment. Try again later.");
        });
    }
    
    
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
        $scope.managedUser.username = $scope.selectedUser.username;
        $scope.managedUser.firstName = $scope.selectedUser.firstName;
        $scope.managedUser.lastName = $scope.selectedUser.lastName;
        $scope.managedUser.email = $scope.selectedUser.email;
        $scope.managedUser.role = ($scope.selectedUser.role == "Admin") ? true : false;
    };
    
    function resetUser() {
        var cleanUser = {
            firstName: "",
            lastName: "",
            email:"",
            role: false
        };
        return cleanUser;
    }
    
    function deleteProcess() {
        if($scope.selectedUser) {
            SSFAlertsService.showConfirm("Warning", "Are you sure you want to delete "+$scope.selectedUser.firstName + " " + $scope.selectedUser.lastName + " ?")
            .then(function(response) {
                if (response == true) {
                    CasinoUsersService.delete($scope.selectedUser.id, $window.localStorage["token"])
                    .then(function(response) {
                        console.log(response);
                        if(response.status === 200 || response.status === 204) {
                            var index = $scope.users.indexOf($scope.selectedUser);
                            $scope.users.splice(index, 1);
                            $scope.managedUser = resetUser();
                            $scope.selectedUser = null;
                        }else {
                            SSFAlertsService.showAlert("Error", "We could not delete the user at this moment. Try again later.");
                        }
                    }, function() {
                        SSFAlertsService.showAlert("Error", "We could not delete the user at this moment. Try again later.");
                    });
                }
            });
        }else {
            SSFAlertsService.showAlert("Error", "Please select a user first");
        }
    }
    
    $scope.submitNewCasinoUserForm = function(form) {
        if(form.$valid) {
            $scope.newUser["casinoId"] = $window.localStorage["casinoID"];
            $scope.newUser["password"] = $scope.newUser.username;
            if($scope.newUser.role) {
                $scope.newUser.role = "Admin";
            }else {
                $scope.newUser.role = "Secondary";
            }
            CasinoUsersService.create($scope.newUser)
            .then(function(response) {
                console.log(response);
                if(response.status === 200)
                {
                    $scope.buttons.activeButton = 0;
                    SSFAlertsService.showAlert("Good news!", "User registered correctly.");
                    $scope.users.push(response.data);
                    form.$setPristine;
                }else {
                    SSFAlertsService.showAlert("Error", "We could not create the user at this moment. Try again later.");
                }
            }, function(response) {
                SSFAlertsService.showAlert("Error", "We could not create the user at this moment. Try again later.");
            });
        }else {
            SSFAlertsService.showAlert("Warning", "Please supply the information required.");
        }
    };
    
    $scope.submitEditCasinoUserForm = function(form) {
        if(form.$valid) {
            if($scope.managedUser.role) {
                $scope.managedUser.role = "Admin";
            }else {
                $scope.managedUser.role = "Secondary";
            }
            console.log($scope.managedUser);
            CasinoUsersService.update($scope.selectedUser.id, $scope.managedUser, $window.localStorage["token"])
            .then(function(response) {
                console.log(response);
                if(response.status === 200)
                {
                    SSFAlertsService.showAlert("Good news!", "User edited correctly.");
                    $scope.buttons.activeButton = 0;
                    var index = $scope.users.indexOf($scope.selectedUser);
                    $scope.users[index] = response.data;
                    $scope.managedUser = resetUser();
                    $scope.selectedUser = null;
                    form.$setPristine;
                }else {
                    SSFAlertsService.showAlert("Error", "We could not edit the user at this moment. Try again later.");
                }
            }, function(response) {
                SSFAlertsService.showAlert("Error", "We could not edit the user at this moment. Try again later.");
            });
        }else {
            SSFAlertsService.showAlert("Warning", "Please supply the information required.");
        }
    };
}]);