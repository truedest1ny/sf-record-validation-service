import { mapDtoToSalesforcePayment } from "../mapper/mapper-helper.js";

export default class SalesforceSObjectCompositeService {
    #apiClient = null;
    #API_VERSION = 'v66.0';
    #RECORDS_CREATE_ENDPOINT = `/services/data/${this.#API_VERSION}/composite/sobjects`;

    constructor(apiClient) {
        if (!apiClient || typeof apiClient.post !== 'function') {
            throw new TypeError('Client must provide HTTP POST Method')
        }

        this.#apiClient = apiClient;
    }

    async createRecords(sObjectName = 'Payment__c',
                        dtos = [],
                        mappingFunction,
                        salesforceDmlConfig = {allOrNone: false}) {
                            
        if (!Array.isArray(dtos) || dtos.length === 0) {
            return [];
        }

        if (typeof mappingFunction !== 'function'){
            throw new TypeError(`${mappingFunction} is not a function!`)
        }

        const {allOrNone} = salesforceDmlConfig;

        const payload = dtos.map((dto) => ({
            attributes: { type: sObjectName },
            ...mappingFunction(dto)
        }));

        const response = await this.#apiClient.post(this.#RECORDS_CREATE_ENDPOINT, {
            allOrNone,
            records: payload
        });

        return response.data;
    }
}