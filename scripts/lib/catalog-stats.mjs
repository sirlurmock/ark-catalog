/**
 * Las cifras del catálogo, contadas del catálogo.
 *
 * Existe porque los números de la landing ("246 ajustes core", "31 mods
 * catalogadas, 1126 ajustes") estaban escritos a mano y quedaron viejos por
 * TERCERA vez: el catálogo real iba por 252 y 52/1495. Igual que la versión y
 * el SHA-256, que ya se resuelven solos, esto se cuenta y se publica.
 *
 * El resultado se escribe como `stats.json` en la raíz del espejo público
 * (`ark-catalog`) al sincronizar, y la landing lo lee en build. Un solo
 * archivo chico: contar desde el navegador implicaría bajar el catálogo entero.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

/** Los `.json` de un directorio, recursivo. Ignora `.gitkeep` y demás. */
function jsonFiles(dir) {
  let out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out = out.concat(jsonFiles(full));
    else if (entry.name.endsWith(".json")) out.push(full);
  }
  return out;
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function countArray(path) {
  const data = readJson(path);
  return Array.isArray(data) ? data.length : 0;
}

function sumArrays(dir) {
  return jsonFiles(dir).reduce((total, f) => total + countArray(f), 0);
}

/**
 * Cuenta el catálogo de `root` (la raíz del repo de la app, la que tiene
 * `catalog/`). Devuelve números planos, listos para serializar.
 *
 * Cada cifra es la que la landing muestra; si mañana quiere mostrar otra, se
 * agrega acá y no se escribe a mano allá.
 */
export function computeCatalogStats(root, { generatedAt } = {}) {
  const catalog = join(root, "catalog");

  const coreSettings = sumArrays(join(catalog, "settings"));
  const categories = countArray(join(catalog, "categories.json"));

  // Una entrada por mod y por juego: la misma mod publicada en ASE y en ASA
  // son dos entradas, con secciones y claves que no siempre coinciden.
  const modFiles = [
    ...jsonFiles(join(catalog, "mods", "ase")),
    ...jsonFiles(join(catalog, "mods", "asa")),
  ];
  let modSettings = 0;
  // Las mods más grandes: sirven de ejemplo concreto ("incluidas Structures
  // Plus con 288 ajustes") sin que nadie tenga que acordarse de actualizarlo.
  const bySize = [];
  for (const file of modFiles) {
    const def = readJson(file);
    const count = (def.settings ?? []).length;
    modSettings += count;
    bySize.push({ name: def.name, game: def.game, settings: count });
  }
  bySize.sort((a, b) => b.settings - a.settings || a.name.localeCompare(b.name));

  // El registro del Workshop no trae ajustes: le pone nombre y miniatura a las
  // mods que el usuario ya tiene. Se cuenta aparte para no mezclarlo con las
  // catalogadas de verdad.
  const registry = readJson(join(catalog, "mods", "registry-ase.json"));
  const workshopRegistry = Array.isArray(registry.mods) ? registry.mods.length : 0;

  // Las categorías de comandos son las que declaran los comandos, no la
  // cantidad de archivos: `admin-expanded.json` reparte los suyos entre las
  // categorías que ya existen.
  const commandCategories = new Set();
  let commands = 0;
  for (const file of jsonFiles(join(catalog, "commands"))) {
    for (const command of readJson(file)) {
      commands += 1;
      if (command.category) commandCategories.add(command.category);
    }
  }

  return {
    generatedAt: generatedAt ?? new Date().toISOString(),
    catalogVersion: readJson(join(catalog, "manifest.json")).version,
    coreSettings,
    categories,
    mods: modFiles.length,
    modSettings,
    topMods: bySize.slice(0, 3),
    workshopRegistry,
    presets: jsonFiles(join(catalog, "presets")).length,
    commands,
    commandCategories: commandCategories.size,
    items: countArray(join(catalog, "classnames", "items.json")),
    dinos: countArray(join(catalog, "classnames", "dinos.json")),
    engrams: countArray(join(catalog, "engrams", "engrams.json")),
    maps: countArray(join(catalog, "maps", "maps.json")),
    breedingSpecies: countArray(join(catalog, "breeding", "breeding.json")),
  };
}

/** Para correrlo suelto y mirar las cifras: `node scripts/lib/catalog-stats.mjs` */
if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  console.log(
    JSON.stringify(computeCatalogStats(join(import.meta.dirname, "..", "..")), null, 2),
  );
}
