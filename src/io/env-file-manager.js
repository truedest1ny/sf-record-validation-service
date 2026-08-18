import path from 'node:path';
import process from 'node:process';
import Joi from 'joi';

export default class EnvFileManager {

    #PORT_KEY = 'PORT';

    #DOMAIN_KEY = 'SF_ORG_DOMAIN';
    #CLIENT_KEY = 'SF_CONSUMER_KEY';
    #SECRET_KEY = 'SF_CONSUMER_SECRET';

    static #instances = new Map();

    constructor(filename){
        if (!filename || typeof filename !== 'string'){
            throw new TypeError('File name must be valid.')
        }

        const filePath = path.resolve(process.cwd(), filename);

        if (EnvFileManager.#instances.has(filePath)){
            return EnvFileManager.#instances.get(filePath);
        }

        process.loadEnvFile(filePath);

        EnvFileManager.#instances.set(filePath, this);
    }

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

    getSystemProps(){
        const systemPropsSchema = Joi.object({
            [this.#PORT_KEY] : Joi.number().port().default(8888)
        });

        const systemPropsConfig = this.#validateSchema(systemPropsSchema);

        return {
            port : systemPropsConfig[this.#PORT_KEY] 
        };
    }

    #validateSchema(schema) {
        const {error, value: config} = schema.validate(process.env, {
            allowUnknown : true,
            stripUnknown : true
        });

        if (error) {
            throw new Error(`Validation error : ${error.message}`);
        }

        return config;
    }
}