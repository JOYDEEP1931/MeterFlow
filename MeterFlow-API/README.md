# MeterFlow - Usage-Based API Billing Platform

## Quick Start

1. **Start services**
```bash
docker-compose up -d
```

2. **Backend**
```bash
cd MeterFlow-API/backend
cp .env.example .env
# Edit .env with your Stripe keys
npm run dev
```

3. **Frontend**
```bash
cd MeterFlow-API/frontend
npm install
npm run dev
```

## Features
- API Management & Key Generation
- Rate Limiting (Redis)
- Usage Tracking & Logging
- Billing & Invoicing
- Stripe Payments
- Realtime Dashboard (Socket.io)
- API Gateway Proxy
- Analytics

Backend: http://localhost:5000
Frontend: http://localhost:3000

## Architecture
```
Client -> Frontend -> Backend -> Gateway -> External API
                              |
                           MongoDB + Redis
```

## API Playground
Create API with baseUrl (e.g. https://jsonplaceholder.typicode.com)
Generate key
Test at http://localhost:5000/gateway/{apiId}/posts/1

All requests logged, metered, rate limited.

