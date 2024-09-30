import * as admin from 'firebase-admin';

const config =
    {
        projectId: 'projectId',
        clientEmail: 'clientEmail',
        privateKey: 'privateKey',
    };
admin.initializeApp({
    credential: admin.credential.cert(config),
    databaseURL: 'https://import-dd414.firebaseio.com'
});


export default admin;
