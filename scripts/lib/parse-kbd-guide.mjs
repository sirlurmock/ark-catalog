/**
 * Parser dedicado para la guía oficial de Kraken's Better Dinos (KBD).
 *
 * Existe porque el parser genérico de texto (`parse-spawncode-text.mjs`) NO
 * sirve para esta guía: intercala la descripción de cada ajuste entre el
 * nombre de la criatura y su código, así que el label salía siendo
 * «Setting to True will prevent…» en vez del nombre del ajuste. Se probó y se
 * revirtió (ver el comentario en aquel archivo).
 *
 * La guía tiene **dos formatos de ajuste conviviendo**, y esa es toda la
 * dificultad:
 *
 *   1. Secciones generales (Wild Babies, Wild Eggs…): la clave y su
 *      descripción van en la MISMA línea, separadas por el `=`.
 *
 *        WildChanceOfBaby= Number between 0.01 and 1. Defaults to 0.05 …
 *        WildBabyBlacklist=                       ← lista, sin default
 *
 *   2. Secciones por criatura (a partir de «Dino Descriptions and .Ini
 *      Information»): la clave trae su DEFAULT literal y la descripción va en
 *      la línea siguiente.
 *
 *        PreventBetterAmmonite=False
 *        Setting to True will prevent the Better Ammonite from spawning …
 *
 * Del formato 2 sale el default real de la mod, que es lo que el exporter
 * necesita para no escribir claves que el usuario nunca tocó. Del formato 1 el
 * default hay que leerlo de la prosa («Defaults to 0.05»), así que el parser lo
 * devuelve como `defaultFromProse` y NO lo mezcla con el literal: son dos
 * niveles de confianza distintos y el spec tiene que poder distinguirlos.
 *
 * Cada ajuste se queda además con el nombre de la criatura de su sección
 * (`group`), que es lo que hace legible una mod de 200 claves: sin él,
 * `PreventToughHide` no dice de quién es.
 */

/** Título de la sección a partir de la cual empiezan las fichas por criatura. */
const CREATURES_MARKER = /^\s*Dino Descriptions and \.Ini Information\s*$/;

/** Clave sola en su línea, con su default literal (formato 2) o vacía. */
const KEY_LINE_RE = /^\s*([A-Z][A-Za-z0-9_]*)=\s*([^\s]*)\s*$/;

/** Clave y descripción en la misma línea (formato 1). */
const KEY_INLINE_RE = /^\s*([A-Z][A-Za-z0-9_]*)=\s+(\S.{15,})$/;

/**
 * Rótulos que estructuran la ficha pero no nombran una sección nueva. Sin esta
 * lista los classnames saldrían etiquetados «Torpor» o «Spawn Codes», que es
 * exactamente lo que le pasa al parser genérico con esta guía: cada ficha
 * intercala el bloque de estadísticas entre el nombre de la criatura y su
 * código.
 */
const NON_HEADING =
  /^(spawn codes?|spawn command|health|stamina|weight|food|oxygen|torpor|torpidity|damage|melee|speed|movement|drag weight|level|stats?|crafting|insulation|this creature is|these creatures are|this is a|an example|some examples)\b/i;

/** `cheat spawndino "Blueprint'/Game/…/X.X'" 500 0 0 150` → `X_C`. */
const SPAWNDINO_RE = /spawndino\s+"Blueprint'([^']+\.([A-Za-z0-9_]+))'"/i;

/** Un path suelto en su línea: es como la guía publica los items. */
const BLUEPRINT_LINE_RE = /^Blueprint'([^']+\.([A-Za-z0-9_]+))'$/;

/** El engrama va como classname pelado, arriba del path del item. */
const ENGRAM_LINE_RE = /^(EngramEntry_[A-Za-z0-9_]+_C)$/;

/**
 * Encabezados que son una oración sobre la criatura, no su nombre: «Wild
 * Ichthyornis are a Unique Named Remap». El nombre es lo que va antes.
 */
const HEADING_SENTENCE = /\s+(are|is)\s+(a|an|the)\s+.*$/i;

