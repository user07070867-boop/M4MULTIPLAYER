const ogreSlamRadius = 28;
const ogreSlamDamageMultiplier = 2;
const bossWeaknessThreshold = GAME_BALANCE.bosses.weaknessAttackThreshold;
const bossMeleeBlockChance = GAME_BALANCE.bosses.meleeBlockChance;
const bossArrowBlockChance = GAME_BALANCE.bosses.arrowBlockChance;
const susanoAuraRadius = 112;
const susanoAttackRange = 72;
const susanoFearDamage = 5;
const goblinDeathAnimationDuration = 0.6;
const spiderDeathAnimationDuration = 0.9;

function scaleBossAttackDamage(boss, baseDamage) {
    return Math.max(1, Math.round(baseDamage * (boss.damageMultiplier || 1)));
}

function recordBossAttack(boss) {
    boss.bossAttackCount += 1;
    if (boss.bossAttackCount < bossWeaknessThreshold) {
        return;
    }
    boss.bossAttackCount = 0;
    boss.weaknessTimer = boss.phaseThree
        ? GAME_BALANCE.bosses.finalPhaseWeaknessSeconds
        : boss.phaseTwo
            ? GAME_BALANCE.bosses.phaseTwoWeaknessSeconds
            : GAME_BALANCE.bosses.phaseOneWeaknessSeconds;
    boss.attackTimer = 0;
    const bossName = boss.bossType === 'dragon'
        ? 'dragão'
        : boss.bossType === 'grimReaper' ? 'ceifador'
            : boss.bossType === 'throneGuardian' ? 'Guardião do Trono' : 'golem';
    info.textContent = `O ${bossName} ficou vulnerável! Ataque agora!`;
}

function enterBossPhaseTwo(boss) {
    if (
        !boss.isBoss
        || boss.health > 0
        || boss.phaseThree
        || (boss.phaseTwo && (
            !boss.finalBoss || GAME_BALANCE.bosses.finalPhaseCount < 3
        ))
    ) {
        return false;
    }

    const enteringFinalPhase = boss.phaseTwo;
    boss.phaseTwo = true;
    boss.phaseThree = enteringFinalPhase;
    boss.health = boss.maxHealth;
    boss.displayHealth = boss.maxHealth;
    boss.attackCooldown = Math.min(boss.attackCooldown, 0.65);
    if (boss.bossType === 'dragon') {
        boss.fireballCooldown = Math.min(boss.fireballCooldown, 0.55);
        boss.wingSweepCooldown = Math.min(boss.wingSweepCooldown, 0.65);
        if (boss.fireballTarget) {
            boss.fireballWarning = Math.min(boss.fireballWarning, 0.4);
        }
    } else if (boss.bossType === 'lavaGolem') {
        boss.lavaCooldown = Math.min(boss.lavaCooldown, 0.8);
        boss.rockCooldown = Math.min(boss.rockCooldown, 0.8);
        boss.eruptionCooldown = Math.min(boss.eruptionCooldown, 0.8);
        for (const pool of boss.lavaPools) {
            pool.warning = Math.min(pool.warning, 0.45);
        }
        for (const rock of boss.thrownRocks) {
            if (rock.phase === 'warning') {
                rock.warning = Math.min(rock.warning, 0.4);
            }
        }
    } else if (boss.bossType === 'grimReaper') {
        boss.scytheCooldown = Math.min(boss.scytheCooldown, 0.65);
        boss.shadowStepCooldown = Math.min(boss.shadowStepCooldown, 0.9);
        if (boss.scytheAttack && boss.scytheAttack.phase === 'warning') {
            const warningTime = getCreatureAttackData(boss, 'scythe-arc').warning
                * GAME_BALANCE.bosses.reaperPhaseTwoWarningMultiplier;
            boss.scytheAttack.timer = Math.max(boss.scytheAttack.timer, warningTime);
            boss.attackTimer = Math.max(boss.attackTimer, warningTime);
        }
    } else if (boss.bossType === 'throneGuardian') {
        boss.veinPulseCooldown = Math.min(boss.veinPulseCooldown, 1.2);
        boss.veinPulseWarning = Math.min(boss.veinPulseWarning, 0.5);
    }

    if (boss.phaseThree) {
        if (boss.bossType === 'dragon') {
            boss.fireballCooldown = Math.min(
                boss.fireballCooldown,
                getCreatureAttackData(boss, 'fireball').cooldown
                    * GAME_BALANCE.bosses.finalPhaseFireballCooldownMultiplier
            );
            boss.wingSweepCooldown = Math.min(
                boss.wingSweepCooldown,
                getCreatureAttackData(boss, 'wing-sweep').cooldown
                    * GAME_BALANCE.bosses.finalPhaseWingCooldownMultiplier
            );
        } else if (boss.bossType === 'lavaGolem') {
            boss.lavaCooldown = Math.min(
                boss.lavaCooldown,
                getCreatureAttackData(boss, 'lava-pool').cooldown
                    * GAME_BALANCE.bosses.finalPhaseLavaCooldownMultiplier
            );
            boss.rockCooldown = Math.min(
                boss.rockCooldown,
                getCreatureAttackData(boss, 'thrown-rock').cooldown
                    * GAME_BALANCE.bosses.finalPhaseRockCooldownMultiplier
            );
            boss.eruptionCooldown = Math.min(
                boss.eruptionCooldown,
                getCreatureAttackData(boss, 'eruption').cooldown
                    * GAME_BALANCE.bosses.finalPhaseEruptionCooldownMultiplier
            );
        } else if (boss.bossType === 'throneGuardian') {
            boss.veinPulseCooldown = Math.min(
                boss.veinPulseCooldown,
                getCreatureAttackData(boss, 'vein-pulse').cooldown
                    * GAME_BALANCE.bosses.finalPhasePulseCooldownMultiplier
            );
        }
    }

    const bossName = boss.bossType === 'dragon'
        ? 'dragão'
        : boss.bossType === 'grimReaper' ? 'ceifador'
            : boss.bossType === 'throneGuardian' ? 'Guardião do Trono' : 'golem';
    info.textContent = boss.phaseThree
        ? `O ${bossName} entrou na fase final! Seus ataques ficaram mais frequentes.`
        : `O ${bossName} recuperou a vida e entrou na segunda fase: ataques mais rápidos!`;
    return true;
}

function predictPlayerPosition(leadTime) {
    let directionX = Number(keys.ArrowRight || keys.d) - Number(keys.ArrowLeft || keys.a);
    let directionY = Number(keys.ArrowDown || keys.s) - Number(keys.ArrowUp || keys.w);
    const length = Math.hypot(directionX, directionY) || 1;
    directionX /= length;
    directionY /= length;

    const speed = player.speed * 1.2
        * (isEntityOnSewerWater(player) ? 0.6 : 1)
        * getMatriarchWebSpeedFactor(player);
    return {
        x: Math.max(tileSize, Math.min(gridWidth - tileSize, player.x + player.size / 2 + directionX * speed * leadTime)),
        y: Math.max(tileSize, Math.min(gridHeight - tileSize, player.y + player.size / 2 + directionY * speed * leadTime))
    };
}

function getBossMovementDirection(boss, dx, dy, distance, delta) {
    const preferredRange = boss.bossType === 'dragon'
        ? 105
        : boss.bossType === 'grimReaper' ? 48 : 58;
    if (distance > preferredRange + 20) {
        return findEnemyPathDirection(
            boss,
            player.x + player.size / 2,
            player.y + player.size / 2
        );
    }

    if (distance < preferredRange - 18) {
        const retreatChoices = [
            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: -1 }
        ].filter((direction) => canEntityMoveTo(
            boss,
            boss.x + direction.x * 8,
            boss.y + direction.y * 8
        ));
        retreatChoices.sort((first, second) => (
            first.x * dx + first.y * dy - (second.x * dx + second.y * dy)
        ));
        return retreatChoices[0] || { x: 0, y: 0 };
    }

    boss.repositionTimer -= delta;
    if (boss.repositionTimer <= 0) {
        boss.flankSign *= -1;
        boss.repositionTimer = (1.1 + Math.random() * 0.45) / bossIntelligenceMultiplier;
    }
    const sideX = -dy / (distance || 1) * boss.flankSign;
    const sideY = dx / (distance || 1) * boss.flankSign;
    const flankTarget = findBossHazardTarget(
        player.x + player.size / 2 + sideX * preferredRange,
        player.y + player.size / 2 + sideY * preferredRange
    );
    return flankTarget
        ? findEnemyPathDirection(
            boss,
            flankTarget.x * tileSize + tileSize / 2,
            flankTarget.y * tileSize + tileSize / 2
        )
        : { x: 0, y: 0 };
}

function spawnEnemyWave(amount) {
    const playerTileX = Math.floor((player.x + player.size / 2) / tileSize);
    const playerTileY = Math.floor((player.y + player.size / 2) / tileSize);
    const candidates = findOpenTiles()
        .filter((tile) => (
            currentFloor % 5 !== 0 || (
                tile.x >= bossArenaBounds.left
                && tile.x <= bossArenaBounds.right
                && tile.y >= bossArenaBounds.top
                && tile.y <= bossArenaBounds.bottom
            )
        ))
        .filter((tile) => (
            tile.x !== exitPosition.x
            || tile.y !== exitPosition.y
        ))
        .sort((first, second) => {
            const firstDistance = Math.abs(first.x - playerTileX) + Math.abs(first.y - playerTileY);
            const secondDistance = Math.abs(second.x - playerTileX) + Math.abs(second.y - playerTileY);
            return secondDistance - firstDistance;
        });
    const spawnPositions = [];
    for (const tile of candidates) {
        const farFromPlayer = Math.abs(tile.x - playerTileX) + Math.abs(tile.y - playerTileY) >= 4;
        const farFromOtherEnemies = [...enemies, ...spawnPositions.map((position) => ({
            x: position.x * tileSize,
            y: position.y * tileSize,
            size: 0
        }))].every((enemy) => (
            Math.abs(tile.x - Math.floor((enemy.x + enemy.size / 2) / tileSize))
            + Math.abs(tile.y - Math.floor((enemy.y + enemy.size / 2) / tileSize)) >= 3
        ));
        if (farFromPlayer && farFromOtherEnemies) {
            spawnPositions.push(tile);
            if (spawnPositions.length >= amount) {
                break;
            }
        }
    }

    for (let index = 0; index < spawnPositions.length; index++) {
        enemies.push(createEnemy(spawnPositions[index].x, spawnPositions[index].y, chooseOreDrop()));
    }
    waveNumber += 1;
    const creatures = currentFloor >= 10 ? 'trolls e ogros' : 'goblins e aranhas';
    info.textContent = `Onda ${waveNumber}! ${spawnPositions.length} criatura(s) (${creatures}) surgiram na masmorra.`;
}

const enemyPathDirections = [
    0, -1, 1, 0, 0, 1, -1, 0,
    1, -1, 1, 1, -1, 1, -1, -1
];
const enemyPathQueue = new Int16Array(rows * cols);
const enemyPathFirstSteps = new Int16Array(rows * cols);
const enemyPathVisitStamps = new Uint32Array(rows * cols);
const enemyPathBlockedTiles = new Uint8Array(rows * cols);
let enemyPathSearchStamp = 0;

function findEnemyPathDirection(enemy, targetX, targetY) {
    const startX = Math.floor((enemy.x + enemy.size / 2) / tileSize);
    const startY = Math.floor((enemy.y + enemy.size / 2) / tileSize);
    const goalX = Math.floor(targetX / tileSize);
    const goalY = Math.floor(targetY / tileSize);
    if (
        startX < 0 || startX >= cols || startY < 0 || startY >= rows
        || goalX < 0 || goalX >= cols || goalY < 0 || goalY >= rows
    ) {
        return { x: 0, y: 0 };
    }

    enemyPathBlockedTiles.fill(0);
    for (const barrel of barrels) {
        if (barrel.health > 0 && barrel.x >= 0 && barrel.x < cols
            && barrel.y >= 0 && barrel.y < rows) {
            enemyPathBlockedTiles[barrel.y * cols + barrel.x] = 1;
        }
    }
    for (const chest of chests) {
        if (chest.health > 0 && chest.x >= 0 && chest.x < cols
            && chest.y >= 0 && chest.y < rows) {
            enemyPathBlockedTiles[chest.y * cols + chest.x] = 1;
        }
    }

    enemyPathSearchStamp = (enemyPathSearchStamp + 1) >>> 0;
    if (enemyPathSearchStamp === 0) {
        enemyPathVisitStamps.fill(0);
        enemyPathSearchStamp = 1;
    }

    const startIndex = startY * cols + startX;
    const goalIndex = goalY * cols + goalX;
    let head = 0;
    let tail = 0;
    enemyPathQueue[tail++] = startIndex;
    enemyPathVisitStamps[startIndex] = enemyPathSearchStamp;
    enemyPathFirstSteps[startIndex] = -1;

    while (head < tail && enemyPathVisitStamps[goalIndex] !== enemyPathSearchStamp) {
        const currentIndex = enemyPathQueue[head++];
        const currentX = currentIndex % cols;
        const currentY = (currentIndex - currentX) / cols;
        const inheritedFirstStep = enemyPathFirstSteps[currentIndex];

        for (let directionIndex = 0; directionIndex < enemyPathDirections.length; directionIndex += 2) {
            const dx = enemyPathDirections[directionIndex];
            const dy = enemyPathDirections[directionIndex + 1];
            const x = currentX + dx;
            const y = currentY + dy;
            if (x < 1 || x >= cols - 1 || y < 1 || y >= rows - 1) continue;

            const nextIndex = y * cols + x;
            if (
                enemyPathVisitStamps[nextIndex] === enemyPathSearchStamp
                || map[y][x] === '#'
                || enemyPathBlockedTiles[nextIndex]
                || (dx !== 0 && dy !== 0 && (
                    map[currentY][x] === '#'
                    || map[y][currentX] === '#'
                ))
            ) {
                continue;
            }

            enemyPathVisitStamps[nextIndex] = enemyPathSearchStamp;
            enemyPathFirstSteps[nextIndex] = inheritedFirstStep < 0
                ? nextIndex
                : inheritedFirstStep;
            enemyPathQueue[tail++] = nextIndex;
        }
    }

    if (enemyPathVisitStamps[goalIndex] !== enemyPathSearchStamp) {
        return { x: 0, y: 0 };
    }
    const firstStep = enemyPathFirstSteps[goalIndex];
    if (firstStep < 0) {
        const dx = targetX - (enemy.x + enemy.size / 2);
        const dy = targetY - (enemy.y + enemy.size / 2);
        return Math.abs(dx) > Math.abs(dy)
            ? { x: Math.sign(dx), y: 0 }
            : { x: 0, y: Math.sign(dy) };
    }

    const centerX = enemy.x + enemy.size / 2;
    const centerY = enemy.y + enemy.size / 2;
    const nextX = firstStep % cols;
    const nextY = (firstStep - nextX) / cols;
    if (nextX !== startX && nextY !== startY) {
        return {
            x: Math.sign(nextX - startX) * Math.SQRT1_2,
            y: Math.sign(nextY - startY) * Math.SQRT1_2
        };
    }
    if (nextX !== startX) {
        const alignY = (startY + 0.5) * tileSize - centerY;
        return Math.abs(alignY) > 1.5
            ? { x: 0, y: Math.sign(alignY) }
            : { x: Math.sign(nextX - startX), y: 0 };
    }
    const alignX = (startX + 0.5) * tileSize - centerX;
    return Math.abs(alignX) > 1.5
        ? { x: Math.sign(alignX), y: 0 }
        : { x: 0, y: Math.sign(nextY - startY) };
}

function updateFloorCombatProgress() {
    const remainingBoss = enemies.some((enemy) => enemy.isBoss && enemy.health > 0);
    const bossFloor = currentFloor % 5 === 0;
    const enemyName = currentFloor >= 10 ? 'inimigos' : 'goblins e aranhas';
    questText.textContent = bossFloor
        ? `Derrote ${floorKillGoal} ${enemyName} e o chefe (${Math.min(floorKillCount, floorKillGoal)}/${floorKillGoal})`
        : currentFloor <= 5
            ? `Derrote goblins e aranhas (${Math.min(floorKillCount, floorKillGoal)}/${floorKillGoal})`
            : `Derrote ${enemyName} (${Math.min(floorKillCount, floorKillGoal)}/${floorKillGoal})`;

    if (
        floorKillCount >= floorKillGoal
        && !remainingBoss
        && (!bossFloor || bossDefeatedThisFloor)
        && enemies.length === 0
    ) {
        if (!portalUnlocked) {
            const floorReward = 4 + currentFloor + (bossFloor ? 10 : 0);
            oreCoinBalance.copper += floorReward;
            updateOreCoinHud();
            trackBotEconomy();
            info.textContent = `Andar limpo! Recompensa: ${floorReward} cobres. O portal apareceu.`;
        }
        portalUnlocked = true;
        sendMultiplayerFloorCleared();
        gameHud.dataset.portal = 'true';
        questText.textContent = 'Portal do andar liberado';
        scheduleFloorMapPrefetch();
        return;
    }

    if (enemies.length === 0) {
        spawnEnemyWave(Math.min(4, floorKillGoal - floorKillCount));
    }
}

function getActorAnimationDelta(delta) {
    return delta * GAME_BALANCE.visual.actorAnimationSpeedMultiplier;
}

function movePlayer(delta) {
    let moveX = 0;
    let moveY = 0;
    const previousX = player.x;
    const previousY = player.y;
    player.webbedTimer = Math.max(0, player.webbedTimer - delta);

    if (player.webbedTimer > 0) {
        player.dashActive = false;
        player.dashTimer = 0;
        player.dashTarget = null;
        player.moving = false;
        player.animTime += getActorAnimationDelta(delta) * 0.25;
        player.dashCooldown = Math.max(0, player.dashCooldown - delta);
        return;
    }

    if (player.dashActive) {
        const waterSpeedFactor = (isEntityOnSewerWater(player) ? 0.6 : 1)
            * getMatriarchWebSpeedFactor(player);
        const dashStep = Math.min(
            player.dashDistance - player.dashTravelled,
            180 * getConquestAuraMultiplier() * waterSpeedFactor * delta
        );
        const nextX = player.x + player.dashDirectionX * dashStep;
        const nextY = player.y + player.dashDirectionY * dashStep;
        if (canEntityMoveTo(player, nextX, nextY)) {
            player.x = nextX;
            player.y = nextY;
            player.dashTravelled += dashStep;
        } else {
            player.dashTravelled = player.dashDistance;
        }
        player.dashTimer = Math.max(0, player.dashTimer - delta);
        if (player.dashTravelled >= player.dashDistance || player.dashTimer === 0) {
            player.dashActive = false;
            player.dashTarget = null;
            recordNaraDodge();
        }
    } else {
        if (keys.ArrowLeft || keys.a) moveX -= 1;
        if (keys.ArrowRight || keys.d) moveX += 1;
        if (keys.ArrowUp || keys.w) moveY -= 1;
        if (keys.ArrowDown || keys.s) moveY += 1;

        if (moveX !== 0 || moveY !== 0) {
            const length = Math.hypot(moveX, moveY) || 1;
            moveX /= length;
            moveY /= length;
            if (Math.abs(moveX) > Math.abs(moveY)) {
                player.facingX = Math.sign(moveX);
                player.facingY = 0;
                player.spriteFacingX = Math.sign(moveX);
            } else {
                player.facingX = 0;
                player.facingY = Math.sign(moveY);
            }

            const waterSpeedFactor = (isEntityOnSewerWater(player) ? 0.6 : 1)
                * getMatriarchWebSpeedFactor(player);
            const movementSpeed = player.speed * 1.2 * getConquestAuraMultiplier()
                * (keys.Shift ? 1.8 : 1)
                * waterSpeedFactor;
            let nextX = player.x + moveX * movementSpeed * delta;
            let nextY = player.y + moveY * movementSpeed * delta;

            if (botMode && botAlignmentTarget) {
                if (
                    botAlignmentTarget.axis === 'x'
                    && (botAlignmentTarget.position - player.x) * (botAlignmentTarget.position - nextX) <= 0
                ) {
                    nextX = botAlignmentTarget.position;
                } else if (
                    botAlignmentTarget.axis === 'y'
                    && (botAlignmentTarget.position - player.y) * (botAlignmentTarget.position - nextY) <= 0
                ) {
                    nextY = botAlignmentTarget.position;
                }
            }

            if (canEntityMoveTo(player, nextX, player.y)) {
                player.x = Math.max(0, Math.min(gridWidth - player.size, nextX));
            }

            if (canEntityMoveTo(player, player.x, nextY)) {
                player.y = Math.max(0, Math.min(gridHeight - player.size, nextY));
            }
        }
    }

    player.moving = player.x !== previousX || player.y !== previousY;
    player.animTime += getActorAnimationDelta(delta) * (player.moving ? 1.2 : 0.25);
    player.dashCooldown = Math.max(0, player.dashCooldown - delta);
}

function tryStartDash() {
    if (
        gameState !== 'playing'
        || shopOpen
        || !keys.Shift
        || player.dashActive
        || player.dashCooldown > 0
    ) {
        return;
    }

    let directionX = 0;
    let directionY = 0;
    if (keys.ArrowLeft || keys.a) directionX -= 1;
    if (keys.ArrowRight || keys.d) directionX += 1;
    if (keys.ArrowUp || keys.w) directionY -= 1;
    if (keys.ArrowDown || keys.s) directionY += 1;
    if (directionX === 0 && directionY === 0) {
        return;
    }

    const directionLength = Math.hypot(directionX, directionY);
    directionX /= directionLength;
    directionY /= directionLength;
    const playerCenterX = player.x + player.size / 2;
    const playerCenterY = player.y + player.size / 2;
    const target = enemies
        .filter((enemy) => enemy.health > 0)
        .map((enemy) => {
            const offsetX = enemy.x + enemy.size / 2 - playerCenterX;
            const offsetY = enemy.y + enemy.size / 2 - playerCenterY;
            return {
                enemy,
                forwardDistance: offsetX * directionX + offsetY * directionY,
                sideDistance: Math.abs(offsetX * directionY - offsetY * directionX)
            };
        })
        .filter(({ enemy, forwardDistance, sideDistance }) => (
            forwardDistance > 0
            && forwardDistance <= (dashUpgradeOwned ? 108 : 72) + getCollisionRadius(enemy)
            && sideDistance <= getCollisionRadius(player) + getCollisionRadius(enemy)
        ))
        .sort((first, second) => first.forwardDistance - second.forwardDistance)[0] || null;

    player.facingX = directionX;
    player.facingY = directionY;
    if (directionX !== 0) {
        player.spriteFacingX = Math.sign(directionX);
    }
    player.dashActive = true;
    player.dashCooldown = 0.65;
    player.dashDirectionX = directionX;
    player.dashDirectionY = directionY;
    const baseDashDistance = target
        ? Math.max(
            36,
            target.forwardDistance
                + getCollisionRadius(target.enemy)
                + getCollisionRadius(player)
                + 6
        )
        : 48;
    player.dashDistance = baseDashDistance * (dashUpgradeOwned ? 1.5 : 1);
    player.dashDuration = player.dashDistance / (180 * getConquestAuraMultiplier());
    player.dashTimer = player.dashDuration;
    player.dashTravelled = 0;
    player.dashTarget = target ? target.enemy : null;
    player.dashAttackUsed = false;
    beginNaraDodge();
    if (keys.Space) {
        attackWithSword();
    }
}

