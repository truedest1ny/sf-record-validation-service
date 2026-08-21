import AppError from "../../error/app-error.js";

export function globalErrorHandler(error, req, res, next) {
    if (error instanceof AppError) {
        return res.status(error.statusCode).json(error.serialize());
        
    } else if (error instanceof SyntaxError) {
        return res.status(400).json({
            success : false,
            message : 'Incorrect JSON syntax provided'
        })
    }

    return res.status(500).json({
        success: false,
        message : 'Something went wrong with the server. Please, try again later'
    })
}