function drawFloorTile(col, row) {
    const x = col * tileSize;
    const y = row * tileSize;
    drawFloorPaving(x, y, tileSize, tileSize);
}

function pseudoRandom(seed) {
    const x = Math.sin(seed * 127.1) * 43758.5453123;
    return x - Math.floor(x);
}

function shouldDrawBrokenLavaFloorTile(col, row, floor = currentFloor) {
    if (floor < 5 || floor > 9) return false;
    return pseudoRandom(col * 193 + row * 389 + 6721) > 0.965;
}

function drawBrokenLavaFloorTile(x, y) {
    const pixelSize = tileSize / 8;
    const originX = x - tileSize;
    const originY = y - tileSize;
    const pixels = [
        '....dd....dd....',
        '...dss...dssd...',
        '..dssss..dsssd..',
        '.dssllsd.dssssd.',
        '.dssssdsssssllsd',
        '..dsssdRRdsssssd',
        '...dssROOsssd...',
        '....dRRYYOssd...',
        '...dssROOWRRd...',
        '..dsssdRROOsssd.',
        '.dssllsdRRROssd.',
        '.dssssd..dROOssd',
        '..dssss..dRROsd.',
        '...dss...dRRd...',
        '....dd....dd....',
        '................'
    ];
    const palette = {
        d: '#252725',
        s: '#51483d',
        l: '#817360',
        R: '#67270f',
        O: '#d34b12',
        Y: '#ff9b24',
        W: '#ffd15a'
    };

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    for (let row = 0; row < pixels.length; row++) {
        for (let col = 0; col < pixels[row].length; col++) {
            const color = palette[pixels[row][col]];
            if (!color) continue;
            ctx.fillStyle = color;
            ctx.fillRect(
                originX + col * pixelSize,
                originY + row * pixelSize,
                pixelSize,
                pixelSize
            );
        }
    }
    ctx.restore();
}

function drawBrokenLavaFloorDetails() {
    if (currentFloor < 5 || currentFloor > 9) return;

    for (let row = 1; row < rows - 1; row++) {
        for (let col = 1; col < cols - 1; col++) {
            if (map[row][col] === '#' || !shouldDrawBrokenLavaFloorTile(col, row)) {
                continue;
            }

            let surroundedByFloor = true;
            for (let neighborRow = row - 1; neighborRow <= row + 1; neighborRow++) {
                for (let neighborCol = col - 1; neighborCol <= col + 1; neighborCol++) {
                    if (!map[neighborRow]
                        || map[neighborRow][neighborCol] === undefined
                        || map[neighborRow][neighborCol] === '#') {
                        surroundedByFloor = false;
                        break;
                    }
                }
                if (!surroundedByFloor) break;
            }
            if (surroundedByFloor) {
                drawBrokenLavaFloorTile(col * tileSize, row * tileSize);
            }
        }
    }
}

const floorVisualTitles = [
    'Galeria recém-abandonada',
    'Galerias de extração',
    'Encruzilhada das minas',
    'Ruínas antigas',
    'Cisterna de água e calor',
    'Dutos de fuligem',
    'Câmara das forjas',
    'Câmara vulcânica',
    'Coração das cisternas',
    'Portões do castelo',
    'Alojamentos da guarda real',
    'Biblioteca e arquivo',
    'Arsenais e salão de armas',
    'Grande salão e capela',
    'Laboratório e observatório arcano',
    'Câmaras do tesouro',
    'Ala nobre e salões privados',
    'Ala interditada e torres arcanas',
    'Bastião das defesas mágicas',
    'Sala do trono'
];
const floorVisualEnvironmentCache = new Map();

