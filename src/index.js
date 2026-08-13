import express, { Router } from "express";
import SalesforceTransferService from "./service/salesforce-transfer-service.js";
import { mapDtoToSalesforcePayment } from "./mapper/mapper-helper.js";
import HttpClientCollector from "./client/http-client-collector.js";
import EnvFileReader from "./io/env-file-reader.js";
import SalesforcePaymentController from "./controller/salesforce-payment-controller.js";
import { setObjectCreateRoute } from "./route/salesforce-object-create-route.js";

const DOMAIN_KEY = 'SF_ORG_DOMAIN';
const CLIENT_KEY = 'SF_CONSUMER_KEY';
const SECRET_KEY = 'SF_CONSUMER_SECRET';

async function main() {

    const envParams = EnvFileReader.getEnvParams(
      '.env', 
      [DOMAIN_KEY, CLIENT_KEY, SECRET_KEY]
    );

    const clientCollector = new HttpClientCollector(); 

    const apiClient = clientCollector.create({
      domain: envParams[DOMAIN_KEY],
      consumerKey: envParams[CLIENT_KEY],
      secret: envParams[SECRET_KEY],
    });

    const transferService = new SalesforceTransferService(apiClient);

    const app = express();
    app.use(express.json());

    const router = Router();

    const sfPaymentController = new SalesforcePaymentController(transferService);
    setObjectCreateRoute(router, (req, res) => sfPaymentController.createPayments(req, res));

    app.use(router);
   
    const port = 8888;
    app.listen(port, () => console.log(`Server starts listening at port ${port}`));
}

main();


