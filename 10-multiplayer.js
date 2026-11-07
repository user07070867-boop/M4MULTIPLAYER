const remotePlayers = new Map();
let remoteWorld = null;
let multiplayerSocket = null;
let multiplayerConnected = false;
let multiplayerJoining = false;
let multiplayerClientId = null;
let multiplayerSendTimer = 0;
let applyingRemoteMultiplayerDamage = false;
const multiplayerModeButton = document.getElementById('multiplayerModeButton');
const multiplayerPanel = document.getElementById('multiplayerPanel');
const multiplayerServerUrl = document.getElementById('multiplayerServerUrl');
const multiplayerRoomCode = document.getElementById('multiplayerRoomCode');
const multiplayerConnectButton = document.getElementById('multiplayerConnectButton');
const multiplayerStatus = document.getElementById('multiplayerStatus');
if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
    const socketProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    multiplayerServerUrl.value = `${socketProtocol}//${window.location.host}`;
}
function setMultiplayerStatus(message, isError = false) {
    multiplayerStatus.textContent = message;
    multiplayerStatus.dataset.state = isError ? 'error' : 'normal';
}

function sendMultiplayerMessage(message) {
    if (multiplayerSocket && multiplayerSocket.readyState === WebSocket.OPEN) {
        multiplayerSocket.send(JSON.stringify(message));
    }
}

function disconnectMultiplayer() {
    if (multiplayerSocket) {
        multiplayerSocket.close();
        multiplayerSocket = null;
    }
    remotePlayers.clear();
    remoteWorld = null;
    multiplayerConnected = false;
    multiplayerJoining = false;
    multiplayerClientId = null;
    multiplayerConnectButton.textContent = 'Conectar à sala';
    setMultiplayerStatus('Desconectado');
}

function connectMultiplayer() {
    const url = multiplayerServerUrl.value.trim();
    const room = multiplayerRoomCode.value.trim();
    if (!/^wss?:\/\/.+/.test(url) || !/^[A-Za-z0-9_-]{1,24}$/.test(room)) {
        setMultiplayerStatus('Informe um servidor e uma sala válidos.', true);
        return;
    }
    if (typeof WebSocket === 'undefined') {
        setMultiplayerStatus('Este navegador não oferece WebSocket.', true);
        return;
    }
    disconnectMultiplayer();
    multiplayerJoining = true;
    setMultiplayerStatus('Conectando...');
    try {
        multiplayerSocket = new WebSocket(url);
    } catch (error) {
        setMultiplayerStatus(`Falha ao conectar: ${error.message}`, true);
        return;
    }
    multiplayerSocket.addEventListener('open', () => {
        sendMultiplayerMessage({ type: 'join', room });
        setMultiplayerStatus(`Entrando na sala ${room}...`);
    });
    multiplayerSocket.addEventListener('message', (event) => {
        let message;
        try {
            message = JSON.parse(event.data);
        } catch {
            setMultiplayerStatus('O servidor enviou uma mensagem inválida.', true);
            return;
        }
        if (message.type === 'welcome') {
            multiplayerClientId = message.clientId;
        } else if (message.type === 'snapshot' && Array.isArray(message.players)) {
            multiplayerJoining = false;
            multiplayerConnected = true;
            multiplayerConnectButton.textContent = 'Desconectar';
            setMultiplayerStatus('Conectado à sala.');
            if (Number.isInteger(message.floor)
                && message.floor >= 1 && message.floor <= finalFloor
                && message.floor !== currentFloor) {
                currentFloor = message.floor;
                if (gameState === 'playing') {
                    resetGame(true, true);
                }
            }
            if (message.portalUnlocked === true && message.floor === currentFloor) {
                applyRemoteFloorCleared({ floor: currentFloor });
            }
            remotePlayers.clear();
            for (const remote of message.players) {
                if (remote.id !== multiplayerClientId
                    && remote.floor === currentFloor
                    && Number.isFinite(remote.x) && Number.isFinite(remote.y)) {
                    remotePlayers.set(remote.id, remote);
                }
            }
            remoteWorld = message.world && message.world.floor === currentFloor
                ? message.world
                : null;
            applyRemoteWorldDrops(remoteWorld);
        } else if (message.type === 'error') {
            setMultiplayerStatus(message.message || 'Erro do servidor.', true);
            multiplayerConnected = false;
            multiplayerJoining = false;
            multiplayerConnectButton.textContent = 'Conectar à sala';
            if (multiplayerSocket) {
                multiplayerSocket.close();
            }
        } else if (message.type === 'damage') {
            applyRemoteMultiplayerDamage(message);
        } else if (message.type === 'defeat') {
            applyRemoteMultiplayerDefeat(message);
        } else if (message.type === 'floor-cleared') {
            applyRemoteFloorCleared(message);
        } else if (message.type === 'floor-advance') {
            applyRemoteFloorAdvance(message);
        } else if (message.type === 'drop-claimed') {
            removeRemoteDrop(message.dropId);
        } else if (message.type === 'progress-ack') {
            applyMultiplayerProgress(message.progress);
        }
    });
    multiplayerSocket.addEventListener('close', () => {
        if (multiplayerConnected) {
            setMultiplayerStatus('Conexão encerrada.', true);
        }
        multiplayerConnected = false;
        multiplayerJoining = false;
        multiplayerConnectButton.textContent = 'Conectar à sala';
        remotePlayers.clear();
        remoteWorld = null;
    });
    multiplayerSocket.addEventListener('error', () => {
        setMultiplayerStatus('Não foi possível acessar o servidor multiplayer.', true);
    });
}

