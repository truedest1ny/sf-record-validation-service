export default class AppError extends Error {
    statusCode;
    #message;

    constructor(message = '', statusCode = 400){
        super(message);
        this.#message = message;
        this.statusCode = statusCode;
    }

    serialize(){
        return {
            success: false,
            message: this.#message
        }
    }
}