import { readSupabaseConfig } from "./public-config.mjs";
import { xmlEscape } from "./sitemap.mjs";
export function injectMetadata(
  html,
  { title, description, image, url, noindex = false },
) {
  const esc = xmlEscape;
  let output = html.replace(
    /<title>[^<]*<\/title>/i,
    "<title>" + esc(title) + "</title>",
  );
  output = output.replace(
    /<meta\s+(?:name="description"|property="og:[^"]*")[^>]*>/gi,
    "",
  );
  const tags =
    `<meta name="description" content="${esc(description || "")}"/><meta property="og:title" content="${esc(title)}"/><meta property="og:description" content="${esc(description || "")}"/><meta property="og:type" content="website"/><meta property="og:url" content="${esc(url)}"/><meta name="twitter:card" content="summary_large_image"/><link rel="canonical" href="${esc(url)}"/>` +
    (image ? `<meta property="og:image" content="${esc(image)}"/>` : "") +
    (noindex ? '<meta name="robots" content="noindex, nofollow"/>' : "");
  return output.replace("</head>", tags + "</head>");
}
export async function renderPage(origin, env, kind, slug, html) {
  if (!html) throw Error("Production template is missing; run npm run build.");
  const { url: sb, key, configured } = readSupabaseConfig(env);
  if (!configured) return { html, status: 200 };
  const headers = { apikey: key };
  const request = async (path) => {
    const r = await fetch(sb + "/rest/v1/" + path, {
      headers,
      signal: AbortSignal.timeout(10000),
    });
    if (!r.ok) throw Error("Metadata unavailable");
    return r.json();
  };
  const settingsPromise = request("site_settings?id=eq.main&select=data");
  const pagePromise = kind
    ? request(
        "content?select=data&published=eq.true&kind=eq." +
          kind +
          "&data->>slug=eq." +
          encodeURIComponent(slug),
      )
    : Promise.resolve(null);
  const [settings, rows] = await Promise.all([settingsPromise, pagePromise]);
  const s = settings[0]?.data || {};
  if (kind && !rows?.length)
    return {
      html: injectMetadata(html, {
        title: "Page not found",
        description: "This page is unavailable.",
        url: origin + "/",
        noindex: true,
      }),
      status: 404,
    };
  const p = rows?.[0]?.data;
  let canonical;
  try {
    canonical = new URL(s.siteUrl || origin).origin;
  } catch {
    canonical = new URL(origin).origin;
  }
  const url =
    canonical +
    (kind
      ? (kind === "posts" ? "/journal/" : "/work/") + encodeURIComponent(slug)
      : "/");
  let image = p?.image || s.ogImage;
  if (image?.startsWith("media://")) {
    const r = await fetch(
      sb + "/storage/v1/object/sign/portfolio-media/" + image.slice(8),
      {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ expiresIn: 3600 }),
      },
    );
    if (r.ok) {
      const data = await r.json();
      image = sb + "/storage/v1" + data.signedURL;
    } else image = "";
  } else if (image) image = new URL(image, canonical).href;
  return {
    html: injectMetadata(html, {
      title: p?.seoTitle || p?.title || s.seoTitle,
      description: p?.seoDescription || p?.description || s.seoDescription,
      image,
      url,
    }),
    status: 200,
  };
}