function sendMultiplayerAttack(enemy, damage) {
    if (!multiplayerConnected || applyingRemoteMultiplayerDamage) {
        return;
    }
    const enemyIndex = enemies.indexOf(enemy);
    if (enemyIndex < 0) {
        return;
    }
    enemy.multiplayerId = enemy.multiplayerId || `${currentFloor}-${enemyIndex}`;
    sendMultiplayerMessage({
        type: 'attack',
        floor: currentFloor,
        enemyId: enemy.multiplayerId,
        damage
    });
}

function applyRemoteMultiplayerDamage(message) {
    if (message.floor !== currentFloor || !Number.isFinite(message.damage)) {
        return;
    }
    const enemy = enemies.find((candidate, index) => (
        (candidate.multiplayerId || `${currentFloor}-${index}`) === message.enemyId
    ));
    if (!enemy || enemy.health <= 0) {
        return;
    }
    applyingRemoteMultiplayerDamage = true;
    try {
        enemy.health = Number.isFinite(message.health)
            ? Math.max(0, Math.min(enemy.maxHealth, message.health))
            : Math.max(0, enemy.health - message.damage);
        enemy.displayHealth = Math.min(enemy.displayHealth, enemy.health);
        if (enemy.health === 0) {
            enemy.dying = true;
            enemy.deathTimer = 0;
        }
    } finally {
        applyingRemoteMultiplayerDamage = false;
    }
}

function sendMultiplayerDefeat(enemy) {
    if (!multiplayerConnected || applyingRemoteMultiplayerDamage) {
        return;
    }
    const enemyIndex = enemies.indexOf(enemy);
    if (enemyIndex < 0) {
        return;
    }
    enemy.multiplayerId = enemy.multiplayerId || `${currentFloor}-${enemyIndex}`;
    sendMultiplayerMessage({
        type: 'defeat',
        floor: currentFloor,
        enemyId: enemy.multiplayerId
    });
}

function applyRemoteMultiplayerDefeat(message) {
    if (message.floor !== currentFloor) {
        return;
    }
    const enemy = enemies.find((candidate, index) => (
        (candidate.multiplayerId || `${currentFloor}-${index}`) === message.enemyId
    ));
    if (enemy) {
        enemy.health = 0;
        enemy.dying = true;
        enemy.deathTimer = 0;
    }
}

function sendMultiplayerFloorCleared() {
    if (multiplayerConnected) {
        sendMultiplayerMessage({
            type: 'floor-cleared',
            floor: currentFloor
        });
    }
}

function applyRemoteFloorCleared(message) {
    if (message.floor !== currentFloor) {
        return;
    }
    portalUnlocked = true;
    gameHud.dataset.portal = 'true';
    questText.textContent = 'Portal do andar liberado';
}

function sendMultiplayerFloorAdvance(floor) {
    if (multiplayerConnected) {
        sendMultiplayerMessage({
            type: 'floor-advance',
            floor
        });
    }
}

