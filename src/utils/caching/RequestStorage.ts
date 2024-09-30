import * as api from '../../models/api'

const getConnection = require('../../models/connection').getConnection;
import * as moment from "moment";

export abstract class AbstractStorage {
    public abstract get(key: string): Promise<any>;

    public abstract set(key: string, value: any, expireTime: number): Promise<any>;

    public abstract clearStorage(): Promise<any>;
}

export class MongoDbStorage extends AbstractStorage {
    private cache: any;
    private shouldLog: boolean;
    private collection: any;

    constructor() {
        super();
        let collection = null;
        let self = this;

        getConnection().then(connection => {
            self.collection = connection.collection('request_caches')
        }).catch(er => {
            console.error(er);
        });
        this.cache = {};
    }

    public async get(key: string): Promise<any> {
        let cachedValue: any = await api.RequestCache.findOne({key: key});

        if (this.shouldLog) {
            console.log(`get : ${key} , ${!cachedValue ? 'No value' : (cachedValue.expireTime > Date.now() ? 'OK' : 'EXPIRED')}`);

        }
        if (cachedValue && cachedValue.expireTime > Date.now()) {
            return JSON.parse(cachedValue.data);
        } else if (cachedValue && cachedValue.expireTime < Date.now()) {
            await cachedValue.remove();
        }
        return null;
    }

    public async set(key: string, value: any, expireTime: number): Promise<any> {
        if (this.shouldLog) {
            console.log(`set : ${key} , ${moment(expireTime).format("YYYY-MM-DD HH:mm:ss")} , ${JSON.stringify(value).substr(0, 100)}`)
        }
        await this.collection.insertOne({key: key, data: JSON.stringify(value), expireTime: expireTime});
        return null;
    }

    public async clearStorage(): Promise<any> {

        delete this.cache;
        this.cache = {};
        return null;
    }

    public setShouldLog(flag: boolean) {
        this.shouldLog = flag;
    }


}

export class InMemoryStorage extends AbstractStorage {
    private cache: any;
    private shouldLog: boolean;

    constructor() {
        super();
        this.cache = {};
    }

    public async get(key: string): Promise<any> {
        if (this.shouldLog) {
            console.log(`get : ${key} , ${!this.cache[key] ? 'No value' : (this.cache[key].expireTime > Date.now() ? 'OK' : 'EXPIRED')}`);
        }
        if (this.cache[key] && this.cache[key].expireTime > Date.now()) {
            return this.cache[key].value;
        }
        return null;
    }

    public async set(key: string, value: any, expireTime: number): Promise<any> {
        if (this.shouldLog) {
            console.log(`set : ${key} , ${moment(expireTime).format("YYYY-MM-DD HH:mm:ss")} , ${JSON.stringify(value).substr(0, 100)}`)
        }
        this.cache[key] = {value, expireTime};
        return null;
    }

    public async clearStorage(): Promise<any> {
        delete this.cache;
        this.cache = {};
        return null;
    }

    public setShouldLog(flag: boolean) {
        this.shouldLog = flag;
    }
}
