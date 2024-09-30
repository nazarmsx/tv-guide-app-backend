import * as express from 'express'
import * as api from '../models/api'
import {check, validationResult} from 'express-validator/check'
import {TokenServiceFactory} from '../services/auth/TokenServiceFactory.js';
const TokenService = TokenServiceFactory.getTokenService();
import * as  MiddleWares from '../middlewares';
const router = express.Router();

router.post('/api/device', [check('token').exists(), check('uuid').exists()], MiddleWares.regionExtract, async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.mapped()})
    }
    let region = req.region;
    if (region === 'gb') {
        region = 'uk';
    }
    if (region === 'ru') {
        region = 'ua';
    }
    if (['ua', 'uk'].indexOf(region) === -1) {
        region = "uk";
    }
    let dbDevice: any = await api.Device.findOne({uuid: req.body.uuid});
    if (!dbDevice) {
        let createdDevice = await api.Device.collection['insert']({
            token: req.body.token,
            uuid: req.body.uuid,
            createdAt: Date.now(),
            lastSeen: Date.now(),
            autoUpdate: true,
            pushEnabled: true,
            platform: req.body.platform,
            region: region,
            launchCount: 1
        });
        if (!createdDevice.result.ok) {
            return res.status(500).json({error: 'CREATE_DEVICE_ERROR'})
        }
        let device = createdDevice.ops[0];
        let claims = {_id: device._id};
        let [access_token, refresh_token] = [TokenService.generateAccessToken(claims), TokenService.generateRefreshToken(claims)];
        let decodedClaims = TokenService.verifyToken(access_token);
        api.Device.updateOne(
            {'_id': device._id},
            {
                '$set': {
                    refresh_token: refresh_token
                }
            }, function (err, res) {

            }
        );
        return res.json({
            status: 'OK',
            access_token,
            refresh_token,
            exp: decodedClaims.exp,
            region: region
        })
    } else {
        let claims = {_id: dbDevice._id};
        let [access_token] = [TokenService.generateAccessToken(claims)];
        let decodedClaims = TokenService.verifyToken(access_token);

        res.json({
            status: 'OK',
            access_token: access_token,
            refresh_token: dbDevice.refresh_token,
            exp: decodedClaims.exp,
            region: region
        });
        api.Device.updateOne(
            {'_id': dbDevice._id},
            {
                '$set': {
                    lastSeen: Date.now(),
                    region: region
                }
            }, function (err, res) {

            }
        )
    }
});

router.post('/api/refresh-token', [check('refresh_token').exists()], async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.mapped()})
    }
    let decodedClaims = TokenService.verifyToken(req.body.refresh_token);
    if (decodedClaims.error) {
        return res.status(400).json({error: 'BAD_TOKEN'})
    }
    let dbDevice = await api.Device.findOne({_id: decodedClaims._id});
    if (!dbDevice) {
        return res.status(400).json({error: 'DEVICE_NOT_FOUND'})
    }
    const launchCount = dbDevice.launchCount ? dbDevice.launchCount + 1 : 2;
    let claims = {_id: dbDevice._id};
    let access_token = TokenService.generateAccessToken(claims);
    let decoded = TokenService.verifyToken(access_token);
    api.Device.updateOne(
        {'_id': dbDevice._id},
        {
            '$set': {
                lastSeen: Date.now(),
                launchCount
            }
        }, function (err, res) {

        }
    );
    return res.json({
        status: 'OK',
        access_token: access_token,
        exp: decoded.exp
    })

});

router.put('/api/device', MiddleWares.checkAuth, async function (req: any, res) {
    const updateFields = ['pushEnabled', 'autoUpdate'];
    let dbDevice = await api.Device.findOne({_id: req.user._id});
    if (!dbDevice) {
        return res.status(400).json({error: 'DEVICE_NOT_FOUND'})
    }
    let requestData = {};
    for (let prop in req.body) {
        if (updateFields.indexOf(prop) !== -1) {
            dbDevice[prop] = req.body[prop];
        }
    }
    dbDevice.save(
        function (err) {
            if (err) {
                return res.status(400).json({error: "CANT_UPDATE", description: err})
            }
            return res.json({status: "OK"})
        }
    )

});

router.get('/admin/api/devices', MiddleWares.checkAuth, MiddleWares.checkIsAdmin, async function (req: any, res) {
    let offset = req.query.offset ? parseInt(req.query.offset) : 0;
    let limit = req.query.limit ? parseInt(req.query.limit) : 10;
    let query: any = {};
    if (req.query.count) {
        let totalCount = await api.Device.countDocuments({});
        return res.json({
            total: totalCount
        })
    }
    let devices = await api.Device.find(query).sort({createdAt: -1}).limit(limit).skip(offset);
    res.json({
        data: devices
    })
});

export {router};
