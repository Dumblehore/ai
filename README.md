# AetherCAT — Premium AI-Powered CAT Mentor App

AetherCAT is a production-ready, full-stack Next.js web application designed to act as an intelligent adaptive mentor for the Indian Common Admission Test (CAT) preparation.

Unlike traditional mock-test platforms, AetherCAT dynamically audits student performance, classifies careless calculation vs. conceptual mistakes, schedules spaced repetition retrieval decks, and provides a 24/7 personalized tutoring coach powered by the Google Gemini API.

---

##  Technology Stack

1. **Frontend UI**: Next.js App Router (v16), React, TypeScript, Tailwind CSS v4, and Framer Motion.
2. **Data Visualizations**: Recharts (fully mounted client-side Area, Line, Bar, Radar, and Pie charts).
3. **Database & ORM**: SQLite (via Prisma ORM) for local dev file execution; easily switchable to PostgreSQL.
4. **Authentication**: Secure cookie-based session management using JSON Web Tokens (JWT) and hashed database credentials (`bcryptjs`).
5. **AI Tutor Integration**: Official Google Gemini SDK (`@google/generative-ai`) mapping user statistics (accuracy, mocks, weak topics) directly into LLM prompts.

---


## Architecture Overview

- **`/src/context/AppContext.tsx`**: React context coordinator. Feeds pages with authenticated state trees, handles cookie token logic, and connects frontend controls directly to API endpoints.
- **`/prisma/schema.prisma`**: Relational models for `User`, `TestAttempt`, `QuestionAnswer` logs, `Goal`, `Flashcard`, `SpacedCard` (spaced repetition), and `ChatMessage`.
- **`/src/app/api/auth`**: User registration, credential verification login, and logout cookie clear endpoints.
- **`/src/app/api/coach`**: AI mentor coach connector reading database mock metrics and querying the `gemini-1.5-flash` model.
- **`/src/app/api/test`**: Processes mock test submissions, maps score percentages to historical CAT score-to-percentile curves, and spawns Spaced repetition items for incorrect answers.
- **`/src/app/test-session`**: authentic full-screen TCS iON CAT exam simulator layout, featuring a draggable scientific calculator, question palettes, locks, and post-test mistake surveys.
