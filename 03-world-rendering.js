

const lavaLightRadius = 3.8;
const visualParticleLimit = 48;
const visualParticles = [];
const visualParticlePool = [];
const ambientDustCount = 52;
const torchLights = [];

function releaseImpactParticles() {
    for (const particle of visualParticles) {
        visualParticlePool.push(particle);
    }
    visualParticles.length = 0;
}

function spawnImpactParticles(x, y, color) {
    if (reducedVisualEffects) return;
    const particleCount = 6;
    for (let index = 0; index < particleCount; index++) {
        if (visualParticles.length >= visualParticleLimit) break;
        const angle = Math.PI * 2 * index / particleCount;
        const speed = 16 + (index % 3) * 5;
        const particle = visualParticlePool.pop() || {};
        particle.x = x;
        particle.y = y;
        particle.velocityX = Math.cos(angle) * speed;
        particle.velocityY = Math.sin(angle) * speed;
        particle.color = color;
        particle.lifetime = 0.28;
        particle.maxLifetime = 0.28;
        visualParticles.push(particle);
    }
}

function updateImpactParticles(delta) {
    for (let index = visualParticles.length - 1; index >= 0; index--) {
        const particle = visualParticles[index];
        particle.lifetime -= delta;
        if (particle.lifetime <= 0) {
            visualParticles[index] = visualParticles[visualParticles.length - 1];
            visualParticles.pop();
            visualParticlePool.push(particle);
            continue;
        }
        particle.x += particle.velocityX * delta;
        particle.y += particle.velocityY * delta;
        particle.velocityX *= 0.9;
        particle.velocityY = particle.velocityY * 0.9 + 12 * delta;
    }
}

function getVisualPulse(time, frequency) {
    return reducedVisualEffects ? 0.5 : (Math.sin(time * frequency) + 1) / 2;
}

function drawPixelGlow(centerX, centerY, radius, color, steps = 4) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = color;
    for (let step = 0; step < steps; step += 1) {
        const inset = Math.round(radius * step / steps / 2);
        const size = Math.max(1, Math.round(radius * 2 - inset * 2));
        ctx.globalAlpha = 0.15 + (step / steps) * 0.45;
        ctx.fillRect(
            Math.round(centerX - size / 2),
            Math.round(centerY - size / 2),
            size,
            size
        );
    }
    ctx.restore();
}

function drawImpactParticles() {
    if (reducedVisualEffects) return;
    for (const particle of visualParticles) {
        const life = particle.lifetime / particle.maxLifetime;
        ctx.globalAlpha = Math.ceil(life * 4) / 4;
        ctx.fillStyle = particle.color;
        ctx.fillRect(
            Math.round(particle.x * renderPixelScale) / renderPixelScale,
            Math.round(particle.y * renderPixelScale) / renderPixelScale,
            1,
            1
        );
    }
    ctx.globalAlpha = 1;
}

function drawExitTile(col, row) {
    const x = col * tileSize;
    const y = row * tileSize;
    const centerX = x + tileSize / 2;
    const baseY = y + tileSize - 1;
    drawFloorTile(col, row);

    drawPixelGlow(centerX, y + 5, 29, 'rgba(49, 137, 226, 0.5)', 5);

    ctx.fillStyle = 'rgba(75, 157, 255, 0.22)';
    ctx.fillRect(centerX - 14, y - 16, 28, 31);
    ctx.fillStyle = '#17242c';
    ctx.fillRect(centerX - 12, y - 13, 24, 29);
    ctx.fillStyle = '#58616a';
    ctx.fillRect(centerX - 11, y - 14, 5, 31);
    ctx.fillRect(centerX + 6, y - 14, 5, 31);
    ctx.fillRect(centerX - 7, y - 17, 14, 4);
    ctx.fillRect(centerX - 10, y - 15, 4, 4);
    ctx.fillRect(centerX + 6, y - 15, 4, 4);
    ctx.fillStyle = '#89939a';
    ctx.fillRect(centerX - 9, y - 13, 2, 26);
    ctx.fillRect(centerX + 7, y - 13, 2, 26);
    ctx.fillRect(centerX - 5, y - 16, 10, 1);
    ctx.fillStyle = '#b7a474';
    ctx.fillRect(centerX - 7, y - 13, 2, 3);
    ctx.fillRect(centerX + 5, y - 13, 2, 3);
    ctx.fillStyle = '#d8c58b';
    ctx.fillRect(centerX - 4, y - 16, 8, 2);
    ctx.fillStyle = '#08273f';
    ctx.fillRect(centerX - 6, y - 10, 12, 24);
    ctx.fillStyle = '#14548a';
    ctx.fillRect(centerX - 4, y - 8, 8, 20);
    ctx.fillStyle = '#2e9ee5';
    ctx.fillRect(centerX - 3, y - 8, 3, 18);
    ctx.fillRect(centerX + 2, y - 4, 2, 13);
    ctx.fillStyle = '#a4e8ff';
    ctx.fillRect(centerX - 3, y - 7, 2, 7);
    ctx.fillRect(centerX - 1, y + 1, 4, 1);
    ctx.fillRect(centerX + 2, y + 5, 2, 4);
    ctx.fillStyle = '#d8f7ff';
    ctx.fillRect(centerX - 1, y - 5, 1, 2);
    ctx.fillRect(centerX + 3, y + 2, 1, 1);
    ctx.fillStyle = '#59636a';
    ctx.fillRect(centerX - 15, baseY - 1, 30, 3);
    ctx.fillStyle = '#a9a083';
    ctx.fillRect(centerX - 12, baseY - 2, 24, 2);
    ctx.fillStyle = '#dfd09b';
    ctx.fillRect(centerX - 7, baseY - 2, 14, 1);

    const particlePhase = reducedVisualEffects ? 0 : performance.now() / 220;
    const particleCount = reducedVisualEffects ? 2 : 7;
    for (let i = 0; i < particleCount; i++) {
        const phase = particlePhase + i * 1.73;
        const particleX = Math.round(
            (centerX + Math.sin(phase * 0.8) * (10 + (i % 3) * 2)) * renderPixelScale
        ) / renderPixelScale;
        const particleY = Math.round(
            (y + 10 - ((phase * 4 + i * 5) % 28)) * renderPixelScale
        ) / renderPixelScale;
        const size = i % 3 === 0 ? 2 : 1;
        ctx.fillStyle = 'rgba(75, 170, 255, 0.45)';
        ctx.fillRect(particleX - 1, particleY - 1, size + 2, size + 2);
        ctx.fillStyle = '#e5f9ff';
        ctx.fillRect(particleX, particleY, size, size);
    }
}

function drawTorch(torch) {
    const x = torch.x * tileSize;
    const y = torch.y * tileSize;
    const environment = getFloorVisualEnvironment();
    const flicker = reducedVisualEffects
        ? 0.5
        : (Math.sin(performance.now() / 95 + torch.x * 2.7 + torch.y) + 1) / 2;
    const pixelFlicker = Math.round(flicker * 3) / 3;

    drawPixelGlow(
        x + 8,
        y + 5,
        10,
        environment.torchGlow.replace('0.12', (0.08 + pixelFlicker * 0.08).toFixed(3)),
        3
    );

    ctx.fillStyle = '#171716';
    ctx.fillRect(x + 4, y + 11, 8, 2);
    ctx.fillRect(x + 6, y + 9, 2, 3);
    ctx.fillRect(x + 9, y + 9, 2, 3);

    ctx.fillStyle = '#55534b';
    ctx.fillRect(x + 5, y + 10, 6, 2);
    ctx.fillStyle = '#858173';
    ctx.fillRect(x + 6, y + 10, 4, 1);
    ctx.fillStyle = '#292b29';
    ctx.fillRect(x + 7, y + 7, 2, 4);

    ctx.fillStyle = '#3c2719';
    ctx.fillRect(x + 6, y + 5, 4, 7);
    ctx.fillStyle = '#75452a';
    ctx.fillRect(x + 7, y + 6, 2, 5);
    ctx.fillStyle = '#a16a38';
    ctx.fillRect(x + 7, y + 7, 1, 3);
    ctx.fillStyle = '#46301e';
    ctx.fillRect(x + 6, y + 9, 4, 1);

    ctx.fillStyle = '#922f18';
    ctx.fillRect(x + 5, y + 3, 6, 4);
    ctx.fillRect(x + 6, y + 2, 4, 2);
    ctx.fillRect(x + 7, y + 1 - pixelFlicker, 2, 1 + pixelFlicker);
    ctx.fillRect(x + 4 + Math.round(pixelFlicker * 2) * 3, y + 4, 1, 2);

    ctx.fillStyle = '#e86d24';
    ctx.fillRect(x + 6, y + 3, 4, 3);
    ctx.fillRect(x + 7, y + 2, 2, 2);
    ctx.fillStyle = '#ffc34f';
    ctx.fillRect(x + 7, y + 3, 2, 3);
    ctx.fillRect(x + 6, y + 4, 1, 1);
    ctx.fillStyle = '#fff0a1';
    ctx.fillRect(x + 7, y + 3, 1, 2);
}

function drawCastleRug(decoration) {
    const x = decoration.x * tileSize;
    const y = decoration.y * tileSize;
    const width = decoration.width * tileSize;
    const height = decoration.height * tileSize;
    const inset = Math.min(5, Math.floor(height / 5));
    const [shadow, border, field, insetColor, highlight] = (
        getFloorVisualEnvironment().rugPalette
    );

    ctx.fillStyle = shadow;
    ctx.fillRect(x - 2, y - 2, width + 4, height + 4);
    ctx.fillStyle = border;
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = field;
    ctx.fillRect(x + 3, y + 3, width - 6, height - 6);
    ctx.fillStyle = insetColor;
    ctx.fillRect(x + inset, y + inset, width - inset * 2, height - inset * 2);
    ctx.fillStyle = highlight;
    ctx.fillRect(x + inset + 2, y + inset + 2, width - inset * 2 - 4, height - inset * 2 - 4);

    ctx.fillStyle = highlight;
    for (let index = 0; index < decoration.width; index++) {
        const fringeX = x + index * tileSize + 5;
        ctx.fillRect(fringeX, y - 2, 3, 2);
        ctx.fillRect(fringeX, y + height, 3, 2);
    }
    for (let index = 0; index < decoration.height; index++) {
        const fringeY = y + index * tileSize + 5;
        ctx.fillRect(x - 2, fringeY, 2, 3);
        ctx.fillRect(x + width, fringeY, 2, 3);
    }

    const centerX = x + width / 2;
    const centerY = y + height / 2;
    ctx.fillStyle = highlight;
    ctx.fillRect(centerX - 5, centerY - 1, 10, 3);
    ctx.fillRect(centerX - 1, centerY - 5, 3, 10);
    ctx.fillStyle = '#f4e2b2';
    ctx.fillRect(centerX - 2, centerY - 2, 4, 4);
    ctx.fillStyle = border;
    for (const [motifX, motifY] of [
        [x + inset + 5, y + inset + 5],
        [x + width - inset - 8, y + inset + 5],
        [x + inset + 5, y + height - inset - 8],
        [x + width - inset - 8, y + height - inset - 8]
    ]) {
        ctx.fillRect(motifX, motifY + 2, 3, 3);
        ctx.fillRect(motifX + 2, motifY, 3, 3);
    }
}

function drawCastleWindow(decoration) {
    if (!castleWindowSpriteSheet.complete || castleWindowSpriteSheet.naturalWidth === 0) {
        return;
    }

    const heightBlocks = decoration.heightBlocks === 2 ? 2 : 1;
    const variantIndex = Math.abs(decoration.seed || 0) % castleWindowSpriteCells.length;
    const source = castleWindowSpriteCells[variantIndex];
    const height = tileSize * heightBlocks;
    const width = height * source.width / source.height;
    const isVertical = decoration.orientation === 'vertical';
    const wallCenterX = (
        decoration.x + (isVertical ? 0.5 : (decoration.width || 1) / 2)
    ) * tileSize;
    const wallCenterY = (
        decoration.y + (isVertical ? (decoration.width || 1) / 2 : 0.5)
    ) * tileSize;

    ctx.save();
    ctx.translate(wallCenterX, wallCenterY);
    ctx.drawImage(
        castleWindowSpriteSheet,
        source.x,
        source.y,
        source.width,
        source.height,
        Math.round(-width / 2),
        Math.round(-height / 2),
        Math.round(width),
        height
    );
    ctx.restore();
}

function drawCastleStairs(decoration) {
    const x = decoration.x * tileSize;
    const y = decoration.y * tileSize;
    const width = tileSize * 3;
    const height = tileSize * 3;

    ctx.fillStyle = '#211e1b';
    ctx.fillRect(x + 2, y + 2, width - 4, height - 4);
    ctx.fillStyle = '#75634b';
    ctx.fillRect(x + 4, y + 4, width - 8, height - 8);
    ctx.fillStyle = '#b5a17a';
    ctx.fillRect(x + 6, y + 5, width - 12, 2);
    ctx.fillRect(x + 6, y + height - 7, width - 12, 2);

    const stepCount = 5;
    for (let step = 0; step < stepCount; step++) {
        const inset = 8 + step * 4;
        const stepY = decoration.direction === 'down'
            ? y + 7 + step * 5
            : y + height - 12 - step * 5;
        ctx.fillStyle = step % 2 === 0 ? '#b7a47e' : '#928064';
        ctx.fillRect(x + inset, stepY, width - inset * 2, 4);
        ctx.fillStyle = '#d5c49a';
        ctx.fillRect(x + inset, stepY, width - inset * 2, 1);
    }
    ctx.fillStyle = '#e0c479';
    ctx.fillRect(x + width / 2 - 2, decoration.direction === 'down' ? y + 6 : y + height - 9, 4, 2);
}

function drawCastleBossHall(decoration) {
    const centerX = decoration.x * tileSize + Math.floor(tileSize / 2);
    const centerY = decoration.y * tileSize + Math.floor(tileSize / 2);
    for (let offsetY = -4; offsetY <= 4; offsetY++) {
        for (let offsetX = -4; offsetX <= 4; offsetX++) {
            const distance = offsetX * offsetX + offsetY * offsetY;
            if (
                distance >= 10
                && distance <= 18
                && (offsetX + offsetY) % 2 === 0
            ) {
                ctx.fillStyle = '#756143';
                ctx.fillRect(
                    centerX + offsetX * tileSize - 1,
                    centerY + offsetY * tileSize - 1,
                    3,
                    3
                );
            } else if (distance >= 3 && distance <= 6) {
                ctx.fillStyle = '#566d70';
                ctx.fillRect(
                    centerX + offsetX * tileSize,
                    centerY + offsetY * tileSize,
                    2,
                    2
                );
            }
        }
    }

    ctx.fillStyle = '#8b7048';
    ctx.fillRect(centerX - 4, centerY - 1, 9, 3);
    ctx.fillRect(centerX - 1, centerY - 4, 3, 9);
    ctx.fillStyle = '#d0b57b';
    ctx.fillRect(centerX - 1, centerY - 1, 3, 3);
}

