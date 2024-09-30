angular.module('myApp').factory('NotificationService', ['$http', function ($http) {

    var factory = {};
    factory.addAlert = function (msg, type) {
        new PNotify({
            title: msg,
            text: '',
            type: type,
            hide: true,
            delay: 3000,
            animation: "fade"
        });
    };
    factory.logError = function (er) {
        console.error(er);
        factory.addAlert(JSON.stringify(er, null, 4), 'danger');
    };
    factory.confirm = function (title = 'Confirmation Needed', body = 'Are you sure?') {
        return new Promise((resolve, reject) => {
            (new PNotify({
                title: title,
                text: body,
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
            })).get().on('pnotify.confirm', resolve).on('pnotify.cancel', reject);
        })

    };
    return factory;
}]);