function applyRemoteFloorAdvance(message) {
    if (!Number.isInteger(message.floor)
        || message.floor <= currentFloor
        || message.floor > finalFloor) {
        return;
    }
    currentFloor = message.floor;
    resetGame(true, true);
    setMultiplayerStatus(`A sala avançou para o andar ${currentFloor}.`);
}

function getMultiplayerDropId(drop, kind) {
    if (!drop.multiplayerId) {
        const x = Math.round(drop.x);
        const y = Math.round(drop.y);
        const detail = kind === 'ore'
            ? drop.ore.id
            : drop.type === 'material'
                ? drop.materialId
                : drop.type === 'scroll' ? `scroll-${drop.scroll.id}`
                    : drop.type === 'potion' ? `potion-${drop.rarity.id}` : drop.type;
        const quantity = drop.type === 'material' || drop.type === 'arrows'
            ? drop.quantity : 1;
        drop.multiplayerId = `${currentFloor}:${kind}:${x}:${y}:${detail}:${quantity}`;
    }
    return drop.multiplayerId;
}

function claimMultiplayerDrop(drop, kind) {
    if (multiplayerConnected) {
        sendMultiplayerMessage({
            type: 'claim-drop',
            dropId: getMultiplayerDropId(drop, kind)
        });
    }
}

function removeRemoteDrop(dropId) {
    oreDrops = oreDrops.filter((drop) => (
        getMultiplayerDropId(drop, 'ore') !== dropId
    ));
    itemDrops = itemDrops.filter((drop) => (
        getMultiplayerDropId(drop, 'item') !== dropId
    ));
}

function applyRemoteWorldDrops(world) {
    if (!world || !Array.isArray(world.drops)) {
        return;
    }
    const nextOreDrops = [];
    const nextItemDrops = [];
    for (const entry of world.drops) {
        const [floorText, kind, xText, yText, detail, quantityText] = entry.id.split(':');
        if (Number(floorText) !== currentFloor) {
            continue;
        }
        const x = Number(xText);
        const y = Number(yText);
        const quantity = Math.max(1, Number(quantityText) || 1);
        if (!Number.isFinite(x) || !Number.isFinite(y)) {
            continue;
        }
        if (kind === 'ore') {
            const ore = oreTypes.find((candidate) => candidate.id === detail);
            if (ore) {
                nextOreDrops.push({ x, y, ore, animTime: 0 });
            }
            continue;
        }
        if (kind !== 'item') {
            continue;
        }
        if (detail === 'arrows') {
            nextItemDrops.push({ x, y, type: 'arrows', quantity, animTime: 0 });
        } else if (detail.startsWith('scroll-')) {
            const scroll = scrollTypes.find((candidate) => candidate.id === detail.slice(7));
            if (scroll) {
                nextItemDrops.push({ x, y, type: 'scroll', scroll, animTime: 0 });
            }
        } else if (detail.startsWith('potion-')) {
            const rarity = itemRarities.find((candidate) => candidate.id === detail.slice(7));
            if (rarity) {
                nextItemDrops.push({ x, y, type: 'potion', rarity, animTime: 0 });
            }
        } else if (creatureMaterialDataById[detail]) {
            nextItemDrops.push({
                x, y, type: 'material', materialId: detail, quantity, animTime: 0
            });
        }
    }
    oreDrops = nextOreDrops;
    itemDrops = nextItemDrops;
}

function applyMultiplayerProgress(progress) {
    if (!progress || !playerProgress) {
        return;
    }
    playerProgress.level = progress.level;
    playerProgress.xp = progress.xp;
    playerProgress.xpToNext = progress.xpToNext;
    playerProgress.skillPoints = progress.skillPoints;
    playerProgress.attributes = { ...progress.attributes };
    for (const [ore, amount] of Object.entries(progress.currencies || {})) {
        if (Object.prototype.hasOwnProperty.call(oreCoinBalance, ore)) {
            oreCoinBalance[ore] = amount;
        }
    }
    for (const [scroll, amount] of Object.entries(progress.scrolls || {})) {
        if (Object.prototype.hasOwnProperty.call(scrollInventory, scroll)) {
            scrollInventory[scroll] = amount;
        }
    }
    if (Number.isFinite(progress.arrows)) {
        arrowAmmo = Math.min(GAME_BALANCE.bow.maxAmmo, progress.arrows);
    }
    if (progress.materials) {
        collectedMaterials = { ...progress.materials };
        updateMaterialInventoryHud();
    }
    if (progress.potions) {
        healingPotions = Object.entries(progress.potions).flatMap(([rarityId, amount]) => {
            const rarity = itemRarities.find((candidate) => candidate.id === rarityId);
            return rarity ? Array.from({ length: amount }, () => ({ type: 'potion', rarity })) : [];
        }).slice(0, GAME_BALANCE.economy.potionCapacity);
        updatePotionHud();
    }
    updateProgressHud();
    updateOreCoinHud();
}

