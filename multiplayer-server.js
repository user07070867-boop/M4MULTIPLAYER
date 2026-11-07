const http = require('node:http');
const https = require('node:https');
const fs = require('node:fs');
const crypto = require('node:crypto');
const { WebSocketServer } = require('ws');

const host = process.env.HOST || '0.0.0.0';
const port = Number(process.env.PORT || 8080);
const tlsCertificatePath = process.env.TLS_CERT;
const tlsKeyPath = process.env.TLS_KEY;
if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT precisa ser um numero inteiro entre 1 e 65535.');
}
if (Boolean(tlsCertificatePath) !== Boolean(tlsKeyPath)) {
    throw new Error('TLS_CERT e TLS_KEY precisam ser informados juntos.');
}
const rooms = new Map();
const maxRoomPlayers = 4;
const attackIntervalMs = 120;
const maxWorldEnemies = 100;

function send(socket, message) {
    if (socket.readyState === 1) {
        socket.send(JSON.stringify(message));
    }
}

function roomPlayers(room) {
    return Array.from(room.values()).map((client) => ({
        id: client.id,
        x: client.x,
        y: client.y,
        floor: client.floor,
        character: client.character
    }));
}

function broadcast(room) {
    const host = room.values().next().value;
    const snapshot = {
        type: 'snapshot',
        floor: room.floor,
        portalUnlocked: Boolean(room.portalUnlocked),
        players: roomPlayers(room),
        world: host ? host.world : null
    };
    for (const client of room.values()) {
        send(client.socket, snapshot);
    }
}

function sendProgress(client) {
    send(client.socket, { type: 'progress-ack', progress: client.progress });
}

function grantExperience(client, amount) {
    const progress = client.progress;
    progress.xp += amount;
    while (progress.xp >= progress.xpToNext) {
        progress.xp -= progress.xpToNext;
        progress.level = Math.min(100, progress.level + 1);
        progress.xpToNext = Math.min(1000000, progress.xpToNext + 50);
        progress.skillPoints = Math.min(100, progress.skillPoints + 1);
        if (progress.level <= 20 && progress.level % 5 === 0) {
            progress.skillPoints = Math.min(100, progress.skillPoints + 1);
        }
    }
    sendProgress(client);
}

function broadcastToOthers(room, senderId, message) {
    for (const client of room.values()) {
        if (client.id !== senderId) {
            send(client.socket, message);
        }
    }
}

function broadcastToRoom(room, message) {
    for (const client of room.values()) {
        send(client.socket, message);
    }
}

function broadcastFloorAdvance(room, floor) {
    if (floor !== room.floor + 1) {
        return;
    }
    room.floor = floor;
    room.portalUnlocked = false;
    for (const client of room.values()) {
        client.floor = floor;
        client.world = null;
    }
    broadcastToRoom(room, { type: 'floor-advance', floor });
}

function sanitizeWorld(world) {
    if (!world || !Number.isInteger(world.floor) || !Array.isArray(world.enemies)) {
        return null;
    }
    return {
        floor: Math.max(1, Math.min(20, world.floor)),
        enemies: world.enemies.slice(0, maxWorldEnemies).flatMap((enemy) => {
            if (
                !enemy || typeof enemy.id !== 'string' || enemy.id.length > 80
                || !Number.isFinite(enemy.x) || !Number.isFinite(enemy.y)
                || !Number.isFinite(enemy.health) || !Number.isFinite(enemy.maxHealth)
                || enemy.maxHealth <= 0
            ) {
                return [];
            }
            return [{
                id: enemy.id,
                x: Math.max(0, Math.min(100000, enemy.x)),
                y: Math.max(0, Math.min(100000, enemy.y)),
                size: Math.max(1, Math.min(128, Number(enemy.size) || 16)),
                health: Math.max(0, Math.min(enemy.maxHealth, enemy.health)),
                maxHealth: Math.min(100000, enemy.maxHealth),
                creatureType: typeof enemy.creatureType === 'string'
                    ? enemy.creatureType.slice(0, 40) : 'unknown',
                isBoss: Boolean(enemy.isBoss),
                dying: Boolean(enemy.dying)
            }];
        }),
        drops: Array.isArray(world.drops)
            ? world.drops.slice(0, 300).flatMap((drop) => (
                drop && typeof drop.id === 'string' && drop.id.length <= 120
                    ? [{ id: drop.id }]
                    : []
            ))
            : []
    };
}

