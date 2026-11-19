# VELLORA

A beautiful world where stories come to life.

VELLORA is a static, browser-first reading library. The website is plain HTML, CSS and JavaScript: no Node.js installation, package manager, local build step or terminal workflow is required.

## Phase 1 — Visual foundation

- Full-screen enhanced-manuscript cover, split precisely at the centre.
- The **OPEN THE WORLD** action slides the left and right manuscript panels away to reveal the library.
- Responsive VELLORA identity and literary landing page.
- Three reading atmospheres: Enhanced Manuscript, Classic Vellum and Dark Heritage.
- Floating navigation with Library, Recently Read and Settings.

## Phase 2 — Library experience

- Loads published books from the existing Supabase `public.books` table.
- Search by title, author, genre or description.
- Genre filters generated from published book records.
- Latest, alphabetical and recommended sorting.
- Featured story spotlight when a published record is marked featured.
- Book detail dialog, PDF download link and locally saved stories.
- Recently read history and theme choice are stored in the visitor's browser.
- Empty states are intentional: VELLORA does not invent demo books.

## Supabase connection

The front end uses the project's public URL and publishable API key in `app.js`. A publishable key is designed for browser use; never put a Supabase service-role or secret key in this repository.

The app reads these fields from the existing `public.books` table:

- `id, title, author, description, slug, genre`
- `cover_url, pdf_path, language, reading_time_minutes`
- `is_featured, is_recommended, is_published, created_at`

Published records are selected with `is_published = true`. The existing Row Level Security policies are retained. Public book metadata is read from `public.books`; downloadable PDF editions are stored in the private `book-files` bucket and delivered through short-lived signed URLs.

If the browser displays the Data API access message, check the Supabase project's **Integrations → Data API** settings and ensure the `public` schema and `books` table are exposed to the Data API. Keep RLS enabled; public visitors should only be able to read published records. Admin write permissions must remain restricted to trusted admin accounts.

## Files

- `index.html` — page structure and dialogs
- `styles.css` — manuscript design, responsive layout and themes
- `app.js` — opening animation, library queries, search, filters and reading history

## Phase 3 — Immersive reading experience

- Full-screen PDF reading room powered by PDF.js from a pinned CDN; no Node.js or local build step.
- Page-by-page rendering with animated page turns, previous/next controls, keyboard arrows and touch swipes.
- PDF document outline navigation for chapters/sections when the uploaded PDF contains an outline.
- Reading progress saved per book in the current browser, with a continue-reading action.
- Optional page-turn sound and PDF download access.

## Phase 4 — Signature reading atmosphere

- Enhanced Manuscript, Classic Vellum and Dark Heritage are selectable inside the reader.
- Animated physical-style ribbon bookmark for the current page.
- Theme choice, page bookmark and reading progress persist on the current device.
- Responsive reading room with reduced-motion support.

## Phase 5 — PDF editions and bookmarks

- Book PDFs are served from the existing private `book-files` Storage bucket.
- The public library requests short-lived signed URLs only for published book records, so private PDF objects remain protected by Storage RLS.
- Book details provide separate **Download PDF** and **Print Book** actions. Print opens the original PDF in the browser's PDF viewer, where the visitor can use its print controls.
- The reader keeps the animated ribbon bookmark and adds a one-tap jump back to the bookmarked page.
- Reading progress and bookmarks remain local to the visitor's browser in this phase.

## Phase 6 — Supabase administration

- `admin.html` is a browser-only admin workroom using the pinned Supabase JavaScript SDK; no Node.js, package installation or terminal commands are required.
- Admin sign-in uses existing Supabase Auth email/password accounts. There is no public sign-up form.
- The dashboard creates, edits, publishes, unpublishes and deletes book records.
- Cover images upload to the public `book-covers` bucket; PDF editions upload to the private `book-files` bucket.
- Admin authorization checks the trusted `app_metadata.role = admin` claim, matching the existing database and Storage RLS policies. User-editable `user_metadata` is never used for permissions.
- The existing `public.books` schema, Storage buckets and RLS policies are reused; no production schema reset or destructive migration is required.

## Admin account setup

1. In Supabase Dashboard → Authentication → Users, invite or create the administrator account. Do not add a public registration form.
2. Open that user and set trusted **App Metadata** to include `{"role":"admin"}`. Do not set this in User Metadata.
3. The administrator signs in at `/admin.html`. If the role was just changed, sign out and sign back in so the refreshed JWT contains the trusted claim.
4. The public library only displays records with `is_published = true`. Drafts and unpublished PDFs are not exposed through the public book list or the private PDF bucket policy.

## Storage model

- `book-covers` — public image delivery; only authorised admins can upload, replace or delete objects.
- `book-files` — private PDF storage; admins can manage files, while public visitors can obtain a signed download/reader URL only for a PDF path linked to a published book.
- `vellora-books` — legacy bucket retained untouched; new admin uploads use the existing dedicated cover and PDF buckets.

## Phase 7 — Testing and deployment

- `TESTING.md` contains the desktop/mobile, reader, admin, Supabase security and release checklist.
- `scripts/validate_site.py` runs dependency-free static smoke checks for required files, local page references, duplicate IDs and key security/design invariants.
- `.github/workflows/site.yml` runs the checks on pull requests and pushes to `main`; after a successful push to `main`, it can deploy the static site to GitHub Pages.
- `DEPLOYMENT.md` explains the one-time GitHub Pages setup, production Supabase configuration, optional custom domain and rollback process.
- No Node.js, package installation or local build command is introduced. GitHub Pages must be enabled with **GitHub Actions** as its source before the first deployment.

## Current boundaries

Reading progress and page bookmarks remain local to the current browser/device. Reader accounts and cross-device progress sync are a separate future feature. Chapter navigation uses the PDF's embedded outline; PDFs without one still support page-by-page reading. The app remains plain HTML/CSS/JavaScript and uses browser-hosted CDN libraries only.
