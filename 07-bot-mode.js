let botDecisionTimer = 0;
let botAlignmentTarget = null;
let botPerceptionTimer = 0;
let botMemorySaveTimer = 0;
let botStatusUpdateTimer = 0;
let botSpeedMultiplier = 1;
const botSpeedOptions = [1, 2, 4, 10];
const botMemoryStorageKey = 'masmorra.bot-learning.v1';
const botMemoryVersion = 3;
const botMemoryMaxBytes = 512 * 1024;
const botRunMemoryLimit = 40;
const botSystemReportLimit = 80;
const botWeaponTypes = ['bow', 'sword', 'spear'];
const botTacticTypes = ['ranged', 'reach', 'melee', 'flank', 'evasive'];
const botNavigationDirections = [
    [0, -1], [1, 0], [0, 1], [-1, 0],
    [1, -1], [1, 1], [-1, 1], [-1, -1]
];
let botNavigationCosts = new Float64Array(0);
let botNavigationWalkability = new Uint8Array(0);
let botMemoryError = '';
let botMemoryNeedsSave = false;
let botRetreatState = {
    active: false,
    enemy: null,
    elapsed: 0,
    cooldown: 0,
    consecutive: 0,
    lastAttemptKey: ''
};
let botObjectQuietTime = 0;
let botObjectAttackInterval = 0;
let botObjectsAttackedInInterval = 0;
let botObjectLastAttemptKey = '';
let botStuckTimer = 0;
let botLastPosition = null;

function warnInvalidBotParameters() {
    const retreat = GAME_BALANCE.bot.retreat;
    const objects = GAME_BALANCE.bot.objects;
    const objectChances = GAME_BALANCE.bot.objects.baseChancePercent;
    for (const [name, chance] of Object.entries({
        retreatBase: retreat.baseChancePercent,
        retreatMaximum: retreat.maximumChancePercent,
        ...Object.fromEntries(Object.entries(objectChances).map(([key, value]) => [
            `object.${key}`,
            value
        ]))
    })) {
        if (!Number.isFinite(chance) || chance < 0 || chance > 100) {
            console.warn(`[Bot] Chance inválida em GAME_BALANCE.bot (${name}): ${chance}.`);
        }
    }
    for (const [name, value, minimum, maximum] of [
        ['lowHealthRatio', retreat.lowHealthRatio, 0, 1],
        ['returnHealthRatio', retreat.returnHealthRatio, 0, 1],
        ['bossChanceMultiplier', retreat.bossChanceMultiplier, 0, 1],
        ['severityCurve', retreat.severityCurve, Number.EPSILON, Infinity],
        ['cooldownSeconds', retreat.cooldownSeconds, 0, Infinity],
        ['maximumConsecutiveRetreats', retreat.maximumConsecutiveRetreats, 1, Infinity],
        ['minimumDurationSeconds', retreat.minimumDurationSeconds, 0, Infinity],
        ['perceptionDistance', objects.perceptionDistance, 1, Infinity],
        ['immediateThreatDistance', objects.immediateThreatDistance, 1, Infinity],
        ['intervalSeconds', objects.intervalSeconds, Number.EPSILON, Infinity],
        ['attacksPerInterval', objects.attacksPerInterval, 1, Infinity]
    ]) {
        if (!Number.isFinite(value) || value < minimum || value > maximum) {
            console.warn(`[Bot] Parâmetro inválido em GAME_BALANCE.bot (${name}): ${value}.`);
        }
    }
    if (retreat.maximumChancePercent < retreat.baseChancePercent
        || retreat.returnHealthRatio <= retreat.lowHealthRatio) {
        console.warn('[Bot] Confira os limites de chance e a histerese em GAME_BALANCE.bot.retreat.');
    }
}

warnInvalidBotParameters();

function createEmptyEnemyStrategy() {
    return {
        encounters: 0,
        defeats: 0,
        damageDealt: 0,
        damageReceived: 0,
        weapons: Object.fromEntries(botWeaponTypes.map((weapon) => [weapon, {
            attempts: 0,
            hits: 0,
            damage: 0
        }])),
        tactics: Object.fromEntries(botTacticTypes.map((tactic) => [tactic, {
            attempts: 0,
            hits: 0,
            damage: 0
        }])),
        preferredWeapon: null,
        preferredTactic: null
    };
}

function createEmptyBotMemory() {
    return {
        version: botMemoryVersion,
        matches: 0,
        victories: 0,
        bestFloor: 0,
        totalBowHits: 0,
        totalSwordHits: 0,
        totalSpearHits: 0,
        totalBowAttempts: 0,
        totalBowMisses: 0,
        totalSwordAttempts: 0,
        totalSwordMisses: 0,
        totalSpearAttempts: 0,
        totalSpearMisses: 0,
        totalBlockedHits: 0,
        totalShieldAbsorbed: 0,
        totalRouteSteps: 0,
        totalRouteRevisits: 0,
        totalDamage: 0,
        preferredRange: 22,
        flankSign: 1,
        floorStats: {},
        roomStats: {},
        enemyStrategies: Object.fromEntries(
            creatureData.map((creature) => [creature.creatureType, createEmptyEnemyStrategy()])
        ),
        runs: [],
        latestSystemReport: null,
        systemReports: []
    };
}

function normalizeBotMemory(parsed) {
    if (
        !parsed
        || typeof parsed !== 'object'
        || Array.isArray(parsed)
        || ![1, 2, botMemoryVersion].includes(parsed.version)
    ) {
        throw new Error('Versão de memória inválida ou não suportada.');
    }
    for (const field of ['matches', 'victories', 'bestFloor']) {
        if (!Number.isSafeInteger(parsed[field]) || parsed[field] < 0) {
            throw new Error(`Campo obrigatório "${field}" ausente ou inválido.`);
        }
    }
    if (parsed.version < botMemoryVersion
        && (!parsed.maps || typeof parsed.maps !== 'object' || Array.isArray(parsed.maps))) {
        throw new Error('A memória antiga não contém o campo obrigatório "maps".');
    }
    if (parsed.version === botMemoryVersion
        && (!parsed.floorStats || typeof parsed.floorStats !== 'object'
            || Array.isArray(parsed.floorStats)
            || !parsed.roomStats || typeof parsed.roomStats !== 'object'
            || Array.isArray(parsed.roomStats)
            || !parsed.enemyStrategies || typeof parsed.enemyStrategies !== 'object'
            || Array.isArray(parsed.enemyStrategies))) {
        throw new Error('A memória v3 não contém as estatísticas obrigatórias.');
    }
    if (parsed.version === 2
        && (!Array.isArray(parsed.runs) || !Array.isArray(parsed.systemReports))) {
        throw new Error('A memória v2 não contém o histórico obrigatório de partidas e relatórios.');
    }
    if (parsed.runs !== undefined && !Array.isArray(parsed.runs)) {
        throw new Error('O campo "runs" precisa ser uma lista.');
    }
    if (parsed.systemReports !== undefined && !Array.isArray(parsed.systemReports)) {
        throw new Error('O campo "systemReports" precisa ser uma lista.');
    }
    for (const field of [
        'totalBowHits', 'totalSwordHits', 'totalSpearHits',
        'totalBowAttempts', 'totalBowMisses', 'totalSwordAttempts',
        'totalSwordMisses', 'totalSpearAttempts', 'totalSpearMisses',
        'totalBlockedHits', 'totalShieldAbsorbed', 'totalRouteSteps',
        'totalRouteRevisits', 'totalDamage'
    ]) {
        if (parsed[field] !== undefined
            && (!Number.isFinite(parsed[field]) || parsed[field] < 0)) {
            throw new Error(`Campo "${field}" contém um valor inválido.`);
        }
    }
    if (parsed.version === botMemoryVersion) {
        for (const field of [
            'totalBowHits', 'totalSwordHits', 'totalSpearHits',
            'totalBowAttempts', 'totalBowMisses', 'totalSwordAttempts',
            'totalSwordMisses', 'totalSpearAttempts', 'totalSpearMisses',
            'totalBlockedHits', 'totalShieldAbsorbed', 'totalRouteSteps',
            'totalRouteRevisits', 'totalDamage'
        ]) {
            if (!Number.isFinite(parsed[field]) || parsed[field] < 0) {
                throw new Error(`Campo obrigatório "${field}" ausente ou inválido.`);
            }
        }
        if (!Number.isFinite(parsed.preferredRange)
            || parsed.preferredRange < 0
            || parsed.preferredRange > 138
            || ![-1, 1].includes(parsed.flankSign)
            || !Object.prototype.hasOwnProperty.call(parsed, 'latestSystemReport')) {
            throw new Error('As preferências ou o relatório recente da memória v3 são inválidos.');
        }
    }
    const runs = parsed.runs || [];
    if (runs.some((run) => (
        !run
        || typeof run !== 'object'
        || !Number.isFinite(run.floor)
        || !Number.isFinite(run.performanceScore)
        || !Number.isFinite(run.damageTaken)
    ))) {
        throw new Error('A lista "runs" contém uma partida inválida.');
    }
    const systemReports = parsed.systemReports || [];
    if (systemReports.some((report) => (
        !report
        || typeof report !== 'object'
        || !Number.isFinite(report.floor)
        || !Number.isFinite(report.opportunities)
        || typeof report.review !== 'string'
        || typeof report.advice !== 'string'
    ))) {
        throw new Error('A lista "systemReports" contém um relatório inválido.');
    }
    const latestSystemReport = parsed.latestSystemReport ?? systemReports[systemReports.length - 1] ?? null;
    if (latestSystemReport !== null
        && (!latestSystemReport
            || !Number.isFinite(latestSystemReport.floor)
            || typeof latestSystemReport.advice !== 'string')) {
        throw new Error('O campo "latestSystemReport" é inválido.');
    }

    const floorStats = {};
    if (parsed.version === botMemoryVersion) {
        for (const [floor, stats] of Object.entries(parsed.floorStats)) {
            if (!/^(?:[1-9]|1\d|20)$/.test(floor)
                || !stats || typeof stats !== 'object' || Array.isArray(stats)) {
                throw new Error('As estatísticas por andar contêm uma entrada inválida.');
            }
            floorStats[floor] = normalizeBotStatRecord(stats, [
                'runs', 'clears', 'totalDamage', 'totalClearTimeSeconds',
                'roomVisits', 'enemyRooms', 'portalRooms', 'trapRooms'
            ], `andar ${floor}`);
        }
    }

    const roomStats = {};
    if (parsed.version === botMemoryVersion) {
        for (const [floor, rooms] of Object.entries(parsed.roomStats)) {
            if (!/^(?:[1-9]|1\d|20)$/.test(floor)
                || !rooms || typeof rooms !== 'object' || Array.isArray(rooms)
                || Object.keys(rooms).length > 32) {
                throw new Error('As estatísticas por sala contêm uma entrada inválida.');
            }
            roomStats[floor] = {};
            for (const [roomType, stats] of Object.entries(rooms)) {
                if (!/^[a-z][a-z0-9_-]{0,31}$/.test(roomType)
                    || !stats || typeof stats !== 'object' || Array.isArray(stats)) {
                    throw new Error('As estatísticas contêm um tipo de sala inválido.');
                }
                roomStats[floor][roomType] = normalizeBotStatRecord(stats, [
                    'visits', 'roomsWithEnemies', 'portals', 'trapRooms',
                    'totalDamageReceived', 'totalClearTimeSeconds', 'clears'
                ], `sala ${roomType}`);
            }
        }
    }

    const enemyStrategies = createEmptyBotMemory().enemyStrategies;
    if (parsed.version === botMemoryVersion) {
        const validTypes = new Set(creatureData.map((creature) => creature.creatureType));
        if (Object.keys(parsed.enemyStrategies).some((type) => !validTypes.has(type))) {
            throw new Error('As estratégias contêm uma criatura desconhecida.');
        }
        for (const creature of creatureData) {
            const strategy = parsed.enemyStrategies[creature.creatureType];
            if (!strategy || typeof strategy !== 'object' || Array.isArray(strategy)) {
                throw new Error(`Faltam dados da criatura "${creature.creatureType}".`);
            }
            if (!strategy.weapons || typeof strategy.weapons !== 'object'
                || !strategy.tactics || typeof strategy.tactics !== 'object') {
                throw new Error(`Faltam estatísticas de arma ou tática para "${creature.creatureType}".`);
            }
            const normalized = {
                ...createEmptyEnemyStrategy(),
                ...normalizeBotStatRecord(strategy, [
                    'encounters', 'defeats', 'damageDealt', 'damageReceived'
                ], `criatura ${creature.creatureType}`)
            };
            for (const weapon of botWeaponTypes) {
                if (!strategy.weapons[weapon]) {
                    throw new Error(`Faltam dados da arma "${weapon}" contra "${creature.creatureType}".`);
                }
                normalized.weapons[weapon] = normalizeBotStatRecord(
                    strategy.weapons[weapon],
                    ['attempts', 'hits', 'damage'],
                    `arma ${weapon} contra ${creature.creatureType}`
                );
            }
            for (const tactic of botTacticTypes) {
                if (!strategy.tactics[tactic]) {
                    throw new Error(`Faltam dados da tática "${tactic}" contra "${creature.creatureType}".`);
                }
                normalized.tactics[tactic] = normalizeBotStatRecord(
                    strategy.tactics[tactic],
                    ['attempts', 'hits', 'damage'],
                    `tática ${tactic} contra ${creature.creatureType}`
                );
            }
            normalized.preferredWeapon = botWeaponTypes.includes(strategy.preferredWeapon)
                ? strategy.preferredWeapon
                : null;
            normalized.preferredTactic = botTacticTypes.includes(strategy.preferredTactic)
                ? strategy.preferredTactic
                : null;
            enemyStrategies[creature.creatureType] = normalized;
        }
    }

    const memory = {
        ...createEmptyBotMemory(),
        ...parsed,
        version: botMemoryVersion,
        floorStats,
        roomStats,
        enemyStrategies,
        runs: runs.slice(-botRunMemoryLimit),
        latestSystemReport,
        systemReports: systemReports.slice(-botSystemReportLimit)
    };
    delete memory.maps;
    return { memory, migrated: parsed.version < botMemoryVersion };
}

function normalizeBotStatRecord(record, fields, label) {
    const normalized = {};
    for (const field of fields) {
        const value = record[field] ?? 0;
        if (!Number.isFinite(value) || value < 0) {
            throw new Error(`Estatística "${field}" inválida em ${label}.`);
        }
        normalized[field] = value;
    }
    return normalized;
}

function loadBotMemory() {
    try {
        const stored = localStorage.getItem(botMemoryStorageKey);
        if (!stored) {
            return createEmptyBotMemory();
        }
        if (new Blob([stored]).size > botMemoryMaxBytes) {
            throw new Error('A memória local excede o limite de 512 KiB.');
        }
        const { memory, migrated } = normalizeBotMemory(JSON.parse(stored));
        botMemoryNeedsSave = migrated;
        return memory;
    } catch (error) {
        botMemoryError = 'Memória local indisponível; o aprendizado vale só nesta partida.';
        console.error('Não foi possível carregar a memória local do Bot IA.', error);
        return createEmptyBotMemory();
    }
}

let botPersistentMemory = loadBotMemory();
if (botMemoryNeedsSave) {
    saveBotMemory();
    botMemoryNeedsSave = false;
}

