import cors from '@fastify/cors';
import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

/**
 * Allows the web app origin to call this API from the browser.
 * SSR loaders do not need CORS; client refetches and mutations do.
 */
export default fp(async function (fastify: FastifyInstance) {
  await fastify.register(cors, {
    origin: 'http://localhost:4200',
  });
});
