# VELLORA
A manuscript-inspired static reading website built with HTML, CSS and JavaScript. No Node.js, local terminal or build step is required.

## Included in this implementation
- Preserves the supplied homepage and centre-split manuscript opening animation.
- Removes hardcoded sample books. Public catalogue loads only published rows from Supabase `public.books`.
- Search, genre filters, featured book, Recently Read, and exactly three themes: Enhanced Manuscript, Classic Vellum, Dark Heritage.
- PDF.js reader with page navigation, chapter outline, keyboard/touch navigation, local progress, bookmarks and optional page-turn sound.
- Private PDF access through short-lived signed URLs from `book-files`.
- Add-only admin dashboard at `admin.html`, using Supabase email/password Auth and trusted `app_metadata.role === "admin"`.
- No public signup, font controls, sample catalogue, or admin edit/delete controls.

## Supabase
Project ref: `egyrlxgpgkflcejtgvvc`; URL and public publishable key are in `config.js`. These values are for public browser access; never put a secret/service-role key in GitHub or browser code.
Existing objects are reused: `public.books`, public `book-covers`, private `book-files`. The books table was checked and contained zero rows. This PR does not alter database schema, buckets, or RLS policies. Existing Storage policies must allow authenticated admins to upload and the public app to sign/read only published PDFs.

## Admin setup
In Supabase Authentication → Users, invite/create the admin account. Set trusted **App Metadata** to `{"role":"admin"}` (not editable User Metadata), then sign out and in again. Open `/admin.html`.
The requested code `123098` is not embedded in browser code: a shared PIN in public JavaScript can be discovered by visitors. The dashboard currently uses Supabase email/password plus the trusted admin role. A separate PIN would need server-side verification through an Edge Function secret and rate limiting.

## Deployment
Deploy the repository root as a static site. Ensure all files are published together. No build command is needed.

## Verification still required
A real browser session, real admin upload, Storage RLS/signing permissions, and the deployed GitHub Pages URL still need testing. Code has not been represented as end-to-end tested against a real browser/admin account.