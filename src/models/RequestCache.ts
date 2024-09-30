import {mongoose} from './connection';

const cacheSchema = new mongoose.Schema({
    key: {type: String, index: true},
    data: Array,
    expireTime: {type: Number, index: true},
}, {autoIndex: true});
export default mongoose.model('request_cache', cacheSchema);

