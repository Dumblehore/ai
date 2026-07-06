# AetherCAT — Premium AI-Powered CAT Mentor App

AetherCAT is a production-ready, full-stack Next.js web application designed to act as an intelligent adaptive mentor for the Indian Common Admission Test (CAT) preparation.

Unlike traditional mock-test platforms, AetherCAT dynamically audits student performance, classifies careless calculation vs. conceptual mistakes, schedules spaced repetition retrieval decks, and provides a 24/7 personalized tutoring coach powered by the Google Gemini API.

---

## 🛠️ Technology Stack

1. **Frontend UI**: Next.js App Router (v16), React, TypeScript, Tailwind CSS v4, and Framer Motion.
2. **Data Visualizations**: Recharts (fully mounted client-side Area, Line, Bar, Radar, and Pie charts).
3. **Database & ORM**: SQLite (via Prisma ORM) for local dev file execution; easily switchable to PostgreSQL.
4. **Authentication**: Secure cookie-based session management using JSON Web Tokens (JWT) and hashed database credentials (`bcryptjs`).
5. **AI Tutor Integration**: Official Google Gemini SDK (`@google/generative-ai`) mapping user statistics (accuracy, mocks, weak topics) directly into LLM prompts.

---

## 🚀 Setup & Installation

Follow these steps to run the full-stack application locally on your machine:

### 1. Environment Configurations
Create a `.env.local` file in the project root directory and add the following keys:
```env
# Database file location
DATABASE_URL="file:./prisma/dev.db"

# JWT Cookie secret key
JWT_SECRET="aethercat_secure_secret_token_key_123"

# Optional: Add your Google Gemini API Key to enable the live AI tutor
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"
```
*(Note: If `GEMINI_API_KEY` is omitted, the app will gracefully fall back to our advanced local heuristic advice engine, so features never crash).*

### 2. Setup the Prisma Database Schema
Generate the Prisma Client and build the SQLite database tables:
```bash
# Generate the database tables
npx prisma db push
```

### 3. Seed Default Questions & Profiles
Seed the SQLite database with the preset student profile (`yash@example.com` / `password123`), initial targets, revision flashcards, and high-quality CAT questions bank across VARC, DILR, and Quant sections:
```bash
# Run database seed script
npx prisma db seed
```

### 4. Run the Developer Server
Boot up the Next.js local server:
```bash
npm run dev
```
Open your browser and navigate to **[http://localhost:3000](http://localhost:3000)**.

---

## 📂 Architecture Overview

- **`/src/context/AppContext.tsx`**: React context coordinator. Feeds pages with authenticated state trees, handles cookie token logic, and connects frontend controls directly to API endpoints.
- **`/prisma/schema.prisma`**: Relational models for `User`, `TestAttempt`, `QuestionAnswer` logs, `Goal`, `Flashcard`, `SpacedCard` (spaced repetition), and `ChatMessage`.
- **`/src/app/api/auth`**: User registration, credential verification login, and logout cookie clear endpoints.
- **`/src/app/api/coach`**: AI mentor coach connector reading database mock metrics and querying the `gemini-1.5-flash` model.
- **`/src/app/api/test`**: Processes mock test submissions, maps score percentages to historical CAT score-to-percentile curves, and spawns Spaced repetition items for incorrect answers.
- **`/src/app/test-session`**: authentic full-screen TCS iON CAT exam simulator layout, featuring a draggable scientific calculator, question palettes, locks, and post-test mistake surveys.
