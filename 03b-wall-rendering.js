const caveWallPalette = {
    shadow: '#202a2f',
    darkRock: '#35434a',
    stone: '#536168',
    lightStone: '#718086',
    glint: '#aab2ab',
    copper: '#94602f',
    copperLight: '#d29a4f',
    teal: '#277f84',
    tealLight: '#86ded0',
    ruby: '#873741',
    rubyLight: '#eb7565',
    moss: '#3e6644',
    mossLight: '#91ad61',
    ember: '#a84324',
    emberLight: '#f08031',
    emberGlint: '#ffd078',
    contamination: '#94602f'
};

const caveOreTypes = {
    copper: {
        rim: caveWallPalette.shadow,
        outer: caveWallPalette.copper,
        inner: caveWallPalette.copperLight,
        core: caveWallPalette.darkRock,
        glint: caveWallPalette.glint,
        pattern: ['...r...', '..roi..', '.rroii.', '..rri..', '...i...']
    },
    iron: {
        rim: caveWallPalette.shadow,
        outer: caveWallPalette.darkRock,
        inner: caveWallPalette.lightStone,
        core: caveWallPalette.shadow,
        glint: caveWallPalette.glint,
        pattern: ['..r....', '.roi...', 'rroii..', '.roi...', '..i....']
    },
    teal: {
        rim: caveWallPalette.shadow,
        outer: caveWallPalette.teal,
        inner: caveWallPalette.tealLight,
        core: caveWallPalette.darkRock,
        glint: caveWallPalette.glint,
        pattern: ['...r...', '..roi..', '.rroii.', '...roi.', '....i..']
    },
    ruby: {
        rim: caveWallPalette.shadow,
        outer: caveWallPalette.ruby,
        inner: caveWallPalette.rubyLight,
        core: caveWallPalette.darkRock,
        glint: caveWallPalette.glint,
        pattern: ['..r....', '.roi...', 'rroii..', '..roi..', '...i...']
    },
    ember: {
        rim: caveWallPalette.shadow,
        outer: caveWallPalette.ember,
        inner: caveWallPalette.emberLight,
        core: caveWallPalette.darkRock,
        glint: caveWallPalette.emberGlint,
        pattern: ['r......', 'oro....', '.oio...', '..roi..', '...i...']
    }
};

function drawCaveCrack(x, y, seed, scale = 1, heated = false) {
    ctx.fillStyle = caveWallPalette.shadow;
    for (let segment = 0; segment < 4; segment++) {
        const offsetX = Math.floor(pseudoRandom(seed + segment * 3) * 3);
        const offsetY = segment * scale;
        ctx.fillRect(x + offsetX * scale, y + offsetY, scale, scale);
        if (segment === 1 || segment === 3) {
            ctx.fillRect(x + (offsetX + 1) * scale, y + offsetY, scale, scale);
        }
    }
    ctx.fillStyle = heated ? caveWallPalette.emberLight : caveWallPalette.lightStone;
    ctx.fillRect(x - scale, y, scale, scale);
    if (heated) {
        ctx.fillStyle = caveWallPalette.emberGlint;
        ctx.fillRect(x + scale, y + 2 * scale, scale, scale);
    }
}

function drawCaveMoss(x, y, scale = 1) {
    const fillPatchRect = (offsetX, offsetY, width, height) => {
        const left = Math.round(offsetX * scale * 1.1);
        const top = Math.round(offsetY * scale * 1.1);
        const right = Math.round((offsetX + width) * scale * 1.1);
        const bottom = Math.round((offsetY + height) * scale * 1.1);
        ctx.fillRect(x + left, y + top, right - left, bottom - top);
    };

    ctx.fillStyle = caveWallPalette.moss;
    fillPatchRect(1, 0, 3, 1);
    fillPatchRect(0, 1, 5, 1);
    fillPatchRect(1, 2, 3, 1);
    fillPatchRect(2, 3, 1, 2);
    ctx.fillStyle = caveWallPalette.mossLight;
    fillPatchRect(1, 0, 2, 1);
    fillPatchRect(0, 1, 2, 1);
    fillPatchRect(3, 2, 1, 1);
}

