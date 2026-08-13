export default class HttpClientConfigurer {
    #tokenManager = null;
    #apiClient = null;

    constructor(apiClient, tokenManager){
        this.#validateIncomingParams(apiClient, tokenManager)

        this.#apiClient = apiClient;
        this.#tokenManager = tokenManager;
    }

    setClientInterceptors(){
        this.#apiClient.interceptors.request.use(
            (config) => this.#setTokenInRequestConfig(config)
        );

        this.#apiClient.interceptors.response.use(
            (response) => response,
            (error) => this.#processUnauthorizedErrorResponse(error)
        );
}

    async #setTokenInRequestConfig(config){
        const token = await this.#tokenManager.getToken();
        if (token){

            config.headers['Authorization'] = this.#getAuthorizationHeader(token);
            console.log('Token set to header request');
            return config;

        } else throw new Error('Error while getting token');

    }

    async #processUnauthorizedErrorResponse(errorResponse){
        const originalRequest = errorResponse.config;
    
        if (errorResponse.response?.status === 401 && 
            !originalRequest._retry){

            originalRequest._retry = true;
            
            try {
                const newToken = await this.#tokenManager.fetchAccessToken();

                console.log('Token refreshed')
                originalRequest.headers['Authorization'] = this.#getAuthorizationHeader(newToken);
    
                return await this.#apiClient.request(originalRequest);
    
            } catch (error){
                return Promise.reject(error);
            }
        } 
        
        return Promise.reject(errorResponse);
    }

    #getAuthorizationHeader(token){
        return `Bearer ${token}`;
    }

    #validateIncomingParams(apiClient, tokenManager){
        if (!apiClient ||
            !apiClient.interceptors?.request ||
            !apiClient.interceptors?.response) {
            throw new TypeError('Client must have request-response interceptors to configurate')
        }

        if (typeof apiClient.request !== 'function'){
            throw new TypeError('Client must have request sending method')
        }

        if (!tokenManager ||
            typeof tokenManager.getToken !== 'function' ||
            typeof tokenManager.fetchAccessToken !== 'function'){
            throw new TypeError ('Token manager must provide token getting methods')
        }
    }
}