function getFloorVisualEnvironment(floor = currentFloor) {
    if (!Number.isInteger(floor) || floor < 1 || floor > floorVisualTitles.length) {
        throw new RangeError(`Andar sem perfil visual: ${floor}.`);
    }
    if (floorVisualEnvironmentCache.has(floor)) {
        return floorVisualEnvironmentCache.get(floor);
    }

    let region;
    let progress;
    if (floor <= 4) {
        region = 'mine';
        progress = (floor - 1) / 3;
    } else if (floor <= 9) {
        region = 'cistern';
        progress = (floor - 5) / 4;
    } else if (floor <= 14) {
        region = 'castle';
        progress = (floor - 10) / 4;
    } else if (floor <= 17) {
        region = 'arcane';
        progress = (floor - 15) / 2;
    } else {
        region = 'corrupted';
        progress = (floor - 18) / 2;
    }

    const palettes = {
        mine: {
            floor: [104, 72, 42],
            wall: [96, 65, 40],
            shadow: [9, 10, 11],
            darkness: 0.56 + progress * 0.06,
            torch: [255, 170, 78],
            dust: '#c4aa7e',
            water: [27, 55, 66],
            corruption: 0.015 + progress * 0.02,
            rug: ['#21131a', '#8c6934', '#9f2638', '#461d2b', '#a83342'],
            glass: ['#172f49', '#90b8c9', '#4f1828']
        },
        cistern: {
            floor: [119, 56, 32],
            wall: [92, 48, 34],
            shadow: [15, 11, 12],
            darkness: 0.5 + progress * 0.1,
            torch: [255, 111, 44],
            dust: '#ad7652',
            water: [14, 43, 55],
            corruption: 0.04 + progress * 0.05,
            rug: ['#241415', '#865026', '#a43424', '#451b1a', '#d07136'],
            glass: ['#253c45', '#8a9b91', '#442019']
        },
        castle: {
            floor: [53, 65, 76],
            wall: [48, 60, 70],
            shadow: [8, 11, 17],
            darkness: 0.55 + progress * 0.055,
            torch: [255, 187, 105],
            dust: '#b8c2c2',
            water: [25, 45, 59],
            corruption: 0.04 + progress * 0.06,
            rug: ['#1d2027', '#796746', '#8b3340', '#40252f', '#b8484d'],
            glass: ['#24394d', '#a0bbc2', '#632638']
        },
        arcane: {
            floor: [81, 57, 105],
            wall: [67, 52, 86],
            shadow: [12, 8, 23],
            darkness: 0.49 + progress * 0.045,
            torch: [205, 132, 255],
            dust: '#c6a9ec',
            water: [31, 35, 69],
            corruption: 0.16 + progress * 0.08,
            rug: ['#171321', '#99733c', '#512d70', '#281a3d', '#cfaa55'],
            glass: ['#342653', '#c5a5ed', '#693f87']
        },
        corrupted: {
            floor: [92, 31, 53],
            wall: [72, 27, 47],
            shadow: [12, 6, 12],
            darkness: 0.62 + progress * 0.08,
            torch: [255, 82, 57],
            dust: '#bc6d70',
            water: [29, 27, 47],
            corruption: 0.36 + progress * 0.12,
            rug: ['#120e16', '#62321e', '#6f1e36', '#250e25', '#b12b43'],
            glass: ['#251629', '#a45b74', '#781c39']
        }
    };
    const palette = palettes[region];
    const tintAlpha = region === 'mine' ? 0.24 + progress * 0.07
        : region === 'cistern' ? 0.3 + progress * 0.14
            : region === 'castle' ? 0.22 + progress * 0.08
                : region === 'arcane' ? 0.28 + progress * 0.08
                    : 0.35 + progress * 0.12;
    const wallAlpha = region === 'mine' ? 0.22 + progress * 0.08
        : region === 'cistern' ? 0.28 + progress * 0.14
            : region === 'castle' ? 0.22 + progress * 0.09
                : region === 'arcane' ? 0.29 + progress * 0.1
                    : 0.38 + progress * 0.12;
    const corruption = Math.min(0.7, palette.corruption);
    const environment = {
        floor: floorVisualTitles[floor - 1],
        region,
        progress,
        floorTint: `rgba(${palette.floor.join(', ')}, ${tintAlpha})`,
        wallTint: `rgba(${palette.wall.join(', ')}, ${wallAlpha})`,
        shadowColor: palette.shadow,
        darkness: palette.darkness,
        torchColor: `rgb(${palette.torch.join(', ')})`,
        torchGlow: `rgba(${palette.torch.join(', ')}, 0.12)`,
        torchStrength: 0.45 + corruption * 0.24,
        torchRadius: 4.2 + (region === 'cistern' ? 0.6 : 0),
        dustColor: palette.dust,
        waterShades: [
            `rgba(${palette.water.join(', ')}, 0.78)`,
            `rgba(${palette.water.map((value) => Math.min(255, value + 34)).join(', ')}, 0.76)`,
            `rgba(${palette.water.map((value) => Math.min(255, value + 78)).join(', ')}, 0.82)`
        ],
        corruption,
        stainThreshold: Math.max(0.52, 0.96 - floor * 0.021),
        rugPalette: palette.rug,
        windowPalette: palette.glass
    };
    floorVisualEnvironmentCache.set(floor, environment);
    return environment;
}

function drawFloorEnvironmentTint(x, y, width, height, color) {
    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
    ctx.restore();
}