const ambientDecorationSpriteFiles = {
    mineSupport: 'mine-support.png',
    mineCart: 'mine-cart.png',
    minePickaxe: 'mine-pickaxe.png',
    mineShovel: 'mine-shovel.png',
    mineLantern: 'mine-lantern.png',
    minePuddle: 'mine-puddle.png',
    mineRubble: 'mine-rubble.png',
    mineWeb: 'mine-web.png',
    cisternPipe: 'cistern-pipe.png',
    cisternGrate: 'cistern-grate.png',
    cisternVent: 'cistern-vent.png',
    cisternSoot: 'cistern-soot.png'
};
const ambientDecorationSprites = new Map(
    Object.entries(ambientDecorationSpriteFiles).map(([type, fileName]) => {
        const sprite = new Image();
        sprite.src = `assets/environmental/${fileName}`;
        sprite.onerror = () => console.error(
            `Falha ao carregar assets/environmental/${fileName}.`
        );
        return [type, sprite];
    })
);
const castleWindowSpriteSheet = new Image();
castleWindowSpriteSheet.onload = () => {
    invalidateMapBaseCanvas();
    prefetchedMapBaseCanvasMap = null;
    prefetchedMapBaseCanvasFloor = -1;
};
castleWindowSpriteSheet.onerror = () => console.error(
    'Falha ao carregar assets/environmental/castle-windows.png.'
);
castleWindowSpriteSheet.src = 'assets/environmental/castle-windows.png';
const castleWindowSpriteCells = [
    { x: 8, y: 7, width: 132, height: 213 },
    { x: 173, y: 8, width: 134, height: 223 },
    { x: 330, y: 7, width: 131, height: 224 },
    { x: 489, y: 7, width: 135, height: 224 },
    { x: 8, y: 226, width: 130, height: 208 },
    { x: 155, y: 233, width: 151, height: 207 },
    { x: 326, y: 233, width: 133, height: 214 }
];

function drawAmbientDecoration(decoration) {
    const footprint = getAmbientDecorationFootprint(
        decoration.type,
        'horizontal'
    );
    const widthBlocks = decoration.orientation === 'vertical'
        ? decoration.heightBlocks || footprint.width
        : decoration.widthBlocks || footprint.width;
    const heightBlocks = decoration.orientation === 'vertical'
        ? decoration.widthBlocks || footprint.height
        : decoration.heightBlocks || footprint.height;
    const width = widthBlocks * tileSize;
    const height = heightBlocks * tileSize;
    const footprintBounds = getAmbientDecorationFootprintBounds(decoration);
    const rotated = decoration.orientation === 'vertical';
    const drawWidth = rotated ? height : width;
    const drawHeight = rotated ? width : height;
    const scaleX = width / 32;
    const scaleY = height / 32;
    const environment = getFloorVisualEnvironment();
    const isMine = environment.region === 'mine';
    const isCistern = environment.region === 'cistern';
    const woodDark = isMine || isCistern ? '#241b16' : '#261e1d';
    const wood = isMine || isCistern ? '#60442d' : '#5a392d';
    const woodLight = isMine || isCistern ? '#a47a4b' : '#9a7043';
    const iron = '#515957';
    const ironLight = '#a0a59a';
    const stone = '#686860';
    const stoneLight = '#aaa28b';
    const gold = '#c79b48';
    const blue = '#72a9b4';
    const corruption = environment.region === 'corrupted' ? '#b9344d' : '#7b3348';
    const box = (x, y, width, height, color) => {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width, height);
    };

    ctx.save();
    ctx.translate(footprintBounds.left, footprintBounds.top);
    if (rotated) {
        ctx.translate(drawWidth / 2, drawHeight / 2);
        ctx.rotate(Math.PI / 2);
        ctx.translate(-width / 2, -height / 2);
    }
    const sprite = ambientDecorationSprites.get(decoration.type);
    if (sprite?.complete && sprite.naturalWidth > 0) {
        if (decoration.type === 'mineSupport') {
            ctx.drawImage(
                sprite,
                0,
                0,
                width,
                height
            );
            ctx.restore();
            return;
        }
        const fitScale = Math.min(width / sprite.naturalWidth, height / sprite.naturalHeight);
        const spriteWidth = sprite.naturalWidth * fitScale;
        const spriteHeight = sprite.naturalHeight * fitScale;
        const spriteLeft = (width - spriteWidth) / 2;
        const spriteTop = (height - spriteHeight) / 2;
        ctx.fillStyle = 'rgba(7, 8, 9, 0.62)';
        ctx.fillRect(
            spriteLeft + spriteWidth * 0.15,
            spriteTop + spriteHeight * 0.9,
            spriteWidth * 0.7,
            Math.min(3, spriteHeight * 0.08)
        );
        ctx.drawImage(
            sprite,
            spriteLeft,
            spriteTop,
            spriteWidth,
            spriteHeight
        );
        ctx.restore();
        return;
    }
    ctx.scale(scaleX, scaleY);
    box(5, 23, 22, 4, 'rgba(7, 8, 9, 0.62)');

    switch (decoration.type) {
        case 'mineSupport':
            box(0, 4, 5, 22, woodDark);
            box(27, 4, 5, 22, woodDark);
            box(0, 4, 32, 6, woodDark);
            box(1, 5, 3, 19, wood);
            box(28, 5, 3, 19, wood);
            box(1, 5, 30, 3, woodLight);
            box(11, 6, 2, 2, iron);
            box(21, 6, 2, 2, iron);
            box(6, 11, 2, 3, woodDark);
            box(24, 11, 2, 3, woodDark);
            break;
        case 'minePickaxe':
            box(9, 9, 3, 17, woodLight);
            box(5, 8, 12, 3, iron);
            box(7, 7, 8, 2, ironLight);
            box(7, 25, 17, 2, woodDark);
            break;
        case 'mineShovel':
            box(14, 6, 4, 17, woodLight);
            box(11, 5, 10, 3, iron);
            box(12, 20, 8, 6, ironLight);
            box(13, 22, 6, 3, iron);
            break;
        case 'mineLantern':
            box(11, 6, 10, 3, iron);
            box(13, 4, 6, 3, ironLight);
            box(14, 9, 4, 3, iron);
            box(9, 12, 14, 13, '#ffb52e');
            box(12, 13, 8, 11, '#fff0a1');
            box(14, 14, 4, 9, '#fff9d6');
            box(7, 11, 18, 3, iron);
            box(7, 23, 18, 4, iron);
            box(9, 24, 14, 2, ironLight);
            break;
        case 'minePuddle':
            box(4, 16, 24, 8, '#17282a');
            box(6, 15, 20, 7, '#31545a');
            box(9, 16, 13, 3, '#557478');
            box(8, 16, 7, 1, '#9bb3a7');
            box(23, 20, 2, 1, '#8fa99e');
            break;
        case 'mineRubble':
            box(5, 18, 8, 6, '#383b39');
            box(9, 13, 9, 9, '#68675d');
            box(17, 17, 10, 7, '#4b4d48');
            box(11, 14, 5, 2, '#929083');
            box(7, 19, 3, 2, '#858274');
            box(20, 18, 4, 2, '#77776d');
            break;
        case 'mineWeb':
            box(5, 5, 2, 22, '#b8b2a1');
            box(5, 5, 22, 2, '#b8b2a1');
            box(10, 10, 15, 1, '#8b8b82');
            box(10, 10, 1, 15, '#8b8b82');
            box(15, 15, 10, 1, '#d1c9b5');
            box(15, 15, 1, 10, '#d1c9b5');
            break;
        case 'cisternPipe':
            box(2, 7, 28, 8, '#24292a');
            box(3, 8, 27, 5, iron);
            box(4, 8, 25, 2, ironLight);
            box(10, 6, 3, 10, '#252b2b');
            box(22, 6, 3, 10, '#252b2b');
            box(10, 7, 2, 8, '#9b9b8b');
            box(22, 7, 2, 8, '#9b9b8b');
            box(18, 13, 3, 11, iron);
            box(16, 22, 7, 3, '#252b2b');
            box(17, 22, 5, 2, '#8b8e82');
            break;
        case 'cisternGrate':
            box(4, 7, 24, 19, '#232727');
            box(6, 9, 20, 15, '#304448');
            for (const grateX of [8, 13, 18, 23]) box(grateX, 9, 2, 15, ironLight);
            box(6, 12, 20, 2, iron);
            box(6, 20, 20, 2, iron);
            box(5, 8, 2, 2, '#d0b57b');
            box(25, 23, 2, 2, '#d0b57b');
            break;
        case 'cisternVent':
            box(6, 18, 20, 7, '#252927');
            box(8, 15, 16, 8, iron);
            box(10, 13, 12, 3, ironLight);
            box(12, 6, 2, 5, '#b5c3bd');
            box(18, 4, 2, 7, '#8faaa8');
            box(22, 8, 2, 4, '#c2c4b8');
            box(13, 9, 2, 3, '#637c7c');
            break;
        case 'castleRift':
        case 'castleCorruption':
            box(5, 3, 7, 10, '#1b1b1d');
            box(10, 10, 7, 8, '#1b1b1d');
            box(14, 16, 7, 12, '#1b1b1d');
            box(9, 8, 3, 3, '#1b1b1d');
            box(17, 18, 8, 3, '#1b1b1d');
            box(7, 5, 2, 7, corruption);
            box(11, 11, 4, 5, corruption);
            box(15, 17, 3, 8, corruption);
            box(11, 10, 2, 2, '#f08038');
            box(13, 13, 2, 3, '#f08038');
            box(16, 18, 2, 6, '#f08038');
            box(19, 19, 5, 2, corruption);
            box(8, 6, 1, 4, '#ffbd55');
            box(12, 12, 1, 2, '#ffdb72');
            box(17, 19, 1, 3, '#ffbd55');
            box(20, 19, 3, 1, '#f08038');
            break;
        case 'cisternSoot':
            box(5, 8, 22, 14, 'rgba(19, 17, 17, 0.65)');
            box(8, 6, 12, 2, '#302a27');
            box(8, 23, 3, 2, '#4f4740');
            box(20, 21, 5, 3, '#393532');
            box(12, 11, 2, 2, '#766456');
            box(21, 14, 2, 2, '#6d5b50');
            break;
        case 'castleBanner':
        case 'castleRoyalBanner':
            box(7, 4, 3, 25, woodDark);
            box(8, 5, 2, 22, gold);
            box(11, 6, 15, 14, '#6f2735');
            box(13, 8, 11, 10, '#9c3d43');
            box(15, 9, 7, 7, gold);
            box(17, 10, 3, 5, '#42232a');
            box(11, 19, 5, 4, '#6f2735');
            box(21, 19, 5, 4, '#6f2735');
            box(7, 3, 4, 3, gold);
            break;
        case 'castleArmor':
        case 'castleArmorStand':
            box(9, 24, 15, 3, woodDark);
            box(15, 18, 4, 7, wood);
            box(11, 12, 13, 11, iron);
            box(13, 13, 9, 7, ironLight);
            box(14, 14, 2, 5, '#d2d3c8');
            box(12, 7, 11, 7, '#293131');
            box(14, 6, 7, 7, '#9ca49a');
            box(17, 8, 3, 2, '#252a2a');
            box(10, 15, 3, 5, '#313736');
            box(22, 15, 3, 5, '#313736');
            break;
        case 'castleGate':
            box(4, 7, 24, 19, '#272524');
            box(7, 8, 18, 17, wood);
            box(9, 9, 2, 14, '#272421');
            box(14, 9, 2, 14, '#272421');
            box(19, 9, 2, 14, '#272421');
            box(7, 10, 18, 2, woodLight);
            box(7, 21, 18, 2, woodDark);
            box(6, 6, 20, 3, iron);
            break;
        case 'castleBunk':
        case 'castleCanopyBed':
            box(4, 23, 25, 3, woodDark);
            box(6, 11, 22, 13, wood);
            box(7, 12, 20, 8, '#89908a');
            box(8, 12, 7, 6, '#d2c7a6');
            box(16, 13, 10, 6, decoration.type === 'castleBunk' ? '#67717a' : '#78505a');
            box(5, 10, 3, 15, woodLight);
            box(26, 10, 3, 15, woodLight);
            box(6, 9, 22, 2, gold);
            break;
        case 'castleSupplyChest':
        case 'castleCoffer':
        case 'castleReinforcedChest':
            box(5, 13, 22, 12, woodDark);
            box(7, 14, 18, 8, wood);
            box(7, 13, 18, 3, woodLight);
            box(8, 17, 16, 1, '#382b21');
            box(14, 17, 4, 6, iron);
            box(15, 18, 2, 2, gold);
            box(6, 22, 20, 2, '#302721');
            box(8, 13, 2, 11, gold);
            box(22, 13, 2, 11, gold);
            break;
        case 'castleMealTable':
        case 'castleReadingDesk':
            box(5, 12, 22, 4, woodDark);
            box(7, 13, 18, 3, woodLight);
            box(8, 16, 3, 10, wood);
            box(21, 16, 3, 10, wood);
            box(12, 9, 6, 3, '#b7aa8a');
            box(19, 10, 3, 2, gold);
            break;
        case 'castleBookcase':
            box(5, 5, 22, 23, woodDark);
            box(7, 7, 18, 19, '#302722');
            for (const shelfY of [12, 18, 24]) box(7, shelfY, 18, 2, woodLight);
            for (const [bookX, bookY, bookColor] of [
                [9, 8, '#9a3e3a'], [13, 8, '#55736e'], [18, 8, '#b2914d'],
                [21, 13, '#686e92'], [11, 14, '#a37b45'], [16, 19, '#87474e'],
                [9, 20, '#5e7770'], [19, 20, '#b08b4c']
            ]) box(bookX, bookY, 3, 4, bookColor);
            break;
        case 'castleLadder':
            box(7, 5, 4, 23, woodDark);
            box(21, 5, 4, 23, woodDark);
            box(8, 6, 2, 20, woodLight);
            box(22, 6, 2, 20, woodLight);
            for (const rungY of [9, 14, 19, 24]) {
                box(9, rungY, 14, 3, woodDark);
                box(10, rungY, 12, 1, woodLight);
            }
            box(6, 4, 7, 2, iron);
            box(19, 4, 7, 2, iron);
            break;
        case 'castleScrolls':
            box(5, 20, 22, 4, woodDark);
            box(8, 11, 15, 8, '#d2c39a');
            box(6, 12, 4, 7, '#9d8a63');
            box(22, 12, 4, 7, '#9d8a63');
            box(10, 13, 9, 1, '#7b6648');
            box(10, 16, 11, 1, '#7b6648');
            box(13, 10, 5, 2, gold);
            break;
        case 'castleWeaponRack':
            box(5, 9, 22, 3, woodDark);
            box(7, 11, 18, 3, woodLight);
            for (const weaponX of [10, 16, 22]) {
                box(weaponX, 5, 2, 18, ironLight);
                box(weaponX - 2, 5, 6, 2, iron);
                box(weaponX - 2, 20, 6, 2, wood);
            }
            box(8, 24, 16, 2, woodDark);
            break;
        case 'castleShieldRack':
            box(5, 8, 22, 3, woodDark);
            box(7, 10, 18, 3, woodLight);
            for (const shieldX of [8, 15, 22]) {
                box(shieldX, 13, 5, 10, iron);
                box(shieldX + 1, 14, 3, 7, '#89908a');
                box(shieldX + 2, 15, 1, 5, gold);
                box(shieldX + 1, 22, 3, 2, '#47372c');
            }
            box(8, 25, 16, 2, woodDark);
            break;
        case 'castleAnvil':
            box(10, 21, 13, 5, woodDark);
            box(9, 18, 15, 4, iron);
            box(12, 14, 10, 5, ironLight);
            box(8, 12, 8, 3, ironLight);
            box(15, 13, 8, 2, '#d8d1b8');
            box(16, 8, 2, 7, wood);
            box(15, 6, 4, 4, iron);
            break;
        case 'castleAltar':
        case 'castleBench':
            box(4, 20, 24, 5, stone);
            box(6, 17, 20, 4, stoneLight);
            box(8, 24, 3, 4, '#3c3b38');
            box(21, 24, 3, 4, '#3c3b38');
            box(14, 10, 4, 8, gold);
            box(11, 12, 10, 3, gold);
            box(15, 11, 2, 5, '#e2c47d');
            break;
        case 'castleCandles':
        case 'castleChandelier':
            box(15, 4, 2, 6, iron);
            box(6, 10, 20, 3, gold);
            box(8, 13, 2, 6, '#e8d8ae');
            box(15, 13, 2, 6, '#e8d8ae');
            box(22, 13, 2, 6, '#e8d8ae');
            box(8, 9, 2, 3, '#ffad45');
            box(15, 9, 2, 3, '#ffdf8a');
            box(22, 9, 2, 3, '#ffad45');
            box(7, 18, 4, 2, '#ad6030');
            box(14, 18, 4, 2, '#ad6030');
            box(21, 18, 4, 2, '#ad6030');
            break;
        case 'castleAlchemy':
            box(5, 20, 22, 4, woodDark);
            box(7, 14, 18, 6, wood);
            box(9, 11, 4, 5, '#5e9d8b');
            box(10, 9, 2, 3, '#bbd7b6');
            box(16, 10, 5, 6, '#7869a2');
            box(17, 8, 3, 3, '#d0bc72');
            box(22, 14, 3, 5, '#9f5546');
            box(8, 25, 2, 3, woodLight);
            box(22, 25, 2, 3, woodLight);
            break;
        case 'castleTelescope':
            box(15, 9, 3, 14, iron);
            box(10, 24, 13, 2, ironLight);
            box(12, 20, 2, 6, iron);
            box(20, 20, 2, 6, iron);
            box(11, 6, 13, 5, iron);
            box(20, 5, 6, 7, '#354b59');
            box(22, 6, 2, 4, blue);
            box(13, 7, 5, 2, ironLight);
            break;
        case 'castleStarMap':
        case 'castleRune':
            box(5, 6, 22, 20, '#222532');
            box(7, 8, 18, 16, '#36354d');
            for (const [starX, starY] of [[10, 11], [16, 10], [21, 14], [12, 19], [19, 20]]) {
                box(starX, starY, 2, 2, '#f0d47a');
            }
            box(11, 12, 7, 1, '#9a8ac5');
            box(17, 11, 5, 4, '#9a8ac5');
            box(13, 13, 1, 6, '#9a8ac5');
            break;
        case 'castleCoinPile':
            box(5, 21, 22, 4, woodDark);
            box(8, 17, 18, 5, '#8a672c');
            box(10, 14, 14, 5, gold);
            box(12, 12, 10, 4, '#e0bd63');
            box(13, 12, 3, 2, '#fff0a1');
            box(20, 16, 2, 2, '#fff0a1');
            break;
        case 'castleStatue':
            box(8, 23, 17, 4, stone);
            box(10, 20, 13, 4, stoneLight);
            box(13, 10, 8, 12, gold);
            box(12, 6, 10, 6, '#c6a960');
            box(14, 8, 2, 2, '#362c27');
            box(19, 8, 2, 2, '#362c27');
            box(10, 14, 3, 7, '#92753e');
            box(21, 14, 3, 7, '#92753e');
            break;
        case 'castlePortrait':
            box(5, 4, 22, 24, woodDark);
            box(7, 6, 18, 20, gold);
            box(9, 8, 14, 16, '#35404a');
            box(11, 10, 10, 8, '#bc9a67');
            box(11, 10, 10, 2, '#39302b');
            box(12, 13, 2, 1, '#29272a');
            box(18, 13, 2, 1, '#29272a');
            box(14, 16, 4, 1, '#704b3a');
            box(10, 18, 12, 5, '#343632');
            box(12, 18, 8, 2, '#6d4a3c');
            box(9, 24, 14, 1, '#d3b261');
            break;
        case 'castleWarningSeal':
            box(5, 4, 22, 24, woodDark);
            box(7, 6, 18, 20, gold);
            box(9, 8, 14, 16, '#52283a');
            box(11, 10, 10, 11, '#8b343e');
            box(12, 11, 8, 1, '#e0bd63');
            box(13, 12, 2, 3, '#e0bd63');
            box(17, 12, 2, 3, '#e0bd63');
            box(14, 13, 4, 5, '#d5aa57');
            box(13, 17, 7, 1, '#f2d47a');
            box(14, 19, 5, 2, corruption);
            box(9, 24, 14, 1, '#d3b261');
            break;
        case 'castleCurtain':
            box(6, 5, 3, 22, gold);
            box(23, 5, 3, 22, gold);
            box(9, 6, 6, 20, '#733344');
            box(17, 6, 6, 20, '#733344');
            box(11, 7, 2, 17, '#ad5960');
            box(19, 7, 2, 17, '#ad5960');
            box(14, 12, 4, 4, gold);
            break;
        case 'castleFireplace':
            box(4, 8, 24, 19, stone);
            box(7, 9, 18, 15, '#282322');
            box(10, 15, 12, 8, '#752d22');
            box(12, 14, 3, 7, '#e16b2d');
            box(16, 12, 3, 10, '#ffbd57');
            box(19, 15, 3, 6, '#e37932');
            box(6, 6, 20, 3, stoneLight);
            break;
        case 'castleChain':
            for (const [chainX, chainY] of [[8, 5], [14, 11], [20, 17]]) {
                box(chainX, chainY, 4, 5, ironLight);
                box(chainX + 1, chainY + 1, 2, 3, '#343938');
            }
            box(9, 9, 5, 2, iron);
            box(15, 15, 5, 2, iron);
            box(21, 21, 4, 3, iron);
            break;
        case 'castleEnergyBarrier':
            box(5, 22, 22, 4, '#2b2634');
            box(2, 8, 2, 16, '#7d9de0');
            box(28, 8, 2, 16, '#7d9de0');
            box(3, 11, 26, 2, '#b8c5ed');
            box(3, 20, 26, 2, '#b8c5ed');
            box(5, 14, 22, 4, '#466c91');
            box(7, 15, 18, 1, '#c7e9ef');
            break;
        case 'castleCrystal':
            box(6, 22, 20, 4, '#2b2634');
            box(12, 20, 8, 4, '#3e3952');
            box(13, 11, 6, 11, '#624d8c');
            box(15, 5, 3, 8, '#b89ce8');
            box(10, 12, 4, 9, '#7859a7');
            box(19, 14, 4, 8, '#604987');
            box(16, 7, 1, 12, '#e3d8ff');
            box(11, 14, 1, 5, '#c5b4f1');
            break;
        case 'castleRunePillar':
            box(7, 23, 18, 4, '#2a2630');
            box(9, 7, 14, 18, '#555260');
            box(11, 8, 10, 15, '#85818a');
            box(12, 10, 8, 2, '#c0a766');
            box(15, 13, 2, 7, '#a987de');
            box(12, 15, 3, 2, '#a987de');
            box(17, 18, 3, 2, '#a987de');
            box(7, 5, 18, 3, '#b7a982');
            break;
        case 'castleArcaneCannon':
            box(6, 21, 20, 5, '#2b2634');
            box(10, 17, 12, 7, '#555260');
            box(11, 9, 15, 8, '#39394d');
            box(16, 10, 12, 6, '#78649d');
            box(26, 11, 4, 4, '#a88ad6');
            box(28, 12, 2, 2, '#d6c6ff');
            box(12, 11, 5, 4, '#292938');
            box(14, 12, 3, 2, '#84c5d0');
            box(8, 18, 4, 3, '#c79b48');
            break;
        case 'castleThrone':
            box(6, 22, 20, 5, '#34252b');
            box(8, 8, 16, 17, '#8e293e');
            box(5, 6, 5, 18, gold);
            box(22, 6, 5, 18, gold);
            box(10, 4, 12, 6, '#d3aa5b');
            box(12, 10, 8, 10, '#5a243b');
            box(14, 12, 4, 5, corruption);
            box(15, 12, 2, 7, '#f07858');
            break;
        default:
            box(7, 8, 18, 15, wood);
            box(9, 10, 14, 10, woodLight);
            box(14, 13, 4, 4, gold);
    }

    ctx.restore();
}

