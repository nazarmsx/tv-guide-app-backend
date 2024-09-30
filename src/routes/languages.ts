import * as express from 'express'
const router = express.Router();
import * as api from '../models/api'
import * as languages from 'languages'
import * as  MiddleWares from '../middlewares';

router.get('/api/languages', MiddleWares.checkAuth, MiddleWares.checkIsAdmin, function (req, res, next) {
    let langCodes = languages.getAllLanguageCode().reduce((prev, cur) => {
        prev[cur] = languages.getLanguageInfo(cur);
        prev[cur].code = cur;
        return prev;
    }, {});
    res.json({status: "OK", data: langCodes});
});

router.post('/api/languages/', MiddleWares.checkAuth, MiddleWares.checkIsAdmin, function (req, res, next) {
    api.Language.find({}).then(function (data) {
        let temp = null;
        data = data.filter((e: any) => {
            if (e.code == 'en') {
                temp = e;
                return false;
            }
            return true;
        });
        if (temp){
            data = [temp].concat(data);
        }
        res.json(data);
    });
});

router.post('/api/language', MiddleWares.checkAuth, MiddleWares.checkIsAdmin, function (req, res, next) {
    api.Language.collection['insert'](req.body).then(function (data) {
        if (!data) {
            res.json({error: "LANGUAGE_WASNT_ADDED"});
        }
        res.json(data.ops[0]);
    }).catch((er) => {
        res.json({error: er});
    })
});

router.delete('/api/language/:id', MiddleWares.checkAuth, MiddleWares.checkIsAdmin, function (req, res, next) {
    let lang_id = req.params.id;
    api.Language.remove({_id: lang_id}).then(() => {
        res.json({status: "OK"});
    }).catch(error => res.json(error));
});

export {router};
