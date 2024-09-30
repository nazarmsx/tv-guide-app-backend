'use strict';

var app = angular.module('myApp');
app.controller('blogCtrl', ['$scope', '$location', '$rootScope', '$http', "$state", 'LoginService', function ($scope, $location, $rootScope, $http, $state, LoginService) {

    $scope.user = LoginService.getUser();
    $rootScope.user = $scope.user;
    if (!$scope.user)
        $state.go('login');

    $scope.allItems = [];
    $scope.itemsPerPage = 10;
    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };


    $scope.pageChanged = function () {
    };
    $scope.$watch('currentPage', function (newValue, oldValue) {
        $scope.restorePaging();
    });

    $scope.populateItems = function () {
        $http({
            method: 'GET',
            url: '/admin/api/blog/',
        }).success(function (result) {
            $scope.allItems = result;
            $scope.totalItems = $scope.allItems.length;
            $scope.currentPage = 1;
            $scope.restorePaging();
        });
    };
    $scope.editItem = function (item) {
        $scope.item = item;
    };

    $scope.add = function () {
        $http({
            method: 'POST',
            url: '/api/blog/post/',
            data: $scope.item
        }).success(function (result) {
            //$scope.item = {};
            $scope.editItem(result);
            $scope.populateItems();
        });

    };

    $scope.save = function () {
        $http({
            method: 'PUT',
            url: '/api/blog/post/',
            data: $scope.item
        }).success(function (result) {

            for (var i = 0; i < $scope.allItems.length; ++i) {
                if ($scope.allItems[i].id == $scope.item.id) {
                    $scope.allItems[i] = result;
                }
            }
            $scope.addAlert('Changes successfully saved!', 'success');
            //$scope.item = {};
            //$scope.populateItems();
        });

    };
    $scope.deleteItem = function (id) {
        $http({
            method: 'DELETE',
            url: '/api/blog/post/' + id
        }).success(function (result) {
            if ($scope.item && $scope.item.id == id)
                $scope.item = {};
            $scope.addAlert('Changes successfully deleted!', 'warning');

            $scope.populateItems();
        });

    };

    $scope.cancel = function () {
        $scope.item = null;
    };
    $scope.populateItems();
    $scope.restorePaging = function () {

        if ($scope.allItems) {
            $scope.totalItems = $scope.allItems.length;
            $scope.items = $scope.allItems.slice($scope.itemsPerPage * ($scope.currentPage - 1), $scope.itemsPerPage * ($scope.currentPage - 1) + $scope.itemsPerPage);
        }
    };
    $scope.addAlert = function (msg, type) {
        new PNotify({
            title: msg,
            text: '',
            type: type,
            hide: true,
            delay: 3000,
            animation: "fade"
        });
    };

}]);
