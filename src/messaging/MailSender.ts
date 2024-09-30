import * as nodemailer from 'nodemailer'

export class MailSender {

    transporter: any;
    from_url: string;

    constructor(options) {
        this.from_url = options.from_url;
        this.transporter = this.getTransporter('gmail');
    }

    public sendMessage(to, from, subject, html, text) {
        let self = this;
        return new Promise((resolve, reject) => {
            const mailOptions = {
                from: from ? from : this.from_url, // sender address
                to: to, // list of receivers
                subject: subject, // Subject line
                text: text, //, // plaintext body
                html: html // You can choose to send an HTML body instead
            };
            self.transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    reject(error)
                } else {
                    resolve(info);
                    // console.log('Message sent: ' + info.response);
                }
            });
        });
    }

    private getTransporter(type) {
        if (type == 'gmail') {
            return nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: ' ***', // Your email id
                    pass: '***' // Your password
                }
            });
        }

    }

    private static instance: MailSender;

    public static getSender(): MailSender {
        return new MailSender({from_url: 'system.alert.notifier@gmail.com'})
    }
}