function drawAmbientDecorations() {
    for (const decoration of ambientDecorations) {
        if (decoration.type === 'mineSupport') continue;
        drawAmbientDecoration(decoration);
    }
}

function drawForegroundAmbientDecorations() {
    for (const decoration of ambientDecorations) {
        if (decoration.type === 'mineSupport') drawAmbientDecoration(decoration);
    }
}

function drawCastleDecorations() {
    for (const decoration of castleDecorations) {
        if (decoration.type === 'rug') {
            drawCastleRug(decoration);
        } else if (decoration.type === 'window') {
            drawCastleWindow(decoration);
        } else if (decoration.type === 'stairs') {
            drawCastleStairs(decoration);
        } else if (decoration.type === 'bossHall') {
            drawCastleBossHall(decoration);
        }
    }
}

let mapBaseCanvas = null;
let mapBaseCanvasMap = null;
let mapBaseCanvasFloor = -1;
let prefetchedMapBaseCanvas = null;
let prefetchedMapBaseMap = null;
let prefetchedMapBaseFloor = -1;

function invalidateMapBaseCanvas() {
    mapBaseCanvasMap = null;
    mapBaseCanvasFloor = -1;
}

function releaseMapBaseCanvas() {
    if (mapBaseCanvas) {
        mapBaseCanvas.width = 0;
        mapBaseCanvas.height = 0;
    }
    mapBaseCanvas = null;
    mapBaseCanvasMap = null;
    mapBaseCanvasFloor = -1;
    releasePrefetchedMapBaseCanvas();
}

function releasePrefetchedMapBaseCanvas() {
    if (prefetchedMapBaseCanvas) {
        prefetchedMapBaseCanvas.width = 0;
        prefetchedMapBaseCanvas.height = 0;
    }
    prefetchedMapBaseCanvas = null;
    prefetchedMapBaseMap = null;
    prefetchedMapBaseFloor = -1;
}

function renderPrefetchedFloorBase(floor) {
    const prefetched = floorMapPrefetchCache.get(floor);
    if (!prefetched || floor !== currentFloor + 1) return false;
    if (prefetchedMapBaseMap === prefetched.map && prefetchedMapBaseFloor === floor) {
        return true;
    }

    releasePrefetchedMapBaseCanvas();
    const canvasBuffer = document.createElement('canvas');
    canvasBuffer.width = gridWidth * renderPixelScale;
    canvasBuffer.height = gridHeight * renderPixelScale;
    const mapContext = canvasBuffer.getContext('2d');
    mapContext.imageSmoothingEnabled = false;

    const previousContext = ctx;
    const previousMap = map;
    const previousFloor = currentFloor;
    const previousState = captureGeneratedMapState();
    try {
        currentFloor = floor;
        map = prefetched.map;
        restoreGeneratedMapState(prefetched);
        ctx = mapContext;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvasBuffer.width, canvasBuffer.height);
        ctx.scale(canvasBuffer.width / gridWidth, canvasBuffer.height / gridHeight);
        drawMapBase();
        prefetchedMapBaseCanvas = canvasBuffer;
        prefetchedMapBaseMap = prefetched.map;
        prefetchedMapBaseFloor = floor;
        return true;
    } finally {
        ctx = previousContext;
        map = previousMap;
        currentFloor = previousFloor;
        restoreGeneratedMapState(previousState);
        if (prefetchedMapBaseCanvas !== canvasBuffer) {
            canvasBuffer.width = 0;
            canvasBuffer.height = 0;
        }
    }
}

function ensureMapBaseCanvas() {
    if (mapBaseCanvasMap === map && mapBaseCanvasFloor === currentFloor) return;
    if (prefetchedMapBaseMap === map && prefetchedMapBaseFloor === currentFloor) {
        if (mapBaseCanvas && mapBaseCanvas !== prefetchedMapBaseCanvas) {
            mapBaseCanvas.width = 0;
            mapBaseCanvas.height = 0;
        }
        mapBaseCanvas = prefetchedMapBaseCanvas;
        mapBaseCanvasMap = prefetchedMapBaseMap;
        mapBaseCanvasFloor = prefetchedMapBaseFloor;
        prefetchedMapBaseCanvas = null;
        prefetchedMapBaseMap = null;
        prefetchedMapBaseFloor = -1;
        return;
    }
    if (!mapBaseCanvas) {
        mapBaseCanvas = document.createElement('canvas');
    }
    const cacheWidth = gridWidth * renderPixelScale;
    const cacheHeight = gridHeight * renderPixelScale;
    if (mapBaseCanvas.width !== cacheWidth || mapBaseCanvas.height !== cacheHeight) {
        mapBaseCanvas.width = cacheWidth;
        mapBaseCanvas.height = cacheHeight;
    }
    const mapContext = mapBaseCanvas.getContext('2d');
    mapContext.imageSmoothingEnabled = false;

    const previousContext = ctx;
    ctx = mapContext;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, mapBaseCanvas.width, mapBaseCanvas.height);
    ctx.imageSmoothingEnabled = false;
    ctx.scale(mapBaseCanvas.width / gridWidth, mapBaseCanvas.height / gridHeight);
    try {
        drawMapBase();
    } finally {
        ctx = previousContext;
    }
    mapBaseCanvasMap = map;
    mapBaseCanvasFloor = currentFloor;
}

function drawCachedViewportCanvas(sourceCanvas) {
    const sourceScaleX = sourceCanvas.width / gridWidth;
    const sourceScaleY = sourceCanvas.height / gridHeight;
    const sourceLeft = Math.max(0, Math.floor(renderCameraX * sourceScaleX));
    const sourceTop = Math.max(0, Math.floor(renderCameraY * sourceScaleY));
    const sourceRight = Math.min(
        sourceCanvas.width,
        Math.ceil((renderCameraX + cameraViewportWidth) * sourceScaleX)
    );
    const sourceBottom = Math.min(
        sourceCanvas.height,
        Math.ceil((renderCameraY + cameraViewportHeight) * sourceScaleY)
    );
    const sourceWidth = sourceRight - sourceLeft;
    const sourceHeight = sourceBottom - sourceTop;
    if (sourceWidth <= 0 || sourceHeight <= 0) return;

    ctx.drawImage(
        sourceCanvas,
        sourceLeft,
        sourceTop,
        sourceWidth,
        sourceHeight,
        sourceLeft / sourceScaleX,
        sourceTop / sourceScaleY,
        sourceWidth / sourceScaleX,
        sourceHeight / sourceScaleY
    );
}

