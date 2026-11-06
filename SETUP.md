# Deployment and Supabase setup

The application code is implemented. A live CMS requires the services below. Never paste private credentials into chat or commit `.env` files.

## 1. Create a Supabase project

Use your own Supabase account. Save the database password privately. In Project Settings → API, copy the **project URL** and **publishable key** into `.env` locally or your hosting provider’s environment settings:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_PUBLISHABLE_KEY
VITE_TURNSTILE_SITE_KEY=YOUR_PUBLIC_SITE_KEY
```

These three values are public browser configuration. A publishable key is safe only in combination with correct RLS. Do not put a service-role key, database password, SMTP password or Turnstile secret in any `VITE_` variable.

## 2. Apply the migrations once, in order

Run `supabase/migrations/001_portfolio_cms.sql`, then `002_seed_cv.sql` `003_pluto_story.sql` `004_certificates.sql` and `005_undergraduate_thesis.sql` in the Supabase SQL editor. Alternatively link the Supabase CLI to your project and run `supabase db push`.

The first file creates the tables, private admin allowlist, RLS policies, private storage bucket, contact endpoint RPC and rate-limit storage. The second inserts initial CV content. Do not rerun seed inserts over an edited database. `scripts/seed-sql.mjs` regenerates initial SQL only, not your live content.

Only published content and published media are readable by public visitors. Inquiries are admin-only. Administrators must both authenticate and exist in `private.admin_users`; simply creating a Supabase Auth account does not grant admin access. The allowlist is inaccessible to browser roles.

## 3. Create and authorize the owner account

In Authentication → Users, add your own email/password account. Choose the password in Supabase yourself. Disable public email signups if no public user accounts are needed.

Find your exact user UUID in Authentication → Users, then run the following in the SQL editor, replacing the placeholder:

```sql
insert into private.admin_users(user_id)
values ('YOUR_ACTUAL_AUTH_USER_UUID');
```

Do not use a hardcoded frontend password or an email-only admin check. To revoke admin access, delete that UUID from `private.admin_users` in the SQL editor. Existing database access stops immediately; dashboard authorization is rechecked every minute and on auth changes.

## 4. Configure login and password reset

In Authentication → URL Configuration:

- Set Site URL to the final deployed portfolio origin.
- Add the exact URL `https://YOUR_DOMAIN/admin/reset-password` to allowed redirect URLs.
- For development, add `http://localhost:5173/admin/reset-password` if that is the address printed by Vite.
- Configure a production SMTP provider in Supabase for reliable password-reset delivery.
- Enable appropriate Supabase Auth rate limits and password requirements. This app’s reset form requires at least 12 characters.

Visit `/admin` to sign in. A reset email returns to `/admin/reset-password`, where you choose and confirm the new password. Test the actual email link and logout before production use.

## 5. Enable the contact form

Create a Cloudflare Turnstile widget for the final hostname. Put only its public site key in `VITE_TURNSTILE_SITE_KEY`.

Set the following **Supabase Edge Function secrets** in the Supabase dashboard or CLI:

| Secret | Value |
| --- | --- |
| `TURNSTILE_SECRET_KEY` | Turnstile widget secret |
| `CONTACT_RATE_SALT` | A long random value used to hash IP addresses |
| `ALLOWED_ORIGINS` | Exact origins separated by commas, e.g. `https://your-domain.com,http://localhost:5173` |

Supabase provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in its Edge runtime. Keep them server-side. The service key is used only by the contact function to call a narrowly exposed service-only RPC.

Deploy the function:

```sh
supabase functions deploy contact
```

`supabase/config.toml` sets `verify_jwt = false` for this intentionally public endpoint. The function still validates the origin, Turnstile token and hostname, honeypot, payload length, email and message fields, then enforces a database-backed limit of five messages per IP hash per hour. Requests fail closed if spam protection is not configured. CORS is not the spam protection itself. Rate limiting uses the forwarded client address supplied by the Supabase gateway; verify this header behavior in your deployed environment.

