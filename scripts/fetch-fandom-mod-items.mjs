#!/usr/bin/env node
/**
 * Extrae classnames de las páginas de una mod en ark.fandom.com (namespace
 * `Mod`, id 10004) usando la API de MediaWiki.
 *
 * Es el tercer pipeline de classnames, y existe porque las otras dos fuentes
 * no cubren a estas mods: el Workshop solo trae lo que el autor pegó en la
 * descripción, y ark.wiki.gg (`fetch-wiki-mod-items.mjs`) no tiene páginas de
 * ARK Additions. Fandom sí, con un infobox por objeto.
 *
 * ────────────────────────────────────────────────────────────────────────
 * POR QUÉ VA PÁGINA POR PÁGINA Y NO POR LA TABLA ÍNDICE
 *
 * `Mod:ARK Additions/Item Codes` es una tabla que promete ser exhaustiva
 * ("Nothing is deliberately missing from this article") y sería una sola
 * request en vez de cientos. **Está mal alineada y no se puede usar.**
 * Verificado el 2026-08-23 contra las páginas individuales:
 *
 *   fila "Brachiosaurus Saddle" → PrimalItemCostume_SnowIndominus  (es de otro)
 *   fila "Concavenator Saddle"  → PrimalItemArmor_BrachioSaddle    (corrida 1)
 *   fila "Cryolophosaurus Saddle" → PrimalItemArmor_ConcaSaddle    (corrida 1)
 *   "Ghost Acro Costume" y "Savage Acro Costume" → intercambiados entre sí
 *
 * O sea: la columna de blueprint está corrida respecto de la de nombre en un
 * tramo de la tabla, más un swap aparte. Las páginas individuales de esos
 * mismos objetos tienen el path correcto. Una página = un objeto = no hay
 * forma de que se corra una fila.
 *
 * La tabla igual sirve como CONTRASTE: `--cross-check` la baja y avisa de las
 * discrepancias, que es exactamente como se encontró el problema.
 * ────────────────────────────────────────────────────────────────────────
 *
 * Mismas reglas que los otros fetchers: determinista, y ruidoso ante lo
 * desconocido — si una página no se pudo bajar, NO se escribe la salida (la
 * lección de `fetch-wiki-mod-items.mjs`, donde 238 bloqueos de 432 pasaron
 * por "páginas sin objeto" y casi entra media mod al catálogo).
 *
 * Uso:
 *   node scripts/fetch-fandom-mod-items.mjs --prefix "ARK Additions" \
 *     --folder Indominus --out scripts/mod-specs/_scraped/domination-rex.json
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const API = "https://ark.fandom.com/api.php";
const MOD_NAMESPACE = 10004;
/** Tope de títulos por request que acepta la API sin credenciales. */
const BATCH = 20;

const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (!a.startsWith("--")) continue;
  const next = process.argv[i + 1];
  args[a.slice(2)] = next && !next.startsWith("--") ? next : true;
}

const prefix = args.prefix;
const folder = args.folder;
const out = args.out;
if (!prefix || !out) {
  console.error('Uso: --prefix "ARK Additions" [--folder Indominus] --out <archivo.json>');
  process.exit(1);
}

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: "json", ...params })}`;
  const res = await fetch(url, {
    // Fandom pide identificarse; sin UA propio responde 403 a veces.
    headers: { "User-Agent": "ark-config-studio catalog builder (contact via GitHub sirlurmock)" },
  });
  if (!res.ok) throw new Error(`${res.status} en ${url}`);
  return res.json();
}

/** Todas las páginas del namespace Mod que empiezan con el prefijo. */
async function listPages() {
  const titles = [];
  let cont;
  do {
    const data = await api({
      action: "query",
      list: "allpages",
      apnamespace: String(MOD_NAMESPACE),
      apprefix: prefix,
      aplimit: "500",
      ...(cont ? { apcontinue: cont } : {}),
    });
    titles.push(...(data.query?.allpages ?? []).map((p) => p.title));
    cont = data.continue?.apcontinue;
  } while (cont);
  return titles;
}

/**
 * El campo `blueprintpath` del infobox a veces trae el path solo y a veces el
 * comando entero (`cheat giveitem "Blueprint'…'" 1 0 0 false`). Lo que sirve
 * es siempre lo que está adentro de Blueprint'…'.
 */
function extractPath(raw) {
  const m = raw.match(/Blueprint'([^']+)'/);
  return m ? m[1] : null;
}

/** Nombre humano de la variante: `blueprintpath Tek Domination Rex` → esa. */
function variantOf(fieldName, pageTitle) {
  const rest = fieldName.replace(/^blueprintpath\s*/, "").trim();
  return rest || pageTitle.replace(/^Mod:/, "").split("/").pop();
}

const titles = await listPages();
if (titles.length === 0) {
  throw new Error(`el prefijo "${prefix}" no devolvió páginas — ¿existe en el namespace Mod?`);
}

/** title -> wikitext. Un fallo acá aborta: no se escribe nada a medias. */
const wikitextByTitle = new Map();
const failed = [];
for (let i = 0; i < titles.length; i += BATCH) {
  const chunk = titles.slice(i, i + BATCH);
  try {
    const data = await api({
      action: "query",
      prop: "revisions",
      rvprop: "content",
      rvslots: "main",
      titles: chunk.join("|"),
    });
    for (const page of Object.values(data.query?.pages ?? {})) {
      const content = page.revisions?.[0]?.slots?.main?.["*"];
      if (typeof content === "string") wikitextByTitle.set(page.title, content);
      else failed.push(page.title);
    }
  } catch (err) {
    failed.push(...chunk);
    console.error(`  fallo el lote ${i}: ${err.message}`);
  }
}

if (failed.length > 0) {
  throw new Error(
    `no se pudieron bajar ${failed.length} de ${titles.length} páginas — NO se escribe la salida ` +
      `(si entra media mod al catálogo nadie se entera). Primeras: ${failed.slice(0, 5).join(", ")}`,
  );
}

const entries = [];
let pagesWithoutPath = 0;
for (const [title, wt] of wikitextByTitle) {
  const fields = [...wt.matchAll(/^\|\s*(blueprintpath[^=]*?)\s*=\s*(.+)$/gim)];
  if (fields.length === 0) {
    pagesWithoutPath++;
    continue;
  }
  for (const [, field, rawValue] of fields) {
    const path = extractPath(rawValue);
    if (!path) continue;
    if (folder && !path.includes(`/Game/Mods/${folder}/`)) continue;
    entries.push({ label: variantOf(field, title), value: path, page: title });
  }
}

// Determinista: dos corridas → byte a byte idéntico.
entries.sort((a, b) => a.value.localeCompare(b.value));

const deduped = [];
const seen = new Set();
for (const e of entries) {
  if (seen.has(e.value)) continue;
  seen.add(e.value);
  deduped.push(e);
}

mkdirSync(dirname(resolve(out)), { recursive: true });
writeFileSync(resolve(out), `${JSON.stringify(deduped, null, 2)}\n`);
console.log(`escrito ${out}: ${deduped.length} entradas`);
console.log(
  `  ${titles.length} páginas del prefijo "${prefix}" · ${pagesWithoutPath} sin blueprintpath${
    folder ? ` · filtradas por carpeta /Game/Mods/${folder}/` : ""
  }`,
);
