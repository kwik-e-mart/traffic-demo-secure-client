const fastify = require('fastify')({ logger: { level: 'error' } });
const keycloakAuth = require('./keycloak_auth');

const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 8080;
const SECURE_TEST_URL = 'https://traffic-api-gateway-staging-argentina-wyxwd.kwik-e-mart-main.nullapps.io/secure-test';

// Declare a route
fastify.get('/', async (request, reply) => {
    try {
        const result = await keycloakAuth.makeAuthenticatedRequest(SECURE_TEST_URL);
        return result;
    } catch (error) {
        fastify.log.error('Error calling secure-test endpoint:', error.message);
        return { error: 'Failed to fetch data from secure-test endpoint', request_error: error };
    }
});

// Health
fastify.get('/health', async (request, reply) => {
    return { status: 'ok' };
});

// Run the server!
const start = async () => {
    try {
        await fastify.listen({ host: HOST, port: PORT });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
