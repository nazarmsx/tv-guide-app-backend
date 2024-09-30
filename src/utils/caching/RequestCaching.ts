import {InMemoryStorage, MongoDbStorage, AbstractStorage} from "./RequestStorage"
import * as request from "request";

const crypto = require('crypto');

abstract class AbstractRequestCaching {
    protected _storageMethod: AbstractStorage;
    protected activeRequests: any;

    constructor(storageMethod: AbstractStorage) {
        this._storageMethod = storageMethod;
    }

    public abstract makeRequest(options: any): Promise<any>

}

export class HTTPRequestCaching extends AbstractRequestCaching {
    private static instance: AbstractRequestCaching;

    constructor(storageMethod: AbstractStorage) {
        super(storageMethod);
        this.activeRequests = {};
    }

    public makeRequest(options: any): Promise<any> {
        const self = this;

        return new Promise(async (resolve, reject) => {
            let cacheKey = crypto.createHash('md5').update(options.url).digest("hex");
            let cachedValue = await this._storageMethod.get(cacheKey);

            if (cachedValue) {
                return resolve(cachedValue);
            } else {
                let locked = false;
                if (!self.activeRequests['cacheKey']) {
                    self.activeRequests['cacheKey'] = true;
                    locked = true;
                }
                request(options, function (err, response, body) {
                    let res = [err, response, body];
                    if (locked) {
                        self._storageMethod.set(cacheKey, res, options.expireTime ? options.expireTime : Date.now() + 30 * 60 * 1000);
                        delete self.activeRequests['cacheKey'];
                    }
                    return resolve([err, response, body]);
                })
            }
        });
    }

    static getInstance(): HTTPRequestCaching {
        if (!HTTPRequestCaching.instance) {
            var storage = new MongoDbStorage();
            storage.setShouldLog(false);
            this.instance = new HTTPRequestCaching(storage);
        }
        return this.instance;
    }
}
