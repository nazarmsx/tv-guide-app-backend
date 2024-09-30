import {mongoose} from './connection';

const userSchema = new mongoose.Schema({
    firebase_uid: String,
    avatar: String,
    name: String,
    email: String,
    createdAt: Date,
    lastActive: Date,
    settings: Object,
    favorites: Object,
    settingsLastUpdated: Date
});

export default mongoose.model('user', userSchema);


