import * as api from '../../models/api'

export class MongoDbCleaner {
    public async removeExpiredData() {
        const monthAgo = Date.now() - 31 * 24 * 60 * 60 * 1000;
        const monthAgoDate = new Date();
        monthAgoDate.setMonth(monthAgoDate.getMonth() - 1);
        await Promise.all([
            api.Log.deleteMany({timestamp: {$lt: monthAgo}}),
            api.RequestCache.deleteMany({expireTime: {$lt: Date.now()}}),
            api.Program.deleteMany({created: {$lt: monthAgoDate}})
        ]);
    }
}