window.botDebug = {
    enabled: true,
    storageKey: botMemoryStorageKey,
    getStoredMemory() {
        const raw = localStorage.getItem(this.storageKey);
        try {
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            console.error('Erro ao ler a memória do bot em localStorage.', error);
            return null;
        }
    },
    summarizeMemory() {
        const memory = this.getStoredMemory() || botPersistentMemory;
        const floorsLearned = memory.floorStats ? Object.keys(memory.floorStats).length : 0;
        const roomTypesLearned = memory.roomStats
            ? Object.values(memory.roomStats).reduce(
                (total, floor) => total + Object.keys(floor).length,
                0
            )
            : 0;
        return {
            matches: memory.matches || 0,
            victories: memory.victories || 0,
            bestFloor: memory.bestFloor || 0,
            floorsLearned,
            roomTypesLearned,
            enemyTypesLearned: memory.enemyStrategies
                ? Object.keys(memory.enemyStrategies).length
                : 0,
            runs: Array.isArray(memory.runs) ? memory.runs.length : 0,
            systemReports: Array.isArray(memory.systemReports) ? memory.systemReports.length : 0,
            latestSystemReport: memory.latestSystemReport || null,
            bowAttempts: memory.totalBowAttempts || 0,
            bowMisses: memory.totalBowMisses || 0,
            swordAttempts: memory.totalSwordAttempts || 0,
            swordMisses: memory.totalSwordMisses || 0,
            spearAttempts: memory.totalSpearAttempts || 0,
            spearMisses: memory.totalSpearMisses || 0,
            shieldAbsorbed: memory.totalShieldAbsorbed || 0,
            routeSteps: memory.totalRouteSteps || 0,
            routeRevisits: memory.totalRouteRevisits || 0,
            bowAccuracy: memory.totalBowAttempts
                ? Math.round((memory.totalBowHits || 0) / memory.totalBowAttempts * 100)
                : 0,
            swordAccuracy: memory.totalSwordAttempts
                ? Math.round((memory.totalSwordHits || 0) / memory.totalSwordAttempts * 100)
                : 0,
            spearAccuracy: memory.totalSpearAttempts
                ? Math.round((memory.totalSpearHits || 0) / memory.totalSpearAttempts * 100)
                : 0,
            preferredRange: memory.preferredRange || 22,
            flankSign: memory.flankSign || 1,
            memoryError: botMemoryError || ''
        };
    },
    dump() {
        const snapshot = {
            currentFloor,
            gameState,
            botMode,
            loop: {
                decisionTimer: botDecisionTimer,
                perceptionTimer: botPerceptionTimer,
                memorySaveTimer: botMemorySaveTimer
            },
            learning: botLearning ? {
                ...botLearning,
                shopFloors: Array.from(botLearning.shopFloors || [])
            } : null,
            persistentMemory: this.summarizeMemory(),
            raw: this.getStoredMemory()
        };
        console.table({
            partida: snapshot.currentFloor,
            estado: snapshot.gameState,
            botMode: snapshot.botMode,
            andaresAprendidos: snapshot.persistentMemory.floorsLearned,
            tiposDeSalaAprendidos: snapshot.persistentMemory.roomTypesLearned,
            vitórias: snapshot.persistentMemory.victories,
            melhorAndar: snapshot.persistentMemory.bestFloor
        });
        console.log('Diagnóstico do bot:', snapshot);
        return snapshot;
    },
    resetMemory() {
        const emptyMemory = createEmptyBotMemory();
        localStorage.setItem(this.storageKey, JSON.stringify(emptyMemory));
        botPersistentMemory = emptyMemory;
        botMemoryError = '';
        console.info('Memória do bot resetada.', emptyMemory);
        return emptyMemory;
    },
    state() {
        return {
            enabled: this.enabled,
            mode: botMode ? 'bot' : 'manual',
            floor: currentFloor,
            learning: botLearning,
            memory: this.summarizeMemory()
        };
    }
};

console.info('[botDebug] Disponível em window.botDebug. Use window.botDebug.dump() para inspecionar o bot.');

function saveBotMemory() {
    try {
        const serialized = JSON.stringify(botPersistentMemory);
        if (new Blob([serialized]).size > botMemoryMaxBytes) {
            throw new Error('A memória excede o limite de 512 KiB.');
        }
        localStorage.setItem(botMemoryStorageKey, serialized);
        botMemoryError = '';
        return true;
    } catch (error) {
        botMemoryError = 'Falha ao salvar memória local do bot.';
        console.error('Não foi possível salvar a memória local do Bot IA.', error);
        return false;
    }
}

function exportBotMemory() {
    const serialized = JSON.stringify(botPersistentMemory, null, 2);
    if (new Blob([serialized]).size > botMemoryMaxBytes) {
        throw new Error('A memória excede o limite de exportação de 512 KiB.');
    }
    return serialized;
}

function importBotMemory(serializedMemory) {
    if (typeof serializedMemory !== 'string' || new Blob([serializedMemory]).size > botMemoryMaxBytes) {
        throw new Error('Arquivo de memória excede o limite de 512 KiB.');
    }
    let parsed;
    try {
        parsed = JSON.parse(serializedMemory);
    } catch (error) {
        throw new Error(`O arquivo não contém JSON válido: ${error.message}`);
    }
    const { memory } = normalizeBotMemory(parsed);
    const normalized = JSON.stringify(memory);
    if (new Blob([normalized]).size > botMemoryMaxBytes) {
        throw new Error('A memória normalizada excede o limite de 512 KiB.');
    }
    localStorage.setItem(botMemoryStorageKey, normalized);
    botPersistentMemory = memory;
    botMemoryError = '';
    botMemoryNeedsSave = false;
    updateBotMemoryStatus();
}

function getBotRoomType(roomIndex, room) {
    const exitRoomIndex = botGetRoomIndexAt(
        (exitPosition.x + 0.5) * tileSize,
        (exitPosition.y + 0.5) * tileSize
    );
    if (roomIndex === exitRoomIndex) {
        return 'portal';
    }
    if (roomIndex === 0) {
        return 'entrance';
    }
    if (bossArenaBounds) {
        const centerX = (room.x + room.width / 2);
        const centerY = (room.y + room.height / 2);
        if (
            centerX >= bossArenaBounds.left
            && centerX <= bossArenaBounds.right
            && centerY >= bossArenaBounds.top
            && centerY <= bossArenaBounds.bottom
        ) {
            return 'boss_arena';
        }
    }
    if (room.role) {
        return `role_${room.role}`;
    }
    if (Math.min(room.width, room.height) <= 4) {
        return 'corridor';
    }
    return 'standard';
}

function getBotRoomObservationAt(roomIndex, room) {
    const floor = currentFloor;
    const floorObservation = botLearning.currentFloorObservation;
    const roomKey = `${floor}:${roomIndex}`;
    if (!floorObservation.rooms[roomKey]) {
        const roomType = getBotRoomType(roomIndex, room);
        floorObservation.rooms[roomKey] = {
            roomType,
            enteredAt: performance.now(),
            damageReceived: 0,
            enemyTypes: {},
            enemiesAtEntry: 0,
            portalObserved: false,
            hasTraps: false,
            clearTimeSeconds: null,
            cleared: false
        };
        botLearning.roomVisitCounts[roomIndex] = (
            botLearning.roomVisitCounts[roomIndex] || 0
        ) + 1;
    }
    return floorObservation.rooms[roomKey];
}

function getBotEnemyRoomIndex(enemy) {
    return botGetRoomIndexAt(
        enemy.x + enemy.size / 2,
        enemy.y + enemy.size / 2
    );
}

function getBotRoomTrapCount(room) {
    const isInRoom = (x, y) => (
        x >= room.x * tileSize
        && x < (room.x + room.width) * tileSize
        && y >= room.y * tileSize
        && y < (room.y + room.height) * tileSize
    );
    let count = 0;
    for (const enemy of enemies) {
        for (const hazard of [
            ...(enemy.lavaPools || []),
            ...(enemy.eruptions || []),
            ...(enemy.thrownRocks || []).filter((rock) => rock.phase === 'landed')
        ]) {
            if (isInRoom(hazard.x, hazard.y)) {
                count += 1;
            }
        }
    }
    return count;
}

function recordBotRoomProgress() {
    if (!botMode || !botLearning) {
        return;
    }
    const floor = currentFloor;
    let floorObservation = botLearning.currentFloorObservation;
    if (!floorObservation || floorObservation.floor !== floor) {
        if (floorObservation) {
            finalizeBotFloorObservation(false);
        }
        botLearning.roomVisitCounts = {};
        botLearning.currentRoomObservation = null;
        botLearning.lastRouteTile = null;
        botLearning.visitedRooms.clear();
        botLearning.seenEnemies.clear();
        botLearning.explorationTargetRoom = null;
        botLearning.explorationFloor = floor;
        floorObservation = {
            floor,
            startedAt: performance.now(),
            damageReceived: 0,
            rooms: {},
            finalized: false
        };
        botLearning.currentFloorObservation = floorObservation;
    }

    const playerX = player.x + player.size / 2;
    const playerY = player.y + player.size / 2;
    const roomIndex = botGetRoomIndexAt(playerX, playerY);
    if (roomIndex < 0) {
        botLearning.currentRoomObservation = null;
        return;
    }
    const room = dungeonRooms[roomIndex];
    const observation = getBotRoomObservationAt(roomIndex, room);
    botLearning.currentRoomObservation = observation;
    const roomEnemies = enemies.filter((enemy) => (
        enemy.health > 0
        && !enemy.dying
        && getBotEnemyRoomIndex(enemy) === roomIndex
    ));
    for (const enemy of roomEnemies) {
        const type = enemy.creatureType || enemy.bossType;
        if (type && botLearning.seenEnemies.has(enemy)) {
            observation.enemyTypes[type] = true;
        }
    }
    observation.enemiesAtEntry = Math.max(
        observation.enemiesAtEntry,
        Object.keys(observation.enemyTypes).length
    );
    observation.portalObserved ||= portalUnlocked && roomIndex === botGetRoomIndexAt(
        (exitPosition.x + 0.5) * tileSize,
        (exitPosition.y + 0.5) * tileSize
    );
    observation.hasTraps ||= getBotRoomTrapCount(room) > 0;
    if (observation.enemiesAtEntry > 0 && roomEnemies.length === 0 && !observation.cleared) {
        observation.cleared = true;
        observation.clearTimeSeconds = (performance.now() - observation.enteredAt) / 1000;
    }
}

function finalizeBotFloorObservation(floorCleared) {
    if (!botLearning) {
        return;
    }
    const observation = botLearning.currentFloorObservation;
    if (!observation || observation.finalized) {
        return;
    }
    observation.finalized = true;
    const rooms = Object.values(observation.rooms);
    const floorKey = String(observation.floor);
    const floorStats = botPersistentMemory.floorStats[floorKey]
        || (botPersistentMemory.floorStats[floorKey] = {
            runs: 0,
            clears: 0,
            totalDamage: 0,
            totalClearTimeSeconds: 0,
            roomVisits: 0,
            enemyRooms: 0,
            portalRooms: 0,
            trapRooms: 0
        });
    floorStats.runs += 1;
    floorStats.clears += floorCleared ? 1 : 0;
    floorStats.totalDamage += observation.damageReceived;
    if (floorCleared) {
        floorStats.totalClearTimeSeconds += (performance.now() - observation.startedAt) / 1000;
    }
    floorStats.roomVisits += rooms.length;
    floorStats.enemyRooms += rooms.filter((room) => room.enemiesAtEntry > 0).length;
    floorStats.portalRooms += rooms.filter((room) => room.portalObserved).length;
    floorStats.trapRooms += rooms.filter((room) => room.hasTraps).length;

    const roomStatsForFloor = botPersistentMemory.roomStats[floorKey]
        || (botPersistentMemory.roomStats[floorKey] = {});
    for (const room of rooms) {
        const stats = roomStatsForFloor[room.roomType]
            || (roomStatsForFloor[room.roomType] = {
                visits: 0,
                roomsWithEnemies: 0,
                portals: 0,
                trapRooms: 0,
                totalDamageReceived: 0,
                totalClearTimeSeconds: 0,
                clears: 0
            });
        stats.visits += 1;
        stats.roomsWithEnemies += room.enemiesAtEntry > 0 ? 1 : 0;
        stats.portals += room.portalObserved ? 1 : 0;
        stats.trapRooms += room.hasTraps ? 1 : 0;
        stats.totalDamageReceived += room.damageReceived;
        stats.totalClearTimeSeconds += room.clearTimeSeconds || 0;
        stats.clears += room.cleared ? 1 : 0;
    }
    saveBotMemory();
}

function botDiscoverEnvironment(forceSave = false) {
    if (!botMode || !botLearning) {
        return;
    }
    recordBotRoomProgress();
    botMemorySaveTimer -= botLearning.lastPerceptionDelta || 0;
    if (forceSave || botMemorySaveTimer <= 0) {
        saveBotMemory();
        botMemorySaveTimer = 1.5;
    }
}

function calculateBotPerformanceScore() {
    const hitCount = botLearning.bowHits + botLearning.swordHits + botLearning.spearHits;
    const combatEfficiency = hitCount + botLearning.blockedHits > 0
        ? hitCount / (hitCount + botLearning.blockedHits)
        : 0.5;
    const floorProgress = botLearning.completed
        ? 1
        : Math.min(
            1,
            (currentFloor - 1 + (currentFloor < finalFloor ? floorKillCount / floorKillGoal : 0)) / finalFloor
        );
    const evaluatedFloors = botLearning.completed
        ? finalFloor
        : Math.max(1, currentFloor);
    const averageDamageRatio = getBotAverageFloorDamagePercent(
        botLearning.floorDamageHealthRatio,
        evaluatedFloors
    ) / 100;
    const survival = 1 - Math.min(1, averageDamageRatio);
    return Math.round(floorProgress * 40 + combatEfficiency * 30 + survival * 30);
}

function getBotAverageFloorDamagePercent(floorDamageHealthRatio, floors) {
    const totalDamageRatio = Object.values(floorDamageHealthRatio)
        .reduce((total, ratio) => total + (Number.isFinite(ratio) ? ratio : 0), 0);
    return totalDamageRatio / Math.max(1, floors) * 100;
}

function getBotHighDamageFloors(floorDamageHealthRatio) {
    return Object.entries(floorDamageHealthRatio)
        .filter(([, ratio]) => Number.isFinite(ratio) && ratio >= 0.25)
        .map(([floor]) => Number(floor))
        .sort((first, second) => first - second);
}

function getBotHighDamageFloorAdvice(floorDamageHealthRatio) {
    const floors = getBotHighDamageFloors(floorDamageHealthRatio);
    if (floors.length === 0) {
        return null;
    }
    const floorList = floors.join(', ');
    return `Reforce poções, armadura e escudo antes dos andares ${floorList}, onde o dano proporcional foi alto.`;
}

function getBotDifficultyRating(averageFloorDamagePercent, hardestFloorDamageRatio) {
    if (averageFloorDamagePercent >= 35 || hardestFloorDamageRatio >= 0.75) {
        return 'Muito alta';
    }
    if (averageFloorDamagePercent >= 20 || hardestFloorDamageRatio >= 0.5) {
        return 'Desafiadora';
    }
    if (averageFloorDamagePercent >= 10 || hardestFloorDamageRatio >= 0.25) {
        return 'Moderada';
    }
    return 'Leve';
}

function mergeBotEnemyStrategyStats() {
    for (const creature of creatureData) {
        const type = creature.creatureType;
        const learned = botLearning.enemyStrategyStats[type];
        const saved = botPersistentMemory.enemyStrategies[type];
        saved.encounters += learned.encounters;
        saved.defeats += learned.defeats;
        saved.damageDealt += learned.damageDealt;
        saved.damageReceived += learned.damageReceived;
        for (const weapon of botWeaponTypes) {
            for (const field of ['attempts', 'hits', 'damage']) {
                saved.weapons[weapon][field] += learned.weapons[weapon][field];
            }
        }
        for (const tactic of botTacticTypes) {
            for (const field of ['attempts', 'hits', 'damage']) {
                saved.tactics[tactic][field] += learned.tactics[tactic][field];
            }
        }
        const bestWeapon = botWeaponTypes
            .filter((weapon) => saved.weapons[weapon].attempts > 0)
            .sort((first, second) => (
                saved.weapons[second].damage / saved.weapons[second].attempts
                - saved.weapons[first].damage / saved.weapons[first].attempts
            ))[0];
        const bestTactic = botTacticTypes
            .filter((tactic) => saved.tactics[tactic].attempts > 0)
            .sort((first, second) => (
                saved.tactics[second].damage / saved.tactics[second].attempts
                - saved.tactics[first].damage / saved.tactics[first].attempts
            ))[0];
        saved.preferredWeapon = bestWeapon || null;
        saved.preferredTactic = bestTactic || null;
    }
}

