# ARK Catalog

El catálogo de configuración que usa **[ARK Config
Studio](https://github.com/sirlurmock/ark-studio-releases)**: qué hace cada
ajuste de ARK, en qué archivo y sección se escribe, y qué expone cada mod.

Son datos, no código. Y son abiertos a propósito: el trabajo pesado acá no es
programar, es **leer la documentación de cada mod y transcribirla bien**.

## Qué hay

<!-- stats:start -->
| | |
|---|---|
| **252 ajustes** del juego base | en 11 categorías, con su archivo y sección verificados |
| **1519 ajustes de 54 mods** | incluidas Structures Plus (288) y Super Structures (274) |
| **118 comandos** de consola | con sus parámetros y advertencias de riesgo |
| **16 presets** | velocidad, modo de juego, foco y calidad gráfica |
| **13 mapas** oficiales | con sus juegos compatibles y características |
| **Español e inglés** | con paridad estricta verificada por tests |
<!-- stats:end -->

## Cómo está organizado

```
catalog/      los datos que consume la app — se generan, no se editan a mano
mod-specs/    la fuente: una mod por archivo, con sus claves y defaults
scripts/      el generador que convierte un spec en catálogo
```

**`mod-specs/` es la fuente y `catalog/` es lo derivado.** Editar el catálogo a
mano funciona hasta que alguien regenera y lo pisa. Para agregar o corregir una
mod se toca su spec y se regenera:

```bash
node scripts/scaffold-mod.mjs --spec mod-specs/mi-mod.json
```

El formato de los specs está documentado en
[`mod-specs/README.md`](mod-specs/README.md).

## Cómo pedir que se agregue una mod

**La forma más fácil**: desde la app, en el panel de mods, el botón de sugerir
abre un issue acá con todo el formato puesto — incluido un borrador listo para
procesar. No necesitás entender el formato.

**A mano**: abrí un [issue](../../issues/new) contando qué mod es, su link, y
—lo más importante— **dónde está su documentación de configuración**. Eso es lo
que más tiempo lleva de encontrar.

## Cómo avisar que a una mod catalogada le falta un ajuste

Pasa seguido: la mod ya está en la app, pero su autor agregó una clave nueva o
una se nos escapó. **Desde la app**: dentro de la mod, el link "¿Encontraste un
ajuste que falta?" abre un issue con el formato puesto — y te avisa si la clave
ya está catalogada, para que no se repita. **A mano**: usá la plantilla
[Sugerir un ajuste faltante](../../issues/new?template=sugerir-ajuste.yml),
revisando antes [los ya pedidos](../../issues?q=label%3Asetting-suggestion).

Después de crear el issue podés pegar su link en la app ("Mis sugerencias", en
el panel de mods) para seguir su estado sin salir de ella.

### Lo que hace que una sugerencia sea buena

Lo que más ayuda no es la lista de claves, es saber **cuáles son los defaults
reales de la mod**. Y ahí hay una trampa que ya nos mordió dos veces: muchos
autores publican un bloque de ejemplo que **no** son los defaults. Death
Recovery lo aclara en mayúsculas —*"these settings are NOT default"*— y el
bloque de Dino Tracker es la receta de "desactivá todo".

**La regla: si el autor no dice literalmente que ese bloque son los defaults, no
lo son.**

Dónde suele estar la documentación buena, por orden:

1. Una **guía o documento aparte** linkeado desde la descripción. Las dos mods
   más grandes del catálogo la tienen así: Structures Plus en una hoja de
   cálculo y Crafting Skill Potion en una guía del Workshop.
2. La descripción del Workshop, cuando el autor pegó su bloque de config.
3. La wiki de la mod, si tiene.
4. Un `.ini` real de alguien que la use — sirve para descubrir qué claves
   existen, pero **sus valores son los de esa persona, no los defaults**.

## Cómo se usa un `.ini` tuyo

Mandar tu `GameUserSettings.ini` o tu `Game.ini` es de las cosas más útiles que
podés hacer, sobre todo si jugás **ASA** o en mapas poco cubiertos.

**Antes de compartirlo, sacale**: `ServerPassword`, `ServerAdminPassword`,
`SpectatorPassword`, `RCONPassword` y cualquier `SessionName` que te identifique.
El resto no tiene datos personales.

## Licencia

Los datos están bajo **[CC BY-SA 4.0](LICENSE)**: podés usarlos, adaptarlos y
redistribuirlos, incluso comercialmente, siempre que des crédito y compartas tus
mejoras bajo la misma licencia.

La aplicación que consume estos datos es gratuita pero de código cerrado, y se
descarga desde
[ark-studio-releases](https://github.com/sirlurmock/ark-studio-releases).

---

Los datos de cada mod provienen de la documentación que publica su propio autor.
Cada mod catalogada enlaza a su página original.

ARK: Survival Evolved y ARK: Survival Ascended son marcas de Studio Wildcard.
Este proyecto no está afiliado ni respaldado por Studio Wildcard.
