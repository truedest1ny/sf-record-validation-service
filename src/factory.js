const axios = require('axios');
const path = require('node:path');
const process = require('node:process');
const setInterceptor = require('./service/token-refresher')

const envPath = path.resolve(__dirname, '../.env');
process.loadEnvFile(envPath);

const domain = process.env.SF_ORG_DOMAIN;
const consumerKey = process.env.SF_CONSUMER_KEY;
const secret = process.env.SF_CONSUMER_SECRET;

const sfConnector = axios.create({baseURL : 'https://' + domain})

setInterceptor(sfConnector, {domain, consumerKey, secret});
