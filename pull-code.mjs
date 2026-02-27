// pull-code.mjs — Puxa arquivos do Supabase KV para o Codespace
// Uso: node pull-code.mjs

import fs from "fs";
import path from "path";

const SUPABASE_URL = "https://ieieohtnaymykxiqnmlc.supabase.co";
const SERVER_BASE = `${SUPABASE_URL}/functions/v1/make-server-6c28e0e2`;
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllaWVvaHRuYXlteWt4aXFubWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0OTQ1NzMsImV4cCI6MjA4NjA3MDU3M30.32LjQe1dQLGAfbyfK8KkjNlXOGkZGaWEgI20y3gl3Hc";

const PREFIX = "code_deploy:";

async function main() {
  console.log("Conectando ao Supabase KV...");
  console.log(`   Endpoint: ${SERVER_BASE}/deploy-list`);

  const res = await fetch(`${SERVER_BASE}/deploy-list?prefix=${PREFIX}`, {
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

  if (json.count === 0) {
    console.log("Nenhum arquivo com prefixo", PREFIX);
    console.log("Rode o DeployBridge no Figma Make primeiro.");
    process.exit(0);
  }

  let ok = 0;
  let errs = 0;

  for (const file of json.files) {
    try {
      const filePath = file.key.replace(PREFIX, "");
      const content = typeof file.value === "string"
        ? file.value
        : JSON.stringify(file.value, null, 2);

      const dir = path.dirname(filePath);
      if (dir && dir !== ".") {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(filePath, content, "utf-8");
      console.log(`  OK ${filePath}`);
      ok++;
    } catch (err) {
      console.error(`  ERRO ${file.key}: ${err.message}`);
      errs++;
    }
  }

  console.log(`\nConcluido: ${ok} escritos, ${errs} erros`);
}

main().catch((err) => {
  console.error("Falha fatal:", err);
  process.exit(1);
});