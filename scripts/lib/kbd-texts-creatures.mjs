/**
 * Textos ES de los ajustes por criatura de Kraken's Better Dinos.
 *
 * Vive aparte de `kbd-texts.mjs` por volumen: son casi 150 entradas y crecen
 * cada vez que el autor toca una criatura nueva. El orden es el de la guía
 * (alfabético por criatura), para poder leer las dos cosas en paralelo cuando
 * haya que revisar o actualizar.
 *
 * Solo están acá las claves cuya descripción es única. Los interruptores
 * maestros `PreventBetter*` que usan la frase estándar del autor salen de las
 * plantillas de `build-kbd-spec.mjs` y no se repiten acá.
 */
export const KBD_CREATURE_TEXTS = {
  // --- Ammonite -----------------------------------------------------------
  PreventRandomAmmoniteSize: {
    es: {
      label: "Ammonites sin tamaños aleatorios",
      description:
        "Los Ammonites dejan de aparecer con tamaños variables. Los que ya existen no cambian.",
    },
  },

  // --- Anglerfish ---------------------------------------------------------
  PreventAnglerGelHarvest: {
    es: {
      label: "Sin gel de Angler de los domados",
      description:
        "Saca la posibilidad de cosechar gel de Angler desde el menú radial de un Anglerfish domado.",
    },
  },
  AnglerGelInterval: {
    es: {
      label: "Intervalo del gel de Angler",
      description:
        "Segundos entre cosechas de gel de Angler en un Anglerfish domado. El default de 1800 son 30 minutos. Ojo: como el cambio es un buff, meterlo en criopod o en bola de alma le reinicia el temporizador.",
    },
  },

  // --- Alpha Mosa y Megalodon ---------------------------------------------
  PreventWaterAlphaCarrying: {
    es: {
      label: "Los Tuso no pueden agarrar alfas acuáticos",
      description:
        "Impide que el Tusoteuthis levante Mosas y Megalodones alfa. Para servidores que quieren que esos bichos sean un desafío real de PvE y no un truco, o para cortar el griefeo.",
    },
  },

  // --- Ankylosaurus -------------------------------------------------------
  PreventAnkyWanderHarvest: {
    es: {
      label: "El Anky no recolecta deambulando",
      description: "Saca la recolección automática del Anky en modo deambular.",
    },
  },
  PreventAnkyReflectiveDamage: {
    es: {
      label: "El Anky no devuelve daño",
      description:
        "Saca el 10% de daño recibido que el Anky refleja de vuelta sobre quien lo atacó.",
    },
  },
  PreventAnkyDamageModifiers: {
    es: {
      label: "El Anky sin modificadores de daño",
      description:
        "Saca la reducción general de daño del Anky y los modificadores extra de daño en cabeza y patas.",
    },
  },
  PreventToughHide: {
    es: {
      label: "Sin Cuero Duro en ninguna criatura",
      description:
        "Ningún bicho suelta Cuero Duro (Tough Hide) al cosecharlo. Está en la ficha del Anky pero es global: aplica a todas las criaturas, no solo a esa.",
    },
  },
  AnkyMaxGatherWeightLimit: {
    es: {
      label: "Tope de peso del Anky recolectando",
      description:
        "Hasta qué porcentaje de su peso llena el Anky recolectando en modo deambular. El default 0.75 es 75%. No puede pasar de 1: el juego no lo permite.",
    },
  },

  // --- Tek Dinos ----------------------------------------------------------
  PreventBetterTekDinos: {
    es: {
      label: "Desactivar el buff Tek de KBD",
      description:
        "KBD no le agrega su buff a NINGÚN dino Tek: se van el +2% de daño y resistencia y el Bio-Aceite en vez de caca. Está en la ficha del Tek Anky pero aplica a todos los Tek. No impide que aparezcan; para eso hay que usar las líneas de NPCReplacements de Game.ini. Ojo: el Bio-Aceite solo sale de caca de Tek y de Basilosaurus, y es ingrediente de recetas de la mod.",
    },
  },

  // --- Araneo -------------------------------------------------------------
  PreventSpiderBola: {
    es: {
      label: "La araña sin ataque de bola de tela",
      description: "El Araneo deja de poder usar el ataque de bola de telaraña.",
    },
  },

  // --- Argentavis ---------------------------------------------------------
  PreventWildReins: {
    es: {
      label: "Sin Riendas Valyrias en el loot salvaje",
      description:
        "Wyverns, Rock Drakes y X-Argents dejan de soltar Riendas Valyrias y el disfraz de Wyvern Zombi. Está en la ficha del Argentavis pero aplica a todas esas especies.",
    },
  },

  // --- Basilisk -----------------------------------------------------------
  PreventBasiliskBreeding: {
    es: {
      label: "El Basilisco no se puede criar",
      description: "Saca la posibilidad de reproducir Basiliscos que agrega KBD.",
    },
  },
  AllowBasiliskIK: {
    es: {
      label: "Basilisco con IK experimental",
      description:
        "Activa los cambios experimentales de IK del Basilisco, que le permiten acompañar la inclinación del terreno. Venían prendidos y el autor los apagó porque daban problemas a mucha gente. Usalo bajo tu propio riesgo.",
    },
  },
  PreventDesertBasilisk: {
    es: {
      label: "Sin Basiliscos en las Dunas",
      description:
        "Saca los Basiliscos que la mod agrega al spawner de las Dunas de Scorched Earth.",
    },
  },

  // --- Basilosaurus -------------------------------------------------------
  PreventBetterBasilo: {
    es: {
      label: "Basilosaurus sin Bio-Aceite",
      description:
        "El Basilosaurus vuelve a dar aceite común en vez del Bio-Aceite de KBD. Ojo: si además desactivaste los dinos Tek, te quedás sin ninguna fuente de Bio-Aceite y varias recetas de la mod dejan de poder craftearse. El buff no se saca del todo, porque hace falta para que la Manta mejorada siga al Basilo.",
    },
  },

  // --- Brontosaurus -------------------------------------------------------
  PreventBrontoBreakStone: {
    es: {
      label: "El pisotón del Bronto no rompe piedra",
      description:
        "Cambia el tipo de daño del pisotón grande del Bronto por uno que no rompe rocas ni daña estructuras de piedra.",
    },
  },
  BrontoStompHarvestMultiplier: {
    es: {
      label: "Recolección del pisotón del Bronto",
      description:
        "Multiplica lo que junta el pisotón grande del Bronto, y solo ese ataque. Bajalo si te parece que junta demasiado metal.",
    },
  },

  // --- Carnotaurus --------------------------------------------------------
  PreventCarnoStepDamage: {
    es: {
      label: "La embestida del Carno no daña",
      description:
        "El Carno deja de hacer daño mientras embiste. Sigue rompiendo vegetación, pero no lastima dinos ni jugadores.",
    },
  },

  // --- Castoroides --------------------------------------------------------
  BeaverMaxGatherWeightLimit: {
    es: {
      label: "Tope de peso del Castor recolectando",
      description:
        "Hasta qué porcentaje de su peso llena el Castoroides recolectando en modo deambular. El default 0.75 es 75%. No puede pasar de 1: el juego no lo permite.",
    },
  },

  // --- Cnidaria -----------------------------------------------------------
  AllowJellyfishOrders: {
    es: {
      label: "La medusa acepta órdenes",
      description:
        "Permite darle órdenes a la Cnidaria en vez de dejarla siempre en deambular y agresiva.",
    },
  },
  PreventJellyRandomSizes: {
    es: {
      label: "Medusas sin tamaños aleatorios",
      description: "Las Cnidarias dejan de aparecer con tamaños variables.",
    },
  },
  PreventJellyTaming: {
    es: {
      label: "La medusa no se puede domar",
      description: "Saca el tameo de Cnidarias con Canastas de Pesca que agrega KBD.",
    },
  },
  JellyHarvestInterval: {
    es: {
      label: "Intervalo de Biotoxina de la medusa",
      description:
        "Segundos entre cosechas de Biotoxina en una Cnidaria domada. El default de 1800 son 30 minutos.",
    },
  },
  JellyMaxHarvest: {
    es: {
      label: "Máximo de Biotoxina por cosecha",
      description:
        "Cuánta Biotoxina como máximo se saca de una Cnidaria domada desde el menú radial.",
    },
  },

  // --- Coelacanth ---------------------------------------------------------
  CoelLootBlacklist: {
    es: {
      label: "Recursos que el Coel no produce",
      description:
        "Nombres de los recursos que querés sacar de la producción pasiva del Coelacanth, separados por coma. Vacío por default: sin nada acá, el Coel puede producir todo lo de la lista de abajo.",
    },
  },
  CoelBlacklist: {
    es: {
      label: "Recursos que el Coel puede producir",
      description:
        "La lista completa de lo que el Coelacanth mejorado puede llegar a producir. Es la referencia para armar la lista de exclusión: copiá de acá los nombres que quieras bloquear.",
    },
  },

  // --- Compsognathus ------------------------------------------------------
  PreventCompySummons: {
    es: {
      label: "El Compy no llama a su manada",
      description: "Los Compys domados dejan de poder invocar a sus amigos.",
    },
  },

  // --- Rock Drakes y Wyverns corruptos ------------------------------------
  PreventCorruptDrakeEggs: {
    es: {
      label: "El Rock Drake corrupto no pone huevos",
      description: "Saca la puesta de huevos del Rock Drake corrupto.",
    },
  },
  PreventCorruptWyvernEggs: {
    es: {
      label: "El Wyvern corrupto no pone huevos",
      description: "Saca la puesta de huevos del Wyvern corrupto.",
    },
  },
  AllowCorruptedCrystalEggs: {
    es: {
      label: "Wyverns corruptos sueltan huevos de Cristal",
      description: "Permite que los Wyverns corruptos dejen huevos de Crystal Wyvern.",
    },
  },
  AllowCorruptedNightEggs: {
    es: {
      label: "Wyverns corruptos sueltan huevos de Night Wyvern",
      description:
        "Permite que los Wyverns corruptos dejen huevos de Night Wyvern, la criatura de Additional Aberrant Dinos. Obviamente necesita esa mod instalada para hacer algo.",
    },
  },

  // --- Daeodon ------------------------------------------------------------
  PreventSwineFlesh: {
    es: {
      label: "Sin Carne Rica en Proteína",
      description:
        "Phiomias y Daeodons dejan de dar Carne Cruda Rica en Proteína al cosecharlos (el ítem se llamaba Swine Flesh antes). Está en la ficha del Daeodon pero aplica a las dos especies.",
    },
  },

  // --- Deathworm ----------------------------------------------------------
  PreventBetterDeathworm: {
    es: {
      label: "Deathworm sin loot extra",
      description: "Saca los objetos extra que KBD agrega al inventario de muerte del Deathworm.",
    },
  },

  // --- Deinonychus --------------------------------------------------------
  PreventDeinonEggsAnywhere: {
    es: {
      label: "El Deinon de KBD no pone huevos salvajes",
      description: "El Deinonychus de KBD deja de poner huevos en el mundo.",
    },
  },
  PreventDeinonExtraLevels: {
    es: {
      label: "Deinon sin niveles extra",
      description:
        "Los Deinonychus dejan de aparecer con niveles salvajes aumentados y vuelven al rango normal.",
    },
  },

  // --- Dilophosaurus ------------------------------------------------------
  PreventBigDilos: {
    es: {
      label: "Sin Dilos grandes",
      description: "Saca la aparición de los Dilofosaurios grandes de KBD.",
    },
  },
  BigDiloChance: {
    es: {
      label: "Peso de aparición del Dilo grande",
      description:
        "Cuanto más alto, más Dilos grandes aparecen. Es un peso, no un porcentaje: el Dilo chico pesa siempre 1, así que en 1 salen mitad y mitad, y por encima de 1 la balanza se inclina hacia los grandes.",
    },
  },

  // --- Dimetrodon ---------------------------------------------------------
  PreventDimetrodonOverheat: {
    es: {
      label: "El Dimetrodon sin sobrecalentar",
      description: "Saca la habilidad de sobrecalentamiento (Overheat) del Dimetrodon.",
    },
  },

  // --- Diplodocus ---------------------------------------------------------
  PreventDiploTamedStun: {
    es: {
      label: "El coletazo del Diplo domado no aturde",
      description: "El coletazo del Diplodocus domado deja de causar aturdimiento.",
    },
  },
  PreventDiploWildAttack: {
    es: {
      label: "El Diplo salvaje no contraataca",
      description: "Los Diplodocus salvajes dejan de defenderse cuando bajan del 50% de vida.",
    },
  },

  // --- Doedicurus ---------------------------------------------------------
  PreventDoedEngrams: {
    es: {
      label: "Sin crafteo de piedra en el Doed",
      description:
        "Saca la posibilidad de fabricar estructuras de piedra dentro del inventario del Doedicurus.",
    },
  },
  PreventDoedCrystalHarvest: {
    es: {
      label: "El Doed no junta cristal",
      description:
        "El Doedicurus deja de recolectar cristal. Sirve en Extinction, donde se usan Doeds sobre los faroles para sacar Polvo de Elemento y el cristal ensucia la cosecha.",
    },
  },
  DoedMaxGatherWeightLimit: {
    es: {
      label: "Tope de peso del Doed recolectando",
      description:
        "Hasta qué porcentaje de su peso llena el Doedicurus recolectando en modo deambular. El default 0.75 es 75%. No puede pasar de 1: el juego no lo permite.",
    },
  },

  // --- Dung Beetle --------------------------------------------------------
  PreventBeetlePoopCollection: {
    es: {
      label: "El escarabajo no junta caca",
      description: "El Escarabajo Pelotero deja de recoger caca mientras deambula.",
    },
  },
  PreventBeetleFertilizerDistribution: {
    es: {
      label: "El escarabajo no reparte fertilizante",
      description:
        "El Escarabajo Pelotero deja de repartir fertilizante a las parcelas de cultivo cercanas.",
    },
  },
  BeetlePoopCollectionRange: {
    es: {
      label: "Alcance para juntar caca",
      description:
        "Radio en unidades del juego dentro del cual el Escarabajo Pelotero junta caca. De referencia: un cimiento común mide 300 unidades.",
    },
  },
  BeetleFertilizerDistributionRange: {
    es: {
      label: "Alcance para repartir fertilizante",
      description:
        "Radio en unidades del juego dentro del cual el Escarabajo Pelotero busca parcelas de cultivo para fertilizar. De referencia: un cimiento común mide 300 unidades.",
    },
  },
  PreventBeetleMating: {
    es: {
      label: "El escarabajo no se puede criar",
      description: "Saca la reproducción de Escarabajos Peloteros que agrega KBD.",
    },
  },

  // --- Eurypterid ---------------------------------------------------------
  PreventEurypRandomSizes: {
    es: {
      label: "Euryps sin tamaños aleatorios",
      description:
        "Los Eurypterid dejan de aparecer con tamaños variables. Los que ya existen no cambian.",
    },
  },
  PreventEurypProduction: {
    es: {
      label: "El Euryp no produce pasivamente",
      description: "Saca la producción pasiva de objetos del Eurypterid.",
    },
  },
  PreventEurypRiding: {
    es: {
      label: "No se puede montar el Euryp",
      description: "Saca la posibilidad de montar Eurypterid de tamaño mayor a 2.0.",
    },
  },
  PreventEurypMating: {
    es: {
      label: "El Euryp no se puede criar",
      description: "Saca la reproducción de Eurypterid que agrega KBD.",
    },
  },

  // --- Ferox --------------------------------------------------------------
  FeroxBreedingAddictionAmount: {
    es: {
      label: "Adicción necesaria para criar Ferox",
      description:
        "Qué porcentaje de adicción al Elemento necesita un Ferox chico para poder reproducirse. Tiene que estar entre 0.05 y 0.95; el default 0.95 es 95%.",
    },
  },
  AllowFeroxCleanBreeding: {
    es: {
      label: "Criar Ferox sin adicción",
      description:
        "Permite reproducir el Ferox mejorado sin necesidad de ninguna adicción al Elemento.",
    },
  },
  FeroxTameUseMultiplier: {
    es: {
      label: "El Ferox respeta los multiplicadores de tameo",
      description:
        "Hace que el tameo del Ferox siga los multiplicadores de tameo del servidor en vez de ignorarlos.",
    },
  },
  PreventFeroxStash: {
    es: {
      label: "No se puede guardar Elemento en el Ferox",
      description: "Saca la posibilidad de guardar Elemento dentro de un Ferox chico.",
    },
  },

  // --- Gigantopithicus ----------------------------------------------------
  PreventBigfootBarrelAttacks: {
    es: {
      label: "El Bigfoot no tira barriles",
      description: "Saca el lanzamiento de barriles del Gigantopithecus mejorado.",
    },
  },
  PreventBigfootCropHarvesting: {
    es: {
      label: "El Bigfoot no cosecha cultivos",
      description:
        "El Gigantopithecus mejorado deja de juntar Pasto Largo y Citronal con su ataque, y de cosechar parcelas en modo jardinería.",
    },
  },
  PreventBigfootWeapons: {
    es: {
      label: "El Bigfoot no usa armas",
      description: "Saca la posibilidad de equipar armas al Gigantopithecus mejorado.",
    },
  },
  PreventBigfootArgentCarry: {
    es: {
      label: "El Argentavis no puede llevar al Bigfoot",
      description:
        "Impide que los Argentavis levanten al Gigantopithecus mejorado, subiéndole el peso de arrastre.",
    },
  },

  // --- Griffin ------------------------------------------------------------
  PreventGriffinGenders: {
    es: {
      label: "El Grifo sin géneros",
      description: "Saca los géneros que KBD le agrega al Grifo. Sin géneros no hay cría.",
    },
  },
  PreventGriffinMating: {
    es: {
      label: "El Grifo no se puede criar",
      description: "Saca la reproducción de Grifos que agrega KBD.",
    },
  },

  // --- Hyaenodon ----------------------------------------------------------
  PreventHyaenaRandomSizes: {
    es: {
      label: "Hyaenodons sin tamaños aleatorios",
      description:
        "Los Hyaenodon dejan de aparecer con tamaños variables. Los que ya existen no cambian.",
    },
  },
  PreventHyaenaRiding: {
    es: {
      label: "No se puede montar el Hyaenodon",
      description: "Saca la posibilidad de montar Hyaenodons de tamaño 1.3.",
    },
  },

  // --- Karkinos -----------------------------------------------------------
  PreventCrabMating: {
    es: {
      label: "El Karkinos no se puede criar",
      description: "Saca la reproducción de Karkinos que agrega KBD.",
    },
  },
  PreventCrabFlyerGrab: {
    es: {
      label: "El cangrejo no agarra voladores",
      description: "Impide que el Karkinos levante criaturas voladoras.",
    },
  },
  PreventPlatformsInBossArena: {
    es: {
      label: "Sin plataformas en las arenas de jefe",
      description:
        "Mammoth, Trike y Karkinos de KBD no pueden entrar a las arenas de jefe si llevan silla-plataforma. Se logra subiéndoles el peso de arrastre a 565 mientras la tengan puesta. Está en la ficha del Karkinos pero aplica a las tres especies.",
    },
  },

  // --- Lamprey y Leech ----------------------------------------------------
  LeechBloodHarvestMultiplier: {
    es: {
      label: "Multiplicador de Sangre de Sanguijuela",
      description:
        "Multiplica cuánta Sangre de Sanguijuela sacás al cosechar una Sanguijuela domada desde el menú radial. Tiene que ser un número entero.",
    },
  },
  LeechDiseasedBileHarvestAmount: {
    es: {
      label: "Multiplicador de Bilis Enferma",
      description:
        "Multiplica cuánta Bilis Enferma sacás al cosechar una Sanguijuela Enferma domada desde el menú radial. Tiene que ser un número entero.",
    },
  },
  LeechBloodBagMulti: {
    es: {
      label: "Multiplicador de Bolsas de Sangre",
      description:
        "Multiplica cuántas Bolsas de Sangre te quedan cuando una Sanguijuela domada se te desprende. Tiene que ser un número entero; al ritmo normal son 2 bolsas por minuto.",
    },
  },
  PreventLeechMating: {
    es: {
      label: "La Sanguijuela no se puede criar",
      description: "Saca la reproducción de la Sanguijuela mejorada.",
    },
  },
  PreventLampreyMating: {
    es: {
      label: "La Lamprea no se puede criar",
      description: "Saca la reproducción de la Lamprea mejorada.",
    },
  },

  // --- Liopleurodon -------------------------------------------------------
  PreventLuckPotion: {
    es: {
      label: "Sin poción de suerte en el Liopleurodon",
      description:
        "Saca la fabricación de la poción de suerte Felix Felicis dentro del inventario del Liopleurodon.",
    },
  },

  // --- Lymantria ----------------------------------------------------------
  PreventMothMelee: {
    es: {
      label: "La Lymantria sin ataque cuerpo a cuerpo",
      description: "La Lymantria pierde el ataque de clic izquierdo que le agrega KBD.",
    },
  },

  // --- Mammoth ------------------------------------------------------------
  PreventMammothBeaverDamage: {
    es: {
      label: "El Mamut sin bonus de madera",
      description:
        "El Mamut mantiene su tipo de daño normal en vez del mejorado para juntar madera.",
    },
  },
  PreventMammothEngrams: {
    es: {
      label: "Sin crafteo de madera en el Mamut",
      description: "Saca la fabricación de estructuras de madera dentro del inventario del Mamut.",
    },
  },

  // --- Managarmr ----------------------------------------------------------
  PreventManaExtraBreathRange: {
    es: {
      label: "El Managarmr sin alcance extra de aliento",
      description: "Saca el aumento de alcance del ataque de aliento del Managarmr.",
    },
  },

  // --- Manta --------------------------------------------------------------
  PreventMantaKOTame: {
    es: {
      label: "La Manta vuelve a domarse por pasiva",
      description:
        "La Manta deja de domarse por KO y vuelve al tameo pasivo original, que el propio autor describe como molesto.",
    },
  },

  // --- Mantis -------------------------------------------------------------
  PreventMantisWeightReduction: {
    es: {
      label: "La Mantis sin reducción de peso",
      description: "Saca el 50% de reducción de peso en recursos que KBD le da a la Mantis.",
    },
  },

  // --- Megaloceros --------------------------------------------------------
  AllowFemaleDeerAttack: {
    es: {
      label: "Las hembras de Megaloceros atacan",
      description: "Permite que las hembras usen el mismo ataque de clic izquierdo que los machos.",
    },
  },
  VanillaDeerAttack: {
    es: {
      label: "Megaloceros con ataque del juego base",
      description: "El Megaloceros usa su ataque original en vez del de KBD, que agrega sangrado.",
    },
  },
  PreventDeerMilk: {
    es: {
      label: "Las hembras de Megaloceros no se ordeñan",
      description: "Saca la producción de Leche de Mamífero de las hembras de Megaloceros.",
    },
  },
  PreventWildDeerAggro: {
    es: {
      label: "El Megaloceros salvaje no contraataca",
      description: "Los machos salvajes de Megaloceros dejan de defenderse cuando los atacás.",
    },
  },
  DeerMilkInterval: {
    es: {
      label: "Intervalo de leche del Megaloceros",
      description:
        "Segundos entre ordeñes de Leche de Mamífero en una hembra domada de Megaloceros. El default de 1800 son 30 minutos.",
    },
  },

  // --- Megalodon ----------------------------------------------------------
  PreventMegalodonBleed: {
    es: {
      label: "El Megalodón no provoca sangrado",
      description: "Saca el sangrado que el Megalodón inflige desde el TLC 3.",
    },
  },

  // --- Megalosaurus -------------------------------------------------------
  PreventMegaloNightVision: {
    es: {
      label: "El Megalo sin visión nocturna",
      description: "Saca la visión nocturna del Megalosaurus.",
    },
  },
  PreventMegaloNoAIGrab: {
    es: {
      label: "El agarre del Megalo no se puede desactivar",
      description:
        "Deshace el cambio que convierte el agarre del Megalosaurus en un ataque especial de IA, que es lo que permite apagarlo desde el menú del dino.",
    },
  },
  PreventMegaloDaytimeChanges: {
    es: {
      label: "El Megalo con su sueño original",
      description: "Saca los cambios de KBD a la mecánica de deuda de sueño del Megalosaurus.",
    },
  },

  // --- Meganeura ----------------------------------------------------------
  PreventDragonflyBreeding: {
    es: {
      label: "La Meganeura no se puede criar",
      description: "Saca la reproducción de Meganeuras que agrega KBD.",
    },
  },

  // --- Mosasaur -----------------------------------------------------------
  PreventMosaNoPitch: {
    es: {
      label: "El Mosa no puede inclinarse",
      description: "Saca la inclinación hacia arriba y abajo que KBD le da al Mosasaurus.",
    },
  },
  PreventMosaNoTarget: {
    es: {
      label: "El Mosa vuelve a ser blanco de todos",
      description:
        "Deshace el cambio de KBD y hace que todas las criaturas salvajes vuelvan a atacar al Mosasaurus.",
    },
  },

  // --- Oviraptor ----------------------------------------------------------
  PreventOviraptorEggCollection: {
    es: {
      label: "El Oviraptor no junta huevos",
      description: "El Oviraptor mejorado deja de recoger huevos, de cualquier tipo.",
    },
  },
  PreventOviFertilizedEggColl: {
    es: {
      label: "El Oviraptor no junta huevos fertilizados",
      description:
        "El Oviraptor mejorado deja de recoger huevos fertilizados, pero sigue juntando los comunes.",
    },
  },
  OviNestMaxSlots: {
    es: {
      label: "Espacios del nido de Oviraptor",
      description: "Cuántos casilleros tiene el nido de Oviraptor que agrega KBD.",
    },
  },

  // --- Ovis ---------------------------------------------------------------
  PreventSheepMilk: {
    es: {
      label: "Las ovejas no se ordeñan",
      description: "Saca la producción de Leche de Mamífero de las hembras de Ovis.",
    },
  },
  SheepMilkInterval: {
    es: {
      label: "Intervalo de leche de oveja",
      description:
        "Segundos entre ordeñes de Leche de Mamífero en una hembra domada de Ovis. El default de 1800 son 30 minutos.",
    },
  },
  AllowUnNerfedSheepHarvest: {
    es: {
      label: "Cordero sin el recorte de cosecha",
      description:
        "Devuelve la cosecha de Cordero de la Ovis a las cantidades originales, deshaciendo el recorte.",
    },
  },

  // --- Pegomastax ---------------------------------------------------------
  PreventPegoHarvestLoot: {
    es: {
      label: "El Pego no encuentra equipo en los arbustos",
      description:
        "El Pegomastax deja de encontrar equipamiento al recolectar arbustos en modo deambular.",
    },
  },
  PegoLootBlacklist: {
    es: {
      label: "Objetos que el Pego no encuentra",
      description:
        "Nombres de los objetos que querés sacar de lo que el Pegomastax puede encontrar en los arbustos, separados por coma. Vacío por default.",
    },
  },

  // --- Phiomia -----------------------------------------------------------
  PreventPhiomiaMilk: {
    es: {
      label: "Las Phiomias no se ordeñan",
      description: "Saca la producción de Leche de Mamífero de las hembras de Phiomia.",
    },
  },
  PreventPhiomiaHarvestVeggies: {
    es: {
      label: "La Phiomia no junta verduras",
      description: "La Phiomia deja de conseguir Sabrosaraíz y Zanahárroca al recolectar arbustos.",
    },
  },
  PhiomiaMilkInterval: {
    es: {
      label: "Intervalo de leche de Phiomia",
      description:
        "Segundos entre ordeñes de Leche de Mamífero en una hembra domada de Phiomia. El default de 2700 son 45 minutos.",
    },
  },

  // --- Piranha ------------------------------------------------------------
  PreventPiranhaMating: {
    es: {
      label: "La Piraña no se puede criar",
      description: "Saca la reproducción de Pirañas que agrega KBD.",
    },
  },

  // --- Plesiosaur ---------------------------------------------------------
  PreventPlesiNoPitch: {
    es: {
      label: "El Plesio no puede inclinarse",
      description: "Saca la inclinación hacia arriba y abajo que KBD le da al Plesiosaurus.",
    },
  },
  PreventPlesiNoTarget: {
    es: {
      label: "El Plesio vuelve a ser blanco de todos",
      description:
        "Deshace el cambio de KBD y hace que todas las criaturas salvajes vuelvan a atacar al Plesiosaurus.",
    },
  },

  // --- Pulmonoscorpius ----------------------------------------------------
  PreventScorpVenom: {
    es: {
      label: "El escorpión no produce veneno",
      description: "Saca la producción pasiva de Veneno de Escorpión del Pulmonoscorpius mejorado.",
    },
  },

  // --- Quetzalcoatlus -----------------------------------------------------
  PreventQuetzChangedAttack: {
    es: {
      label: "El Quetz con su daño original",
      description:
        "Deshace el cambio de tipo de daño del Quetzal, que con KBD pega más fuerte a criaturas chicas y más flojo a las grandes.",
    },
  },
  PreventQuetzNoPitch: {
    es: {
      label: "El Quetz no puede inclinarse",
      description: "Saca la inclinación hacia arriba y abajo que KBD le da al Quetzal.",
    },
  },

  // --- Raptor -------------------------------------------------------------
  AllowRaptorWildPounce: {
    es: {
      label: "Los Raptors salvajes vuelven a saltar encima",
      description: "Devuelve el ataque de derribo a todos los Raptors salvajes.",
    },
  },
  AllowMissionRaptorPounce: {
    es: {
      label: "Solo los Raptors de misión saltan encima",
      description: "Devuelve el ataque de derribo únicamente a los Raptors de misión de Genesis.",
    },
  },
  AllowCorruptedRaptorPounce: {
    es: {
      label: "Solo los Raptors corruptos saltan encima",
      description: "Devuelve el ataque de derribo únicamente a los Raptors corruptos.",
    },
  },

  // --- Reapers ------------------------------------------------------------
  PreventReaperAcidBlood: {
    es: {
      label: "El Reaper sin sangre ácida",
      description:
        "El Reaper deja de dañar a los enemigos cercanos cuando recibe un efecto de sangrado.",
    },
  },

  // --- Reindeer -----------------------------------------------------------
  PreventReindeerGiftPoop: {
    es: {
      label: "Los renos no cagan regalos",
      description: "Los renos dejan de dejar regalos durante el evento navideño.",
    },
  },
  PreventReindeerMaxDinoNose: {
    es: {
      label: "La nariz del reno no marca el nivel máximo",
      description:
        "El brillo de la nariz del reno deja de servir para identificar dinos de nivel máximo.",
    },
  },

  // --- Rex ----------------------------------------------------------------
  PreventJPRexRoars: {
    es: {
      label: "Rugido del Rex original",
      description:
        "El Rex vuelve a su rugido del juego base en vez del estilo Jurassic Park que le pone KBD.",
    },
  },

  // --- Rock Drake ---------------------------------------------------------
  PreventRockDrakeMating: {
    es: {
      label: "El Rock Drake no se puede criar",
      description: "Saca la reproducción de Rock Drakes que agrega KBD.",
    },
  },

  // --- Roll Rat -----------------------------------------------------------
  PreventBetterRollRat: {
    es: {
      label: "El Roll Rat sin giro mejorado",
      description:
        "Saca la mejora en la velocidad de rotación del Roll Rat. El buff no se saca del todo, porque hace falta para las mejoras del asiento de pasajero.",
    },
  },

  // --- Sabretooth ---------------------------------------------------------
  PreventSaberAntiPack: {
    es: {
      label: "El Sable sin bonus contra manadas",
      description:
        "Saca el daño extra que el Sabretooth recibe contra criaturas de manada o de banda.",
    },
  },
  SaberDamageBonusAmount: {
    es: {
      label: "Bonus de daño del Sable contra manadas",
      description:
        "Cuánto daño extra hace el Sabretooth contra criaturas de manada o de banda, por cada condición que se cumple. El default es 0.35.",
    },
  },

  // --- Sabertooth Salmon --------------------------------------------------
  PreventSalmonMating: {
    es: {
      label: "El Salmón no se puede criar",
      description: "Saca la reproducción de Salmones que agrega KBD.",
    },
  },
  PreventSalmonExtraHarvest: {
    es: {
      label: "La cosecha del Salmón no escala con la vida",
      description:
        "El Salmón domado deja de cosechar más según su vida. Recomendado en servidores de tasas altas, donde salmones con vida enorme cosechando en masa pueden generar lag severo.",
    },
  },

  // --- Spinosaurus --------------------------------------------------------
  PreventSpinoPitch: {
    es: {
      label: "El Spino no se inclina nadando",
      description: "Saca la inclinación del Spinosaurus mientras nada.",
    },
  },
  PreventSpinoNewAnims: {
    es: {
      label: "El Spino con las animaciones originales",
      description:
        "El Spinosaurus deja de usar las animaciones nuevas de nado y de carrera que agrega KBD.",
    },
  },
  PreventSpinoOldRun: {
    es: {
      label: "El Spino sin la animación vieja de carrera",
      description: "El Spinosaurus deja de usar la animación vieja de carrera.",
    },
  },
  PreventSpinoNewSwim: {
    es: {
      label: "El Spino sin la animación nueva de nado",
      description: "El Spinosaurus deja de usar la animación nueva de nado.",
    },
  },
  PreventSpinoNoTarget: {
    es: {
      label: "El Spino vuelve a ser blanco de todos",
      description:
        "Deshace el cambio de KBD y hace que todas las criaturas salvajes vuelvan a atacar al Spinosaurus.",
    },
  },

  // --- Stegosaurus --------------------------------------------------------
  PreventStegoGallop: {
    es: {
      label: "El Stego sin galope",
      description: "Saca la animación de carrera mejorada que KBD le da al Stegosaurus.",
    },
  },

  // --- Tapejara -----------------------------------------------------------
  PreventTapejaraPitching: {
    es: {
      label: "El Tapejara no puede inclinarse",
      description: "Saca la inclinación hacia arriba y abajo del Tapejara en vuelo.",
    },
  },

  // --- Titanoboa ----------------------------------------------------------
  PreventBoaTurretMode: {
    es: {
      label: "La Boa sin modo torreta",
      description: "Saca el modo torreta y el ataque de escupida nuevo de la Titanoboa.",
    },
  },
  PreventBoaGenders: {
    es: {
      label: "La Boa sin géneros",
      description: "Saca los géneros que KBD le agrega a la Titanoboa. Sin géneros no hay cría.",
    },
  },
  PreventBoaNoFrills: {
    es: {
      label: "Solo los machos de Boa tienen capucha",
      description: "Devuelve la capucha a los machos únicamente, como antes del cambio de KBD.",
    },
  },
  PreventBoaVenomHarvest: {
    es: {
      label: "La Boa no da veneno",
      description: "Saca la cosecha de Veneno de Boa de las Titanoboas domadas.",
    },
  },
  PreventBoaRandomSizes: {
    es: {
      label: "Boas sin tamaños aleatorios",
      description: "Las Titanoboas dejan de aparecer con tamaños variables.",
    },
  },

  // --- Triceratops --------------------------------------------------------
  PreventTrikeGlowingBuff: {
    es: {
      label: "El Trike sin volante brillante",
      description: "Saca el efecto de brillo en el volante del Trike que marca al líder de manada.",
    },
  },

  // --- Trilobite ----------------------------------------------------------
  PreventTrilobiteProduction: {
    es: {
      label: "El Trilobite no produce pasivamente",
      description: "Saca la producción pasiva de objetos del Trilobite.",
    },
  },

  // --- Tropeognathus ------------------------------------------------------
  PreventTropeNoBoostShoot: {
    es: {
      label: "El Tropeo solo dispara con impulso",
      description:
        "Deshace el cambio de KBD: el Tropeognathus vuelve a no poder disparar si no está usando el impulso.",
    },
  },

  // --- Tusoteuthis --------------------------------------------------------
  PreventTusoNoTarget: {
    es: {
      label: "El Tuso vuelve a ser blanco de todos",
      description:
        "Deshace el cambio de KBD y hace que todas las criaturas salvajes vuelvan a atacar al Tusoteuthis.",
    },
  },

  // --- Unicorn ------------------------------------------------------------
  PreventPegasus: {
    es: {
      label: "El Unicornio no se transforma en Pegaso",
      description:
        "Saca la transformación en Pegaso del Unicornio mejorado. Solo le quita la capacidad de volar: sigue dando su buff mágico a los aliados.",
    },
  },

  // --- Wyverns ------------------------------------------------------------
  PreventTamedWyvernMilk: {
    es: {
      label: "Las Wyverns domadas no se ordeñan",
      description: "Saca la producción de Leche de Wyvern de las hembras domadas.",
    },
  },
  PreventTamedWyvernCrystal: {
    es: {
      label: "Las Crystal Wyvern domadas no dan Cristal Primigenio",
      description:
        "Saca la cosecha de Cristal Primigenio de las hembras domadas de Crystal Wyvern.",
    },
  },
  PreventWyvernMating: {
    es: {
      label: "Las Wyverns no se pueden criar",
      description: "Saca la reproducción de Wyverns que agrega KBD.",
    },
  },
  PreventCrystalWyvernMating: {
    es: {
      label: "Las Crystal Wyvern no se pueden criar",
      description: "Saca la reproducción de Crystal Wyverns que agrega KBD.",
    },
  },
  WyvernMilkInterval: {
    es: {
      label: "Intervalo de leche de Wyvern",
      description:
        "Segundos entre cosechas de Leche de Wyvern, Cristal Primigenio y Fragmentos de Elemento en las hembras domadas. El default de 7200 son 120 minutos (2 horas).",
    },
  },

  // --- Yutyrannus ---------------------------------------------------------
  PreventYutyAttackChanges: {
    es: {
      label: "El Yuty con sus animaciones de ataque originales",
      description: "Deshace los cambios de KBD a las animaciones de ataque del Yutyrannus.",
    },
  },
};
