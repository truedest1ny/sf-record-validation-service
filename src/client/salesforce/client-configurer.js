import { getAuthorizationHeader } from "./token-process-helper.js";

export default class ClientConfigurer {
    tokenManager = null;
    httpClient = null;

    constructor(httpClient = {}, tokenManager = {}){
        this.tokenManager = tokenManager;
        this.httpClient = httpClient;
    }

    async setTokenInRequestConfig(config){
        const token = await this.tokenManager.getToken();
        config.headers.Authorization = getAuthorizationHeader(token);
        console.log('Token set to header request');
        return config;
    }

    async processUnauthorizedErrorResponse(errorResponse){
        const originalRequest = errorResponse.config;
    
        if (errorResponse.response && errorResponse.response.status === 401 && !originalRequest._retry){
            originalRequest._retry = true;
            
            try {
                this.tokenManager.clearToken();
                const newToken = await this.tokenManager.refreshToken();

                console.log('Token refreshed')
                originalRequest.headers['Authorization'] = getAuthorizationHeader(newToken);
    
                return await this.httpClient.request(originalRequest);
    
            } catch (error){
                return Promise.reject(error);
            }
        } 
        
        return Promise.reject(errorResponse);
    }

    setClientInterceptors(){
        this.httpClient.interceptors.request.use(
            async (config) => await this.setTokenInRequestConfig(config)
        );

        this.httpClient.interceptors.response.use(
            (response) => response,
            async (error) => await this.processUnauthorizedErrorResponse(error)
        );
    }
}