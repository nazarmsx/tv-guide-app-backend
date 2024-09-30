import {mongoose} from './connection';

const notificationSchema = new mongoose.Schema({
    title: String,
    body: String,
    due_date: {type: Number, index: true},
    created: Date,
    status: String,
    to: String,
    os: String,
    data: Object
});
export default mongoose.model('notification', notificationSchema);