function drawOreVein(x, y, ore) {
    const pattern = ore.pattern || caveOreTypes.iron.pattern;
    const occupied = [];
    for (let row = 0; row < pattern.length; row++) {
        for (let col = 0; col < pattern[row].length; col++) {
            if (pattern[row][col] !== '.') occupied.push({ row, col });
        }
    }
    const minCol = Math.min(...occupied.map((pixel) => pixel.col));
    const maxCol = Math.max(...occupied.map((pixel) => pixel.col));
    const minRow = Math.min(...occupied.map((pixel) => pixel.row));
    const maxRow = Math.max(...occupied.map((pixel) => pixel.row));
    const width = Math.ceil((maxCol - minCol + 1) * 1.1);
    const height = Math.ceil((maxRow - minRow + 1) * 1.1);
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            const pixel = pattern[minRow + Math.floor(row / 1.1)][minCol + Math.floor(col / 1.1)];
            if (pixel === '.') continue;
            ctx.fillStyle = pixel === 'o' ? ore.outer
                : pixel === 'i' ? ore.inner
                    : pixel === 'g' ? ore.glint
                        : ore.rim;
            ctx.fillRect(x + minCol + col, y + minRow + row, 1, 1);
        }
    }

    ctx.fillStyle = ore.glint;
    ctx.fillRect(x + 2, y + 1, 1, 1);
}

function drawPixelStoneBlock(x, y, width, height, seed, tones) {
    const tone = tones[Math.floor(pseudoRandom(seed) * tones.length)];
    ctx.fillStyle = caveWallPalette.shadow;
    ctx.fillRect(x - 1, y - 1, width + 2, height + 2);
    ctx.fillStyle = tone;
    ctx.fillRect(x + 2, y, Math.max(1, width - 4), 1);
    ctx.fillRect(x + 1, y + 1, width - 2, 1);
    ctx.fillRect(x, y + 2, width, Math.max(1, height - 4));
    ctx.fillRect(x + 1, y + height - 2, width - 2, 1);
    ctx.fillRect(x + 2, y + height - 1, Math.max(1, width - 4), 1);
    ctx.fillStyle = caveWallPalette.glint;
    ctx.fillRect(x + 2, y, Math.max(1, width - 5), 1);
    ctx.fillRect(x + 1, y + 1, 1, Math.max(1, height - 4));
    ctx.fillStyle = caveWallPalette.darkRock;
    ctx.fillRect(x + width - 2, y + 2, 1, Math.max(1, height - 4));
    ctx.fillRect(x + 2, y + height - 2, Math.max(1, width - 4), 1);

    ctx.fillStyle = caveWallPalette.lightStone;
    ctx.fillRect(
        x + 2 + Math.floor(pseudoRandom(seed + 5) * Math.max(1, width - 5)),
        y + 2 + Math.floor(pseudoRandom(seed + 6) * Math.max(1, height - 4)),
        2,
        1
    );

    if (pseudoRandom(seed + 1) > 0.52) {
        ctx.fillStyle = caveWallPalette.darkRock;
        ctx.fillRect(
            x + 2 + Math.floor(pseudoRandom(seed + 2) * Math.max(1, width - 4)),
            y + 2 + Math.floor(pseudoRandom(seed + 3) * Math.max(1, height - 3)),
            2,
            1
        );
    }

    if (pseudoRandom(seed + 7) > 0.76 && width > 7 && height > 5) {
        const crackX = x + 3 + Math.floor(pseudoRandom(seed + 8) * (width - 6));
        const crackY = y + 2 + Math.floor(pseudoRandom(seed + 9) * (height - 4));
        ctx.fillStyle = caveWallPalette.shadow;
        ctx.fillRect(crackX, crackY, 1, 2);
        ctx.fillRect(crackX + 1, crackY + 1, 2, 1);
        ctx.fillStyle = caveWallPalette.glint;
        ctx.fillRect(crackX - 1, crackY, 1, 1);
    }
}