function sanitizeProgress(progress) {
    if (!progress || typeof progress !== 'object') {
        progress = {};
    }
    const attributes = progress.attributes || {};
    const currencies = progress.currencies || {};
    const materials = progress.materials || {};
    const scrolls = progress.scrolls || {};
    const potions = progress.potions || {};
    const sanitizedMaterials = {};
    for (const [id, quantity] of Object.entries(materials)) {
        if (/^[A-Za-z0-9_-]{1,48}$/.test(id) && Number.isFinite(Number(quantity))) {
            sanitizedMaterials[id] = Math.max(0, Math.min(1000000, Math.floor(Number(quantity))));
        }
    }
    const sanitizedScrolls = {};
    for (const [id, quantity] of Object.entries(scrolls)) {
        if (/^[A-Za-z0-9_-]{1,48}$/.test(id) && Number.isFinite(Number(quantity))) {
            sanitizedScrolls[id] = Math.max(0, Math.min(1000000, Math.floor(Number(quantity))));
        }
    }
    const sanitizedPotions = {};
    for (const [id, quantity] of Object.entries(potions)) {
        if (/^[A-Za-z0-9_-]{1,48}$/.test(id) && Number.isFinite(Number(quantity))) {
            sanitizedPotions[id] = Math.max(0, Math.min(1000, Math.floor(Number(quantity))));
        }
    }
    return {
        level: Math.max(1, Math.min(100, Math.floor(Number(progress.level) || 1))),
        xp: Math.max(0, Math.min(1000000, Math.floor(Number(progress.xp) || 0))),
        xpToNext: Math.max(1, Math.min(1000000, Math.floor(Number(progress.xpToNext) || 100))),
        skillPoints: Math.max(0, Math.min(100, Math.floor(Number(progress.skillPoints) || 0))),
        attributes: {
            health: Math.max(0, Math.min(100, Math.floor(Number(attributes.health) || 0))),
            meleeDamage: Math.max(0, Math.min(100, Math.floor(Number(attributes.meleeDamage) || 0))),
            aim: Math.max(0, Math.min(100, Math.floor(Number(attributes.aim) || 0)))
        },
        currencies: {
            copper: Math.max(0, Math.min(1000000, Math.floor(Number(currencies.copper) || 0))),
            silver: Math.max(0, Math.min(1000000, Math.floor(Number(currencies.silver) || 0))),
            emerald: Math.max(0, Math.min(1000000, Math.floor(Number(currencies.emerald) || 0))),
            ruby: Math.max(0, Math.min(1000000, Math.floor(Number(currencies.ruby) || 0))),
            gold: Math.max(0, Math.min(1000000, Math.floor(Number(currencies.gold) || 0)))
        },
        materials: sanitizedMaterials,
        scrolls: sanitizedScrolls,
        arrows: Math.max(0, Math.min(1000000, Math.floor(Number(progress.arrows) || 0))),
        potions: sanitizedPotions
    };
}

function mergeAuthoritativeWorld(previousWorld, nextWorld) {
    if (!previousWorld || previousWorld.floor !== nextWorld.floor) {
        return nextWorld;
    }
    const previousById = new Map(previousWorld.enemies.map((enemy) => [enemy.id, enemy]));
    const nextById = new Map(nextWorld.enemies.map((enemy) => [enemy.id, enemy]));
    for (const previous of previousWorld.enemies) {
        if (!nextById.has(previous.id) && previous.health > 0) {
            nextWorld.enemies.push(previous);
        }
    }
    return {
        ...nextWorld,
        enemies: nextWorld.enemies.map((enemy) => {
            const previous = previousById.get(enemy.id);
            return previous
                ? { ...enemy, health: previous.health, dying: previous.dying }
                : enemy;
        })
    };
}

