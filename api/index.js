const { ChatGPTService } = require('../dist/services/ChatGPTService');
const { AuthService } = require('../dist/services/AuthService');

// Rate limiting store (in-memory)
const rateLimitStore = new Map();

// Clean old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now - data.resetTime > 60000) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key, x-user-id');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  try {
    // Health endpoint
    if (pathname === '/health' && req.method === 'GET') {
      return res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'My Friend Teacher API'
      });
    }

    // Chat endpoint
    if (pathname === '/api/chat' && req.method === 'POST') {
      // Authentication
      const apiKey = req.headers['x-api-key'];
      const userId = req.headers['x-user-id'];

      if (!apiKey || !userId) {
        return res.status(401).json({
          error: 'Missing authentication headers',
          message: 'x-api-key and x-user-id headers are required'
        });
      }

      if (!AuthService.validateApiKey(apiKey)) {
        return res.status(401).json({
          error: 'Invalid API key',
          message: 'The provided API key is not valid'
        });
      }

      if (!AuthService.validateUserId(userId)) {
        return res.status(401).json({
          error: 'Invalid user ID',
          message: 'The provided user ID is not valid'
        });
      }

      // Rate limiting
      const rateLimitKey = userId;
      const now = Date.now();
      const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW || '60000');
      const maxRequests = parseInt(process.env.RATE_LIMIT_MAX || '10');

      let userRequests = rateLimitStore.get(rateLimitKey);
      if (!userRequests) {
        userRequests = { count: 0, resetTime: now + windowMs };
        rateLimitStore.set(rateLimitKey, userRequests);
      }

      if (now > userRequests.resetTime) {
        userRequests.count = 0;
        userRequests.resetTime = now + windowMs;
      }

      if (userRequests.count >= maxRequests) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.'
        });
      }

      userRequests.count++;

      // Parse request body
      let body;
      if (req.body) {
        body = req.body;
      } else {
        // For Vercel, we need to parse the body manually
        const chunks = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        const rawBody = Buffer.concat(chunks).toString();
        body = JSON.parse(rawBody);
      }

      const { messages, language, personality } = body;

      // Validate request body
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'Messages array is required and cannot be empty'
        });
      }

      if (!language || !['english', 'hebrew'].includes(language)) {
        return res.status(400).json({
          error: 'Invalid language',
          message: 'Language must be either "english" or "hebrew"'
        });
      }

      if (!personality || typeof personality !== 'object') {
        return res.status(400).json({
          error: 'Invalid personality',
          message: 'Personality object is required'
        });
      }

      // Generate AI response
      const chatService = new ChatGPTService();
      const response = await chatService.generateResponse(body);

      if (response.error) {
        return res.status(500).json({
          error: 'AI Service Error',
          message: response.error
        });
      }

      return res.status(200).json({
        message: response.message,
        timestamp: new Date().toISOString(),
        userId: userId
      });
    }

    // 404 for unmatched routes
    return res.status(404).json({
      error: 'Not Found',
      message: 'The requested endpoint was not found'
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
};