function drawOldWallTile(col, row) {
    const x = col * tileSize;
    const y = row * tileSize;
    const seed = col * 19 + row * 23 + 7;
    const stoneTones = [
        caveWallPalette.darkRock,
        caveWallPalette.stone,
        caveWallPalette.lightStone
    ];

    ctx.fillStyle = caveWallPalette.shadow;
    ctx.fillRect(x, y, tileSize, tileSize);

    const stones = [
        { x: 0, y: 0, w: 10, h: 8, id: 1 },
        { x: 10, y: 0, w: 6, h: 7, id: 11 },
        { x: 0, y: 8, w: 7, h: 8, id: 23 },
        { x: 7, y: 7, w: 9, h: 9, id: 37 }
    ];

    for (const stone of stones) {
        const stoneX = x + stone.x + Math.floor(pseudoRandom(seed + stone.id) * 2);
        const stoneY = y + stone.y + Math.floor(pseudoRandom(seed + stone.id + 1) * 2);
        const width = stone.w - Math.floor(pseudoRandom(seed + stone.id + 2) * 2);
        const height = stone.h - Math.floor(pseudoRandom(seed + stone.id + 3) * 2);
        drawPixelStoneBlock(stoneX, stoneY, width, height, seed + stone.id + 4, stoneTones);
        ctx.save();
        ctx.beginPath();
        ctx.rect(stoneX, stoneY, width, height);
        ctx.clip();

        const detailX = stoneX + 1 + Math.floor(
            pseudoRandom(seed + stone.id + 101) * Math.max(1, width - 3)
        );
        const detailY = stoneY + 1 + Math.floor(
            pseudoRandom(seed + stone.id + 103) * Math.max(1, height - 3)
        );
        if (pseudoRandom(seed + stone.id + 127) > 0.82) {
            drawCaveCrack(detailX, detailY, seed + stone.id + 131, 1);
        }
        ctx.restore();
    }

    if (pseudoRandom(seed + 401) > 0.7) {
        const oreIndex = Math.floor(pseudoRandom(seed + 409) * 4);
        const ore = currentFloor >= 7 && pseudoRandom(seed + 419) > 0.7
            ? caveOreTypes.ember
            : [
                caveOreTypes.copper,
                caveOreTypes.iron,
                caveOreTypes.teal,
                caveOreTypes.ruby
            ][oreIndex];
        drawOreVein(
            x + 4 + Math.floor(pseudoRandom(seed + 421) * 5),
            y + 5 + Math.floor(pseudoRandom(seed + 431) * 4),
            ore
        );
    }

    if (pseudoRandom(seed + 433) > 0.8) {
        drawCaveMoss(
            x + 2 + Math.floor(pseudoRandom(seed + 439) * 8),
            y + Math.floor(pseudoRandom(seed + 443) * 4),
            1
        );
    }
    if (pseudoRandom(seed + 449) > 0.76) {
        const dampX = x + 2 + Math.floor(pseudoRandom(seed + 457) * 10);
        const dampY = y + 8 + Math.floor(pseudoRandom(seed + 461) * 5);
        ctx.fillStyle = caveWallPalette.darkRock;
        ctx.fillRect(dampX, dampY, 2, 1);
        ctx.fillRect(dampX + 1, dampY + 1, 2, 1);
        ctx.fillStyle = caveWallPalette.mossLight;
        ctx.fillRect(dampX + 1, dampY, 1, 1);
    }
    if (currentFloor >= 7 && pseudoRandom(seed + 463) > 0.83) {
        drawCaveCrack(
            x + 4 + Math.floor(pseudoRandom(seed + 467) * 7),
            y + 4 + Math.floor(pseudoRandom(seed + 479) * 6),
            seed + 487,
            1,
            true
        );
    }
}

