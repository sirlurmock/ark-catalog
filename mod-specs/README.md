# Specs de mods

Entrada versionada para `scripts/scaffold-mod.mjs --spec`. Cada archivo describe
una mod completa —claves, tipos, rangos y textos ES/EN— y de ahí sale el JSON de
`catalog/mods/` más las traducciones, sin escribir nada a mano.

Se versiona el spec y no solo el resultado para poder **regenerar**: si mañana
cambia el formato del catálogo o hay que retocar todos los rangos, se toca el
spec y se corre el script de nuevo.

```bash
node scripts/scaffold-mod.mjs --spec scripts/mod-specs/dino-storage-v2.json
```

El script pisa `catalog/mods/<game>/community/<slug>.json` y el bloque
`mods.<prefix>.*` de `catalog/i18n/{es,en}.json`. Todo lo demás de los i18n queda
intacto.

## Formato

```jsonc
{
  "modId": "DinoStorage2",      // = nombre de la sección en el .ini
  "name": "Dino Storage v2",
  "game": "ase",                 // ase | asa
  "source": "community",         // community | verified
  "workshopUrl": "https://…",
  "alsoWorkshopIds": ["2121156303"], // opcional, ver abajo
  "prefix": "dino_storage_v2",   // namespace de i18n y prefijo de los ids
  "section": "StructuresPlus",  // opcional, ver abajo
  "file": "GameUserSettings.ini", // opcional, es el default
  "settings": [
    {
      "key": "IncubationMultiplier",   // tal cual va en el .ini
      "kind": "float_multiplier",      // boolean | integer | float_multiplier
      "tier": "basic",                 // basic | advanced | expert
      "default": 2,
      "min": 0, "max": 50, "step": 0.5,
      "presets": [1, 2, 5, 10],        // solo float_multiplier
      "es": { "label": "…", "description": "…" },
      "en": { "label": "…", "description": "…" }
    }
  ]
}
```

Todo lo que no sea `key`, `kind`, `tier`, `es` y `en` se pasa tal cual al objeto
`control`, así que los campos válidos son los de `ControlKind` en
`src/types/setting.ts`.

**El `tier` es lo que hace usable una mod grande.** En modo Básico el editor
muestra solo `basic`, así que ahí van los tres o cuatro parámetros por los que
alguien instala la mod; el resto va a `advanced` y los ajustes finos a `expert`.

## Convención de `default`

El default del spec tiene que ser **el de la mod**, no el que tenga el usuario en
su `.ini` ni el del bloque de ejemplo del Workshop. El exporter omite todo valor
igual al default, así que un default mal puesto hace que un ajuste que el usuario
cree haber cambiado no se escriba —o al revés, que se escriba basura que nunca
tocó.

**Regla práctica: si el autor no dice literalmente que ese bloque son los
defaults, no lo son.** Death Recovery publica un bloque aclarando en mayúsculas
que son ejemplos, y el de Dino Tracker es la receta de "desactivá todo": los dos
borradores del scraper salieron con los defaults invertidos. Poné en el spec un
campo `_defaults` explicando de dónde salió cada uno.

## `section` a nivel mod

Sin este campo, `section` cae en el `modId`, que es lo correcto casi siempre
porque catalogamos usando el nombre de sección como modId.

**Structures Plus rompe esa suposición**: su modId es el ID del Workshop
(`731604991`) y su sección es `[StructuresPlus]`. Sin `section`, sus 175 claves
salían exportadas bajo `[731604991]` y ARK no habría leído ni una. Si el modId
no es el nombre de sección, este campo es obligatorio.

## `alsoWorkshopIds`

IDs adicionales del Workshop que resuelven a esta misma entrada. Existe porque
hay mods distintas que comparten la sección del `.ini`: CKF Remastered y CKF
Sci-Fi leen las dos de `[CKF_Config]`, así que hay una sola entrada, y sin el
alias quien tuviera solo la Sci-Fi escribiría su ID y no encontraría los ajustes
que sí están catalogados.

