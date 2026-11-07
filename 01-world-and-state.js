const canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');
const renderPixelScale = 3;
const bossPowerMultiplier = GAME_BALANCE.bosses.standardPowerMultiplier;
const bossIntelligenceMultiplier = GAME_BALANCE.bosses.intelligenceMultiplier;
ctx.imageSmoothingEnabled = false;
ctx.setTransform(1, 0, 0, 1, 0, 0);
ctx.scale(renderPixelScale, renderPixelScale);
let collectedMaterials = {};
let craftedItemQuantities = {};

function resetHeldInput() {
    Object.keys(keys).forEach((key) => {
        keys[key] = false;
    });
}
function getOccupiedInventorySlotCount() {
    const visibleItemSlots = inventoryItems.querySelectorAll(
        '.equipment-slot:not([hidden]), .inventory-scroll-slot:not([hidden]), .material-slot:not([hidden])'
    ).length;
    return visibleItemSlots + Object.values(craftedItemQuantities)
        .filter((quantity) => quantity > 0).length;
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        resetHeldInput();
        clearFloorMapPrefetch();
        if (typeof releaseHiddenRenderCaches === 'function') {
            releaseHiddenRenderCaches();
        }
        if (player && player.dashActive) {
            player.dashActive = false;
            player.dashTimer = 0;
            player.dashTarget = null;
        }
    } else {
        scheduleFloorMapPrefetch();
    }
});

window.addEventListener('pagehide', () => {
    if (typeof releaseHiddenRenderCaches === 'function') {
        releaseHiddenRenderCaches();
    }
});

window.addEventListener('blur', () => {
    resetHeldInput();
    if (player && player.dashActive) {
        player.dashActive = false;
        player.dashTimer = 0;
        player.dashTarget = null;
    }
});

function loadBossSpriteFrames(prefix, frameCount) {
    return Array.from({ length: frameCount }, (_, index) => {
        const frame = new Image();
        frame.src = `assets/${prefix}-${index}.png`;
        frame.onerror = () => console.error(`Falha ao carregar assets/${prefix}-${index}.png.`);
        return frame;
    });
}

function loadBossSprite(fileName) {
    const sprite = new Image();
    sprite.src = `assets/${fileName}`;
    sprite.onerror = () => console.error(`Falha ao carregar assets/${fileName}.`);
    return sprite;
}

const chestSprite = loadBossSprite('treasure-chest.png');
const barrelSprite = loadBossSprite('wooden-barrel.png');
const mimicChestSprite = loadBossSprite('mimic-chest-sprites.png');
const femalePlayerAnimationSheet = loadBossSprite('female-player-animations.png');
const malePlayerAnimationSheet = loadBossSprite('male-player-sprites.png');
const goblinAnimationSheet = loadBossSprite('goblin-animations.png');
const goblinRunnerAnimationSheet = loadBossSprite('goblin-runner-animations.png');
const spiderAnimationSheet = loadBossSprite('spider-animations.png');
const sootSpiderAnimationSheet = loadBossSprite('soot-spider-animations.png');
const matriarchSpiderAnimationSheet = loadBossSprite('matriarch-spider-animations.png');
const playerAttackAnimationSheet = loadBossSprite('player-attack-animation.png');
const susanoSpiritSprite = loadBossSprite('susano-guardian.png');
const playerAuraSprite = loadBossSprite('player-auras.png');
const playerAttackAnimationFrameCount = 12;
const playerAttackAnimationDuration = 0.14 / GAME_BALANCE.visual.playerAttackAnimationSpeedMultiplier;
const maleAttackAnimationDuration = 1 / GAME_BALANCE.visual.playerAttackAnimationSpeedMultiplier;
const conquestAuraTiers = [
    { name: 'verde', bonus: 12.5, color: '#39ef78' },
    { name: 'azul', bonus: 25, color: '#348dff' },
    { name: 'vermelha', bonus: 37.5, color: '#ff4148' },
    { name: 'dourada', bonus: 50, color: '#ffc447' },
    { name: 'roxa', bonus: 62.5, color: '#b54aff' },
    { name: 'branca', bonus: 75, color: '#f2efff' },
    { name: 'ciano', bonus: 87.5, color: '#36eaf3' },
    { name: 'vermelha final', bonus: 100, color: '#ff3038' }
];
const finalConquestAuraTier = conquestAuraTiers.length;
let femalePlayerAnimationFrameBounds = null;
let malePlayerAnimationFrameBounds = null;
let playerAttackAnimationFrameBounds = null;

const bossSpriteFrames = {
    lavaGolem: loadBossSpriteFrames('lava-golem', 8),
    dragon: loadBossSpriteFrames('dragon', 10),
    grimReaper: [loadBossSprite('grim-reaper-sheet.png')]
};
const restartBtn = document.getElementById('restartBtn');
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const humanModeButton = document.getElementById('humanModeButton');
const botModeButton = document.getElementById('botModeButton');
const devModeButton = document.getElementById('devModeButton');
const devToolsPanel = document.getElementById('devToolsPanel');
const devToolStatus = document.getElementById('devToolStatus');
const devToolButtons = Array.from(devToolsPanel.querySelectorAll('[data-dev-tool]'));
const devCreatureSelect = document.getElementById('devCreatureSelect');
for (const creature of creatureData) {
    const option = document.createElement('option');
    option.value = creature.creatureType;
    option.textContent = creature.name;
    devCreatureSelect.append(option);
}
const devPreviousFloorButton = document.getElementById('devPreviousFloorButton');
const devNextFloorButton = document.getElementById('devNextFloorButton');
const botModeStatus = document.getElementById('botModeStatus');
const botReviewStatus = document.getElementById('botReviewStatus');
const botAdviceStatus = document.getElementById('botAdviceStatus');
const botMemoryStatus = document.getElementById('botMemoryStatus');
const botMemoryActions = document.getElementById('botMemoryActions');
const exportBotMemoryButton = document.getElementById('exportBotMemoryButton');
const importBotMemoryButton = document.getElementById('importBotMemoryButton');
const importBotMemoryFile = document.getElementById('importBotMemoryFile');
const botMemoryActionStatus = document.getElementById('botMemoryActionStatus');
const botVictoryLetter = document.getElementById('botVictoryLetter');
const botVictoryLetterBody = document.getElementById('botVictoryLetterBody');
const botVictoryLetterCopy = document.getElementById('botVictoryLetterCopy');
const botVictoryLetterDownload = document.getElementById('botVictoryLetterDownload');
const botVictoryLetterClose = document.getElementById('botVictoryLetterClose');
const botVictoryLetterStatus = document.getElementById('botVictoryLetterStatus');
const botSpeedControls = document.getElementById('botSpeedControls');
const botSpeedButtons = Array.from(botSpeedControls.querySelectorAll('[data-bot-speed]'));
const stopBotButton = document.getElementById('stopBotButton');
const pageHeading = document.getElementById('pageHeading');
const manTab = document.getElementById('manTab');
const womanTab = document.getElementById('womanTab');
const gameActions = document.getElementById('gameActions');
const info = document.getElementById('info');
const gameHud = document.getElementById('gameHud');
const floorEventNotification = document.getElementById('floorEventNotification');
const floorEventNotificationTitle = document.getElementById('floorEventNotificationTitle');
const floorEventNotificationSummary = document.getElementById('floorEventNotificationSummary');
const questText = document.getElementById('questText');
const floorText = document.getElementById('floorText');
const levelText = document.getElementById('levelText');
const xpText = document.getElementById('xpText');
const xpTrack = document.getElementById('xpTrack');
const xpFill = document.getElementById('xpFill');
const levelUpgradePanel = document.getElementById('levelUpgradePanel');
const skillPointText = document.getElementById('skillPointText');
const investHealthButton = document.getElementById('investHealthButton');
const investMeleeButton = document.getElementById('investMeleeButton');
const investAimButton = document.getElementById('investAimButton');
const inventoryPanel = document.getElementById('inventoryPanel');
const inventoryItems = document.getElementById('inventoryItems');
const materialInventory = document.getElementById('materialInventory');
const materialInventoryItems = document.getElementById('materialInventoryItems');
const craftingRecipeList = document.getElementById('craftingRecipeList');
const playerHud = document.querySelector('.player-hud');
const scrollInventoryText = document.getElementById('scrollInventory');
const scrollGalleryOpenButton = document.getElementById('scrollGalleryOpenButton');
const scrollGalleryPanel = document.getElementById('scrollGalleryPanel');
const scrollGalleryCloseButton = document.getElementById('scrollGalleryCloseButton');
const swordSlot = document.getElementById('swordSlot');
const spearSlot = document.getElementById('spearSlot');
const bowSlot = document.getElementById('bowSlot');
const bowInventoryIcon = bowSlot.querySelector('.bow-inventory-icon');
const arrowCountText = document.getElementById('arrowCount');
const potionSlot = document.getElementById('potionSlot');
const potionCountText = document.getElementById('potionCount');
const shieldSlot = document.getElementById('shieldSlot');
const armorSlot = document.getElementById('armorSlot');
const shieldDurabilityFill = document.getElementById('shieldDurabilityFill');
const shieldDurabilityText = document.getElementById('shieldDurabilityText');
const shieldDurabilityTrack = document.getElementById('shieldDurabilityTrack');
const armorDurabilityFill = document.getElementById('armorDurabilityFill');
const armorDurabilityText = document.getElementById('armorDurabilityText');
const armorDurabilityTrack = document.getElementById('armorDurabilityTrack');
const shopPanel = document.getElementById('shopPanel');
const shopCloseButton = document.getElementById('shopCloseButton');
const shopCurrencyCount = document.getElementById('shopCurrencyCount');
const shopEquipmentStatus = document.getElementById('shopEquipmentStatus');
const shopItems = {
    sword: document.getElementById('upgradeSwordButton'),
    shield: document.getElementById('upgradeShieldButton'),
    armor: document.getElementById('upgradeArmorButton'),
    spear: document.getElementById('buySpearButton'),
    bow: document.getElementById('buyBowButton'),
    arrows: document.getElementById('buyArrowsButton'),
    dash: document.getElementById('buyDashUpgradeButton'),
    potion: document.getElementById('buyPotionButton')
};
const inventoryItemTitle = document.getElementById('inventoryItemTitle');
const inventoryItemDescription = document.getElementById('inventoryItemDescription');
const shopItemTitle = document.getElementById('shopItemTitle');
const shopItemDescription = document.getElementById('shopItemDescription');
const shopItemPurchaseButton = document.getElementById('shopItemPurchaseButton');
const shopAvailableOnlyFilter = document.getElementById('shopAvailableOnlyFilter');
let selectedShopItemType = null;
let shopPurchaseCounts = Object.fromEntries(Object.keys(shopItems).map((type) => [type, 0]));
const shopPurchasesPerLevelRequirementIncrease = 2;
const shopLevelValidationWarnings = new Set();
const oreCoinCounts = Object.fromEntries(
    ['copper', 'silver', 'emerald', 'ruby', 'gold'].map((ore) => [
        ore,
        document.getElementById(`${ore}CoinCount`)
    ])
);
const healthTrack = document.getElementById('healthTrack');
const healthFill = document.getElementById('healthFill');
const healthText = document.getElementById('healthText');
const specialAbilityTrackElements = {
    sword: document.getElementById('swordSpecialTrack'),
    conquest: document.getElementById('conquestSpecialTrack')
};
const specialAbilityDetailElements = {
    sword: document.getElementById('swordSpecialDetail'),
    conquest: document.getElementById('conquestSpecialDetail')
};
const specialAbilityButtons = Array.from(
    document.querySelectorAll('[data-special-select]')
);
const specialAbilitiesStatus = document.getElementById('specialAbilitiesStatus');
const specialAbilityActivateButton = document.getElementById('activateSpecialAbilityButton');
let selectedSpecialAbility = 'sword';

const tileSize = 16;
const playerCollisionWidth = tileSize;
const playerCollisionHeight = 28;
const femalePlayerSpriteHeight = 26;
const rows = 30;
const cols = 45;
const gridWidth = cols * tileSize;
const gridHeight = rows * tileSize;
const cameraViewportWidth = canvas.width / renderPixelScale;
const cameraViewportHeight = canvas.height / renderPixelScale;
let cameraX = 0;
let cameraY = 0;
let renderCameraX = 0;
let renderCameraY = 0;
const playerMaxHealth = 100;
const enemyDamage = GAME_BALANCE.enemies.defaultDamage;
const finalFloor = 20;
const playerDamageCooldown = 0.8;
const oreTypes = [
    { id: 'copper', name: 'cobre', shortName: 'Cu', spriteRow: 'bronze', copperValue: 1, dropWeight: GAME_BALANCE.economy.oreDropWeights.copper, outline: '#633c20', shadow: '#965428', body: '#d2873b', shine: '#ffe0a0' },
    { id: 'silver', name: 'prata', shortName: 'Ag', spriteRow: 'iron', copperValue: 2, dropWeight: 24, outline: '#4a4c4c', shadow: '#878b89', body: '#c9d0cb', shine: '#ffffff' },
    { id: 'emerald', name: 'esmeralda', shortName: 'Es', spriteRow: 'jade', copperValue: 1500, dropWeight: GAME_BALANCE.economy.oreDropWeights.emerald, outline: '#174a3b', shadow: '#16815d', body: '#32c58b', shine: '#b9ffe0' },
    { id: 'ruby', name: 'rubi', shortName: 'Ru', spriteRow: 'ruby', copperValue: 100, dropWeight: 2.5, outline: '#572327', shadow: '#972f3c', body: '#dc4b58', shine: '#ffc1a9' },
    { id: 'gold', name: 'ouro', shortName: 'Au', spriteRow: 'gold', copperValue: 10, dropWeight: 7, outline: '#694515', shadow: '#bd8528', body: '#f0c14c', shine: '#fff2aa' }
];
const oreDropSprites = Object.fromEntries(oreTypes.map((ore) => (
    [ore.id, loadBossSprite(`ore-${ore.spriteRow}-drop.png`)]
)));
const oreCurrencySpendOrder = ['emerald', 'ruby', 'gold', 'silver', 'copper'];
const itemRarities = [
    { id: 'common', name: 'comum', potionName: 'comum', rank: 0, dropWeight: 60, potionHeal: 35, itemDropChance: 0.03, accent: '#b68b55', dark: '#593b27', light: '#ead0a0', glow: 'rgba(182, 139, 85, 0.16)' },
    { id: 'uncommon', name: 'incomum', potionName: 'incomum', rank: 1, dropWeight: 25, potionHeal: 45, itemDropChance: 0.08, accent: '#6fae68', dark: '#274a35', light: '#c5ed9a', glow: 'rgba(111, 174, 104, 0.2)' },
    { id: 'rare', name: 'raro', potionName: 'rara', rank: 2, dropWeight: 10, potionHeal: 60, itemDropChance: 0.2, accent: '#5da8db', dark: '#26436a', light: '#b8e9ff', glow: 'rgba(93, 168, 219, 0.24)' },
    { id: 'epic', name: 'épico', potionName: 'épica', rank: 3, dropWeight: 4, potionHeal: 75, itemDropChance: 0.4, accent: '#b16cda', dark: '#4c2a68', light: '#f0bbff', glow: 'rgba(177, 108, 218, 0.28)' },
    { id: 'legendary', name: 'lendário', potionName: 'lendária', rank: 4, dropWeight: 1, potionHeal: 100, itemDropChance: 0.7, accent: '#efbd4e', dark: '#684417', light: '#fff0a0', glow: 'rgba(239, 189, 78, 0.34)' }
];
const scrollTypes = [
    { id: 'conquista', name: 'Pergaminho da conquista', file: 'scroll-conquista.png' },
    { id: 'poder', name: 'Pergaminho do poder', file: 'scroll-poder.png' },
    { id: 'alma', name: 'Pergaminho da alma', file: 'scroll-alma.png' },
    { id: 'sagrado', name: 'Pergaminho sagrado', file: 'scroll-sagrado.png' },
    { id: 'perdicao', name: 'Pergaminho da perdição', file: 'scroll-perdicao.png' }
];
const scrollSprites = scrollTypes.map(({ file }) => loadBossSprite(file));
const creatureMaterialIconSprites = new Map(
    creatureMaterialData.map((material) => [
        material.id,
        loadBossSprite(`creature-materials/${material.id}.png`)
    ])
);
const equipmentDropSprites = {
    arrows: loadBossSprite('inventory-items/arrows.png')
};
const potionIconSprites = new Map(
    itemRarities.map((rarity) => [
        rarity.id,
        loadBossSprite(`inventory-items/potion-${rarity.id}.png`)
    ])
);
function updateInventoryEmptySlots() {
    const occupiedSlots = getOccupiedInventorySlotCount();
    const emptySlots = inventoryItems.querySelectorAll('.inventory-empty-slot');
    const targetEmptySlots = Math.max(0, blacksmithConfig.inventorySlotCapacity - occupiedSlots);

    for (let index = targetEmptySlots; index < emptySlots.length; index++) {
        emptySlots[index].remove();
    }
    for (let index = emptySlots.length; index < targetEmptySlots; index++) {
        const emptySlot = document.createElement('span');
        emptySlot.className = 'inventory-empty-slot';
        emptySlot.setAttribute('aria-hidden', 'true');
        inventoryItems.append(emptySlot);
    }
}
function getMaterialDropSourceDescription(materialId) {
    const sources = creatureData.flatMap((creature) => creature.drops
        .filter((drop) => drop.id === materialId)
        .map((drop) => {
            const quantity = drop.min === drop.max
                ? `${drop.min}`
                : `${drop.min}–${drop.max}`;
            const chance = new Intl.NumberFormat('pt-BR', {
                style: 'percent',
                maximumFractionDigits: 0
            }).format(drop.chance);
            return `${creature.name} (${chance}; ${quantity} por drop)`;
        }));
    return sources.length > 0
        ? `Pode cair de: ${sources.join('; ')}.`
        : 'Não consta em drops de criaturas; pode ser obtido por fabricação.';
}

function updateMaterialInventoryHud() {
    materialInventoryItems.replaceChildren();
    for (const [materialId, quantity] of Object.entries(collectedMaterials)) {
        const material = creatureMaterialDataById[materialId];
        if (!material) {
            throw new Error(`Material desconhecido no inventário: ${materialId}.`);
        }
        const slot = document.createElement('button');
        slot.type = 'button';
        slot.className = 'inventory-slot material-slot';
        const sourceDescription = getMaterialDropSourceDescription(materialId);
        slot.setAttribute(
            'aria-label',
            `${material.name}. ${material.description} ${sourceDescription} Quantidade: ${quantity}.`
        );
        slot.title = `${material.name}. ${sourceDescription}`;
        const sprite = creatureMaterialIconSprites.get(materialId);
        if (!sprite) {
            throw new Error(`Ícone de material ausente no inventário: ${materialId}.`);
        }
        const icon = document.createElement('img');
        icon.className = 'material-pixel-icon';
        icon.src = sprite.src;
        icon.alt = '';
        icon.setAttribute('aria-hidden', 'true');
        const name = document.createElement('span');
        name.className = 'inventory-item-name';
        name.textContent = material.name;
        const detail = document.createElement('span');
        detail.className = 'inventory-item-detail';
        detail.textContent = material.description;
        const count = document.createElement('span');
        count.className = 'inventory-count';
        count.textContent = String(quantity);
        slot.append(icon, name, detail, count);
        materialInventoryItems.append(slot);
    }
    materialInventory.hidden = materialInventoryItems.childElementCount === 0;
    updateCraftingHud();
    updateInventoryEmptySlots();
}

function validateMaterialRecipeData() {
    const recipeIds = new Set();
    const missingMaterialReferences = [];
    const recipeResultIds = new Set(materialRecipeData.map((recipe) => recipe.result.id));
    for (const recipe of materialRecipeData) {
        if (recipeIds.has(recipe.id)) {
            throw new Error(`ID de receita duplicado: ${recipe.id}.`);
        }
        recipeIds.add(recipe.id);
        if (!['same', 'mix'].includes(recipe.type)
            || recipe.ingredients.length !== (recipe.type === 'same' ? 1 : 2)
            || !recipe.result.id
            || !recipe.result.name) {
            throw new Error(`Receita inválida: ${recipe.id}.`);
        }
        for (const ingredient of recipe.ingredients) {
            if (!Number.isInteger(ingredient.quantity)
                || ingredient.quantity <= 0) {
                throw new Error(`Ingrediente inválido na receita ${recipe.id}.`);
            }
            if (!creatureMaterialDataById[ingredient.materialId]
                && !recipeResultIds.has(ingredient.materialId)) {
                missingMaterialReferences.push(`${recipe.id}: ingrediente ${ingredient.materialId}`);
            }
        }
        if (recipe.attributes !== undefined && recipe.attributes !== null
            && typeof recipe.attributes !== 'object') {
            throw new Error(`Atributos inválidos na receita ${recipe.id}.`);
        }
        if (recipe.cost !== undefined && recipe.cost !== null
            && (typeof recipe.cost !== 'object'
                || !Number.isFinite(recipe.cost.amount)
                || recipe.cost.amount < 0
                || !oreTypes.some((ore) => ore.id === recipe.cost.resource))) {
            throw new Error(`Custo inválido na receita ${recipe.id}.`);
        }
        if (recipe.difficulty !== undefined && recipe.difficulty !== null
            && (!Number.isFinite(recipe.difficulty) || recipe.difficulty < 0)) {
            throw new Error(`Dificuldade inválida na receita ${recipe.id}.`);
        }
    }
    if (recipeIds.size === 0) {
        throw new Error('O catálogo de receitas está vazio.');
    }
    if (recipeIds.size !== 87) {
        console.info(`Catálogo de receitas carregado: ${recipeIds.size} entradas.`);
    }
    if (missingMaterialReferences.length > 0) {
        console.warn(
            'Receitas com ingredientes/resultados fora do catálogo de materiais:',
            missingMaterialReferences
        );
    }
}

function getMaterialRecipeResultMaterial(recipe) {
    return creatureMaterialDataById[recipe.result.id] || Object.values(creatureMaterialDataById).find(
        (material) => material.name === recipe.result.name
    ) || null;
}

function getCraftedItemStackKey(recipe) {
    return recipe.result.id;
}

function updateCraftingHud() {
    craftingRecipeList.replaceChildren();
    for (const recipe of materialRecipeData) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'inventory-slot crafting-recipe-button';
        button.dataset.recipeId = recipe.id;
        const ingredients = recipe.ingredients.map(({ materialId, quantity }) => (
            `${creatureMaterialDataById[materialId]?.name || materialId} × ${quantity}`
        ));
        const hasIngredients = recipe.ingredients.every(({ materialId, quantity }) => (
            (collectedMaterials[materialId] || 0) >= quantity
        ));
        const resultMaterial = getMaterialRecipeResultMaterial(recipe);
        const quantity = resultMaterial
            ? collectedMaterials[resultMaterial.id] || 0
            : craftedItemQuantities[getCraftedItemStackKey(recipe)] || 0;
        button.setAttribute('aria-disabled', String(!hasIngredients));
        button.setAttribute('aria-label',
            `${recipe.result.name}. Receita: ${ingredients.join(' + ')}. ${hasIngredients ? 'Clique para fabricar' : 'Materiais insuficientes'}.${quantity ? ` Quantidade no inventário: ${quantity}.` : ''}`);
        const title = document.createElement('span');
        title.className = 'inventory-item-name';
        title.textContent = recipe.result.name;
        const detail = document.createElement('span');
        detail.className = 'inventory-item-detail';
        detail.textContent = ingredients.join(' + ');
        const icon = document.createElement('img');
        icon.className = 'crafting-recipe-icon';
        icon.src = `assets/crafting-items/${recipe.id}.png`;
        icon.alt = '';
        icon.setAttribute('aria-hidden', 'true');
        const count = document.createElement('span');
        count.className = 'inventory-count';
        count.textContent = String(quantity);
        count.setAttribute('aria-hidden', 'true');
        count.hidden = quantity === 0;
        button.append(icon, title, detail, count);
        craftingRecipeList.append(button);
    }
}

function craftMaterialRecipe(recipeId) {
    const recipe = materialRecipeData.find((entry) => entry.id === recipeId);
    if (!recipe) {
        throw new Error(`Receita desconhecida: ${recipeId}.`);
    }
    if (!recipe.ingredients.every(({ materialId, quantity }) => (
        (collectedMaterials[materialId] || 0) >= quantity
    ))) {
        return false;
    }

    const remainingMaterials = { ...collectedMaterials };
    for (const { materialId, quantity } of recipe.ingredients) {
        remainingMaterials[materialId] -= quantity;
        if (remainingMaterials[materialId] === 0) {
            delete remainingMaterials[materialId];
        }
    }
    const resultMaterial = getMaterialRecipeResultMaterial(recipe);
    collectedMaterials = remainingMaterials;
    if (resultMaterial) {
        collectedMaterials[resultMaterial.id] = (collectedMaterials[resultMaterial.id] || 0) + 1;
    } else {
        const stackKey = getCraftedItemStackKey(recipe);
        craftedItemQuantities[stackKey] = (
            craftedItemQuantities[stackKey] || 0
        ) + 1;
    }
    updateMaterialInventoryHud();
    return true;
}

validateMaterialRecipeData();
updateInventoryEmptySlots();
const castleRoomRows = [0, 7, 15, 23];
const makeCastleFloorPlan = (title, hallName, wings, arena = null) => ({
    title,
    hub: 0,
    arena,
    rooms: [
        { x: 19, y: 0, width: 7, height: rows, name: hallName, role: 'hall' },
        ...wings.flatMap((wing, wingIndex) => wing.map((room, roomIndex) => ({
            x: wingIndex === 0 ? 0 : cols - room.width,
            y: castleRoomRows[roomIndex],
            width: room.width,
            height: room.height,
            name: room.name,
            role: room.role
        })))
    ]
});
const castleFloorPlans = {
    11: makeCastleFloorPlan('Alojamentos da guarda real', 'Salão central da guarda', [
        [
            { width: 10, height: 6, name: 'Alojamento dos lanceiros', role: 'barracks' },
            { width: 12, height: 7, name: 'Arsenal ocidental', role: 'armory' },
            { width: 11, height: 7, name: 'Quarto dos capitães', role: 'guard' },
            { width: 12, height: 7, name: 'Torre de vigia oeste', role: 'tower' }
        ],
        [
            { width: 11, height: 6, name: 'Alojamento dos arqueiros', role: 'barracks' },
            { width: 10, height: 7, name: 'Sala dos oficiais', role: 'guard' },
            { width: 12, height: 7, name: 'Arsenal oriental', role: 'armory' },
            { width: 11, height: 7, name: 'Torre de vigia leste', role: 'tower' }
        ]
    ]),
    12: makeCastleFloorPlan('Biblioteca e arquivo da torre', 'Salão dos escribas', [
        [
            { width: 12, height: 6, name: 'Arquivo de mapas', role: 'library' },
            { width: 10, height: 7, name: 'Biblioteca ocidental', role: 'library' },
            { width: 12, height: 7, name: 'Depósito de pergaminhos', role: 'service' },
            { width: 10, height: 7, name: 'Sala dos atlas', role: 'study' }
        ],
        [
            { width: 10, height: 6, name: 'Escritório do bibliotecário', role: 'study' },
            { width: 12, height: 7, name: 'Biblioteca oriental', role: 'library' },
            { width: 10, height: 7, name: 'Sala de copistas', role: 'study' },
            { width: 12, height: 7, name: 'Arquivo selado', role: 'secret' }
        ]
    ]),
    13: makeCastleFloorPlan('Arsenais e salão de armas', 'Salão de armas', [
        [
            { width: 11, height: 6, name: 'Câmara de armaduras', role: 'armory' },
            { width: 12, height: 7, name: 'Forja fria', role: 'forge' },
            { width: 10, height: 7, name: 'Torre dos arqueiros', role: 'tower' },
            { width: 12, height: 7, name: 'Oficina dos escudeiros', role: 'service' }
        ],
        [
            { width: 12, height: 6, name: 'Sala de estandartes', role: 'guard' },
            { width: 10, height: 7, name: 'Arsenal de lanças', role: 'armory' },
            { width: 12, height: 7, name: 'Depósito de escudos', role: 'armory' },
            { width: 10, height: 7, name: 'Oficina do armeiro', role: 'service' }
        ]
    ]),
    14: makeCastleFloorPlan('Grande salão e capela', 'Grande salão das colunas', [
        [
            { width: 10, height: 6, name: 'Galeria dos vitrais', role: 'gallery' },
            { width: 12, height: 7, name: 'Capela das brasas', role: 'chapel' },
            { width: 10, height: 7, name: 'Cozinha nobre', role: 'service' },
            { width: 12, height: 7, name: 'Adega do salão', role: 'service' }
        ],
        [
            { width: 12, height: 6, name: 'Sala dos cantores', role: 'gallery' },
            { width: 10, height: 7, name: 'Sacristia', role: 'chapel' },
            { width: 12, height: 7, name: 'Refeitório da corte', role: 'gallery' },
            { width: 10, height: 7, name: 'Despensa real', role: 'service' }
        ]
    ]),
    15: makeCastleFloorPlan('Laboratório e observatório arcano', 'Observatório do Ceifador', [
        [
            { width: 12, height: 6, name: 'Câmara de reagentes', role: 'laboratory' },
            { width: 10, height: 7, name: 'Laboratório de alquimia', role: 'laboratory' },
            { width: 12, height: 7, name: 'Torre astrolábica', role: 'tower' },
            { width: 10, height: 7, name: 'Capela selada', role: 'chapel' }
        ],
        [
            { width: 10, height: 6, name: 'Biblioteca proibida', role: 'library' },
            { width: 12, height: 7, name: 'Cofre arcano', role: 'treasury' },
            { width: 10, height: 7, name: 'Câmara de invocação', role: 'laboratory' },
            { width: 12, height: 7, name: 'Galeria astral', role: 'gallery' }
        ]
    ], { left: 17, right: 27, top: 10, bottom: 19 }),
    16: makeCastleFloorPlan('Câmaras de tesouro', 'Galeria do tesouro real', [
        [
            { width: 10, height: 6, name: 'Casa da moeda', role: 'treasury' },
            { width: 12, height: 7, name: 'Câmara de cofres', role: 'treasury' },
            { width: 10, height: 7, name: 'Posto da guarda real', role: 'guard' },
            { width: 12, height: 7, name: 'Depósito de oferendas', role: 'service' }
        ],
        [
            { width: 12, height: 6, name: 'Sala do tesoureiro', role: 'study' },
            { width: 10, height: 7, name: 'Câmara de relíquias', role: 'treasury' },
            { width: 12, height: 7, name: 'Tesouro das coroas', role: 'treasury' },
            { width: 10, height: 7, name: 'Cofre das joias', role: 'treasury' }
        ]
    ]),
    17: makeCastleFloorPlan('Ala nobre e salões privados', 'Salão de recepção da corte', [
        [
            { width: 11, height: 6, name: 'Aposentos ocidentais', role: 'chamber' },
            { width: 10, height: 7, name: 'Sala de audiências', role: 'hall' },
            { width: 12, height: 7, name: 'Torre da família real', role: 'tower' },
            { width: 10, height: 7, name: 'Galeria dos retratos', role: 'gallery' }
        ],
        [
            { width: 10, height: 6, name: 'Aposentos orientais', role: 'chamber' },
            { width: 12, height: 7, name: 'Sala de música', role: 'gallery' },
            { width: 10, height: 7, name: 'Sala de banquetes', role: 'gallery' },
            { width: 12, height: 7, name: 'Câmara dos conselheiros', role: 'chamber' }
        ]
    ]),
    18: makeCastleFloorPlan('Ala interditada e torres arcanas', 'Salão dos selos arcanos', [
        [
            { width: 12, height: 6, name: 'Torre ocidental', role: 'tower' },
            { width: 10, height: 7, name: 'Câmara interditada', role: 'secret' },
            { width: 12, height: 7, name: 'Arquivo selado', role: 'secret' },
            { width: 10, height: 7, name: 'Sala das correntes', role: 'guard' }
        ],
        [
            { width: 10, height: 6, name: 'Torre oriental', role: 'tower' },
            { width: 12, height: 7, name: 'Laboratório de runas', role: 'laboratory' },
            { width: 10, height: 7, name: 'Câmara de defesa', role: 'guard' },
            { width: 12, height: 7, name: 'Observatório arcano', role: 'laboratory' }
        ]
    ]),
    19: makeCastleFloorPlan('Defesas mágicas da coroa', 'Bastião central dos selos', [
        [
            { width: 10, height: 6, name: 'Torre de sinais', role: 'tower' },
            { width: 12, height: 7, name: 'Sala dos sentinelas', role: 'guard' },
            { width: 10, height: 7, name: 'Arsenal real', role: 'armory' },
            { width: 12, height: 7, name: 'Câmara de barreiras', role: 'laboratory' }
        ],
        [
            { width: 12, height: 6, name: 'Torre de escudos', role: 'tower' },
            { width: 10, height: 7, name: 'Câmara de contra-feitiços', role: 'laboratory' },
            { width: 12, height: 7, name: 'Cofre dos selos', role: 'treasury' },
            { width: 10, height: 7, name: 'Posto de vigília', role: 'guard' }
        ]
    ]),
    20: makeCastleFloorPlan('Sala do trono', 'Grande salão do trono', [
        [
            { width: 12, height: 6, name: 'Torre real ocidental', role: 'tower' },
            { width: 10, height: 7, name: 'Galeria dos estandartes', role: 'gallery' },
            { width: 12, height: 7, name: 'Guarda do portão', role: 'guard' },
            { width: 10, height: 7, name: 'Câmara das juramentações', role: 'chapel' }
        ],
        [
            { width: 10, height: 6, name: 'Torre real oriental', role: 'tower' },
            { width: 12, height: 7, name: 'Câmara dos conselheiros', role: 'chamber' },
            { width: 10, height: 7, name: 'Capela da coroa', role: 'chapel' },
            { width: 12, height: 7, name: 'Galeria dos tronos antigos', role: 'gallery' }
        ]
    ], { left: 17, right: 27, top: 9, bottom: 20 })
};
const castleCorridorPatterns = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [-1, 1, 0, -1, 1, 0, -1, 1],
    [1, -1, 0, 1, -1, 0, 1, -1],
    [0, 1, -1, 0, 1, 0, -1, 0],
    [-1, -1, 1, 1, 0, 1, -1, 0],
    [1, 0, 1, -1, -1, 0, -1, 1],
    [0, -1, 0, 1, 1, 0, 1, -1],
    [-1, 1, 0, -1, 1, -1, 0, 1],
    [1, 0, -1, 1, 0, 1, -1, 0],
    [0, 1, 1, 0, -1, 0, 0, -1]
];