function drawWallTile(col, row) {
    if (currentFloor < 10) {
        drawOldWallTile(col, row);
        const environment = getFloorVisualEnvironment();
        drawFloorEnvironmentTint(
            col * tileSize,
            row * tileSize,
            tileSize,
            tileSize,
            environment.wallTint
        );
        return;
    }

    const x = col * tileSize;
    const y = row * tileSize;
    const environment = getFloorVisualEnvironment();
    const seed = col * 19 + row * 23 + 7;
    const tones = ['#555c60', '#60676a', '#697174', '#50585c', '#74797a'];

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, tileSize, tileSize);
    ctx.clip();
    ctx.fillStyle = '#303639';
    ctx.fillRect(x, y, tileSize, tileSize);

    for (let course = 0; course < 2; course++) {
        const globalCourse = row * 2 + course;
        const courseY = y + course * 8;
        const stagger = globalCourse % 2 === 0 ? -8 : 0;
        const firstBlock = Math.floor((x - stagger) / 16);
        const lastBlock = Math.ceil((x + tileSize - stagger) / 16);

        for (let blockCol = firstBlock; blockCol <= lastBlock; blockCol++) {
            const blockSeed = blockCol * 37 + globalCourse * 71 + 193;
            const blockX = blockCol * 16 + stagger;
            const insetX = Math.floor(pseudoRandom(blockSeed) * 2);
            const insetY = Math.floor(pseudoRandom(blockSeed + 1) * 2);
            const width = 15 - Math.floor(pseudoRandom(blockSeed + 2) * 2);
            const height = 7 - Math.floor(pseudoRandom(blockSeed + 3) * 2);
            const left = blockX + insetX;
            const top = courseY + insetY;
            const tone = tones[Math.floor(pseudoRandom(blockSeed + 4) * tones.length)];

            ctx.fillStyle = 'rgba(19, 22, 23, 0.82)';
            ctx.fillRect(left - 1, top - 1, width + 2, height + 2);
            ctx.fillStyle = tone;
            ctx.fillRect(left, top, width, height);
            ctx.fillStyle = 'rgba(192, 195, 188, 0.38)';
            ctx.fillRect(left + 1, top, width - 3, 1);
            ctx.fillRect(left, top + 1, 1, Math.max(1, height - 2));
            ctx.fillStyle = 'rgba(27, 31, 32, 0.6)';
            ctx.fillRect(left + width - 1, top + 1, 1, height - 1);
            ctx.fillRect(left + 2, top + height - 1, width - 2, 1);
            ctx.fillStyle = 'rgba(139, 147, 146, 0.3)';
            ctx.fillRect(left + 3, top + 2, Math.max(2, width - 7), 1);

            for (let chisel = 0; chisel < 2; chisel++) {
                const markX = left + 3 + Math.floor(
                    pseudoRandom(blockSeed + 11 + chisel * 7) * Math.max(1, width - 6)
                );
                const markY = top + 3 + Math.floor(
                    pseudoRandom(blockSeed + 13 + chisel * 9) * 2
                );
                ctx.fillStyle = 'rgba(37, 42, 43, 0.48)';
                ctx.fillRect(markX, markY, 3, 1);
                ctx.fillStyle = 'rgba(168, 171, 164, 0.24)';
                ctx.fillRect(markX, markY - 1, 2, 1);
            }
        }
    }

    drawRuinedWallDetails(x, y, seed, tileSize, tileSize);
    drawFloorEnvironmentTint(x, y, tileSize, tileSize, environment.wallTint);
    ctx.restore();
}

