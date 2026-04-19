# AI Chatbot Implementation Plan for Dungeon Inn

## Overview
This document outlines the implementation plan for adding an AI Chatbot Massage Recommendation System to the Dungeon Inn massage reservation platform.

---

## Epic 2: AI Chatbot Massage Recommendation

### User Story 2-1: Symptom-Based Massage Recommendation
**As a** customer  
**I want** to ask the AI chatbot about my symptoms  
**So that** I can get recommendations for suitable massage types

#### Acceptance Criteria
1. **Given** the customer opens the chatbot  
   **When** the customer enters their symptoms  
   **Then** the system sends the request to the AI chatbot

2. **Given** the chatbot receives the request  
   **When** the AI processes the information  
   **Then** the chatbot suggests suitable massage types

#### Implementation Ideas

**Frontend Components:**
- Create `ChatbotWidget` - Floating chat button (bottom-right corner)
- Create `ChatbotModal` - Full chat interface with message history
- Create `SymptomInput` - Text input with quick symptom buttons (e.g., "Back Pain", "Neck Stiffness", "Stress")
- Create `RecommendationCard` - Display massage type suggestions with descriptions

**API Integration:**
```typescript
// src/libs/chatbot.ts
export const getMassageRecommendation = async (symptoms: string) => {
  const response = await fetch(`${API_URL}/chatbot/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symptoms }),
  });
  return response.json();
};
```

**AI/Backend Logic:**
- Use OpenAI API or similar LLM to analyze symptoms
- Map symptoms to massage types in knowledge base:
  - Back Pain → Thai Massage, Deep Tissue
  - Stress → Aromatherapy, Swedish Massage
  - Neck Stiffness → Shiatsu, Trigger Point
  - Fatigue → Hot Stone, Reflexology

**UI/UX Design:**
- Dark theme matching Dungeon Inn aesthetic
- Chat bubbles with medieval/tavern styling
- Typing indicator while AI processes
- Quick-reply buttons for common symptoms

---

### User Story 2-2: Shop & Duration Recommendations
**As a** customer  
**I want** the chatbot to recommend massage duration and shop options  
**So that** I can choose the best massage service

#### Acceptance Criteria
1. **Given** the chatbot receives the customer's request  
   **When** the chatbot analyzes the symptoms  
   **Then** suggest massage duration and recommended shops  
   **And** ensure correct data is recorded

2. **Given** the recommendations are generated  
   **When** the chatbot responds  
   **Then** display the suggestions clearly to the customer

#### Implementation Ideas

**Enhanced Recommendation Flow:**
1. Customer describes symptoms
2. AI suggests massage type(s)
3. AI recommends duration (30/60/90/120 min based on severity)
4. AI queries available shops offering those services
5. Display shop cards with:
   - Shop name & rating
   - Distance/location
   - Price range
   - Available time slots
   - "Book Now" button

**Components to Build:**
- `ShopRecommendationCard` - Shop info with booking CTA
- `DurationSelector` - Suggested durations with explanations
- `BookingIntegration` - Direct link to booking page with pre-filled data

**Backend API:**
```typescript
// Recommendation response structure
interface ChatbotRecommendation {
  massageTypes: {
    name: string;
    description: string;
    benefits: string[];
  }[];
  suggestedDuration: number; // minutes
  recommendedShops: {
    shopId: string;
    shopName: string;
    address: string;
    rating: number;
    priceRange: string;
    availableSlots: string[];
  }[];
}
```

**Database Schema Addition:**
```javascript
// Chatbot Knowledge Base Collection
{
  symptomKeywords: ['back pain', 'lower back', 'spine'],
  massageTypes: ['thai', 'deep tissue'],
  recommendedDuration: { min: 60, max: 90 },
  contraindications: ['pregnancy', 'recent surgery'],
  description: "For back pain, we recommend..."
}
```

---

### User Story 2-3: Admin Knowledge Base Management
**As an** admin  
**I want** to update the chatbot knowledge base  
**So that** the chatbot can provide accurate massage recommendations

#### Acceptance Criteria
1. **Given** the admin opens the chatbot management page  
   **When** the admin updates recommendation data  
   **Then** the system saves the updated knowledge base

2. **Given** the knowledge base is updated  
   **When** customers ask the chatbot  
   **Then** the chatbot uses the updated information

#### Implementation Ideas

**Admin Interface:**
- Create `/admin/chatbot` page
- Build `KnowledgeBaseEditor` component with:
  - Symptom keyword management
  - Massage type associations
  - Recommendation rules editor
  - Response template editor

**Knowledge Base Structure:**
```typescript
interface KnowledgeBaseEntry {
  id: string;
  symptomKeywords: string[];
  massageTypes: string[];
  duration: { min: number; max: number };
  priority: number;
  responseTemplate: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Admin Features:**
- Add/Edit/Delete knowledge entries
- Bulk import from CSV
- Test chatbot responses in admin panel
- View chatbot usage analytics
- Review failed/missed queries for improvement

**API Endpoints:**
```typescript
GET    /api/v1/admin/chatbot/knowledge    // List all entries
POST   /api/v1/admin/chatbot/knowledge    // Create entry
PUT    /api/v1/admin/chatbot/knowledge/:id // Update entry
DELETE /api/v1/admin/chatbot/knowledge/:id // Delete entry
POST   /api/v1/admin/chatbot/test         // Test chatbot response
```

---

### User Story 2-4: Remove Outdated Recommendations
**As an** admin  
**I want** to remove incorrect or outdated chatbot recommendation data  
**So that** the chatbot provides reliable advice

#### Acceptance Criteria
1. **Given** the admin views the chatbot knowledge data  
   **When** the admin selects data to remove  
   **Then** the system deletes the selected data

2. **Given** the data is removed  
   **When** the chatbot generates recommendations  
   **Then** the deleted information should not be used

#### Implementation Ideas

**Deletion Features:**
- Soft delete (mark as inactive) vs Hard delete
- Bulk delete with confirmation
- Audit log of deletions (who, when, why)
- Restore deleted entries from trash

**Safety Measures:**
- Confirmation modal before deletion
- Warning if entry is frequently used
- Backup before bulk operations
- "Deprecate" option (keep but don't use)

---

## Technical Architecture

### Component Structure
```
src/
├── app/
│   └── admin/
│       └── chatbot/
│           ├── page.tsx              # Knowledge base management
│           └── test/
│               └── page.tsx          # Test chatbot interface
├── components/
│   ├── chatbot/
│   │   ├── ChatbotWidget.tsx         # Floating chat button
│   │   ├── ChatbotModal.tsx          # Main chat interface
│   │   ├── ChatMessage.tsx           # Individual message bubble
│   │   ├── SymptomInput.tsx          # Input with quick buttons
│   │   ├── RecommendationCard.tsx    # Massage type suggestion
│   │   └── ShopSuggestionCard.tsx    # Shop recommendation
│   └── admin/
│       └── KnowledgeBaseEditor.tsx   # Admin knowledge management
├── libs/
│   └── chatbot.ts                    # Chatbot API functions
├── redux/
│   └── features/
│       └── chatbotSlice.ts           # Chatbot state management
└── interface.ts                      # Add chatbot types
```

### State Management (Redux)
```typescript
interface ChatbotState {
  isOpen: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  lastRecommendation: Recommendation | null;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  recommendations?: Recommendation;
}
```

### AI Integration Options

**Option 1: OpenAI GPT-4/3.5**
- Pros: Natural conversation, handles variations well
- Cons: API costs, requires prompt engineering

**Option 2: Rule-Based with Keyword Matching**
- Pros: Predictable, no API costs, fast
- Cons: Limited to predefined patterns

**Option 3: Hybrid Approach (Recommended)**
- Use keyword matching for common symptoms
- Use LLM for complex/natural language queries
- Fallback to "Please contact us" for edge cases

### Database Collections Needed
```javascript
// chatbot_knowledge
{
  _id: ObjectId,
  keywords: [String],
  massageTypes: [String],
  duration: { min: Number, max: Number },
  response: String,
  priority: Number,
  isActive: Boolean
}

// chatbot_conversations (for analytics)
{
  _id: ObjectId,
  userId: ObjectId,
  messages: [{ role: String, content: String, timestamp: Date }],
  recommendationGiven: Boolean,
  bookingConverted: Boolean
}
```

---

## UI/UX Mockup Ideas

### Chatbot Widget (Closed State)
- Floating button bottom-right
- Pulsing glow effect when new message
- Icon: 💬 or medieval scroll icon

### Chat Interface (Open State)
```
┌─────────────────────────────┐
│  🕯️ Dungeon Inn Assistant   │
├─────────────────────────────┤
│                             │
│  🤖 Welcome traveler!       │
│     Describe your aches...  │
│                             │
│  👤 My lower back hurts     │
│                             │
│  🤖 I recommend:            │
│     ┌─────────────────┐     │
│     │ Thai Massage    │     │
│     │ 60-90 min       │     │
│     │ [View Shops]    │     │
│     └─────────────────┘     │
│                             │
│  [Quick: Back] [Neck] [Stress]
│  ┌───────────────────────┐  │
│  │ Type your symptoms... │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

### Admin Knowledge Base Page
- Table view of all knowledge entries
- Search/filter by keywords
- "Test" button to simulate customer query
- Import/Export CSV buttons

---

## Implementation Phases

### Phase 1: Basic Chatbot (US2-1)
- [ ] Create chatbot UI components
- [ ] Integrate with OpenAI API
- [ ] Basic symptom → massage type mapping
- [ ] Add to main layout

### Phase 2: Enhanced Recommendations (US2-2)
- [ ] Add shop querying to recommendations
- [ ] Duration suggestions
- [ ] Direct booking integration
- [ ] Shop cards in chat

### Phase 3: Admin Management (US2-3, US2-4)
- [ ] Create admin chatbot page
- [ ] Knowledge base CRUD
- [ ] Testing interface
- [ ] Analytics dashboard

---

## Backend Implementation

Backend location: `~/Documents/Frontend/Final/be-project-68-bitkrub/`

### New Files to Create

#### 1. Model: `models/ChatbotKnowledge.js`
```javascript
const mongoose = require('mongoose');

const ChatbotKnowledgeSchema = new mongoose.Schema({
    symptomKeywords: {
        type: [String],
        required: [true, 'Please add at least one symptom keyword'],
    },
    massageTypes: {
        type: [String],
        required: [true, 'Please add recommended massage types'],
    },
    areas: {
        type: [String],
        enum: ['full body', 'back', 'foot', 'head', 'shoulder', 'face', 'other'],
        default: ['full body']
    },
    duration: {
        min: { type: Number, default: 30 },
        max: { type: Number, default: 120 }
    },
    responseTemplate: {
        type: String,
        required: [true, 'Please add a response template'],
    },
    priority: {
        type: Number,
        default: 1,
        min: 1,
        max: 10
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ChatbotKnowledge', ChatbotKnowledgeSchema);
```

#### 2. Controller: `controllers/chatbot.js`
```javascript
const ChatbotKnowledge = require('../models/ChatbotKnowledge');
const MassageShop = require('../models/MassageShop');
const MassageService = require('../models/MassageService');
const OpenAI = require('openai');

// @desc    Get massage recommendation from symptoms (RAG approach)
// @route   POST /api/v1/chatbot/recommend
// @access  Public
exports.getRecommendation = async (req, res, next) => {
    try {
        const { symptoms } = req.body;
        
        if (!symptoms) {
            return res.status(400).json({
                success: false,
                message: 'Please provide symptoms'
            });
        }

        // Step 1: Retrieve relevant data from database (RAG)
        const [knowledgeEntries, allServices, allShops] = await Promise.all([
            ChatbotKnowledge.find({ isActive: true }),
            MassageService.find().populate('shop'),
            MassageShop.find()
        ]);

        // Find matching knowledge entry
        const matchedEntry = knowledgeEntries.find(entry => {
            return entry.symptomKeywords.some(keyword => 
                symptoms.toLowerCase().includes(keyword.toLowerCase())
            );
        });

        // Step 2: Build context for AI (RAG - Retrieval Augmented Generation)
        const context = {
            knowledge: matchedEntry ? {
                symptoms: matchedEntry.symptomKeywords,
                massageTypes: matchedEntry.massageTypes,
                areas: matchedEntry.areas,
                duration: matchedEntry.duration,
                notes: matchedEntry.responseTemplate
            } : null,
            availableServices: allServices.map(s => ({
                name: s.name,
                area: s.area,
                duration: s.duration,
                price: s.price,
                oil: s.oil,
                shop: s.shop?.name
            })),
            availableShops: allShops.map(s => ({
                name: s.name,
                rating: s.rating,
                priceRange: `${s.priceRangeMin}-${s.priceRangeMax}`,
                location: s.location
            }))
        };

        // Step 3: Use OpenAI with retrieved context (NO TRAINING NEEDED)
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        
        const systemPrompt = `You are a massage recommendation assistant for Dungeon Inn.

AVAILABLE SERVICES FROM DATABASE:
${JSON.stringify(context.availableServices.slice(0, 10), null, 2)}

AVAILABLE SHOPS:
${JSON.stringify(context.availableShops.slice(0, 5), null, 2)}

${context.knowledge ? `RELEVANT KNOWLEDGE: ${JSON.stringify(context.knowledge)}` : ''}

Based on the user's symptoms and ONLY the services/shops above, recommend:
1. Best massage type(s) from available services
2. Suggested duration (must match available options)
3. Target areas
4. Specific shops that offer these services

Respond in JSON format:
{
  "massageTypes": ["string"],
  "areas": ["string"],
  "duration": { "min": number, "max": number },
  "message": "friendly recommendation message",
  "suggestedShopIds": ["shop_id_strings"]
}`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `My symptoms: ${symptoms}` }
            ],
            temperature: 0.7,
            max_tokens: 500
        });

        const aiResponse = JSON.parse(completion.choices[0].message.content);

        // Step 4: Validate and enrich with real shop data
        const suggestedShops = allShops.filter(shop => 
            aiResponse.suggestedShopIds?.includes(shop._id.toString())
        ).slice(0, 3); // Limit to top 3

        res.status(200).json({
            success: true,
            data: {
                recommendation: {
                    massageTypes: aiResponse.massageTypes,
                    areas: aiResponse.areas,
                    duration: aiResponse.duration,
                    message: aiResponse.message,
                    source: matchedEntry ? 'knowledge_base + ai' : 'ai_only'
                },
                suggestedShops: suggestedShops.map(shop => ({
                    id: shop._id,
                    name: shop.name,
                    address: shop.address,
                    rating: shop.rating,
                    priceRange: `${shop.priceRangeMin}-${shop.priceRangeMax}`,
                    openTime: shop.openTime,
                    closeTime: shop.closeTime,
                    map: shop.map
                })),
                relatedServices: allServices
                    .filter(s => aiResponse.areas.includes(s.area))
                    .slice(0, 5)
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all knowledge base entries
// @route   GET /api/v1/admin/chatbot/knowledge
// @access  Private/Admin
exports.getKnowledgeBase = async (req, res, next) => {
    try {
        const entries = await ChatbotKnowledge.find().sort({ priority: -1 });
        res.status(200).json({
            success: true,
            count: entries.length,
            data: entries
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Add knowledge base entry
// @route   POST /api/v1/admin/chatbot/knowledge
// @access  Private/Admin
exports.addKnowledgeEntry = async (req, res, next) => {
    try {
        const entry = await ChatbotKnowledge.create(req.body);
        res.status(201).json({
            success: true,
            data: entry
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update knowledge base entry
// @route   PUT /api/v1/admin/chatbot/knowledge/:id
// @access  Private/Admin
exports.updateKnowledgeEntry = async (req, res, next) => {
    try {
        req.body.updatedAt = Date.now();
        const entry = await ChatbotKnowledge.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'Knowledge entry not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: entry
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete knowledge base entry
// @route   DELETE /api/v1/admin/chatbot/knowledge/:id
// @access  Private/Admin
exports.deleteKnowledgeEntry = async (req, res, next) => {
    try {
        const entry = await ChatbotKnowledge.findByIdAndDelete(req.params.id);
        
        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'Knowledge entry not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Test chatbot query
// @route   POST /api/v1/admin/chatbot/test
// @access  Private/Admin
exports.testChatbot = async (req, res, next) => {
    try {
        const { symptoms } = req.body;
        
        // Same logic as getRecommendation but for testing
        const knowledgeEntries = await ChatbotKnowledge.find({ isActive: true });
        
        const matchedEntry = knowledgeEntries.find(entry => {
            return entry.symptomKeywords.some(keyword => 
                symptoms.toLowerCase().includes(keyword.toLowerCase())
            );
        });

        res.status(200).json({
            success: true,
            data: {
                matched: !!matchedEntry,
                entry: matchedEntry || null,
                fallbackToAI: !matchedEntry
            }
        });
    } catch (err) {
        next(err);
    }
};
```

#### 3. Routes: `routes/chatbot.js`
```javascript
const express = require('express');
const {
    getRecommendation,
    getKnowledgeBase,
    addKnowledgeEntry,
    updateKnowledgeEntry,
    deleteKnowledgeEntry,
    testChatbot
} = require('../controllers/chatbot');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public route
router.post('/recommend', getRecommendation);

// Admin routes
router.get('/admin/knowledge', protect, authorize('admin'), getKnowledgeBase);
router.post('/admin/knowledge', protect, authorize('admin'), addKnowledgeEntry);
router.put('/admin/knowledge/:id', protect, authorize('admin'), updateKnowledgeEntry);
router.delete('/admin/knowledge/:id', protect, authorize('admin'), deleteKnowledgeEntry);
router.post('/admin/test', protect, authorize('admin'), testChatbot);

module.exports = router;
```

#### 4. Update `server.js`
```javascript
// Add to imports
const chatbot = require('./routes/chatbot');

// Add to router mounting (before other routes)
app.use('/api/v1/chatbot', chatbot);
```

### Environment Variables (`.env`)
```
OPENAI_API_KEY=your_openai_api_key_here
```

### Install Dependencies
```bash
cd ~/Documents/Frontend/Final/be-project-68-bitkrub
npm install openai
```

---

## API Endpoints Summary

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/v1/chatbot/recommend` | Get massage recommendation | Public |
| GET | `/api/v1/admin/chatbot/knowledge` | List knowledge base | Admin |
| POST | `/api/v1/admin/chatbot/knowledge` | Add knowledge entry | Admin |
| PUT | `/api/v1/admin/chatbot/knowledge/:id` | Update entry | Admin |
| DELETE | `/api/v1/admin/chatbot/knowledge/:id` | Delete entry | Admin |
| POST | `/api/v1/admin/chatbot/test` | Test chatbot query | Admin |

---

## Open Questions

1. **AI Provider**: OpenAI, Anthropic, or self-hosted model?
2. **Language**: Thai, English, or both?
3. **Real-time**: WebSocket for streaming responses or HTTP polling?
4. **History**: Store conversation history per user?
5. **Fallback**: What happens when AI can't help?

---

## Estimated Effort

| User Story | Story Points | Estimated Hours |
|------------|--------------|-----------------|
| US2-1 | 8 | 16-20 hours |
| US2-2 | 5 | 10-12 hours |
| US2-3 | 5 | 10-12 hours |
| US2-4 | 3 | 6-8 hours |
| **Total** | **21** | **42-52 hours** |

---

## Project Structure Reference

### Frontend
```
~/Documents/Frontend/Final/fe-project-68-addressme-folk/
├── src/
│   ├── app/
│   │   ├── (shop)/
│   │   ├── admin/
│   │   │   └── chatbot/          # NEW: Admin chatbot pages
│   │   ├── booking/
│   │   ├── mybookings/
│   │   └── page.tsx
│   ├── components/
│   │   ├── chatbot/              # NEW: Chatbot components
│   │   └── TopMenu.tsx
│   ├── libs/
│   │   └── chatbot.ts            # NEW: Chatbot API
│   ├── redux/
│   │   └── features/
│   │       └── chatbotSlice.ts   # NEW: Chatbot state
│   └── interface.ts
```

### Backend
```
~/Documents/Frontend/Final/be-project-68-bitkrub/
├── controllers/
│   ├── auth.js
│   ├── chatbot.js               # NEW: Chatbot controller
│   ├── reservations.js
│   ├── services.js
│   └── shops.js
├── models/
│   ├── ChatbotKnowledge.js      # NEW: Knowledge base model
│   ├── MassageService.js
│   ├── MassageShop.js
│   ├── Reservation.js
│   └── User.js
├── routes/
│   ├── auth.js
│   ├── chatbot.js               # NEW: Chatbot routes
│   ├── reservations.js
│   ├── services.js
│   └── shops.js
├── middleware/
│   └── auth.js
├── config/
│   └── db.js
└── server.js
```

---

*Document created for Dungeon Inn project - Epic 2: AI Chatbot Massage Recommendation*