const castleLayoutConfig = {
    width: cols,
    height: rows,
    corridorWidth: [3, 5],
    roomWidth: [13, 17],
    roomHeight: [11, 14],
    hallWidth: [24, 26],
    hallHeight: [15, 18],
    hallSpokes: [2, 4],
    archetypeWeights: {
        horizontal: 2,
        vertical: 2,
        lShape: 2,
        centralHall: 3
    }
};

function createCastleSeededRandom(seed) {
    let state = 2166136261;
    for (const character of String(seed)) {
        state = Math.imul(state ^ character.charCodeAt(0), 16777619);
    }
    state >>>= 0;
    if (state === 0) state = 0x6d2b79f5;
    return () => {
        state += 0x6d2b79f5;
        let value = state;
        value = Math.imul(value ^ (value >>> 15), value | 1);
        value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
        return ((value ^ (value >>> 14)) >>> 0) / 0x100000000;
    };
}

function generateCastleFloor(floorNumber, seed, retryAttempt = 0, originalSeed = seed) {
    if (!Number.isInteger(floorNumber) || floorNumber < 10 || floorNumber > finalFloor) {
        throw new RangeError(`Andar de castelo inválido: ${floorNumber}.`);
    }

    const floorRandom = (floor) => createCastleSeededRandom(`${seed}:${floor}:archetype`);
    const forcedBossHallFloors = new Set([10, 15, finalFloor]);
    let previousArchetype = null;
    let archetype = null;
    for (let floor = 10; floor <= floorNumber; floor += 1) {
        const random = floorRandom(floor);
        if (forcedBossHallFloors.has(floor)) {
            archetype = 'centralHall';
        } else {
            const choices = Object.entries(castleLayoutConfig.archetypeWeights)
                .filter(([name]) => name !== previousArchetype
                    && !(floor === finalFloor - 1 && name === 'centralHall')
                    && !(floor === 14 && name === 'centralHall'));
            const totalWeight = choices.reduce((sum, [, weight]) => sum + weight, 0);
            let choice = random() * totalWeight;
            archetype = choices[choices.length - 1][0];
            for (const [name, weight] of choices) {
                choice -= weight;
                if (choice < 0) {
                    archetype = name;
                    break;
                }
            }
        }
        previousArchetype = archetype;
    }

    const random = createCastleSeededRandom(`${seed}:${floorNumber}:geometry`);
    const integer = (minimum, maximum) => (
        minimum + Math.floor(random() * (maximum - minimum + 1))
    );
    const corridorWidth = integer(...castleLayoutConfig.corridorWidth);
    const grid = Array.from({ length: rows }, () => Array(cols).fill('#'));
    const rooms = [];
    const doors = [];
    const corridors = [];
    const objects = [];
    const spawns = [];
    const template = castleFloorPlans[floorNumber] || castleFloorPlans[11];
    const themedRooms = template.rooms
        .filter((room) => room.role !== 'hall' && room.role !== 'stair')
        .slice();
    for (let index = themedRooms.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(random() * (index + 1));
        [themedRooms[index], themedRooms[swapIndex]] = [
            themedRooms[swapIndex],
            themedRooms[index]
        ];
    }
    let themedRoomIndex = 0;
    const decorationRolesByFloor = {
        10: ['gallery', 'armory', 'guard'],
        11: ['barracks', 'guard', 'service', 'armory'],
        12: ['library', 'study', 'service', 'tower'],
        13: ['armory', 'guard', 'guard', 'service'],
        14: ['chapel', 'chapel', 'chapel', 'gallery'],
        15: ['laboratory', 'laboratory', 'tower', 'chapel'],
        16: ['treasury', 'treasury', 'tower', 'guard'],
        17: ['chamber', 'chamber', 'chamber', 'gallery'],
        18: ['secret', 'secret', 'gallery', 'guard'],
        19: ['laboratory', 'laboratory', 'tower', 'armory'],
        20: ['gallery', 'secret', 'tower', 'treasury']
    };
    const requiredRoomRoles = decorationRolesByFloor[floorNumber];
    const title = floorNumber === 10 ? 'Bastião das muralhas' : template.title;
    const hallTheme = template.rooms.find((room) => room.role === 'hall');
    const addRoom = (x, y, width, height, role, options = {}) => {
        const theme = themedRooms[themedRoomIndex % themedRooms.length];
        themedRoomIndex += 1;
        const room = {
            x,
            y,
            width,
            height,
            name: options.name || theme?.name || 'Câmara lateral',
            role: options.role || role || theme?.role || 'service',
            center: { x: x + Math.floor(width / 2), y: y + Math.floor(height / 2) },
            ...options
        };
        rooms.push(room);
        for (let row = y; row < y + height; row += 1) {
            for (let col = x; col < x + width; col += 1) {
                grid[row][col] = row === y || row === y + height - 1
                    || col === x || col === x + width - 1
                    ? '#'
                    : '.';
            }
        }
        return room;
    };
    const carveSegment = (start, end) => {
        const horizontal = start.y === end.y;
        if (!horizontal && start.x !== end.x) {
            throw new Error(
                `Trecho de corredor não ortogonal: ${start.x},${start.y} até ${end.x},${end.y}.`
            );
        }
        const direction = horizontal
            ? Math.sign(end.x - start.x) || 1
            : Math.sign(end.y - start.y) || 1;
        const halfWidth = Math.floor(corridorWidth / 2);
        const length = horizontal
            ? Math.abs(end.x - start.x)
            : Math.abs(end.y - start.y);
        for (let step = 0; step <= length; step += 1) {
            const x = horizontal ? start.x + step * direction : start.x;
            const y = horizontal ? start.y : start.y + step * direction;
            for (let offset = -halfWidth; offset <= halfWidth; offset += 1) {
                const corridorX = horizontal ? x : x + offset;
                const corridorY = horizontal ? y + offset : y;
                if (corridorX > 0 && corridorX < cols - 1
                    && corridorY > 0 && corridorY < rows - 1) {
                    grid[corridorY][corridorX] = '.';
                    corridors.push({ x: corridorX, y: corridorY });
                }
            }
        }
    };
    const connectRoom = (room, side, target, makeDoor = true) => {
        const isHorizontal = side === 'top' || side === 'bottom';
        const aligned = isHorizontal
            ? Math.max(room.x + 1, Math.min(room.x + room.width - 2, target.x))
            : Math.max(room.y + 1, Math.min(room.y + room.height - 2, target.y));
        const boundary = side === 'top'
            ? { x: aligned, y: room.y }
            : side === 'bottom'
                ? { x: aligned, y: room.y + room.height - 1 }
                : side === 'left'
                    ? { x: room.x, y: aligned }
                    : { x: room.x + room.width - 1, y: aligned };
        const outside = {
            x: boundary.x + (side === 'left' ? -1 : side === 'right' ? 1 : 0),
            y: boundary.y + (side === 'top' ? -1 : side === 'bottom' ? 1 : 0)
        };
        const pairId = `castle-${floorNumber}-${room.x},${room.y}-${side}`;
        const span = Math.min(corridorWidth, isHorizontal ? room.width - 2 : room.height - 2);
        const spanStart = Math.floor((span - 1) / 2);
        const startOffset = isHorizontal
            ? Math.max(room.x + 1, Math.min(room.x + room.width - 1 - span, aligned - spanStart))
            : Math.max(room.y + 1, Math.min(room.y + room.height - 1 - span, aligned - spanStart));
        for (let index = 0; index < span; index += 1) {
            const x = isHorizontal ? startOffset + index : boundary.x;
            const y = isHorizontal ? boundary.y : startOffset + index;
            grid[y][x] = '.';
            if (makeDoor) {
                doors.push({
                    x,
                    y,
                    orientation: isHorizontal ? 'horizontal' : 'vertical',
                    pairId,
                    pairIndex: index,
                    span,
                    progress: 0
                });
            }
        }
        const bend = isHorizontal
            ? { x: outside.x, y: target.y }
            : { x: target.x, y: outside.y };
        carveSegment(outside, bend);
        carveSegment(bend, target);
    };
    const addRewardRoomObject = (room) => {
        room.shortDeadEnd = true;
        room.reward = 'chest';
        objects.push({
            type: 'chest',
            x: room.x + 2,
            y: room.y + 2,
            room: room.name
        });
        spawns.push({
            x: room.center.x,
            y: room.center.y,
            profile: 'room-guard',
            room: room.name
        });
    };
    const addSideRoom = (x, y, width, height, side, target, options = {}) => {
        const room = addRoom(x, y, width, height, 'service');
        Object.assign(room, options);
        connectRoom(room, side, target);
        if (!room.safeForSecret) addRewardRoomObject(room);
        return room;
    };
    const addStairRoom = (x, y, width, height, stairDirection, name) => (
        addRoom(x, y, width, height, 'stair', {
            name,
            isStair: true,
            stairDirection,
            safeForNpc: stairDirection === 'up'
        })
    );
    let hub = null;
    let start = null;
    let exit = null;
    let arena = null;

    if (archetype === 'horizontal') {
        start = addStairRoom(1, 11, 9, 9, 'up', 'Entrada oeste');
        exit = addStairRoom(35, 11, 9, 9, 'down', 'Escada leste');
        const centerY = start.center.y;
        carveSegment(start.center, exit.center);
        addSideRoom(10, 1, 16, 10, 'bottom', { x: 16, y: centerY }, {
            safeForSecret: floorNumber === 16
        });
        addSideRoom(28, 1, 16, 10, 'bottom', { x: 29, y: centerY });
        addSideRoom(10, 19, 16, 10, 'top', { x: 16, y: centerY });
        addSideRoom(28, 19, 16, 10, 'top', { x: 29, y: centerY });
    } else if (archetype === 'vertical') {
        exit = addStairRoom(18, 1, 9, 8, 'down', 'Escada norte');
        start = addStairRoom(18, 21, 9, 8, 'up', 'Entrada sul');
        carveSegment(exit.center, start.center);
        [
            { x: 1, y: 2, height: 9, width: 17,
                side: 'right', target: { x: 22, y: 6 } },
            { x: 27, y: 2, height: 9, width: 17,
                side: 'left', target: { x: 22, y: 6 } },
            { x: 1, y: 11, height: 9, width: 17,
                side: 'right', target: { x: 22, y: 15 } },
            { x: 27, y: 11, height: 9, width: 17,
                side: 'left', target: { x: 22, y: 15 } },
            { x: 1, y: 20, height: 9, width: 17,
                side: 'right', target: { x: 22, y: 24 } },
            { x: 27, y: 20, height: 9, width: 17,
                side: 'left', target: { x: 22, y: 24 } }
        ].forEach(({ x, y, width, height, side, target }) => {
            addSideRoom(x, y, width, height, side, target, {
                safeForSecret: floorNumber === 16 && y === 11 && x === 1
            });
        });
    } else if (archetype === 'lShape') {
        start = addStairRoom(1, 16, 9, 9, 'up', 'Entrada oeste');
        exit = addStairRoom(19, 1, 10, 9, 'down', 'Escada norte');
        hub = addRoom(14, 12, 16, 16, 'hall', {
            name: hallTheme?.name || 'Sala da encruzilhada'
        });
        carveSegment(start.center, hub.center);
        const exitApproach = { x: hub.center.x, y: exit.center.y };
        carveSegment(hub.center, exitApproach);
        carveSegment(exitApproach, exit.center);
        addSideRoom(1, 2, 13, 12, 'bottom', { x: 5, y: 20 });
        addSideRoom(30, 1, 14, 13, 'left', { x: 23, y: 6 }, {
            safeForSecret: floorNumber === 16
        });
        addSideRoom(30, 16, 14, 14, 'left', { x: 28, y: 23 });
    } else {
        const hallWidth = forcedBossHallFloors.has(floorNumber)
            ? integer(25, castleLayoutConfig.hallWidth[1])
            : integer(...castleLayoutConfig.hallWidth);
        const hallHeight = floorNumber === 16
            ? integer(16, 17)
            : forcedBossHallFloors.has(floorNumber)
                ? 18
                : integer(...castleLayoutConfig.hallHeight);
        const hallX = Math.floor((cols - hallWidth) / 2);
        const hallY = Math.floor((rows - hallHeight) / 2);
        hub = addRoom(hallX, hallY, hallWidth, hallHeight, 'hall', {
            name: hallTheme?.name || 'Grande salão central',
            isArena: forcedBossHallFloors.has(floorNumber)
        });
        const center = hub.center;
        const leftStair = addStairRoom(1, center.y - 4, 9, 9, 'up', 'Entrada oeste');
        const rightStair = addStairRoom(cols - 10, center.y - 4, 9, 9, 'down', 'Escada leste');
        start = leftStair;
        exit = rightStair;
        connectRoom(leftStair, 'right', center, false);
        connectRoom(rightStair, 'left', center, false);
        const spokeCount = forcedBossHallFloors.has(floorNumber)
            ? castleLayoutConfig.hallSpokes[1]
            : Math.max(
                integer(...castleLayoutConfig.hallSpokes),
                2 + Math.min(requiredRoomRoles.length, 2)
            );
        const optionalSpokes = random() < 0.5 ? ['top', 'bottom'] : ['bottom', 'top'];
        for (const side of optionalSpokes.slice(0, spokeCount - 2)) {
            if (side === 'top') {
                const room = addSideRoom(
                    center.x - 12,
                    1,
                    24,
                    hub.y - 1,
                    'bottom',
                    {
                        x: center.x,
                        y: hub.y
                    }
                );
                room.safeForNpc = true;
                room.safeForSecret = floorNumber === 16;
            } else {
                const bottomRoomY = hub.y + hub.height;
                addSideRoom(center.x - 12, bottomRoomY, 24, rows - bottomRoomY, 'top', {
                    x: center.x,
                    y: hub.y + hub.height - 1
                });
            }
        }
        if (hub.isArena) {
            arena = {
                left: hub.x + 1,
                right: hub.x + hub.width - 2,
                top: hub.y + 1,
                bottom: hub.y + hub.height - 2
            };
        }
        for (let y = hub.y + 3; y < hub.y + hub.height - 2; y += 4) {
            for (let x = hub.x + 3; x < hub.x + hub.width - 2; x += 5) {
                spawns.push({
                    x,
                    y,
                    profile: 'hall-group',
                    room: hub.name
                });
            }
        }
    }

    if (archetype !== 'centralHall') {
        const profile = archetype === 'horizontal' || archetype === 'vertical'
            ? 'corridor-ambush'
            : 'crossroads-guard';
        for (const point of corridors) {
            if (point.x % 4 === 0 && point.y % 4 === 0) {
                spawns.push({ ...point, profile, room: null });
            }
        }
    }
    const roleRooms = rooms
        .filter((room) => room !== hub)
        .sort((first, second) => (
            ((first.isStair ? 2 : 0) + (first.safeForSecret ? 1 : 0))
            - ((second.isStair ? 2 : 0) + (second.safeForSecret ? 1 : 0))
        ));
    if (requiredRoomRoles.length > roleRooms.length) {
        throw new Error(`O andar ${floorNumber} não reservou salas suficientes para a decoração.`);
    }
    for (const [index, role] of requiredRoomRoles.entries()) {
        roleRooms[index].role = role;
    }
    const contains = (point) => point
        && point.x >= 1 && point.x < cols - 1
        && point.y >= 1 && point.y < rows - 1
        && grid[point.y][point.x] === '.';
    const queue = [start.center];
    const visited = new Set([`${start.center.x},${start.center.y}`]);
    for (let index = 0; index < queue.length; index += 1) {
        const point = queue[index];
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const next = { x: point.x + dx, y: point.y + dy };
            const key = `${next.x},${next.y}`;
            if (contains(next) && !visited.has(key)) {
                visited.add(key);
                queue.push(next);
            }
        }
    }
    if (!visited.has(`${exit.center.x},${exit.center.y}`)) {
        if (retryAttempt >= 5) {
            throw new Error(`O layout do andar ${floorNumber} não conecta entrada e escada após 5 tentativas.`);
        }
        return generateCastleFloor(
            floorNumber,
            `${originalSeed}:retry:${retryAttempt + 1}`,
            retryAttempt + 1,
            originalSeed
        );
    }
    const floorLayer = grid.map((row) => row.map((tile) => tile === '#' ? null : 'stone'));
    const wallLayer = grid.map((row) => row.map((tile) => tile === '#' ? 'castle-wall' : null));
    const safeNpcRoom = rooms.find((room) => room.safeForNpc && !room.isStair)
        || rooms.find((room) => room.safeForNpc)
        || null;
    return {
        floorNumber,
        seed: originalSeed,
        archetype,
        title,
        grid,
        rooms,
        doors,
        corridorWidth,
        corridorCells: [...new Set(corridors.map(({ x, y }) => `${x},${y}`))],
        start: start.center,
        exit: exit.center,
        hub: hub ? rooms.indexOf(hub) : 0,
        arena,
        npcSlot: safeNpcRoom
            ? { room: safeNpcRoom.name, x: safeNpcRoom.center.x, y: safeNpcRoom.center.y }
            : null,
        objects,
        spawns,
        layers: {
            floor: floorLayer,
            walls: wallLayer,
            objects,
            spawns
        },
        contamination: (floorNumber - 10) / (finalFloor - 10)
    };
}

function chooseOreDrop() {
    const totalWeight = oreTypes.reduce((total, ore) => total + ore.dropWeight, 0);
    let choice = Math.random() * totalWeight;
    for (const ore of oreTypes) {
        choice -= ore.dropWeight;
        if (choice < 0) {
            return ore;
        }
    }
    return oreTypes[0];
}

function chooseItemRarity() {
    const totalWeight = itemRarities.reduce((total, rarity) => total + rarity.dropWeight, 0);
    let choice = Math.random() * totalWeight;
    for (const rarity of itemRarities) {
        choice -= rarity.dropWeight;
        if (choice < 0) {
            return rarity;
        }
    }
    return itemRarities[0];
}

const keys = {
    Shift: false,
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    Space: false,
    r: false,
    w: false,
    s: false,
    a: false,
    d: false
};

let swordEquipped = true;
let spearOwned = false;
let bowOwned = false;
let arrowAmmo = 0;
let dashUpgradeOwned = false;
let arrows = [];
const arrowPool = [];
let botMode = false;
let devMode = false;
let devTool = 'wall';
let devSelectedEntity = null;
let devSelectedWall = null;
let devCreatureType = 'goblin';
let selectedGameMode = 'human';
let botLearning = null;
let selectedCharacter = 'man';
let currentFloor = 1;
let playerProgress = {
    level: 1,
    xp: 0,
    xpToNext: 100,
    skillPoints: 0,
    attributes: { health: 0, meleeDamage: 0, aim: 0 }
};
let healingPotions = [];
const scrollInventory = Object.fromEntries(scrollTypes.map((scroll) => [scroll.id, 0]));
let gearUpgrades = { sword: 0, shield: 0, armor: 0 };
let gearOwned = { shield: false, armor: false };
let gearDurability = { shield: 0, shieldMax: 0, armor: 0, armorMax: 0 };
let shieldBlocking = false;
let shopOpen = false;
let scrollGalleryOpen = false;
let floorKillCount = 0;
let floorKillGoal = 5;
let portalUnlocked = false;
let bossDefeatedThisFloor = false;
let raceWarActive = false;
let activeFloorEncounterId = null;
let activeFloorEncounterPosition = null;
let activeFloorEncounterBounds = null;
let activeFloorEncounterStarted = false;
let floorEncounterRewardGranted = false;
let secretMatriarchChamber = null;
let secretRooms = [];
let matriarchArena = null;
const secretRoomProgressStorageKey = 'mm-secret-room-progress-v1';
const matriarchArenaConfig = Object.freeze({
    floor: 8,
    bounds: { x: 15, y: 8, width: 18, height: 12 },
    secretBounds: { x: 32, y: 10, width: 10, height: 8 },
    broodCount: 2,
    webSlowMultiplier: 0.62,
    phaseTwoHealthRatio: 0.5
});
const secretRoomDefinitions = Object.freeze([
    {
        id: 'matriarch-old-nest',
        floor: 8,
        bounds: matriarchArenaConfig.secretBounds,
        gate: { x: 32, y: 14 },
        trigger: {
            type: 'destroy-object',
            objectId: 'old-nest-cocoon',
            position: { x: 31, y: 14 }
        },
        clue: 'A teia mais densa esconde a marca de uma coroa rachada.',
        reward: { materials: { 'chitin-pearl': 1, 'thick-silk': 3 } },
        chest: { x: 37, y: 12 },
        diary: { x: 37, y: 15 },
        lore: 'Diário de um mineiro: “O calor sobe pelas galerias e a contaminação vem junto. Os ovos deste ninho já estavam aqui antes da Matriarca. A pedra continua quente mesmo quando a fornalha se apaga.”'
    }
]);
let reducedVisualEffects = false;
let lastBossType = null;
let waveNumber = 0;
let player;
let enemies;
let enemyEquipmentBatch = [];
let enemyCreatureBatch = [];

let floorEventNotificationTimer = null;

function showFloorEventNotification(event) {
    floorEventNotificationTitle.textContent = event.title;
    floorEventNotificationSummary.textContent = event.summary;
    floorEventNotification.hidden = false;
    clearTimeout(floorEventNotificationTimer);
    floorEventNotificationTimer = setTimeout(() => {
        floorEventNotification.hidden = true;
    }, 8000);
}
let dungeonRooms = [];
let gameState;
let startPosition;
let exitPosition;
let torches = [];
let ambientShadowZones = [];
let barrels = [];
let chests = [];
let doors = [];
let sewers = [];
let castleColumns = [];
let castleDecorations = [];
let castleLayout = null;
let ambientDecorations = [];
let bossArenaBounds = null;
let floorNpcs = [];
let activeFloorNpcInteraction = null;
let naraChallenge = null;
const usedFloorNpcServices = new Set();
const floorNpcSchedule = [
    { id: 'lia', name: 'Lia, cartógrafa', floors: [3, 8, 13], color: '#78a9a0' },
    { id: 'oren', name: 'Oren, ferreiro', floors: blacksmithConfig.floors, color: '#bd7950' },
    { id: 'nara', name: 'Nara, vigia', floors: [9, 15], color: '#d8b86a' }
];
const floorMapPrefetchCache = new Map();
const floorMapPrefetchLimit = 5;
const floorMapPrefetchSeed = (
    (Date.now() ^ Math.floor(performance.now() * 1000)) >>> 0
) || 1;
let gameSeed = floorMapPrefetchSeed;
let floorMapPrefetchScheduled = false;
let floorMapPrefetchGeneration = 0;
let oreDrops = [];
let itemDrops = [];
const oreCoinBalance = Object.fromEntries(oreTypes.map((ore) => [ore.id, 0]));
let map;
let secretRoomProgressBySeed = null;

function getSecretRoomProgressBySeed() {
    if (secretRoomProgressBySeed) return secretRoomProgressBySeed;
    try {
        const stored = localStorage.getItem(secretRoomProgressStorageKey);
        const parsed = stored ? JSON.parse(stored) : {};
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            throw new Error('O estado salvo das salas secretas tem um formato inválido.');
        }
        secretRoomProgressBySeed = parsed;
    } catch (error) {
        console.error('Não foi possível carregar o progresso das salas secretas.', error);
        secretRoomProgressBySeed = {};
    }
    return secretRoomProgressBySeed;
}

function getSecretRoomProgress(roomId) {
    const seedProgress = getSecretRoomProgressBySeed()[String(gameSeed)];
    const saved = seedProgress?.[roomId];
    return {
        opened: saved?.opened === true,
        rewardCollected: saved?.rewardCollected === true,
        diaryRead: saved?.diaryRead === true
    };
}

function persistSecretRoomProgress(room) {
    const progressBySeed = getSecretRoomProgressBySeed();
    const seedKey = String(gameSeed);
    progressBySeed[seedKey] = progressBySeed[seedKey] || {};
    progressBySeed[seedKey][room.id] = { ...room.state };
    const seedKeys = Object.keys(progressBySeed);
    while (seedKeys.length > 8) {
        delete progressBySeed[seedKeys.shift()];
    }
    try {
        localStorage.setItem(
            secretRoomProgressStorageKey,
            JSON.stringify(progressBySeed)
        );
    } catch (error) {
        console.error('Não foi possível salvar o progresso da sala secreta.', error);
    }
}

function activateSecretRoomTrigger(room, event) {
    const trigger = room.definition.trigger;
    let matches = false;
    if (trigger.type === 'destroy-object') {
        matches = event.type === 'destroy-object' && event.objectId === trigger.objectId;
    } else if (trigger.type === 'interact') {
        matches = event.type === 'interact' && event.targetId === trigger.targetId;
    } else if (trigger.type === 'defeat-enemy') {
        matches = event.type === 'defeat-enemy' && event.creatureType === trigger.creatureType;
    } else if (trigger.type === 'deliver-item') {
        matches = event.type === 'deliver-item' && event.itemId === trigger.itemId;
    } else if (trigger.type === 'sequence') {
        matches = event.type === 'sequence' && event.sequenceId === trigger.sequenceId;
    } else {
        throw new Error(`Gatilho de sala secreta desconhecido: ${trigger.type}.`);
    }
    if (!matches || room.state.opened) return false;
    room.state.opened = true;
    room.revealTimer = 0.8;
    map[room.definition.gate.y][room.definition.gate.x] = '.';
    persistSecretRoomProgress(room);
    playCreatureSound('matriarch', 'warning');
    invalidateMapBaseCanvas();
    info.textContent = 'A teia queima e a parede cede, revelando uma passagem antiga.';
    return true;
}

function getMatriarchWebSpeedFactor(entity) {
    if (!matriarchArena || !entity) return 1;
    const tileX = Math.floor((entity.x + entity.size / 2) / tileSize);
    const tileY = Math.floor((entity.y + entity.size / 2) / tileSize);
    const webTiles = matriarchArena.phaseTwoActive
        ? [...matriarchArena.baseWebTiles, ...matriarchArena.phaseTwoWebTiles]
        : matriarchArena.baseWebTiles;
    return webTiles.some((tile) => tile.x === tileX && tile.y === tileY)
        ? matriarchArenaConfig.webSlowMultiplier
        : 1;
}

function carveMatriarchNestArea(maze) {
    if (currentFloor !== matriarchArenaConfig.floor) return;
    const arenaBounds = matriarchArenaConfig.bounds;
    const secretDefinition = secretRoomDefinitions.find((room) => room.floor === currentFloor);
    if (!secretDefinition) {
        throw new Error(`Sala secreta ausente para o andar ${currentFloor}.`);
    }
    const secretState = getSecretRoomProgress(secretDefinition.id);
    const inBounds = ({ x, y, width = 1, height = 1 }) => (
        x >= 1 && y >= 1 && x + width <= cols - 1 && y + height <= rows - 1
    );
    if (!inBounds(arenaBounds) || !inBounds(secretDefinition.bounds)) {
        throw new Error('A arena da Matriarca ou sua sala secreta excede os limites do mapa.');
    }

    for (let y = arenaBounds.y; y < arenaBounds.y + arenaBounds.height; y += 1) {
        for (let x = arenaBounds.x; x < arenaBounds.x + arenaBounds.width; x += 1) {
            const isWall = (
                x === arenaBounds.x || x === arenaBounds.x + arenaBounds.width - 1
                || y === arenaBounds.y || y === arenaBounds.y + arenaBounds.height - 1
            );
            maze[y][x] = isWall ? '#' : '.';
        }
    }

    const arena = {
        bounds: { ...arenaBounds },
        entrance: { x: 24, y: arenaBounds.y },
        tunnels: [
            { x: arenaBounds.x + 2, y: arenaBounds.y + 4, spawn: { x: arenaBounds.x + 2, y: arenaBounds.y + 4 } },
            { x: arenaBounds.x + 2, y: arenaBounds.y + 8, spawn: { x: arenaBounds.x + 2, y: arenaBounds.y + 8 } }
        ],
        campfire: { x: 13, y: 4 },
        campNpc: { x: 11, y: 4 },
        approachWebTiles: [],
        pillars: [
            { x: 19, y: 11, width: 2, height: 2 },
            { x: 28, y: 11, width: 2, height: 2 },
            { x: 19, y: 16, width: 2, height: 2 },
            { x: 28, y: 16, width: 2, height: 2 }
        ],
        baseWebTiles: [
            { x: 21, y: 13 }, { x: 22, y: 13 }, { x: 25, y: 14 },
            { x: 26, y: 14 }, { x: 23, y: 17 }, { x: 24, y: 17 }
        ],
        phaseTwoWebTiles: [
            { x: 17, y: 11 }, { x: 18, y: 15 }, { x: 23, y: 11 },
            { x: 26, y: 16 }, { x: 30, y: 14 }, { x: 21, y: 18 }
        ],
        phaseTwoActive: false,
        broodSacsDestroyed: []
    };
    for (const tunnel of arena.tunnels) {
        for (let x = arenaBounds.x - 4; x < arenaBounds.x; x += 1) {
            maze[tunnel.y][x] = '.';
        }
        maze[tunnel.y][arenaBounds.x] = '.';
    }
    maze[arena.entrance.y][arena.entrance.x] = '.';
    for (let x = startPosition.x; x <= arena.entrance.x; x += 1) {
        maze[startPosition.y][x] = '.';
    }
    for (let y = startPosition.y; y <= arena.entrance.y; y += 1) {
        maze[y][arena.entrance.x] = '.';
    }
    maze[startPosition.y][startPosition.x] = 'S';
    for (let x = startPosition.x + 1; x < arena.entrance.x; x += 2) {
        const wallTile = [
            { x, y: startPosition.y - 1 },
            { x, y: startPosition.y + 1 }
        ].find((tile) => maze[tile.y]?.[tile.x] === '#');
        if (wallTile) arena.approachWebTiles.push(wallTile);
        if (arena.approachWebTiles.length >= 3) break;
    }

    const secretBounds = secretDefinition.bounds;
    for (let y = secretBounds.y; y < secretBounds.y + secretBounds.height; y += 1) {
        for (let x = secretBounds.x; x < secretBounds.x + secretBounds.width; x += 1) {
            const isWall = (
                x === secretBounds.x || x === secretBounds.x + secretBounds.width - 1
                || y === secretBounds.y || y === secretBounds.y + secretBounds.height - 1
            );
            maze[y][x] = isWall ? '#' : '.';
        }
    }
    if (secretState.opened) {
        maze[secretDefinition.gate.y][secretDefinition.gate.x] = '.';
    }
    const arenaTile = (x, y) => (
        x >= arenaBounds.x && x < arenaBounds.x + arenaBounds.width
        && y >= arenaBounds.y && y < arenaBounds.y + arenaBounds.height
    );
    const secretTile = (x, y) => (
        x >= secretBounds.x && x < secretBounds.x + secretBounds.width
        && y >= secretBounds.y && y < secretBounds.y + secretBounds.height
    );
    barrels = barrels.filter((barrel) => (
        !arenaTile(barrel.x, barrel.y) && !secretTile(barrel.x, barrel.y)
    ));
    chests = chests.filter((chest) => (
        !arenaTile(chest.x, chest.y) && !secretTile(chest.x, chest.y)
    ));
    sewers = sewers.filter((sewer) => (
        !arenaTile(sewer.puddleX, sewer.puddleY)
        && !secretTile(sewer.puddleX, sewer.puddleY)
    ));
    torches = torches.filter((torch) => (
        !arenaTile(torch.x, torch.y) && !secretTile(torch.x, torch.y)
    ));

    const rarity = itemRarities[0];
    const cocoon = secretState.opened ? null : {
        x: secretDefinition.gate.x - 1,
        y: secretDefinition.gate.y,
        rarity,
        health: 30,
        maxHealth: 30,
        hitFlash: 0,
        isSecretCocoon: true,
        secretRoomId: secretDefinition.id
    };
    if (cocoon) barrels.push(cocoon);
    arena.broodSacs = [
        { x: arenaBounds.x + 1, y: arenaBounds.y + 2 },
        { x: arenaBounds.x + 1, y: arenaBounds.y + arenaBounds.height - 3 }
    ];
    for (const [index, sac] of arena.broodSacs.entries()) {
        barrels.push({
            ...sac,
            rarity,
            health: 20,
            maxHealth: 20,
            hitFlash: 0,
            isBroodCocoon: true,
            broodSacIndex: index
        });
    }
    secretRooms = [{
        id: secretDefinition.id,
        floor: currentFloor,
        definition: secretDefinition,
        state: secretState,
        revealTimer: 0,
        chest: { ...secretDefinition.chest },
        diary: { ...secretDefinition.diary }
    }];
    matriarchArena = {
        floor: currentFloor,
        ...arena,
        bossTile: { x: 24, y: 14 },
        cocoon
    };
}

