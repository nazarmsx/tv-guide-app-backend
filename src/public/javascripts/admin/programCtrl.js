'use strict';
var app = angular.module('myApp');
app.controller('programCtrl', ['$scope', '$location', '$rootScope', '$http', "$state", 'LoginService', 'NotificationService', function ($scope, $location, $rootScope, $http, $state, LoginService, NotificationService) {

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
        if (newValue != oldValue) {
            $scope.loadCurrentPage();
        }
    });
    $scope.loadCurrentPage = function () {
        $http({
            method: 'GET',
            url: '/admin/api/program?offset=' + ($scope.currentPage - 1) * $scope.itemsPerPage + '&limit=' + $scope.itemsPerPage,
        }).then(response => {
            $scope.items = response.data.data;

        })
    };

    $scope.populateItems = function () {
        Promise.all([$http({
            method: 'GET',
            url: '/admin/api/program?count=true',
        })]).then(results => {
            $scope.totalItems = results[0].data.total;
            $scope.currentPage = 1;
            $scope.$apply()
        })
    };
    $scope.deleteProgram = function (program) {
        NotificationService.confirm().then(() => {

            $http({method: 'DELETE', url: '/admin/api/program/' + program._id}).then(response => {
                console.log(response);
                if (response.data && response.data.error) {
                    NotificationService.addAlert(JSON.stringify(response.data.error, null, 4), 'danger');
                }
                if (response.data && response.data.status === 'OK') {
                    NotificationService.addAlert(`Program was successfully deleted`, 'warning');
                }
                $scope.loadCurrentPage();
            }).catch(er => {
                NotificationService.addAlert(er, 'danger');
            })

        })
    };
    $scope.refreshProgram = function (program) {

        let fetcher = 'merged';
        if (program.region === 'uk') {
            fetcher = 'tv24'
        }

        NotificationService.addAlert(`Program fetching started!`, 'success');
        $http({
            method: 'POST', url: '/api/program', data: {
                fetcher, date: program.date, loadDetails: true
            }
        }).then(response => {
            NotificationService.addAlert(`Program fetching finished!`, 'success');

            $scope.loadCurrentPage();
        }).catch(er => {
            console.log(er);
            NotificationService.addAlert(`${er.status ? er.status : ''} ${er.statusText ? er.statusText : ''} ${er}`, 'danger');
        })
    };


    $scope.populateItems();

}]);