function drawFloorPaving(x, y, width, height) {
    const courseHeight = 16;
    const ruinedFloor = currentFloor >= 10;
    const environment = getFloorVisualEnvironment();
    const palettes = [
        { face: '#414440', edge: '#292d2c', light: '#62645d', mid: '#4d504b', shade: '#343735', grain: '#77786f' },
        { face: '#484a44', edge: '#2d302e', light: '#696a61', mid: '#53554e', shade: '#383b38', grain: '#7d7b70' },
        { face: '#3b3f3d', edge: '#272b2a', light: '#5b605b', mid: '#484c49', shade: '#303433', grain: '#70736c' },
        { face: '#454741', edge: '#2b2f2d', light: '#65665d', mid: '#50524b', shade: '#353835', grain: '#79776b' }
    ];
    const widths = [23, 26, 29, 32, 35];
    const firstCourse = Math.floor(y / courseHeight);
    const lastCourse = Math.ceil((y + height) / courseHeight);
    const joints = [];

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();
    ctx.fillStyle = '#202321';
    ctx.fillRect(x, y, width, height);

    for (let course = firstCourse; course < lastCourse; course++) {
        const courseY = course * courseHeight;
        const courseSeed = course * 131 + 47;
        const stagger = course % 2 === 0 ? 0 : 14;
        let stoneX = -stagger;
        let stoneIndex = 0;
        joints.push({ x: null, y: courseY, seed: courseSeed });

        while (stoneX < x + width) {
            const stoneSeed = courseSeed + stoneIndex * 43;
            const stoneWidth = widths[
                Math.floor(pseudoRandom(stoneSeed) * widths.length)
            ];
            const palette = palettes[
                Math.floor(pseudoRandom(stoneSeed + 7) * palettes.length)
            ];
            if (stoneX + stoneWidth + 1 > x && stoneX - 1 < x + width) {
                const faceX = stoneX - 1;
                const faceY = courseY - 1;
                const faceWidth = stoneWidth + 2;
                const faceHeight = courseHeight + 2;
                const corner = 3;

                ctx.beginPath();
                ctx.moveTo(faceX + corner, faceY);
                ctx.lineTo(faceX + faceWidth - corner, faceY);
                ctx.lineTo(faceX + faceWidth - corner, faceY + 1);
                ctx.lineTo(faceX + faceWidth - 1, faceY + 1);
                ctx.lineTo(faceX + faceWidth - 1, faceY + 2);
                ctx.lineTo(faceX + faceWidth, faceY + 3);
                ctx.lineTo(faceX + faceWidth, faceY + faceHeight - 3);
                ctx.lineTo(faceX + faceWidth - 1, faceY + faceHeight - 2);
                ctx.lineTo(faceX + faceWidth - 1, faceY + faceHeight - 1);
                ctx.lineTo(faceX + faceWidth - corner, faceY + faceHeight - 1);
                ctx.lineTo(faceX + faceWidth - corner, faceY + faceHeight);
                ctx.lineTo(faceX + corner, faceY + faceHeight);
                ctx.lineTo(faceX + corner, faceY + faceHeight - 1);
                ctx.lineTo(faceX + 1, faceY + faceHeight - 1);
                ctx.lineTo(faceX + 1, faceY + faceHeight - 2);
                ctx.lineTo(faceX, faceY + faceHeight - 3);
                ctx.lineTo(faceX, faceY + 3);
                ctx.lineTo(faceX + 1, faceY + 2);
                ctx.lineTo(faceX + 1, faceY + 1);
                ctx.lineTo(faceX + corner, faceY + 1);
                ctx.closePath();
                ctx.fillStyle = palette.edge;
                ctx.fill();
                ctx.save();
                ctx.clip();

                ctx.fillStyle = palette.face;
                ctx.fillRect(faceX + 1, faceY + 1, faceWidth - 2, faceHeight - 2);

                ctx.fillStyle = palette.light;
                ctx.fillRect(faceX + 4, faceY + 2, Math.max(2, faceWidth - 12), 1);
                ctx.fillRect(faceX + 3, faceY + 3, 1, 2);
                ctx.fillStyle = palette.mid;
                ctx.fillRect(faceX + 4, faceY + 4, Math.max(2, faceWidth - 10), 1);
                ctx.fillStyle = palette.shade;
                ctx.fillRect(faceX + 4, faceY + faceHeight - 3, Math.max(2, faceWidth - 9), 1);
                ctx.fillRect(faceX + faceWidth - 3, faceY + 4, 1, faceHeight - 8);

                for (let fleck = 0; fleck < 11; fleck++) {
                    const fleckX = faceX + 3 + Math.floor(
                        pseudoRandom(stoneSeed + 17 + fleck * 7) * Math.max(1, faceWidth - 6)
                    );
                    const fleckY = faceY + 3 + Math.floor(
                        pseudoRandom(stoneSeed + 19 + fleck * 11) * Math.max(1, faceHeight - 6)
                    );
                    ctx.fillStyle = fleck % 3 === 0
                        ? palette.grain
                        : (fleck % 2 === 0 ? 'rgba(31, 34, 33, 0.7)' : 'rgba(108, 110, 102, 0.48)');
                    ctx.fillRect(fleckX, fleckY, fleck % 4 === 0 ? 2 : 1, 1);
                }

                if (pseudoRandom(stoneSeed + 31) > 0.38) {
                    const crackX = faceX + 5 + Math.floor(
                        pseudoRandom(stoneSeed + 37) * Math.max(1, faceWidth - 10)
                    );
                    const crackY = faceY + 6 + Math.floor(pseudoRandom(stoneSeed + 41) * 3);
                    ctx.fillStyle = 'rgba(27, 30, 29, 0.72)';
                    ctx.fillRect(crackX, crackY, 1, 2);
                    ctx.fillRect(crackX + 1, crackY + 1, 2, 1);
                    ctx.fillStyle = 'rgba(121, 121, 110, 0.44)';
                    ctx.fillRect(crackX - 1, crackY, 1, 1);
                }

                if (pseudoRandom(stoneSeed + 47) > 0.63) {
                    const wornX = faceX + 5 + Math.floor(
                        pseudoRandom(stoneSeed + 53) * Math.max(1, faceWidth - 10)
                    );
                    const wornY = faceY + 5 + Math.floor(
                        pseudoRandom(stoneSeed + 59) * Math.max(1, faceHeight - 8)
                    );
                    ctx.fillStyle = 'rgba(91, 100, 87, 0.38)';
                    ctx.fillRect(wornX, wornY, 3, 2);
                    ctx.fillStyle = 'rgba(139, 139, 119, 0.3)';
                    ctx.fillRect(wornX + 1, wornY, 1, 1);
                }

                if (pseudoRandom(stoneSeed + 67) > (ruinedFloor ? 0.91 : 0.46)) {
                    const mossX = faceX + 4 + Math.floor(
                        pseudoRandom(stoneSeed + 71) * Math.max(1, faceWidth - 8)
                    );
                    const mossY = faceY + 5 + Math.floor(
                        pseudoRandom(stoneSeed + 73) * Math.max(1, faceHeight - 9)
                    );
                    const mossWidth = 3 + Math.floor(pseudoRandom(stoneSeed + 79) * 3);
                    ctx.fillStyle = 'rgba(30, 52, 36, 0.82)';
                    ctx.fillRect(mossX, mossY + 1, mossWidth, 2);
                    ctx.fillRect(mossX + 1, mossY, Math.max(2, mossWidth - 1), 1);
                    ctx.fillStyle = 'rgba(66, 91, 51, 0.78)';
                    ctx.fillRect(mossX + 1, mossY, Math.max(2, mossWidth - 2), 1);
                    ctx.fillStyle = 'rgba(125, 132, 75, 0.62)';
                    ctx.fillRect(mossX + 2, mossY - 1, 1, 1);
                    if (mossWidth > 4) ctx.fillRect(mossX + mossWidth - 1, mossY - 1, 1, 1);
                }

                if (pseudoRandom(stoneSeed + 83) > 0.76) {
                    const chipSide = pseudoRandom(stoneSeed + 89) > 0.5;
                    const chipX = chipSide
                        ? faceX + faceWidth - 4
                        : faceX + 2;
                    const chipY = faceY + 3 + Math.floor(pseudoRandom(stoneSeed + 97) * 7);
                    ctx.fillStyle = 'rgba(25, 28, 27, 0.82)';
                    ctx.fillRect(chipX, chipY, 3, 1);
                    ctx.fillRect(chipX + (chipSide ? 1 : 0), chipY + 1, 2, 1);
                    ctx.fillStyle = 'rgba(112, 112, 101, 0.55)';
                    ctx.fillRect(chipX + (chipSide ? 0 : 2), chipY - 1, 2, 1);
                }

                if (pseudoRandom(stoneSeed + 101) > (ruinedFloor ? 0.7 : 0.91)) {
                    const bloodX = faceX + 5 + Math.floor(
                        pseudoRandom(stoneSeed + 103) * Math.max(1, faceWidth - 10)
                    );
                    const bloodY = faceY + 6 + Math.floor(pseudoRandom(stoneSeed + 107) * 4);
                    ctx.fillStyle = ruinedFloor
                        ? 'rgba(67, 25, 24, 0.86)'
                        : 'rgba(69, 29, 27, 0.72)';
                    ctx.fillRect(bloodX, bloodY, 3, 1);
                    ctx.fillRect(bloodX + 1, bloodY + 1, 2, 1);
                    ctx.fillStyle = ruinedFloor
                        ? 'rgba(112, 43, 34, 0.72)'
                        : 'rgba(105, 43, 35, 0.5)';
                    ctx.fillRect(bloodX + 2, bloodY - 1, 2, 1);
                    if (ruinedFloor && pseudoRandom(stoneSeed + 149) > 0.45) {
                        ctx.fillStyle = 'rgba(48, 23, 24, 0.78)';
                        ctx.fillRect(bloodX - 1, bloodY + 1, 2, 1);
                    }
                }

                if (pseudoRandom(stoneSeed + 109) > 0.69) {
                    const dustX = faceX + 4 + Math.floor(
                        pseudoRandom(stoneSeed + 113) * Math.max(1, faceWidth - 8)
                    );
                    const dustY = faceY + 4 + Math.floor(pseudoRandom(stoneSeed + 127) * 8);
                    ctx.fillStyle = 'rgba(151, 139, 112, 0.36)';
                    ctx.fillRect(dustX, dustY, 2, 1);
                    ctx.fillRect(dustX + 1, dustY + 1, 2, 1);
                }
                ctx.restore();
            }

            stoneX += stoneWidth;
            joints.push({ x: stoneX, y: null, seed: stoneSeed });
            stoneIndex++;
        }
    }

    for (const joint of joints) {
        if (joint.x === null) {
            const seamY = joint.y;
            const tuftCount = Math.ceil(width / 12);
            for (let tuft = 0; tuft < tuftCount; tuft++) {
                const tuftSeed = joint.seed + Math.floor(x * 0.73) + tuft * 37;
                if (pseudoRandom(tuftSeed) < (ruinedFloor ? 0.78 : 0.2)) continue;
                const segmentWidth = width / tuftCount;
                const tuftX = x + Math.floor(
                    tuft * segmentWidth + pseudoRandom(tuftSeed + 3) * Math.max(1, segmentWidth - 3)
                );
                ctx.fillStyle = 'rgba(25, 48, 31, 0.96)';
                ctx.fillRect(tuftX - 1, seamY - 1, 4, 2);
                ctx.fillStyle = 'rgba(65, 101, 48, 0.95)';
                ctx.fillRect(tuftX, seamY - 2, 2, 2);
                ctx.fillRect(tuftX - 1, seamY - 2, 1, 2);
                ctx.fillRect(tuftX + 2, seamY - 3, 1, 4);
                ctx.fillStyle = 'rgba(151, 164, 79, 0.88)';
                ctx.fillRect(tuftX, seamY - 3, 1, 1);
                ctx.fillRect(tuftX + 2, seamY - 4, 1, 1);
            }
        } else if (pseudoRandom(joint.seed + 131 + Math.floor(x * 0.41)) > 0.36) {
            const seamX = x + joint.x;
            const seamY = Math.floor(y / courseHeight) * courseHeight
                + Math.floor(pseudoRandom(joint.seed + 137 + Math.floor(x)) * height);
            if (ruinedFloor && pseudoRandom(joint.seed + 151 + Math.floor(x * 0.41)) < 0.82) {
                continue;
            }
            ctx.fillStyle = 'rgba(25, 48, 31, 0.95)';
            ctx.fillRect(seamX - 1, seamY, 3, 2);
            ctx.fillStyle = 'rgba(77, 111, 51, 0.92)';
            ctx.fillRect(seamX, seamY - 1, 1, 3);
            ctx.fillRect(seamX + 1, seamY + 1, 1, 2);
            ctx.fillStyle = 'rgba(150, 160, 77, 0.78)';
            ctx.fillRect(seamX + 1, seamY - 1, 1, 1);
        }
    }
    drawFloorEnvironmentTint(x, y, width, height, environment.floorTint);
    drawFloorDetails(x, y, width, height, ruinedFloor);
    ctx.restore();
}

