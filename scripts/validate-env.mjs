import { loadEnv } from "vite";
import { readSupabaseConfig } from "./public-config.mjs";
try {
  const config = readSupabaseConfig({
    ...loadEnv("production", process.cwd(), ""),
    ...process.env,
  });
  console.log(
    config.configured
      ? "Public Supabase configuration validated."
      : "No Supabase values supplied: building the CV preview. Configure the two public values before a live CMS deployment.",
  );
} catch (error) {
  console.error("Configuration error: " + error.message);
  process.exit(1);
}
