const creatureData = [
    {
        id: 'goblin', name: 'Goblin das galerias', creatureType: 'goblin',
        category: 'humanoid', heightBlocks: 1, floors: { min: 1, max: 9 },
        stats: { health: 20, damage: 10, defense: 0, speed: 30, range: 24 },
        resistances: { physical: 0, fire: 0, poison: 0 },
        attacks: [
            { id: 'scrap-slash', warning: 0.18, execution: 0.12, recovery: 0.3, cooldown: 1.2, range: 24, radius: 12, damage: 1, status: null },
            { id: 'improvised-guard', warning: 0, execution: 0, recovery: 0, cooldown: 0, range: 40, radius: 0, damage: 0, status: 'front-block' }
        ],
        drops: [{ id: 'coin', chance: 1, min: 1, max: 1 }, { id: 'leather-strip', chance: 0.28, min: 1, max: 1 }, { id: 'mine-rivet', chance: 0.12, min: 1, max: 2 }, { id: 'shield-fragment', chance: 0.05, min: 1, max: 1 }],
        colors: { primary: '#6f8545', secondary: '#465b32', accent: '#c8a452', outline: '#283024' },
        sound: { wave: 'square', frequency: 150 },
        spawn: { floors: [[1, 9]], weight: 4, group: [2, 4], probability: 0.8, rule: 'common-mines' }
    },
    {
        id: 'goblin-runner', name: 'Goblin corredor', creatureType: 'goblinRunner',
        category: 'humanoid-variant', heightBlocks: 1, floors: { min: 1, max: 9 },
        stats: { health: 15, damage: 8, defense: 0, speed: 45, range: 58 },
        resistances: { physical: 0, fire: 0, poison: 0 },
        attacks: [{ id: 'passing-thrust', warning: 0.28, execution: 0.12, recovery: 0.45, cooldown: 1.5, range: 72, radius: 12, damage: 1, status: 'reposition' }],
        drops: [{ id: 'coin', chance: 1, min: 1, max: 1 }, { id: 'cloth-strip', chance: 0.35, min: 1, max: 1 }, { id: 'light-strap', chance: 0.2, min: 1, max: 1 }, { id: 'scribbled-map', chance: 0.04, min: 1, max: 1 }],
        colors: { primary: '#6f8545', secondary: '#35452b', accent: '#d99b48', outline: '#252a20' },
        sound: { wave: 'sawtooth', frequency: 240 },
        spawn: { floors: [[1, 9]], weight: 1, group: [1, 2], probability: 0.15, rule: 'replace-goblin' }
    },
    {
        id: 'gallery-spider', name: 'Aranha das galerias', creatureType: 'spider',
        category: 'arachnid', heightBlocks: 1, floors: { min: 1, max: 9 },
        stats: { health: 16, damage: 8, defense: 0, speed: 34, range: 150 },
        resistances: { physical: 0, fire: 0, poison: 0 },
        attacks: [
            { id: 'rift-leap', warning: 0.3, execution: 0.16, recovery: 0.4, cooldown: 1.45, range: 76, travel: 52, radius: 18, damage: 1, status: null },
            { id: 'capture-thread', warning: 0.6, execution: 0.12, recovery: 0.4, cooldown: 3.8, range: 150, radius: 9, damage: 1, status: { type: 'web', duration: 1.5 } }
        ],
        drops: [{ id: 'coin', chance: 0.8, min: 1, max: 1 }, { id: 'fiber', chance: 0.45, min: 1, max: 2 }, { id: 'silk-gland', chance: 0.08, min: 1, max: 1 }, { id: 'silk-thread', chance: 0.2, min: 1, max: 2 }],
        colors: { primary: '#704321', secondary: '#302017', accent: '#c58a50', outline: '#21160f' },
        sound: { wave: 'triangle', frequency: 190 },
        spawn: { floors: [[1, 9]], weight: 1, group: [1, 2], probability: 0.2, rule: 'common-mines' }
    },
    {
        id: 'soot-spider', name: 'Aranha de fuligem', creatureType: 'sootSpider',
        category: 'arachnid-variant', heightBlocks: 1, floors: { min: 5, max: 9 },
        stats: { health: 20, damage: 9, defense: 0, speed: 37, range: 150 },
        resistances: { physical: 0, fire: 0.2, poison: 0 },
        attacks: [
            { id: 'soot-thread', warning: 0.7, execution: 0.12, recovery: 0.45, cooldown: 4.5, range: 150, radius: 9, damage: 1, status: { type: 'web', duration: 1.7 } },
            { id: 'abrasive-leap', warning: 0.32, execution: 0.18, recovery: 0.45, cooldown: 1.45, range: 84, travel: 52, radius: 20, damage: 1, status: null }
        ],
        drops: [{ id: 'soot', chance: 0.65, min: 1, max: 2 }, { id: 'silk-thread', chance: 0.5, min: 1, max: 2 }, { id: 'thermal-gland', chance: 0.08, min: 1, max: 1 }, { id: 'heat-coating', chance: 0.18, min: 1, max: 1 }],
        colors: { primary: '#49372e', secondary: '#211e1d', accent: '#c17443', outline: '#171514' },
        sound: { wave: 'triangle', frequency: 125 },
        spawn: { floors: [[5, 9]], weight: 1, group: [1, 2], probability: 0.35, rule: 'replace-gallery-spider' }
    },
    {
        id: 'vein-bat', name: 'Morcego do veio', creatureType: 'veinBat',
        category: 'flying-creature', heightBlocks: 1, floors: { min: 1, max: 4 },
        stats: { health: 13, damage: 7, defense: 0, speed: 38, range: 120 },
        resistances: { physical: 0, fire: 0, poison: 0 },
        attacks: [{ id: 'echo-wave', warning: 0.65, execution: 0.12, recovery: 0.45, cooldown: 3.2, range: 120, radius: 16, damage: 1, status: null }],
        drops: [{ id: 'coin', chance: 0.65, min: 1, max: 1 }, { id: 'fiber', chance: 0.35, min: 1, max: 1 }],
        colors: { primary: '#514052', secondary: '#28212e', accent: '#d8a85e', outline: '#17131c' },
        sound: { wave: 'sine', frequency: 210 },
        spawn: { floors: [[1, 4]], weight: 1, group: [1, 2], probability: 1, rule: 'common-mines' }
    },
    {
        id: 'basalt-lizard', name: 'Lagarto de basalto', creatureType: 'basaltLizard',
        category: 'armored-reptile', heightBlocks: 1, floors: { min: 5, max: 9 },
        stats: { health: 34, damage: 12, defense: 1, speed: 22, range: 48 },
        resistances: { physical: 0, frontalPhysical: 0.65, fire: 0.2, poison: 0 },
        attacks: [{ id: 'tail-sweep', warning: 0.6, execution: 0.15, recovery: 0.55, cooldown: 2.8, range: 48, radius: 36, damage: 1, status: 'knockback' }],
        drops: [{ id: 'coin', chance: 0.8, min: 1, max: 1 }, { id: 'basalt-fragment', chance: 0.45, min: 1, max: 2 }, { id: 'heated-rock-plate', chance: 0.08, min: 1, max: 1 }],
        colors: { primary: '#62564b', secondary: '#292725', accent: '#e17b35', outline: '#191817' },
        sound: { wave: 'triangle', frequency: 105 },
        spawn: { floors: [[5, 9]], weight: 1, group: [1, 1], probability: 1, rule: 'common-cisterns' }
    },
    {
        id: 'faceless-scribe', name: 'Escriba sem rosto', creatureType: 'facelessScribe',
        category: 'arcane-elite', heightBlocks: 2, floors: { min: 10, max: 14 },
        stats: { health: 31, damage: 14, defense: 0, speed: 20, range: 145 },
        resistances: { physical: 0, fire: 0, poison: 0.25 },
        attacks: [{ id: 'ground-glyph', warning: 0.9, execution: 0.18, recovery: 0.65, cooldown: 4.5, range: 145, radius: 30, damage: 1, status: null }],
        drops: [{ id: 'coin', chance: 0.7, min: 1, max: 1 }, { id: 'scrap', chance: 0.35, min: 1, max: 1 }, { id: 'lens-fragment', chance: 0.08, min: 1, max: 1 }],
        colors: { primary: '#504360', secondary: '#292333', accent: '#c4a4ef', outline: '#17131e' },
        sound: { wave: 'sine', frequency: 135 },
        spawn: { floors: [[10, 14]], weight: 1, group: [1, 1], probability: 1, rule: 'castle-common' }
    },
    {
        id: 'forge-dragon', name: 'Dragão das forjas antigas', creatureType: 'dragon',
        category: 'dragon-boss', heightBlocks: 3, floors: { min: 5, max: 20 },
        stats: { health: 180, damage: 20, defense: 0, speed: 19, range: 220 },
        resistances: { physical: 0, fire: 0.5, poison: 0 },
        attacks: [
            { id: 'fireball', warning: 0.65, execution: 0.28, recovery: 0.45, cooldown: 2.1, range: 220, radius: 20, speed: 112, damage: 1, status: { type: 'burn', duration: 2, damagePerSecond: 2 } },
            { id: 'wing-sweep', warning: 0.55, execution: 0.2, recovery: 0.6, cooldown: 2.8, range: 55, radius: 42, damage: 1, status: 'knockback' }
        ],
        drops: [{ id: 'coin', chance: 1, min: 2, max: 4 }, { id: 'scale-fragment', chance: 0.65, min: 1, max: 3 }, { id: 'ember-core', chance: 0.12, min: 1, max: 1 }, { id: 'thermal-plate', chance: 0.25, min: 1, max: 1 }],
        colors: { primary: '#37251f', secondary: '#211a19', accent: '#ef7846', outline: '#171313' },
        sound: { wave: 'sawtooth', frequency: 72 },
        spawn: { floors: [5, 10, 20], weight: 1, group: [1, 1], probability: 0.5, rule: 'alternate-dragon-golem' }
    },
    {
        id: 'lava-golem', name: 'Golem de lava', creatureType: 'lavaGolem',
        category: 'igneous-construct-boss', heightBlocks: 3, floors: { min: 5, max: 20 },
        stats: { health: 180, damage: 30, defense: 2, speed: 19, range: 150 },
        resistances: { physical: 0.25, fire: 0.75, poison: 1 },
        attacks: [
            { id: 'lava-pool', warning: 0.65, execution: 0.2, recovery: 0.45, cooldown: 4.2, range: 150, radius: 34, damage: 0.4, status: { type: 'burn', duration: 2, damagePerSecond: 2 } },
            { id: 'thrown-rock', warning: 0.55, execution: 0.3, recovery: 0.55, cooldown: 3.2, range: 220, radius: 20, speed: 108, damage: 0.55, status: null },
            { id: 'eruption', warning: 0.75, execution: 0.22, recovery: 0.6, cooldown: 2, range: 160, radius: 32, damage: 1, status: { type: 'burn', duration: 2, damagePerSecond: 2 } }
        ],
        drops: [{ id: 'coin', chance: 1, min: 2, max: 4 }, { id: 'basalt-fragment', chance: 0.7, min: 1, max: 3 }, { id: 'igneous-core', chance: 0.12, min: 1, max: 1 }, { id: 'heated-rock-plate', chance: 0.25, min: 1, max: 1 }],
        colors: { primary: '#34302d', secondary: '#201c1a', accent: '#ff7131', outline: '#171313' },
        sound: { wave: 'sawtooth', frequency: 58 },
        spawn: { floors: [5, 10, 20], weight: 1, group: [1, 1], probability: 0.5, rule: 'alternate-dragon-golem' }
    },
    {
        id: 'tainted-troll', name: 'Troll contaminado', creatureType: 'troll',
        category: 'tainted-humanoid', heightBlocks: 2, floors: { min: 10, max: 20 },
        stats: { health: 48, damage: 22, defense: 1, speed: 30, range: 28 },
        resistances: { physical: 0, fire: 0, poison: 0.25 },
        attacks: [{ id: 'toxic-bite', warning: 0.55, execution: 0.15, recovery: 0.45, cooldown: 2.4, range: 34, radius: 16, damage: 1, status: { type: 'poison', duration: 4, damagePerSecond: 3 } }],
        drops: [{ id: 'coin', chance: 0.75, min: 1, max: 2 }, { id: 'leather', chance: 0.5, min: 1, max: 2 }, { id: 'toxin-pouch', chance: 0.08, min: 1, max: 1 }, { id: 'venom-tanned-leather', chance: 0.22, min: 1, max: 1 }],
        colors: { primary: '#8dbb51', secondary: '#557c3c', accent: '#79a946', outline: '#30492b' },
        sound: { wave: 'triangle', frequency: 88 },
        spawn: { floors: [[10, 20]], weight: 3, group: [1, 2], probability: 1, rule: 'castle-common' }
    },
    {
        id: 'siege-ogre', name: 'Ogro de cerco', creatureType: 'ogre',
        category: 'heavy-humanoid', heightBlocks: 2, floors: { min: 10, max: 20 },
        stats: { health: 51, damage: 23, defense: 1, speed: 22, range: 52 },
        resistances: { physical: 0.1, fire: 0, poison: 0 },
        attacks: [
            { id: 'siege-slam', warning: 0.65, execution: 0.18, recovery: 0.55, cooldown: 2.1, range: 52, radius: 42, damage: 2, status: 'knockback' },
            { id: 'shoulder-bash', warning: 0.55, execution: 0.25, recovery: 0.5, cooldown: 3, range: 82, radius: 20, damage: 1.2, status: 'knockback' }
        ],
        drops: [{ id: 'coin', chance: 0.75, min: 1, max: 2 }, { id: 'scrap', chance: 0.5, min: 1, max: 3 }, { id: 'siege-rivet', chance: 0.1, min: 1, max: 1 }, { id: 'reinforced-plate', chance: 0.22, min: 1, max: 1 }],
        colors: { primary: '#577d3d', secondary: '#35532e', accent: '#e07830', outline: '#243a25' },
        sound: { wave: 'square', frequency: 64 },
        spawn: { floors: [[10, 20]], weight: 2, group: [1, 2], probability: 1, rule: 'castle-common' }
    },
    {
        id: 'ash-hound', name: 'Cão de fuligem', creatureType: 'ashHound',
        category: 'predator-elite', heightBlocks: 1, floors: { min: 10, max: 19 },
        stats: { health: 24, damage: 13, defense: 0, speed: 43, range: 64 },
        resistances: { physical: 0, fire: 0.15, poison: 0 },
        attacks: [{ id: 'flank-bite', warning: 0.55, execution: 0.2, recovery: 0.45, cooldown: 2.4, range: 64, radius: 18, damage: 1.5, status: null }],
        drops: [{ id: 'charred-leather', chance: 0.65, min: 1, max: 2 }, { id: 'iron-collar', chance: 0.08, min: 1, max: 1 }, { id: 'light-leather-strip', chance: 0.25, min: 1, max: 1 }],
        colors: { primary: '#292321', secondary: '#171514', accent: '#a95b37', outline: '#171514' },
        sound: { wave: 'triangle', frequency: 105 },
        spawn: { floors: [[10, 14], [16, 19]], weight: 2, group: [1, 2], probability: 0.3, rule: 'castle-service-areas' }
    },
    {
        id: 'stained-sentinel', name: 'Sentinela de vitral', creatureType: 'stainedSentinel',
        category: 'construct-elite', heightBlocks: 2, floors: { min: 14, max: 19 },
        stats: { health: 36, damage: 14, defense: 1, speed: 21, range: 155 },
        resistances: { physical: 0, frontalPhysical: 1, fire: 0, poison: 1 },
        attacks: [{ id: 'light-lance', warning: 0.8, execution: 0.16, recovery: 0.55, cooldown: 3, range: 155, radius: 11, damage: 1, status: null }],
        drops: [{ id: 'coin', chance: 0.7, min: 1, max: 2 }, { id: 'stained-glass-shard', chance: 0.65, min: 1, max: 3 }, { id: 'sentinel-core', chance: 0.08, min: 1, max: 1 }, { id: 'prismatic-fragment', chance: 0.2, min: 1, max: 1 }],
        colors: { primary: '#647b7e', secondary: '#343c42', accent: '#8ed6dc', outline: '#1d2428' },
        sound: { wave: 'sine', frequency: 300 },
        spawn: { floors: [[14, 14], [16, 19]], weight: 1, group: [1, 1], probability: 0.2, rule: 'chapels-and-galleries' }
    },
    {
        id: 'observatory-reaper', name: 'Ceifador do observatório', creatureType: 'grimReaper',
        category: 'spirit-boss', heightBlocks: 3, floors: { min: 15, max: 15 },
        stats: { health: 345, damage: 29, defense: 1, speed: 32, range: 105 },
        resistances: { physical: 0.1, fire: 0, poison: 1 },
        attacks: [
            { id: 'scythe-arc', warning: GAME_BALANCE.bosses.reaperScytheWarningSeconds, execution: 0.2, recovery: 0.6, cooldown: 2.2, range: 105, radius: 52, damage: 1, status: null },
            { id: 'shadow-step', warning: 0.45, execution: 0.2, recovery: 0.4, cooldown: 4, range: 180, radius: 0, damage: 0, status: 'teleport' }
        ],
        drops: [{ id: 'coin', chance: 1, min: 2, max: 4 }, { id: 'lens-fragment', chance: 0.65, min: 1, max: 2 }, { id: 'observatory-core', chance: 0.12, min: 1, max: 1 }, { id: 'spectral-blade', chance: 0.2, min: 1, max: 1 }],
        colors: { primary: '#392638', secondary: '#17131c', accent: '#c8a9ff', outline: '#100e15' },
        sound: { wave: 'sine', frequency: 95 },
        spawn: { floors: [15, 15], weight: 1, group: [1, 1], probability: 1, rule: 'exclusive-floor-boss' }
    },
    {
        id: 'web-matriarch', name: 'Matriarca do Tear', creatureType: 'matriarch',
        category: 'arachnid-miniboss', heightBlocks: 2, floors: { min: 8, max: 8 },
        stats: { health: 180, damage: 18, defense: 0, speed: 24, range: 150 },
        resistances: { physical: 0, fire: 0, poison: 0.25 },
        attacks: [
            { id: 'web-capture', warning: 0.7, execution: 0.12, recovery: 0.5, cooldown: 5, range: 150, radius: 10, damage: 1, status: { type: 'web', duration: 1.7 } },
            { id: 'collapse-leap', warning: 0.7, execution: 0.25, recovery: 0.6, cooldown: 4, range: 105, travel: 64, radius: 32, damage: 1.4, status: null }
        ],
        drops: [{ id: 'coin', chance: 1, min: 1, max: 3 }, { id: 'thick-silk', chance: 0.7, min: 1, max: 3 }, { id: 'chitin-pearl', chance: 0.12, min: 1, max: 1 }, { id: 'silk-rope', chance: 0.25, min: 1, max: 1 }],
        colors: { primary: '#8c8468', secondary: '#343127', accent: '#d7c58c', outline: '#21160f' },
        sound: { wave: 'triangle', frequency: 68 },
        spawn: { floors: [8, 8], weight: 1, group: [1, 1], probability: 1, rule: 'fixed-optional-nest' }
    },
    {
        id: 'throne-guardian', name: 'Guardião do Trono', creatureType: 'throneGuardian',
        category: 'royal-construct-boss', heightBlocks: 3, floors: { min: 20, max: 20 },
        stats: { health: 175, damage: 18, defense: 2, speed: 16, range: 94 },
        resistances: { physical: 0.25, fire: 0.25, poison: 1 },
        attacks: [
            { id: 'royal-oath', warning: 0.7, execution: 0.2, recovery: 0.6, cooldown: 2.4, range: 54, radius: 30, damage: 1, status: null },
            { id: 'vein-pulse', warning: 0.9, execution: 0.2, recovery: 0.55, cooldown: 3.8, range: 94, radius: 72, damage: 0.6, status: null }
        ],
        drops: [{ id: 'coin', chance: 1, min: 3, max: 5 }, { id: 'basalt-fragment', chance: 0.75, min: 1, max: 3 }, { id: 'crown-core', chance: 0.12, min: 1, max: 1 }],
        colors: { primary: '#59616a', secondary: '#242a31', accent: '#f0d98a', outline: '#17191b' },
        sound: { wave: 'sine', frequency: 52 },
        spawn: { floors: [20, 20], weight: 1, group: [1, 1], probability: 0.5, rule: 'replace-final-boss' }
    }
];

