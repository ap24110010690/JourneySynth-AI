# JourneySynth AI – Synthetic Omnichannel Customer Journey Generator

> **"Generate Realistic Customer Journeys. Test Smarter."**

JourneySynth AI is an enterprise-grade AI-powered synthetic customer journey generator designed for retail and e-commerce companies, ML engineering teams, and conversion analysts.

When deploying new retail platforms, e-commerce storefronts, and omnichannel mobile applications, engineering teams frequently lack sufficient real-world interaction histories to train and evaluate personalization models, recommendation engines, and cart abandonment predictors. Real customer journey data is expensive, fragmented across disconnected systems, and subject to strict privacy regulations (GDPR/CCPA).

JourneySynth AI eliminates this friction by simulating connected, realistic omnichannel customer journeys governed by stateful **Markov Chain probability models**, grounding-truth product catalogs, and **Google Gemini AI** behavioural analysis.

---

## Key Features

1. **State-Based Markov Chain Simulation Engine**:
   - Probabilistic transitions across 13 core customer journey states (`START`, `AD_IMPRESSION`, `AD_CLICK`, `WEBSITE_VISIT`, `APP_VISIT`, `PRODUCT_VIEW`, `EMAIL_RECEIVED`, `EMAIL_CLICK`, `CART_ADD`, `CART_REMOVE`, `PURCHASE`, `CHURN`, `END`).
   - Grounded behavioral rules: purchases are strictly preceded by cart additions; email clicks require prior email delivery; multi-day revisit cadence.
   - Deterministic reproducibility using configurable random seeds.

2. **Omnichannel Touchpoint Coverage**:
   - Website Storefront
   - Mobile Application
   - Email Marketing & Cart Recovery
   - Paid Digital Advertisements

3. **Multi-Category Retail Catalog**:
   - Electronics, Fashion, Groceries, Beauty, Home Appliances, Sports, and Books with consistent product IDs and prices.

4. **Target Customer Segments**:
   - New Customers, Returning Customers, High-Intent Buyers, Browsing Shoppers, Discount Seekers, and Cart Abandoners.

5. **Google Gemini AI Integration**:
   - **Feature A (Behavioural Analysis)**: Qualitative drop-off audit and recommendation optimizations grounded in dataset metrics.
   - **Feature B (Customer Persona Synthesis)**: Qualitative psychological shopper personas synthesized from raw interaction sequences.
   - **Feature C (Drop-off Q&A)**: Grounded conversational query console answering specific conversion questions.
   - Automatic graceful fallback to deterministic statistical analysis when external API keys are unavailable.

6. **Interactive Visual Journey Explorer**:
   - Filterable high-density event log.
   - Visual day-by-day chronological timeline for every individual customer.

7. **Omnichannel Analytics & Funnels**:
   - Conversion funnels, drop-off step retention, channel distribution, session duration analysis, and category revenue performance.

8. **Dataset Management & Export**:
   - Download complete event datasets as **CSV** or **JSON**.

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React, Recharts, React Router v7, Axios.
- **Backend**: Node.js, Express.js, TypeScript, REST API architecture.
- **Database**: Relational SQLite / MySQL relational architecture with complete `backend/schema.sql`.
- **AI**: Official `@google/genai` TypeScript SDK with `gemini-3.8-flash`.
- **Security**: bcrypt password hashing, JSON Web Tokens (JWT), input validation, parameterized queries.

---

## Folder Structure

