function initializeDevLoadout() {
    gearUpgrades = { sword: 1, shield: 1, armor: 1 };
    spearOwned = true;
    bowOwned = true;
    arrowAmmo = GAME_BALANCE.bow.maxAmmo;
    dashUpgradeOwned = true;
    gearOwned = { shield: true, armor: true };
    gearDurability = {
        shield: 1000,
        shieldMax: 1000,
        armor: 1000,
        armorMax: 1000
    };
    shieldBlocking = true;
    healingPotions = itemRarities.map((rarity) => ({ type: 'potion', rarity }));
    const mobDropMaterials = new Set(
        creatureData.flatMap((creature) => creature.drops.map((drop) => drop.id))
            .filter((dropId) => dropId !== 'coin')
    );
    for (const materialId of mobDropMaterials) {
        if (!creatureMaterialDataById[materialId]) {
            throw new Error(`Material de drop desconhecido no modo Dev: ${materialId}.`);
        }
    }
    collectedMaterials = Object.fromEntries(
        Array.from(mobDropMaterials, (materialId) => [materialId, 99])
    );
    for (const ore of oreTypes) {
        oreCoinBalance[ore.id] = 99;
    }
    for (const scroll of scrollTypes) {
        scrollInventory[scroll.id] = 1;
    }
    player.damage = getPlayerMeleeDamage();
    player.defense = getArmorDefense(gearUpgrades.armor);
    player.health = player.maxHealth;
    player.poisonTimer = 0;
    player.poisonTickTimer = 0;
    player.poisonDamageRemaining = 0;
    player.burnTimer = 0;
    player.burnTickTimer = 0;
    player.burnDamageRemaining = 0;
    updateHealthHud();
    updateProgressHud();
    updateSwordHud();
    updateSpearHud();
    updateBowHud();
    updatePotionHud();
    updateEquipmentHud();
    updateScrollInventoryHud();
    updateMaterialInventoryHud();
    updateOreCoinHud();
}

const reducedEffectsToggle = document.getElementById('reducedEffectsToggle');
const reducedEffectsStorageKey = 'mmMmReducedVisualEffects';
const reducedMotionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const savedReducedEffects = localStorage.getItem(reducedEffectsStorageKey);

if (document.hidden) {
    releaseHiddenRenderCaches();
}

function setReducedVisualEffects(enabled, persist = false) {
    reducedVisualEffects = enabled;
    reducedEffectsToggle.checked = enabled;
    document.body.dataset.reducedEffects = String(enabled);
    if (enabled) {
        releaseImpactParticles();
    }
    if (persist) {
        localStorage.setItem(reducedEffectsStorageKey, String(enabled));
    }
}

setReducedVisualEffects(
    savedReducedEffects === null ? reducedMotionPreference.matches : savedReducedEffects === 'true'
);
reducedEffectsToggle.addEventListener('change', () => {
    setReducedVisualEffects(reducedEffectsToggle.checked, true);
});
reducedMotionPreference.addEventListener('change', (event) => {
    if (localStorage.getItem(reducedEffectsStorageKey) === null) {
        setReducedVisualEffects(event.matches);
    }
});

function selectDevTool(tool) {
    const labels = {
        wall: 'Clique em uma parede ou no piso para alternar entre os dois.',
        'move-wall': 'Clique em uma parede para selecioná-la; depois clique no piso de destino.',
        'move-entity': 'Clique em um mob ou item; depois clique no local de destino.',
        'add-enemy': 'Clique em um piso livre para adicionar um mob.'
    };
    if (!Object.prototype.hasOwnProperty.call(labels, tool)) {
        throw new RangeError(`Ferramenta Dev inválida: ${tool}.`);
    }
    devTool = tool;
    devSelectedEntity = null;
    devSelectedWall = null;
    devToolStatus.textContent = labels[tool];
    for (const button of devToolButtons) {
        button.setAttribute('aria-pressed', String(button.dataset.devTool === tool));
    }
}