function drawMapBase() {
    const isLargeWallBlock = (col, row) => {
        const blockCol = col - (col % 2);
        const blockRow = row - (row % 2);
        return blockCol + 1 < cols
            && blockRow + 1 < rows
            && map[blockRow][blockCol] === '#'
            && map[blockRow][blockCol + 1] === '#'
            && map[blockRow + 1][blockCol] === '#'
            && map[blockRow + 1][blockCol + 1] === '#';
    };

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const tile = map[row][col];
            const blockCol = col - (col % 2);
            const blockRow = row - (row % 2);
            const canMerge = blockCol + 1 < cols && blockRow + 1 < rows;
            const mergedTile = canMerge
                && map[blockRow][blockCol] === tile
                && map[blockRow][blockCol + 1] === tile
                && map[blockRow + 1][blockCol] === tile
                && map[blockRow + 1][blockCol + 1] === tile;

            if (mergedTile) {
                if (col !== blockCol || row !== blockRow) continue;
                if (tile === '#') {
                    drawLargeWallTile(col, row);
                } else {
                    drawLargeFloorTile(col, row);
                }
            } else if (tile === '#') {
                drawWallTile(col, row);
            } else {
                drawFloorTile(col, row);
            }
        }
    }

    const shadowBands = [
        { inset: 0, thickness: 1, color: 'rgba(9, 11, 12, 0.58)' },
        { inset: 1, thickness: 1, color: 'rgba(9, 11, 12, 0.4)' },
        { inset: 2, thickness: 1, color: 'rgba(9, 11, 12, 0.27)' },
        { inset: 3, thickness: 1, color: 'rgba(9, 11, 12, 0.15)' }
    ];
    const drawShadowBands = (x, y, side) => {
        for (const band of shadowBands) {
            ctx.fillStyle = band.color;
            if (side === 'top') {
                ctx.fillRect(x, y + band.inset, tileSize, band.thickness);
            } else if (side === 'bottom') {
                ctx.fillRect(x, y + tileSize - 1 - band.inset, tileSize, band.thickness);
            } else if (side === 'left') {
                ctx.fillRect(x + band.inset, y, band.thickness, tileSize);
            } else {
                ctx.fillRect(x + tileSize - 1 - band.inset, y, band.thickness, tileSize);
            }
        }
    };
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (map[row][col] === '#') continue;

            const x = col * tileSize;
            const y = row * tileSize;
            if (row > 0 && map[row - 1][col] === '#') drawShadowBands(x, y, 'top');
            if (row + 1 < rows && map[row + 1][col] === '#') drawShadowBands(x, y, 'bottom');
            if (col > 0 && map[row][col - 1] === '#') drawShadowBands(x, y, 'left');
            if (col + 1 < cols && map[row][col + 1] === '#') drawShadowBands(x, y, 'right');
        }
    }
    if (currentFloor <= 9) {
        for (let row = 1; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (map[row][col] === '#' || map[row - 1][col] !== '#') continue;
                const x = col * tileSize;
                const y = row * tileSize;
                ctx.fillStyle = caveWallPalette.shadow;
                ctx.fillRect(x, y, tileSize, 1);
                ctx.fillStyle = caveWallPalette.darkRock;
                ctx.fillRect(x, y + 1, tileSize, 1);
            }
        }
    }
    drawBrokenLavaFloorDetails();
    drawCastleDecorations();
    drawAmbientDecorations();
}

function drawMap() {
    ensureMapBaseCanvas();
    drawCachedViewportCanvas(mapBaseCanvas);
    drawMatriarchArenaDetails();
    drawFloorCobwebs();
    drawCachedWallCornerCobwebs();
    drawAutomaticDoors();
    if (portalUnlocked) {
        drawExitTile(exitPosition.x, exitPosition.y);
    }
}

function drawMatriarchArenaDetails() {
    if (!matriarchArena) return;
    const drawPillar = (pillar) => {
        const x = pillar.x * tileSize;
        const y = pillar.y * tileSize;
        const width = pillar.width * tileSize;
        const height = pillar.height * tileSize;
        ctx.fillStyle = 'rgba(7, 8, 8, 0.62)';
        ctx.fillRect(x + 2, y + height - 2, width + 5, 5);
        ctx.fillStyle = '#292a29';
        ctx.fillRect(x + 1, y + 1, width - 2, height - 2);
        ctx.fillStyle = '#575650';
        ctx.fillRect(x + 3, y + 2, width - 7, height - 7);
        ctx.fillStyle = '#77766b';
        ctx.fillRect(x + 4, y + 3, width - 10, 2);
        ctx.fillRect(x + 3, y + 5, 2, height - 10);
        ctx.fillStyle = '#343432';
        ctx.fillRect(x + width - 5, y + 4, 2, height - 7);
        ctx.fillRect(x + 4, y + height - 5, width - 8, 2);
        ctx.fillStyle = '#494943';
        ctx.fillRect(x + 8, y + 9, 7, 2);
        ctx.fillRect(x + 17, y + 20, 2, 8);
        ctx.fillRect(x + width - 12, y + height - 14, 5, 2);
    };
    const drawCampfire = () => {
        const x = matriarchArena.campfire.x * tileSize;
        const y = matriarchArena.campfire.y * tileSize;
        const flicker = Math.sin(performance.now() * 0.012) > 0;
        ctx.fillStyle = 'rgba(226, 95, 39, 0.12)';
        ctx.fillRect(x - 5, y - 5, tileSize + 10, tileSize + 10);
        ctx.fillStyle = '#38281f';
        ctx.fillRect(x + 3, y + 10, 10, 3);
        ctx.fillRect(x + 4, y + 8, 8, 2);
        ctx.fillStyle = '#9b6840';
        ctx.fillRect(x + 4, y + 9, 8, 2);
        ctx.fillStyle = '#e98136';
        ctx.fillRect(x + 6, y + 4, 4, 6);
        ctx.fillRect(x + 5, y + 7, 6, 3);
        ctx.fillStyle = flicker ? '#ffe19a' : '#ffc15e';
        ctx.fillRect(x + 7, y + 5, 2, 4);
    };

    for (const tile of matriarchArena.baseWebTiles) {
        drawFloorCobweb(tile.x * tileSize, tile.y * tileSize, tile.x * 31 + tile.y * 47);
    }
    for (const tile of matriarchArena.approachWebTiles) {
        drawFloorCobweb(tile.x * tileSize, tile.y * tileSize, tile.x * 43 + tile.y * 59);
    }
    if (matriarchArena.phaseTwoActive) {
        for (const tile of matriarchArena.phaseTwoWebTiles) {
            drawFloorCobweb(tile.x * tileSize, tile.y * tileSize, tile.x * 37 + tile.y * 53);
        }
    }
    for (const pillar of matriarchArena.pillars) {
        drawPillar(pillar);
    }
    const beamY = (matriarchArena.bounds.y + 2) * tileSize;
    for (const segment of [
        { x: matriarchArena.bounds.x + 4, width: 7 },
        { x: matriarchArena.bounds.x + 12, width: 5 }
    ]) {
        const x = segment.x * tileSize;
        ctx.fillStyle = '#241a17';
        ctx.fillRect(x, beamY, segment.width * tileSize, 4);
        ctx.fillStyle = '#61432f';
        ctx.fillRect(x + 2, beamY + 1, segment.width * tileSize - 7, 2);
        ctx.fillStyle = '#8b6543';
        ctx.fillRect(x + 3, beamY, 8, 1);
    }
    for (const webTile of [
        { x: matriarchArena.bounds.x, y: matriarchArena.bounds.y + 1 },
        { x: matriarchArena.bounds.x, y: matriarchArena.bounds.y + 9 },
        { x: matriarchArena.bounds.x + matriarchArena.bounds.width - 1, y: matriarchArena.bounds.y + 1 }
    ]) {
        drawFloorCobweb(webTile.x * tileSize, webTile.y * tileSize, webTile.x * 61 + webTile.y * 73);
    }
    for (const remains of [
        { x: matriarchArena.bounds.x + 8, y: matriarchArena.bounds.y + 4 },
        { x: matriarchArena.bounds.x + 10, y: matriarchArena.bounds.y + 9 }
    ]) {
        const x = remains.x * tileSize;
        const y = remains.y * tileSize;
        ctx.fillStyle = 'rgba(11, 10, 10, 0.48)';
        ctx.fillRect(x + 3, y + 11, 11, 2);
        ctx.fillStyle = '#c1b29a';
        ctx.fillRect(x + 5, y + 6, 3, 3);
        ctx.fillRect(x + 8, y + 7, 5, 2);
        ctx.fillRect(x + 7, y + 9, 2, 4);
        ctx.fillRect(x + 5, y + 11, 2, 3);
        ctx.fillRect(x + 11, y + 10, 2, 4);
    }
    drawCampfire();
    for (const room of secretRooms) {
        if (room.floor !== currentFloor || !room.state.opened) continue;
        const chestX = room.chest.x * tileSize;
        const chestY = room.chest.y * tileSize;
        ctx.fillStyle = 'rgba(8, 7, 6, 0.55)';
        ctx.fillRect(chestX + 2, chestY + 14, 12, 2);
        ctx.fillStyle = room.state.rewardCollected ? '#392b21' : '#533823';
        ctx.fillRect(chestX + 2, chestY + 6, 12, 8);
        ctx.fillStyle = '#956d40';
        ctx.fillRect(chestX + 3, chestY + 7, 10, 3);
        ctx.fillRect(chestX + 4, chestY + 11, 8, 2);
        ctx.fillStyle = '#d1ad62';
        ctx.fillRect(chestX + 7, chestY + 8, 2, 3);
        ctx.fillStyle = '#c9b894';
        ctx.fillRect(room.diary.x * tileSize + 5, room.diary.y * tileSize + 6, 7, 8);
        ctx.fillStyle = '#735c41';
        ctx.fillRect(room.diary.x * tileSize + 7, room.diary.y * tileSize + 8, 4, 1);
        ctx.fillRect(room.diary.x * tileSize + 7, room.diary.y * tileSize + 10, 3, 1);
    }
    for (const room of secretRooms) {
        if (room.floor !== currentFloor || room.revealTimer <= 0) continue;
        const gate = room.definition.gate;
        const progress = room.revealTimer / 0.8;
        ctx.save();
        ctx.globalAlpha = progress;
        ctx.fillStyle = '#c2a982';
        ctx.fillRect(gate.x * tileSize + 2, gate.y * tileSize + 2, 3, 2);
        ctx.fillRect(gate.x * tileSize + 11, gate.y * tileSize + 5, 2, 3);
        ctx.fillRect(gate.x * tileSize + 5, gate.y * tileSize + 12, 3, 2);
        ctx.restore();
    }
}

function drawAutomaticDoors() {
    for (const door of doors) {
        if (door.pairId && door.pairIndex !== 0) continue;
        const x = door.x * tileSize;
        const y = door.y * tileSize;
        const doorSpan = door.span || 2;
        const doorWidth = door.orientation === 'horizontal' ? tileSize * doorSpan : tileSize;
        const doorHeight = door.orientation === 'vertical' ? tileSize * doorSpan : tileSize;
        const opening = door.orientation === 'horizontal'
            ? {
                x: x + 4,
                y: y + 3,
                width: doorWidth - 8,
                height: doorHeight - 5
            }
            : {
                x: x + 3,
                y: y + 4,
                width: doorWidth - 5,
                height: doorHeight - 8
            };

        ctx.fillStyle = '#111416';
        ctx.fillRect(x + 2, y + 1, doorWidth - 4, doorHeight - 2);
        ctx.fillStyle = '#29231b';
        ctx.fillRect(opening.x, opening.y, opening.width, opening.height);
        ctx.fillStyle = '#080b0c';
        ctx.fillRect(opening.x + 1, opening.y + 1, opening.width - 2, opening.height - 2);

        const drawWood = (left, top, width, height, horizontal) => {
            ctx.fillStyle = '#24170f';
            ctx.fillRect(left, top, width, height);
            ctx.fillStyle = '#684326';
            ctx.fillRect(left + 1, top + 1, width - 2, height - 2);
            ctx.fillStyle = '#95663a';
            if (horizontal) {
                ctx.fillRect(left + 1, top + 1, 1, height - 2);
                ctx.fillRect(left + 2, top + 3, width - 3, 1);
                ctx.fillRect(left + 2, top + height - 3, width - 3, 1);
                ctx.fillStyle = '#c29a5c';
                ctx.fillRect(left + 1, top + 2, 1, 1);
                ctx.fillRect(left + width - 2, top + 2, 1, 1);
                ctx.fillRect(left + 1, top + height - 3, 1, 1);
                ctx.fillRect(left + width - 2, top + height - 3, 1, 1);
            } else {
                ctx.fillRect(left + 1, top + 1, width - 2, 1);
                ctx.fillRect(left + 3, top + 2, 1, height - 3);
                ctx.fillRect(left + width - 3, top + 2, 1, height - 3);
                ctx.fillStyle = '#c29a5c';
                ctx.fillRect(left + 2, top + 1, 1, 1);
                ctx.fillRect(left + width - 3, top + 1, 1, 1);
                ctx.fillRect(left + 2, top + height - 2, 1, 1);
                ctx.fillRect(left + width - 3, top + height - 2, 1, 1);
            }
        };

        if (door.orientation === 'horizontal') {
            const slide = Math.round(door.progress * 3);
            const panelWidth = Math.floor((opening.width - 2) / 2);
            drawWood(
                opening.x - slide,
                opening.y + 1,
                panelWidth,
                opening.height - 2,
                true
            );
            drawWood(
                opening.x + panelWidth + 2 + slide,
                opening.y + 1,
                panelWidth,
                opening.height - 2,
                true
            );

            ctx.fillStyle = '#777265';
            ctx.fillRect(x + 2, y + 1, doorWidth - 4, 2);
            ctx.fillRect(x + 2, y + doorHeight - 2, doorWidth - 4, 1);
            ctx.fillStyle = '#4b4a43';
            ctx.fillRect(x + 2, y + 3, 2, doorHeight - 5);
            ctx.fillRect(x + doorWidth - 4, y + 3, 2, doorHeight - 5);
            ctx.fillStyle = '#b49b69';
            ctx.fillRect(x + 3, y + 2, doorWidth - 6, 1);
            ctx.fillRect(x + 3, y + doorHeight - 2, doorWidth - 6, 1);
            ctx.fillStyle = '#d0b574';
            ctx.fillRect(x + 3, y + 4, 1, 1);
            ctx.fillRect(x + doorWidth - 4, y + 4, 1, 1);
        } else {
            const slide = Math.round(door.progress * 3);
            const panelHeight = Math.floor((opening.height - 2) / 2);
            drawWood(
                opening.x + 1,
                opening.y - slide,
                opening.width - 2,
                panelHeight,
                false
            );
            drawWood(
                opening.x + 1,
                opening.y + panelHeight + 2 + slide,
                opening.width - 2,
                panelHeight,
                false
            );

            ctx.fillStyle = '#777265';
            ctx.fillRect(x + 1, y + 2, 2, doorHeight - 4);
            ctx.fillRect(x + doorWidth - 2, y + 2, 1, doorHeight - 4);
            ctx.fillStyle = '#4b4a43';
            ctx.fillRect(x + 3, y + 2, doorWidth - 5, 2);
            ctx.fillRect(x + 3, y + doorHeight - 4, doorWidth - 5, 2);
            ctx.fillStyle = '#b49b69';
            ctx.fillRect(x + 2, y + 3, 1, doorHeight - 6);
            ctx.fillRect(x + doorWidth - 2, y + 3, 1, doorHeight - 6);
            ctx.fillStyle = '#d0b574';
            ctx.fillRect(x + 4, y + 3, 1, 1);
            ctx.fillRect(x + 4, y + doorHeight - 4, 1, 1);
        }
    }
}

