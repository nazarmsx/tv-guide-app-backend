'use strict';
var myApp = angular.module('myApp', ['ui.router', 'ngAnimate', 'ui.bootstrap', 'easypiechart', 'ngTagsInput', 'ngSanitize', 'angularTrix', 'ngFileUpload']);
myApp.run([
    '$rootScope', '$state', 'LoginService', 'Translations', function ($rootScope, $state, LoginService, Translations) {
        $rootScope.items_per_page = 10;
        $rootScope.logout = function () {
            $state.go('login');
            LoginService.logOut()
        };
        $rootScope.addAlert = function (msg, type) {
            new PNotify({
                title: msg,
                text: '',
                type: type,
                hide: true,
                delay: 3000,
                animation: "fade"
            });
        };
        $rootScope.$on('$stateChangeSuccess',
            function (event, toState, toParams, fromState, fromParams) {
                $rootScope.activeView = toState.name;

                if ($rootScope.activeView == 'login') {
                    $('#page-content').css('margin-left', 0)
                } else {
                    $('#page-content').css('margin-left', 260)

                }

            });

        $rootScope.tranlations = {};
        $rootScope.itemsPerPage = 8;
        $rootScope.tranlations = Translations.getTranslations();
        $rootScope.selected_lang = Translations.getLang()
    }]);
myApp.config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/questions');

    $stateProvider

        .state('login', {
            url: '/login',
            templateUrl: 'partial/login',
            controller: 'loginCtrl'
        })
        .state('questions', {
            url: '/questions',
            abstract: false,
            templateUrl: 'partial/index',
            controller: 'questionCtrl'
        }).state('categories', {
        url: '/categories',
        abstract: false,
        templateUrl: 'partial/categoriesTemplate',
        controller: 'categoryCtrl'
    }).state('users', {
        url: '/users',
        abstract: false,
        templateUrl: 'partial/users',
        controller: 'usersCtrl'
    }).state('dashboard', {
        url: '/dashboard',
        abstract: false,
        templateUrl: 'partial/dashboard',
        controller: 'dashboardCtrl'
    }).state('blog', {
        url: '/blog',
        abstract: false,
        templateUrl: 'partial/blog',
        controller: 'blogCtrl'
    }).state('languages', {
        url: '/languages',
        abstract: false,
        templateUrl: 'partial/languages',
        controller: 'langCtrl'
    }).state('logs', {
        url: '/logs',
        abstract: false,
        templateUrl: 'partial/logs',
        controller: 'logsCtrl'
    }).state('actors', {
        url: '/actors',
        abstract: false,
        templateUrl: 'partial/actors',
        controller: 'actorsCtrl'
    }).state('devices', {
        url: '/devices',
        abstract: false,
        templateUrl: 'partial/devices',
        controller: 'devicesCtrl'
    }).state('support', {
        url: '/support',
        abstract: false,
        templateUrl: 'partial/support',
        controller: 'supportCtrl'
    }).state('program', {
        url: '/program',
        abstract: false,
        templateUrl: 'partial/program',
        controller: 'programCtrl'
    }).state('channels', {
        url: '/channels',
        abstract: false,
        templateUrl: 'partial/channels',
        controller: 'channelsCtrl'
    }).state('quizzes', {
        url: '/quizzes',
        abstract: false,
        templateUrl: 'partial/quiz',
        controller: 'quizCtrl'
    })

});
myApp.factory('LoginService', function () {

    var factory = {};
    factory.getUser = function () {
        var user = sessionStorage.getItem('user');
        if (user)
            return JSON.parse(user);
        else return null
    };
    factory.setUser = function (user) {
        sessionStorage.setItem('user', JSON.stringify(user))
    };
    factory.logOut = function () {
        sessionStorage.setItem('user', null)
    };
    return factory
});
myApp.config(function ($interpolateProvider) {
    $interpolateProvider.startSymbol('{[{');
    $interpolateProvider.endSymbol('}]}')
});

