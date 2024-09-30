import admin from '../firebase/admin';
import to from 'await-to-js'

export class FirebaseAdminService {
    private static instance;

    public async findFirebaseUserById(uid: string) {
        let [err, user] = await to(admin.auth().getUser(uid));
        if (err) {
            console.error(err);
            return null;
        }
        return user;
    }

    public static getInstance(): FirebaseAdminService {
        if (FirebaseAdminService.instance) {
            return FirebaseAdminService.instance;
        }
        FirebaseAdminService.instance = new FirebaseAdminService();
        return FirebaseAdminService.instance;
    }
}

export const firebaseAdminService = FirebaseAdminService.getInstance();