const creatureDataByType = Object.fromEntries(
    creatureData.map((creature) => [creature.creatureType, creature])
);

function isBossCreatureType(creatureType) {
    const creature = creatureDataByType[creatureType];
    return Boolean(creature && creature.category.endsWith('-boss'));
}

const creatureMaterialData = [
    ['leather-strip', 'Tira de couro', 'Couro remendável retirado dos equipamentos dos goblins.'],
    ['mine-rivet', 'Rebite de mina', 'Peça metálica reaproveitada das galerias abandonadas.'],
    ['shield-fragment', 'Fragmento de escudo', 'Lasca de madeira e metal de um escudo de mina.'],
    ['cloth-strip', 'Faixa de tecido', 'Tecido leve usado para amarrar cargas e mapas.'],
    ['light-strap', 'Correia leve', 'Correia flexível recuperada do equipamento de um corredor.'],
    ['scribbled-map', 'Mapa rabiscado', 'Esboço de uma rota curta pelas galerias.'],
    ['fiber', 'Fibra cavernícola', 'Fibra resistente coletada perto das teias subterrâneas.'],
    ['silk-gland', 'Glândula de seda', 'Glândula intacta de uma aranha das galerias.'],
    ['silk-thread', 'Fio de seda', 'Fio resistente para armadilhas e equipamento.'],
    ['soot', 'Fuligem mineral', 'Cinza escura que retém partículas metálicas.'],
    ['thermal-gland', 'Glândula térmica', 'Glândula aquecida da aranha de fuligem.'],
    ['heat-coating', 'Revestimento térmico', 'Camada de seda e fuligem que protege contra calor.'],
    ['scale-fragment', 'Fragmento de escama', 'Escama carbonizada que ainda guarda calor.'],
    ['ember-core', 'Núcleo de brasa', 'Núcleo raro retirado das forjas antigas.'],
    ['thermal-plate', 'Placa térmica', 'Placa de escama para proteção contra calor.'],
    ['basalt-fragment', 'Fragmento de basalto', 'Pedaço denso de rocha vulcânica.'],
    ['igneous-core', 'Núcleo ígneo', 'Núcleo mineral que conserva o calor da fornalha.'],
    ['heated-rock-plate', 'Placa de rocha aquecida', 'Laje resistente com fissuras de lava solidificada.'],
    ['leather', 'Couro de troll', 'Couro grosso recuperado do equipamento dos trolls.'],
    ['toxin-pouch', 'Bolsa de toxina', 'Reservatório de veneno que exige manuseio cuidadoso.'],
    ['venom-tanned-leather', 'Couro curtido contra veneno', 'Couro tratado por resíduos tóxicos do veio.'],
    ['scrap', 'Sucata de cerco', 'Metal amassado retirado da armadura de um ogro.'],
    ['siege-rivet', 'Rebite de cerco', 'Rebite reforçado usado em equipamentos pesados.'],
    ['reinforced-plate', 'Placa reforçada', 'Placa de couro e metal para proteção defensiva.'],
    ['charred-leather', 'Couro chamuscado', 'Tira de couro escurecida pelo calor das forjas.'],
    ['iron-collar', 'Coleira de ferro', 'Coleira sem dono marcada por antigas cinzas.'],
    ['light-leather-strip', 'Tira de couro leve', 'Material flexível recolhido do Cão de fuligem.'],
    ['stained-glass-shard', 'Caco de vitral', 'Vidro colorido que ainda refrata luz em sua borda.'],
    ['sentinel-core', 'Núcleo de sentinela', 'Peça do mecanismo que animava a armadura de vitral.'],
    ['prismatic-fragment', 'Fragmento prismático', 'Fragmento luminoso para melhorias defensivas ou visuais.'],
    ['lens-fragment', 'Fragmento de lente', 'Lasca de uma lente do antigo observatório.'],
    ['observatory-core', 'Núcleo do observatório', 'Peça arcana que mantinha os instrumentos do observatório ativos.'],
    ['spectral-blade', 'Lâmina espectral', 'Lâmina fria deixada pela foice do Ceifador.'],
    ['thick-silk', 'Seda grossa', 'Seda reforçada da Matriarca do Tear.'],
    ['chitin-pearl', 'Pérola de quitina', 'Nódulo rígido e raro da carapaça da Matriarca.'],
    ['silk-rope', 'Corda de seda', 'Corda flexível para armadura ou equipamento de mobilidade.'],
    ['crown-core', 'Núcleo da coroa', 'Núcleo de basalto que sustenta o juramento do Guardião.']
].map(([id, name, description]) => ({ id, name, description }));
const creatureMaterialDataById = Object.fromEntries(
    creatureMaterialData.map((material) => [material.id, material])
);
const bestiaryDescriptions = [
    {
        region: 'Galerias baixas e minas antigas · andares 1–4',
        creatureType: 'goblin',
        heightBlocks: 1,
        behaviorProfile: 'caveScavenger',
        name: 'Goblin das galerias',
        aliases: 'Catador, orelha-de-cobre.',
        category: 'Humanoide · comum',
        habitat: 'Ruínas e corredores de mineração, andares 1–9; concentra-se em alojamentos improvisados e perto dos veios.',
        appearance: 'Pequeno, de silhueta baixa e ombros estreitos. Tem pele verde, orelhas pontudas e focinho curto; veste couro remendado e peças de metal reaproveitadas. Pode carregar uma lâmina curta ou um escudo irregular. A versão feminina existente conserva cabelo longo e adornos.',
        behavior: 'Patrulha em grupos e avança ao notar o jogador. Goblins com escudo tentam mantê-lo à frente; os demais procuram cercar ou atacar durante a recuperação de um golpe.',
        lore: 'Os goblins não cavaram as galerias: encontraram ferramentas e depósitos abandonados. Chamam as moedas de escamas da montanha e as trocam entre clãs por proteção. Alguns carregam símbolos da antiga coroa sem saber que eram marcas de propriedade das minas.',
        stats: 'Base: 20 PV, 10 dano, 0 defesa, 30 velocidade, alcance curto. Pode surgir com escudo ou armadura. Sem resistências especiais.',
        attacks: 'Talho de sucata: golpe corpo a corpo; ergue o braço como aviso; recarga sugerida de 1,2 s. Guarda improvisada: bloqueio frontal enquanto o escudo resiste; metal tilinta ao aparar.',
        strategy: 'Flanqueie o escudo ou desgaste-o com ataques. Separar um goblin do grupo evita ser cercado.',
        drops: 'Comuns: cobre ou minério equivalente. Raros: fragmento de escudo. Materiais: tira de couro e rebite de mina.',
        design: 'Passos rápidos e irregulares e tilintar de metal solto. Mantenha o golpe curto e legível, com a silhueta do braço bem marcada.',
        status: 'Criatura existente'
    },
    {
        region: 'Galerias baixas e minas antigas · andares 1–4',
        creatureType: 'goblinRunner',
        heightBlocks: 1,
        behaviorProfile: 'courierSkirmisher',
        name: 'Goblin corredor',
        aliases: 'Batedor, pé-ligeiro.',
        category: 'Variante de goblin · comum veloz',
        habitat: 'Corredores longos e atalhos das galerias, andares 1–9. O jogo já tem uma chance baixa de goblin corredor.',
        appearance: 'Mais magro e inclinado para a frente que o goblin comum. Usa faixas de tecido nas pernas, bolsa leve e faca curta; não leva escudo.',
        behavior: 'Aproxima-se depressa, ataca e reposiciona-se. Pode atrair o jogador para uma sala onde outros goblins aguardam, sem fugir indefinidamente.',
        lore: 'Os corredores levam recados entre grupos separados por desabamentos. Dizem que ouvem os veios vibrar antes de uma queda. Os clãs respeitam sua velocidade, mas culpam-nos quando chegam trazendo más notícias.',
        stats: 'Base sugerida: 15 PV, 8 dano, 0 defesa, 45 velocidade, alcance curto. No jogo, o arquétipo já tem menos vida e dano e mais velocidade.',
        attacks: 'Estocada de passagem: investida curta que termina após um golpe; abaixa o corpo e recua a faca como aviso; recarga sugerida de 1,5 s.',
        strategy: 'Deixe a investida passar e ataque durante a recuperação. Tem pouca vida e fica vulnerável quando encurralado.',
        drops: 'Comuns: cobre e tecido. Raro: mapa rabiscado com rota curta. Material: correia leve.',
        design: 'Animação de antecipação clara, deslocamento veloz e som de sola raspando pedra. Use apenas um rastro de poeira discreto.',
        status: 'Variante existente'
    },
    {
        region: 'Galerias baixas e minas antigas · andares 1–4',
        creatureType: 'spider',
        heightBlocks: 1,
        behaviorProfile: 'caveAmbusher',
        name: 'Aranha das galerias',
        aliases: 'Tecedeira, oito-luzes.',
        category: 'Artrópode cavernícola · comum de emboscada',
        habitat: 'Fendas, quinas de paredes e trechos escuros dos andares 1–9. Já faz parte dos inimigos comuns dessa faixa.',
        appearance: 'Muito menor que um goblin, com corpo marrom segmentado, carapaça texturizada, oito patas articuladas e olhos luminosos. Sua silhueta baixa deve ser distinguível das teias decorativas.',
        behavior: 'Espreita à distância, lança teia e salta quando o jogador se aproxima. Caça em pequenos grupos, cada aranha procurando um ângulo próprio.',
        lore: 'As aranhas prosperam onde o pó mineral se prende às teias. Goblins dizem que guardam as entradas mais antigas; para elas, moedas abandonadas são suportes que refletem calor.',
        stats: 'Base aproximada: 16 PV, 8 dano, 0 defesa, 34 velocidade, alcance médio com teia. É mais frágil e ágil que o goblin.',
        attacks: 'Salto de fenda: aproximação curta; agacha antes de saltar; recarga atual aproximada de 1,45 s. Fio de captura: linha que prende por 1,5 s; ergue o abdômen antes de disparar; recarga atual aproximada de 3,8 s.',
        strategy: 'Paredes e obstáculos bloqueiam a teia. Mantenha distância para evitar o salto e use o arco durante a preparação do fio.',
        drops: 'Comuns: cobre e fibra. Raro: glândula de seda. Material: fio resistente para armadilhas ou equipamento.',
        design: 'Anime as patas alternadamente; use estalo seco no salto e som elástico na teia. O brilho dos olhos deve ser breve.',
        status: 'Criatura existente'
    },
    {
        region: 'Cisternas e câmaras aquecidas · andares 5–9',
        creatureType: 'sootSpider',
        heightBlocks: 1,
        behaviorProfile: 'sootAmbusher',
        name: 'Aranha de fuligem',
        aliases: 'Carvoeira, tecedeira negra.',
        category: 'Variante de aranha · comum rara',
        habitat: 'Cisternas quentes, passagens com vapor e bolsões de lava, sobretudo nos andares 5–9.',
        appearance: 'Carapaça quase preta com linhas ferrugem nas juntas; abdômen coberto por poeira cinza. As patas dianteiras são longas e terminam em pontas semelhantes a ganchos.',
        behavior: 'Oculta-se perto de uma parede, dispara teia e então salta. Evita água e áreas muito iluminadas.',
        lore: 'Surgiu nas galerias aquecidas pelas primeiras forjas. Sua seda retém fuligem e partículas metálicas, levando mineiros a dizer que ela costura o minério. Goblins usam sua presença como aviso de calor perigoso.',
        stats: 'Variante jogável: cerca de 20 PV e 9 dano antes da escala do andar; é mais veloz que a aranha comum. Sem resistências ou imunidades elementais.',
        attacks: 'Teia escurecida: prende por 1,7 s; ergue as patas traseiras como aviso; recarga de 4,5 s. Salto abrasivo: salto curto com dano ao pousar; recarga de 1,45 s.',
        strategy: 'A teia continua bloqueável por paredes. Tire-a dos cantos e esquive do salto, que tem trajetória previsível.',
        drops: 'Comuns: seda e fuligem. Raro: glândula térmica. Material: revestimento resistente ao calor.',
        design: 'Partículas de cinza caem durante o salto; som abafado de tecido puxado sobre pedra. Evite uma nuvem persistente que esconda a arena.',
        status: 'Variante jogável'
    },
    {
        region: 'Galerias baixas e minas antigas · andares 1–4',
        creatureType: 'veinBat',
        heightBlocks: 1,
        behaviorProfile: 'veinEchoHunter',
        name: 'Morcego do veio',
        aliases: 'Eco de cobre, asa-de-fenda.',
        category: 'Criatura voadora · comum',
        habitat: 'Fendas aquecidas nas galerias dos andares 1–4.',
        appearance: 'Morcego pequeno de asas escuras e marcas ocres que lembram veios metálicos. A silhueta das asas abre durante a preparação do guincho.',
        behavior: 'Circula e se aproxima sem bloquear o corredor. Um guincho anunciado precede uma onda sônica curta e direcionada, que pode ser evitada saindo da linha de ataque.',
        lore: 'Nidifica nas fendas aquecidas pelo veio. Seus chamados ecoam pelos túneis e denunciam a presença de criaturas próximas.',
        stats: 'Base: 13 PV, 7 dano, sem defesa especial, velocidade 38 e alcance de 120. O escalonamento acompanha o andar.',
        attacks: 'Onda de eco: guincho com aviso de 0,65 s, seguido de uma onda em linha que atravessa até 120 unidades; recarga de 3,2 s.',
        strategy: 'Mova-se lateralmente durante o aviso e use os obstáculos para cortar a linha do eco.',
        drops: 'Moedas de cobre e fibra cavernícola, seguindo as chances e quantidades cadastradas.',
        design: 'Asas em blocos de ameixa e carvão, com um pequeno brilho ocre; a linha de eco deve permanecer visível durante o aviso.',
        status: 'Criatura jogável · andares 1–4'
    },
    {
        region: 'Cisternas e câmaras aquecidas · andares 5–9',
        creatureType: 'basaltLizard',
        heightBlocks: 1,
        behaviorProfile: 'basaltBulwark',
        name: 'Lagarto de basalto',
        aliases: 'Carapaça quente, rastro de cinza.',
        category: 'Réptil blindado · comum resistente',
        habitat: 'Cisternas quentes e passagens estreitas dos andares 5–9.',
        appearance: 'Réptil baixo, coberto por placas de basalto cinza e fissuras alaranjadas. A cabeça e a carapaça frontal formam uma silhueta distinta.',
        behavior: 'Resiste a golpes físicos pela frente. Imobiliza-se para avisar uma varrida de cauda de curto alcance; o jogador pode afastar-se ou flanquear para contornar as placas frontais.',
        lore: 'A carapaça mineral cresceu nos canais de lava resfriada; os goblins usam as marcas deixadas por ele para evitar poças instáveis.',
        stats: 'Base: 34 PV, 12 dano, 1 defesa, velocidade 22 e alcance 48. Reduz dano físico frontal em 65% e dano de fogo em 20%.',
        attacks: 'Varrida de cauda: aviso de 0,6 s, dano e empurrão em curta distância; recarga de 2,8 s.',
        strategy: 'Circule a carapaça para atacar pelas costas e recue quando a cauda começar a brilhar.',
        drops: 'Moedas, fragmentos de basalto e chance baixa de placa de rocha aquecida.',
        design: 'Placas de pixel art em tons de basalto com fissuras quentes; destacar a cauda durante a preparação sem cobrir o chão.',
        status: 'Criatura jogável · andares 5–9'
    },
    {
        region: 'Arquivo do castelo · andares 10–14',
        creatureType: 'facelessScribe',
        heightBlocks: 2,
        behaviorProfile: 'facelessGlyphcaster',
        name: 'Escriba sem rosto',
        aliases: 'Copista mudo, mão do arquivo.',
        category: 'Conjurador arcano · elite',
        habitat: 'Arquivos e galerias do castelo nos andares 10–14.',
        appearance: 'Figura alta sob um manto violeta e carvão. O rosto é uma cavidade escura; um glifo lilás surge no chão enquanto conjura.',
        behavior: 'Marca a posição do jogador com um círculo no piso antes de ativar um glifo explosivo. Sair da área evita o dano; acertar o escriba interrompe a conjuração.',
        lore: 'Era responsável por copiar decretos da corte. Depois do colapso, continua escrevendo ordens que ninguém consegue ler.',
        stats: 'Base: 31 PV, 14 dano, sem defesa especial, velocidade 20 e alcance 145. Tem 25% de resistência a veneno.',
        attacks: 'Glifo do arquivo: círculo no piso por 0,9 s, explosão de raio 30 e recarga de 4,5 s; o aviso pode ser interrompido por dano.',
        strategy: 'Saia do círculo durante a conjuração ou ataque para interrompê-la. Não fique parado após chamar sua atenção.',
        drops: 'Moedas, sucata e chance baixa de fragmento de lente.',
        design: 'Manto alto em blocos de violeta e carvão; o glifo no chão deve ter contraste suficiente para continuar legível sobre os pisos do castelo.',
        status: 'Criatura jogável · andares 10–14'
    },
    {
        region: 'Cisternas e câmaras aquecidas · chefes dos andares 5, 10 e 20',
        creatureType: 'dragon',
        behaviorProfile: 'forgeDragon',
        name: 'Dragão das forjas antigas',
        aliases: 'Asa de brasa, senhor do teto.',
        category: 'Dracônico · chefe',
        habitat: 'Arenas subterrâneas e salões com teto alto. Surge em andares de chefe, exceto no 15, alternando com o golem de lava.',
        appearance: 'Grande quadrúpede alado, corpo alongado, escamas de carvão com veios laranja incandescentes e chifres curvos. As asas formam uma silhueta larga; avisos de ataque devem permanecer legíveis.',
        behavior: 'Alterna ataques à distância e reposicionamento. Após uma sequência de ataques, fica vulnerável, conforme o comportamento atual dos chefes.',
        lore: 'Os registros da coroa chamam-no de animal de contenção, embora nenhuma corrente tenha sido encontrada em seu covil. Talvez tenha sido atraído pelo calor das forjas; talvez tenha guardado voluntariamente o último veio puro.',
        stats: 'Referência atual no andar 5: cerca de 270 PV e 20 dano, velocidade de chefe e alcance longo. Valores posteriores escalam por andar; no andar 5 o dano não recebe o bônus de chefe.',
        attacks: 'Bola de fogo: projétil dirigido à posição prevista do jogador; marca o alvo antes do disparo; recarga atual de 2,1 s, menor na fase II. Rasante de asa: golpe próximo; asa recuada como aviso; recarga sugerida de 2,8 s.',
        strategy: 'Esquive da bola de fogo anunciada e ataque durante a abertura após a sequência. Paredes bloqueiam ataques e também podem limitar rotas.',
        drops: 'Comuns: moedas de chefe e fragmentos de escama. Raro: núcleo de brasa. Material: placa térmica para equipamento.',
        design: 'Rugido grave ao entrar em combate. O sopro deve crescer em volume, não surgir instantaneamente. Escamas brilham mais na fase II e escurecem na vulnerabilidade.',
        status: 'Chefe existente'
    },
    {
        region: 'Cisternas e câmaras aquecidas · chefes dos andares 5, 10 e 20',
        creatureType: 'lavaGolem',
        behaviorProfile: 'lavaSiege',
        name: 'Golem de lava',
        aliases: 'Guardião do veio, homem-forno.',
        category: 'Construto ígneo · chefe',
        habitat: 'Fornalhas, câmaras de fundição e arenas construídas sobre rachaduras profundas. Alterna com o dragão nos andares de chefe, exceto no 15.',
        appearance: 'Colosso de rocha escura, ombros largos e membros irregulares unidos por lava brilhante. A cabeça é pequena diante do tronco; fissuras laranja revelam o calor interno.',
        behavior: 'Avança devagar, controla trechos da arena com poças e lança pedras para forçar reposicionamento. A fase II acelera as sequências.',
        lore: 'Pode ter sido uma estátua de contenção alimentada pelos canais térmicos da mina. Quando as forjas foram abandonadas, o fluxo não parou e a pedra ao redor do núcleo começou a mover-se. Para os goblins, é uma montanha que aprendeu a andar.',
        stats: 'Referência atual no andar 5: cerca de 270 PV e 30 dano, velocidade de chefe, defesa pesada e alcance médio/área. Resistência alta a fogo seria adequada se o elemento existir.',
        attacks: 'Poça de lava: área perigosa com aviso no chão; recarga atual aproximada de 1,4 s. Pedra arremessada: ergue o braço antes de lançar; recarga de 2,6 s. Erupção: pontos brilham antes de explodir; recarga de 2 s.',
        strategy: 'Observe o chão após cada ataque e não corra sem olhar os avisos. Ataque durante a recuperação e as janelas de fraqueza.',
        drops: 'Comuns: minério valioso e fragmento de basalto. Raro: núcleo ígneo. Material: placa de rocha aquecida.',
        design: 'Passos pesados com tremor visual leve. Fissuras acendem antes dos ataques e escurecem durante a recuperação.',
        status: 'Chefe existente'
    },
    {
        region: 'Castelo tomado · andares 10–14 e 16–19',
        creatureType: 'troll',
        heightBlocks: 2,
        behaviorProfile: 'toxicRaider',
        name: 'Troll contaminado',
        aliases: 'Envenenador, o que recua.',
        category: 'Humanoide · comum resistente',
        habitat: 'Alojamentos, cozinhas e corredores de serviço do castelo, a partir do andar 10.',
        appearance: 'Alto, largo, pele verde-clara ou acinzentada, cabelo volumoso, orelhas pontudas e focinho saliente. Veste couro e madeira; manchas escuras nas mãos indicam contaminação.',
        behavior: 'Pressiona o jogador e, após envenená-lo, tenta recuar quando está longe. Pode surgir com armadura ou escudo.',
        lore: 'Os trolls chegaram ao castelo seguindo cursos d’água subterrâneos. O veneno é resíduo do veio contaminado acumulado na saliva e nas feridas. Alguns ainda evitam as capelas, como se reconhecessem os símbolos da coroa.',
        stats: 'Referência aproximada no andar 10: 48 PV, 22 dano, defesa variável, cerca de 30 velocidade, alcance curto. Dano e vida escalam por andar; o veneno cresce gradualmente.',
        attacks: 'Mordida tóxica: aplica dano gradual; inclina a cabeça e mostra brilho verde na boca como aviso; recarga sugerida de 2,4 s. Recuo feroz: afasta-se do jogador envenenado e pode voltar a investir.',
        strategy: 'Use arco ou lança durante o recuo, sem persegui-lo às cegas por corredores. Poções ajudam enquanto o veneno continua ativo.',
        drops: 'Comuns: couro e cobre. Raro: bolsa de toxina. Material: couro curtido resistente a venenos.',
        design: 'Respiração úmida e grave; brilho tóxico só durante o aviso. A retirada deve parecer uma decisão tática, não uma fuga aleatória.',
        status: 'Criatura existente'
    },
    {
        region: 'Castelo tomado · andares 10–14 e 16–19',
        creatureType: 'ogre',
        heightBlocks: 2,
        behaviorProfile: 'siegeBrute',
        name: 'Ogro de cerco',
        aliases: 'Quebra-portas, martelo vivo.',
        category: 'Humanoide · comum pesado',
        habitat: 'Arsenal, salões abertos e corredores largos do castelo, a partir do andar 10.',
        appearance: 'Maior que troll ou goblin, cabeça ampla, presas, capacete angular de metal e armadura de couro marrom. Uma faixa laranja com fivela o destaca na pixel art.',
        behavior: 'Avança mais devagar e prefere um golpe poderoso a vários ataques. Seu golpe de área atual pode atingir outros inimigos próximos.',
        lore: 'A guarda real contratava ogros como trabalhadores de cerco; capacetes e fivelas iguais ainda estão no arsenal. Depois do abandono, continuaram protegendo portas que já não levam a lugar algum.',
        stats: 'Referência aproximada no andar 10: 51 PV, 23 dano base, defesa variável, cerca de 22 velocidade e alcance de área curta. A pancada pode chegar ao dobro do dano normal.',
        attacks: 'Pancada de cerco: impacto em área; ergue o martelo e mostra o raio de perigo; aviso atual de cerca de 0,65 s. Empurrão de ombro (proposta): investida direta, ombro recuado como aviso; recarga sugerida de 3 s.',
        strategy: 'Saia do raio durante o aviso; o dash pode evitar o impacto. Ataque após o ogro errar, quando sua recuperação o deixa vulnerável.',
        drops: 'Comuns: sucata, couro e cobre. Raro: rebite de cerco. Material: placa reforçada para equipamento defensivo.',
        design: 'O aviso precisa ser legível mesmo com vários inimigos. Use metal comprimido antes do impacto e uma pausa curta depois.',
        status: 'Criatura existente'
    },
    {
        region: 'Castelo tomado · andares 10–19',
        creatureType: 'ashHound',
        heightBlocks: 1,
        behaviorProfile: 'ashFlanker',
        name: 'Cão de fuligem',
        aliases: 'Farejador, cão das cinzas.',
        category: 'Predador · elite leve',
        habitat: 'Cozinhas, depósitos e alas de serviço do castelo, andares 10–14 e 16–19.',
        appearance: 'Quadrúpede magro, pelo escuro grudado por cinza, focinho comprido e patas dianteiras fortes. Usa uma coleira de ferro sem dono; olhos refletem a luz como brasas apagadas.',
        behavior: 'Fareja o jogador e circula até encontrar um flanco. Evita ogros de frente, mas pode atacar aranhas e goblins por alimento.',
        lore: 'Eram cães de trabalho da guarda, treinados para localizar fumaça e vazamentos nas forjas. Após o colapso, aprenderam a seguir o cheiro mineral dos veios. Goblins deixam uma sala ao encontrar pegadas cobertas de cinza.',
        stats: 'Base aproximada: 24 PV, 13 dano, sem defesa especial, velocidade alta e alcance curto. Vida e dano seguem a escala normal do andar.',
        attacks: 'Mordida de flanco: investida anunciada por 0,55 s; causa 50% mais dano se o jogador estiver de costas. Recarga de 2,4 s.',
        strategy: 'Mantenha-o à vista para negar o bônus de flanco e esquive da animação de salto. Evite corredores estreitos em que a velocidade domine.',
        drops: 'Comuns: couro chamuscado. Raro: coleira de ferro identificada. Material: tira de couro leve.',
        design: 'Rosnado quase inaudível que cresce ao encontrar o flanco; poeira baixa ao correr. Evite latidos agudos constantes.',
        status: 'Criatura jogável'
    },
    {
        region: 'Castelo tomado · andares 14 e 16–19',
        creatureType: 'stainedSentinel',
        heightBlocks: 2,
        behaviorProfile: 'stainedGuardian',
        name: 'Sentinela de vitral',
        aliases: 'Guarda colorido, cavaleiro de cacos.',
        category: 'Construto reanimado · elite',
        habitat: 'Galerias de vitrais, capelas e salas nobres, principalmente nos andares 14 e 16–19.',
        appearance: 'Armadura vazia com placas de vidro colorido no peito e no escudo. Silhueta alta e estreita, sem rosto; a luz atravessa o tronco e revela o núcleo metálico.',
        behavior: 'Mantém posição e bloqueia ataques frontais. Avança quando o jogador tenta contorná-la; pode proteger ogros ou trolls feridos.',
        lore: 'Os vitrais retratavam a fundação da dinastia e a extração do primeiro minério. Quando o castelo foi contaminado, os guardas de metal despertaram com a última ordem: impedir qualquer pessoa de alcançar o trono.',
        stats: 'Base aproximada: 36 PV, 14 dano, resistência frontal de 35%, velocidade baixa e alcance de linha. Sem imunidade; flanquear contorna a resistência.',
        attacks: 'Lança de luz: linha estreita de até 155 px; o vitral do peito acende e aponta a direção por 0,8 s antes do disparo. Recarga de 3 s.',
        strategy: 'Flanqueie, esquive da linha e ataque durante a recuperação. O escudo deve poder ser desgastado; a luz não pode ser instantânea ou inevitável.',
        drops: 'Comuns: cacos de vitral e sucata. Raro: núcleo de sentinela. Material: fragmento prismático para melhoria defensiva ou visual.',
        design: 'Passos metálicos ressonantes e reflexos coloridos no chão antes do disparo. Ao morrer, desmonta em peças em vez de explodir.',
        status: 'Criatura jogável'
    },
    {
        region: 'Observatório do Ceifador · andar 15',
        creatureType: 'grimReaper',
        behaviorProfile: 'observatoryReaper',
        name: 'Ceifador do observatório',
        aliases: 'Astrônomo morto, senhor da foice.',
        category: 'Espirito guardião · chefe',
        habitat: 'Arena circular do observatório arcano, ligada ao laboratório e à biblioteca proibida. Aparece exclusivamente no andar 15.',
        appearance: 'Figura alta envolta em tecido escuro, rosto parcialmente oculto e foice longa. O manto parece fumaça, mas a arma mantém contorno sólido e legível.',
        behavior: 'Observa, reposiciona-se e anuncia o golpe antes de atacar. Na fase II acelera a sequência, preservando uma janela possível de reação.',
        lore: 'O Ceifador foi o último astrônomo da corte, encarregado de registrar as noites em que o veio brilhava. Seus cálculos previram o colapso, mas a corte o acusou de sabotagem. Continua medindo um céu que já não consegue ver.',
        stats: 'Referência atual no andar 15: cerca de 518 PV, 43 dano, defesa sugerida de 1–2, 32 velocidade e alcance longo. Ajustar à escala de chefe existente.',
        attacks: 'Arco da foice: golpe em arco com aviso direcional; postura lateral e brilho na lâmina antes do corte. Passo entre sombras (proposta): reposicionamento sem dano, com silhueta no destino; recarga de 4 s.',
        strategy: 'Observe a direção da foice, saia do arco e puna o fim do golpe. Não dependa de atacar durante a preparação.',
        drops: 'Comuns: moedas de chefe e fragmento de lente. Raro: núcleo do observatório. Material: lâmina espectral ou componente arcano futuro.',
        design: 'Sinos distantes e notas sustentadas, sem música frenética. O aviso do golpe precisa contrastar com o piso circular.',
        status: 'Chefe existente'
    },
    {
        region: 'Câmara secreta · encontro opcional',
        creatureType: 'matriarch',
        heightBlocks: 1,
        behaviorProfile: 'broodMatriarch',
        name: 'Matriarca do Tear',
        aliases: 'Mãe das galerias, velha tecedeira.',
        category: 'Artrópode · minichefe',
        habitat: 'Grande ninho nas cisternas quentes do andar 8, entre as galerias antigas e a subida para o castelo.',
        appearance: 'Aranha maior que as comuns, carapaça pálida coberta de poeira metálica e patas cicatrizadas. O abdômen tem marcas que lembram mapas de túneis.',
        behavior: 'Protege o ninho sem perseguir indefinidamente. Estende linhas de teia entre pontos da sala e convoca poucas aranhas jovens.',
        lore: 'As aranhas seguem as trilhas da Matriarca, não suas ordens. A seda do ninho guarda marcas das ferramentas da primeira expedição real. Goblins dizem que destruir o ninho derruba a mina; os mapas não confirmam a lenda.',
        stats: 'Base: 180 PV, dano escalonado a partir de 18, sem defesa especial, 24 velocidade e alcance de teia. Encontro fixo no andar 8.',
        attacks: 'Teia de captura: fio visível que prende por 1,7 s; recarga de 5 s. Salto de colapso: salto anunciado com alcance maior que o das aranhas comuns; recarga de 4 s. Ninhada: abaixo de 50% PV, convoca até duas aranhas jovens uma vez.',
        strategy: 'Contorne ou destrua as linhas antes que fechem a sala. Guarde o dash para o salto marcado e elimine as jovens quando surgirem.',
        drops: 'Comuns: seda grossa e moedas. Raro: pérola de quitina. Material: corda de seda para armadura ou mobilidade.',
        design: 'A sala começa silenciosa, com teias tremendo ao fundo. Música de cordas tensas; cada fio novo recebe som curto e localizado.',
        status: 'Minichefe jogável · andar 8'
    },
    {
        region: 'Sala do trono e fundação · andar 20',
        creatureType: 'throneGuardian',
        behaviorProfile: 'throneWarden',
        name: 'Guardião do Trono',
        aliases: 'Rei de pedra, último juramento.',
        category: 'Construto real · chefe final alternativo',
        habitat: 'Sala do trono no andar 20, diretamente sobre a antiga fundação das minas. Pode substituir o chefe final atual.',
        appearance: 'Armadura cerimonial sem corpo visível, unida por placas de basalto e veios de minério. A coroa está partida; no peito, uma cavidade luminosa pulsa com as forjas.',
        behavior: 'Alterna defesa e investidas. Na primeira fase imita as táticas dos guardas; na segunda usa o calor do veio e torna partes da arena temporariamente perigosas.',
        lore: 'O Guardião não é o rei, mas a armadura criada para sobreviver a ele. A coroa ordenou que defendesse o trono até o retorno da família; sem dinastia, o juramento virou um ciclo. Seu núcleo talvez ainda mantenha o veio ativo.',
        stats: 'Chefe final alternativo, escolhido em metade das partidas no andar 20. Vida, dano e velocidade usam a escala de chefe final; tem defesa equivalente aos outros chefes.',
        attacks: 'Juramento de aço: golpe corpo a corpo com as regras de ataque dos chefes. Pulso do veio: anel de energia que atinge a área próxima; fissuras acendem por 0,9 s antes do impacto. Na fase II, o anel alcança uma área maior e recarrega em 3,8 s.',
        strategy: 'Ataque o núcleo após o pulso, flanqueie o golpe frontal e mova-se entre áreas seguras. A fase II deve intensificar decisões, não tornar o dano inevitável.',
        drops: 'Comuns: moedas finais e fragmentos de basalto. Raro: núcleo da coroa. Recompensa narrativa: revelação da origem da contaminação.',
        design: 'A música mistura o tema do castelo e sons da forja subterrânea. Na derrota, a armadura cai e o som das forjas cessa gradualmente.',
        status: 'Chefe final alternativo jogável · andar 20'
    }
];