function drawLighting() {
    const environment = getFloorVisualEnvironment();
    const shadowColor = environment.shadowColor.join(', ');
    const playerLightX = (player.x + player.size / 2) / tileSize;
    const playerLightY = (player.y + player.size / 2) / tileSize;
    const firstCol = Math.max(0, Math.floor(cameraX / tileSize));
    const lastCol = Math.min(cols, Math.ceil((cameraX + cameraViewportWidth) / tileSize));
    const firstRow = Math.max(0, Math.floor(cameraY / tileSize));
    const lastRow = Math.min(rows, Math.ceil((cameraY + cameraViewportHeight) / tileSize));
    const firstLightCol = Math.max(0, firstCol - 5);
    const lastLightCol = Math.min(cols, lastCol + 5);
    const firstLightRow = Math.max(0, firstRow - 5);
    const lastLightRow = Math.min(rows, lastRow + 5);
    let torchLightCount = 0;
    const time = reducedVisualEffects ? 0 : performance.now() / 180;
    const addTorchLight = (torch) => {
        if (
            torch.x < firstLightCol
            || torch.x >= lastLightCol
            || torch.y < firstLightRow
            || torch.y >= lastLightRow
        ) {
            return;
        }
        const light = torchLights[torchLightCount] || (torchLights[torchLightCount] = {});
        light.x = torch.x + 0.5;
        light.y = torch.y + 0.5;
        light.strength = environment.torchStrength
            + (reducedVisualEffects ? 0 : Math.sin(time + torch.x) * 0.05);
        light.radius = environment.torchRadius;
        torchLightCount++;
    };
    for (const torch of torches) {
        addTorchLight(torch);
    }
    for (const decoration of ambientDecorations) {
        if (decoration.type === 'mineLantern') {
            addTorchLight(decoration.replacedTorch || decoration);
        }
    }
    for (const enemy of enemies) {
        if (enemy.bossType !== 'lavaGolem' || !Array.isArray(enemy.lavaPools)) continue;
        for (const pool of enemy.lavaPools) {
            const lightMargin = lavaLightRadius * tileSize;
            if (
                pool.x < firstCol * tileSize - lightMargin
                || pool.x > lastCol * tileSize + lightMargin
                || pool.y < firstRow * tileSize - lightMargin
                || pool.y > lastRow * tileSize + lightMargin
            ) {
                continue;
            }
            const light = torchLights[torchLightCount] || (torchLights[torchLightCount] = {});
            light.x = pool.x / tileSize;
            light.y = pool.y / tileSize;
            light.strength = pool.warning > 0 ? 0.3 : 0.68;
            light.radius = lavaLightRadius;
            torchLightCount++;
        }
    }
    torchLights.length = torchLightCount;
    const portalLightX = exitPosition.x + 0.5;
    const portalLightY = exitPosition.y + 0.5;

    for (let row = firstRow; row < lastRow; row++) {
        for (let col = firstCol; col < lastCol; col++) {
            const centerX = col + 0.5;
            const centerY = row + 0.5;
            let illumination = 0;
            const playerDx = centerX - playerLightX;
            const playerDy = centerY - playerLightY;
            const playerDistanceSquared = playerDx * playerDx + playerDy * playerDy;
            if (playerDistanceSquared < 49) {
                illumination += 0.72 * (1 - Math.sqrt(playerDistanceSquared) / 7);
            }
            if (portalUnlocked) {
                const portalDx = centerX - portalLightX;
                const portalDy = centerY - portalLightY;
                const portalDistanceSquared = portalDx * portalDx + portalDy * portalDy;
                if (portalDistanceSquared < 30.25) {
                    illumination += 0.82 * (1 - Math.sqrt(portalDistanceSquared) / 5.5);
                }
            }
            for (const light of torchLights) {
                const dx = centerX - light.x;
                const dy = centerY - light.y;
                const distanceSquared = dx * dx + dy * dy;
                if (distanceSquared < light.radius * light.radius) {
                    illumination += light.strength * (1 - Math.sqrt(distanceSquared) / light.radius);
                }
            }

            let shadow = 0;
            for (const zone of ambientShadowZones) {
                const dx = (centerX - zone.x) / zone.radiusX;
                const dy = (centerY - zone.y) / zone.radiusY;
                const distance = Math.hypot(dx, dy);
                if (distance < 1) {
                    shadow = Math.max(shadow, zone.strength * (1 - distance));
                }
            }
            const darkness = Math.min(
                0.82,
                Math.max(0.15, environment.darkness - illumination + shadow)
            );
            ctx.fillStyle = `rgba(${shadowColor}, ${darkness})`;
            ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
        }
    }

    ctx.fillStyle = 'rgba(14, 12, 10, 0.24)';
    for (let i = firstRow; i < lastRow; i++) {
        ctx.fillRect(0, i * tileSize, gridWidth, 1);
    }

    for (const torch of torches) {
        if (
            torch.x >= firstCol - 1
            && torch.x < lastCol + 1
            && torch.y >= firstRow - 1
            && torch.y < lastRow + 1
        ) {
            drawTorch(torch);
        }
    }
}

function drawAmbientDust() {
    if (reducedVisualEffects) return;
    const time = performance.now() / 1000;
    const environment = getFloorVisualEnvironment();
    const cameraRight = cameraX + cameraViewportWidth;
    const cameraBottom = cameraY + cameraViewportHeight;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let index = 0; index < ambientDustCount; index++) {
        const seed = index * 73.17;
        const drift = time * (2.2 + index % 4 * 0.7);
        const x = (seed * 1.91 + Math.sin(time * 0.32 + index) * 8) % gridWidth;
        const y = (seed * 1.37 - drift + gridHeight * 8) % gridHeight;
        if (
            x < cameraX - 2 || x > cameraRight + 2
            || y < cameraY - 2 || y > cameraBottom + 2
            || map[Math.floor(y / tileSize)]?.[Math.floor(x / tileSize)] === '#'
        ) {
            continue;
        }
        const pulse = Math.floor(((Math.sin(time * 1.8 + index * 2.1) + 1) / 2) * 3);
        const pixelX = Math.round(x * renderPixelScale) / renderPixelScale;
        const pixelY = Math.round(y * renderPixelScale) / renderPixelScale;
        ctx.globalAlpha = 0.2 + pulse * 0.1;
        ctx.fillStyle = index % 7 === 0
            ? environment.dustColor
            : environment.torchColor;
        ctx.fillRect(pixelX, pixelY, index % 6 === 0 ? 2 : 1, index % 6 === 0 ? 2 : 1);
        if (index % 7 === 0) {
            ctx.globalAlpha *= 0.45;
            ctx.fillRect(pixelX - 1, pixelY, 4, 1);
            ctx.fillRect(pixelX, pixelY - 1, 1, 4);
        }
    }
    ctx.restore();
}

function drawVignette() {
    ctx.save();
    ctx.setTransform(renderPixelScale, 0, 0, renderPixelScale, 0, 0);
    ctx.fillStyle = 'rgba(5, 6, 10, 0.1)';
    ctx.fillRect(0, 0, cameraViewportWidth, 3);
    ctx.fillRect(0, cameraViewportHeight - 3, cameraViewportWidth, 3);
    ctx.fillRect(0, 0, 3, cameraViewportHeight);
    ctx.fillRect(cameraViewportWidth - 3, 0, 3, cameraViewportHeight);
    ctx.fillStyle = 'rgba(5, 6, 10, 0.08)';
    ctx.fillRect(3, 3, cameraViewportWidth - 6, 3);
    ctx.fillRect(3, cameraViewportHeight - 6, cameraViewportWidth - 6, 3);
    ctx.fillRect(3, 3, 3, cameraViewportHeight - 6);
    ctx.fillRect(cameraViewportWidth - 6, 3, 3, cameraViewportHeight - 6);
    ctx.restore();
}

function drawOreDrops() {
    for (const drop of oreDrops) {
        const x = drop.x;
        const y = drop.y + Math.sin(drop.animTime * 5) * 1.5;
        const ore = drop.ore;
        const sprite = oreDropSprites[ore.id];

        ctx.fillStyle = 'rgba(10, 10, 8, 0.55)';
        ctx.fillRect(x - 5, y + 4, 10, 2);
        if (sprite.complete && sprite.naturalWidth > 0) {
            const width = 12;
            const height = width * sprite.naturalHeight / sprite.naturalWidth;
            ctx.drawImage(sprite, x - width / 2, y - height / 2, width, height);
        } else {
            ctx.fillStyle = ore.outline;
            ctx.fillRect(x - 4, y - 4, 8, 8);
            ctx.fillRect(x - 5, y - 2, 10, 4);
            ctx.fillStyle = ore.shadow;
            ctx.fillRect(x - 3, y - 3, 6, 6);
            ctx.fillStyle = ore.body;
            ctx.fillRect(x - 2, y - 3, 4, 6);
            ctx.fillRect(x - 3, y - 2, 6, 4);
            ctx.fillStyle = ore.shine;
            ctx.fillRect(x - 2, y - 3, 2, 2);
            ctx.fillRect(x - 1, y - 1, 1, 1);
        }
    }
}

function drawBarrels() {
    for (const barrel of barrels) {
        if (barrel.health <= 0) {
            continue;
        }

        const x = barrel.x * tileSize;
        const y = barrel.y * tileSize;
        const flash = barrel.hitFlash > 0;
        if (barrel.isSecretCocoon || barrel.isBroodCocoon) {
            const cocoonDark = barrel.isSecretCocoon ? '#37343a' : '#3a2926';
            const cocoonLight = barrel.isSecretCocoon ? '#9d8a9b' : '#a66f57';
            ctx.fillStyle = 'rgba(8, 8, 9, 0.6)';
            ctx.fillRect(x + 2, y + 13, 13, 3);
            ctx.fillStyle = flash ? '#f5ead7' : cocoonDark;
            ctx.fillRect(x + 4, y + 3, 9, 11);
            ctx.fillRect(x + 2, y + 6, 13, 6);
            ctx.fillStyle = flash ? '#fffaf0' : cocoonLight;
            ctx.fillRect(x + 5, y + 4, 7, 2);
            ctx.fillRect(x + 3, y + 7, 2, 4);
            ctx.fillRect(x + 12, y + 7, 2, 4);
            ctx.fillStyle = '#d1b890';
            ctx.fillRect(x + 7, y + 7, 3, 4);
            ctx.fillStyle = '#503c37';
            ctx.fillRect(x + 6, y + 11, 5, 2);
            ctx.fillStyle = flash ? '#f7e5cd' : '#c8b7c8';
            ctx.fillRect(x + 2, y + 4, 1, 4);
            ctx.fillRect(x + 13, y + 2, 1, 4);
            ctx.fillRect(x + 4, y + 12, 1, 3);
            ctx.fillRect(x + 11, y + 13, 1, 2);
            if (barrel.health < barrel.maxHealth) {
                ctx.fillStyle = '#18151a';
                ctx.fillRect(x + 8, y + 4, 1, 3);
                ctx.fillRect(x + 7, y + 7, 1, 2);
                ctx.fillStyle = '#ead9bc';
                ctx.fillRect(x + 9, y + 6, 1, 1);
            }
            continue;
        }
        const rarity = barrel.rarity;
        if (barrelSprite.complete && barrelSprite.naturalWidth > 0) {
            ctx.fillStyle = 'rgba(9, 9, 8, 0.55)';
            ctx.fillRect(x + 2, y + 14, 12, 2);
            if (rarity.rank >= 3) {
                ctx.fillStyle = rarity.glow;
                ctx.fillRect(x + 1, y + 2, 14, 12);
            }
            const barrelWidth = tileSize * 0.825;
            const barrelHeight = tileSize * 1.1;
            ctx.drawImage(
                barrelSprite,
                x + (tileSize - barrelWidth) / 2,
                y + (tileSize - barrelHeight) / 2,
                barrelWidth,
                barrelHeight
            );
            if (flash) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
                ctx.fillRect(x + 2, y + 1, 12, tileSize - 1);
            }
            if (barrel.health < barrel.maxHealth) {
                ctx.fillStyle = '#302019';
                ctx.fillRect(x + 7, y + 6, 1, 3);
                ctx.fillRect(x + 6, y + 8, 3, 1);
                ctx.fillStyle = '#d4b78c';
                ctx.fillRect(x + 8, y + 7, 1, 1);
            }
            continue;
        }

        const wood = flash ? '#fff0d0' : rarity.dark;
        const woodLight = flash ? '#fff8e9' : rarity.accent;
        const woodDark = flash ? '#89765c' : '#211a1b';

        ctx.fillStyle = 'rgba(9, 9, 8, 0.55)';
        ctx.fillRect(x + 2, y + 14, 12, 2);
        if (rarity.rank >= 3) {
            ctx.fillStyle = rarity.glow;
            ctx.fillRect(x + 1, y + 2, 14, 12);
        }
        ctx.fillStyle = woodDark;
        ctx.fillRect(x + 3, y + 2, 10, 12);
        ctx.fillRect(x + 2, y + 4, 12, 8);
        ctx.fillStyle = flash ? '#ece4d0' : '#130f10';
        ctx.fillRect(x + 5, y + 2, 6, 1);
        ctx.fillRect(x + 3, y + 5, 1, 6);
        ctx.fillRect(x + 12, y + 5, 1, 6);
        ctx.fillStyle = wood;
        ctx.fillRect(x + 4, y + 3, rarity.rank >= 2 ? 8 : 7, 10);
        ctx.fillRect(x + 3, y + 5, 10, 6);
        ctx.fillStyle = woodLight;
        ctx.fillRect(x + 5, y + 4, 1, 8);
        ctx.fillRect(x + 8, y + 4, 2, 7);
        ctx.fillStyle = flash ? '#fff8e9' : rarity.dark;
        ctx.fillRect(x + 7, y + 4, 1, 7);
        ctx.fillRect(x + 11, y + 5, 1, 5);
        ctx.fillStyle = flash ? '#ece4d0' : rarity.accent;
        ctx.fillRect(x + 3, y + 4, 10, 2);
        ctx.fillRect(x + 3, y + 10, 10, 2);
        ctx.fillStyle = flash ? '#fff8e9' : rarity.light;
        ctx.fillRect(x + 4, y + 4, 2, 1);
        ctx.fillRect(x + 4, y + 10, 2, 1);
        ctx.fillStyle = flash ? '#89765c' : '#403630';
        ctx.fillRect(x + 11, y + 5, 1, 1);
        ctx.fillRect(x + 11, y + 10, 1, 1);
        if (rarity.rank >= 1) {
            ctx.fillRect(x + 4, y + 3, 8, 1);
            ctx.fillRect(x + 4, y + 12, 8, 1);
        }
        ctx.fillStyle = flash ? '#ece4d0' : rarity.light;
        ctx.fillRect(x + 4, y + 4, 1, 1);
        ctx.fillRect(x + 11, y + 4, 1, 1);
        ctx.fillRect(x + 4, y + 10, 1, 1);
        ctx.fillRect(x + 11, y + 10, 1, 1);
        if (rarity.rank >= 2) {
            ctx.fillStyle = rarity.light;
            ctx.fillRect(x + 7, y + 7, 2, 2);
            ctx.fillStyle = rarity.accent;
            ctx.fillRect(x + 7, y + 8, 1, 1);
        } else {
            ctx.fillStyle = '#34251a';
            ctx.fillRect(x + 6, y + 7, 3, 2);
        }
        if (rarity.rank >= 4) {
            ctx.fillStyle = '#fff4bb';
            ctx.fillRect(x + 5, y + 2, 2, 1);
            ctx.fillRect(x + 9, y + 13, 2, 1);
        }

        if (barrel.health < barrel.maxHealth) {
            ctx.fillStyle = '#302019';
            ctx.fillRect(x + 7, y + 6, 1, 3);
            ctx.fillRect(x + 6, y + 8, 3, 1);
            ctx.fillStyle = '#d4b78c';
            ctx.fillRect(x + 8, y + 7, 1, 1);
        }
    }
}

