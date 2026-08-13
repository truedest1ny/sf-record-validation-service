import { mapDtoToSalesforcePayment } from "../mapper/mapper-helper.js";

export default class SalesforceTransferService {
    #apiClient = null;
    #API_VERSION = 'v66.0';
    #OBJECTS_CREATE_ENDPOINT = `/services/data/${this.#API_VERSION}/composite/sobjects`;

    constructor(apiClient = null) {
        this.#apiClient = apiClient;
    }

    async createObjects(sObjectName = 'Payment__c',
                        dtos = [],
                        mappingFunction = mapDtoToSalesforcePayment,
                        salesforceDmlConfig = {allOrNone: false}) {
                            
        if (!Array.isArray(dtos) || dtos.length === 0) {
            return [];
        }

        const {allOrNone} = salesforceDmlConfig;

        const payload = dtos.map((dto) => ({
            attributes: { type: sObjectName },
            ...mappingFunction(dto)
        }));

        try {
            const response = await this.#apiClient.post(this.#OBJECTS_CREATE_ENDPOINT, {
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