function updateOreCoinHud() {
    for (const ore of oreTypes) {
        oreCoinCounts[ore.id].textContent = String(oreCoinBalance[ore.id]);
    }
    updateShopHud();
}

function placeTorches(maze) {
    const walkable = (x, y) => (
        x >= 0 && x < cols
        && y >= 0 && y < rows
        && maze[y][x] !== '#'
    );
    const candidates = [];

    for (let y = 1; y < rows - 1; y++) {
        for (let x = 1; x < cols - 1; x++) {
            if (maze[y][x] !== '#') {
                continue;
            }

            const openSides = [
                { x: 0, y: -1 },
                { x: 1, y: 0 },
                { x: 0, y: 1 },
                { x: -1, y: 0 }
            ].filter((side) => walkable(x + side.x, y + side.y));
            if (openSides.length > 0) {
                candidates.push({ x, y });
            }
        }
    }

    const torchAnchors = [
        { x: 6, y: 3 },
        { x: 15, y: 3 },
        { x: 24, y: 3 },
        { x: 6, y: 10 },
        { x: 15, y: 10 },
        { x: 24, y: 10 }
    ];
    const placed = [];

    for (const anchor of torchAnchors) {
        const available = candidates
            .filter((candidate) => !placed.some((torch) => (
                torch.x === candidate.x && torch.y === candidate.y
            )))
            .sort((first, second) => {
                const firstDistance = Math.abs(first.x - anchor.x) + Math.abs(first.y - anchor.y);
                const secondDistance = Math.abs(second.x - anchor.x) + Math.abs(second.y - anchor.y);
                return firstDistance - secondDistance;
            });
        const candidate = available.find((position) => placed.every((torch) => (
            Math.abs(torch.x - position.x) + Math.abs(torch.y - position.y) >= 4
        ))) || available[0];

        if (candidate) {
            placed.push(candidate);
        }
    }

    return placed;
}

function placeSewers(maze) {
    const protectedTiles = new Set();
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (maze[y][x] === 'S' || (x === exitPosition.x && y === exitPosition.y)) {
                protectedTiles.add(`${x},${y}`);
            }
        }
    }

    const candidates = [];
    for (let y = 1; y < rows - 1; y++) {
        for (let x = 1; x < cols - 1; x++) {
            if (maze[y][x] !== '#' || torches.some((torch) => torch.x === x && torch.y === y)) {
                continue;
            }

            const openings = [
                { x: 0, y: -1 },
                { x: 1, y: 0 },
                { x: 0, y: 1 },
                { x: -1, y: 0 }
            ].filter((side) => (
                maze[y + side.y][x + side.x] !== '#'
                && !protectedTiles.has(`${x + side.x},${y + side.y}`)
            ));
            for (const opening of openings) {
                const puddleX = x + opening.x;
                const puddleY = y + opening.y;
                if (
                    Math.abs(puddleX - startPosition.x) + Math.abs(puddleY - startPosition.y) < 4
                    || doors.some((door) => door.x === puddleX && door.y === puddleY)
                ) {
                    continue;
                }
                candidates.push({ x, y, opening, puddleX, puddleY });
            }
        }
    }

    for (let index = candidates.length - 1; index > 0; index--) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [candidates[index], candidates[swapIndex]] = [
            candidates[swapIndex],
            candidates[index]
        ];
    }

    const targetCount = 3 + Math.floor(Math.random() * 3);
    const placed = [];
    for (const candidate of candidates) {
        if (placed.length >= targetCount) {
            break;
        }
        if (placed.some((sewer) => (
            Math.abs(sewer.x - candidate.x) + Math.abs(sewer.y - candidate.y) < 4
            || (sewer.puddleX === candidate.puddleX && sewer.puddleY === candidate.puddleY)
        ))) {
            continue;
        }

        placed.push({
            ...candidate,
            puddleWidth: 19 + Math.floor(Math.random() * 8),
            puddleHeight: 10 + Math.floor(Math.random() * 6),
            dripSeed: Math.floor(Math.random() * 4)
        });
    }

    return placed;
}

function areDungeonRoomsReachable(maze, blocked) {
    const step = tileSize / 2;
    const navigationCols = Math.ceil(gridWidth / step);
    const navigationRows = Math.ceil(gridHeight / step);
    const isWalkable = (x, y) => {
        const left = x - playerCollisionWidth / 2;
        const right = x + playerCollisionWidth / 2;
        const top = y - playerCollisionHeight / 2;
        const bottom = y + playerCollisionHeight / 2;
        const minCol = Math.floor(left / tileSize);
        const maxCol = Math.ceil(right / tileSize) - 1;
        const minRow = Math.floor(top / tileSize);
        const maxRow = Math.ceil(bottom / tileSize) - 1;

        for (let row = minRow; row <= maxRow; row++) {
            for (let col = minCol; col <= maxCol; col++) {
                if (
                    row < 0 || row >= rows || col < 0 || col >= cols
                    || maze[row][col] === '#'
                ) {
                    return false;
                }
                const obstacle = `${col},${row}`;
                if (blocked.has(obstacle)) {
                    const obstacleLeft = col * tileSize + 2;
                    const obstacleTop = row * tileSize + 2;
                    const obstacleRight = (col + 1) * tileSize - 2;
                    const obstacleBottom = (row + 1) * tileSize - 2;
                    if (
                        left < obstacleRight
                        && right > obstacleLeft
                        && top < obstacleBottom
                        && bottom > obstacleTop
                    ) {
                        return false;
                    }
                }
            }
        }
        return true;
    };

    const startX = Math.round(((startPosition.x + 0.5) * tileSize) / step);
    const startY = Math.round(((startPosition.y + 0.5) * tileSize) / step);
    if (!isWalkable(startX * step, startY * step)) return false;

    const queue = [{ x: startX, y: startY }];
    const visited = new Set([`${startX},${startY}`]);
    for (let index = 0; index < queue.length; index++) {
        const current = queue[index];
        for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
            const x = current.x + dx;
            const y = current.y + dy;
            const key = `${x},${y}`;
            if (
                x < 0 || x >= navigationCols || y < 0 || y >= navigationRows
                || visited.has(key)
                || !isWalkable(x * step, y * step)
            ) {
                continue;
            }

            visited.add(key);
            queue.push({ x, y });
        }
    }

    const isTargetReachable = (target) => {
        const targetX = Math.round(((target.x + 0.5) * tileSize) / step);
        const targetY = Math.round(((target.y + 0.5) * tileSize) / step);
        return visited.has(`${targetX},${targetY}`);
    };
    return isTargetReachable(exitPosition)
        && dungeonRooms.every((room) => {
            const left = room.x + 1;
            const right = room.x + room.width - 2;
            const top = room.y + 1;
            const bottom = room.y + room.height - 2;
            for (let row = top; row <= bottom; row++) {
                for (let col = left; col <= right; col++) {
                    if (isTargetReachable({ x: col, y: row })) return true;
                }
            }
            return false;
        });
}

function placeBarrels(maze) {
    const candidates = [];
    const cornerPairs = [
        [[0, -1], [-1, 0]],
        [[0, -1], [1, 0]],
        [[0, 1], [-1, 0]],
        [[0, 1], [1, 0]]
    ];

    for (let y = 1; y < rows - 1; y++) {
        for (let x = 1; x < cols - 1; x++) {
            if (maze[y][x] !== '.') {
                continue;
            }

            const isCorner = cornerPairs.some((pair) => pair.every(([dx, dy]) => (
                maze[y + dy][x + dx] === '#'
            )));
            const farFromStart = Math.abs(x - startPosition.x)
                + Math.abs(y - startPosition.y) >= 4;
            const farFromExit = Math.abs(x - exitPosition.x)
                + Math.abs(y - exitPosition.y) >= 3;

            const isDoorway = doors.some((door) => door.x === x && door.y === y);
            if (isCorner && farFromStart && farFromExit && !isDoorway) {
                if (!sewers.some((sewer) => sewer.puddleX === x && sewer.puddleY === y)) {
                    candidates.push({ x, y });
                }
            }
        }
    }

    for (let index = candidates.length - 1; index > 0; index--) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [candidates[index], candidates[swapIndex]] = [
            candidates[swapIndex],
            candidates[index]
        ];
    }

    const targetCount = 4 + Math.floor(Math.random() * 3);
    const placed = [];
    for (const candidate of candidates) {
        if (placed.length >= targetCount) {
            break;
        }
        if (placed.some((barrel) => (
            Math.abs(barrel.x - candidate.x) + Math.abs(barrel.y - candidate.y) < 3
        ))) {
            continue;
        }

        const blocked = new Set([
            ...placed.map((barrel) => `${barrel.x},${barrel.y}`),
            `${candidate.x},${candidate.y}`
        ]);
        if (!areDungeonRoomsReachable(maze, blocked)) {
            continue;
        }
        placed.push(candidate);
    }

    return placed.map((position) => ({
        ...position,
        rarity: chooseItemRarity(),
        health: 20,
        maxHealth: 20,
        hitFlash: 0
    }));
}

function placeChests(maze) {
    const candidates = [];
    const cornerPairs = [
        [[0, -1], [-1, 0]],
        [[0, -1], [1, 0]],
        [[0, 1], [-1, 0]],
        [[0, 1], [1, 0]]
    ];

    for (let y = 1; y < rows - 1; y++) {
        for (let x = 1; x < cols - 1; x++) {
            const farFromStart = Math.abs(x - startPosition.x)
                + Math.abs(y - startPosition.y) >= 5;
            const farFromExit = Math.abs(x - exitPosition.x)
                + Math.abs(y - exitPosition.y) >= 4;
            const nearBarrel = barrels.some((barrel) => (
                barrel.health > 0
                && Math.abs(barrel.x - x) + Math.abs(barrel.y - y) < 3
            ));
            const onSewer = sewers.some((sewer) => (
                sewer.puddleX === x && sewer.puddleY === y
            ));
            const isCorner = cornerPairs.some((pair) => pair.every(([dx, dy]) => (
                maze[y + dy][x + dx] === '#'
            )));

            if (
                maze[y][x] === '.'
                && isCorner
                && farFromStart
                && farFromExit
                && !nearBarrel
                && !onSewer
                && !doors.some((door) => door.x === x && door.y === y)
            ) {
                candidates.push({ x, y });
            }
        }
    }

    for (let index = candidates.length - 1; index > 0; index--) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [candidates[index], candidates[swapIndex]] = [
            candidates[swapIndex],
            candidates[index]
        ];
    }

    const targetCount = 1 + Math.floor(Math.random() * 2);
    const placed = [];
    for (const candidate of candidates) {
        if (placed.length >= targetCount) {
            break;
        }
        if (placed.some((chest) => (
            Math.abs(chest.x - candidate.x) + Math.abs(chest.y - candidate.y) < 4
        ))) {
            continue;
        }
        const blocked = new Set([
            ...barrels.map((barrel) => `${barrel.x},${barrel.y}`),
            ...placed.map((chest) => `${chest.x},${chest.y}`),
            `${candidate.x},${candidate.y}`
        ]);
        if (!areDungeonRoomsReachable(maze, blocked)) {
            continue;
        }

        const rarity = chooseItemRarity();
        placed.push({
            ...candidate,
            rarity,
            health: 20,
            maxHealth: 20,
            hitFlash: 0,
            opened: false,
            isMimic: Math.random() < 0.1,
            mimicState: 'hidden',
            mimicAnimationTime: 0,
            mimicAttackCooldown: 0,
            mimicAttackHit: false,
            containsPotion: Math.random() < 0.4 + rarity.rank * 0.15
        });
    }

    return placed;
}

function createMap() {
    const castleGeneration = currentFloor >= 10
        ? generateCastleFloor(currentFloor, gameSeed)
        : null;
    const maze = castleGeneration?.grid
        || Array.from({ length: rows }, () => Array(cols).fill('#'));
    castleLayout = castleGeneration;
    doors = castleGeneration?.doors || [];
    ambientDecorations = [];
    secretRooms = [];
    matriarchArena = null;
    const roomLayout = currentFloor >= 10 ? 'castle' : 'dungeon';
    const castlePlan = castleGeneration;
    const castleCorridorPattern = null;
    const roomColumns = [1, Math.floor((cols - 13) / 2), cols - 14];
    const roomRows = [1, Math.floor((rows - 8) / 2), rows - 9];
    const rooms = castleGeneration
        ? castleGeneration.rooms.map((room) => ({ ...room }))
        : [];

    if (!castlePlan) {
        for (let row = 0; row < roomRows.length; row++) {
            for (let col = 0; col < roomColumns.length; col++) {
                if (roomLayout === 'castle') {
                    rooms.push({
                        x: roomColumns[col],
                        y: roomRows[row],
                        width: 13,
                        height: 8
                    });
                } else {
                    rooms.push({
                        x: roomColumns[col],
                        y: roomRows[row],
                        width: 12 + Math.floor(Math.random() * 2),
                        height: 7 + Math.floor(Math.random() * 2)
                    });
                }
            }
        }
    }

    if (castlePlan && !castleGeneration) {
        const expansionOrder = rooms
            .map((room, index) => ({ room, index }))
            .filter(({ room, index }) => index !== castlePlan.hub && room.role !== 'stair')
            .sort((first, second) => (
                first.room.width * first.room.height
                - second.room.width * second.room.height
            ));
        for (const { index } of expansionOrder) {
            const room = rooms[index];
            const maximumWidth = Math.min(room.width + 3, 15);
            const maximumHeight = Math.min(room.height + 2, 9);
            const expansionDirections = [
                [-1, 0, 1, 0],
                [0, 0, 1, 0],
                [0, -1, 0, 1],
                [0, 0, 0, 1]
            ];
            let expanded = true;
            while (expanded && (room.width < maximumWidth || room.height < maximumHeight)) {
                expanded = false;
                for (const [dx, dy, widthDelta, heightDelta] of expansionDirections) {
                    if (
                        (widthDelta && room.width >= maximumWidth)
                        || (heightDelta && room.height >= maximumHeight)
                    ) {
                        continue;
                    }
                    const expandedRoom = {
                        ...room,
                        x: room.x + dx,
                        y: room.y + dy,
                        width: room.width + widthDelta,
                        height: room.height + heightDelta
                    };
                    if (
                        expandedRoom.x < 0
                        || expandedRoom.y < 0
                        || expandedRoom.x + expandedRoom.width > cols
                        || expandedRoom.y + expandedRoom.height > rows
                    ) {
                        continue;
                    }
                    const overlapsRoom = rooms.some((otherRoom, otherIndex) => (
                        otherIndex !== index
                        && expandedRoom.x < otherRoom.x + otherRoom.width
                        && expandedRoom.x + expandedRoom.width > otherRoom.x
                        && expandedRoom.y < otherRoom.y + otherRoom.height
                        && expandedRoom.y + expandedRoom.height > otherRoom.y
                    ));
                    if (!overlapsRoom) {
                        Object.assign(room, expandedRoom);
                        expanded = true;
                    }
                }
            }
        }
    }

    const centerOf = (room) => ({
        x: room.x + Math.floor(room.width / 2),
        y: room.y + Math.floor(room.height / 2)
    });
    dungeonRooms = rooms.map((room) => ({
        ...room,
        center: centerOf(room)
    }));
    const carveRoomConnections = (roomsToConnect, hubRoom) => {
        const contains = (room, x, y) => (
            x >= room.x && x < room.x + room.width
            && y >= room.y && y < room.y + room.height
        );
        const roomAt = (x, y) => roomsToConnect.find((room) => contains(room, x, y));

        for (const room of roomsToConnect) {
            for (let y = room.y; y < room.y + room.height; y++) {
                for (let x = room.x; x < room.x + room.width; x++) {
                    const isWall = (
                        x === room.x
                        || x === room.x + room.width - 1
                        || y === room.y
                        || y === room.y + room.height - 1
                    );
                    maze[y][x] = isWall ? '#' : '.';
                }
            }
        }

        const directions = [
            { x: 0, y: -1 },
            { x: 1, y: 0 },
            { x: 0, y: 1 },
            { x: -1, y: 0 }
        ];
        const roomBoundaryCells = (room) => {
            const boundary = [];
            for (let y = room.y; y < room.y + room.height; y++) {
                for (let x = room.x; x < room.x + room.width; x++) {
                    const outside = directions.filter((direction) => (
                        !contains(room, x + direction.x, y + direction.y)
                    ));
                    if (outside.length === 1) {
                        boundary.push({
                            x,
                            y,
                            dx: outside[0].x,
                            dy: outside[0].y
                        });
                    }
                }
            }
            return boundary;
        };
        const hubBoundary = roomBoundaryCells(hubRoom);
        const hubCenter = centerOf(hubRoom);
        const roomEntrances = (room) => [
            {
                x: room.x + Math.floor(room.width / 2),
                y: room.y,
                dx: 0,
                dy: -1
            },
            {
                x: room.x + room.width - 1,
                y: room.y + Math.floor(room.height / 2),
                dx: 1,
                dy: 0
            },
            {
                x: room.x + Math.floor(room.width / 2),
                y: room.y + room.height - 1,
                dx: 0,
                dy: 1
            },
            {
                x: room.x,
                y: room.y + Math.floor(room.height / 2),
                dx: -1,
                dy: 0
            }
        ];
        const hasWallSupports = (entrance) => {
            const sideX = entrance.dx === 0 ? 1 : 0;
            const sideY = entrance.dy === 0 ? 1 : 0;
            return maze[entrance.y - sideY][entrance.x - sideX] === '#'
                && maze[entrance.y + sideY][entrance.x + sideX] === '#';
        };
        const isAvailableCorridorCell = (x, y) => (
            x > 0 && x < cols - 1
            && y > 0 && y < rows - 1
            && !roomAt(x, y)
        );
        const widenCorridorCell = (cell, nextCell, previousCell) => {
            const direction = nextCell || previousCell;
            if (!direction) return;
            const wideCells = direction.x === cell.x
                ? [{ x: cell.x + 1, y: cell.y }]
                : currentFloor > 10
                    ? [
                        { x: cell.x, y: cell.y - 1 },
                        { x: cell.x, y: cell.y + 1 }
                    ]
                    : [{ x: cell.x, y: cell.y + 1 }];
            for (const wideCell of wideCells) {
                if (isAvailableCorridorCell(wideCell.x, wideCell.y)) {
                    maze[wideCell.y][wideCell.x] = '.';
                }
            }
        };
        const carveWideCorridor = (path) => {
            for (let index = 0; index < path.length; index++) {
                const cell = path[index];
                maze[cell.y][cell.x] = '.';
                widenCorridorCell(cell, path[index + 1], path[index - 1]);
                if (index > 0 && index + 1 < path.length) {
                    const next = path[index + 1];
                    const previous = path[index - 1];
                    const isTurn = (
                        (next.x === cell.x) !== (previous.x === cell.x)
                    );
                    if (isTurn) {
                        const turnInset = currentFloor > 10 ? 1 : 0;
                        for (let y = cell.y - turnInset; y <= cell.y + 1; y++) {
                            for (let x = cell.x - turnInset; x <= cell.x + 1; x++) {
                                if (isAvailableCorridorCell(x, y)) {
                                    maze[y][x] = '.';
                                }
                            }
                        }
                    }
                }
            }
        };
        const addWideDoorway = (entrance) => {
            const orientation = entrance.dx === 0 ? 'horizontal' : 'vertical';
            const doorwayCells = entrance.dx === 0
                ? [
                    { x: entrance.x, y: entrance.y },
                    { x: entrance.x + 1, y: entrance.y }
                ]
                : [
                    { x: entrance.x, y: entrance.y - 1 },
                    { x: entrance.x, y: entrance.y }
                ];
            const pairId = `${entrance.x},${entrance.y}`;
            const corridorStart = {
                x: entrance.x + entrance.dx,
                y: entrance.y + entrance.dy
            };
            const corridorWidthCells = entrance.dx === 0
                ? [{ x: corridorStart.x + 1, y: corridorStart.y }]
                : currentFloor > 10
                    ? [
                        { x: corridorStart.x, y: corridorStart.y - 1 },
                        { x: corridorStart.x, y: corridorStart.y + 1 }
                    ]
                    : [{ x: corridorStart.x, y: corridorStart.y + 1 }];
            maze[entrance.y][entrance.x] = '.';
            for (const [pairIndex, cell] of doorwayCells.entries()) {
                if (
                    cell.x <= 0 || cell.x >= cols - 1
                    || cell.y <= 0 || cell.y >= rows - 1
                ) {
                    continue;
                }
                maze[cell.y][cell.x] = '.';
                doors.push({ ...cell, orientation, pairId, pairIndex, progress: 0 });
            }
            for (const cell of corridorWidthCells) {
                if (isAvailableCorridorCell(cell.x, cell.y)) {
                    maze[cell.y][cell.x] = '.';
                }
            }
        };

        doors = [];
        for (const room of roomsToConnect) {
            if (room === hubRoom) continue;

            let bestConnection = null;
            const entrances = roomEntrances(room).filter((entrance) => (
                maze[entrance.y][entrance.x] === '#'
                && hasWallSupports(entrance)
            )).sort((first, second) => {
                const firstDistance = Math.abs(first.x + first.dx - hubCenter.x)
                    + Math.abs(first.y + first.dy - hubCenter.y);
                const secondDistance = Math.abs(second.x + second.dx - hubCenter.x)
                    + Math.abs(second.y + second.dy - hubCenter.y);
                return firstDistance - secondDistance;
            });

            for (const entrance of entrances) {
                const start = { x: entrance.x + entrance.dx, y: entrance.y + entrance.dy };
                if (roomAt(start.x, start.y) === hubRoom) {
                    const doorwayCells = entrance.dx === 0
                        ? [
                            { x: entrance.x, y: entrance.y },
                            { x: entrance.x + 1, y: entrance.y }
                        ]
                        : [
                            { x: entrance.x, y: entrance.y - 1 },
                            { x: entrance.x, y: entrance.y }
                        ];
                    const hubSideCells = doorwayCells.map((cell) => ({
                        x: cell.x + entrance.dx,
                        y: cell.y + entrance.dy
                    }));
                    const sharedHubBoundary = hubBoundary.filter((cell) => (
                        roomAt(cell.x + cell.dx, cell.y + cell.dy) === room
                    ));
                    if (
                        hubSideCells.every((cell) => roomAt(cell.x, cell.y) === hubRoom)
                        && sharedHubBoundary.length > 0
                    ) {
                        for (const cell of sharedHubBoundary) {
                            maze[cell.y][cell.x] = '.';
                        }
                        addWideDoorway(entrance);
                        bestConnection = { direct: true };
                        break;
                    }
                }
                if (!isAvailableCorridorCell(start.x, start.y)) continue;

                const queue = [{ ...start, previous: -1 }];
                const visited = new Map([[`${start.x},${start.y}`, 0]]);
                let targetEntrance = null;
                let targetIndex = -1;

                for (let index = 0; index < queue.length && !targetEntrance; index++) {
                    const current = queue[index];
                    for (const direction of directions) {
                        const nearbyHubEntrance = hubBoundary.find((cell) => (
                            cell.x === current.x + direction.x
                            && cell.y === current.y + direction.y
                        ));
                        if (nearbyHubEntrance) {
                            targetEntrance = nearbyHubEntrance;
                            targetIndex = index;
                            break;
                        }
                    }
                    if (targetEntrance) break;

                    for (const direction of directions) {
                        const nextX = current.x + direction.x;
                        const nextY = current.y + direction.y;
                        const key = `${nextX},${nextY}`;
                        if (
                            !isAvailableCorridorCell(nextX, nextY)
                            || visited.has(key)
                        ) {
                            continue;
                        }
                        visited.set(key, queue.length);
                        queue.push({ x: nextX, y: nextY, previous: index });
                    }
                }

                if (targetEntrance) {
                    const path = [];
                    for (let index = targetIndex; index >= 0; index = queue[index].previous) {
                        path.push(queue[index]);
                    }
                    bestConnection = { entrance, targetEntrance, path };
                    break;
                }
            }

            if (bestConnection?.direct) continue;
            if (!bestConnection) {
                throw new Error('Nao foi possivel conectar uma sala a sala central.');
            }

            const { entrance, targetEntrance, path } = bestConnection;
            maze[entrance.y][entrance.x] = '.';
            maze[targetEntrance.y][targetEntrance.x] = '.';
            maze[targetEntrance.y - targetEntrance.dy][targetEntrance.x - targetEntrance.dx] = '.';
            const targetSideCells = targetEntrance.dx === 0
                ? [{ x: targetEntrance.x + 1, y: targetEntrance.y }]
                : currentFloor > 10
                    ? [
                        { x: targetEntrance.x, y: targetEntrance.y - 1 },
                        { x: targetEntrance.x, y: targetEntrance.y + 1 }
                    ]
                    : [{ x: targetEntrance.x, y: targetEntrance.y + 1 }];
            for (const cell of targetSideCells) {
                maze[cell.y][cell.x] = '.';
            }
            carveWideCorridor(path);
            if (hasWallSupports(entrance)) {
                addWideDoorway(entrance);
            }
        }

        if (roomLayout === 'castle' && currentFloor % 5 !== 0) {
            const addAlternateConnection = (room) => {
                const entrances = roomEntrances(room)
                    .filter((entrance) => (
                        maze[entrance.y][entrance.x] === '#'
                        && hasWallSupports(entrance)
                    ))
                    .sort((first, second) => {
                        const firstDistance = Math.abs(first.x + first.dx - hubCenter.x)
                            + Math.abs(first.y + first.dy - hubCenter.y);
                        const secondDistance = Math.abs(second.x + second.dx - hubCenter.x)
                            + Math.abs(second.y + second.dy - hubCenter.y);
                        return secondDistance - firstDistance;
                    });

                for (const entrance of entrances) {
                    const start = { x: entrance.x + entrance.dx, y: entrance.y + entrance.dy };
                    if (!isAvailableCorridorCell(start.x, start.y)) continue;

                    if (maze[start.y][start.x] === '.') {
                        maze[entrance.y][entrance.x] = '.';
                        addWideDoorway(entrance);
                        return true;
                    }

                    const queue = [{ ...start, previous: -1 }];
                    const visited = new Map([[`${start.x},${start.y}`, 0]]);
                    let targetIndex = -1;
                    for (let index = 0; index < queue.length && targetIndex < 0; index++) {
                        const current = queue[index];
                        if (
                            directions.some((direction) => (
                                isAvailableCorridorCell(
                                    current.x + direction.x,
                                    current.y + direction.y
                                )
                                && maze[current.y + direction.y][current.x + direction.x] === '.'
                            ))
                        ) {
                            targetIndex = index;
                            break;
                        }

                        for (const direction of directions) {
                            const nextX = current.x + direction.x;
                            const nextY = current.y + direction.y;
                            const key = `${nextX},${nextY}`;
                            if (
                                !isAvailableCorridorCell(nextX, nextY)
                                || visited.has(key)
                            ) {
                                continue;
                            }
                            visited.set(key, queue.length);
                            queue.push({ x: nextX, y: nextY, previous: index });
                        }
                    }

                    if (targetIndex < 0) continue;
                    const path = [];
                    for (let index = targetIndex; index >= 0; index = queue[index].previous) {
                        path.push(queue[index]);
                    }
                    carveWideCorridor(path);
                    maze[entrance.y][entrance.x] = '.';
                    addWideDoorway(entrance);
                    return true;
                }
                return false;
            };

            for (let roomIndex = 0; roomIndex < roomsToConnect.length; roomIndex++) {
                if (roomIndex !== roomsToConnect.indexOf(hubRoom)) {
                    addAlternateConnection(roomsToConnect[roomIndex]);
                }
            }
        }
    };

    const carveFixedCastleCorridors = (roomsToConnect, entranceOffsets) => {
        const hall = roomsToConnect[0];
        for (const room of roomsToConnect) {
            for (let y = room.y; y < room.y + room.height; y++) {
                for (let x = room.x; x < room.x + room.width; x++) {
                    const isWall = (
                        x === room.x
                        || x === room.x + room.width - 1
                        || y === room.y
                        || y === room.y + room.height - 1
                    );
                    maze[y][x] = isWall ? '#' : '.';
                }
            }
        }

        for (let wing = 0; wing < 2; wing++) {
            for (let row = 0; row < 4; row++) {
                const room = roomsToConnect[1 + wing * 4 + row];
                const middle = centerOf(room);
                const minimumDoorY = room.y + 2;
                const maximumDoorY = room.y + room.height - 3;
                const entranceY = Math.max(
                    minimumDoorY,
                    Math.min(maximumDoorY, middle.y + entranceOffsets[wing * 4 + row])
                );
                const entranceX = wing === 0
                    ? room.x + room.width - 1
                    : room.x;
                const hallWallX = wing === 0
                    ? hall.x
                    : hall.x + hall.width - 1;
                const direction = wing === 0 ? 1 : -1;
                const pairId = `${entranceX},${entranceY}`;

                for (const [pairIndex, doorY] of [
                    entranceY - 1,
                    entranceY,
                    entranceY + 1
                ].entries()) {
                    maze[doorY][entranceX] = '.';
                    doors.push({
                        x: entranceX,
                        y: doorY,
                        orientation: 'vertical',
                        pairId,
                        pairIndex,
                        span: 3,
                        progress: 0
                    });
                }

                for (
                    let x = entranceX;
                    wing === 0 ? x <= hallWallX : x >= hallWallX;
                    x += direction
                ) {
                    for (let y = entranceY - 1; y <= entranceY + 1; y++) {
                        maze[y][x] = '.';
                    }
                }
            }
        }
    };

    if (castleGeneration) {
        // The procedural castle grid is already carved and connected.
    } else if (castlePlan && castleCorridorPattern) {
        carveFixedCastleCorridors(rooms, castleCorridorPattern);
    } else if (castlePlan) {
        carveRoomConnections(rooms, rooms[castlePlan.hub]);
    } else if (roomLayout === 'castle' && currentFloor % 5 !== 0) {
        carveRoomConnections(rooms, rooms[4]);
    } else {
        for (const room of rooms) {
            for (let y = room.y; y < room.y + room.height; y++) {
                for (let x = room.x; x < room.x + room.width; x++) {
                    maze[y][x] = '.';
                }
            }
        }
    }

    const connectRooms = (firstRoom, secondRoom) => {
        const start = centerOf(firstRoom);
        const end = centerOf(secondRoom);
        const stepX = Math.sign(end.x - start.x);
        const stepY = Math.sign(end.y - start.y);

        for (let x = start.x; x !== end.x + stepX; x += stepX || 1) {
            maze[start.y][x] = '.';
            if (currentFloor <= 10 && start.y + 1 < rows - 1) {
                maze[start.y + 1][x] = '.';
            }
            if (currentFloor > 10 && start.y > 0) {
                maze[start.y - 1][x] = '.';
            }
            if (currentFloor > 10 && start.y + 1 < rows - 1) {
                maze[start.y + 1][x] = '.';
            }
        }
        for (let y = start.y; y !== end.y + stepY; y += stepY || 1) {
            maze[y][end.x] = '.';
            if (currentFloor <= 10 && end.x + 1 < cols - 1) {
                maze[y][end.x + 1] = '.';
            }
            if (currentFloor > 10 && end.x + 1 < cols - 1) {
                maze[y][end.x + 1] = '.';
            }
        }
    };
    const connectRoomsAlternate = (firstRoom, secondRoom) => {
        const start = centerOf(firstRoom);
        const end = centerOf(secondRoom);
        const deltaX = end.x - start.x;
        const deltaY = end.y - start.y;
        const steps = Math.max(Math.abs(deltaX), Math.abs(deltaY));
        let previousX = start.x;
        let previousY = start.y;

        for (let step = 0; step <= steps; step++) {
            const progress = steps === 0 ? 0 : step / steps;
            const x = Math.round(start.x + deltaX * progress);
            const y = Math.round(start.y + deltaY * progress);
            maze[y][x] = '.';
            if (currentFloor <= 10 && x + 1 < cols - 1) {
                maze[y][x + 1] = '.';
            }
            if (x !== previousX && y !== previousY) {
                maze[previousY][x] = '.';
                if (currentFloor <= 10 && x + 1 < cols - 1) {
                    maze[previousY][x + 1] = '.';
                }
                maze[y][previousX] = '.';
                if (currentFloor <= 10 && previousX + 1 < cols - 1) {
                    maze[y][previousX + 1] = '.';
                }
            }
            previousX = x;
            previousY = y;
        }
    };

    if (!castlePlan && (roomLayout !== 'castle' || currentFloor % 5 === 0)) {
        for (let row = 0; row < roomRows.length; row++) {
            for (let col = 0; col < roomColumns.length - 1; col++) {
                const roomIndex = row * roomColumns.length + col;
                connectRooms(rooms[roomIndex], rooms[roomIndex + 1]);
            }
        }
        for (let row = 0; row < roomRows.length - 1; row++) {
            for (let col = 0; col < roomColumns.length; col++) {
                if (
                    roomLayout !== 'castle'
                    && row === roomRows.length - 2
                    && col === roomColumns.length - 1
                ) {
                    continue;
                }
                const roomIndex = row * roomColumns.length + col;
                connectRooms(rooms[roomIndex], rooms[roomIndex + roomColumns.length]);
            }
        }
        if (roomLayout !== 'castle') {
            connectRoomsAlternate(rooms[0], rooms[4]);
            connectRoomsAlternate(rooms[4], rooms[8]);
        }
    }

    startPosition = castleGeneration
        ? { ...castleGeneration.start }
        : centerOf(rooms[0]);
    exitPosition = castleGeneration
        ? { ...castleGeneration.exit }
        : centerOf(castlePlan ? rooms[1] : rooms[rooms.length - 1]);
    ambientShadowZones = roomLayout === 'dungeon'
        ? rooms
            .filter((room, index) => (index + currentFloor) % 4 === 0)
            .map((room) => ({
                x: room.x + room.width / 2 + (Math.random() - 0.5),
                y: room.y + room.height / 2 + (Math.random() - 0.5),
                radiusX: 1.2 + Math.random() * 0.6,
                radiusY: 0.8 + Math.random() * 0.5,
                strength: 0.28
            }))
        : [];

    castleColumns = [];
    bossArenaBounds = castlePlan && castlePlan.arena
        ? { ...castlePlan.arena }
        : currentFloor % 5 === 0
            ? { left: 4, right: cols - 5, top: 3, bottom: rows - 4 }
        : null;
    if (bossArenaBounds) {
        const preservedArenaCorridors = new Set(castleGeneration?.corridorCells || []);
        if (!castlePlan || castlePlan.arena) {
            for (let y = bossArenaBounds.top; y <= bossArenaBounds.bottom; y++) {
                for (let x = bossArenaBounds.left; x <= bossArenaBounds.right; x++) {
                    if (castlePlan && castlePlan.arena) {
                        const centerX = (bossArenaBounds.left + bossArenaBounds.right + 1) / 2;
                        const centerY = (bossArenaBounds.top + bossArenaBounds.bottom + 1) / 2;
                        const radius = Math.min(
                            (bossArenaBounds.right - bossArenaBounds.left + 1) / 2,
                            (bossArenaBounds.bottom - bossArenaBounds.top + 1) / 2
                        ) - 0.25;
                        const distanceX = x + 0.5 - centerX;
                        const distanceY = y + 0.5 - centerY;
                        maze[y][x] = distanceX * distanceX + distanceY * distanceY <= radius * radius
                            || preservedArenaCorridors.has(`${x},${y}`)
                            ? '.'
                            : '#';
                    } else {
                        maze[y][x] = '.';
                    }
                }
            }
            if (!castleGeneration && castlePlan && castlePlan.arena) {
                const hall = rooms[castlePlan.hub];
                for (const door of doors) {
                    if (door.pairIndex !== Math.floor((door.span || 3) / 2)) continue;
                    const hallWallX = door.x < hall.x
                        ? hall.x
                        : hall.x + hall.width - 1;
                    const direction = Math.sign(hallWallX - door.x);
                    for (
                        let x = door.x;
                        direction > 0 ? x <= hallWallX : x >= hallWallX;
                        x += direction
                    ) {
                        for (let y = door.y - 1; y <= door.y + 1; y++) {
                            if (
                                x >= bossArenaBounds.left
                                && x <= bossArenaBounds.right
                                && y >= bossArenaBounds.top
                                && y <= bossArenaBounds.bottom
                            ) {
                                maze[y][x] = '.';
                            }
                        }
                    }
                    const centerX = Math.floor(
                        (bossArenaBounds.left + bossArenaBounds.right) / 2
                    );
                    for (const x of [centerX - 1, centerX, centerX + 1]) {
                        maze[bossArenaBounds.top][x] = '.';
                        maze[bossArenaBounds.bottom][x] = '.';
                    }
                }
            }
        }

        const protectedPositions = [startPosition, exitPosition];
        const columnCandidates = castlePlan
            ? castlePlan.arena
                ? []
                : [
                    { x: bossArenaBounds.left + 3, y: bossArenaBounds.top + 3 },
                    { x: bossArenaBounds.right - 4, y: bossArenaBounds.top + 3 },
                    { x: bossArenaBounds.left + 3, y: bossArenaBounds.bottom - 4 },
                    { x: bossArenaBounds.right - 4, y: bossArenaBounds.bottom - 4 }
                ]
            : [
                { x: bossArenaBounds.left + 6, y: bossArenaBounds.top + 4 },
                { x: bossArenaBounds.right - 7, y: bossArenaBounds.top + 4 },
                { x: bossArenaBounds.left + 6, y: bossArenaBounds.bottom - 5 },
                { x: bossArenaBounds.right - 7, y: bossArenaBounds.bottom - 5 }
            ];
        for (const column of columnCandidates) {
            const cells = [
                { x: column.x, y: column.y },
                { x: column.x + 1, y: column.y },
                { x: column.x, y: column.y + 1 },
                { x: column.x + 1, y: column.y + 1 }
            ];
            if (cells.some((cell) => protectedPositions.some((position) => (
                cell.x === position.x && cell.y === position.y
            )))) {
                continue;
            }
            for (const cell of cells) {
                maze[cell.y][cell.x] = '#';
            }
            castleColumns.push(column);
        }
    }

    castleDecorations = [];
    if (roomLayout === 'castle') {
        if (castlePlan) {
            for (const [index, room] of rooms.entries()) {
                const center = centerOf(room);
                if (room.isStair || room.role === 'stair') {
                    castleDecorations.push({
                        type: 'stairs',
                        x: center.x - 1,
                        y: center.y - 1,
                        direction: room.stairDirection || (
                            room.name === 'Escadaria sul' || room.name === 'Escadaria de entrada'
                                ? 'up'
                                : 'down'
                        )
                    });
                } else if (!(castlePlan.arena && room.role === 'hall')) {
                    const rugWidth = room.width >= 11 ? 5 : 3;
                    const rugHeight = room.height >= 8 ? 3 : 2;
                    castleDecorations.push({
                        type: 'rug',
                        x: room.x + room.width - 1 - rugWidth,
                        y: room.y + room.height - 1 - rugHeight,
                        width: rugWidth,
                        height: rugHeight,
                        seed: index
                    });
                }

                const windowWidth = 4;
                const wallCandidates = [
                    {
                        orientation: 'horizontal',
                        x: room.x,
                        y: room.y,
                        length: room.width
                    },
                    {
                        orientation: 'horizontal',
                        x: room.x,
                        y: room.y + room.height - 1,
                        length: room.width
                    },
                    {
                        orientation: 'vertical',
                        x: room.x,
                        y: room.y,
                        length: room.height
                    },
                    {
                        orientation: 'vertical',
                        x: room.x + room.width - 1,
                        y: room.y,
                        length: room.height
                    }
                ];
                const verticalCandidates = wallCandidates.filter((side) => (
                    side.orientation === 'vertical'
                ));
                const horizontalCandidates = wallCandidates.filter((side) => (
                    side.orientation === 'horizontal'
                ));
                const candidates = index % 2 === 0
                    ? [...horizontalCandidates, ...verticalCandidates]
                    : [...verticalCandidates, ...horizontalCandidates];
                let placed = false;
                const windowHeightBlocks = room.width >= 12 && room.height >= 10 ? 2 : 1;
                for (const side of candidates) {
                    for (
                        let offset = 1;
                        offset + windowWidth < side.length;
                        offset++
                    ) {
                        const x = side.orientation === 'horizontal'
                            ? side.x + offset
                            : side.x;
                        const y = side.orientation === 'horizontal'
                            ? side.y
                            : side.y + offset;
                        const cells = Array.from(
                            { length: windowWidth },
                            (_, index) => side.orientation === 'horizontal'
                                ? { x: x + index, y }
                                : { x, y: y + index }
                        );
                        if (cells.every((cell) => (
                            maze[cell.y][cell.x] === '#'
                            && !doors.some((door) => (
                                door.x === cell.x && door.y === cell.y
                            ))
                        ))) {
                            castleDecorations.push({
                                type: 'window',
                                x,
                                y,
                                width: windowWidth,
                                heightBlocks: windowHeightBlocks,
                                orientation: side.orientation,
                                seed: index
                            });
                            placed = true;
                            break;
                        }
                    }
                    if (placed)                     break;
                }
            }
            if (castlePlan.arena) {
                const center = centerOf(rooms[castlePlan.hub]);
                castleDecorations.push({
                    type: 'bossHall',
                    x: center.x,
                    y: center.y
                });
            }
        } else if (bossArenaBounds) {
            for (const rug of [
                { x: bossArenaBounds.left + 3, y: bossArenaBounds.top + 2 },
                { x: bossArenaBounds.right - 8, y: bossArenaBounds.top + 2 },
                { x: bossArenaBounds.left + 3, y: bossArenaBounds.bottom - 4 },
                { x: bossArenaBounds.right - 8, y: bossArenaBounds.bottom - 4 }
            ]) {
                castleDecorations.push({
                    type: 'rug',
                    x: rug.x,
                    y: rug.y,
                    width: 5,
                    height: 2,
                    seed: castleDecorations.length
                });
            }
        } else {
            for (const [index, room] of rooms.entries()) {
                const center = centerOf(room);
                castleDecorations.push({
                    type: 'rug',
                    x: center.x - 2,
                    y: center.y - 1,
                    width: 5,
                    height: 3,
                    seed: index
                });
                const windowWidth = 4;
                const windowPositions = [];
                for (
                    let x = room.x + 1;
                    x + windowWidth <= room.x + room.width - 1;
                    x++
                ) {
                    if (
                        Array.from({ length: windowWidth }, (_, offset) => (
                            maze[room.y][x + offset] === '#'
                        )).every(Boolean)
                    ) {
                        windowPositions.push(x);
                    }
                }
                const leftWindow = windowPositions[0];
                const rightWindow = windowPositions.find((x) => (
                    x >= leftWindow + windowWidth
                ));
                for (const x of [leftWindow, rightWindow]) {
                    if (x === undefined) continue;
                    castleDecorations.push({
                        type: 'window',
                        x,
                        y: room.y,
                        width: windowWidth,
                        heightBlocks: room.width >= 12 && room.height >= 10 ? 2 : 1,
                        seed: index
                    });
                }
            }
        }
    }

    if (!bossArenaBounds && !castleCorridorPattern) {
        for (let y = 1; y < rows - 1; y++) {
            for (let x = 1; x < cols - 1; x++) {
                if (
                    maze[y][x] === '#'
                    || maze[y - 1][x] === '#'
                    || maze[y + 1][x] === '#'
                    || maze[y][x - 1] !== '#'
                    || maze[y][x + 1] !== '#'
                    || doors.some((door) => Math.abs(door.x - x) <= 1 && Math.abs(door.y - y) <= 1)
                ) {
                    continue;
                }
                const widenedX = x + 1 < cols - 1 ? x + 1 : x - 1;
                maze[y][widenedX] = '.';
            }
        }
    }

    if (!castleCorridorPattern) {
        for (let y = 1; y < rows - 1; y++) {
            for (let x = 1; x < cols - 1; x++) {
                if (
                    maze[y][x] === '#'
                    && maze[y - 1][x] !== '#'
                    && maze[y + 1][x] !== '#'
                    && maze[y][x - 1] !== '#'
                    && maze[y][x + 1] !== '#'
                ) {
                    maze[y][x] = '.';
                }
            }
        }
    }

    maze[startPosition.y][startPosition.x] = 'S';
    torches = placeTorches(maze);
    sewers = roomLayout === 'castle' ? [] : placeSewers(maze);
    barrels = bossArenaBounds ? [] : placeBarrels(maze);
    chests = bossArenaBounds || currentFloor === 16 ? [] : placeChests(maze);
    if (castleLayout) {
        for (const reward of castleLayout.objects) {
            if (
                reward.type !== 'chest'
                || maze[reward.y]?.[reward.x] !== '.'
                || (bossArenaBounds
                    && reward.x >= bossArenaBounds.left && reward.x <= bossArenaBounds.right
                    && reward.y >= bossArenaBounds.top && reward.y <= bossArenaBounds.bottom)
                || chests.some((chest) => chest.x === reward.x && chest.y === reward.y)
            ) continue;
            const rarity = chooseItemRarity();
            chests.push({
                x: reward.x,
                y: reward.y,
                rarity,
                health: 20,
                maxHealth: 20,
                hitFlash: 0,
                opened: false,
                isMimic: false,
                mimicState: 'hidden',
                mimicAnimationTime: 0,
                mimicAttackCooldown: 0,
                mimicAttackHit: false,
                containsPotion: Math.random() < 0.4 + rarity.rank * 0.15
            });
        }
    }
    carveMatriarchNestArea(maze);
    ambientDecorations = createAmbientDecorations(maze);

    return maze;
}

