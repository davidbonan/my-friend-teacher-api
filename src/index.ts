import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { ChatGPTService } from './services/ChatGPTService';
import { AuthService } from './services/AuthService';
import { ChatRequest, AuthHeaders } from './types';

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'info'
  }
});

// Register CORS
fastify.register(cors, {
  origin: true, // Allow all origins in development
  credentials: true
});

// Register rate limiting
fastify.register(rateLimit, {
  max: parseInt(process.env.RATE_LIMIT_MAX || '10'),
  timeWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '60000'), // 1 minute
  keyGenerator: (request) => {
    return request.headers['x-user-id'] as string || request.ip;
  }
});

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Authentication middleware
fastify.addHook('preHandler', async (request, reply) => {
  // Skip auth for health check
  if (request.url === '/health') {
    return;
  }

  const apiKey = request.headers['x-api-key'] as string;
  const userId = request.headers['x-user-id'] as string;

  if (!apiKey || !userId) {
    reply.status(401).send({
      error: 'Missing authentication headers',
      message: 'x-api-key and x-user-id headers are required'
    });
    return;
  }

  if (!AuthService.validateApiKey(apiKey)) {
    reply.status(401).send({
      error: 'Invalid API key',
      message: 'The provided API key is not valid'
    });
    return;
  }

  if (!AuthService.validateUserId(userId)) {
    reply.status(401).send({
      error: 'Invalid user ID',
      message: 'The provided user ID is not valid'
    });
    return;
  }

  // TODO: Add RevenueCat validation
  // const isValidSubscription = await AuthService.validateWithRevenueCat(userId);
  // if (!isValidSubscription) {
  //   reply.status(403).send({
  //     error: 'Subscription required',
  //     message: 'Valid subscription required to access this service'
  //   });
  //   return;
  // }
});

// Chat endpoint
fastify.post<{
  Body: ChatRequest;
  Headers: AuthHeaders;
}>('/api/chat', async (request, reply) => {
  try {
    const { messages, language, personality, userId } = request.body;

    // Validate request body
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      reply.status(400).send({
        error: 'Invalid request',
        message: 'Messages array is required and cannot be empty'
      });
      return;
    }

    if (!language || !['english', 'hebrew'].includes(language)) {
      reply.status(400).send({
        error: 'Invalid language',
        message: 'Language must be either "english" or "hebrew"'
      });
      return;
    }

    if (!personality || typeof personality !== 'object') {
      reply.status(400).send({
        error: 'Invalid personality',
        message: 'Personality object is required'
      });
      return;
    }

    // Initialize ChatGPT service
    const chatService = new ChatGPTService();
    const response = await chatService.generateResponse(request.body);

    if (response.error) {
      reply.status(500).send({
        error: 'AI Service Error',
        message: response.error
      });
      return;
    }

    return {
      message: response.message,
      timestamp: new Date().toISOString(),
      userId: userId
    };

  } catch (error: any) {
    fastify.log.error('Chat endpoint error:', error);
    
    reply.status(500).send({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

// Start server
const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
    
    await fastify.listen({ port, host });
    fastify.log.info(`Server running at http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Handle Vercel serverless
if (process.env.NODE_ENV === 'production') {
  module.exports = fastify;
} else {
  start();
}