import {MongoDbCleaner} from "../utils/database"

export default class DatabaseCleanerCron {
    private cron: any;
    constructor() {
        this.cron = require('node-cron');
    }
    start() {
        let self = this;
        this.cron.schedule('0 5 * * *', function () {
            new MongoDbCleaner().removeExpiredData()
        });
    }
}

