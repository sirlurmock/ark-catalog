/**
 * Parser de las páginas de items de arkcodes.com (prompt 22).
 *
 * La página lista cada item de una mod como un acordeón con bloques
 * "Class Name: <code>X_C</code>" y "Blueprint Path: <code>/Mod/....Clase</code>".
 * No trae nombres humanos — el label sale HUMANIZADO del classname y es un
 * BORRADOR: se revisa a mano en el spec, igual que los placeholders del
 * scaffolder.
 */

/** Prefijos de clase de item de UE/ARK, del más específico al menos. */
const PRIMAL_PREFIXES = [
  "EngramEntry_",
  "PrimalItemWeapon_",
  "PrimalItemArmor_",
  "PrimalItemSkin_",
  "PrimalItemResource_",
  "PrimalItemConsumable_",
  "PrimalItemStructure_",
  "PrimalItemAmmo_",
  "PrimalItemDye_",
  "PrimalItem_",
];

/**
 * `PrimalItemWeapon_SuperSpyglassPlus_C` → `Super Spyglass Plus`.
 * Determinista y sin inventar: solo separa palabras del propio classname.
 */
export function humanizeClassName(className) {
  let name = className.replace(/_C$/, "");
  for (const prefix of PRIMAL_PREFIXES) {
    if (name.startsWith(prefix)) {
      name = name.slice(prefix.length);
      break;
    }
  }
  return name
    .replace(/_/g, " ")
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Devuelve `{ entries, discarded }`. Cada entry es `{ value, label, className }`
 * con `value` = blueprint path verbatim (lo que pide GiveItem; los campos
 * ItemClassString derivan el `_C` en el consumo). `discarded` trae los motivos,
 * para que el scraper los loguee — nada se tira en silencio.
 */
export function parseArkcodesItems(html) {
  const entries = [];
  const discarded = [];
  const seen = new Set();

  // Cada item es un chunk que arranca en su "Class Name:". El primer chunk
  // (antes del primer marcador) no tiene datos y se salta.
  const chunks = html.split(/Class Name:\s*<\/span>/).slice(1);
  for (const chunk of chunks) {
    const classMatch = chunk.match(/<code[^>]*>([^<]+)<\/code>/);
    const pathMatch = chunk.match(/Blueprint Path:\s*<\/span><code[^>]*>([^<]+)<\/code>/);
    const className = classMatch?.[1]?.trim() ?? "";
    const path = pathMatch?.[1]?.trim() ?? "";

    if (!className || !path) {
      discarded.push({ className: className || "(sin classname)", reason: "bloque sin classname o sin blueprint path" });
      continue;
    }
    if (!className.endsWith("_C")) {
      discarded.push({ className, reason: "classname sin sufijo _C" });
      continue;
    }
    if (!path.includes(".") || /\s/.test(path)) {
      discarded.push({ className, reason: `blueprint path inválido: "${path}"` });
      continue;
    }
    const key = path.toLowerCase();
    if (seen.has(key)) {
      discarded.push({ className, reason: "duplicado (misma ruta), gana la primera aparición" });
      continue;
    }
    seen.add(key);
    entries.push({ value: path, label: humanizeClassName(className), className });
  }

  // Orden por codepoint, NO localeCompare: el resultado tiene que ser idéntico
  // en cualquier máquina/locale para que la regeneración sea determinista.
  entries.sort((a, b) => (a.value < b.value ? -1 : a.value > b.value ? 1 : 0));
  return { entries, discarded };
}
