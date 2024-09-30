import * as express from 'express'
const router = express.Router();
import * as api from '../models/api'
import * as  MiddleWares from '../middlewares';
import to from 'await-to-js'

router.get('/api/actor-list', MiddleWares.checkAuth, MiddleWares.checkIsAdmin, async function (req, res, next) {
    let offset = req.query.offset ? parseInt(req.query.offset) : 0;
    let limit = req.query.limit ? parseInt(req.query.limit) : 10;
    let search = req.query.search;
    let query: any = {};
    if (req.query.count) {
        let totalCount = await api.Actor.countDocuments({});
        return res.json({
            total: totalCount
        })
    }
    if (search && search.toLowerCase) {
        query.name = {$regex: `.*${search}.*`};
    }
    let actors = await api.Actor.find(query).sort({popularity: -1}).limit(limit).skip(offset);
    res.json({
        data: actors
    })
});

router.put('/api/actor', MiddleWares.checkAuth, MiddleWares.checkIsAdmin, function (req, res, next) {
    let question = req.body;
    question.updatedAt = Date.now();
    api.Actor.updateOne({_id: req.body._id}, req.body).then(updatedItem => {
        res.json(question);
    })
});

router.delete('/api/actor/:id', MiddleWares.checkAuth, MiddleWares.checkIsAdmin, function (req, res, next) {
    api.Actor.remove({_id: req.params.id}).then(updatedItem => {
        res.json(updatedItem);
    })
});

router.get('/admin/api/channels', MiddleWares.checkAuth, MiddleWares.checkIsAdmin, async function (req: any, res) {
    let offset = req.query.offset ? parseInt(req.query.offset) : 0;
    let limit = req.query.limit ? parseInt(req.query.limit) : 10;
    let query: any = {};
    if (req.query.search) {
        query = {title: {$regex: `.*${req.query.search.toLowerCase().trim()}.*`}};
    }
    if (req.query.count) {
        let totalCount = await api.Channel.countDocuments(query);
        return res.json({
            total: totalCount
        })
    }
    let devices = await api.Channel.find(query).sort({createdAt: 1}).limit(limit).skip(offset);
    res.json({
        data: devices
    })
});
router.put('/api/channel', MiddleWares.checkAuth, MiddleWares.checkIsAdmin, function (req, res, next) {
    let channel = req.body;
    channel.updatedAt = Date.now();
    api.Channel.updateOne({_id: req.body._id}, req.body).then(updatedItem => {
        res.json(channel);
    })
});

router.delete('/admin/api/channel/:id', MiddleWares.checkAuth, MiddleWares.checkIsAdmin, async function (req, res) {
    let programId: string = req.params.id;
    let [err, result] = await to(api.Channel.findOneAndRemove({_id: programId}) as any);
    if (err) {
        return res.json({error: err})
    }
    return res.json({status: 'OK', data: result});
});

export {router};
