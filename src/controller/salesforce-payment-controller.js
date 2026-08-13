import DtoMapper from '../mapper/dto-mapper.js';
import PaymentDto from '../dto/payment-dto.js'

import { mapDtoToSalesforcePayment } from '../mapper/mapper-helper.js';

export default class SalesforcePaymentController {

    #transferService;

    constructor(transferService){
        this.#transferService = transferService;
    }

    async createPayments(req, res){
        try {
            const rawPayments = req.body?.payments || [];

            const mapper = new DtoMapper(PaymentDto, rawPayments);
            const dtos = mapper.parseJsonData();
    
            const sfResponse = await this.#transferService.createObjects(
            'Payment__c', dtos, mapDtoToSalesforcePayment, {allOrNone : false});
    
            res.status(201).json({
                success: true,
                sentRecordsCount: dtos.length,
                salesforceResult: sfResponse
            });
        } catch (error) {
            console.log(error.message)
            res.status(500).json({
                success: false, 
                error: 'Error while processing operation. Try again later.'
            });
        }
    }
}