function hasClearMeleeAttackPath(startX, startY, targetX, targetY) {
    const deltaX = targetX - startX;
    const deltaY = targetY - startY;
    const distance = Math.hypot(deltaX, deltaY);
    const steps = Math.ceil(distance / 4);
    for (let index = 1; index < steps; index++) {
        const x = startX + deltaX * index / steps;
        const y = startY + deltaY * index / steps;
        if (!canMoveTo(x - 2, y - 2, 4, 4)) {
            return false;
        }
    }
    return true;
}

function attackMineCart(weapon) {
    const playerCenterX = player.x + player.size / 2;
    const playerCenterY = player.y + player.size / 2;
    const facingLength = Math.hypot(player.facingX, player.facingY) || 1;
    const facingX = player.facingX / facingLength;
    const facingY = player.facingY / facingLength;
    const target = ambientDecorations
        .filter((decoration) => decoration.type === 'mineCart')
        .map((decoration) => {
            const bounds = getAmbientDecorationFootprintBounds(decoration);
            const hitX = Math.max(bounds.left, Math.min(playerCenterX, bounds.right));
            const hitY = Math.max(bounds.top, Math.min(playerCenterY, bounds.bottom));
            const offsetX = hitX - playerCenterX;
            const offsetY = hitY - playerCenterY;
            const distance = Math.hypot(offsetX, offsetY);
            const forward = offsetX * facingX + offsetY * facingY;
            const side = Math.abs(offsetX * facingY - offsetY * facingX);
            return { decoration, hitX, hitY, distance, forward, side };
        })
        .filter((candidate) => (
            candidate.distance <= 26
            && (weapon !== 'spear'
                || (candidate.forward >= 0 && candidate.forward <= 53 && candidate.side <= 10))
            && hasClearMeleeAttackPath(
                playerCenterX,
                playerCenterY,
                candidate.hitX,
                candidate.hitY
            )
        ))
        .sort((first, second) => first.distance - second.distance)[0];
    if (!target) return false;

    const aimX = target.hitX - playerCenterX;
    const aimY = target.hitY - playerCenterY;
    const aimLength = Math.hypot(aimX, aimY) || 1;
    if (weapon === 'spear') {
        player.spearFacingX = aimX / aimLength;
        player.spearFacingY = aimY / aimLength;
    } else {
        player.attackFacingX = aimX / aimLength;
        player.attackFacingY = aimY / aimLength;
    }

    ambientDecorations = ambientDecorations.filter(
        (decoration) => decoration !== target.decoration
    );
    itemDrops.push({
        x: (target.decoration.x + 1) * tileSize,
        y: (target.decoration.y + 1) * tileSize,
        type: 'material',
        materialId: 'soot',
        quantity: 1,
        color: '#62584d',
        animTime: 0
    });
    info.textContent = 'O carrinho de mina se despedaçou e deixou cair 1 Fuligem mineral.';
    return true;
}

function findEnemyHidePosition(enemy) {
    const enemyCenterX = enemy.x + enemy.size / 2;
    const enemyCenterY = enemy.y + enemy.size / 2;
    const playerCenterX = player.x + player.size / 2;
    const playerCenterY = player.y + player.size / 2;
    const covers = [
        ...barrels.filter((barrel) => barrel.health > 0),
        ...chests.filter((chest) => chest.health > 0)
    ];
    const positions = [];

    for (const cover of covers) {
        const coverX = (cover.x + 0.5) * tileSize;
        const coverY = (cover.y + 0.5) * tileSize;
        for (const [offsetX, offsetY] of [
            [0, -1], [1, 0], [0, 1], [-1, 0],
            [1, -1], [1, 1], [-1, 1], [-1, -1]
        ]) {
            const tileX = cover.x + offsetX;
            const tileY = cover.y + offsetY;
            if (getTile((tileX + 0.5) * tileSize, (tileY + 0.5) * tileSize) === '#') {
                continue;
            }
            const x = (tileX + 0.5) * tileSize - enemy.size / 2;
            const y = (tileY + 0.5) * tileSize - enemy.size / 2;
            const distance = Math.hypot(x + enemy.size / 2 - enemyCenterX, y + enemy.size / 2 - enemyCenterY);
            if (
                distance > tileSize * 10
                || !canEntityMoveTo(enemy, x, y)
            ) {
                continue;
            }

            const behindCover = (
                (coverX - playerCenterX) * (x + enemy.size / 2 - coverX)
                + (coverY - playerCenterY) * (y + enemy.size / 2 - coverY)
            ) > 0;
            positions.push({
                x: x + enemy.size / 2,
                y: y + enemy.size / 2,
                score: distance - (behindCover ? tileSize : 0)
            });
        }
    }

    positions.sort((first, second) => first.score - second.score);
    return positions[0] || null;
}

function alertEnemiesToPlayerAttack(target) {
    const playerCenterX = player.x + player.size / 2;
    const playerCenterY = player.y + player.size / 2;
    const targetCenterX = target.x + target.size / 2;
    const targetCenterY = target.y + target.size / 2;
    for (const enemy of enemies) {
        if (
            enemy === target
            || enemy.health <= 0
            || enemy.dying
            || enemy.combatAlertTimer > 0
            || enemy.fleeHideCooldown > 0
            || enemy.fleeHideTarget
            || enemy.fleeHideTimer > 0
        ) {
            continue;
        }
        const enemyCenterX = enemy.x + enemy.size / 2;
        const enemyCenterY = enemy.y + enemy.size / 2;
        if (
            Math.hypot(enemyCenterX - playerCenterX, enemyCenterY - playerCenterY) > tileSize * 8
            || !hasClearMeleeAttackPath(enemyCenterX, enemyCenterY, playerCenterX, playerCenterY)
            || !hasClearMeleeAttackPath(enemyCenterX, enemyCenterY, targetCenterX, targetCenterY)
        ) {
            continue;
        }

        if (Math.random() < 0.1) {
            const hidePosition = findEnemyHidePosition(enemy);
            if (hidePosition) {
                enemy.fleeHideTarget = hidePosition;
                enemy.fleeHideTimer = 0;
                enemy.fleeHideCooldown = 12;
                enemy.alertedTarget = null;
                enemy.alertTimer = 0;
                continue;
            }
        }

        enemy.combatAlertTimer = 8;
        enemy.alertedTarget = { x: playerCenterX, y: playerCenterY };
        enemy.alertTimer = 8;
        enemy.attackCooldown = Math.min(enemy.attackCooldown, 0.3);
    }
}

function attackWithSword() {
    if (gameState !== 'playing' || shopOpen || !swordEquipped || player.attackCooldown > 0) {
        return;
    }

    player.attackCooldown = 0.3 / getConquestAuraMultiplier();
    player.attackTimer = playerAttackAnimationDuration;
    player.maleAttackAnimationTimer = player.character === 'man'
        ? maleAttackAnimationDuration
        : 0;
    player.attackFacingX = player.facingX;
    player.attackFacingY = player.facingY;

    const playerCenterX = player.x + player.size / 2;
    const playerCenterY = player.y + player.size / 2;
    const aimAt = (targetX, targetY) => {
        const directionX = targetX - playerCenterX;
        const directionY = targetY - playerCenterY;
        const distance = Math.hypot(directionX, directionY) || 1;
        player.attackFacingX = directionX / distance;
        player.attackFacingY = directionY / distance;
    };
    let target = player.dashActive && !player.dashAttackUsed
        && player.dashTarget && player.dashTarget.health > 0
        && hasClearMeleeAttackPath(
            playerCenterX,
            playerCenterY,
            player.dashTarget.x + player.dashTarget.size / 2,
            player.dashTarget.y + player.dashTarget.size / 2
        )
        ? player.dashTarget
        : null;
    let targetDistance = target ? 0 : Infinity;

    for (const enemy of enemies) {
        const distance = Math.hypot(
            enemy.x + enemy.size / 2 - playerCenterX,
            enemy.y + enemy.size / 2 - playerCenterY
        );
        const attackRange = 30 + getCollisionRadius(player)
            + Math.max(0, getCollisionRadius(enemy) - 5);
        if (
            enemy.health > 0
            && distance <= attackRange
            && distance < targetDistance
            && hasClearMeleeAttackPath(
                playerCenterX,
                playerCenterY,
                enemy.x + enemy.size / 2,
                enemy.y + enemy.size / 2
            )
        ) {
            target = enemy;
            targetDistance = distance;
        }
    }

    if (!target && player.dashActive && !player.dashAttackUsed) {
        const dashTarget = enemies
            .filter((enemy) => enemy.health > 0)
            .map((enemy) => {
                const offsetX = enemy.x + enemy.size / 2 - playerCenterX;
                const offsetY = enemy.y + enemy.size / 2 - playerCenterY;
                return {
                    enemy,
                    forwardDistance: offsetX * player.dashDirectionX + offsetY * player.dashDirectionY,
                    sideDistance: Math.abs(
                        offsetX * player.dashDirectionY - offsetY * player.dashDirectionX
                    )
                };
            })
            .filter(({ enemy, forwardDistance, sideDistance }) => (
                forwardDistance >= -getCollisionRadius(enemy)
                && forwardDistance <= player.dashDistance - player.dashTravelled + getCollisionRadius(enemy)
                && sideDistance <= getCollisionRadius(player) + getCollisionRadius(enemy)
            ))
            .sort((first, second) => first.forwardDistance - second.forwardDistance)[0];
        target = dashTarget && hasClearMeleeAttackPath(
            playerCenterX,
            playerCenterY,
            dashTarget.enemy.x + dashTarget.enemy.size / 2,
            dashTarget.enemy.y + dashTarget.enemy.size / 2
        ) ? dashTarget.enemy : null;
    }

    if (!target) {
        if (attackMineCart('sword')) return;

        let targetBarrel = null;
        let barrelDistance = 26;

        for (const barrel of barrels) {
            if (barrel.health <= 0) {
                continue;
            }

            const distance = Math.hypot(
                barrel.x * tileSize + tileSize / 2 - playerCenterX,
                barrel.y * tileSize + tileSize / 2 - playerCenterY
            );
            if (distance <= barrelDistance) {
                targetBarrel = barrel;
                barrelDistance = distance;
            }
        }

        let targetChest = null;
        let chestDistance = 26;
        if (!targetBarrel) {
            for (const chest of chests) {
                if (chest.health <= 0) {
                    continue;
                }

                const distance = Math.hypot(
                    chest.x * tileSize + tileSize / 2 - playerCenterX,
                    chest.y * tileSize + tileSize / 2 - playerCenterY
                );
                if (distance <= chestDistance) {
                    targetChest = chest;
                    chestDistance = distance;
                }
            }
        }

        if (!targetBarrel && !targetChest) {
            info.textContent = 'Golpe no vazio. Aproxime-se de um inimigo, barril ou baú.';
            return;
        }

        if (!targetBarrel) {
            aimAt(
                targetChest.x * tileSize + tileSize / 2,
                targetChest.y * tileSize + tileSize / 2
            );
            targetChest.health = Math.max(0, targetChest.health - 10);
            targetChest.hitFlash = 0.16;
            if (targetChest.health === 0) {
                targetChest.opened = true;
                const scrollDrop = targetChest.isMimic
                    ? dropMimicScroll(targetChest.x, targetChest.y)
                    : null;
                if (targetChest.containsPotion) {
                    dropPotionItem(targetChest.x, targetChest.y, targetChest.rarity);
                    info.textContent = `Baú ${targetChest.rarity.name} aberto! Uma poção ${targetChest.rarity.potionName} caiu no chão.`;
                } else {
                    info.textContent = `Baú ${targetChest.rarity.name} aberto, mas estava vazio.`;
                }
                if (scrollDrop) {
                    info.textContent += ` Também deixou cair ${scrollDrop.name}.`;
                }
            } else {
                info.textContent = 'O baú rachou. Acerte mais uma vez para abri-lo.';
            }
            return;
        }

        aimAt(
            targetBarrel.x * tileSize + tileSize / 2,
            targetBarrel.y * tileSize + tileSize / 2
        );
        targetBarrel.health = Math.max(0, targetBarrel.health - 10);
        targetBarrel.hitFlash = 0.16;
        if (targetBarrel.isBroodCocoon) {
            if (targetBarrel.health === 0) {
                if (!matriarchArena.broodSacsDestroyed.includes(targetBarrel.broodSacIndex)) {
                    matriarchArena.broodSacsDestroyed.push(targetBarrel.broodSacIndex);
                }
                info.textContent = 'Casulo destruído. Uma aranha a menos poderá sair deste túnel.';
            } else {
                info.textContent = 'O casulo da parede rachou. Acerte mais uma vez para impedir a ninhada.';
            }
            return;
        }
        if (targetBarrel.isSecretCocoon) {
            if (targetBarrel.health === 0) {
                const room = secretRooms.find(
                    (candidate) => candidate.id === targetBarrel.secretRoomId
                );
                if (!room || !activateSecretRoomTrigger(room, {
                    type: 'destroy-object',
                    objectId: 'old-nest-cocoon'
                })) {
                    throw new Error('O casulo da sala secreta perdeu seu gatilho configurado.');
                }
            } else {
                info.textContent = 'O casulo rachou. Acerte mais uma vez para rasgar a teia.';
            }
            return;
        }
        if (targetBarrel.health === 0) {
            const ore = chooseOreDrop();
            const candidates = [];
            for (let row = Math.max(0, targetBarrel.y - 2); row <= Math.min(rows - 1, targetBarrel.y + 2); row++) {
                for (let col = Math.max(0, targetBarrel.x - 2); col <= Math.min(cols - 1, targetBarrel.x + 2); col++) {
                    if (
                        Math.abs(col - targetBarrel.x) + Math.abs(row - targetBarrel.y) > 2
                        || map[row][col] !== '.'
                        || barrels.some((barrel) => (
                            barrel.health > 0 && barrel.x === col && barrel.y === row
                        ))
                        || chests.some((chest) => (
                            chest.health > 0 && chest.x === col && chest.y === row
                        ))
                    ) {
                        continue;
                    }
                    candidates.push({ x: col, y: row });
                }
            }

            for (let index = candidates.length - 1; index > 0; index--) {
                const swapIndex = Math.floor(Math.random() * (index + 1));
                [candidates[index], candidates[swapIndex]] = [
                    candidates[swapIndex],
                    candidates[index]
                ];
            }

            for (const position of candidates.slice(0, 4)) {
                oreDrops.push({
                    x: position.x * tileSize + tileSize / 2,
                    y: position.y * tileSize + tileSize / 2,
                    ore,
                    animTime: 0
                });
            }
            if (
                Math.random()
                < targetBarrel.rarity.itemDropChance
                    * GAME_BALANCE.economy.potionDropMultiplier
            ) {
                dropPotionItem(targetBarrel.x, targetBarrel.y, targetBarrel.rarity);
                info.textContent = `Barril ${targetBarrel.rarity.name} quebrado! Espalhou moedas de ${ore.name} e uma poção ${targetBarrel.rarity.potionName}.`;
            } else {
                info.textContent = `Barril ${targetBarrel.rarity.name} quebrado! Espalhou moedas de ${ore.name} pelo chão.`;
            }
        } else {
            info.textContent = 'O barril rachou. Acerte mais uma vez para quebrá-lo.';
        }
        return;
    }

    recordBotWeaponAttempt('sword', target);
    aimAt(target.x + target.size / 2, target.y + target.size / 2);
    const dashAttack = player.dashActive && !player.dashAttackUsed;
    const attackMultiplier = dashAttack ? 2 : 1;
    const baseDamage = player.damage * attackMultiplier;
    const targetHealthBeforeAttack = target.health;
    if (dashAttack) {
        player.dashAttackUsed = true;
    }
    const enemyDamageResult = damageEnemy(target, baseDamage, undefined, undefined, true, 'sword');
    alertEnemiesToPlayerAttack(target);
    chargeSpecialAbilities(targetHealthBeforeAttack - target.health);
    const attackDamage = enemyDamageResult.damage;
    recordBotWeaponOutcome('sword', attackDamage > 0, target);
    recordBotCombat('sword', attackDamage, enemyDamageResult.blocked, target);
    target.hitFlash = 0.16;
    if (enemyDamageResult.blocked) {
        info.textContent = enemyDamageResult.dodged
            ? 'O goblin se agachou e esquivou do ataque!'
            : enemyDamageResult.shieldBroken
                ? 'O escudo inimigo quebrou! Aproveite a abertura para atacar.'
                : enemyDamageResult.bossBlocked
                    ? 'O chefe bloqueou seu ataque!'
                    : 'O inimigo ergueu o escudo e bloqueou seu ataque!';
        return;
    }
    if (target.health === 0) {
        resolveEnemyDefeat(target);
    } else {
        const reductionMessage = enemyDamageResult.reduced
            ? ' A armadura reduziu o dano.'
            : '';
        const bonusMessage = enemyDamageResult.counterAttack
            ? ' Contra-ataque após esquiva!'
            : enemyDamageResult.flanked ? ' Bônus por flanqueamento!'
                : enemyDamageResult.shieldOpening ? ' Escudo quebrado: abertura vulnerável!' : '';
        const weaknessMessage = enemyDamageResult.bossWeakness
            ? ' Acerto na fraqueza do chefe: dano aumentado!'
            : '';
        info.textContent = dashAttack
            ? `Ataque durante o dash! ${attackDamage} de dano.${bonusMessage}${weaknessMessage}${reductionMessage} Vida restante: ${target.health}.`
            : `Acertou o inimigo: ${attackDamage} de dano.${bonusMessage}${weaknessMessage}${reductionMessage} Vida restante: ${target.health}.`;
    }
}

function attackWithSpear() {
    if (!spearOwned || gameState !== 'playing' || shopOpen || player.spearCooldown > 0) {
        return;
    }

    player.spearCooldown = 0.48 / getConquestAuraMultiplier();
    player.spearAttackTimer = 0.36;
    player.spearFacingX = player.facingX;
    player.spearFacingY = player.facingY;
    const centerX = player.x + player.size / 2;
    const centerY = player.y + player.size / 2;
    const directionLength = Math.hypot(player.facingX, player.facingY) || 1;
    const directionX = player.facingX / directionLength;
    const directionY = player.facingY / directionLength;
    const targetCandidate = enemies
        .filter((enemy) => enemy.health > 0 && !enemy.dying)
        .map((enemy) => {
            const offsetX = enemy.x + enemy.size / 2 - centerX;
            const offsetY = enemy.y + enemy.size / 2 - centerY;
            return {
                enemy,
                forward: offsetX * directionX + offsetY * directionY,
                side: Math.abs(offsetX * directionY - offsetY * directionX)
            };
        })
        .filter(({ enemy, forward, side }) => (
            forward >= 0
            && forward <= 53 + getCollisionRadius(enemy)
            && side <= 10 + getCollisionRadius(enemy)
        ))
        .sort((first, second) => first.forward - second.forward)[0];
    const target = targetCandidate ? targetCandidate.enemy : null;

    if (!target) {
        attackMineCart('spear');
        return;
    }

    const damage = Math.max(1, Math.ceil(player.damage * 0.8));
    recordBotWeaponAttempt('spear', target);
    const targetHealthBeforeAttack = target.health;
    const result = damageEnemy(target, damage, undefined, undefined, true, 'melee');
    alertEnemiesToPlayerAttack(target);
    chargeSpecialAbilities(targetHealthBeforeAttack - target.health);
    recordBotWeaponOutcome('spear', result.damage > 0, target);
    recordBotCombat('spear', result.damage, result.blocked, target);
    target.hitFlash = 0.16;
    if (result.blocked) {
        info.textContent = result.dodged
            ? 'O goblin se agachou e esquivou da estocada!'
            : result.shieldBroken
                ? 'A lança quebrou o escudo! Aproveite a abertura para atacar.'
                : result.bossBlocked
                    ? 'O chefe bloqueou a estocada!'
                    : 'A lança foi bloqueada pelo escudo inimigo; tente atacar de lado ou por trás.';
    } else if (target.health === 0) {
        resolveEnemyDefeat(target);
    } else {
        const bonusText = result.counterAttack
            ? ' contra-ataque após esquiva'
            : result.flanked ? ' pelas costas: dano de flanqueamento'
                : result.shieldOpening ? ' na abertura do escudo quebrado' : '';
        const weaknessText = result.bossWeakness ? ' Acerto na fraqueza do chefe: dano aumentado!' : '';
        info.textContent = `Estocada${bonusText}! ${result.damage} de dano.${weaknessText} Vida restante: ${target.health}.`;
    }
}

