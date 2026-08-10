import axios from 'axios';
import path from 'node:path';
import process from 'node:process';
import OrgAuthorizationService from './service/org-authorization-service.js';

export default class Factory {
    domain = '';
    consumerKey = '';
    secret = '';
    envFilePath = '../.env';

    initialize(){
        const [domain, consumerKey, secret] = this.getEnvParams();
        const sfConnector = axios.create({baseURL : 'https://' + domain})

        const connectionParams = {
            clientId : consumerKey,
            clientSecret: secret,
        }

        const authorizer = new OrgAuthorizationService(sfConnector, connectionParams);

        authorizer.processTokenFetch();
        authorizer.setClientInterceptor();


        return sfConnector;
    }

    getEnvParams(){
        process.loadEnvFile(
            path.resolve(import.meta.dirname, this.envFilePath)
        );

        const domain = process.env.SF_ORG_DOMAIN;
        const consumerKey = process.env.SF_CONSUMER_KEY;
        const secret = process.env.SF_CONSUMER_SECRET;

        return [domain, consumerKey, secret];
    }
}