function getAmbientDecorationTypes(floor) {
    if (floor <= 4) {
        return [
            'mineSupport', 'mineCart', 'minePickaxe',
            'mineShovel', 'mineLantern', 'minePuddle', 'mineRubble', 'mineWeb'
        ];
    }
    if (floor === matriarchArenaConfig.floor) {
        return ['cisternPipe', 'cisternVent', 'cisternSoot', 'cisternGrate', 'mineCart'];
    }
    if (floor <= 9) {
        return ['cisternPipe', 'cisternVent', 'cisternSoot', 'cisternGrate'];
    }
    const castleDecorationsByFloor = {
        10: ['castleBanner', 'castleArmor', 'castleGate'],
        11: ['castleBunk', 'castleSupplyChest', 'castleMealTable', 'castleWeaponRack'],
        12: ['castleBookcase', 'castleScrolls', 'castleReadingDesk', 'castleLadder'],
        13: ['castleWeaponRack', 'castleShieldRack', 'castleArmorStand', 'castleAnvil'],
        14: ['castleAltar', 'castleCandles', 'castleBench', 'castleChandelier'],
        15: ['castleAlchemy', 'castleTelescope', 'castleStarMap', 'castleRune'],
        16: ['castleCoinPile', 'castleReinforcedChest', 'castleStatue', 'castleCoffer'],
        17: ['castlePortrait', 'castleCurtain', 'castleCanopyBed', 'castleFireplace'],
        18: ['castleChain', 'castleWarningSeal', 'castleRift', 'castleBanner'],
        19: ['castleEnergyBarrier', 'castleRunePillar', 'castleCrystal', 'castleArcaneCannon'],
        20: ['castleThrone', 'castleRoyalBanner', 'castleCorruption', 'castleStatue']
    };
    return castleDecorationsByFloor[floor] || castleDecorationsByFloor[20];
}

const ambientWallDecorationTypes = new Set([
    'minePickaxe', 'mineShovel', 'mineLantern',
    'mineRubble', 'cisternPipe', 'cisternVent', 'cisternSoot',
    'castleBanner', 'castleRoyalBanner', 'castleArmor', 'castleBookcase',
    'castleLadder', 'castleWeaponRack', 'castleShieldRack', 'castleArmorStand',
    'castleBunk', 'castleCanopyBed', 'castlePortrait', 'castleCurtain',
    'castleChain', 'castleWarningSeal', 'castleRift', 'castleRunePillar',
    'castleCrystal', 'castleArcaneCannon'
]);
const ambientCornerDecorationTypes = new Set(['mineWeb']);
const ambientPathDecorationTypes = new Set(['mineCart']);
const ambientThresholdDecorationTypes = new Set(['mineSupport']);
const ambientDecorationRoomRoles = {
    castleBanner: ['gallery', 'guard', 'tower'],
    castleArmor: ['armory', 'guard'],
    castleGate: ['hall', 'guard'],
    castleBunk: ['barracks', 'chamber'],
    castleSupplyChest: ['barracks', 'guard', 'armory'],
    castleMealTable: ['barracks', 'guard', 'service', 'gallery'],
    castleWeaponRack: ['armory', 'guard', 'barracks'],
    castleBookcase: ['library', 'study', 'secret'],
    castleScrolls: ['library', 'study', 'service'],
    castleReadingDesk: ['study', 'library', 'service'],
    castleLadder: ['library', 'tower'],
    castleShieldRack: ['armory', 'guard'],
    castleArmorStand: ['armory', 'guard'],
    castleAnvil: ['forge', 'service'],
    castleAltar: ['chapel'],
    castleBench: ['chapel', 'gallery'],
    castleCandles: ['chapel', 'gallery'],
    castleChandelier: ['hall', 'gallery', 'chapel'],
    castleAlchemy: ['laboratory'],
    castleTelescope: ['tower', 'laboratory'],
    castleStarMap: ['tower', 'gallery', 'laboratory'],
    castleRune: ['laboratory', 'chapel'],
    castleCoinPile: ['treasury'],
    castleReinforcedChest: ['treasury', 'guard'],
    castleStatue: ['treasury', 'hall', 'tower'],
    castleCoffer: ['treasury'],
    castlePortrait: ['gallery', 'chamber'],
    castleCurtain: ['chamber', 'gallery'],
    castleCanopyBed: ['chamber'],
    castleFireplace: ['chamber', 'hall'],
    castleChain: ['guard', 'secret'],
    castleWarningSeal: ['secret', 'laboratory', 'chapel'],
    castleRift: ['secret', 'laboratory'],
    castleEnergyBarrier: ['laboratory', 'guard', 'tower'],
    castleRunePillar: ['laboratory', 'tower'],
    castleCrystal: ['laboratory', 'treasury'],
    castleArcaneCannon: ['armory', 'guard', 'laboratory'],
    castleThrone: ['hall'],
    castleRoyalBanner: ['hall', 'gallery'],
    castleCorruption: ['hall', 'secret']
};

function getAmbientDecorationPlacementProfile(type) {
    const location = ambientCornerDecorationTypes.has(type) ? 'corner'
        : ambientWallDecorationTypes.has(type) ? 'wall'
            : ambientPathDecorationTypes.has(type) ? 'path'
                : ambientThresholdDecorationTypes.has(type) ? 'threshold'
                    : 'floor';
    return {
        location,
        roomRoles: ambientDecorationRoomRoles[type] || []
    };
}

function getAmbientDecorationFootprint(type, orientation = 'horizontal') {
    const footprints = {
        mineSupport: [2, 3],
        mineCart: [2, 2],
        minePickaxe: [1, 2],
        mineShovel: [1, 2],
        mineLantern: [1, 1],
        minePuddle: [2, 1],
        mineRubble: [2, 2],
        mineWeb: [2, 2],
        cisternPipe: [3, 3],
        cisternGrate: [2, 1],
        cisternVent: [2, 3],
        cisternSoot: [3, 2],
        castleBanner: [1, 2],
        castleRoyalBanner: [1, 2],
        castleArmor: [1, 2],
        castleGate: [3, 2],
        castleBunk: [2, 1],
        castleCanopyBed: [2, 2],
        castleSupplyChest: [1, 1],
        castleCoffer: [2, 1],
        castleReinforcedChest: [2, 1],
        castleMealTable: [2, 1],
        castleReadingDesk: [2, 1],
        castleBookcase: [2, 2],
        castleLadder: [1, 2],
        castleScrolls: [1, 1],
        castleWeaponRack: [2, 2],
        castleShieldRack: [2, 1],
        castleArmorStand: [1, 2],
        castleAnvil: [1, 1],
        castleAltar: [2, 1],
        castleBench: [2, 1],
        castleCandles: [1, 1],
        castleChandelier: [2, 2],
        castleAlchemy: [2, 1],
        castleTelescope: [1, 2],
        castleStarMap: [2, 2],
        castleRune: [1, 1],
        castleCoinPile: [2, 1],
        castleStatue: [1, 2],
        castlePortrait: [1, 2],
        castleWarningSeal: [1, 1],
        castleCurtain: [1, 2],
        castleFireplace: [2, 2],
        castleChain: [1, 2],
        castleRift: [1, 2],
        castleCorruption: [2, 2],
        castleEnergyBarrier: [3, 1],
        castleRunePillar: [1, 2],
        castleCrystal: [1, 2],
        castleArcaneCannon: [2, 1],
        castleThrone: [2, 3]
    };
    let [width, height] = footprints[type] || [1, 1];
    if (orientation === 'vertical') {
        [width, height] = [height, width];
    }
    return { width, height };
}

function getAmbientDecorationFootprintBounds(decoration) {
    const footprint = getAmbientDecorationFootprint(
        decoration.type,
        decoration.orientation
    );
    const widthBlocks = decoration.widthBlocks || footprint.width;
    const heightBlocks = decoration.heightBlocks || footprint.height;
    const width = widthBlocks * tileSize;
    const height = heightBlocks * tileSize;
    const centerX = (decoration.x + 0.5) * tileSize;
    const centerY = (decoration.y + 0.5) * tileSize;
    if (
        decoration.type === 'mineSupport'
        && decoration.placementAnchor === 'corridor'
    ) {
        if (decoration.corridorAxis === 'horizontal') {
            const left = decoration.x * tileSize;
            const top = decoration.y * tileSize;
            return { left, top, right: left + width, bottom: top + height };
        }
        const left = decoration.x * tileSize;
        const top = (decoration.y - Math.floor(heightBlocks / 2)) * tileSize;
        return { left, top, right: left + width, bottom: top + height };
    }
    switch (decoration.wallSide) {
        case 0:
            return { left: centerX - width / 2, top: decoration.y * tileSize + 3,
                right: centerX + width / 2, bottom: decoration.y * tileSize + 3 + height };
        case 1:
            return { left: (decoration.x + 1) * tileSize - 3 - width, top: centerY - height / 2,
                right: (decoration.x + 1) * tileSize - 3, bottom: centerY + height / 2 };
        case 2:
            return { left: centerX - width / 2, top: (decoration.y + 1) * tileSize - 3 - height,
                right: centerX + width / 2, bottom: (decoration.y + 1) * tileSize - 3 };
        case 3:
            return { left: decoration.x * tileSize + 3, top: centerY - height / 2,
                right: decoration.x * tileSize + 3 + width, bottom: centerY + height / 2 };
        default:
            return { left: centerX - width / 2, top: centerY - height / 2,
                right: centerX + width / 2, bottom: centerY + height / 2 };
    }
}

function ambientDecorationPlacementIsClear(decoration, maze) {
    const bounds = getAmbientDecorationFootprintBounds(decoration);
    if (
        bounds.left < 0 || bounds.top < 0
        || bounds.right > gridWidth || bounds.bottom > gridHeight
    ) return false;
    if ([startPosition, exitPosition].filter(Boolean).some((position) => (
        bounds.left < (position.x + 1) * tileSize
        && bounds.right > position.x * tileSize
        && bounds.top < (position.y + 1) * tileSize
        && bounds.bottom > position.y * tileSize
    ))) return false;

    const firstCol = Math.floor(bounds.left / tileSize);
    const lastCol = Math.ceil(bounds.right / tileSize) - 1;
    const firstRow = Math.floor(bounds.top / tileSize);
    const lastRow = Math.ceil(bounds.bottom / tileSize) - 1;
    if (
        decoration.type === 'mineSupport'
        && decoration.placementAnchor === 'corridor'
    ) {
        for (let row = firstRow; row <= lastRow; row += 1) {
            for (let col = firstCol; col <= lastCol; col += 1) {
                if (maze[row]?.[col] !== '.') return false;
            }
        }
        if (decoration.corridorAxis === 'horizontal') {
            if (
                Array.from({ length: lastCol - firstCol + 1 }, (_, index) => (
                    maze[firstRow - 1]?.[firstCol + index] === '#'
                    && maze[lastRow + 1]?.[firstCol + index] === '#'
                )).some((touchesWalls) => !touchesWalls)
            ) return false;
        } else if (
            Array.from({ length: lastRow - firstRow + 1 }, (_, index) => (
                maze[firstRow + index]?.[firstCol - 1] === '#'
                && maze[firstRow + index]?.[lastCol + 1] === '#'
            )).some((touchesWalls) => !touchesWalls)
        ) return false;
    } else {
        for (let row = firstRow; row <= lastRow; row += 1) {
    for (let col = firstCol; col <= lastCol; col += 1) {
        if (maze[row]?.[col] !== '.') return false;
    }
        }
    }

    const overlaps = (other) => (
        bounds.left < other.right && bounds.right > other.left
        && bounds.top < other.bottom && bounds.bottom > other.top
    );
    if (barrels.some((barrel) => (
        barrel.health > 0 && overlaps({
            left: barrel.x * tileSize + 2,
            top: barrel.y * tileSize + 2,
            right: barrel.x * tileSize + 14,
            bottom: barrel.y * tileSize + 14
        })
    ))) return false;
    if (chests.some((chest) => (
        chest.health > 0 && overlaps({
            left: chest.x * tileSize + 2,
            top: chest.y * tileSize + (chest.opened ? 6 : 3),
            right: chest.x * tileSize + 14,
            bottom: chest.y * tileSize + 14
        })
    ))) return false;
    const fixedObjects = [
        ...(decoration.type === 'mineSupport'
            ? []
            : doors.map((door) => ({
            left: door.x * tileSize,
            top: door.y * tileSize,
            right: (door.x + 1) * tileSize,
            bottom: (door.y + 1) * tileSize
            }))),
        ...torches.map((torch) => ({
            left: torch.x * tileSize,
            top: torch.y * tileSize,
            right: (torch.x + 1) * tileSize,
            bottom: (torch.y + 1) * tileSize
        })),
        ...castleColumns.map((column) => ({
            left: column.x * tileSize,
            top: column.y * tileSize,
            right: (column.x + 1) * tileSize,
            bottom: (column.y + 1) * tileSize
        })),
        ...castleDecorations
            .filter((existing) => (
                existing.type === 'stairs'
                || (existing.type === 'rug'
                    && !ambientWallDecorationTypes.has(decoration.type))
            ))
            .map((decoration) => ({
                left: decoration.x * tileSize,
                top: decoration.y * tileSize,
                right: (decoration.x + (decoration.width || 2)) * tileSize,
                bottom: (decoration.y + (decoration.height || 2)) * tileSize
            })),
        ...(decoration.type === 'mineSupport'
            ? []
            : sewers.map((sewer) => ({
                left: sewer.puddleX * tileSize - sewer.puddleWidth / 2,
                top: sewer.puddleY * tileSize - sewer.puddleHeight / 2,
                right: sewer.puddleX * tileSize + sewer.puddleWidth / 2,
                bottom: sewer.puddleY * tileSize + sewer.puddleHeight / 2
            })))
    ];
    if (fixedObjects.some(overlaps)) return false;
    return ambientDecorations.every((other) => (
        other === decoration || !overlaps(getAmbientDecorationFootprintBounds(other))
    ));
}

function getAmbientDecorationRoomAt(x, y) {
    return dungeonRooms
        .filter((room) => (
            x >= room.x + 1 && x < room.x + room.width - 1
            && y >= room.y + 1 && y < room.y + room.height - 1
        ))
        .sort((first, second) => first.width * first.height - second.width * second.height)[0]
        || null;
}

function ambientDecorationInsideRoomBounds(x, y) {
    return dungeonRooms.some((room) => (
        x >= room.x && x < room.x + room.width
        && y >= room.y && y < room.y + room.height
    ));
}

function getAmbientDecorationCorridorCenters(maze) {
    const corridors = [];
    for (const axis of ['horizontal', 'vertical']) {
        const crossLimit = axis === 'horizontal' ? rows - 2 : cols - 2;
        const axisLength = axis === 'horizontal' ? cols : rows;
        for (let cross = 1; cross <= crossLimit; cross += 1) {
            let runStart = null;
            const isCorridorSection = (position) => {
                const cells = axis === 'horizontal'
                    ? [[position, cross], [position, cross + 1]]
                    : [[cross, position], [cross + 1, position]];
                const floorIsOutsideRooms = cells.every(([x, y]) => (
                    maze[y]?.[x] === '.'
                    && !ambientDecorationInsideRoomBounds(x, y)
                ));
                if (!floorIsOutsideRooms) return false;
                return axis === 'horizontal'
                    ? maze[cross - 1]?.[position] === '#'
                        && maze[cross + 2]?.[position] === '#'
                    : maze[position]?.[cross - 1] === '#'
                        && maze[position]?.[cross + 2] === '#';
            };
            const finishRun = (runEnd) => {
                if (runStart === null) return;
                const length = runEnd - runStart + 1;
                if (length >= 3) {
                    const midpoint = Math.floor((runStart + runEnd) / 2);
                    corridors.push({
                        x: axis === 'horizontal' ? midpoint : cross,
                        y: axis === 'horizontal' ? cross : midpoint,
                        orientation: 'horizontal',
                        axis,
                        length,
                        start: runStart,
                        end: runEnd
                    });
                }
                runStart = null;
            };
            for (let position = 1; position < axisLength - 1; position += 1) {
                if (isCorridorSection(position)) {
                    if (runStart === null) runStart = position;
                } else {
                    finishRun(position - 1);
                }
            }
            finishRun(axisLength - 2);
        }
    }
    return corridors;
}

function getAmbientDecorationPathOrientation(maze, x, y, room) {
    const horizontal = maze[y]?.[x - 1] === '.' && maze[y]?.[x + 1] === '.';
    const vertical = maze[y - 1]?.[x] === '.' && maze[y + 1]?.[x] === '.';
    if (horizontal && vertical && room) {
        return room.width >= room.height ? 'horizontal' : 'vertical';
    }
    if (horizontal) return 'horizontal';
    if (vertical) return 'vertical';
    return null;
}