The form stores inquiries; it does not send an email notification. You view messages in Contact inbox. An optional notification service can be added later.

## 6. Netlify deployment (primary target)

1. Put the project in your GitHub repository, including `package-lock.json`, `netlify.toml`, `netlify/functions`, `scripts`, `public`, `src` and Supabase files. Exclude `node_modules`, `dist`, `.env` and `.openai` (the latter belongs only to the provided preview).
2. In Netlify, import the GitHub repository. Set Node.js 22 or newer.
3. Build command: `npm run build`. Publish directory: `dist`. The included configuration handles these settings, functions and SPA routes.
4. Add the three public environment variables from step 1 to Netlify for builds and functions. `SITE_URL` may also be set to your final origin.
5. Deploy, then add that domain to Supabase auth redirect URLs, Turnstile hostnames and `ALLOWED_ORIGINS`.
6. In Admin → SEO, set the canonical site URL to your final origin.

After GitHub import, Netlify automatically builds pushes to your production branch. The GitHub workflow also runs tests and a production build. Configure branch protection to require that check if you want failed tests to block merges. Initial environment changes require a rebuild because Vite embeds public configuration. Subsequent CMS content changes do not.

Do not drag only `dist` into Netlify if you need server-generated metadata and the sitemap: Git deployment packages the included functions too. Static drag-and-drop still renders the SPA, but excludes those server endpoints.

## 7. Vercel alternative

Import the same GitHub repository into your chosen Vercel account/team. Choose the Vite framework, `npm run build`, and `dist`. Add the same public environment variables to the target environments. The included `vercel.json` configures SPA routes, security headers, metadata endpoints and `/sitemap.xml`.

Set `SITE_URL` to the final canonical origin, especially for previews or protected deployments. The server metadata adapter falls back to Vercel’s production-domain system variable. Server adapters use `generated/site-template.mjs`, created by the production build. They do not fetch their own deployed `/index.html`, avoiding self-request/redirect dependencies. The included private Sites preview is separate from Vercel and Netlify; no Vercel production project has been created automatically.

## 8. Manage your content

- **Website:** hero, About, contact details, social links, banners, section headings and CV download link.
- **Experience / Skills / Credentials:** maintain the CV sections independently. Use the existing credential section names to place education, awards, conferences and extracurricular activities correctly.
- **Blog:** add a title, category, summary, featured image, alt text, body, SEO fields and custom slug. Save as draft or check Published before saving.
- **Portfolio:** add real projects with client, category, description, images, project link and full content. No fictional case studies were seeded.
- **Services:** edit categories, descriptions, pricing text and visibility.
- **Media library:** upload JPEG, PNG, WebP or AVIF up to 8 MB. Supply alt text and a folder. Copy the `media://…` reference into an image field. Publish the image when it should be visible publicly. To reorganize, choose Edit on the media card. Uploaded files preserve their submitted format; upload WebP/AVIF for smaller files.
- **Contact inbox:** read inquiries, mark read/unread or delete.
- **SEO:** edit global title, description, OG image and canonical URL; post/project SEO lives in each entry.

Media is private by default. Public signed image URLs expire after one hour; unpublishing prevents new public URLs, while previously issued URLs can work until expiry. This is suitable for website assets, not confidential documents. Used media cannot be deleted until its references are removed. Original supplied photos remain in `public/images`; replace references through the CMS rather than editing code.

The app updates immediately in the editing tab. Other open tabs refresh on focus and every 60 seconds. Metadata and sitemap responses have a 60-second cache. No content deployment is required.

## 9. SEO and final checks

On Netlify/Vercel, homepage and published post/project responses receive database-generated title, description, Open Graph tags and canonical URL in the HTML head. This supports crawlers that do not execute JavaScript. A dynamic sitemap lists published posts and projects. Add the absolute `/sitemap.xml` address to `robots.txt` once your final domain is known and submit it to your search console. `/admin` is excluded from robots crawling; database authorization provides the actual access protection.

