export default class Message {

    private _to: string[] | string;
    private _message: any;
    private _props: any;

    constructor(to, message, props = {}) {
        this._to = to;
        this._message = message;
        this._props = props
    }

    get props() {
        return this._props
    }

    set props(value) {
        this._props = value
    }

    get to() {
        return this._to
    }


    set to(value) {
        this._to = value
    }

    get message() {
        return this._message
    }

    set message(value) {
        this._message = value
    }

    getPushMessage() {

        for (let payloadProp in this.message) {
            if (typeof this.message[payloadProp] !== "string") {
                this.message[payloadProp] = JSON.stringify(this.message[payloadProp])
            }
        }
        let message = {
            to: this.to,
            notification: this.message,
            data: this.message,
            options: {
                priority: 'high',
                color: '#F7F7F7',
                sound: 'default',
                content_available: true
            }
        };
        message.options = Object.assign(message.options, this._props);

        if (message.notification.body === undefined) {
            message.notification.body = ' '
        }
        if (message.data.body === undefined) {
            message.data.body = " ";
        }
        return message
    }
}