myApp.factory('Translations', function () {

    var factory = {};

    factory.getTranslations = function () {

        var lang = sessionStorage.getItem('lang');
        lang = lang ? lang : 'ru';

        var translations = {
            en: {
                title: 'CinemaBoom Admin',
                login_action: 'Login to your account.',
                login_btn: 'Sign up',
                login: 'Login',
                logout: 'Logout',
                password: 'Password',
                error_login: 'Invalid e-mail or password',
                menu_users: 'Users',
                menu_posts: 'Posts',
                menu_comments: 'Comments',
                menu_feed: 'Feedback',
                menu_mailinglist: 'Mailing lists',
                menu_actors: 'Actors',
                menu_lang: 'Languages',
                menu_film: 'Movies',
                menu_review: 'Reviews',
                menu_support: 'Support',
                actions: 'Actions',
                search: 'Search',
                confirm_needed: 'Confirmation Needed',
                confirm_needed2: 'You confirm  deletion?',
                confirm_needed3: 'You confirm  removing of ban?',
                delete_successful: 'User has been successfully removed.',
                delete_successful_review: 'Review has been successfully removed.',
                delete_successful_cinema: 'Cinema has been successfully removed.',
                delete_successful_genre: 'Genre has been successfully removed.',
                user_edit: 'User edit',
                post_edit: 'Post edit',
                comment_edit: 'Comment edit',
                save: 'Save',
                cancel: 'Cancel',
                error_email: 'User with such email already exists',
                select_photo: 'Select photo',
                send_notif_deletion: 'Send notification about deletion?',
                deletion_reason: 'Deletion reason',
                delete: 'Delete',
                admin: 'Admin',
                name: 'Name',
                about: 'About',
                city: 'City',
                region: 'Region',
                country: 'Country',
                was_last_time: 'Was Last Time',
                receive_pushes: 'Receive pushes',
                receive_comments_pushes: 'Receive comments pushes',
                receiveSamePeoplePushes: 'Receive same people pushes',
                receiveSupportPushes: 'Receive support pushes',
                receiveCommunityPushes: 'Receive community pushes',
                receiveChatPushes: 'Receive chat pushes',
                birth_date: 'Birth Date ',
                lang: 'Lang',
                text: 'Text',
                active: 'Active',
                added: 'Added',
                created: 'Created',
                user_email: 'User email',
                user: 'User',
                health_state: 'Health state',
                select_health_state: 'Select health state',
                hidden: 'Hidden',
                reported: 'Reported',
                comments: 'Comments',
                user_name: 'User Name',
                comment: 'Comment',
                bounded_post: 'Bounded post',
                inner_name: 'Inner title',
                template_edit: 'Template',
                template_content: 'Template content',
                templates: 'Templates',
                add: 'Add',
                updated: ' Updated',
                date_active: 'Mailing date',
                only_unreviewed: 'Only unreviewed',
                feedback_type: 'Feedback type',
                feedback_view: 'Feedback view',
                author: 'Author',
                feedback_content: 'Feedback content',
                message: 'Message',
                mailing_history: 'History',
                mailing_edit: 'MailingList',
                select_template: 'Select template',
                template: 'Template',
                ref_email: 'Email address',
                tags: 'Add tags',
                filter_type1: 'Send to all users',
                filter_type2: 'Send to specific emails',
                filter_type3: 'Send to filtered users',
                select_diagnosis: 'Select diagnosis',
                select_emails: 'Select email addresses',
                substr_email: 'Substring in email',
                select_country: 'Select country',
                email_only: 'Send email',
                push_only: 'Send push',
                sent_at: 'Sent',
                mail_template: 'Mail template',
                preview: 'Preview',
                settings: 'Settings',
                subject: 'Subject',
                logo: 'Logo',
                font_size: 'Font Family',
                select_font: 'Font Size',
                executed: 'Completed',
                some_error: 'Something gone wrong :( ',
                delete_successful_2: 'Status has been successfully removed.',
                delete_successful_3: 'Comment has been successfully removed.',
                delete_successful_4: 'Message has been successfully removed.',
                delete_successful_lang: 'Lang has been successfully removed.',
                delete_successful_actor: 'Actor has been successfully removed.',
                delete_successful_director: 'Director has been successfully removed.',

                select_diagnos: 'Select diagnos',
                menu_messages_public: 'Public messages',
                menu_messages_private: 'Private messages',
                user_1: 'ID User 1',
                user_2: 'ID User 2',
                update: 'Update',
                select_user: 'Select user',
                message_edit: 'Message edit',
                reg_date: 'Reg. date',
                user_devices: 'User devices',
                menu_push: 'Mailing',
                delete_successful3: ' Push mailing successfuly deleted',
                push_text: 'Text',
                push_title: 'Title',
                app_version: 'App version',
                select_period: 'Select period',
                distance: 'Search radius',
                gender: 'Gender',
                mpaa: 'MPAA rating',
                add_actors: 'Add actor',
                add_directors: 'Add director',
                add_film: 'Add actor',
                add_review: 'Add review',
                actor_edit: 'Actors editing',
                film_edit: 'Movies editing',
                review_edit: 'Review editing',
                last_name: 'Last name',
                first_name: 'First name',
                biography: 'Biography',
                add_lang: 'Add lang',
                lang_selection: 'Select lang',
                code: 'ISO code',
                film_title: 'Name',
                story_line: 'Story line',
                pg_rating: 'PG rating',
                film_length: 'Length',
                box_office: 'Box office',
                release_date: 'Release date',
                film_budget: 'Budget',
                review_title: 'Title',
                review_content: 'Review Text',
                review_impression: 'Impression',
                review_likescount: 'Likes',
                status: 'Status ',
                new: 'New',
                proved: 'Proved',
                blocked: 'Blocked',
                proved_successful_review: 'Review status changed to \'proved\'',
                blocked_successful_review: 'Review status changed to \'blocked\'',
                has_bad_words: 'contains profanity',
                menu_cinema: 'Cinemas',
                add_cinema: 'Add cinema',
                address: 'Address',
                zip_code: 'Zip code',
                phones_number: 'Phone numbers',
                menu_directors: 'Directors',
                menu_genres: 'Genres',
                add_genre: 'Add genre',
                imdb_id: 'IMDB ID',
                ratings: 'Ratings',
                last_update: 'Last update',
                inner_rating: 'Inner rating',
                original_title: 'Original title',
                followers_count: 'Followers count',
                menu_import: 'Import',
                period: 'Select import period',
                start_import: 'Start import',
                delete_successful_movie: 'Movie successfully deleted',
                delete_successful_support: 'Support request deleted',
                delete_successful_admin: 'Addmin successfully deleted',
                import_successful: 'Import ended successfully',
                delete_successful_keyword: 'Tag successfully deleted',
                import_stats: 'Import stats',
                published: 'Published',
                in_progress: 'Editing',
                place_of_birth: 'Place of birth',
                birthday: 'Birthday',
                zip: 'ZIP code',
                block_user_confirm: 'Select user ban period.',
                forever: 'forever',
                month: 'for month',
                year: 'for year',
                half_year: ' for half a year',
                user_blocked: 'User blocked ',
                cinemabo: 'Recommended by CinemaBO',
                menu_admin: 'Admins',
                add_admin: 'Add admin',
                admin_edit: 'Admin editing',
                user_login: 'Login',
                user_role: 'Access level',
                select_user_role: 'Select access level',
                u_god: 'Super Admin',
                u_admin: 'Admin',
                u_moderator: 'Review Moderator',
                u_content_editor: 'Content editor',
                u_translator: 'Translator',
                menu_keywords: 'Tags',
                web: 'Descktop',
                mobile: 'Mobile',
                tablet: 'Tablet'

            },
            ru: {
                title: 'CinemaBoom Admin',
                login_action: 'Войдите в свой аккаунт.',
                login_btn: 'Войти ',
                login: 'Войти',
                logout: 'Выйти',
                password: 'Пароль',
                error_login: 'Неверный e-mail или пароль',
                menu_users: 'Пользователи',
                menu_actors: 'Актеры',
                menu_posts: 'Посты',
                menu_comments: 'Комментарии',
                menu_feed: 'Фидбеки',
                menu_mailinglist: 'Рассылки',
                menu_lang: 'Мультиязычность',
                menu_film: 'Фильмы',
                menu_review: 'Отзывы',
                menu_support: 'Поддержка',
                actions: 'Действия',
                search: 'Поиск',
                confirm_needed: 'Нужно подтверждение ',
                confirm_needed2: 'Вы подтверждаете удаление?',
                confirm_needed3: 'Вы подтверждаете снятие бана?',
                delete_successful_keyword: 'Тег успешно удален.',
                delete_successful: 'Пользователь успешно удален.',
                delete_successful_review: 'Отзыв успешно удален',
                delete_successful_cinema: 'Кинотеатр успешно удален',
                delete_successful_genre: 'Жанр успешно удален',
                delete_successful_support: 'Запрос в поддержку удален',
                delete_successful_admin: 'Админ успешно удален',

                user_edit: 'Редактирование пользователей',
                actor_edit: 'Редактирование актеров',
                film_edit: 'Редактирование фильмов',
                review_edit: 'Редактирование отзывов',
                post_edit: 'Редактирование статусов',
                comment_edit: 'Редактирование коментариев',
                save: 'Сохранить',
                cancel: 'Отменить',
                error_email: 'Пользователь с таким email уже существует',
                select_photo: 'Выберите фото',
                send_notif_deletion: 'Отправить уведомление об удалении?',
                deletion_reason: 'Причина удаление ',
                delete: 'Удалить',
                admin: 'Админ',
                name: 'Имя',
                about: 'Описание',
                city: 'Город',
                region: 'Регион',
                country: 'Страна',
                was_last_time: 'Был Последний Раз',
                receive_pushes: 'Получать PUSH',
                receive_comments_pushes: 'Получать PUSH коментариев',
                receiveSamePeoplePushes: 'Получать same people PUSH',
                receiveSupportPushes: 'Получать support pushes',
                receiveCommunityPushes: 'Получать community PUSH',
                receiveChatPushes: 'Получать chat PUSH',
                birth_date: 'Дата рождения',
                lang: 'Язык',
                text: 'Текст',
                active: 'Активный',
                added: 'Добавлен',
                created: 'Создан',
                user_email: 'email пользовтеля',
                user: 'Пользователь',
                health_state: 'Состояние здоровья',
                select_health_state: 'Выберите Состояние здоровья',
                hidden: 'Скрыт',
                reported: 'Reported',
                comments: 'Коментарии',
                user_name: 'Имя пользвотеля',
                comment: 'Коментарий',
                bounded_post: 'Связанный Статус',
                inner_name: 'Внутреннее название',
                film_title: 'Название',
                story_line: 'Сюжет',
                template_edit: 'Шаблон',
                template_content: 'Шаблон (текстовка)',
                templates: 'Шаблоны',
                add: ' Добавить',
                updated: ' Обновлен',
                date_active: 'Дата рассылки',
                only_unreviewed: 'Только непросмотренные ',
                feedback_type: 'Тип фидбека',
                feedback_view: 'Просмотр фидбека',
                author: 'Автор',
                feedback_content: 'Текст фидбека',
                message: 'Сообщение',
                mailing_history: 'История отправок',
                mailing_edit: 'Рассылка',
                select_template: 'Выберите шаблон',
                template: 'Шаблон',
                ref_email: 'Обратный адрес',
                tags: 'Добавить тег',
                filter_type1: 'Отправка всем',
                filter_type2: 'Отправка на определенные имейлы',
                filter_type3: 'Отправка по выборке',
                select_diagnosis: 'Выберите диагнозы',
                select_diagnos: 'Выберите диагноз',
                select_emails: 'Выберите адреса електроной почты',
                substr_email: 'Подстрока в имейле',
                select_country: 'Выберите страну',
                email_only: 'Отправить письмо',
                push_only: 'Отравить пуш',
                sent_at: 'Отправлено',
                mail_template: 'Общий шаблон писем',
                preview: 'Предварительный просмотр',
                settings: 'Настройки ',
                subject: 'Тема ',
                logo: 'Логотип',
                font_size: 'Выберите шрифт',
                select_font: 'Размер шрифта',
                executed: 'Выполнена',
                some_error: 'Что то пошло не так :( ',
                delete_successful_2: 'Статус успешно удален.',
                delete_successful_lang: 'Язык успешно удален',
                delete_successful_3: 'Коментарий успешно удален.',
                delete_successful_4: 'Сообщение успешно удалено.',
                delete_successful_actor: 'Актер успешно удален.',
                delete_successful_director: 'Режиссер успешно удален.',
                message_edit: 'Редактирование сообщений',
                menu_messages_public: 'Паблик сообщения',
                menu_messages_private: 'Личные сообщения',
                user_1: 'ID User 1',
                user_2: 'ID User 2',
                update: 'Обновить',
                select_user: 'Выберите пользователя',
                reg_date: 'Дата регистрации',
                user_devices: ' Устройства',
                menu_push: 'Рассылка ',
                delete_successful3: ' Рассылка успешно удалена ',
                push_text: 'Текст',
                push_title: 'Заголовок',
                app_version: 'Версия приложения',
                select_period: 'Выберите период',
                distance: 'Радиус поиска',
                gender: 'Пол',
                mpaa: 'MPAA рейтинг',
                add_actors: 'Добавить актера',
                add_directors: 'Добавить режиссера',
                add_film: 'Добавить фильм',
                add_review: 'Добавить отзыв',
                last_name: 'Имя',
                first_name: 'Фамилия',
                biography: 'Биография',
                add_lang: 'Добавить язык',
                lang_selection: 'Выберите язык',
                code: 'ISO код',
                pg_rating: 'PG рейтинг',
                film_length: 'Длительность',
                box_office: 'Сборы',
                release_date: 'Дата выпуска',
                film_budget: 'Бюджет',
                review_title: 'Заголовок',
                review_content: 'Текст отзыва',
                review_impression: 'Впечатление',
                review_likescount: 'Количество лайков',
                status: 'Статус',
                new: 'Новый',
                proved: 'Одобрен',
                blocked: 'Заблокирован',
                proved_successful_review: 'Отзыв одобрен',
                blocked_successful_review: 'Отзыв заблокирован',
                confirm_needed4: 'Вы подтверждаете изменение статуса отзыва?',
                confirm_needed5: 'Вы подтверждаете одобрение ?',
                menu_admin: 'Администраторы',
                has_bad_words: 'содержит ненормативную лексику',
                menu_cinema: 'Кинотеатры',
                add_cinema: 'Добавить кинотеатр',
                address: 'Адрес',
                zip_code: 'Zip код',
                phones_number: 'Номера телефонов',
                menu_directors: 'Режиссеры',
                menu_genres: 'Жанры',
                add_genre: 'Добавить жанр',
                imdb_id: 'IMDB ID',
                ratings: 'Рейтинг',
                last_update: 'Последнее обновление',
                inner_rating: 'Внутренний рейтинг',
                original_title: 'Оригинальное название',
                followers_count: 'Количество фолловеров',
                menu_import: 'Импорт',
                period: 'Выберите период',
                start_import: 'Начать импорт',
                delete_successful_movie: 'Фильм успешно удален',
                import_successful: 'Импорт завершился успешно',
                import_stats: 'Статистика импорта',
                published: 'Опубликован',
                in_progress: 'Редактируется',
                place_of_birth: 'Место рождения',
                birthday: 'Дата рождения',
                zip: 'Почтовый индекс',
                block_user_confirm: 'Выберите период бана',
                forever: 'навсегда',
                month: 'на месяц',
                half_year: 'на полгода',
                year: 'на год',
                user_blocked: 'Пользватель заблокирован',
                cinemabo: 'Рекомендован CinemaBO',
                add_admin: 'Добавить админа',
                admin_edit: 'Редактироване админа',
                user_login: 'Логин',
                user_role: 'Уровень доступа',
                select_user_role: 'Выберите уровень доступа',
                u_god: 'Супер Админ',
                u_admin: 'Админ',
                u_moderator: 'Модератор отзыво',
                u_content_editor: 'Редактор контента',
                u_translator: 'Переводчик',
                menu_keywords: 'Теги',
                web: 'Десктоп (портрет)',
                mobile: 'Мобайл (портрет)',
                tablet: 'Планшет (портрет)',
                web_hr: 'Десктоп (горизонт)',
                mobile_hr: 'Мобайл (горизонт)',
                tablet_hr: 'Планшет (горизонт)'

            }
        };
        return translations[lang]
    };
    factory.setLang = function (lang) {
        sessionStorage.setItem('lang', lang)
    };
    factory.getLang = function () {
        var lang = sessionStorage.getItem('lang');
        lang = lang ? lang : 'ru';
        return lang
    };

    return factory
});
