#!/usr/bin/env node
/**
 * Genera el spec de Kraken's Better Dinos desde el snapshot de su guía oficial.
 *
 * Es la excepción al «un spec se escribe a mano» del README de mod-specs, por
 * la misma razón que Structures Plus generó sus familias formulaicas: KBD
 * expone **231 claves** y 65 de ellas son literalmente la misma frase con el
 * nombre de la criatura cambiado. Escribirlas a mano sería copiar y pegar 65
 * veces con la oportunidad de equivocarse en cada una.
 *
 * El reparto es:
 *   - EN: verbatim de la guía del autor (precedente Structures Plus).
 *   - ES de las 65 formulaicas: plantilla por familia + el nombre del grupo.
 *   - ES de las otras 166: escritas a mano en `lib/kbd-texts.mjs`.
 *   - tipo, rango y tier: la tabla CONTROLS de acá.
 *
 * Uso:
 *   node scripts/build-kbd-spec.mjs
 *   node scripts/scaffold-mod.mjs --spec scripts/mod-specs/krakens-better-dinos.json --write-i18n
 */
import { readFileSync, writeFileSync } from "node:fs";
import { KBD_CONTROLS, KBD_PROSE_ONLY, KBD_TEXTS } from "./lib/kbd-texts.mjs";
import { parseKbdGuide } from "./lib/parse-kbd-guide.mjs";

const GUIDE = "scripts/mod-specs/_scraped/krakens-better-dinos-guide.txt";
const OUT = "scripts/mod-specs/krakens-better-dinos.json";

/**
 * Claves que la guía menciona pero que **no son de KBD**: son claves vanilla de
 * `Game.ini` que el autor documenta como receta (cómo borrar el Ichthyornis
 * salvaje, cómo agregar el Deinon a otros mapas). Catalogarlas bajo
 * `[BetterDinos]` las escribiría en la sección equivocada y ARK las ignoraría
 * — y las dos ya están en el catálogo core, donde corresponden.
 */
const VANILLA_KEYS = new Set(["NPCReplacements", "ConfigAddNPCSpawnEntriesContainer"]);

/** Familias formulaicas: misma frase del autor, cambia la criatura. */
const FAMILIES = [
  {
    id: "buff",
    test: /^Setting to True will prevent the KBD Buff from being added$/i,
    es: (g) => ({
      label: `Desactivar las mejoras de KBD en ${g}`,
      description: `Activado, KBD no le agrega su buff a ${g}: la criatura queda exactamente como en el juego base. El resto de la mod sigue funcionando.`,
    }),
  },
  {
    id: "revertDestroy",
    test: /from spawning and revert all existing (wild )?ones back to vanilla, already tamed ones will be destroyed$/i,
    es: (g) => ({
      label: `Desactivar el ${g} de KBD`,
      description: `Activado, el ${g} de KBD deja de aparecer y los salvajes vuelven a ser los del juego base. ⚠️ Los que ya tengas domados se DESTRUYEN: es un cambio con pérdida, no lo actives en un servidor en curso sin avisar.`,
    }),
  },
  {
    id: "destroy",
    test: /from spawning and destroy all existing tamed ones$/i,
    es: (g) => ({
      label: `Desactivar el ${g} de KBD`,
      description: `Activado, el ${g} de KBD deja de aparecer. ⚠️ Los que ya tengas domados se DESTRUYEN: es un cambio con pérdida, no lo actives en un servidor en curso sin avisar.`,
    }),
  },
  {
    id: "revert",
    test: /from spawning and revert all existing ones back to vanilla$/i,
    es: (g) => ({
      label: `Desactivar el ${g} de KBD`,
      description: `Activado, el ${g} de KBD deja de aparecer y los que ya existan vuelven a ser los del juego base.`,
    }),
  },
];

/** `PreventBetterAmmonite` → «Prevent Better Ammonite». */
function enLabel(key) {
  return key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");
}

const {
  settings: parsed,
  dinos,
  items,
  engrams,
  warnings,
} = parseKbdGuide(readFileSync(GUIDE, "utf8"));

const built = [];
const missing = [];

for (const entry of parsed) {
  if (VANILLA_KEYS.has(entry.key)) continue;

  // Por defecto todo es un booleano en False, que es la forma de casi toda la
  // mod. El tier sale del nombre: `PreventBetter*` es el interruptor maestro de
  // una criatura (lo que un admin busca) y va en avanzado; el resto son los
  // ajustes finos de cada cambio y van en experto. CONTROLS pisa las dos cosas.
  const control = {
    kind: "boolean",
    default: false,
    tier: entry.key.startsWith("PreventBetter") ? "advanced" : "expert",
    ...KBD_CONTROLS[entry.key],
  };
  const hand = KBD_TEXTS[entry.key];
  const family = hand ? null : FAMILIES.find((f) => f.test.test(entry.description ?? ""));

  if (!hand && !family) {
    missing.push(`${entry.key} (${entry.group ?? "general"})`);
    continue;
  }

  const es = hand ? hand.es : family.es(entry.group);
  const en = hand?.en ?? {
    label: enLabel(entry.key),
    description: entry.description,
  };

  const { tier, ...rest } = control;
  built.push({
    key: entry.key,
    ...rest,
    tier,
    _group: entry.group ?? null,
    es,
    en,
  });
}

