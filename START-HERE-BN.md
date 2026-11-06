# এখান থেকে শুরু করুন — Avijit Portfolio CMS

আপনার ওয়েবসাইটের সম্পূর্ণ source project এই ফোল্ডারে। ছবি, CV, বড় টাইপোগ্রাফি, full-width layout, পরিচিতির নতুন অবস্থান, Gargantua-inspired black hole animation, “Be Like Pluto” গল্প এবং `/admin` CMS রাখা হয়েছে।

এই গাইডে প্রস্তাবিত পথ: **GitHub → Netlify hosting + Supabase database/auth/storage**। Supabase-এ ওয়েবসাইটের ZIP আপলোড করতে হয় না। Supabase backend পরিচালনা করে; Netlify website build ও host করে।

## ১. ZIP খুলুন

ZIP download করে Extract All করুন। `Avijit-Portfolio-CMS` ফোল্ডার খুলুন। ঠিক এই স্তরে `package.json`, `netlify.toml`, `src`, `public`, `supabase`, `scripts` ও `netlify` থাকবে।

`public`-এ আপনার ছবি ও CV আছে। এগুলো বাদ দেবেন না। `node_modules` ZIP-এ নেই; Netlify build-এর সময় dependency install করে। কোনো আসল password, private API key বা আগের `.env` এই ZIP-এ দেওয়া হয়নি। এটি live database export-ও নয়।

## ২. নিজের Supabase project নির্বাচন করুন

https://supabase.com/dashboard খুলুন। চাইলে আলাদা নতুন project বানান। আগের project মুছতে হবে না। নতুন project বানালে database password নিজের কাছে সংরক্ষণ করুন।

**আগের project ব্যবহার করলে:** এই কথোপকথনে আপনি তিনটি migration এবং admin অনুমতি আগেই চালিয়েছিলেন। সেগুলো সফলভাবে চালানো একই project হলে 001/002 আবার চালাবেন না। নতুন project হলে নিচের পাঁচটি migration একবার করে চালান।

## ৩. নতুন database-এর setup

Supabase → SQL Editor → New query খুলুন। ZIP-এর নিচের ফাইলগুলো একবার করে, এই ক্রমে চালান:

1. `supabase/migrations/001_portfolio_cms.sql`
2. `supabase/migrations/002_seed_cv.sql`
3. `supabase/migrations/003_pluto_story.sql`
4. `supabase/migrations/004_certificates.sql`
5. `supabase/migrations/005_undergraduate_thesis.sql`

প্রতিটি ফাইলের পুরো কোড কপি করে আলাদা query-তে paste → Run করুন। প্রতিবার Success হওয়ার পর পরেরটি চালান। 001 schema/security তৈরি করে, 002 CV content বসায়, 003 Pluto গল্প যোগ করে, 004 সাতটি সার্টিফিকেট ও তার নিরাপদ content type যোগ করে।

**বারবার 002 চালালে duplicate content হতে পারে।** আগে থেকেই ভরা database-এ এটি আবার চালাবেন না।

## ৪. Admin email ও password তৈরি করুন

Supabase → Authentication → Users → Add user → Create new user। নিজের email এবং নিজের নির্বাচিত শক্ত password দিন। নিজের account-এর email confirmation/auto-confirm অপশন থাকলে উপযুক্তভাবে সম্পন্ন করুন।

সেই user-এর UID/UUID কপি করুন। SQL Editor → New query-তে নিচের কোড দিন:

```sql
insert into private.admin_users (user_id)
values ('এখানে-শুধু-আপনার-আসল-UID-বসাবেন')
on conflict (user_id) do nothing;
```

উদাহরণের বাংলা লেখাটি সম্পূর্ণ মুছে তার জায়গায় UID বসাতে হবে। দুই পাশের single quote `'` থাকবে। তারপর Run চাপুন। এখানে password লিখবেন না।

পরে `/admin`-এ login করার ID হলো আপনার **email**। UUID login ID নয়; এটি শুধু admin অনুমতি দেওয়ার জন্য ব্যবহৃত।

## ৫. GitHub-এ project upload করুন

নতুন repository তৈরি করুন, অথবা নিজের নির্দিষ্ট repository-তে এই project-এর ফাইলগুলো রাখুন। ভুল করে অন্য project overwrite করবেন না।

Repository-এর একদম ওপরের স্তরে `package.json`, `netlify.toml`, `src/`, `public/`, `supabase/`, `scripts/`, `netlify/`, `generated/`, `api/` এবং lockfile থাকতে হবে। শুধু ZIP ফাইল upload করবেন না। Extract করা ফোল্ডারের **ভেতরের ফাইল ও ফোল্ডারগুলো** upload করুন।

সব ছবি, CV, `scripts`, `generated`, `netlify/functions` ও `package-lock.json` রাখবেন। এগুলো বাদ দিলে build বা website-এর অংশ কাজ নাও করতে পারে।