function getDevTileFromPointer(event) {
    const bounds = canvas.getBoundingClientRect();
    if (bounds.width === 0 || bounds.height === 0) {
        return null;
    }
    const worldX = cameraX + (event.clientX - bounds.left) / bounds.width * cameraViewportWidth;
    const worldY = cameraY + (event.clientY - bounds.top) / bounds.height * cameraViewportHeight;
    const col = Math.floor(worldX / tileSize);
    const row = Math.floor(worldY / tileSize);
    return col >= 0 && col < cols && row >= 0 && row < rows ? { col, row } : null;
}

function createDevEnemy(x, y, creatureType) {
    const creature = creatureDataByType[creatureType];
    if (!creature) {
        throw new Error(`Criatura Dev desconhecida: ${creatureType}.`);
    }
    return isBossCreatureType(creatureType)
        ? createBoss(x, y, creatureType)
        : createEnemy(x, y, chooseOreDrop(), creatureType);
}

function handleDevCanvasClick(event) {
    const tile = getDevTileFromPointer(event);
    if (!tile) {
        return;
    }
    const { col, row } = tile;

    if (devTool === 'wall') {
        if (map[row][col] !== '#' && map[row][col] !== '.') {
            devToolStatus.textContent = 'Esse bloco especial não pode ser alterado.';
            return;
        }
        map[row][col] = map[row][col] === '#' ? '.' : '#';
        invalidateMapBaseCanvas();
        devToolStatus.textContent = `Bloco ${map[row][col] === '#' ? 'transformado em parede' : 'liberado como piso'} em (${col + 1}, ${row + 1}).`;
        return;
    }

    if (devTool === 'move-wall') {
        if (!devSelectedWall) {
            if (map[row][col] !== '#') {
                devToolStatus.textContent = 'Selecione primeiro um bloco de parede.';
                return;
            }
            devSelectedWall = { col, row };
            devToolStatus.textContent = `Parede selecionada em (${col + 1}, ${row + 1}). Clique no piso onde quer colocá-la.`;
            return;
        }
        if (map[row][col] !== '.' || (devSelectedWall.col === col && devSelectedWall.row === row)) {
            devToolStatus.textContent = 'Escolha um bloco de piso livre como destino.';
            return;
        }
        map[devSelectedWall.row][devSelectedWall.col] = '.';
        map[row][col] = '#';
        invalidateMapBaseCanvas();
        devSelectedWall = null;
        devToolStatus.textContent = `Bloco de parede movido para (${col + 1}, ${row + 1}).`;
        return;
    }

    if (devTool === 'add-enemy') {
        if (map[row][col] !== '.') {
            devToolStatus.textContent = 'Escolha um bloco de piso livre para adicionar o mob.';
            return;
        }
        const creature = creatureDataByType[devCreatureType];
        const enemy = createDevEnemy(col, row, devCreatureType);
        enemies.push(enemy);
        devToolStatus.textContent = `${creature.name} adicionado em (${col + 1}, ${row + 1}). Total: ${enemies.filter((mob) => !mob.dying).length}.`;
        return;
    }

    const entities = [
        ...enemies
            .filter((enemy) => enemy.health > 0 && !enemy.dying)
            .map((entity) => ({ entity, kind: 'pixel', label: entity.isBoss ? 'Chefe' : `Mob ${entity.creatureType}` })),
        ...barrels
            .filter((entity) => entity.health > 0)
            .map((entity) => ({ entity, kind: 'tile', label: 'Barril' })),
        ...chests
            .filter((entity) => entity.health > 0)
            .map((entity) => ({ entity, kind: 'tile', label: entity.isMimic ? 'Baú/mímico' : 'Baú' })),
        ...oreDrops.map((entity) => ({ entity, kind: 'pixel', label: 'Minério' })),
        ...itemDrops.map((entity) => ({ entity, kind: 'pixel', label: entity.type === 'scroll' ? 'Pergaminho' : 'Item' }))
    ];
    const targetX = (col + 0.5) * tileSize;
    const targetY = (row + 0.5) * tileSize;
    if (!devSelectedEntity) {
        const closest = entities
            .map((candidate) => ({
                ...candidate,
                distance: Math.hypot(
                    candidate.kind === 'tile'
                        ? (candidate.entity.x + 0.5) * tileSize - targetX
                        : candidate.entity.x + (candidate.entity.size || 0) / 2 - targetX,
                    candidate.kind === 'tile'
                        ? (candidate.entity.y + 0.5) * tileSize - targetY
                        : candidate.entity.y + (candidate.entity.size || 0) / 2 - targetY
                )
            }))
            .sort((first, second) => first.distance - second.distance)[0];
        if (!closest || closest.distance > tileSize * 2) {
            devToolStatus.textContent = 'Não há mob ou item perto do clique para selecionar.';
            return;
        }
        devSelectedEntity = { entity: closest.entity, kind: closest.kind, label: closest.label };
        devToolStatus.textContent = `${closest.label} selecionado. Clique no destino para movê-lo.`;
        return;
    }

    const { entity, kind, label } = devSelectedEntity;
    if (kind === 'tile') {
        entity.x = col;
        entity.y = row;
    } else {
        entity.x = targetX - (entity.size || 0) / 2;
        entity.y = targetY - (entity.size || 0) / 2;
    }
    devSelectedEntity = null;
    devToolStatus.textContent = `${label} movido para (${col + 1}, ${row + 1}).`;
}

