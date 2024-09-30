import {mongoose} from './connection';

const channelListSchema = new mongoose.Schema({
    name: String,
    channels: Array,
    region: String,
    isActive: Boolean,
    createdByServer: Boolean,
    translations: Object,
    createdAt: Date,
    updatedAt: Date,
    index: Number
});
export default mongoose.model('channel_list', channelListSchema);

