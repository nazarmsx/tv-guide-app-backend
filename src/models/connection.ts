import * as mongoose from 'mongoose';

(<any>mongoose).Promise = Promise;
let connectionOptions: any = {useNewUrlParser: true, useCreateIndex: true,};
let tmp: any = mongoose;
const databaseUrl = 'mongodb://127.0.0.1:27017/interview';

class ConnectionPull {
    private static connection: any;

    static setConnection(connection) {
        ConnectionPull.connection = connection
    };

    static getConnection() {
        return ConnectionPull.connection;
    }
}

function getConnection(debug) {
    if (debug) {

        tmp['connect'](databaseUrl, connectionOptions).catch(er => {
            console.error(er);
        });

        return mongoose;
    } else {
        return new Promise((resolve, reject) => {
            const MongoClient = require('mongodb').MongoClient;


            MongoClient.connect('mongodb://127.0.0.1:27017', {useNewUrlParser: true}, function (err, client) {
                if (err) {
                    return reject(err);
                }
                var db = client.db("interview");
                ConnectionPull.setConnection(db);
                resolve(db);

            });
        });

    }
}

tmp.connect(databaseUrl, connectionOptions).then(function () {

    mongoose.set('debug', true);
}).catch(er => {
    console.error(er);
});


export {mongoose, getConnection, ConnectionPull};