function getBotAdvice(learning = botLearning) {
    const advice = [];
    const weapons = [
        ['arco', learning.bowHits, learning.bowAttempts],
        ['espada', learning.swordHits, learning.swordAttempts],
        ['lança', learning.spearHits, learning.spearAttempts]
    ].filter(([, , attempts]) => attempts > 0);
    if (weapons.length > 0) {
        const [name, hits, attempts] = weapons.sort(
            (first, second) => first[1] / first[2] - second[1] / second[2]
        )[0];
        advice.push(`Menor precisão: ${name}, ${Math.round(hits / attempts * 100)}% (${hits}/${attempts} acertos).`);
    }
    const hardestFloor = Object.entries(learning.floorDamage)
        .sort((first, second) => second[1] - first[1])[0];
    if (hardestFloor && hardestFloor[1] > 0) {
        advice.push(`Maior dano recebido: andar ${hardestFloor[0]} (${Math.round(hardestFloor[1])} de dano).`);
    }
    const topDamageSource = Object.entries(learning.enemyDamageTaken)
        .sort((first, second) => second[1] - first[1])[0];
    if (topDamageSource && topDamageSource[1] > 0) {
        const creature = creatureDataByType[topDamageSource[0]];
        if (!creature) {
            throw new Error(`Dados ausentes para a criatura ${topDamageSource[0]} nas dicas do Bot.`);
        }
        advice.push(`Maior fonte de dano: ${creature.name} (${Math.round(topDamageSource[1])} de dano).`);
    }
    if (advice.length === 0) {
        advice.push(`Andar ${currentFloor}: ainda sem dados de combate suficientes para recomendar um ajuste.`);
    }
    return advice.join(' ');
}

function finishBotRun() {
    if (!botLearning || botLearning.saved) {
        return;
    }
    trackBotEconomy();
    if (!botLearning.completed) {
        botDiscoverEnvironment(true);
    }
    finalizeBotFloorObservation(botLearning.completed);
    botLearning.performanceScore = calculateBotPerformanceScore();
    botLearning.saved = true;
    botPersistentMemory.matches += 1;
    if (botLearning.completed) {
        botPersistentMemory.victories += 1;
    }
    botPersistentMemory.bestFloor = Math.max(botPersistentMemory.bestFloor, currentFloor);
    botPersistentMemory.totalBowHits += botLearning.bowHits;
    botPersistentMemory.totalSwordHits += botLearning.swordHits;
    botPersistentMemory.totalSpearHits += botLearning.spearHits;
    botPersistentMemory.totalBowAttempts += botLearning.bowAttempts;
    botPersistentMemory.totalBowMisses += botLearning.bowMisses;
    botPersistentMemory.totalSwordAttempts += botLearning.swordAttempts;
    botPersistentMemory.totalSwordMisses += botLearning.swordMisses;
    botPersistentMemory.totalSpearAttempts += botLearning.spearAttempts;
    botPersistentMemory.totalSpearMisses += botLearning.spearMisses;
    botPersistentMemory.totalBlockedHits += botLearning.blockedHits;
    botPersistentMemory.totalShieldAbsorbed += botLearning.shieldAbsorbed;
    botPersistentMemory.totalRouteSteps += botLearning.routeSteps;
    botPersistentMemory.totalRouteRevisits += botLearning.routeRevisits;
    botPersistentMemory.totalDamage += botLearning.damageTaken;
    mergeBotEnemyStrategyStats();
    botPersistentMemory.runs.push({
        playedAt: new Date().toISOString(),
        result: botLearning.completed ? 'victory' : gameState === 'lost' ? 'defeat' : 'stopped',
        floor: currentFloor,
        performanceScore: botLearning.performanceScore,
        bowHits: botLearning.bowHits,
        swordHits: botLearning.swordHits,
        bowAttempts: botLearning.bowAttempts,
        bowMisses: botLearning.bowMisses,
        arrowsFired: botLearning.arrowsFired,
        arrowsCollected: botLearning.arrowsCollected,
        arrowsPurchased: botLearning.arrowsPurchased,
        potionsUsed: botLearning.potionsUsed,
        swordAttempts: botLearning.swordAttempts,
        swordMisses: botLearning.swordMisses,
        spearHits: botLearning.spearHits,
        spearAttempts: botLearning.spearAttempts,
        spearMisses: botLearning.spearMisses,
        weaponDamage: { ...botLearning.weaponDamage },
        blockedHits: botLearning.blockedHits,
        shieldAbsorbed: botLearning.shieldAbsorbed,
        damageTaken: botLearning.damageTaken,
        routeSteps: botLearning.routeSteps,
        routeRevisits: botLearning.routeRevisits,
        routeUniqueTiles: botLearning.routeUniqueTiles.size,
        upgrades: { ...gearUpgrades },
        floorsCleared: botLearning.completed ? finalFloor : Math.max(0, currentFloor - 1),
        finalBossDefeated: botLearning.completed,
        economy: {
            earned: botLearning.coinsEarned,
            spent: botLearning.coinsSpent,
            balance: getOreCoinBalanceInCopper()
        },
        floorDamage: { ...botLearning.floorDamage },
        floorDamageHealthRatio: { ...botLearning.floorDamageHealthRatio },
        enemyDamageTaken: { ...botLearning.enemyDamageTaken },
        enemyDefeats: botLearning.enemyDefeats,
        monsterDefeats: { ...botLearning.monsterDefeats },
        bossDefeats: { ...botLearning.bossDefeats },
        bossDamageDealt: { ...botLearning.bossDamageDealt },
        finalBossType: botLearning.finalBossType,
        finalBossDamage: botLearning.finalBossDamage,
        finalHealth: player.health,
        maxHealth: player.maxHealth,
        potionsRemaining: healingPotions.length,
        arrowsRemaining: arrowAmmo
    });
    botPersistentMemory.runs = botPersistentMemory.runs.slice(-botRunMemoryLimit);
    botPersistentMemory.preferredRange = Math.round(
        botPersistentMemory.preferredRange * 0.7 + botLearning.preferredRange * 0.3
    );
    if (botLearning.blockedHits > 0) {
        botPersistentMemory.flankSign = botLearning.flankSign;
    }
    saveBotMemory();
    if (botLearning.completed) {
        const letter = createBotVictoryLetter();
        botPersistentMemory.runs[botPersistentMemory.runs.length - 1].letter = letter;
        showBotVictoryLetter(letter);
        saveBotMemory();
    }
}

function createBotVictoryLetter() {
    const bowAccuracy = botLearning.bowAttempts > 0
        ? Math.round(botLearning.bowHits / botLearning.bowAttempts * 100)
        : 0;
    const swordAccuracy = botLearning.swordAttempts > 0
        ? Math.round(botLearning.swordHits / botLearning.swordAttempts * 100)
        : 0;
    const spearAccuracy = botLearning.spearAttempts > 0
        ? Math.round(botLearning.spearHits / botLearning.spearAttempts * 100)
        : 0;
    const floorDamageEntries = Object.entries(botLearning.floorDamageHealthRatio);
    const hardestFloor = floorDamageEntries
        .sort((first, second) => second[1] - first[1])[0];
    const averageFloorDamagePercent = getBotAverageFloorDamagePercent(
        botLearning.floorDamageHealthRatio,
        finalFloor
    );
    const formattedAverageFloorDamagePercent = new Intl.NumberFormat('pt-BR', {
        maximumFractionDigits: 1
    }).format(averageFloorDamagePercent);
    const difficultyRating = getBotDifficultyRating(
        averageFloorDamagePercent,
        hardestFloor ? hardestFloor[1] : 0
    );
    const difficultyContext = hardestFloor && hardestFloor[1] >= 0.25
        ? `pico de ${Math.round(hardestFloor[1] * 100)}% no andar ${hardestFloor[0]}`
        : `média de ${formattedAverageFloorDamagePercent}% por andar`;
    const totalWeaponDamage = Object.values(botLearning.weaponDamage)
        .reduce((total, damage) => total + damage, 0);
    const weaponDamagePercent = (weapon) => totalWeaponDamage > 0
        ? Math.round(botLearning.weaponDamage[weapon] / totalWeaponDamage * 100)
        : 0;
    const bossTypes = new Set([
        ...Object.keys(botLearning.bossDefeats),
        ...Object.keys(botLearning.bossDamageDealt)
    ]);
    const bossResults = [...bossTypes]
        .filter((type) => botLearning.bossDefeats[type] > 0 || botLearning.bossDamageDealt[type] > 0)
        .map((type) => {
            const creature = creatureDataByType[type];
            if (!creature) {
                throw new Error(`Dados ausentes para o chefe ${type} na carta do Bot IA.`);
            }
            const defeats = botLearning.bossDefeats[type] || 0;
            const defeatLabel = defeats === 1 ? 'vitória' : 'vitórias';
            return `${creature.name}: ${defeats} ${defeatLabel} · ${botLearning.bossDamageDealt[type] || 0} de dano causado`;
        });
    const bossDefeatCount = Object.values(botLearning.bossDefeats)
        .reduce((sum, count) => sum + count, 0);
    const bossDefeatSummary = bossDefeatCount === 1
        ? '1 chefe derrotado'
        : `${bossDefeatCount} chefes derrotados`;
    const hardestFloorSummary = hardestFloor
        ? `Maior dano proporcional no andar ${hardestFloor[0]} (${Math.round(hardestFloor[1] * 100)}% da vida máxima).`
        : 'Nenhum dano recebido.';
    const weaponSummary = [
        `Espada: ${botLearning.swordHits}/${botLearning.swordAttempts} acertos (${swordAccuracy}%), ${botLearning.weaponDamage.sword} de dano (${weaponDamagePercent('sword')}% do total)`,
        `Lança: ${botLearning.spearHits}/${botLearning.spearAttempts} (${spearAccuracy}%), ${botLearning.weaponDamage.spear} de dano (${weaponDamagePercent('spear')}% do total)`,
        `Arco: ${botLearning.bowHits}/${botLearning.bowAttempts} (${bowAccuracy}%), ${botLearning.weaponDamage.bow} de dano (${weaponDamagePercent('bow')}% do total)`
    ].join(' · ');
    const ammunitionSummary = `Flechas: ${botLearning.arrowsFired} disparadas · ${botLearning.arrowsCollected} coletadas · ${botLearning.arrowsPurchased} compradas · ${arrowAmmo} restantes. Poções usadas: ${botLearning.potionsUsed}.`;
    const upgradeSummary = [
        `Espada nível ${gearUpgrades.sword} (${player.damage} de dano)`,
        `armadura nível ${gearUpgrades.armor} (${player.defense} de defesa)`,
        `escudo nível ${gearUpgrades.shield} (${gearDurability.shield}/${gearDurability.shieldMax} de durabilidade)`,
        `arco ${bowOwned ? 'comprado' : 'não comprado'}`,
        `lança ${spearOwned ? 'comprada' : 'não comprada'}`,
        `dash ampliado ${dashUpgradeOwned ? 'sim' : 'não'}`
    ].join(' · ');
    const formatCopper = (amount) => (
        `${new Intl.NumberFormat('pt-BR').format(amount)} cobres`
    );
    const floorDamageSummary = Array.from({ length: finalFloor }, (_, index) => {
        const floor = index + 1;
        const damage = botLearning.floorDamage[floor] || 0;
        const damageRatio = botLearning.floorDamageHealthRatio[floor] || 0;
        const title = castleFloorPlans[floor]?.title;
        return `Andar ${floor}${title ? ` · ${title}` : ''}: ${damage} dano recebido (${Math.round(damageRatio * 100)}% da vida máxima).`;
    });
    const monsterChallengeSummary = Object.entries(botLearning.monsterDefeats)
        .filter(([, count]) => count > 0)
        .map(([type, count]) => {
            const creature = creatureDataByType[type];
            const entry = bestiaryEntries.find((item) => item.creatureType === type);
            if (!creature || !entry) {
                throw new Error(`Dados de monstruário ausentes para a criatura ${type} na carta do Bot IA.`);
            }
            const defeatCount = count === 1 ? '1 vez' : `${count} vezes`;
            return `A criatura ${creature.name} foi derrotada ${defeatCount}. Como lidar: ${entry.strategy}`;
        });
    const routeRevisitPercent = botLearning.routeSteps > 0
        ? Math.round(botLearning.routeRevisits / botLearning.routeSteps * 100)
        : 0;
    const overallDamagePercent = Math.round(
        botLearning.damageTaken / Math.max(1, player.maxHealth * finalFloor) * 100
    );
    const usefulModifications = [];
    const highDamageFloorAdvice = getBotHighDamageFloorAdvice(
        botLearning.floorDamageHealthRatio
    );
    if (highDamageFloorAdvice) {
        usefulModifications.push(highDamageFloorAdvice);
    }
    if (routeRevisitPercent >= 20) {
        usefulModifications.push(
            `Reduza retornos no mapa: ${routeRevisitPercent}% dos passos registrados revisitaram posições já percorridas.`
        );
    }
    const lowAccuracyWeapons = [
        ['arco', botLearning.bowHits, botLearning.bowAttempts],
        ['espada', botLearning.swordHits, botLearning.swordAttempts],
        ['lança', botLearning.spearHits, botLearning.spearAttempts]
    ].filter(([, hits, attempts]) => attempts >= 20 && hits / attempts < 0.65);
    if (lowAccuracyWeapons.length > 0) {
        usefulModifications.push(
            `Melhore o posicionamento e a linha de visão com ${lowAccuracyWeapons.map(([weapon]) => weapon).join(', ')}; a precisão ficou abaixo de 65%.`
        );
    }
    if (
        overallDamagePercent >= 25
        && gearDurability.shieldMax > 0
        && gearDurability.shield < gearDurability.shieldMax * 0.3
    ) {
        usefulModifications.push('Priorize reparar ou melhorar o escudo nas próximas lojas; a durabilidade terminou abaixo de 30%.');
    }
    if (
        overallDamagePercent >= 25
        && gearDurability.armorMax > 0
        && gearDurability.armor < gearDurability.armorMax * 0.3
    ) {
        usefulModifications.push('Priorize reparar ou melhorar a armadura nas próximas lojas; a durabilidade terminou abaixo de 30%.');
    }
    if (weaponDamagePercent('bow') > 50) {
        usefulModifications.push(
            `Diversifique o combate: o arco causou ${weaponDamagePercent('bow')}% do dano; use espada ou lança nas aberturas para reduzir a dependência de flechas.`
        );
    }
    if (usefulModifications.length === 0) {
        usefulModifications.push(overallDamagePercent < 25
            ? `Nenhuma melhoria defensiva urgente: o dano recebido foi ${overallDamagePercent}% da vida total acumulada.`
            : `Reserve cobres para poções e reparos: o dano recebido foi ${overallDamagePercent}% da vida total acumulada.`);
    }
    const previousRun = botLearning.previousRunSnapshot;
    const previousRunComparison = previousRun
        ? (() => {
            const previousWeaponDamage = previousRun.weaponDamage || {};
            const previousTotalWeaponDamage = Object.values(previousWeaponDamage)
                .reduce((total, damage) => total + (Number.isFinite(damage) ? damage : 0), 0);
            const previousBowPercent = previousTotalWeaponDamage > 0
                ? Math.round((previousWeaponDamage.bow || 0) / previousTotalWeaponDamage * 100)
                : 0;
            const previousFloors = Number.isFinite(previousRun.floorsCleared)
                ? previousRun.floorsCleared
                : Math.max(0, (previousRun.floor || 1) - 1);
            return `Comparativo com a partida anterior: ${previousFloors}/${finalFloor} andares · ${previousRun.damageTaken || 0} de dano recebido · arco ${previousBowPercent}% do dano.`;
        })()
        : 'Comparativo com partida anterior: memória sem registro de uma partida anterior.';
    const finalBoss = botLearning.finalBossType
        ? creatureDataByType[botLearning.finalBossType]
        : null;
    if (botLearning.finalBossType && !finalBoss) {
        throw new Error(`Dados ausentes para o chefe final ${botLearning.finalBossType} na carta do Bot IA.`);
    }
    const finalBossSummary = finalBoss
        ? `Chefe final (${finalBoss.name}): ${botLearning.finalBossDamage} de dano causado.`
        : 'Chefe final: não há registro de dano causado.';

    return [
        'Olá!',
        '',
        `Concluí os ${finalFloor} andares da masmorra e derrotei o chefe final.`,
        '',
        `Desempenho: ${botLearning.performanceScore}/100 · ${botLearning.enemyDefeats} inimigos comuns derrotados · ${bossDefeatSummary}.`,
        previousRunComparison,
        '',
        'COMBATE',
        weaponSummary,
        `Defesa: ${botLearning.blockedHits} golpes bloqueados · escudo absorveu ${botLearning.shieldAbsorbed} de dano.`,
        `Dano recebido: ${botLearning.damageTaken} no total · média de ${formattedAverageFloorDamagePercent}% da vida máxima de cada andar · dificuldade observada: ${difficultyRating} (${difficultyContext}).`,
        hardestFloorSummary,
        '',
        'ECONOMIA',
        `Moedas obtidas: ${formatCopper(botLearning.coinsEarned)} · compras: ${formatCopper(botLearning.coinsSpent)} · saldo final: ${formatCopper(getOreCoinBalanceInCopper())}.`,
        ammunitionSummary,
        '',
        'PROGRESSO E DANO POR ANDAR',
        `Andares concluídos: ${finalFloor}/${finalFloor} · ${botLearning.enemyDefeats} inimigos comuns derrotados.`,
        'Dano recebido e dificuldade observada em cada andar:',
        ...floorDamageSummary,
        '',
        'EXPLORAÇÃO E RETORNOS',
        `${botLearning.routeSteps} passos de rota · ${botLearning.routeUniqueTiles.size} posições únicas · ${botLearning.routeRevisits} revisitas (${routeRevisitPercent}% dos passos).`,
        '',
        'DESAFIOS ESPECÍFICOS DOS MONSTROS',
        ...(monsterChallengeSummary.length > 0 ? monsterChallengeSummary : ['Nenhum monstro comum registrado.']),
        '',
        'MODIFICAÇÕES ÚTEIS',
        ...usefulModifications,
        '',
        'CHEFES',
        ...(bossResults.length > 0 ? bossResults : ['Nenhum chefe registrado.']),
        finalBossSummary,
        'Chefes anteriores ao final têm 50% a mais de vida e velocidade, com dano escalonado pelo andar; o chefe final usa 1,9 vez o multiplicador de chefe. Todos antecipam os movimentos e se reposicionam com mais frequência que inimigos comuns.',
        '',
        'MELHORIAS AO CONCLUIR',
        upgradeSummary,
        `Poções restantes: ${healingPotions.length} · vida final: ${player.health}/${player.maxHealth}.`,
        '',
        'Até a próxima aventura,',
        'Bot IA'
    ].join('\n');
}