function resolveEnemyDefeat(target) {
    if (target.defeatResolved) {
        return;
    }
    if (target.isBoss && enterBossPhaseTwo(target)) {
        return;
    }
    target.defeatResolved = true;
    for (const room of secretRooms) {
        activateSecretRoomTrigger(room, {
            type: 'defeat-enemy',
            creatureType: target.creatureType
        });
    }
    playCreatureSound(target.creatureType || target.bossType, 'death');
    const isGoblin = ['goblin', 'goblinRunner'].includes(target.creatureType);
    const hasSpiderDeathAnimation = ['spider', 'sootSpider', 'matriarch'].includes(target.creatureType);
    if (isGoblin) {
        target.dying = true;
        target.deathTimer = goblinDeathAnimationDuration;
        target.deathAnimationDuration = goblinDeathAnimationDuration;
    } else if (hasSpiderDeathAnimation) {
        target.dying = true;
        target.deathTimer = spiderDeathAnimationDuration;
        target.deathAnimationDuration = spiderDeathAnimationDuration;
    }
    recordBotEnemyDefeat(target);
    const screamed = !target.isBoss && Math.random() < 0.1;
    if (screamed) {
        target.dying = true;
        target.deathTimer = isGoblin ? goblinDeathAnimationDuration
            : hasSpiderDeathAnimation ? spiderDeathAnimationDuration : 0.55;
        target.deathAnimationDuration = target.deathTimer;
        target.painTimer = target.deathTimer;
        target.hitFlash = target.deathTimer;
        const alarmPosition = {
            x: player.x + player.size / 2,
            y: player.y + player.size / 2
        };
        const alertedCount = enemies.reduce((count, enemy) => {
            if (enemy !== target && !enemy.isBoss && enemy.health > 0) {
                enemy.alertedTarget = alarmPosition;
                enemy.alertTimer = 12;
                enemy.painTimer = 0.5;
                enemy.hitFlash = 0.5;
                count += 1;
            }
            return count;
        }, 0);
        target.screamAlertCount = alertedCount;
    }
    const creatureLoot = creatureDataByType[target.creatureType || target.bossType];
    if (!creatureLoot) {
        throw new Error(`Tabela de drops ausente para ${target.creatureType || target.bossType}.`);
    }
    let lootOffset = 0;
    for (const drop of creatureLoot.drops) {
        if (Math.random() >= drop.chance) {
            continue;
        }
        const quantity = drop.min + Math.floor(Math.random() * (drop.max - drop.min + 1));
        if (drop.id === 'coin') {
            for (let index = 0; index < quantity; index += 1) {
                oreDrops.push({
                    x: target.x + target.size / 2 + lootOffset,
                    y: target.y + target.size / 2,
                    ore: chooseOreDrop(),
                    animTime: 0
                });
                lootOffset = lootOffset === 0 ? 5 : -5;
            }
            continue;
        }
        if (!creatureMaterialDataById[drop.id]) {
            throw new Error(`Material de drop desconhecido: ${drop.id}.`);
        }
        itemDrops.push({
            x: target.x + target.size / 2 + lootOffset,
            y: target.y + target.size / 2,
            type: 'material',
            materialId: drop.id,
            quantity,
            color: creatureLoot.colors.accent,
            animTime: 0
        });
        lootOffset = lootOffset === 0 ? 5 : -5;
    }
    if (
        !target.isBoss
        && !target.isMiniBoss
        && arrowAmmo < GAME_BALANCE.bow.maxAmmo
        && Math.random() < GAME_BALANCE.bow.ammoDropChance
    ) {
        itemDrops.push({
            x: target.x + target.size / 2 + lootOffset,
            y: target.y + target.size / 2,
            type: 'arrows',
            quantity: GAME_BALANCE.bow.ammoPickup,
            animTime: 0
        });
    }
    if (!screamed) {
        enemies = enemies.filter((enemy) => enemy !== target);
    }
    if (!target.isBoss && !target.isMiniBoss) {
        floorKillCount += 1;
    } else {
        bossDefeatedThisFloor = true;
    }
    if (!multiplayerConnected) {
        addExperience(target.isBoss || target.isMiniBoss ? 100 : 25);
    }
    updateRaceWarStatus();
    info.textContent = target.isBoss
        ? `Chefe derrotado! +100 XP e moeda de ${target.dropOre.name}.`
        : target.isMiniBoss
            ? `A Matriarca do Tear foi derrotada! +100 XP e moeda de ${target.dropOre.name}.`
        : `Inimigo derrotado! +25 XP e moeda de ${target.dropOre.name}.`;
    if (screamed) {
        const creatureName = target.creatureType === 'goblinRunner'
            ? 'goblin corredor'
            : target.creatureType === 'troll'
            ? 'troll'
            : target.creatureType === 'ogre'
                ? 'ogro'
                : ['spider', 'sootSpider', 'matriarch'].includes(target.creatureType)
                    ? target.creatureType === 'matriarch' ? 'Matriarca do Tear' : 'aranha'
                    : target.creatureType === 'ashHound' ? 'cão de fuligem'
                        : target.creatureType === 'stainedSentinel' ? 'sentinela de vitral' : 'goblin';
        const listenerName = currentFloor >= 10 ? 'trolls ou ogros' : 'goblins e aranhas';
        info.textContent = target.screamAlertCount > 0
            ? `O ${creatureName} gritou ao morrer! ${target.screamAlertCount} ${listenerName} ouviram e estão indo até você.`
            : `O ${creatureName} gritou ao morrer, mas não havia outros ${listenerName} para ouvir.`;
    }
    updateFloorCombatProgress();
}

function interruptScribeGlyph(enemy) {
    if (enemy.creatureType !== 'facelessScribe' || enemy.glyphWarning <= 0) return;
    enemy.glyphWarning = 0;
    enemy.glyphCooldown = Math.max(enemy.glyphCooldown || 0, 0.8);
}

function damageEnemy(
    enemy,
    amount,
    sourceX = player.x + player.size / 2,
    sourceY = player.y + player.size / 2,
    applyPlayerBonuses = true,
    attackType = null
) {
    playCreatureSound(enemy.creatureType || enemy.bossType, 'hit');
    if (applyPlayerBonuses) {
        amount = Math.ceil(amount * getConquestAuraMultiplier());
    }
    if (player.susanoActive && applyPlayerBonuses && !enemy.isBoss) {
        const damage = enemy.health;
        enemy.health = 0;
        sendMultiplayerAttack(enemy, damage);
        sendMultiplayerDefeat(enemy);
        spawnImpactParticles(enemy.x + enemy.size / 2, enemy.y + enemy.size / 2, '#c7f5e9');
        return {
            damage,
            blocked: false,
            reduced: false,
            flanked: false,
            counterAttack: false,
            shieldOpening: false,
            bossWeakness: false,
            shieldBroken: false
        };
    }

    const bossWeakness = enemy.isBoss && enemy.weaknessTimer > 0;
    if (bossWeakness) {
        amount = Math.ceil(amount * 1.6);
    }
    const directionX = sourceX - (enemy.x + enemy.size / 2);
    const directionY = sourceY - (enemy.y + enemy.size / 2);
    const distance = Math.hypot(directionX, directionY) || 1;
    const incomingX = directionX / distance;
    const incomingY = directionY / distance;
    const facingDot = enemy.facingX * incomingX + enemy.facingY * incomingY;
    const facingPlayer = facingDot > 0.25;
    const flanked = facingDot < -0.25;

    if (
        enemy.behaviorProfile === 'stainedGuardian'
        && facingPlayer
        && !flanked
    ) {
        return {
            damage: 0,
            blocked: true,
            bossBlocked: false,
            reduced: false,
            flanked: false,
            shieldBroken: false
        };
    }

    if (enemy.shieldDurability > 0 && facingPlayer) {
        enemy.shieldDurability = Math.max(
            0,
            enemy.shieldDurability - (attackType === 'sword' ? 2 : 1)
        );
        enemy.shieldRaised = true;
        enemy.defendTimer = 0.35;
        const shieldBroken = enemy.shieldDurability === 0;
        if (shieldBroken) {
            enemy.shieldBrokenTimer = 1.2;
        }
        return {
            damage: 0,
            blocked: true,
            bossBlocked: false,
            reduced: false,
            flanked: false,
            shieldBroken
        };
    }

    if (
        applyPlayerBonuses
        && ['goblin', 'goblinRunner'].includes(enemy.creatureType)
        && !flanked
        && enemy.dodgeCooldown <= 0
        && Math.random() < 0.15
    ) {
        enemy.dodgeTimer = 0.36;
        enemy.dodgeCooldown = 1.5;
        return {
            damage: 0,
            blocked: true,
            bossBlocked: false,
            reduced: false,
            flanked: false,
            shieldBroken: false,
            dodged: true
        };
    }

    const blockChance = attackType === 'arrow'
        ? bossArrowBlockChance
        : attackType === 'melee' || attackType === 'sword'
            ? bossMeleeBlockChance
            : 0;
    if (
        enemy.isBoss
        && enemy.weaknessTimer <= 0
        && blockChance > 0
        && Math.random() < blockChance
    ) {
        return {
            damage: 0,
            blocked: true,
            bossBlocked: true,
            reduced: false,
            flanked: false,
            shieldBroken: false
        };
    }

    const resistanceType = attackType && enemy.resistances?.[attackType] !== undefined
        ? attackType : 'physical';
    const frontalResistance = ['stainedGuardian', 'basaltBulwark'].includes(enemy.behaviorProfile)
        && facingPlayer && !flanked
        ? enemy.resistances?.frontalPhysical || 0 : 0;
    const resistance = Math.max(
        enemy.resistances?.[resistanceType] || 0,
        frontalResistance
    );
    amount = Math.max(1, Math.ceil((amount - (enemy.defense || 0)) * (1 - resistance)));

    const counterAttack = applyPlayerBonuses && player.counterAttackTimer > 0;
    const shieldOpening = enemy.shieldBrokenTimer > 0;
    const flankDamage = counterAttack
        ? Math.ceil(amount * 1.5)
        : applyPlayerBonuses && flanked ? Math.ceil(amount * 1.25)
            : shieldOpening ? Math.ceil(amount * 1.2) : amount;
    if (applyPlayerBonuses) {
        player.counterAttackTimer = 0;
    }
    if (enemy.armorDurability > 0) {
        enemy.armorDurability -= 1;
        const reducedDamage = Math.max(
            1,
            Math.ceil(flankDamage * (applyPlayerBonuses && (flanked || counterAttack) ? 0.6 : 0.5))
        );
        enemy.health = Math.max(0, enemy.health - reducedDamage);
        sendMultiplayerAttack(enemy, reducedDamage);
        if (enemy.health === 0) {
            sendMultiplayerDefeat(enemy);
        }
        if (['goblin', 'goblinRunner', 'spider', 'matriarch'].includes(enemy.creatureType)) {
            enemy.painTimer = 0.2;
        }
        interruptScribeGlyph(enemy);
        spawnImpactParticles(enemy.x + enemy.size / 2, enemy.y + enemy.size / 2, '#f2d18a');
        return {
            damage: reducedDamage,
            blocked: false,
            reduced: true,
            flanked,
            counterAttack,
            shieldOpening,
            bossWeakness
        };
    }

    enemy.health = Math.max(0, enemy.health - flankDamage);
    sendMultiplayerAttack(enemy, flankDamage);
    if (enemy.health === 0) {
        sendMultiplayerDefeat(enemy);
    }
    if (['goblin', 'goblinRunner', 'spider', 'matriarch'].includes(enemy.creatureType)) {
        enemy.painTimer = 0.2;
    }
    interruptScribeGlyph(enemy);
    spawnImpactParticles(enemy.x + enemy.size / 2, enemy.y + enemy.size / 2, '#f2d18a');
    return {
        damage: flankDamage,
        blocked: false,
        reduced: false,
        flanked,
        counterAttack,
        shieldOpening,
        bossWeakness
    };
}

function activatePerditionScroll() {
    if (gameState !== 'playing' || shopOpen || botMode) {
        return;
    }
    if (player.susanoActive) {
        info.textContent = 'O Susano já está ativo e permanecerá até sua morte.';
        return;
    }
    if (scrollInventory.perdicao <= 0) {
        info.textContent = 'Você não tem um Pergaminho da perdição.';
        return;
    }

    scrollInventory.perdicao -= 1;
    player.susanoActive = true;
    updateScrollInventoryHud();
    updateSpearHud();
    info.textContent = 'O Susano roxo despertou! Inimigos próximos fogem e sofrem 5 de dano por segundo. R rouba vida; L os faz lutar entre si.';
}

function activateSwordAreaSpecial() {
    if (player.specialAbilityCharges.sword < 100) {
        info.textContent = 'O golpe da espada ainda não está carregado.';
        return;
    }
    if (player.specialAbilityCooldowns.sword > 0) {
        info.textContent = `O golpe da espada recarrega em ${Math.ceil(player.specialAbilityCooldowns.sword)} s.`;
        return;
    }
    if (!swordEquipped) {
        info.textContent = 'Equipe a espada para usar o golpe especial.';
        return;
    }

    const centerX = player.x + player.size / 2;
    const centerY = player.y + player.size / 2;
    const radius = tileSize * 4;
    const targets = enemies.filter((enemy) => (
        enemy.health > 0
        && !enemy.dying
        && Math.hypot(
            enemy.x + enemy.size / 2 - centerX,
            enemy.y + enemy.size / 2 - centerY
        ) <= radius
        && hasClearMeleeAttackPath(
            centerX,
            centerY,
            enemy.x + enemy.size / 2,
            enemy.y + enemy.size / 2
        )
    ));
    if (targets.length === 0) {
        info.textContent = 'Não há inimigos no raio de quatro quadrados.';
        return;
    }

    player.specialAbilityCharges.sword = 0;
    player.specialAbilityCooldowns.sword = 3;
    player.attackTimer = playerAttackAnimationDuration;
    player.maleAttackAnimationTimer = player.character === 'man'
        ? maleAttackAnimationDuration
        : 0;
    const firstTarget = targets[0];
    const attackDirectionX = firstTarget.x + firstTarget.size / 2 - centerX;
    const attackDirectionY = firstTarget.y + firstTarget.size / 2 - centerY;
    const attackDirectionLength = Math.hypot(attackDirectionX, attackDirectionY) || 1;
    player.attackFacingX = attackDirectionX / attackDirectionLength;
    player.attackFacingY = attackDirectionY / attackDirectionLength;
    if (player.attackFacingX !== 0) {
        player.spriteFacingX = Math.sign(player.attackFacingX);
    }
    let hitCount = 0;
    let totalDamage = 0;
    for (const target of targets) {
        const result = damageEnemy(
            target,
            player.damage * 2 * getConquestAuraMultiplier(),
            centerX,
            centerY,
            false,
            'sword'
        );
        target.hitFlash = result.damage > 0 ? 0.16 : target.hitFlash;
        if (result.damage > 0) {
            hitCount += 1;
            totalDamage += result.damage;
        }
        if (target.health === 0) {
            resolveEnemyDefeat(target);
        }
    }
    updateSpecialAbilitiesHud();
    info.textContent = hitCount > 0
        ? `Golpe especial! ${hitCount} inimigo(s) atingido(s), ${totalDamage} de dano total.`
        : 'O golpe especial foi bloqueado por todos os inimigos.';
}

function activateSelectedSpecialAbility() {
    if (gameState !== 'playing' || shopOpen || botMode) {
        return;
    }
    if (selectedSpecialAbility === 'sword') {
        activateSwordAreaSpecial();
    } else {
        info.textContent = 'A aura da Conquista evolui automaticamente ao causar dano corpo a corpo.';
    }
}

function endSusanoOnDeath() {
    if (!player.susanoActive) {
        return;
    }
    player.susanoActive = false;
    updateScrollInventoryHud();
    updateSpearHud();
}

function getSusanoTargets(range = susanoAuraRadius) {
    const centerX = player.x + player.size / 2;
    const centerY = player.y + player.size / 2;
    return enemies
        .filter((enemy) => enemy.health > 0 && !enemy.dying)
        .map((enemy) => ({
            enemy,
            distance: Math.hypot(
                enemy.x + enemy.size / 2 - centerX,
                enemy.y + enemy.size / 2 - centerY
            )
        }))
        .filter(({ distance }) => distance <= range)
        .sort((first, second) => first.distance - second.distance);
}

function useSusanoLifeSteal() {
    if (!player.susanoActive) {
        attackWithSpear();
        return;
    }
    if (gameState !== 'playing' || shopOpen) {
        return;
    }
    if (player.susanoLifeStealCooldown > 0) {
        info.textContent = `O ataque de roubo de vida recarrega em ${player.susanoLifeStealCooldown.toFixed(1)} s.`;
        return;
    }

    const target = getSusanoTargets(susanoAttackRange)[0]?.enemy;
    if (!target) {
        info.textContent = 'Não há inimigos próximos para o ataque de roubo de vida.';
        return;
    }

    player.susanoLifeStealCooldown = 3;
    const directionX = target.x + target.size / 2 - (player.x + player.size / 2);
    const directionY = target.y + target.size / 2 - (player.y + player.size / 2);
    const directionLength = Math.hypot(directionX, directionY) || 1;
    player.attackFacingX = directionX / directionLength;
    player.attackFacingY = directionY / directionLength;
    const targetHealthBeforeAttack = target.health;
    const result = damageEnemy(target, player.damage * 2, undefined, undefined, true, 'melee');
    alertEnemiesToPlayerAttack(target);
    chargeSpecialAbilities(targetHealthBeforeAttack - target.health);
    target.hitFlash = result.damage > 0 ? 0.16 : target.hitFlash;
    if (result.blocked) {
        info.textContent = result.dodged
            ? 'O goblin se agachou e esquivou do ataque de roubo de vida.'
            : result.bossBlocked
                ? 'O chefe bloqueou o ataque de roubo de vida.'
                : 'O inimigo bloqueou o ataque de roubo de vida.';
        return;
    }

    const stolenHealth = Math.min(
        Math.ceil(result.damage * 0.5),
        player.maxHealth - player.health
    );
    player.health += stolenHealth;
    updateHealthHud();
    if (target.health === 0) {
        resolveEnemyDefeat(target);
    }
    info.textContent = `O Susano drenou ${result.damage} de vida${stolenHealth > 0 ? ` e restaurou ${stolenHealth} para você` : ''}.`;
}

function useSusanoConfusion() {
    if (!player.susanoActive || gameState !== 'playing' || shopOpen) {
        return;
    }
    if (player.susanoConfusionCooldown > 0) {
        info.textContent = `O ataque de confusão recarrega em ${player.susanoConfusionCooldown.toFixed(1)} s.`;
        return;
    }

    const targets = getSusanoTargets();
    if (targets.length < 2) {
        info.textContent = 'São necessários pelo menos dois inimigos próximos para fazê-los lutar entre si.';
        return;
    }

    player.susanoConfusionCooldown = 7;
    for (const { enemy } of targets) {
        enemy.susanoConfusionTimer = 5;
    }
    info.textContent = `${targets.length} inimigos foram confundidos e lutarão entre si por 5 segundos.`;
}

function updateSusanoEffects(delta) {
    if (!player.susanoActive) {
        return;
    }

    player.susanoLifeStealCooldown = Math.max(0, player.susanoLifeStealCooldown - delta);
    player.susanoConfusionCooldown = Math.max(0, player.susanoConfusionCooldown - delta);
    const centerX = player.x + player.size / 2;
    const centerY = player.y + player.size / 2;
    for (const enemy of [...enemies]) {
        if (enemy.health <= 0 || enemy.dying) {
            continue;
        }
        const distance = Math.hypot(
            enemy.x + enemy.size / 2 - centerX,
            enemy.y + enemy.size / 2 - centerY
        );
        if (distance > susanoAuraRadius) {
            enemy.susanoDamageTimer = 1;
            continue;
        }

        enemy.susanoFearTimer = 0.35;
        enemy.susanoDamageTimer -= delta;
        while (enemy.susanoDamageTimer <= 0 && enemy.health > 0) {
            enemy.susanoDamageTimer += 1;
            enemy.health = Math.max(0, enemy.health - susanoFearDamage);
            enemy.hitFlash = 0.16;
            if (enemy.health === 0) {
                resolveEnemyDefeat(enemy);
            }
        }
    }
}

function fireArrow(targetX, targetY) {
    if (
        gameState !== 'playing'
        || shopOpen
        || !bowOwned
        || swordEquipped
        || player.arrowCooldown > 0
    ) {
        return;
    }
    if (arrowAmmo <= 0) {
        info.textContent = 'Sem flechas. Compre um pacote na loja ou procure munição nos drops.';
        return;
    }

    const playerCenterX = player.x + player.size / 2;
    const playerCenterY = player.y + player.size / 2;
    const offsetX = targetX - playerCenterX;
    const offsetY = targetY - playerCenterY;
    const distance = Math.hypot(offsetX, offsetY);
    if (distance === 0) {
        return;
    }

    const directionX = offsetX / distance;
    const directionY = offsetY / distance;
    player.facingX = directionX;
    player.facingY = directionY;
    if (directionX !== 0) {
        player.spriteFacingX = Math.sign(directionX);
    }
    player.arrowCooldown = GAME_BALANCE.bow.cooldownSeconds / getConquestAuraMultiplier();
    arrowAmmo -= 1;
    updateBowHud();
    const botTracked = botMode;
    let botAttackContext = null;
    if (botTracked) {
        const aimedEnemy = enemies
            .filter((enemy) => enemy.health > 0 && !enemy.dying)
            .sort((first, second) => (
                Math.hypot(
                    first.x + first.size / 2 - targetX,
                    first.y + first.size / 2 - targetY
                )
                - Math.hypot(
                    second.x + second.size / 2 - targetX,
                    second.y + second.size / 2 - targetY
                )
            ))[0] || null;
        botAttackContext = recordBotWeaponAttempt('bow', aimedEnemy);
        botLearning.arrowsFired += 1;
    }
    const arrow = arrowPool.pop() || {};
    arrow.x = playerCenterX + directionX * 10;
    arrow.y = playerCenterY + directionY * 10;
    arrow.velocityX = directionX * GAME_BALANCE.bow.projectileSpeed;
    arrow.velocityY = directionY * GAME_BALANCE.bow.projectileSpeed;
    arrow.traveled = 0;
    arrow.maxRange = GAME_BALANCE.bow.range;
    arrow.angle = Math.atan2(directionY, directionX);
    arrow.botTracked = botTracked;
    arrow.botTargetType = botAttackContext?.type || null;
    arrow.botTactic = botAttackContext?.tactic || null;
    arrows.push(arrow);
}

function releaseArrow(arrow) {
    if (arrowPool.length < 64) {
        arrowPool.push(arrow);
    }
}

function clearPlayerArrows() {
    for (const arrow of arrows) {
        releaseArrow(arrow);
    }
    arrows.length = 0;
}

