const getConnection = require('../../models/connection').getConnection;
let collection = null;
const WebSocket = require('ws');
import * as tracer from 'tracer';

getConnection().then(connection => {
    collection = connection.collection('logs')
}).catch(er => {
    console.error(er);
});

interface Tracer {
    info()
}

class Logger {
    private wss: any;
    private logger: any;

    private static instance;

    private constructor() {

        let self = this;
        let log_conf = {
            transport: function (data) {
                self.logToMongo.call(self, data)
            },
            format: "{{timestamp}} <{{title}}> {{message}} (in {{file}}:{{line}})",
            // dateformat : "HH:MM:ss.L"
        };
        this.logger = tracer.colorConsole(log_conf);
        this.logger.attachSocket = function () {
            self.attachSocket.apply(self, arguments)
        };
    }

    public static getInstance(): Logger {
        if (Logger.instance) {
            return Logger.instance;
        }
        Logger.instance = new Logger();
        return Logger.instance;
    }

    public info(...args) {

    }

    getLogger(): any {
        return this.logger;
    }

    attachSocket(app = null) {
        if (!this.wss) {
            this.wss = new WebSocket.Server({server: app});
            this.wss.on('connection', function connection(ws) {
                ws.on('error', () => console.log('errored'));
            });
            this.wss.on('error', () => console.log('errored'));
        }
    }

    logToMongo(data) {
        data.level === 5 ? console.error(data.output) : console.log(data.output);
        data.timestamp = Date.now();
        if (data.level !== 5) {
            data.stack = null;
        }
        if (collection) {
            collection.insertOne(data);
            this.notifyClients(data);
        }
    }

    notifyClients(data) {
        if (this.wss) {
            this.wss.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send('new_log', data);
                }
            });
        }
    }
}

export const logger = Logger.getInstance().getLogger();