function changeDevFloor(amount) {
    if (!devMode) {
        return;
    }
    const nextFloor = Math.max(1, Math.min(20, currentFloor + amount));
    if (nextFloor === currentFloor) {
        devToolStatus.textContent = `Você já está no limite do andar ${currentFloor}.`;
        return;
    }
    currentFloor = nextFloor;
    devSelectedEntity = null;
    devSelectedWall = null;
    resetGame(true, true);
    player.health = player.maxHealth;
    player.poisonDamageRemaining = 0;
    player.burnDamageRemaining = 0;
    devToolStatus.textContent = `Andar alterado para ${currentFloor}.`;
    updateHealthHud();
}

document.addEventListener('keydown', (event) => {
    if (bestiaryOpen) {
        if (event.key === 'Escape') {
            event.preventDefault();
            setBestiaryOpen(false);
            return;
        }
        if (event.key === 'Tab') {
            const focusable = Array.from(bestiaryPanel.querySelectorAll(
                'button, summary, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )).filter((element) => !element.disabled && !element.hidden);
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }
        return;
    }
    if (scrollGalleryOpen) {
        if (event.key === 'Escape') {
            event.preventDefault();
            setScrollGalleryOpen(false);
        }
        return;
    }
    if (blacksmithMenuOpen) {
        if (event.key === 'Escape') {
            event.preventDefault();
            closeBlacksmithMenu();
            return;
        }
        if (blacksmithPanel.contains(event.target)
            && event.target.matches('input, select, textarea')) {
            return;
        }
        const key = event.key.toLowerCase();
        if (key === 'f' && !blacksmithForgeStage.hidden) {
            event.preventDefault();
            blacksmithForgeButton.click();
            return;
        }
        if (key === 'f' && !blacksmithMenuStage.hidden) {
            event.preventDefault();
            blacksmithPanel.querySelector('[data-blacksmith-action="forge"]').click();
            return;
        }
        if (key === 'c' && !blacksmithMenuStage.hidden) {
            event.preventDefault();
            blacksmithPanel.querySelector('[data-blacksmith-action="talk"]').click();
            return;
        }
        if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright',
            ' ', 'shift', 'r', 'q', 'p', 'e', 'z', 'l'].includes(key)) {
            event.preventDefault();
        }
        return;
    }
    if (event.key === 'Escape' && !botVictoryLetter.hidden) {
        event.preventDefault();
        botVictoryLetter.hidden = true;
        restartBtn.focus();
        return;
    }
    if (event.key === 'Escape' && activeFloorNpcInteraction) {
        event.preventDefault();
        activeFloorNpcInteraction = null;
        info.textContent = 'Conversa encerrada.';
        return;
    }
    if (gameState === 'playing' && activeFloorNpcInteraction
        && (event.code === 'Digit1' || event.code === 'Numpad1'
            || event.code === 'Digit2' || event.code === 'Numpad2')) {
        event.preventDefault();
        if (!event.repeat) {
            chooseFloorNpcOption(event.code.endsWith('1') ? 1 : 2);
        }
        return;
    }
    if (
        (event.code === 'Digit1' || event.code === 'Numpad1')
        && gameState === 'playing'
        && !shopOpen
    ) {
        event.preventDefault();
        if (!event.repeat) {
            inventoryPanel.hidden = !inventoryPanel.hidden;
        }
        return;
    }
    if (botMode) {
        if (event.key === 'Escape') {
            stopBotMode();
        }
        return;
    }
    const key = event.code === 'Space'
        ? 'Space'
        : event.key.length === 1 ? event.key.toLowerCase() : event.key;
    advanceSecretRoomSequence(key);
    if (key in keys) {
        keys[key] = true;
    }
    if (key === 'g' && gameState === 'playing' && !shopOpen) {
        event.preventDefault();
        if (!event.repeat) {
            interactWithFloorNpc();
        }
        return;
    }
    if (!event.repeat && (key === 'Shift' || key.startsWith('Arrow') || ['w', 'a', 's', 'd'].includes(key))) {
        tryStartDash();
    }

    if (event.key === 'Tab' && gameState === 'playing') {
        event.preventDefault();
        if (!event.repeat) {
            setShopOpen(!shopOpen);
        }
        return;
    }

    if (event.key === 'Escape' && shopOpen) {
        event.preventDefault();
        setShopOpen(false);
        return;
    }

    if (key === 'q') {
        event.preventDefault();
        if (!event.repeat) {
            useHealingPotion();
        }
    }

    if (key === 'p') {
        event.preventDefault();
        if (!event.repeat) {
            activatePerditionScroll();
        }
    }

    if (key === 'z' && gameState === 'playing' && !shopOpen) {
        event.preventDefault();
        if (!event.repeat) {
            cycleSpecialAbility();
        }
    }

    if (key === 'f' && gameState === 'playing') {
        event.preventDefault();
        if (!event.repeat) {
            activateSelectedSpecialAbility();
        }
    }

    if (key === 'l') {
        event.preventDefault();
        if (!event.repeat) {
            useSusanoConfusion();
        }
    }

    if (key === 'e') {
        event.preventDefault();
        if (!event.repeat) {
            toggleShield();
        }
    }

    if (key === 'r') {
        event.preventDefault();
        if (!event.repeat) {
            if (player.susanoActive) {
                useSusanoLifeSteal();
            } else {
                attackWithSpear();
            }
        }
    }

    if (event.code === 'Space') {
        event.preventDefault();
        if (!event.repeat) {
            attackWithSword();
        }
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'w' || event.key === 'a' || event.key === 's' || event.key === 'd') {
        event.preventDefault();
    }
});