function drawChests() {
    for (const chest of chests) {
        const x = chest.x * tileSize;
        const y = chest.y * tileSize;
        const flash = chest.hitFlash > 0;
        const rarity = chest.rarity;
        const wood = flash ? '#e3c99e' : rarity.dark;
        const woodLight = flash ? '#fff0cf' : rarity.accent;
        const woodDark = flash ? '#9a8060' : '#241a1a';
        ctx.fillStyle = 'rgba(9, 9, 8, 0.55)';
        ctx.fillRect(x + 2, y + 14, 12, 2);

        if (chest.opened) {
            ctx.fillStyle = woodDark;
            ctx.fillRect(x + 2, y + 8, 12, 5);
            ctx.fillStyle = wood;
            ctx.fillRect(x + 3, y + 9, 10, 3);
            ctx.fillStyle = rarity.dark;
            ctx.fillRect(x + 3, y + 6, 10, 4);
            ctx.fillStyle = woodLight;
            ctx.fillRect(x + 4, y + 7, 8, 1);
            continue;
        }

        if (
            chest.isMimic
            && chest.mimicState !== 'hidden'
            && mimicChestSprite.complete
            && mimicChestSprite.naturalWidth > 0
        ) {
            if (rarity.rank >= 3) {
                ctx.fillStyle = rarity.glow;
                ctx.fillRect(x + 1, y + 3, 14, 12);
            }
            const frameWidth = mimicChestSprite.naturalWidth / 5;
            const frameHeight = mimicChestSprite.naturalHeight / 3;
            let column = 4;
            let row = 0;
            if (chest.mimicState === 'transforming') {
                column = Math.min(4, Math.floor(chest.mimicAnimationTime / 0.12));
            } else if (chest.mimicState === 'attacking') {
                const attackFrame = Math.min(9, Math.floor(chest.mimicAnimationTime / 0.11));
                column = attackFrame % 5;
                row = 1 + Math.floor(attackFrame / 5);
            }
            ctx.drawImage(
                mimicChestSprite,
                column * frameWidth,
                row * frameHeight,
                frameWidth,
                frameHeight,
                x - 8,
                y - 16,
                32,
                32
            );
            if (flash) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
                ctx.fillRect(x - 6, y - 14, tileSize + 12, tileSize + 12);
            }
            continue;
        }

        if (chestSprite.complete && chestSprite.naturalWidth > 0) {
            if (rarity.rank >= 3) {
                ctx.fillStyle = rarity.glow;
                ctx.fillRect(x + 1, y + 3, 14, 12);
            }
            ctx.drawImage(chestSprite, x, y + 1, tileSize, tileSize * 13 / 15);
            if (flash) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
                ctx.fillRect(x + 2, y + 3, tileSize - 4, tileSize - 5);
            }
            continue;
        }

        if (rarity.rank >= 3) {
            ctx.fillStyle = rarity.glow;
            ctx.fillRect(x + 1, y + 3, 14, 12);
        }
        ctx.fillStyle = woodDark;
        ctx.fillRect(x + 2, y + 5, 12, 9);
        ctx.fillRect(x + 3, y + 3, 10, 3);
        ctx.fillStyle = flash ? '#fff0cf' : '#171112';
        ctx.fillRect(x + 4, y + 5, 8, 1);
        ctx.fillStyle = wood;
        ctx.fillRect(x + 3, y + 6, 10, 7);
        ctx.fillStyle = woodLight;
        ctx.fillRect(x + 4, y + 4, 7, 1);
        ctx.fillRect(x + 4, y + 7, 1, 5);
        ctx.fillStyle = flash ? '#9a8060' : rarity.dark;
        ctx.fillRect(x + 6, y + 7, 1, 5);
        ctx.fillRect(x + 11, y + 7, 1, 5);
        ctx.fillStyle = woodLight;
        ctx.fillRect(x + 7, y + 7, 3, 1);
        ctx.fillStyle = rarity.accent;
        ctx.fillRect(x + 3, y + 6, 10, 1);
        ctx.fillRect(x + 3, y + 11, 10, 2);
        ctx.fillStyle = rarity.light;
        ctx.fillRect(x + 4, y + 6, 2, 1);
        ctx.fillRect(x + 4, y + 11, 2, 1);
        ctx.fillStyle = rarity.dark;
        ctx.fillRect(x + 4, y + 8, 8, 2);
        ctx.fillStyle = rarity.light;
        ctx.fillRect(x + 7, y + 7, 3, 4);
        ctx.fillStyle = rarity.accent;
        ctx.fillRect(x + 8, y + 8, 1, 2);
        if (rarity.rank >= 1) {
            ctx.fillStyle = rarity.light;
            ctx.fillRect(x + 3, y + 5, 1, 6);
            ctx.fillRect(x + 12, y + 5, 1, 6);
        }
        if (rarity.rank >= 2) {
            ctx.fillStyle = rarity.accent;
            ctx.fillRect(x + 2, y + 4, 2, 2);
            ctx.fillRect(x + 12, y + 4, 2, 2);
            ctx.fillStyle = rarity.light;
            ctx.fillRect(x + 3, y + 4, 1, 1);
            ctx.fillRect(x + 12, y + 4, 1, 1);
        }
        ctx.fillStyle = flash ? '#fff0cf' : '#42332b';
        ctx.fillRect(x + 3, y + 5, 1, 1);
        ctx.fillRect(x + 12, y + 5, 1, 1);
        ctx.fillRect(x + 3, y + 12, 1, 1);
        ctx.fillRect(x + 12, y + 12, 1, 1);
        ctx.fillStyle = flash ? '#fff0cf' : rarity.light;
        ctx.fillRect(x + 4, y + 5, 1, 1);
        ctx.fillRect(x + 11, y + 5, 1, 1);
        ctx.fillRect(x + 4, y + 12, 1, 1);
        ctx.fillRect(x + 11, y + 12, 1, 1);
        if (rarity.rank >= 3) {
            ctx.fillStyle = rarity.dark;
            ctx.fillRect(x + 5, y + 2, 6, 2);
            ctx.fillStyle = rarity.accent;
            ctx.fillRect(x + 6, y + 2, 4, 1);
            ctx.fillStyle = rarity.light;
            ctx.fillRect(x + 7, y + 1, 2, 2);
        }
        if (rarity.rank >= 4) {
            ctx.fillStyle = '#fff4bb';
            ctx.fillRect(x + 4, y + 3, 1, 1);
            ctx.fillRect(x + 11, y + 3, 1, 1);
            ctx.fillRect(x + 8, y, 1, 1);
        }
    }
}

function drawAttachedMimics() {
    if (!mimicChestSprite.complete || mimicChestSprite.naturalWidth === 0) {
        return;
    }

    const chest = chests.find((candidate) => (
        candidate.isMimic
        && candidate.health > 0
        && candidate.mimicState === 'attached'
    ));
    if (!chest) {
        return;
    }

    const frameWidth = mimicChestSprite.naturalWidth / 5;
    const frameHeight = mimicChestSprite.naturalHeight / 3;
    const frame = Math.floor(chest.mimicAnimationTime / 0.11) % 10;
    const row = 1 + Math.floor(frame / 5);
    const column = frame % 5;
    ctx.drawImage(
        mimicChestSprite,
        column * frameWidth,
        row * frameHeight,
        frameWidth,
        frameHeight,
        player.x + player.size / 2 - 16,
        player.y + player.size / 2 - 16,
        32,
        32
    );
}

function drawItemDrops() {
    for (const drop of itemDrops) {
        const x = drop.x;
        const y = drop.y + Math.sin(drop.animTime * 5) * 1.5;
        if (drop.type === 'arrows') {
            ctx.fillStyle = 'rgba(10, 10, 8, 0.55)';
            ctx.fillRect(x - 5, y + 5, 10, 2);
            const sprite = equipmentDropSprites.arrows;
            if (!sprite) {
                throw new Error('Ícone de flechas ausente no chão.');
            }
            if (sprite.complete && sprite.naturalWidth > 0 && sprite.naturalHeight > 0) {
                const scale = 16 / Math.max(sprite.naturalWidth, sprite.naturalHeight);
                const width = sprite.naturalWidth * scale;
                const height = sprite.naturalHeight * scale;
                ctx.drawImage(sprite, x - width / 2, y - height / 2, width, height);
            }
            continue;
        }
        if (drop.type === 'scroll') {
            const sprite = scrollSprites[scrollTypes.indexOf(drop.scroll)];
            if (sprite.complete && sprite.naturalWidth > 0) {
                ctx.fillStyle = 'rgba(10, 10, 8, 0.55)';
                ctx.fillRect(x - 7, y + 8, 14, 2);
                ctx.drawImage(sprite, x - 7, y - 8, 14, 17);
            }
            continue;
        }

        if (drop.type === 'material') {
            ctx.fillStyle = 'rgba(10, 10, 8, 0.55)';
            ctx.fillRect(x - 5, y + 5, 10, 2);
            const sprite = creatureMaterialIconSprites.get(drop.materialId);
            if (!sprite) {
                throw new Error(`Ícone de material ausente no chão: ${drop.materialId}.`);
            }
            if (sprite.complete && sprite.naturalWidth > 0 && sprite.naturalHeight > 0) {
                const scale = 16 / Math.max(sprite.naturalWidth, sprite.naturalHeight);
                const width = sprite.naturalWidth * scale;
                const height = sprite.naturalHeight * scale;
                ctx.drawImage(sprite, x - width / 2, y - height / 2, width, height);
            } else {
                ctx.fillStyle = drop.color || '#c08d4c';
                ctx.fillRect(x - 3, y - 3, 6, 6);
            }
            continue;
        }

        const rarity = drop.rarity;
        if (drop.type === 'potion') {
            const sprite = potionIconSprites.get(rarity.id);
            if (!sprite) {
                throw new Error(`Ícone de poção ausente no chão: ${rarity.id}.`);
            }
            if (sprite.complete && sprite.naturalWidth > 0 && sprite.naturalHeight > 0) {
                const scale = 16 / Math.max(sprite.naturalWidth, sprite.naturalHeight);
                const width = sprite.naturalWidth * scale;
                const height = sprite.naturalHeight * scale;
                ctx.drawImage(sprite, x - width / 2, y - height / 2, width, height);
            }
            continue;
        }
        const size = 1 + Math.floor(rarity.rank / 2);

        ctx.fillStyle = rarity.glow;
        ctx.fillRect(x - 7 - size, y - 8 - size, 14 + size * 2, 15 + size * 2);
        ctx.fillStyle = 'rgba(10, 10, 8, 0.55)';
        ctx.fillRect(x - 5, y + 5, 10, 2);
        ctx.fillStyle = rarity.dark;
        ctx.fillRect(x - 3, y - 6, 6, 2);
        ctx.fillRect(x - 4, y - 4, 8, 7);
        ctx.fillRect(x - 2, y + 3, 4, 2);
        ctx.fillStyle = rarity.accent;
        ctx.fillRect(x - 5, y - 3, 10, 5);
        ctx.fillRect(x - 3, y + 2, 6, 2);
        ctx.fillStyle = rarity.light;
        ctx.fillRect(x - 2, y - 2, 4, 4);
        ctx.fillRect(x - 1, y - 4, 2, 2);
        ctx.fillStyle = '#f8e8b1';
        ctx.fillRect(x - 1, y - 1, 1, 2);
        if (rarity.rank >= 2) {
            ctx.fillStyle = rarity.light;
            ctx.fillRect(x - 6, y - 5, 1, 1);
            ctx.fillRect(x + 5, y + 2, 1, 1);
        }
        if (rarity.rank >= 4) {
            ctx.fillStyle = '#fff5c4';
            ctx.fillRect(x - 1, y - 8, 2, 1);
            ctx.fillRect(x + 6, y - 3, 1, 2);
        }
    }
}

function getWaterCellKey(col, row) {
    return `${col},${row}`;
}

function isAvailableWaterTile(col, row) {
    return (
        col >= 0 && col < cols
        && row >= 0 && row < rows
        && (map[row][col] === '.' || map[row][col] === 'S')
        && !barrels.some((barrel) => barrel.health > 0 && barrel.x === col && barrel.y === row)
        && !chests.some((chest) => chest.health > 0 && chest.x === col && chest.y === row)
        && !doors.some((door) => door.x === col && door.y === row)
    );
}

function initializeSewerWater(sewer) {
    if (sewer.waterCells instanceof Map) return sewer.waterCells;
    if (!isAvailableWaterTile(sewer.puddleX, sewer.puddleY)) return null;

    sewer.waterCells = new Map();
    sewer.waterAccumulator = 0;
    sewer.waterCells.set(getWaterCellKey(sewer.puddleX, sewer.puddleY), {
        x: sewer.puddleX,
        y: sewer.puddleY,
        depth: 0.82,
        flowX: sewer.opening.x,
        flowY: sewer.opening.y
    });
    return sewer.waterCells;
}

const sewerWaterTexture = [
    '........',
    '.mm.....',
    'mllm....',
    'llhlm...',
    '.llmm...',
    '...mll..',
    '....hll.',
    '.....mm.'
];

