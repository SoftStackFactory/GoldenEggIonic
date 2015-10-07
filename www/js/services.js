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
}])

.service('DynamicColorService', function() {
    var service = this;
    
    service.dynamicTextColor = function(color) {
        
        var rgb = hexToRGB(color);
        var d; 
    
        // Counting the perceptive luminance - human eye favors green color... 
        var a = 1 - ( 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b)/255;
    
        if (a < 0.5)
           d = "#000000"; // bright colors - black font
        else
           d = "#ffffff"; // dark colors - white font
        
        return d;
    };
    
    function hexToRGB(hex) {
        var rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        var result = {
            r: parseInt(rgb[1], 16),
            g: parseInt(rgb[2], 16),
            b: parseInt(rgb[3], 16)
        };
        return result;
    }
})
.service('ImageConverterService', ['$q', function($q) { 
    var service = this;
    
    service.imageToString = function(imageObject) {
        var defer = $q.defer();
        
        var fileReader = new FileReader();

        fileReader.onload = function(fileLoadedEvent) {
            var srcData = fileLoadedEvent.target.result; // <--- data: base64
            var result = srcData.split(',')[1];
           
            defer.resolve(result);
        };
        fileReader.readAsDataURL(imageObject);  
        return defer.promise;
    };
}]);