function getAmbientDecorationCandidates(type, maze) {
    const profile = getAmbientDecorationPlacementProfile(type);
    const hasCompatibleRoom = dungeonRooms.some((room) => profile.roomRoles.includes(room.role));
    const candidates = [];
    const protectedArenaBounds = bossArenaBounds ? {
        left: (bossArenaBounds.left + 3) * tileSize,
        top: (bossArenaBounds.top + 3) * tileSize,
        right: (bossArenaBounds.right - 2) * tileSize,
        bottom: (bossArenaBounds.bottom - 2) * tileSize
    } : null;
    const corridorCenters = profile.location === 'threshold'
        ? getAmbientDecorationCorridorCenters(maze)
        : [];
    for (let y = 1; y < rows - 1; y += 1) {
        for (let x = 1; x < cols - 1; x += 1) {
            if (maze[y][x] !== '.') continue;
            const room = getAmbientDecorationRoomAt(x, y);
            if (room?.safeForSecret) continue;
            if (type === 'mineCart' && !room) continue;
            if (
                profile.roomRoles.length > 0
                && hasCompatibleRoom
                && !profile.roomRoles.includes(room?.role)
            ) continue;

            const wallSides = [
                maze[y - 1]?.[x] === '#',
                maze[y]?.[x + 1] === '#',
                maze[y + 1]?.[x] === '#',
                maze[y]?.[x - 1] === '#'
            ];
            let anchors;
            if (profile.location === 'wall') {
                anchors = wallSides
                    .map((isWall, side) => (isWall ? side : -1))
                    .filter((side) => side >= 0)
                    .map((side) => ({ x, y, wallSide: side }));
            } else if (profile.location === 'corner') {
                const roomCorners = room ? [
                    { x: room.x + 2, y: room.y + 2 },
                    { x: room.x + room.width - 3, y: room.y + 2 },
                    { x: room.x + 2, y: room.y + room.height - 3 },
                    { x: room.x + room.width - 3, y: room.y + room.height - 3 }
                ] : [];
                anchors = roomCorners.some((corner) => (
                    Math.abs(x - corner.x) <= 1 && Math.abs(y - corner.y) <= 1
                )) ? [{ x, y, wallSide: -1 }] : [];
            } else if (profile.location === 'path') {
                const orientation = getAmbientDecorationPathOrientation(maze, x, y, room);
                anchors = orientation ? [{ x, y, wallSide: -1, preferredOrientation: orientation }] : [];
            } else if (profile.location === 'threshold') {
                anchors = corridorCenters.flatMap((corridor) => {
                    const positions = corridor.axis === 'horizontal'
                        ? [corridor.start, corridor.end].map((position, index) => ({
                            x: position,
                            y: corridor.y,
                            corridorSupportIndex: index
                        }))
                        : [{
                            x: corridor.x,
                            y: corridor.y,
                            corridorSupportIndex: 0
                        }];
                    return positions
                        .filter((position) => position.x === x && position.y === y)
                        .map((position) => ({
                            ...position,
                            wallSide: -1,
                            preferredOrientation: corridor.orientation,
                            corridorAxis: corridor.axis,
                            corridorStart: corridor.start,
                            corridorEnd: corridor.end,
                            corridor: true,
                            corridorLength: corridor.length
                        }));
                });
            } else {
                anchors = [{ x, y, wallSide: -1 }];
            }

            for (const anchor of anchors) {
                const preferredOrientation = anchor.preferredOrientation
                    || (profile.location === 'wall' && [1, 3].includes(anchor.wallSide)
                        ? 'vertical'
                        : getAmbientDecorationPathOrientation(maze, anchor.x, anchor.y, room)
                            || 'horizontal');
                const orientations = anchor.corridor
                    ? [preferredOrientation]
                    : [
                        preferredOrientation,
                        preferredOrientation === 'horizontal' ? 'vertical' : 'horizontal'
                    ];
                for (const orientation of orientations) {
                    const footprint = getAmbientDecorationFootprint(type, orientation);
                    const widthBlocks = anchor.corridor
                        && anchor.corridorAxis === 'horizontal'
                        ? 1
                        : footprint.width;
                    const heightBlocks = anchor.corridor
                        && anchor.corridorAxis === 'horizontal'
                        ? 2
                        : footprint.height;
                    const decoration = {
                        x: anchor.x,
                        y: anchor.y,
                        wallSide: anchor.wallSide,
                        orientation,
                        type,
                        widthBlocks,
                        heightBlocks,
                        roomRole: room?.role || null,
                        roomKey: room ? `${room.x},${room.y}` : 'corridor',
                        placementAnchor: anchor.corridor ? 'corridor' : null,
                        corridorAxis: anchor.corridorAxis || null,
                        corridorStart: anchor.corridorStart ?? null,
                        corridorEnd: anchor.corridorEnd ?? null,
                        corridorSupportIndex: anchor.corridorSupportIndex ?? null,
                        corridorLength: anchor.corridorLength || 0,
                        preferredOrientation
                    };
                    if (
                        room
                        && ambientDecorations.filter((placed) => (
                            placed.roomKey === `${room.x},${room.y}`
                        )).length >= 2
                    ) continue;
                    const bounds = getAmbientDecorationFootprintBounds(decoration);
                    if (currentFloor === matriarchArenaConfig.floor
                        && [matriarchArenaConfig.bounds, matriarchArenaConfig.secretBounds]
                            .some((roomBounds) => (
                                bounds.left < (roomBounds.x + roomBounds.width) * tileSize
                                && bounds.right > roomBounds.x * tileSize
                                && bounds.top < (roomBounds.y + roomBounds.height) * tileSize
                                && bounds.bottom > roomBounds.y * tileSize
                            ))) continue;
                    if (protectedArenaBounds
                        && bounds.left < protectedArenaBounds.right
                        && bounds.right > protectedArenaBounds.left
                        && bounds.top < protectedArenaBounds.bottom
                        && bounds.bottom > protectedArenaBounds.top) continue;
                    if (!ambientDecorationPlacementIsClear(decoration, maze)) continue;
                    if (
                        room
                        && profile.location !== 'threshold'
                        && dungeonRooms.some((entry) => entry.role)
                    ) {
                        const roomBounds = {
                            left: (room.x + 1) * tileSize,
                            top: (room.y + 1) * tileSize,
                            right: (room.x + room.width - 1) * tileSize,
                            bottom: (room.y + room.height - 1) * tileSize
                        };
                        if (
                            bounds.left < roomBounds.left || bounds.top < roomBounds.top
                            || bounds.right > roomBounds.right || bounds.bottom > roomBounds.bottom
                        ) continue;
                    }
                    candidates.push(decoration);
                }
            }
        }
    }
    return candidates;
}

function scoreAmbientDecorationCandidate(decoration) {
    const profile = getAmbientDecorationPlacementProfile(decoration.type);
    const room = getAmbientDecorationRoomAt(decoration.x, decoration.y);
    const roomCenter = room?.center || {
        x: Math.floor(cols / 2),
        y: Math.floor(rows / 2)
    };
    const distance = (first, second) => Math.abs(first.x - second.x) + Math.abs(first.y - second.y);
    const roomKey = room ? `${room.x},${room.y}` : 'corridor';
    const roomUseCount = ambientDecorations.filter((placed) => (
        placed.roomKey === roomKey
    )).length;
    let score = roomUseCount * 18;
    if (decoration.orientation !== decoration.preferredOrientation) score += 12;
    if (decoration.type === 'mineSupport') {
        score -= (decoration.corridorLength || 0) * 100;
    }
    if (profile.location === 'floor') {
        score += distance(decoration, roomCenter);
    } else if (profile.location === 'corner') {
        const cornerDistance = Math.min(
            distance(decoration, { x: room?.x + 1 || 1, y: room?.y + 1 || 1 }),
            distance(decoration, {
                x: room ? room.x + room.width - 2 : cols - 2,
                y: room ? room.y + 1 : 1
            }),
            distance(decoration, {
                x: room ? room.x + 1 : 1,
                y: room ? room.y + room.height - 2 : rows - 2
            }),
            distance(decoration, {
                x: room ? room.x + room.width - 2 : cols - 2,
                y: room ? room.y + room.height - 2 : rows - 2
            })
        );
        score += cornerDistance;
    }

    const previousSameType = ambientDecorations.filter((placed) => placed.type === decoration.type);
    for (const placed of ambientDecorations) {
        score += Math.max(0, 5 - distance(decoration, placed)) * 4;
    }
    for (const placed of previousSameType) {
        score += Math.max(0, 7 - distance(decoration, placed)) * 5;
        if (placed.roomRole && placed.roomRole === decoration.roomRole) score += 30;
    }
    if (decoration.type === 'mineCart') {
        const carts = ambientDecorations.filter((placed) => placed.type === 'mineCart');
        if (carts.length > 0) {
            score += Math.min(...carts.map((placed) => distance(decoration, placed))) * 3;
        }
    }
    if (['minePuddle', 'cisternGrate'].includes(decoration.type) && sewers.length > 0) {
        score += Math.min(...sewers.map((sewer) => (
            Math.abs(decoration.x - sewer.puddleX) + Math.abs(decoration.y - sewer.puddleY)
        ))) * 8;
    }
    if (['cisternPipe', 'cisternSoot', 'cisternVent'].includes(decoration.type)) {
        const hotProps = ambientDecorations.filter((placed) => (
            ['cisternPipe', 'cisternVent'].includes(placed.type)
        ));
        if (hotProps.length > 0) {
            score += Math.min(...hotProps.map((placed) => distance(decoration, placed))) * 4;
        }
    }
    if (['minePickaxe', 'mineShovel'].includes(decoration.type)) {
        const equipment = ambientDecorations.filter((placed) => (
            placed.type === 'mineCart'
        ));
        if (equipment.length > 0) {
            score += Math.min(...equipment.map((placed) => distance(decoration, placed))) * 3;
        }
    }
    return score;
}

function getAmbientDecorationCollisionBoxes(decoration) {
    const footprint = getAmbientDecorationFootprint(
        decoration.type,
        decoration.orientation
    );
    const widthBlocks = decoration.widthBlocks || footprint.width;
    const heightBlocks = decoration.heightBlocks || footprint.height;
    const footprintBounds = getAmbientDecorationFootprintBounds(decoration);
    const blockingShapes = {
        mineSupport: [
            [0, 0.22, 0.16, 0.66],
            [0.84, 0.22, 0.16, 0.66],
            [0, 0.12, 1, 0.12]
        ],
        mineCart: [[0.12, 0.42, 0.76, 0.48]],
        minePickaxe: [[0.36, 0.18, 0.26, 0.74]],
        mineShovel: [[0.34, 0.18, 0.32, 0.76]],
        mineLantern: [[0.22, 0.4, 0.56, 0.53]],
        mineRubble: [[0.16, 0.4, 0.68, 0.54]],
        cisternPipe: [
            [0.03, 0.19, 0.94, 0.2],
            [0.4, 0.03, 0.2, 0.94]
        ],
        cisternVent: [[0.22, 0.54, 0.56, 0.42]]
    };
    const shapes = blockingShapes[decoration.type] || [];
    return shapes.map(([x, y, width, height]) => ({
        left: Math.max(0, footprintBounds.left
            + (decoration.orientation === 'vertical' ? 1 - y - height : x)
                * widthBlocks * tileSize),
        top: Math.max(0, footprintBounds.top
            + (decoration.orientation === 'vertical' ? x : y)
                * heightBlocks * tileSize),
        right: Math.min(gridWidth, footprintBounds.left
            + (decoration.orientation === 'vertical' ? 1 - y : x + width)
                * widthBlocks * tileSize),
        bottom: Math.min(gridHeight, footprintBounds.top
            + (decoration.orientation === 'vertical' ? x + width : y + height)
                * heightBlocks * tileSize)
    })).filter((bounds) => bounds.left < bounds.right && bounds.top < bounds.bottom);
}

function ambientDecorationBlocksBounds(x, y, width, height) {
    const right = x + width;
    const bottom = y + height;
    return ambientDecorations.some((decoration) => (
        getAmbientDecorationCollisionBoxes(decoration).some((bounds) => (
            x < bounds.right
            && right > bounds.left
            && y < bounds.bottom
            && bottom > bounds.top
        ))
    )) || matriarchPillarsBlockBounds(x, y, width, height);
}

function matriarchPillarsBlockBounds(x, y, width, height) {
    if (!matriarchArena) return false;
    const right = x + width;
    const bottom = y + height;
    return matriarchArena.pillars.some((pillar) => (
        x < (pillar.x + pillar.width) * tileSize
        && right > pillar.x * tileSize
        && y < (pillar.y + pillar.height) * tileSize
        && bottom > pillar.y * tileSize
    ));
}

function ambientDecorationBlocksPlayerBounds(x, y, width, height) {
    const right = x + width;
    const bottom = y + height;
    return ambientDecorations.some((decoration) => (
        decoration.type === 'mineCart'
        && getAmbientDecorationCollisionBoxes(decoration).some((bounds) => (
            x < bounds.right
            && right > bounds.left
            && y < bounds.bottom
            && bottom > bounds.top
        ))
    ));
}

function createAmbientDecorations(maze) {
    const decorationTypes = getAmbientDecorationTypes(currentFloor);
    const targetCount = currentFloor <= 4 ? 9 : currentFloor <= 9 ? 8 : 10;
    for (let slot = 0; slot < targetCount; slot += 1) {
        const type = decorationTypes[slot % decorationTypes.length];
        if (type === 'mineLantern' && currentFloor <= 4 && torches.length > 0) {
            const originalTorches = torches;
            const startIndex = (currentFloor - 1) % originalTorches.length;
            const replacementIndexes = Array.from(
                { length: originalTorches.length },
                (_, offset) => (startIndex + offset) % originalTorches.length
            );
            const replacedTorchIndexes = new Set();
            const reachableBeforeLanterns = getReachableFloorTileKeys(startPosition, maze);
            const exitKey = `${exitPosition.x},${exitPosition.y}`;
            const wallOffsets = [[0, -1], [1, 0], [0, 1], [-1, 0]];
            for (const torchIndex of replacementIndexes) {
                if (replacedTorchIndexes.size >= 2) break;
                const replacedTorch = originalTorches[torchIndex];
                const lantern = getAmbientDecorationCandidates('mineLantern', maze)
                    .filter((candidate) => {
                        const offset = wallOffsets[candidate.wallSide];
                        return offset
                            && candidate.x + offset[0] === replacedTorch.x
                            && candidate.y + offset[1] === replacedTorch.y;
                    })
                    .map((decoration) => ({
                        decoration,
                        score: scoreAmbientDecorationCandidate(decoration)
                    }))
                    .sort((first, second) => (
                        first.score - second.score
                        || first.decoration.y - second.decoration.y
                        || first.decoration.x - second.decoration.x
                    ))[0]?.decoration;
                if (!lantern) continue;
                ambientDecorations.push({
                    ...lantern,
                    replacedTorch: { x: replacedTorch.x, y: replacedTorch.y },
                    replacedTorchIndex: torchIndex
                });
                if (reachableBeforeLanterns.has(exitKey)
                    && !getReachableFloorTileKeys(startPosition, maze).has(exitKey)) {
                    ambientDecorations.pop();
                    continue;
                }
                replacedTorchIndexes.add(torchIndex);
            }
            torches = originalTorches.filter((_, index) => !replacedTorchIndexes.has(index));
            continue;
        }
        if (type === 'mineSupport') {
            const supports = getAmbientDecorationCandidates(type, maze)
                .map((decoration) => ({
                    decoration,
                    score: scoreAmbientDecorationCandidate(decoration)
                }))
                .sort((first, second) => (
                    first.score - second.score
                    || first.decoration.y - second.decoration.y
                    || first.decoration.x - second.decoration.x
                    || first.decoration.corridorAxis.localeCompare(
                        second.decoration.corridorAxis
                    )
                ));
            for (const { decoration } of supports) {
                if (ambientDecorationPlacementIsClear(decoration, maze)) {
                    ambientDecorations.push(decoration);
                }
            }
            continue;
        }
        if (ambientDecorations.some((decoration) => decoration.type === type)) continue;
        const candidates = getAmbientDecorationCandidates(type, maze)
            .map((decoration) => ({
                decoration,
                score: scoreAmbientDecorationCandidate(decoration)
            }));
        candidates.sort((first, second) => {
            if (currentFloor === matriarchArenaConfig.floor && type === 'mineCart') {
                const approachPoint = {
                    x: matriarchArenaConfig.bounds.x - 4,
                    y: matriarchArenaConfig.bounds.y - 1
                };
                const firstDistance = Math.abs(first.decoration.x - approachPoint.x)
                    + Math.abs(first.decoration.y - approachPoint.y);
                const secondDistance = Math.abs(second.decoration.x - approachPoint.x)
                    + Math.abs(second.decoration.y - approachPoint.y);
                if (firstDistance !== secondDistance) return firstDistance - secondDistance;
            }
            return (
                first.score - second.score
                || first.decoration.y - second.decoration.y
                || first.decoration.x - second.decoration.x
                || first.decoration.wallSide - second.decoration.wallSide
            );
        });
        const candidate = candidates[0]?.decoration;
        if (candidate) ambientDecorations.push(candidate);
    }
    return ambientDecorations;
}

map = createMap();

function captureGeneratedMapState() {
    return {
        doors,
        dungeonRooms,
        castleLayout,
        startPosition,
        exitPosition,
        ambientShadowZones,
        castleColumns,
        castleDecorations,
        ambientDecorations,
        bossArenaBounds,
        secretRooms,
        matriarchArena,
        torches,
        sewers,
        barrels,
        chests
    };
}

function restoreGeneratedMapState(state) {
    doors = state.doors;
    dungeonRooms = state.dungeonRooms;
    castleLayout = state.castleLayout || null;
    startPosition = state.startPosition;
    exitPosition = state.exitPosition;
    ambientShadowZones = state.ambientShadowZones;
    castleColumns = state.castleColumns;
    castleDecorations = state.castleDecorations;
    ambientDecorations = state.ambientDecorations;
    bossArenaBounds = state.bossArenaBounds;
    secretRooms = state.secretRooms || [];
    matriarchArena = state.matriarchArena || null;
    torches = state.torches;
    sewers = state.sewers;
    barrels = state.barrels;
    chests = state.chests;
}

function preGenerateFloorMap(floor) {
    if (
        floor < 1
        || floor > finalFloor
        || floor <= currentFloor
        || floorMapPrefetchCache.has(floor)
    ) {
        return false;
    }

    const previousFloor = currentFloor;
    const previousState = captureGeneratedMapState();
    const originalRandom = Math.random;
    let randomState = (gameSeed + floor * 0x9e3779b9) >>> 0;
    if (randomState === 0) randomState = 1;
    Math.random = () => {
        randomState ^= randomState << 13;
        randomState ^= randomState >>> 17;
        randomState ^= randomState << 5;
        return (randomState >>> 0) / 0x100000000;
    };

    try {
        currentFloor = floor;
        const generatedMap = createMap();
        floorMapPrefetchCache.set(floor, {
            map: generatedMap,
            ...captureGeneratedMapState()
        });
        return true;
    } finally {
        Math.random = originalRandom;
        currentFloor = previousFloor;
        restoreGeneratedMapState(previousState);
    }
}

function createMapForCurrentFloor() {
    const prefetched = floorMapPrefetchCache.get(currentFloor);
    if (!prefetched) {
        pruneFloorMapPrefetchCache();
        return createMap();
    }

    floorMapPrefetchCache.delete(currentFloor);
    pruneFloorMapPrefetchCache();
    restoreGeneratedMapState(prefetched);
    return prefetched.map;
}

function clearFloorMapPrefetch() {
    floorMapPrefetchCache.clear();
    floorMapPrefetchGeneration += 1;
    floorMapPrefetchScheduled = false;
    if (typeof releasePrefetchedMapBaseCanvas === 'function') {
        releasePrefetchedMapBaseCanvas();
    }
}

function pruneFloorMapPrefetchCache() {
    const firstFutureFloor = currentFloor + 1;
    const lastFutureFloor = Math.min(finalFloor, currentFloor + floorMapPrefetchLimit);
    for (const floor of floorMapPrefetchCache.keys()) {
        if (floor < firstFutureFloor || floor > lastFutureFloor) {
            floorMapPrefetchCache.delete(floor);
        }
    }
    if (
        prefetchedMapBaseFloor !== firstFutureFloor
        && prefetchedMapBaseFloor !== currentFloor
    ) {
        if (typeof releasePrefetchedMapBaseCanvas === 'function') {
            releasePrefetchedMapBaseCanvas();
        }
    }
}

function prefetchNextFloorMap(generation, idleDeadline) {
    if (generation !== floorMapPrefetchGeneration) return;
    floorMapPrefetchScheduled = false;
    if (
        document.hidden
        || gameState !== 'playing'
        || !portalUnlocked
        || new URLSearchParams(location.search).get('test') === '1'
    ) {
        return;
    }

    if (idleDeadline && idleDeadline.timeRemaining() <= 0) {
        scheduleFloorMapPrefetch();
        return;
    }

    pruneFloorMapPrefetchCache();
    let nextFloor = null;
    for (
        let floor = currentFloor + 1;
        floor <= Math.min(finalFloor, currentFloor + floorMapPrefetchLimit);
        floor++
    ) {
        if (!floorMapPrefetchCache.has(floor)) {
            nextFloor = floor;
            break;
        }
    }
    if (nextFloor === null) return;

    try {
        preGenerateFloorMap(nextFloor);
    } catch (error) {
        console.error(`Falha ao pregerar o mapa do andar ${nextFloor}.`, error);
        return;
    }
    if (nextFloor === currentFloor + 1 && typeof renderPrefetchedFloorBase === 'function') {
        try {
            renderPrefetchedFloorBase(nextFloor);
        } catch (error) {
            console.error(`Falha ao preparar o desenho do andar ${nextFloor}.`, error);
        }
    }
    if (nextFloor < Math.min(finalFloor, currentFloor + floorMapPrefetchLimit)) {
        scheduleFloorMapPrefetch();
    }
}

function scheduleFloorMapPrefetch() {
    if (
        floorMapPrefetchScheduled
        || document.hidden
        || gameState !== 'playing'
        || !portalUnlocked
        || new URLSearchParams(location.search).get('test') === '1'
    ) {
        return;
    }

    floorMapPrefetchScheduled = true;
    const generation = floorMapPrefetchGeneration;
    const callback = (idleDeadline) => prefetchNextFloorMap(generation, idleDeadline);
    if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(callback);
    } else {
        window.setTimeout(callback, 250);
    }
}

function getTile(x, y) {
    const col = Math.floor(x / tileSize);
    const row = Math.floor(y / tileSize);

    if (row < 0 || row >= rows || col < 0 || col >= cols) {
        return '#';
    }

    return map[row][col];
}

function updateAutomaticDoors(delta) {
    if (doors.length === 0 || !player) return;

    const actors = [player, ...enemies].filter((actor) => actor && actor.health > 0);
    for (const door of doors) {
        if (door.pairId && door.pairIndex !== 0) continue;
        const doorSpan = door.span || 2;
        const doorX = (
            door.x + (door.orientation === 'horizontal' ? doorSpan / 2 : 0.5)
        ) * tileSize;
        const doorY = (
            door.y + (door.orientation === 'vertical' ? doorSpan / 2 : 0.5)
        ) * tileSize;
        const nearby = actors.some((actor) => {
            const actorX = actor.x + actor.size / 2;
            const actorY = actor.y + actor.size / 2;
            return Math.hypot(actorX - doorX, actorY - doorY) <= tileSize * 3;
        });
        door.progress = Math.max(
            0,
            Math.min(1, door.progress + (nearby ? 1 : -1) * delta * 3)
        );
        if (door.pairId) {
            for (const pairedDoor of doors) {
                if (pairedDoor.pairId === door.pairId) {
                    pairedDoor.progress = door.progress;
                }
            }
        }
    }
}

function getCollisionBounds(entity, x = entity.x, y = entity.y) {
    let width = entity.collisionWidth || entity.size;
    const height = entity.collisionHeight || entity.size;
    const offsetY = entity.collisionOffsetY || 0;
    if (entity === player) {
        return {
            left: x + (entity.size - width) / 2,
            top: y + (entity.size - height) / 2 + offsetY,
            right: x + (entity.size + width) / 2,
            bottom: y + (entity.size + height) / 2 + offsetY
        };
    }
    let leftInset = 3.5;
    let rightInset = 3.5;
    let topInset = 0.1;
    let bottomInset = 0.1;
    return {
        left: x + (entity.size - width) / 2 + leftInset,
        top: y + (entity.size - height) / 2 + offsetY + topInset,
        right: x + (entity.size + width) / 2 - rightInset,
        bottom: y + (entity.size + height) / 2 + offsetY - bottomInset
    };
}

function canMoveTo(
    x,
    y,
    width = 12,
    height = width,
    ignoreClosedDoors = false,
    passCapeThroughWalls = false,
    ignoreAmbientDecorations = false,
    blockPlayerWithMineCarts = false
) {
    const right = x + width;
    const bottom = y + height;
    let wallLeft = x;
    let wallRight = right;
    if (passCapeThroughWalls) {
        const capePassWidth = Math.min(5, Math.max(0, width - 1));
        if (player.spriteFacingX < 0) {
            wallRight -= capePassWidth;
        } else {
            wallLeft += capePassWidth;
        }
    }
    const minCol = Math.floor(wallLeft / tileSize);
    const maxCol = Math.ceil(wallRight / tileSize) - 1;
    const minRow = Math.floor(y / tileSize);
    const maxRow = Math.ceil(bottom / tileSize) - 1;

    for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
            if (getTile((col + 0.5) * tileSize, (row + 0.5) * tileSize) === '#') {
                return false;
            }
        }
    }

    if (!ignoreClosedDoors) {
        const minDoorCol = Math.floor(x / tileSize);
        const maxDoorCol = Math.ceil(right / tileSize) - 1;
        const minDoorRow = Math.floor(y / tileSize);
        const maxDoorRow = Math.ceil(bottom / tileSize) - 1;
        for (let row = minDoorRow; row <= maxDoorRow; row++) {
            for (let col = minDoorCol; col <= maxDoorCol; col++) {
                if (doors.some((door) => (
                    door.progress < 0.9 && door.x === col && door.y === row
                ))) {
                    return false;
                }
            }
        }
    }

    const blockedByDecoration = !ignoreAmbientDecorations
        && ambientDecorationBlocksBounds(x, y, width, height);
    const blockedPlayerByMineCart = blockPlayerWithMineCarts
        && ambientDecorationBlocksPlayerBounds(x, y, width, height);
    return !blockedByDecoration
        && !blockedPlayerByMineCart
        && !barrels.some((barrel) => (
        barrel.health > 0
        && x < barrel.x * tileSize + 14
        && right > barrel.x * tileSize + 2
        && y < barrel.y * tileSize + 14
        && bottom > barrel.y * tileSize + 2
    )) && !chests.some((chest) => {
        const chestTop = chest.y * tileSize + (chest.opened ? 6 : 3);
        return chest.health > 0
            && x < chest.x * tileSize + 14
            && right > chest.x * tileSize + 2
            && y < chest.y * tileSize + 14
            && bottom > chestTop;
    });
}

function canEntityMoveTo(entity, x, y, ignoreClosedDoors = false) {
    if (devMode && entity === player) {
        const bounds = getCollisionBounds(entity, x, y);
        return bounds.left >= 0
            && bounds.top >= 0
            && bounds.right <= gridWidth
            && bounds.bottom <= gridHeight;
    }
    const bounds = getCollisionBounds(entity, x, y);
    return canMoveTo(
        bounds.left,
        bounds.top,
        bounds.right - bounds.left,
        bounds.bottom - bounds.top,
        ignoreClosedDoors,
        entity === player,
        entity === player,
        entity === player
    );
}

function collisionBoundsOverlap(first, second) {
    const firstBounds = getCollisionBounds(first);
    const secondBounds = getCollisionBounds(second);
    return firstBounds.left < secondBounds.right
        && firstBounds.right > secondBounds.left
        && firstBounds.top < secondBounds.bottom
        && firstBounds.bottom > secondBounds.top;
}

function getCollisionRadius(entity) {
    return Math.max(entity.collisionWidth || entity.size, entity.collisionHeight || entity.size) / 2;
}

function collisionDistanceToPoint(entity, x, y) {
    const bounds = getCollisionBounds(entity);
    const closestX = Math.max(bounds.left, Math.min(x, bounds.right));
    const closestY = Math.max(bounds.top, Math.min(y, bounds.bottom));
    return Math.hypot(x - closestX, y - closestY);
}

function getPlayerMaxHealth() {
    return playerMaxHealth + playerProgress.attributes.health * 10;
}

function getPlayerMeleeDamage() {
    return 10
        + getSwordUpgradeBonus(gearUpgrades.sword)
        + playerProgress.attributes.meleeDamage * 2;
}

function getAimedWeaponDamage(baseDamage) {
    return baseDamage + playerProgress.attributes.aim * 2;
}

function createPlayer() {
    const maxHealth = getPlayerMaxHealth();
    return {
        x: startPosition.x * tileSize + 2,
        y: startPosition.y * tileSize + 2,
        character: selectedCharacter,
        size: 14,
        collisionWidth: playerCollisionWidth,
        collisionHeight: playerCollisionHeight,
        collisionOffsetY: 0,
        speed: 70,
        damage: getPlayerMeleeDamage(),
        defense: gearOwned.armor ? getArmorDefense(gearUpgrades.armor) : 0,
        maxHealth,
        health: maxHealth,
        damageCooldown: 0,
        poisonTimer: 0,
        poisonTickTimer: 0,
        poisonDamageRemaining: 0,
        burnTimer: 0,
        burnTickTimer: 0,
        burnDamageRemaining: 0,
        counterAttackTimer: 0,
        webbedTimer: 0,
        dodgeTimer: 0,
        dodgeDirectionX: 0,
        dodgeDirectionY: 0,
        facingX: 1,
        facingY: 0,
        spriteFacingX: 1,
        moving: false,
        animTime: 0,
        attackCooldown: 0,
        attackTimer: 0,
        maleAttackAnimationTimer: 0,
        spearCooldown: 0,
        spearAttackTimer: 0,
        spearFacingX: 1,
        spearFacingY: 0,
        arrowCooldown: 0,
        attackFacingX: 1,
        attackFacingY: 0,
        dashActive: false,
        dashCooldown: 0,
        dashTimer: 0,
        dashDuration: 0,
        dashDirectionX: 0,
        dashDirectionY: 0,
        dashDistance: 0,
        dashTravelled: 0,
        dashTarget: null,
        dashAttackUsed: false,
        specialAbilityCharges: { sword: 0, conquest: 0 },
        specialAbilityCooldowns: { sword: 0 },
        conquestAuraTier: 0,
        susanoActive: false,
        susanoLifeStealCooldown: 0,
        susanoConfusionCooldown: 0
    };
}

function getFloorCreatureSpawnGroups(enemyCount) {
    if (enemyCount <= 0) {
        return [];
    }

    const availableCreatures = creatureData.filter((creature) => (
        !isBossCreatureType(creature.creatureType)
        && creature.creatureType !== 'matriarch'
        && isCreatureSpawnAllowed(creature, currentFloor)
    ));
    const replaceParentByRule = {
        'replace-goblin': 'goblin',
        'replace-gallery-spider': 'spider'
    };
    const variantByParent = new Map(
        availableCreatures
            .filter((creature) => replaceParentByRule[creature.spawn.rule])
            .map((creature) => [replaceParentByRule[creature.spawn.rule], creature])
    );
    const candidates = [];
    for (const creature of availableCreatures) {
        if (replaceParentByRule[creature.spawn.rule]) {
            continue;
        }

        const variant = variantByParent.get(creature.creatureType);
        const variantChance = variant
            ? Math.max(0, Math.min(1, variant.spawn.probability))
            : 0;
        const ruleProbability = [
            'castle-service-areas',
            'chapels-and-galleries'
        ].includes(creature.spawn.rule)
            ? Math.max(0, Math.min(1, creature.spawn.probability))
            : 1;
        const baseWeight = creature.spawn.weight * ruleProbability * (1 - variantChance);
        if (baseWeight > 0) {
            candidates.push({ creature, weight: baseWeight });
        }
        if (variant && variantChance > 0) {
            candidates.push({
                creature: variant,
                weight: creature.spawn.weight * ruleProbability * variantChance
            });
        }
    }
    if (candidates.length === 0) {
        throw new Error(`Nenhuma criatura pode formar grupos no andar ${currentFloor}.`);
    }

    const groups = [];
    let remaining = enemyCount;
    while (remaining > 0) {
        const totalWeight = candidates.reduce((sum, candidate) => sum + candidate.weight, 0);
        let roll = Math.random() * totalWeight;
        let selected = candidates[candidates.length - 1].creature;
        for (const candidate of candidates) {
            roll -= candidate.weight;
            if (roll < 0) {
                selected = candidate.creature;
                break;
            }
        }

        const [minimum, maximum] = selected.spawn.group;
        if (!Number.isInteger(minimum) || !Number.isInteger(maximum)
            || minimum < 1 || maximum < minimum) {
            throw new Error(`Tamanho de grupo inválido para ${selected.name}.`);
        }
        const groupSize = Math.min(
            remaining,
            minimum + Math.floor(Math.random() * (maximum - minimum + 1))
        );
        groups.push({ creatureType: selected.creatureType, size: groupSize });
        remaining -= groupSize;
    }
    return groups;
}

