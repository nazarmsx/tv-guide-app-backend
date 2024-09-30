import {mongoose} from './connection';

const questionSchema = new mongoose.Schema({
    title: String,
    slug: String,
    contents: String,
    today_views: Number,
    total_views: Number,
    last_view: Date,
    translations: Object,
    status: String,
    created: Date,
    updated: Date,
    parent_id: String,
    category_id: String,

});
export default mongoose.model('question', questionSchema);

