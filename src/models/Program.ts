import {mongoose} from './connection';

const programSchema = new mongoose.Schema({
    date: {type: String, index: true},
    updated: Date,
    created: Date,
    program: Array,
    region: {type: String, index: true},
    version: Number
}, {autoIndex: true});

export default mongoose.model('program', programSchema)