## ৬. Netlify-তে GitHub repository import করুন

https://app.netlify.com খুলুন। Add new project / Import an existing project → GitHub → আপনার সঠিক repository নির্বাচন করুন। UI-তে নাম কিছুটা আলাদা হতে পারে।

| Setting | যে মান দেবেন |
| --- | --- |
| Base directory | ফাঁকা, যদি package.json repository root-এ থাকে |
| Build command | `npm run build` |
| Publish directory | `dist` |
| Functions directory | `netlify/functions` |
| Node version | `22` |

এই সেটিংগুলো `netlify.toml`-এও দেওয়া আছে। এখানে GitHub থেকে **build** হতে হবে। Project source ZIP বা unbuilt source folder সরাসরি drag-and-drop করলে এই React project-এর সম্পূর্ণ deployment হবে না।

## ৭. Supabase-এর public তথ্য Netlify-তে দিন

Supabase project-এর Connect / Project Settings-এর API অংশ থেকে Project URL এবং Publishable key কপি করুন। **Secret key বা service-role key ব্যবহার করবেন না।**

Netlify → আপনার project → Project configuration → Environment variables খুলুন। নিচের দুটি variable তৈরি করুন। Builds ও Functions দুটির scope-এই দিন; All scopes থাকলে সেটি ব্যবহার করতে পারেন। Production context-এ মান থাকতে হবে।

| Key ঘরে লিখবেন | Value ঘরে লিখবেন |
| --- | --- |
| `VITE_SUPABASE_URL` | শুধু আপনার প্রকৃত `https://…supabase.co` ঠিকানা |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | শুধু আপনার প্রকৃত `sb_publishable_…` public key |

**সবচেয়ে জরুরি:** Value ঘরে `VITE_SUPABASE_URL=` বা `VITE_SUPABASE_PUBLISHABLE_KEY=` লিখবেন না। Key আলাদা ঘরে থাকে। Value-তে শুধু URL বা key থাকবে। Quote `'` / `"` দেবেন না। `.env.example`-এর ফাঁকা মান কপি করে রেখে দেবেন না।

আপনার কাছে পুরোনো legacy anon JWT থাকলে সেটিও সমর্থিত; তার variable নাম `VITE_SUPABASE_ANON_KEY` হতে পারে। নতুন সেটআপে উপরকার Publishable নামটাই ব্যবহার করুন।

এই package ভুল/অসম্পূর্ণ public configuration build-এর সময় পরীক্ষা করে। কোনো secret ঢুকলে build থামাবে। কোনো Supabase তথ্যই না দিলে পরিচিত CV preview তৈরি হবে; তখন admin login চালু হবে না।

## ৮. Deploy ও redeploy

প্রথম deploy চালান। Variable পরিবর্তনের পরে Netlify → Deploys → Trigger deploy → নতুন build/deploy চালান। Published/Ready হলে site খুলুন। পুরোনো tab হলে refresh করুন।

শুধু আগে বানানো build আবার publish করলে নতুন variable ঢোকে না; নতুন build দরকার। Build log-এ configuration error এলে variable-এর **নাম, scope ও শুধু-মান** ঠিক আছে কি না দেখুন।

## ৯. Auth redirect ও admin login

Supabase → Authentication → URL Configuration-এ:

- Site URL: আপনার নতুন Netlify website-এর origin, যেমন নিজের আসল `https://…netlify.app` ঠিকানা।
- Redirect URLs: সেই domain-এর শেষে `/admin/reset-password` যোগ করে দিন।

এরপর `https://আপনার-আসল-ডোমেইন/admin` খুলে step 4-এর email/password দিন। Supabase project ও user যেন একই project-এর হয়। Admin allowlist-এ UUID থাকা চাই।

Dashboard → SEO-তে canonical site URL আপনার নতুন domain করুন। Website tab থেকে homepage, story, যোগাযোগের তথ্য ও ছবি edit করতে পারবেন। Blog/Portfolio থেকে নিজের আসল নতুন কাজ প্রকাশ করুন।

## ১০. Contact form চালু করুন — login কাজ করার পরে

Website ও admin login আগে পরীক্ষা করুন। এরপর Cloudflare Turnstile widget তৈরি করে নতুন domain যোগ করুন।

Netlify-তে public variable:

```text
VITE_TURNSTILE_SITE_KEY
```

Supabase Edge Function secrets-এ:

| Secret name | কী দেবেন |
| --- | --- |
| `TURNSTILE_SECRET_KEY` | আপনার Turnstile secret |
| `CONTACT_RATE_SALT` | নিজের তৈরি দীর্ঘ random value |
| `ALLOWED_ORIGINS` | নিজের website-এর exact origin; একাধিক হলে comma দিয়ে আলাদা |

