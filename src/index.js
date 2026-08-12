import PaymentDto from "./dto/payment-dto.js";
import DtoMapper from "./mapper/dto-mapper.js";
import express from "express";
import SalesforceTransferService from "./service/salesforce-transfer-service.js";
import { mapDtoToSalesforcePayment } from "./mapper/mapper-helper.js";
import HttpClientCollector from "./client/http-client-collector.js";
import EnvFileReader from "./io/env-file-reader.js";

const data = {
  "payments": [
    { "Opportunity": "Enterprise License Q3", "Amount": 1250, "FirstName": "Alex", "LastName": "Merl" },
    { "Opportunity": "SaaS Subscription Annual", "Amount": 499, "FirstName": "Elena", "LastName": "Rostova" },
    { "Opportunity": "Consulting Services", "Amount": 3500, "FirstName": "John", "LastName": "Doe" },
    { "Opportunity": "Custom Module Dev", "Amount": 2100, "FirstName": "Dmitry", "LastName": "Kovalev" },
    { "Opportunity": "Support Retainer Month 1", "Amount": 150, "FirstName": "Sarah", "LastName": "Connor" },
    { "Opportunity": "Cloud Migration Project", "Amount": 8700, "FirstName": "Michael", "LastName": "Brown" },
    { "Opportunity": "Security Audit", "Amount": 1800, "FirstName": "Anna", "LastName": "Schmidt" },
    { "Opportunity": "Team Training Workshop", "Amount": 600, "FirstName": "Lucas", "LastName": "Vidal" },
    { "Opportunity": "Hardware Maintenance", "Amount": 320, "FirstName": "Olga", "LastName": "Petrova" },
    { "Opportunity1": "API Integration Phase 2", "Amount": 4200, "FirstName": "David", "LastName": "Miller" }
  ]
};

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

  app.get('/payments/create', async (req, res) => {
    try {
      const mapper = new DtoMapper(PaymentDto, data.payments);
      const dtos = mapper.parseJsonData();

      const sfResponse = await transferService.createObjects(
        'Payment__c', dtos, mapDtoToSalesforcePayment, false);

      res.json({
          success: true,
          sentRecordsCount: dtos.length,
          salesforceResult: sfResponse
        });
    } catch (error) {
      console.error('Error while processing response', error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  const port = 8888;
  app.listen(port, () => console.log(`Server starts listening at port ${port}`));
}

main();


