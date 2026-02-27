// pull-code.mjs — Puxa arquivos do Supabase KV (via base64) para o Codespace
// Uso: node pull-code.mjs

import fs from "fs";
import path from "path";

const SUPABASE_URL = "https://ieieohtnaymykxiqnmlc.supabase.co";
const SERVER_BASE = `${SUPABASE_URL}/functions/v1/make-server-6c28e0e2`;
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllaWVvaHRuYXlteWt4aXFubWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0OTQ1NzMsImV4cCI6MjA4NjA3MDU3M30.32LjQe1dQLGAfbyfK8KkjNlXOGkZGaWEgI20y3gl3Hc";

async function main() {
  console.log("Baixando arquivos via base64 (a prova de corrupcao)...\n");

  const res = await fetch(`${SERVER_BASE}/deploy-download?prefix=code_deploy:`, {
    headers: { Authorization: `Bearer ${ANON_KEY}` },
  });

  if (!res.ok) {
    console.error(`Erro HTTP ${res.status}: ${await res.text()}`);
    process.exit(1);
  }

  const json = await res.json();

  if (!json.ok) {
    console.error("Erro do servidor:", json.error);
    process.exit(1);
  }

  console.log(`Encontrados ${json.count} arquivos\n`);

  let ok = 0;
  let errs = 0;

  for (const file of json.files) {
    try {
      const content = Buffer.from(file.base64, "base64").toString("utf-8");

      const dir = path.dirname(file.path);
      if (dir && dir !== ".") {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(file.path, content, "utf-8");
      console.log(`  OK  ${file.path}`);
      ok++;
    } catch (err) {
      console.error(`  ERRO ${file.path}: ${err.message}`);
      errs++;
    }
  }

  console.log(`\nConcluido: ${ok} escritos, ${errs} erros`);
}

main().catch((err) => {
  console.error("Falha fatal:", err);
  process.exit(1);
});
