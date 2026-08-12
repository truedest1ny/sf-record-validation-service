import axios from "axios";

export default class OauthTokenManager {

    #AUTH_CLIENT_HEADERS = {
        'Content-Type': 'application/x-www-form-urlencoded' 
    };

    #SF_TOKEN_ENDPOINT = '/services/oauth2/token';
    #GRANT_TYPE = 'client_credentials';

    #ACCESS_TOKEN_KEY = 'access_token';

    #authClient = null;
    #currentToken = '';

    constructor({domain, consumerKey, secret}){
        this.domain = domain;
        this.consumerKey = consumerKey;
        this.secret = secret;

        this.#authClient = this.#initializeAuthClient();
    }

    async refreshToken(){
        const params = this.#setRequestParams();

        try {

            const response = await this.#authClient.post(this.#SF_TOKEN_ENDPOINT, params)
            this.#currentToken = response.data[this.#ACCESS_TOKEN_KEY];

        } catch (error){

            if (error.response){
                console.log(error.response.data);
            }
            throw error;
        }

        console.log('Token is successfully received');
        return this.#currentToken;
    }
    
    async getToken() {
        if (this.#currentToken) {
            return this.#currentToken;
        }
        return this.refreshToken();
    }
    
    #setRequestParams(){
        return new URLSearchParams({
            grant_type : this.#GRANT_TYPE,
            client_id : this.consumerKey,
            client_secret: this.secret,
        })
    }

    #initializeAuthClient(){
        return axios.create({
            baseURL : 'https://' + this.domain,
            headers: {...this.#AUTH_CLIENT_HEADERS}
        });
    }
}