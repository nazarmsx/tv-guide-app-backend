import * as jwt from "jsonwebtoken";

export default class TokenService {
    private secret: string;
    private expiresIn: string;

    constructor(secret: string = 'default_secret', expiresIn: string = '2h') {
        this.secret = secret;
        this.expiresIn = expiresIn;
    }

    public generateAccessToken(claims: any, expiresIn?: string): string {
        return jwt.sign(claims, this.secret, {
            expiresIn: expiresIn ? expiresIn : this.expiresIn
        })
    }

    public generateRefreshToken(claims: any): string {
        return jwt.sign(claims, this.secret, {
            expiresIn: '5y'
        })
    }

    public verifyToken(token: string) {
        let decoded = null;
        if (!token) {
            return {error: 'NOT_AUTHORIZED'};
        }
        try {
            decoded = jwt.verify(token, this.secret)
        } catch (err) {
            return {error: 'NOT_AUTHORIZED', desc: err}
        }
        return decoded
    }

}
