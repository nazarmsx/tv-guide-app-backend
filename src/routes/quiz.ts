import * as express from 'express'
const router = express.Router();
import * as api from '../models/api'
import * as  MiddleWares from '../middlewares';
import SEO from '../utils/SEO'
import {getCategories, getCategoryInfo, getCategoryBySlug, getLinksObject} from "../utils";
import * as moment from "moment";

router.get('/quizzes', function (req, res, next) {
    return quizzesCategoriesCtrl(req, res, next)
});

router.get('/:lang/quizzes', function (req, res, next) {
    return quizzesCategoriesCtrl(req, res, next)
});

async function quizzesCategoriesCtrl(req, res, next) {
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
    res.render('quiz-categories', {
        title: req.translations['home_title'],
        translations: req.translations,
        lang: req.lang,
        link: 'quizzes',
        categories: mainCategories,
        baseUrl: req.baseUrl,
        canonical: SEO.getCanonicalUrl(),
        canonical_link: `${SEO.getCanonicalUrl()}${req.lang === 'en' ? '' : `/${req.lang}`}/categories`,
    })
}

async function quizCategoryController(req, res, next) {
    let categories = await getCategories();
    let parentCategory = getCategoryBySlug(req.params.mainCategory, categories);
    let childCategory = getCategoryBySlug(req.params.categorySlug, categories);
    let breadcrumbs = [{
        name: parentCategory.name,
        link: `/${req.params.lang}/quiz-category/${req.params.mainCategory}`
    }];
    if (req.params.categorySlug) {
        breadcrumbs.push(
            {
                name: childCategory.name,
                link: `/${req.params.lang}/quiz-category/${req.params.mainCategory}/${req.params.categorySlug}`
            })
    }
    let findQuery: any = {};
    if (childCategory) {
        findQuery = {category_id: childCategory._id}
    } else {
        findQuery = {parent_id: parentCategory._id}

    }
    api.Quiz.find(findQuery).then(data => {
        data.forEach((question: any) => {
            question.viewData = Object.assign({}, question.translations[req.lang])
        });
        return res.render('quiz-category', {
            title: childCategory ? childCategory.name : parentCategory.name,
            breadcrumbs,
            lang: req.lang,
            [req.lang]: true,
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

router.get('/:lang/quiz-category/:mainCategory/:categorySlug', function (req, res, next) {
    return quizCategoryController(req, res, next)
});

router.get('/:lang/quiz-category/:mainCategory', function (req, res, next) {
    return quizCategoryController(req, res, next)
});

router.post('/api/quiz', MiddleWares.checkAuth, MiddleWares.checkIsAdmin, function (req, res, next) {
    let question = req.body;
    question.created = new Date();
    question.updated = question.created;
    question.status = 'new';
    api.Quiz.create(question).then(createdQuestion => {
        res.json(createdQuestion);
    }).catch(er => {
        console.error(er);
        res.status(500);
        return res.json({message: JSON.stringify(er, null, 4)})
    });
});

router.put('/api/quiz', MiddleWares.checkAuth, MiddleWares.checkIsAdmin, function (req, res, next) {
    let question = req.body;
    question.updated = new Date();
    api.Quiz.updateOne({_id: req.body._id}, req.body).then(updatedItem => {
        res.json(question);
    })
});

router.delete('/api/quiz/:id', MiddleWares.checkAuth, MiddleWares.checkIsAdmin, function (req, res, next) {
    api.Quiz.remove({_id: req.params.id}).then(updatedItem => {
        res.json(updatedItem);
    })
});

router.get('/:lang/quiz/:slug', function (req, res, next) {
    return quizController(req, res, next)
});

router.get('/quiz/:slug', function (req, res, next) {
    return quizController(req, res, next)
});

async function quizController(req, res, next) {
    let lang = req.params.lang ? req.params.lang : 'en';
    let slug = req.params.slug;
    let categories = await getCategories();
    api.Quiz.findOne({['translations.' + lang + '.slug']: slug}).then((data: any) => {
        if (!data) {
            return res.status(404).end('not-found')
        }
        let question = Object.assign(data, data.translations[lang]);
        let breadcrumbs = getCategoryInfo(question.category_id, lang, question.parent_id, categories);
        moment.locale(req.lang);
        let links = getLinksObject(data, 'quiz');
        question.date = moment(question.updated).format('MMMM DD, YYYY');
        return res.render('quiz', {
            title: question.title,
            breadcrumbs: breadcrumbs,
            lang: req.lang,
            link: `quiz/${data.translations['en'].slug}`,
            question: question,
            keywords: question.keywords ? question.keywords : '',
            links: links,
            baseUrl: req.baseUrl,
            canonical_link: `${SEO.getCanonicalUrl()}/${req.lang === 'en' ? '' : `${req.lang}/`}quiz/${data.translations[req.lang].slug}`,
            social_meta: true,
            canonical: SEO.getCanonicalUrl(),
            index: true,
            [req.lang]: true,
            translations: req.translations,
            description: question.description ? question.description : false
        })
    }).catch(er => {
        console.error(er);
        throw er
    })
}

export {router};
