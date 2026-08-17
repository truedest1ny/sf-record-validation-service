import HttpClientFactory from "./client/http-client-factory.js";
import SalesforcePaymentController from "./controller/salesforce-payment-controller.js";
import EnvFileReader from "./io/env-file-reader.js";
import SalesforceSObjectCompositeService from "./service/sf-sobject-composite-service.js";
import RouterConfigurer from "./express/route/router-configurer.js";

const DOMAIN_KEY = 'SF_ORG_DOMAIN';
const CLIENT_KEY = 'SF_CONSUMER_KEY';
const SECRET_KEY = 'SF_CONSUMER_SECRET';

export function initDependencies() {
    const envParams = EnvFileReader.getEnvParams(
          '.env', 
          [DOMAIN_KEY, CLIENT_KEY, SECRET_KEY]
        );
    
        const httpClientFactory = new HttpClientFactory();
    
        const apiClient = httpClientFactory.createClient({
          domain: envParams[DOMAIN_KEY],
          consumerKey: envParams[CLIENT_KEY],
          secret: envParams[SECRET_KEY],
        });
    
        const sObjectCompositeService = new SalesforceSObjectCompositeService(apiClient);
        const sfPaymentController = new SalesforcePaymentController(sObjectCompositeService);
        const routerConfigurer = new RouterConfigurer(sfPaymentController);

        return routerConfigurer.configure();
}