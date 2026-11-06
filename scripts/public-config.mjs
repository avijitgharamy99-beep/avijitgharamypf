// Shared validation; these are public browser settings, never service credentials.
export function readSupabaseConfig(env) {
  const url = (env.VITE_SUPABASE_URL || "").trim();
  const key = (
    env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    env.VITE_SUPABASE_ANON_KEY ||
    ""
  ).trim();
  if (!url && !key) return { url: "", key: "", configured: false };
  if (!url)
    throw Error(
      "Missing VITE_SUPABASE_URL. Set the project URL in Netlify environment variables.",
    );
  if (!key)
    throw Error(
      "Missing VITE_SUPABASE_PUBLISHABLE_KEY. Use the public publishable key (or legacy anon key).",
    );
  if (/^\s*VITE_[A-Z_]+\s*=/.test(url) || /^\s*VITE_[A-Z_]+\s*=/.test(key))
    throw Error(
      "Environment Value must contain only the URL or key. Do not paste VITE_...= into the Value field.",
    );
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw Error("VITE_SUPABASE_URL must be a complete http(s) project URL.");
  }
  if (
    !["https:", "http:"].includes(parsed.protocol) ||
    parsed.username ||
    parsed.password ||
    parsed.search ||
    parsed.hash ||
    (parsed.pathname && parsed.pathname !== "/")
  )
    throw Error(
      "VITE_SUPABASE_URL must contain only the project origin, without a path, query, username or password.",
    );
  if (key.startsWith("sb_secret_"))
    throw Error(
      "A secret key must never be used in VITE_ settings. Use the publishable key instead.",
    );
  if (!/^sb_publishable_[A-Za-z0-9_-]+$/.test(key)) {
    let payload;
    try {
      payload = JSON.parse(
        atob(key.split(".")[1].replaceAll("-", "+").replaceAll("_", "/")),
      );
    } catch {
      throw Error(
        "The public Supabase key is not a publishable key or legacy anon JWT.",
      );
    }
    if (payload.role !== "anon")
      throw Error(
        "Only a publishable key or legacy anon key is allowed in VITE_ settings.",
      );
  }
  return { url: parsed.origin, key, configured: true };
}
