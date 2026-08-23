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

**Salvo los que empiezan con `_`**, que son notas para quien lee el spec y no
llegan al catálogo — misma regla que a nivel spec. Sirven para anotar de dónde
salió un default o a qué criatura pertenece una clave
(`"_group": "Ankylosaurus"`) sin ensuciar el `control`.

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

### Tercera fuente: una pagina por objeto en ark.wiki.gg

Para las mods de estructuras no sirve ninguna de las otras dos. Sus hojas
oficiales son **solo de configuracion** —lo unico parecido a un classname que
aparece en la de Super Structures esta adentro de un valor de ejemplo— y
arkcodes documenta las versiones ASA. Lo que si existe es el wiki, que le dedica
**una pagina a cada objeto** con su blueprint path verbatim en el spawn command.
Es el mismo formato del que salieron los 5 items de Dino Storage, solo que a
otra escala: Structures Plus tiene 458 paginas enlazadas y Super Structures 432.

**Cuanto rinde cada una es MUY distinto: SS 401 objetos y S+ 181.** No es un
problema del scraper: las paginas de S+ que no rinden son fichas completas, con
stats y receta, pero **sin spawn command** — el wiki no publica el codigo de
esas. La de SS Greenhouse Door lo trae y la de S+ Greenhouse Door no, siendo la
misma estructura. Es tentador copiar los paths de SS a S+ porque comparten la
carpeta de assets (`/Game/Mods/StructuresPlusMod/…`, SS es fork de S+), pero
seria inferir: SS agrega estructuras que S+ no tiene, y sugerir un objeto que no
existe es peor que no sugerirlo.

```bash
node scripts/fetch-wiki-mod-items.mjs --page "Mod:Super_Structures" \
  --spec scripts/mod-specs/super-structures.json
```

Lo descargado se cachea en `_scraped/wiki-cache/`, asi que repetir la corrida no
vuelve a pedir nada y una corrida cortada sigue donde quedo.

Tres cosas aprendidas peleandola, que conviene no re-descubrir:

- **El wiki devuelve 403 al `fetch` de Node** por mas que se le copien todas las
  cabeceras de un navegador, y 200 a `curl` con solo el User-Agent: no mira las
  cabeceras sino el cliente TLS. Por eso el script llama a `curl`.
- **Frena por volumen.** La primera corrida se comio 238 bloqueos de 432
  paginas. Ahora reintenta con espera creciente, y si igual falla **no escribe
  el spec**: un spec a medias deja la mod en el catalogo con la mitad de sus
  objetos y nada avisa. El script separa "no se pudo bajar" (agujero) de "se
  bajo y no tiene objeto" (normal) y de 404 (el indice enlaza paginas que no
  existen); antes los contaba juntos y por eso una corrida bloqueada parecia
  sana.
- **Un blueprint path es `carpeta/Asset.Asset` y las dos mitades tienen que
  coincidir.** La pagina de *SS Dedicated Storage* publica
  `…_DedicatedStorageSP.PrimalItemStructure_DedicatedStorageS` —sin la P final,
  y encima con la carpeta `StructurePlusMod` en singular—. El parser lo marca y
  el script lo excluye nombrandolo, en vez de meter un path roto al catalogo.

Sembradas hasta ahora: Super Structures (401 objetos), Kraken's Better Dinos
(92 criaturas + 17 items + 15 engramas), Structures Plus (181 objetos), Upgrade
Station (15), Dino Storage v2 (5), Super Spyglass Plus (4 + 4 engramas), Awesome
Teleporters ASE (3) y Best Eggs! (1 + 1 engrama). Sin bloque, con razón:
*Creature Finder Deluxe* y *Auto Engrams!* no agregan items; *Sleep able bed*
por lo de arriba; **Weapons+** (105 ajustes) es la mod grande que sigue sin
fuente citable de classnames.

## Mods de criaturas (`settings: []`)

Las mods que solo agregan criaturas **no exponen ajustes de servidor**, pero su
entrada en el catálogo vale igual: sus classnames son lo que piden
`DinoSpawnWeightMultipliers`, `NPCReplacements` y los spawn entries por zona.
Se catalogan con `settings: []` y el bloque `classNames` — la app muestra
«esta mod no tiene ajustes propios, pero sus criaturas ya aparecen en el
autocompletado» en vez de una pantalla vacía.

En `dinos` y `dino_name_tags` el value es el **classname** / el tag
(`Anzu_Character_BP_C`, `Anzu`), no un path — igual que el catálogo core.

Dos scripts, según lo que publique la fuente:

```bash
# hilo del Workshop con solo classnames → labels humanizados (repasar a mano)
node scripts/fetch-mod-dinos.mjs --url "https://steamcommunity.com/…" --spec …

# hoja de spawn codes exportada como CSV → nombres y tags del autor
node scripts/fetch-mod-dinos.mjs --html scripts/mod-specs/_scraped/x.csv --spec … --source-url "https://docs.google.com/…"
```

