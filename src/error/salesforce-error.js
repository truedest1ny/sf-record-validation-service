import AppError from "./app-error.js";

export default class SalesforceError extends AppError {
    #details;

    constructor(message = 'Error while processing request to Salesforce', details = [], statusCode = 400){
        super(message, statusCode);
        this.#details = details;
    }

    serialize(){
        return {
            ...super.serialize(),
            details : this.#details
        }
    }
}