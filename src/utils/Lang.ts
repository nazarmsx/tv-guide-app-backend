import * as acceptLanguage from "accept-language";
import {Request, Response} from "express";

const translations = {
    en: {
        home_title: 'Interview questions',
        description_index: "The big registry of coding interview questions. Find detailed answers explanation for most complex tech-questions.",
        about: "About us",
        categories: 'Categories',
        latest: 'Latest posts',
        quizzes: "Quizzes",
        questions_categories: "Questions categories",
        quizzes_categories: "Quizzes categories",
        quizzes_category: "quiz",
        share: "Share this page!",
        check_answers: "Check answers",
        your_score: "You Scored",
        unAnsweredQuestion: "Unanswered Question!",
        quizAdHeading: "Interviewing for a job?",
        quizAdBody: "Take the test to verify your knowledge."
    },
    ru: {
        home_title: 'Вопросы на собеседовании',
        keywords: " ",
        description_index: "Большая база вопросов на собеседование по програмированию. Найдите подробное объяснение ответов для самых сложных технических интервью.",
        about: "О нас",
        categories: 'Категории',
        latest: 'Последние посты',
        questions_categories: "Категории вопросов по технологиям",
        quizzes: "Тесты",
        quizzes_categories: "Категории тестов по технологиям",
        quizzes_category: "Тесты по",
        share: "Поделитесь этой страницей!",
        check_answers: "Проверить ответы",
        your_score: "Ваш результат",
        unAnsweredQuestion: "Неотвеченный вопрос!",
        quizAdHeading: "Готовитесь к собеседованию?",
        quizAdBody: "Пройдите тест чтобы удостовериться в своих знаниях."
    },
    uk: {
        home_title: 'Головна',
        description_index: "",
        about: "About us",
        latest: 'Останні публікації'

    },
};

export function getTranslations(lang) {

    let res = translations[lang];

    return res ? res : translations['en'];
}

acceptLanguage.languages(['en-US', 'ru-RU', 'uk-UK']);

export function LangMiddleware(req: Request, Response: any, next) {
    let lang = parseURL(req.path);
    if (!lang) {
        let languages: any = req.headers['accept-language'];
        lang = acceptLanguage.get(languages);
        if (lang)
            lang = lang.substr(0, 2);
        else
            lang = 'en';
    }
    req['translations'] = getTranslations(lang);
    req['lang'] = lang;
    req.baseUrl = req.protocol + '://' + req.get('host');
    next();
}

export function parseURL(url) {
    let res = "";
    let tempArray = url.split('/');
    for (let i = 0; i < tempArray.length; ++i) {
        if (translations[tempArray[i]])
            res = tempArray[i];
    }
    return res;
}


