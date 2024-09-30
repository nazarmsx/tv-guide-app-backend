'use strict';

var app = angular.module('myApp');
app.controller('usersCtrl', ['$scope', '$location', '$rootScope', '$http', "$state", 'LoginService', function ($scope, $location, $rootScope, $http, $state, LoginService) {
    $scope.user = LoginService.getUser();
    $rootScope.user = $scope.user;
    if (!$scope.user)
        $state.go('login');
    $scope.searchFish = '';
    $scope.itemsPerPage = 10;
    $scope.allItems = [];

    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };
    $scope.pageChanged = function () {
    };
    $scope.$watch('currentPage', function (newValue, oldValue) {
        if (newValue != oldValue) {
            $http({
                method: 'GET',
                url: '/admin/api/users?offset=' + (newValue - 1) * $scope.itemsPerPage + '&limit=' + $scope.itemsPerPage,
            }).then(response => {
                $scope.items = response.data.data;

            })
        }
    });

    $scope.populateItems = function () {
        Promise.all([$http({
            method: 'GET',
            url: '/admin/api/users?count=true',
        })]).then(results => {
            $scope.totalItems = results[0].data.total;
            $scope.currentPage = 1;
            $scope.$apply()
        })
    };
    $scope.populateItems();
}]);
