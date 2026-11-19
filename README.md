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

Published records are selected with `is_published = true`. The existing Row Level Security policies are retained. The public Storage bucket used for downloadable editions is `vellora-books`.

If the browser displays the Data API access message, check the Supabase project's **Integrations → Data API** settings and ensure the `public` schema and `books` table are exposed to the Data API. Keep RLS enabled; public visitors should only be able to read published records. Admin write permissions must remain restricted to trusted admin accounts.

## Files

- `index.html` — page structure and dialogs
- `styles.css` — manuscript design, responsive layout and themes
- `app.js` — opening animation, library queries, search, filters and reading history

## Next work

The admin dashboard, authenticated admin workflows, PDF upload management, and immersive page-turn reader are later development work. They are not faked in this phase.
