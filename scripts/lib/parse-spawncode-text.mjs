/**
 * Documentos de spawn codes en TEXTO plano (prompt 22): guías en Google Docs,
 * hilos del Workshop, README de mods.
 *
 * El formato varía, pero todos comparten la misma idea: un **nombre** y, cerca,
 * el código. Dos formas conviven en las fuentes reales:
 *
 *   Lion & Lioness:  Cheat gmsummon "lions_character_bp_c" 100   ← en la línea
 *
 *   Lion Saddle                                                  ← encabezado
 *   "EngramEntry_Saddle_Lion_C"
 *   Admincheat Giveitem "Blueprint'/Game/Mods/…/X.X'" 1 0 0
 *
 * Igual que el resto del prompt 22, cuando hay blueprint path el classname
 * sale de ahí (`…/X.Y` → `Y_C`), que es la forma canónica: los gmsummon de
 * estos documentos vienen con capitalización inconsistente
 * (`cattle_character_bp_c` junto a `Camel_MM_Character_BP_C`).
 */

const BLUEPRINT_RE = /Blueprint'([^']*\.([A-Za-z0-9_]+))'/;
const INLINE_SUMMON_RE = /^(.{2,60}?)\s*[::]\s*.*?gmsummon\s+"([A-Za-z0-9_]+)"/i;
const ENGRAM_RE = /"?\b(EngramEntry_[A-Za-z0-9_]+_C)\b"?/;
const BARE_CLASSNAME_RE = /^"?([A-Za-z0-9_]+_C)"?$/;
const SEPARATOR_RE = /^[_\-=—\s]*$/;

/** Una línea que es puro código, no un nombre. */
function looksLikeCode(line) {
  return (
    /cheat|admincheat|giveitem|gmsummon|spawndino|Blueprint'|EngramEntry_|^\s*"/i.test(line) ||
    /_[Cc]haracter|PrimalItem/.test(line)
  );
}

/**
 * Devuelve `{ dinos, items, engrams, discarded }`. Un classname con
 * `_Character` es criatura; `PrimalItem…` con path es item; `EngramEntry_…`
 * es engrama. Cada uno se queda con el nombre del encabezado más cercano.
 */
export function parseSpawncodeText(text) {
  const dinos = [];
  const items = [];
  const engrams = [];
  const discarded = [];
  const seen = { dino: new Set(), item: new Set(), engram: new Set() };

  const add = (bucket, key, entry) => {
    const k = entry.value.toLowerCase();
    if (seen[key].has(k)) return false;
    seen[key].add(k);
    bucket.push(entry);
    return true;
  };

  let heading = null;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/\s+/g, " ").trim();
    if (!line || SEPARATOR_RE.test(line)) continue;

    // Forma "Nombre: comando" — nombre y código en la misma línea.
    const inline = line.match(INLINE_SUMMON_RE);
    if (inline) {
      const name = inline[1].trim();
      const bp = line.match(BLUEPRINT_RE);
      const className = bp ? `${bp[2]}_C` : inline[2];
      if (/_[Cc]haracter/.test(className)) add(dinos, "dino", { value: className, label: name });
      heading = null;
      continue;
    }

    if (!looksLikeCode(line)) {
      // Un encabezado razonable: corto y sin puntuación de frase. Los docs
      // rotulan los bloques con dos puntos ("Hen:"), que no son parte del
      // nombre; el índice del documento repite títulos con su número de
      // página al final ("Lion Saddle 10") y esos no sirven de nombre.
      const clean = line.replace(/\s*\d+$/, "").replace(/\s*[::]\s*$/, "").trim();
      heading = clean.length > 0 && clean.length <= 60 && !/[.!?]$/.test(clean) ? clean : null;
      continue;
    }

    const engram = line.match(ENGRAM_RE);
    if (engram && heading) add(engrams, "engram", { value: engram[1], label: heading });

    const bp = line.match(BLUEPRINT_RE);
    if (bp) {
      const path = bp[1];
      const className = `${bp[2]}_C`;
      if (/_[Cc]haracter/.test(className)) {
        // Una criatura SOLO entra por la forma "Nombre: gmsummon", que
        // garantiza el par. La lista suelta de blueprints va bajo un título de
        // sección ("Creature Blueprints"), que no es el nombre de nadie: acá
        // sirve para canonicalizar la capitalización de una entrada existente.
        const existing = dinos.find((d) => d.value.toLowerCase() === className.toLowerCase());
        if (existing) existing.value = className;
        else discarded.push({ name: className, reason: "blueprint de criatura sin nombre propio" });
      } else if (/PrimalItem/i.test(className)) {
        add(items, "item", { value: path, label: heading ?? className.replace(/_C$/, "") });
      }
      continue;
    }

    const bare = line.match(BARE_CLASSNAME_RE);
    if (bare && heading && /PrimalItem/i.test(bare[1])) {
      // Classname suelto de item sin path: se ignora (la convención de
      // `items` es el blueprint path), pero se deja constancia.
      discarded.push({ name: heading, reason: `item sin blueprint path (${bare[1]})` });
    }
  }

  const byValue = (a, b) => (a.value < b.value ? -1 : a.value > b.value ? 1 : 0);
  dinos.sort(byValue);
  items.sort(byValue);
  engrams.sort(byValue);
  return { dinos, items, engrams, discarded };
}
