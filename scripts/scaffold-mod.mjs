#!/usr/bin/env node
/**
 * Genera el JSON de una mod a partir de su seccion en un `.ini` real.
 *
 * Catalogar una mod es mecanico salvo por las etiquetas: hay que declarar
 * `file`, `section`, `games`, `validIn` y un control por clave, y ademas
 * sumar las traducciones ES y EN con paridad estricta (hay un test que
 * falla si falta una). Escribir eso a mano para una mod de 40 parametros
 * es una tarde; con esto queda en revisar los textos.
 *
 * Lo que el script NO puede adivinar y hay que repasar a mano:
 *   - las etiquetas y descripciones (salen como placeholder)
 *   - si un default del dump del usuario es tambien el default de la mod
 *   - los rangos min/max, que salen de una heuristica conservadora
 *
 * Dos modos de entrada:
 *
 *   --ini   arranca de un dump real. Rapido para descubrir que expone una mod,
 *           pero solo ve las claves que ese usuario tenia escritas y los tipos
 *           salen inferidos del valor.
 *
 *   --spec  arranca de una tabla de documentacion ya transcrita a JSON, con
 *           tipos, rangos y textos ES/EN. Es lo que conviene cuando la mod
 *           esta documentada: cubre todas las claves, no solo las del dump.
 *           Los specs viven en scripts/mod-specs/ para poder regenerar.
 *
 * Uso:
 *   node scripts/scaffold-mod.mjs --ini tests/fixtures/user-gameusersettings-ase.ini \
 *     --section DinoStorage2 --game ase --name "Dino Storage v2" --prefix ds2
 *
 *   node scripts/scaffold-mod.mjs --spec scripts/mod-specs/dino-storage-v2.json --write-i18n
 *
 * Flags:
 *   --out <path>     destino del JSON (default: catalog/mods/<game>/community/<slug>.json)
 *   --write-i18n     inserta las claves en catalog/i18n/{es,en}.json (default: solo las imprime)
 *   --dry-run        no escribe nada
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { inferControl, inferTier, slugify, snake } from "./lib/infer-control.mjs";

// ---------------------------------------------------------------- argumentos

function parseArgs(argv) {
  const out = { flags: new Set() };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) {
      out.flags.add(key);
    } else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));

if (!args.spec) {
  const required = ["ini", "section", "game", "name"];
  const missing = required.filter((k) => !args[k]);
  if (missing.length > 0) {
    console.error(`Faltan flags: ${missing.map((m) => `--${m}`).join(", ")}`);
    console.error("Ver el encabezado del script para el uso completo.");
    process.exit(1);
  }
  if (args.game !== "ase" && args.game !== "asa") {
    console.error("--game tiene que ser 'ase' o 'asa'");
    process.exit(1);
  }
}

// -------------------------------------------------------------- lectura .ini

/** Devuelve las claves de una seccion, en orden y sin repetidos. */
function readSection(iniPath, sectionName) {
  const text = readFileSync(iniPath, "utf8").replace(/^﻿/, "");
  const entries = [];
  const seen = new Set();
  let inside = false;
  for (const line of text.split(/\r?\n/)) {
    const header = line.match(/^\s*\[(.+?)\]\s*$/);
    if (header) {
      inside = header[1].toLowerCase() === sectionName.toLowerCase();
      continue;
    }
    if (!inside) continue;
    const kv = line.match(/^([A-Za-z_][\w.\-]*)\s*=\s*(.*)$/);
    if (!kv) continue;
    const [, key, rawValue] = kv;
    if (seen.has(key)) continue; // claves repetidas -> array, fuera de alcance
    seen.add(key);
    entries.push({ key, raw: rawValue.trim() });
  }
  return entries;
}

// -------------------------------------------------------------- modo --spec

/**
 * Donde ya vive la entrada de esta mod, si vive en algun lado.
 *
 * El destino por defecto es siempre `community/`, y eso alcanzaba mientras
 * todas las mods estuvieran ahi. Structures Plus no: es `source: "verified"` y
 * su archivo es `verified/731604991-structures-plus.json`. Regenerarla sin
 * `--out` creaba un SEGUNDO archivo en `community/` con el mismo modId, y el
 * catalogo quedaba con la mod dos veces sin que nada avisara.
 *
 * Buscar por modId y escribir donde ya estaba es lo que hace que regenerar sea
 * seguro: si la entrada existe, se pisa la que existe.
 */
function existingEntryFor(spec) {
  const root = `catalog/mods/${spec.game}`;
  for (const folder of ["verified", "community"]) {
    const dir = `${root}/${folder}`;
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir)) {
      if (!name.endsWith(".json")) continue;
      const file = `${dir}/${name}`;
      try {
        const current = JSON.parse(readFileSync(file, "utf8"));
        if (current.modId === spec.modId) return file;
      } catch {
        // Un archivo que no parsea no es la entrada de esta mod.
      }
    }
  }
  return null;
}

