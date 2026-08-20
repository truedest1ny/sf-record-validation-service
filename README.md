The workflow begins when an HTTP `POST` request hits the `/payments/create` endpoint with the following request body structure:

```json
{
  "allOrNone": true,
  "payments": [
    {
      "FirstName": "...",
      "LastName": "...",
      "Amount": //number,
      "Opportunity": "..."
    },
    {
      //... 
    }
  ]
}
```
`allOrNone` parameter is optional. If it is not passed in the request, it will be `true` by default.

 The `express.json()` middleware parses the payload. If there is incorrect JSON syntax structure, server will respond with the status 400 immediately:

 ```json
 {
    "success": false,
    "message": "Incorrect JSON syntax provided"
}
 ```

If syntax is correct, `RouterConfigurer` routes request payload to the controller:

```javascript
    // router-configurer.js
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
```
The `DtoMapper` iterates through the raw JSON, using a normalized field map to match keys case-insensitively, and initializes `PaymentDto` instances to sanitize and type-cast the inputs.

```javascript
// salesforce-payment-controller.js
async createPayments(req, res) {
    const rawPayments = req.body?.payments || [];
    const allOrNone = req.body?.allOrNone ?? true;

    const mapper = new DtoMapper(PaymentDto, rawPayments);
    const dtos = mapper.parseJsonData();
    // ...
}
```

Then validated DTOs are passed to the `SalesforceSObjectCompositeService`. This service provides payload sending to Salesforce :

```javascript
async createRecords(sObjectName = 'Payment__c',
                        dtos = [],
                        mappingFunction,
                        salesforceDmlConfig = {allOrNone: false}) {
    //...

    const payload = dtos.map((dto) => ({
            attributes: { type: sObjectName },
            ...mappingFunction(dto)
        }));

    //...
}
```

, where `mappingFunction` is a function that transforms DTO fields into Salesforce SObject compatible fields:

```javascript
//mapper-helper.js
export function mapDtoToSalesforcePayment(dto) {
    if (!dto) return null;

    return {
        Amount__c: dto.amount,
        FirstName__c: dto.firstName,
        LastName__c: dto.lastName,
        OpportunityName__c: dto.opportunity
    };
}
```

Then appication sends payload to Salesforce to create `Payment__c` SObject:

```javascript
//sf-sobject-composite-service.js
//createRecords() method

//...
const response = await this.#apiClient.post(this.#RECORDS_CREATE_ENDPOINT, {
        allOrNone,
        records: payload
    });

//...
```

Request sending is performed using an HTTP client that was pre-created and configured in the `HTTPClientFactory` class when the application started. It expects authorization parameters for the connection to the Salesforce organization.

***OAuth 2.0*** authorization using the ***Client Credentials Flow*** is used. To connect, the organization `domain`, `client key`, and `secret key` are required. These parameters are specified in a `.env` file with the following structure:

```ini
SF_ORG_DOMAIN=#your_value
SF_CONSUMER_KEY=#your_value
SF_CONSUMER_SECRET=#your_value
```

env files are validated using the ***Joi*** validation library:

```javascript
//env-file-manager.js
getSalesforceAuthProps() {
    const sfPropsSchema = Joi.object({
        [this.#DOMAIN_KEY] : Joi.string().required(),
        [this.#CLIENT_KEY]: Joi.string().required(),
        [this.#SECRET_KEY] : Joi.string().required()
    });

    const sfPropsConfig = this.#validateSchema(sfPropsSchema);

    return {
        domain: sfPropsConfig[this.#DOMAIN_KEY],
        consumerKey: sfPropsConfig[this.#CLIENT_KEY],
        secret: sfPropsConfig[this.#SECRET_KEY]
    };
}
```

Request and response ***interceptors*** are configured for the client to modify request parameters or implement specific logic:

```javascript
//http-client-factory.js
createClient({domain, consumerKey, secret}){
    //...

    const tokenManager = new OauthTokenManager({domain, consumerKey, secret});
    const apiHttpClient = this.#initializeApiClient(domain);
    const clientConfigurer = new HttpClientConfigurer(apiHttpClient, tokenManager);

    clientConfigurer.setClientInterceptors();

    return apiHttpClient;
}
```

