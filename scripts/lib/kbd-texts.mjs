/**
 * Textos ES, tipos y rangos de Kraken's Better Dinos.
 *
 * Se separa de `build-kbd-spec.mjs` porque es lo único de ese circuito que se
 * escribe y se revisa a mano: el resto (parseo, plantillas, armado del spec)
 * es mecánico. Acá van las claves cuya descripción es única en la guía; las
 * otras 65 son la misma frase con otra criatura y salen de las plantillas del
 * builder.
 *
 * El inglés NO está acá: sale verbatim de la guía del autor, como en
 * Structures Plus. Solo se escribe `en` cuando la frase de la guía no alcanza
 * por sí sola (las claves que la guía menciona en prosa, sin ficha propia).
 */
import { KBD_CREATURE_TEXTS } from "./kbd-texts-creatures.mjs";

/**
 * Tipo, rango y tier de lo que no es «booleano en False».
 *
 * Los rangos son conservadores y salen de la guía cuando la declara («This
 * must be between 0.05 and 0.95», «Number between 1 and 100», «It cannot go
 * higher than 1, the game will not allow it»). Donde el autor no da un tope,
 * el max es un valor holgado pero finito: un campo sin límite invita a
 * escribir un número que rompe el servidor.
 */
export const KBD_CONTROLS = {
  // --- sección general: las features que se prenden, y su sintonía ---------
  WildBabies: { tier: "basic" },
  WildEggs: { tier: "basic" },
  UntameableAdults: { tier: "basic" },
  PassiveTameBabies: { tier: "basic" },
  PreventAngryAdults: { tier: "advanced" },
  WildChanceOfBaby: {
    kind: "float_multiplier",
    tier: "advanced",
    default: 0.05,
    min: 0.01,
    max: 1,
    step: 0.01,
    presets: [0.05, 0.1, 0.25, 0.5],
  },
  WildChanceOfEgg: {
    kind: "integer",
    tier: "advanced",
    default: 5,
    min: 1,
    max: 100,
    step: 1,
  },
  PassiveTameBabyFoodMulti: {
    kind: "float_multiplier",
    tier: "advanced",
    default: 5,
    min: 0.1,
    max: 50,
    step: 0.5,
    presets: [1, 2, 5, 10],
  },
  // Las listas usan Dino Name Tags, que es justo la lista que ya tiene el
  // catálogo core: el autocompletado sale gratis.
  WildBabyBlacklist: {
    kind: "string_list",
    tier: "advanced",
    default: [],
    suggestions: "dino_name_tags",
  },
  WildEggsBlacklist: {
    kind: "string_list",
    tier: "advanced",
    default: [],
    suggestions: "dino_name_tags",
  },
  PassiveTameBabyBlacklist: {
    kind: "string_list",
    tier: "advanced",
    default: [],
    suggestions: "dino_name_tags",
  },
  UntameableAdultBlacklist: {
    kind: "string_list",
    tier: "advanced",
    default: [],
    suggestions: "dino_name_tags",
  },
  WildBabyWhitelist: {
    kind: "string_list",
    tier: "advanced",
    default: [],
    suggestions: "dino_name_tags",
  },
  WildEggsWhitelist: {
    kind: "string_list",
    tier: "advanced",
    default: [],
    suggestions: "dino_name_tags",
  },
  PassiveTameBabyWhitelist: {
    kind: "string_list",
    tier: "advanced",
    default: [],
    suggestions: "dino_name_tags",
  },
  UntameableAdultWhitelist: {
    kind: "string_list",
    tier: "advanced",
    default: [],
    suggestions: "dino_name_tags",
  },
  // `Rex:50` no es un tag suelto, así que acá no se sugiere nada: el
  // autocompletado ofrecería `Rex` y el usuario terminaría con la entrada a
  // medias, sin el nivel, que es la mitad que importa.
  PassiveTameBabyMinLevel: { kind: "string_list", tier: "advanced", default: [] },
  BuffsIncludeSource: { kind: "string_list", tier: "advanced", default: [] },

  // --- intervalos de producción pasiva (segundos) --------------------------
  AnglerGelInterval: { kind: "integer", default: 1800, min: 60, max: 86400, step: 60 },
  JellyHarvestInterval: { kind: "integer", default: 1800, min: 60, max: 86400, step: 60 },
  DeerMilkInterval: { kind: "integer", default: 1800, min: 60, max: 86400, step: 60 },
  SheepMilkInterval: { kind: "integer", default: 1800, min: 60, max: 86400, step: 60 },
  PhiomiaMilkInterval: { kind: "integer", default: 2700, min: 60, max: 86400, step: 60 },
  WyvernMilkInterval: { kind: "integer", default: 7200, min: 60, max: 86400, step: 60 },

  // --- topes y rangos en unidades del juego --------------------------------
  JellyMaxHarvest: { kind: "integer", default: 200, min: 1, max: 5000, step: 10 },
  OviNestMaxSlots: { kind: "integer", default: 50, min: 1, max: 300, step: 5 },
  // «For reference a regular foundation is 300 Units»: la guía da la escala.
  BeetlePoopCollectionRange: { kind: "integer", default: 500, min: 100, max: 10000, step: 100 },
  BeetleFertilizerDistributionRange: {
    kind: "integer",
    default: 1000,
    min: 100,
    max: 10000,
    step: 100,
  },

  // --- multiplicadores ------------------------------------------------------
  // «It cannot go higher than 1, the game will not allow it»: el max es 1.
  AnkyMaxGatherWeightLimit: {
    kind: "float_multiplier",
    default: 0.75,
    min: 0.05,
    max: 1,
    step: 0.05,
    presets: [0.5, 0.75, 0.9, 1],
  },
  BeaverMaxGatherWeightLimit: {
    kind: "float_multiplier",
    default: 0.75,
    min: 0.05,
    max: 1,
    step: 0.05,
    presets: [0.5, 0.75, 0.9, 1],
  },
  DoedMaxGatherWeightLimit: {
    kind: "float_multiplier",
    default: 0.75,
    min: 0.05,
    max: 1,
    step: 0.05,
    presets: [0.5, 0.75, 0.9, 1],
  },
  BrontoStompHarvestMultiplier: {
    kind: "float_multiplier",
    default: 1,
    min: 0,
    max: 10,
    step: 0.1,
    presets: [0.5, 1, 2, 5],
  },
  // Peso de spawn, no porcentaje: el Dilo chico pesa siempre 1, así que 1 es
  // mitad y mitad, y más de 1 inclina la balanza hacia los grandes.
  BigDiloChance: {
    kind: "float_multiplier",
    default: 0.2,
    min: 0,
    max: 10,
    step: 0.05,
    presets: [0.2, 0.5, 1, 2],
  },
  // «This must be between 0.05 and 0.95», literal de la guía.
  FeroxBreedingAddictionAmount: {
    kind: "float_multiplier",
    default: 0.95,
    min: 0.05,
    max: 0.95,
    step: 0.05,
    presets: [0.25, 0.5, 0.75, 0.95],
  },
  SaberDamageBonusAmount: {
    kind: "float_multiplier",
    default: 0.35,
    min: 0,
    max: 5,
    step: 0.05,
    presets: [0.15, 0.35, 0.5, 1],
  },
  // «Must be an Integer (whole number)»: el autor lo aclara en las tres.
  LeechBloodHarvestMultiplier: { kind: "integer", default: 1, min: 1, max: 100, step: 1 },
  LeechDiseasedBileHarvestAmount: { kind: "integer", default: 1, min: 1, max: 100, step: 1 },
  LeechBloodBagMulti: { kind: "integer", default: 1, min: 1, max: 100, step: 1 },

  // --- listas de producción -------------------------------------------------
  CoelBlacklist: {
    kind: "string_list",
    default: [
      "Sap",
      "ChitinPaste",
      "Silicon",
      "Polymer",
      "Ambergris",
      "Charcoal",
      "Metal",
      "ArrowStone",
      "ArrowTranq",
      "CompoundBowArrow",
      "TranqDart",
      "Narcoberry",
      "Stimberry",
      "Mejoberry",
      "Tintoberry",
      "Amarberry",
      "Azulberry",
      "JellyVenom",
      "LeechBlood",
      "AmmoniteBlood",
      "SquidOil",
      "AnglerGel",
      "Sulfur",
      "Sand",
      "Crystal",
      "Obsidian",
      "Clay",
      "Substrate",
      "Seed",
    ],
  },
  CoelLootBlacklist: { kind: "string_list", default: [] },
  PegoLootBlacklist: { kind: "string_list", default: [] },
};

