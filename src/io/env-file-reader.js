import path from 'node:path';
import process from 'node:process';

export default class EnvFileReader {
    static getParamsValues(filename = '.env', keys = ['SF_ORG_DOMAIN', 'SF_CONSUMER_KEY', 'SF_CONSUMER_SECRET']) {
        process.loadEnvFile(
            path.resolve(process.cwd(), filename)
        );
        return keys.map((key) => process.env[key]);
    }
}