function updatePlayerArrows(delta) {
    for (let index = arrows.length - 1; index >= 0; index--) {
        const arrow = arrows[index];
        const nextX = arrow.x + arrow.velocityX * delta;
        const nextY = arrow.y + arrow.velocityY * delta;
        const stepDistance = Math.hypot(nextX - arrow.x, nextY - arrow.y);
        arrow.x = nextX;
        arrow.y = nextY;
        arrow.traveled += stepDistance;
        let shouldRelease = false;
        if (
            getTile(arrow.x, arrow.y) === '#'
            || arrow.traveled >= arrow.maxRange
        ) {
            if (arrow.botTracked) {
                recordBotWeaponOutcome('bow', false, arrow.botTargetType, arrow.botTactic);
            }
            shouldRelease = true;
        } else {
            let target = null;
            for (const enemy of enemies) {
                if (
                    enemy.health > 0
                    && !enemy.dying
                    && arrow.x >= enemy.x - 2
                    && arrow.x <= enemy.x + enemy.size + 2
                    && arrow.y >= enemy.y - 2
                    && arrow.y <= enemy.y + enemy.size + 2
                    && collisionDistanceToPoint(enemy, arrow.x, arrow.y) <= 2
                ) {
                    target = enemy;
                    break;
                }
            }
            if (target) {
                const damage = damageEnemy(
                    target,
                    getAimedWeaponDamage(GAME_BALANCE.bow.damage),
                    undefined,
                    undefined,
                    true,
                    'arrow'
                );
                alertEnemiesToPlayerAttack(target);
                if (arrow.botTracked) {
                    recordBotWeaponOutcome('bow', damage.damage > 0, target, arrow.botTactic);
                }
                recordBotCombat('bow', damage.damage, damage.blocked, target);
                target.hitFlash = 0.16;
                if (damage.blocked) {
                    info.textContent = damage.bossBlocked
                        ? 'O chefe bloqueou a flecha!'
                        : 'O inimigo ergueu o escudo e bloqueou a flecha!';
                } else if (target.health === 0) {
                    resolveEnemyDefeat(target);
                } else {
                    const reductionMessage = damage.reduced ? ' A armadura reduziu o dano.' : '';
                    const weaknessMessage = damage.bossWeakness
                        ? ' Acerto na fraqueza do chefe: dano aumentado!'
                        : '';
                    info.textContent = `A flecha acertou o inimigo: ${damage.damage} de dano.${weaknessMessage}${reductionMessage} Vida restante: ${target.health}.`;
                }
                shouldRelease = true;
            }
        }
        if (!shouldRelease) continue;
        arrows[index] = arrows[arrows.length - 1];
        arrows.pop();
        releaseArrow(arrow);
    }
}

function findSpiderWebTarget(spider, targetX, targetY) {
    const startX = spider.x + spider.size / 2;
    const startY = spider.y + spider.size / 2;
    const dx = targetX - startX;
    const dy = targetY - startY;
    const length = Math.hypot(dx, dy);
    if (length < 1) {
        return null;
    }

    const dirX = dx / length;
    const dirY = dy / length;
    const candidates = enemies
        .filter((enemy) => enemy !== spider && enemy.health > 0 && !enemy.dying)
        .map((enemy) => ({ entity: enemy, x: enemy.x + enemy.size / 2, y: enemy.y + enemy.size / 2 }))
        .concat([{ entity: player, x: targetX, y: targetY }])
        .map((candidate) => {
            const offsetX = candidate.x - startX;
            const offsetY = candidate.y - startY;
            const along = offsetX * dirX + offsetY * dirY;
            const across = Math.abs(offsetX * dirY - offsetY * dirX);
            return { ...candidate, along, across };
        })
        .filter((candidate) => candidate.along > 8
            && candidate.along <= length + 4
            && candidate.across <= getCollisionRadius(candidate.entity) + 3)
        .sort((first, second) => first.along - second.along);

    const firstTarget = candidates[0];
    if (!firstTarget) {
        return null;
    }

    const sampleCount = Math.ceil(firstTarget.along / 4);
    for (let index = 1; index < sampleCount; index++) {
        const sampleX = startX + dirX * firstTarget.along * index / sampleCount;
        const sampleY = startY + dirY * firstTarget.along * index / sampleCount;
        if (!canMoveTo(sampleX - 5, sampleY - 5, 10, 10)) {
            return null;
        }
    }

    return firstTarget.entity;
}

const goblinPotionUseThreshold = 0.5;
const goblinPotionSearchRadius = tileSize * 8;

function isGoblinEnemy(enemy) {
    return ['goblin', 'goblinRunner'].includes(enemy.creatureType);
}

function startGoblinPotionAction(enemy, drop) {
    const dropIndex = itemDrops.indexOf(drop);
    if (dropIndex < 0) {
        return false;
    }

    itemDrops.splice(dropIndex, 1);
    enemy.potionHealAmount = drop.rarity.potionHeal;
    enemy.potionAction = 'interact';
    enemy.potionActionTimer = 0.28;
    enemy.potionActionDuration = 0.28;
    enemy.moving = false;
    return true;
}

function advanceGoblinPotionAction(enemy, delta) {
    if (!enemy.potionAction) {
        return false;
    }

    let remaining = delta;
    while (enemy.potionAction && remaining >= enemy.potionActionTimer) {
        remaining -= enemy.potionActionTimer;
        if (enemy.potionAction === 'interact') {
            enemy.potionAction = 'carry';
            enemy.potionActionTimer = 0.28;
            enemy.potionActionDuration = 0.28;
        } else if (enemy.potionAction === 'carry') {
            enemy.potionAction = 'use';
            enemy.potionActionTimer = 0.72;
            enemy.potionActionDuration = 0.72;
        } else {
            enemy.health = Math.min(
                enemy.maxHealth,
                enemy.health + enemy.potionHealAmount
            );
            enemy.potionAction = null;
            enemy.potionActionTimer = 0;
            enemy.potionActionDuration = 0;
            enemy.potionHealAmount = 0;
        }
    }
    if (enemy.potionAction) {
        enemy.potionActionTimer -= remaining;
    }
    enemy.moving = false;
    enemy.animTime += getActorAnimationDelta(delta) * 0.25;
    return true;
}

function moveGoblinTowardPotion(enemy, delta) {
    if (
        !isGoblinEnemy(enemy)
        || enemy.health > enemy.maxHealth * goblinPotionUseThreshold
    ) {
        return false;
    }

    const centerX = enemy.x + enemy.size / 2;
    const centerY = enemy.y + enemy.size / 2;
    const potion = itemDrops
        .filter((drop) => drop.type === 'potion' && drop.rarity?.potionHeal > 0)
        .map((drop) => ({
            drop,
            distance: Math.hypot(drop.x - centerX, drop.y - centerY)
        }))
        .filter(({ distance }) => distance <= goblinPotionSearchRadius)
        .sort((first, second) => first.distance - second.distance)[0];
    if (!potion) {
        return false;
    }
    if (potion.distance <= 12) {
        return startGoblinPotionAction(enemy, potion.drop);
    }

    const direction = findEnemyPathDirection(enemy, potion.drop.x, potion.drop.y);
    if (direction.x === 0 && direction.y === 0) {
        return false;
    }

    const previousX = enemy.x;
    const previousY = enemy.y;
    enemy.dirX = direction.x;
    enemy.dirY = direction.y;
    enemy.facingX = direction.x;
    enemy.facingY = direction.y;
    if (direction.x !== 0) {
        enemy.spriteFacingX = Math.sign(direction.x);
    }
    const movementSpeed = enemy.speed
        * (enemy.creatureType === 'goblinRunner' ? 1.25 : 1)
        * (isEntityOnSewerWater(enemy) ? 0.6 : 1);
    const nextX = enemy.x + direction.x * movementSpeed * delta;
    const nextY = enemy.y + direction.y * movementSpeed * delta;
    if (direction.x !== 0 && canEntityMoveTo(enemy, nextX, enemy.y)) {
        enemy.x = nextX;
    }
    if (direction.y !== 0 && canEntityMoveTo(enemy, enemy.x, nextY)) {
        enemy.y = nextY;
    }
    enemy.moving = enemy.x !== previousX || enemy.y !== previousY;
    enemy.animTime += getActorAnimationDelta(delta) * (enemy.moving ? 1 : 0.25);
    return enemy.moving;
}

function isPlayerInsideFloorEncounterRoom() {
    if (!activeFloorEncounterBounds) {
        return false;
    }
    const playerTileX = Math.floor((player.x + player.size / 2) / tileSize);
    const playerTileY = Math.floor((player.y + player.size / 2) / tileSize);
    return playerTileX >= activeFloorEncounterBounds.left
        && playerTileX <= activeFloorEncounterBounds.right
        && playerTileY >= activeFloorEncounterBounds.top
        && playerTileY <= activeFloorEncounterBounds.bottom;
}

function tryActivateFloorEncounter() {
    if (activeFloorEncounterStarted) {
        return true;
    }
    if (!activeFloorEncounterId || !isPlayerInsideFloorEncounterRoom()) {
        return false;
    }
    const event = bestiaryEvents.find((entry) => entry.id === activeFloorEncounterId);
    if (!event) {
        throw new Error(`Evento de andar desconhecido: ${activeFloorEncounterId}.`);
    }
    activeFloorEncounterStarted = true;
    raceWarActive = true;
    showFloorEventNotification(event);
    return true;
}

