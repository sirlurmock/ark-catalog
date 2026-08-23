#!/usr/bin/env node
import { spawnSync } from "node:child_process";
/**
 * Puebla `classNames.items` de un spec desde el índice de una mod en
 * ark.wiki.gg, que le dedica **una página a cada objeto** con su blueprint
 * path verbatim (prompt 22).
 *
 * Es la vía para las mods de estructuras, que son las más grandes del catálogo
 * y las únicas que seguían sin classnames: Structures Plus tiene 458 páginas de
 * objeto y Super Structures 432. Ninguna de las dos publica sus paths en la
 * hoja de config del autor —ahí solo hay ajustes— y arkcodes no sirve porque
 * documenta las versiones ASA (ver el README de mod-specs).
 *
 * Todo lo descargado se cachea en `_scraped/wiki-cache/`, así que repetir la
 * corrida no vuelve a pedir nada. Entre pedido y pedido hay una pausa: son ~900
 * páginas de un wiki comunitario y no hay ninguna prisa.
 *
 * Uso:
 *   node scripts/fetch-wiki-mod-items.mjs \
 *     --page "Mod:Super_Structures" --spec scripts/mod-specs/super-structures.json
 *
 * Flags:
 *   --dry-run      imprime lo encontrado sin tocar el spec
 *   --delay <ms>   pausa entre pedidos (default 350)
 *   --limit <n>    corta después de N páginas, para probar
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { itemPageLinks, parseWikiItemPage } from "./lib/parse-wiki-item-page.mjs";

const WIKI = "https://ark.wiki.gg";
const CACHE = "scripts/mod-specs/_scraped/wiki-cache";
/**
 * Se baja con `curl`, no con el `fetch` de Node.
 *
 * El wiki responde **403 a undici** por más que se le copien todas las
 * cabeceras de un navegador —User-Agent, Accept, Accept-Language, Sec-Fetch-*—
 * y **200 a curl** con solo el User-Agent. O sea que no mira las cabeceras sino
 * el cliente TLS. Es la misma familia de problema que el 402 de Fandom anotado
 * el 2026-08-20, pero la solución de aquella vez (firmar el UA) acá no alcanza.
 */
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function parseArgs(argv) {
  const out = { flags: new Set() };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) out.flags.add(key);
    else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
if (!args.page || !args.spec) {
  console.error("Faltan flags: --page y --spec. Ver el encabezado del script.");
  process.exit(1);
}

const delay = Number.parseInt(args.delay ?? "350", 10);
const limit = args.limit ? Number.parseInt(args.limit, 10) : Number.POSITIVE_INFINITY;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Nombre de archivo seguro para cachear una ruta del wiki. */
function cacheName(wikiPath) {
  return `${wikiPath.replace(/^\/wiki\//, "").replace(/[^A-Za-z0-9_.\-]/g, "_")}.html`;
}

async function fetchCached(wikiPath) {
  const dir = join(CACHE, args.page.replace(/[^A-Za-z0-9_.\-]/g, "_"));
  mkdirSync(dir, { recursive: true });
  const file = join(dir, cacheName(wikiPath));
  if (existsSync(file)) return { html: readFileSync(file, "utf8"), cached: true };

  // Hay que separar tres respuestas, porque significan cosas distintas:
  //   200 → la página; se cachea.
  //   404 → el índice enlaza una página que no existe (pasa: Homestead
  //         Conversion). No es un agujero, no hay nada que bajar.
  //   403 → el wiki nos está frenando. La primera corrida se comió 238 de 432
  //         así, y como se contaban junto con "sin objeto" el resultado parecía
  //         normal. Se reintenta con espera creciente y, si igual falla, el que
  //         llama se entera.
  //
  // Por eso no se usa `--fail`, que colapsa todos los códigos en el mismo
  // error: el status se pide aparte y se decide con él.
  let lastError = null;
  for (let attempt = 0; attempt < 4; attempt++) {
    if (attempt > 0) await sleep(delay * 8 * attempt);
    const out = spawnSync(
      "curl",
      ["-sS", "-L", "--max-time", "30", "-A", UA, "-w", "\\n%{http_code}", `${WIKI}${wikiPath}`],
      { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 },
    );
    if (out.status !== 0) {
      lastError = `curl salió ${out.status}: ${(out.stderr ?? "").trim()}`;
      continue;
    }
    const cut = out.stdout.lastIndexOf("\n");
    const status = out.stdout.slice(cut + 1).trim();
    const body = out.stdout.slice(0, cut);

    if (status === "200") {
      writeFileSync(file, body);
      await sleep(delay);
      return { html: body, cached: false };
    }
    if (status === "404") {
      await sleep(delay);
      return { html: null, cached: false, missing: true };
    }
    lastError = `HTTP ${status}`;
  }
  throw new Error(`${wikiPath} — ${lastError}`);
}