Supabase CLI দিয়ে `supabase functions deploy contact` চালাতে হবে। CLI ব্যবহার না করলে Supabase-এর function editor দিয়ে এই package-এর `supabase/functions/contact/index.ts`-এর সমতুল্য function deploy করুন এবং public endpoint-এর JWT verification setting config.toml অনুযায়ী রাখুন। বিস্তারিত `SETUP.md`-এ আছে।

Turnstile ও contact function না বসানো পর্যন্ত form কাজ করবে না; email link ব্যবহার করা যাবে। Reset email-এর নির্ভরযোগ্য delivery-এর জন্য Supabase SMTP configuration-ও প্রয়োজন।

## সমস্যা হলে এই ক্রমে দেখুন

| সমস্যা | কী দেখবেন |
| --- | --- |
| Admin-এ Connection required | Build-এর আগে দুইটি public variable দেওয়া হয়েছিল কি না |
| Relation private.admin_users does not exist | একই Supabase project-এ 001 চালানো হয়েছে কি না |
| Invalid UUID | Placeholder পুরো মুছে প্রকৃত UID বসানো হয়েছে কি না |
| No admin access | Auth user-এর UUID private.admin_users-এ আছে কি না |
| Content could not be loaded | সঠিক project URL/key, migrations, main settings row ও published content আছে কি না |
| Configuration error | Value-তে ভুল করে KEY= বা secret key ঢুকেছে কি না |
| Build fails to find package.json | GitHub/Netlify base directory সঠিক কি না |
| Blog/admin refresh-এ 404 | netlify.toml এবং Git build deployment আছে কি না |
| Contact form fails | Turnstile hostname, secrets, allowed origin ও deployed contact function |

এই ZIP-এর design/content আগের সর্বশেষ version থেকে রাখা হয়েছে। Private password, API secret, live inquiry বা live database backup অন্তর্ভুক্ত নয়। আগের কোনো live project নিজে থেকে মুছে ফেলার প্রয়োজন নেই।

## সার্টিফিকেট সেকশন

আগের 001–003 চালানো database হলে শুধু `004_certificates.sql` চালান। নতুন database হলে 001–004 ক্রমানুসারে চালান। Admin → Certificates থেকে সার্টিফিকেট যোগ, সম্পাদনা, ক্রম পরিবর্তন, publish/unpublish বা মুছতে পারবেন। Admin → Website-এ সেকশনের heading ও description বদলাতে পারবেন।

প্রতিটি সার্টিফিকেটে title, organization, period, category, description, image ও alt text দিন। Media library-তে আপলোড করা ছবির `media://` reference image ঘরে বসান। thumbnail এবং original ঐচ্ছিক; নতুন ছবি দিলে পুরোনো thumbnail/original reference মুছে দিন বা নতুনটি বসান। original-এ স্ক্যান ডাউনলোড করার public URL দেওয়া যায়। পাবলিক ওয়েবসাইটে draft দেখা যায় না।

## Undergraduate thesis

বিশ্ববিদ্যালয়ের credentials-এর নিচে Research সেকশন যোগ হয়েছে। আগে 001–004 চালানো থাকলে শুধু `005_undergraduate_thesis.sql` চালান। নতুন database-এ 001–005 ক্রমানুসারে চালান। Admin → Website-এ Thesis লেখা ঘরগুলো থেকে শিরোনাম, বিবরণ, লেখকদের তালিকা (প্রতি লাইনে একজন), supervisors, ছবি, PDF URL ও ফলাফল বদলাতে পারবেন। Thesis Mobile Net / Thesis Inception ঘরে 0–100 এর মধ্যে সংখ্যামাত্র দিন। প্রকাশিত 95 ও 93 হলো paper-এর Table 4.1-এর peak accuracy; YOLOv5-এর metric নয়।

পুরো আসল PDF `public/research/avijit-gharamy-undergraduate-thesis.pdf`-এ আছে। Figure 5.15 থেকে নেওয়া detection image-টিও একই ফোল্ডারে। Netlify-তে নতুন source deploy করতে হবে, migration একা frontend বদলায় না।

## Gargantua hero animation

হিরোর Pluto–Charon অ্যানিমেশনটি Gargantua-inspired black hole দিয়ে বদলানো হয়েছে। রঙিন spiral galaxy-এর সামনে বড় black hole ও চলমান আলোর disk আছে। অ্যানিমেশনটি Canvas দিয়ে চলে; WebGL প্রয়োজন হয় না। CSS fallback-ও রাখা হয়েছে। Reduced motion চালু থাকলে নড়াচড়া বন্ধ থাকে। এই visual পরিবর্তনের জন্য নতুন SQL migration নেই; source deploy করলেই বদলাবে। “Be Like Pluto” গল্পটি রাখা হয়েছে। Research team-এর দৃশ্যমান তালিকায় শুধু Avijit Gharamy এবং আগের supervisor/co-supervisor-এর তথ্য আছে; মূল thesis PDF অপরিবর্তিত।
