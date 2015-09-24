angular.module('RESTConnection', [])
.constant('ENDPOINT_URL', 'https://goldenegg-hgottschalk-ssf.c9.io/api/')

.service('TodayTournamentService', [ '$http', 'ENDPOINT_URL', function($http, ENDPOINT_URL){
    var service = this,
    path = 'todayTournaments/';
    
    function getUrl (){
      return ENDPOINT_URL + path;
    }
    
    service.create = function(todayTournament,  token){
      
      return $http({
                url: getUrl(),
                method: "POST",
                data: JSON.stringify(todayTournament),
                headers: {
                    'Authorization': token
                }
      });
    };
    
    service.terminate = function(todayTournament, token){
      return $http({
                url: getUrl()+"/"+todayTournament,
                method: "DELETE",
                headers: {
                    'Authorization': token
                }
      });
    };
    
    service.getAll = function(casino, token){
      return $http.get(getUrl()+"?filter[where][casinoId]="+casino, {
        params: { access_token: token }
      });
    };
}])

.service('TodayCashGamesService', [ '$http', 'ENDPOINT_URL', function($http, ENDPOINT_URL){
    var service = this,
    path = 'todayCashGames/';
    
    function getUrl (){
      return ENDPOINT_URL + path;
    }
    
    service.create = function(todayCashGames, token){
      return $http({
                url: getUrl(),
                method: "POST",
                data: JSON.stringify(todayCashGames),
                headers: {
                    'Authorization': token
                }
      });
    };
    
    service.terminate = function(todayCashGames, token){
      return $http({
                url: getUrl()+"/"+todayCashGames,
                method: "DELETE",
                headers: {
                    'Authorization': token
                }
      });
    };
    
    service.getAll = function(casino, token){
      return $http.get(getUrl()+"?filter[where][casinoId]="+casino, {
        params: { access_token: token }
      });
    };
}])

.service('CashGameService', [ '$http', 'ENDPOINT_URL', function($http, ENDPOINT_URL){
    var service = this,
    path = 'cashGames/';
    
    function getUrl (){
      return ENDPOINT_URL + path;
    }
    
    service.create = function(cashGame, token){
      return $http({
                url: getUrl(),
                method: "POST",
                data: JSON.stringify(cashGame),
                headers: {
                    'Authorization': token
                }
      });
    };
    
    service.getSpecific = function(cashGame, token){
      return $http.get(getUrl()+"/"+cashGame, {
          params: { access_token: token }
        });
    };
    
    service.getAll = function(casino, token){
      return $http.get(getUrl()+"?filter[where][casinoId]="+casino, {
        params: { access_token: token }
      });
    };
}])

.service('TournamentService', [ '$http', 'ENDPOINT_URL', function($http, ENDPOINT_URL){
    var service = this,
    path = 'tournaments/';
    
    function getUrl (){
      return ENDPOINT_URL + path;
    }
    
    service.create = function(tournament, token){
      return $http({
                url: getUrl(),
                method: "POST",
                data: JSON.stringify(tournament),
                headers: {
                    'Authorization': token
                }
      });
    };
    
    service.getSpecific = function(tournament, token){
      return $http.get(getUrl()+"/"+tournament, {
          params: { access_token: token }
        });
    };
    
    service.getAll = function(casino, token){
      return $http.get(getUrl()+"?filter[where][casinoId]="+casino, {
        params: { access_token: token }
      });
    };
}])

.service('UserService', ['$http', 'ENDPOINT_URL', 
function ($http, ENDPOINT_URL) {
  var service = this,
  path = 'players/';
  
  function getUrl() {
    return ENDPOINT_URL + path;
  }
  
  service.create = function (user) {
    return $http.post(getUrl()+"", user);
  };
  
  service.login = function(user) {
    return $http.post(getUrl()+"login",user);
  };
  
  service.logout = function(token) {
    return $http({
        url: getUrl()+"logout",
        method: "POST",
        headers: {
            'Authorization': token
        }
     });
  };
  
  service.userInfo = function(token, userID) {
    return $http.get(getUrl()+"/"+userID, {
        params: { access_token: token }
    });
  };
}])

.service('ServerCasinoService', ['$http', 'ENDPOINT_URL', function($http, ENDPOINT_URL){
    var service = this,
    path = 'casinos/';
  
  function getUrl() {
    return ENDPOINT_URL + path;
  }
  
  service.getAll = function(userToken){
    return $http.get(getUrl(), {
      params: { access_token: userToken }
    });
  };
  
  service.getSpecific = function(casino, token){
    return $http.get(getUrl()+"/"+casino, {
        params: { access_token: token }
      });
  };
}])


.service('CasinoUsersService', ['$http', 'ENDPOINT_URL', 
function ($http, ENDPOINT_URL) {
  var service = this,
  path = 'casinoUsers/';
  
  function getUrl() {
    return ENDPOINT_URL + path;
  }
  
  service.create = function (user) {
    return $http.post(getUrl(), user);
  };
  
  service.login = function(user) {
    return $http.post(getUrl()+"login",user);
  };
  
  service.getUsersCasino = function(user, token){
    return $http.get(getUrl()+"/"+user, {
        params: { access_token: token }
      });
  }
  
  service.logout = function(token) {
    return $http({
        url: getUrl()+"logout",
        method: "POST",
        headers: {
            'Authorization': token
        }
     });
  };
}]);