import axios from 'axios';
import ClientConfigurer from './salesforce/client-configurer.js';
import OauthTokenManager from './salesforce/oauth-token-manager.js';

export default class HttpClientCollector {

    AUTH_CLIENT_HEADERS = {
        'Content-Type': 'application/x-www-form-urlencoded' 
    };

    API_CLIENT_HEADERS = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    create(coreValues = []){
        const [domain, consumerKey, secret] = coreValues;
        
        const authHttpClient = axios.create({
            baseURL : 'https://' + domain,
            headers: this.AUTH_CLIENT_HEADERS
        });

        const connectionParams = {
            clientId : consumerKey,
            clientSecret: secret,
        }

        const tokenManager = new OauthTokenManager(authHttpClient, connectionParams);

        const apiHttpClient = axios.create({
            baseURL : 'https://' + domain,
            headers: this.API_CLIENT_HEADERS
        });

        const clientConfigurer = new ClientConfigurer(apiHttpClient, tokenManager);

        clientConfigurer.setClientInterceptors();

        return apiHttpClient;
    }
}