function showBotVictoryLetter(letter) {
    botVictoryLetterBody.textContent = letter;
    botVictoryLetterStatus.textContent = 'A carta foi salva localmente no histórico do Bot IA.';
    botVictoryLetter.hidden = false;
    botVictoryLetterCopy.focus();
}

function setBotSummaryText(element, text) {
    if (element.textContent !== text) {
        element.textContent = text;
    }
}

function updateBotMemoryStatus() {
    if (!botMemoryStatus || !botLearning) {
        return;
    }
    const memoryText = botMemoryError
        || `Histórico · ${botPersistentMemory.matches} partidas · melhor andar ${botPersistentMemory.bestFloor} · ${Object.keys(botPersistentMemory.floorStats).length} andares aprendidos · ${Object.keys(botPersistentMemory.enemyStrategies).length} criaturas`;
    botMemoryStatus.dataset.error = String(Boolean(botMemoryError));
    setBotSummaryText(botMemoryStatus, memoryText);
}

function selectGameMode(mode) {
    if (!['human', 'bot', 'dev', 'multiplayer'].includes(mode)) {
        throw new RangeError(`Modo de jogo inválido: ${mode}.`);
    }
    selectedGameMode = mode;
    const botSelected = mode === 'bot';
    const devSelected = mode === 'dev';
    const multiplayerSelected = mode === 'multiplayer';
    humanModeButton.setAttribute(
        'aria-pressed',
        String(!botSelected && !devSelected && !multiplayerSelected)
    );
    botModeButton.setAttribute('aria-pressed', String(botSelected));
    devModeButton.setAttribute('aria-pressed', String(devSelected));
    multiplayerModeButton.setAttribute('aria-pressed', String(multiplayerSelected));
    botMemoryActions.hidden = !botSelected;
    multiplayerPanel.hidden = !multiplayerSelected;
    if (botSelected) {
        botMemoryActionStatus.textContent = `Memória local · ${botPersistentMemory.matches} partidas · melhor andar ${botPersistentMemory.bestFloor}. Importar substitui a memória atual.`;
    }
}

function setBotSpeed(multiplier) {
    if (!botSpeedOptions.includes(multiplier)) {
        throw new RangeError(`Velocidade do Bot IA inválida: ${multiplier}.`);
    }
    botSpeedMultiplier = multiplier;
    for (const button of botSpeedButtons) {
        button.setAttribute(
            'aria-pressed',
            String(Number(button.dataset.botSpeed) === multiplier)
        );
    }
}

function startBotMode() {
    botMode = true;
    botRetreatState = {
        active: false,
        enemy: null,
        elapsed: 0,
        cooldown: 0,
        consecutive: 0,
        lastAttemptKey: ''
    };
    botObjectQuietTime = 0;
    botObjectAttackInterval = 0;
    botObjectsAttackedInInterval = 0;
    botObjectLastAttemptKey = '';
    botStuckTimer = 0;
    botLastPosition = null;
    setBotSpeed(1);
    botSpeedControls.hidden = false;
    botDecisionTimer = 0;
    botStatusUpdateTimer = 0;
    const previousRun = botPersistentMemory.runs[botPersistentMemory.runs.length - 1];
    const previousRunScore = previousRun && Number.isFinite(previousRun.performanceScore)
        ? previousRun.performanceScore
        : 70;
    const previousRunFloorRatios = previousRun && previousRun.floorDamageHealthRatio
        ? previousRun.floorDamageHealthRatio
        : {};
    const previousDamageRatio = Object.keys(previousRunFloorRatios).length > 0
        ? getBotAverageFloorDamagePercent(
            previousRunFloorRatios,
            previousRun.floorsCleared || previousRun.floor
        ) / 100
        : previousRun
            ? previousRun.damageTaken / Math.max(1, player.maxHealth * previousRun.floor)
            : 0;
    const previousRunHighDamageFloors = new Set(
        getBotHighDamageFloors(previousRunFloorRatios)
    );
    const previousRunNeedsCaution = previousRunScore < 70
        || previousDamageRatio >= 0.12
        || previousRunHighDamageFloors.size > 0;
    const commonPotion = itemRarities.find((rarity) => rarity.id === 'common');
    if (!commonPotion) {
        throw new Error('Raridade comum de poção não está configurada.');
    }
    healingPotions = Array.from({ length: GAME_BALANCE.economy.botStartingPotions }, () => ({
        type: 'potion',
        rarity: commonPotion
    }));
    shieldBlocking = false;
    updatePotionHud();
    updateEquipmentHud();
    botLearning = {
        runId: Date.now(),
        bowHits: 0,
        swordHits: 0,
        spearHits: 0,
        bowAttempts: 0,
        bowMisses: 0,
        swordAttempts: 0,
        swordMisses: 0,
        spearAttempts: 0,
        spearMisses: 0,
        weaponDamage: { bow: 0, sword: 0, spear: 0 },
        arrowsFired: 0,
        arrowsCollected: 0,
        arrowsPurchased: 0,
        potionsUsed: 0,
        blockedHits: 0,
        blockedTarget: null,
        shieldAbsorbed: 0,
        damageTaken: 0,
        floorDamage: {},
        floorDamageHealthRatio: {},
        enemyDefeats: 0,
        monsterDefeats: Object.fromEntries(
            creatureData.map((creature) => [creature.creatureType, 0])
        ),
        bossDefeats: Object.fromEntries(
            creatureData.map((creature) => [creature.creatureType, 0])
        ),
        bossDamageDealt: Object.fromEntries(
            creatureData.map((creature) => [creature.creatureType, 0])
        ),
        enemyDamageTaken: {},
        enemyStrategyStats: Object.fromEntries(
            creatureData.map((creature) => [creature.creatureType, createEmptyEnemyStrategy()])
        ),
        finalBossType: null,
        finalBossDamage: 0,
        coinsEarned: 0,
        coinsSpent: 0,
        lastObservedBalance: getOreCoinBalanceInCopper(),
        routeSteps: 0,
        routeRevisits: 0,
        lastRouteTile: null,
        routeUniqueTiles: new Set(),
        routeTileVisits: {},
        routeRiskTiles: {},
        explorationFloor: currentFloor,
        visitedRooms: new Set(),
        roomVisitCounts: {},
        currentFloorObservation: null,
        currentRoomObservation: null,
        seenEnemies: new Set(),
        explorationTargetRoom: null,
        preferredRange: Math.min(
            138,
            Math.max(22, botPersistentMemory.preferredRange + (previousRunNeedsCaution ? 8 : 0))
        ),
        flankSign: botPersistentMemory.flankSign,
        previousRunScore,
        previousRunNeedsCaution,
        previousRunHighDamageFloors,
        previousRunSnapshot: previousRun ? {
            result: previousRun.result,
            floor: previousRun.floor,
            floorsCleared: previousRun.floorsCleared,
            damageTaken: previousRun.damageTaken,
            weaponDamage: previousRun.weaponDamage
                ? { ...previousRun.weaponDamage }
                : {}
        } : null,
        performanceScore: 0,
        completed: false,
        paused: false,
        saved: false,
        lastPerceptionDelta: 0,
        shopFloors: new Set(),
        lastShopReport: ''
    };
    botPerceptionTimer = 0;
    botMemorySaveTimer = 0;
    stopBotButton.hidden = false;
    botModeStatus.hidden = false;
    botReviewStatus.hidden = false;
    botAdviceStatus.hidden = false;
    botMemoryStatus.hidden = false;
    botDiscoverEnvironment(true);
    updateBotStatus();
    info.textContent = `Bot IA iniciado: ${GAME_BALANCE.economy.botStartingPotions} poções; escudo, arco e melhorias dependem das compras.`;
}

function stopBotMode() {
    if (botMode && botLearning && gameState === 'playing') {
        finishBotRun();
    }
    botMode = false;
    for (const key of Object.keys(keys)) {
        keys[key] = false;
    }
    if (typeof stopBotButton !== 'undefined') {
        stopBotButton.hidden = true;
    }
    botSpeedControls.hidden = true;
    setBotSpeed(1);
    if (typeof botModeStatus !== 'undefined') {
        botModeStatus.hidden = true;
    }
    if (typeof botReviewStatus !== 'undefined') {
        botReviewStatus.hidden = true;
    }
    if (typeof botAdviceStatus !== 'undefined') {
        botAdviceStatus.hidden = true;
    }
    if (typeof botMemoryStatus !== 'undefined') {
        botMemoryStatus.hidden = true;
    }
    if (gameState === 'playing') {
        info.textContent = 'Bot IA pausado. Os controles manuais estão ativos.';
    }
}

function recordBotCombat(weapon, damage, blocked, enemy) {
    if (!botMode || !botLearning) {
        return;
    }
    if (blocked) {
        botLearning.blockedHits += 1;
        if (botLearning.blockedTarget !== enemy) {
            botLearning.flankSign *= -1;
        }
        botLearning.blockedTarget = enemy;
        botLearning.preferredRange = Math.min(138, botLearning.preferredRange + 12);
    } else if (damage > 0) {
        botLearning[`${weapon}Hits`] += 1;
        botLearning.weaponDamage[weapon] += damage;
        const type = enemy.creatureType || enemy.bossType;
        if (!type || !botLearning.enemyStrategyStats[type]) {
            throw new Error(`Estratégia ausente para a criatura atingida: ${type}.`);
        }
        const strategy = botLearning.enemyStrategyStats[type];
        strategy.damageDealt += damage;
        strategy.weapons[weapon].damage += damage;
        strategy.tactics[getBotTacticType(enemy, weapon)].damage += damage;
        if (enemy.isBoss || enemy.isMiniBoss) {
            botLearning.bossDamageDealt[type] = (
                botLearning.bossDamageDealt[type] || 0
            ) + damage;
        }
        if (currentFloor === finalFloor && enemy.isBoss) {
            botLearning.finalBossType = enemy.bossType;
            botLearning.finalBossDamage += damage;
        }
        if (botLearning.blockedTarget === enemy) {
            botLearning.blockedTarget = null;
        }
    }
    updateBotStatus();
}

function getBotTacticType(enemy, weapon) {
    if (botLearning.blockedTarget === enemy && enemy.shieldDurability > 0) {
        return 'flank';
    }
    if (player.dashActive) {
        return 'evasive';
    }
    if (weapon === 'bow') {
        return 'ranged';
    }
    if (weapon === 'spear') {
        return 'reach';
    }
    return 'melee';
}

function recordBotWeaponAttempt(weapon, enemy = null) {
    if (!botMode || !botLearning) {
        return null;
    }
    botLearning[`${weapon}Attempts`] += 1;
    const type = enemy && (enemy.creatureType || enemy.bossType);
    if (!type || !botLearning.enemyStrategyStats[type]) {
        return null;
    }
    const tactic = getBotTacticType(enemy, weapon);
    botLearning.enemyStrategyStats[type].weapons[weapon].attempts += 1;
    botLearning.enemyStrategyStats[type].tactics[tactic].attempts += 1;
    return { type, tactic };
}

function recordBotWeaponOutcome(weapon, successful, target = null, tactic = null) {
    if (!botMode || !botLearning) {
        return;
    }
    if (!successful) {
        botLearning[`${weapon}Misses`] += 1;
    }
    const type = typeof target === 'string'
        ? target
        : target && (target.creatureType || target.bossType);
    const strategy = type && botLearning.enemyStrategyStats[type];
    if (!strategy) {
        return;
    }
    const selectedTactic = tactic || getBotTacticType(target, weapon);
    if (successful) {
        strategy.weapons[weapon].hits += 1;
        strategy.tactics[selectedTactic].hits += 1;
    }
}

function recordBotShieldAbsorption(amount) {
    if (!botMode || !botLearning || amount <= 0) {
        return;
    }
    botLearning.shieldAbsorbed += amount;
    updateBotStatus();
}

function recordBotRouteStep() {
    if (!botMode || !botLearning) {
        return;
    }
    const tileX = Math.floor((player.x + player.size / 2) / tileSize);
    const tileY = Math.floor((player.y + player.size / 2) / tileSize);
    const key = `${tileX},${tileY}`;
    if (botLearning.lastRouteTile === key) {
        return;
    }
    botLearning.lastRouteTile = key;
    botLearning.routeSteps += 1;
    const uniqueKey = `${currentFloor}:${key}`;
    if (botLearning.routeUniqueTiles.has(uniqueKey)) {
        botLearning.routeRevisits += 1;
    } else {
        botLearning.routeUniqueTiles.add(uniqueKey);
    }
    const routeKey = `${currentFloor}:${key}`;
    botLearning.routeTileVisits[routeKey] = Math.min(
        50,
        (botLearning.routeTileVisits[routeKey] || 0) + 1
    );
    recordBotRoomProgress();
}

function recordBotDamage(amount, sourceType = null) {
    if (!botMode || !botLearning) {
        return;
    }
    botLearning.damageTaken += amount;
    botLearning.floorDamage[currentFloor] = (botLearning.floorDamage[currentFloor] || 0) + amount;
    botLearning.floorDamageHealthRatio[currentFloor] = (
        botLearning.floorDamageHealthRatio[currentFloor] || 0
    ) + amount / Math.max(1, player.maxHealth);
    botLearning.currentFloorObservation.damageReceived += amount;
    if (botLearning.currentRoomObservation) {
        botLearning.currentRoomObservation.damageReceived += amount;
    }
    const tile = `${currentFloor}:${Math.floor((player.x + player.size / 2) / tileSize)},${Math.floor((player.y + player.size / 2) / tileSize)}`;
    botLearning.routeRiskTiles[tile] = Math.min(
        12,
        (botLearning.routeRiskTiles[tile] || 0) + amount / 10
    );
    if (sourceType && botLearning.enemyStrategyStats[sourceType]) {
        botLearning.enemyDamageTaken[sourceType] = (
            botLearning.enemyDamageTaken[sourceType] || 0
        ) + amount;
        botLearning.enemyStrategyStats[sourceType].damageReceived += amount;
    }
    botLearning.preferredRange = Math.min(
        138,
        22 + botLearning.damageTaken * 0.8 + botLearning.blockedHits * 10
    );
    updateBotStatus();
}

