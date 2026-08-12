import {fetchAccessToken} from "./token-process-helper.js";

export default class OauthTokenManager {

    SF_TOKEN_ENDPOINT = '/services/oauth2/token';
    GRANT_TYPE = 'client_credentials';

    httpClient = null;

    currentToken = '';
    connParams= {};

    constructor(httpClient = null, connParams = {}){
        this.httpClient = httpClient;
        this.connParams = connParams;
    }

    setRequestParams(){
        return new URLSearchParams({
            grant_type : this.GRANT_TYPE,
            client_id : this.connParams.clientId,
            client_secret: this.connParams.clientSecret,
        })
    }

    async refreshToken(){
        const params = this.setRequestParams();

        this.currentToken = await fetchAccessToken(this.httpClient, this.SF_TOKEN_ENDPOINT, params);
        console.log('Token is successfully received');
        return this.currentToken;
    }
    
    async getToken() {
        if (this.currentToken) {
            return this.currentToken;
        }
        return await this.refreshToken();
    }
}