**Solo si comparten la sección de verdad.** CKF Legacy también es "CKF", pero lee
`[CastleModifiers]`: aliasearlo haría que la app le escribiera claves que esa mod
nunca lee. Va como entrada aparte.

## `classNames` (prompt 22)

Bloque opcional con los classnames que la mod aporta al autocompletado
(recetas de crafteo, «Dar item», overrides de engramas, `string_list` con
sugerencias). Solo se sugieren con la mod **activa en el perfil**.

```jsonc
{
  "classNames": {
    "items":   [{ "value": "/Game/Mods/…/PrimalItem_X.PrimalItem_X", "label": "X" }],
    "engrams": [{ "value": "EngramEntry_X_C", "label": "X" }]
  },
  "_classnamesSource": { "items": { "url": "…", "fetchedAt": "2026-08-20", "note": "…" } }
}
```

Reglas:

- **Fuente citable obligatoria** en `_classnamesSource`, como los defaults. Sin
  fuente, la mod no lleva bloque — el texto libre sigue funcionando.
- En `items` el `value` es el **blueprint path** (lo que pide GiveItem; los
  campos `ItemClassString` derivan el `_C` solos); en `engrams` es el
  classname `_C`, como el catálogo core.
- **Las páginas de arkcodes.com son de las versiones ASA**: sus paths NO
  sirven tal cual para una entrada ASE (`/Game/Mods/<carpeta>/…`, y a veces
  distinto set de items). `fetch-mod-classnames.mjs` sirve como borrador;
  para ASE, corregir con una fuente nativa (hilo de spawncodes del Workshop).
- Los labels del scraper salen humanizados del classname y son borrador:
  revisarlos a mano antes de regenerar.
- **Una fuente que solo da classnames `_C` no alcanza para `items`.** El value
  tiene que ser el blueprint path: `items_classnames` deriva bien el `_C`, pero
  «Dar item» necesita el path y con un classname generaría un comando roto. Si
  la doc solo trae classnames, la mod se queda sin bloque hasta conseguir los
  paths (caso *Sleep able bed*: el autor los publicó como `_C` en un
  `ConfigOverrideItemCraftingCosts` de ejemplo, sin paths).

Sembradas hasta ahora: Upgrade Station (15), Dino Storage v2 (5), Super
Spyglass Plus (4 + 4 engramas), Awesome Teleporters ASE (3) y Best Eggs! (1 + 1
engrama). Sin bloque, con razón: *Creature Finder Deluxe* y *Auto Engrams!* no
agregan items; *Sleep able bed* por lo de arriba; *Super Structures* (~300
estructuras) espera su propia tanda.

## Alcance de `dino-storage-v2.json`

La wiki oficial documenta ~180 claves; el spec cubre **44**. Criterio: lo que se
toca en la práctica —crianza, regeneración pasiva, enfermedad al liberar,
autotrap por muerte, automatización de la terminal, revivir cadáveres y los
límites más comunes de trampeo y liberación.

Quedó afuera a propósito:

- **Las ~16 opciones de tipo array** (`ExcludeClass`, `IncludeTag`,
  `ConvertClass`, `EquipmentBlacklist`…). Son listas de classnames y el catálogo
  no tiene todavía un control de texto libre ni de lista de strings. Necesitan un
  `ControlKind` nuevo.
- **Las ~24 exclusiones booleanas por tipo de dino** (`ExcludeBaby`,
  `ExcludeBoss`, `ExcludeFlyer`, `ExcludeWater`…). Son mecánicas y fáciles de
  sumar, pero 24 checkboxes en fila aportan poco frente al ruido que meten.
- **Las ~20 de colocación de la terminal** (`TerminalExcludeGround`,
  `TerminalExcludeFlyerPlatforms`…) y las de estética (`BasicTerminal`,
  `GhostTerminal`, `VaultTerminal`).
- **Las de tribu y PvP finas** (`RequireTribeRanks`, `TerminalRaidPurge`,
  `MutatorAllowMek`…).

Sumar cualquiera de esos grupos es agregar entradas al spec y volver a correr el
script — no hay código de por medio.

Fuente: <https://ark.wiki.gg/wiki/Mod:Dino_Storage>
