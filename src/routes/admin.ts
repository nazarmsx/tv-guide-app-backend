import * as express from 'express'
const router: express.Router = express.Router();
import * as api from '../models/api'
import * as crypto from 'crypto'
import {TokenServiceFactory} from '../services/auth/TokenServiceFactory.js'
const TokenService = TokenServiceFactory.getTokenService();
import * as  MiddleWares from '../middlewares';
import {MailSender, BasicEmail} from '../messaging'
import * as moment from 'moment';

router.get('/admin', function (req, res, next) {
    res.render('admin/layout', {title: 'Admin', layout: false})
});

const admins = [
    {login: 'root', password: '***'}
];

router.post('/api/admin/sign-in', function (req, res, next) {
    for (let i = 0; i < admins.length; ++i) {
        if (admins[i].login === req.body.login && admins[i].password === crypto.createHash('sha256').update(req.body.password).digest('hex')) {
            let claims = {_id: admins[i], isAdmin: true};
            let [access_token] = [TokenService.generateAccessToken(claims, '1w')];
            res.cookie('auth_token', access_token, {maxAge: 24 * 60 * 60 * 1000});
            let response: any = {...admins[i]};
            response.token = access_token;
            res.json(response);
            const useragent = require('useragent');
            const agent = useragent.parse(req.headers['user-agent']);
            const sender: MailSender = MailSender.getSender();
            const emailText = `<b>${moment().utc().format('MM-DD-YYYY HH:mm')}</b> здійснено вхід в систему з браузер/OC: ${agent},IP-адреса ${req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'] : ''} `;
            const emailContents: string = new BasicEmail(`<p>${emailText}</p>`).getHtml();
            if (process.platform == 'linux') {
                sender.sendMessage('nazarmsx@gmail.com', '', `${moment().utc().format('MM-DD-YYYY HH:mm')} здійснено вхід в систему 🔔🔔🔔 `, emailContents, '')
            }
            return;
        }
    }
    res.json({error: 'USER_NOT_FOUND'})

});
router.get('/partial/:name', function (req, res, next) {
    res.render('admin/' + req.params.name, {layout: false})
});

router.get('/admin/api/questions', MiddleWares.checkAuth, MiddleWares.checkIsAdmin, function (req, res, next) {
    api.Question.find({}).then(rows => {
        res.json(rows)
    })
});
router.get('/admin/api/quizzes', MiddleWares.checkAuth, MiddleWares.checkIsAdmin, function (req, res, next) {
    api.Quiz.find({}).then(rows => {
        res.json(rows)
    })
});

router.post('/admin/api/questions', MiddleWares.checkAuth, MiddleWares.checkIsAdmin, function (req, res, next) {
    api.Question.collection['insert'](req.body).then(data => {
        res.json(data)
    })
});

router.get('/admin/api/restart', MiddleWares.checkAuth, MiddleWares.checkIsAdmin, function (req, res, next) {
    res.json({message: 'Good bye!'});
    process.nextTick(() => {
        process.exit(1);
    })
});

router.get('/admin/api/stats', async function (req, res, next) {
    const scale = 1024;
    const db = api.ConnectionPull.getConnection();
    let [stats, collections] = await Promise.all([db.stats(scale), db.collections()]);
    let collectionsStats: any = await Promise.all(collections.map((e: any) => (db.collection(e.s.name).stats(scale))));
    collectionsStats = collectionsStats.sort((a, b) => b.storageSize - a.storageSize);
    res.json({stats, collections: collectionsStats})
});

export {router};
