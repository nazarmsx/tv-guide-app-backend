import {mongoose} from './connection';

const channelSchema = new mongoose.Schema({
    title: String,
    img: Object,
    type: String,
    type_name: String,
    region: String,
    createdAt: Date,
    updatedAt: Date
});
export default mongoose.model('channel', channelSchema);

