import { Router } from "express";

export default class RouterConfigurer {
    #paymentController;

    constructor(paymentController){
        if (!paymentController || typeof paymentController.createPayments !== 'function'){
            throw new TypeError('Injecting controller must implement createPayments() method')
        }

        this.#paymentController = paymentController;
    }

    configure(){
        const router = Router();

        this.#setObjectCreateRoute(router);
        
        return router;
    }

    #setObjectCreateRoute(router){
        router.post('/payments/create',
            async (req, res, next) => {
                try {
                    await this.#paymentController.createPayments(req, res);
                } catch (error) {
                    next(error);
                }
            }
        );
    }
}
