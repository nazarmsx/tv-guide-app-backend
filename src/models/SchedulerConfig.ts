import {mongoose} from './connection';

const SchedulerConfigSchema = new mongoose.Schema({
    config: Object,
    createdAt: Number,
    updatedAt: Number
});
export default mongoose.model('scheduler_config', SchedulerConfigSchema)
