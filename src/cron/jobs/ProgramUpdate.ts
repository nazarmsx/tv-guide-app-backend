import NotificationJob from './NotificationJob';
const Message = require('../../messaging/Message');

export default class ProgramUpdate {
    private searchOptions: any;
    private payload: any;

    constructor(searchOptions, payload) {
        this.searchOptions = searchOptions;
        this.payload = payload;
    }
    async notify() {
        let message = new Message([], {
            custom_notification: {
                click_action: 'ACTION',
                body: 'test body',
                title: 'test title',
                color: '#00ACD4',
                priority: 'high',
                id: 'sdsd',
            },
            payload: this.payload
        });
        let job = new NotificationJob(message);
        await job.loadDevices(this.searchOptions);
        await job.notify()
    }
}

async function test() {
    let programUpdate = new ProgramUpdate({autoUpdate: true, region: "ua"}, {date: '2017-12-12'});
    programUpdate.notify();
}

