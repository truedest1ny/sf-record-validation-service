import axios from "axios";
import RequestError from "../../error/request-error.js";

export default class OauthTokenManager {

    #AUTH_CLIENT_HEADERS = {
        'Content-Type': 'application/x-www-form-urlencoded' 
    };

    #SF_TOKEN_ENDPOINT = '/services/oauth2/token';
    #GRANT_TYPE = 'client_credentials';
    #ACCESS_TOKEN_KEY = 'access_token';
    #DEFAULT_TOKEN_EXP_MS = 7_200_000;

    #domain = '';
    #consumerKey = '';
    #secret = '';
   
    #authClient = null;
    #currentToken = '';
    #tokenExpiresAt = 0;

    #cachedPromise = null;

    constructor({domain, consumerKey, secret}){

        if (!domain?.trim() || !consumerKey?.trim() || !secret?.trim()){
            throw new TypeError('Connection parameters must be inialized!');
        }

        this.#domain = domain;
        this.#consumerKey = consumerKey;
        this.#secret = secret;

        this.#authClient = this.#initializeAuthClient();
    }

    async fetchAccessToken(){
        
        if (this.#cachedPromise) {
            return this.#cachedPromise;
        }

        const params = this.#setRequestParams();

        const fetchTokenFunction = async () => {
            try {
                const response = await this.#authClient.post(this.#SF_TOKEN_ENDPOINT, params)
                this.#currentToken = response.data[this.#ACCESS_TOKEN_KEY];

                this.#tokenExpiresAt =
                    (Number(response.data?.issued_at) || Date.now()) + this.#DEFAULT_TOKEN_EXP_MS;

                console.log('Token is successfully received');
                return this.#currentToken;

            } catch(error){
                throw new RequestError('Error while fetching access token')
            } finally {
                this.#cachedPromise = null;
            }
        };

        this.#cachedPromise = fetchTokenFunction();

        return this.#cachedPromise;
    }
    
    async getToken() {
        if (this.#currentToken && this.#tokenExpiresAt > Date.now()) {
            return this.#currentToken;
        }
        return this.fetchAccessToken();
    }
    
    #setRequestParams(){
        return new URLSearchParams({
            grant_type : this.#GRANT_TYPE,
            client_id : this.#consumerKey,
            client_secret: this.#secret,
        })
    }

    #initializeAuthClient(){
        return axios.create({
            baseURL : 'https://' + this.#domain,
            headers: {...this.#AUTH_CLIENT_HEADERS}
        });
    }
}