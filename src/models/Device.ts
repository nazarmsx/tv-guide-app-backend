import {mongoose} from './connection';

const deviceSchema = new mongoose.Schema({
    token: String,
    createdAt: Date,
    lastSeen: Date,
    pushEnabled: Boolean,
    autoUpdate: Boolean,
    uuid: String,
    refresh_token: String,
    region: String,
    platform: String,
    launchCount: Number
});
export default mongoose.model('device', deviceSchema);