function drawFloorDetails(x, y, width, height, ruinedFloor) {
    const environment = getFloorVisualEnvironment();
    const firstCol = Math.max(0, Math.floor(x / tileSize));
    const firstRow = Math.max(0, Math.floor(y / tileSize));
    const lastCol = Math.min(cols, Math.ceil((x + width) / tileSize));
    const lastRow = Math.min(rows, Math.ceil((y + height) / tileSize));

    for (let row = firstRow; row < lastRow; row++) {
        for (let col = firstCol; col < lastCol; col++) {
            if (!map[row] || map[row][col] === '#') {
                continue;
            }

            const seed = col * 193 + row * 389 + 271;
            const tileX = col * tileSize;
            const tileY = row * tileSize;
            const decor = pseudoRandom(seed);

            if (decor > environment.stainThreshold) {
                drawDryBloodStain(
                    tileX + 3 + Math.floor(pseudoRandom(seed + 3) * 8),
                    tileY + 4 + Math.floor(pseudoRandom(seed + 5) * 7),
                    ruinedFloor
                        ? 0.45 + pseudoRandom(seed + 7) * 0.35
                        : 0.3 + pseudoRandom(seed + 7) * 0.2
                );
            }
            if (!ruinedFloor) continue;

            if (decor < 0.12) {
                drawClawScratches(tileX, tileY, seed);
            } else if (decor > 0.87 && decor <= 0.93) {
                drawScatteredBones(tileX, tileY, seed);
            }
        }
    }
}