function moveEnemy(enemy, delta) {
    enemy.hitFlash = Math.max(0, enemy.hitFlash - delta);
    enemy.painTimer = Math.max(0, enemy.painTimer - delta);
    enemy.displayHealth += (enemy.health - enemy.displayHealth) * (1 - Math.exp(-12 * delta));
    if (Math.abs(enemy.health - enemy.displayHealth) < 0.05) {
        enemy.displayHealth = enemy.health;
    }
    if (enemy.isBoss && enemy.bossType === 'dragon') {
        enemy.spriteAnimTime += getActorAnimationDelta(delta);
    }
    if (enemy.dying) {
        enemy.deathTimer -= delta;
        enemy.animTime += getActorAnimationDelta(delta);
        return;
    }
    if (devMode) {
        enemy.moving = false;
        enemy.alertedTarget = null;
        enemy.alertTimer = 0;
        enemy.attackTimer = 0;
        enemy.slamWarning = 0;
        enemy.dogPounceWarning = 0;
        enemy.sentinelBeamWarning = 0;
        enemy.veinPulseWarning = 0;
        enemy.veinPulseImpact = 0;
        enemy.scytheAttack = null;
        enemy.shadowStepWarning = 0;
        enemy.shadowStepTarget = null;
        enemy.wingSweepWarning = 0;
        enemy.wingSweepExecution = 0;
        enemy.fireballs = [];
        enemy.fireballTarget = null;
        enemy.lavaPools = [];
        enemy.thrownRocks = [];
        enemy.eruptions = [];
        enemy.animTime += getActorAnimationDelta(delta) * 0.25;
        return;
    }
    if (activeFloorEncounterId && enemy.encounterId === activeFloorEncounterId
        && !tryActivateFloorEncounter()) {
        enemy.moving = false;
        enemy.animTime += getActorAnimationDelta(delta) * 0.25;
        return;
    }
    enemy.webbedTimer = Math.max(0, (enemy.webbedTimer || 0) - delta);
    enemy.susanoFearTimer = Math.max(0, enemy.susanoFearTimer - delta);
    enemy.susanoConfusionTimer = Math.max(0, enemy.susanoConfusionTimer - delta);
    enemy.timer -= delta;
    enemy.attackTimer = Math.max(0, enemy.attackTimer - delta);
    enemy.attackCooldown = Math.max(0, enemy.attackCooldown - delta);
    enemy.defendTimer = Math.max(0, enemy.defendTimer - delta);
    enemy.dodgeTimer = Math.max(0, enemy.dodgeTimer - delta);
    enemy.dodgeCooldown = Math.max(0, enemy.dodgeCooldown - delta);
    enemy.jumpTimer = Math.max(0, enemy.jumpTimer - delta);
    if (enemy.attackWarningTimer > 0) {
        enemy.attackWarningTimer = Math.max(0, enemy.attackWarningTimer - delta);
        if (enemy.attackWarningTimer === 0) {
            enemy.attackReady = collisionBoundsOverlap(player, enemy);
        }
    }
    enemy.spiderLeapCooldown = Math.max(0, enemy.spiderLeapCooldown - delta);
    enemy.spiderWebCooldown = Math.max(0, (enemy.spiderWebCooldown || 0) - delta);
    enemy.matriarchBroodWarning = Math.max(0, (enemy.matriarchBroodWarning || 0) - delta);
    enemy.runnerLungeCooldown = Math.max(0, (enemy.runnerLungeCooldown || 0) - delta);
    enemy.runnerRetreatTimer = Math.max(0, (enemy.runnerRetreatTimer || 0) - delta);
    enemy.echoWaveCooldown = Math.max(0, (enemy.echoWaveCooldown || 0) - delta);
    enemy.tailSweepCooldown = Math.max(0, (enemy.tailSweepCooldown || 0) - delta);
    enemy.glyphCooldown = Math.max(0, (enemy.glyphCooldown || 0) - delta);
    enemy.shoulderBashCooldown = Math.max(0, (enemy.shoulderBashCooldown || 0) - delta);
    enemy.toxicBiteCooldown = Math.max(0, (enemy.toxicBiteCooldown || 0) - delta);
    enemy.slamImpactTimer = Math.max(0, enemy.slamImpactTimer - delta);
    if (enemy.isBoss) {
        enemy.weaknessTimer = Math.max(0, enemy.weaknessTimer - delta);
    }
    enemy.dogPounceCooldown = Math.max(0, (enemy.dogPounceCooldown || 0) - delta);
    enemy.sentinelBeamCooldown = Math.max(0, (enemy.sentinelBeamCooldown || 0) - delta);
    enemy.veinPulseCooldown = Math.max(0, (enemy.veinPulseCooldown || 0) - delta);
    enemy.veinPulseImpact = Math.max(0, (enemy.veinPulseImpact || 0) - delta);
    enemy.shieldTurnTimer = Math.max(0, enemy.shieldTurnTimer - delta);
    enemy.shieldBrokenTimer = Math.max(0, enemy.shieldBrokenTimer - delta);
    enemy.combatAlertTimer = Math.max(0, (enemy.combatAlertTimer || 0) - delta);
    enemy.fleeHideCooldown = Math.max(0, (enemy.fleeHideCooldown || 0) - delta);
    enemy.fleeHideTimer = Math.max(0, (enemy.fleeHideTimer || 0) - delta);
    enemy.alertTimer = Math.max(0, enemy.alertTimer - delta);
    if (enemy.combatAlertTimer > 0) {
        enemy.alertedTarget = {
            x: player.x + player.size / 2,
            y: player.y + player.size / 2
        };
        enemy.alertTimer = Math.max(enemy.alertTimer, 0.25);
    }
    if (enemy.alertTimer === 0) {
        enemy.alertedTarget = null;
    }
    if (enemy.webbedTimer > 0) {
        enemy.moving = false;
        enemy.animTime += getActorAnimationDelta(delta) * 0.25;
        return;
    }

    if (enemy.dodgeTimer > 0) {
        enemy.moving = false;
        enemy.animTime += getActorAnimationDelta(delta) * 0.25;
        return;
    }

    if (enemy.attackWarningTimer > 0) {
        enemy.moving = false;
        enemy.animTime += getActorAnimationDelta(delta) * 0.25;
        return;
    }

    if (enemy.isBoss && enemy.weaknessTimer > 0) {
        enemy.moving = false;
        enemy.attackTimer = 0;
        enemy.animTime += getActorAnimationDelta(delta) * 0.25;
        return;
    }

    if (activeFloorEncounterId && enemy.encounterId === activeFloorEncounterId) {
        updateRaceWarStatus();
        if (raceWarActive) {
            moveEnemyDuringRaceWar(enemy, delta);
            return;
        }
    } else if (raceWarActive && !activeFloorEncounterId) {
        updateRaceWarStatus();
        if (raceWarActive) {
            moveEnemyDuringRaceWar(enemy, delta);
            return;
        }
    }
    if (enemy.susanoConfusionTimer > 0) {
        moveEnemyDuringRaceWar(enemy, delta);
        return;
    }

    if (advanceGoblinPotionAction(enemy, delta) || moveGoblinTowardPotion(enemy, delta)) {
        return;
    }

    if (enemy.fleeHideTimer > 0) {
        enemy.moving = false;
        enemy.animTime += getActorAnimationDelta(delta) * 0.25;
        return;
    }
    if (enemy.fleeHideTarget) {
        const hideDx = enemy.fleeHideTarget.x - (enemy.x + enemy.size / 2);
        const hideDy = enemy.fleeHideTarget.y - (enemy.y + enemy.size / 2);
        const hideDistance = Math.hypot(hideDx, hideDy);
        if (hideDistance <= 8) {
            enemy.fleeHideTarget = null;
            enemy.fleeHideTimer = 3.5;
            enemy.alertedTarget = null;
            enemy.alertTimer = 0;
            enemy.moving = false;
            enemy.animTime += getActorAnimationDelta(delta) * 0.25;
            return;
        }

        const direction = findEnemyPathDirection(
            enemy,
            enemy.fleeHideTarget.x,
            enemy.fleeHideTarget.y
        );
        if (direction.x === 0 && direction.y === 0) {
            enemy.fleeHideTarget = null;
            enemy.combatAlertTimer = 8;
            enemy.alertedTarget = {
                x: player.x + player.size / 2,
                y: player.y + player.size / 2
            };
            enemy.alertTimer = 8;
            enemy.attackCooldown = Math.min(enemy.attackCooldown, 0.3);
        } else {
            const previousX = enemy.x;
            const previousY = enemy.y;
            enemy.dirX = direction.x;
            enemy.dirY = direction.y;
            enemy.facingX = direction.x;
            enemy.facingY = direction.y;
            if (direction.x !== 0) {
                enemy.spriteFacingX = Math.sign(direction.x);
            }
            const movementSpeed = enemy.speed
                * 1.35
                * (isEntityOnSewerWater(enemy) ? 0.6 : 1);
            const nextX = enemy.x + direction.x * movementSpeed * delta;
            const nextY = enemy.y + direction.y * movementSpeed * delta;
            if (direction.x !== 0 && canEntityMoveTo(enemy, nextX, enemy.y)) {
                enemy.x = nextX;
            }
            if (direction.y !== 0 && canEntityMoveTo(enemy, enemy.x, nextY)) {
                enemy.y = nextY;
            }
            enemy.moving = enemy.x !== previousX || enemy.y !== previousY;
            enemy.animTime += getActorAnimationDelta(delta) * (enemy.moving ? 1 : 0.25);
            return;
        }
    }

    const dx = player.x + player.size / 2 - (enemy.x + enemy.size / 2);
    const dy = player.y + player.size / 2 - (enemy.y + enemy.size / 2);
    const distance = Math.hypot(dx, dy);
    if (distance <= 200
        && (!enemy.secretChamberGuard || secretMatriarchChamber?.open)) {
        discoverBestiaryCreature(enemy.creatureType || enemy.bossType);
    }
    enemy.shieldRaised = false;
    if (enemy.creatureType === 'veinBat' && enemy.echoWaveWarning > 0) {
        enemy.echoWaveWarning = Math.max(0, enemy.echoWaveWarning - delta);
        enemy.moving = false;
        if (enemy.echoWaveWarning === 0) {
            const attack = getCreatureAttackData(enemy, 'echo-wave');
            const offsetX = player.x + player.size / 2 - (enemy.x + enemy.size / 2);
            const offsetY = player.y + player.size / 2 - (enemy.y + enemy.size / 2);
            const along = offsetX * enemy.echoWaveDirectionX + offsetY * enemy.echoWaveDirectionY;
            const across = Math.abs(
                offsetX * enemy.echoWaveDirectionY - offsetY * enemy.echoWaveDirectionX
            );
            if (
                along > 0 && along <= attack.range
                && across <= attack.radius + player.size / 2
                && hasClearMeleeAttackPath(
                    enemy.x + enemy.size / 2,
                    enemy.y + enemy.size / 2,
                    player.x + player.size / 2,
                    player.y + player.size / 2
                )
            ) {
                damagePlayer(Math.max(1, Math.round(enemy.damage * attack.damage)),
                    'A onda sônica do morcego do veio atingiu você.', enemy.creatureType);
            }
            playCreatureSound(enemy.creatureType, 'attack');
        }
        enemy.animTime += getActorAnimationDelta(delta) * 0.25;
        return;
    }
    if (enemy.creatureType === 'basaltLizard' && enemy.tailSweepWarning > 0) {
        enemy.tailSweepWarning = Math.max(0, enemy.tailSweepWarning - delta);
        enemy.moving = false;
        if (enemy.tailSweepWarning === 0) {
            const attack = getCreatureAttackData(enemy, 'tail-sweep');
            if (collisionDistanceToPoint(
                player,
                enemy.x + enemy.size / 2,
                enemy.y + enemy.size / 2
            ) <= attack.range + player.size / 2) {
                const damaged = damagePlayer(
                    Math.max(1, Math.round(enemy.damage * attack.damage)),
                    'A varrida da cauda do lagarto de basalto atingiu você.',
                    enemy.creatureType
                );
                if (damaged) {
                    const pushX = player.x + enemy.facingX * 9;
                    const pushY = player.y + enemy.facingY * 9;
                    if (canEntityMoveTo(player, pushX, pushY)) {
                        player.x = pushX;
                        player.y = pushY;
                    }
                }
            }
            playCreatureSound(enemy.creatureType, 'attack');
        }
        enemy.animTime += getActorAnimationDelta(delta) * 0.25;
        return;
    }
    if (enemy.creatureType === 'facelessScribe' && enemy.glyphWarning > 0) {
        enemy.glyphWarning = Math.max(0, enemy.glyphWarning - delta);
        enemy.moving = false;
        if (enemy.glyphWarning === 0) {
            const attack = getCreatureAttackData(enemy, 'ground-glyph');
            if (collisionDistanceToPoint(player, enemy.glyphTargetX, enemy.glyphTargetY)
                <= attack.radius + player.size / 2) {
                damagePlayer(
                    Math.max(1, Math.round(enemy.damage * attack.damage)),
                    'O glifo do escriba sem rosto explodiu sob seus pés.',
                    enemy.creatureType
                );
            }
            playCreatureSound(enemy.creatureType, 'attack');
        }
        enemy.animTime += getActorAnimationDelta(delta) * 0.25;
        return;
    }
    if (enemy.behaviorProfile === 'toxicRaider' && enemy.toxicBiteWarning > 0) {
        enemy.toxicBiteWarning = Math.max(0, enemy.toxicBiteWarning - delta);
        enemy.moving = false;
        enemy.animTime += getActorAnimationDelta(delta) * 0.25;
        if (enemy.toxicBiteWarning === 0 && collisionBoundsOverlap(player, enemy)) {
            const attack = getCreatureAttackData(enemy, 'toxic-bite');
            const didDamage = damagePlayer(
                Math.round(enemy.damage * attack.damage),
                'A mordida tóxica do troll atingiu você.',
                enemy.creatureType
            );
            if (didDamage && attack.status.type === 'poison') {
                applyCreatureStatus(attack.status);
                enemy.hasPoisonedPlayer = true;
            }
            playCreatureSound(enemy.creatureType, 'attack');
        }
        return;
    }

    if (enemy.behaviorProfile === 'siegeBrute' && enemy.shoulderBashWarning > 0) {
        enemy.shoulderBashWarning = Math.max(0, enemy.shoulderBashWarning - delta);
        enemy.moving = false;
        enemy.animTime += getActorAnimationDelta(delta) * 0.25;
        if (enemy.shoulderBashWarning === 0) {
            const attack = getCreatureAttackData(enemy, 'shoulder-bash');
            const travel = Math.min(attack.range * 0.6, distance);
            const moveX = dx / (distance || 1) * travel;
            const moveY = dy / (distance || 1) * travel;
            const steps = Math.max(1, Math.ceil(travel / 4));
            const previousX = enemy.x;
            const previousY = enemy.y;
            for (let step = 0; step < steps; step += 1) {
                const nextX = enemy.x + moveX / steps;
                const nextY = enemy.y + moveY / steps;
                if (!canEntityMoveTo(enemy, nextX, nextY)) break;
                enemy.x = nextX;
                enemy.y = nextY;
            }
            enemy.moving = enemy.x !== previousX || enemy.y !== previousY;
            if (collisionBoundsOverlap(player, enemy)) {
                const damage = Math.round(enemy.damage * attack.damage);
                const damaged = damagePlayer(
                    damage,
                    `O empurrão de ombro do ogro causou ${damage} de dano.`,
                    enemy.creatureType
                );
                if (damaged) {
                    const pushDistance = 10;
                    const pushX = player.x + dx / (distance || 1) * pushDistance;
                    const pushY = player.y + dy / (distance || 1) * pushDistance;
                    if (canEntityMoveTo(player, pushX, pushY)) {
                        player.x = pushX;
                        player.y = pushY;
                    }
                }
                playCreatureSound(enemy.creatureType, 'attack');
            }
        }
        return;
    }
    if (enemy.susanoFearTimer > 0) {
        const directions = [
            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: -1 },
            { x: 1, y: 1 },
            { x: 1, y: -1 },
            { x: -1, y: 1 },
            { x: -1, y: -1 }
        ].sort((first, second) => (
            (second.x * -dx + second.y * -dy) - (first.x * -dx + first.y * -dy)
        ));
        const retreatDirection = directions.find((direction) => canEntityMoveTo(
            enemy,
            enemy.x + direction.x * 6,
            enemy.y + direction.y * 6
        ));
        if (retreatDirection) {
            const movementSpeed = enemy.speed
                * 1.4
                * (isEntityOnSewerWater(enemy) ? 0.6 : 1);
            const previousX = enemy.x;
            const previousY = enemy.y;
            enemy.dirX = retreatDirection.x;
            enemy.dirY = retreatDirection.y;
            enemy.facingX = retreatDirection.x;
            enemy.facingY = retreatDirection.y;
            if (retreatDirection.x !== 0) {
                enemy.spriteFacingX = retreatDirection.x;
            }
            const nextX = enemy.x + retreatDirection.x * movementSpeed * delta;
            const nextY = enemy.y + retreatDirection.y * movementSpeed * delta;
            if (retreatDirection.x !== 0 && canEntityMoveTo(enemy, nextX, enemy.y)) {
                enemy.x = nextX;
            }
            if (retreatDirection.y !== 0 && canEntityMoveTo(enemy, enemy.x, nextY)) {
                enemy.y = nextY;
            }
            enemy.moving = enemy.x !== previousX || enemy.y !== previousY;
        } else {
            enemy.moving = false;
        }
        enemy.animTime += getActorAnimationDelta(delta) * (enemy.moving ? 1 : 0.25);
        return;
    }

    if (enemy.behaviorProfile === 'courierSkirmisher' && enemy.runnerRetreatTimer > 0) {
        const retreatDirections = [
            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: -1 }
        ].sort((first, second) => (
            (second.x * -dx + second.y * -dy) - (first.x * -dx + first.y * -dy)
        ));
        const retreatDirection = retreatDirections.find((direction) => canEntityMoveTo(
            enemy,
            enemy.x + direction.x * 8,
            enemy.y + direction.y * 8
        ));
        if (retreatDirection) {
            enemy.dirX = retreatDirection.x;
            enemy.dirY = retreatDirection.y;
            enemy.facingX = retreatDirection.x;
            enemy.facingY = retreatDirection.y;
            if (retreatDirection.x !== 0) {
                enemy.spriteFacingX = retreatDirection.x;
            }
            const previousX = enemy.x;
            const previousY = enemy.y;
            const movementSpeed = enemy.speed * 1.2;
            if (retreatDirection.x !== 0 && canEntityMoveTo(
                enemy,
                enemy.x + retreatDirection.x * movementSpeed * delta,
                enemy.y
            )) {
                enemy.x += retreatDirection.x * movementSpeed * delta;
            }
            if (retreatDirection.y !== 0 && canEntityMoveTo(
                enemy,
                enemy.x,
                enemy.y + retreatDirection.y * movementSpeed * delta
            )) {
                enemy.y += retreatDirection.y * movementSpeed * delta;
            }
            enemy.moving = enemy.x !== previousX || enemy.y !== previousY;
        } else {
            enemy.moving = false;
        }
        enemy.animTime += getActorAnimationDelta(delta) * (enemy.moving ? 1 : 0.25);
        return;
    }

    if (enemy.behaviorProfile === 'courierSkirmisher' && enemy.runnerLungeWarning > 0) {
        enemy.runnerLungeWarning = Math.max(0, enemy.runnerLungeWarning - delta);
        enemy.moving = false;
        enemy.animTime += getActorAnimationDelta(delta) * 0.25;
        if (enemy.runnerLungeWarning === 0) {
            const previousX = enemy.x;
            const previousY = enemy.y;
            enemy.jumpTimer = 0.36;
            const attack = getCreatureAttackData(enemy, 'passing-thrust');
            const leapX = enemy.runnerLungeX * attack.range * 0.47;
            const leapY = enemy.runnerLungeY * attack.range * 0.47;
            const steps = Math.max(1, Math.ceil(Math.hypot(leapX, leapY) / 4));
            for (let step = 0; step < steps; step += 1) {
                const nextX = enemy.x + leapX / steps;
                const nextY = enemy.y + leapY / steps;
                if (!canEntityMoveTo(enemy, nextX, nextY)) break;
                enemy.x = nextX;
                enemy.y = nextY;
            }
            enemy.moving = enemy.x !== previousX || enemy.y !== previousY;
            if (collisionBoundsOverlap(player, enemy)) {
                damagePlayer(
                    enemy.damage,
                    `A estocada do goblin corredor causou ${enemy.damage} de dano.`,
                    enemy.creatureType
                );
                enemy.attackTimer = 0.24;
                enemy.runnerRetreatTimer = attack.recovery;
            }
        }
        return;
    }

    if (
        enemy.behaviorProfile === 'courierSkirmisher'
        && distance >= 20 && distance <= 72
        && enemy.runnerLungeCooldown <= 0
    ) {
        const attack = getCreatureAttackData(enemy, 'passing-thrust');
        enemy.runnerLungeWarning = attack.warning;
        enemy.runnerLungeCooldown = attack.cooldown;
        playCreatureSound(enemy.creatureType, 'warning');
        enemy.runnerLungeX = dx / distance;
        enemy.runnerLungeY = dy / distance;
        enemy.facingX = enemy.runnerLungeX;
        enemy.facingY = enemy.runnerLungeY;
        if (Math.abs(enemy.facingX) > 0.1) {
            enemy.spriteFacingX = Math.sign(enemy.facingX);
        }
        enemy.moving = false;
        return;
    }

    if (enemy.behaviorProfile === 'ashFlanker' && enemy.dogPounceWarning > 0) {
        enemy.dogPounceWarning = Math.max(0, enemy.dogPounceWarning - delta);
        enemy.moving = false;
        enemy.animTime += getActorAnimationDelta(delta) * 0.25;
        if (enemy.dogPounceWarning === 0) {
            const previousX = enemy.x;
            const previousY = enemy.y;
            const attack = getCreatureAttackData(enemy, 'flank-bite');
            const leapX = enemy.dogPounceX * attack.range * 0.53;
            const leapY = enemy.dogPounceY * attack.range * 0.53;
            const steps = Math.max(1, Math.ceil(Math.hypot(leapX, leapY) / 4));
            for (let step = 0; step < steps; step += 1) {
                const nextX = enemy.x + leapX / steps;
                const nextY = enemy.y + leapY / steps;
                if (!canEntityMoveTo(enemy, nextX, nextY)) {
                    break;
                }
                enemy.x = nextX;
                enemy.y = nextY;
            }
            enemy.moving = enemy.x !== previousX || enemy.y !== previousY;
            if (collisionBoundsOverlap(player, enemy)) {
                const playerFacingDot = player.facingX * -enemy.dogPounceX
                    + player.facingY * -enemy.dogPounceY;
                const damage = Math.round(
                    enemy.damage * attack.damage * (playerFacingDot < -0.2 ? 1 : 1 / 1.5)
                );
                damagePlayer(
                    damage,
                    `O cão de fuligem saltou sobre você${damage > enemy.damage ? ' pelas costas' : ''} e causou ${damage} de dano.`,
                    enemy.creatureType
                );
            }
        }
        return;
    }

    if (enemy.behaviorProfile === 'stainedGuardian' && enemy.sentinelBeamWarning > 0) {
        enemy.sentinelBeamWarning = Math.max(0, enemy.sentinelBeamWarning - delta);
        enemy.moving = false;
        enemy.animTime += getActorAnimationDelta(delta) * 0.25;
        if (enemy.sentinelBeamWarning === 0) {
            const beamX = enemy.sentinelBeamDirectionX;
            const beamY = enemy.sentinelBeamDirectionY;
            const playerX = player.x + player.size / 2 - (enemy.x + enemy.size / 2);
            const playerY = player.y + player.size / 2 - (enemy.y + enemy.size / 2);
            const along = playerX * beamX + playerY * beamY;
            const across = Math.abs(playerX * beamY - playerY * beamX);
            if (
                along > 0
                && along <= getCreatureAttackData(enemy, 'light-lance').range
                && across <= getCreatureAttackData(enemy, 'light-lance').radius
                && hasClearMeleeAttackPath(
                    enemy.x + enemy.size / 2,
                    enemy.y + enemy.size / 2,
                    player.x + player.size / 2,
                    player.y + player.size / 2
                )
            ) {
                const damage = Math.round(
                    enemy.damage * getCreatureAttackData(enemy, 'light-lance').damage
                );
                damagePlayer(
                    damage,
                    `A lança de luz da sentinela causou ${damage} de dano.`,
                    enemy.creatureType
                );
            }
        }
        return;
    }

    if (enemy.isBoss && enemy.bossType === 'throneGuardian' && enemy.veinPulseWarning > 0) {
        enemy.veinPulseWarning = Math.max(0, enemy.veinPulseWarning - delta);
        enemy.moving = false;
        enemy.animTime += getActorAnimationDelta(delta) * 0.25;
        if (enemy.veinPulseWarning === 0) {
            enemy.veinPulseImpact = 0.32;
            const attack = getCreatureAttackData(enemy, 'vein-pulse');
            const radius = enemy.phaseTwo ? 94 : attack.radius;
            const damage = Math.round(enemy.damage * attack.damage);
            if (collisionDistanceToPoint(player, enemy.x + enemy.size / 2, enemy.y + enemy.size / 2) <= radius) {
                damagePlayer(damage, `O pulso do veio atingiu você e causou ${damage} de dano.`, enemy.bossType);
            }
            playCreatureSound(enemy.bossType, 'attack');
        }
        return;
    }

    if (enemy.isBoss && enemy.bossType === 'grimReaper' && enemy.shadowStepWarning > 0) {
        enemy.moving = false;
        enemy.animTime += getActorAnimationDelta(delta) * 0.25;
        return;
    }

    if (enemy.isBoss && enemy.bossType === 'grimReaper' && enemy.scytheAttack) {
        enemy.facingX = enemy.scytheAttack.directionX;
        enemy.facingY = enemy.scytheAttack.directionY;
        enemy.moving = false;
        enemy.animTime += getActorAnimationDelta(delta);
        return;
    }
    if (enemy.behaviorProfile === 'siegeBrute' && enemy.slamWarning > 0) {
        enemy.slamWarning = Math.max(0, enemy.slamWarning - delta);
        enemy.moving = false;
        enemy.animTime += getActorAnimationDelta(delta) * 0.25;
        if (enemy.slamWarning === 0) {
            enemy.slamImpactTimer = 0.3;
            const sourceX = enemy.x + enemy.size / 2;
            const sourceY = enemy.y + enemy.size / 2;
            const attack = getCreatureAttackData(enemy, 'siege-slam');
            if (collisionDistanceToPoint(player, sourceX, sourceY) <= attack.radius) {
                const slamDamageMultiplier = attack.damage;
                const slamDamage = Math.round(enemy.damage * slamDamageMultiplier);
                const didDamage = damagePlayer(
                    slamDamage,
                    `A pancada do ogro acertou você e causou ${slamDamage} de dano.`,
                    enemy.creatureType
                );
                if (didDamage) {
                    const directionX = (player.x + player.size / 2) - sourceX;
                    const directionY = (player.y + player.size / 2) - sourceY;
                    const length = Math.hypot(directionX, directionY) || 1;
                    const pushX = player.x + directionX / length * 10;
                    const pushY = player.y + directionY / length * 10;
                    if (canEntityMoveTo(player, pushX, pushY)) {
                        player.x = pushX;
                        player.y = pushY;
                    }
                }
            }
            for (const target of [...enemies]) {
                if (target === enemy || target.health <= 0 || target.dying) {
                    continue;
                }
                if (collisionDistanceToPoint(target, sourceX, sourceY) > attack.radius) {
                    continue;
                }
                alertEnemiesToPlayerAttack(target);
                const result = damageEnemy(
                    target,
                    Math.max(1, Math.round(enemy.damage * 0.6)),
                    sourceX,
                    sourceY,
                    false
                );
                tryStartRaceWar();
                if (result.damage > 0) {
                    target.hitFlash = 0.16;
                    if (target.health === 0) {
                        resolveEnemyDefeat(target);
                    }

                }
            }
        }
        return;
    }

    if (['caveAmbusher', 'sootAmbusher', 'broodMatriarch'].includes(enemy.behaviorProfile)) {
        if (enemy.spiderWebTimer > 0) {
            enemy.spiderWebTimer = Math.max(0, enemy.spiderWebTimer - delta);
            enemy.moving = false;
            enemy.animTime += getActorAnimationDelta(delta) * 0.25;
            if (enemy.spiderWebTimer === 0 && enemy.spiderWebTarget) {
                const attackId = enemy.creatureType === 'matriarch'
                    ? 'web-capture'
                    : enemy.creatureType === 'sootSpider' ? 'soot-thread' : 'capture-thread';
                const attack = getCreatureAttackData(enemy, attackId);
                const target = enemy.spiderWebTarget;
                const targetEntity = target.entity;
                const targetX = target.x + target.size / 2;
                const targetY = target.y + target.size / 2;
                const currentX = targetEntity.x + targetEntity.size / 2;
                const currentY = targetEntity.y + targetEntity.size / 2;
                if (Math.hypot(currentX - targetX, currentY - targetY) <= attack.radius + targetEntity.size / 2) {
                    targetEntity.webbedTimer = Math.max(
                        targetEntity.webbedTimer || 0,
                        attack.status.duration
                    );
                }
                enemy.spiderWebTarget = null;
                playCreatureSound(enemy.creatureType, 'attack');
            }
            return;
        }
        if (enemy.spiderLeapTimer > 0) {
            enemy.spiderLeapTimer = Math.max(0, enemy.spiderLeapTimer - delta);
            enemy.moving = false;
            enemy.animTime += getActorAnimationDelta(delta) * 0.25;
            if (enemy.spiderLeapTimer === 0) {
                const attackId = enemy.creatureType === 'matriarch'
                    ? 'collapse-leap'
                    : enemy.creatureType === 'sootSpider' ? 'abrasive-leap' : 'rift-leap';
                const attack = getCreatureAttackData(enemy, attackId);
                const leapDistance = Math.hypot(enemy.spiderLeapX, enemy.spiderLeapY);
                const steps = Math.max(1, Math.ceil(leapDistance / 4));
                const stepX = enemy.spiderLeapX / steps;
                const stepY = enemy.spiderLeapY / steps;
                const previousX = enemy.x;
                const previousY = enemy.y;
                for (let step = 0; step < steps; step++) {
                    let moved = false;
                    if (canEntityMoveTo(enemy, enemy.x + stepX, enemy.y)) {
                        enemy.x += stepX;
                        moved = true;
                    }
                    if (canEntityMoveTo(enemy, enemy.x, enemy.y + stepY)) {
                        enemy.y += stepY;
                        moved = true;
                    }
                    if (!moved) {
                        break;
                    }
                }
                enemy.moving = enemy.x !== previousX || enemy.y !== previousY;
                enemy.attackTimer = 0.24;
                if (collisionBoundsOverlap(player, enemy)) {
                    const damage = Math.round(enemy.damage * attack.damage);
                    damagePlayer(
                        damage,
                        `A aranha saltou sobre você e causou ${damage} de dano!`,
                        enemy.creatureType
                    );
                }
                playCreatureSound(enemy.creatureType, 'attack');
            }
            return;
        }
        if (!enemy.isBoss
            && distance > enemy.size + 16
            && distance <= enemy.meleeRange
            && enemy.spiderWebCooldown <= 0) {
            const attackId = enemy.creatureType === 'matriarch'
                ? 'web-capture'
                : enemy.creatureType === 'sootSpider' ? 'soot-thread' : 'capture-thread';
            const attack = getCreatureAttackData(enemy, attackId);
            const targetX = player.x + player.size / 2;
            const targetY = player.y + player.size / 2;
            const webTarget = findSpiderWebTarget(enemy, targetX, targetY);
            enemy.spiderWebCooldown = attack.cooldown;
            if (webTarget) {
                playCreatureSound(enemy.creatureType, 'warning');
                enemy.spiderWebTarget = {
                    entity: webTarget,
                    x: webTarget.x,
                    y: webTarget.y,
                    size: webTarget.size
                };
                enemy.spiderWebTimer = attack.warning + attack.execution;
                enemy.facingX = dx / distance;
                enemy.facingY = dy / distance;
                if (Math.abs(enemy.facingX) > 0.1) {
                    enemy.spriteFacingX = Math.sign(enemy.facingX);
                }
                enemy.moving = false;
                return;
            }
        }
        const leapId = enemy.creatureType === 'matriarch'
            ? 'collapse-leap'
            : enemy.creatureType === 'sootSpider' ? 'abrasive-leap' : 'rift-leap';
        const leapAttack = getCreatureAttackData(enemy, leapId);
        if (distance >= 20 && distance <= leapAttack.range && enemy.spiderLeapCooldown <= 0) {
            const leapDistance = Math.min(leapAttack.travel, Math.max(0, distance - 8));
            enemy.spiderLeapX = dx / distance * leapDistance;
            enemy.spiderLeapY = dy / distance * leapDistance;
            enemy.spiderLeapTimer = leapAttack.warning + leapAttack.execution;
            enemy.spiderLeapCooldown = leapAttack.cooldown;
            enemy.attackCooldown = Math.max(enemy.attackCooldown, enemy.spiderLeapCooldown);
            enemy.facingX = dx / distance;
            enemy.facingY = dy / distance;
            if (Math.abs(enemy.facingX) > 0.1) {
                enemy.spriteFacingX = Math.sign(enemy.facingX);
            }
            enemy.moving = false;
            enemy.animTime += getActorAnimationDelta(delta) * 0.25;
            return;
        }
    }

    if (enemy.isMiniBoss
        && !enemy.matriarchBroodReleased
        && enemy.health <= enemy.maxHealth * matriarchArenaConfig.phaseTwoHealthRatio) {
        if (!enemy.matriarchBroodWarningStarted) {
            enemy.matriarchBroodWarningStarted = true;
            enemy.matriarchBroodWarning = 0.9;
            if (enemy.creatureType === 'matriarch'
                && currentFloor === matriarchArenaConfig.floor
                && matriarchArena) {
                matriarchArena.phaseTwoActive = true;
            }
            enemy.moving = false;
            playCreatureSound(enemy.creatureType, 'warning');
            info.textContent = 'A Matriarca recua; os túneis laterais tremem antes da ninhada sair.';
            return;
        }
        if (enemy.matriarchBroodWarning > 0) {
            enemy.moving = false;
            return;
        }
        enemy.matriarchBroodReleased = true;
        const usesMatriarchTunnels = enemy.creatureType === 'matriarch'
            && currentFloor === matriarchArenaConfig.floor
            && matriarchArena;
        const spawnRadius = tileSize * (usesMatriarchTunnels ? 8 : 4);
        const openTiles = findOpenTiles().filter((tile) => (
            Math.hypot(
                (tile.x + 0.5) * tileSize - (enemy.x + enemy.size / 2),
                (tile.y + 0.5) * tileSize - (enemy.y + enemy.size / 2)
            ) <= spawnRadius
            && Math.hypot(
                (tile.x + 0.5) * tileSize - (player.x + player.size / 2),
                (tile.y + 0.5) * tileSize - (player.y + player.size / 2)
            ) >= tileSize * 2
            && enemies.every((other) => (
                other === enemy
                || other.health <= 0
                || Math.hypot(
                    (tile.x + 0.5) * tileSize - (other.x + other.size / 2),
                    (tile.y + 0.5) * tileSize - (other.y + other.size / 2)
                ) >= tileSize
            ))
        ));
        if (usesMatriarchTunnels) {
            matriarchArena.phaseTwoActive = true;
        }
        const tunnelTiles = usesMatriarchTunnels
            ? matriarchArena.tunnels
                .filter((tunnel, index) => !matriarchArena.broodSacsDestroyed.includes(index))
                .map((tunnel) => tunnel.spawn)
                .filter((tile) => (
                    openTiles.some((candidate) => candidate.x === tile.x && candidate.y === tile.y)
                ))
            : openTiles;
        const broodCount = usesMatriarchTunnels ? matriarchArenaConfig.broodCount : 2;
        const broodTiles = tunnelTiles.slice(0, broodCount);
        for (const tile of broodTiles) {
            const spider = createEnemy(tile.x, tile.y, chooseOreDrop(), 'spider');
            spider.summonedByMatriarch = true;
            enemies.push(spider);
        }
        if (broodTiles.length > 0) {
            info.textContent = `A Matriarca do Tear libertou ${broodTiles.length} jovem(ns) da ninhada!`;
        } else if (usesMatriarchTunnels) {
            info.textContent = 'A Matriarca chama a ninhada, mas os casulos nas paredes foram destruídos.';
        }
    }

    if (
        enemy.behaviorProfile === 'ashFlanker'
        && distance >= 30 && distance <= 88
        && enemy.dogPounceCooldown <= 0
    ) {
        const attack = getCreatureAttackData(enemy, 'flank-bite');
        enemy.dogPounceWarning = attack.warning;
        enemy.dogPounceCooldown = attack.cooldown;
        playCreatureSound(enemy.creatureType, 'warning');
        enemy.dogPounceX = dx / distance;
        enemy.dogPounceY = dy / distance;
        enemy.facingX = enemy.dogPounceX;
        enemy.facingY = enemy.dogPounceY;
        if (Math.abs(enemy.facingX) > 0.1) {
            enemy.spriteFacingX = Math.sign(enemy.facingX);
        }
        enemy.moving = false;
        return;
    }

    if (
        enemy.behaviorProfile === 'stainedGuardian'
        && distance >= 44 && distance <= 155
        && enemy.sentinelBeamCooldown <= 0
    ) {
        const attack = getCreatureAttackData(enemy, 'light-lance');
        enemy.sentinelBeamWarning = attack.warning;
        enemy.sentinelBeamCooldown = attack.cooldown;
        playCreatureSound(enemy.creatureType, 'warning');
        enemy.sentinelBeamDirectionX = dx / distance;
        enemy.sentinelBeamDirectionY = dy / distance;
        enemy.facingX = enemy.sentinelBeamDirectionX;
        enemy.facingY = enemy.sentinelBeamDirectionY;
        if (Math.abs(enemy.facingX) > 0.1) {
            enemy.spriteFacingX = Math.sign(enemy.facingX);
        }
        enemy.moving = false;
        return;
    }

    if (
        enemy.isBoss && enemy.bossType === 'throneGuardian'
        && distance <= 124 && enemy.veinPulseCooldown <= 0
    ) {
        const attack = getCreatureAttackData(enemy, 'vein-pulse');
        enemy.veinPulseWarning = attack.warning
            * (enemy.phaseThree
                ? GAME_BALANCE.bosses.finalPhasePulseWarningMultiplier
                : enemy.phaseTwo ? 0.8 : 1);
        enemy.veinPulseCooldown = attack.cooldown
            * (enemy.phaseThree
                ? GAME_BALANCE.bosses.finalPhasePulseCooldownMultiplier
                : enemy.phaseTwo ? 1 : 1.32);
        playCreatureSound(enemy.bossType, 'warning');
        enemy.facingX = dx / (distance || 1);
        enemy.facingY = dy / (distance || 1);
        enemy.moving = false;
        return;
    }

    const trollRetreating = enemy.behaviorProfile === 'toxicRaider'
        && enemy.hasPoisonedPlayer
        && player.poisonTimer > 0
        && distance > 26;
    const sentinelAlly = enemy.behaviorProfile === 'stainedGuardian' && distance > 110
        ? enemies.find((ally) => (
            ally !== enemy
            && ['troll', 'ogre'].includes(ally.creatureType)
            && ally.health > 0
            && !ally.dying
            && ally.health < ally.maxHealth * 0.75
            && Math.hypot(
                ally.x + ally.size / 2 - (enemy.x + enemy.size / 2),
                ally.y + ally.size / 2 - (enemy.y + enemy.size / 2)
            ) < 120
        ))
        : null;
    const sentinelGuardPosition = sentinelAlly
        ? (() => {
            const allyX = sentinelAlly.x + sentinelAlly.size / 2;
            const allyY = sentinelAlly.y + sentinelAlly.size / 2;
            const towardPlayerX = player.x + player.size / 2 - allyX;
            const towardPlayerY = player.y + player.size / 2 - allyY;
            const length = Math.hypot(towardPlayerX, towardPlayerY) || 1;
            return {
                x: allyX + towardPlayerX / length * 18,
                y: allyY + towardPlayerY / length * 18
            };
        })()
        : null;
    const nestDistance = enemy.behaviorProfile === 'broodMatriarch'
        ? Math.hypot(
            enemy.nestHomeX - (enemy.x + enemy.size / 2),
            enemy.nestHomeY - (enemy.y + enemy.size / 2)
        )
        : 0;
    const returningToNest = enemy.behaviorProfile === 'broodMatriarch'
        && nestDistance > 48
        && distance > 80;
    const chasingAlert = enemy.alertTimer > 0 && enemy.alertedTarget;
    const targetX = chasingAlert
        ? enemy.alertedTarget.x
        : returningToNest ? enemy.nestHomeX
            : sentinelGuardPosition?.x ?? player.x + player.size / 2;
    const targetY = chasingAlert
        ? enemy.alertedTarget.y
        : returningToNest ? enemy.nestHomeY
            : sentinelGuardPosition?.y ?? player.y + player.size / 2;
    const targetDx = targetX - (enemy.x + enemy.size / 2);
    const targetDy = targetY - (enemy.y + enemy.size / 2);
    const targetDistance = Math.hypot(targetDx, targetDy);
    if (chasingAlert && targetDistance < 12) {
        enemy.alertedTarget = null;
        enemy.alertTimer = 0;
    }
    const chase = !trollRetreating && (
        chasingAlert
        || returningToNest
        || sentinelAlly
        || distance < (enemy.isBoss ? 280 * bossIntelligenceMultiplier : 144)
    );
    if (trollRetreating) {
        const retreatDirections = [
            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: -1 }
        ].sort((first, second) => (
            (second.x * -dx + second.y * -dy) - (first.x * -dx + first.y * -dy)
        ));
        const retreatDirection = retreatDirections.find((direction) => (
            canEntityMoveTo(
                enemy,
                enemy.x + direction.x * 8,
                enemy.y + direction.y * 8
            )
        )) || { x: 0, y: 0 };
        enemy.dirX = retreatDirection.x;
        enemy.dirY = retreatDirection.y;
        enemy.timer = 0.15;
    } else if (chase && !enemy.isBoss) {
        const pathTargetX = Math.floor(targetX / tileSize);
        const pathTargetY = Math.floor(targetY / tileSize);
        if (
            enemy.timer <= 0
            || enemy.pathTargetX !== pathTargetX
            || enemy.pathTargetY !== pathTargetY
        ) {
            const direction = findEnemyPathDirection(enemy, targetX, targetY);
            enemy.dirX = direction.x;
            enemy.dirY = direction.y;
            enemy.pathTargetX = pathTargetX;
            enemy.pathTargetY = pathTargetY;
            enemy.timer = 0.2;
        }
    } else if (chase) {
        const direction = getBossMovementDirection(enemy, dx, dy, distance, delta);
        enemy.dirX = direction.x;
        enemy.dirY = direction.y;
        enemy.timer = 0.15;
    } else if (enemy.timer <= 0) {
        const choices = [
            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: -1 },
            { x: 0, y: 0 }
        ];
        const choice = choices[Math.floor(Math.random() * choices.length)];
        enemy.dirX = choice.x;
        enemy.dirY = choice.y;
        enemy.timer = 0.9 + Math.random() * 0.8;
    }

    const shieldEngaged = enemy.shieldDurability > 0
        && distance <= 40;
    if ((enemy.dirX !== 0 || enemy.dirY !== 0) && !(shieldEngaged && enemy.shieldTurnTimer > 0)) {
        enemy.facingX = enemy.dirX;
        enemy.facingY = enemy.dirY;
        if (enemy.dirX !== 0) {
            enemy.spriteFacingX = enemy.dirX;
        } else if (enemy.isBoss && enemy.bossType === 'lavaGolem') {
            enemy.spriteFacingX = 1;
        }
    } else {
        const faceX = player.x - enemy.x;
        const faceY = player.y - enemy.y;
        if (Math.abs(faceX) > Math.abs(faceY)) {
            enemy.facingX = Math.sign(faceX);
            enemy.facingY = 0;
        } else if (faceY !== 0) {
            enemy.facingX = 0;
            enemy.facingY = Math.sign(faceY);
        }
    }

    if (shieldEngaged) {
        if (enemy.shieldTurnTimer === 0) {
            enemy.facingX = Math.abs(dx) > Math.abs(dy) ? Math.sign(dx) : 0;
            enemy.facingY = Math.abs(dy) >= Math.abs(dx) ? Math.sign(dy) : 0;
            if (enemy.facingX !== 0) {
                enemy.spriteFacingX = enemy.facingX;
            }
            enemy.shieldTurnTimer = 0.22;
        }
        enemy.shieldRaised = true;
    }

    if (enemy.behaviorProfile === 'toxicRaider' && distance <= 34
        && enemy.toxicBiteCooldown <= 0) {
        const attack = getCreatureAttackData(enemy, 'toxic-bite');
        enemy.toxicBiteWarning = attack.warning;
        enemy.toxicBiteCooldown = attack.cooldown;
        enemy.facingX = dx / (distance || 1);
        enemy.facingY = dy / (distance || 1);
        if (Math.abs(enemy.facingX) > 0.1) {
            enemy.spriteFacingX = Math.sign(enemy.facingX);
        }
        enemy.moving = false;
        playCreatureSound(enemy.creatureType, 'warning');
        return;
    }

    if (enemy.creatureType === 'veinBat'
        && distance >= 44 && distance <= 128
        && enemy.echoWaveCooldown <= 0) {
        const attack = getCreatureAttackData(enemy, 'echo-wave');
        enemy.echoWaveWarning = attack.warning;
        enemy.echoWaveCooldown = attack.cooldown;
        enemy.echoWaveDirectionX = dx / (distance || 1);
        enemy.echoWaveDirectionY = dy / (distance || 1);
        enemy.facingX = enemy.echoWaveDirectionX;
        enemy.facingY = enemy.echoWaveDirectionY;
        enemy.moving = false;
        playCreatureSound(enemy.creatureType, 'warning');
        return;
    }
    if (enemy.creatureType === 'basaltLizard'
        && distance >= 20 && distance <= 60
        && enemy.tailSweepCooldown <= 0) {
        const attack = getCreatureAttackData(enemy, 'tail-sweep');
        enemy.tailSweepWarning = attack.warning;
        enemy.tailSweepCooldown = attack.cooldown;
        enemy.facingX = dx / (distance || 1);
        enemy.facingY = dy / (distance || 1);
        enemy.moving = false;
        playCreatureSound(enemy.creatureType, 'warning');
        return;
    }
    if (enemy.creatureType === 'facelessScribe'
        && distance >= 44 && distance <= 150
        && enemy.glyphCooldown <= 0) {
        const attack = getCreatureAttackData(enemy, 'ground-glyph');
        enemy.glyphWarning = attack.warning;
        enemy.glyphCooldown = attack.cooldown;
        enemy.glyphTargetX = player.x + player.size / 2;
        enemy.glyphTargetY = player.y + player.size / 2;
        enemy.facingX = dx / (distance || 1);
        enemy.facingY = dy / (distance || 1);
        enemy.moving = false;
        playCreatureSound(enemy.creatureType, 'warning');
        return;
    }

    if (enemy.behaviorProfile === 'siegeBrute'
        && distance > 32
        && distance <= getCreatureAttackData(enemy, 'shoulder-bash').range
        && enemy.shoulderBashCooldown <= 0) {
        const attack = getCreatureAttackData(enemy, 'shoulder-bash');
        enemy.shoulderBashWarning = attack.warning;
        enemy.shoulderBashCooldown = attack.cooldown;
        enemy.facingX = dx / (distance || 1);
        enemy.facingY = dy / (distance || 1);
        if (Math.abs(enemy.facingX) > 0.1) {
            enemy.spriteFacingX = Math.sign(enemy.facingX);
        }
        enemy.moving = false;
        playCreatureSound(enemy.creatureType, 'warning');
        return;
    }

    if (
        enemy.behaviorProfile === 'siegeBrute'
        && distance <= getCreatureAttackData(enemy, 'siege-slam').range
        && enemy.attackCooldown <= 0
    ) {
        const attack = getCreatureAttackData(enemy, 'siege-slam');
        enemy.slamWarning = enemy.isBoss && enemy.phaseTwo
            ? attack.warning * 0.77 : attack.warning;
        enemy.attackCooldown = enemy.isBoss && enemy.phaseTwo
            ? attack.cooldown * 0.79 : attack.cooldown;
        playCreatureSound(enemy.creatureType || enemy.bossType, 'warning');
        enemy.facingX = dx / (distance || 1);
        enemy.facingY = dy / (distance || 1);
        if (Math.abs(enemy.facingX) > 0.1) {
            enemy.spriteFacingX = Math.sign(enemy.facingX);
        }
        enemy.moving = false;
        return;
    }

    if (
        (enemy.creatureType === 'goblin' || enemy.isBoss)
        && collisionBoundsOverlap(player, enemy)
        && enemy.attackCooldown <= 0
    ) {
        const attack = getEnemyContactAttack(enemy);
        const warningScale = enemy.isBoss && enemy.phaseThree
            ? GAME_BALANCE.bosses.finalPhaseWarningMultiplier
            : enemy.isBoss && enemy.phaseTwo ? 0.75 : 1;
        const cooldownScale = enemy.isBoss && enemy.phaseThree
            ? GAME_BALANCE.bosses.finalPhaseContactCooldownMultiplier
            : enemy.isBoss && enemy.phaseTwo ? 0.75 : 1;
        enemy.attackWarningTimer = attack.warning * warningScale;
        enemy.attackTimer = (attack.warning + attack.execution) * warningScale;
        enemy.attackCooldown = attack.cooldown * cooldownScale;
        enemy.attackReady = false;
        enemy.moving = false;
        playCreatureSound(enemy.creatureType || enemy.bossType, 'warning');
        if (enemy.isBoss) {
            recordBossAttack(enemy);
        }
        return;
    }

    const previousX = enemy.x;
    const previousY = enemy.y;
    const waterSpeedFactor = isEntityOnSewerWater(enemy) ? 0.6 : 1;
    const chaseSpeedMultiplier = chase && !trollRetreating
        ? enemy.combatAlertTimer > 0 ? 1.5 : 1.15
        : 1;
    const movementSpeed = enemy.speed
        * (trollRetreating ? 1.8 : chaseSpeedMultiplier)
        * waterSpeedFactor;
    const nextX = enemy.x + enemy.dirX * movementSpeed * delta;
    const nextY = enemy.y + enemy.dirY * movementSpeed * delta;

    if (enemy.dirX !== 0 && canEntityMoveTo(enemy, nextX, enemy.y)) {
        enemy.x = nextX;
    }

    if (enemy.dirY !== 0 && canEntityMoveTo(enemy, enemy.x, nextY)) {
        enemy.y = nextY;
    }

    enemy.moving = enemy.x !== previousX || enemy.y !== previousY;
    enemy.animTime += getActorAnimationDelta(delta) * (enemy.moving ? 1 : 0.25);
}

