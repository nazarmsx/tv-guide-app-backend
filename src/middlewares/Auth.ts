import {TokenServiceFactory} from '../services/auth/TokenServiceFactory.js'
import admin from '../firebase/admin';

export function checkAuth(req, res, next) {
    const token = req.headers['x-access-token'] || req.cookies.auth_token;
    let tokenService = TokenServiceFactory.getTokenService();
    let result = tokenService.verifyToken(token);
    if (result.error) {
        return NotAuthorized(req, res);
    }
    req.user = result;
    return next(null, req, res);
}

export function checkIsAdmin(req, res, next) {
    if (!req.user.isAdmin){
        return NotAuthorized(req, res);
    }
    return next(null, req, res);
}

export function checkFirebaseAuth(req, res, next) {
    const idToken: string = req.headers['firebase-id-token'];
    admin.auth().verifyIdToken(idToken)
        .then(function (decodedToken) {
            let uid = decodedToken.uid;
            req.firebaseUser = decodedToken;
            req.firebaseUid = uid;
            return next(null, req, res);
        }).catch(function (error) {
        return NotAuthorized(req, res, error);
    });
}

function NotAuthorized(req, res, error?: any) {
    res.status(401).json({error: 'NOT_AUTHORIZED', desc: error ? error : ""})
}
