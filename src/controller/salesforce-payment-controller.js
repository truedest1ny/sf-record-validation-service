import DtoMapper from '../mapper/dto-mapper.js';
import PaymentDto from '../dto/payment-dto.js'

import { mapDtoToSalesforcePayment } from '../mapper/mapper-helper.js';
import SalesforceError from '../error/salesforce-error.js';

export default class SalesforcePaymentController {

    #ALL_OR_NONE_STATUS = 'ALL_OR_NONE_OPERATION_ROLLED_BACK';

    #transferService;

    constructor(transferService){
        this.#transferService = transferService;
    }

    async createPayments(req, res,){
        const rawPayments = req.body?.payments || [];

        const mapper = new DtoMapper(PaymentDto, rawPayments);
        const dtos = mapper.parseJsonData();

        const allOrNone = true;

        const sfResponse = await this.#transferService.createRecords(
        'Payment__c', dtos, mapDtoToSalesforcePayment, {allOrNone});

        const hasErrors = sfResponse.some(record => !record.success);

        if (allOrNone && hasErrors){
            throw new SalesforceError(
                'Salesforce: Transaction has been rolled back.' +
                'You enabled AllOrNone option and at least one record failed'
            );
        }
        
        return res.json({
            success: true,
            sentRecordsCount: dtos.length,
            salesforceResult: sfResponse
        });
    }
}