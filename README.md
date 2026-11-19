# VELLORA

A manuscript-inspired digital library.

## Current foundation

- `index.html` is the user-provided VELLORA homepage, committed as the visual and interaction baseline.
- The page currently contains its CSS and JavaScript inline, so it does not require separate `styles.css` or `app.js` files to render.
- The current page contains demonstration book entries and a placeholder book dialog. These are not production catalogue records.

## Next implementation work

1. Preserve the supplied homepage design and central split-manuscript opening.
2. Replace demonstration catalogue data with published books loaded from Supabase.
3. Implement the real PDF reader and signed download flow.
4. Add the admin dashboard using the existing Supabase project and its established schema, buckets, and access policies.
5. Keep the three themes: Enhanced Manuscript, Classic Vellum, and Dark Heritage.

## Development constraints

- Static HTML, CSS, and JavaScript; no Node.js or local build commands.
- GitHub pull requests for changes; merge only after explicit approval.
- Do not reset or modify Supabase as part of the website source reset.
