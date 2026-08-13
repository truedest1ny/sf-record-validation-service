import express, { Router } from "express";
import SalesforceSObjectCompositeService from "./service/sf-sobject-composite-service.js";
import { mapDtoToSalesforcePayment } from "./mapper/mapper-helper.js";
import EnvFileReader from "./io/env-file-reader.js";
import SalesforcePaymentController from "./controller/salesforce-payment-controller.js";
import { setObjectCreateRoute } from "./route/salesforce-object-create-route.js";
import HttpClientFactory from "./client/http-client-factory.js";

const DOMAIN_KEY = 'SF_ORG_DOMAIN';
const CLIENT_KEY = 'SF_CONSUMER_KEY';
const SECRET_KEY = 'SF_CONSUMER_SECRET';

async function main() {

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

    const app = express();
    app.use(express.json());

    const router = Router();

    const sfPaymentController = new SalesforcePaymentController(sObjectCompositeService);
    setObjectCreateRoute(router, (req, res) => sfPaymentController.createPayments(req, res));

    app.use(router);
   
    const port = 8888;
    app.listen(port, () => console.log(`Server starts listening at port ${port}`));
}

main();


