import axios from 'axios';
import HttpClientConfigurer from './salesforce/http-client-configurer.js';
import OauthTokenManager from './salesforce/oauth-token-manager.js';

export default class HttpClientFactory {

    #API_CLIENT_HEADERS = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    createClient({domain, consumerKey, secret}){

        if (!domain?.trim() || !consumerKey?.trim() || !secret.trim()){
            throw new TypeError('Connection parameters must be inialized!');
        }

        const tokenManager = new OauthTokenManager({domain, consumerKey, secret});
        const apiHttpClient = this.#initializeApiClient(domain);
        const clientConfigurer = new HttpClientConfigurer(apiHttpClient, tokenManager);

        clientConfigurer.setClientInterceptors();

        return apiHttpClient;
    }

    #initializeApiClient(domain){
        return axios.create({
            baseURL : 'https://' + domain,
            headers: {...this.#API_CLIENT_HEADERS}
        });

    }
}