function clusterFloorSpawnGroups(groups, tiles) {
    const remainingTiles = [...tiles];
    const spawns = [];
    for (const group of groups) {
        if (group.size > remainingTiles.length) {
            throw new Error('O plano de grupos excede as posições de surgimento disponíveis.');
        }
        const anchorIndex = Math.floor(Math.random() * remainingTiles.length);
        const anchor = remainingTiles.splice(anchorIndex, 1)[0];
        const nearbyTiles = remainingTiles
            .map((tile, index) => ({
                tile,
                index,
                distance: Math.abs(tile.x - anchor.x) + Math.abs(tile.y - anchor.y)
            }))
            .sort((first, second) => first.distance - second.distance)
            .slice(0, group.size - 1)
            .sort((first, second) => first.index - second.index)
            .map(({ tile }) => tile);
        const groupTiles = [anchor, ...nearbyTiles];
        const groupTileKeys = new Set(groupTiles.map((tile) => `${tile.x},${tile.y}`));
        for (let index = remainingTiles.length - 1; index >= 0; index -= 1) {
            if (groupTileKeys.has(`${remainingTiles[index].x},${remainingTiles[index].y}`)) {
                remainingTiles.splice(index, 1);
            }
        }
        for (const tile of groupTiles) {
            spawns.push({ tile, creatureType: group.creatureType });
        }
    }
    return spawns.concat(remainingTiles.map((tile) => ({ tile, creatureType: null })));
}

function createEnemy(x, y, dropOre, creatureOverride = null) {
    if (!creatureOverride && enemyCreatureBatch.length === 0) {
        enemyCreatureBatch = creatureData
            .filter((creature) => (
                !isBossCreatureType(creature.creatureType)
                && !['goblinRunner', 'sootSpider', 'matriarch'].includes(creature.creatureType)
                && isCreatureSpawnAllowed(creature, currentFloor)
            ))
            .flatMap((creature) => (
                Array.from({ length: creature.spawn.weight }, () => creature.creatureType)
            ));
        if (enemyCreatureBatch.length === 0) {
            throw new Error(`Nenhuma criatura comum pode surgir no andar ${currentFloor}.`);
        }
        for (let index = enemyCreatureBatch.length - 1; index > 0; index--) {
            const swapIndex = Math.floor(Math.random() * (index + 1));
            [enemyCreatureBatch[index], enemyCreatureBatch[swapIndex]] = [
                enemyCreatureBatch[swapIndex],
                enemyCreatureBatch[index]
            ];
        }
    }
    const rolledCreatureType = creatureOverride ? null : enemyCreatureBatch.pop();
    const creatureType = creatureOverride
        ? creatureOverride
        : rolledCreatureType === 'spider' && currentFloor >= 5 && currentFloor < 10
            && Math.random() < creatureDataByType.sootSpider.spawn.probability
            ? 'sootSpider'
            : rolledCreatureType === 'goblin'
                && Math.random() < creatureDataByType.goblinRunner.spawn.probability
                ? 'goblinRunner'
                : rolledCreatureType;
    const creature = creatureDataByType[creatureType];
    if (!creature) {
        throw new Error(`Dados ausentes para a criatura ${creatureType}.`);
    }
    const archetype = creatureType === 'goblinRunner' ? 'runner' : 'goblin';
    const creatureTierProgress = Math.max(0, Math.min(1, (currentFloor - 9) / 10));
    const maxHealth = getCreatureScaledStat(creatureType, 'health', currentFloor);
    if (enemyEquipmentBatch.length === 0) {
        enemyEquipmentBatch = ['armor', 'armor', 'shield', 'shield', 'both', null, null, null, null, null];
        for (let index = enemyEquipmentBatch.length - 1; index > 0; index--) {
            const swapIndex = Math.floor(Math.random() * (index + 1));
            [enemyEquipmentBatch[index], enemyEquipmentBatch[swapIndex]] = [
                enemyEquipmentBatch[swapIndex],
                enemyEquipmentBatch[index]
            ];
        }
    }
    const equipment = enemyEquipmentBatch.pop() || null;
    const collisionWidth = creatureType === 'spider' || creatureType === 'sootSpider'
        ? 12
        : creatureType === 'veinBat' ? 12
        : creatureType === 'basaltLizard' ? 19
        : creatureType === 'facelessScribe' ? 14
        : creatureType === 'matriarch' ? 22
        : creatureType === 'goblin' || creatureType === 'goblinRunner' ? 16
            : creatureType === 'ashHound' ? 19
                : creatureType === 'stainedSentinel' ? 20
                    : creatureType === 'troll' ? 20 : 23;
    const collisionHeight = creatureType === 'spider' || creatureType === 'sootSpider'
        ? 10
        : creatureType === 'veinBat' ? 10
        : creatureType === 'basaltLizard' ? 14
        : creatureType === 'facelessScribe' ? 20
        : creatureType === 'matriarch' ? 18
        : creatureType === 'goblin' || creatureType === 'goblinRunner' ? 14
            : creatureType === 'ashHound' ? 14
                : creatureType === 'stainedSentinel' ? 22
                    : creatureType === 'troll' ? 18 : 20;

    return {
        x: x * tileSize + 3,
        y: y * tileSize + 3,
        size: creatureType === 'spider' || creatureType === 'sootSpider' || creatureType === 'veinBat' ? 8
            : creatureType === 'basaltLizard' ? 12
            : creatureType === 'facelessScribe' ? 11
            : creatureType === 'matriarch' ? 14
                : creatureType === 'goblin' || creatureType === 'goblinRunner' ? 10
                    : creatureType === 'ashHound' ? 13
                        : creatureType === 'stainedSentinel' ? 15
                            : creatureType === 'troll' ? 12 : 14,
        collisionWidth: currentFloor >= 10 ? Math.min(collisionWidth, tileSize - 4) : collisionWidth,
        collisionHeight: currentFloor >= 10 ? Math.min(collisionHeight, tileSize - 4) : collisionHeight,
        level: currentFloor, // The floor is the existing enemy progression proxy.
        creatureType,
        heightBlocks: creature.heightBlocks,
        behaviorProfile: bestiaryEntries.find((entry) => entry.creatureType === creatureType)?.behaviorProfile
            || creatureType,
        defense: creature.stats.defense,
        resistances: creature.resistances,
        meleeRange: creature.stats.range,
        attackProfiles: creature.attacks,
        isMiniBoss: creatureType === 'matriarch',
        specialAttackProgress: creatureTierProgress,
        isFemale: !['spider', 'sootSpider', 'matriarch', 'ashHound', 'stainedSentinel',
            'veinBat', 'basaltLizard', 'facelessScribe'].includes(creatureType)
            && Math.random() < 0.35,
        health: maxHealth,
        maxHealth,
        displayHealth: maxHealth,
        damage: getCreatureScaledStat(creatureType, 'damage', currentFloor),
        equipment: ['stainedSentinel', 'goblinRunner', 'spider', 'sootSpider', 'matriarch', 'ashHound',
            'veinBat', 'basaltLizard', 'facelessScribe']
            .includes(creatureType) ? null : equipment,
        armorDurability: ['stainedSentinel', 'goblinRunner', 'spider', 'sootSpider', 'matriarch', 'ashHound',
            'veinBat', 'basaltLizard', 'facelessScribe']
            .includes(creatureType)
            ? 0 : equipment === 'armor' || equipment === 'both' ? 4 : 0,
        shieldDurability: ['stainedSentinel', 'goblinRunner', 'spider', 'sootSpider', 'matriarch', 'ashHound',
            'veinBat', 'basaltLizard', 'facelessScribe']
            .includes(creatureType)
            ? 0 : equipment === 'shield' || equipment === 'both' ? 3 : 0,
        shieldRaised: false,
        defendTimer: 0,
        shieldTurnTimer: 0,
        shieldBrokenTimer: 0,
        dropOre,
        hitFlash: 0,
        painTimer: 0,
        dodgeTimer: 0,
        dodgeCooldown: 0,
        jumpTimer: 0,
        potionAction: null,
        potionActionTimer: 0,
        potionActionDuration: 0,
        potionHealAmount: 0,
        webbedTimer: 0,
        deathTimer: 0,
        deathAnimationDuration: 0,
        alertedTarget: null,
        alertTimer: 0,
        combatAlertTimer: 0,
        fleeHideTarget: null,
        fleeHideTimer: 0,
        fleeHideCooldown: 0,
        hasPoisonedPlayer: false,
        archetype,
        speed: getCreatureScaledStat(creatureType, 'speed', currentFloor),
        dirX: 1,
        dirY: 0,
        facingX: 1,
        facingY: 0,
        spriteFacingX: 1,
        moving: false,
        animTime: 0,
        attackTimer: 0,
        attackCooldown: 0,
        attackWarningTimer: 0,
        attackReady: false,
        spiderLeapTimer: 0,
        spiderLeapCooldown: 0,
        spiderLeapX: 0,
        spiderLeapY: 0,
        spiderWebCooldown: creatureType === 'spider'
            ? getCreatureAttackData({ creatureType }, 'capture-thread').cooldown
            : creatureType === 'sootSpider'
                ? getCreatureAttackData({ creatureType }, 'soot-thread').cooldown
                : creatureType === 'matriarch'
                    ? getCreatureAttackData({ creatureType }, 'web-capture').cooldown
                    : 0,
        spiderWebTimer: 0,
        spiderWebTarget: null,
        nestHomeX: creatureType === 'matriarch' ? x * tileSize + 10 : null,
        nestHomeY: creatureType === 'matriarch' ? y * tileSize + 10 : null,
        runnerLungeWarning: 0,
        echoWaveWarning: 0,
        echoWaveCooldown: creatureType === 'veinBat' ? 1.5 : 0,
        echoWaveDirectionX: 1,
        echoWaveDirectionY: 0,
        tailSweepWarning: 0,
        tailSweepCooldown: creatureType === 'basaltLizard' ? 1.2 : 0,
        glyphWarning: 0,
        glyphCooldown: creatureType === 'facelessScribe' ? 1.8 : 0,
        glyphTargetX: 0,
        glyphTargetY: 0,
        runnerLungeCooldown: creatureType === 'goblinRunner'
            ? getCreatureAttackData({ creatureType }, 'passing-thrust').cooldown : 0,
        runnerLungeX: 0,
        runnerLungeY: 0,
        runnerRetreatTimer: 0,
        dogPounceWarning: 0,
        dogPounceX: 0,
        dogPounceY: 0,
        shoulderBashWarning: 0,
        shoulderBashCooldown: creatureType === 'ogre'
            ? getCreatureAttackData({ creatureType }, 'shoulder-bash').cooldown : 0,
        dogPounceCooldown: creatureType === 'ashHound'
            ? getCreatureAttackData({ creatureType }, 'flank-bite').cooldown : 0,
        toxicBiteWarning: 0,
        toxicBiteCooldown: creatureType === 'troll'
            ? getCreatureAttackData({ creatureType }, 'toxic-bite').cooldown : 0,
        sentinelBeamWarning: 0,
        sentinelBeamCooldown: creatureType === 'stainedSentinel'
            ? getCreatureAttackData({ creatureType }, 'light-lance').cooldown : 0,
        sentinelBeamDirectionX: 1,
        sentinelBeamDirectionY: 0,
        matriarchBroodReleased: false,
        susanoFearTimer: 0,
        susanoDamageTimer: 1,
        susanoConfusionTimer: 0,
        slamWarning: 0,
        slamImpactTimer: 0,
        timer: 0
    };
}

function createBoss(x, y, bossType) {
    const creature = creatureDataByType[bossType];
    if (!creature || !isBossCreatureType(bossType)) {
        throw new Error(`Dados de chefe ausentes para ${bossType}.`);
    }
    enemyEquipmentBatch.push(false);
    const boss = createEnemy(x, y, chooseOreDrop(), bossType);
    const bossPower = bossPowerMultiplier * (
        currentFloor === finalFloor ? GAME_BALANCE.bosses.finalPowerMultiplier : 1
    );
    boss.size = 36;
    boss.collisionWidth = bossType === 'dragon' ? 46 : bossType === 'grimReaper' ? 34 : 38;
    boss.collisionHeight = bossType === 'dragon' ? 34 : 32;
    const bossFloorProgress = Math.max(0, currentFloor - 5);
    const bossDamagePower = currentFloor === 5 && bossType === 'dragon'
        ? 1
        : bossPower;
    boss.health = Math.round(
        creature.stats.health
        * (1 + bossFloorProgress * GAME_BALANCE.bosses.healthScalingPerFloor)
        * bossPower
    );
    boss.maxHealth = boss.health;
    boss.displayHealth = boss.health;
    boss.speed = Math.round(creature.stats.speed * bossPower);
    boss.powerMultiplier = bossPower;
    const creatureDamageMultiplier = bossType === 'grimReaper'
        ? GAME_BALANCE.bosses.reaperDamageMultiplier
        : 1;
    boss.damageMultiplier = (
        1 + bossFloorProgress * GAME_BALANCE.bosses.damageScalingPerFloor
    ) * bossDamagePower * creatureDamageMultiplier;
    boss.damage = Math.round(creature.stats.damage * boss.damageMultiplier);
    boss.defense = creature.stats.defense;
    boss.resistances = creature.resistances;
    boss.attackProfiles = creature.attacks;
    boss.phaseTwo = false;
    boss.phaseThree = false;
    boss.finalBoss = currentFloor === finalFloor;
    boss.isBoss = true;
    boss.isFemale = Math.random() < 0.5;
    boss.bossType = bossType;
    boss.behaviorProfile = bestiaryEntries.find((entry) => entry.creatureType === bossType)?.behaviorProfile
        || bossType;
    boss.spriteAnimTime = 0;
    boss.fireballs = [];
    boss.fireballCooldown = 0.7;
    boss.fireballWarning = 0;
    boss.fireballTarget = null;
    boss.wingSweepCooldown = 0.6;
    boss.wingSweepWarning = 0;
    boss.wingSweepExecution = 0;
    boss.wingSweepDirectionX = 1;
    boss.wingSweepDirectionY = 0;
    boss.bossAttackCount = 0;
    boss.weaknessTimer = 0;
    boss.repositionTimer = 0;
    boss.flankSign = Math.random() < 0.5 ? -1 : 1;
    boss.lavaCooldown = 1.4;
    boss.rockCooldown = 2.6;
    boss.lavaPools = [];
    boss.thrownRocks = [];
    boss.eruptionCooldown = 2;
    boss.eruptions = [];
    boss.scytheCooldown = 1.5;
    boss.scytheAttack = null;
    boss.shadowStepCooldown = 2.5;
    boss.shadowStepWarning = 0;
    boss.shadowStepTarget = null;
    boss.veinPulseCooldown = 2.5;
    boss.veinPulseWarning = 0;
    boss.veinPulseImpact = 0;
    return boss;
}

function findOpenTiles() {
    const tiles = [];

    for (let row = 1; row < rows - 1; row++) {
        for (let col = 1; col < cols - 1; col++) {
            const cell = map[row][col];
            const centerX = (col + 0.5) * tileSize;
            const centerY = (row + 0.5) * tileSize;
            const isBlockedByDecoration = ambientDecorationBlocksBounds(
                centerX - playerCollisionWidth / 2,
                centerY - playerCollisionHeight / 2,
                playerCollisionWidth,
                playerCollisionHeight
            );
            const hasBarrel = barrels.some((barrel) => (
                barrel.health > 0 && barrel.x === col && barrel.y === row
            ));
            const hasChest = chests.some((chest) => (
                chest.health > 0 && chest.x === col && chest.y === row
            ));
            if (
                cell !== '#' && cell !== 'S'
                && !(col === exitPosition.x && row === exitPosition.y)
                && !isBlockedByDecoration
                && !hasBarrel
                && !hasChest
            ) {
                tiles.push({ x: col, y: row });
            }
        }
    }

    return tiles;
}

function getReachableFloorTileKeys(start = startPosition, sourceMap = map) {
    const isWalkable = (x, y) => {
        const tile = sourceMap[y]?.[x];
        if (tile !== '.' && !(x === start?.x && y === start?.y && tile === 'S')) {
            return false;
        }
        const centerX = (x + 0.5) * tileSize;
        const centerY = (y + 0.5) * tileSize;
        return !ambientDecorationBlocksBounds(
            centerX - playerCollisionWidth / 2,
            centerY - playerCollisionHeight / 2,
            playerCollisionWidth,
            playerCollisionHeight
        );
    };
    if (!start || !isWalkable(start.x, start.y)) {
        return new Set();
    }
    const reachable = new Set([`${start.x},${start.y}`]);
    const queue = [start];
    for (let index = 0; index < queue.length; index += 1) {
        const tile = queue[index];
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const x = tile.x + dx;
            const y = tile.y + dy;
            const key = `${x},${y}`;
            if (isWalkable(x, y) && !reachable.has(key)) {
                reachable.add(key);
                queue.push({ x, y });
            }
        }
    }
    return reachable;
}

function createSecretMatriarchChamber() {
    const anchor = activeFloorEncounterPosition;
    if (!anchor) {
        throw new Error('O encontro do vitral não reservou uma posição para a câmara secreta.');
    }
    const reservedRoom = castleLayout?.rooms.find((room) => room.safeForSecret);
    if (!reservedRoom) {
        throw new Error('O andar 16 não reservou uma sala segura para a câmara secreta.');
    }
    const anchorTileX = Math.floor(anchor.x / tileSize);
    const anchorTileY = Math.floor(anchor.y / tileSize);
    const candidates = [];
    const minCenterY = Math.max(3, reservedRoom.y + 4);
    const maxCenterY = Math.min(rows - 4, reservedRoom.y + reservedRoom.height - 4);
    const minCenterX = Math.max(3, reservedRoom.x + 3);
    const maxCenterX = Math.min(cols - 4, reservedRoom.x + reservedRoom.width - 4);
    for (let centerY = minCenterY; centerY <= maxCenterY; centerY += 1) {
        for (let centerX = minCenterX; centerX <= maxCenterX; centerX += 1) {
            const roomTiles = [];
            let valid = true;
            for (let offsetY = -2; offsetY <= 2 && valid; offsetY += 1) {
                for (let offsetX = -2; offsetX <= 2; offsetX += 1) {
                    const x = centerX + offsetX;
                    const y = centerY + offsetY;
                    const perimeter = Math.abs(offsetX) === 2 || Math.abs(offsetY) === 2;
                    if (map[y][x] !== '.') {
                        valid = false;
                        break;
                    }
                    if (!perimeter) roomTiles.push({ x, y });
                    if (
                        (x === startPosition.x && y === startPosition.y)
                        || (x === exitPosition.x && y === exitPosition.y)
                        || enemies.some((enemy) => (
                            Math.floor((enemy.x + enemy.size / 2) / tileSize) === x
                            && Math.floor((enemy.y + enemy.size / 2) / tileSize) === y
                        ))
                        || barrels.some((barrel) => barrel.health > 0 && barrel.x === x && barrel.y === y)
                        || chests.some((chest) => chest.health > 0 && chest.x === x && chest.y === y)
                    ) {
                        valid = false;
                        break;
                    }
                }
            }
            if (!valid || roomTiles.length !== 9) continue;
            const chamberBounds = {
                left: (centerX - 2) * tileSize,
                top: (centerY - 2) * tileSize,
                right: (centerX + 3) * tileSize,
                bottom: (centerY + 3) * tileSize
            };
            const overlappingDecorations = ambientDecorations.filter((decoration) => {
                const bounds = getAmbientDecorationFootprintBounds(decoration);
                return bounds.left < chamberBounds.right
                    && bounds.right > chamberBounds.left
                    && bounds.top < chamberBounds.bottom
                    && bounds.bottom > chamberBounds.top;
            });
            const entrances = [
                { entrance: { x: centerX, y: centerY - 2 }, approach: { x: centerX, y: centerY - 3 } },
                { entrance: { x: centerX + 2, y: centerY }, approach: { x: centerX + 3, y: centerY } },
                { entrance: { x: centerX, y: centerY + 2 }, approach: { x: centerX, y: centerY + 3 } },
                { entrance: { x: centerX - 2, y: centerY }, approach: { x: centerX - 3, y: centerY } }
            ];
            for (const { entrance, approach } of entrances) {
                if (map[approach.y]?.[approach.x] !== '.') continue;
                for (let offsetY = -2; offsetY <= 2; offsetY += 1) {
                    for (let offsetX = -2; offsetX <= 2; offsetX += 1) {
                        if (Math.abs(offsetX) === 2 || Math.abs(offsetY) === 2) {
                            map[centerY + offsetY][centerX + offsetX] = '#';
                        }
                    }
                }
                const reachable = new Set([`${startPosition.x},${startPosition.y}`]);
                const queue = [startPosition];
                for (let index = 0; index < queue.length; index += 1) {
                    const tile = queue[index];
                    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                        const x = tile.x + dx;
                        const y = tile.y + dy;
                        const key = `${x},${y}`;
                        if (map[y]?.[x] !== '#' && !reachable.has(key)) {
                            reachable.add(key);
                            queue.push({ x, y });
                        }
                    }
                }
                const preservesRoute = reachable.has(`${approach.x},${approach.y}`)
                    && reachable.has(`${exitPosition.x},${exitPosition.y}`)
                    && enemies.every((enemy) => reachable.has(
                        `${Math.floor((enemy.x + enemy.size / 2) / tileSize)},${Math.floor((enemy.y + enemy.size / 2) / tileSize)}`
                    ));
                for (let offsetY = -2; offsetY <= 2; offsetY += 1) {
                    for (let offsetX = -2; offsetX <= 2; offsetX += 1) {
                        map[centerY + offsetY][centerX + offsetX] = '.';
                    }
                }
                if (!preservesRoute) continue;

                candidates.push({
                    centerX,
                    centerY,
                    entrance,
                    overlappingDecorations,
                    distance: Math.hypot(centerX - anchorTileX, centerY - anchorTileY)
                });
            }
        }
    }
    candidates.sort((first, second) => (
        first.overlappingDecorations.length - second.overlappingDecorations.length
        || first.distance - second.distance
    ));
    const chamber = candidates[0];
    if (!chamber) {
        throw new Error('Não foi possível reservar uma câmara secreta sem bloquear a rota do andar 16.');
    }
    for (let offsetY = -2; offsetY <= 2; offsetY += 1) {
        for (let offsetX = -2; offsetX <= 2; offsetX += 1) {
            if (Math.abs(offsetX) === 2 || Math.abs(offsetY) === 2) {
                map[chamber.centerY + offsetY][chamber.centerX + offsetX] = '#';
            }
        }
    }
    if (chamber.overlappingDecorations.length > 0) {
        const displacedDecorations = new Set(chamber.overlappingDecorations);
        ambientDecorations = ambientDecorations.filter(
            (decoration) => !displacedDecorations.has(decoration)
        );
        for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
            for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
                map[chamber.centerY + offsetY][chamber.centerX + offsetX] = '#';
            }
        }
        for (const displaced of chamber.overlappingDecorations) {
            const replacement = getAmbientDecorationCandidates(displaced.type, map)
                .map((decoration) => ({
                    decoration,
                    score: scoreAmbientDecorationCandidate(decoration)
                }))
                .sort((first, second) => (
                    first.score - second.score
                    || first.decoration.y - second.decoration.y
                    || first.decoration.x - second.decoration.x
                    || first.decoration.wallSide - second.decoration.wallSide
                ))[0]?.decoration;
            if (replacement) ambientDecorations.push(replacement);
        }
        for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
            for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
                map[chamber.centerY + offsetY][chamber.centerX + offsetX] = '.';
            }
        }
    }
    const guard = createEnemy(chamber.centerX, chamber.centerY, chooseOreDrop(), 'matriarch');
    guard.secretChamberGuard = true;
    enemies.push(guard);
    return { entrance: chamber.entrance, guard, open: false };
}

function placePlayerAtRandomOpenTile() {
    const reachableTileKeys = getReachableFloorTileKeys();
    const matriarchSecretRoom = secretRooms.find((room) => room.floor === currentFloor)?.definition;
    const isInBounds = (tile, bounds) => (
        bounds
        && tile.x >= bounds.x && tile.x < bounds.x + bounds.width
        && tile.y >= bounds.y && tile.y < bounds.y + bounds.height
    );
    const availableTiles = findOpenTiles()
        .filter((tile) => (
            reachableTileKeys.has(`${tile.x},${tile.y}`)
            && !isInBounds(tile, matriarchArena?.bounds)
            && !isInBounds(tile, matriarchSecretRoom?.bounds)
            && (currentFloor !== matriarchArenaConfig.floor
                || matriarchArena.tunnels.every((tunnel) => (
                    Math.hypot(tile.x - tunnel.spawn.x, tile.y - tunnel.spawn.y) >= 2
                )))
        ))
        .map((tile) => ({
            x: (tile.x + 0.5) * tileSize - player.size / 2,
            y: (tile.y + 0.5) * tileSize - player.size / 2,
            tile
        }))
        .filter((position) => (
            canEntityMoveTo(player, position.x, position.y)
            && enemies.every((enemy) => (
                enemy.health <= 0
                || enemy.dying
                || !collisionBoundsOverlap(
                    { ...player, x: position.x, y: position.y },
                    enemy
                )
            ))
        ));
    const preferredTiles = availableTiles.filter(({ tile }) => (
        Math.abs(tile.x - exitPosition.x) + Math.abs(tile.y - exitPosition.y) >= 3
        && enemies.every((enemy) => (
            enemy.health <= 0
            || enemy.dying
            || Math.hypot(
                (tile.x + 0.5) * tileSize - (enemy.x + enemy.size / 2),
                (tile.y + 0.5) * tileSize - (enemy.y + enemy.size / 2)
            ) >= tileSize * 2
        ))
    ));
    const spawnTiles = preferredTiles.length > 0 ? preferredTiles : availableTiles;
    if (spawnTiles.length === 0) {
        throw new Error('Nao foi possivel encontrar uma posicao livre para o jogador.');
    }

    const spawn = spawnTiles[Math.floor(Math.random() * spawnTiles.length)];
    player.x = spawn.x;
    player.y = spawn.y;
}

function getNearbyFloorNpc() {
    if (!player) return null;
    const playerX = player.x + player.size / 2;
    const playerY = player.y + player.size / 2;
    return floorNpcs.find((npc) => (
        Math.hypot(npc.x + npc.size / 2 - playerX, npc.y + npc.size / 2 - playerY)
            <= (npc.id === 'oren' ? blacksmithConfig.interactionRange : 42)
    )) || null;
}

function placeFloorNpc() {
    floorNpcs = [];
    activeFloorNpcInteraction = null;
    naraChallenge = null;
    const definition = floorNpcSchedule.find((npc) => npc.floors.includes(currentFloor));
    if (!definition) return;
    if (currentFloor === matriarchArenaConfig.floor
        && definition.id === 'lia'
        && matriarchArena) {
        floorNpcs.push({
            ...definition,
            x: (matriarchArena.campNpc.x + 0.5) * tileSize - 7,
            y: (matriarchArena.campNpc.y + 0.5) * tileSize - 12,
            size: 14,
            heightBlocks: 1,
            isFloorNpc: true
        });
        return;
    }

    const enemyDistanceFromTile = (tile) => Math.min(Infinity, ...enemies.map((enemy) => (
        Math.hypot(
            (tile.x + 0.5) * tileSize - (enemy.x + enemy.size / 2),
            (tile.y + 0.5) * tileSize - (enemy.y + enemy.size / 2)
        )
    )));
    const playerX = player.x + player.size / 2;
    const playerY = player.y + player.size / 2;
    const exitX = (exitPosition.x + 0.5) * tileSize;
    const exitY = (exitPosition.y + 0.5) * tileSize;
    const reachableTileKeys = getReachableFloorTileKeys();
    const candidates = findOpenTiles()
        .filter((tile) => (
            reachableTileKeys.has(`${tile.x},${tile.y}`)
            && (currentFloor % 5 !== 0 || !bossArenaBounds || (
                tile.x >= bossArenaBounds.left && tile.x <= bossArenaBounds.right
                && tile.y >= bossArenaBounds.top && tile.y <= bossArenaBounds.bottom
            ))
        ))
        .map((tile) => ({
            tile,
            playerDistance: Math.hypot(
                (tile.x + 0.5) * tileSize - playerX,
                (tile.y + 0.5) * tileSize - playerY
            ),
            exitDistance: Math.hypot(
                (tile.x + 0.5) * tileSize - exitX,
                (tile.y + 0.5) * tileSize - exitY
            ),
            enemyDistance: enemyDistanceFromTile(tile)
        }));
    const spacingRules = [
        (candidate) => candidate.playerDistance >= 96
            && candidate.exitDistance >= 64
            && candidate.enemyDistance >= tileSize * blacksmithConfig.minimumEnemyDistanceTiles,
        (candidate) => candidate.playerDistance >= 48
            && candidate.exitDistance >= 32
            && candidate.enemyDistance >= tileSize * 1.5,
        (candidate) => candidate.playerDistance >= 32
            && candidate.enemyDistance >= tileSize,
        (candidate) => candidate.playerDistance >= 16
            && candidate.enemyDistance >= tileSize / 2
    ];
    let safeCandidates = [];
    for (const meetsSpacingRule of spacingRules) {
        safeCandidates = candidates.filter(meetsSpacingRule);
        if (safeCandidates.length > 0) break;
    }
    safeCandidates.sort((first, second) => (
        second.enemyDistance - first.enemyDistance
        || second.playerDistance - first.playerDistance
        || second.exitDistance - first.exitDistance
        || first.tile.y - second.tile.y
        || first.tile.x - second.tile.x
    ));
    const npcRoom = castleLayout?.npcSlot
        ? dungeonRooms.find((room) => room.name === castleLayout.npcSlot.room)
        : null;
    const preferredCandidates = npcRoom
        ? safeCandidates.filter(({ tile: candidate }) => (
            candidate.x > npcRoom.x && candidate.x < npcRoom.x + npcRoom.width - 1
            && candidate.y > npcRoom.y && candidate.y < npcRoom.y + npcRoom.height - 1
        ))
        : [];
    const tile = (preferredCandidates[0] || safeCandidates[0])?.tile;
    if (!tile) {
        throw new Error(`Não foi possível reservar uma posição segura para ${definition.name}.`);
    }
    floorNpcs.push({
        ...definition,
        x: (tile.x + 0.5) * tileSize - 7,
        y: (tile.y + 0.5) * tileSize - 12,
        size: 14,
        heightBlocks: 1,
        isFloorNpc: true
    });
}

function getPortalDirectionClue(npc) {
    const start = {
        x: Math.floor((npc.x + npc.size / 2) / tileSize),
        y: Math.floor((npc.y + npc.size / 2) / tileSize)
    };
    const queue = [{ ...start, firstStep: null }];
    const visited = new Set([`${start.x},${start.y}`]);
    const directions = [
        { x: 0, y: -1, name: 'norte' },
        { x: 1, y: 0, name: 'leste' },
        { x: 0, y: 1, name: 'sul' },
        { x: -1, y: 0, name: 'oeste' }
    ];
    for (let index = 0; index < queue.length; index += 1) {
        const tile = queue[index];
        if (tile.x === exitPosition.x && tile.y === exitPosition.y) {
            if (!tile.firstStep) {
                return 'esta região';
            }
            return directions.find((direction) => (
                direction.x === tile.firstStep.x && direction.y === tile.firstStep.y
            )).name;
        }
        for (const direction of directions) {
            const x = tile.x + direction.x;
            const y = tile.y + direction.y;
            const key = `${x},${y}`;
            if (
                x < 0 || x >= cols || y < 0 || y >= rows
                || map[y][x] === '#'
                || visited.has(key)
            ) {
                continue;
            }
            visited.add(key);
            queue.push({
                x,
                y,
                firstStep: tile.firstStep || { x: direction.x, y: direction.y }
            });
        }
    }
    throw new Error(`Não foi possível encontrar uma rota de Lia até a saída no andar ${currentFloor}.`);
}

function getDistanceToSecretRoomTile(entity, tile) {
    return Math.hypot(
        entity.x + entity.size / 2 - (tile.x + 0.5) * tileSize,
        entity.y + entity.size / 2 - (tile.y + 0.5) * tileSize
    );
}

