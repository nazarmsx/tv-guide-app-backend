'use strict';

var app = angular.module('myApp');
app.controller('categoryCtrl', ['$scope', '$location', '$rootScope', '$http', "$state", '$uibModal', 'LoginService', 'CategoryService', 'NotificationService', 'LangService', function ($scope, $location, $rootScope, $http, $state, $uibModal, LoginService, CategoryService, NotificationService, LangService) {

    $scope.user = LoginService.getUser();
    $rootScope.user = $scope.user;
    if (!$scope.user)
        $state.go('login');
    $scope.loadCategories = function () {

        CategoryService.findAll().then(data => {
            $scope.allItems = data.data;
        }).catch(er => {
            console.error(er);
        });
    };
    $scope.category = {};
    $scope.loadCategories();
    $scope.addCategory = function () {
        CategoryService.create($scope.category).then(data => {
            $scope.category = data.data;
            $scope.loadCategories();
            NotificationService.addAlert('Category added.', 'success');
        }).catch(er => {
            NotificationService.logError(er);
        });
    };
    $scope.editItem = function (data) {
        $scope.category = data;
    };
    $scope.$watch('category.parent_id', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            if (newValue === $scope.category._id && $scope.category.parent_id !== null) {
                $scope.category.parent_id = null;
            }
        }
    });
    LangService.findAll().success(data => {
        $scope.languages = data;
    });
    $scope.deleteItem = function (item) {
        CategoryService.delete(item).then(data => {
            $scope.loadCategories();
            NotificationService.addAlert('Category removed.');

        }).catch(er => {
            NotificationService.logError(er);
        });
    };
    $scope.updateSlug = function (text, code, dest) {
        console.log(text);
        $scope.slug_updating = true;
        $http({
            method: 'POST',
            url: "/api/generate-slug",
            data: {text, lang: code}
        }).success(data => {
            // setTimeout(function () {
            //     $scope.slug_updating=false;
            //     $scope.$apply();
            // },400);
            // console.log(dest);
            $scope.slug_updating = false;

            dest.slug = data;

            console.log(data);

            console.log(dest);
        });
    };

    $scope.$watch('category.translations.en.name', function (newValue, oldValue) {
        if (newValue != oldValue) {
            if ($scope.category.translations)
                $scope.category.name = $scope.category.translations.en.name;
        }
    });
    $scope.$watch('category.translations.en.slug', function (newValue, oldValue) {
        if (newValue != oldValue) {
            if ($scope.category.translations)
                $scope.category.slug = $scope.category.translations.en.slug;
        }
    });
    $scope.saveCategory = function () {
        CategoryService.update($scope.category).then(data => {
            $scope.category = data.data;
            $scope.allItems.forEach(function (e, index) {
                if ($scope.category._id === e._id) {
                    $scope.allItems[index] = $scope.category;
                }
            });

            console.log(data.data);
            NotificationService.addAlert('Changes saved.', 'success');

        }).catch(er => {
            NotificationService.logError(er);
        });
    }

}]);
