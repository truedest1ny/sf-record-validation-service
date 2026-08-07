export const SF_TOKEN_ENDPOINT = '/services/oauth2/token';
export const GRANT_TYPE = 'client_credentials';

export const AUTHORIZATION_HEADER = 'Authorization';

export async function fetchAccessToken(client, endpoint, requestParams){
    try {
        const response = await client.post(endpoint, requestParams)
        const { access_token } = response.data;
        return access_token;
    } catch (error){
        if (error.response){
            console.log(error.response.data);
        }
        throw error;
    };
    
}