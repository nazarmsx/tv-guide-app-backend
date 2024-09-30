import admin from '../firebase/admin';
import Message from './Message';
import {logger as Logger} from '../services/logger';

export default class PushSender {
    async send(message) {
        let pushMessage = message.getPushMessage();
        let pushContent = {
            data: pushMessage.data
        };
        Logger.log(pushContent);
        admin.messaging().sendToDevice(Array.isArray(message.to) ? message.to : [message.to], pushContent, pushMessage.options).then(data => {
            Logger.log(JSON.stringify(data))
        }).catch(er => {
            Logger.error(er);
        })
    }

    async sendIos(message: any) {
        const payload = message.message.payload;
        delete message.message.payload;
        let pushContent = {
            token: message.to,
            notification: message.message,
            apns: {
                "headers": {
                    "apns-priority": "10",
                    "apns-push-type": "background"
                },
                "payload": {
                    "aps": {
                        "content-available": 1,
                        sound: "default"
                    },
                    data: payload
                }
            },
        };
        console.log(JSON.stringify(pushContent, null, 4));
        admin.messaging().send(pushContent).then(data => {

            console.log(JSON.stringify(data))
        }).catch(er => {
            console.error(er);
        })
    }
}
