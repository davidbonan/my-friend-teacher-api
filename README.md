# My Friend Teacher API

Secure backend API for the My Friend Teacher mobile application.

## 🚀 Deployment

This API is deployed on Vercel at: https://my-friend-teacher-api.vercel.app

## 🔧 Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment configuration:**
   ```bash
   cp .env.example .env
   ```
   
   Fill in the required environment variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `API_SECRET_KEY`: Shared secret key (must match mobile app)

3. **Development:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## 🔐 Security Features

- **API Key Authentication**: Shared secret key between app and API
- **User ID Validation**: Each request requires a valid user ID
- **Rate Limiting**: 10 requests per minute per user
- **CORS Protection**: Configured for production security
- **Input Validation**: All request data is validated

## 📡 API Endpoints

### Health Check
```
GET /health
```

### Chat Completion
```
POST /api/chat
Headers:
  x-api-key: <shared-secret-key>
  x-user-id: <user-uuid>
Content-Type: application/json

Body:
{
  "messages": [...],
  "language": "english" | "hebrew",
  "personality": { ... },
  "userId": "user-uuid"
}
```

## 🏗️ Architecture

- **Fastify**: High-performance web framework
- **OpenAI Integration**: Secure ChatGPT API calls
- **Rate Limiting**: Per-user request throttling
- **TypeScript**: Full type safety
- **Vercel**: Serverless deployment platform

## 🔑 Authentication Flow

1. Mobile app includes `x-api-key` and `x-user-id` headers
2. API validates the shared secret key
3. API validates user ID format
4. Future: RevenueCat subscription validation
5. Request processed if all validations pass

## 📊 Rate Limiting

- **Default**: 10 requests per minute per user
- **Key**: Based on `x-user-id` header or IP fallback
- **Window**: 60 seconds (configurable via env)

## 🌍 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `API_SECRET_KEY` | Shared secret with mobile app | Yes |
| `RATE_LIMIT_MAX` | Max requests per window | No (default: 10) |
| `RATE_LIMIT_WINDOW` | Rate limit window in ms | No (default: 60000) |
| `NODE_ENV` | Environment mode | No |

## 🚀 Deployment to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Set environment variables in Vercel dashboard**

## 🧪 Testing

```bash
# Health check
curl https://my-friend-teacher-api.vercel.app/health

# Chat request
curl -X POST https://my-friend-teacher-api.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-key" \
  -H "x-user-id: user-uuid" \
  -d '{"messages": [...], "language": "english", "personality": {...}, "userId": "user-uuid"}'
```