function recordBotEnemyDefeat(enemy) {
    if (!botMode || !botLearning) {
        return;
    }
    const type = enemy.creatureType || enemy.bossType;
    if (!type || !botLearning.enemyStrategyStats[type]) {
        throw new Error(`Estratégia ausente para a criatura derrotada: ${type}.`);
    }
    botLearning.enemyStrategyStats[type].defeats += 1;
    if (enemy.isBoss || enemy.isMiniBoss) {
        botLearning.bossDefeats[type] = (botLearning.bossDefeats[type] || 0) + 1;
        if (currentFloor === finalFloor) {
            botLearning.finalBossType = type;
        }
    }
    if (!enemy.isBoss) {
        if (!enemy.isMiniBoss) {
            botLearning.enemyDefeats += 1;
        }
    }
    botLearning.monsterDefeats[type] = (botLearning.monsterDefeats[type] || 0) + 1;
}

function recordBotEnemyEncounter(enemy) {
    if (!botMode || !botLearning) {
        return;
    }
    const type = enemy.creatureType || enemy.bossType;
    const strategy = botLearning.enemyStrategyStats[type];
    if (!strategy) {
        throw new Error(`Estratégia ausente para a criatura avistada: ${type}.`);
    }
    strategy.encounters += 1;
}

function trackBotEconomy() {
    if (!botMode || !botLearning) {
        return;
    }
    const balance = getOreCoinBalanceInCopper();
    const difference = balance - botLearning.lastObservedBalance;
    if (difference > 0) {
        botLearning.coinsEarned += difference;
    } else if (difference < 0) {
        botLearning.coinsSpent -= difference;
    }
    botLearning.lastObservedBalance = balance;
}

function updateBotStatus() {
    if (!botModeStatus || !botLearning) {
        return;
    }
    if (botLearning.completed || botLearning.paused || gameState === 'lost') {
        finishBotRun();
    }
    if (botLearning.completed || gameState === 'lost') {
        botSpeedControls.hidden = true;
    }
    if (botLearning.completed) {
        setBotSummaryText(botModeStatus, `Resultado · vitória, ${finalFloor} andares concluídos`);
    } else if (botLearning.paused) {
        setBotSummaryText(botModeStatus, 'Estado · bot pausado');
    } else if (gameState === 'lost') {
        setBotSummaryText(botModeStatus, 'Resultado · derrota');
    } else {
        const weaponText = bowOwned
            ? swordEquipped ? 'espada' : 'arco'
            : 'espada';
        const shieldText = gearOwned.shield
            ? shieldBlocking ? 'escudo ativo' : 'escudo pronto'
            : 'sem escudo';
        setBotSummaryText(
            botModeStatus,
            `IA ativa · ${weaponText} · ${shieldText}`
        );
    }

    const hitCount = botLearning.bowHits + botLearning.swordHits + botLearning.spearHits;
    botLearning.performanceScore = calculateBotPerformanceScore();

    const score = botLearning.performanceScore;
    const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'E';
    const blockRatio = botLearning.blockedHits / Math.max(1, hitCount + botLearning.blockedHits);
    const damageRatio = botLearning.damageTaken / (player.maxHealth * Math.max(1, currentFloor));
    const reviewText = `Desempenho · ${score}/100 (${grade}) · ${hitCount} acertos · ${botLearning.blockedHits} bloqueios · ${Math.round(botLearning.damageTaken)} dano recebido`;
    setBotSummaryText(botReviewStatus, reviewText);

    const improvementOpportunities = Math.min(
        100,
        Math.round(
            Math.min(40, damageRatio / 0.3 * 40)
            + Math.min(30, blockRatio / 0.4 * 30)
            + (!bowOwned && currentFloor >= 2 ? 20 : 0)
            + (currentFloor >= 3 && !gearOwned.armor && !gearOwned.shield ? 10 : 0)
        )
    );
    const advice = getBotAdvice();
    const adviceText = `Próximo ajuste · ${improvementOpportunities}/100 · ${advice}`;
    setBotSummaryText(botAdviceStatus, adviceText);
    persistBotSystemReport({
        floor: currentFloor,
        score,
        grade,
        opportunities: improvementOpportunities,
        review: reviewText,
        advice: adviceText,
        runId: botLearning.runId
    });
    updateBotMemoryStatus();
}

function persistBotSystemReport(report) {
    const previous = botPersistentMemory.latestSystemReport;
    const sameRunAndFloor = previous
        && previous.runId === report.runId
        && previous.floor === report.floor;
    if (
        sameRunAndFloor
        && previous.score === report.score
        && previous.grade === report.grade
        && previous.opportunities === report.opportunities
        && previous.review === report.review
        && previous.advice === report.advice
    ) {
        return;
    }
    const savedReport = { ...report, recordedAt: new Date().toISOString() };
    botPersistentMemory.latestSystemReport = savedReport;
    if (sameRunAndFloor) {
        let reportIndex = -1;
        for (let index = botPersistentMemory.systemReports.length - 1; index >= 0; index -= 1) {
            const candidate = botPersistentMemory.systemReports[index];
            if (candidate.runId === report.runId && candidate.floor === report.floor) {
                reportIndex = index;
                break;
            }
        }
        if (reportIndex >= 0) {
            botPersistentMemory.systemReports[reportIndex] = savedReport;
        } else {
            botPersistentMemory.systemReports.push(savedReport);
        }
    } else {
        botPersistentMemory.systemReports.push(savedReport);
    }
    botPersistentMemory.systemReports = botPersistentMemory.systemReports.slice(-botSystemReportLimit);
    saveBotMemory();
}

function botWalkablePosition(x, y, doorwayTiles = null) {
    if (x < 0 || x >= gridWidth || y < 0 || y >= gridHeight) {
        return false;
    }
    const tileX = Math.floor(x / tileSize);
    const tileY = Math.floor(y / tileSize);
    const isDoorway = doorwayTiles
        ? doorwayTiles.has(`${tileX},${tileY}`)
        : doors.some((door) => door.x === tileX && door.y === tileY);
    if (map[tileY][tileX] === '#' && !isDoorway) {
        return false;
    }
    const playerX = x - player.size / 2;
    const playerY = y - player.size / 2;
    if (!canEntityMoveTo(player, playerX, playerY, true)) {
        return false;
    }
    return !barrels.some((barrel) => (
        barrel.health > 0 && barrel.x === tileX && barrel.y === tileY
    )) && !chests.some((chest) => (
        chest.health > 0 && chest.x === tileX && chest.y === tileY
    ));
}

function botFindPathDirection(
    targetX,
    targetY,
    minRange = 0,
    maxRange = 10,
    visibilityTarget = null
) {
    botAlignmentTarget = null;
    const navigationStep = tileSize / 2;
    const navigationCols = Math.ceil(gridWidth / navigationStep);
    const navigationRows = Math.ceil(gridHeight / navigationStep);
    const navigationNodeCount = navigationCols * navigationRows;
    if (botNavigationCosts.length !== navigationNodeCount) {
        botNavigationCosts = new Float64Array(navigationNodeCount);
        botNavigationWalkability = new Uint8Array(navigationNodeCount);
    }
    const costs = botNavigationCosts;
    const walkability = botNavigationWalkability;
    costs.fill(Infinity);
    walkability.fill(0);
    const doorwayTiles = new Set(doors.map((door) => `${door.x},${door.y}`));
    const getNodeIndex = (x, y) => y * navigationCols + x;
    const playerCenterX = player.x + player.size / 2;
    const playerCenterY = player.y + player.size / 2;
    const start = {
        x: Math.max(0, Math.min(navigationCols - 1, Math.round(playerCenterX / navigationStep))),
        y: Math.max(0, Math.min(navigationRows - 1, Math.round(playerCenterY / navigationStep)))
    };
    const open = [{ ...start, firstStep: null, cost: 0 }];
    costs[getNodeIndex(start.x, start.y)] = 0;
    const isWalkable = (x, y) => {
        if (x < 0 || x >= navigationCols || y < 0 || y >= navigationRows) {
            return false;
        }
        const index = getNodeIndex(x, y);
        if (walkability[index] === 0) {
            walkability[index] = botWalkablePosition(
                x * navigationStep,
                y * navigationStep,
                doorwayTiles
            ) ? 1 : 2;
        }
        return walkability[index] === 1;
    };
    const pushOpen = (node) => {
        let index = open.push(node) - 1;
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (open[parentIndex].cost <= node.cost) {
                break;
            }
            open[index] = open[parentIndex];
            index = parentIndex;
        }
        open[index] = node;
    };
    const popOpen = () => {
        const first = open[0];
        const last = open.pop();
        if (open.length > 0) {
            let index = 0;
            while (true) {
                const leftIndex = index * 2 + 1;
                const rightIndex = leftIndex + 1;
                if (leftIndex >= open.length) {
                    break;
                }
                const childIndex = rightIndex < open.length
                    && open[rightIndex].cost < open[leftIndex].cost
                    ? rightIndex
                    : leftIndex;
                if (open[childIndex].cost >= last.cost) {
                    break;
                }
                open[index] = open[childIndex];
                index = childIndex;
            }
            open[index] = last;
        }
        return first;
    };
    let bestNode = null;
    let fallbackNode = null;
    let fallbackScore = Infinity;

    while (open.length > 0) {
        const current = popOpen();
        if (current.cost !== costs[getNodeIndex(current.x, current.y)]) {
            continue;
        }
        const centerX = current.x * navigationStep;
        const centerY = current.y * navigationStep;
        const distance = Math.hypot(centerX - targetX, centerY - targetY);
        const rangeError = distance < minRange
            ? minRange - distance
            : distance > maxRange ? distance - maxRange : 0;
        const visible = !visibilityTarget || botHasLineOfSightFrom(
            centerX,
            centerY,
            visibilityTarget.x,
            visibilityTarget.y
        );
        const score = rangeError * 5
            + current.cost
            + (visibilityTarget && !visible ? 1000 + distance * 2 : 0);
        if (score < fallbackScore) {
            fallbackScore = score;
            fallbackNode = current;
        }
        if (rangeError === 0) {
            if (visible) {
                bestNode = current;
                break;
            }
        }

        for (const [dx, dy] of botNavigationDirections) {
            const x = current.x + dx;
            const y = current.y + dy;
            if (
                !isWalkable(x, y)
                || (dx !== 0 && dy !== 0 && (
                    !isWalkable(current.x + dx, current.y)
                    || !isWalkable(current.x, current.y + dy)
                ))
            ) {
                continue;
            }
            const tileKey = `${Math.floor(x * navigationStep / tileSize)},${Math.floor(y * navigationStep / tileSize)}`;
            const routeKey = `${currentFloor}:${tileKey}`;
            const risk = botLearning.routeRiskTiles[routeKey] || 0;
            const nextCost = current.cost
                + (dx !== 0 && dy !== 0 ? Math.SQRT2 : 1)
                + Math.min(1.2, risk * 0.12);
            const nodeIndex = getNodeIndex(x, y);
            if (nextCost >= costs[nodeIndex]) {
                continue;
            }
            costs[nodeIndex] = nextCost;
            pushOpen({
                x,
                y,
                firstStep: current.firstStep || { x, y },
                cost: nextCost
            });
        }
    }

    bestNode = bestNode || fallbackNode;
    if (!bestNode || !bestNode.firstStep) {
        return { x: 0, y: 0 };
    }

    const nextCenterX = bestNode.firstStep.x * navigationStep;
    const nextCenterY = bestNode.firstStep.y * navigationStep;
    const direction = {
        x: Math.sign(nextCenterX - playerCenterX),
        y: Math.sign(nextCenterY - playerCenterY)
    };
    const alignAxis = direction.x && direction.y
        ? Math.abs(nextCenterX - playerCenterX) <= Math.abs(nextCenterY - playerCenterY)
            ? 'x'
            : 'y'
        : direction.x ? 'x' : direction.y ? 'y' : null;
    if (alignAxis) {
        botAlignmentTarget = {
            axis: alignAxis,
            position: (alignAxis === 'x' ? nextCenterX : nextCenterY) - player.size / 2
        };
    }
    return direction;
}

function botSetDirection(direction) {
    keys.ArrowLeft = direction.x < 0;
    keys.ArrowRight = direction.x > 0;
    keys.ArrowUp = direction.y < 0;
    keys.ArrowDown = direction.y > 0;
}

function botTryDash(direction) {
    if (
        (direction.x === 0 && direction.y === 0)
        || player.dashActive
        || player.dashCooldown > 0
    ) {
        return;
    }
    botSetDirection(direction);
    keys.Shift = true;
    tryStartDash();
    keys.Shift = false;
}

function botHasLineOfSightFrom(startX, startY, targetX, targetY) {
    const deltaX = targetX - startX;
    const deltaY = targetY - startY;
    const targetCol = Math.floor(targetX / tileSize);
    const targetRow = Math.floor(targetY / tileSize);
    let col = Math.floor(startX / tileSize);
    let row = Math.floor(startY / tileSize);
    const stepX = Math.sign(deltaX);
    const stepY = Math.sign(deltaY);
    const deltaCol = stepX === 0 ? Infinity : tileSize / Math.abs(deltaX);
    const deltaRow = stepY === 0 ? Infinity : tileSize / Math.abs(deltaY);
    let nextCol = stepX === 0
        ? Infinity
        : ((stepX > 0 ? col + 1 : col) * tileSize - startX) / deltaX;
    let nextRow = stepY === 0
        ? Infinity
        : ((stepY > 0 ? row + 1 : row) * tileSize - startY) / deltaY;
    const isBlockingTile = (tileCol, tileRow) => (
        tileCol < 0
        || tileCol >= cols
        || tileRow < 0
        || tileRow >= rows
        || map[tileRow][tileCol] === '#'
        || doors.some((door) => (
            door.progress < 0.9 && door.x === tileCol && door.y === tileRow
        ))
    );

    while (col !== targetCol || row !== targetRow) {
        if (Math.abs(nextCol - nextRow) < 1e-10) {
            const sideCol = col + stepX;
            const sideRow = row + stepY;
            if (
                ((sideCol !== targetCol || row !== targetRow)
                    && isBlockingTile(sideCol, row))
                || ((col !== targetCol || sideRow !== targetRow)
                    && isBlockingTile(col, sideRow))
            ) {
                return false;
            }
            col += stepX;
            row += stepY;
            nextCol += deltaCol;
            nextRow += deltaRow;
        } else if (nextCol < nextRow) {
            col += stepX;
            nextCol += deltaCol;
        } else {
            row += stepY;
            nextRow += deltaRow;
        }
        if (
            (col !== targetCol || row !== targetRow)
            && isBlockingTile(col, row)
        ) {
            return false;
        }
    }
    return true;
}

function botHasLineOfSight(targetX, targetY) {
    return botHasLineOfSightFrom(
        player.x + player.size / 2,
        player.y + player.size / 2,
        targetX,
        targetY
    );
}

function botCanSeeEnemy(enemy) {
    return botHasLineOfSight(
        enemy.x + enemy.size / 2,
        enemy.y + enemy.size / 2
    );
}

function botKnowsEnemy(enemy) {
    return botCanSeeEnemy(enemy) || botLearning.seenEnemies.has(enemy);
}

function botGetRoomIndexAt(x, y) {
    const tileX = Math.floor(x / tileSize);
    const tileY = Math.floor(y / tileSize);
    return dungeonRooms.findIndex((room) => (
        tileX >= room.x
        && tileX < room.x + room.width
        && tileY >= room.y
        && tileY < room.y + room.height
    ));
}

function getNearestBotRoomIndex(roomIndices, playerX, playerY) {
    return roomIndices.reduce((nearest, index) => {
        const room = dungeonRooms[index];
        const distance = Math.hypot(
            (room.x + room.width / 2) * tileSize - playerX,
            (room.y + room.height / 2) * tileSize - playerY
        );
        return !nearest || distance < nearest.distance
            ? { index, distance }
            : nearest;
    }, null)?.index ?? null;
}

