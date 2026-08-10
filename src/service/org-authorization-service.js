import { SF_TOKEN_ENDPOINT, GRANT_TYPE, AUTHORIZATION_HEADER, fetchAccessToken } from "./org-auth-service-helper.js";

export default class OrgAuthorizationService {
    connectionParams = {};
    client = {};

    constructor(client, connectionParams){
        this.client = client;
        this.connectionParams = connectionParams;
    }
    
    setRequestParams(){
        return new URLSearchParams({
            grant_type : GRANT_TYPE,
            client_id : this.connectionParams.clientId,
            client_secret: this.connectionParams.clientSecret,
        })
    }
    
    async processTokenFetch(){
        const params = this.setRequestParams();

        const token = await fetchAccessToken(this.client, SF_TOKEN_ENDPOINT, params);
        console.log('Token is successfully received: ' + token);
        return token;
    }   

    async processUnathorized(errorResponse){
        const originalRequest = errorResponse.config;
    
        if (errorResponse.response && errorResponse.response.status === 401 && !errorResponse._retry){
            errorResponse._retry = true;
            
            try {
                const newToken = await this.processTokenFetch();
    
                console.log('Token refreshed')
    
                originalRequest.headers[AUTHORIZATION_HEADER] = `Bearer ${newToken}`;
    
                return await this.client.request(originalRequest);
    
            } catch (error){
                return Promise.reject(error);
            }
        } 
        
        return Promise.reject(errorResponse);
    }

    setClientInterceptor(){
        this.client.interceptors.response.use(
            (response) => response,
            (error) => this.processUnathorized(error)
        );
}

}