document.addEventListener('keyup', (event) => {
    if (botMode) {
        return;
    }
    const key = event.code === 'Space'
        ? 'Space'
        : event.key.length === 1 ? event.key.toLowerCase() : event.key;
    if (key in keys) {
        keys[key] = false;
    }
});

canvas.addEventListener('pointerdown', (event) => {
    if (devMode) {
        if (
            event.button === 0
            && gameState === 'playing'
            && !shopOpen
            && !scrollGalleryOpen
        ) {
            handleDevCanvasClick(event);
        }
        return;
    }
    if (
        event.button !== 0
        || botMode
        || !bowOwned
        || swordEquipped
        || gameState !== 'playing'
        || shopOpen
    ) {
        return;
    }
    const bounds = canvas.getBoundingClientRect();
    if (bounds.width === 0 || bounds.height === 0) {
        return;
    }
    const targetX = cameraX + (event.clientX - bounds.left) / bounds.width * cameraViewportWidth;
    const targetY = cameraY + (event.clientY - bounds.top) / bounds.height * cameraViewportHeight;
    fireArrow(targetX, targetY);
});

investHealthButton.addEventListener('click', () => investPlayerAttribute('health'));
investMeleeButton.addEventListener('click', () => investPlayerAttribute('meleeDamage'));
investAimButton.addEventListener('click', () => investPlayerAttribute('aim'));

