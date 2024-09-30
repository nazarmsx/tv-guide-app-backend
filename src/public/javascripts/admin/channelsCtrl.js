'use strict';
var app = angular.module('myApp');
app.controller('channelsCtrl', ['$scope', '$location', '$rootScope', '$http', '$state', 'LoginService', 'Upload', '$uibModal', 'NotificationService', function ($scope, $location, $rootScope, $http, $state, LoginService, Upload, $uibModal, NotificationService) {
    $scope.user = LoginService.getUser();
    $rootScope.user = $scope.user;
    if (!$scope.user)
        $state.go('login');
    $scope.searchFish = '';
    $scope.itemsPerPage = 10;
    $scope.allItems = [];

    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo
    };
    $scope.pageChanged = function () {
    };
    $scope.$watch('currentPage', function (newValue, oldValue) {
        if (newValue != oldValue) {
            $http({
                method: 'GET',
                url: '/admin/api/channels?offset=' + (newValue - 1) * $scope.itemsPerPage + '&limit=' + $scope.itemsPerPage,
            }).then(response => {
                $scope.items = response.data.data

            })
        }
    });

    $scope.populateItems = function () {
        Promise.all([$http({
            method: 'GET',
            url: '/admin/api/channels?count=true',
        })]).then(results => {
            $scope.totalItems = results[0].data.total;
            $scope.currentPage = 1;
            $scope.$apply()
        })

    };
    $scope.loadCurrentPage = function () {
        $http({
            method: 'GET',
            url: '/admin/api/channels?offset=' + ($scope.currentPage - 1) * $scope.itemsPerPage + '&limit=' + $scope.itemsPerPage,
        }).then(response => {
            $scope.items = response.data.data;

        })
    };
    $scope.populateItems();

    $scope.editItem = function (item, mode) {

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'editChannel.html',
            controller: 'editChannelController',
            size: 'lg',
            backdrop: 'static',
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
                url: '/api/channel',
                data: changedItem
            }).success(function (result) {
                $scope.syncItem(result)
            });

        }, function (changedItem) {

        })
    };
    $scope.syncItem = function (item) {
        for (var i = 0; i < $scope.items.length; ++i) {
            if ($scope.items[i]._id === item._id) {
                $scope.items[i] = item
            }
        }
    };

    $scope.deleteChannel = function (program) {
        NotificationService.confirm().then(() => {

            $http({method: 'DELETE', url: '/admin/api/channel/' + program._id}).then(response => {
                console.log(response);
                if (response.data && response.data.error) {
                    NotificationService.addAlert(JSON.stringify(response.data.error, null, 4), 'danger');
                }
                if (response.data && response.data.status === 'OK') {
                    NotificationService.addAlert(`Channel was successfully deleted`, 'warning');
                }
                $scope.loadCurrentPage();
            }).catch(er => {
                NotificationService.addAlert(er, 'danger');
            })

        })
    };

    $scope.populateItems()

}]);
app.controller('editChannelController', ['$scope', '$location', '$rootScope', 'Upload', '$http', '$state', '$uibModal', '$uibModalInstance', 'config', function ($scope, $location, $rootScope, Upload, $http, $state, $uibModal, $uibModalInstance, config) {
    $scope.item = config.item;
    $scope.mode = config.mode;

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel')
    };

    $scope.ok = function () {

        $uibModalInstance.close($scope.item)
    };

    $scope.upload = function (params) {
        let file = params[0];


        Upload.upload({
            url: '/api/v1/upload/image',
            method: 'POST',
            data: {image: file}
        }).then(function (resp) {
            console.log(resp);
            if (resp && resp.data && resp.data.status && resp.data.status === 'OK') {
                $scope.addAlert(JSON.stringify(resp.data, null, 4), 'success');
                $scope.item.img = resp.data.data.imageUrl;

            } else {
                $scope.addAlert(JSON.stringify(resp.data, null, 4), 'error')

            }


        }).catch(er => {
            $scope.addAlert(er.message, 'error')

        })
    }
}]);