function getEnemyRace(enemy) {
    if (enemy.isBoss) return enemy.bossType;
    if (['goblin', 'goblinRunner'].includes(enemy.creatureType)) return 'goblinClan';
    if (['spider', 'sootSpider', 'matriarch'].includes(enemy.creatureType)) return 'spiderBrood';
    if (['troll', 'ogre'].includes(enemy.creatureType)) return 'castleHorde';
    return enemy.creatureType;
}

function updateRaceWarStatus() {
    if (!raceWarActive) {
        return;
    }
    if (activeFloorEncounterId) {
        const participants = enemies.filter((enemy) => (
            enemy.encounterId === activeFloorEncounterId
            && enemy.health > 0
            && !enemy.dying
        ));
        const activeRaces = new Set(participants.map(getEnemyRace));
        if (activeRaces.size >= 2) {
            return;
        }

        const completedEncounter = bestiaryEvents.find((event) => (
            event.id === activeFloorEncounterId
        ));
        for (const enemy of participants) {
            enemy.encounterId = null;
            enemy.alertedTarget = {
                x: player.x + player.size / 2,
                y: player.y + player.size / 2
            };
            enemy.alertTimer = 12;
        }
        activeFloorEncounterId = null;
        activeFloorEncounterBounds = null;
        activeFloorEncounterStarted = false;
        raceWarActive = false;
        if (completedEncounter?.id === 'pointing-stained-glass' && secretMatriarchChamber) {
            map[secretMatriarchChamber.entrance.y][secretMatriarchChamber.entrance.x] = '.';
            secretMatriarchChamber.open = true;
        }
        if (
            completedEncounter?.rewardScroll
            && !floorEncounterRewardGranted
            && activeFloorEncounterPosition
        ) {
            const scroll = scrollTypes.find((entry) => entry.id === completedEncounter.rewardScroll);
            if (!scroll) {
                throw new Error(`Recompensa de encontro desconhecida: ${completedEncounter.rewardScroll}`);
            }
            itemDrops.push({
                ...activeFloorEncounterPosition,
                type: 'scroll',
                scroll,
                animTime: 0
            });
            floorEncounterRewardGranted = true;
        }
        info.textContent = completedEncounter?.id === 'pointing-stained-glass'
            ? `Encontro especial concluído: ${completedEncounter.title}. A passagem da câmara secreta da Matriarca foi revelada.`
            : completedEncounter
                ? `Encontro especial concluído: ${completedEncounter.title}. Os sobreviventes agora perseguem você.`
            : 'A briga das raças acabou. Os inimigos restantes voltaram a perseguir você.';
        return;
    }

    const activeRaces = new Set(
        enemies
            .filter((enemy) => enemy.health > 0 && !enemy.dying)
            .map(getEnemyRace)
    );
    if (activeRaces.size < 2) {
        raceWarActive = false;
        const playerTarget = {
            x: player.x + player.size / 2,
            y: player.y + player.size / 2
        };
        for (const enemy of enemies) {
            if (enemy.health > 0 && !enemy.dying) {
                enemy.alertedTarget = playerTarget;
                enemy.alertTimer = 12;
            }
        }
        info.textContent = 'A briga das raças acabou. Os inimigos restantes voltaram a perseguir você.';
    }
}

function tryStartRaceWar() {
    if (raceWarActive || Math.random() >= 0.01) {
        return;
    }
    const activeRaces = new Set(
        enemies
            .filter((enemy) => enemy.health > 0 && !enemy.dying)
            .map(getEnemyRace)
    );
    if (activeRaces.size < 2) {
        return;
    }

    raceWarActive = true;
    for (const enemy of enemies) {
        enemy.slamWarning = 0;
        enemy.dogPounceWarning = 0;
        enemy.sentinelBeamWarning = 0;
        enemy.veinPulseWarning = 0;
        enemy.fireballTarget = null;
        enemy.fireballs = [];
    }
    info.textContent = 'Começou a briga das raças! Inimigos atacam outras raças; as eliminações contam para sua meta, e você fica fora do conflito.';
}

