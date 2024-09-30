'use strict';

angular.module('myApp').controller('langCtrl', ['$scope', '$location', '$rootScope', '$http', "$state", "LoginService", '$uibModal', 'NotificationService', function ($scope, $location, $rootScope, $http, $state, LoginService, $uibModal, NotificationService) {

    $scope.user = LoginService.getUser();
    $rootScope.user = $scope.user;
    if (!$scope.user)
        $state.go('login');
    $scope.searchFish = '';

    $scope.populateItems = function () {
        $scope.loading = true;

        $http({
            method: 'POST',
            url: '/api/languages/'
        }).success(function (data) {
            $scope.allItems = data;
            $scope.loading = false;
            $scope.currentPage = 1;
        });
    };

    $scope.populateItems();

    $scope.editUser = function (user, mode) {

        var tempUser = angular.copy(user);
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'editLang.html',
            controller: 'langEditController',
            size: 'lg',
            backdrop: "static",

            resolve: {
                config: function () {
                    return {
                        user: tempUser,
                        mode: mode,
                        languages: $scope.allItems
                    }
                }
            }
        });

        modalInstance.result.then(function (changedUser) {

            if (changedUser.mode == 'edit') {

                $scope.syncData(changedUser)
            } else {
                $scope.syncData(changedUser)

            }


        }, function () {
        });
    };
    $scope.deleteUser = function (user) {

        (new PNotify({
            title: $scope.tranlations['confirm_needed'],
            text: $scope.tranlations['confirm_needed2'],
            icon: 'glyphicon glyphicon-question-sign',
            hide: false,
            confirm: {
                confirm: true
            },
            buttons: {
                closer: false,
                sticker: false
            },
            history: {
                history: false
            }
        })).get().on('pnotify.confirm', function () {


            $http({
                method: 'DELETE',
                url: '/api/language/' + user._id
            }).success(function (result) {

                if (result.error) {
                    //console.log(result.error);
                    NotificationService.addAlert($scope.tranlations['some_error'] + result.error, 'error')

                } else {
                    $scope.allItems = $scope.allItems.filter(function (elem) {
                        return elem._id != user._id;
                    });
                    NotificationService.addAlert($scope.tranlations['delete_successful_lang'], 'success')

                }
            });

        }).on('pnotify.cancel', function () {

        });
    };
    $scope.syncData = function (updatedItem) {
        console.log(updatedItem);
        var isInArray = false;
        for (var i = 0; i < $scope.allItems.length; ++i) {
            if (updatedItem._id == $scope.allItems[i]._id) {
                isInArray = true;
                $scope.allItems[i] = updatedItem;
            }
        }
        if (!isInArray) {
            $scope.allItems.push(updatedItem);
        }
    };


}]);


app.controller('langEditController', ['$scope', '$location', '$rootScope', '$http', "$state", "$uibModal", '$uibModalInstance', 'config', function ($scope, $location, $rootScope, $http, $state, $uibModal, $uibModalInstance, config) {


    $scope.user = config.user;
    $scope.languages = config.languages;


    $http({
        method: 'GET',
        url: '/api/languages'
    }).success(function (data) {

        $scope.langCodes = data.data;
        $scope.tags = [];
        for (var prop in data.data) {
            var inArray = $scope.languages.some(function (e) {
                return e.code == prop
            });
            if (!inArray)
                $scope.tags.push(data.data[prop].code + ' - ' + data.data[prop].name + '(' + data.data[prop].nativeName + ')');
        }

        $("#lang").typeahead({source: $scope.tags});
        $("#lang").change(function () {
            $scope.lang = $("#lang").val();
            $scope.$apply();
        });
    });
    $scope.$watch('lang', function (newValue, oldValue) {


        if (newValue != oldValue) {

            var code = $scope.langCodes[newValue.substr(0, newValue.indexOf(' -'))];
            if (code) {
                $scope.lang_code = code;
            } else {
                $scope.lang_code = null;
            }


        }
    });
    $scope.loadTags = function ($query) {
        $scope.filteredTags = $scope.tags.filter(function (elem) {
            return elem.indexOf($query) != -1;
        });
        console.log($scope.filteredTags.length);
        return $scope.filteredTags;
    };

    $scope.mode = config.mode;
    $scope.user.mode = $scope.mode;
    $scope.ok = function () {

        if ($scope.mode == 'add') {
            $http({
                method: 'POST',
                url: '/api/language',
                data: $scope.lang_code
            }).success(function (result) {
                if (!result.error)
                    $uibModalInstance.close(result);

            });
        } else {

        }


    };

    $scope.cancel = function () {

        $uibModalInstance.dismiss('cancel');
    };
}]);

