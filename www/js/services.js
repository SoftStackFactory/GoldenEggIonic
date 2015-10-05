angular.module('GoldenEggServices', [])

.service('CasinoService',['$window', function($window){
    var service = this;
    var casinos = [];
    var specificCasino = {};
    
    var userCasino = $window.localStorage["userCasino"];
    if(userCasino === null || userCasino === undefined) {
        userCasino = {};
    } else {
        userCasino = JSON.parse(userCasino);
    }
    
    service.setAll = function(casinosData){
        casinos = casinosData;
    };
    
    service.setSpecific = function(specificCasinoData){
        specificCasino = specificCasinoData;
    };
    
    service.getAll = function(){
        return casinos;
    };
    
    service.specificCasinoInfo = function(){
        return specificCasino;
    };
    
    //APp user own casino Info
    service.getUserCasino = function() {
        return userCasino;  
    };
    
    service.setUserCasino = function(casinoInfo) {
        userCasino = casinoInfo;
        if(userCasino != null && userCasino != undefined) {
            $window.localStorage["userCasino"] = JSON.stringify(userCasino);
        }
    };
}])

.service('GeopointService', function () {
    
    var geopoint = {
        lat:"",
        lng:""
    };
    
    var isEmpty = true;
    
    var service = this;
    
    service.setGeopoint = function (latitude, longitude) {
        geopoint.lat = latitude;
        geopoint.lng = longitude;
        isEmpty = false;
    };
    
    service.getGeopoint = function () {
        return geopoint;
    };
    
    service.isEmpty = function() {
        return isEmpty;
    };
})

.service('ReverseGeocodingService', ["$http",function ($http) {
    
    //http://maps.google.com/maps/api/geocode/json?latlng=-33.873038,151.20563&sensor=false  
    var service = this;
    
    service.reverseGeocodeWithCoordinates = function(latitude, longitude) {
        return $http({
            url: "https://maps.google.com/maps/api/geocode/json?latlng="+latitude+","+longitude+"&result_type=locality|country&key=AIzaSyDe1iz5XarkeO1vPRUmzonCDbmyvWWS-9U",
            method: "GET",
        });
    };
 
}])

.service('MenuButtonService', function() {
    var service = this;
    
    service.isHidden = false;
})

.service('CasinoPlayerInfoService',['$window', function($window) {
    var service = this;

    var player = $window.localStorage["playerInfo"];
    
    if(player === null || player === undefined) {
        player = {};
    } else {
        player = JSON.parse(player);
    }
    
    //Store the information of the user retrieved from the DB in a service for convenience
    service.setPlayer = function(playerInfo){
        player = playerInfo;
        if(player != null && player != undefined) {
            $window.localStorage["playerInfo"] = JSON.stringify(player);
        }
    };
    
    //Information available: country,created,email,firstName,hometown,id,lastName,lastUpdated,username
    //Optional information (may not be set): location 
    service.getPlayer = function() {
        return player;
    }; 
    
    service.getPlayerName = function() {
        return player["firstName"] + " " + player["lastName"];
    };
}]);