function botGetExplorationTarget(playerX, playerY) {
    if (botLearning.explorationFloor !== currentFloor) {
        botLearning.explorationFloor = currentFloor;
        botLearning.visitedRooms.clear();
        botLearning.seenEnemies.clear();
        botLearning.explorationTargetRoom = null;
    }
    const currentRoom = botGetRoomIndexAt(playerX, playerY);
    if (currentRoom >= 0) {
        botLearning.visitedRooms.add(currentRoom);
        if (botLearning.explorationTargetRoom === currentRoom) {
            botLearning.explorationTargetRoom = null;
        }
    }
    if (botLearning.explorationTargetRoom === null) {
        let candidates = dungeonRooms
            .map((room, index) => index)
            .filter((index) => (
                !botLearning.visitedRooms.has(index)
                && index !== currentRoom
            ));
        if (candidates.length === 0) {
            candidates = dungeonRooms
                .map((room, index) => index)
                .filter((index) => index !== currentRoom);
        }
        if (candidates.length === 0) {
            return null;
        }
        const enemyRooms = new Set(enemies
            .filter((enemy) => (
                enemy.health > 0
                && !enemy.dying
                && botKnowsEnemy(enemy)
            ))
            .map((enemy) => botGetRoomIndexAt(
                enemy.x + enemy.size / 2,
                enemy.y + enemy.size / 2
            ))
            .filter((index) => index >= 0 && index !== currentRoom));
        const enemyRoomCandidates = candidates.filter((index) => enemyRooms.has(index));
        const targetCandidates = enemyRoomCandidates.length > 0
            ? enemyRoomCandidates
            : candidates;
        botLearning.explorationTargetRoom = targetCandidates.reduce((best, index) => {
            const room = dungeonRooms[index];
            const roomType = getBotRoomType(index, room);
            const history = botPersistentMemory.roomStats[currentFloor]?.[roomType];
            const enemyRate = history && history.visits > 0
                ? history.roomsWithEnemies / history.visits
                : 0;
            const visitCount = botLearning.roomVisitCounts[index] || 0;
            const distance = Math.hypot(
                (room.x + room.width / 2) * tileSize - playerX,
                (room.y + room.height / 2) * tileSize - playerY
            );
            const score = distance + visitCount * tileSize * 4 - enemyRate * tileSize * 2;
            return !best || score < best.score ? { index, score } : best;
        }, null)?.index ?? null;
    }
    return dungeonRooms[botLearning.explorationTargetRoom] || null;
}

function getBotLearnedEnemyPreference(enemy) {
    const type = enemy.creatureType || enemy.bossType;
    const history = botPersistentMemory.enemyStrategies[type];
    const current = botLearning.enemyStrategyStats[type];
    if (!history || !current) {
        return { weapon: null, tactic: null };
    }
    const weaponScores = botWeaponTypes.map((weapon) => {
        const attempts = history.weapons[weapon].attempts + current.weapons[weapon].attempts;
        const damage = history.weapons[weapon].damage + current.weapons[weapon].damage;
        return { weapon, attempts, score: damage / Math.max(1, attempts) };
    }).filter((entry) => entry.attempts >= 4);
    const tacticScores = botTacticTypes.map((tactic) => {
        const attempts = history.tactics[tactic].attempts + current.tactics[tactic].attempts;
        const damage = history.tactics[tactic].damage + current.tactics[tactic].damage;
        return { tactic, attempts, score: damage / Math.max(1, attempts) };
    }).filter((entry) => entry.attempts >= 4);
    weaponScores.sort((first, second) => second.score - first.score);
    tacticScores.sort((first, second) => second.score - first.score);
    return {
        weapon: weaponScores[0]?.weapon || history.preferredWeapon,
        tactic: tacticScores[0]?.tactic || history.preferredTactic
    };
}

function botTryPurchase() {
    if (
        !portalUnlocked
        || enemies.some((enemy) => enemy.health > 0)
        || botLearning.shopFloors.has(currentFloor)
    ) {
        return false;
    }

    const currentBalance = getOreCoinBalanceInCopper();
    const nextFloorNeedsProtection = botLearning.previousRunHighDamageFloors.has(currentFloor + 1);
    const minimumReserve = Math.max(3, Math.ceil(currentBalance * 0.2));
    if (!bowOwned && currentBalance < getUpgradeCost('bow') + minimumReserve) {
        botLearning.lastShopReport = `Economia: guardando moedas para o arco (${getUpgradeCost('bow')} cobres) e reserva mínima de ${minimumReserve}.`;
        info.textContent = botLearning.lastShopReport;
        return false;
    }

    botLearning.shopFloors.add(currentFloor);
    const purchased = [];
    setShopOpen(true);
    if (!bowOwned) {
        purchaseUpgrade('bow');
        if (bowOwned) {
            purchased.push('bow');
        }
    }

    const exhaustedOptions = new Set();
    while (true) {
        const balance = getOreCoinBalanceInCopper();
        const reserve = Math.max(3, Math.ceil(balance * 0.2));
        const damageRatio = getBotAverageFloorDamagePercent(
            botLearning.floorDamageHealthRatio,
            currentFloor
        ) / 100;
        const options = [
            {
                type: 'shield',
                priority: !gearOwned.shield
                    ? 130
                    : gearDurability.shield < gearDurability.shieldMax * 0.3
                        ? 112
                        : 76 - gearUpgrades.shield * 8 + damageRatio * 30
                            + (nextFloorNeedsProtection ? 22 : 0)
            },
            {
                type: 'armor',
                priority: !gearOwned.armor
                    ? 125
                    : gearDurability.armor < gearDurability.armorMax * 0.3
                        ? 108
                        : 78 - gearUpgrades.armor * 8 + damageRatio * 40
                            + (nextFloorNeedsProtection ? 30 : 0)
            },
            {
                type: 'sword',
                priority: 82 - gearUpgrades.sword * 8
                    + (botLearning.swordMisses > botLearning.swordHits ? 6 : 0)
            },
            {
                type: 'spear',
                priority: 68
            },
            {
                type: 'dash',
                priority: dashUpgradeOwned ? 0 : 72
            },
            {
                type: 'potion',
                priority: healingPotions.length === 0
                    ? 112 + (nextFloorNeedsProtection ? 24 : 0)
                    : 70 + damageRatio * 40 + (nextFloorNeedsProtection ? 20 : 0)
            },
            {
                type: 'arrows',
                priority: 58
            }
        ]
            .filter((option) => !exhaustedOptions.has(option.type))
            .filter((option) => (
                option.type !== 'potion'
                || (
                    healingPotions.length < GAME_BALANCE.economy.potionCapacity
                    && !purchased.includes('potion')
                )
            ))
            .filter((option) => (
                option.type !== 'arrows'
                || (bowOwned && arrowAmmo <= GAME_BALANCE.bow.ammoBundleSize
                    && !purchased.includes('arrows'))
            ))
            .filter((option) => (
                !['shield', 'armor'].includes(option.type)
                || !purchased.some((type) => type === 'shield' || type === 'armor')
            ))
            .filter((option) => option.type !== 'spear' || !spearOwned)
            .filter((option) => option.type !== 'dash' || !dashUpgradeOwned)
            .sort((first, second) => second.priority - first.priority);
        const option = options.find((candidate) => (
            getUpgradeCost(candidate.type) + reserve <= balance
        ));
        if (!option) {
            break;
        }
        const previousLevel = gearUpgrades[option.type];
        const previousPotionCount = healingPotions.length;
        const previousArrowAmmo = arrowAmmo;
        const ownedBeforePurchase = option.type === 'spear' ? spearOwned : false;
        const dashUpgradeBeforePurchase = dashUpgradeOwned;
        purchaseUpgrade(option.type);
        if (
            getOreCoinBalanceInCopper() < balance
            && (
                (option.type === 'potion' && healingPotions.length > previousPotionCount)
                || (option.type === 'arrows' && arrowAmmo > previousArrowAmmo)
                || (option.type === 'spear' && spearOwned && !ownedBeforePurchase)
                || (option.type === 'dash' && dashUpgradeOwned && !dashUpgradeBeforePurchase)
                || (option.type !== 'spear' && gearUpgrades[option.type] > previousLevel)
            )
        ) {
            purchased.push(option.type);
        } else {
            exhaustedOptions.add(option.type);
        }
    }
    setShopOpen(false);

    const remainingBalance = getOreCoinBalanceInCopper();
    if (purchased.length === 0) {
        botLearning.lastShopReport = `Economia: reservei ${remainingBalance} cobres para uma melhoria mais útil.`;
        info.textContent = botLearning.lastShopReport;
        return false;
    }
    const purchaseNames = {
        bow: 'arco',
        spear: 'lança',
        potion: 'poção comum',
        arrows: 'pacote de flechas',
        dash: 'dash melhorado',
        sword: `espada nível ${gearUpgrades.sword}`,
        shield: `escudo nível ${gearUpgrades.shield}`,
        armor: `armadura nível ${gearUpgrades.armor}`
    };
    const purchaseSummary = [...new Set(purchased.map((type) => purchaseNames[type]))].join(', ');
    botLearning.lastShopReport = `Economia: comprei ${purchaseSummary}; saldo guardado ${remainingBalance} cobres.`;
    info.textContent = botLearning.lastShopReport;
    updateBotStatus();
    return true;
}

function botGetDragonDodge(enemy, playerX, playerY) {
    const threats = [];
    const bossX = enemy.x + enemy.size / 2;
    const bossY = enemy.y + enemy.size / 2;
    if (enemy.fireballTarget && enemy.fireballWarning > 0) {
        const directionX = enemy.fireballTarget.x - bossX;
        const directionY = enemy.fireballTarget.y - bossY;
        const distance = Math.hypot(directionX, directionY) || 1;
        threats.push({
            directionX: directionX / distance,
            directionY: directionY / distance,
            time: enemy.fireballWarning
        });
    }

    for (const fireball of enemy.fireballs || []) {
        const speedSquared = fireball.velocityX ** 2 + fireball.velocityY ** 2;
        if (speedSquared === 0) {
            continue;
        }
        const time = Math.max(
            0,
            ((playerX - fireball.x) * fireball.velocityX
                + (playerY - fireball.y) * fireball.velocityY) / speedSquared
        );
        if (time > 1.1) {
            continue;
        }
        const closestX = fireball.x + fireball.velocityX * time;
        const closestY = fireball.y + fireball.velocityY * time;
        if (Math.hypot(playerX - closestX, playerY - closestY) > getCollisionRadius(player) + 12) {
            continue;
        }
        const speed = Math.sqrt(speedSquared);
        threats.push({
            directionX: fireball.velocityX / speed,
            directionY: fireball.velocityY / speed,
            time
        });
    }

    const threat = threats.sort((first, second) => first.time - second.time)[0];
    if (!threat) {
        return null;
    }

    const perpendicular = { x: -threat.directionY, y: threat.directionX };
    const offset = tileSize * 2;
    const options = [-1, 1].map((sign) => {
        const side = { x: perpendicular.x * sign, y: perpendicular.y * sign };
        const direction = botFindPathDirection(
            playerX + side.x * offset,
            playerY + side.y * offset,
            0,
            8
        );
        return {
            direction,
            progress: direction.x * side.x + direction.y * side.y
        };
    }).sort((first, second) => second.progress - first.progress);
    const bestOption = options[0];
    if (bestOption.progress <= 0) {
        return null;
    }
    return {
        direction: bestOption.direction,
        urgent: threat.time <= 0.3
    };
}

function botMoveTo(
    targetX,
    targetY,
    minRange = 0,
    maxRange = 10,
    dashIfFar = false,
    visibilityTarget = null
) {
    let direction = botFindPathDirection(
        targetX,
        targetY,
        minRange,
        maxRange,
        visibilityTarget
    );
    const distance = Math.hypot(
        targetX - (player.x + player.size / 2),
        targetY - (player.y + player.size / 2)
    );
    if (
        direction.x === 0
        && direction.y === 0
        && distance > maxRange
        && distance < maxRange + tileSize
    ) {
        const offsetX = targetX - (player.x + player.size / 2);
        const offsetY = targetY - (player.y + player.size / 2);
        direction = Math.abs(offsetX) > Math.abs(offsetY)
            ? { x: Math.sign(offsetX), y: 0 }
            : { x: 0, y: Math.sign(offsetY) };
    }
    botSetDirection(direction);
    if (
        dashIfFar
        && distance > 125
        && botHasLineOfSightFrom(
            player.x + player.size / 2,
            player.y + player.size / 2,
            targetX,
            targetY
        )
    ) {
        botTryDash(direction);
    }
}

function botFindMeleeRepositionTarget(playerX, playerY, targetX, targetY, attackRange) {
    const repositionDistance = Math.max(14, attackRange - 6);
    const startingAngle = Math.atan2(playerY - targetY, playerX - targetX);
    const candidates = [];
    for (let index = 0; index < 8; index += 1) {
        const angle = startingAngle + index * Math.PI / 4;
        const x = targetX + Math.cos(angle) * repositionDistance;
        const y = targetY + Math.sin(angle) * repositionDistance;
        if (
            Math.hypot(x - playerX, y - playerY) < 8
            || !canEntityMoveTo(player, x - player.size / 2, y - player.size / 2)
            || !hasClearMeleeAttackPath(x, y, targetX, targetY)
        ) {
            continue;
        }
        candidates.push({ x, y, distance: Math.hypot(x - playerX, y - playerY) });
    }
    candidates.sort((first, second) => first.distance - second.distance);
    return candidates[0] || null;
}

