const authorize = require('./org-authorizer.js');
const { error } = require('node:console');

const AUTHORIZATION_HEADER = 'Authorization';

async function processUnathorized(client, errorResponse, connectionConfig){
    const originalRequest = errorResponse.config;

    if (errorResponse.response && errorResponse.response.status === 401 && !errorResponse._retry){
        errorResponse._retry = true;
        
        try {
            const newToken = await authorize(client, connectionConfig);

            console.log('Token refreshed')

            originalRequest.headers[AUTHORIZATION_HEADER] = `Bearer ${newToken}`;

            return await client.request(originalRequest);

        } catch (error){
            
            return Promise.reject(error);
        }
    } 
    
    return Promise.reject(errorResponse);
}

function setClientInterceptor(client, connectionConfig){
    client.interceptors.response.use(
        (response) => response,
        (error) => processUnathorized(client, error, connectionConfig)
    );
}

module.exports = setClientInterceptor;
