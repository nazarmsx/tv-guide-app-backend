'use strict';

var app = angular.module('myApp');
app.controller('loginCtrl', ['$scope', '$location', '$rootScope', '$http', "$state", 'LoginService', function ($scope, $location, $rootScope, $http, $state, LoginService) {

    $scope.user = {};

    $scope.login = function () {
        $scope.isRequestSent = true;

        $http({
            method: 'POST',
            url: '/api/admin/sign-in',
            data: $scope.user
        }).success(function (data) {
            $scope.isRequestSent = false;
            if (data.login) {

                $scope.user = data;
                LoginService.setUser($scope.user);
                $state.go('questions');

            } else {
                $scope.loginError = true;
            }
        });

    };

    $('#loginForm').on('keyup keypress', function (e) {

        var code = e.keyCode || e.which;
        if (code == 13) {

            if (!$scope.isRequestSent) {
                $scope.login();
            }

            e.preventDefault();
            return false;
        }
    });

}]);
