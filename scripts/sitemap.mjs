import { readSupabaseConfig } from "./public-config.mjs";
export const xmlEscape = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
export function makeSitemap(origin, rows = []) {
  const base = new URL(origin);
  if (!["https:", "http:"].includes(base.protocol))
    throw Error("Invalid site URL");
  return (
    '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    [
      { loc: base.origin + "/" },
      ...rows
        .filter(
          (r) =>
            r.published &&
            ["posts", "projects"].includes(r.kind) &&
            r.data?.slug,
        )
        .map((r) => ({
          loc:
            base.origin +
            (r.kind === "posts" ? "/journal/" : "/work/") +
            encodeURIComponent(r.data.slug),
          lastmod: r.updated_at,
        })),
    ]
      .map(
        (r) =>
          "<url><loc>" +
          xmlEscape(r.loc) +
          "</loc>" +
          (r.lastmod ? "<lastmod>" + xmlEscape(r.lastmod) + "</lastmod>" : "") +
          "</url>",
      )
      .join("") +
    "</urlset>"
  );
}
export async function sitemapResponse(origin, env) {
  const { url, key, configured } = readSupabaseConfig(env);
  if (!configured) return makeSitemap(origin);
  const headers = { apikey: key };
  const responses = await Promise.all([
    fetch(
      url +
        "/rest/v1/content?select=kind,data,published,updated_at&published=eq.true&kind=in.(posts,projects)",
      { headers },
    ),
    fetch(url + "/rest/v1/site_settings?id=eq.main&select=data", { headers }),
  ]);
  if (responses.some((r) => !r.ok)) throw Error("Sitemap data unavailable");
  const [rows, settings] = await Promise.all(responses.map((r) => r.json()));
  return makeSitemap(settings[0]?.data.siteUrl || origin, rows);
}
