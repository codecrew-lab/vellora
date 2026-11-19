# VELLORA
A manuscript-inspired static reading website built with HTML, CSS and JavaScript. No Node.js, local terminal or build step is required.

## Included
- Preserves the supplied homepage and centre-split manuscript opening animation.
- Removes hardcoded sample books; public catalogue loads only published rows from Supabase `public.books`.
- Search, genre filters, featured story, Recently Read, and exactly three themes: Enhanced Manuscript, Classic Vellum, Dark Heritage.
- PDF.js reader with page navigation, chapter outline, keyboard/touch navigation, local progress, bookmarks and optional page-turn sound.
- Private PDF access through short-lived signed URLs from `book-files`.
- Add-only admin dashboard at `admin.html`, using Supabase email/password Auth and trusted `app_metadata.role === "admin"`.
- No public signup, font controls, sample catalogue, or admin edit/delete controls.

## Supabase
Project ref: `egyrlxgpgkflcejtgvvc`; URL and public publishable key are in `config.js`. These are public-client values; never put a secret/service-role key in GitHub or browser code.
Existing objects are reused: `public.books`, public `book-covers`, private `book-files`, and legacy `vellora-books`. The books table and all three buckets were verified empty.
This implementation does not change the database schema or buckets. It adds a migration that removes admin UPDATE/DELETE policies on `public.books` and on the two book-storage buckets. The remaining rules permit admin INSERT/upload and published-book reads. Admin role checks use trusted `app_metadata`, not editable User Metadata.

## Admin setup
In Supabase Authentication → Users, invite/create the admin account. Set trusted **App Metadata** to `{"role":"admin"}` (not User Metadata), then sign out and back in. Open `/admin.html`.
The requested code `123098` is not embedded in public browser code because a shared PIN in JavaScript can be discovered. The current login uses Supabase email/password plus the trusted admin role. If a separate PIN is required, it needs server-side verification with an Edge Function secret and rate limiting.

## Deployment
Deploy the repository root as a static site. Ensure all site files are published together. No build command is needed.

## Verification still required
A real browser session, real admin upload, live PDF reading/download, and deployed GitHub Pages URL still need testing. The code has not been represented as end-to-end tested against a real browser/admin session.
