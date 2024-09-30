import * as express from 'express'
const router = express.Router();
import * as api from '../models/api'
import * as  MiddleWares from '../middlewares';

router.post('/api/question', MiddleWares.checkAuth, MiddleWares.checkIsAdmin, function (req, res, next) {
    let question = req.body;
    question.created = new Date();
    question.updated = question.created;
    question.status = 'new';
    api.Question.collection['insert'](question).then(createdQuestion => {
        res.json(createdQuestion);
    }).catch(er => {
        console.error(er);
        res.status(500);
        return res.json({message: JSON.stringify(er, null, 4)})
    });
});

router.put('/api/question', MiddleWares.checkAuth, MiddleWares.checkIsAdmin, function (req, res, next) {
    let question = req.body;
    question.updated = new Date();
    api.Question.updateOne({_id: req.body._id}, req.body).then(updatedItem => {
        res.json(question);
    })
});

router.delete('/api/question/:id', MiddleWares.checkAuth, MiddleWares.checkIsAdmin, function (req, res, next) {
    api.Question.remove({_id: req.params.id}).then(updatedItem => {
        res.json(updatedItem);
    })
});

export {router};