const indexPath = `/wiki/${args.page}`;
console.log(`índice: ${WIKI}${indexPath}`);
const { html: indexHtml } = await fetchCached(indexPath);
const links = itemPageLinks(indexHtml, args.page).slice(0, limit);
console.log(`${links.length} páginas enlazadas\n`);

const items = [];
// Tres cosas distintas que ANTES se contaban juntas como "paginas sin objeto",
// y por eso una corrida a la que el wiki le bloqueo 238 paginas parecio normal:
//   - fetchErrors: no se pudo bajar. Es un agujero en los datos.
//   - noItem:      se bajo y no tiene objeto. Es esperable (features, conversiones).
//   - mismatched:  se bajo y el path esta mal escrito EN LA FUENTE.
const fetchErrors = [];
const noItem = [];
const mismatched = [];
const repaired = [];
let downloaded = 0;

for (const [i, link] of links.entries()) {
  let page;
  try {
    page = await fetchCached(link);
  } catch (err) {
    fetchErrors.push(err.message);
    continue;
  }
  if (page.missing) {
    // El indice enlaza una pagina que no existe: no hay objeto que catalogar.
    noItem.push(`${link} (404)`);
    continue;
  }
  if (!page.cached) downloaded++;

  const entry = parseWikiItemPage(page.html);
  // Los índices mezclan páginas de objeto con páginas de feature y de
  // conversión: que una no traiga blueprint path es normal, no un error.
  if (!entry) {
    noItem.push(link);
    continue;
  }
  if (entry.mismatch) {
    mismatched.push(`${link} - ${entry.mismatch.asset} vs ${entry.mismatch.leaf}`);
    continue;
  }
  if (entry.repaired) {
    repaired.push(`${entry.label}: ${entry.repaired.from} -> ${entry.repaired.to}`);
  }
  items.push({ value: entry.value, label: entry.label });

  if ((i + 1) % 50 === 0) console.log(`  ${i + 1}/${links.length}…`);
}

// Orden estable por path, para que el diff de una regeneración sea revisable.
items.sort((a, b) => (a.value < b.value ? -1 : a.value > b.value ? 1 : 0));

// Un mismo objeto puede tener dos páginas (alias, redirecciones): gana el
// primero y el duplicado no llega al catálogo.
const seen = new Set();
const unique = items.filter((it) => {
  const k = it.value.toLowerCase();
  if (seen.has(k)) return false;
  seen.add(k);
  return true;
});

console.log(`\n${unique.length} objetos con path (${downloaded} descargados, el resto de caché)`);
console.log(`${noItem.length} paginas sin objeto (features y conversiones)`);
if (repaired.length > 0) {
  console.log(`
${repaired.length} con el ultimo caracter comido por el wiki, reparados:`);
  for (const r of repaired) console.log(`  ${r}`);
}
if (mismatched.length > 0) {
  console.log(`\n${mismatched.length} con el path mal escrito EN LA WIKI, excluidos:`);
  for (const m of mismatched) console.log(`  ${m}`);
}
if (unique.length > 0) {
  console.log("\nprimeros 5:");
  for (const it of unique.slice(0, 5)) console.log(`  ${it.label}  ←  ${it.value}`);
}

// Un spec a medias es peor que no tener spec: la mod queda en el catalogo con
// la mitad de sus objetos y nada avisa. Antes esto se escribia igual.
if (fetchErrors.length > 0) {
  console.error(`\n✗ ${fetchErrors.length} páginas no se pudieron bajar. NO escribo el spec.`);
  for (const e of fetchErrors.slice(0, 10)) console.error(`  ${e}`);
  if (fetchErrors.length > 10) console.error(`  …y ${fetchErrors.length - 10} más`);
  console.error("\nLo bajado quedó en caché: volvé a correr y sigue donde quedó.");
  process.exit(1);
}

if (args.flags.has("dry-run")) {
  console.log("\n--dry-run: no toco el spec.");
  process.exit(0);
}

const spec = JSON.parse(readFileSync(args.spec, "utf8").replace(/^﻿/, ""));
spec.classNames = { ...(spec.classNames ?? {}), items: unique };
spec._classnamesSource = {
  ...(spec._classnamesSource ?? {}),
  items: {
    url: `${WIKI}${indexPath}`,
    fetchedAt: new Date().toISOString().slice(0, 10),
    note: `Una página por objeto en ark.wiki.gg, cada una con su blueprint path verbatim en el spawn command. ${unique.length} objetos de ${links.length} páginas enlazadas; el resto son páginas de feature o de conversión, sin objeto. Generado por scripts/fetch-wiki-mod-items.mjs.`,
  },
};
writeFileSync(args.spec, `${JSON.stringify(spec, null, 2)}\n`);
console.log(`\nspec actualizado → ${args.spec}`);
