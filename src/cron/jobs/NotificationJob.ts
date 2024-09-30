import * as api from '../../models/api'
import Message from '../../messaging/Message'
import PushSender from '../../messaging/PushSender'

export default class NotificationJob {
    private devices: any;
    private message: Message;

    constructor(message: Message) {
        this.devices = [];
        this.message = message
    }

    async loadDevices(searchOptions: any = {}) {
        searchOptions.pushEnabled = true;
        let devices = await api.Device.find(searchOptions).lean();
        this.devices = devices
    }

    async notify() {
        let tokens = [];
        for (let device of this.devices) {
            tokens.push(device.token)
        }
        this.message.to = tokens;
        let pushSender = new PushSender();

        await pushSender.send(this.message)
    }
}

async function test() {
    let message = new Message([], {
        custom_notification: JSON.stringify({
            click_action: 'ACTION',
            body: 'test body',
            title: 'test title',
            color: '#00ACD4',
            priority: 'high',
            id: 'sdsd'
        })
    });

    let job = new NotificationJob(message);
    await job.loadDevices();
    job.notify()
}
