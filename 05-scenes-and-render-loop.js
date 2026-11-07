const renderEntityOrder = [];

function releaseHiddenRenderCaches() {
    releaseMapBaseCanvas();
    releaseWallCornerCobwebCanvas();
    releaseSusanoPixelCanvas();
    releaseImpactParticles();
}

function hasVisibleAttackCue(enemy) {
    return enemy.isBoss
        || enemy.attackTimer > 0
        || enemy.attackWarningTimer > 0
        || enemy.toxicBiteWarning > 0
        || enemy.shoulderBashWarning > 0
        || enemy.runnerLungeWarning > 0
        || enemy.slamWarning > 0
        || enemy.slamImpactTimer > 0
        || enemy.dogPounceWarning > 0
        || enemy.sentinelBeamWarning > 0
        || enemy.echoWaveWarning > 0
        || enemy.tailSweepWarning > 0
        || enemy.glyphWarning > 0
        || enemy.spiderLeapTimer > 0
        || enemy.spiderWebTimer > 0
        || enemy.shadowStepWarning > 0
        || enemy.shadowStepTimer > 0;
}

function isEnemyNearRenderViewport(enemy) {
    const margin = Math.max(32, (enemy.heightBlocks || 1) * tileSize + 8);
    return !(
        enemy.x + enemy.size < renderCameraX - margin
        || enemy.x > renderCameraX + cameraViewportWidth + margin
        || enemy.y + enemy.size < renderCameraY - margin
        || enemy.y > renderCameraY + cameraViewportHeight + margin
    );
}

function drawOverlay() {
    if (gameState === 'won' || gameState === 'lost') {
        ctx.save();
        try {
            ctx.setTransform(renderPixelScale, 0, 0, renderPixelScale, 0, 0);
            ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
            ctx.fillRect(0, 0, cameraViewportWidth, cameraViewportHeight);

            ctx.fillStyle = '#f8fafc';
            ctx.font = 'bold 14px monospace';
            const text = gameState === 'won' && botLearning && botLearning.completed
                ? `Bot IA concluiu ${finalFloor} andares!`
                : gameState === 'won' ? 'Você venceu!' : 'Game Over';
            const textWidth = ctx.measureText(text).width;
            ctx.fillText(text, (cameraViewportWidth - textWidth) / 2, cameraViewportHeight / 2);
            if (gameState === 'won' && botLearning && botLearning.completed) {
                ctx.font = '7px monospace';
                const detail = `Aprendizado: ${botLearning.bowHits} acertos de arco, ${botLearning.swordHits} de espada`;
                ctx.fillText(
                    detail,
                    (cameraViewportWidth - ctx.measureText(detail).width) / 2,
                    cameraViewportHeight / 2 + 14
                );
            }
        } finally {
            ctx.restore();
        }
    }
}

function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (gameState === 'menu') {
        return;
    }
    cameraX = Math.max(
        0,
        Math.min(gridWidth - cameraViewportWidth, player.x + player.size / 2 - cameraViewportWidth / 2)
    );
    cameraY = Math.max(
        0,
        Math.min(gridHeight - cameraViewportHeight, player.y + player.size / 2 - cameraViewportHeight / 2)
    );
    renderCameraX = Math.round(cameraX * renderPixelScale) / renderPixelScale;
    renderCameraY = Math.round(cameraY * renderPixelScale) / renderPixelScale;
    ctx.setTransform(renderPixelScale, 0, 0, renderPixelScale, 0, 0);
    ctx.translate(-renderCameraX, -renderCameraY);
    drawMap();
    drawSewerDetails();
    drawBarrels();
    drawChests();
    drawLighting();
    drawAmbientDust();
    drawCastleColumns();
    drawBossHazards();
    drawOreDrops();
    drawItemDrops();
    renderEntityOrder.length = 0;
    renderEntityOrder.push(player);
    drawRemotePlayers();
    drawRemoteWorld();
    for (const npc of floorNpcs) {
        if (isEnemyNearRenderViewport(npc)) {
            renderEntityOrder.push(npc);
        }
    }
    for (const enemy of enemies) {
        if (isEnemyNearRenderViewport(enemy) || hasVisibleAttackCue(enemy)) {
            renderEntityOrder.push(enemy);
        }
    }
    renderEntityOrder.sort((left, right) => {
        const leftDepth = left === player || left.isBoss || left.isFloorNpc
            ? left.y + left.size
            : left.y + tileSize - 3;
        const rightDepth = right === player || right.isBoss || right.isFloorNpc
            ? right.y + right.size
            : right.y + tileSize - 3;
        return leftDepth - rightDepth;
    });
    for (const entity of renderEntityOrder) {
        if (entity === player) {
            drawPlayer();
            continue;
        }
        if (entity.isFloorNpc) {
            drawFloorNpc(entity);
            continue;
        }
        const enemy = entity;

        const offsetX = Math.round(enemy.x * renderPixelScale) / renderPixelScale - enemy.x;
        const offsetY = Math.round(enemy.y * renderPixelScale) / renderPixelScale - enemy.y;
        if (offsetX !== 0 || offsetY !== 0) {
            ctx.translate(offsetX, offsetY);
            try {
                drawEnemy(enemy);
            } finally {
                ctx.translate(-offsetX, -offsetY);
            }
        } else {
            drawEnemy(enemy);
        }
    }
    drawForegroundAmbientDecorations();
    drawAttachedMimics();
    drawPlayerArrows();
    drawSpiderWebEffects();
    drawImpactParticles();
    drawSwordAttack();
    drawSpearAttack();
    drawVignette();
    drawOverlay();
}

function updateSimulationFrame(delta, updateCount) {
    for (let step = 0; step < updateCount; step++) {
        update(delta, delta);
        updateMultiplayer(delta);
    }
}

function loop(timestamp) {
    if (!loop.lastTime) {
        loop.lastTime = timestamp;
    }

    if (document.hidden) {
        loop.lastTime = timestamp;
        requestAnimationFrame(loop);
        return;
    }

    const delta = Math.min((timestamp - loop.lastTime) / 1000, 0.05);
    loop.lastTime = timestamp;

    const updateCount = botMode ? botSpeedMultiplier : 1;
    updateSimulationFrame(delta, updateCount);
    draw();
    requestAnimationFrame(loop);
}
