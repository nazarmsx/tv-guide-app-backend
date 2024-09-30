import {mongoose} from './connection';


const categorySchema = new mongoose.Schema({
    name: String,
    translations: Object,
    slug: String,
    parent_id: String,
    created: Date,
    updated: Date,
    old_id: String
});
export default mongoose.model('category', categorySchema);

