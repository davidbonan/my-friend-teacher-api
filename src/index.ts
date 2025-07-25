import fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { AuthService } from './services/AuthService';
import { ChatGPTService } from './services/ChatGPTService';
import { AuthHeaders, ChatRequest } from './types';

// Create Fastify instance
const app = fastify({
  logger: process.env.NODE_ENV === 'production' ? false : true,
});

// Register CORS
app.register(cors, {
  origin: true,
  credentials: true,
});

// Register rate limiting
app.register(rateLimit, {
  max: parseInt(process.env.RATE_LIMIT_MAX || '10'),
  timeWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '60000'),
  keyGenerator: (request) => {
    return (request.headers['x-user-id'] as string) || request.ip;
  },
});

// Health check endpoint
app.get('/health', async () => {
  return { 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'My Friend Teacher API'
  };
});

// Authentication middleware
app.addHook('preHandler', async (request, reply) => {
  // Skip auth for health check
  if (request.url === '/health') {
    return;
  }

  const apiKey = request.headers['x-api-key'] as string;
  const userId = request.headers['x-user-id'] as string;

  if (!apiKey || !userId) {
    reply.status(401).send({
      error: 'Missing authentication headers',
      message: 'x-api-key and x-user-id headers are required',
    });
    return;
  }

  if (!AuthService.validateApiKey(apiKey)) {
    reply.status(401).send({
      error: 'Invalid API key',
      message: 'The provided API key is not valid',
    });
    return;
  }

  if (!AuthService.validateUserId(userId)) {
    reply.status(401).send({
      error: 'Invalid user ID',
      message: 'The provided user ID is not valid',
    });
    return;
  }
});

// Chat endpoint
app.post<{
  Body: ChatRequest;
  Headers: AuthHeaders;
}>('/api/chat', async (request, reply) => {
  try {
    const { messages, language, personality, userId } = request.body;

    // Validate request body
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return reply.status(400).send({
        error: 'Invalid request',
        message: 'Messages array is required and cannot be empty',
      });
    }

    if (!language || !['english', 'hebrew'].includes(language)) {
      return reply.status(400).send({
        error: 'Invalid language',
        message: 'Language must be either "english" or "hebrew"',
      });
    }

    if (!personality || typeof personality !== 'object') {
      return reply.status(400).send({
        error: 'Invalid personality',
        message: 'Personality object is required',
      });
    }

    // Generate AI response
    const chatService = new ChatGPTService();
    const response = await chatService.generateResponse(request.body);

    if (response.error) {
      return reply.status(500).send({
        error: 'AI Service Error',
        message: response.error,
      });
    }

    return {
      message: response.message,
      timestamp: new Date().toISOString(),
      userId: userId,
    };
  } catch (error) {
    app.log.error('Chat endpoint error:', error);
    return reply.status(500).send({
      error: 'Internal server error',
      message: 'An unexpected error occurred',
    });
  }
});

// For Vercel serverless deployment
export default async (req: any, res: any) => {
  await app.ready();
  app.server.emit('request', req, res);
};