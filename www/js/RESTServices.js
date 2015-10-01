angular.module('RESTConnection', [])
.constant('ENDPOINT_URL', 'https://goldenegg-hgottschalk-ssf.c9.io/api/')

.service('TodayTournamentService', [ '$http', 'ENDPOINT_URL', function($http, ENDPOINT_URL){
    var service = this,
    path = 'todayTournaments/';
    
    function getUrl (){
      return ENDPOINT_URL + path;
    }
    
    service.create = function(todayTournament, token){
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
     
      return $http.delete(getUrl()+todayTournament,{
        params: { access_token: token }
      });
    };
    
    service.getAll = function(todayTournament, token){
      return $http.get(getUrl()+"?filter[where][casinoId]="+todayTournament, {
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
      return $http.delete(getUrl()+todayCashGames,{
        params: { access_token: token }
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
      return $http.get(getUrl()+cashGame, {
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
      return $http.get(getUrl()+tournament, {
          params: { access_token: token }
        });
    };
    
    service.getAll = function(casino, token){
      return $http.get(getUrl()+"?filter[where][casinoId]="+casino, {
        params: { access_token: token }
      });
    };
}])

.service('BlindService', ['$http', 'ENDPOINT_URL', function($http, ENDPOINT_URL){
      var service = this,
      path = 'blinds/';
      
      function getUrl(){
        return ENDPOINT_URL + path;
      }
      
      service.getSpecific = function(tournamentId, token){
          return $http.get(getUrl()+"?filter[where][tournamentId]="+tournamentId, {
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
  
  service.update = function ( token, userID, user) {
    return $http({
        url: getUrl()+userID,
        method: "PUT",
        data: JSON.stringify(user),
        headers: {
            'Authorization': token
        }
     });
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
  
  service.getAllMyCasino = function(token, userID) {
    return $http.get(getUrl()+userID+"/myCasino", {
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
  
  service.update = function(casinoUserID, user, token) {
    return $http({
        url: getUrl()+casinoUserID,
        method: "PUT",
        data: JSON.stringify(user),
        headers: {
            'Authorization': token
        }
    });
  };
  service.delete = function(casinoUserID, token) {
    return $http.delete(getUrl()+casinoUserID, {
       params: { access_token : token }
    }); 
  };
  
  //Get all casino users of a determined casino
  service.getAll = function(casinoID, token) {
    return $http.get(getUrl()+"?filter[where][casinoId]="+casinoID, {
      params: { access_token: token }
    });
  };
  
  service.getUsersCasino = function(user, token){
    return $http.get(getUrl()+"/"+user, {
        params: { access_token: token }
      });
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
}])
.service('CasinoSubscriptionService', ['$http', 'ENDPOINT_URL', 
function ($http, ENDPOINT_URL) {
  var service = this,
  path = 'subscriptions/';
  
  function getUrl() {
    return ENDPOINT_URL + path;
  }
  
  //Information needed is casinoID and playerID
  service.create = function (subscriptionInfo,token) {
    console.log(subscriptionInfo);
    console.log(token);
    return $http({
      url: getUrl(),
      method: "POST",
      data: JSON.stringify(subscriptionInfo),
      headers: {
          'Authorization': token
      }
    });
  };
  
  service.deleteCasinoSubscription = function(token,subscriptionID) {
    console.log(subscriptionID);
    return $http({
        url: getUrl()+subscriptionID,
        method: "DELETE",
        headers: {
            'Authorization': token
        }
     });
  };
  
  service.findSubscription = function(token,userID, casinoID) {
    return $http.get(getUrl()+"?filter[where][casinoId]="+casinoID+"&filter[where][playerId]="+userID, {
        params: { access_token: token }
      });
    };
}]);