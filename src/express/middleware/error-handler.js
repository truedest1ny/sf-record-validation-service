import AppError from "../../error/app-error.js";

export function globalErrorHandler(error, req, res, next) {
    if (error instanceof AppError) {
        return res.status(error.statusCode).json(error.serialize());
    }

    return res.status(500).json({
        success: false,
        message : 'Something went wrong with the server. Please, try again later'
    })
}