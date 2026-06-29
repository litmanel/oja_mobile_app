import Fastify from 'fastify';
import { env } from '@oja/config';
import corsPlugin from './plugins/cors';
import rateLimitPlugin from './plugins/rate-limit';
import authPlugin from './plugins/auth';
import healthRouter from './routes/v1/health/health.router';
import otpRequestRouter from './routes/v1/auth/otp-request.router';
import otpVerifyRouter from './routes/v1/auth/otp-verify.router';
import refreshRouter from './routes/v1/auth/refresh.router';
import logoutRouter from './routes/v1/auth/logout.router';

const fastify = Fastify({
  logger: env.NODE_ENV === 'development',
});

// Register Plugins
fastify.register(corsPlugin);
fastify.register(rateLimitPlugin);
fastify.register(authPlugin);

// Register Routes
fastify.register(healthRouter, { prefix: '/v1/health' });
fastify.register(otpRequestRouter, { prefix: '/v1/auth/otp/request' });
fastify.register(otpVerifyRouter, { prefix: '/v1/auth/otp/verify' });
fastify.register(refreshRouter, { prefix: '/v1/auth/refresh' });
fastify.register(logoutRouter, { prefix: '/v1/auth/logout' });

const start = async () => {
  try {
    await fastify.listen({ port: env.API_PORT, host: env.API_HOST });
    console.log(`Server listening on http://${env.API_HOST}:${env.API_PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
