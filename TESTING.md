# VELLORA release checklist

## Public library
- [ ] First visit shows the split manuscript opening; activating it slides both halves outward.
- [ ] Refresh after opening does not replay the intro unless browser site data is cleared.
- [ ] Empty catalogue displays a clear empty state (no sample/demo books).
- [ ] After an admin publishes a book, it appears in the library and featured area when marked featured.
- [ ] Search matches title, author, genre and description.
- [ ] Genre filters work on desktop and mobile.
- [ ] Settings exposes only Enhanced Manuscript, Classic Vellum and Dark Heritage.
- [ ] Menu contains only Library, Settings and Recently Read.

## Reader
- [ ] Published PDF opens using a short-lived signed URL.
- [ ] Previous/next, page slider, keyboard arrows and mobile swipe work.
- [ ] PDF outline appears in chapter navigation when the PDF contains bookmarks.
- [ ] Progress and bookmarks persist on the same browser/device.
- [ ] Optional page sound can be enabled/disabled.
- [ ] Download starts with a useful filename.
- [ ] Unpublished PDFs cannot be opened by anonymous visitors.

## Admin
- [ ] Anonymous visitor cannot access the add-book dashboard.
- [ ] Supabase user without trusted `app_metadata.role=admin` is rejected.
- [ ] Trusted admin can sign in and upload cover + PDF.
- [ ] Invalid file types and oversized files are rejected.
- [ ] Unpublished book stays hidden; published book appears publicly.
- [ ] Admin has no edit/delete controls.
- [ ] RLS rejects UPDATE and DELETE on `public.books` and storage objects.

## Deployment
- [ ] Merge the reviewed PR into `main`.
- [ ] In GitHub repository Settings → Pages, choose **GitHub Actions** as the build/deploy source.
- [ ] Confirm the Pages workflow completes successfully.
- [ ] Open the deployed URL on desktop and mobile.
- [ ] Test one real admin upload and one public PDF read/download.

The checklist is a manual acceptance plan, not a claim that these end-to-end checks have already passed.