function claimRoomDrop(room, senderId, dropId) {
    if (!room.claimedDrops) {
        room.claimedDrops = new Set();
    }
    if (room.claimedDrops.has(dropId)) {
        return false;
    }
    const client = room.get(senderId);
    if (client) {
        const host = room.values().next().value;
        const availableDrops = host && host.world && Array.isArray(host.world.drops)
            ? host.world.drops : [];
        const dropIndex = availableDrops.findIndex((drop) => drop.id === dropId);
        if (dropIndex < 0) {
            return false;
        }
        room.claimedDrops.add(dropId);
        const [floorText, kind, , , detail, quantityText] = dropId.split(':');
        const floor = Number(floorText);
        const quantity = Math.max(1, Math.min(100, Number(quantityText) || 1));
        if (floor === room.floor && kind === 'ore'
            && Object.prototype.hasOwnProperty.call(client.progress.currencies, detail)) {
            client.progress.currencies[detail] += 1;
        } else if (floor === room.floor && kind === 'item') {
            if (detail === 'arrows') {
                client.progress.arrows += quantity;
            } else if (typeof detail === 'string' && detail.startsWith('scroll-')) {
                const scrollId = detail.slice('scroll-'.length);
                client.progress.scrolls[scrollId] = (client.progress.scrolls[scrollId] || 0) + 1;
            } else if (typeof detail === 'string' && detail.startsWith('potion-')) {
                const rarityId = detail.slice('potion-'.length);
                client.progress.potions[rarityId] = (client.progress.potions[rarityId] || 0) + 1;
            } else if (/^[A-Za-z0-9_-]{1,48}$/.test(detail)) {
                client.progress.materials[detail] = (client.progress.materials[detail] || 0) + quantity;
            }
        }
        availableDrops.splice(dropIndex, 1);
        sendProgress(client);
    } else {
        return false;
    }
    broadcastToOthers(room, senderId, {
        type: 'drop-claimed',
        dropId
    });
    return true;
}

const serverOptions = tlsCertificatePath && tlsKeyPath
    ? {
        cert: fs.readFileSync(tlsCertificatePath),
        key: fs.readFileSync(tlsKeyPath)
    }
    : undefined;
const healthServer = serverOptions
    ? https.createServer(serverOptions, healthHandler)
    : http.createServer(healthHandler);

function healthHandler(request, response) {
    if (request.url === '/health') {
        response.writeHead(200, { 'content-type': 'application/json' });
        response.end(JSON.stringify({ ok: true, rooms: rooms.size }));
        return;
    }
    response.writeHead(404);
    response.end('Not found');
}