```
├── backend/
│   ├── schema.sql                 # Complete MySQL relational DDL schema
│   └── src/
│       ├── config/
│       │   ├── db.ts              # Database connection & product catalog seed
│       │   └── env.ts             # Environment variable validation
│       ├── controllers/
│       │   ├── authController.ts
│       │   ├── datasetController.ts
│       │   ├── journeyController.ts
│       │   ├── analyticsController.ts
│       │   └── aiController.ts
│       ├── middleware/
│       │   ├── authMiddleware.ts   # JWT verification
│       │   └── errorMiddleware.ts  # Centralized error handler
│       ├── models/
│       │   ├── userModel.ts
│       │   ├── datasetModel.ts
│       │   ├── customerModel.ts
│       │   ├── sessionModel.ts
│       │   └── eventModel.ts
│       ├── routes/
│       │   ├── authRoutes.ts
│       │   ├── datasetRoutes.ts
│       │   ├── journeyRoutes.ts
│       │   ├── analyticsRoutes.ts
│       │   ├── aiRoutes.ts
│       │   └── exportRoutes.ts
│       ├── services/
│       │   ├── markovEngine.ts    # Probabilistic Markov Chain simulation
│       │   ├── geminiService.ts   # Google GenAI integration
│       │   ├── analyticsService.ts # Funnel & metric calculations
│       │   ├── exportService.ts   # CSV / JSON generator
│       │   └── productService.ts  # Catalog query service
│       ├── tests/
│       │   └── markovEngine.test.ts # Unit test validation suite
│       ├── types/
│       └── utils/
├── src/
│   ├── assets/images/             # Generated UI assets
│   ├── components/                # Reusable UI components & charts
│   ├── context/                   # AuthContext with session persistence
│   ├── pages/                     # Full-stack page views
│   ├── services/                  # Axios API clients
│   ├── types/
│   ├── App.tsx                    # Router configuration
│   ├── main.tsx
│   └── index.css
├── server.ts                      # Full-stack server entry point
├── package.json
└── README.md
```

---

## Installation & Running Instructions

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn

### 1. Environment Variable Setup
Copy `.env.example` to `.env`:

```bash
# Linux / macOS / Bash
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

Set your configuration:
```env
PORT=3000
JWT_SECRET="your_secure_jwt_secret"
GEMINI_API_KEY="your_gemini_api_key"
```

### 2. How to Obtain a Google Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/).
2. Sign in with your Google account.
3. Click **"Get API key"** and create a key for your project.
4. Paste the key as `GEMINI_API_KEY` in your environment.

*(Note: If you do not provide a Gemini API key, JourneySynth AI will automatically use its built-in rule-based statistical analysis engine for reports and personas).*

### 3. Installing Dependencies
```bash
# Terminal (Linux/macOS or Windows PowerShell)
npm install
```

### 4. Running Backend Tests
Verify the Markov Chain rules and simulation invariants:
```bash
# Run unit tests
npx tsx backend/src/tests/markovEngine.test.ts
```

### 5. Starting the Application
JourneySynth AI runs in full-stack mode mounting Vite alongside Express:

```bash
# Start development server on http://localhost:3000
npm run dev
```

For production builds:
```bash
npm run build
npm start
```

---

## Optional: MySQL Database Setup

JourneySynth AI runs out-of-the-box using embedded relational storage with full ACID transactions. To deploy with a standalone MySQL 8 server:

1. Install MySQL:
   - **Windows**: Download MySQL Installer from [dev.mysql.com](https://dev.mysql.com/downloads/installer/).
   - **Ubuntu/Debian**: `sudo apt update && sudo apt install mysql-server`
   - **macOS**: `brew install mysql`

2. Create database and apply the schema:
```sql
CREATE DATABASE journeysynth CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE journeysynth;
SOURCE backend/schema.sql;
```

---

## REST API Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Authenticate user & get JWT | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes |
| `POST` | `/api/datasets/generate` | Generate synthetic customer journey dataset | Yes |
| `GET` | `/api/datasets` | List all datasets for current user | Yes |
| `GET` | `/api/datasets/:id` | Fetch specific dataset details | Yes |
| `DELETE` | `/api/datasets/:id` | Cascade delete dataset | Yes |
| `GET` | `/api/dashboard/stats` | Aggregate dashboard summary metrics | Yes |
| `GET` | `/api/journeys` | Filterable event stream | Yes |
| `GET` | `/api/journeys/:customerId/timeline` | Customer visual timeline data | Yes |
| `GET` | `/api/analytics/:datasetId` | Comprehensive funnel & dropoff analytics | Yes |
| `POST` | `/api/ai/analyze/:datasetId` | Gemini AI behavioural analysis report | Yes |
| `POST` | `/api/ai/persona/:customerId` | Gemini AI customer persona synthesis | Yes |
| `POST` | `/api/ai/question/:datasetId` | Gemini AI grounded drop-off Q&A | Yes |
| `GET` | `/api/export/:datasetId/csv` | Download dataset as CSV | Yes |
| `GET` | `/api/export/:datasetId/json` | Download dataset as JSON | Yes |
