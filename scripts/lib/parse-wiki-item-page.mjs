/**
 * Páginas de item de ark.wiki.gg, una por objeto (prompt 22).
 *
 * Es el tercer formato de fuente de classnames, y el más confiable de los tres:
 * el autor de la mod no interviene. La wiki le dedica **una página a cada
 * objeto** con su blueprint path verbatim en el bloque de spawn command, que es
 * justo el `value` que necesita `classNames.items`.
 *
 *   Blueprint'/Game/Mods/StructuresPlusMod/Structures/…/PrimalItemStructure_Foundation_Adobe
 *             .PrimalItemStructure_Foundation_Adobe'
 *
 * Precedente: así se sacaron los 5 items de Dino Storage v2. La diferencia de
 * escala es lo que justifica automatizarlo — Structures Plus tiene 458 páginas
 * y Super Structures 432, y a mano no se hace.
 *
 * El nombre sale del `<h1>` de la página, que es el que le puso la wiki («SS
 * Adobe Foundation»), no del classname: es lo que la gente busca y ya viene
 * desambiguado por mod.
 */

/** El path del spawn command. Se queda con el interior de las comillas. */
const BLUEPRINT_RE = /Blueprint'([^']*\.([A-Za-z0-9_]+))'/;

/** Título de la página, que es el nombre humano del objeto. */
const TITLE_RE = /<h1[^>]*id="firstHeading"[^>]*>(.*?)<\/h1>/s;

/** Fallback: MediaWiki también deja el título en su config JS. */
const WG_TITLE_RE = /"wgTitle":"((?:[^"\\]|\\.)*)"/;

function stripTags(html) {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Devuelve `{ value, label, className }` o `null` si la página no es de un
 * objeto (las hay de features y de conversiones, enlazadas desde el mismo
 * índice). Devolver null y no tirar es a propósito: el índice mezcla las dos
 * cosas y el que llama necesita seguir con las demás.
 *
 * `value` es el **blueprint path** (lo que pide «Dar item») y `className` el
 * `_C` derivado de la hoja del path (lo que piden los overrides de receta).
 * Son cosas distintas y confundirlas rompe el comando, así que el parser las
 * devuelve por separado en vez de dejar que las derive quien consume.
 */
export function parseWikiItemPage(html) {
  const blueprint = html.match(BLUEPRINT_RE);
  if (!blueprint) return null;

  // El wiki corta el path a lo ancho de la caja, así que puede venir con un
  // salto de línea en el medio: la página de S+ Industrial Forge lo parte
  // justo después de `/Game/Mods/StructuresPlusMod/`. Sin sacarlo, el path
  // llega al catálogo con un `\n` adentro y el comando que salga no anda.
  const path = blueprint[1].replace(/\s+/g, "");
  const leaf = blueprint[2];
  if (!/^PrimalItem/i.test(leaf)) return null;

  // Un blueprint path es `carpeta/Asset.Asset`: las dos mitades tienen que ser
  // la misma. Cuando no lo son, el dato está mal escrito en la fuente y el
  // comando que salga de ahí no funciona.
  //
  // El wiki tiene un bug sistemático acá: **a la segunda mitad le falta el
  // último carácter**. Visto en tres páginas distintas de dos mods —
  // `…_IndustrialForgePlus.…_IndustrialForgePlu`,
  // `…_GasCollectorTek.…_GasCollectorTe`,
  // `…_DedicatedStorageSP.…_DedicatedStorageS`— siempre igual.
  //
  // Como la PRIMERA mitad sí está completa y es la que da el nombre del asset
  // dentro de su carpeta, el valor bueno se recupera duplicándola. La
  // reparación es a propósito angosta: solo si la mitad corta es exactamente
  // la larga sin su último carácter. Cualquier otra diferencia se marca y el
  // que llama la excluye, porque ahí ya no sabemos cuál es el bueno.
  const asset = path.slice(path.lastIndexOf("/") + 1).split(".")[0];
  if (asset !== leaf) {
    const label = labelOf(html);
    if (asset.slice(0, -1) === leaf) {
      const fixed = `${path.slice(0, path.lastIndexOf("."))}.${asset}`;
      return { value: fixed, label, className: `${asset}_C`, repaired: { from: leaf, to: asset } };
    }
    return { value: path, label, className: `${leaf}_C`, mismatch: { asset, leaf } };
  }

  const label = labelOf(html);
  if (!label) return null;

  return { value: path, label, className: `${leaf}_C` };
}

/** El nombre humano: el `<h1>` de la página, o el título que deja MediaWiki. */
function labelOf(html) {
  const titleMatch = html.match(TITLE_RE);
  const fromH1 = titleMatch ? stripTags(titleMatch[1]) : null;
  if (fromH1) return fromH1;
  const wg = html.match(WG_TITLE_RE);
  // wgTitle trae la subpágina completa: «Super Structures/SS Adobe Foundation».
  if (wg) return wg[1].split("/").pop().replace(/\\(.)/g, "$1").trim();
  return null;
}

/**
 * Los links a páginas de objeto que cuelgan de un índice de mod.
 * Devueltos sin repetir y en orden de codepoint, para que dos corridas den el
 * mismo resultado (mismo criterio que `parse-arkcodes.mjs`: un orden estable
 * es lo que hace revisable el diff de una regeneración).
 */
export function itemPageLinks(indexHtml, modPage) {
  const escaped = modPage.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`/wiki/${escaped}/[A-Za-z0-9_%()\\-]+`, "g");
  const found = indexHtml.match(re) ?? [];
  return [...new Set(found)].sort();
}