/**
 * Variantes que la guía distingue por sufijo del classname. Sin esto, las
 * cuatro entradas del Salmón se llamarían todas «Sabertooth Salmon» y el
 * buscador de la app no serviría para elegir una.
 */
const VARIANTS = {
  aberrant: "Aberrant",
  rockwell: "Rockwell",
  eden: "Eden",
  ocean: "Ocean",
  lunar: "Lunar",
  rare: "Rare",
  volcano: "Volcanic",
  paleo: "Paleo",
  vanilla: "Vanilla",
  corrupt: "Corrupt",
  egger: "Egger",
  fire: "Fire",
  diseased: "Diseased",
  bd: null, // prefijo de la mod, no es una variante
  bp: null,
};

/** «Defaults to 0.05», «the default of 1800 equals 30 minutes», «Defaults to 5». */
const PROSE_DEFAULT_RE = /\bdefaults? (?:to |of )([0-9]+(?:\.[0-9]+)?)/i;

function decodeEntities(text) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

/** Colapsa espacios y corta el ruido de indentación del render HTML. */
function clean(line) {
  return decodeEntities(line).replace(/\s+/g, " ").trim();
}

/**
 * Una línea es encabezado de sección si viene después de al menos dos líneas
 * en blanco, es corta y no es código ni un rótulo interno de la ficha. Es la
 * única señal que dejó el render: la guía no conserva los niveles de `<h*>`.
 */
function isHeading(line, blanksBefore) {
  if (blanksBefore < 2) return false;
  if (line.length === 0 || line.length > 70) return false;
  if (line.includes("=") || line.includes("/")) return false;
  if (NON_HEADING.test(line)) return false;
  return true;
}

/**
 * El rótulo de un classname: el nombre que le puso el autor en el encabezado,
 * más la variante que distingue esta entrada de sus hermanas.
 *
 * El nombre viene del encabezado y no del classname a propósito: la guía dice
 * «Karkinos (Crab)» donde el código dice `Crab_Character_BP_C`, y el nombre
 * del autor es el que la gente busca. La variante sí sale del código, porque
 * el encabezado es el mismo para las cuatro versiones del Salmón.
 */
function saysWord(name, word) {
  return name
    .toLowerCase()
    .split(/[^a-z]+/i)
    .includes(word.toLowerCase());
}

export function kbdClassLabel(heading, className) {
  const name = heading.replace(HEADING_SENTENCE, "").trim();
  const tail = className.match(/_[Cc]haracter(?:_BP)?_(.*)_C$/)?.[1] ?? "";
  const variants = tail
    .split("_")
    .filter(Boolean)
    .map((token) => VARIANTS[token.toLowerCase()])
    // Lo que el encabezado ya dice no se repite: la ficha «Aberrant Ammonite»
    // no tiene que salir como «Aberrant Ammonite (Aberrant)».
    .filter((label) => label != null && !saysWord(name, label));
  if (variants.length === 0) return name;
  // Muchos encabezados ya terminan en paréntesis con el nombre común
  // («Araneo (Spider)»). Anidar otro par daría «Araneo (Spider) (Aberrant)»,
  // así que la variante entra en el paréntesis que ya está.
  const joined = variants.join(", ");
  return name.endsWith(")") ? `${name.slice(0, -1)}, ${joined})` : `${name} (${joined})`;
}

/**
 * Devuelve `{ settings, groups, dinos, items, engrams, warnings }`.
 *
 * `settings`: `{ key, default, defaultFromProse, description, group, format }`
 * en orden de aparición y sin repetir clave — la guía repite
 * `PreventBetterTekDinos` y `PreventWildReins` en varias fichas, y gana la
 * primera, que es donde está descripta.
 *
 * `dinos`, `items` y `engrams` son los classnames del prompt 22, sacados del
 * mismo recorrido: cada ficha termina en un bloque de spawn codes y cada silla
 * trae su engrama y su path. En criaturas el value es el classname derivado
 * **del path del spawndino**, que es la forma canónica; en items es el path
 * entero, que es lo que necesita «Dar item».
 */
