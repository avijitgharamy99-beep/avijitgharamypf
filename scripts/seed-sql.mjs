import { writeFileSync } from "node:fs";
import { seed } from "../src/seed.js";
const quote = (v) => "'" + JSON.stringify(v).replaceAll("'", "''") + "'::jsonb";
let sql =
  "-- Generated from the supplied CV. Do not rerun over edited content.\nbegin;\n";
sql += `insert into public.site_settings(id,data) values('main',${quote(seed.settings)}) on conflict(id) do nothing;\n`;
for (const kind of [
  "experience",
  "skills",
  "credentials",
  "services",
  "posts",
  "projects",
])
  for (const r of seed[kind]) {
    const { id, published, sort_order, ...data } = r;
    sql += `insert into public.content(kind,data,published,sort_order) values('${kind}',${quote(data)},${published},${sort_order});\n`;
  }
sql += "commit;\n";
writeFileSync(
  new URL("../supabase/migrations/002_seed_cv.sql", import.meta.url),
  sql,
);