const bestiaryEntries = bestiaryDescriptions.map((description) => {
    const data = creatureDataByType[description.creatureType];
    if (!data) {
        throw new Error(`Dados ausentes para a criatura ${description.creatureType}.`);
    }
    return {
        ...description,
        ...data,
        name: description.name,
        region: description.region,
        displayCategory: description.category,
        aliases: description.aliases,
        habitat: description.habitat,
        appearance: description.appearance,
        behavior: description.behavior,
        lore: description.lore,
        strategy: description.strategy,
        design: description.design,
        status: description.status,
        editorialStats: description.stats,
        editorialAttacks: description.attacks,
        editorialDrops: description.drops,
        dropTable: data.drops
    };
});

const bestiaryEvents = [
    {
        id: 'crossed-hunt',
        floor: 3,
        spawnTypes: ['goblin', 'goblinRunner', 'spider', 'spider', 'spider'],
        participantIndexes: [0, 1, 2, 3, 4],
        title: 'A caçada atravessada',
        summary: 'Goblins e aranhas vão lutar entre si. Você pode observar, enfrentar qualquer grupo ou atravessar a sala enquanto eles se distraem.',
        description: 'No andar 3, dois goblins e três aranhas entram em conflito assim que a sala é alcançada. As duas raças atacam umas às outras; o jogador pode observar, atacar qualquer lado ou atravessar enquanto a luta distrai os inimigos. As eliminações ainda contam para a meta do andar.'
    },
    {
        id: 'cold-kitchen',
        floor: 12,
        spawnTypes: ['ashHound', 'troll', null, null],
        participantIndexes: [0, 1],
        title: 'A cozinha sem fogo',
        summary: 'Um cão de fuligem e um troll se enfrentam; os outros inimigos continuam hostis. Você pode escolher um lado ou contornar a briga.',
        description: 'No andar 12, um cão de fuligem e um troll contaminado começam a lutar na cozinha; os outros inimigos do piso continuam focados no jogador. É possível observar o confronto ou escolher qual dos dois enfraquecer primeiro, sem interromper a meta principal.'
    },
    {
        id: 'pointing-stained-glass',
        floor: 16,
        spawnTypes: ['stainedSentinel', 'ogre', 'troll', null],
        participantIndexes: [0, 1, 2],
        rewardScroll: 'conquista',
        title: 'O vitral que aponta para baixo',
        summary: 'Uma sentinela, um ogro e um troll disputam a galeria. Vença o grupo para revelar uma passagem secreta e um Pergaminho da Conquista.',
        description: 'No andar 16, uma Sentinela de vitral protege uma galeria ao lado de um ogro e um troll. Eles atacam uns aos outros até restar uma facção; derrotar o grupo revela uma passagem selada para a câmara secreta da Matriarca e um Pergaminho da Conquista no ponto do encontro.'
    }
];

