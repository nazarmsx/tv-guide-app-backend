import * as express from 'express'
import * as  MiddleWares from '../middlewares';
import {firebaseAdminService} from '../services';
import * as api from '../models/api'
const router = express.Router();

router.get('/api/user', MiddleWares.checkAuth, function (req, res, next) {
    res.json({status: 'ok'});
});

router.post('/api/user/sign-in', MiddleWares.checkFirebaseAuth, async function (req, res, next) {
    const firebaseUid = req['firebaseUid'];
    let [user, firebaseUser]: any = await Promise.all([api.User.findOne({firebase_uid: firebaseUid}), firebaseAdminService.findFirebaseUserById(firebaseUid)]);
    if (!firebaseUser) {
        return res.status(406).json({error: "FIREBASE_USER_NOT_FOUND"})
    }
    let now = new Date();
    if (!user) {
        let newUser = {
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            avatar: firebaseUser.photoURL,
            firebase_uid: firebaseUid,
            createdAt: new Date(),
            lastActive: now,
            settings: null,
            settingsLastUpdated: null
        };
        user = await api.User.create(newUser);
    } else {
        user.lastActive = now;
        user.save();
    }
    res.json({status: 'ok', user: user});
});

router.get('/api/user/me', MiddleWares.checkFirebaseAuth, async function (req, res, next) {
    const firebaseUid = req['firebaseUid'];
    let user = await api.User.findOne({firebase_uid: firebaseUid});
    res.json({user: user});
});

router.put('/api/user', MiddleWares.checkFirebaseAuth, async function (req, res, next) {
    const firebaseUid = req['firebaseUid'];
    req.body.settingsLastUpdated = new Date();
    let user = await api.User.updateOne({firebase_uid: firebaseUid}, req.body);
    res.json({user: user});
});

router.get('/admin/api/users', MiddleWares.checkAuth, MiddleWares.checkIsAdmin, async function (req, res, next) {
    let offset = req.query.offset ? parseInt(req.query.offset) : 0;
    let limit = req.query.limit ? parseInt(req.query.limit) : 10;
    let search = req.query.search;
    let query: any = {};
    if (req.query.count) {
        let totalCount = await api.User.countDocuments({});
        return res.json({
            total: totalCount
        })
    }
    if (search && search.toLowerCase) {
        query.name = {$regex: `.*${search}.*`};
    }
    let users = await api.User.find(query).sort({createdAt: -1}).limit(limit).skip(offset);
    res.json({
        data: users
    })
});

router.get('/api/my-region', MiddleWares.regionExtract, async function (req, res, next) {
    res.json({
        region: req['region']
    })
});

export {router}
