# My Friend Teacher API

Secure backend API for the My Friend Teacher mobile application, deployed on Vercel.

## 🚀 Deployment

This API is deployed on Vercel at: https://my-friend-teacher-api.vercel.app

## 🔧 Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build TypeScript:**
   ```bash
   npm run build
   ```

3. **Environment configuration in Vercel dashboard:**
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `API_SECRET_KEY`: Shared secret key (must match mobile app)
   - `RATE_LIMIT_MAX`: Max requests per minute (optional, default: 10)
   - `RATE_LIMIT_WINDOW`: Rate limit window in ms (optional, default: 60000)

4. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

## 🏗️ Architecture

- **Vercel Serverless Functions**: Native serverless deployment
- **TypeScript + JavaScript**: TypeScript services compiled to JavaScript
- **Node.js Runtime**: Using @vercel/node@3 runtime
- **OpenAI Integration**: Secure ChatGPT API calls

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
  "messages": [...],
  "language": "english" | "hebrew",
  "personality": { ... },
  "userId": "user-uuid"
}
```

## 🔐 Security Features

- **API Key Authentication**: Shared secret key validation
- **User ID Validation**: UUID format validation
- **Rate Limiting**: 10 requests per minute per user (configurable)
- **CORS Protection**: Configured for cross-origin requests
- **Input Validation**: Request body validation

## 🧪 Testing

**Test health endpoint:**
```bash
curl https://my-friend-teacher-api.vercel.app/health
```

**Test chat endpoint:**
```bash
curl -X POST https://my-friend-teacher-api.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -H "x-api-key: mft-2024-secure-api-key-v1-random-string-12345" \
  -H "x-user-id: test-user-12345678-1234-4321-abcd-123456789012" \
  -d '{
    "messages": [{"id":"1","content":"Hello!","isUser":true,"timestamp":"2024-01-15T10:30:00.000Z"}],
    "language": "english",
    "personality": {"humor":3,"mockery":2,"seriousness":4,"professionalism":3},
    "userId": "test-user-12345678-1234-4321-abcd-123456789012"
  }'
```

**Run full deployment test:**
```bash
node test-deployment.js
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
│   └── index.ts                # Original Fastify server (for dev)
├── api/
│   └── index.js                # Vercel serverless function
├── dist/                       # Compiled TypeScript output
├── vercel.json                 # Vercel deployment configuration
├── test-deployment.js          # Deployment test script
└── package.json                # Dependencies and scripts
```

## 🚀 Deployment Process

1. **Build**: `npm run build` compiles TypeScript to `dist/`
2. **Function**: Vercel uses `api/index.js` as serverless function
3. **Routes**: All routes handled by single function
4. **Environment**: Variables set in Vercel dashboard

## 🔄 How It Works

1. **TypeScript Services**: Business logic in `src/services/`
2. **Compilation**: TypeScript compiled to `dist/` folder
3. **Serverless Handler**: `api/index.js` imports from `dist/`
4. **Request Routing**: Single function handles all endpoints
5. **Response**: JSON responses with proper status codes

## ✨ Key Features

- **Single Function**: All endpoints in one serverless function
- **TypeScript Support**: Business logic in TypeScript
- **Zero Config**: Works out-of-the-box with Vercel
- **Error Handling**: Comprehensive error responses
- **Rate Limiting**: In-memory rate limiting per user
- **Authentication**: Secure API key validation

## 🌍 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `OPENAI_API_KEY` | OpenAI API key | Yes | - |
| `API_SECRET_KEY` | Shared secret with mobile app | Yes | - |
| `RATE_LIMIT_MAX` | Max requests per window | No | 10 |
| `RATE_LIMIT_WINDOW` | Rate limit window (ms) | No | 60000 |