/**
 * Claves reales que la guía menciona **en prosa** y no en una ficha, así que
 * el parser no las ve: no están escritas como `Clave=Valor` en su propia
 * línea. Son features de peso — `AllowFlyerSpeed` es de las razones por las
 * que se instala la mod — y dejarlas afuera por un detalle de formato sería
 * perder lo mejor. Cada una va con su cita textual en `_source`.
 */
export const KBD_PROSE_ONLY = [
  {
    key: "AllowFlyerSpeed",
    kind: "boolean",
    default: false,
    tier: "basic",
    _group: "KBD Special Features",
    _source:
      "«This ability is not enabled by default and must be enabled using the .Ini option AllowFlyerSpeed=True» (sección KBD Special Features).",
    es: {
      label: "Permitir subir velocidad a los voladores",
      description:
        "Habilita el sistema de voladores veloces de KBD. Con esto prendido, cada volador se convierte a mano desde su menú radial («Convert to Speed Flyer») y recién ahí puede subir velocidad, +2% por punto. La conversión es reversible y devuelve los puntos gastados. No es lo mismo que el ajuste del juego base, que da +1% y aplica a todos los voladores sin convertir nada.",
    },
    en: {
      label: "Allow Flyer Speed",
      description:
        "Enables KBD's speed flyer system. Flyers must then be converted individually from their radial menu ('Convert to Speed Flyer') before they can level speed, gaining 2% per point. The conversion is reversible and refunds spent points.",
    },
  },
  {
    key: "RandomAberrants",
    kind: "boolean",
    default: false,
    tier: "advanced",
    _group: "KBD Special Features",
    _source:
      "«…or with a 10% chance of replacing KBD Ammonites on any map if using the RandomAberrants=True or RandomAberrantsBDOnly=True .Ini options» (repetido en las fichas de Ammonite, Dilo, Eurypterid, Lymantria, Megaloceros, Oviraptor, Pachyrhino y Unicorn).",
    es: {
      label: "Aberrantes aleatorios en cualquier mapa",
      description:
        "Da un 10% de probabilidad de que aparezca la versión aberrante de las criaturas que la tienen, en cualquier mapa y no solo en Aberration.",
    },
    en: {
      label: "Random Aberrants",
      description:
        "Gives a 10% chance for aberrant versions to spawn on any map, not just Aberration.",
    },
  },
  {
    key: "RandomAberrantsBDOnly",
    kind: "boolean",
    default: false,
    tier: "advanced",
    _group: "KBD Special Features",
    _source: "Misma cita que RandomAberrants.",
    es: {
      label: "Aberrantes aleatorios, solo los de KBD",
      description:
        "Igual que «Aberrantes aleatorios en cualquier mapa», pero limitado a las criaturas de KBD: las del juego base siguen apareciendo solo donde corresponde.",
    },
    en: {
      label: "Random Aberrants (KBD only)",
      description:
        "Same as Random Aberrants, but limited to KBD's own creatures — vanilla ones keep their normal spawn rules.",
    },
  },
];

