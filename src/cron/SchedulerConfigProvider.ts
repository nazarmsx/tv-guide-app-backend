import * as api from '../models/api'
import to from 'await-to-js'
import {logger as Logger} from '../services/logger';

export interface SchedulerConfigData {
    _id: String,
    createdAt: number;
    updatedAt: number;
    config: Object;
}

export class SchedulerConfigProvider {
    private config: SchedulerConfigData;

    public async loadConfig() {
        let config: any = await api.SchedulerConfig.findOne({});
        if (!config) {
            config = this.getDefaultConfig();
            this.config = config;
            this.saveConfig()
        }
        this.config = config;
        return this.getConfig();
    }

    public async saveConfig() {
        this.config.updatedAt = Date.now();
        if (!this.config._id) {
            delete this.config._id;
            let [err, res] = await to(api.SchedulerConfig.create(this.config));
            if (err) {
                Logger.error(err);
            }
        } else {
            api.SchedulerConfig.updateOne(
                {'_id': this.config._id},
                {
                    '$set': this.config
                },
                function (err, doc) {
                    if (err) {
                        Logger.error(err);
                    }
                }
            )
        }
    }

    public setConfig(config: any) {
        this.config = config;
    }

    public async resetConfig() {
        await api.SchedulerConfig.remove({});
        await this.loadConfig();
        await this.saveConfig();
    }

    private getConfig(): any {
        return this.config.config;
    }

    private getDefaultConfig(): SchedulerConfigData {
        return {
            _id: null,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            config: {
                jobs: [
                    {fetcher: 'viasat', time: '0 22 * * *', loadDetails: true},
                    {fetcher: 'tv24', time: '0 20 * * *', loadDetails: true}
                ]
            }
        }
    }
}
