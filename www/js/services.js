angular.module('GoldenEggServices', [])
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
            url: "https://maps.google.com/maps/api/geocode/json?latlng="+latitude+","+longitude+"&sensor=false",
            method: "GET",
        });
    };
 
}]);