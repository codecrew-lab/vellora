# VELLORA — Phase 7 test plan

This checklist is the release gate for the public website and the admin workroom.
The automated GitHub check runs `scripts/validate_site.py`; it is a lightweight
static smoke test, not a browser or penetration test.

## 1. Opening experience and library

- [ ] Open the site on a desktop browser and a mobile browser.
- [ ] Confirm the enhanced-manuscript cover is split at the centre.
- [ ] Activate **OPEN THE WORLD** and confirm the left and right panels slide
      outward to reveal the library.
- [ ] Confirm the page remains usable when reduced motion is enabled.
- [ ] Open and close the navigation; verify it contains only Library,
      Recently Read and Settings.
- [ ] Search by title, author and genre; try a query with no results.
- [ ] Test each genre filter and all three sort orders.
- [ ] Confirm unpublished books and drafts never appear publicly.
- [ ] Confirm the empty-library message appears when there are no published books.

## 2. Reader and downloads

- [ ] Open a real published PDF from a desktop browser.
- [ ] Turn pages using the controls, keyboard and touch gestures.
- [ ] Test first-page and last-page boundaries.
- [ ] Test a PDF with an outline and one without an outline.
- [ ] Change between Enhanced Manuscript, Classic Vellum and Dark Heritage.
- [ ] Add, remove and revisit a page bookmark.
- [ ] Close and reopen a book; confirm local progress resumes correctly.
- [ ] Test Download PDF and Print Book on desktop and mobile.
- [ ] Test a PDF larger than a few pages and check memory/performance.
- [ ] Confirm a missing or invalid PDF produces a helpful message rather than a
      broken or blank reader.

## 3. Admin and Supabase

Use a real administrator account and a non-admin test account.

- [ ] Sign in with the authorised admin account.
- [ ] Confirm a normal authenticated account cannot enter the dashboard.
- [ ] Create a draft without publishing it.
- [ ] Upload a JPG/PNG/WEBP cover and a real PDF within the documented size limits.
- [ ] Publish the book and confirm it appears in the public library.
- [ ] Edit the book, replace its cover/PDF and unpublish it.
- [ ] Confirm the unpublished book disappears from the public library.
- [ ] Confirm a draft or unpublished PDF cannot be signed/downloaded by a visitor.
- [ ] Delete a disposable test book and confirm its database record and storage
      objects are handled as expected.
- [ ] Sign out and confirm the dashboard returns to the login screen.
- [ ] Review Supabase Auth, Database and Storage RLS policies; verify writes are
      admin-only and public PDF signing is limited to paths attached to published
      book records.
- [ ] Review Storage object cleanup after interrupted uploads and failed updates.
- [ ] Confirm no service-role or secret key exists in browser files or Git history.

## 4. Responsive, accessibility and browser coverage

- [ ] Test current Chrome, Edge, Firefox and Safari where available.
- [ ] Test a narrow phone viewport, a tablet viewport and a desktop viewport.
- [ ] Navigate the main flows using only a keyboard.
- [ ] Check visible focus, dialog close behaviour, labels and accessible names.
- [ ] Check text contrast in all three themes.
- [ ] Test browser zoom at 200%.
- [ ] Test with reduced motion and with slow/interrupted network access.
- [ ] Check that CDN failures display a recoverable error.

## 5. Release sign-off

- [ ] GitHub Actions validation passes on the release commit.
- [ ] All applicable manual checks above are complete.
- [ ] Supabase project URL, publishable key, Auth URL configuration and RLS
      policies are verified for the production domain.
- [ ] A real admin account and at least one approved, licensed PDF have been
      tested end to end.
- [ ] Confirm the production URL and custom-domain DNS/HTTPS, if applicable.

Do not mark a manual item complete based only on the static GitHub check.
