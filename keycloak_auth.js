const axios = require('axios');
const qs = require('querystring');

class KeycloakAuth {
    constructor() {
        this.clientId = process.env.USERS_API_CLIENT_ID;
        this.clientSecret = process.env.USERS_API_CLIENT_SECRET;
        this.tokenEndpoint = process.env.USERS_API_OIDC_ENDPOINT;
        this.token = null;
        this.tokenExpiration = null;
    }

    async getToken() {
        if (this.token && this.tokenExpiration && Date.now() < this.tokenExpiration) {
            return this.token;
        }

        try {
            const response = await axios.post(this.tokenEndpoint,
                qs.stringify({
                    grant_type: 'client_credentials',
                    client_id: this.clientId,
                    client_secret: this.clientSecret
                }), {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });

            this.token = response.data.access_token;
            this.tokenExpiration = Date.now() + (response.data.expires_in * 1000);
            return this.token;
        } catch (error) {
            console.error('Error getting Keycloak token:', error.message);
            return null;
        }
    }

    async makeAuthenticatedRequest(url, method = 'get', data = null) {
        const token = await this.getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        try {
            const response = await axios({
                method,
                url,
                data,
                headers
            });
            return response.data;
        } catch (error) {
            console.error('Error making authenticated request:', error.message);
            throw error;
        }
    }
}

module.exports = new KeycloakAuth();
