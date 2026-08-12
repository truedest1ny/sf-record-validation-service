import axios from 'axios';
import OauthTokenClient from './salesforce/oauth-token-client.js';
import ClientConfigurer from './salesforce/client-configurer.js';

export default class HttpClientBuilder {

    AUTH_CLIENT_HEADERS = {
        'Content-Type': 'application/x-www-form-urlencoded' 
    };

    API_CLIENT_HEADERS = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    build(coreValues = []){
        const [domain, consumerKey, secret] = coreValues;
        
        const authHttpClient = axios.create({
            baseURL : 'https://' + domain,
            headers: this.AUTH_CLIENT_HEADERS
        });

        const connectionParams = {
            clientId : consumerKey,
            clientSecret: secret,
        }

        const oauthClient = new OauthTokenClient(authHttpClient, connectionParams);

        const apiHttpClient = axios.create({
            baseURL : 'https://' + domain,
            headers: this.API_CLIENT_HEADERS
        });

        const clientConfigurer = new ClientConfigurer(apiHttpClient, oauthClient);

        clientConfigurer.setClientInterceptors();

        return apiHttpClient;
    }
}
