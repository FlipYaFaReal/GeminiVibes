# LifePulse — Personal Life Command Center

## Overview

LifePulse is an AI-native personal command center where you interact primarily through natural conversation. You tell it what's going on, it organizes everything, and it proactively nudges you when things need attention or when important areas of your life are being neglected.

## Problem

Busy professionals juggling multiple life domains (work, family, home, relationships, faith, health) suffer from cognitive overload. Existing tools fail because they:

- Are not proactive — they store things but don't think for you
- Force rigid categories that don't match how people actually think in streams and contexts
- Fragment attention across many disconnected apps
- Require ongoing manual maintenance to stay current

## Core Concept

**AI personality:** LifePulse acts like a thoughtful chief of staff for your life. It knows your priorities, remembers context, and speaks up when it matters. It doesn't just track tasks — it understands themes and seasons of your life.

**Stream-based thinking:** You never manually assign categories. You just talk, and the AI figures out where things belong. Life domains are lenses for viewing your life, not boxes you sort into.

## Life Domains

Auto-detected by AI, not manually maintained:

| Domain | What it tracks | Example nudges |
|--------|---------------|----------------|
| **Family** | Kids' schedules, school events, co-parenting logistics, family time | "Emma's recital is Thursday — you haven't RSVPd yet" |
| **Work** | Meetings, projects, goals, strategic themes | "You've been in reactive mode all week — your Q2 initiative hasn't gotten attention since Monday" |
| **Home** | Home sale progress, maintenance, errands | "Inspection report deadline is in 2 days" |
| **Relationships** | Partner time, friendships, social plans | "You haven't had a date night in 3 weeks — want me to suggest some openings?" |
| **Faith** | Church, prayer/devotion time, spiritual reading, community | "You blocked Sunday morning for church but it got overwritten — want me to protect that?" |
| **Health** | Meals, exercise, appointments, sleep patterns | "You've skipped meal planning 2 weeks in a row — want to do a quick plan for this week?" |
| **Growth** | Vacations, personal goals, life direction | "It's been a month since you reflected on your goals — quarterly review is coming up" |

## Interaction Design

### A. Capture (user -> LifePulse)

Primary input is a text field at the bottom of the screen (chat-style). Natural language input:

- "Soccer practice moved to 5pm Thursday"
- "Need to call mortgage broker about the rate lock"
- "Feeling like I should get back to morning devotionals"
- "Dinner idea: crockpot chili, feeds 6, make Wednesday"

The AI responds with confirmation showing what it understood and actions taken, plus proactive context:

> Got it — moved Emma's soccer to Thursday 5pm, updated your calendar. Heads up: that overlaps with your 4:30 standup by 30 min. Want me to shift the standup?

### B. Nudges (LifePulse -> user)

Push notifications + in-app messages. Three types:

- **Time-sensitive:** "Realtor is calling in 15 min — here's context from your last conversation"
- **Drift alerts:** "Your faith domain has had zero activity in 2 weeks — want to block time for church Sunday?"
- **Opportunity:** "You have a free evening Thursday and mentioned wanting a date night — good chance?"

Nudge frequency is AI-calibrated — learns what you act on and dials back noise.

### C. Dashboard Views (at-a-glance)

Auto-generated, not manually maintained. Swipeable views:

- **Today:** Timeline of what's ahead + priority items needing attention
- **Radar:** All life domains at a glance — healthy (green), drifting (yellow), neglected (red)
- **Domain drilldown:** Tap any domain to see its stream of items, upcoming events, and patterns

## Architecture

### Tech Stack

- **Frontend:** Expo (React Native) — one TypeScript codebase for iOS, Android, and web
- **Backend:** Node.js API (Express or Fastify)
- **AI:** Claude API — powers parsing, categorization, nudge generation, and conversation
- **Database:** PostgreSQL + pgvector for semantic search across life items
- **Auth:** OAuth 2.0 (Google + Microsoft sign-in, secures API integrations)
- **Notifications:** expo-notifications (native push on mobile), web push for desktop
- **Integrations:** Google Calendar/Gmail API, Microsoft Graph API (Calendar, Mail)

### Why Expo

- One TypeScript codebase targets iOS, Android, and web
- Native push notifications on mobile (critical for nudges)
- Access to full npm ecosystem for Claude SDK, Google, and Microsoft API clients
- Expo Router for file-based routing across all platforms
- Managed workflow minimizes DevOps overhead

### High-Level System Design

```
[Mobile App / Web App (Expo)]
        |
        v
[API Server (Node.js)]
   |         |         |
   v         v         v
[Claude   [PostgreSQL  [Integration
 API]     + pgvector]   Services]
                          |
                    [Google APIs]
                    [Microsoft Graph]
```

### Data Model (conceptual)

- **LifeItem:** Core entity — anything captured. Has content, AI-assigned domain, timestamps, embeddings, linked calendar events, status.
- **Domain:** Enum with health score computed from recency/frequency of activity.
- **Nudge:** Generated by AI based on life items, calendar data, and domain health. Has type, priority, delivery status.
- **Conversation:** Thread of messages between user and AI, with linked life items.
- **Integration:** Connected external accounts (Google, Microsoft) with sync state.

## MVP Scope

### Included

1. Conversational capture — type naturally, AI parses and stores
2. Today view — auto-generated daily agenda from captured items + calendar
3. Life domain radar — simple health indicators per domain
4. Push notifications — basic nudges for time-sensitive items and drift alerts
5. Google Calendar integration — two-way sync
6. Faith, Family, Work domains active (others stubbed)

### Excluded from MVP

- Voice input
- Microsoft integration (phase 2)
- Meal planning specifics
- Financial tracking
- Shared/family accounts
- Advanced pattern recognition
- Habit tracking

## Target User

Busy professional and parent managing multiple life domains who thinks in streams and contexts, wants AI to handle organization, and needs proactive nudges to keep important-but-not-urgent areas (faith, relationships, personal growth) from being crowded out by urgent demands.

## Success Metrics

- Daily active usage (captures per day)
- Nudge action rate (% of nudges acted on)
- Domain coverage (are all domains getting attention over time?)
- User-reported stress reduction (qualitative)
