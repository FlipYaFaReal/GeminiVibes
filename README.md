# LifePulse

AI-native personal life command center. Conversational capture, proactive nudges, and auto-generated dashboard views across 7 life domains.

## Tech Stack

- **Frontend:** Expo (React Native) — iOS, Android, Web
- **Backend:** Fastify + tRPC
- **AI:** Claude API (Anthropic)
- **Database:** PostgreSQL + Drizzle ORM
- **Auth:** Google OAuth + JWT

## Prerequisites

- Node.js 20+
- Docker Desktop (for PostgreSQL)
- Anthropic API key
- Google Cloud project with OAuth 2.0 credentials

## Setup

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```

2. Start PostgreSQL via Docker Compose:
   ```bash
   docker compose up -d
   ```
   This starts a PostgreSQL 15 container on **port 5433** (to avoid conflicts with any local PostgreSQL on 5432). To stop it later:
   ```bash
   docker compose down        # stop containers (data persists)
   docker compose down -v     # stop containers and delete data
   ```

3. Configure environment variables:
   ```bash
   cp packages/api/.env.example packages/api/.env
   cp apps/mobile/.env.example apps/mobile/.env
   # Edit both files with your actual values
   ```

4. Run database migrations:
   ```bash
   cd packages/api
   npm run db:generate
   npm run db:migrate
   ```

5. Start the development servers:
   ```bash
   # Terminal 1: API server
   cd packages/api && npm run dev

   # Terminal 2: Mobile/web app
   cd apps/mobile && npx expo start
   ```

## Project Structure

```
├── apps/mobile/          # Expo app (React Native)
│   ├── app/              # Expo Router screens
│   ├── components/       # Reusable UI components
│   └── lib/              # Utilities and config
├── packages/api/         # Backend API
│   ├── src/
│   │   ├── db/           # Database schema and connection
│   │   ├── routes/       # tRPC route handlers
│   │   ├── services/     # Business logic (AI, auth, tools)
│   │   └── __tests__/    # Test files
│   └── drizzle.config.ts
└── docs/plans/           # Design and implementation docs
```

## Running Tests

```bash
cd packages/api && npm test
```

## Life Domains

LifePulse organizes your life into 7 domains:

- **Family** — Kids, parenting, family logistics
- **Work** — Projects, meetings, career goals
- **Faith** — Church, prayer, spiritual growth
- **Home** — Housing, maintenance, errands
- **Relationships** — Partner, friends, social life
- **Health** — Meals, exercise, medical
- **Growth** — Personal goals, learning, vacations
