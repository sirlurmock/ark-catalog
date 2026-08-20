/**
 * Classnames de criaturas de una mod, a partir de un volcado de spawn codes
 * (prompt 22). Sirve para cualquier fuente que liste `X_Character_BP_C`:
 * hilos de spawn codes del Workshop, wikis, guías del autor.
 *
 * El label sale HUMANIZADO del classname: las mods de criaturas casi nunca
 * publican el nombre humano junto al código (el hilo oficial de Wild ARK son
 * 100 líneas de `cheat gmsummon "X_Character_BP_C" 180` y nada más). Para la
 * mayoría alcanza —el classname ES el nombre de la especie, a veces
 * abreviado—, pero algunos quedan crípticos y hay que repasarlos a mano en el
 * spec, igual que con los items.
 */

/** Prefijos de bioma/zona que ARK y las mods anteponen al nombre. */
const BIOME_PREFIXES = [
  "Bog",
  "Ocean",
  "volcano",
  "Volcano",
  "Snow",
  "Desert",
  "Swamp",
  "Cave",
  // Variantes de mapa que ARK usa como prefijo tanto como sufijo.
  "Eden",
  "Rockwell",
  "Scorched",
  "Aberrant",
  "Crystal",
  "Bone",
];

/**
 * Sufijos de variante que van DESPUÉS de `_Character_BP_`. Se muestran entre
 * paréntesis porque son la misma especie con otro comportamiento, y cada uno
 * es un classname distinto para DinoSpawnWeightMultipliers.
 */
const VARIANT_LABELS = {
  aberrant: "Aberrant",
  alpha: "Alpha",
  ghost: "Ghost",
  eden: "Eden",
  arcane: "Arcane",
  bred: "Bred",
  wild: "Wild",
  rockwell: "Rockwell",
  acid: "Acid",
  vr: "VR",
  corrupted: "Corrupted",
  tek: "Tek",
  x: "X",
};

/** Prefijos de la propia mod, que no son parte del nombre de la especie. */
const MOD_PREFIXES = [/^AC2/i, /^Shad(?=[A-Z])/, /^PA_/, /^BD(?=[A-Z])/];

function titleCase(text) {
  return text
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => (w === w.toUpperCase() && w.length > 1 ? w : w[0].toUpperCase() + w.slice(1)))
    .join(" ");
}

/**
 * `Bog_Deinocheirus_Character_BP_Alpha_C` → `Deinocheirus (Alpha, Bog)`.
 * Determinista: solo reordena y formatea lo que ya dice el classname.
 */
export function humanizeDinoClassName(className) {
  const m = className.match(/^(.*?)_[Cc]haracter_?BP(?:_(.*))?_C$/);
  if (!m) return titleCase(className.replace(/_C$/, ""));

  let base = m[1] ?? "";
  const variantPart = m[2] ?? "";

  const qualifiers = [];
  for (const prefix of BIOME_PREFIXES) {
    const re = new RegExp(`^${prefix}_`, "i");
    if (re.test(base)) {
      base = base.replace(re, "");
      qualifiers.push(titleCase(prefix));
      break;
    }
  }
  for (const re of MOD_PREFIXES) base = base.replace(re, "");

  const variants = variantPart
    .split("_")
    .filter(Boolean)
    .map((v) => VARIANT_LABELS[v.toLowerCase()] ?? titleCase(v));

  const label = titleCase(base) || titleCase(className.replace(/_C$/, ""));
  const all = [...variants, ...qualifiers];
  return all.length > 0 ? `${label} (${all.join(", ")})` : label;
}

/**
 * Devuelve `{ entries, discarded }` con los classnames de criatura del texto,
 * ordenados por codepoint y sin repetidos (case-insensitive: el mismo
 * classname aparece con distinta capitalización en las fuentes reales, y para
 * ARK son el mismo).
 */
export function parseDinoClassNames(text) {
  const entries = [];
  const discarded = [];
  const seen = new Map();

  const found = text.match(/[A-Za-z0-9_]+_[Cc]haracter_?BP[A-Za-z0-9_]*_C/g) ?? [];
  for (const raw of found) {
    const key = raw.toLowerCase();
    if (seen.has(key)) continue;
    seen.set(key, raw);
    entries.push({ value: raw, label: humanizeDinoClassName(raw) });
  }

  entries.sort((a, b) => (a.value < b.value ? -1 : a.value > b.value ? 1 : 0));
  return { entries, discarded };
}
