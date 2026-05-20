<!--
  README for the AI Spend Audit project
  Generated: May 20, 2026
-->

# AI Spend Audit 🚀

A clear, modern Next.js app for auditing and tracking AI-related cloud and API spend. Run audits, view historical trends on a polished dashboard, export compact PDF reports, and share findings via email — all secured with Supabase authentication.

**Live demo:** (add link if deployed)

---

## Features ✨

- Run detailed AI spend audits from a simple form
- Save audits to your account and view audit history
- Interactive dashboard with Savings chart and summary cards
- Export compact PDF reports for instant download or email
- User authentication with Supabase (sign up / login)
- Server-side protections for audit pages and admin operations
- Responsive, professional UI built with Tailwind CSS

---

## Tech Stack 🧰

- Frontend: Next.js (pages router) + React
- Styling: Tailwind CSS
- Auth & DB: Supabase (client + service role for server actions)
- Charts: Recharts
- PDF generation: PDFKit (server-side API)
- Email delivery: Resend (API)
- AI / embeddings: Gemini API (placeholder)
- Tests & Linting: Jest, ESLint

---

## Installation 🔧

Clone the repo and install dependencies:

```bash
git clone <repo-url>
cd ai-spend-audit
npm install
# or: pnpm install | yarn install
```

Create a local environment file by copying the example (if any) or creating `.env.local`:

```bash
cp .env.local.example .env.local
# or create .env.local manually
```

Then run the dev server:

```bash
npm run dev
# http://localhost:3000
```

Useful scripts:

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm start` — Start production server
- `npm run lint` — Run ESLint
- `npm test` — Run tests (Jest)

---

## Environment Variables 🔐

Create a `.env.local` in the project root and add the following variables (example names used in this repo):

- `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — your Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-only)
- `GEMINI_API_KEY` — API key for Gemini / AI provider (if used)
- `RESEND_API_KEY` — API key for Resend (email delivery)

Important:

- Never commit secrets to source control. Keep `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, and `RESEND_API_KEY` out of client bundles and committed files.
- Use `process.env.NEXT_PUBLIC_*` only for safe public values (these are exposed to the browser).

---

## How to Run Locally ▶️

1. Install dependencies (`npm install`).
2. Add `.env.local` with required variables.
3. Start dev server: `npm run dev`.
4. Open `http://localhost:3000` and sign up / sign in.

To build and preview production:

```bash
npm run build
npm start
```

---

## Folder Structure 📁

Top-level layout (abridged):

```
.
├─ pages/                 # Next.js pages (routes)
│  ├─ api/                # Serverless API routes (PDF, save-audit, etc.)
│  ├─ audit/              # Saved audit pages (protected)
│  ├─ dashboard.js        # Main authenticated dashboard
│  └─ results.js          # Audit results + export
├─ components/            # Reusable React components
│  └─ Dashboard/          # Dashboard-specific UI (charts, cards)
├─ lib/                   # Helpers: supabase clients, audit engine, pdf helpers
├─ public/                # Static assets
├─ styles/                # Global CSS (Tailwind entry)
├─ __tests__/             # Jest tests
├─ package.json
└─ README.md
```

Key files:

- [lib/supabase.js](lib/supabase.js) — client-side Supabase helper
- [lib/supabaseAdmin.js](lib/supabaseAdmin.js) — server-side admin client
- [pages/api/generate-pdf.js](pages/api/generate-pdf.js) — server-side PDF generation
- [components/Dashboard/SavingsChart.js](components/Dashboard/SavingsChart.js) — Savings chart

---

## Screenshots 🖼️

Add screenshots to `/public` and reference them here:

![Dashboard placeholder](/public/screenshots/dashboard.png)

![Audit results placeholder](/public/screenshots/results page.png)

![home page placeholder](/public/screenshots/home page.png)



Replace the placeholder images with real screenshots before publishing.

---

## Future Improvements 🚧

- Harden API routes with server-side session checks (defense-in-depth)
- Improve responsive layout and accessibility (a11y)
- Add CI workflows (lint, tests, build) with GitHub Actions
- Integrate role-based access (teams, admins)
- Add E2E tests (Cypress / Playwright)

---

## Contributing 🤝

Contributions are welcome! Please open an issue or create a PR with clear intent and tests where applicable.

---

## Author 👤

Vikas — creator & maintainer

- GitHub: (add your GitHub profile link)
- Email: (add contact email)

---

Thank you for checking out the project — if you'd like, I can also add a short CONTRIBUTING guide, generate a set of demo screenshots, or create a GitHub Actions workflow for CI.
