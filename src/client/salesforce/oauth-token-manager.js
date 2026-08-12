export default class OauthTokenManager {

    SF_TOKEN_ENDPOINT = '/services/oauth2/token';
    GRANT_TYPE = 'client_credentials';

    ACCESS_TOKEN_KEY = 'access_token';

    httpClient = null;

    currentToken = '';
    connParams= {};

    constructor(httpClient = null, connParams = {}){
        this.httpClient = httpClient;
        this.connParams = connParams;
    }

    async refreshToken(){
        const params = this.#setRequestParams();

        try {

            const response = await this.httpClient.post(this.SF_TOKEN_ENDPOINT, params)
            this.currentToken = response.data[this.ACCESS_TOKEN_KEY];

        } catch (error){

            if (error.response){
                console.log(error.response.data);
            }
            throw error;
        }

        console.log('Token is successfully received');
        return this.currentToken;
    }
    
    async getToken() {
        if (this.currentToken) {
            return this.currentToken;
        }
        return await this.refreshToken();
    }
    
    #setRequestParams(){
        return new URLSearchParams({
            grant_type : this.GRANT_TYPE,
            client_id : this.connParams.clientId,
            client_secret: this.connParams.clientSecret,
        })
    }
}