const webSocketServer = new WebSocketServer({ server: healthServer });
webSocketServer.on('connection', (socket) => {
    const client = {
        socket,
        id: crypto.randomUUID(),
        room: null,
        x: 0,
        y: 0,
        floor: 1,
        character: 'man',
        world: null,
        progress: sanitizeProgress(null),
        progressInitialized: false,
        lastAttackAt: 0
    };

    send(socket, { type: 'welcome', clientId: client.id });
    socket.on('message', (rawMessage) => {
        let message;
        try {
            message = JSON.parse(rawMessage.toString());
        } catch {
            send(socket, { type: 'error', message: 'Mensagem JSON inválida.' });
            return;
        }

        if (message.type === 'join') {
            if (!/^[A-Za-z0-9_-]{1,24}$/.test(message.room)) {
                send(socket, { type: 'error', message: 'Nome de sala inválido.' });
                return;
            }
            const previousRoom = client.room;
            const room = rooms.get(message.room) || new Map();
            if (room.size >= maxRoomPlayers && !room.has(client.id)) {
                send(socket, { type: 'error', message: 'A sala está cheia.' });
                return;
            }
            if (previousRoom && previousRoom !== room) {
                previousRoom.delete(client.id);
                if (previousRoom.size === 0) {
                    for (const [name, candidate] of rooms) {
                        if (candidate === previousRoom) {
                            rooms.delete(name);
                            break;
                        }
                    }
                } else {
                    broadcast(previousRoom);
                }
            }
            if (!room.defeated) {
                room.defeated = new Set();
            }
            if (!room.claimedDrops) {
                room.claimedDrops = new Set();
            }
            if (!Number.isInteger(room.floor)) {
                room.floor = 1;
            }
            if (typeof room.portalUnlocked !== 'boolean') {
                room.portalUnlocked = false;
            }
            client.room = room;
            client.floor = room.floor;
            room.set(client.id, client);
            rooms.set(message.room, room);
            broadcast(room);
            return;
        }

        if (message.type === 'state' && client.room
            && Number.isFinite(message.x) && Number.isFinite(message.y)) {
            client.x = Math.max(0, Math.min(100000, message.x));
            client.y = Math.max(0, Math.min(100000, message.y));
            client.floor = client.room.floor;
            client.character = message.character === 'woman' ? 'woman' : 'man';
            sendProgress(client);
            if (client === client.room.values().next().value
                && message.world && message.world.floor === client.room.floor) {
                const sanitizedWorld = sanitizeWorld(message.world);
                if (sanitizedWorld) {
                    client.world = mergeAuthoritativeWorld(client.world, sanitizedWorld);
                }
            }
            broadcast(client.room);
            return;
        }

        if (message.type === 'attack' && client.room
            && Number.isInteger(message.floor)
            && message.floor === client.room.floor
            && typeof message.enemyId === 'string'
            && message.enemyId.length > 0 && message.enemyId.length <= 80
            && Number.isFinite(message.damage)
            && message.damage > 0
            && message.damage <= 100) {
            const host = client.room.values().next().value;
            const world = host && host.world;
            const enemy = world && world.floor === message.floor
                ? world.enemies.find((candidate) => candidate.id === message.enemyId)
                : null;
            if (!enemy || enemy.health <= 0) {
                return;
            }
            if (Date.now() - client.lastAttackAt < attackIntervalMs) {
                send(socket, {
                    type: 'damage',
                    floor: message.floor,
                    enemyId: message.enemyId,
                    damage: 0,
                    health: enemy.health,
                    attackerId: client.id
                });
                return;
            }
            client.lastAttackAt = Date.now();
            const damage = Math.min(Math.floor(message.damage), enemy.health);
            enemy.health = Math.max(0, enemy.health - damage);
            enemy.dying = enemy.health === 0;
            broadcastToRoom(client.room, {
                type: 'damage',
                floor: message.floor,
                enemyId: message.enemyId,
                damage,
                health: enemy.health,
                attackerId: client.id
            });
            return;
        }

        if (message.type === 'defeat' && client.room
            && Number.isInteger(message.floor)
            && message.floor === client.room.floor
            && typeof message.enemyId === 'string'
            && message.enemyId.length > 0 && message.enemyId.length <= 80) {
            const key = `${message.floor}:${message.enemyId}`;
            const host = client.room.values().next().value;
            const enemy = host && host.world && host.world.floor === message.floor
                ? host.world.enemies.find((candidate) => candidate.id === message.enemyId)
                : null;
            if (!enemy || enemy.health > 0) {
                return;
            }
            if (client.room.defeated && client.room.defeated.has(key)) {
                return;
            }
            if (!client.room.defeated) {
                client.room.defeated = new Set();
            }
            client.room.defeated.add(key);
            for (const roomClient of client.room.values()) {
                grantExperience(roomClient, enemy.isBoss ? 100 : 25);
            }
            broadcastToOthers(client.room, client.id, {
                type: 'defeat',
                floor: message.floor,
                enemyId: message.enemyId
            });
            return;
        }

        if (message.type === 'floor-cleared' && client.room
            && Number.isInteger(message.floor)
            && message.floor === client.room.floor) {
            client.room.portalUnlocked = true;
            broadcastToRoom(client.room, {
                type: 'floor-cleared',
                floor: message.floor
            });
            return;
        }

        if (message.type === 'floor-advance' && client.room
            && Number.isInteger(message.floor)
            && message.floor === client.room.floor + 1
            && message.floor >= 2 && message.floor <= 20) {
            broadcastFloorAdvance(client.room, message.floor);
            return;
        }

        if (message.type === 'claim-drop' && client.room
            && typeof message.dropId === 'string'
            && message.dropId.length > 0 && message.dropId.length <= 120) {
            claimRoomDrop(client.room, client.id, message.dropId);
            return;
        }
    });

    socket.on('close', () => {
        if (!client.room) {
            return;
        }

        const room = client.room;
        room.delete(client.id);
        client.room = null;
        if (room.size === 0) {
            for (const [name, candidate] of rooms) {
                if (candidate === room) {
                    rooms.delete(name);
                    break;
                }
            }
        } else {
            broadcast(room);
        }
    });
});

healthServer.listen(port, host, () => {
    const protocol = serverOptions ? 'wss' : 'ws';
    console.log(`Servidor multiplayer ouvindo em ${protocol}://${host}:${port}.`);
});