```javascript
    //http-client-configurer.js
    setClientInterceptors(){
        this.#apiClient.interceptors.request.use(
            (config) => this.#setTokenInRequestConfig(config)
        );

        this.#apiClient.interceptors.response.use(
            (response) => response,
            (error) => this.#processUnauthorizedErrorResponse(error)
        );
}
```

A separate class, `OAuthTokenManager`, is used to obtain, store, and use the authorization token. A separate HTTP client is created inside the class to obtain the token.

Token retrieval is protected against race conditions. Logic for refreshing the token after a certain period of validity has also been implemented.

The ***request interceptor*** inserts an authorization token into the request header.

The ***response interceptor*** checks the response status. If the status is *401 (Unauthorized)*, it obtains a new token and inserts it into the header of the original request. The request is immediately retried with the updated token:

```javascript
async #processUnauthorizedErrorResponse(errorResponse){
    const originalRequest = errorResponse.config;

    if (errorResponse.response?.status === 401 && 
        !originalRequest._retry){
            //...

        const newToken = await this.#tokenManager.fetchAccessToken();

        //...

        originalRequest.headers['Authorization'] = this.#getAuthorizationHeader(newToken);

        try {
            return await this.#apiClient.request(originalRequest);
        } 

        //...
    }
}
```

The application implements a centralized error handler, which was integrated into the server configuration as middleware:

```javascript
//error-handler.js
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
```

Custom error classes were created — a general `AppError` and the subclasses `SalesforceError` and `RequestError`— which are thrown in specific, controlled situations and caught by a handler. The handler generates a response based on the type of error caught.

After recieving a response from Salesforce, control returns to `SalesforcePaymentController.createPayments()`, which passes the raw dataset to `#normalizeResponse(sfResponse)`.

The method converts zero-based array indices into 1-based record identifiers `(record: index + 1)` for client readability and isolates error formatting:

```javascript
// salesforce-payment-controller.js
#normalizeResponse(response) {
    const normalizedResult = response.map((record, index) => {
        const normalizedIndex = index + 1;

        if (record.success){
            return {
                record : normalizedIndex,
                success : true,
                id : record.id
            };
        }

        const {formattedErrors , hasRootCause} = this.#errorFormatter.formatErrors(record.errors);

        return {
            record : normalizedIndex,
            success : false,
            errors : formattedErrors,
            hasRootCause : hasRootCause
        }; 
    })

    return normalizedResult;
}
```

For failed records `(success: false)`, `SalesforceErrorFormatter.formatErrors()` translates raw Salesforce status codes into user-friendly messages using an internal lookup dictionary `(#SF_ERROR_TRANCRIPTION)`.

It evaluates whether the failure was an actual root cause or a secondary consequence of transaction rollback `(ALL_OR_NONE_OPERATION_ROLLED_BACK)`.


```javascript
//salesforce-error-formatter.js
formatErrors(errors = []) {
    const formattedErrors = errors.map((error) => this.#formatSingleError(error));
    const hasRootCause = errors.some((error) => this.#isRootError(error));

    return {
        formattedErrors: formattedErrors,
        hasRootCause: hasRootCause
    };
}

#formatSingleError(sfError) {
    const code = this.#getErrorCode(sfError);
    const message = this.#SF_ERROR_TRANCRIPTION[code] || 'An unexpected Salesforce error occurred.';
    return {
        message,
        fields: sfError.fields || [],
    };
}
```

***Examples of application server responses :***

```json
//201 (Created)
{
    "success": true,
    "sentRecordsCount": 2,
    "salesforceResult": [
        {
            "record": 1,
            "success": true,
            "id": "a00fj000029b0IzAAI"
        },
        {
            "record": 2,
            "success": true,
            "id": "a00fj000029b0J0AAI"
        }
    ]
}
```

```json
//400 (Bad Request)
{
    "success": false,
    "message": "Salesforce: Transaction has been rolled back. You enabled AllOrNone option and at least one record failed",
    "details": [
        {
            "record": 1,
            "success": false,
            "errors": [
                {
                    "message": "A required field is missing. Please check your input.",
                    "fields": [
                        "LastName__c"
                    ]
                }
            ],
            "hasRootCause": true
        }
    ]
}
```

```json
//400 (Bad Request)
{
  "success": false,
  "message": "No payload provided"
}
```






















