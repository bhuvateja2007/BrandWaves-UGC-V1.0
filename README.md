# BrandWaves — UGC Campaign & Orchestration Platform (V1.0)

A modern creator-brand collaboration platform for discovering campaigns, showcasing creator portfolios, and building meaningful brand partnerships.

BrandWaves is a full-stack creator-brand marketplace and campaign orchestration platform designed for authentic User-Generated Content (UGC). It bridges direct-to-consumer (D2C) brands with verified creators, structured deliverables review queues, and AI-assisted matchmaking.

---

## 1. Architecture Overview

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Router v6, Lucide Icons.
- **Backend API:** Node.js, Express, TypeScript (`tsx`), CORS.
- **Database Layer:** Dual-mode architecture:
  - **Local Development / Offline:** In-memory & JSON file persistence (`server/data/db.json`) with browser storage fallbacks.
  - **Production / Staging Cloud:** Supabase PostgreSQL with strict Row Level Security (RLS) policies and security-definer helper functions.
- **AI Engine:**
  - **Live Mode:** Google Gemini 2.5 Flash API (`GEMINI_API_KEY`) with sanitized inputs and strict JSON schema responses.
  - **Resilient Fallback Mode:** Deterministic rules engine with mathematical multi-criteria scoring and domain-grounded brief templates (activated automatically when API keys are absent or offline).

---

## 2. Brand Palette & Visual Identity

The platform strictly maintains the 4-color BrandWaves palette:
- **Background:** `#F9F7F7`
- **Secondary Surfaces / Containers:** `#DBE2EF`
- **Primary Action Blue:** `#3F72AF`
- **Deep Navy Text & Headings:** `#112D4E`

---

## 3. Quick Start & Local Setup

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation
```bash
# Clone the repository and install dependencies
git clone <repo-url>
cd letmecook
npm install
```

### Environment Configuration
Copy the template configuration:
```bash
cp .env.example .env
```
Configure your environment variables as described in the [Environment Variables](#4-environment-variables) section below.

### Running Development Servers
```bash
# Concurrently launches backend API on :3001 and Vite client on :5173
npm run dev
```

The application will be accessible at:
- **Frontend App:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:3001/api](http://localhost:3001/api)
- **API Health Check:** [http://localhost:3001/api/health](http://localhost:3001/api/health)

---

## 4. Environment Variables

All environment variables must be defined in your `.env` file. Never commit real secrets to source control.

| Variable Name | Required | Target | Description |
|---|---|---|---|
| `PORT` | Optional (default: `3001`) | Backend | Server port for the Express API |
| `VITE_API_BASE_URL` | Optional (default: `/api`) | Client | API route prefix proxied by Vite |
| `VITE_SUPABASE_URL` | Optional | Client | Supabase Project URL (`https://<project-id>.supabase.co`) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Optional | Client | Supabase anon/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Backend | Server-only administrative key (never exposed to client) |
| `GEMINI_API_KEY` | Optional | Backend | Google Gemini API key for live AI generation |

*Note: When Supabase or Gemini keys are omitted, the application automatically runs in deterministic local mode with 100% functionality.*

---

## 5. Database Setup & Migrations

If deploying to Supabase, run the SQL migrations located in `supabase/migrations/` in sequential order via the Supabase SQL Editor:

1. `20261010000000_brandwaves_schema_and_rls.sql` — Core schema, users, profiles, campaigns, submissions, and baseline RLS policies.
2. `20261010000001_onboarding_preferences.sql` — User onboarding preferences and persona tracking.
3. `20261010100000_phase2_auth_and_roles.sql` — Role constraints (`customer`, `creator`, `brand_owner`, `admin`) and secure trigger on `auth.users`.
4. `20261010200000_customer_saved_products.sql` — Customer wishlist schema and user-isolated RLS.
5. `20261010300000_creator_portal_schema.sql` — Creator portfolios and campaign applications tables with RLS.
6. `20261010400000_brand_owner_portal_schema.sql` — Brands and products catalog tables with brand-isolated ownership checks.
7. `bootstrap_admin.sql` (Optional) — Utility script to promote a designated registered email to `admin` / `brand_admin`.

### Supabase Auth Dashboard Settings
- **Providers:** Email + Password ONLY (Social and Phone providers disabled).
- **Confirm Email:** Recommended ON for production environments.
- **Site URL:** `https://your-domain.com` (or `http://localhost:5173` for local).
- **Redirect URLs Allowlist:**
  - `http://localhost:5173/auth/callback`
  - `http://localhost:5173/reset-password`
  - `https://your-domain.com/auth/callback`
  - `https://your-domain.com/reset-password`

---

## 6. Testing & Quality Verification

```bash
# Run complete test suite (Phases 1 through 8)
npm test

# Run live End-to-End HTTP test suite (requires dev server running)
npm run test:e2e

# Run TypeScript compilation and production build
npm run build
```

---

## 7. Role-Based Access Control (RBAC) Matrix

| Feature / Route | Public Visitor | Customer (`customer`) | Creator (`creator`) | Brand Owner (`brand_owner`) | Administrator (`admin`) |
|---|:---:|:---:|:---:|:---:|:---:|
| Discovery Marketplace (`/creators`, `/products`, `/brands`, `/campaigns`) | Read-Only | Read-Only | Read-Only | Read-Only | Full Access |
| Customer Hub (`/customer`, `/customer/*`) | Denied | Full Access | Denied | Denied | Denied* |
| Creator Workspace (`/creator`, `/creator/*`) | Denied | Denied | Full Access | Denied | Full Access |
| Campaign Applications (`applyToCampaign`) | Denied | Denied | Full Access | Denied | Full Access |
| Submission Deliverables (`/submit`, `/submissions`) | Denied | Denied | Full Access | Denied | Full Access |
| Brand Workspace (`/brand`, `/brand/*`) | Denied | Denied | Denied | Full Access (Owned Brand) | Full Access |
| AI Creator Matchmaker (`/brand/matchmaker`) | Denied | Denied | Denied | Full Access (Owned Brand) | Full Access |
| AI Campaign Copilot (`/brand/campaigns/new`) | Denied | Denied | Denied | Full Access (Owned Brand) | Full Access |
| Deliverable Review & Approval Queue (`/reviews`) | Denied | Denied | Denied (No Self-Approval) | Full Access (Owned Brand) | Full Access |
| Administrator Portal (`/admin`, `/admin/*`) | Denied | Denied | Denied | Denied | Full Access |

*\*Note: Admins cannot access customer shopping hubs by default (`allowAdminBypass: false`) to guarantee shopper boundary isolation.*

---

## 8. Governance & Security Standards

1. **AI Review Governance:** AI assists human reviewers with evidence and observations; it never executes automatic approvals, rejections, or penalties.
2. **Untrusted Input Protection:** Submissions, URLs, pitches, and prompts are sanitized against prompt injection and malicious markup.
3. **Multi-Tenant Brand Isolation:** Brand owners can only access, modify, and review deliverables for their verified authorized brand.
4. **Creator Isolation:** Creators can only view, edit, resubmit, or withdraw their own deliverables and applications.
5. **No Secret Leaks:** `SUPABASE_SERVICE_ROLE_KEY` and third-party API keys are strictly confined to server-side processes and excluded from client bundles.