function interactWithSecretRoom() {
    const room = secretRooms.find((candidate) => candidate.floor === currentFloor);
    if (!room) return false;
    const definition = room.definition;
    const trigger = definition.trigger;
    if (!room.state.opened && trigger.type === 'interact'
        && getDistanceToSecretRoomTile(player, trigger.position) <= 42) {
        return activateSecretRoomTrigger(room, {
            type: 'interact',
            targetId: trigger.targetId
        });
    }
    if (!room.state.opened && trigger.type === 'deliver-item'
        && getDistanceToSecretRoomTile(player, trigger.position) <= 42) {
        const quantity = collectedMaterials[trigger.itemId] || 0;
        if (quantity < (trigger.quantity || 1)) {
            info.textContent = `A passagem exige ${trigger.quantity || 1} ${trigger.itemId}.`;
            return true;
        }
        collectedMaterials[trigger.itemId] -= trigger.quantity || 1;
        updateMaterialInventoryHud();
        return activateSecretRoomTrigger(room, {
            type: 'deliver-item',
            itemId: trigger.itemId
        });
    }
    if (!room.state.opened && trigger.type === 'destroy-object'
        && getDistanceToSecretRoomTile(player, trigger.position) <= 42) {
        info.textContent = 'O casulo está preso à parede coberta de teia. Acerte-o para abrir a passagem.';
        return true;
    }
    if (room.state.opened && getDistanceToSecretRoomTile(player, definition.chest) <= 34) {
        if (room.state.rewardCollected) {
            info.textContent = 'O baú do ninho antigo já foi saqueado.';
            return true;
        }
        for (const [materialId, quantity] of Object.entries(definition.reward.materials)) {
            collectedMaterials[materialId] = (collectedMaterials[materialId] || 0) + quantity;
        }
        room.state.rewardCollected = true;
        persistSecretRoomProgress(room);
        updateMaterialInventoryHud();
        info.textContent = 'Baú do ninho antigo: 1 Pérola de quitina rara e 3 Sedas grossas para a forja de Oren.';
        return true;
    }
    if (room.state.opened && getDistanceToSecretRoomTile(player, definition.diary) <= 34) {
        room.state.diaryRead = true;
        persistSecretRoomProgress(room);
        info.textContent = definition.lore;
        return true;
    }
    return false;
}

function advanceSecretRoomSequence(key) {
    if (gameState !== 'playing') return;
    for (const room of secretRooms) {
        const trigger = room.definition.trigger;
        if (room.state.opened || trigger.type !== 'sequence'
            || getDistanceToSecretRoomTile(player, trigger.position) > 42) {
            continue;
        }
        room.sequenceProgress = room.sequenceProgress || 0;
        const expected = trigger.keys[room.sequenceProgress];
        room.sequenceProgress = key === expected
            ? room.sequenceProgress + 1
            : key === trigger.keys[0] ? 1 : 0;
        if (room.sequenceProgress === trigger.keys.length) {
            room.sequenceProgress = 0;
            activateSecretRoomTrigger(room, {
                type: 'sequence',
                sequenceId: trigger.sequenceId
            });
        }
    }
}

function interactWithFloorNpc() {
    if (interactWithSecretRoom()) return;
    const npc = getNearbyFloorNpc();
    if (!npc) {
        activeFloorNpcInteraction = null;
        info.textContent = 'Aproxime-se de um personagem para conversar.';
        return;
    }
    if (npc.id === 'nara') {
        activeFloorNpcInteraction = 'nara';
        if (naraChallenge?.floor === currentFloor) {
            info.textContent = naraChallenge.complete
                ? 'Nara: desafio concluído; sua recompensa já foi entregue.'
                : `Nara: esquive de ataques anunciados com a arrancada (Shift + direção): ${naraChallenge.dodges}/3.`;
            return;
        }
        naraChallenge = { floor: currentFloor, dodges: 0, complete: false, countedEnemies: new Set() };
        info.textContent = 'Nara: esquive de três ataques anunciados usando a arrancada (Shift + direção).';
        return;
    }
    activeFloorNpcInteraction = npc.id;
    if (npc.id === 'oren') {
        openBlacksmithMenu(npc);
        return;
    }
    if (usedFloorNpcServices.has(`${npc.id}-${currentFloor}`)) {
        info.textContent = `${npc.name}: já ajudei você neste andar.`;
    } else if (npc.id === 'lia') {
        info.textContent = 'Lia: pressione 1 para entregar um Mapa rabiscado ou 2 para pagar 4 moedas de cobre por uma pista.';
    } else {
        info.textContent = 'Oren: pressione 1 para recuperar 25 de vida ou 2 para ganhar +1 de defesa até o próximo andar. Cada serviço custa 1 sucata e 4 moedas de cobre.';
    }
}

function chooseFloorNpcOption(option) {
    const npc = floorNpcs.find((candidate) => candidate.id === activeFloorNpcInteraction);
    if (!npc) return false;
    if (getNearbyFloorNpc() !== npc) {
        activeFloorNpcInteraction = null;
        info.textContent = 'Aproxime-se novamente do personagem para continuar a conversa.';
        return true;
    }
    const serviceKey = `${npc.id}-${currentFloor}`;
    if (usedFloorNpcServices.has(serviceKey)) {
        info.textContent = `${npc.name}: já ajudei você neste andar.`;
        activeFloorNpcInteraction = null;
        return true;
    }
    if (npc.id === 'lia') {
        if (option === 1) {
            if ((collectedMaterials['scribbled-map'] || 0) < 1) {
                info.textContent = 'Lia: você não tem um Mapa rabiscado. Pressione 2 para pagar 4 moedas de cobre.';
                return true;
            }
            collectedMaterials['scribbled-map'] -= 1;
            updateMaterialInventoryHud();
        } else if (option === 2) {
            if (oreCoinBalance.copper < 4) {
                info.textContent = 'Lia: você precisa de 4 moedas de cobre para comprar a pista.';
                return true;
            }
            oreCoinBalance.copper -= 4;
            updateOreCoinHud();
        } else {
            return false;
        }
        usedFloorNpcServices.add(serviceKey);
        info.textContent = currentFloor === matriarchArenaConfig.floor
            ? 'Lia: mineiros falavam de uma teia densa demais para ser natural e de uma coroa rachada. Escute o som da parede, mas não confie no mapa.'
            : `Lia: procure a saída mais a ${getPortalDirectionClue(npc)} daqui; a pista não revela a sala exata.`;
        activeFloorNpcInteraction = null;
        return true;
    }
    if (npc.id === 'oren') {
        if (option !== 1 && option !== 2) return false;
        if (collectedMaterials.scrap < 1 || oreCoinBalance.copper < 4) {
            info.textContent = 'Oren: preciso de 1 sucata e 4 moedas de cobre para qualquer serviço.';
            return true;
        }
        if (option === 1 && player.health >= player.maxHealth) {
            info.textContent = 'Oren: sua vida já está completa; não vou cobrar por uma cura desnecessária.';
            return true;
        }
        collectedMaterials.scrap -= 1;
        oreCoinBalance.copper -= 4;
        updateMaterialInventoryHud();
        updateOreCoinHud();
        if (option === 1) {
            player.health = Math.min(player.maxHealth, player.health + 25);
            updateHealthHud();
            info.textContent = 'Oren recuperou até 25 pontos de vida.';
        } else {
            player.defense += 1;
            info.textContent = 'Oren reforçou sua defesa em 1 ponto até o próximo andar.';
        }
        usedFloorNpcServices.add(serviceKey);
        activeFloorNpcInteraction = null;
        return true;
    }
    return false;
}

function beginNaraDodge() {
    if (!naraChallenge || naraChallenge.floor !== currentFloor || naraChallenge.complete) return;
    const telegraphFields = [
        'attackWarningTimer', 'toxicBiteWarning', 'shoulderBashWarning',
        'runnerLungeWarning', 'slamWarning', 'dogPounceWarning',
        'sentinelBeamWarning', 'echoWaveWarning', 'tailSweepWarning',
        'glyphWarning', 'veinPulseWarning', 'wingSweepWarning'
    ];
    const playerX = player.x + player.size / 2;
    const playerY = player.y + player.size / 2;
    const telegraphedEnemy = enemies.find((enemy) => (
        enemy.health > 0
        && !enemy.dying
        && !naraChallenge.countedEnemies.has(enemy)
        && telegraphFields.some((field) => enemy[field] > 0)
        && Math.hypot(enemy.x + enemy.size / 2 - playerX, enemy.y + enemy.size / 2 - playerY) <= 100
    ));
    if (!telegraphedEnemy) return;
    naraChallenge.pendingDodge = {
        enemy: telegraphedEnemy,
        playerHealth: player.health
    };
}

function recordNaraDodge() {
    const pending = naraChallenge?.pendingDodge;
    if (!pending || naraChallenge.floor !== currentFloor || naraChallenge.complete) return;
    naraChallenge.pendingDodge = null;
    const enemy = pending.enemy;
    if (player.health < pending.playerHealth || enemy.health <= 0 || enemy.dying) return;
    const playerX = player.x + player.size / 2;
    const playerY = player.y + player.size / 2;
    const enemyX = enemy.x + enemy.size / 2;
    const enemyY = enemy.y + enemy.size / 2;
    const offsetX = playerX - enemyX;
    const offsetY = playerY - enemyY;
    const distance = Math.hypot(offsetX, offsetY);
    let escaped = false;
    if (enemy.creatureType === 'facelessScribe') {
        escaped = Math.hypot(playerX - enemy.glyphTargetX, playerY - enemy.glyphTargetY)
            > getCreatureAttackData(enemy, 'ground-glyph').radius + player.size / 2;
    } else if (enemy.creatureType === 'veinBat') {
        const along = offsetX * enemy.echoWaveDirectionX + offsetY * enemy.echoWaveDirectionY;
        const across = Math.abs(
            offsetX * enemy.echoWaveDirectionY - offsetY * enemy.echoWaveDirectionX
        );
        const attack = getCreatureAttackData(enemy, 'echo-wave');
        escaped = along <= 0 || along > attack.range || across > attack.radius + player.size / 2;
    } else if (enemy.creatureType === 'basaltLizard') {
        escaped = distance > getCreatureAttackData(enemy, 'tail-sweep').range + player.size / 2;
    } else {
        escaped = distance > getCollisionRadius(enemy) + getCollisionRadius(player) + 10;
    }
    if (!escaped || naraChallenge.countedEnemies.has(enemy)) return;
    naraChallenge.countedEnemies.add(enemy);
    naraChallenge.dodges += 1;
    if (naraChallenge.dodges >= 3) {
        naraChallenge.complete = true;
        oreCoinBalance.copper += 5;
        updateOreCoinHud();
        info.textContent = 'Desafio de Nara concluído! Você recebeu 5 moedas de cobre.';
        activeFloorNpcInteraction = null;
    } else if (activeFloorNpcInteraction === 'nara') {
        info.textContent = `Nara: boa esquiva! ${naraChallenge.dodges}/3 ataques anunciados evitados.`;
    }
}

function resetGame(keepProgress = false, resetFloorAbilities = false) {
    if (!keepProgress) {
        clearFloorMapPrefetch();
        gameSeed = (Math.floor(Math.random() * 0x100000000) ^ Date.now()) >>> 0;
        if (gameSeed === 0) gameSeed = 1;
    }
    const carriedHealth = keepProgress && player ? player.health : null;
    const carriedSusano = keepProgress && player ? player.susanoActive : false;
    const resetAbilityProgress = !keepProgress || resetFloorAbilities;
    const carriedSpecialAbilityCharges = keepProgress && !resetFloorAbilities && player
        ? { ...player.specialAbilityCharges }
        : { sword: 0, conquest: 0 };
    const carriedSpecialAbilityCooldowns = keepProgress && !resetFloorAbilities && player
        ? { ...player.specialAbilityCooldowns }
        : { sword: 0 };
    const carriedConquestAuraTier = keepProgress && !resetFloorAbilities && player
        ? player.conquestAuraTier
        : 0;
    map = createMapForCurrentFloor();
    oreDrops = [];
    itemDrops = [];
    floorKillCount = 0;
    floorKillGoal = getFloorKillGoal(currentFloor);
    portalUnlocked = false;
    bossDefeatedThisFloor = false;
    raceWarActive = false;
    activeFloorEncounterId = null;
    activeFloorEncounterPosition = null;
    activeFloorEncounterBounds = null;
    activeFloorEncounterStarted = false;
    clearTimeout(floorEventNotificationTimer);
    floorEventNotification.hidden = true;
    floorEncounterRewardGranted = false;
    secretMatriarchChamber = null;
    waveNumber = 0;
    enemyEquipmentBatch = [];
    enemyCreatureBatch = [];
    shopOpen = false;
    scrollGalleryOpen = false;
    shieldBlocking = false;
    shopPanel.hidden = true;
    scrollGalleryPanel.hidden = true;
    if (!keepProgress) {
        lastBossType = null;
        usedFloorNpcServices.clear();
        selectedSpecialAbility = 'sword';
        playerProgress = {
            level: 1,
            xp: 0,
            xpToNext: 100,
            skillPoints: 0,
            attributes: { health: 0, meleeDamage: 0, aim: 0 }
        };
        healingPotions = [];
        shopPurchaseCounts = Object.fromEntries(Object.keys(shopItems).map((type) => [type, 0]));
        collectedMaterials = {};
        craftedItemQuantities = {};
        updateMaterialInventoryHud();
        for (const scroll of scrollTypes) {
            scrollInventory[scroll.id] = 0;
        }
        updateScrollInventoryHud();
        gearUpgrades = { sword: 0, shield: 0, armor: 0 };
        spearOwned = false;
        bowOwned = false;
        arrowAmmo = 0;
        dashUpgradeOwned = false;
        gearOwned = { shield: false, armor: false };
        gearDurability = { shield: 0, shieldMax: 0, armor: 0, armorMax: 0 };
        for (const ore of oreTypes) {
            oreCoinBalance[ore.id] = 0;
        }
        updateOreCoinHud();
    }
    clearPlayerArrows();
    player = createPlayer();
    if (carriedHealth !== null) {
        player.health = Math.max(0, Math.min(carriedHealth, player.maxHealth));
    }
    player.susanoActive = carriedSusano;
    player.specialAbilityCharges = carriedSpecialAbilityCharges;
    player.specialAbilityCooldowns = carriedSpecialAbilityCooldowns;
    player.conquestAuraTier = carriedConquestAuraTier;
    if (resetAbilityProgress && !keepProgress) {
        selectedSpecialAbility = 'sword';
    }
    updateScrollInventoryHud();
    updateSpecialAbilitiesHud();
    updateSpearHud();

    const bossFloor = currentFloor % 5 === 0;
    const minimumBossSpawnDistance = castleFloorPlans[currentFloor]?.arena ? 3 : 8;
    const reachableTileKeys = getReachableFloorTileKeys();
    const secretRoom = currentFloor === 16
        ? castleLayout?.rooms.find((room) => room.safeForSecret)
        : null;
    const matriarchSecretRoom = secretRooms[0]?.definition;
    const openTiles = findOpenTiles().filter((tile) => {
        const inBossArena = !bossFloor || currentFloor >= 10 || (
            tile.x >= bossArenaBounds.left
            && tile.x <= bossArenaBounds.right
            && tile.y >= bossArenaBounds.top
            && tile.y <= bossArenaBounds.bottom
        );
        const inSecretRoom = secretRoom
            && tile.x > secretRoom.x && tile.x < secretRoom.x + secretRoom.width - 1
            && tile.y > secretRoom.y && tile.y < secretRoom.y + secretRoom.height - 1;
        const inMatriarchArena = matriarchArena
            && tile.x >= matriarchArena.bounds.x
            && tile.x < matriarchArena.bounds.x + matriarchArena.bounds.width
            && tile.y >= matriarchArena.bounds.y
            && tile.y < matriarchArena.bounds.y + matriarchArena.bounds.height;
        const inMatriarchSecretRoom = matriarchSecretRoom
            && tile.x > matriarchSecretRoom.bounds.x
            && tile.x < matriarchSecretRoom.bounds.x + matriarchSecretRoom.bounds.width - 1
            && tile.y > matriarchSecretRoom.bounds.y
            && tile.y < matriarchSecretRoom.bounds.y + matriarchSecretRoom.bounds.height - 1;
        return reachableTileKeys.has(`${tile.x},${tile.y}`)
            && inBossArena
            && !inSecretRoom
            && !inMatriarchArena
            && !inMatriarchSecretRoom;
    });
    const bossTiles = bossFloor
        ? openTiles.filter((tile) => (
            tile.x >= bossArenaBounds.left + 3 && tile.x <= bossArenaBounds.right - 3
            && tile.y >= bossArenaBounds.top + 3 && tile.y <= bossArenaBounds.bottom - 3
            && Math.abs(tile.x - startPosition.x) + Math.abs(tile.y - startPosition.y)
                >= minimumBossSpawnDistance
            && Math.abs(tile.x - exitPosition.x) + Math.abs(tile.y - exitPosition.y) >= 4
            && tile.x >= 1 && tile.x < cols - 1
            && tile.y >= 1 && tile.y < rows - 1
            && Array.from({ length: 3 }, (_, rowOffset) => rowOffset - 1).every((dy) => (
                Array.from({ length: 3 }, (_, colOffset) => colOffset - 1).every((dx) => (
                    map[tile.y + dy] && map[tile.y + dy][tile.x + dx] === '.'
                ))
            ))
        )).sort((first, second) => {
            const firstDistance = Math.abs(first.x - startPosition.x) + Math.abs(first.y - startPosition.y)
                + Math.abs(first.x - exitPosition.x) + Math.abs(first.y - exitPosition.y);
            const secondDistance = Math.abs(second.x - startPosition.x) + Math.abs(second.y - startPosition.y)
                + Math.abs(second.x - exitPosition.x) + Math.abs(second.y - exitPosition.y);
            return secondDistance - firstDistance;
        })
        : [];
    const bossTile = bossTiles[0] || null;
    if (bossFloor && !bossTile) {
        throw new Error('Nao foi possivel reservar uma posicao livre para o chefe.');
    }
    const enemyStarts = [];
    const castleSpawnKeys = new Set((castleLayout?.spawns || [])
        .map((spawn) => `${spawn.x},${spawn.y}`));
    const floorEncounter = bestiaryEvents.find((event) => event.floor === currentFloor);
    const floorEncounterSpawnCount = floorEncounter
        ? Math.max(...floorEncounter.participantIndexes) + 1
        : 0;
    if (floorEncounter) {
        const encounterSpawnCount = floorEncounterSpawnCount;
        const encounterClusters = [];
        for (const anchor of openTiles) {
            const anchorDistance = Math.abs(anchor.x - startPosition.x)
                + Math.abs(anchor.y - startPosition.y);
            const exitDistance = Math.abs(anchor.x - exitPosition.x)
                + Math.abs(anchor.y - exitPosition.y);
            if (anchorDistance < 6 || exitDistance < 4) continue;

            const nearbyTiles = openTiles.filter((tile) => (
                Math.abs(tile.x - anchor.x) <= 2
                && Math.abs(tile.y - anchor.y) <= 2
                && Math.abs(tile.x - startPosition.x) + Math.abs(tile.y - startPosition.y) >= 6
                && Math.abs(tile.x - exitPosition.x) + Math.abs(tile.y - exitPosition.y) >= 4
            ));
            const nearbyKeys = new Set(nearbyTiles.map((tile) => `${tile.x},${tile.y}`));
            const connectedKeys = new Set([`${anchor.x},${anchor.y}`]);
            const queue = [anchor];
            for (let index = 0; index < queue.length; index += 1) {
                const tile = queue[index];
                for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                    const key = `${tile.x + dx},${tile.y + dy}`;
                    if (nearbyKeys.has(key) && !connectedKeys.has(key)) {
                        connectedKeys.add(key);
                        queue.push({ x: tile.x + dx, y: tile.y + dy });
                    }
                }
            }
            if (connectedKeys.size >= encounterSpawnCount) {
                encounterClusters.push({
                    anchor,
                    tiles: nearbyTiles.filter((tile) => connectedKeys.has(`${tile.x},${tile.y}`))
                });
            }
        }
        encounterClusters.sort((first, second) => second.tiles.length - first.tiles.length);
        const bestClusterSize = encounterClusters[0]?.tiles.length || 0;
        const bestClusters = encounterClusters.filter((cluster) => (
            cluster.tiles.length === bestClusterSize
        ));
        const encounterCluster = bestClusters.length > 0
            ? bestClusters[Math.floor(Math.random() * bestClusters.length)]
            : null;
        if (!encounterCluster) {
            throw new Error(`Nao foi possivel reservar uma sala para o encontro ${floorEncounter.title}.`);
        }
        const encounterTiles = encounterCluster.tiles
            .sort((first, second) => (
                Math.abs(first.x - encounterCluster.anchor.x)
                + Math.abs(first.y - encounterCluster.anchor.y)
                - Math.abs(second.x - encounterCluster.anchor.x)
                - Math.abs(second.y - encounterCluster.anchor.y)
            ))
            .slice(0, encounterSpawnCount);
        activeFloorEncounterBounds = {
            left: Math.min(...encounterTiles.map((tile) => tile.x)),
            right: Math.max(...encounterTiles.map((tile) => tile.x)),
            top: Math.min(...encounterTiles.map((tile) => tile.y)),
            bottom: Math.max(...encounterTiles.map((tile) => tile.y))
        };
        const encounterTileKeys = new Set(encounterTiles.map((tile) => `${tile.x},${tile.y}`));
        enemyStarts.push(...encounterTiles);
        for (let index = openTiles.length - 1; index >= 0; index -= 1) {
            if (encounterTileKeys.has(`${openTiles[index].x},${openTiles[index].y}`)) {
                openTiles.splice(index, 1);
            }
        }
    }
    const bossTypes = ['dragon', 'lavaGolem'];
    const bossType = bossFloor
        ? currentFloor === 15
            ? 'grimReaper'
            : currentFloor === finalFloor && Math.random() < 0.5
                ? 'throneGuardian'
            : lastBossType
                ? bossTypes.find((type) => type !== lastBossType)
                : bossTypes[Math.floor(Math.random() * bossTypes.length)]
        : null;

    while (enemyStarts.length < floorKillGoal && openTiles.length > 0) {
        const eligibleTiles = openTiles.filter((tile) => {
            const distanceFromStart = Math.abs(tile.x - startPosition.x)
                + Math.abs(tile.y - startPosition.y);
            return ((bossFloor && currentFloor < 10) || distanceFromStart >= 6)
                && !(tile.x === exitPosition.x && tile.y === exitPosition.y)
                && (!bossTile
                    || Math.abs(tile.x - bossTile.x) + Math.abs(tile.y - bossTile.y) >= 3);
        });
        if (eligibleTiles.length === 0) break;

        if (currentFloor >= 10) {
            const preferredTiles = eligibleTiles.filter((tile) => (
                castleSpawnKeys.has(`${tile.x},${tile.y}`)
            ));
            const existingSpawnTiles = enemyStarts;
            const distanceToExistingSpawns = (tile) => existingSpawnTiles.length === 0
                ? Infinity
                : Math.min(...existingSpawnTiles.map((spawn) => (
                    Math.abs(tile.x - spawn.x) + Math.abs(tile.y - spawn.y)
                )));
            const preferredSpacedTiles = preferredTiles.filter((tile) => (
                distanceToExistingSpawns(tile) >= 4
            ));
            const eligibleSpacedTiles = eligibleTiles.filter((tile) => (
                distanceToExistingSpawns(tile) >= 4
            ));
            const candidates = preferredSpacedTiles.length > 0
                ? preferredSpacedTiles
                : eligibleSpacedTiles.length > 0
                    ? eligibleSpacedTiles
                    : preferredTiles.length > 0
                        ? preferredTiles
                        : eligibleTiles;
            const farthestDistance = Math.max(...candidates.map(distanceToExistingSpawns));
            const farthestTiles = candidates.filter((tile) => (
                distanceToExistingSpawns(tile) === farthestDistance
            ));
            const tile = farthestTiles[Math.floor(Math.random() * farthestTiles.length)];
            openTiles.splice(openTiles.indexOf(tile), 1);
            enemyStarts.push(tile);
            continue;
        }

        const preferredIndices = [];
        for (const spawn of castleLayout?.spawns || []) {
            const index = openTiles.findIndex((tile) => tile.x === spawn.x && tile.y === spawn.y);
            if (index >= 0 && eligibleTiles.includes(openTiles[index])) {
                preferredIndices.push(index);
            }
        }
        const index = preferredIndices.length > 0
            ? preferredIndices[Math.floor(Math.random() * preferredIndices.length)]
            : openTiles.indexOf(
                eligibleTiles[Math.floor(Math.random() * eligibleTiles.length)]
            );
        enemyStarts.push(openTiles.splice(index, 1)[0]);
    }

    const encounterSpawns = enemyStarts
        .slice(0, floorEncounterSpawnCount)
        .map((tile, index) => ({
            tile,
            creatureType: floorEncounter.spawnTypes[index]
        }));
    const genericTiles = enemyStarts.slice(floorEncounterSpawnCount);
    const genericGroups = getFloorCreatureSpawnGroups(genericTiles.length);
    const floorSpawns = [
        ...encounterSpawns,
        ...clusterFloorSpawnGroups(genericGroups, genericTiles)
    ];
    enemyStarts.splice(0, enemyStarts.length, ...floorSpawns.map((spawn) => spawn.tile));
    enemies = floorSpawns.map(({ tile, creatureType }, index) => {
        const enemy = createEnemy(tile.x, tile.y, chooseOreDrop(), creatureType);
        if (floorEncounter?.participantIndexes.includes(index)) {
            enemy.encounterId = floorEncounter.id;
            if (!activeFloorEncounterPosition) {
                activeFloorEncounterPosition = {
                    x: enemy.x + enemy.size / 2,
                    y: enemy.y + enemy.size / 2
                };
            }
        }
        return enemy;
    });
    if (floorEncounter && enemies.some((enemy) => enemy.encounterId === floorEncounter.id)) {
        activeFloorEncounterId = floorEncounter.id;
        activeFloorEncounterStarted = false;
        raceWarActive = false;
    }
    if (currentFloor === 8) {
        if (!matriarchArena) {
            throw new Error('A arena da Matriarca não foi criada no andar 8.');
        }
        enemies.push(createEnemy(
            matriarchArena.bossTile.x,
            matriarchArena.bossTile.y,
            chooseOreDrop(),
            'matriarch'
        ));
    }
    if (bossFloor) {
        enemies.push(createBoss(bossTile.x, bossTile.y, bossType));
        lastBossType = bossType;
    }
    if (currentFloor === 16 && activeFloorEncounterId === 'pointing-stained-glass') {
        secretMatriarchChamber = createSecretMatriarchChamber();
    }
    placePlayerAtRandomOpenTile();
    placeFloorNpc();
    gameState = 'playing';
    const boss = enemies.find((enemy) => enemy.isBoss);
    const castlePlan = castleLayout || castleFloorPlans[currentFloor] || null;
    const bossNames = boss && boss.isFemale
        ? { dragon: 'Dragoa', lavaGolem: 'Golem de lava fêmea', grimReaper: 'Ceifadora', throneGuardian: 'Guardiã do Trono' }
        : { dragon: 'Dragão', lavaGolem: 'Golem de lava', grimReaper: 'Ceifador', throneGuardian: 'Guardião do Trono' };
    floorText.textContent = boss
        ? `Andar ${currentFloor} - Chefe: ${bossNames[boss.bossType]}${castlePlan ? ` · ${castlePlan.title}` : ''}`
        : `Andar ${currentFloor}${castlePlan ? ` · ${castlePlan.title}` : ''}`;
    questText.textContent = boss
        ? `Derrote ${floorKillGoal} ${currentFloor >= 10 ? 'inimigos' : 'goblins e aranhas'} e o chefe (0/${floorKillGoal})`
        : currentFloor <= 5
            ? `Derrote goblins e aranhas (0/${floorKillGoal})`
            : `Derrote inimigos (0/${floorKillGoal})`;
    gameHud.dataset.portal = 'false';
    info.textContent = 'Derrote os inimigos para fazer surgir o portal do andar.';
    updateHealthHud();
    updateProgressHud();
    updateSwordHud();
    updateSpearHud();
    updateBowHud();
    updatePotionHud();
    updateEquipmentHud();
    updateShopHud();
    scheduleFloorMapPrefetch();
}

function updateHealthHud() {
    if (!player) {
        return;
    }

    const healthPercent = Math.max(0, (player.health / player.maxHealth) * 100);
    healthFill.style.width = `${healthPercent}%`;
    healthText.textContent = `${player.health} / ${player.maxHealth}`;
    healthTrack.setAttribute('aria-valuenow', String(player.health));
    healthTrack.setAttribute('aria-valuemax', String(player.maxHealth));
    healthTrack.dataset.low = String(healthPercent <= 50 && healthPercent > 25);
    healthTrack.dataset.critical = String(healthPercent <= 25);
}

function updateSpecialAbilitiesHud() {
    if (!player) {
        return;
    }

    const hasConquestScroll = scrollInventory.conquista > 0;
    const aura = player.conquestAuraTier > 0
        ? conquestAuraTiers[player.conquestAuraTier - 1]
        : null;
    const auraBonusText = aura ? aura.bonus.toLocaleString('pt-BR') : '0';
    for (const ability of ['sword', 'conquest']) {
        const charge = Math.floor(player.specialAbilityCharges[ability]);
        const track = specialAbilityTrackElements[ability];
        const row = track.closest('.special-ability');
        const isSelected = selectedSpecialAbility === ability;
        let detail = ability === 'sword'
            ? `${charge}% · 2× dano · raio 4 quadrados`
            : hasConquestScroll
                ? aura
                    ? `Aura ${aura.name} · +${auraBonusText}% · ${charge}%`
                    : `Sem aura · 0% · ${charge}%`
                : `${charge}% · precisa do pergaminho`;
        let isReady = charge >= 100;
        let isActive = false;

        track.querySelector('.special-ability-fill').style.width = `${charge}%`;
        track.setAttribute('aria-valuenow', String(charge));
        row.dataset.selected = String(isSelected);

        if (ability === 'sword') {
            if (player.specialAbilityCooldowns.sword > 0) {
                detail += ` · recarga ${Math.ceil(player.specialAbilityCooldowns.sword)} s`;
                isReady = false;
            } else if (!swordEquipped) {
                detail += ' · equipe a espada';
                isReady = false;
            } else if (charge >= 100) {
                detail += ' · F para golpear · recarga 3 s';
            }
        } else if (!hasConquestScroll) {
            isReady = false;
        } else if (player.conquestAuraTier === finalConquestAuraTier) {
            detail += ' · máximo até o próximo andar';
            isReady = false;
        } else {
            detail += ' · evolui ao encher';
        }

        track.setAttribute('aria-valuetext', detail);
        row.dataset.ready = String(isReady);
        row.dataset.active = String(isActive);
        specialAbilityDetailElements[ability].textContent = detail;
    }

    for (const button of specialAbilityButtons) {
        button.setAttribute('aria-pressed', String(
            button.dataset.specialSelect === selectedSpecialAbility
        ));
    }
    specialAbilitiesStatus.textContent = (
        selectedSpecialAbility === 'sword'
            ? 'Golpe da espada · raio de 4 quadrados'
            : hasConquestScroll
                ? `Conquista · dano e velocidade +${auraBonusText}%`
                : 'Conquista · precisa de um pergaminho no inventário'
    );
    const selectedCharge = player.specialAbilityCharges[selectedSpecialAbility];
    specialAbilityActivateButton.disabled = !(
        gameState === 'playing'
        && !shopOpen
        && !botMode
        && selectedSpecialAbility === 'sword'
        && selectedCharge >= 100
        && player.specialAbilityCooldowns.sword <= 0
        && swordEquipped
    );
    specialAbilityActivateButton.textContent = selectedSpecialAbility === 'sword'
        ? 'Golpear · F'
        : 'Passiva';
}

function selectSpecialAbility(ability) {
    if (!['sword', 'conquest'].includes(ability)) {
        throw new Error(`Habilidade especial desconhecida: ${ability}.`);
    }
    selectedSpecialAbility = ability;
    updateSpecialAbilitiesHud();
}

function cycleSpecialAbility() {
    selectSpecialAbility(selectedSpecialAbility === 'sword' ? 'conquest' : 'sword');
}

function chargeSpecialAbilities(damage) {
    if (!Number.isFinite(damage) || damage <= 0) {
        return;
    }

    player.specialAbilityCharges.sword = Math.min(
        100,
        player.specialAbilityCharges.sword + damage
    );
    if (scrollInventory.conquista > 0 && player.conquestAuraTier < finalConquestAuraTier) {
        player.specialAbilityCharges.conquest += damage;
        while (
            player.specialAbilityCharges.conquest >= 100
            && player.conquestAuraTier < finalConquestAuraTier
        ) {
            player.specialAbilityCharges.conquest -= 100;
            player.conquestAuraTier += 1;
            const nextAura = conquestAuraTiers[player.conquestAuraTier - 1];
            info.textContent = `Aura ${nextAura.name} alcançada! Dano e velocidade aumentados em ${nextAura.bonus.toLocaleString('pt-BR')}%.`;
        }
        if (player.conquestAuraTier === finalConquestAuraTier) {
            player.specialAbilityCharges.conquest = 100;
        }
    }
    updateSpecialAbilitiesHud();
}