function updateMultiplayer(delta) {
    if (!multiplayerConnected || !player || gameState !== 'playing') {
        return;
    }
    multiplayerSendTimer -= delta;
    if (multiplayerSendTimer > 0) {
        return;
    }
    multiplayerSendTimer = 0.05;
    sendMultiplayerMessage({
        type: 'state',
        x: player.x,
        y: player.y,
        floor: currentFloor,
        character: selectedCharacter,
        progress: {
            ...playerProgress,
            attributes: { ...playerProgress.attributes },
            currencies: { ...oreCoinBalance }
            ,
            materials: { ...collectedMaterials }
        },
        world: {
            floor: currentFloor,
            enemies: enemies.slice(0, 100).map((enemy, index) => ({
                id: enemy.multiplayerId || (enemy.multiplayerId = `${currentFloor}-${index}`),
                x: enemy.x,
                y: enemy.y,
                size: enemy.size,
                health: enemy.health,
                maxHealth: enemy.maxHealth,
                creatureType: enemy.creatureType,
                isBoss: Boolean(enemy.isBoss),
                dying: Boolean(enemy.dying)
            })),
            drops: [
                ...oreDrops.map((drop) => ({
                    id: getMultiplayerDropId(drop, 'ore')
                })),
                ...itemDrops.map((drop) => ({
                    id: getMultiplayerDropId(drop, 'item')
                }))
            ]
        }
    });
}

function drawRemotePlayers() {
    for (const remote of remotePlayers.values()) {
        ctx.save();
        ctx.fillStyle = '#55d6be';
        ctx.strokeStyle = '#102a43';
        ctx.lineWidth = 1;
        ctx.fillRect(remote.x, remote.y, playerCollisionWidth, playerCollisionHeight);
        ctx.strokeRect(remote.x, remote.y, playerCollisionWidth, playerCollisionHeight);
        ctx.fillStyle = '#e6fffa';
        ctx.font = '5px monospace';
        ctx.fillText('jogador', remote.x - 3, remote.y - 3);
        ctx.restore();
    }

}

function drawRemoteWorld() {
    if (!remoteWorld || remoteWorld.floor !== currentFloor) {
    return;
    }
    for (const enemy of remoteWorld.enemies || []) {
    const hasLocalEnemy = enemies.some((localEnemy, index) => (
        (localEnemy.multiplayerId || `${currentFloor}-${index}`) === enemy.id
    ));
    if (hasLocalEnemy) {
        continue;
    }
    if (enemy.dying || enemy.health <= 0) {
        continue;
    }
    ctx.save();
    ctx.fillStyle = enemy.isBoss ? '#ef7d57' : '#c084fc';
    ctx.fillRect(enemy.x, enemy.y, enemy.size || tileSize, enemy.size || tileSize);
    ctx.fillStyle = '#111827';
    ctx.fillRect(enemy.x, enemy.y - 3, enemy.size || tileSize, 2);
    ctx.fillStyle = '#86efac';
    ctx.fillRect(
        enemy.x,
        enemy.y - 3,
        (enemy.size || tileSize) * Math.max(0, enemy.health / enemy.maxHealth),
        2
    );
    ctx.restore();
    }
}

multiplayerModeButton.addEventListener('click', () => {
    selectGameMode('multiplayer');
    multiplayerPanel.hidden = false;
});
multiplayerConnectButton.addEventListener('click', () => {
    if (multiplayerConnected || multiplayerJoining) {
        disconnectMultiplayer();
    } else {
        connectMultiplayer();
    }
});
