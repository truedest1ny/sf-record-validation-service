import AppError from "./app-error.js";

export default class RequestError extends AppError {
    constructor(message = 'Error while sending request', statusCode = 400){
        super(message, statusCode);
    }
}