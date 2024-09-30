import {mongoose} from './connection';

const logSchema = new mongoose.Schema({
    timestamp: {type: Number, index: true},
    message: String,
    title: {type: String, index: true},
    level: String,
    status: String,
    pos: String,
    line: String,
    path: String,
    method: String,
    stack: String
}, {autoIndex: true});
export default mongoose.model('log', logSchema);


