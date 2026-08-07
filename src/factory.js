import axios from 'axios';
import path from 'node:path';
import process from 'node:process';
import OrgAuthorizer from './service/org-authorizer';

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

        const authorizer = new OrgAuthorizer(sfConnector, connectionParams);

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