let wallCornerCobwebCanvas = null;
let wallCornerCobwebMap = null;
let cobwebStateMap = null;
const brokenFloorCobwebTiles = new Set();
const brokenWallCornerCobwebs = new Set();
let wallCornerCobwebs = [];
let floorCobwebs = [];
let floorCobwebMap = null;
let floorCobwebFloor = -1;

function ensureCobwebState() {
    if (cobwebStateMap === map) return;
    cobwebStateMap = map;
    brokenFloorCobwebTiles.clear();
    brokenWallCornerCobwebs.clear();
    wallCornerCobwebs = [];
    floorCobwebs = [];
    floorCobwebMap = null;
    floorCobwebFloor = -1;
    wallCornerCobwebCanvas = null;
    wallCornerCobwebMap = null;
}

function drawFloorCobwebs() {
    ensureCobwebState();
    if (currentFloor < 10) return;
    if (floorCobwebMap !== map || floorCobwebFloor !== currentFloor) {
        floorCobwebs = [];
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (map[row][col] === '#' || pseudoRandom(col * 193 + row * 389 + 271) <= 0.93) {
                    continue;
                }
                floorCobwebs.push({
                    col,
                    row,
                    seed: col * 193 + row * 389 + 271,
                    key: `${col},${row}`
                });
            }
        }
        floorCobwebMap = map;
        floorCobwebFloor = currentFloor;
    }

    for (const web of floorCobwebs) {
        const x = web.col * tileSize;
        const y = web.row * tileSize;
        if (
            !brokenFloorCobwebTiles.has(web.key)
            && x + tileSize >= cameraX - 16
            && x <= cameraX + cameraViewportWidth + 16
            && y + tileSize >= cameraY - 16
            && y <= cameraY + cameraViewportHeight + 16
        ) {
            drawFloorCobweb(x, y, web.seed);
        }
    }
}

function drawCachedWallCornerCobwebs() {
    ensureWallCornerCobwebCache();
    drawCachedViewportCanvas(wallCornerCobwebCanvas);
}