function moveEnemyDuringRaceWar(enemy, delta) {
    const enemyCenterX = enemy.x + enemy.size / 2;
    const enemyCenterY = enemy.y + enemy.size / 2;
    const guardedAlly = enemy.creatureType === 'stainedSentinel'
        ? enemies
            .filter((ally) => (
                ally !== enemy
                && ['troll', 'ogre'].includes(ally.creatureType)
                && ally.health > 0
                && !ally.dying
                && ally.health < ally.maxHealth * 0.75
                && Math.hypot(
                    ally.x + ally.size / 2 - enemyCenterX,
                    ally.y + ally.size / 2 - enemyCenterY
                ) < 120
            ))
            .sort((first, second) => first.health / first.maxHealth - second.health / second.maxHealth)[0]
        : null;
    if (guardedAlly && enemy.susanoConfusionTimer <= 0) {
        const allyX = guardedAlly.x + guardedAlly.size / 2;
        const allyY = guardedAlly.y + guardedAlly.size / 2;
        const towardThreatX = player.x + player.size / 2 - allyX;
        const towardThreatY = player.y + player.size / 2 - allyY;
        const threatLength = Math.hypot(towardThreatX, towardThreatY) || 1;
        const guardX = allyX + towardThreatX / threatLength * 20;
        const guardY = allyY + towardThreatY / threatLength * 20;
        if (Math.hypot(guardX - enemyCenterX, guardY - enemyCenterY) > 18) {
            const guardDirection = findEnemyPathDirection(enemy, guardX, guardY);
            enemy.dirX = guardDirection.x;
            enemy.dirY = guardDirection.y;
            enemy.facingX = guardDirection.x;
            enemy.facingY = guardDirection.y;
            const movement = enemy.speed * delta;
            if (guardDirection.x && canEntityMoveTo(enemy, enemy.x + guardDirection.x * movement, enemy.y)) {
                enemy.x += guardDirection.x * movement;
            }
            if (guardDirection.y && canEntityMoveTo(enemy, enemy.x, enemy.y + guardDirection.y * movement)) {
                enemy.y += guardDirection.y * movement;
            }
            enemy.moving = guardDirection.x !== 0 || guardDirection.y !== 0;
            enemy.animTime += getActorAnimationDelta(delta) * (enemy.moving ? 1 : 0.25);
            return;
        }
    }

    let candidates = enemies
        .filter((candidate) => (
            candidate !== enemy
            && candidate.health > 0
            && !candidate.dying
            && (
                enemy.susanoConfusionTimer > 0
                    ? true
                    : enemy.encounterId
                    ? candidate.encounterId === enemy.encounterId
                    : !activeFloorEncounterId
            )
            && (
                enemy.susanoConfusionTimer > 0
                || getEnemyRace(candidate) !== getEnemyRace(enemy)
            )
        ));
    if (enemy.creatureType === 'ogre' && enemy.susanoConfusionTimer <= 0) {
        const nonDogTargets = candidates.filter((candidate) => candidate.creatureType !== 'ashHound');
        if (nonDogTargets.length > 0) candidates = nonDogTargets;
    }
    if (enemy.creatureType === 'ashHound') {
        const prey = candidates.filter((candidate) => (
            ['goblin', 'goblinRunner', 'spider', 'sootSpider'].includes(candidate.creatureType)
        ));
        if (prey.length > 0) candidates = prey;
    }
    const target = candidates.sort((first, second) => (
        Math.hypot(first.x + first.size / 2 - enemyCenterX, first.y + first.size / 2 - enemyCenterY)
        - Math.hypot(second.x + second.size / 2 - enemyCenterX, second.y + second.size / 2 - enemyCenterY)
    ))[0];

    enemy.shieldRaised = false;
    if (!target) {
        if (enemy.creatureType === 'ogre' && enemy.susanoConfusionTimer <= 0) {
            const dog = enemies
                .filter((candidate) => (
                    candidate.creatureType === 'ashHound'
                    && candidate.health > 0
                    && !candidate.dying
                ))
                .sort((first, second) => (
                    Math.hypot(first.x - enemy.x, first.y - enemy.y)
                    - Math.hypot(second.x - enemy.x, second.y - enemy.y)
                ))[0];
            if (dog) {
                const awayX = enemyCenterX - (dog.x + dog.size / 2);
                const awayY = enemyCenterY - (dog.y + dog.size / 2);
                const escape = findEnemyPathDirection(
                    enemy,
                    enemyCenterX + awayX * 2,
                    enemyCenterY + awayY * 2
                );
                enemy.dirX = escape.x;
                enemy.dirY = escape.y;
                const movement = enemy.speed * delta;
                if (escape.x && canEntityMoveTo(enemy, enemy.x + escape.x * movement, enemy.y)) {
                    enemy.x += escape.x * movement;
                }
                if (escape.y && canEntityMoveTo(enemy, enemy.x, enemy.y + escape.y * movement)) {
                    enemy.y += escape.y * movement;
                }
                enemy.moving = escape.x !== 0 || escape.y !== 0;
                enemy.animTime += getActorAnimationDelta(delta) * (enemy.moving ? 1 : 0.25);
                return;
            }
        }
        enemy.moving = false;
        enemy.animTime += getActorAnimationDelta(delta) * 0.25;
        return;
    }

    const dx = target.x + target.size / 2 - enemyCenterX;
    const dy = target.y + target.size / 2 - enemyCenterY;
    const distance = Math.hypot(dx, dy);
    if (enemy.shieldDurability > 0 && distance <= 40) {
        enemy.shieldRaised = true;
    }

    if (collisionBoundsOverlap(enemy, target)) {
        enemy.dirX = Math.abs(dx) > Math.abs(dy) ? Math.sign(dx) : 0;
        enemy.dirY = Math.abs(dy) >= Math.abs(dx) ? Math.sign(dy) : 0;
        enemy.facingX = enemy.dirX;
        enemy.facingY = enemy.dirY;
        if (enemy.dirX !== 0) {
            enemy.spriteFacingX = enemy.dirX;
        }
        enemy.moving = false;
        if (enemy.attackCooldown <= 0) {
            enemy.attackTimer = 0.24;
            enemy.attackCooldown = enemy.isBoss ? 1.1 : 0.85;
            const result = damageEnemy(
                target,
                enemy.damage || enemyDamage,
                enemyCenterX,
                enemyCenterY,
                false
            );
            target.hitFlash = result.damage > 0 ? 0.16 : target.hitFlash;
            if (target.health === 0) {
                resolveEnemyDefeat(target);
            }
        }
        enemy.animTime += getActorAnimationDelta(delta) * 0.25;
        return;
    }

    const direction = enemy.isBoss
        ? {
            x: Math.abs(dx) > Math.abs(dy) ? Math.sign(dx) : 0,
            y: Math.abs(dy) >= Math.abs(dx) ? Math.sign(dy) : 0
        }
        : findEnemyPathDirection(
            enemy,
            target.x + target.size / 2,
            target.y + target.size / 2
        );
    enemy.dirX = direction.x;
    enemy.dirY = direction.y;
    enemy.facingX = direction.x;
    enemy.facingY = direction.y;
    if (direction.x !== 0) {
        enemy.spriteFacingX = direction.x;
    }
    const previousX = enemy.x;
    const previousY = enemy.y;
    const waterSpeedFactor = isEntityOnSewerWater(enemy) ? 0.6 : 1;
    const movementSpeed = (enemy.speed || 27.5) * waterSpeedFactor;
    const nextX = enemy.x + direction.x * movementSpeed * delta;
    const nextY = enemy.y + direction.y * movementSpeed * delta;
    if (direction.x !== 0 && canEntityMoveTo(enemy, nextX, enemy.y)) {
        enemy.x = nextX;
    }
    if (direction.y !== 0 && canEntityMoveTo(enemy, enemy.x, nextY)) {
        enemy.y = nextY;
    }
    enemy.moving = enemy.x !== previousX || enemy.y !== previousY;
    enemy.animTime += getActorAnimationDelta(delta) * (enemy.moving ? 1 : 0.25);
}

function checkPlayerTile() {
    const centerX = player.x + player.size / 2;
    const centerY = player.y + player.size / 2;
    const col = Math.floor(centerX / tileSize);
    const row = Math.floor(centerY / tileSize);
    if (col === exitPosition.x && row === exitPosition.y && portalUnlocked) {
        if (currentFloor >= finalFloor) {
            if (botMode && botLearning) {
                finalizeBotFloorObservation(true);
            }
            gameState = 'won';
            if (botMode && botLearning) {
                botLearning.completed = true;
                questText.textContent = `Bot concluiu os ${finalFloor} andares`;
                info.textContent = `O Bot IA concluiu os ${finalFloor} andares e derrotou os chefes da masmorra!`;
                finishBotRun();
                updateBotStatus();
            } else {
                questText.textContent = `Você concluiu os ${finalFloor} andares`;
                info.textContent = `Você concluiu os ${finalFloor} andares e derrotou o chefe final!`;
            }
            return;
        }
        if (botMode && botLearning) {
            finalizeBotFloorObservation(true);
        }
        sendMultiplayerFloorAdvance(currentFloor + 1);
        currentFloor += 1;
        resetGame(true, true);
    } else if (col === exitPosition.x && row === exitPosition.y && !portalUnlocked) {
        const objective = currentFloor <= 5
            ? `Derrote goblins e aranhas (${Math.min(floorKillCount, floorKillGoal)}/${floorKillGoal})`
            : `Derrote inimigos (${Math.min(floorKillCount, floorKillGoal)}/${floorKillGoal})`;
        info.textContent = `${objective} para revelar o portal.`;
    }
}

function collectOreDrops() {
    const playerCenterX = player.x + player.size / 2;
    const playerCenterY = player.y + player.size / 2;

    oreDrops = oreDrops.filter((drop, index) => {
        const distance = Math.hypot(drop.x - playerCenterX, drop.y - playerCenterY);
        if (distance > 12) {
            return true;
        }

        claimMultiplayerDrop(drop, 'ore');
        if (multiplayerConnected) {
            return false;
        }
        oreCoinBalance[drop.ore.id] += 1;
        info.textContent = `Você pegou uma moeda de ${drop.ore.name}!`;
        updateOreCoinHud();
        return false;
    });
}

function dropPotionItem(col, row, rarity) {
    itemDrops.push({
        x: col * tileSize + tileSize / 2,
        y: row * tileSize + tileSize / 2,
        type: 'potion',
        rarity,
        animTime: 0
    });
}

function dropMimicScroll(col, row) {
    if (Math.random() >= 0.05) {
        return null;
    }

    const scroll = scrollTypes[Math.floor(Math.random() * scrollTypes.length)];
    itemDrops.push({
        x: col * tileSize + tileSize / 2,
        y: row * tileSize + tileSize / 2,
        type: 'scroll',
        scroll,
        animTime: 0
    });
    return scroll;
}

function collectItemDrops() {
    const playerCenterX = player.x + player.size / 2;
    const playerCenterY = player.y + player.size / 2;

    itemDrops = itemDrops.filter((drop, index) => {
        const distance = Math.hypot(drop.x - playerCenterX, drop.y - playerCenterY);
        if (distance > 12) {
            return true;
        }

        claimMultiplayerDrop(drop, 'item');
        if (multiplayerConnected) {
            return false;
        }
        if (drop.type === 'scroll') {
            scrollInventory[drop.scroll.id] += 1;
            updateScrollInventoryHud();
            info.textContent = `${drop.scroll.name} coletado!`;
            return false;
        }

        if (drop.type === 'material') {
            const material = creatureMaterialDataById[drop.materialId];
            if (!material) {
                throw new Error(`Material desconhecido no chão: ${drop.materialId}.`);
            }
            collectedMaterials[drop.materialId] = (
                collectedMaterials[drop.materialId] || 0
            ) + drop.quantity;
            updateMaterialInventoryHud();
            info.textContent = `${material.name} coletado: ${drop.quantity}.`;
            return false;
        }

        if (drop.type === 'arrows') {
            if (arrowAmmo >= GAME_BALANCE.bow.maxAmmo) {
                return true;
            }
            const addedAmmo = Math.min(
                drop.quantity,
                GAME_BALANCE.bow.maxAmmo - arrowAmmo
            );
            arrowAmmo += addedAmmo;
            if (botMode && botLearning) {
                botLearning.arrowsCollected += addedAmmo;
            }
            updateBowHud();
            info.textContent = `Flechas coletadas: +${addedAmmo}. Aljava ${arrowAmmo}/${GAME_BALANCE.bow.maxAmmo}.`;
            return false;
        }

        if (healingPotions.length >= GAME_BALANCE.economy.potionCapacity) {
            return true;
        }
        healingPotions.push(drop);
        updatePotionHud();
        info.textContent = `Poção ${drop.rarity.potionName} coletada: recupera até ${drop.rarity.potionHeal} de vida.`;
        return false;
    });
}

function checkCollision() {
    if (raceWarActive) {
        return;
    }
    if (player.damageCooldown > 0) {
        for (const enemy of enemies) {
            enemy.attackReady = false;
        }
        return;
    }

    for (const enemy of enemies) {
        if (enemy.health <= 0
            || enemy.creatureType === 'ogre'
            || [
                'toxicRaider', 'courierSkirmisher', 'caveAmbusher', 'sootAmbusher',
                'broodMatriarch', 'ashFlanker', 'stainedGuardian'
            ].includes(enemy.behaviorProfile)) {
            continue;
        }
        if (collisionBoundsOverlap(player, enemy)) {
            if (enemy.attackWarningTimer > 0 || !enemy.attackReady) {
                continue;
            }
            const attack = getEnemyContactAttack(enemy);
            const damage = Math.max(1, Math.round(
                (enemy.damage || enemyDamage) * attack.damage
            ));
            enemy.attackReady = false;
            playCreatureSound(enemy.creatureType || enemy.bossType, 'attack');
            damagePlayer(damage, `Você sofreu ${damage} de dano.`, enemy.creatureType || enemy.bossType);
            return;
        }
    }
}

function getEnemyContactAttack(enemy) {
    const attackId = enemy.isBoss
        ? enemy.bossType === 'dragon' ? 'wing-sweep'
            : enemy.bossType === 'grimReaper' ? 'scythe-arc'
                : enemy.bossType === 'throneGuardian' ? 'royal-oath'
                    : 'eruption'
        : 'scrap-slash';
    return getCreatureAttackData(enemy, attackId);
}

function applyCreatureStatus(status) {
    if (!status || !Number.isFinite(status.duration) || status.duration <= 0) {
        return;
    }
    if (status.type === 'poison') {
        player.poisonTimer = status.duration;
        player.poisonTickTimer = 0.3;
        player.poisonDamageRemaining = Math.ceil(status.damagePerSecond * status.duration);
        info.textContent = `O troll envenenou você! O veneno causa ${player.poisonDamageRemaining} de dano gradual.`;
    } else if (status.type === 'burn') {
        player.burnTimer = status.duration;
        player.burnTickTimer = 0.5;
        player.burnDamageRemaining = Math.ceil(status.damagePerSecond * status.duration);
        info.textContent = `Você está em chamas! A queimadura causa ${player.burnDamageRemaining} de dano gradual.`;
    } else {
        throw new Error(`Efeito de criatura desconhecido: ${status.type}.`);
    }
}

function damagePlayer(amount, message, sourceType = null) {
    if (devMode || player.damageCooldown > 0 || gameState !== 'playing') {
        return false;
    }
    if (Math.random() < 0.25) {
        player.dodgeTimer = 0.34;
        player.counterAttackTimer = 1;
        player.dodgeDirectionX = -player.facingY || -player.spriteFacingX;
        player.dodgeDirectionY = player.facingX || 0;
        player.damageCooldown = 0.38;
        info.textContent = 'Você desviou do ataque!';
        return false;
    }
    let remainingDamage = amount;
    let blockedDamage = 0;
    if (shieldBlocking && gearOwned.shield) {
        blockedDamage = Math.min(remainingDamage, gearDurability.shield);
        gearDurability.shield -= blockedDamage;
        remainingDamage -= blockedDamage;
        if (gearDurability.shield <= 0) {
            gearDurability.shield = 0;
            gearOwned.shield = false;
            shieldBlocking = false;
        }
    }

    let armorReduction = 0;
    if (remainingDamage > 0 && gearOwned.armor) {
        gearDurability.armor = Math.max(0, gearDurability.armor - 1);
        armorReduction = Math.min(
            remainingDamage - 1,
            player.defense,
            Math.floor(remainingDamage * 0.5)
        );
        if (gearDurability.armor === 0) {
            gearOwned.armor = false;
            player.defense = 0;
        }
    }

    const finalDamage = Math.max(0, remainingDamage - armorReduction);
    recordBotShieldAbsorption(blockedDamage);
    updateEquipmentHud();
    if (finalDamage === 0) {
        player.damageCooldown = playerDamageCooldown;
        info.textContent = blockedDamage > 0
            ? `Escudo bloqueou o golpe. Durabilidade: ${gearDurability.shield}/${gearDurability.shieldMax}.`
            : 'O equipamento bloqueou o golpe.';
        return false;
    }

    player.health = Math.max(0, player.health - finalDamage);
    spawnImpactParticles(
        player.x + player.size / 2,
        player.y + player.size / 2,
        '#f28c72'
    );
    recordBotDamage(finalDamage, sourceType);
    player.damageCooldown = playerDamageCooldown;
    updateHealthHud();
    if (player.health === 0) {
        endSusanoOnDeath();
        gameState = 'lost';
        questText.textContent = 'Você foi encontrado';
        info.textContent = 'Sua vida acabou. Pressione reiniciar para tentar novamente.';
        updateBotStatus();
    } else {
        const mitigationMessage = blockedDamage > 0
            ? `Escudo absorveu ${blockedDamage} de dano. `
            : armorReduction > 0
                ? `Armadura reduziu o dano em ${armorReduction}. `
                : '';
        info.textContent = `${mitigationMessage}${message} Vida restante: ${player.health}.`;
    }
    return true;
}

function updateBossFireballs(delta) {
    const playerCenterX = player.x + player.size / 2;
    const playerCenterY = player.y + player.size / 2;
    for (const boss of enemies) {
        if (!boss.isBoss || boss.bossType !== 'dragon' || boss.health <= 0) {
            continue;
        }

        const attack = getCreatureAttackData(boss, 'fireball');
        boss.fireballCooldown = Math.max(0, boss.fireballCooldown - delta);
        const wingAttack = getCreatureAttackData(boss, 'wing-sweep');
        boss.wingSweepCooldown = Math.max(0, boss.wingSweepCooldown - delta);
        const phaseTwo = boss.phaseTwo;
        const phaseThree = boss.phaseThree;
        const bossCenterX = boss.x + boss.size / 2;
        const bossCenterY = boss.y + boss.size / 2;
        const distance = Math.hypot(playerCenterX - bossCenterX, playerCenterY - bossCenterY);
        if (boss.wingSweepWarning > 0) {
            boss.wingSweepWarning = Math.max(0, boss.wingSweepWarning - delta);
            if (boss.wingSweepWarning === 0) {
                const offsetX = playerCenterX - bossCenterX;
                const offsetY = playerCenterY - bossCenterY;
                const forward = offsetX * boss.wingSweepDirectionX
                    + offsetY * boss.wingSweepDirectionY;
                const side = Math.abs(offsetX * boss.wingSweepDirectionY
                    - offsetY * boss.wingSweepDirectionX);
                if (forward >= 0 && forward <= wingAttack.range
                    && side <= wingAttack.radius + getCollisionRadius(player)) {
                    const didDamage = damagePlayer(
                        scaleBossAttackDamage(
                            boss,
                            Math.round(creatureDataByType[boss.bossType].stats.damage * wingAttack.damage)
                        ),
                        'A varrida das asas do dragão atingiu você.',
                        boss.bossType
                    );
                    if (didDamage && wingAttack.status === 'knockback') {
                        const length = Math.hypot(offsetX, offsetY) || 1;
                        const pushX = player.x + offsetX / length * 12;
                        const pushY = player.y + offsetY / length * 12;
                        if (canEntityMoveTo(player, pushX, pushY)) {
                            player.x = pushX;
                            player.y = pushY;
                        }
                    }
                }
                boss.wingSweepExecution = wingAttack.execution;
                playCreatureSound(boss.bossType, 'attack');
            }
            continue;
        }
        if (boss.wingSweepExecution > 0) {
            boss.wingSweepExecution = Math.max(0, boss.wingSweepExecution - delta);
            continue;
        }
        if (
            distance <= wingAttack.range
            && boss.wingSweepCooldown === 0
            && boss.weaknessTimer === 0
            && !boss.fireballTarget
        ) {
            const length = distance || 1;
            boss.wingSweepDirectionX = (playerCenterX - bossCenterX) / length;
            boss.wingSweepDirectionY = (playerCenterY - bossCenterY) / length;
            boss.facingX = boss.wingSweepDirectionX;
            boss.facingY = boss.wingSweepDirectionY;
            boss.wingSweepWarning = wingAttack.warning * (phaseThree
                ? GAME_BALANCE.bosses.finalPhaseWarningMultiplier
                : phaseTwo ? 0.75 : 1);
            boss.wingSweepCooldown = wingAttack.cooldown * (phaseThree ? 0.55 : phaseTwo ? 0.75 : 1);
            boss.attackTimer = boss.wingSweepWarning;
            recordBossAttack(boss);
            playCreatureSound(boss.bossType, 'warning');
            continue;
        }
        if (boss.fireballTarget) {
            boss.fireballWarning = Math.max(0, boss.fireballWarning - delta);
            if (boss.fireballWarning === 0) {
                const targetX = boss.fireballTarget.x;
                const targetY = boss.fireballTarget.y;
                const targetDeltaX = targetX - bossCenterX;
                const targetDeltaY = targetY - bossCenterY;
                const targetDistance = Math.hypot(targetDeltaX, targetDeltaY) || 1;
                const directionX = targetDeltaX / targetDistance;
                const directionY = targetDeltaY / targetDistance;
                boss.fireballTarget = null;
                boss.fireballs.push({
                    x: bossCenterX + directionX * 13,
                    y: bossCenterY + directionY * 13,
                    velocityX: directionX * attack.speed,
                    velocityY: directionY * attack.speed,
                    traveled: 0,
                    maxRange: attack.range,
                    animTime: 0
                });
                boss.fireballCooldown = attack.cooldown * (
                    phaseThree
                        ? GAME_BALANCE.bosses.finalPhaseFireballCooldownMultiplier
                        : phaseTwo ? 0.62 : 1
                );
                playCreatureSound(boss.bossType, 'attack');
            }
        } else if (
            distance <= attack.range * bossIntelligenceMultiplier
            && boss.fireballCooldown === 0
            && boss.weaknessTimer === 0
        ) {
            const predictedTarget = predictPlayerPosition(
                (phaseTwo ? 0.32 : 0.4) * bossIntelligenceMultiplier
            );
            const directionX = (predictedTarget.x - bossCenterX)
                / (Math.hypot(predictedTarget.x - bossCenterX, predictedTarget.y - bossCenterY) || 1);
            const directionY = (predictedTarget.y - bossCenterY)
                / (Math.hypot(predictedTarget.x - bossCenterX, predictedTarget.y - bossCenterY) || 1);
            boss.facingX = directionX;
            boss.facingY = directionY;
            if (directionX !== 0) {
                boss.spriteFacingX = Math.sign(directionX);
            }
            boss.attackTimer = phaseTwo ? 0.4 : 0.55;
            boss.fireballWarning = attack.warning * (phaseThree
                ? GAME_BALANCE.bosses.finalPhaseWarningMultiplier
                : phaseTwo ? 0.62 : 1);
            boss.fireballTarget = predictedTarget;
            recordBossAttack(boss);
            playCreatureSound(boss.bossType, 'warning');
        }

        boss.fireballs = boss.fireballs.filter((fireball) => {
            fireball.x += fireball.velocityX * delta;
            fireball.y += fireball.velocityY * delta;
            fireball.traveled += Math.hypot(fireball.velocityX, fireball.velocityY) * delta;
            fireball.animTime += delta;
            const hitPlayer = Math.hypot(
                fireball.x - playerCenterX,
                fireball.y - playerCenterY
            ) <= getCollisionRadius(player) + attack.radius;
            if (hitPlayer) {
                const didDamage = damagePlayer(
                    scaleBossAttackDamage(
                        boss,
                        Math.round(creatureDataByType[boss.bossType].stats.damage * attack.damage)
                    ),
                    'Uma bola de fogo do dragão acertou você.',
                    boss.bossType
                );
                if (didDamage && attack.status?.type === 'burn') {
                    applyCreatureStatus(attack.status);
                }
                return false;
            }
            return fireball.traveled < fireball.maxRange;
        });
    }
}

function findBossHazardTarget(x, y) {
    const targetX = Math.floor(x / tileSize);
    const targetY = Math.floor(y / tileSize);
    const choices = [
        { x: targetX, y: targetY },
        { x: targetX + 1, y: targetY },
        { x: targetX - 1, y: targetY },
        { x: targetX, y: targetY + 1 },
        { x: targetX, y: targetY - 1 }
    ];
    return choices.find((tile) => (
        tile.x >= 1 && tile.x < cols - 1
        && tile.y >= 1 && tile.y < rows - 1
        && map[tile.y][tile.x] !== '#'
        && !barrels.some((barrel) => barrel.health > 0 && barrel.x === tile.x && barrel.y === tile.y)
        && !chests.some((chest) => chest.health > 0 && chest.x === tile.x && chest.y === tile.y)
        && !castleColumns.some((column) => (
            tile.x >= column.x && tile.x <= column.x + 1
            && tile.y >= column.y && tile.y <= column.y + 1
        ))
    )) || null;
}

