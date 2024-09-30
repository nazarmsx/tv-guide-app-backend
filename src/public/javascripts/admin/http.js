'use strict';

angular.module('myApp').factory('CategoryService', ['$http', function ($http) {

    var factory = {};
    factory.findAll = function () {
        return $http.get('/api/category');
    };
    factory.create = function (data) {
        return $http({
            method: 'POST',
            url: '/api/category',
            data: data
        });
    };
    factory.update = function (data) {
        return $http({
            method: 'PUT',
            url: '/api/category',
            data: data
        });
    };
    factory.delete = function (data) {
        return $http({
            method: 'DELETE',
            url: '/api/category/' + data._id,
        });
    };
    return factory;
}]);

angular.module('myApp').factory('LangService', ['$http', function ($http) {

    var factory = {};
    factory.findAll = function () {
        return $http({
            method: 'POST',
            url: '/api/languages',
        });
    };

    return factory;
}]);

