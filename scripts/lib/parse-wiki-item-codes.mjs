/**
 * Tablas de "Item Codes" / "Spawn Codes" de las wikis de mods (prompt 22).
 *
 * Muchas mods documentan sus códigos en una tabla con una fila por objeto:
 * nombre, tag opcional y el comando con el blueprint path. Como la hoja CSV,
 * trae el **nombre humano** que le puso el autor, así que los labels no se
 * humanizan.
 *
 * Igual que el resto del prompt 22: el classname sale del **path**
 * (`…/X.Y` → `Y_C`), que es la forma canónica y sobrevive a los archivos
 * cuyo nombre no coincide con el del objeto — ARK Additions publica
 * `BAcrocanthosaurus_Character_BP_Eden.Acrocanthosaurus_Character_BP_Eden`,
 * donde el bueno es el segundo.
 */

import { humanizeClassName } from "./parse-arkcodes.mjs";

const BLUEPRINT_RE = /(\/Game\/Mods\/[A-Za-z0-9_/]+\.([A-Za-z0-9_]+))/;
const ENGRAM_RE = /\b(EngramEntry_[A-Za-z0-9_]+_C)\b/;

/** Celdas de una fila `<tr>`, ya sin etiquetas ni entidades. */
function cellsOf(rowHtml) {
  return [...rowHtml.matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((m) =>
    m[1]
      .replace(/<[^>]+>/g, " ")
      .replace(/&#160;|&nbsp;/g, " ")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

/**
 * Devuelve `{ dinos, items, tags, discarded }`. Una fila cuenta como criatura
 * si su classname lleva `_Character`; el resto (sillas, costumes, trofeos)
 * va a items con el path completo.
 *
 * `nameIndex`/`tagIndex` son las columnas de nombre y tag. Por defecto 0 y 1,
 * que es como salen las tablas de ARK Additions; se pasan explícitas cuando
 * la wiki las ordena distinto.
 */
export function parseWikiItemCodes(html, { nameIndex = 0, tagIndex = 1 } = {}) {
  const dinos = [];
  const items = [];
  const tags = [];
  const engrams = [];
  const discarded = [];
  const seen = { dino: new Set(), item: new Set(), tag: new Set(), engram: new Set() };

  for (const [, rowHtml] of html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
    // NO se filtran celdas vacías: el índice de la columna es posicional y
    // quitarlas correría el nombre de sitio.
    const cells = cellsOf(rowHtml);
    if (cells.length === 0) continue;

    // Tabla de engramas: nombre + EngramEntry_… + nivel + costo.
    const engramCell = cells.map((c) => c.match(ENGRAM_RE)).find(Boolean);
    if (engramCell) {
      const value = engramCell[1];
      const label = (cells[nameIndex] ?? "").trim();
      const key = value.toLowerCase();
      if (label && !seen.engram.has(key)) {
        seen.engram.add(key);
        engrams.push({ value, label });
      }
      continue;
    }

    const blueprint = cells.map((c) => c.match(BLUEPRINT_RE)).find(Boolean);
    if (!blueprint) continue; // encabezados y filas sin código

    const path = blueprint[1];
    const className = `${blueprint[2]}_C`;
    const name = (cells[nameIndex] ?? "").trim();
    if (!name || BLUEPRINT_RE.test(name)) {
      discarded.push({ name: className, reason: "fila sin nombre en la columna esperada" });
      continue;
    }

    if (/_Character/i.test(className)) {
      const key = className.toLowerCase();
      if (seen.dino.has(key)) {
        discarded.push({ name, reason: `classname repetido (${className})` });
      } else {
        seen.dino.add(key);
        dinos.push({ value: className, label: name });
      }
      const tag = (cells[tagIndex] ?? "").trim();
      // La columna del tag es una palabra suelta; si trae un comando o una
      // frase, es que esta tabla no la tiene donde se esperaba.
      if (tag && /^[A-Za-z0-9_]{2,40}$/.test(tag) && !seen.tag.has(tag.toLowerCase())) {
        seen.tag.add(tag.toLowerCase());
        tags.push({ value: tag, label: tag });
      }
      continue;
    }

    const key = path.toLowerCase();
    if (seen.item.has(key)) {
      discarded.push({ name, reason: `item repetido (${className})` });
    } else {
      seen.item.add(key);
      // El label de los items sale del CLASSNAME, no de la columna de nombre:
      // en la tabla real de ARK Additions esa columna está corrida (la fila
      // rotulada «Concavenator Saddle» apunta a PrimalItemArmor_BrachioSaddle)
      // y los chibis arrastran el "File:….png" de su imagen. El classname es
      // el dato duro; el nombre de la wiki, no.
      items.push({ value: path, label: humanizeClassName(className) });
    }
  }

  const byValue = (a, b) => (a.value < b.value ? -1 : a.value > b.value ? 1 : 0);
  dinos.sort(byValue);
  items.sort(byValue);
  tags.sort(byValue);
  engrams.sort(byValue);
  return { dinos, items, tags, engrams, discarded };
}