function updateLavaGolemAttacks(boss, delta) {
    const lavaAttack = getCreatureAttackData(boss, 'lava-pool');
    const rockAttack = getCreatureAttackData(boss, 'thrown-rock');
    const eruptionAttack = getCreatureAttackData(boss, 'eruption');
    const bossX = boss.x + boss.size / 2;
    const bossY = boss.y + boss.size / 2;
    const playerX = player.x + player.size / 2;
    const playerY = player.y + player.size / 2;
    const distance = Math.hypot(playerX - bossX, playerY - bossY);
    boss.lavaCooldown = Math.max(0, boss.lavaCooldown - delta);
    boss.rockCooldown = Math.max(0, boss.rockCooldown - delta);
    boss.eruptionCooldown = Math.max(0, boss.eruptionCooldown - delta);
    const phaseTwo = boss.phaseTwo;
    const phaseThree = boss.phaseThree;

    if (
        boss.lavaCooldown === 0
        && distance <= lavaAttack.range * bossIntelligenceMultiplier
        && boss.weaknessTimer === 0
    ) {
        const predictedTarget = predictPlayerPosition(
            (phaseTwo ? 0.32 : 0.45) * bossIntelligenceMultiplier
        );
        const target = findBossHazardTarget(predictedTarget.x, predictedTarget.y);
        if (target) {
            boss.lavaPools.push({
                x: target.x * tileSize + tileSize / 2,
                y: target.y * tileSize + tileSize / 2,
                radiusX: 15,
                radiusY: 10,
                warning: lavaAttack.warning * (phaseThree
                    ? GAME_BALANCE.bosses.finalPhaseWarningMultiplier
                    : phaseTwo ? 0.69 : 1),
                lifetime: 4.8,
                damageCooldown: 0,
                animTime: 0
            });
            boss.attackTimer = 0.38;
            boss.lavaCooldown = lavaAttack.cooldown * (phaseThree
                ? GAME_BALANCE.bosses.finalPhaseLavaCooldownMultiplier
                : phaseTwo ? 0.64 : 1);
            recordBossAttack(boss);
            playCreatureSound(boss.bossType, 'warning');
        }
    }

    if (
        boss.rockCooldown === 0
        && distance <= rockAttack.range * bossIntelligenceMultiplier
        && boss.weaknessTimer === 0
        && boss.lavaCooldown > 0
    ) {
        const predictedTarget = predictPlayerPosition(
            (phaseTwo ? 0.25 : 0.35) * bossIntelligenceMultiplier
        );
        const target = findBossHazardTarget(predictedTarget.x, predictedTarget.y);
        if (target) {
            const targetX = target.x * tileSize + tileSize / 2;
            const targetY = target.y * tileSize + tileSize / 2;
            boss.thrownRocks.push({
                x: targetX,
                y: targetY,
                targetX,
                targetY,
                warning: rockAttack.warning * (phaseThree
                    ? GAME_BALANCE.bosses.finalPhaseWarningMultiplier
                    : phaseTwo ? 0.73 : 1),
                phase: 'warning',
                lifetime: 0,
                fadeTime: 0,
                animTime: 0,
                damageCooldown: 0
            });
            boss.attackTimer = 0.55;
            boss.rockCooldown = rockAttack.cooldown * (phaseThree
                ? GAME_BALANCE.bosses.finalPhaseRockCooldownMultiplier
                : phaseTwo ? 0.625 : 1);
            recordBossAttack(boss);
            playCreatureSound(boss.bossType, 'warning');
        }
    }
    if (
        phaseTwo
        && boss.eruptionCooldown === 0
        && distance <= eruptionAttack.range
        && boss.weaknessTimer === 0
    ) {
        const target = findBossHazardTarget(playerX, playerY);
        if (target) {
            boss.eruptions.push({
                x: target.x * tileSize + tileSize / 2,
                y: target.y * tileSize + tileSize / 2,
                radius: eruptionAttack.radius,
                warning: eruptionAttack.warning * 0.7,
                lifetime: 0.45,
                damageCooldown: 0,
                animTime: 0,
                hit: false
            });
            boss.eruptionCooldown = eruptionAttack.cooldown
                * (phaseThree ? GAME_BALANCE.bosses.finalPhaseEruptionCooldownMultiplier : 1);
            boss.attackTimer = eruptionAttack.warning;
            recordBossAttack(boss);
            playCreatureSound(boss.bossType, 'warning');
        }
    }

    boss.lavaPools = boss.lavaPools.filter((pool) => {
        pool.animTime += delta;
        pool.damageCooldown = Math.max(0, pool.damageCooldown - delta);
        if (pool.warning > 0) {
            pool.warning = Math.max(0, pool.warning - delta);
            return true;
        }
        pool.lifetime -= delta;
        if (
            pool.damageCooldown === 0
            && Math.abs(playerX - pool.x) <= pool.radiusX
            && Math.abs(playerY - pool.y) <= pool.radiusY
        ) {
            const didDamage = damagePlayer(
                scaleBossAttackDamage(
                    boss,
                    Math.round(creatureDataByType[boss.bossType].stats.damage * lavaAttack.damage)
                ),
                'A lava do golem queimou você.',
                boss.bossType
            );
            if (didDamage && lavaAttack.status?.type === 'burn') {
                applyCreatureStatus(lavaAttack.status);
            }
            pool.damageCooldown = 0.85;
        }
        return pool.lifetime > 0;
    });

    boss.eruptions = boss.eruptions.filter((eruption) => {
        eruption.animTime += delta;
        if (eruption.warning > 0) {
            eruption.warning = Math.max(0, eruption.warning - delta);
            return true;
        }
        eruption.lifetime -= delta;
        if (!eruption.hit
            && collisionDistanceToPoint(player, eruption.x, eruption.y) <= eruption.radius) {
            eruption.hit = true;
            const didDamage = damagePlayer(
                scaleBossAttackDamage(
                    boss,
                    Math.round(creatureDataByType[boss.bossType].stats.damage * eruptionAttack.damage)
                ),
                'Uma erupção do golem de lava atingiu você.',
                boss.bossType
            );
            if (didDamage && eruptionAttack.status?.type === 'burn') {
                applyCreatureStatus(eruptionAttack.status);
            }
        }
        return eruption.lifetime > 0;
    });

    boss.thrownRocks = boss.thrownRocks.filter((rock) => {
        rock.animTime += delta;
        rock.damageCooldown = Math.max(0, rock.damageCooldown - delta);
        if (rock.phase === 'warning') {
            rock.warning = Math.max(0, rock.warning - delta);
            if (rock.warning === 0) {
                const directionX = rock.targetX - bossX;
                const directionY = rock.targetY - bossY;
                const targetDistance = Math.hypot(directionX, directionY) || 1;
                rock.velocityX = directionX / targetDistance * rockAttack.speed;
                rock.velocityY = directionY / targetDistance * rockAttack.speed;
                rock.x = bossX + directionX / targetDistance * 14;
                rock.y = bossY + directionY / targetDistance * 14;
                rock.traveled = 0;
                rock.maxRange = Math.max(0, targetDistance - 14);
                rock.phase = 'flying';
                boss.facingX = directionX / targetDistance;
                boss.facingY = directionY / targetDistance;
                if (directionX !== 0) {
                    boss.spriteFacingX = Math.sign(directionX);
                }
                boss.attackTimer = 0.32;
            }
            return true;
        }
        if (rock.phase === 'flying') {
            rock.x += rock.velocityX * delta;
            rock.y += rock.velocityY * delta;
            rock.traveled += Math.hypot(rock.velocityX, rock.velocityY) * delta;
            if (rock.traveled >= rock.maxRange) {
                rock.x = rock.targetX;
                rock.y = rock.targetY;
                rock.phase = 'landed';
                rock.lifetime = 2.9;
            }
            if (
                rock.phase === 'flying'
                && collisionDistanceToPoint(player, rock.x, rock.y) < 6
            ) {
                damagePlayer(
                    scaleBossAttackDamage(boss, 16),
                    'Uma rocha arremessada pelo golem acertou você.',
                    boss.bossType
                );
                rock.phase = 'landed';
                rock.x = rock.targetX;
                rock.y = rock.targetY;
                rock.lifetime = 2.9;
            }
        } else if (rock.phase === 'landed') {
            rock.lifetime -= delta;
            if (rock.damageCooldown === 0 && Math.hypot(playerX - rock.x, playerY - rock.y) < 12) {
                damagePlayer(
                    scaleBossAttackDamage(boss, 10),
                    'Você foi atingido por uma rocha incandescente.',
                    boss.bossType
                );
                rock.damageCooldown = 0.85;
            }
            if (rock.lifetime <= 0) {
                rock.phase = 'vanishing';
                rock.fadeTime = 0.55;
            }
        } else {
            rock.fadeTime -= delta;
        }
        return rock.phase !== 'vanishing' || rock.fadeTime > 0;
    });
}

function updateGrimReaperAttacks(boss, delta) {
    const scytheData = getCreatureAttackData(boss, 'scythe-arc');
    const shadowStepData = getCreatureAttackData(boss, 'shadow-step');
    const bossX = boss.x + boss.size / 2;
    const bossY = boss.y + boss.size / 2;
    const playerX = player.x + player.size / 2;
    const playerY = player.y + player.size / 2;
    const distance = Math.hypot(playerX - bossX, playerY - bossY);
    const phaseTwo = boss.phaseTwo;

    boss.scytheCooldown = Math.max(0, boss.scytheCooldown - delta);
    boss.shadowStepCooldown = Math.max(0, boss.shadowStepCooldown - delta);
    if (boss.shadowStepWarning > 0) {
        boss.shadowStepWarning = Math.max(0, boss.shadowStepWarning - delta);
        if (boss.shadowStepWarning === 0 && boss.shadowStepTarget) {
            const targetX = (boss.shadowStepTarget.x + 0.5) * tileSize - boss.size / 2;
            const targetY = (boss.shadowStepTarget.y + 0.5) * tileSize - boss.size / 2;
            if (canEntityMoveTo(boss, targetX, targetY)) {
                boss.x = targetX;
                boss.y = targetY;
                playCreatureSound(boss.bossType, 'attack');
            }
            boss.shadowStepTarget = null;
        }
        return;
    }
    if (boss.scytheAttack) {
        const attack = boss.scytheAttack;
        attack.timer = Math.max(0, attack.timer - delta);
        if (attack.phase === 'warning' && attack.timer === 0) {
            attack.phase = 'swing';
            attack.timer = scytheData.execution * (phaseTwo ? 0.82 : 1);
        } else if (attack.phase === 'swing') {
            if (!attack.hit) {
                const offsetX = playerX - attack.originX;
                const offsetY = playerY - attack.originY;
                const forward = offsetX * attack.directionX + offsetY * attack.directionY;
                const side = Math.abs(offsetX * attack.directionY - offsetY * attack.directionX);
                const playerDistance = Math.hypot(offsetX, offsetY);
                const playerRadius = getCollisionRadius(player);
                if (
                    forward + playerRadius > 0
                    && playerDistance - playerRadius <= scytheData.range - 23
                    && side <= Math.max(0, forward) * Math.tan(0.9) + playerRadius
                ) {
                    damagePlayer(
                        scaleBossAttackDamage(
                            boss,
                            Math.round(creatureDataByType[boss.bossType].stats.damage
                                * scytheData.damage * (phaseTwo ? 1.4 : 1))
                        ),
                        'O golpe de foice do Ceifador acertou você!',
                        boss.bossType
                    );
                    attack.hit = true;
                }
            }
            if (attack.timer === 0) {
                boss.scytheAttack = null;
            }
        }
        return;
    }

    if (
        boss.scytheCooldown > 0
        || boss.weaknessTimer > 0
        || distance < 20
        || distance > scytheData.range - 17
    ) {
        return;
    }

    if (phaseTwo && boss.shadowStepCooldown <= 0
        && distance > scytheData.range - 15
        && distance <= shadowStepData.range) {
        const directionX = (playerX - bossX) / (distance || 1);
        const directionY = (playerY - bossY) / (distance || 1);
        const target = findBossHazardTarget(
            playerX + directionX * 48,
            playerY + directionY * 48
        );
        if (target) {
            boss.shadowStepTarget = target;
            boss.shadowStepWarning = shadowStepData.warning;
            boss.shadowStepCooldown = shadowStepData.cooldown;
            info.textContent = 'O Ceifador prepara um passo entre sombras! A marca no chão indica onde surgirá.';
            playCreatureSound(boss.bossType, 'warning');
            return;
        }
    }

    const directionX = playerX - bossX;
    const directionY = playerY - bossY;
    const facing = Math.abs(directionX) > Math.abs(directionY)
        ? { x: Math.sign(directionX), y: 0 }
        : { x: 0, y: Math.sign(directionY) };
    boss.facingX = facing.x;
    boss.facingY = facing.y;
    boss.dirX = facing.x;
    boss.dirY = facing.y;
    boss.scytheAttack = {
        phase: 'warning',
        timer: scytheData.warning * (phaseTwo
            ? GAME_BALANCE.bosses.reaperPhaseTwoWarningMultiplier
            : 1),
        originX: bossX,
        originY: bossY,
        directionX: facing.x,
        directionY: facing.y,
        hit: false
    };
    boss.scytheCooldown = scytheData.cooldown * (phaseTwo ? 0.65 : 1);
    boss.attackTimer = boss.scytheAttack.timer;
    info.textContent = 'O Ceifador prepara um golpe de foice! Afaste-se da área marcada!';
    recordBossAttack(boss);
    playCreatureSound(boss.bossType, 'warning');
}

function updateChestMimics(delta) {
    if (devMode) {
        return;
    }
    const playerCenterX = player.x + player.size / 2;
    const playerCenterY = player.y + player.size / 2;

    for (const chest of chests) {
        if (!chest.isMimic || chest.health <= 0) {
            continue;
        }

        if (chest.mimicState === 'attached') {
            chest.mimicAttachTime = Math.max(0, chest.mimicAttachTime - delta);
            chest.mimicAnimationTime += delta;
            chest.mimicDamageTimer -= delta;
            if (chest.mimicDamageTimer <= 0) {
                chest.mimicDamageTimer += 1;
                const damage = Math.min(3, player.health);
                player.health -= damage;
                recordBotDamage(damage);
                updateHealthHud();
                if (player.health === 0) {
                    endSusanoOnDeath();
                    gameState = 'lost';
                    questText.textContent = 'Você foi encontrado';
                    info.textContent = 'O mimico grudado acabou com sua vida. Pressione reiniciar para tentar novamente.';
                    updateBotStatus();
                } else {
                    info.textContent = `O mimico grudado causou 3 de dano contínuo! Vida restante: ${player.health}.`;
                }
            }
            if (chest.mimicAttachTime === 0) {
                chest.mimicState = 'revealed';
            }
            continue;
        }

        const distance = Math.hypot(
            chest.x * tileSize + tileSize / 2 - playerCenterX,
            chest.y * tileSize + tileSize / 2 - playerCenterY
        );
        chest.mimicAttackCooldown = Math.max(0, chest.mimicAttackCooldown - delta);

        if (chest.mimicState === 'hidden') {
            if (distance <= 34) {
                chest.mimicState = 'transforming';
                chest.mimicAnimationTime = 0;
            }
            continue;
        }

        if (chest.mimicState === 'transforming') {
            chest.mimicAnimationTime += delta;
            if (chest.mimicAnimationTime >= 0.6) {
                chest.mimicState = 'revealed';
            }
            continue;
        }

        if (chest.mimicState === 'attacking') {
            if (distance > 34) {
                chest.mimicState = 'revealed';
                continue;
            }

            chest.mimicAnimationTime += delta;
            if (!chest.mimicAttackHit && chest.mimicAnimationTime >= 0.44) {
                chest.mimicAttackHit = true;
                if (damagePlayer(8, 'O mimico atacou você!') && Math.random() < 0.25) {
                    chest.mimicState = 'attached';
                    chest.mimicAttachTime = 5;
                    chest.mimicDamageTimer = 1;
                    chest.mimicAnimationTime = 0;
                    info.textContent = 'O mimico grudou em você! Ele causará 3 de dano por segundo por 5 segundos.';
                }
            }
            if (
                chest.mimicState === 'attacking'
                && chest.mimicAnimationTime >= 1.1
            ) {
                chest.mimicState = 'revealed';
            }
            continue;
        }

        if (distance <= 34 && chest.mimicAttackCooldown === 0) {
            chest.mimicState = 'attacking';
            chest.mimicAnimationTime = 0;
            chest.mimicAttackCooldown = 1.5;
            chest.mimicAttackHit = false;
        }
    }
}

function cleanupDefeatedEnemies() {
    const enemyCountBeforeCleanup = enemies.length;
    let survivorCount = 0;
    for (let enemyIndex = 0; enemyIndex < enemyCountBeforeCleanup; enemyIndex++) {
        const enemy = enemies[enemyIndex];
        if (!enemy.dying || enemy.deathTimer > 0) {
            if (survivorCount !== enemyIndex) {
                enemies[survivorCount] = enemy;
            }
            survivorCount++;
        }
    }

    if (survivorCount < enemyCountBeforeCleanup) {
        enemies.length = survivorCount;
        updateFloorCombatProgress();
    }
}

function update(delta, botDelta = delta) {
    updateImpactParticles(delta);
    if (gameState !== 'playing' || shopOpen) {
        return;
    }

    updateAutomaticDoors(delta);
    updateSewerWater(delta);
    for (const room of secretRooms) {
        room.revealTimer = Math.max(0, room.revealTimer - delta);
    }
    if (devMode) {
        player.poisonTimer = 0;
        player.poisonTickTimer = 0;
        player.poisonDamageRemaining = 0;
        player.burnTimer = 0;
        player.burnTickTimer = 0;
        player.burnDamageRemaining = 0;
        player.webbedTimer = 0;
    }
    if (player.specialAbilityCooldowns.sword > 0) {
        const previousRemaining = Math.ceil(player.specialAbilityCooldowns.sword);
        player.specialAbilityCooldowns.sword = Math.max(
            0,
            player.specialAbilityCooldowns.sword - delta
        );
        if (Math.ceil(player.specialAbilityCooldowns.sword) !== previousRemaining) {
            updateSpecialAbilitiesHud();
        }
    }
    if (botMode && botDelta > 0) {
        updateBot(botDelta);
    }
    movePlayer(delta);
    updateSusanoEffects(delta);
    breakCobwebsAtEntity(player);
    player.attackCooldown = Math.max(0, player.attackCooldown - delta);
    player.attackTimer = Math.max(0, player.attackTimer - delta);
    player.maleAttackAnimationTimer = Math.max(0, player.maleAttackAnimationTimer - delta);
    player.spearCooldown = Math.max(0, player.spearCooldown - delta);
    player.spearAttackTimer = Math.max(0, player.spearAttackTimer - delta);
    player.arrowCooldown = Math.max(0, player.arrowCooldown - delta);
    player.damageCooldown = Math.max(0, player.damageCooldown - delta);
    if (player.poisonDamageRemaining > 0) {
        player.poisonTickTimer -= delta;
        while (player.poisonTickTimer <= 0.000001 && player.poisonDamageRemaining > 0) {
            player.poisonTickTimer += 0.3;
            const poisonDamage = Math.min(1, player.poisonDamageRemaining);
            player.poisonDamageRemaining -= poisonDamage;
            player.health = Math.max(0, player.health - poisonDamage);
            recordBotDamage(poisonDamage);
            updateHealthHud();
            if (player.health === 0) {
                endSusanoOnDeath();
                gameState = 'lost';
                questText.textContent = 'Você foi encontrado';
                info.textContent = 'O veneno acabou com sua vida. Pressione reiniciar para tentar novamente.';
                updateBotStatus();
                break;
            }
        }
        player.poisonTimer = player.poisonDamageRemaining > 0
            ? Math.max(0, player.poisonTimer - delta)
            : 0;
    } else {
        player.poisonTimer = 0;
        player.poisonTickTimer = 0;
    }
    if (player.burnDamageRemaining > 0) {
        player.burnTickTimer -= delta;
        while (player.burnTickTimer <= 0.000001 && player.burnDamageRemaining > 0) {
            player.burnTickTimer += 0.5;
            const burnDamage = Math.min(1, player.burnDamageRemaining);
            player.burnDamageRemaining -= burnDamage;
            player.health = Math.max(0, player.health - burnDamage);
            recordBotDamage(burnDamage);
            updateHealthHud();
            if (player.health === 0) {
                endSusanoOnDeath();
                gameState = 'lost';
                questText.textContent = 'Você foi encontrado';
                info.textContent = 'A queimadura acabou com sua vida. Pressione reiniciar para tentar novamente.';
                updateBotStatus();
                break;
            }
        }
        player.burnTimer = player.burnDamageRemaining > 0
            ? Math.max(0, player.burnTimer - delta)
            : 0;
    } else {
        player.burnTimer = 0;
        player.burnTickTimer = 0;
    }
    player.counterAttackTimer = Math.max(0, player.counterAttackTimer - delta);
    player.dodgeTimer = Math.max(0, player.dodgeTimer - delta);
    for (const barrel of barrels) {
        barrel.hitFlash = Math.max(0, barrel.hitFlash - delta);
    }
    for (const chest of chests) {
        chest.hitFlash = Math.max(0, chest.hitFlash - delta);
    }
    updateChestMimics(delta);
    checkPlayerTile();
    for (const drop of oreDrops) {
        drop.animTime += delta;
    }
    collectOreDrops();
    for (const drop of itemDrops) {
        drop.animTime += delta;
    }
    collectItemDrops();

    for (const enemy of enemies) {
        moveEnemy(enemy, delta);
        if (enemy.health > 0 && !enemy.dying) {
            breakCobwebsAtEntity(enemy);
        }
    }
    updateAutomaticDoors(delta);
    updatePlayerArrows(delta);
    cleanupDefeatedEnemies();
    if (devMode || raceWarActive) {
        for (const boss of enemies) {
            if (boss.isBoss) {
                boss.fireballs = [];
                boss.fireballTarget = null;
                boss.lavaPools = [];
                boss.thrownRocks = [];
                boss.eruptions = [];
                boss.scytheAttack = null;
            }
        }
    } else {
        updateBossFireballs(delta);
        for (const boss of enemies) {
            if (
                boss.isBoss
                && boss.bossType === 'grimReaper'
                && boss.health > 0
            ) {
                updateGrimReaperAttacks(boss, delta);
            } else if (
                boss.isBoss
                && boss.bossType === 'lavaGolem'
                && boss.health > 0
            ) {
                updateLavaGolemAttacks(boss, delta);
            }
        }
    }
    checkCollision();
}
