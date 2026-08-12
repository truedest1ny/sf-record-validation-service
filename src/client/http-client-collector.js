import axios from 'axios';
import ClientConfigurer from './salesforce/client-configurer.js';
import OauthTokenManager from './salesforce/oauth-token-manager.js';

export default class HttpClientCollector {

    #API_CLIENT_HEADERS = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    create({domain, consumerKey, secret}){
        const tokenManager = new OauthTokenManager({domain, consumerKey, secret});
        const apiHttpClient = this.#initializeApiClient(domain);
        const clientConfigurer = new ClientConfigurer(apiHttpClient, tokenManager);

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
