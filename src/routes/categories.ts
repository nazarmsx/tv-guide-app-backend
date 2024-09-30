import * as express from 'express'

const router = express.Router();
import * as api from '../models/api'
import * as  MiddleWares from '../middlewares';

router.get('/api/category', MiddleWares.checkAuth, MiddleWares.checkIsAdmin, function (req, res, next) {
    api.Category.find({}).then(rows => {
        res.json(rows);
    });
});

router.post('/api/category', MiddleWares.checkAuth, MiddleWares.checkIsAdmin, function (req, res, next) {
    let category = req.body;
    category.created = new Date();
    category.updated = category.created;
    api.Category.collection['insert'](req.body).then(data => {
        res.json(data.ops[0]);
    });
});

router.put('/api/category', MiddleWares.checkAuth, MiddleWares.checkIsAdmin, function (req, res, next) {
    let category = req.body;
    category.updated = new Date();
    api.Category.updateOne({_id: req.body._id}, req.body).then(updatedItem => {
        res.json(category);
    })
});

router.delete('/api/category/:id', MiddleWares.checkAuth, MiddleWares.checkIsAdmin, function (req, res, next) {
    let id = req.params.id;
    api.Category.remove({_id: id}).then(data => {
        res.json({message: 'Category removed'});
    });
});

router.post('/api/generate-slug', MiddleWares.checkAuth, MiddleWares.checkIsAdmin, function (req, res, next) {
    let text = req.body.text;
    let lang = req.body.lang ? req.body.lang : 'en';
    const getSlug = require('speakingurl').createSlug('-', lang);
    if (!text)
        return res.json("");
    res.json(getSlug(text));
});

router.get('/admin/api/categories', function (req, res, next) {
    api.Category.find({
        parent_id: null
    }).then(rows => {
        res.json(rows);
    });
});

router.get('/api/sub-categories', function (req, res, next) {
    api.Category.find({
        parent_id: {$ne: null}
    }).then(rows => {
        res.json(rows);
    });

});

router.get('/sitemap.xml', async function (req, res) {
    const sm = require('sitemap');
    let links = [];
    let [questions, quizzes] = await Promise.all([api.Question.find({status: 'published'}), api.Quiz.find({status: 'published'})]);
    questions.forEach((e: any) => {
        if (e.translations) {
            let translations = Object.keys(e.translations).forEach(translation => {
                links.push({
                    url: `/${translation}/question/${e.translations[translation].slug}/`,
                    changefreq: 'monthly',
                    priority: 0.5
                })
            })
        }
    });
    quizzes.forEach((e: any) => {
        if (e.translations) {
            let translations = Object.keys(e.translations).forEach(translation => {
                links.push({
                    url: `/${translation}/quiz/${e.translations[translation].slug}/`,
                    changefreq: 'monthly',
                    priority: 0.5
                })
            })
        }
    });
    let sitemap = sm.createSitemap({
        hostname: 'https://www.interviewhelper.org',
        cacheTime: 600000,        // 600 sec - cache purge period
        urls: links
    });
    sitemap.toXML(function (err, xml) {
        if (err) {
            return res.status(500).end();
        }
        res.header('Content-Type', 'application/xml');
        res.send(xml);
    });
});

export {router};