function ensureWallCornerCobwebCache() {
    ensureCobwebState();
    if (wallCornerCobwebMap !== map) {
        if (!wallCornerCobwebCanvas) {
            wallCornerCobwebCanvas = document.createElement('canvas');
        }
        const cacheWidth = gridWidth * renderPixelScale;
        const cacheHeight = gridHeight * renderPixelScale;
        if (
            wallCornerCobwebCanvas.width !== cacheWidth
            || wallCornerCobwebCanvas.height !== cacheHeight
        ) {
            wallCornerCobwebCanvas.width = cacheWidth;
            wallCornerCobwebCanvas.height = cacheHeight;
        }
        const cobwebContext = wallCornerCobwebCanvas.getContext('2d');
        cobwebContext.setTransform(1, 0, 0, 1, 0, 0);
        cobwebContext.clearRect(0, 0, cacheWidth, cacheHeight);
        cobwebContext.imageSmoothingEnabled = false;
        cobwebContext.scale(renderPixelScale, renderPixelScale);
        wallCornerCobwebs = [];
        drawWallCornerCobwebs(cobwebContext);
        wallCornerCobwebMap = map;
    }
}

function releaseWallCornerCobwebCanvas() {
    if (wallCornerCobwebCanvas) {
        wallCornerCobwebCanvas.width = 0;
        wallCornerCobwebCanvas.height = 0;
    }
    wallCornerCobwebCanvas = null;
    wallCornerCobwebMap = null;
}

function drawWallCornerCobwebs(targetContext) {
    const ctx = targetContext;
    const isWalkable = (col, row) => (
        row >= 0 && row < rows
        && col >= 0 && col < cols
        && (map[row][col] === '.' || map[row][col] === 'S')
    );
    const maxOpenTiles = (startCol, startRow, stepCol, stepRow) => {
        let openTiles = 0;
        let currentCol = startCol;
        let currentRow = startRow;
        while (
            currentCol >= 0 && currentCol < cols
            && currentRow >= 0 && currentRow < rows
            && isWalkable(currentCol, currentRow)
        ) {
            openTiles++;
            currentCol += stepCol;
            currentRow += stepRow;
        }
        return openTiles;
    };

    for (let row = 1; row < rows - 1; row++) {
        for (let col = 1; col < cols - 1; col++) {
            if (!isWalkable(col, row)) continue;

            const corners = [
                { dx: -1, dy: -1, walls: [map[row - 1][col], map[row][col - 1], map[row - 1][col - 1]] },
                { dx: 1, dy: -1, walls: [map[row - 1][col], map[row][col + 1], map[row - 1][col + 1]] },
                { dx: -1, dy: 1, walls: [map[row + 1][col], map[row][col - 1], map[row + 1][col - 1]] },
                { dx: 1, dy: 1, walls: [map[row + 1][col], map[row][col + 1], map[row + 1][col + 1]] }
            ];

            for (let index = 0; index < corners.length; index++) {
                const corner = corners[index];
                const seed = col * 193 + row * 389 + 271 + index * 997;
                if (
                    !corner.walls.every((tile) => tile === '#')
                    || pseudoRandom(seed) > 0.35
                ) {
                    continue;
                }
                if (
                    maxOpenTiles(col, row, -corner.dx, 0) === 0
                    || maxOpenTiles(col, row, 0, -corner.dy) === 0
                ) {
                    continue;
                }

                const anchorX = col * tileSize + (corner.dx > 0 ? tileSize - 1 : 1);
                const anchorY = row * tileSize + (corner.dy > 0 ? tileSize - 1 : 1);
                const directionX = -corner.dx;
                const directionY = -corner.dy;
                const getWebSize = (value) => (
                    value < 0.7 ? 1
                        : value < 0.93 ? 2
                            : value < 0.99 ? 3
                                : 4
                );
                const availableWidth = maxOpenTiles(col, row, directionX, 0);
                const availableHeight = maxOpenTiles(col, row, 0, directionY);
                const spanX = tileSize * Math.min(
                    getWebSize(pseudoRandom(seed + 23)),
                    availableWidth
                );
                const spanY = tileSize * Math.min(
                    getWebSize(pseudoRandom(seed + 29)),
                    availableHeight
                );
                const webKey = `${col},${row},${index}`;
                wallCornerCobwebs.push({
                    key: webKey,
                    left: Math.min(anchorX, anchorX + directionX * spanX),
                    top: Math.min(anchorY, anchorY + directionY * spanY),
                    right: Math.max(anchorX, anchorX + directionX * spanX),
                    bottom: Math.max(anchorY, anchorY + directionY * spanY)
                });
                if (brokenWallCornerCobwebs.has(webKey)) continue;
                drawWallCornerCobweb(
                    anchorX,
                    anchorY,
                    directionX,
                    directionY,
                    seed,
                    spanX,
                    spanY,
                    ctx
                );
            }
        }
    }
}

function breakCobwebsAtEntity(entity) {
    ensureCobwebState();
    ensureWallCornerCobwebCache();

    const left = entity.x;
    const top = entity.y;
    const right = entity.x + entity.size;
    const bottom = entity.y + entity.size;
    let brokeCobweb = false;
    const firstCol = Math.max(0, Math.floor(left / tileSize));
    const lastCol = Math.min(cols - 1, Math.floor(right / tileSize));
    const firstRow = Math.max(0, Math.floor(top / tileSize));
    const lastRow = Math.min(rows - 1, Math.floor(bottom / tileSize));

    if (currentFloor >= 10) {
        for (let row = firstRow; row <= lastRow; row++) {
            for (let col = firstCol; col <= lastCol; col++) {
                if (map[row][col] !== '.' && map[row][col] !== 'S') continue;
                const seed = col * 193 + row * 389 + 271;
                if (pseudoRandom(seed) > 0.93) {
                    const key = `${col},${row}`;
                    if (!brokenFloorCobwebTiles.has(key)) {
                        brokenFloorCobwebTiles.add(key);
                        brokeCobweb = true;
                    }
                }
            }
        }
    }

    for (const web of wallCornerCobwebs) {
        if (
            right >= web.left && left <= web.right
            && bottom >= web.top && top <= web.bottom
            && !brokenWallCornerCobwebs.has(web.key)
        ) {
            brokenWallCornerCobwebs.add(web.key);
            brokeCobweb = true;
        }
    }

    if (brokeCobweb) {
        wallCornerCobwebCanvas = null;
        wallCornerCobwebMap = null;
    }
}

