# AI Chatbot Implementation - Dungeon Inn

## Overview
RAG-based AI chatbot that recommends massage shops and services, with booking/cancel/edit capabilities via action tokens.

## Architecture

### Backend
- **Endpoints:** `POST /api/v1/chat` (standard), `POST /api/v1/chat/stream` (SSE streaming)
- **Embeddings:** OpenAI `text-embedding-3-small`
- **Vector Store:** In-memory (rebuilt on server start + midnight cron)
- **Rebuild:** `POST /api/v1/chat/rebuild` (admin)
- **Model:** Direct OpenAI API (not LiteLLM)

### Frontend
- **Component:** `ChatWidget.tsx` - floating bottom-right widget
- **No separate page** - accessible from any page

## RAG Pipeline
1. User question sent to backend with optional `shopId` (pinned shop)
2. Question embedded via OpenAI embeddings
3. Vector store searched for top-k similar shop/service documents
4. Geo-boosting: nearby shops ranked higher
5. Weather context appended to prompt
6. System prompt (~200 lines) includes:
   - Shop/service context from RAG results
   - Booking/cancel/edit action token format
   - Merchant awareness (merchant name, shop info)
   - Thai language support

## Action Tokens
The chatbot outputs structured tokens that the frontend parses:

- `[[BOOK:shopId:serviceId:date:time]]` - Create a reservation
- `[[CANCEL:reservationId]]` - Cancel a reservation
- `[[EDIT:reservationId:date:time]]` - Edit a reservation

Frontend intercepts these tokens and calls the appropriate API, then shows confirmation.

## History Summarization
When conversation exceeds 10 messages, older messages are summarized to reduce token usage while maintaining context.

## Error Handling
- Graceful fallback when OpenAI API is unavailable
- Bilingual error messages (Thai + English)
- "I'm having trouble connecting" message with retry option

## Knowledge Base Rebuild
- Auto-builds on server start
- Midnight cron job rebuilds vector store (saves tokens vs interval-based)
- Admin can trigger manual rebuild via `POST /api/v1/chat/rebuild`
- Rebuild re-indexes all shop and service data from MongoDB

## Key Files
- `utils/chatbot.js` - Core chatbot logic (RAG, embeddings, prompt, vector store)
- `controllers/chat.js` - Express controller
- `src/components/ChatWidget.tsx` - Frontend widget

## Environment Variables
```
OPENAI_API_KEY=sk-...
VECTOR_STORE_PATH=./vector_store
```