function drawRuinedWallDetails(x, y, seed, width, height) {
    const detail = pseudoRandom(seed + 331);
    const detailX = x + 2 + Math.floor(pseudoRandom(seed + 337) * Math.max(1, width - 6));
    const detailY = y + 2 + Math.floor(pseudoRandom(seed + 347) * Math.max(1, height - 7));

    if (detail > 0.57) {
        const bloodHeight = 3 + Math.floor(pseudoRandom(seed + 349) * Math.min(5, height - 3));
        const bloodX = x + 3 + Math.floor(pseudoRandom(seed + 353) * Math.max(1, width - 6));
        ctx.fillStyle = '#28181c';
        ctx.fillRect(bloodX, detailY, 3, bloodHeight);
        ctx.fillRect(bloodX + 1, detailY + bloodHeight, 4, 1);
        ctx.fillStyle = '#682724';
        ctx.fillRect(bloodX, detailY + 1, 1, Math.max(1, bloodHeight - 2));
        ctx.fillRect(bloodX + 2, detailY + bloodHeight - 1, 2, 1);
    }

    if (detail < 0.18) {
        const scratchX = x + 3 + Math.floor(pseudoRandom(seed + 359) * Math.max(1, width - 9));
        const scratchY = y + 3 + Math.floor(pseudoRandom(seed + 367) * Math.max(1, height - 7));
        const slope = pseudoRandom(seed + 373) > 0.5 ? 1 : -1;
        ctx.fillStyle = '#181a1a';
        for (let mark = 0; mark < 3; mark++) {
            ctx.fillRect(scratchX + mark * 2, scratchY + slope * mark, 1, 5);
        }
        ctx.fillStyle = '#978f80';
        for (let mark = 0; mark < 3; mark++) {
            ctx.fillRect(scratchX + mark * 2 + 1, scratchY + slope * mark, 1, 3);
        }
    } else if (detail > 0.94) {
        const fromRight = pseudoRandom(seed + 379) > 0.5;
        const originX = fromRight ? x + width - 2 : x + 2;
        const direction = fromRight ? -1 : 1;
        ctx.fillStyle = '#c0bdaa';
        for (let strand = 1; strand <= Math.min(7, width - 2); strand++) {
            ctx.fillRect(originX + direction * strand, y + 1 + strand, 1, 1);
            ctx.fillRect(originX, y + 1 + strand, 1, 1);
            if (strand % 2 === 0) {
                ctx.fillRect(originX + direction * (strand - 1), y + 1 + strand, 1, 1);
            }
        }
    } else if (detail > 0.88) {
        const boneX = x + 2 + Math.floor(pseudoRandom(seed + 383) * Math.max(1, width - 9));
        const boneY = y + height - 5;
        ctx.fillStyle = '#1d1c1b';
        ctx.fillRect(boneX, boneY + 1, 7, 2);
        ctx.fillStyle = '#beb49a';
        ctx.fillRect(boneX + 1, boneY, 5, 1);
        ctx.fillRect(boneX + 2, boneY - 1, 1, 1);
        ctx.fillRect(boneX + 5, boneY - 1, 1, 1);
        ctx.fillRect(boneX + 2, boneY + 2, 1, 1);
        ctx.fillRect(boneX + 5, boneY + 2, 1, 1);
    }
}

function drawLargeCastleWallTile(col, row) {
    drawWallTile(col, row);
    drawWallTile(col + 1, row);
    drawWallTile(col, row + 1);
    drawWallTile(col + 1, row + 1);
}

function drawLargeWallTile(col, row) {
    if (currentFloor < 10) {
        drawOldLargeWallTile(col, row);
        return;
    }
    drawLargeCastleWallTile(col, row);
}