function getConquestAuraMultiplier() {
    if (scrollInventory.conquista <= 0) {
        return 1;
    }
    return 1 + player.conquestAuraTier * 0.125;
}

function updateProgressHud() {
    levelText.textContent = `Nível ${playerProgress.level}`;
    xpText.textContent = `${playerProgress.xp} / ${playerProgress.xpToNext} XP`;
    xpFill.style.width = `${Math.min(100, playerProgress.xp / playerProgress.xpToNext * 100)}%`;
    xpTrack.setAttribute('aria-valuemax', String(playerProgress.xpToNext));
    xpTrack.setAttribute('aria-valuenow', String(playerProgress.xp));
    updateLevelUpgradeHud();
    if (player) {
        updateSwordHud();
    }
}

function updateLevelUpgradeHud() {
    const points = playerProgress.skillPoints;
    levelUpgradePanel.hidden = points <= 0 || botMode;
    skillPointText.textContent = `${points} ${points === 1 ? 'ponto disponível' : 'pontos disponíveis'}`;
    investHealthButton.disabled = points <= 0;
    investMeleeButton.disabled = points <= 0;
    investAimButton.disabled = points <= 0;
}

function investPlayerAttribute(attribute) {
    if (playerProgress.skillPoints <= 0) {
        return false;
    }
    if (!Object.prototype.hasOwnProperty.call(playerProgress.attributes, attribute)) {
        throw new Error(`Atributo de nível desconhecido: ${attribute}`);
    }

    playerProgress.skillPoints -= 1;
    playerProgress.attributes[attribute] += 1;
    if (attribute === 'health') {
        player.maxHealth = getPlayerMaxHealth();
        player.health = Math.min(player.maxHealth, player.health + 10);
        updateHealthHud();
    } else if (attribute === 'meleeDamage') {
        player.damage = getPlayerMeleeDamage();
        updateSwordHud();
    } else if (attribute === 'aim') {
        updateBowHud();
    }
    updateProgressHud();
    return true;
}

function updateSwordHud() {
    swordSlot.setAttribute('aria-pressed', String(swordEquipped));
    swordSlot.setAttribute(
        'aria-label',
        swordEquipped
            ? `Espada equipada, causa ${player.damage} de dano. Clique para selecionar a espada.`
            : `Espada guardada, causa ${player.damage} de dano. Clique para selecionar a espada.`
    );
    swordSlot.querySelector('.inventory-item-detail').textContent = swordEquipped
        ? `Equipado · ${player.damage} de dano`
        : `${player.damage} de dano · clique para equipar`;
    updateBowHud();
}

function selectPlayerWeapon(weapon) {
    if (botMode || (weapon === 'bow' && !bowOwned)) {
        return;
    }
    swordEquipped = weapon === 'sword';
    updateSwordHud();
    updateSpecialAbilitiesHud();
}

function updateSpearHud() {
    spearSlot.hidden = !spearOwned;
    const susanoActive = Boolean(player && player.susanoActive);
    spearSlot.setAttribute(
        'aria-label',
        spearOwned
            ? susanoActive
                ? 'Ataque de roubo de vida do Susano. Pressione R para usar.'
                : 'Lança comprada. Pressione R para estocar a média distância.'
            : 'Lança não comprada.'
    );
    spearSlot.querySelector('.inventory-item-name').textContent = susanoActive
        ? 'Roubo de vida (R)'
        : 'Lança (R)';
    spearSlot.querySelector('.inventory-item-detail').textContent = susanoActive
        ? 'Ataque próximo · cura parte do dano'
        : '8 de dano base · alcance médio';
    updateInventoryEmptySlots();
}

function updatePotionHud() {
    const potionCount = healingPotions.length;
    const nextPotion = healingPotions.reduce(
        (best, potion) => potion.rarity.rank > best.rarity.rank ? potion : best,
        { rarity: itemRarities[0] }
    );
    const potionIcon = potionSlot.querySelector('.potion-inventory-icon');
    const potionSprite = potionIconSprites.get(nextPotion.rarity.id);
    if (!potionSprite) {
        throw new Error(`Ícone de poção ausente: ${nextPotion.rarity.id}.`);
    }
    potionIcon.src = potionSprite.src;
    potionSlot.hidden = potionCount === 0;
    potionSlot.disabled = potionCount === 0;
    potionSlot.setAttribute(
        'aria-label',
        `Poções de cura: ${potionCount} disponível(is). ${potionCount > 0 ? `Próxima: ${nextPotion.rarity.potionName}, recupera até ${nextPotion.rarity.potionHeal} de vida. ` : ''}Pressione Q para usar.`
    );
    potionSlot.querySelector('.inventory-item-detail').textContent = (
        potionCount > 0
            ? `${potionCount} · ${nextPotion.rarity.potionName} · Q para usar`
            : '0 disponíveis · Q para usar'
    );
    potionCountText.textContent = String(potionCount);
    updateInventoryEmptySlots();
}

function updateScrollInventoryHud() {
    const total = scrollTypes.reduce((count, scroll) => count + scrollInventory[scroll.id], 0);
    const collectedScrolls = scrollTypes
        .filter((scroll) => scrollInventory[scroll.id] > 0)
        .map((scroll) => `${scroll.name}: ${scrollInventory[scroll.id]}`);
    const scrollHint = [
        player && player.susanoActive ? 'Susano ativo (R: vida · L: confusão)' : '',
        player && scrollInventory.conquista > 0 && player.conquestAuraTier > 0
            ? `Aura ${conquestAuraTiers[player.conquestAuraTier - 1].name} (+${conquestAuraTiers[player.conquestAuraTier - 1].bonus.toLocaleString('pt-BR')}%)`
            : '',
        scrollInventory.perdicao > 0 ? 'P: invocar Susano' : ''
    ].filter(Boolean).map((hint) => ` · ${hint}`).join('');
    const inventorySummary = total > 0
        ? `Pergaminhos (${total}): ${collectedScrolls.join(' · ')}`
        : 'Pergaminhos: nenhum';
    scrollInventoryText.textContent = `${inventorySummary}${scrollHint}`;
    scrollInventoryText.setAttribute('aria-label', `${inventorySummary}${scrollHint}`);
    for (const scroll of scrollTypes) {
        const count = scrollInventory[scroll.id];
        const slot = document.getElementById(`scrollSlot-${scroll.id}`);
        slot.hidden = count === 0;
        slot.title = `${scroll.name}: ${count}`;
        slot.setAttribute('aria-label', `${scroll.name}: ${count}`);
        slot.disabled = count === 0;
        document.getElementById(`scrollCount-${scroll.id}`).textContent = String(count);
    }
    updateInventoryEmptySlots();
    updateSpecialAbilitiesHud();
}

function updateEquipmentHud() {
    const shieldWasPurchased = gearUpgrades.shield > 0;
    const armorWasPurchased = gearUpgrades.armor > 0;
    shieldSlot.hidden = !shieldWasPurchased;
    armorSlot.hidden = !armorWasPurchased;
    shieldDurabilityTrack.hidden = !shieldWasPurchased;
    armorDurabilityTrack.hidden = !armorWasPurchased;
    shieldSlot.disabled = !gearOwned.shield || gearDurability.shield <= 0;
    shieldSlot.setAttribute('aria-pressed', String(shieldBlocking));
    shieldSlot.setAttribute(
        'aria-label',
        gearOwned.shield
            ? `Escudo ${shieldBlocking ? 'erguido' : 'guardado'}, ${gearDurability.shield} de ${gearDurability.shieldMax} de durabilidade. Pressione E para alternar.`
            : 'Escudo quebrado. Compre novamente na loja.'
    );
    shieldSlot.querySelector('.inventory-item-detail').textContent = gearOwned.shield
        ? `${shieldBlocking ? 'Defendendo' : 'Pronto'} · E para usar`
        : 'Quebrado · Loja (Tab)';
    shieldDurabilityFill.style.width = gearDurability.shieldMax > 0
        ? `${gearDurability.shield / gearDurability.shieldMax * 100}%`
        : '0%';
    shieldDurabilityTrack.firstElementChild.dataset.empty = String(gearDurability.shield === 0);
    shieldDurabilityText.textContent = `${gearDurability.shield} / ${gearDurability.shieldMax}`;
    shieldDurabilityTrack.setAttribute('aria-valuenow', String(gearDurability.shield));
    shieldDurabilityTrack.setAttribute('aria-valuemax', String(gearDurability.shieldMax));

    armorSlot.disabled = !gearOwned.armor || gearDurability.armor <= 0;
    armorSlot.setAttribute(
        'aria-label',
        gearOwned.armor
            ? `Armadura passiva, ${gearDurability.armor} de ${gearDurability.armorMax} de durabilidade, reduz ${player.defense} de dano.`
            : 'Armadura quebrada. Compre novamente na loja.'
    );
    armorSlot.querySelector('.inventory-item-detail').textContent = gearOwned.armor
        ? `Passiva · reduz ${player.defense} dano`
        : 'Quebrada · Loja (Tab)';
    armorDurabilityFill.style.width = gearDurability.armorMax > 0
        ? `${gearDurability.armor / gearDurability.armorMax * 100}%`
        : '0%';
    armorDurabilityTrack.firstElementChild.dataset.empty = String(gearDurability.armor === 0);
    armorDurabilityText.textContent = `${gearDurability.armor} / ${gearDurability.armorMax}`;
    armorDurabilityTrack.setAttribute('aria-valuenow', String(gearDurability.armor));
    armorDurabilityTrack.setAttribute('aria-valuemax', String(gearDurability.armorMax));
    updateInventoryEmptySlots();
    shieldSlot.dataset.active = String(shieldBlocking);
    updateBowHud();
    updateShopHud();
}

function getUpgradeCost(type) {
    if (type === 'potion') {
        return GAME_BALANCE.economy.fixedCosts.potion;
    }
    if (type === 'arrows') {
        return GAME_BALANCE.bow.ammoBundleCost;
    }
    if (Object.prototype.hasOwnProperty.call(GAME_BALANCE.economy.fixedCosts, type)) {
        return GAME_BALANCE.economy.fixedCosts[type];
    }
    const baseCost = GAME_BALANCE.economy.upgradeBaseCosts[type];
    if (!Number.isFinite(baseCost)) {
        throw new Error(`Custo de melhoria desconhecido: ${type}.`);
    }
    return Math.round(baseCost * GAME_BALANCE.economy.upgradeCostGrowth ** gearUpgrades[type]);
}

function getSwordUpgradeBonus(level) {
    const config = GAME_BALANCE.economy.sword;
    const fullGain = Math.min(level, config.fullGainLevels) * config.fullGain;
    const reducedLevels = Math.min(
        Math.max(0, level - config.fullGainLevels),
        config.reducedGainLevels
    );
    const reducedGain = reducedLevels * config.reducedGain;
    const highLevels = Math.max(0, level - config.fullGainLevels - config.reducedGainLevels);
    const highGain = Math.floor(highLevels / config.highLevelEvery) * config.highLevelGain;
    return fullGain + reducedGain + highGain;
}

function getShieldDurability(level) {
    const config = GAME_BALANCE.economy.shield;
    const fullLevels = Math.min(level, config.fullGainLevels);
    const reducedLevels = Math.max(0, level - config.fullGainLevels);
    return config.initialDurability
        + fullLevels * config.fullGain
        + reducedLevels * config.reducedGain;
}

function getArmorDurability(level) {
    const config = GAME_BALANCE.economy.armor;
    const fullLevels = Math.min(level, config.fullGainLevels);
    const reducedLevels = Math.max(0, level - config.fullGainLevels);
    return config.initialDurability
        + fullLevels * config.fullDurabilityGain
        + reducedLevels * config.reducedDurabilityGain;
}

function getArmorDefense(level) {
    const config = GAME_BALANCE.economy.armor;
    const fullLevels = Math.min(level, config.fullDefenseLevels);
    const reducedLevels = Math.max(0, level - config.fullDefenseLevels);
    return fullLevels * config.fullDefenseGain + reducedLevels * config.reducedDefenseGain;
}

function updateBowHud() {
    bowSlot.hidden = !bowOwned && arrowAmmo === 0;
    bowSlot.disabled = !bowOwned;
    arrowCountText.textContent = String(arrowAmmo);
    bowInventoryIcon.src = bowOwned || arrowAmmo === 0
        ? 'assets/inventory-items/bow.png'
        : equipmentDropSprites.arrows.src;
    canvas.setAttribute(
        'aria-label',
        bowOwned
            ? swordEquipped
                ? 'Área da masmorra. Use WASD ou setas para mover e Espaço para atacar. Selecione o arco no inventário para disparar flechas.'
                : 'Área da masmorra. Use WASD ou setas para mover; mire com o mouse e clique para disparar flechas. Selecione a espada no inventário para atacar.'
            : 'Área da masmorra. Use WASD ou setas para mover, Shift para correr, espaço para atacar.'
    );
    bowSlot.setAttribute(
        'aria-label',
        bowOwned
            ? swordEquipped
                ? `Arco guardado. Clique para equipar. ${arrowAmmo} de ${GAME_BALANCE.bow.maxAmmo} flechas disponíveis.`
                : `Arco equipado. Mire e clique para disparar. ${arrowAmmo} de ${GAME_BALANCE.bow.maxAmmo} flechas disponíveis.`
            : `Flechas armazenadas: ${arrowAmmo}. Arco não comprado; não é possível atirar.`
    );
    bowSlot.setAttribute('aria-pressed', String(bowOwned && !swordEquipped));
    bowSlot.querySelector('.inventory-item-name').textContent = bowOwned
        ? 'Arco'
        : 'Flechas';
    bowSlot.querySelector('.inventory-item-detail').textContent = !bowOwned
        ? 'Armazenadas · arco necessário para atirar'
        : swordEquipped
            ? `Guardado · ${arrowAmmo}/${GAME_BALANCE.bow.maxAmmo} flechas`
            : `Equipado · ${arrowAmmo}/${GAME_BALANCE.bow.maxAmmo} flechas · clique para atirar`;
    updateInventoryEmptySlots();
    if (player) {
        updateSpecialAbilitiesHud();
    }
}

function updateShopHud() {
    const balanceInCopper = getOreCoinBalanceInCopper();
    shopCurrencyCount.textContent = String(balanceInCopper);
    if (player) {
        shopEquipmentStatus.textContent = `Dano: ${player.damage} · Defesa: ${player.defense}`;
    }
    const upgradeDetails = {
        sword: {
            level: gearUpgrades.sword,
            effect: `+${getSwordUpgradeBonus(gearUpgrades.sword + 1) - getSwordUpgradeBonus(gearUpgrades.sword)} de dano`
        },
        shield: {
            level: gearUpgrades.shield,
            effect: `Bloqueia dano · ${getShieldDurability(gearUpgrades.shield + 1)} de durabilidade`
        },
        armor: {
            level: gearUpgrades.armor,
            effect: `Reduz ${getArmorDefense(gearUpgrades.armor + 1)} de dano · ${getArmorDurability(gearUpgrades.armor + 1)} de durabilidade`
        },
        bow: {
            level: bowOwned ? 'Comprado' : 'Não comprado',
            effect: bowOwned
                ? `Mouse e clique · alcance ${GAME_BALANCE.bow.range} · ${getAimedWeaponDamage(GAME_BALANCE.bow.damage)} de dano · recarga ${GAME_BALANCE.bow.cooldownSeconds} s`
                    : `Arco recurvo · alcance ${GAME_BALANCE.bow.range} · flechas de ${getAimedWeaponDamage(GAME_BALANCE.bow.damage)} de dano · recarga ${GAME_BALANCE.bow.cooldownSeconds} s · ${GAME_BALANCE.bow.startingAmmo} flechas`
        },
        arrows: {
            level: `${arrowAmmo}/${GAME_BALANCE.bow.maxAmmo} flechas`,
            effect: bowOwned
                ? `Adiciona até ${GAME_BALANCE.bow.ammoBundleSize} flechas à aljava`
                : 'Compre o arco antes de comprar munição'
        },
        spear: {
            level: spearOwned ? 'Comprada' : 'Não comprada',
            effect: spearOwned
                ? 'Tecla R · estocada de alcance médio · 8 de dano base'
                : 'Estocada de alcance médio · 8 de dano base'
        },
        dash: {
            level: dashUpgradeOwned ? 'Comprada' : 'Não comprada',
            effect: dashUpgradeOwned
                ? 'Distância do dash aumentada em 50%'
                : 'Aumenta a distância do dash em 50%'
        },
        potion: {
            level: 'Consumível',
            effect: `Recupera até ${itemRarities[0].potionHeal} pontos de vida · limite ${GAME_BALANCE.economy.potionCapacity}`
        }
    };

    for (const [type, button] of Object.entries(shopItems)) {
        const details = upgradeDetails[type];
        const cost = getUpgradeCost(type);
        const minimumLevel = getShopMinimumLevel(type);
        const levelLocked = playerProgress.level < minimumLevel;
        button.querySelector('[data-upgrade-level]').textContent = (
            type === 'bow' || type === 'spear' || type === 'dash' || type === 'potion' || type === 'arrows'
        )
            ? details.level
            : `Nível ${details.level}`;
        button.querySelector('[data-upgrade-effect]').textContent = details.effect;
        const requirement = button.querySelector('[data-minimum-level]');
        requirement.textContent = `Nível ${minimumLevel}${levelLocked ? ` · Requer nível ${minimumLevel}` : ''}`;
        button.classList.toggle('shop-level-locked', levelLocked);
        button.hidden = (!GAME_BALANCE.shop.showLockedItems && levelLocked)
            || (shopAvailableOnlyFilter.checked && !canPurchaseShopItem(type));
        button.querySelector('[data-upgrade-cost]').textContent = (
            (type === 'bow' && bowOwned)
            || (type === 'spear' && spearOwned)
            || (type === 'dash' && dashUpgradeOwned)
        )
            ? 'Já comprada'
            : type === 'arrows' && !bowOwned
                ? 'Compre o arco primeiro'
                : type === 'arrows' && arrowAmmo >= GAME_BALANCE.bow.maxAmmo
                    ? 'Aljava cheia'
            : devMode ? 'Grátis no modo Dev' : `${cost} moedas de cobre`;
        button.disabled = false;
    }
    updateShopPurchaseButton();
}

function getShopMinimumLevel(type) {
    const level = GAME_BALANCE.shop.items[type]?.nivelMinimo;
    if (level === undefined || level === null || level === '') {
        return 1;
    }
    if (!Number.isInteger(level) || level < 1) {
        if (!shopLevelValidationWarnings.has(type)) {
            console.warn(`[Loja] nivelMinimo inválido para "${type}": ${level}. Usando nível 1.`);
            shopLevelValidationWarnings.add(type);
        }
        return 1;
    }
    return level + Math.floor((shopPurchaseCounts[type] || 0) / shopPurchasesPerLevelRequirementIncrease);
}

function canPurchaseShopItem(type) {
    if (playerProgress.level < getShopMinimumLevel(type)) {
        return false;
    }
    const alreadyOwned = (type === 'bow' && bowOwned)
        || (type === 'spear' && spearOwned)
        || (type === 'dash' && dashUpgradeOwned);
    const ammunitionUnavailable = type === 'arrows'
        && (!bowOwned || arrowAmmo >= GAME_BALANCE.bow.maxAmmo);
    const potionUnavailable = type === 'potion'
        && healingPotions.length >= GAME_BALANCE.economy.potionCapacity;
    return !alreadyOwned
        && !ammunitionUnavailable
        && !potionUnavailable
        && (devMode || getOreCoinBalanceInCopper() >= getUpgradeCost(type));
}

function showInventoryItemInformation(item) {
    const scroll = item.classList.contains('inventory-scroll-slot')
        ? scrollTypes.find((candidate) => `scrollSlot-${candidate.id}` === item.id)
        : null;
    if (scroll) {
        const descriptions = {
            conquista: 'Aumenta progressivamente o dano e a velocidade com golpes corpo a corpo.',
            poder: 'Pergaminho mágico armazenado no inventário.',
            alma: 'Pergaminho mágico armazenado no inventário.',
            sagrado: 'Pergaminho mágico armazenado no inventário.',
            perdicao: 'Pressione P para invocar o Susano; R rouba vida e L confunde inimigos.'
        };
        inventoryItemTitle.textContent = scroll.name;
        inventoryItemDescription.textContent = `${descriptions[scroll.id]} Quantidade: ${scrollInventory[scroll.id]}.`;
        return;
    }

    const name = item.querySelector('.inventory-item-name')?.textContent.trim();
    const detail = item.querySelector('.inventory-item-detail')?.textContent.trim();
    inventoryItemTitle.textContent = name || 'Item do inventário';
    inventoryItemDescription.textContent = item.getAttribute('aria-label') || detail || 'Sem detalhes adicionais.';
}

function showShopItemInformation(type) {
    const button = shopItems[type];
    selectedShopItemType = type;
    const name = button.querySelector('.shop-upgrade-name').textContent.trim();
    const effect = button.querySelector('[data-upgrade-effect]').textContent.trim();
    const availability = button.querySelector('[data-upgrade-level]').textContent.trim();
    const minimumLevel = getShopMinimumLevel(type);
    const cost = button.querySelector('[data-upgrade-cost]').textContent.trim();
    shopItemTitle.textContent = name;
    shopItemDescription.textContent = `${effect}. ${availability}. Nível ${minimumLevel}${playerProgress.level < minimumLevel ? ` · Requer nível ${minimumLevel}` : ''}. Preço: ${cost}.`;
    shopItemPurchaseButton.hidden = false;
    updateShopPurchaseButton();
}

function updateShopPurchaseButton() {
    if (!selectedShopItemType) {
        return;
    }

    const type = selectedShopItemType;
    const minimumLevel = getShopMinimumLevel(type);
    const levelLocked = playerProgress.level < minimumLevel;
    const alreadyOwned = (type === 'bow' && bowOwned)
        || (type === 'spear' && spearOwned)
        || (type === 'dash' && dashUpgradeOwned);
    const ammunitionFull = type === 'arrows' && arrowAmmo >= GAME_BALANCE.bow.maxAmmo;
    const bowNotOwned = type === 'arrows' && !bowOwned;
    const cost = getUpgradeCost(type);
    const potionCapacityReached = type === 'potion'
        && healingPotions.length >= GAME_BALANCE.economy.potionCapacity;
    const insufficientFunds = !devMode && getOreCoinBalanceInCopper() < cost;
    shopItemPurchaseButton.disabled = levelLocked || alreadyOwned || ammunitionFull || bowNotOwned
        || potionCapacityReached || insufficientFunds;
    shopItemPurchaseButton.textContent = levelLocked
        ? `Requer nível ${minimumLevel}`
        : alreadyOwned
        ? 'Já comprado'
        : bowNotOwned
            ? 'Compre o arco primeiro'
        : ammunitionFull
            ? 'Aljava cheia'
        : potionCapacityReached
            ? 'Limite de poções atingido'
        : insufficientFunds
            ? `Saldo insuficiente · ${cost} cobres`
            : devMode ? 'Comprar grátis' : `Comprar · ${cost} cobres`;
}

function getOreCoinBalanceInCopper() {
    return oreTypes.reduce(
        (total, ore) => total + oreCoinBalance[ore.id] * ore.copperValue,
        0
    );
}

function spendOreCoinBalanceInCopper(amount) {
    if (getOreCoinBalanceInCopper() < amount) {
        return null;
    }

    let remainingCost = amount;
    const change = [];
    for (const oreId of [...oreCurrencySpendOrder].reverse()) {
        const ore = oreTypes.find((candidate) => candidate.id === oreId);
        const availableCount = oreCoinBalance[ore.id];
        const availableValue = availableCount * ore.copperValue;
        if (availableValue === 0) {
            continue;
        }

        if (availableValue < remainingCost) {
            oreCoinBalance[ore.id] = 0;
            remainingCost -= availableValue;
            continue;
        }

        const paidCount = Math.ceil(remainingCost / ore.copperValue);
        oreCoinBalance[ore.id] -= paidCount;
        let changeValue = paidCount * ore.copperValue - remainingCost;
        const denominationIndex = oreCurrencySpendOrder.indexOf(ore.id);
        for (const changeOreId of oreCurrencySpendOrder.slice(denominationIndex + 1)) {
            const changeOre = oreTypes.find((candidate) => candidate.id === changeOreId);
            const changeCount = Math.floor(changeValue / changeOre.copperValue);
            if (changeCount > 0) {
                oreCoinBalance[changeOre.id] += changeCount;
                change.push({ ore: changeOre, count: changeCount });
                changeValue -= changeCount * changeOre.copperValue;
            }
        }
        remainingCost = 0;
        break;
    }

    return change;
}

function formatOreChange(change) {
    if (change.length === 0) {
        return '';
    }
    const description = change.map(({ ore, count }) => (
        `${count} ${ore.name}${count === 1 ? '' : 's'}`
    ));
    const formattedChange = description.length === 1
        ? description[0]
        : `${description.slice(0, -1).join(', ')} e ${description[description.length - 1]}`;
    return ` Troco: ${formattedChange}.`;
}

function purchaseUpgrade(type) {
    if (!shopOpen || (
        type !== 'bow'
        && type !== 'spear'
        && type !== 'dash'
        && type !== 'potion'
        && type !== 'arrows'
        && !Object.prototype.hasOwnProperty.call(gearUpgrades, type)
    ) || (type === 'bow' && bowOwned)
        || (type === 'spear' && spearOwned)
        || (type === 'dash' && dashUpgradeOwned)
        || (type === 'arrows'
            && (!bowOwned || arrowAmmo >= GAME_BALANCE.bow.maxAmmo))
        || (type === 'potion' && healingPotions.length >= GAME_BALANCE.economy.potionCapacity)) {
        return;
    }
    const minimumLevel = getShopMinimumLevel(type);
    if (playerProgress.level < minimumLevel) {
        info.textContent = `Você precisa do nível ${minimumLevel} para comprar este item.`;
        updateShopHud();
        return;
    }
    const cost = getUpgradeCost(type);
    const change = devMode ? [] : spendOreCoinBalanceInCopper(cost);
    if (change === null) {
        info.textContent = `Você precisa de ${cost} moedas de cobre equivalentes para essa melhoria.`;
        return;
    }

    if (type === 'spear') {
        spearOwned = true;
        updateSpearHud();
        info.textContent = 'Lança de aço comprada! Pressione R para estocar a média distância.';
    } else if (type === 'bow') {
        bowOwned = true;
        arrowAmmo = Math.max(arrowAmmo, GAME_BALANCE.bow.startingAmmo);
        if (botMode && botLearning) {
            botLearning.arrowsPurchased += arrowAmmo;
        }
        player.arrowCooldown = 0;
        info.textContent = 'Arco de teixo comprado! Mire com o mouse e clique para disparar flechas.';
    } else if (type === 'arrows') {
        const addedAmmo = Math.min(
            GAME_BALANCE.bow.ammoBundleSize,
            GAME_BALANCE.bow.maxAmmo - arrowAmmo
        );
        arrowAmmo += addedAmmo;
        if (botMode && botLearning) {
            botLearning.arrowsPurchased += addedAmmo;
        }
        updateBowHud();
        info.textContent = `Pacote de flechas comprado: +${addedAmmo}. Aljava ${arrowAmmo}/${GAME_BALANCE.bow.maxAmmo}.`;
    } else if (type === 'potion') {
        healingPotions.push({ type: 'potion', rarity: itemRarities[0] });
        updatePotionHud();
        info.textContent = `Poção comum comprada! Recupera até ${itemRarities[0].potionHeal} pontos de vida.`;
    } else if (type === 'dash') {
        dashUpgradeOwned = true;
        info.textContent = 'Dash melhorado! Agora percorre 50% mais distância.';
    } else if (type === 'sword') {
        gearUpgrades[type] += 1;
        player.damage = getPlayerMeleeDamage();
        updateSwordHud();
        info.textContent = `Espada melhorada! Agora causa ${player.damage} de dano.`;
    } else if (type === 'shield') {
        gearUpgrades[type] += 1;
        gearOwned.shield = true;
        gearDurability.shieldMax = getShieldDurability(gearUpgrades.shield);
        gearDurability.shield = gearDurability.shieldMax;
        shieldBlocking = false;
        info.textContent = `Escudo nível ${gearUpgrades.shield} comprado e equipado. Pressione E para erguer.`;
    } else {
        gearUpgrades[type] += 1;
        gearOwned.armor = true;
        gearDurability.armorMax = getArmorDurability(gearUpgrades.armor);
        gearDurability.armor = gearDurability.armorMax;
        player.defense = getArmorDefense(gearUpgrades.armor);
        info.textContent = `Armadura nível ${gearUpgrades.armor} equipada. Reduz ${player.defense} de dano passivamente.`;
    }
    shopPurchaseCounts[type] += 1;
    info.textContent += formatOreChange(change);
    updateOreCoinHud();
    updateEquipmentHud();
}

function setShopOpen(open) {
    if (open && gameState !== 'playing') {
        return;
    }
    shopOpen = open;
    shopPanel.hidden = !open;
    if (open) {
        updateShopHud();
        shopCloseButton.focus();
    } else if (gameState === 'playing') {
        canvas.focus();
    }
}

function setScrollGalleryOpen(open) {
    if (open && gameState !== 'playing') {
        return;
    }
    scrollGalleryOpen = open;
    scrollGalleryPanel.hidden = !open;
    if (open) {
        scrollGalleryCloseButton.focus();
    } else if (gameState === 'playing') {
        scrollGalleryOpenButton.focus();
    }
}

function setDevModeEnabled(enabled) {
    devMode = enabled;
    devToolsPanel.hidden = !enabled;
    playerHud.dataset.devMode = String(enabled);
    devSelectedEntity = null;
    devSelectedWall = null;
    devToolStatus.textContent = 'Clique no mapa para colocar ou remover paredes.';
    for (const button of devToolButtons) {
        button.setAttribute('aria-pressed', String(button.dataset.devTool === devTool));
    }
    updateShopHud();
}

function toggleShield() {
    if (!gearOwned.shield || gearDurability.shield <= 0 || gameState !== 'playing' || shopOpen) {
        return;
    }
    shieldBlocking = !shieldBlocking;
    updateEquipmentHud();
    info.textContent = shieldBlocking
        ? 'Escudo erguido: os golpes serão absorvidos até a durabilidade acabar.'
        : 'Escudo guardado.';
}

function useHealingPotion() {
    if (gameState !== 'playing' || shopOpen || scrollGalleryOpen) {
        return;
    }
    if (healingPotions.length === 0) {
        info.textContent = 'Você não tem poções de cura.';
        return;
    }
    if (player.health >= player.maxHealth) {
        info.textContent = 'Sua vida já está cheia. Guarde a poção para depois.';
        return;
    }

    let bestPotionIndex = 0;
    for (let index = 1; index < healingPotions.length; index++) {
        if (healingPotions[index].rarity.rank > healingPotions[bestPotionIndex].rarity.rank) {
            bestPotionIndex = index;
        }
    }
    const potion = healingPotions.splice(bestPotionIndex, 1)[0];
    const restoredHealth = Math.min(potion.rarity.potionHeal, player.maxHealth - player.health);
    player.health += restoredHealth;
    if (botMode && botLearning) {
        botLearning.potionsUsed += 1;
    }
    updateHealthHud();
    updatePotionHud();
    info.textContent = `Poção ${potion.rarity.potionName} usada! Você recuperou ${restoredHealth} pontos de vida.`;
}

function addExperience(amount) {
    playerProgress.xp += amount;
    let levelsGained = 0;
    while (playerProgress.xp >= playerProgress.xpToNext) {
        playerProgress.xp -= playerProgress.xpToNext;
        playerProgress.level += 1;
        playerProgress.xpToNext += 50;
        playerProgress.skillPoints += 1;
        if (playerProgress.level <= finalFloor && playerProgress.level % 5 === 0) {
            playerProgress.skillPoints += 1;
        }
        levelsGained += 1;
    }

    if (levelsGained > 0) {
        if (botMode) {
            while (playerProgress.skillPoints > 0) {
                investPlayerAttribute(player.health / player.maxHealth < 0.5
                    ? 'health'
                    : bowOwned ? 'aim' : 'meleeDamage');
            }
        }
        updateHealthHud();
        info.textContent = botMode
            ? `Subiu para o nível ${playerProgress.level}!`
            : `Subiu para o nível ${playerProgress.level}! Você recebeu ${playerProgress.skillPoints} ponto(s) para investir.`;
    }
    updateProgressHud();
}
