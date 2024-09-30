import * as express from 'express'
const router = express.Router();
import * as api from '../models/api'
import * as Lang from '../utils/Lang'
import SEO from '../utils/SEO'
import * as moment from "moment";
import {getCategories, getCategoryInfo, getCategoryBySlug, getLinksObject} from "../utils";

router.get('/:lang', function (req, res, next) {
    return indexController(req, res, next)
});

router.get('/', function (req, res, next) {
    return indexController(req, res, next)
});

async function indexController(req, res, next) {
    if (!Lang.parseURL(req.path) && req.path != '/') {
        next();
        return
    }
    let categories = await getCategories();
    let questions = await api.Question.find({status: 'published'}).limit(10);
    questions.forEach((question: any) => {
        if (question.translations && question.translations[req.lang]) {
            delete question.translations[req.lang].contents;
            Object.assign(question, question.translations[req.lang]);
            moment.locale(req.lang);
            question.date = moment(question.updated).fromNow();
            delete question.translations;
        }
    });
    let mainCategories = categories.filter(e => !e.parent_id).map(category => {
        category = category.toJSON();
        category.children = [];
        categories.forEach(e => {
            if (e.parent_id == category._id) {
                category.children.push(e)
            }
        });
        return category
    });
    res.render('index', {
        title: req.translations['home_title'],
        description: req.translations['description_index'],
        translations: req.translations,
        lang: req.lang,
        categories: mainCategories,
        baseUrl: req.baseUrl,
        [req.lang]: true,
        canonical: SEO.getCanonicalUrl(),
        index: true,
        canonical_link: `${SEO.getCanonicalUrl()}${req.lang === 'en' ? '' : `/${req.lang}`}`,
        questions
    })
}

router.get('/categories', function (req, res, next) {
    return categoriesCtrl(req, res, next)
});

router.get('/:lang/categories', function (req, res, next) {
    return categoriesCtrl(req, res, next)
});

async function categoriesCtrl(req, res, next) {
    let categories = await getCategories();
    let mainCategories = categories.filter(e => !e.parent_id).map(category => {
        category = category.toJSON();
        category.children = [];
        categories.forEach(e => {
            if (e.parent_id == category._id) {
                category.children.push(e)
            }
        });
        return category
    });
    res.render('categories', {
        title: req.translations['home_title'],
        translations: req.translations,
        lang: req.lang,
        link: 'categories',
        categories: mainCategories,
        baseUrl: req.baseUrl,
        canonical: SEO.getCanonicalUrl(),
        canonical_link: `${SEO.getCanonicalUrl()}${req.lang === 'en' ? '' : `/${req.lang}`}/categories`,
    })
}

router.get('/:lang/category/:mainCategory/:categorySlug', function (req, res, next) {
    return categoryController(req, res, next)
});

router.get('/:lang/question/:slug', function (req, res, next) {
    return questionController(req, res, next)
});

router.get('/question/:slug', function (req, res, next) {
    return questionController(req, res, next)
});
router.get('/:lang/category/:mainCategory', function (req, res, next) {
    return categoryController(req, res, next)
});

async function categoryController(req, res, next) {
    let categories = await getCategories();
    let parentCategory = getCategoryBySlug(req.params.mainCategory, categories);
    let childCategory = getCategoryBySlug(req.params.categorySlug, categories);
    let breadcrumbs = [{
        name: parentCategory.name,
        link: `/${req.params.lang}/category/${req.params.mainCategory}`
    }];
    if (req.params.categorySlug) {
        breadcrumbs.push(
            {
                name: childCategory.name,
                link: `/${req.params.lang}/category/${req.params.mainCategory}/${req.params.categorySlug}`
            })
    }
    let findQuery: any = {};
    if (childCategory) {
        findQuery = {category_id: childCategory._id}
    } else {
        findQuery = {parent_id: parentCategory._id}

    }
    api.Question.find(findQuery).then(data => {

        data.forEach((question: any) => {
            question.viewData = Object.assign({}, question.translations[req.lang])
        });
        return res.render('category', {
            title: childCategory ? childCategory.name : parentCategory.name,
            breadcrumbs,
            lang: req.lang,
            questions: data,
            baseUrl: req.baseUrl,
            canonical: SEO.getCanonicalUrl(),
            translations: req.translations,
        })
    }).catch(er => {
        console.error(er);
        throw er
    })
}

async function questionController(req, res, next) {
    let lang = req.params.lang ? req.params.lang : 'en';
    let slug = req.params.slug;
    let categories = await getCategories();

    api.Question.findOne({['translations.' + lang + '.slug']: slug}).then(async (data: any) => {
        if (!data) {
            return res.status(404).end('not-found')
        }
        let question = Object.assign(data, data.translations[lang]);
        let breadcrumbs = getCategoryInfo(question.category_id, lang, question.parent_id, categories);
        moment.locale(req.lang);
        let links = getLinksObject(data, 'question');
        let quizzes = [];
        if (question.category_id) {
            quizzes = await api.Quiz.find({category_id: question.category_id, status: 'published'});
            if (quizzes && quizzes.length) {
                quizzes = quizzes.map(e => {
                    Object.assign(e, e.translations[lang]);
                    return e;
                })
            }
        }

        question.date = moment(question.updated).format('MMMM DD, YYYY');

        return res.render('question', {
            title: question.title,
            breadcrumbs: breadcrumbs,
            lang: req.lang,
            link: `question/${data.translations['en'].slug}`,
            question: question,
            keywords: question.keywords ? question.keywords : '',
            links: links,
            baseUrl: req.baseUrl,
            canonical_link: `${SEO.getCanonicalUrl()}/${req.lang === 'en' ? '' : `${req.lang}/`}question/${data.translations[req.lang].slug}`,
            social_meta: true,
            canonical: SEO.getCanonicalUrl(),
            index: true,
            [req.lang]: true,
            translations: req.translations,
            quizzes: quizzes ? quizzes : false,
            description: question.description ? question.description : false
        })
    }).catch(er => {
        console.error(er);
        throw er
    })
}

router.get('/about', function (req: any, res, next) {
    res.render('about', {
        title: req.translations.about,
        link: 'about',
        translations: req.translations,
        lang: req.lang,
        [req.lang]: true,
        baseUrl: req.baseUrl,
        index: true,
        canonical: SEO.getCanonicalUrl(),
        canonical_link: `${SEO.getCanonicalUrl()}/about`,

    })
});
router.get('/:lang/about', function (req: any, res, next) {
    res.render('about', {
        title: req.translations.about,
        link: 'about',
        translations: req.translations,
        lang: req.lang,
        [req.lang]: true,
        baseUrl: req.baseUrl, index: true, canonical: SEO.getCanonicalUrl(),
        canonical_link: `${SEO.getCanonicalUrl()}${req.lang === 'en' ? '' : `/${req.lang}`}/about`,

    })
});

export {router};
