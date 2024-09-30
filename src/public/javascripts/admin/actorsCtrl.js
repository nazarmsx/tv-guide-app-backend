'use strict';

var app = angular.module('myApp');
app.controller('actorsCtrl', ['$scope', '$location', '$rootScope', '$http', "$state", '$uibModal', 'LoginService', 'NotificationService', function ($scope, $location, $rootScope, $http, $state, $uibModal, LoginService, NotificationService) {


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
                url: '/api/actor-list?offset=' + (newValue - 1) * $scope.itemsPerPage + '&limit=' + $scope.itemsPerPage,
            }).then(response => {
                $scope.items = response.data.data;

            })
        }
    });

    $scope.populateItems = function () {
        Promise.all([$http({
            method: 'GET',
            url: '/api/actor-list?count=true',
        })]).then(results => {
            $scope.totalItems = results[0].data.total;
            $scope.currentPage = 1;
            $scope.$apply()
        })
    };
    $scope.editItem = function (item, mode) {

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'editActor.html',
            controller: 'actorEditController',
            size: 'lg',
            backdrop: "static",
            resolve: {
                config: function () {
                    return {
                        item: item
                    }
                }
            }
        });
        modalInstance.result.then(function (changedItem) {

            $http({
                method: 'PUT',
                url: '/api/actor',
                data: changedItem
            }).success(function (result) {
                $scope.syncItem(result)
            });

        }, function (changedItem) {

        });
    };
    $scope.syncItem = function (item) {
        for (var i = 0; i < $scope.items.length; ++i) {
            if ($scope.items[i]._id === item._id) {
                $scope.items[i] = item;
            }
        }
    };

    $scope.populateItems();

}]);
app.controller('actorEditController', ['$scope', '$location', '$rootScope', '$http', "$state", "$uibModal", '$uibModalInstance', 'config', function ($scope, $location, $rootScope, $http, $state, $uibModal, $uibModalInstance, config) {
    $scope.item = config.item;
    $scope.mode = config.mode;

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.ok = function () {
        $uibModalInstance.close($scope.item);
    };


}]);