Before calling the live CMS fully verified:

- Run `npm ci`, `npm test`, `npm run build`.
- Check the portfolio on desktop and mobile, with keyboard navigation and reduced motion.
- Sign in as the authorized admin and verify logout and password reset.
- Create/edit/publish/unpublish/delete a temporary post, service and project; verify the public site in a logged-out window.
- Try a non-admin Auth account; confirm it cannot read drafts, modify content, view inquiries or upload/delete files.
- Upload a draft image and a public image; check public/private access and used-image deletion protection.
- Submit the real contact form with Turnstile; confirm the inquiry arrives, read/unread works, and repeated requests are rate limited.
- Request `/sitemap.xml` and inspect page source for updated OG/meta tags.

## Verification status

The delivered migrations are executed in automated embedded PostgreSQL tests using simulated Supabase auth/storage schemas. Tests cover RLS for visitor/non-admin/admin, CRUD, draft visibility, storage visibility, used-media protection, inquiry access, slug constraints and the durable rate limiter. SEO/sitemap generation is also tested. The production Vite build is tested and public/dashboard UI was inspected in a desktop browser.

Not verified against your live services: Supabase authentication, reset-email delivery, Storage API, Edge Function + Turnstile end to end, Netlify/Vercel hosted function execution, and GitHub automatic deployment. No project URL/keys, Turnstile widget, SMTP settings or target GitHub repository were supplied. These are configuration dependencies, not fabricated connections. WebGL is disabled in the inspection browser; its CSS fallback was checked, while hardware WebGL rendering requires a capable browser.

## সংক্ষিপ্ত বাংলা চেকলিস্ট

১. নিজের Supabase project খুলুন এবং দুইটি migration ক্রমানুসারে চালান।
২. নিজের Auth user তৈরি করে তার UUID admin allowlist-এ দিন।
৩. hosting settings-এ Supabase URL, public publishable key ও Turnstile site key দিন।
৪. Turnstile secret, origin ও rate-limit salt শুধু Supabase Edge secrets-এ রাখুন; contact function deploy করুন।
৫. GitHub repository Netlify-তে import করুন। `/admin` থেকে লগইন করে কনটেন্ট পরিবর্তন করুন।
৬. লাইভ লগইন, password reset, upload ও contact form পরীক্ষা করার পর CMS ব্যবহার শুরু করুন।

The Be Like Pluto reflection appears after About. Edit its title, story body, closing quote, author and image in Admin → Website. Existing installations apply `003_pluto_story.sql`; it preserves already edited settings.

Fresh-start deployment packaging now validates public configuration before building. `VITE_SUPABASE_ANON_KEY` is accepted as a legacy alias; `VITE_SUPABASE_PUBLISHABLE_KEY` is preferred. Netlify Functions must have the same public settings available in their runtime scope for server metadata. Passwords and service keys remain server-side as described above.

## Certificate archive

Existing databases already on migration 003 apply only 004_certificates.sql. Fresh installs apply 001–004 in order. Admin → Certificates manages the seven supplied scans and future records with the same admin-only RLS rules. Drafts remain private. Admin → Website edits the section heading and description. Optional thumbnail/original fields should be updated or cleared when replacing an image. Original JPEG scans are included in public/certificates/originals; WebP previews preserve the complete documents. These are uploaded documents, not independently verified credentials.

## Undergraduate thesis

Existing databases on migration 004 apply only 005_undergraduate_thesis.sql. Fresh installations apply 001–005. The Research section appears directly below university credentials and above certificates. Admin → Website exposes Thesis fields, including newline-separated authors and the two 0–100 peak-accuracy values. Keep values tied to the source table. The original uploaded PDF is unchanged; Figure 5.15 is reproduced as an optimized image with an on-page source link. No claim about individual technical responsibilities is inferred: Avijit is credited as a co-author.