function drawWallCornerCobweb(anchorX, anchorY, directionX, directionY, seed, spanX, spanY, targetContext) {
    const ctx = targetContext;
    const endX = anchorX + directionX * spanX;
    const endY = anchorY + directionY * spanY;
    const firstCol = Math.max(0, Math.floor(Math.min(anchorX, endX) / tileSize));
    const lastCol = Math.min(cols - 1, Math.floor(Math.max(anchorX, endX) / tileSize));
    const firstRow = Math.max(0, Math.floor(Math.min(anchorY, endY) / tileSize));
    const lastRow = Math.min(rows - 1, Math.floor(Math.max(anchorY, endY) / tileSize));

    ctx.save();
    ctx.beginPath();
    for (let row = firstRow; row <= lastRow; row++) {
        for (let col = firstCol; col <= lastCol; col++) {
            if (map[row][col] === '.' || map[row][col] === 'S') {
                ctx.rect(col * tileSize, row * tileSize, tileSize, tileSize);
            }
        }
    }
    ctx.clip();

    const webPoint = (distanceX, distanceY) => ({
        x: anchorX + directionX * distanceX,
        y: anchorY + directionY * distanceY
    });
    const pixelLine = (startX, startY, endX, endY) => {
        const steps = Math.max(Math.abs(endX - startX), Math.abs(endY - startY));
        for (let step = 0; step <= steps; step++) {
            const progress = steps === 0 ? 0 : step / steps;
            const px = Math.round(startX + (endX - startX) * progress);
            const py = Math.round(startY + (endY - startY) * progress);
            ctx.fillRect(px, py, 1, 1);
        }
    };

    const spokeCount = 4 + Math.floor(pseudoRandom(seed + 31) * 3);
    for (let spoke = 0; spoke <= spokeCount; spoke++) {
        const angle = Math.PI * 0.5 * spoke / spokeCount;
        const end = webPoint(Math.round(Math.cos(angle) * spanX), Math.round(Math.sin(angle) * spanY));
        ctx.fillStyle = 'rgba(14, 16, 17, 0.38)';
        pixelLine(anchorX + directionX, anchorY + directionY, end.x + directionX, end.y + directionY);
        ctx.fillStyle = 'rgba(194, 192, 177, 0.72)';
        pixelLine(anchorX, anchorY, end.x, end.y);
        if (spoke % 2 === 0) {
            ctx.fillStyle = 'rgba(231, 224, 202, 0.32)';
            pixelLine(anchorX - directionY, anchorY + directionX, end.x - directionY, end.y + directionX);
        }
    }

    const ringCount = Math.max(2, Math.min(7, Math.floor(Math.min(spanX, spanY) / 9)));
    for (let ring = 1; ring <= ringCount; ring++) {
        const radiusX = Math.round(spanX * ring / ringCount);
        const radiusY = Math.round(spanY * ring / ringCount);
        let previous = webPoint(radiusX, 0);
        ctx.fillStyle = 'rgba(14, 16, 17, 0.34)';
        const arcSteps = Math.max(4, Math.ceil(Math.PI * Math.max(radiusX, radiusY) / 8));
        for (let step = 1; step <= arcSteps; step++) {
            const angle = Math.PI * 0.5 * step / arcSteps;
            const strandWarp = Math.round(
                Math.sin(angle * 2)
                * Math.sin(seed * 0.17 + ring * 1.9)
                * Math.min(2, ring * 0.35)
            );
            const next = webPoint(
                Math.round(Math.cos(angle) * radiusX),
                Math.round(Math.sin(angle) * radiusY) + strandWarp
            );
            pixelLine(
                previous.x + directionX,
                previous.y + directionY,
                next.x + directionX,
                next.y + directionY
            );
            ctx.fillStyle = 'rgba(194, 192, 177, 0.67)';
            pixelLine(previous.x, previous.y, next.x, next.y);
            if (step % 3 === 0) {
                ctx.fillStyle = 'rgba(231, 224, 202, 0.38)';
                pixelLine(
                    previous.x - directionY,
                    previous.y + directionX,
                    next.x - directionY,
                    next.y + directionX
                );
            }
            previous = next;
        }
    }

    if (pseudoRandom(seed + 17) <= 0.58) {
        const spiderX = anchorX + directionX * Math.round(spanX * 0.56);
        const spiderY = anchorY + directionY * Math.round(spanY * 0.56);
        ctx.fillStyle = 'rgba(10, 11, 12, 0.48)';
        ctx.fillRect(spiderX - 3, spiderY + 2, 7, 2);
        ctx.fillStyle = '#171718';
        for (let leg = 0; leg < 4; leg++) {
            const legOffset = leg - 1.5;
            const bodyOffset = Math.round(legOffset * 0.8);
            const footOffset = Math.round(legOffset * 1.8);
            const legY = spiderY + Math.round(Math.abs(legOffset));
            pixelLine(spiderX - 1, legY, spiderX - 3, legY + bodyOffset);
            pixelLine(spiderX - 3, legY + bodyOffset, spiderX - 4, legY + footOffset);
            pixelLine(spiderX + 1, legY, spiderX + 3, legY + bodyOffset);
            pixelLine(spiderX + 3, legY + bodyOffset, spiderX + 4, legY + footOffset);
        }
        ctx.fillStyle = '#201d1b';
        ctx.fillRect(spiderX - 2, spiderY - 1, 4, 4);
        ctx.fillRect(spiderX - 1, spiderY - 3, 2, 2);
        ctx.fillStyle = '#ba5951';
        ctx.fillRect(spiderX - 1, spiderY - 2, 1, 1);
        ctx.fillStyle = '#d7c9ad';
        ctx.fillRect(spiderX + 1, spiderY - 1, 1, 1);
    }
    ctx.restore();
}