restartBtn.addEventListener('click', () => {
    stopBotMode();
    setDevModeEnabled(false);
    setScrollGalleryOpen(false);
    currentFloor = 1;
    setShopOpen(false);
    resetGame();
    gameState = 'menu';
    Object.keys(keys).forEach((key) => {
        keys[key] = false;
    });
    startScreen.hidden = false;
    document.body.dataset.gameScreen = 'menu';
    pageHeading.textContent = 'Lobby';
    gameHud.hidden = true;
    inventoryPanel.hidden = true;
    gameActions.hidden = true;
    info.hidden = true;
    botModeStatus.hidden = true;
    botVictoryLetter.hidden = true;
    startButton.focus();
});
resetGame();
gameState = 'menu';
gameHud.hidden = true;
inventoryPanel.hidden = true;
startButton.addEventListener('click', () => {
    currentFloor = 1;
    botMode = selectedGameMode === 'bot';
    setDevModeEnabled(selectedGameMode === 'dev');
    startScreen.hidden = true;
    document.body.dataset.gameScreen = 'playing';
    pageHeading.textContent = 'Masmorra';
    gameHud.hidden = false;
    inventoryPanel.hidden = true;
    gameActions.hidden = false;
    info.hidden = false;
    resetGame();
    if (botMode) {
        devMode = false;
        startBotMode();
    } else if (devMode) {
        botSpeedControls.hidden = true;
        stopBotButton.hidden = true;
        botModeStatus.hidden = true;
        selectDevTool(devTool);
        initializeDevLoadout();
        inventoryPanel.hidden = false;
        info.textContent = 'Modo Dev ativo: invulnerável, sem custo e atravessa paredes. Use o painel lateral para editar.';
    } else {
        botLearning = null;
        if (selectedGameMode === 'multiplayer') {
            setMultiplayerStatus(
                multiplayerConnected
                    ? 'Partida online iniciada.'
                    : 'Modo online local. Conecte-se a uma sala para ver outros jogadores.'
            );
        }
    }
});
shopCloseButton.addEventListener('click', () => setShopOpen(false));
shopAvailableOnlyFilter.addEventListener('change', updateShopHud);
document.getElementById('inventoryCloseButton').addEventListener('click', () => {
    inventoryPanel.hidden = true;
    canvas.focus();
});
scrollGalleryOpenButton.addEventListener('click', () => setScrollGalleryOpen(true));
scrollGalleryCloseButton.addEventListener('click', () => setScrollGalleryOpen(false));
for (const [type, button] of Object.entries(shopItems)) {
    button.addEventListener('click', () => showShopItemInformation(type));
}
shopItemPurchaseButton.addEventListener('click', () => {
    if (!selectedShopItemType) {
        return;
    }
    purchaseUpgrade(selectedShopItemType);
    showShopItemInformation(selectedShopItemType);
});
inventoryItems.addEventListener('click', (event) => {
    const recipeButton = event.target.closest('.crafting-recipe-button');
    if (recipeButton && inventoryItems.contains(recipeButton)) {
        if (craftMaterialRecipe(recipeButton.dataset.recipeId)) {
            const recipe = materialRecipeData.find((entry) => (
                entry.id === recipeButton.dataset.recipeId
            ));
            inventoryItemTitle.textContent = recipe.result.name;
            inventoryItemDescription.textContent = 'Item fabricado e armazenado. Ainda não possui efeito próprio.';
        } else {
            inventoryItemTitle.textContent = 'Materiais insuficientes';
            inventoryItemDescription.textContent = recipeButton.getAttribute('aria-label');
        }
        return;
    }
    const item = event.target.closest('.inventory-slot, .inventory-scroll-slot');
    if (item && inventoryItems.contains(item)) {
        showInventoryItemInformation(item);
    }
});
const inventoryTooltip = document.getElementById('inventoryTooltip');
document.body.append(inventoryTooltip);

