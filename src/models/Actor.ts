import {mongoose} from './connection';

const actorSchema = new mongoose.Schema({
    tmdb_id: {type: Number, index: true},
    translations: Object,
    name: String,
    profile_path: String,
    imdb_id: String,
    createdAt: Number,
    updatedAt: Number,
    popularity: Number
}, {autoIndex: true});

export default mongoose.model('actor', actorSchema);