function drawOldLargeWallTile(col, row) {
    const x = col * tileSize;
    const y = row * tileSize;
    const seed = col * 19 + row * 23 + 71;
    const wallSize = tileSize * 2;
    const rockTones = [
        caveWallPalette.darkRock,
        caveWallPalette.stone,
        caveWallPalette.lightStone
    ];

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, wallSize, wallSize);
    ctx.clip();
    ctx.fillStyle = caveWallPalette.shadow;
    ctx.fillRect(x, y, wallSize, wallSize);

    const rocks = [
        { x: -2, y: -2, w: 20, h: 14 },
        { x: 15, y: -1, w: 20, h: 15 },
        { x: -2, y: 10, w: 15, h: 15 },
        { x: 11, y: 10, w: 23, h: 14 },
        { x: -2, y: 22, w: 19, h: 13 },
        { x: 15, y: 21, w: 20, h: 14 }
    ];

    for (let index = 0; index < rocks.length; index++) {
        const rock = rocks[index];
        const rockSeed = seed + index * 31;
        const left = x + rock.x + Math.floor(pseudoRandom(rockSeed) * 2);
        const top = y + rock.y + Math.floor(pseudoRandom(rockSeed + 1) * 2);
        const right = left + rock.w - Math.floor(pseudoRandom(rockSeed + 2) * 2);
        const bottom = top + rock.h - Math.floor(pseudoRandom(rockSeed + 3) * 2);
        const width = right - left;
        const height = bottom - top;
        drawPixelStoneBlock(left, top, width, height, rockSeed + 4, rockTones);
        ctx.save();
        ctx.beginPath();
        ctx.rect(left, top, width, height);
        ctx.clip();

        ctx.fillStyle = caveWallPalette.glint;
        ctx.fillRect(left + 2, top + 1, Math.max(2, width - 5), 1);
        ctx.fillRect(left + 1, top + 2, 1, Math.max(1, Math.floor(height / 3)));
        ctx.fillStyle = caveWallPalette.darkRock;
        ctx.fillRect(right - 2, top + 3, 1, Math.max(1, height - 6));
        ctx.fillRect(left + 3, bottom - 2, Math.max(2, width - 6), 1);
        ctx.fillStyle = caveWallPalette.stone;
        ctx.fillRect(left + 2, top + 4, Math.max(1, width - 6), 1);

        for (let fleck = 0; fleck < 5; fleck++) {
            const fx = left + 2 + Math.floor(
                pseudoRandom(rockSeed + fleck * 7 + 9) * Math.max(1, width - 4)
            );
            const fy = top + 2 + Math.floor(
                pseudoRandom(rockSeed + fleck * 11 + 15) * Math.max(1, height - 4)
            );
            ctx.fillStyle = fleck % 2 === 0
                ? caveWallPalette.lightStone
                : caveWallPalette.darkRock;
            ctx.fillRect(fx, fy, 1 + (fleck % 3 === 0 ? 1 : 0), 1);
        }
        if (pseudoRandom(rockSeed + 47) > 0.58) {
            drawCaveCrack(
                left + 4 + Math.floor(pseudoRandom(rockSeed + 53) * Math.max(1, width - 8)),
                top + 3 + Math.floor(pseudoRandom(rockSeed + 59) * Math.max(1, height - 7)),
                rockSeed + 61
            );
        }
        ctx.restore();
    }

    if (pseudoRandom(seed + 101) > 0.1) {
        const oreIndex = Math.floor(pseudoRandom(seed + 103) * 4);
        const ore = currentFloor >= 7 && pseudoRandom(seed + 107) > 0.68
            ? caveOreTypes.ember
            : [
                caveOreTypes.copper,
                caveOreTypes.iron,
                caveOreTypes.teal,
                caveOreTypes.ruby
            ][oreIndex];
        drawOreVein(
            x + 10 + Math.floor(pseudoRandom(seed + 109) * 12),
            y + 11 + Math.floor(pseudoRandom(seed + 113) * 12),
            ore
        );
    }

    if (pseudoRandom(seed + 127) > 0.65) {
        drawCaveMoss(
            x + 4 + Math.floor(pseudoRandom(seed + 131) * 19),
            y + 1 + Math.floor(pseudoRandom(seed + 137) * 4),
            2
        );
    }
    if (currentFloor >= 7 && pseudoRandom(seed + 139) > 0.62) {
        drawCaveCrack(
            x + 10 + Math.floor(pseudoRandom(seed + 149) * 12),
            y + 12 + Math.floor(pseudoRandom(seed + 151) * 8),
            seed + 157,
            1,
            true
        );
        if (pseudoRandom(seed + 163) > 0.45) {
            ctx.fillStyle = caveWallPalette.contamination;
            ctx.fillRect(
                x + 4 + Math.floor(pseudoRandom(seed + 167) * 22),
                y + 4 + Math.floor(pseudoRandom(seed + 173) * 20),
                2,
                1
            );
        }
    }
    ctx.restore();
}
