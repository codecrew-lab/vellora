# VELLORA

A beautiful world where stories come to life.

VELLORA is a premium digital storytelling and reading platform built with Next.js, React, and TypeScript.

## Getting started

Requirements:
- Node.js 20 or newer
- npm

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

Create a production build:

```bash
npm run build
npm start
```

## Phase 1 foundation

- Next.js App Router and TypeScript
- VELLORA Enhanced Manuscript visual palette
- Full-screen manuscript cover split at the exact centre
- Left and right manuscript halves slide outward to reveal the library
- Responsive library landing foundation
- Reduced-motion accessibility support

## Project structure

- `app/layout.tsx`: shared HTML layout and page metadata
- `app/page.tsx`: landing page and opening interaction
- `app/globals.css`: design tokens, layout, responsive rules, and animation
- `package.json`: dependencies and development commands

## Important project rules

- The manuscript split-slide opening is a locked brand interaction.
- Story content will be managed through the Admin Dashboard, not hardcoded into production pages.
- Supabase will be connected when the backend and admin phases begin.
- Never put Supabase service-role keys or other secrets in browser code.
