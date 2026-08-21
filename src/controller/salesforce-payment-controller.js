import DtoMapper from '../mapper/dto-mapper.js';
import PaymentDto from '../dto/payment-dto.js'

import { mapDtoToSalesforcePayment } from '../mapper/mapper-helper.js';
import SalesforceError from '../error/salesforce-error.js';

export default class SalesforcePaymentController {

    #sObjectCompositeService;
    #errorFormatter;

    constructor(sObjectCompositeService, errorFormatter){

        if (!sObjectCompositeService || typeof sObjectCompositeService.createRecords !== 'function') {
            throw new TypeError(
                'sObjectCompositeService is required and must implement a createRecords method.'
            );
        }

        if (!errorFormatter || typeof errorFormatter.formatErrors !== 'function') {
            throw new TypeError(
                'errorFormatter is required and must implement a formatErrors method.'
            );
        }

        this.#sObjectCompositeService = sObjectCompositeService;
        this.#errorFormatter = errorFormatter;
    }

    async createPayments(req, res) {
        const rawPayments = req.body?.payments || [];
        const allOrNone = req.body?.allOrNone ?? true;

        const mapper = new DtoMapper(PaymentDto, rawPayments);
        const dtos = mapper.parseJsonData();

        const sfResponse = await this.#sObjectCompositeService.createRecords(
        'Payment__c', dtos, mapDtoToSalesforcePayment, {allOrNone});

        const normalizedResult = this.#normalizeResponse(sfResponse);

        if (allOrNone) {
            this.#validateRollbackErrors(normalizedResult);
        }

        this.#validateSuccessfulRecordsCount(normalizedResult)
        
        return res.status(201).json({
            success: true,
            sentRecordsCount: dtos.length,
            salesforceResult: normalizedResult
        });
    }

    #normalizeResponse(response) {
        const normalizedResult = response.map((record, index) => {
           const normalizedIndex = index + 1;

            if (record.success){
                return {
                    record : normalizedIndex,
                    success : true,
                    id : record.id
                };
            }

            const {formattedErrors , hasRootCause} = this.#errorFormatter.formatErrors(record.errors);

            return {
                record : normalizedIndex,
                success : false,
                errors : formattedErrors,
                hasRootCause : hasRootCause
            }; 
        })

        return normalizedResult;
    }

    #validateRollbackErrors(normalizedResponse) {
        const rootErrors = normalizedResponse.filter((record) => record.hasRootCause);

        if (rootErrors.length > 0) {
            throw new SalesforceError(
                'Salesforce: Transaction has been rolled back. ' +
                'You enabled AllOrNone option and at least one record failed', rootErrors
            );
        }
    }

    #validateSuccessfulRecordsCount(normalizedResponce){
        const hasSuccess = normalizedResponce.some((record) => record.success);
        if (!hasSuccess) {
            throw new SalesforceError(
                'Salesforce: All records failed to process', normalizedResponce);
        }
    }
}