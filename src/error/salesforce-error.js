import AppError from "./app-error.js";

export default class SalesforceError extends AppError {
    constructor(message = 'Error while processing request to Salesforce', statusCode = 400){
        super(message, statusCode);
    }
}