const bestiaryNewContentEntries = [
    {
        type: 'Mob ativo · andares 1–4',
        name: 'Morcego do veio',
        region: 'Galerias baixas · andares 1–4',
        role: 'Inimigo aéreo comum que pressiona à distância sem bloquear corredores.',
        lore: 'Nidifica nas fendas aquecidas pelo veio. Seus chamados ecoam pelos túneis e denunciam a presença de criaturas próximas.',
        mechanic: 'Circula o jogador, anuncia um guincho e lança uma onda curta que pode ser evitada com movimento lateral. O guincho não causa dano.',
        reward: 'Drops ativos: moedas de cobre e fibra cavernícola.'
    },
    {
        type: 'Mob ativo · andares 5–9',
        name: 'Lagarto de basalto',
        region: 'Cisternas quentes · andares 5–9',
        role: 'Inimigo resistente que controla espaços estreitos.',
        lore: 'A carapaça mineral cresceu nos canais de lava resfriada; os goblins usam as marcas deixadas por ele para evitar poças instáveis.',
        mechanic: 'Placas frontais reduzem dano frontal. Um aviso de cauda antecede um arco de empurrão; atacar pelas costas contorna a proteção.',
        reward: 'Drops ativos: moedas, fragmentos de basalto e chance de placa de rocha aquecida.'
    },
    {
        type: 'Mob ativo · andares 10–14',
        name: 'Escriba sem rosto',
        region: 'Arquivo do castelo · andares 10–14',
        role: 'Conjurador de elite que transforma o piso em zonas de risco temporárias.',
        lore: 'Era responsável por copiar decretos da corte. Depois do colapso, continua escrevendo ordens que ninguém consegue ler.',
        mechanic: 'Marca uma área no chão antes de ativar um glifo de dano. O jogador pode sair do círculo ou interromper a conjuração durante o aviso.',
        reward: 'Drops ativos: moedas, sucata e chance de fragmento de lente.'
    },
    {
        type: 'NPC ativo · andares 3, 8 e 13',
        name: 'Lia, cartógrafa das galerias',
        region: 'Pontos seguros · andares 3, 8 e 13',
        role: 'Personagem neutra que oferece informação de exploração.',
        lore: 'Lia registra rotas seguras e compara mapas recuperados com as marcas das antigas expedições.',
        mechanic: 'Pressione G perto de Lia e escolha entregar um mapa rabiscado ou pagar 4 moedas de cobre. Ela informa a direção da saída, sem revelar a sala exata.',
        reward: 'Uma pista por andar atendido; usa um mapa rabiscado ou 4 moedas de cobre.'
    },
    {
        type: 'NPC ativo · andares 6, 11 e 16',
        name: 'Oren, ferreiro itinerante',
        region: 'Acampamentos abandonados · andares 6, 11 e 16',
        role: 'Ferreiro experiente. Combina materiais para criar equipamentos e componentes.',
        lore: 'Oren herdou as ferramentas dos ferreiros da coroa e adaptou uma pequena forja itinerante para trabalhar longe dos inimigos. A bigorna e a fornalha acompanham suas paradas nos acampamentos abandonados.',
        mechanic: 'Pressione G perto de Oren e escolha Forjar. Selecione os materiais e as quantidades: receitas Iguais usam 2 ou 3 unidades de um ingrediente; receitas Mix combinam dois ingredientes diferentes, uma unidade de cada, em qualquer ordem. Confira a prévia antes de confirmar. A forja usa as 87 receitas do catálogo, e itens criados também podem servir de ingrediente em receitas seguintes.',
        reward: 'O resultado depende da receita escolhida. A forja é gratuita e instantânea por padrão; custos e dificuldade podem ser ativados na configuração do ferreiro.'
    },
    {
        type: 'NPC ativo · andares 9 e 15',
        name: 'Nara, vigia das lanternas',
        region: 'Transição entre mina e castelo · andares 9 e 15',
        role: 'Guia de combate e personagem de apoio.',
        lore: 'Nara mantinha as lanternas de sinalização acesas para que mineiros e guardas pudessem se encontrar durante os desabamentos.',
        mechanic: 'Pressione G perto de Nara para iniciar o desafio e use a arrancada (Shift + direção) para esquivar de três ataques anunciados.',
        reward: 'Desafio opcional; concede 5 moedas de cobre e nunca bloqueia a saída.'
    }
];

