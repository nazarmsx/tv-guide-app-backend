import {mongoose} from './connection';

const supportSchema = new mongoose.Schema({
    senderId: String,
    replyId: String,
    createdAt: Number,
    system: Boolean,
    message: String,
    email: String,
    reviewed: Boolean
});
export default mongoose.model('support_message', supportSchema);

