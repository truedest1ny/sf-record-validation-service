import DtoMapper from '../mapper/dto-mapper.js';
import PaymentDto from '../dto/payment-dto.js'

import { mapDtoToSalesforcePayment } from '../mapper/mapper-helper.js';
import SalesforceError from '../error/salesforce-error.js';

export default class SalesforcePaymentController {

    #sObjectCompositeService;
    #errorFormatter;

    constructor(sObjectCompositeService, errorFormatter){
        this.#sObjectCompositeService = sObjectCompositeService;
        this.#errorFormatter = errorFormatter;
    }

    async createPayments(req, res){
        const rawPayments = req.body?.payments || [];

        const mapper = new DtoMapper(PaymentDto, rawPayments);
        const dtos = mapper.parseJsonData();

        const allOrNone = true;

        const sfResponse = await this.#sObjectCompositeService.createRecords(
        'Payment__c', dtos, mapDtoToSalesforcePayment, {allOrNone});

        const normalizedResult = sfResponse.map(
            (record, index) => this.#normalizeResponseRecord(record, index)
        );

        const normalizedErrorResponse = normalizedResult.filter((record) => !record.success && record.errors.length > 0);

        if (allOrNone && normalizedErrorResponse.length > 0){
            throw new SalesforceError(
                'Salesforce: Transaction has been rolled back.' +
                'You enabled AllOrNone option and at least one record failed', normalizedErrorResponse
            );
        }
        
        return res.status(201).json({
            success: true,
            sentRecordsCount: dtos.length,
            salesforceResult: normalizedResult
        });
    }

    #normalizeResponseRecord(record, index) {
        const normalizedIndex = index + 1;

        if (record.success){
            return {
                record : normalizedIndex,
                success : true,
                id : record.id
            };
        }

        const formattedErrors = this.#errorFormatter.formatErrors(record.errors);

        return {
            record : normalizedIndex,
            success : false,
            errors : formattedErrors
        };
    }
}