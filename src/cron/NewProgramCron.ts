import * as moment from 'moment'
import * as api from '../models/api'
import {TvGidFetcher} from '../core/TvGidFetcher'
import {ActorService} from '../core/ActorService'
import {SchedulerConfigProvider} from './SchedulerConfigProvider'
import {TV24} from '../core/TV24'
import ChannelService from '../controllers/channels'
import {MergingUaFetcher} from '../core/MergingUaFetcher'
import {logger as Logger} from '../services/logger';

new MergingUaFetcher();
export default class ProgramCron {
    private cron: any;
    private days: string[];
    private configProvider: SchedulerConfigProvider;
    private activeTasks: any[];

    constructor() {
        this.cron = require('node-cron');
        this.days = ['tomorrow'];
        this.configProvider = new SchedulerConfigProvider();
        this.activeTasks = [];
    }

    async start() {
        let self = this;
        let config = await this.configProvider.loadConfig();

        if (!config || !config.jobs)
            Logger.error(new Error('Bad cron config'));

        for (let job of config.jobs) {
            this.activeTasks.push(this.cron.schedule(job.time, function () {
                Logger.log(`${job.fetcher} Cron STARTED AT`, moment().utc().format("LLL"));
                self.doJob(job)
            }))
        }
    }

    async doJob(options: any) {
        let dates = this.days.map(day => {
            if (day === 'tomorrow') {
                return moment(Date.now()).add(2, "days").format('YYYY-MM-DD')
            }
        });
        let fetcher = null;
        if (options.fetcher === 'viasat') {
            fetcher = new MergingUaFetcher();
        }
        if (options.fetcher === 'tvgid') {
            fetcher = new TvGidFetcher();
        }
        if (options.fetcher === 'tv24') {
            fetcher = new TV24();
        }
        for (let i = 0; i < dates.length; ++i) {
            let inDbProgram = await api.Program.findOne({date: dates[i], region: fetcher.getRegion()});
            let program = await fetcher.getFullProgram(dates[i]);
            if (options.loadDetails)
                await fetcher.loadDescriptions(program);
            if (inDbProgram) {
                api.Program.updateOne(
                    {'_id': inDbProgram._id},
                    {
                        '$set': {
                            program: program,
                            region: fetcher.getRegion(),
                            'updated': new Date()
                        }
                    },
                    function (err, doc) {
                        console.log(`program updated for ${dates[i]}`)

                    }
                )
            } else {
                let createdData = {
                    created: new Date(),
                    updated: new Date(),
                    date: dates[i],
                    program: program,
                    region: fetcher.getRegion()
                };
                api.Program.collection['insert'](createdData).then(createdProgram => {
                    Logger.log(`program created for ${dates[i]}`)
                })
            }
            let channelService = new ChannelService();
            await channelService.syncChannels(program, fetcher.getRegion());
            let service = new ActorService();
            let ids = service.extractActorIdsFromProgram(program);
            await service.findAndUpdateActorsInDatabase(ids);
        }
    }
}
