import {mongoose} from './connection';

const languageSchema = new mongoose.Schema({
    name: String,
    nativeName: String,
    code: String
});
export default mongoose.model('language', languageSchema);

