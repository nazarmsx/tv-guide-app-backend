import * as api from '../models/api'
import PushSender from '../messaging/PushSender';
import Message from '../messaging/Message';
import * as moment from 'moment'

export default class NotificationCron {
    private cron: any;
    private pushSender: PushSender;

    constructor() {
        this.cron = require('node-cron');
        this.pushSender = new PushSender();
    }

    start() {
        let self = this;
        this.cron.schedule('* * * * *', function () {
            let periodStart = moment(new Date()).utc().seconds(0).valueOf();
            let periodEnd = moment(new Date()).utc().seconds(59).valueOf();
            api.Notification.find(
                {
                    due_date: {"$gte": periodStart, "$lte": periodEnd},
                    status: 'active'
                }).then(data => {
                data.forEach((notif: any) => {
                    let message = new Message(notif.to, JSON.parse(notif.data));
                    if (notif.os === 'ios') {
                        self.pushSender.sendIos(message)

                    } else {
                        self.pushSender.send(message)
                    }
                })
            })
        });
    }
}
