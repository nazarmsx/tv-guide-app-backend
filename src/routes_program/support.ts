import * as express from 'express'
const router = express.Router();
import * as  MiddleWares from '../middlewares';
import * as api from '../models/api'
import {check, validationResult} from 'express-validator/check'
import to from 'await-to-js'

router.get('/api/support/messages', MiddleWares.checkAuth, MiddleWares.checkIsAdmin, async function (req, res, next) {
    let messages = await api.SupportMessage.find({senderId: req['user']._id});
    return res.json({
        status: 'OK',
        messages: messages
    })
});

router.post('/api/support/message', MiddleWares.checkAuth, [check('message').exists(), check('email').exists()], async function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.mapped()})
    }
    let requestData = req.body;
    let message = {
        senderId: req['user']._id,
        message: requestData.message,
        createdAt: Date.now(),
        system: false,
        email: requestData.email,
        reviewed: false
    };
    let newMessage = await api.SupportMessage.create(message);
    return res.json({
        status: 'OK',
        message: newMessage
    })
});

router.put('/api/support/message', MiddleWares.checkAuth, [check('message').exists(), check('messageId').exists()], async function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.mapped()})
    }
    let requestData = req.body;
    let promise: any = api.SupportMessage.findByIdAndUpdate(requestData.messageId, {message: requestData.message});
    let [err, updatedMessage] = await to(promise);
    if (err) {
        return res.json({
            error: 'MESSAGE_NOT_SAVED',
            description: err
        })
    }
    if (!updatedMessage) {
        return res.json({
            error: 'MESSAGE_NOT_FOUND'
        })
    }
    updatedMessage['message'] = requestData.message;
    return res.json({
        status: 'OK',
        message: updatedMessage
    })

});

router.get('/admin/api/messages', MiddleWares.checkAuth, MiddleWares.checkIsAdmin, async function (req, res, next) {
    let offset = req.query.offset ? parseInt(req.query.offset) : 0;
    let limit = req.query.limit ? parseInt(req.query.limit) : 10;
    let query: any = {system: false};
    if (req.query.count) {
        let totalCount = await api.SupportMessage.countDocuments(query);
        return res.json({
            total: totalCount
        })
    }
    let messages = await api.SupportMessage.find(query).sort({createdAt: -1}).limit(limit).skip(offset);
    res.json({
        data: messages
    })
});


export {router}
