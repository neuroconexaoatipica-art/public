import "dotenv/config";
// pull-code.mjs — Ponte Supabase: puxa arquivos de code_deploy
import { createClient } from "@supabase/supabase-js";
import { writeFileSync, mkdirSync } from "fs";
import { dirname } from "path";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente");
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

async function pull() {
  const { data, error } = await sb
    .from("code_deploy")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) { console.error("❌ Erro ao buscar:", error.message); process.exit(1); }
  if (!data || data.length === 0) { console.log("✅ Nenhum arquivo pendente."); return; }

  console.log(`📦 ${data.length} arquivo(s) pendente(s):\n`);

  for (const row of data) {
    try {
      mkdirSync(dirname(row.file_path), { recursive: true });
      writeFileSync(row.file_path, row.file_content, "utf-8");
      console.log(`  ✅ ${row.file_path}`);

      await sb
        .from("code_deploy")
        .update({ status: "pulled", pulled_at: new Date().toISOString() })
        .eq("id", row.id);
    } catch (err) {
      console.error(`  ❌ ${row.file_path}: ${err.message}`);
      await sb
        .from("code_deploy")
        .update({ status: "error" })
        .eq("id", row.id);
    }
  }

  console.log("\n🎉 Ponte concluída!");
}

pull();