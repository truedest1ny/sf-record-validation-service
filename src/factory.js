import axios from 'axios';
import path from 'node:path';
import process from 'node:process';
import OauthTokenClient from './client/salesforce/oauth-token-client.js';
import TokenManager from './client/salesforce/token-manager.js';
import ClientConfigurer from './client/salesforce/client-configurer.js';

export default class Factory {
    domain = '';
    consumerKey = '';
    secret = '';
    envFilePath = '../.env';

    AUTH_CLIENT_HEADERS = {
        'Content-Type': 'application/x-www-form-urlencoded' 
    };

    API_CLIENT_HEADERS = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    async initialize(){
        const [domain, consumerKey, secret] = this.getEnvParams();
        
        const authHttpClient = axios.create({
            baseURL : 'https://' + domain,
            headers: this.AUTH_CLIENT_HEADERS
        });

        const connectionParams = {
            clientId : consumerKey,
            clientSecret: secret,
        }

        const oauthClient = new OauthTokenClient(authHttpClient, connectionParams);
        const tokenManager = new TokenManager(oauthClient);

        const apiHttpClient = axios.create({
            baseURL : 'https://' + domain,
            headers: this.API_CLIENT_HEADERS
        });

        const clientConfigurer = new ClientConfigurer(apiHttpClient, tokenManager);

        clientConfigurer.setClientInterceptors();


        return apiHttpClient;
    }

    getEnvParams(){
        process.loadEnvFile(
            path.resolve(import.meta.dirname, this.envFilePath)
        );

        const domain = process.env.SF_ORG_DOMAIN;
        const consumerKey = process.env.SF_CONSUMER_KEY;
        const secret = process.env.SF_CONSUMER_SECRET;

        return [domain, consumerKey, secret];
    }
}
