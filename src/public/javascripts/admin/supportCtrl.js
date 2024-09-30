'use strict';

var app = angular.module('myApp');
app.controller('supportCtrl', ['$scope', '$location', '$rootScope', '$http', "$state", 'LoginService', function ($scope, $location, $rootScope, $http, $state, LoginService) {


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
        //console.log('Page changed to: ' + $scope.currentPage);
    };
    $scope.$watch('currentPage', function (newValue, oldValue) {

        console.log(newValue)
        // $scope.restorePaging();
    });

    $scope.populateItems = function () {
        Promise.all([$http({
            method: 'GET',
            url: '/admin/api/messages',
        }), $http({
            method: 'GET',
            url: '/admin/api/messages?count=true',
        })]).then(results => {
            $scope.allItems = results[0].data.data;
            $scope.totalItems = results[1].data.total;
            $scope.currentPage = 1;

            $scope.restorePaging();
            $scope.$apply()

        })


    };


    $scope.populateItems();
    $scope.restorePaging = function () {

        if ($scope.allItems) {

            $scope.items = $scope.allItems.slice($scope.itemsPerPage * ($scope.currentPage - 1), $scope.itemsPerPage * ($scope.currentPage - 1) + $scope.itemsPerPage);


        }
    }

}]);