export function parseKbdGuide(text) {
  const rawLines = decodeEntities(text).split(/\r?\n/);
  const lines = rawLines.map(clean);

  // La ULTIMA aparicion, no la primera: el titulo de la seccion tambien esta
  // en el indice del principio de la guia, y arrancar ahi metia adentro a la
  // prosa de "Spawning Dinos with KBD", que usa los mismos spawn codes como
  // EJEMPLO bajo un encabezado que no nombra ninguna criatura.
  const creaturesFrom = lines.reduce(
    (last, line, i) => (CREATURES_MARKER.test(line) ? i : last),
    -1,
  );
  const settings = [];
  const groups = [];
  const warnings = [];
  const seen = new Map();
  const dinos = [];
  const items = [];
  const engrams = [];
  const seenClass = { dino: new Set(), item: new Set(), engram: new Set() };

  const addClass = (bucket, kind, value, label) => {
    const k = value.toLowerCase();
    if (seenClass[kind].has(k)) return;
    seenClass[kind].add(k);
    bucket.push({ value, label });
  };

  let group = null;
  let blanks = 0;

  const push = (entry) => {
    const previous = seen.get(entry.key);
    if (previous) {
      warnings.push(
        `${entry.key} repetida (ya estaba en «${previous.group ?? "general"}», se ignora la de «${entry.group ?? "general"}»)`,
      );
      return;
    }
    seen.set(entry.key, entry);
    settings.push(entry);
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line === "") {
      blanks++;
      continue;
    }

    const inCreatures = creaturesFrom >= 0 && i > creaturesFrom;

    if (isHeading(line, blanks)) {
      group = line.replace(/:$/, "");
      if (inCreatures && !groups.includes(group)) groups.push(group);
      blanks = 0;
      continue;
    }
    blanks = 0;

    // Classnames del prompt 22. Solo desde las fichas por criatura: antes de
    // eso la guía usa los mismos códigos como EJEMPLO de cómo se spawnea, bajo
    // encabezados que no nombran a nadie («Spawning Dinos with KBD»), y esos
    // rótulos se colarían tal cual en el autocompletado.
    if (inCreatures && group) {
      const spawndino = line.match(SPAWNDINO_RE);
      if (spawndino) {
        const value = `${spawndino[2]}_C`;
        addClass(dinos, "dino", value, kbdClassLabel(group, value));
        continue;
      }
      const blueprint = line.match(BLUEPRINT_LINE_RE);
      // El path suelto solo es un item si su hoja es un PrimalItem: la guía
      // también pega paths de criatura sueltos, para Simple Spawners.
      if (blueprint && /^PrimalItem/i.test(blueprint[2])) {
        addClass(items, "item", blueprint[1], kbdClassLabel(group, blueprint[2]));
        continue;
      }
      const engram = line.match(ENGRAM_LINE_RE);
      if (engram) {
        addClass(engrams, "engram", engram[1], kbdClassLabel(group, engram[1]));
        continue;
      }
    }

    // Formato 1: clave y descripción en la misma línea.
    const inline = line.match(KEY_INLINE_RE);
    if (inline) {
      const [, key, description] = inline;
      const prose = description.match(PROSE_DEFAULT_RE);
      push({
        key,
        default: null,
        defaultFromProse: prose ? prose[1] : null,
        description,
        group,
        format: "inline",
      });
      continue;
    }

    // Formato 2: clave con default literal, descripción en la línea siguiente.
    const keyLine = line.match(KEY_LINE_RE);
    if (!keyLine) continue;
    const [, key, literal] = keyLine;

    let description = null;
    for (let j = i + 1; j < lines.length && j < i + 6; j++) {
      const next = lines[j];
      if (next === "") continue;
      if (KEY_LINE_RE.test(next) || KEY_INLINE_RE.test(next)) break;
      if (NON_HEADING.test(next)) break;
      description = next;
      break;
    }
    if (!description) {
      warnings.push(`${key} sin descripción en la línea siguiente (grupo «${group ?? "general"}»)`);
    }

    push({
      key,
      default: literal === "" ? null : literal,
      defaultFromProse: description ? (description.match(PROSE_DEFAULT_RE)?.[1] ?? null) : null,
      description,
      group,
      format: literal === "" ? "list" : "literal",
    });
  }

  return { settings, groups, dinos, items, engrams, warnings };
}
