import HttpClientFactory from "./client/http-client-factory.js";
import SalesforcePaymentController from "./controller/salesforce-payment-controller.js";
import EnvFileManager from "./io/env-file-manager.js";
import SalesforceSObjectCompositeService from "./service/sf-sobject-composite-service.js";
import RouterConfigurer from "./express/route/router-configurer.js";

const filename = '.env';

export function initDependencies() {
  
  const envFileManager = new EnvFileManager(filename);
  const params = envFileManager.getSalesforceAuthProps();

  const httpClientFactory = new HttpClientFactory();

  const apiClient = httpClientFactory.createClient(params);

  const sObjectCompositeService = new SalesforceSObjectCompositeService(apiClient);
  const sfPaymentController = new SalesforcePaymentController(sObjectCompositeService);
  const routerConfigurer = new RouterConfigurer(sfPaymentController);

  return routerConfigurer.configure();
}