/**
 * Sección general de la guía: las features que se prenden a nivel servidor y
 * sus listas. Es lo único de KBD que no cuelga de una criatura.
 */
const GENERAL = {
  WildBabies: {
    es: {
      label: "Bebés salvajes",
      description:
        "Hace que cualquier dino que aparezca tenga una chance de nacer como bebé. Los bebés salvajes siguen al adulto más cercano de su especie y, si no hay ninguno, KBD hace aparecer uno del mismo nivel para cuidarlo. Acercarse de más suele alertar a los adultos. Cambia por completo cómo se consiguen tames.",
    },
  },
  PreventAngryAdults: {
    es: {
      label: "Adultos no se enojan por los bebés",
      description:
        "Los adultos dejan de atacar cuando te acercás a un bebé salvaje. Para quien quiere el paisaje de bebés dando vueltas sin el riesgo que trae.",
    },
  },
  WildChanceOfBaby: {
    es: {
      label: "Probabilidad de bebé salvaje",
      description:
        "Qué porción de los dinos salvajes aparece como bebé. El default 0.05 es 5%. Solo tiene efecto con «Bebés salvajes» prendido.",
    },
  },
  PassiveTameBabyFoodMulti: {
    es: {
      label: "Multiplicador de hambre del bebé pasivo",
      description:
        "Qué tan rápido baja la comida de los bebés salvajes que se volvieron domesticables por pasiva gracias a KBD. Más alto = más rápido se les acaba y más apurado el tameo. No afecta a las especies que ya se doman por pasiva de fábrica.",
    },
  },
  WildEggs: {
    es: {
      label: "Huevos salvajes",
      description:
        "Los dinos salvajes que ponen huevos arman nidos en el mundo, uno por especie dentro de cierto radio. No aplica a los que ya ponen huevos salvajes (Wyverns, Rock Drakes, Magmasaur, Deinonychus) ni a los que no se pueden domar. A diferencia de otras mods, estos huevos no se incuban ni pierden vida, y se borran solos al vencer.",
    },
  },
  WildChanceOfEgg: {
    es: {
      label: "Probabilidad de huevo salvaje",
      description:
        "Porcentaje de dinos salvajes que dejan un huevo al salir de estasis. El default 5 es 5%. Solo tiene efecto con «Huevos salvajes» prendido.",
    },
  },
  UntameableAdults: {
    es: {
      label: "Adultos indomables",
      description:
        "Ningún dino adulto se puede domar. Pensado para usarse junto con bebés y huevos salvajes: la única vía para conseguir tames pasa a ser criarlos. Los que no pueden ser bebés (o están exentos por las mismas reglas que «Bebés salvajes») se siguen domando normal.",
    },
  },
  PassiveTameBabies: {
    es: {
      label: "Bebés salvajes domables por pasiva",
      description:
        "Cualquier bebé salvaje se puede domar dándole de comer, sin importar su método normal, y deja de poder domarse por KO. Ojo: hay especies cuyo método propio no es compatible con la pasiva (Tusoteuthis, Bloodstalker) y pueden quedar imposibles de domar como bebés. Los adultos cercanos reaccionan mal a que le des de comer a su cría.",
    },
  },
  WildBabyBlacklist: {
    es: {
      label: "Especies excluidas de nacer como bebés",
      description:
        "Dino Name Tags de las especies que NO deben aparecer como bebés salvajes, separadas por coma. Si usás lista negra y lista blanca del mismo tipo, gana la negra y la blanca ni se mira.",
    },
    en: {
      label: "Wild Baby Blacklist",
      description:
        "Dino Name Tags of the species that should never spawn as wild babies, comma separated. Blacklists always override whitelists of the same type.",
    },
  },
  WildEggsBlacklist: {
    es: {
      label: "Especies excluidas de poner huevos salvajes",
      description:
        "Dino Name Tags de las especies que no deben poner huevos en el mundo, separadas por coma. Los ejemplos de la guía usan Gigant, Quetz, Therizinosaurus y Tusoteuthis.",
    },
    en: {
      label: "Wild Eggs Blacklist",
      description:
        "Dino Name Tags of the species that should not lay wild eggs, comma separated. Blacklists always override whitelists of the same type.",
    },
  },
  PassiveTameBabyBlacklist: {
    es: {
      label: "Especies excluidas del tameo pasivo de bebés",
      description:
        "Dino Name Tags de los bebés que no deben poder domarse por pasiva, separadas por coma. Útil para las especies cuyo método de tameo propio no es compatible.",
    },
    en: {
      label: "Passive Tame Baby Blacklist",
      description:
        "Dino Name Tags of the babies that should not be passive tameable, comma separated. Blacklists always override whitelists of the same type.",
    },
  },
  UntameableAdultBlacklist: {
    es: {
      label: "Especies exentas de ser adultos indomables",
      description:
        "Dino Name Tags de las especies cuyos adultos se siguen pudiendo domar normalmente, separadas por coma.",
    },
    en: {
      label: "Untameable Adult Blacklist",
      description:
        "Dino Name Tags of the species whose adults stay tameable, comma separated. Blacklists always override whitelists of the same type.",
    },
  },
  WildBabyWhitelist: {
    es: {
      label: "Únicas especies que nacen como bebés",
      description:
        "Al revés que la lista negra: solo estas especies aparecen como bebés salvajes. Más cómodo y más liviano para el servidor cuando querés afectar a pocas. No se puede usar junto con la lista negra del mismo tipo.",
    },
    en: {
      label: "Wild Baby Whitelist",
      description:
        "Only these species spawn as wild babies. More performant when only a few species are affected. Cannot be combined with the blacklist of the same type.",
    },
  },
  UntameableAdultWhitelist: {
    es: {
      label: "Únicas especies con adultos indomables",
      description:
        "Solo estas especies tienen adultos que no se pueden domar; el resto sigue normal. No se puede usar junto con la lista negra del mismo tipo.",
    },
    en: {
      label: "Untameable Adult Whitelist",
      description:
        "Only these species get untameable adults. Cannot be combined with the blacklist of the same type.",
    },
  },
  PassiveTameBabyWhitelist: {
    es: {
      label: "Únicas especies con bebés domables por pasiva",
      description:
        "Solo los bebés de estas especies se pueden domar dándoles de comer. No se puede usar junto con la lista negra del mismo tipo.",
    },
    en: {
      label: "Passive Tame Baby Whitelist",
      description:
        "Only babies of these species can be passive tamed. Cannot be combined with the blacklist of the same type.",
    },
  },
  WildEggsWhitelist: {
    es: {
      label: "Únicas especies que ponen huevos salvajes",
      description:
        "Solo estas especies dejan huevos en el mundo. No se puede usar junto con la lista negra del mismo tipo: si hay lista negra, la blanca ni se mira.",
    },
  },
  PassiveTameBabyMinLevel: {
    es: {
      label: "Nivel mínimo para domar bebés por pasiva",
      description:
        "Pares «Tag:Nivel» separados por coma, por ejemplo Rex:50,Therizinosaurus:60,Dodo:105. Los bebés de esa especie por debajo de ese nivel no se pueden domar por pasiva. Solo aplica al tameo pasivo de bebés.",
    },
  },
  BuffsIncludeSource: {
    es: {
      label: "Aplicar los buffs de KBD a mods de terceros",
      description:
        "Rutas de otras mods cuyas criaturas también deben recibir los buffs de KBD, separadas por coma. Acepta coincidencias parciales: «PaleoARKLegends» agarra toda la mod, «PaleoARKLegends/PaleoVariants/PaleoStego» solo esa criatura. Solo funciona si esas criaturas son clases hijas de la vanilla, y solo sobre los cambios hechos por buff (los remapeos y las criaturas únicas de KBD no se ven afectados). El autor lo declara un método de nicho y sin soporte.",
    },
    en: {
      label: "Buffs Include Source",
      description:
        "Path string array (comma separated) of other mods whose creatures should also receive KBD buffs. Partial path matches are accepted. Only works for creatures that are child classes of vanilla, and only for changes made via buff.",
    },
  },
};

/**
 * Textos ES de todas las claves con descripción propia en la guía: las de la
 * sección general más las de cada criatura, que viven en su propio archivo por
 * volumen (son casi 150 y crecen con cada criatura que el autor toque).
 */
export const KBD_TEXTS = { ...GENERAL, ...KBD_CREATURE_TEXTS };
