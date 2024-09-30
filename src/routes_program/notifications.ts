import * as express from 'express';
import * as moment from 'moment';
const router = express.Router();
import * as api from '../models/api';
import {logger as Logger} from '../services/logger';
const {check, validationResult} = require('express-validator/check');
import * as  MiddleWares from '../middlewares';

router.post('/api/notification', MiddleWares.checkAuth,
    function (req, res, next) {
        let notification = req.body;
        notification.created = new Date();
        if (typeof notification.due_date === 'string') {
            notification.due_date = moment(new Date(notification.due_date)).utc(false).valueOf()
        }
        api.Notification.collection['insertOne'](notification).then(createdNotification => {
            res.json(createdNotification)
        }).catch(er => {
            Logger.error(er);
            res.status(500);
            return res.json({message: JSON.stringify(er, null, 4)})
        })
});

router.post('/api/push-token', [check('token').exists(), check('uuid').exists()], MiddleWares.checkAuth, async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.mapped()})
    }
    let dbToken = await api.Device.findOne({uuid: req.body.token});
    if (!dbToken) {
        api.Device.collection['insert']({token: req.body.token, createdAt: Date.now()});
        res.json({
            status: 'OK',
            message: 'Token added'
        })
    } else {
        res.json({
            status: 'OK',
            message: 'Token already registered'
        })
    }
});

export {router}
