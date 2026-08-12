export function getAuthorizationHeader(token){
    return `Bearer ${token}`;
}

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