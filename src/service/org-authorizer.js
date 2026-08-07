const SF_TOKEN_ENDPOINT = '/services/oauth2/token';
const GRANT_TYPE = 'client_credentials';

function setRequestParams(grantType, clientId, clientSecret){
    return new URLSearchParams({
        grant_type : grantType,
        client_id : clientId,
        client_secret: clientSecret,
    })
}

async function fetchAccessToken(client, endpoint, requestParams){
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

async function processTokenFetch(client, connectionParams){

    const params = setRequestParams(GRANT_TYPE,
                                    connectionParams.consumerKey,
                                    connectionParams.secret)

    const token = await fetchAccessToken(client, SF_TOKEN_ENDPOINT, params);
    console.log('Token is successfully received: ' + token);
    return token;
}

module.exports = processTokenFetch;