function updateSewerWater(delta) {
    const stepDuration = 0.18;
    const maxWaterTiles = 9;
    const maxSpreadDistance = 3;

    for (const sewer of sewers) {
        const waterCells = initializeSewerWater(sewer);
        if (!waterCells) continue;

        sewer.waterAccumulator += delta;
        while (sewer.waterAccumulator >= stepDuration) {
            sewer.waterAccumulator -= stepDuration;
            const source = waterCells.get(getWaterCellKey(sewer.puddleX, sewer.puddleY));
            source.depth = Math.min(1, source.depth + 0.24);

            const activeCells = [...waterCells.values()]
                .sort((first, second) => second.depth - first.depth);
            let newTilesThisStep = 0;

            for (const cell of activeCells) {
                if (cell.depth < 0.14) continue;
                const forward = { x: cell.flowX, y: cell.flowY };
                const directions = [
                    { x: forward.x, y: forward.y, score: 1.35 },
                    { x: -forward.y, y: forward.x, score: 1.05 },
                    { x: forward.y, y: -forward.x, score: 1.05 },
                    { x: -forward.x, y: -forward.y, score: 0.45 }
                ];
                const candidates = directions
                    .map((direction) => {
                        const x = cell.x + direction.x;
                        const y = cell.y + direction.y;
                        const distance = Math.abs(x - sewer.puddleX) + Math.abs(y - sewer.puddleY);
                        return {
                            ...direction,
                            x,
                            y,
                            distance,
                            key: getWaterCellKey(x, y),
                            target: waterCells.get(getWaterCellKey(x, y))
                        };
                    })
                    .filter((candidate) => (
                        candidate.distance <= maxSpreadDistance
                        && isAvailableWaterTile(candidate.x, candidate.y)
                        && (candidate.target || waterCells.size < maxWaterTiles)
                    ))
                    .sort((first, second) => (
                        ((first.target ? first.target.depth : 0) - first.score * 0.08)
                            - ((second.target ? second.target.depth : 0) - second.score * 0.08)
                        || ((first.x * 17 + first.y * 31 + sewer.dripSeed) % 7)
                            - ((second.x * 17 + second.y * 31 + sewer.dripSeed) % 7)
                    ));

                let transferred = false;
                for (const candidate of candidates) {
                    const target = candidate.target;
                    if (target) {
                        const difference = cell.depth - target.depth;
                        if (difference <= 0.18) continue;
                        const transfer = Math.min(0.16, difference * 0.24, cell.depth * 0.35);
                        if (transfer < 0.035) continue;
                        cell.depth -= transfer;
                        target.depth = Math.min(1, target.depth + transfer);
                        transferred = true;
                        continue;
                    }

                    if (newTilesThisStep >= 2) break;
                    const transfer = Math.min(0.18, cell.depth * 0.32);
                    if (transfer < 0.065) continue;

                    cell.depth -= transfer;
                    waterCells.set(candidate.key, {
                        x: candidate.x,
                        y: candidate.y,
                        depth: transfer,
                        flowX: candidate.x - cell.x,
                        flowY: candidate.y - cell.y
                    });
                    newTilesThisStep++;
                    transferred = true;
                    if (cell.depth < 0.2) break;
                }
                if (!transferred && cell.depth > 0.96) cell.depth = 0.96;
            }
        }
    }
}

function isEntityOnSewerWater(entity, x = entity.x, y = entity.y) {
    const col = Math.floor((x + entity.size / 2) / tileSize);
    const row = Math.floor((y + entity.size / 2) / tileSize);
    const key = getWaterCellKey(col, row);
    return sewers.some((sewer) => (
        sewer.waterCells instanceof Map && sewer.waterCells.has(key)
    ));
}

const sewerWaterRowInsets = [8, 7, 5, 3, 2, 1, 0, 0, 0, 0, 1, 2, 3, 5, 7, 8];
const sewerWaterTextureColors = [
    ['m', 'rgba(3, 35, 89, 0.2508)'],
    ['l', 'rgba(45, 145, 218, 0.2244)'],
    ['h', 'rgba(166, 224, 255, 0.3696)']
];

function drawSewerWaterCell(sewer, cell, flowTime, layer) {
    const cells = sewer.waterCells;
    const environment = getFloorVisualEnvironment();
    const col = cell.x;
    const row = cell.y;
    const x = col * tileSize;
    const y = row * tileSize;
    const wave = Math.floor(flowTime * 4 + sewer.dripSeed);

    if (layer === 'texture') {
        const textureX = x;
        const textureY = y;
        const textureOffset = Math.floor(flowTime * 2 + sewer.dripSeed) % sewerWaterTexture.length;
        const waterShadeByMark = {
            m: environment.waterShades[0],
            l: environment.waterShades[1],
            h: environment.waterShades[2]
        };
        for (const [textureMark] of sewerWaterTextureColors) {
            ctx.fillStyle = waterShadeByMark[textureMark];
            for (let textureRow = 0; textureRow < sewerWaterTexture.length; textureRow++) {
                const pattern = sewerWaterTexture[(textureRow + textureOffset) % sewerWaterTexture.length];
                for (let textureCol = 0; textureCol < pattern.length; textureCol++) {
                    if (pattern[textureCol] === textureMark) {
                        ctx.fillRect(
                            textureX + textureCol * 2,
                            textureY + textureRow * 2,
                            2,
                            2
                        );
                    }
                }
            }
        }
        return;
    }

    const hasNorth = cells.has(getWaterCellKey(col, row - 1));
    const hasEast = cells.has(getWaterCellKey(col + 1, row));
    const hasSouth = cells.has(getWaterCellKey(col, row + 1));
    const hasWest = cells.has(getWaterCellKey(col - 1, row));
    const getInset = (line) => {
        let inset = sewerWaterRowInsets[line];
        if (hasNorth && line < 3) inset = Math.min(inset, 5 - line * 2);
        if (hasSouth && line > 12) inset = Math.min(inset, 1 + (line - 13) * 2);
        if ((hasEast || hasWest) && line >= 5 && line <= 10) inset = Math.min(inset, 3);
        return inset;
    };
    if (layer === 'edges' && !hasNorth && !hasEast && !hasSouth && !hasWest) return;
    const waterShadeForLine = (line) => (
        environment.waterShades[line < 5 ? 0 : line < 11 ? 1 : 2]
    );

    if (layer === 'base') {
        for (let line = 0; line < sewerWaterRowInsets.length; line++) {
            const inset = getInset(line);
            ctx.fillStyle = waterShadeForLine(line);
            ctx.fillRect(x + inset, y + line, tileSize - inset * 2, 1);
        }
        return;
    }

    if (hasNorth || hasEast || hasSouth || hasWest) {
        for (let line = 0; line < tileSize; line++) {
            const inset = getInset(line);
            ctx.fillStyle = waterShadeForLine(line);
            if (hasEast) {
                ctx.fillRect(x + tileSize - inset - 1, y + line, inset * 2 + 2, 1);
            }
            if (hasWest) {
                ctx.fillRect(x - inset - 1, y + line, inset * 2 + 2, 1);
            }
            if (hasSouth) {
                ctx.fillRect(x + line, y + tileSize - inset - 1, 1, inset * 2 + 2);
            }
            if (hasNorth) {
                ctx.fillRect(x + line, y - inset - 1, 1, inset * 2 + 2);
            }
        }
    }
}

const sewerPipeOuterRows = [
    { y: -7, x: -2, width: 4 },
    { y: -6, x: -5, width: 10 },
    { y: -5, x: -6, width: 12 },
    { y: -4, x: -7, width: 14 },
    { y: -3, x: -7, width: 14 },
    { y: -2, x: -8, width: 16 },
    { y: -1, x: -8, width: 16 },
    { y: 0, x: -8, width: 16 },
    { y: 1, x: -8, width: 16 },
    { y: 2, x: -8, width: 16 },
    { y: 3, x: -7, width: 14 },
    { y: 4, x: -7, width: 14 },
    { y: 5, x: -6, width: 12 },
    { y: 6, x: -5, width: 10 },
    { y: 7, x: -2, width: 4 }
];
const sewerPipeInnerRows = [
    { y: -5, x: -2, width: 4 },
    { y: -4, x: -4, width: 8 },
    { y: -3, x: -5, width: 10 },
    { y: -2, x: -5, width: 10 },
    { y: -1, x: -6, width: 12 },
    { y: 0, x: -6, width: 12 },
    { y: 1, x: -6, width: 12 },
    { y: 2, x: -6, width: 12 },
    { y: 3, x: -5, width: 10 },
    { y: 4, x: -4, width: 8 },
    { y: 5, x: -2, width: 4 }
];
const sewerPipeDarkRows = [
    { y: -4, x: -2, width: 4 },
    { y: -3, x: -4, width: 8 },
    { y: -2, x: -5, width: 10 },
    { y: -1, x: -5, width: 10 },
    { y: 0, x: -5, width: 10 },
    { y: 1, x: -5, width: 10 },
    { y: 2, x: -4, width: 8 },
    { y: 3, x: -3, width: 6 },
    { y: 4, x: -1, width: 2 }
];
const sewerPipeWaterRows = [
    { y: -3, x: -2, width: 4 },
    { y: -2, x: -4, width: 8 },
    { y: -1, x: -5, width: 10 },
    { y: 0, x: -5, width: 10 },
    { y: 1, x: -5, width: 10 },
    { y: 2, x: -4, width: 8 },
    { y: 3, x: -3, width: 6 }
];
const sewerBoltOffsets = [
    [-5, -5],
    [4, -5],
    [-5, 4],
    [4, 4]
];

function drawSewerPipeRows(centerX, centerY, rows, color, offsetX = 0, offsetY = 0) {
    ctx.fillStyle = color;
    for (const row of rows) {
        ctx.fillRect(
            centerX + row.x + offsetX,
            centerY + row.y + offsetY,
            row.width,
            1
        );
    }
}

function drawSewerDetails() {
    const now = performance.now();
    const flowTime = now / 1000;
    const drainWave = Math.floor(flowTime * 1.8);
    const legFrame = Math.floor(now / 90) % 2;
    for (const sewer of sewers) {
        const x = sewer.x * tileSize;
        const y = sewer.y * tileSize;
        const puddleX = sewer.puddleX * tileSize;
        const puddleY = sewer.puddleY * tileSize;
        const width = sewer.puddleWidth;
        const height = sewer.puddleHeight;
        if (
            puddleX + width < cameraX - 24
            || puddleX > cameraX + cameraViewportWidth + 24
            || puddleY + height < cameraY - 24
            || puddleY > cameraY + cameraViewportHeight + 24
        ) {
            continue;
        }
        const centerX = puddleX + tileSize / 2;
        const centerY = puddleY + tileSize / 2 + 2;
        const waterCells = initializeSewerWater(sewer);
        if (waterCells) {
            for (const cell of waterCells.values()) {
                drawSewerWaterCell(sewer, cell, flowTime, 'base');
            }
            for (const cell of waterCells.values()) {
                drawSewerWaterCell(sewer, cell, flowTime, 'texture');
            }
            for (const cell of waterCells.values()) {
                drawSewerWaterCell(sewer, cell, flowTime, 'edges');
            }
        }

        const stoneX = centerX - Math.floor(width / 2) + 3 + (sewer.dripSeed % 3);
        ctx.fillStyle = 'rgba(114, 111, 94, 0.52)';
        ctx.fillRect(stoneX, centerY + 2, 3, 2);
        ctx.fillStyle = 'rgba(171, 158, 126, 0.44)';
        ctx.fillRect(stoneX + 1, centerY + 2, 2, 1);
        ctx.fillStyle = 'rgba(79, 91, 77, 0.5)';
        ctx.fillRect(centerX + Math.floor(width / 2) - 4, centerY - 3, 3, 2);

        const drainCenterX = x + 8;
        const drainCenterY = y + 8;
        drawSewerPipeRows(
            drainCenterX,
            drainCenterY,
            sewerPipeOuterRows,
            'rgba(3, 5, 6, 0.58)',
            1,
            1
        );
        drawSewerPipeRows(drainCenterX, drainCenterY, sewerPipeOuterRows, '#202927');
        for (const row of sewerPipeOuterRows) {
            const bevelWidth = Math.max(1, Math.floor(row.width * 0.35));
            ctx.fillStyle = row.y <= -3 ? '#a5aa98' : '#69756e';
            ctx.fillRect(drainCenterX + row.x + 1, drainCenterY + row.y, bevelWidth, 1);
            ctx.fillStyle = '#394541';
            ctx.fillRect(drainCenterX + row.x + row.width - 1, drainCenterY + row.y, 1, 1);
        }
        drawSewerPipeRows(drainCenterX, drainCenterY, sewerPipeInnerRows, '#10191a');
        drawSewerPipeRows(drainCenterX, drainCenterY, sewerPipeDarkRows, '#061013');

        for (const row of sewerPipeWaterRows) {
            const drift = Math.round(Math.sin(flowTime * 1.3 + row.y + sewer.dripSeed) * 1);
            const waveX = drainCenterX + row.x + drift;
            const waveY = drainCenterY + row.y;
            ctx.fillStyle = row.y < 0 ? 'rgba(72, 151, 137, 0.78)' : 'rgba(25, 83, 86, 0.84)';
            ctx.fillRect(waveX, waveY, row.width, 1);
            if ((row.y + drainWave + sewer.dripSeed) % 2 === 0 && row.width > 4) {
                const glintOffset = (drainWave + Math.abs(row.y) * 2) % (row.width - 2);
                ctx.fillStyle = 'rgba(173, 231, 201, 0.68)';
                ctx.fillRect(waveX + 1 + glintOffset, waveY, 2, 1);
            }
        }

        ctx.fillStyle = 'rgba(210, 220, 199, 0.8)';
        ctx.fillRect(drainCenterX - 4, drainCenterY - 6, 3, 1);
        ctx.fillRect(drainCenterX - 6, drainCenterY - 4, 1, 2);
        ctx.fillStyle = 'rgba(17, 25, 24, 0.9)';
        ctx.fillRect(drainCenterX + 6, drainCenterY - 3, 1, 7);
        ctx.fillRect(drainCenterX + 4, drainCenterY + 6, 3, 1);

        for (const [offsetX, offsetY] of sewerBoltOffsets) {
            const boltX = drainCenterX + offsetX;
            const boltY = drainCenterY + offsetY;
            ctx.fillStyle = '#141919';
            ctx.fillRect(boltX, boltY, 2, 2);
            ctx.fillStyle = '#c0bda2';
            ctx.fillRect(boltX, boltY, 1, 1);
        }

        const cockroachPeriod = 38000 + sewer.dripSeed * 7000;
        const cockroachPhase = (now + sewer.dripSeed * 11000) % cockroachPeriod;
        if (cockroachPhase < 1900) {
            const progress = cockroachPhase / 1900;
            const direction = sewer.dripSeed % 2 === 0 ? 1 : -1;
            const cockroachX = drainCenterX + Math.round(direction * progress * 12);
            const cockroachY = drainCenterY - 2 - Math.round(Math.min(1, progress * 1.7) * 7);
            ctx.fillStyle = 'rgba(5, 8, 8, 0.65)';
            ctx.fillRect(cockroachX - 4, cockroachY + 3, 9, 2);
            ctx.fillStyle = '#27170f';
            ctx.fillRect(cockroachX - 3, cockroachY - 1, 6, 3);
            ctx.fillRect(cockroachX + direction * 2, cockroachY - 2, 2, 2);
            ctx.fillStyle = '#704326';
            ctx.fillRect(cockroachX - 2, cockroachY - 1, 4, 2);
            ctx.fillStyle = '#b17a43';
            ctx.fillRect(cockroachX - 1, cockroachY - 1, 2, 1);
            ctx.fillStyle = '#1c120e';
            ctx.fillRect(cockroachX + direction * 3, cockroachY - 2, 1, 1);
            ctx.fillRect(cockroachX - 2, cockroachY + 2, 1, 2);
            ctx.fillRect(cockroachX + 1, cockroachY + 2, 1, 2);
            ctx.fillRect(cockroachX - 4, cockroachY + 1 + legFrame, 2, 1);
            ctx.fillRect(cockroachX + 2, cockroachY + 1 + (1 - legFrame), 2, 1);
            ctx.fillStyle = '#b17a43';
            ctx.fillRect(cockroachX + direction * 4, cockroachY - 4, 1, 2);
            ctx.fillRect(cockroachX + direction * 2, cockroachY - 4, 1, 1);
        }

        const drip = (now / 110 + sewer.dripSeed * 5) % 8;
        ctx.fillStyle = 'rgba(34, 113, 111, 0.88)';
        if (sewer.opening.x !== 0) {
            const dripX = sewer.opening.x < 0 ? puddleX + tileSize - 5 : puddleX + 2;
            ctx.fillRect(dripX, puddleY + 5 + drip, 3, 3);
            ctx.fillStyle = 'rgba(156, 224, 197, 0.88)';
            ctx.fillRect(dripX + 1, puddleY + 5 + drip, 1, 2);
        } else {
            const dripY = sewer.opening.y < 0 ? puddleY + 3 : puddleY + 2;
            ctx.fillRect(puddleX + 6 + sewer.dripSeed, dripY + drip, 3, 3);
            ctx.fillStyle = 'rgba(156, 224, 197, 0.88)';
            ctx.fillRect(puddleX + 7 + sewer.dripSeed, dripY + drip, 1, 2);
        }
    }
}

