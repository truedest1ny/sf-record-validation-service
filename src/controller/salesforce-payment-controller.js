import DtoMapper from '../mapper/dto-mapper.js';
import PaymentDto from '../dto/payment-dto.js'

import { mapDtoToSalesforcePayment } from '../mapper/mapper-helper.js';

export default class SalesforcePaymentController {

    #ALL_OR_NONE_STATUS = 'ALL_OR_NONE_OPERATION_ROLLED_BACK';

    #transferService;

    constructor(transferService){
        this.#transferService = transferService;
    }

    async createPayments(req, res){
        try {
            const rawPayments = req.body?.payments || [];

            const mapper = new DtoMapper(PaymentDto, rawPayments);
            const dtos = mapper.parseJsonData();

            const allOrNone = true;
    
            const sfResponse = await this.#transferService.createRecords(
            'Payment__c', dtos, mapDtoToSalesforcePayment, {allOrNone});

            const hasErrors = sfResponse.some(record => !record.success);

            if (allOrNone && hasErrors){
                return res.status(400).json({
                    success : false,
                    error : 'Transaction rolled back. One or more records contain invalid data.'
                })
            }
            
    
            return res.json({
                success: true,
                sentRecordsCount: dtos.length,
                salesforceResult: sfResponse
            });
        } catch (error) {
            console.log(error.message)
            return res.status(500).json({
                success: false, 
                error: 'Error while processing operation. Try again later.'
            });
        }
    }
}