/**
 * Hojas de spawn codes de mods de criaturas, exportadas como CSV (prompt 22).
 *
 * Varias mods grandes publican sus códigos en una hoja de Google con una fila
 * por criatura — el mismo precedente que Structures Plus y Super Structures
 * para sus settings. A diferencia de un hilo del Workshop, la hoja trae el
 * **nombre humano** y a menudo el **dino tag**, así que los labels salen del
 * autor y no de humanizar el classname.
 *
 * Espera columnas con estos encabezados (case-insensitive, se busca por
 * inclusión para tolerar variantes): NAME, DINO TAG, y alguna que contenga
 * SPAWN COMMAND (de ahí sale el classname `X_Character_BP…_C`).
 */

/** Parser de CSV con comillas dobles y `""` como escape. */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
      continue;
    }
    if (c === '"') inQuotes = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") field += c;
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/**
 * El classname sale del **path del blueprint** del comando `spawndino`, no del
 * `gmsummon`. Es la forma canónica y evita dos trampas de las hojas reales:
 *   - typos del autor en el gmsummon (Prehistoric Beasts publica
 *     `Genyodectes_Character_BP_C_Volcanic`, con el `_C` en el medio; el path
 *     dice `Genyodectes_Character_BP_Volcanic`, que es el bueno);
 *   - variantes con algo entre "Character" y "BP" (`GiantSeaSlug_Character_
 *     Ocean_BP`, `Hainosaurus_Character_Mega_Ocean_BP`), que una regex
 *     `Character_?BP` se pierde.
 */
const BLUEPRINT_PATH_RE = /Blueprint'([^']*\.([A-Za-z0-9_]+))'/;
/** Fallback para hojas que solo publican el gmsummon. */
const SUMMON_CLASSNAME_RE = /gmsummon\s+""?([A-Za-z0-9_]+)""?/i;

/**
 * Devuelve `{ className, path }` de una fila. Las hojas mezclan criaturas con
 * items (sillas, chibis, consumibles) en la misma tabla, así que quien llame
 * decide a qué lista va cada uno según el classname.
 */
function spawnTargetFromRow(cells) {
  for (const cell of cells) {
    const m = cell.match(BLUEPRINT_PATH_RE);
    if (m?.[2]) return { className: `${m[2]}_C`, path: m[1] };
  }
  for (const cell of cells) {
    const summon = cell.match(SUMMON_CLASSNAME_RE);
    if (summon?.[1]) {
      const raw = summon[1];
      return { className: raw.endsWith("_C") ? raw : `${raw}_C`, path: null };
    }
  }
  return null;
}

/**
 * Devuelve `{ dinos, tags, discarded }`. `dinos` lleva el classname como
 * value y el NAME de la hoja como label; `tags` los DINO TAG únicos. Las filas
 * de sección (sin comando de spawn) y las repetidas se descartan con motivo.
 */
export function parseSpawncodeCsv(text) {
  const rows = parseCsv(text);
  if (rows.length === 0) return { dinos: [], tags: [], discarded: [] };

  const header = (rows[0] ?? []).map((h) => h.trim().toUpperCase());
  const nameIdx = header.findIndex((h) => h === "NAME");
  const tagIdx = header.findIndex((h) => h.includes("TAG"));
  const cmdIdxs = header
    .map((h, i) => (h.includes("SPAWN COMMAND") ? i : -1))
    .filter((i) => i >= 0);

  if (nameIdx < 0 || cmdIdxs.length === 0) {
    throw new Error(
      `La hoja no tiene las columnas esperadas (NAME + SPAWN COMMAND). Encabezado: ${header.join(" | ")}`,
    );
  }

  const dinos = [];
  const items = [];
  const tags = [];
  const discarded = [];
  const seenDino = new Set();
  const seenItem = new Set();
  const seenTag = new Set();

  for (const row of rows.slice(1)) {
    const name = (row[nameIdx] ?? "").trim();
    if (!name) continue;

    const target = spawnTargetFromRow(cmdIdxs.map((idx) => row[idx] ?? ""));
    // Las filas de sección ("CREATURES - TAMEABLE") no traen comando.
    if (!target) {
      discarded.push({ name, reason: "fila sin comando de spawn (encabezado de sección)" });
      continue;
    }
    const { className, path } = target;

    // Una criatura lleva `_Character` en el classname; lo demás que la hoja
    // liste (sillas, chibis, consumibles) es un item, y para esos el value
    // tiene que ser el blueprint path, no el classname.
    if (!/_Character/i.test(className)) {
      if (!path) {
        discarded.push({ name, reason: `item sin blueprint path (${className})` });
        continue;
      }
      const itemKey = path.toLowerCase();
      if (seenItem.has(itemKey)) {
        discarded.push({ name, reason: `item repetido (${className})` });
      } else {
        seenItem.add(itemKey);
        items.push({ value: path, label: name });
      }
      continue;
    }

    const key = className.toLowerCase();
    if (seenDino.has(key)) {
      discarded.push({ name, reason: `classname repetido (${className})` });
    } else {
      seenDino.add(key);
      dinos.push({ value: className, label: name });
    }

    if (tagIdx >= 0) {
      const tag = (row[tagIdx] ?? "").trim();
      // "N/A" y variantes aparecen en las hojas reales donde no hay tag.
      if (tag && !/^n\/?a$/i.test(tag) && !seenTag.has(tag.toLowerCase())) {
        seenTag.add(tag.toLowerCase());
        tags.push({ value: tag, label: tag });
      }
    }
  }

  const byValue = (a, b) => (a.value < b.value ? -1 : a.value > b.value ? 1 : 0);
  dinos.sort(byValue);
  items.sort(byValue);
  tags.sort(byValue);
  return { dinos, items, tags, discarded };
}