/**
 * El spec ya trae tipo, rango y textos, asi que no hay nada que inferir: el
 * script solo arma la forma que espera el loader y reparte los textos a los
 * dos idiomas. Cortar por aca mantiene el modo --ini sin condicionales.
 */
function runSpecMode(specPath) {
  const spec = JSON.parse(readFileSync(specPath, "utf8").replace(/^﻿/, ""));
  const ns = spec.prefix;
  const category = `mod_${ns}`;

  const settings = spec.settings.map((s) => {
    // `section` es opcional y por setting: hay mods que reparten su config en
    // varias secciones del mismo `.ini` (Weapons+ usa tres). Sin override, cae
    // en `spec.section` y, si tampoco está, en el modId — que es el caso normal
    // porque casi siempre catalogamos usando el nombre de sección como modId.
    // Structures Plus rompe esa suposición: su modId es el ID del Workshop
    // (731604991) y su sección es [StructuresPlus], así que sin `spec.section`
    // las claves saldrían exportadas bajo `[731604991]` y ARK no leería una sola.
    // `alwaysEmit` es a nivel setting, no del control: el exporter escribe el
    // valor explícito aunque iguale el default del catálogo. Se usa cuando la
    // doc de la mod no declara el default real (ver README, convención de
    // `default`): con el flag, el valor que eligió el usuario llega al .ini
    // sin importar cuál sea el default interno de la mod.
    // `file` y `validIn` tambien son por setting, por el mismo motivo que
    // `section`: Creature Finder Deluxe documenta sus 5 ajustes de servidor en
    // GameUserSettings.ini y sus 4 teclas en [CFD] de Game.ini, que ademas son
    // del cliente y no tienen sentido en un dedicado (mismo criterio que los
    // ajustes de calidad grafica del catalogo core).
    const { key, kind, tier, es, en, section, file, validIn, alwaysEmit, ...rest } = s;
    // Los campos con guion bajo son notas para quien lee el spec (de que
    // criatura es cada clave en Kraken's Better Dinos, de donde salio un
    // default), no datos del catalogo. Misma regla que a nivel spec: lo que
    // empieza con `_` no se publica. Sin esto se colarian dentro de `control`,
    // que es donde cae todo el resto.
    const control = { kind };
    for (const [field, value] of Object.entries(rest)) {
      if (!field.startsWith("_")) control[field] = value;
    }
    // En un `enum` cada opción lleva su propia traducción. El spec las escribe
    // como `{ value, es, en }` y acá se convierten en `{ value, i18nKey }`,
    // que es lo que consume el control; los textos se emiten más abajo junto
    // con los del setting.
    if (kind === "enum") {
      control.options = rest.options.map((o) => ({
        value: o.value,
        i18nKey: `mods.${ns}.${snake(key)}.opt.${snake(o.value)}`,
      }));
    }
    // Un struct_array (familias de claves por nombre base, Sprint A.8) lleva
    // i18n por campo: el spec escribe cada campo como `{suffix, ..., es, en}`
    // y el label del nombre base como `keyEs`/`keyEn`; acá se convierten en
    // los i18nKeys que consume el control, y los textos se emiten abajo.
    if (kind === "struct_array") {
      control.keyI18nKey = `mods.${ns}.${snake(key)}.${snake(rest.keyName)}`;
      control.fields = rest.fields.map((f) => {
        const { es: _fes, en: _fen, ...ff } = f;
        return { ...ff, i18nKey: `mods.${ns}.${snake(key)}.${snake(f.suffix)}` };
      });
      // `control` se arma mutando y se serializa a JSON una sola vez, en un
      // script que corre a mano: la desoptimización que la regla evita no
      // existe acá, y sacar las dos claves del spec donde se traducen se lee
      // mejor que reconstruir el objeto entero abajo.
      // biome-ignore lint/performance/noDelete: script de un tiro, no hay forma caliente
      delete control.keyEs;
      // biome-ignore lint/performance/noDelete: idem
      delete control.keyEn;
    }
    return {
      id: `${ns}_${snake(key)}`,
      key,
      category,
      tier: tier ?? "advanced",
      file: file ?? spec.file ?? "GameUserSettings.ini",
      section: section ?? spec.section ?? spec.modId,
      games: [spec.game],
      validIn: validIn ?? ["single_player", "host_local", "dedicated"],
      ...(alwaysEmit === true ? { alwaysEmit: true } : {}),
      control,
      i18nKey: `mods.${ns}.${snake(key)}`,
    };
  });

  const dest =
    args.out ??
    existingEntryFor(spec) ??
    `catalog/mods/${spec.game}/community/${slugify(spec.name)}.json`;

  /**
   * Los classnames de una entrada que ya existe se CONSERVAN si el spec no
   * trae los suyos. Sin esto, agregarle ajustes a una mod ya catalogada le
   * borraba las criaturas e items en silencio: ARK Additions: The Collection
   * tenia 60 classnames y cero settings, y catalogarle los 2 ajustes de su
   * pagina de configuracion los habria tirado a todos. Un spec que SI declara
   * classNames sigue pisando, que es lo que hace falta para regenerarlos.
   */
  const existingClassNames = (() => {
    if (spec.classNames) return spec.classNames;
    if (!existsSync(dest)) return null;
    try {
      const current = JSON.parse(readFileSync(dest, "utf8"));
      return current.classNames ?? null;
    } catch {
      return null;
    }
  })();

  /** Misma regla de conservacion que `existingClassNames`. */
  const existingSpawnMaps = (() => {
    if (spec.spawnMaps) return spec.spawnMaps;
    if (!existsSync(dest)) return null;
    try {
      const current = JSON.parse(readFileSync(dest, "utf8"));
      return current.spawnMaps ?? null;
    } catch {
      return null;
    }
  })();

  const modJson = {
    modId: spec.modId,
    name: spec.name,
    game: spec.game,
    source: spec.source ?? "community",
    // La firma de quien verifico y cuando. Sin esto, regenerar una mod
    // verificada la devolvia a `community` de hecho: el badge seguia verde
    // pero se perdia contra que se verifico y en que fecha, que es lo unico
    // que permite saber si caduco (ver README de specs).
    ...(spec.verifiedBy ? { verifiedBy: spec.verifiedBy } : {}),
    ...(spec.verifiedAt ? { verifiedAt: spec.verifiedAt } : {}),
    ...(spec.workshopUrl ? { workshopUrl: spec.workshopUrl } : {}),
    // Las mods de ASA viven en CurseForge, no en el Workshop: sin esto la URL
    // del spec se perdia en silencio y la entrada quedaba sin link.
    ...(spec.curseforgeUrl ? { curseforgeUrl: spec.curseforgeUrl } : {}),
    // El ID numerico de CurseForge NO esta en la URL (que lleva el slug) y es
    // distinto al del Workshop de la misma mod en ASE. Es lo que necesita
    // `-mods=` para arrancar un dedicado ASA con las mods puestas.
    ...(spec.curseforgeId ? { curseforgeId: String(spec.curseforgeId) } : {}),
    ...(spec.alsoWorkshopIds ? { alsoWorkshopIds: spec.alsoWorkshopIds } : {}),
    ...(spec.searchAliases ? { searchAliases: spec.searchAliases } : {}),
    settings,
    // Bloque de classnames de la mod (prompt 22): va tal cual al JSON. La
    // fuente citable queda en `_classnamesSource` del spec, que como todo
    // campo con guion bajo no se publica.
    ...(existingClassNames ? { classNames: existingClassNames } : {}),
    // Los mapas de spawn de una mod de criaturas. Se conservan igual que los
    // classnames: agregarle ajustes a una mod ya catalogada no puede borrarle
    // en silencio donde spawnea.
    ...(existingSpawnMaps ? { spawnMaps: existingSpawnMaps } : {}),
  };
  const byTier = settings.reduce((acc, s) => {
    acc[s.tier] = (acc[s.tier] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`Spec ${specPath}`);
  console.log(`  ${settings.length} settings · tiers ${JSON.stringify(byTier)}`);
  console.log(`  destino: ${dest}`);

  if (args.flags.has("dry-run")) {
    console.log("--dry-run: no escribo nada.");
    return;
  }

  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, `${JSON.stringify(modJson, null, 2)}\n`);
  console.log(`escrito ${dest}`);

  for (const locale of ["es", "en"]) {
    const block = {};
    for (const s of spec.settings) {
      const texts = s[locale];
      if (!texts) throw new Error(`${s.key}: falta el bloque "${locale}"`);
      block[snake(s.key)] = texts.label;
      if (texts.description) {
        block[`${snake(s.key)}.description`] = texts.description;
      }
      for (const opt of s.options ?? []) {
        const text = opt[locale];
        if (!text) {
          throw new Error(`${s.key}: la opcion "${opt.value}" no tiene "${locale}"`);
        }
        block[`${snake(s.key)}.opt.${snake(opt.value)}`] = text;
      }
      if (s.kind === "struct_array") {
        const keyLabel = locale === "es" ? s.keyEs : s.keyEn;
        if (!keyLabel) throw new Error(`${s.key}: falta key${locale === "es" ? "Es" : "En"}`);
        block[`${snake(s.key)}.${snake(s.keyName)}`] = keyLabel;
        for (const f of s.fields ?? []) {
          const text = f[locale];
          if (!text) throw new Error(`${s.key}: el campo "${f.suffix}" no tiene "${locale}"`);
          block[`${snake(s.key)}.${snake(f.suffix)}`] = text;
        }
      }
    }
    const path = `catalog/i18n/${locale}.json`;
    const json = JSON.parse(readFileSync(path, "utf8").replace(/^﻿/, ""));
    json.mods ??= {};
    json.mods[ns] = block;
    writeFileSync(path, `${JSON.stringify(json, null, 2)}\n`);
    console.log(`actualizado ${path} -> mods.${ns}.* (${Object.keys(block).length} claves)`);
  }
}

if (args.spec) {
  runSpecMode(args.spec);
  process.exit(0);
}

// ------------------------------------------------------------------ generar

const entries = readSection(args.ini, args.section);
if (entries.length === 0) {
  console.error(`No encontre claves en la seccion [${args.section}] de ${args.ini}`);
  process.exit(1);
}

const slug = slugify(args.name);
const i18nNamespace = snake(args.prefix ?? slug.replace(/-/g, "_"));
const idPrefix = args.prefix ?? i18nNamespace;
const categoryId = `mod_${i18nNamespace}`;

const settings = [];
const skipped = [];
const i18nEntries = [];

for (const { key, raw } of entries) {
  const control = inferControl(key, raw);
  if (!control) {
    skipped.push({ key, raw });
    continue;
  }
  const id = `${idPrefix}_${snake(key)}`;
  const i18nKey = `mods.${i18nNamespace}.${snake(key)}`;
  settings.push({
    id,
    key,
    category: categoryId,
    tier: inferTier(key, control),
    file: "GameUserSettings.ini",
    section: args.section,
    games: [args.game],
    validIn: ["single_player", "host_local", "dedicated"],
    control,
    i18nKey,
  });
  i18nEntries.push({ leaf: snake(key), key, raw, control });
}

const modJson = {
  modId: args.section,
  name: args.name,
  game: args.game,
  source: "community",
  ...(args.workshop ? { workshopUrl: args.workshop } : {}),
  settings,
};

const outPath = args.out ?? `catalog/mods/${args.game}/community/${slug}.json`;

// ------------------------------------------------------------------- salida

console.log(`Seccion [${args.section}] de ${args.ini}`);
console.log(`  ${entries.length} claves leidas`);
console.log(`  ${settings.length} settings generados`);
if (skipped.length > 0) {
  console.log(`  ${skipped.length} salteadas (tipo no inferible, revisar):`);
  for (const s of skipped) console.log(`     ${s.key} = ${s.raw}`);
}
console.log("");

const byTier = settings.reduce((acc, s) => {
  acc[s.tier] = (acc[s.tier] ?? 0) + 1;
  return acc;
}, {});
console.log(`  tiers: ${JSON.stringify(byTier)}`);
console.log(`  destino: ${outPath}`);
console.log("");

if (args.flags.has("dry-run")) {
  console.log("--dry-run: no escribo nada.");
  process.exit(0);
}

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(modJson, null, 2)}\n`);
console.log(`escrito ${outPath}`);

// Las traducciones salen como placeholder con el nombre de la clave, para que
// el test de paridad ES/EN pase desde el minuto cero y se puedan ir puliendo.
const i18nBlock = {};
for (const e of i18nEntries) {
  i18nBlock[e.leaf] = e.key;
  i18nBlock[`${e.leaf}.description`] = `TODO describir ${e.key} (valor observado: ${e.raw})`;
}

if (args.flags.has("write-i18n")) {
  for (const locale of ["es", "en"]) {
    const path = `catalog/i18n/${locale}.json`;
    const json = JSON.parse(readFileSync(path, "utf8").replace(/^﻿/, ""));
    json.mods ??= {};
    json.mods[i18nNamespace] = { ...i18nBlock, ...json.mods[i18nNamespace] };
    writeFileSync(path, `${JSON.stringify(json, null, 2)}\n`);
    console.log(`actualizado ${path} -> mods.${i18nNamespace}.*`);
  }
} else {
  console.log("");
  console.log(`i18n a pegar bajo "mods" en es.json y en.json:`);
  console.log(
    JSON.stringify({ [i18nNamespace]: i18nBlock }, null, 2)
      .split("\n")
      .map((l) => `  ${l}`)
      .join("\n"),
  );
}

console.log("");
console.log("Repasar a mano antes de commitear:");
console.log("  - etiquetas y descripciones (salen como placeholder)");
console.log("  - min/max de cada control (heuristica conservadora)");
console.log("  - si el valor del dump es el default real de la mod");
if (!existsSync("catalog/i18n/es.json")) {
  console.log("  - OJO: no encontre catalog/i18n/es.json, corriste desde la raiz?");
}