let creatureAudioContext = null;

function playCreatureSound(creatureType, event) {
    const creature = creatureDataByType[creatureType];
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    if (!creature || !AudioContextConstructor) {
        return;
    }
    if (!creatureAudioContext) {
        creatureAudioContext = new AudioContextConstructor();
    }
    if (creatureAudioContext.state === 'suspended') {
        creatureAudioContext.resume().catch((error) => {
            console.error('Não foi possível iniciar o áudio da criatura.', error);
        });
    }
    const frequencyMultiplier = event === 'warning' ? 1.8
        : event === 'hit' ? 0.72 : event === 'death' ? 0.48 : 1.25;
    const duration = event === 'warning' ? 0.16 : event === 'death' ? 0.24 : 0.1;
    const oscillator = creatureAudioContext.createOscillator();
    const gain = creatureAudioContext.createGain();
    const startTime = creatureAudioContext.currentTime;
    oscillator.type = creature.sound.wave;
    oscillator.frequency.setValueAtTime(creature.sound.frequency * frequencyMultiplier, startTime);
    oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(25, creature.sound.frequency * frequencyMultiplier * (event === 'warning' ? 1.2 : 0.62)),
        startTime + duration
    );
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(event === 'warning' ? 0.035 : 0.025, startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    oscillator.connect(gain);
    gain.connect(creatureAudioContext.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
}

function isCreatureSpawnAllowed(creature, floor) {
    return creature.spawn.floors.some((range) => (
        Array.isArray(range)
            ? floor >= range[0] && floor <= range[1]
            : floor === range
    ));
}

function getCreatureAttackData(enemy, attackId) {
    const creature = creatureDataByType[enemy.creatureType || enemy.bossType];
    if (!creature) {
        throw new Error(`Dados ausentes para o inimigo ${enemy.creatureType || enemy.bossType}.`);
    }
    const attack = creature.attacks.find((entry) => entry.id === attackId);
    if (!attack) {
        throw new Error(`Ataque ${attackId} não cadastrado para ${creature.name}.`);
    }
    return attack;
}

function getCreatureScaledStat(creatureType, stat, floor) {
    const creature = creatureDataByType[creatureType];
    if (!creature || !Number.isFinite(creature.stats[stat])) {
        throw new Error(`Atributo ${stat} ausente nos dados de ${creatureType}.`);
    }
    if (stat === 'health') {
        const baselineFloor = creature.floors.min;
        const scale = 1 + Math.max(0, floor - baselineFloor)
            * GAME_BALANCE.enemies.healthScalingPerFloor;
        return Math.round(creature.stats.health * scale);
    }
    if (stat === 'damage') {
        const baselineFloor = creature.floors.min;
        const scale = 1 + Math.max(0, floor - baselineFloor)
            * GAME_BALANCE.enemies.damageScalingPerFloor;
        return Math.round(creature.stats.damage * scale);
    }

    return creature.stats[stat];
}

function getFloorKillGoal(floor) {
    const band = floor === finalFloor
        ? GAME_BALANCE.enemies.killGoalsByFiveFloorBand.length - 1
        : Math.floor((floor - 1) / 5);
    const goal = GAME_BALANCE.enemies.killGoalsByFiveFloorBand[band];
    if (!Number.isInteger(goal) || goal < 1) {
        throw new Error(`Meta de inimigos não configurada para o andar ${floor}.`);
    }
    return goal;
}
