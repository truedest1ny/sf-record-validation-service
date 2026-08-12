import { getAuthorizationHeader } from "./token-process-helper.js";

export default class ClientConfigurer {
    oathManager = null;
    apiClient = null;

    constructor(apiClient = {},  oathManager = {}){
        this.apiClient = apiClient;
        this.oathManager = oathManager;
    }

    async setTokenInRequestConfig(config){
        const token = await this.oathManager.getToken();
        config.headers.Authorization = getAuthorizationHeader(token);
        console.log('Token set to header request');
        return config;
    }

    async processUnauthorizedErrorResponse(errorResponse){
        const originalRequest = errorResponse.config;
    
        if (errorResponse.response && errorResponse.response.status === 401 && !originalRequest._retry){
            originalRequest._retry = true;
            
            try {
                const newToken = await this.oathManager.refreshToken();

                console.log('Token refreshed')
                originalRequest.headers['Authorization'] = getAuthorizationHeader(newToken);
    
                return await this.apiClient.request(originalRequest);
    
            } catch (error){
                return Promise.reject(error);
            }
        } 
        
        return Promise.reject(errorResponse);
    }

    setClientInterceptors(){
        this.apiClient.interceptors.request.use(
            async (config) => await this.setTokenInRequestConfig(config)
        );

        this.apiClient.interceptors.response.use(
            (response) => response,
            async (error) => await this.processUnauthorizedErrorResponse(error)
        );
    }
}