function drawDryBloodStain(x, y, opacity) {
    ctx.fillStyle = `rgba(51, 21, 22, ${opacity})`;
    ctx.fillRect(x, y, 5, 2);
    ctx.fillRect(x + 2, y - 1, 4, 2);
    ctx.fillRect(x + 4, y + 1, 3, 1);
    ctx.fillStyle = `rgba(105, 39, 34, ${opacity * 0.8})`;
    ctx.fillRect(x + 1, y, 3, 1);
    ctx.fillRect(x + 3, y + 2, 2, 1);
}

function drawClawScratches(x, y, seed) {
    const startX = x + 4 + Math.floor(pseudoRandom(seed + 11) * 3);
    const startY = y + 4 + Math.floor(pseudoRandom(seed + 13) * 3);
    const angle = pseudoRandom(seed + 17) > 0.5 ? 1 : -1;

    ctx.fillStyle = 'rgba(24, 25, 24, 0.9)';
    for (let mark = 0; mark < 3; mark++) {
        const offsetX = mark * 3;
        ctx.fillRect(startX + offsetX, startY + angle * offsetX, 1, 5);
        ctx.fillRect(startX + offsetX + 1, startY + angle * offsetX + 2, 1, 4);
    }
    ctx.fillStyle = 'rgba(129, 111, 92, 0.58)';
    for (let mark = 0; mark < 3; mark++) {
        const offsetX = mark * 3;
        ctx.fillRect(startX + offsetX + 1, startY + angle * offsetX, 1, 3);
    }
}

function drawFloorCobweb(x, y, seed) {
    const cornerRight = pseudoRandom(seed + 19) > 0.5;
    const originX = cornerRight ? x + tileSize - 1 : x + 1;
    const originY = y + 1;
    const direction = cornerRight ? -1 : 1;

    ctx.fillStyle = 'rgba(177, 177, 158, 0.64)';
    for (let step = 1; step <= 6; step += 1) {
        ctx.fillRect(originX + direction * step, originY + step, 1, 1);
        ctx.fillRect(originX, originY + step, 1, 1);
        if (step % 2 === 0) {
            ctx.fillRect(originX + direction * (step - 1), originY + step, 1, 1);
        }
    }
    ctx.fillRect(originX + direction * 2, originY + 2, direction * 2, 1);
    ctx.fillRect(originX + direction * 4, originY + 4, direction * 2, 1);
}

function drawScatteredBones(x, y, seed) {
    const cornerRight = pseudoRandom(seed + 23) > 0.5;
    const boneX = cornerRight ? x + tileSize - 8 : x + 2;
    const boneY = y + 10 + Math.floor(pseudoRandom(seed + 29) * 3);
    const angle = pseudoRandom(seed + 31) > 0.5 ? 1 : -1;

    ctx.fillStyle = 'rgba(31, 29, 26, 0.72)';
    ctx.fillRect(boneX, boneY + 2, 8, 2);
    ctx.fillStyle = 'rgba(190, 180, 151, 0.88)';
    ctx.fillRect(boneX + 1, boneY, 5, 2);
    ctx.fillRect(boneX + 2, boneY - 1, 2, 1);
    ctx.fillRect(boneX + 5, boneY + 2, 2, 1);
    ctx.fillStyle = 'rgba(224, 211, 177, 0.8)';
    ctx.fillRect(boneX + 1, boneY, 2, 1);
    ctx.fillRect(boneX + 5, boneY + 1, 2, 1);

    ctx.fillStyle = 'rgba(164, 155, 132, 0.86)';
    ctx.fillRect(boneX + 8, boneY + 2 * angle, 4, 1);
    ctx.fillRect(boneX + 9, boneY + 1 * angle, 2, 1);
    ctx.fillRect(boneX + 10, boneY + 3 * angle, 2, 1);
}

function drawLargeFloorTile(col, row) {
    const x = col * tileSize;
    const y = row * tileSize;
    drawFloorPaving(x, y, tileSize * 2, tileSize * 2);
}
