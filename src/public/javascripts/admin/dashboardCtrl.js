'use strict';

var app = angular.module('myApp');
app.controller('dashboardCtrl', ['$scope', '$location', '$rootScope', '$http', "$state", 'LoginService', function ($scope, $location, $rootScope, $http, $state, LoginService) {

    $scope.user = LoginService.getUser();
    $rootScope.user = $scope.user;
    if (!$scope.user)
        $state.go('login');
    $scope.stats = {};
    $http.get('/admin/api/stats').success(function (data) {
        $scope.stats = data;
        console.log(data)
    });
    $scope.data = {
        cpu: 0,
        mem_percent: 0
    };

    $scope.cpuOptions = {
        easing: 'easeOutElastic',
        delay: 3000,
        barColor: "rgba(0,0,0,255.4)",
        trackColor: "rgba(0,0,0,0.1)",
        scaleColor: "transparent",
        lineCap: "round",
        size: 110,
        lineWidth: 3,
        trackWidth: 5,
    };

    $scope.memoryOptions = {
        easing: 'easeOutElastic',
        delay: 3000,
        barColor: '#69c',
        trackColor: '#ace',
        scaleColor: false,
        lineWidth: 20,
        trackWidth: 16,
        lineCap: 'butt'
    };

    $scope.diskOptions = {
        easing: 'easeOutElastic',
        delay: 3000,
        barColor: '#69c',
        trackColor: '#ace',
        scaleColor: false,
        lineWidth: 20,
        trackWidth: 16,
        lineCap: 'butt'
    };

    setInterval(function () {

        if (window.location.hash == "#/dashboard") {
            $http({
                method: 'GET',
                url: '/admin/api/server-status'
            }).success(function (result) {

                $scope.data = result;
                $scope.data.mem_percent = (result.memory.used) / (result.memory.total / 100);
                $scope.data.disk_percent = (result.disk.used) / (result.disk.total / 100);
            });
        }


    }, 600);

    $scope.drawFlot = function () {

        function a() {

            for (c.length > 0 && (c = c.slice(1)); c.length < d;) {
                var a = c.length > 0 ? c[c.length - 1] : 50;
                var b = $scope.data.cpu;
                0 > b ? b = 0 : b > 100 && (b = 100);
                c.push(b)
            }
            for (var e = [], f = 0; f < c.length; ++f)
                e.push([f, c[f]]);
            return e
        }

        function b() {
            f.setData([a()]), f.draw(), setTimeout(b, e)
        }

        var c = [], d = 300, e = 30, f = $.plot("#data-example-3", [a()], {
                series: {
                    lines: {
                        show: !0, lineWidth: 2, fill: .5, fillColor: {
                            colors: [{
                                opacity: .01
                            }
                                , {
                                    opacity: .08
                                }
                            ]
                        }
                    }
                    , shadowSize: 0
                }
                , grid: {
                    labelMargin: 10, hoverable: !0, clickable: !0, borderWidth: 1, borderColor: "rgba(82, 167, 224, 0.06)"
                }
                , yaxis: {
                    min: 0, max: 120, tickColor: "rgba(0, 0, 0, 0.06)", font: {
                        color: "rgba(0, 0, 0, 0.4)"
                    }
                }
                , xaxis: {
                    show: !1
                }
                , colors: ["rgba(48,141,204,0.8)", "rgba(48,141,204,0.3)"]
            }
        );
        b();

    };
    $scope.drawFlot();

}]);


app.filter('toMB', function () {

    // In the return function, we must pass in a single parameter which will be the data we will work on.
    // We have the ability to support multiple other parameters that can be passed into the filter optionally
    return function (input) {


        //return (Math.ceil((input/1024)*100)/100)+' MB';
        return formatBytes(input * 1024);
    }

});


function formatBytes(bytes, decimals) {
    if (bytes == 0) return '0 Byte';
    var k = 1000;
    var dm = decimals + 1 || 3;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toPrecision(dm) + ' ' + sizes[i];
}