// Las que la guía solo menciona en prosa: no salen del parser, pero existen.
for (const extra of KBD_PROSE_ONLY) built.push({ ...extra });

if (missing.length > 0) {
  console.error(`Faltan textos ES para ${missing.length} claves:`);
  for (const m of missing) console.error("  -", m);
  process.exit(1);
}

const spec = {
  _source:
    "Guía oficial del autor en Steam: https://steamcommunity.com/sharedfiles/filedetails/?id=2071693170 — snapshot en scripts/mod-specs/_scraped/krakens-better-dinos-guide.txt (2026-08-20). OJO: 2071693170 es la User Guide; la mod es 1565015734.",
  _scope: `Las ${built.length} claves documentadas de KBD. ${built.length - KBD_PROSE_ONLY.length} salen del parser dedicado (scripts/lib/parse-kbd-guide.mjs) sobre el snapshot y ${KBD_PROSE_ONLY.length} de la prosa de la guía, que las menciona sin darles ficha propia. Generado por scripts/build-kbd-spec.mjs — NO editar a mano: los textos ES viven en scripts/lib/kbd-texts.mjs.`,
  _defaults:
    "Los defaults literales salen de la ficha de cada criatura, donde el autor escribe la clave con su valor (PreventBetterAmmonite=False, AnglerGelInterval=1800). Las de la sección general no traen literal y su default se lee de la prosa ('Defaults to 0.05'); las que son features opt-in (WildBabies, WildEggs, UntameableAdults, PassiveTameBabies, AllowFlyerSpeed) van en False porque la guía dice que hay que habilitarlas. RandomAberrants y RandomAberrantsBDOnly también en False, por lo mismo.",
  _exclusiones:
    "NPCReplacements y ConfigAddNPCSpawnEntriesContainer aparecen en la guía como RECETAS vanilla (borrar el Ichthyornis salvaje, agregar el Deinon a otros mapas), no como ajustes de KBD: van en Game.ini bajo la sección del juego y ya están en el catálogo core. Las opciones de nivelación de dinos salvajes ('Level Equalisation and High Level .Ini Options') las promete la guía pero su sección dice 'More Information To Come': sin nombres de clave citables, no se catalogan. Tampoco la blacklist de voladores del AllowFlyerSpeed, que se menciona sin dar el nombre de la clave.",
  modId: "BetterDinos",
  name: "Kraken's Better Dinos",
  game: "ase",
  source: "community",
  workshopUrl: "https://steamcommunity.com/sharedfiles/filedetails/?id=1565015734",
  prefix: "krakens_better_dinos",
  file: "GameUserSettings.ini",
  section: "BetterDinos",
  searchAliases: [
    "kbd",
    "krakens",
    "better dinos",
    "dinos mejorados",
    "bebes salvajes",
    "huevos salvajes",
    "voladores con velocidad",
  ],
  settings: built,
  // Classnames (prompt 22) del mismo snapshot: cada ficha cierra con su bloque
  // de spawn codes y cada silla trae su engrama y su blueprint path. Sale del
  // parser dedicado y no del generico, que sobre esta guia devuelve 0 dinos.
  classNames: { dinos, items, engrams },
  _classnamesSource: {
    dinos: {
      url: "https://steamcommunity.com/sharedfiles/filedetails/?id=2071693170",
      fetchedAt: "2026-08-20",
      note: "Bloques 'Spawn Codes:' de la guia oficial. El classname sale del path del spawndino, que es la forma canonica; el rotulo es el encabezado que le puso el autor mas la variante del sufijo.",
    },
    items: {
      url: "https://steamcommunity.com/sharedfiles/filedetails/?id=2071693170",
      fetchedAt: "2026-08-20",
      note: "Blueprint paths de las sillas y objetos, publicados sueltos abajo del engrama de cada uno.",
    },
    engrams: {
      url: "https://steamcommunity.com/sharedfiles/filedetails/?id=2071693170",
      fetchedAt: "2026-08-20",
      note: "Los EngramEntry_*_C que la guia lista arriba del path de cada silla.",
    },
  },
};

writeFileSync(OUT, `${JSON.stringify(spec, null, 2)}\n`);

console.log(`${built.length} ajustes → ${OUT}`);
console.log(
  `classnames: ${dinos.length} criaturas, ${items.length} objetos, ${engrams.length} engramas`,
);
const byTier = {};
for (const s of built) byTier[s.tier] = (byTier[s.tier] ?? 0) + 1;
console.log("por tier:", byTier);
const byKind = {};
for (const s of built) byKind[s.kind] = (byKind[s.kind] ?? 0) + 1;
console.log("por tipo:", byKind);
if (warnings.length > 0)
  console.log(`${warnings.length} avisos del parser (claves repetidas y listas sin descripción)`);