function botGetCreatureDodge(activeEnemies, playerX, playerY) {
    const threats = [];
    const playerRadius = getCollisionRadius(player);
    const addCircle = (x, y, radius, warning) => {
        if (warning > 0 && Math.hypot(playerX - x, playerY - y) <= radius + playerRadius + 36) {
            threats.push({
                type: 'circle',
                x,
                y,
                radius: radius + playerRadius,
                warning,
                dashWarningThreshold: 0.4
            });
        }
    };
    const addLine = (
        x,
        y,
        directionX,
        directionY,
        length,
        width,
        warning,
        dashWarningThreshold = 0.4
    ) => {
        if (warning <= 0) return;
        const offsetX = playerX - x;
        const offsetY = playerY - y;
        const along = offsetX * directionX + offsetY * directionY;
        const across = Math.abs(offsetX * directionY - offsetY * directionX);
        if (along >= -playerRadius && along <= length + playerRadius
            && across <= width + playerRadius + 30) {
            threats.push({
                type: 'line', x, y, directionX, directionY, length,
                width: width + playerRadius, warning, dashWarningThreshold
            });
        }
    };

    for (const enemy of activeEnemies) {
        const x = enemy.x + enemy.size / 2;
        const y = enemy.y + enemy.size / 2;
        const distance = Math.hypot(playerX - x, playerY - y);
        if (enemy.toxicBiteWarning > 0 && distance <= 42) {
            addCircle(x, y, 18, enemy.toxicBiteWarning);
        }
        if (enemy.slamWarning > 0) {
            const attack = getCreatureAttackData(enemy, 'siege-slam');
            addCircle(x, y, enemy.phaseTwo ? 94 : attack.radius, enemy.slamWarning);
        }
        if (enemy.veinPulseWarning > 0) {
            const attack = getCreatureAttackData(enemy, 'vein-pulse');
            addCircle(x, y, enemy.phaseTwo ? 94 : attack.radius, enemy.veinPulseWarning);
        }
        if (enemy.shoulderBashWarning > 0) {
            const attack = getCreatureAttackData(enemy, 'shoulder-bash');
            addLine(x, y, enemy.facingX, enemy.facingY, attack.range, attack.radius, enemy.shoulderBashWarning);
        }
        if (enemy.runnerLungeWarning > 0) {
            const attack = getCreatureAttackData(enemy, 'passing-thrust');
            addLine(x, y, enemy.runnerLungeX, enemy.runnerLungeY, attack.range, attack.radius, enemy.runnerLungeWarning);
        }
        if (enemy.dogPounceWarning > 0) {
            const attack = getCreatureAttackData(enemy, 'flank-bite');
            addLine(x, y, enemy.dogPounceX, enemy.dogPounceY, attack.range, attack.radius, enemy.dogPounceWarning);
        }
        if (enemy.sentinelBeamWarning > 0) {
            const attack = getCreatureAttackData(enemy, 'light-lance');
            addLine(x, y, enemy.sentinelBeamDirectionX, enemy.sentinelBeamDirectionY,
                attack.range, attack.radius, enemy.sentinelBeamWarning);
        }
        if (enemy.spiderWebTimer > 0 && enemy.spiderWebTarget?.entity === player) {
            const target = enemy.spiderWebTarget;
            const attackId = enemy.creatureType === 'matriarch'
                ? 'web-capture'
                : enemy.creatureType === 'sootSpider' ? 'soot-thread' : 'capture-thread';
            addCircle(target.x + target.size / 2, target.y + target.size / 2,
                getCreatureAttackData(enemy, attackId).radius, enemy.spiderWebTimer);
        }
        if (enemy.spiderLeapTimer > 0) {
            const attackId = enemy.creatureType === 'matriarch'
                ? 'collapse-leap'
                : enemy.creatureType === 'sootSpider' ? 'abrasive-leap' : 'rift-leap';
            const attack = getCreatureAttackData(enemy, attackId);
            addCircle(x + enemy.spiderLeapX, y + enemy.spiderLeapY,
                attack.radius, enemy.spiderLeapTimer);
        }
        if (enemy.isBoss && enemy.bossType === 'grimReaper'
            && enemy.scytheAttack?.phase === 'warning') {
            addLine(enemy.scytheAttack.originX, enemy.scytheAttack.originY,
                enemy.scytheAttack.directionX, enemy.scytheAttack.directionY,
                82,
                18,
                enemy.scytheAttack.timer,
                GAME_BALANCE.bosses.reaperBotDashWarningSeconds
            );
        }
        if (enemy.isBoss && enemy.bossType === 'grimReaper'
            && enemy.shadowStepWarning > 0 && enemy.shadowStepTarget) {
            addCircle(
                (enemy.shadowStepTarget.x + 0.5) * tileSize,
                (enemy.shadowStepTarget.y + 0.5) * tileSize,
                16,
                enemy.shadowStepWarning
            );
        }
        if (enemy.isBoss && enemy.bossType === 'dragon' && enemy.fireballTarget) {
            addCircle(enemy.fireballTarget.x, enemy.fireballTarget.y, 20, enemy.fireballWarning);
        }
        if (enemy.isBoss && enemy.bossType === 'dragon' && enemy.wingSweepWarning > 0) {
            const attack = getCreatureAttackData(enemy, 'wing-sweep');
            addLine(x, y, enemy.wingSweepDirectionX, enemy.wingSweepDirectionY,
                attack.range, attack.radius, enemy.wingSweepWarning);
        }
        for (const pool of enemy.lavaPools || []) {
            if (pool.warning > 0) addCircle(pool.x, pool.y, 28, pool.warning);
        }
        for (const rock of enemy.thrownRocks || []) {
            if (rock.phase === 'warning') addCircle(rock.targetX, rock.targetY, 20, rock.warning);
        }
        for (const eruption of enemy.eruptions || []) {
            if (eruption.warning > 0) {
                addCircle(eruption.x, eruption.y, eruption.radius || 32, eruption.warning);
            }
        }
        for (const fireball of enemy.fireballs || []) {
            const speed = Math.hypot(fireball.velocityX, fireball.velocityY) || 1;
            addLine(fireball.x, fireball.y, fireball.velocityX / speed, fireball.velocityY / speed,
                fireball.maxRange - fireball.traveled, 16, 0.3);
        }
    }

    if (threats.length === 0) return null;
    const candidates = [
        { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 },
        { x: 0.707, y: 0.707 }, { x: -0.707, y: 0.707 },
        { x: 0.707, y: -0.707 }, { x: -0.707, y: -0.707 }
    ].filter((direction) => canEntityMoveTo(
        player,
        player.x + direction.x * 22,
        player.y + direction.y * 22
    ));
    if (candidates.length === 0) return null;
    const scoreDirection = (direction) => {
        const nextX = playerX + direction.x * 42;
        const nextY = playerY + direction.y * 42;
        return threats.reduce((score, threat) => {
            if (threat.type === 'circle') {
                return score + Math.hypot(nextX - threat.x, nextY - threat.y) - threat.radius;
            }
            const offsetX = nextX - threat.x;
            const offsetY = nextY - threat.y;
            const along = offsetX * threat.directionX + offsetY * threat.directionY;
            const clampedAlong = Math.max(0, Math.min(threat.length, along));
            const nearestX = threat.x + threat.directionX * clampedAlong;
            const nearestY = threat.y + threat.directionY * clampedAlong;
            return score + Math.hypot(nextX - nearestX, nextY - nearestY) - threat.width;
        }, 0);
    };
    candidates.sort((first, second) => scoreDirection(second) - scoreDirection(first));
    const urgent = threats.some((threat) => (
        threat.warning < threat.dashWarningThreshold
    ));
    return { direction: candidates[0], urgent };
}

function botGetRetreatTriggers(localEnemies, healthRatio) {
    const config = GAME_BALANCE.bot.retreat;
    const threatDistance = Math.min(config.enemyDangerDistance, config.perceptionDistance);
    const nearby = localEnemies.filter((enemy) => (
        Math.hypot(
            enemy.x + enemy.size / 2 - (player.x + player.size / 2),
            enemy.y + enemy.size / 2 - (player.y + player.size / 2)
        ) <= threatDistance
    ));
    const triggers = [];
    if (config.triggers.lowHealth && healthRatio <= config.lowHealthRatio) {
        triggers.push('lowHealth');
    }
    if (config.triggers.outnumbered && nearby.length >= config.enemyCountThreshold) {
        triggers.push('outnumbered');
    }
    if (config.triggers.higherLevelEnemy && nearby.some((enemy) => (
        Number.isFinite(enemy.level)
        && enemy.level - playerProgress.level >= config.higherEnemyLevelDifference
    ))) {
        triggers.push('higherLevelEnemy');
    }
    if (config.triggers.noResources
        && ((healingPotions.length === 0 && healthRatio <= config.returnHealthRatio)
            || (bowOwned && arrowAmmo === 0 && nearby.length > 0))) {
        triggers.push('noResources');
    }
    if (config.triggers.environmentalDanger
        && (player.burnTimer > 0 || player.poisonTimer > 0)) {
        triggers.push('environmentalDanger');
    }
    if (config.debug && config.forceTrigger !== 'none'
        && !triggers.includes(config.forceTrigger)) {
        triggers.push(config.forceTrigger);
    }
    return { triggers, nearby };
}

function botTryStartRetreat(localEnemies, nearestEnemy, healthRatio) {
    const config = GAME_BALANCE.bot.retreat;
    if (!config.enabled) {
        return false;
    }
    const { triggers, nearby } = botGetRetreatTriggers(localEnemies, healthRatio);
    if (triggers.length === 0) {
        botRetreatState.lastAttemptKey = '';
        return false;
    }
    const healthSeverity = Math.max(0, Math.min(
        1,
        (config.lowHealthRatio - healthRatio) / Math.max(0.01, config.lowHealthRatio)
    ));
    const enemySeverity = nearby.length >= config.enemyCountThreshold
        ? Math.min(1, nearby.length / Math.max(1, config.enemyCountThreshold * 2))
        : 0;
    const severity = Math.max(
        triggers.includes('lowHealth') ? Math.max(0.35, healthSeverity) : 0,
        triggers.includes('outnumbered') ? Math.max(0.4, enemySeverity) : 0,
        triggers.includes('higherLevelEnemy') ? 0.65 : 0,
        triggers.includes('noResources') ? 0.45 : 0,
        triggers.includes('environmentalDanger') ? 0.65 : 0
    );
    const boss = nearby.find((enemy) => enemy.isBoss)
        || (nearestEnemy && nearestEnemy.enemy.isBoss ? nearestEnemy.enemy : null);
    const attemptKey = `${triggers.slice().sort().join(',')}:${Math.floor(severity * 4)}:${Boolean(boss)}`;
    if (
        botRetreatState.active
        || botRetreatState.cooldown > 0
        || botRetreatState.consecutive >= config.maximumConsecutiveRetreats
        || botRetreatState.lastAttemptKey === attemptKey
    ) {
        return botRetreatState.active;
    }
    botRetreatState.lastAttemptKey = attemptKey;
    const baseChance = Math.max(0, Math.min(100, config.baseChancePercent));
    const maxChance = Math.max(baseChance, Math.min(100, config.maximumChancePercent));
    let chance = baseChance + (maxChance - baseChance)
        * Math.pow(Math.max(0, Math.min(1, severity)), config.severityCurve);
    if (boss) {
        chance *= config.bossChanceMultiplier;
    }
    if (config.debug && config.forceTrigger !== 'none'
        && triggers.includes(config.forceTrigger)) {
        chance = 100;
    }
    chance = Math.max(0, Math.min(100, chance));
    if (Math.random() * 100 >= chance) {
        if (config.debug) {
            console.info(`[Bot] Não recuou (${triggers.join(', ')}; chance ${Math.round(chance)}%).`);
        }
        return false;
    }
    botRetreatState.active = true;
    botRetreatState.enemy = nearestEnemy?.enemy || nearby[0] || null;
    botRetreatState.elapsed = 0;
    botRetreatState.consecutive += 1;
    if (config.debug) {
        console.info(`[Bot] Recuou (${triggers.join(', ')}; vida ${Math.round(healthRatio * 100)}%, chance ${Math.round(chance)}%).`);
    }
    if (config.useHealingItem && healthRatio < config.returnHealthRatio && healingPotions.length > 0) {
        useHealingPotion();
    }
    return true;
}

function botContinueRetreat(delta, healthRatio, localEnemies) {
    if (!botRetreatState.active) {
        return false;
    }
    const config = GAME_BALANCE.bot.retreat;
    const playerX = player.x + player.size / 2;
    const playerY = player.y + player.size / 2;
    const enemy = botRetreatState.enemy && botRetreatState.enemy.health > 0
        ? botRetreatState.enemy
        : localEnemies[0] || null;
    const enemyDistance = enemy
        ? Math.hypot(
            enemy.x + enemy.size / 2 - playerX,
            enemy.y + enemy.size / 2 - playerY
        )
        : Infinity;
    const safeFromEnemies = localEnemies.every((nearbyEnemy) => (
        Math.hypot(
            nearbyEnemy.x + nearbyEnemy.size / 2 - playerX,
            nearbyEnemy.y + nearbyEnemy.size / 2 - playerY
        ) >= config.safeDistance
        && !botCanSeeEnemy(nearbyEnemy)
    ));
    const environmentalDanger = player.burnTimer > 0 || player.poisonTimer > 0;
    const recovered = healthRatio >= config.returnHealthRatio;
    if (
        botRetreatState.elapsed >= config.minimumDurationSeconds
        && !environmentalDanger
        && (safeFromEnemies || (recovered && localEnemies.length === 0))
    ) {
        botRetreatState.active = false;
        botRetreatState.cooldown = config.cooldownSeconds;
        botRetreatState.enemy = null;
        if (recovered) {
            botRetreatState.consecutive = 0;
        }
        if (config.debug) {
            console.info('[Bot] Recuada encerrada; retomando a exploração.');
        }
        return false;
    }

    let targetX;
    let targetY;
    if (enemy) {
        const dx = playerX - (enemy.x + enemy.size / 2);
        const dy = playerY - (enemy.y + enemy.size / 2);
        const length = Math.hypot(dx, dy) || 1;
        targetX = playerX + dx / length * config.safeDistance;
        targetY = playerY + dy / length * config.safeDistance;
    } else {
        targetX = (startPosition.x + 0.5) * tileSize;
        targetY = (startPosition.y + 0.5) * tileSize;
    }
    const direction = botFindPathDirection(targetX, targetY, 0, 8);
    if (direction.x === 0 && direction.y === 0) {
        botRetreatState.active = false;
        botRetreatState.cooldown = config.cooldownSeconds;
        botRetreatState.enemy = null;
        if (config.debug) {
            console.info('[Bot] Recuada impossível; retomando a decisão de combate.');
        }
        return false;
    }
    botSetDirection(direction);
    if (enemyDistance < config.enemyDangerDistance) {
        botTryDash(direction);
    }
    return true;
}

function botGetObjectTarget(
    playerX,
    playerY,
    intendedX,
    intendedY,
    enemiesNear,
    activeEnemies,
    allowedReasons = null
) {
    const config = GAME_BALANCE.bot.objects;
    if (
        !config.enabled
        || enemiesNear
        || botObjectQuietTime < config.quietTimeSeconds
        || botObjectsAttackedInInterval >= config.attacksPerInterval
    ) {
        return null;
    }
    const objects = [
        ...barrels.filter((object) => object.health > 0).map((object) => ({
            object,
            kind: 'barril'
        })),
        ...chests.filter((object) => object.health > 0 && !object.isMimic).map((object) => ({
            object,
            kind: 'baú'
        }))
    ].filter(({ object }) => (
        object.destructible !== false
        && !object.indestructible
        && !object.isMissionObject
        && !object.isMission
        && !object.mission
        && !object.isScenario
        && !object.isScenery
        && !object.scenery
        && !object.explosive
        && Math.hypot(
            (object.x + 0.5) * tileSize - playerX,
            (object.y + 0.5) * tileSize - playerY
        ) <= config.perceptionDistance
    ));
    if (objects.length === 0) {
        return null;
    }
    const forcedReason = config.debug ? config.forceTrigger : 'none';
    const hasResourcesNeed = (
        healingPotions.length === 0
        && player.health / player.maxHealth <= GAME_BALANCE.bot.retreat.returnHealthRatio
    ) || (bowOwned && arrowAmmo === 0);
    const lineX = intendedX - playerX;
    const lineY = intendedY - playerY;
    const lineLengthSquared = lineX ** 2 + lineY ** 2;
    const routeBlocked = botStuckTimer >= config.stuckSeconds;
    const candidates = objects.map(({ object, kind }) => {
        const objectX = (object.x + 0.5) * tileSize;
        const objectY = (object.y + 0.5) * tileSize;
        const along = lineLengthSquared > 0
            ? Math.max(0, Math.min(1,
                ((objectX - playerX) * lineX + (objectY - playerY) * lineY)
                    / lineLengthSquared))
            : 0;
        const lineDistance = Math.hypot(
            objectX - (playerX + along * lineX),
            objectY - (playerY + along * lineY)
        );
        const blocked = along > 0 && along < 1
            && lineDistance <= tileSize * config.blockedPathCorridor;
        const trapped = routeBlocked
            && lineDistance <= tileSize * config.blockedPathCorridor * 2;
        const cover = activeEnemies.some((enemy) => {
            const enemyX = enemy.x + enemy.size / 2;
            const enemyY = enemy.y + enemy.size / 2;
            const distance = Math.hypot(enemyX - playerX, enemyY - playerY);
            if (distance <= config.immediateThreatDistance) {
                return false;
            }
            const enemyAlong = ((objectX - playerX) * (enemyX - playerX)
                + (objectY - playerY) * (enemyY - playerY)) / (distance ** 2);
            const clampedAlong = Math.max(0, Math.min(1, enemyAlong));
            return enemyAlong > 0 && enemyAlong < 1
                && Math.hypot(
                    objectX - (playerX + clampedAlong * (enemyX - playerX)),
                    objectY - (playerY + clampedAlong * (enemyY - playerY))
                ) <= tileSize * config.blockedPathCorridor;
        });
        const reason = forcedReason !== 'none'
            ? forcedReason
            : blocked ? 'blocked'
                : trapped ? 'trapped'
                    : cover ? 'cover'
                        : hasResourcesNeed ? 'resource' : null;
        return {
            object,
            kind,
            objectX,
            objectY,
            distance: Math.hypot(objectX - playerX, objectY - playerY),
            reason
        };
    }).filter((candidate) => candidate.reason
        && (!allowedReasons || allowedReasons.includes(candidate.reason))
        && Object.prototype.hasOwnProperty.call(config.baseChancePercent, candidate.reason))
        .sort((first, second) => (
            config.baseChancePercent[second.reason] - config.baseChancePercent[first.reason]
            || first.distance - second.distance
        ));
    const target = candidates[0];
    if (!target) {
        botObjectLastAttemptKey = '';
        return null;
    }
    const attemptKey = `${target.object.x},${target.object.y}:${target.reason}`;
    if (attemptKey === botObjectLastAttemptKey) {
        return null;
    }
    botObjectLastAttemptKey = attemptKey;
    const chance = forcedReason === target.reason
        ? 100
        : Math.max(0, Math.min(100, config.baseChancePercent[target.reason]));
    if (Math.random() * 100 >= chance) {
        if (config.debug) {
            console.info(`[Bot] Ignorou ${target.kind} (${target.reason}; chance ${chance}%).`);
        }
        return null;
    }
    return target;
}

