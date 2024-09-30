'use strict';
var app = angular.module('myApp');
app.controller('questionCtrl', ['$scope', '$location', '$rootScope', '$http', "$state", '$uibModal', 'LoginService', 'CategoryService', 'NotificationService', 'LangService', function ($scope, $location, $rootScope, $http, $state, $uibModal, LoginService, CategoryService, NotificationService, LangService) {

    $scope.user = LoginService.getUser();
    $rootScope.user = $scope.user;
    if (!$scope.user)
        $state.go('login');

    $scope.allItems = [];
    $scope.searchFish = '';

    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };
    $scope.pageChanged = function () {
    };
    LangService.findAll().success(data => {
        $scope.languages = data;
    });
    $scope.itemStatuses = {
        new: 'New',
        in_review: 'In review',
        blocked: 'Blocked',
        un_published: 'Inactive',
        published: "Published",
        "": 'Undefined status'
    };
    $scope.$watch('currentPage', function (newValue, oldValue) {
        $scope.restorePaging();
    });
    $scope.$watch('all', function (newValue, oldValue) {

        if (newValue != oldValue) {
            if (newValue) {
                $scope.allItems = $scope.allItems.filter(function (elem) {
                    return elem.status !== 'published';
                });
                $scope.totalItems = $scope.allItems.length;
                $scope.currentPage = 1;
                $scope.restorePaging();
            } else {
                $scope.allItems = $scope.cash;
                $scope.totalItems = $scope.allItems.length;
                $scope.currentPage = 1;
                $scope.restorePaging();
            }
        }
    });
    $scope.editItem = function (item, mode) {

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'editAsset.html',
            controller: 'assestEditController',
            size: 'lg',
            backdrop: "static",
            resolve: {
                config: function () {
                    return {
                        item: item,
                        mode,
                        languages: $scope.languages,
                        categories: $scope.categories,
                        subCategories: $scope.subCategories
                    }
                }
            }
        });
        modalInstance.result.then(function (changedItem) {
            if (mode === 'add') {

                $http({
                    method: 'POST',
                    url: '/api/question',
                    data: changedItem
                }).success(function (result) {
                    $scope.populateItems();
                });

                console.log(changedItem);
            }
            console.log(mode);
            if (mode === 'edit') {
                $http({
                    method: 'PUT',
                    url: '/api/question',
                    data: changedItem
                }).success(function (result) {
                    $scope.syncItem(result)
                });
            }
        }, function (changedItem) {

        });
    };

    $scope.populateItems = function () {
        $http({
            method: 'GET',
            url: '/admin/api/questions'
        }).success(function (result) {

            $scope.allItems = result;
            $scope.cash = $scope.allItems;

            $scope.totalItems = $scope.allItems.length;
            $scope.currentPage = 1;
            $scope.restorePaging();
        });


    };
    $scope.updateQuestion = function (item) {
        $http({
            method: 'PUT',
            url: '/api/question',
            data: item
        }).success(function (result) {
            $scope.syncItem(result)
        });
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
    $scope.loadCategories = function () {
        $http.get('/admin/api/categories').success(function (data) {
            $scope.categories = data;

        });
        $http.get('/api/sub-categories').success(function (data) {
            $scope.subCategories = data;
        });
    };
    $scope.loadCategories();
    $scope.syncItem = function (item) {
        for (var i = 0; i < $scope.allItems.length; ++i) {
            if ($scope.allItems[i]._id === item._id) {
                $scope.allItems[i] = item;
            }
        }
    };
    $scope.removeFromArray = function (array, item) {
        array = array.filter(e => {
            // console.log(e._id!=item._id)
            return e._id != item._id;
        });
        return array;
    };
    $scope.unpublishQuestion = function (item) {
        item.status = 'un_published';
        $scope.updateQuestion(item);
    };
    $scope.publishQuestion = function (item) {
        item.status = 'published';
        $scope.updateQuestion(item);
    };

    $scope.removeQuestion = function (item) {

        $http({
            method: 'DELETE',
            url: '/api/question/' + item._id
        }).then(function (result) {
            console.log(result.data);
            $scope.addAlert(result.data.n + " question deleted.", 'success');
            $scope.allItems = $scope.removeFromArray($scope.allItems, item);
            $scope.restorePaging()
        }).catch(er => {
            $scope.addAlert(er.message, 'warning')
        });
        console.log(item)
    };


    $scope.populateItems();
    $scope.restorePaging = function () {
        if ($scope.allItems) {
            $scope.totalItems = $scope.allItems.length;
            $scope.items = $scope.allItems.slice($scope.itemsPerPage * ($scope.currentPage - 1), $scope.itemsPerPage * ($scope.currentPage - 1) + $scope.itemsPerPage);
        }
    };


}]);
app.controller('ModalInstanceCtrl2', function ($scope, $uibModalInstance, config) {
    console.log(config);
    $scope.type = config.type;
    $scope.name = config.name;


    $scope.ok = function () {
        $uibModalInstance.close('delete');
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});
app.controller('ModalInstanceCtrl3', function ($scope, $uibModalInstance, config) {
    console.log(config);
    $scope.type = config.type;
    $scope.name = config.name;
    $scope.ok = function () {
        $uibModalInstance.close({blocked_text: $scope.blocked_text});
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});


app.controller('assestEditController', ['$scope', '$location', '$rootScope', '$http', "$state", "$uibModal", '$uibModalInstance', 'config', function ($scope, $location, $rootScope, $http, $state, $uibModal, $uibModalInstance, config) {
    $scope.item = config.item;
    $scope.mode = config.mode;
    $scope.categories = config.categories;
    $scope.subCategories = config.subCategories;
    console.log(config);
    $scope.languages = config.languages;
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.ok = function () {
        $uibModalInstance.close($scope.item);
    };

    $scope.$watch('category.translations.en.name', function (newValue, oldValue) {
        if (newValue != oldValue) {

            if ($scope.category.translations)
                $scope.category.name = $scope.category.translations.en.name;
        }
    });
    $scope.$watch('item.translations.en.slug', function (newValue, oldValue) {
        if (newValue != oldValue) {

            if ($scope.item.translations)
                $scope.item.slug = $scope.item.translations.en.slug;
        }
    });
    $scope.$watch('item.translations.en.contents', function (newValue, oldValue) {
        if (newValue != oldValue) {
            console.log(newValue)
        }
    });


    $scope.$watch('item.translations.en.title', function (newValue, oldValue) {
        if (newValue != oldValue) {

            console.log($scope.item.translations);

            if ($scope.item.translations)
                $scope.item.title = $scope.item.translations.en.title;
        }
    });

    $scope.updateSlug = function (text, code, dest) {
        $scope.slug_updating = true;
        $http({
            method: 'POST',
            url: "/api/generate-slug",
            data: {text, lang: code}
        }).success(data => {
            $scope.slug_updating = false;
            dest.slug = data;
            console.log(dest);

        });
    };

}]);
