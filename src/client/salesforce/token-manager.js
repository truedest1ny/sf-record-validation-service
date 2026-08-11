export default class TokenManager {
    tokenClient = null;
    currentToken = null;

    constructor(tokenClient) {
        this.tokenClient = tokenClient;
    }

    async getToken() {
        if (this.currentToken) {
            return this.currentToken;
        }
        return await this.refreshToken();
    }

    async refreshToken() {
        this.currentToken = await this.tokenClient.fetchToken();
        return this.currentToken;
    }

    clearToken() {
        this.currentToken = null;
    }
}