function botActOnObject(target, playerX, playerY) {
    const config = GAME_BALANCE.bot.objects;
    const distance = Math.hypot(target.objectX - playerX, target.objectY - playerY);
    if (distance > config.attackRange) {
        botMoveTo(target.objectX, target.objectY, 0, config.attackRange);
        return true;
    }
    const directionLength = distance || 1;
    player.facingX = (target.objectX - playerX) / directionLength;
    player.facingY = (target.objectY - playerY) / directionLength;
    if (Math.abs(player.facingX) > 0.1) {
        player.spriteFacingX = Math.sign(player.facingX);
    }
    if (!swordEquipped) {
        swordEquipped = true;
        updateSwordHud();
        updateSpecialAbilitiesHud();
    }
    if (player.attackCooldown <= 0) {
        attackWithSword();
        if (player.attackCooldown > 0) {
            botObjectsAttackedInInterval += 1;
            if (config.debug) {
                console.info(`[Bot] Atacou ${target.kind} (${target.reason}).`);
            }
        }
    }
    return true;
}

function updateBot(delta) {
    if (!botMode || !botLearning || gameState !== 'playing') {
        return;
    }
    botRetreatState.cooldown = Math.max(0, botRetreatState.cooldown - delta);
    if (botRetreatState.active) {
        botRetreatState.elapsed += delta;
    }
    botObjectAttackInterval += delta;
    if (botObjectAttackInterval >= GAME_BALANCE.bot.objects.intervalSeconds) {
        botObjectAttackInterval = 0;
        botObjectsAttackedInInterval = 0;
    }
    const threatDistance = GAME_BALANCE.bot.objects.immediateThreatDistance;
    const playerCenterX = player.x + player.size / 2;
    const playerCenterY = player.y + player.size / 2;
    if (botLastPosition && Math.hypot(
        playerCenterX - botLastPosition.x,
        playerCenterY - botLastPosition.y
    ) <= GAME_BALANCE.bot.objects.stuckDistance) {
        botStuckTimer += delta;
    } else {
        botStuckTimer = 0;
    }
    botLastPosition = { x: playerCenterX, y: playerCenterY };
    if (enemies.some((enemy) => enemy.health > 0 && !enemy.dying
        && Math.hypot(
            enemy.x + enemy.size / 2 - playerCenterX,
            enemy.y + enemy.size / 2 - playerCenterY
        ) <= threatDistance)) {
        botObjectQuietTime = 0;
    } else {
        botObjectQuietTime += delta;
    }
    trackBotEconomy();
    botStatusUpdateTimer -= delta;
    if (botStatusUpdateTimer <= 0) {
        botStatusUpdateTimer = 0.5;
        updateBotStatus();
        if (!botMode || botLearning.completed || gameState !== 'playing') {
            return;
        }
    }
    botDecisionTimer -= delta;
    if (botDecisionTimer > 0) {
        return;
    }
    botLearning.lastPerceptionDelta = delta;
    recordBotRouteStep();
    botPerceptionTimer -= delta;
    if (botPerceptionTimer <= 0) {
        botDiscoverEnvironment();
        botPerceptionTimer = 0.35;
    }
    botDecisionTimer = 0.08;
    for (const key of Object.keys(keys)) {
        keys[key] = false;
    }
    botAlignmentTarget = null;

    const healthRatio = player.health / player.maxHealth;
    const currentFloorDamage = botLearning.floorDamage[currentFloor] || 0;
    const potionThreshold = botLearning.previousRunNeedsCaution
        || currentFloorDamage >= player.maxHealth * 0.12
        ? 0.82
        : 0.72;
    const bestPotion = healingPotions.reduce(
        (best, potion) => Math.max(best, potion.rarity.potionHeal),
        0
    );
    const missingHealth = player.maxHealth - player.health;
    if (
        bestPotion > 0
        && player.health < player.maxHealth
        && healthRatio <= potionThreshold
        && missingHealth >= bestPotion * 0.7
    ) {
        useHealingPotion();
    }
    if (
        player.specialAbilityCharges.sword >= 100
        && player.specialAbilityCooldowns.sword <= 0
        && swordEquipped
    ) {
        activateSwordAreaSpecial();
    }
    if (botTryPurchase()) {
        updateBotStatus();
        return;
    }

    const playerX = player.x + player.size / 2;
    const playerY = player.y + player.size / 2;
    const activeEnemies = enemies.filter((enemy) => enemy.health > 0 && !enemy.dying);
    const creatureDodge = botGetCreatureDodge(
        activeEnemies.filter((enemy) => (
            botCanSeeEnemy(enemy)
            || (enemy.isBoss && enemy.bossType === 'grimReaper'
                && (enemy.scytheAttack || enemy.shadowStepWarning > 0))
        )),
        playerX,
        playerY
    );
    for (const enemy of activeEnemies) {
        if (botCanSeeEnemy(enemy)) {
            if (!botLearning.seenEnemies.has(enemy)) {
                recordBotEnemyEncounter(enemy);
            }
            botLearning.seenEnemies.add(enemy);
        }
    }
    recordBotRoomProgress();
    const explorationTarget = portalUnlocked
        ? null
        : botGetExplorationTarget(playerX, playerY);
    const localEnemies = activeEnemies.filter((enemy) => botKnowsEnemy(enemy));
    if (
        botLearning.blockedTarget
        && (!localEnemies.includes(botLearning.blockedTarget)
            || botLearning.blockedTarget.shieldDurability <= 0)
    ) {
        botLearning.blockedTarget = null;
    }
    const nearestEnemy = (botLearning.blockedTarget
        ? [botLearning.blockedTarget]
        : localEnemies)
        .map((enemy) => ({
            enemy,
            distance: Math.hypot(
                enemy.x + enemy.size / 2 - playerX,
                enemy.y + enemy.size / 2 - playerY
            )
        }))
        .sort((first, second) => first.distance - second.distance)[0];
    const nearbyEnemies = activeEnemies.filter((enemy) => (
        botKnowsEnemy(enemy)
        && Math.hypot(
            enemy.x + enemy.size / 2 - playerX,
            enemy.y + enemy.size / 2 - playerY
        ) < 96
    ));
    if (botTryStartRetreat(localEnemies, nearestEnemy, healthRatio)
        && botContinueRetreat(delta, healthRatio, localEnemies)) {
        updateBotStatus();
        return;
    }
    if (botRetreatState.active
        && botContinueRetreat(delta, healthRatio, localEnemies)) {
        updateBotStatus();
        return;
    }
    const priorShieldAbsorbed = botPersistentMemory.totalShieldAbsorbed + botLearning.shieldAbsorbed;
    const priorDamage = botPersistentMemory.totalDamage + botLearning.damageTaken;
    const shieldEffectiveness = priorShieldAbsorbed / Math.max(1, priorShieldAbsorbed + priorDamage);
    const shieldRange = 48 + Math.round(shieldEffectiveness * 24);
    const shieldThreat = nearbyEnemies.some((enemy) => (
        Math.hypot(
            enemy.x + enemy.size / 2 - playerX,
            enemy.y + enemy.size / 2 - playerY
        ) < shieldRange
        || (enemy.attackTimer > 0
            && Math.hypot(
                enemy.x + enemy.size / 2 - playerX,
                enemy.y + enemy.size / 2 - playerY
            ) < 88)
    )) || nearbyEnemies.length >= 2;

    if (gearOwned.shield && gearDurability.shield > 0 && shieldThreat !== shieldBlocking) {
        toggleShield();
    }

    if (nearestEnemy) {
        const enemyDistance = nearestEnemy.distance;
        const hasImmediateThreat = activeEnemies.some((enemy) => Math.hypot(
            enemy.x + enemy.size / 2 - playerX,
            enemy.y + enemy.size / 2 - playerY
        ) <= GAME_BALANCE.bot.objects.immediateThreatDistance);
        if (enemyDistance > GAME_BALANCE.bot.objects.immediateThreatDistance
            && !hasImmediateThreat) {
            const coverTarget = botGetObjectTarget(
                playerX,
                playerY,
                nearestEnemy.enemy.x + nearestEnemy.enemy.size / 2,
                nearestEnemy.enemy.y + nearestEnemy.enemy.size / 2,
                false,
                activeEnemies,
                ['blocked', 'trapped', 'cover']
            );
            if (coverTarget) {
                botActOnObject(coverTarget, playerX, playerY);
                updateBotStatus();
                return;
            }
        }
    }

    if (nearestEnemy) {
        const { enemy, distance } = nearestEnemy;
        const targetX = enemy.x + enemy.size / 2;
        const targetY = enemy.y + enemy.size / 2;
        const danger = healthRatio < 0.7 || botLearning.damageTaken > 24;
        const learnedPreference = getBotLearnedEnemyPreference(enemy);
        const learnedFlanking = (botLearning.blockedHits > 0 || learnedPreference.tactic === 'flank')
            && bowOwned;
        const needsMeleeFlank = botLearning.blockedTarget === enemy
            && enemy.shieldDurability > 0;
        const desiredRange = bowOwned
            ? Math.max(58, Math.min(132, botLearning.preferredRange))
            : 18;
        let approachX = targetX;
        let approachY = targetY;
        if (needsMeleeFlank) {
            const radialX = (playerX - targetX) / (distance || 1);
            const radialY = (playerY - targetY) / (distance || 1);
            const flankDistance = getCollisionRadius(enemy) + 7;
            approachX = targetX - radialX * flankDistance - radialY * botLearning.flankSign * 5;
            approachY = targetY - radialY * flankDistance + radialX * botLearning.flankSign * 5;
        }
        const canShoot = bowOwned
        && arrowAmmo > 0
        && distance <= GAME_BALANCE.bow.range
            && botHasLineOfSight(targetX, targetY);
        const dragonDodge = enemy.isBoss && enemy.bossType === 'dragon'
            ? botGetDragonDodge(enemy, playerX, playerY)
            : null;
        const canMelee = botHasLineOfSight(targetX, targetY)
            && hasClearMeleeAttackPath(playerX, playerY, targetX, targetY);
        const visibilityTarget = canMelee ? null : { x: targetX, y: targetY };
        const bowAttempts = botPersistentMemory.totalBowAttempts + botLearning.bowAttempts;
        const swordAttempts = botPersistentMemory.totalSwordAttempts + botLearning.swordAttempts;
        const bowHitRate = (botPersistentMemory.totalBowHits + botLearning.bowHits + 1)
            / (bowAttempts + 2);
        const swordHitRate = (botPersistentMemory.totalSwordHits + botLearning.swordHits + 1)
            / (swordAttempts + 2);
        const swordHasLearnedAdvantage = swordAttempts >= 4 && swordHitRate > bowHitRate + 0.2;
        const swordAttackRange = 30 + getCollisionRadius(player)
            + Math.max(0, getCollisionRadius(enemy) - 5);
        const spearAttackRange = 53 + getCollisionRadius(enemy);
        const meleeRange = Math.max(
            swordAttackRange,
            getCollisionRadius(enemy) + getCollisionRadius(player) + 8
        );
        const breakShieldWithSword = botLearning.blockedTarget === enemy
            && distance <= swordAttackRange + 64;
        const preferSword = !bowOwned
            || breakShieldWithSword
            || (canMelee && distance <= meleeRange)
            || ((!canShoot || arrowAmmo === 0) && distance <= 46)
            || (swordHasLearnedAdvantage && distance <= 72)
            || (learnedPreference.weapon === 'sword' && canMelee);
        const preferSpear = spearOwned
            && !breakShieldWithSword
            && distance > swordAttackRange
            && distance <= spearAttackRange
            && (!canShoot || !bowOwned || !preferSword
                || learnedPreference.weapon === 'spear');
        const meleeRepositionTarget = preferSword
            && !canMelee
            && distance <= swordAttackRange
            ? botFindMeleeRepositionTarget(
                playerX,
                playerY,
                targetX,
                targetY,
                swordAttackRange
            )
            : null;
        if (learnedPreference.tactic === 'flank' && enemy.shieldDurability > 0) {
            botLearning.blockedTarget = enemy;
        }
        if (swordEquipped !== preferSword) {
            swordEquipped = preferSword;
            updateSwordHud();
            updateSpecialAbilitiesHud();
        }
        if (learnedFlanking && canShoot) {
            const angle = Math.atan2(targetY - playerY, targetX - playerX)
                + botLearning.flankSign * Math.PI / 2;
            approachX += Math.cos(angle) * desiredRange;
            approachY += Math.sin(angle) * desiredRange;
        }

        player.facingX = (targetX - playerX) / (distance || 1);
        player.facingY = (targetY - playerY) / (distance || 1);
        if (Math.abs(player.facingX) > 0.1) {
            player.spriteFacingX = Math.sign(player.facingX);
        }

        if (preferSpear && canMelee) {
            attackWithSpear();
        } else if (canShoot && distance >= 34 && !preferSword) {
            fireArrow(targetX, targetY);
        } else if (swordEquipped && distance <= swordAttackRange && canMelee) {
            attackWithSword();
        }

        if (dragonDodge) {
            botSetDirection(dragonDodge.direction);
            if (dragonDodge.urgent) {
                botTryDash(dragonDodge.direction);
            }
        } else if (meleeRepositionTarget) {
            botMoveTo(
                meleeRepositionTarget.x,
                meleeRepositionTarget.y,
                0,
                8,
                false,
                visibilityTarget
            );
        } else if (needsMeleeFlank && distance > swordAttackRange) {
            botMoveTo(approachX, approachY, 0, 5, danger, visibilityTarget);
        } else if (preferSpear && distance > spearAttackRange) {
            botMoveTo(targetX, targetY, 0, spearAttackRange - 2, danger, visibilityTarget);
        } else if (preferSword && !preferSpear && distance > swordAttackRange) {
            botMoveTo(targetX, targetY, 0, 19, danger, visibilityTarget);
        } else if (!preferSword && bowOwned && canShoot && distance < desiredRange - 18) {
            const retreatAngle = Math.atan2(playerY - targetY, playerX - targetX);
            const retreat = botFindPathDirection(
                Math.max(8, Math.min(gridWidth - 8, playerX + Math.cos(retreatAngle) * desiredRange)),
                Math.max(8, Math.min(gridHeight - 8, playerY + Math.sin(retreatAngle) * desiredRange)),
                0,
                12
            );
            botSetDirection(retreat);
            if (danger && distance < 38) {
                botTryDash(retreat);
            }
        } else if (bowOwned && (!canShoot || arrowAmmo === 0)) {
            botMoveTo(targetX, targetY, 0, 24, true, visibilityTarget);
        } else if (
            !preferSword
            && bowOwned
            && distance <= desiredRange + 18
            && canShoot
        ) {
            botSetDirection({ x: 0, y: 0 });
        } else {
            botMoveTo(
                approachX,
                approachY,
                bowOwned ? Math.max(28, desiredRange - 8) : 7,
                bowOwned ? desiredRange + 8 : 20,
                false,
                visibilityTarget
            );
        }
    } else if (portalUnlocked) {
        const exitX = (exitPosition.x + 0.5) * tileSize;
        const exitY = (exitPosition.y + 0.5) * tileSize;
        const objectTarget = botGetObjectTarget(
            playerX,
            playerY,
            exitX,
            exitY,
            activeEnemies.some((enemy) => Math.hypot(
                enemy.x + enemy.size / 2 - playerX,
                enemy.y + enemy.size / 2 - playerY
            ) <= GAME_BALANCE.bot.objects.immediateThreatDistance),
            activeEnemies
        );
        if (objectTarget) {
            botActOnObject(objectTarget, playerX, playerY);
        } else {
            botMoveTo(exitX, exitY, 0, 7, true);
        }
    } else {
        if (explorationTarget) {
            const targetX = (explorationTarget.center.x + 0.5) * tileSize;
            const targetY = (explorationTarget.center.y + 0.5) * tileSize;
            const objectTarget = botGetObjectTarget(
                playerX,
                playerY,
                targetX,
                targetY,
                activeEnemies.some((enemy) => Math.hypot(
                    enemy.x + enemy.size / 2 - playerX,
                    enemy.y + enemy.size / 2 - playerY
                ) <= GAME_BALANCE.bot.objects.immediateThreatDistance),
                activeEnemies
            );
            if (objectTarget) {
                botActOnObject(objectTarget, playerX, playerY);
            } else {
                botMoveTo(targetX, targetY, 0, 8, true);
            }
        }
    }
    if (creatureDodge) {
        botSetDirection(creatureDodge.direction);
        if (creatureDodge.urgent) {
            botTryDash(creatureDodge.direction);
        }
    }
    updateBotStatus();
}
