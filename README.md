# Wayfarer — AI Trip Planner

A multi-user web app that generates a complete day-by-day travel itinerary,
budget estimate, hotel shortlist, and packing list using an LLM agent, and
lets users edit the plan afterwards.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| Database | MongoDB + Mongoose |
| Auth | JWT in an httpOnly cookie |
| AI agent | Google Gemini API (`@google/genai`) |

This matches the assessment's preferred stack, with one substitution: the AI
agent uses **Google Gemini** instead of a paid LLM provider, specifically to
take advantage of Gemini's genuine free tier (no billing setup required) for
this assessment. The agent layer (`llmService.ts`) is isolated behind a
small set of functions with plain JSON in/out, so swapping providers again
later (e.g. to Anthropic's Claude) would only mean rewriting that one file.

## Project structure

```
trip-planner/
├── backend/
│   └── src/
│       ├── config/        # DB connection
│       ├── models/        # Mongoose schemas (User, Trip)
│       ├── middleware/     # JWT auth guard, centralized error handler
│       ├── controllers/    # Route handlers
│       ├── routes/         # Express routers
│       ├── services/       # llmService.ts — all Gemini API calls live here
│       └── index.ts        # App entry point
└── frontend/
    ├── app/                # Next.js App Router pages
    ├── components/         # TripForm, ItineraryDay, BudgetCard, HotelList, PackingList...
    ├── context/AuthContext.tsx
    └── lib/api.ts           # Axios client + shared types
```

## Setup — local development

**Prerequisites:** Node.js 18+, a MongoDB instance (local or Atlas), a Google
Gemini API key (free at https://aistudio.google.com/apikey).

### Backend

```bash
cd backend
cp .env.example .env      # fill in MONGO_URI, JWT_SECRET, GEMINI_API_KEY
npm install
npm run dev                # starts on http://localhost:5000
```

### Frontend

```bash
cd frontend
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm install
npm run dev                         # starts on http://localhost:3000
```

Open `http://localhost:3000`, register an account, and plan a trip.

## Setup — deployed

- **Backend**: deploy to Render/Railway/Fly.io (or similar). Set the same env
  vars as `.env.example` in the platform's dashboard — never commit `.env`.
  Set `CLIENT_ORIGIN` to the deployed frontend URL so CORS + cookies work.
- **Frontend**: deploy to Vercel. Set `NEXT_PUBLIC_API_URL` to the deployed
  backend's `/api` URL in the project's environment variables.
- Because auth uses an httpOnly cookie sent cross-origin, both the frontend
  and backend should be served over HTTPS in production so `secure: true`
  cookies are actually sent by the browser.

> *(Fill in the actual deployment link here before submitting.)*

## Architecture

Standard three-tier separation:

1. **Frontend (Next.js)** — all pages are client components that call the
   backend through `lib/api.ts` (an Axios instance with `withCredentials: true`
   so the auth cookie rides along). `AuthContext` holds the current user in
   memory and gates protected pages via `ProtectedRoute`.
2. **Backend (Express)** — a conventional routes → controllers → services
   layering. Controllers own request validation (via `zod`) and orchestration;
   `llmService.ts` is the only file that talks to Gemini, so prompt/schema
   changes never touch controller code.
3. **Database (MongoDB)** — two collections, `User` and `Trip`. Every `Trip`
   document stores a `user` reference; there is no global trip listing —
   every query is scoped by the authenticated user's id (see below).

## Authentication & authorization

- Passwords are hashed with `bcryptjs` before being stored; the hash is
  excluded from queries by default (`select: false`) and only pulled in
  explicitly during login.
- On login/register, the server signs a JWT and sets it as an **httpOnly,
  sameSite=lax** cookie, so it isn't reachable from JS (mitigates XSS token
  theft) and isn't sent on cross-site requests (mitigates CSRF for state
  changing GETs). A bearer-token fallback is also supported for
  non-browser clients.
- The `protect` middleware verifies the JWT on every request to a protected
  route and attaches `req.userId`. All trip routes run through `protect` via
  `router.use(protect)`.
- **Data isolation**: every trip lookup in `tripController.ts` goes through
  `findOwnedTrip(tripId, userId)`, which queries `{ _id: tripId, user: userId }`
  — not `{ _id: tripId }` followed by an ownership check. A trip ID that
  belongs to someone else simply doesn't resolve; the API returns 404, not
  403, so it never confirms that a given trip ID exists for another user.

## AI agent design

All LLM calls live in `backend/src/services/llmService.ts` and share one
pattern: a strict "JSON only, no prose" system prompt plus a small
`parseJsonResponse` helper that strips stray markdown fences and throws a
clean `502 AppError` if the model's output doesn't parse — so a bad LLM
response degrades to a normal API error instead of crashing the request.

Four agent calls, run **concurrently** with `Promise.all` when a trip is
created (itinerary, budget, hotels, packing list don't depend on each other,
so there's no reason to pay for them sequentially):

- `generateItinerary` — day-by-day activities from destination/days/budget/interests.
- `estimateBudget` — flights/accommodation/food/activities breakdown that sums to a total.
- `suggestHotels` — one Budget/Mid/Luxury pick each.
- `generatePackingList` — see Creative Feature below.

A fifth call, `regenerateDay`, is used for the "editable itinerary" feature:
it's given the full trip context plus the user's free-text instruction (e.g.
*"more outdoor activities"*) and returns just the replacement day, which is
spliced back into the stored itinerary by day number.

## Creative feature: Smart Packing List

**What it is:** alongside the itinerary, the agent also produces a packing
list tailored to the destination's likely climate, the trip length, and the
traveler's chosen interests (hiking boots for Adventure, an extra outfit for
Nightlife, plug/voltage notes where relevant).

**Why this one:** the brief's other AI features (itinerary, budget, hotels)
are all "what to do / what it costs." Packing is the one part of trip prep
users actually forget and that benefits from destination-specific reasoning
an LLM is well-suited to (an April trip to Reykjavik and an April trip to
Bangkok need almost nothing in common on a packing list). It's also cheap:
it reuses the exact same trip brief and JSON-response pattern as the other
three agent calls, so it doesn't add a new class of complexity to the
codebase — just one more prompt and one more schema.

## Key design decisions & trade-offs

- **Denormalized itinerary/budget/hotels/packing list on the `Trip` document**
  rather than separate collections. Trips are read as a whole far more often
  than any sub-piece is queried independently, so embedding avoids joins at
  the cost of slightly bigger documents — a reasonable trade at this scale.
- **404 over 403 for unauthorized trip access.** Slightly less "informative"
  to a legitimate mistaken request, but it means the API never leaks whether
  a given trip ID exists at all, which is the safer default for user data.
- **JSON-mode prompting instead of a structured tool-use/tool-call
  API** for simplicity in this scope; the trade-off is that malformed model
  output is caught by a parser rather than guaranteed by the API contract.
  In a larger system I'd move these to tool-use for stronger guarantees.
- **Cookie-based auth over localStorage tokens** to reduce XSS blast radius,
  at the cost of needing CORS + cookie configuration to be exactly right
  across frontend/backend origins in production.

## Known limitations

- No automated test suite is included in this scaffold; given more time,
  `llmService` would be the highest-value target (mock the Gemini client,
  assert prompt/parsing behavior) followed by the auth middleware.
- No rate limiting on trip creation — a user could hit "generate" repeatedly
  and rack up API costs; a simple per-user cooldown or usage cap would be a
  natural next step.
- No password reset / email verification flow.
- The regenerate-day feature replaces one day per call; there's no
  "regenerate whole trip" or itinerary versioning/undo yet.