function showInventoryTooltip(item) {
    const description = item.getAttribute('aria-label');
    if (!description) {
        inventoryTooltip.hidden = true;
        return;
    }
    inventoryTooltip.textContent = description;
    inventoryTooltip.hidden = false;
    const itemBounds = item.getBoundingClientRect();
    const tooltipBounds = inventoryTooltip.getBoundingClientRect();
    const horizontalPadding = 8;
    const left = Math.max(
        horizontalPadding,
        Math.min(
            itemBounds.left + (itemBounds.width - tooltipBounds.width) / 2,
            window.innerWidth - tooltipBounds.width - horizontalPadding
        )
    );
    const above = itemBounds.top - tooltipBounds.height - 6;
    const top = above >= horizontalPadding
        ? above
        : Math.min(itemBounds.bottom + 6, window.innerHeight - tooltipBounds.height - horizontalPadding);
    inventoryTooltip.style.left = `${left}px`;
    inventoryTooltip.style.top = `${Math.max(horizontalPadding, top)}px`;
}

inventoryItems.addEventListener('pointerover', (event) => {
    const item = event.target.closest('.inventory-slot[aria-label], .inventory-scroll-slot[aria-label]');
    if (item && inventoryItems.contains(item)
        && !item.contains(event.relatedTarget)) {
        showInventoryTooltip(item);
    }
});
inventoryItems.addEventListener('pointerout', (event) => {
    const item = event.target.closest('.inventory-slot[aria-label], .inventory-scroll-slot[aria-label]');
    if (item && inventoryItems.contains(item)
        && !item.contains(event.relatedTarget)) {
        inventoryTooltip.hidden = true;
    }
});
inventoryItems.addEventListener('focusin', (event) => {
    const item = event.target.closest('.inventory-slot[aria-label], .inventory-scroll-slot[aria-label]');
    if (item && inventoryItems.contains(item)) {
        showInventoryTooltip(item);
    }
});
inventoryItems.addEventListener('focusout', (event) => {
    if (!inventoryItems.contains(event.relatedTarget)
        || !event.relatedTarget.closest('.inventory-slot[aria-label], .inventory-scroll-slot[aria-label]')) {
        inventoryTooltip.hidden = true;
    }
});
inventoryItems.addEventListener('scroll', () => {
    inventoryTooltip.hidden = true;
});
window.addEventListener('resize', () => {
    inventoryTooltip.hidden = true;
});
shieldSlot.addEventListener('click', toggleShield);
spearSlot.addEventListener('click', () => {
    if (player.susanoActive) {
        useSusanoLifeSteal();
    } else {
        attackWithSpear();
    }
});
document.getElementById('selectSwordSpecial').addEventListener('click', () => {
    selectSpecialAbility('sword');
});
document.getElementById('selectConquestSpecial').addEventListener('click', () => {
    selectSpecialAbility('conquest');
});
document.getElementById('activateSpecialAbilityButton').addEventListener('click', () => {
    activateSelectedSpecialAbility();
});
humanModeButton.addEventListener('click', () => selectGameMode('human'));
botModeButton.addEventListener('click', () => selectGameMode('bot'));
devModeButton.addEventListener('click', () => selectGameMode('dev'));
for (const button of devToolButtons) {
    button.addEventListener('click', () => selectDevTool(button.dataset.devTool));
}
devPreviousFloorButton.addEventListener('click', () => changeDevFloor(-1));
devNextFloorButton.addEventListener('click', () => changeDevFloor(1));
devCreatureSelect.addEventListener('change', () => {
    devCreatureType = devCreatureSelect.value;
    const creature = creatureDataByType[devCreatureType];
    if (!creature) {
        throw new Error(`Criatura Dev desconhecida: ${devCreatureType}.`);
    }
    devToolStatus.textContent = `Selecionada: ${creature.name}.`;
});
stopBotButton.addEventListener('click', stopBotMode);
exportBotMemoryButton.addEventListener('click', () => {
    try {
        const downloadUrl = URL.createObjectURL(new Blob([exportBotMemory()], {
            type: 'application/json;charset=utf-8'
        }));
        const downloadLink = document.createElement('a');
        downloadLink.href = downloadUrl;
        downloadLink.download = 'masmorra-memoria-bot.json';
        downloadLink.click();
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
        botMemoryActionStatus.textContent = 'Arquivo de memória preparado para download.';
    } catch (error) {
        console.error('Não foi possível exportar a memória do Bot IA.', error);
        botMemoryActionStatus.textContent = `Falha ao exportar a memória: ${error.message}`;
    }
});
importBotMemoryButton.addEventListener('click', () => importBotMemoryFile.click());
importBotMemoryFile.addEventListener('change', () => {
    const file = importBotMemoryFile.files[0];
    if (!file) {
        return;
    }
    if (file.size > botMemoryMaxBytes) {
        botMemoryActionStatus.textContent = 'Falha ao importar: o arquivo excede o limite de 512 KiB.';
        importBotMemoryFile.value = '';
        importBotMemoryButton.focus();
        return;
    }
    if (!window.confirm('Importar esta memória substituirá o histórico atual do Bot IA. Continuar?')) {
        importBotMemoryFile.value = '';
        importBotMemoryButton.focus();
        return;
    }
    const reader = new FileReader();
    reader.onload = () => {
        try {
            importBotMemory(String(reader.result));
            botMemoryActionStatus.textContent = `Memória importada de ${file.name}.`;
        } catch (error) {
            console.error('Não foi possível importar a memória do Bot IA.', error);
            botMemoryActionStatus.textContent = `Falha ao importar a memória: ${error.message}`;
        } finally {
            importBotMemoryFile.value = '';
            importBotMemoryButton.focus();
        }
    };
    reader.onerror = () => {
        console.error('Não foi possível ler o arquivo de memória do Bot IA.', reader.error);
        botMemoryActionStatus.textContent = 'Falha ao ler o arquivo de memória escolhido.';
        importBotMemoryFile.value = '';
        importBotMemoryButton.focus();
    };
    reader.readAsText(file);
});
for (const button of botSpeedButtons) {
    button.addEventListener('click', () => {
        setBotSpeed(Number(button.dataset.botSpeed));
    });
}
botVictoryLetterClose.addEventListener('click', () => {
    botVictoryLetter.hidden = true;
    restartBtn.focus();
});
botVictoryLetterCopy.addEventListener('click', async () => {
    if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
        botVictoryLetterStatus.textContent = 'A cópia não está disponível neste contexto. Use “Baixar carta”.';
        return;
    }
    try {
        await navigator.clipboard.writeText(botVictoryLetterBody.textContent);
        botVictoryLetterStatus.textContent = 'Carta copiada para a área de transferência.';
    } catch (error) {
        console.error('Não foi possível copiar a carta do Bot IA.', error);
        botVictoryLetterStatus.textContent = 'Não foi possível copiar a carta. Use “Baixar carta”.';
    }
});
botVictoryLetterDownload.addEventListener('click', () => {
    const blob = new Blob([botVictoryLetterBody.textContent], {
        type: 'text/plain;charset=utf-8'
    });
    const downloadUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = downloadUrl;
    downloadLink.download = 'carta-analise-masmorra.txt';
    downloadLink.click();
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
    botVictoryLetterStatus.textContent = 'Carta baixada como carta-analise-masmorra.txt.';
});
bowSlot.addEventListener('click', () => {
    if (bowOwned && !botMode) {
        selectPlayerWeapon('bow');
        info.textContent = 'Arco equipado. Mire com o mouse e clique na masmorra para disparar.';
    }
});
const selectCharacter = (character) => {
    selectedCharacter = character;
    const isManSelected = character === 'man';
    manTab.setAttribute('aria-selected', String(isManSelected));
    manTab.tabIndex = isManSelected ? 0 : -1;
    womanTab.setAttribute('aria-selected', String(!isManSelected));
    womanTab.tabIndex = isManSelected ? -1 : 0;
};
manTab.addEventListener('click', () => selectCharacter('man'));
womanTab.addEventListener('click', () => selectCharacter('woman'));
for (const [tab, character] of [[manTab, 'man'], [womanTab, 'woman']]) {
    tab.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            const nextCharacter = character === 'man' ? 'woman' : 'man';
            selectCharacter(nextCharacter);
            (nextCharacter === 'man' ? manTab : womanTab).focus();
        }
    });
}
swordSlot.addEventListener('click', () => {
    if (!botMode) {
        selectPlayerWeapon('sword');
        info.textContent = 'Espada equipada. Pressione Espaço perto de um inimigo para atacar.';
    }
});
requestAnimationFrame(loop);
