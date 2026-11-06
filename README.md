# Start here / প্রথমে পড়ুন

Fresh setup-এর জন্য **START-HERE-BN.md** পড়ুন। Technical reference: **SETUP.md**.

# Avijit Gharamy · Orbit portfolio

React 19 + Vite portfolio and Supabase CMS. Start with **SETUP.md**.

## Local development

```sh
npm ci
cp .env.example .env
npm run dev
```

With no Supabase configuration, the website displays CV-based preview content and `/admin` offers a clearly labeled, read-only dashboard preview at `/admin/preview`. There is no fake admin login or localStorage CMS.

## Features

- Responsive personal portfolio; New Horizons Pluto/Charon portraits on WebGL spheres with an orbiting moon; animated CSS depth fallback; reduced motion support; light/dark theme.
- CV-based experience, technical skills, education, awards, conference attendance and extracurricular work, plus original CV download and supplied photos.
- Admin login, password reset, session refresh, admin allowlist, logout and protected database operations.
- Homepage/about/contact/social/banner editing; blog rich text, categories, custom slugs, draft/publish; services and pricing; portfolio with client/category/URL; experience, skills and credentials editors.
- Private media bucket, draft/public access, folders, alt text, image preview, used-file deletion protection; WebP/AVIF supported. Original supplied assets are static optimized WebP files. Uploaded assets retain their submitted format; there is no automatic transcoding service.
- Contact inbox, read/unread status and deletion; public form protected with Turnstile, server validation and a durable five-per-hour IP-hash limit.
- SEO editor, server-generated HTML head metadata and dynamic sitemap on Netlify/Vercel. Existing visitors refresh data on focus and every 60 seconds. Content changes need no redeployment.

## Project layout

| Path | Purpose |
| --- | --- |
| `src/main.jsx` | Public layout, routes and portfolio sections |
| `src/Admin.jsx` | Admin authentication, dashboard and CMS editors |
| `src/Orbit.jsx` | Lazy-loaded Three.js scene and CSS fallback markup |
| `src/lib.js` | Supabase connection, public queries and write helpers |
| `src/seed.js` | CV-based preview/initial database content |
| `src/style.css` | Responsive public and dashboard design |
| `supabase/migrations/` | Schema, RLS, storage policies and initial CV records |
| `supabase/functions/contact/` | Spam-protected contact submission endpoint |
| `scripts/seo.mjs`, `scripts/sitemap.mjs` | Shared server metadata/sitemap logic |
| `netlify/functions/`, `api/` | Netlify and Vercel SEO/sitemap adapters |
| `tests/` | Database authorization, CRUD, rate-limit and SEO tests |

## Validation

```sh
npm test
npm run build
```

Database tests run the actual migrations in an embedded PostgreSQL runtime (PGlite), with simulated Supabase auth/storage schemas. They test anonymous, non-admin and admin roles, published-only content, CRUD, media visibility, referenced-media deletion protection, slug validation, inquiries and rate limiting. They do not substitute for testing your deployed Supabase Auth, Storage, email delivery or Edge Function.

No named client case studies or blog posts were supplied, so none were fabricated. Work cards describe areas of practice and are replaced by published portfolio projects. Experience dates were preserved, including overlapping roles; RISA dates were not supplied. CV references remain in the downloadable CV instead of being copied into prominent public contact sections. Public website wording is English; the setup guide contains an English technical walkthrough and a short Bengali checklist.

The owner-only preview uses a static hosting deployment. Live CMS requires your Supabase project. Netlify/Vercel adapters are included for deployment to those hosts; their server-rendered SEO endpoints are not executed by the static preview host.

Pluto / Charon hero imagery is credited in `public/space/CREDITS.txt` and linked in the visual. The orbital path and visual proportions are artistic. Reduced-motion preferences produce a static scene.

## Fresh-start package

The visual source and all assets are preserved from commit `1c9004b385835373231e43c7703af7f027135ea0`. Packaging updates add environment validation, legacy anon-key compatibility, and an embedded production HTML template for server metadata. If metadata lookup fails, the adapter serves the application shell so the client can present its normal loading/error UI. This does not bypass database authorization or make invalid Supabase configuration work. See `PACKAGE-NOTES.md`.
