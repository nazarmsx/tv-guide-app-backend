import * as redis from 'redis';

const bluebird = require('bluebird');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
const connection: any = redis.createClient();
export {connection}
