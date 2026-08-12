import { mapDtoToSalesforcePayment } from "../mapper/mapper-helper.js";

export default class SalesforceTransferService {
    apiClient = null;
    apiVersion = 'v66.0';
    endpoint = `/services/data/${this.apiVersion}/composite/sobjects`;

    constructor(apiClient = null) {
        this.apiClient = apiClient;
    }

    async createObjects(sObjectName = 'Payment__c',
                        dtos = [],
                        mappingFunction = mapDtoToSalesforcePayment,
                        allOrNone = false) {
                            
        if (!Array.isArray(dtos) || dtos.length === 0) {
            return [];
        }

        const payload = dtos.map((dto) => ({
            attributes: { type: sObjectName },
            ...mappingFunction(dto)
        }));

        try {
            const response = await this.apiClient.post(this.endpoint, {
                allOrNone,
                records: payload
            });

            return response.data;
        } catch (error) {
            if (error.response) {
                console.error('Salesforce Composite API Error:', error.response.data);
            }
            throw error;
        }
    }
}