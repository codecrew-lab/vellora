# VELLORA — static deployment guide

VELLORA is a plain HTML/CSS/JavaScript site. It has no Node.js runtime, package
manager, build command or server process. GitHub Actions can publish the static
repository directly to GitHub Pages.

## 1. Enable GitHub Pages

1. Open the repository **Settings → Pages**.
2. Under **Build and deployment**, choose **GitHub Actions** as the source.
3. Merge the deployment workflow to `main` only after reviewing its pull request.
4. Open the repository **Actions** tab and wait for **VELLORA checks and Pages
   deployment** to finish.
5. GitHub Pages will show the published URL in **Settings → Pages**.

The workflow validates the static site on pull requests and pushes. It deploys
only after a successful validation run on `main`. A pull request does not publish
a preview or change the live site.

## 2. Supabase production settings

Before inviting readers or publishing books:

1. In Supabase, verify the project URL and browser publishable key used in
   `app.js` and `admin.js`. These are public browser credentials; never add a
   service-role key or secret key to the website.
2. In **Authentication → URL Configuration**, set the Site URL to the final
   public website origin.
3. Add the final site's required redirect URLs to the redirect allow list. If
   admin invitation emails are used, test the invite link and make sure its
   destination is allowed.
4. Keep Row Level Security enabled on `public.books`.
5. Confirm public visitors can read published book metadata only, and that
   inserts, updates, deletes and Storage uploads are restricted to trusted
   administrators.
6. Keep `book-files` private. Confirm a visitor can obtain a short-lived signed
   URL only for a PDF belonging to a published book.
7. Keep `book-covers` public for cover delivery, with writes restricted to admins.
8. Create the administrator through Supabase Auth and set trusted
   `app_metadata.role = admin`. Never use editable `user_metadata` as an
   authorization source.

The current project uses local browser storage for saved stories, reading
progress and page bookmarks. Those values do not sync between devices.

## 3. Custom domain (optional)

If a custom domain is chosen later, add it in **Settings → Pages → Custom domain**,
configure the DNS records GitHub provides, and wait for HTTPS to become available.
Then update the Supabase Auth Site URL and redirect allow list to the final domain.
Do not change DNS until the domain registrar and chosen hostname are confirmed.

## 4. Rollback

A deployment is tied to a commit on `main`. If a release causes a problem, revert
the responsible commit through a reviewed GitHub pull request, then allow the
workflow to publish the corrected `main` branch. Do not delete Supabase books,
storage buckets or policies as a rollback method.

## 5. Security note

A publishable key in browser code is expected. Security depends on correct
Supabase Row Level Security and Storage policies, not on hiding that key.
The Supabase advisor previously reported a mutable `search_path` warning for
`public.set_books_updated_at`. This release does not change that database
function; review and resolve the warning deliberately in a separate, reviewed
database change before treating the security review as complete.
