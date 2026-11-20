# VELLORA release checklist

This is a manual acceptance checklist. Repository inspection and static checks do not replace testing the deployed site on real devices.

## Public library
- [ ] First visit shows the signature split-manuscript opening; activating it slides the two halves outward.
- [ ] The opening remains unchanged after unrelated reader or admin updates.
- [ ] Refresh after opening does not replay the intro unless browser site data is cleared.
- [ ] Empty catalogue displays a clear empty state; no sample/demo books appear.
- [ ] Only published books appear in the public library.
- [ ] Featured books appear in the featured area when marked featured.
- [ ] Search matches title, author, genre and description.
- [ ] Genre tiles and filters work on desktop and mobile.
- [ ] Sorting by newest, title, author and genre works.
- [ ] Menu contains only Library, Settings and Recently Read.
- [ ] Settings offers Enhanced Manuscript, Classic Vellum and Dark Heritage.

## Reader
- [ ] A published book opens from its generated PDF using a short-lived signed URL.
- [ ] Text is large, dark and legible on both desktop and mobile, including text after a page break.
- [ ] Previous/next controls, page slider, keyboard arrows and horizontal mobile swipe work.
- [ ] Page turns do not leave stale pages visible when quickly switching pages or closing the reader.
- [ ] Chapter navigation and saved-bookmark navigation work where the PDF has matching page destinations.
- [ ] Reading progress and bookmarks persist on the same browser/device.
- [ ] Optional page-turn sound can be enabled and disabled; preference persists.
- [ ] Download starts with a useful filename.
- [ ] Unpublished PDFs cannot be opened by anonymous visitors.

## Admin Hub
- [ ] Admin Hub requires the private admin sign-in; public readers do not need accounts.
- [ ] Admin sign-in succeeds with the configured secret and invalid attempts are rejected/rate-limited.
- [ ] Dashboard statistics and catalogue filters reflect the current books.
- [ ] Admin can create a book using manuscript text and one built-in cover design.
- [ ] PDF is generated automatically; no PDF upload field is required.
- [ ] Saving a book publishes it automatically, as currently configured.
- [ ] Admin can search, edit and save an existing book; its generated PDF is refreshed.
- [ ] Admin can individually publish/unpublish a book where that management action is exposed.
- [ ] Admin can delete one book and its associated private PDF.
- [ ] Delete All Books requires both confirmation steps.
- [ ] Oversized or invalid manuscript/PDF operations fail with a clear message.
- [ ] Admin session persists for its configured lifetime and logout/expiry returns to sign-in.

## Supabase and deployment
- [ ] RLS remains enabled on the books table.
- [ ] Anonymous readers can read published book records only.
- [ ] Anonymous readers can download only PDFs associated with published books.
- [ ] Admin mutations are performed through the protected Edge Function; service-role credentials never appear in frontend files.
- [ ] Edge Function deployment is the expected active version and its logs show successful admin requests.
- [ ] GitHub Pages deployment workflow completes successfully.
- [ ] Test the deployed URL on a real Android phone and a desktop browser.
- [ ] Complete one real admin create/edit operation and one public read/download test.

The checklist is a manual acceptance plan, not a claim that every end-to-end check has already passed.

## Phase 2 — Reader experience
- [ ] Opening a book announces its loading state to assistive technology.
- [ ] Reader displays a clear page-loading indicator while a PDF page is rendering.
- [ ] Page status announces the current page and total page count.
- [ ] Resize the browser and rotate a phone while reading; the current page is re-rendered to fit without losing progress.
- [ ] Horizontal swipe on the page advances/returns; vertical page scrolling remains natural.
- [ ] Keyboard Arrow Left/Right changes pages; Home/End jumps to the first/last page.
- [ ] Arrow keys on the page slider and chapter/bookmark selectors continue to operate those controls instead of changing pages unexpectedly.
- [ ] Previous/next buttons expose accessible names and disable correctly at the first/last page.
- [ ] Reduced-motion preference suppresses reader transitions and loading animation.
- [ ] Rapid page changes and closing the reader during rendering do not leave stale pages or unhandled rendering errors.