**La hoja CSV es muy superior** cuando existe: trae el nombre que el autor le
puso a cada criatura («R-Anzu», «Skeletal Massospondylus»), el dino tag, y a
menudo los items (sillas, chibis) con su blueprint path. El parser saca el
classname del **path del `spawndino`**, no del `gmsummon` — en la hoja real de
Prehistoric Beasts el gmsummon trae `Genyodectes_Character_BP_C_Volcanic`, con
el `_C` en el medio, y el path da el bueno.

## Alcance de `dino-storage-v2.json`

**Completa: 198 claves**, incluidas las 22 listas (`ExcludeClass`, `IncludeTag`,
`ConvertClass`, `EquipmentBlacklist`, `TerminalAutomationFuel`…), las
exclusiones booleanas por tipo de dino, las de colocación y estética de la
terminal, y las de tribu y PvP.

> Hasta el 2026-08-22 esta sección decía que el spec cubría **44** claves y que
> las listas «necesitan un `ControlKind` nuevo». Las dos cosas quedaron viejas:
> `string_list` se creó justo para eso — ver el comentario de
> `StringListControl` en `src/types/setting.ts`, que nombra a esta mod — y una
> sesión posterior completó el spec sin actualizar el texto. La nota vieja
> llegó a hacer que se planificara un sprint para trabajo que ya estaba hecho.
> **Si completás una mod, actualizá su sección de alcance en el mismo commit.**

Fuente: <https://ark.wiki.gg/wiki/Mod:Dino_Storage>

## El spec generado de Kraken's Better Dinos

`krakens-better-dinos.json` es la excepción al «un spec se escribe a mano».
**No editarlo**: lo pisa `node scripts/build-kbd-spec.mjs`, que lo arma desde el
snapshot de la guía oficial. Para cambiar un texto se toca
`scripts/lib/kbd-texts.mjs` (sección general, tipos, rangos y tiers) o
`scripts/lib/kbd-texts-creatures.mjs` (los ajustes por criatura), y se regenera.

Existe porque la mod expone **231 claves** y 65 de ellas son literalmente la
misma frase del autor con otra criatura: escribirlas a mano sería copiar y pegar
65 veces con la oportunidad de equivocarse en cada una. Es el mismo criterio con
el que Structures Plus generó sus familias `*SlotCount` y `*CraftingSpeed`, solo
que acá la generación cubre el spec entero.

El reparto de responsabilidades:

- **EN**: verbatim de la guía del autor, como en Structures Plus.
- **ES de las 65 formulaicas**: plantilla por familia + el nombre de la criatura.
- **ES de las otras 166**: escritas a mano en los dos módulos de textos.
- **tipo, rango y tier**: la tabla `KBD_CONTROLS`.

### Por qué hizo falta un parser propio

`parse-spawncode-text.mjs` sobre esta guía devuelve **0 criaturas**, y el parser
genérico de ajustes salía con el label «Setting to True will prevent…»: la guía
intercala la descripción de cada ajuste entre el nombre de la criatura y su
código. `scripts/lib/parse-kbd-guide.mjs` lo resuelve modelando lo que la guía
realmente tiene — **dos formatos de ajuste conviviendo** (clave y descripción en
la misma línea en las secciones generales; clave con default literal y
descripción en la línea siguiente en las fichas por criatura) — y trayendo de
paso los classnames, que salen del mismo recorrido.

Dos trampas que costaron un test cada una:

- **El índice repite los títulos de sección.** Buscar «Dino Descriptions and
  .Ini Information» con `findIndex` matcheaba en el índice del principio, no en
  la sección, y metía adentro la prosa de «Spawning Dinos with KBD», que usa los
  mismos spawn codes como EJEMPLO bajo un encabezado que no nombra a nadie. Va
  con la ÚLTIMA aparición.
- **La guía documenta claves vanilla.** `NPCReplacements` y
  `ConfigAddNPCSpawnEntriesContainer` aparecen como recetas (cómo borrar el
  Ichthyornis salvaje, cómo agregar el Deinon a otros mapas). Son de `Game.ini`
  bajo la sección del juego y ya están en el catálogo core: catalogarlas bajo
  `[BetterDinos]` las escribiría donde ARK no las lee. El parser las ve (es lo
  correcto) y el builder las descarta con nombre y razón.

### Alcance

Las 231 claves documentadas: 228 salen de las fichas y 3 (`AllowFlyerSpeed`,
`RandomAberrants`, `RandomAberrantsBDOnly`) de la prosa, que las menciona sin
darles ficha propia y por eso el parser no las ve. Van a mano con su cita en
`_source`.

Quedó afuera, con razón:

- **La nivelación de dinos salvajes.** La guía la promete («Level Equalisation
  and High Level .Ini Options») pero su sección dice *More Information To Come*:
  sin nombres de clave citables no hay nada que catalogar.
- **La blacklist de voladores del `AllowFlyerSpeed`.** El autor la menciona sin
  dar el nombre de la clave.

Fuente: la **User Guide** del autor,
<https://steamcommunity.com/sharedfiles/filedetails/?id=2071693170>. Ojo con los
IDs: **2071693170 es la guía**, la mod es **1565015734**. El snapshot está
versionado en `_scraped/krakens-better-dinos-guide.txt` (excepción explícita en
`.gitignore`) porque es la entrada de un spec generado y del test del parser;
como todo `_scraped`, no se publica al espejo.
