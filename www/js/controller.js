angular.module('starter.controllers', [])

.controller('SideMenuCtrl',['$scope', function($scope) {
    $scope.isCasino = true;
}])

.controller('ViewCasinoCtrl', ['$scope', function($scope){
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
