'use strict';
var app = angular.module('myApp');
app.controller('logsCtrl', ['$scope', '$location', '$rootScope', '$http', "$state", function ($scope, $location, $rootScope, $http, $state) {
    $scope.logs = [];
    $scope.filter = {};
    $scope.logLevels = [{name: 'log', level: 0}, {name: 'error', level: 5}, {name: 'info', level: 3}];
    $scope.format = 'yyyy/MM/dd';
    $scope.date = new Date();

    $scope.loadLogs = function (options, reset) {
        if (!options) {
            options = {offset: 0, limit: 100};
        }
        $http.get(`/api/admin/logs?offset=${options.offset}&limit=${options.limit ? options.limit : 100}`).then(response => {
            if (reset) {
                $scope.logs = response.data.data;
            } else
                $scope.logs = $scope.logs.concat(response.data.data);

        })
    };
    $scope.updateLogs = function () {
        $scope.newLogCount = 0;
        $scope.loadLogs(null, true)
    };
    $scope.loadMore = function () {
        if ($scope.lastLoaded && (Date.now() - $scope.lastLoaded) < 200) {
            return;
        }
        $scope.lastLoaded = Date.now();
        $scope.loadLogs({offset: $scope.logs.length});

    }
    ;
    $('.log-container').on('scroll', function () {
        if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
            $scope.loadMore();
        }
    });
    $scope.newLogCount = 0;
    var socket = new WebSocket((window.location.protocol === 'https:' ? 'wss://' : "ws://") + window.location.host);
    socket.onopen = function () {
        console.log("Соединение установлено.");
    };

    socket.onclose = function (event) {
        if (event.wasClean) {
            console.log('Соединение закрыто чисто');
        } else {
            console.log('Обрыв соединения'); // например, "убит" процесс сервера
        }
        console.log('Код: ' + event.code + ' причина: ' + event.reason);
    };

    socket.onmessage = function (event) {
        $scope.newLogCount++;
        if (!$scope.$$phase) {
            $scope.$apply();
        }

        console.log("Получены данные " + event.data);
    };

    socket.onerror = function (error) {
        console.log("Ошибка " + error.message);
    };
    $scope.loadLogs();
}]);


app.filter('log', function () {


    return function (args) {
        let res = '';

        if (args) {

            return Object.values(args).map(e => ' ' + JSON.stringify(e)).join();
        }

        return res;
    }
});
