import * as express from 'express'

const router = express.Router();
import * as api from '../models/api'
import * as  MiddleWares from '../middlewares';
import to from 'await-to-js';

router.get('/api/channel-lists'
    , MiddleWares.checkAuth, MiddleWares.regionExtract
    , async function (req, res, next) {
        let lang = req.query.lang ? req.query.lang : 'ru';
        if (lang.indexOf('-') !== -1) {
            lang = 'ru';
            lang = lang.split('-')[0]
        }
        let findQuery: any = {isActive: true};
        if (req.query.region) {
            findQuery.region = req.query.region;
        } else {
            findQuery.region = 'ua';
        }
        let channelLists = await api.ChannelList.find(findQuery).lean(true);
        channelLists = channelLists.sort((a, b) => a.index - b.index).map(e => {
            let tmp = {
                _id: e._id,
                region: findQuery.region,
                name: e.name,
                channels: e.channels.map(e => e.title),
                createdByServer: e.createdByServer
            };
            if (findQuery.region === 'ua' && e.translations && e.translations.ru && e.translations.uk) {
                Object.assign(tmp, lang === 'uk' ? e.translations.uk : e.translations.ru);
            }
            return tmp;
        });
        return res.json({status: "OK", data: channelLists})
});

router.get('/admin/api/channel-lists', MiddleWares.checkAuth, MiddleWares.checkIsAdmin, async function (req: any, res) {
    let offset = req.query.offset ? parseInt(req.query.offset) : 0;
    let limit = req.query.limit ? parseInt(req.query.limit) : 10;
    let query: any = {};
    if (req.query.count) {
        let totalCount = await api.ChannelList.countDocuments(query);
        return res.json({
            total: totalCount
        })
    }
    let items = await api.ChannelList.find(query).sort({createdAt: 1}).limit(limit).skip(offset);
    res.json({
        data: items
    })
});

router.get('/admin/api/channel-list/:id', MiddleWares.checkAuth, MiddleWares.checkIsAdmin, async function (req: any, res) {
    let channelList = await api.ChannelList.findOne({_id: req.params.id});
    if (!channelList) {
        return res.status(404).json({data: null, error: "CHANNEL_LIST_NOT_FOUND"});
    }
    return res.json({data: channelList, status: "OK"})

});
router.post('/admin/api/channel-list', MiddleWares.checkAuth, MiddleWares.checkIsAdmin, async function (req, res, next) {
    let channelList = req.body;
    channelList.createdAt = Date.now();
    channelList.updatedAt = Date.now();
    channelList.createdByServer = true;
    channelList.status = 'new';
    let count = await api.ChannelList.countDocuments({region: channelList.region});
    channelList.index = count;
    api.ChannelList.collection.insertOne(channelList).then(createdChannelList => {
        res.json({
            status: 200,
            data: createdChannelList
        })
    })
});

router.put('/admin/api/channel-list', MiddleWares.checkAuth, MiddleWares.checkIsAdmin, function (req, res, next) {
    let channelList = req.body;
    channelList.updatedAt = Date.now();
    api.ChannelList.updateOne({_id: req.body._id}, req.body).then(updatedItem => {
        res.json(updatedItem);
    })
});

router.put('/admin/api/channel-list/order', MiddleWares.checkAuth, MiddleWares.checkIsAdmin, async function (req, res, next) {
    let channelLists = req.body;
    let data = await Promise.all(channelLists.map((e, index) => {
        return api.ChannelList.updateOne({_id: e._id}, {index: index, updatedAt: Date.now()})
    }));
    res.json({status: "OK", data});
});

router.delete('/admin/api/channel-list/:id', MiddleWares.checkAuth, MiddleWares.checkIsAdmin, async function (req, res) {
    let channelListId: string = req.params.id;
    let channelList = await api.ChannelList.findOne({_id: req.params.id});
    if (!channelList) {
        return res.status(400).json({error: "CHANNEL_LIST_NOT_FOUND"})
    }
    let otherChannelLists = await api.ChannelList.find({region: channelList.region});
    otherChannelLists = otherChannelLists.filter(e => e.id != channelListId).sort((a, b) => a.index - b.index);
    await Promise.all(otherChannelLists.map((e, index) => {
        return api.ChannelList.updateOne({_id: e._id}, {index: index, updatedAt: Date.now()})
    }));
    let [err, result] = await to(api.ChannelList.findOneAndRemove({_id: channelListId}) as any);
    if (err) {
        return res.json({error: err})
    }
    return res.json({status: 'OK', data: result});
});

export {router};
