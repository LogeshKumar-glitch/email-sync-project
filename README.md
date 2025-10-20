# Email Sync Starter Project
## What's included
- backend/ : TypeScript Express backend with IMAP skeleton, Elasticsearch indexing, AI categorization, Slack & webhook stubs, RAG suggestion hooks.
- docker-compose.yml : Elasticsearch + Qdrant (placed at repository root)
- .env.example : example env vars
- frontend/ : Minimal Vite + React UI (dev proxy configured to backend)

## Run
1. Start docker services:
   docker compose up -d

2. Configure .env (copy from .env.example) and fill OPENAI_API_KEY, SLACK_WEBHOOK_URL, EXTERNAL_WEBHOOK, IMAP_ACCOUNTS_JSON as needed.

3. Install & start backend:
   cd backend
   npm install
   npm run dev

4. Install & start frontend (in another terminal):
   cd frontend
   npm install
   npm run dev

5. Use Postman to call:
   GET http://localhost:3000/health
   GET http://localhost:3000/search?q=...
   POST http://localhost:3000/suggest-reply  { "text": "Sample email body" }

Note: This is a starter scaffold. Fill in credentials and tune index mappings / error handling for production.
