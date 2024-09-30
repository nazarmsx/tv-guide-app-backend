import TokenService from './TokenService';

export class TokenServiceFactory {
    private static instances: any = {};
    public static getTokenService(type: string = 'default'): TokenService {
        if (type === 'default') {
            if (!TokenServiceFactory.instances[type]) {
                TokenServiceFactory.instances[type] = new TokenService();
            }
            return TokenServiceFactory.instances[type]
        }
    }
}
