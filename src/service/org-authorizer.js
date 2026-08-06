const axios = require("axios");
const process = require("node:process");

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

async function processTokenFetch(connectionParams){
    const sfConnector = axios.create({baseURL : 'https://' + connectionParams.SF_ORG_DOMAIN});

    const params = setRequestParams(GRANT_TYPE,
                                    connectionParams.SF_CONSUMER_KEY,
                                    connectionParams.SF_CONSUMER_SECRET)

    const token = await fetchAccessToken(sfConnector, SF_TOKEN_ENDPOINT, params);
    return token;
}

module.exports = processTokenFetch;


