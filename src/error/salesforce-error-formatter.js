export default class SalesforceErrorFormatter {
    #SF_ERROR_TRANCRIPTION = {
        REQUIRED_FIELD_MISSING: 'A required field is missing. Please check your input.',
        DUPLICATES_DETECTED: 'A record with matching information already exists.',
        DUPLICATE_VALUE: 'A duplicate value was detected for a unique field.',
        STRING_TOO_LONG: 'The entered text exceeds the maximum character limit.',
        INVALID_CROSS_REFERENCE_KEY: 'The referenced record ID is invalid or does not exist.',
        INSUFFICIENT_ACCESS_OR_READONLY: 'You do not have permission to modify this record or field.',
        ALL_OR_NONE_OPERATION_ROLLED_BACK: 'Transaction was cancelled because another record in the batch failed.',

        INVALID_SESSION_ID: 'Your session has expired or the token is invalid. Re-authentication required.',
        invalid_grant: 'Authentication failed. Invalid credentials or expired grant.',
        invalid_client: 'Client authentication failed. Check consumer key and secret.',
        unauthorized_client: 'This client is not authorized for the requested grant type.'
    };

    formatErrors(errors = []){
        return errors
            .filter((error) => this.#isRootError(error))
            .map((error) => this.#formatSingleError(error));
    }

    #formatSingleError(sfError) {
        const code = this.#getErrorCode(sfError);
        const message = this.#SF_ERROR_TRANCRIPTION[code] || 'An unexpected Salesforce error occurred.';
        return {
            message,
            fields: sfError.fields || [],
        };
    }

    #isRootError(sfError){
        const code = this.#getErrorCode(sfError);
        return code !== 'ALL_OR_NONE_OPERATION_ROLLED_BACK';
    }

    #getErrorCode(sfError){
        return sfError?.statusCode || sfError?.error || sfError?.errorCode;
    }
}



