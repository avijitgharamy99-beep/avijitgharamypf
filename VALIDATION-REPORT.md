# Validation

Production build passed. All 21 automated tests passed, covering database migrations, RLS, authorization, publication, contacts, SEO and deployment handlers. Migration 004 adds seven certificates; published documents are public, unauthorized writes and draft reads are rejected.

Browser checks passed for desktop, tablet and mobile gallery layouts, category filtering, full-size view, next document, zoom and Escape close. Mobile layout had no horizontal overflow. Admin preview lists all seven entries. Original scans and previous public assets are preserved.

Live Supabase login, storage and Netlify deployment require the owner’s service configuration and were not tested against production. Follow START-HERE-BN.md. This package contains no live database export or production secrets.

Thesis: original PDF preserved byte-for-byte. Rendered source pages 33 and 43 visually checked for Table 4.1 and Figure 5.15. Mobile and tablet research layouts, paper links and research-team disclosure checked in the browser. Migration 005 and anonymous settings protection are covered by the database test. Live Supabase/Netlify configuration remains owner-managed.

Black hole hero: animated Canvas fallback visually checked at desktop/mobile widths; mobile has no horizontal overflow. QA browser does not provide WebGL, so GPU shader rendering was not browser-tested. Reduced-motion handling and renderer cleanup reviewed in code. Research team display now shows only Avijit, retaining supervisor/co-supervisor. Original thesis file is unchanged.

Latest galaxy redesign supersedes the earlier GPU implementation: full animation now uses Canvas on all devices, and unused Three.js was removed. Desktop/mobile visual checks passed; mobile document width matches the viewport. Prior GPU-path limitation no longer applies.
