import * as express from 'express'
const router = express.Router();
import * as moment from 'moment'
import to from 'await-to-js'
import {TvGidFetcher} from '../core/TvGidFetcher'
import {MergingUaFetcher} from '../core/MergingUaFetcher'
import {TV24} from '../core/TV24'
import {ActorService} from '../core/ActorService'
import ChannelService from '../controllers/channels'
import ViasatFetcher from '../core/Viasat'
import {connection as redis} from '../services/redis/connection'
import * as api from '../models/api'
import {check, validationResult} from 'express-validator/check'
import * as  MiddleWares from '../middlewares';

router.get('/api/program', MiddleWares.checkAuth, MiddleWares.regionExtract, async function (req, res, next) {
    let cashUrl = req.url;
    let date = req.query.date ? req.query.date : moment(new Date()).format('YYYY-MM-DD');
    let lang = req.query.lang ? req.query.lang : 'ru';
    if (lang.indexOf('-') !== -1) {
        lang = 'ru';
        lang = lang.split('-')[0]
    }
    if (req.query.gzip) {
        let [err, inDbProgram] = await to(redis.getAsync(cashUrl));
        if (err) {
            console.error(err)
        }
        if (inDbProgram) {
            res.type('json');
            return res.end(inDbProgram);
        }
    }
    let findQuery: any = {date: date};
    if (req.query.region) {
        findQuery.region = req.query.region;
    } else {
        findQuery.region = 'ua';
    }
    let inDbProgram: any = await api.Program.findOne(findQuery).lean();
    if (!inDbProgram || !inDbProgram.program) {
        return res.json({
            error: "NOT_AVAILABLE",
            message: "NOT_AVAILABLE"
        });
    }
    let channels = inDbProgram.program;
    channels.forEach(channel => {
        channel.program.forEach(program => {
            if (program.translations) {

                if (!program.translations[lang]) {
                    Object.assign(program, program.translations['ru'])
                } else {
                    Object.assign(program, program.translations[lang])
                }
            }
            delete program.translations
        })
    });
    if (req.query.gzip) {
        redis.set(cashUrl, JSON.stringify(channels), 'EX', 10 * 60); //cash for 10 minutes
    }
    return res.json(channels)
});

router.post('/api/program', MiddleWares.checkAuth, MiddleWares.checkIsAdmin, function (req, res) {
    let date = req.body.date;
    if (!date)
        date = moment(new Date()).format('YYYY-MM-DD');
    let fetcherType = req.body.fetcher;
    if (!fetcherType) {
        return res.json({error: 'No fetcher provided', body: req.body})
    }
    let fetcher = null;

    if (fetcherType === 'viasat') {
        fetcher = new ViasatFetcher();
    }
    if (fetcherType === 'tvgid') {
        fetcher = new TvGidFetcher();
    }
    if (fetcherType === 'merged') {
        fetcher = new MergingUaFetcher();
    }
    if (fetcherType === 'tv24') {
        fetcher = new TV24();
    }
    api.Program.findOne({date: date, region: fetcher.getRegion()}).then(async function (inDbProgram) {
        try {
            const program = await fetcher.getFullProgram(date);
            if (req.body.loadDetails){
                await fetcher.loadDescriptions(program);
            }
            if (inDbProgram) {
                res.json({
                    status: 200,
                    message: 'Program updated'
                });
                api.Program.updateOne(
                    {'_id': inDbProgram._id, region: fetcher.getRegion()},
                    {
                        '$set': {
                            program: program,
                            'updated': new Date(),
                            region: fetcher.getRegion()
                        }
                    },
                    function (err, doc) {
                    }
                )
            } else {
                let createdData = {
                    created: new Date(),
                    updated: new Date(),
                    date,
                    program: program,
                    region: fetcher.getRegion()
                };
                api.Program.collection['insert'](createdData).then(createdQuestion => {
                    res.json({
                        status: 200,
                        message: 'Program created'
                    })
                })
            }
            let channelService = new ChannelService();
            await channelService.syncChannels(program, fetcher.getRegion());
            let service = new ActorService();
            let ids = service.extractActorIdsFromProgram(program);
            await service.findAndUpdateActorsInDatabase(ids);
        } catch (er) {
            throw er
        }
    }).catch(er => {
        throw er
    })

});

router.delete('/admin/api/program/:id', MiddleWares.checkAuth, MiddleWares.checkIsAdmin, async function (req, res) {
    let programId: string = req.params.id;
    let [err, result] = await to(api.Program.findOneAndRemove({_id: programId}) as any);
    if (err) {
        return res.json({error: err})
    }
    return res.json({status: 'OK', data: result});
});

router.post('/api/channels', MiddleWares.checkAuth, MiddleWares.checkIsAdmin, async function (req, res, next) {
    let fetcher = new ViasatFetcher();
    let channels = await fetcher.fetchChannels();
    let channelService = new ChannelService();
    channelService.updateChannels(channels);
    return res.json({status: 200, channels: channels})
});

router.get('/api/channels', MiddleWares.checkAuth, async function (req, res, next) {
    let channelService = new ChannelService();
    let region = req.query.region ? req.query.region : 'ua';
    let channels = await channelService.getChannelsV2({region});
    return res.json({status: 200, channels: channels})
});

router.get('/api/actors', [check('lang').exists(), check('ids').exists()], async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.mapped()})
    }
    let actorIds = req.query.ids.split(',');
    let lang = req.query.lang;
    let fields = {tmdb_id: 1};
    fields[`translations.${lang}`] = 1;
    let actors: any = await api.Actor.find({tmdb_id: {$in: actorIds}}, fields).lean();
    for (let actor of actors) {
        let translations = actor.translations[lang];
        delete actor.translations;
        Object.assign(actor, translations);
    }
    return res.json(actors);
});

router.get('/admin/api/program',
    MiddleWares.checkAuth, MiddleWares.checkIsAdmin,
    async function (req, res, next) {
        const sizeof = require('object-sizeof');
        let offset = req.query.offset ? parseInt(req.query.offset) : 0;
        let limit = req.query.limit ? parseInt(req.query.limit) : 10;
        let search = req.query.search;
        let query: any = {};
        if (req.query.count) {
            let totalCount = await api.Program.countDocuments({});
            return res.json({
                total: totalCount
            })
        }
        if (search && search.toLowerCase) {
            query.name = {$regex: `.*${search}.*`};
        }

        let programs: any = await api.Program.find(query, {
            updated: 1,
            date: 1,
            created: 1,
            region: 1,
            version: 1,
            program: 1
        }).sort({date: -1}).lean(true).limit(limit).skip(offset);
        try {
            for (var program of programs) {
                program['size'] = sizeof(program['program']) / 1024;
                delete program['program'];
            }
        } catch (er) {
            console.error(er)
        }
        res.json({
            data: programs
        })
    });

export {router};
