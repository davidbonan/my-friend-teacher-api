# My Friend Teacher API

Secure Fastify backend API for the My Friend Teacher mobile application.

## 🚀 Deployment

This API is deployed on Vercel at: https://my-friend-teacher-api.vercel.app

## 🔧 Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment configuration:**
   Set the following environment variables in Vercel dashboard:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `API_SECRET_KEY`: Shared secret key (must match mobile app)
   - `RATE_LIMIT_MAX`: Max requests per minute (optional, default: 10)
   - `RATE_LIMIT_WINDOW`: Rate limit window in ms (optional, default: 60000)

3. **Local development:**
   ```bash
   npm run dev
   ```

4. **Build and deploy:**
   ```bash
   npm run build
   vercel --prod
   ```

## 🏗️ Architecture

- **Fastify Framework**: High-performance web framework optimized for speed
- **TypeScript**: Full type safety and better development experience
- **Vercel Serverless**: Scalable deployment with automatic scaling
- **OpenAI Integration**: Secure ChatGPT API calls with error handling

## 🔐 Security Features

- **API Key Authentication**: Shared secret key validation using timing-safe comparison
- **User ID Validation**: UUID format validation for user identification
- **Rate Limiting**: Configurable per-user request throttling
- **CORS Protection**: Properly configured cross-origin resource sharing
- **Input Validation**: Comprehensive request body and parameter validation

## 📡 API Endpoints

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "My Friend Teacher API"
}
```

### Chat Completion
```http
POST /api/chat
Headers:
  Content-Type: application/json
  x-api-key: <shared-secret-key>
  x-user-id: <user-uuid>

Body:
{
  "messages": [
    {
      "id": "1",
      "content": "Hello!",
      "isUser": true,
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
  ],
  "language": "english" | "hebrew",
  "personality": {
    "humor": 3,
    "mockery": 2,
    "seriousness": 4,
    "professionalism": 3
  },
  "userId": "user-uuid"
}
```

**Response:**
```json
{
  "message": "Hello! How can I help you today?",
  "timestamp": "2024-01-15T10:30:01.000Z",
  "userId": "user-uuid"
}
```

## 🔑 Authentication

All requests (except `/health`) require authentication headers:
- `x-api-key`: Shared secret key that matches `API_SECRET_KEY` environment variable
- `x-user-id`: Valid user identifier (UUID format or minimum 8 characters)

## 📊 Rate Limiting

- **Default**: 10 requests per minute per user
- **Key**: Based on `x-user-id` header, fallback to IP address
- **Window**: 60 seconds (configurable)
- **Response**: 429 status code when exceeded

## 🌍 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `OPENAI_API_KEY` | OpenAI API key | Yes | - |
| `API_SECRET_KEY` | Shared secret with mobile app | Yes | - |
| `RATE_LIMIT_MAX` | Max requests per window | No | 10 |
| `RATE_LIMIT_WINDOW` | Rate limit window (ms) | No | 60000 |
| `NODE_ENV` | Environment mode | No | development |

## 🧪 Testing

```bash
# Health check
curl https://my-friend-teacher-api.vercel.app/health

# Chat request
curl -X POST https://my-friend-teacher-api.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-key" \
  -H "x-user-id: test-user-12345678-1234-4321-abcd-123456789012" \
  -d '{
    "messages": [{"id":"1","content":"Hello!","isUser":true,"timestamp":"2024-01-15T10:30:00.000Z"}],
    "language": "english",
    "personality": {"humor":3,"mockery":2,"seriousness":4,"professionalism":3},
    "userId": "test-user-12345678-1234-4321-abcd-123456789012"
  }'
```

## 📁 Project Structure

```
/api
├── src/
│   ├── services/
│   │   ├── AuthService.ts      # Authentication logic
│   │   └── ChatGPTService.ts   # OpenAI integration
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   └── index.ts                # Main Fastify server
├── dist/                       # Compiled JavaScript (build output)
├── vercel.json                 # Vercel deployment configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies and scripts
└── README.md                   # Documentation
```

## 🚀 Deployment Process

1. **Build**: TypeScript compilation to `dist/` folder
2. **Vercel**: Automatic deployment from `dist/index.js`
3. **Environment**: Variables set in Vercel dashboard
4. **Scaling**: Automatic based on traffic

## ✨ Features

- **High Performance**: Fastify is one of the fastest Node.js frameworks
- **Type Safety**: Full TypeScript coverage with strict typing
- **Error Handling**: Comprehensive error catching and user-friendly messages
- **Logging**: Structured logging for debugging and monitoring
- **Validation**: Input validation for all endpoints
- **Security**: Multiple layers of authentication and authorization