function drawCastleColumns() {
    for (const column of castleColumns) {
        const x = column.x * tileSize;
        const y = column.y * tileSize;
        const seed = column.x * 47 + column.y * 83 + 17;
        const shaftTone = pseudoRandom(seed) > 0.5 ? '#5d605a' : '#555a55';

        ctx.fillStyle = 'rgba(7, 8, 9, 0.62)';
        ctx.fillRect(x + 3, y + 32, 27, 4);
        ctx.fillStyle = '#292b2b';
        ctx.fillRect(x - 2, y + 27, 36, 6);
        ctx.fillStyle = '#62645e';
        ctx.fillRect(x - 2, y + 25, 36, 3);
        ctx.fillStyle = '#aaa28d';
        ctx.fillRect(x + 1, y + 24, 30, 2);
        ctx.fillStyle = '#3c403c';
        ctx.fillRect(x + 2, y + 29, 28, 1);

        ctx.fillStyle = '#303330';
        ctx.fillRect(x + 4, y + 7, 24, 17);
        ctx.fillStyle = shaftTone;
        ctx.fillRect(x + 6, y + 7, 20, 16);
        ctx.fillStyle = '#79796e';
        ctx.fillRect(x + 6, y + 7, 19, 2);
        ctx.fillStyle = '#858174';
        ctx.fillRect(x + 4, y + 4, 24, 3);
        ctx.fillStyle = '#b1a88e';
        ctx.fillRect(x + 6, y + 4, 19, 1);
        ctx.fillStyle = '#444743';
        ctx.fillRect(x + 1, y + 2, 30, 3);
        ctx.fillStyle = '#928d7c';
        ctx.fillRect(x + 3, y + 2, 26, 1);
        ctx.fillStyle = '#393d39';
        ctx.fillRect(x + 5, y + 13, 22, 1);
        ctx.fillRect(x + 6, y + 19, 20, 1);
        ctx.fillStyle = '#747267';
        ctx.fillRect(x + 6, y + 14, 2, 4);
        ctx.fillRect(x + 24, y + 14, 2, 4);

        if (pseudoRandom(seed + 1) > 0.42) {
            const crackX = x + 12 + Math.floor(pseudoRandom(seed + 2) * 9);
            ctx.fillStyle = '#292d2b';
            ctx.fillRect(crackX, y + 8, 1, 4);
            ctx.fillRect(crackX - 2, y + 11, 2, 1);
            ctx.fillRect(crackX, y + 14, 2, 1);
            ctx.fillStyle = '#9b9583';
            ctx.fillRect(crackX - 1, y + 8, 1, 2);
        }

        drawFloorEnvironmentTint(
            x - 2,
            y,
            36,
            36,
            getFloorVisualEnvironment().wallTint
        );
    }
}

function drawBossHazards() {
    for (const boss of enemies) {
        if (!boss.isBoss) {
            continue;
        }
        if (boss.bossType === 'dragon') {
            if (boss.fireballTarget) {
                const startX = boss.x + boss.size / 2;
                const startY = boss.y + boss.size / 2;
                const pulse = getVisualPulse(boss.fireballWarning, 28);
                ctx.strokeStyle = 'rgba(48, 17, 12, 0.9)';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(boss.fireballTarget.x, boss.fireballTarget.y);
                ctx.stroke();
                ctx.strokeStyle = `rgba(255, ${Math.round(110 + pulse * 110)}, 65, 0.95)`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(boss.fireballTarget.x, boss.fireballTarget.y);
                ctx.stroke();
                ctx.fillStyle = 'rgba(70, 23, 12, 0.8)';
                ctx.beginPath();
                ctx.arc(boss.fireballTarget.x, boss.fireballTarget.y, 9 + pulse * 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#fff1a6';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(boss.fireballTarget.x, boss.fireballTarget.y, 7 + pulse * 2, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(boss.fireballTarget.x - 11, boss.fireballTarget.y);
                ctx.lineTo(boss.fireballTarget.x + 11, boss.fireballTarget.y);
                ctx.moveTo(boss.fireballTarget.x, boss.fireballTarget.y - 11);
                ctx.lineTo(boss.fireballTarget.x, boss.fireballTarget.y + 11);
                ctx.stroke();
            }
            continue;
        }

        if (boss.bossType === 'throneGuardian') {
            if (boss.veinPulseWarning > 0 || boss.veinPulseImpact > 0) {
                const centerX = boss.x + boss.size / 2;
                const centerY = boss.y + boss.size / 2;
                const radius = boss.phaseTwo ? 94 : 72;
                const warning = boss.veinPulseWarning > 0;
                const progress = warning
                    ? 1 - boss.veinPulseWarning / (boss.phaseTwo ? 0.72 : 0.9)
                    : 1 - boss.veinPulseImpact / 0.32;
                ctx.save();
                ctx.globalAlpha = warning ? 0.24 + Math.sin(boss.animTime * 28) * 0.1 : 0.5 * (1 - progress);
                ctx.strokeStyle = warning ? '#f0d98a' : '#ff8840';
                ctx.fillStyle = warning ? 'rgba(217, 184, 93, 0.12)' : 'rgba(255, 115, 49, 0.2)';
                ctx.lineWidth = warning ? 2 : 3;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius * (warning ? 0.2 + progress * 0.8 : 1 + progress * 0.18), 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            }
            continue;
        }

        if (boss.bossType === 'grimReaper') {
            if (boss.shadowStepWarning > 0 && boss.shadowStepTarget) {
                const markerX = (boss.shadowStepTarget.x + 0.5) * tileSize;
                const markerY = (boss.shadowStepTarget.y + 0.5) * tileSize;
                const pulse = getVisualPulse(boss.animTime, 28);
                ctx.save();
                ctx.globalAlpha = 0.42 + pulse * 0.25;
                ctx.strokeStyle = '#d8c7ff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(markerX, markerY, 8 + pulse * 3, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(markerX - 11, markerY);
                ctx.lineTo(markerX + 11, markerY);
                ctx.moveTo(markerX, markerY - 11);
                ctx.lineTo(markerX, markerY + 11);
                ctx.stroke();
                ctx.restore();
            }
            const attack = boss.scytheAttack;
            if (!attack) {
                continue;
            }
            const angle = Math.atan2(attack.directionY, attack.directionX);
            const radius = 82;
            const halfArc = 0.9;
            const pulse = getVisualPulse(attack.timer, 28);
            ctx.beginPath();
            ctx.moveTo(attack.originX, attack.originY);
            ctx.arc(
                attack.originX,
                attack.originY,
                radius,
                angle - halfArc,
                angle + halfArc
            );
            ctx.closePath();
            ctx.fillStyle = attack.phase === 'warning'
                ? `rgba(197, 183, 231, ${0.24 + pulse * 0.22})`
                : 'rgba(190, 68, 102, 0.38)';
            ctx.fill();
            ctx.strokeStyle = attack.phase === 'warning' ? '#d8c7ff' : '#ff829c';
            ctx.lineWidth = attack.phase === 'warning' ? 2.5 : 3;
            ctx.beginPath();
            ctx.arc(
                attack.originX,
                attack.originY,
                radius,
                angle - halfArc,
                angle + halfArc
            );
            ctx.stroke();
            if (attack.phase === 'warning') {
                ctx.beginPath();
                for (const edgeAngle of [angle - halfArc, angle + halfArc]) {
                    ctx.moveTo(attack.originX, attack.originY);
                    ctx.lineTo(
                        attack.originX + Math.cos(edgeAngle) * radius,
                        attack.originY + Math.sin(edgeAngle) * radius
                    );
                }
                ctx.strokeStyle = '#f3eaff';
                ctx.lineWidth = 2.5;
                ctx.stroke();
            }
            continue;
        }

        for (const pool of boss.lavaPools) {
            const x = pool.x;
            const y = pool.y;
            const pulse = getVisualPulse(pool.animTime, 8);
            if (pool.warning > 0) {
                ctx.fillStyle = `rgba(120, 29, 13, ${0.22 + pulse * 0.12})`;
                ctx.beginPath();
                ctx.ellipse(x, y, pool.radiusX + 2 + pulse, pool.radiusY + 1, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = pulse > 0.5 ? '#fff09a' : '#ff7435';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.ellipse(x, y, pool.radiusX + 2 + pulse, pool.radiusY + 1, 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.fillStyle = 'rgba(236, 70, 26, 0.18)';
                ctx.fillRect(x - 3, y - 2, 6, 4);
                continue;
            }

            ctx.fillStyle = 'rgba(10, 8, 7, 0.48)';
            ctx.fillRect(x - pool.radiusX - 2, y + pool.radiusY - 2, pool.radiusX * 2 + 4, 4);
            ctx.fillStyle = 'rgba(136, 36, 17, 0.88)';
            ctx.fillRect(x - pool.radiusX, y - pool.radiusY + 2, pool.radiusX * 2, pool.radiusY * 2 - 4);
            ctx.fillRect(x - pool.radiusX + 3, y - pool.radiusY, pool.radiusX * 2 - 6, pool.radiusY * 2);
            ctx.fillStyle = 'rgba(232, 67, 23, 0.94)';
            ctx.fillRect(x - pool.radiusX + 3, y - pool.radiusY + 2, pool.radiusX * 2 - 6, pool.radiusY * 2 - 4);
            ctx.fillRect(x - pool.radiusX + 1, y - 3 + pulse, pool.radiusX * 2 - 2, 5);
            ctx.fillStyle = '#ff9d32';
            ctx.fillRect(x - 8, y - 3 + pulse, 13, 3);
            ctx.fillRect(x + 2, y + 2 - pulse, 7, 2);
            ctx.fillStyle = '#ffe18a';
            ctx.fillRect(x - 5, y - 2 + pulse, 6, 1);
            ctx.fillRect(x + 4, y + 3 - pulse, 3, 1);
            ctx.fillStyle = 'rgba(47, 49, 39, 0.72)';
            ctx.fillRect(x - pool.radiusX + 2, y + 4, 4, 2);
            ctx.fillRect(x + pool.radiusX - 7, y - 5, 5, 2);
        }

        for (const rock of boss.thrownRocks) {
            const x = rock.x;
            const y = rock.y;
            if (rock.phase === 'warning') {
                const pulse = getVisualPulse(rock.warning, 30);
                ctx.strokeStyle = `rgba(255, ${Math.round(110 + pulse * 100)}, 55, 0.85)`;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(x, y, 6 + pulse * 2, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(x - 9, y);
                ctx.lineTo(x - 5, y);
                ctx.moveTo(x + 5, y);
                ctx.lineTo(x + 9, y);
                ctx.moveTo(x, y - 9);
                ctx.lineTo(x, y - 5);
                ctx.moveTo(x, y + 5);
                ctx.lineTo(x, y + 9);
                ctx.stroke();
                continue;
            }
            const isFlying = rock.phase === 'flying';
            const fade = rock.phase === 'vanishing'
                ? Math.max(0, rock.fadeTime / 0.55)
                : rock.phase === 'landed'
                    ? Math.min(1, rock.lifetime / 0.8)
                    : 1;

            ctx.save();
            ctx.globalAlpha = fade;
            const scale = isFlying ? 1 + Math.sin(rock.animTime * 12) * 0.08 : 1;
            ctx.translate(x, y - (isFlying ? 5 + Math.sin(rock.animTime * 9) * 2 : 0));
            ctx.scale(scale, scale);
            ctx.fillStyle = 'rgba(9, 8, 7, 0.5)';
            ctx.fillRect(-8, 5, 16, 4);
            ctx.fillStyle = '#342c27';
            ctx.fillRect(-6, -5, 11, 10);
            ctx.fillRect(-8, -2, 15, 6);
            ctx.fillStyle = '#5f5145';
            ctx.fillRect(-5, -6, 8, 4);
            ctx.fillRect(-7, -2, 12, 5);
            ctx.fillStyle = '#88705a';
            ctx.fillRect(-4, -6, 4, 2);
            ctx.fillRect(-6, -2, 3, 2);
            ctx.fillStyle = '#a84324';
            ctx.fillRect(-2, -3, 2, 6);
            ctx.fillRect(2, -1, 2, 4);
            ctx.fillStyle = '#f08331';
            ctx.fillRect(-1, -2, 1, 4);
            ctx.fillRect(3, 0, 1, 2);
            ctx.fillStyle = '#ffd06a';
            ctx.fillRect(-1, -1, 1, 2);
            ctx.restore();
        }
        for (const eruption of boss.eruptions || []) {
            const pulse = getVisualPulse(eruption.animTime, 28);
            ctx.save();
            ctx.globalAlpha = eruption.warning > 0
                ? 0.3 + pulse * 0.2
                : Math.max(0, eruption.lifetime / 0.45);
            ctx.fillStyle = eruption.warning > 0 ? '#a92f1d' : '#f06b2e';
            ctx.strokeStyle = eruption.warning > 0 ? '#ffd06a' : '#ffe59a';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(eruption.x, eruption.y, eruption.radius * (eruption.warning > 0 ? 1 : 0.65 + pulse * 0.35), 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }
    }
}
