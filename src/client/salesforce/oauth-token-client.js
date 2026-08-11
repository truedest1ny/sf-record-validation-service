import {fetchAccessToken} from "./token-process-helper.js";

export default class OauthTokenClient {

    SF_TOKEN_ENDPOINT = '/services/oauth2/token';
    GRANT_TYPE = 'client_credentials';

    httpClient = null;
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

    async fetchToken(){
        const params = this.setRequestParams();

        const token = await fetchAccessToken(this.httpClient, this.SF_TOKEN_ENDPOINT, params);
        console.log('Token is successfully received');
        return token;
    }  
}