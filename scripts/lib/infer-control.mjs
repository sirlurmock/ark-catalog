/**
 * Inferencia del control de un setting a partir del valor que aparece en un
 * `.ini` real o en la documentacion de una mod.
 *
 * Vive aparte porque la usan dos entradas distintas: `scaffold-mod.mjs --ini`
 * (dump de un usuario) y `scrape-workshop-configs.mjs` (descripcion del
 * Workshop). Duplicarla haria que los dos caminos infieran distinto.
 */

const BOOL_RE = /^(true|false)$/i;
const INT_RE = /^-?\d+$/;
const FLOAT_RE = /^-?\d+\.\d+$/;

/** Nombres que suelen ser escalares continuos aunque el valor sea entero. */
export const MULTIPLIER_HINT = /multiplier|scale|rate|chance|percent|modifier/i;
/** Toggles evidentes: van a tier basico porque son lo primero que se toca. */
const BASIC_HINT = /^(allow|enable|disable|show|use|prevent|remove|is|can)/i;

function dedupe(numbers) {
  return [...new Set(numbers.filter((n) => Number.isFinite(n)))].sort((a, b) => a - b);
}

/**
 * Devuelve el objeto `control` o `null` si el valor no se puede mapear a
 * ninguno de los ControlKind que existen (strings libres, listas, structs).
 */
export function inferControl(key, raw) {
  const value = String(raw).trim();

  if (BOOL_RE.test(value)) {
    return { kind: "boolean", default: /^true$/i.test(value) };
  }

  if (FLOAT_RE.test(value) || (INT_RE.test(value) && MULTIPLIER_HINT.test(key))) {
    const num = Number.parseFloat(value);
    // Rango generoso alrededor del valor observado; se ajusta a mano.
    const max = Math.max(10, Math.ceil(num * 10) || 10);
    return {
      kind: "float_multiplier",
      default: num,
      min: 0,
      max,
      step: 0.1,
      presets: dedupe([0.5, 1, num, Math.min(max, num * 2 || 2)]),
    };
  }

  if (INT_RE.test(value)) {
    const num = Number.parseInt(value, 10);
    return {
      kind: "integer",
      default: num,
      min: 0,
      max: Math.max(100, num * 10 || 100),
      step: 1,
    };
  }

  return null;
}

export function inferTier(key, control) {
  if (control.kind === "boolean" && BASIC_HINT.test(key)) return "basic";
  if (control.kind === "float_multiplier" && MULTIPLIER_HINT.test(key)) return "basic";
  return "advanced";
}

/** `BabyGrowthMultiplier` -> `baby_growth_multiplier` */
export function snake(key) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[-.]/g, "_")
    .toLowerCase();
}

export function slugify(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
