const playerAttackSpriteScale = 1.15;
const playerAttackOpeningSpriteScale = 1.15;
const goblinAnimationSpeedMultiplier = 0.672;
const goblinAnimationFrameMap = {
    idle: {
        loop: true,
        frames: [
            [44, 36, 65, 93], [137, 31, 67, 98], [233, 29, 66, 101],
            [329, 29, 67, 99], [425, 29, 68, 100]
        ]
    },
    walk: {
        loop: true,
        frames: [
            [553, 36, 67, 95], [639, 31, 67, 98], [725, 31, 73, 97],
            [816, 31, 71, 98], [906, 31, 74, 98], [998, 31, 70, 97]
        ]
    },
    run: {
        loop: true,
        frames: [
            [30, 173, 100, 80], [135, 172, 95, 88], [225, 169, 89, 87],
            [320, 169, 95, 91], [405, 167, 94, 93]
        ]
    },
    bladeAttack: {
        frames: [
            [544, 173, 86, 95], [630, 175, 90, 93], [729, 169, 81, 101],
            [808, 172, 88, 98], [895, 164, 105, 104], [995, 177, 132, 91]
        ]
    },
    shieldAttack: {
        frames: [
            [38, 310, 90, 90], [143, 307, 88, 94], [241, 300, 93, 98],
            [346, 300, 78, 98], [444, 299, 75, 104]
        ]
    },
    defend: {
        frames: [
            [597, 309, 87, 91], [705, 309, 76, 93],
            [815, 309, 83, 94], [918, 307, 110, 100]
        ]
    },
    takeDamage: {
        frames: [
            [45, 440, 65, 88], [131, 440, 72, 88],
            [226, 437, 79, 93], [326, 440, 81, 90]
        ]
    },
    death: {
        frames: [
            [499, 440, 84, 90], [594, 442, 67, 88], [684, 442, 70, 85],
            [774, 465, 89, 51], [878, 471, 102, 52], [998, 470, 109, 49]
        ]
    },
    jump: {
        frames: [
            [37, 568, 67, 66], [125, 563, 81, 71],
            [222, 552, 69, 75], [311, 563, 67, 71]
        ]
    },
    crouch: {
        frames: [
            [489, 568, 69, 68], [587, 568, 61, 68],
            [675, 573, 69, 65], [776, 566, 67, 71]
        ]
    },
    interact: {
        frames: [
            [38, 673, 63, 80], [121, 666, 64, 87],
            [211, 668, 68, 85], [308, 660, 60, 94]
        ]
    },
    carryItem: {
        frames: [
            [449, 674, 58, 81], [512, 677, 62, 76], [578, 673, 55, 82],
            [644, 674, 58, 81], [714, 674, 57, 81]
        ]
    },
    useItem: {
        frames: [
            [826, 674, 61, 81], [902, 671, 58, 80],
            [970, 666, 63, 81], [1051, 660, 80, 91]
        ]
    }
};

const goblinRunnerAnimationFrameMap = {
    idle: {
        loop: true,
        frames: [
            [123, 13, 77, 96], [242, 13, 77, 96], [358, 13, 77, 96], [475, 13, 77, 96],
            [592, 13, 77, 96], [710, 13, 77, 96], [829, 13, 77, 96], [947, 13, 77, 96]
        ]
    },
    walk: {
        loop: true,
        frames: [
            [105, 124, 95, 98], [222, 124, 95, 98], [339, 124, 95, 98], [457, 124, 95, 98],
            [575, 124, 95, 98], [693, 124, 95, 98], [811, 124, 95, 98], [929, 124, 95, 98]
        ]
    },
    run: {
        loop: true,
        frames: [
            [97, 226, 100, 103], [214, 226, 100, 103], [332, 226, 100, 103], [449, 226, 100, 103],
            [568, 226, 100, 103], [687, 226, 100, 103], [805, 226, 100, 103], [925, 226, 100, 103]
        ]
    },
    bladeAttack: {
        frames: [
            [88, 335, 83, 87], [204, 335, 83, 87], [321, 335, 83, 87],
            [439, 335, 83, 87], [555, 335, 110, 87]
        ]
    },
    shieldAttack: {
        frames: [
            [88, 335, 83, 87], [204, 335, 83, 87], [321, 335, 83, 87],
            [439, 335, 83, 87], [555, 335, 110, 87]
        ]
    },
    defend: {
        frames: [[850, 345, 90, 80], [965, 345, 90, 80], [1060, 345, 90, 80]]
    },
    takeDamage: {
        frames: [
            [17, 459, 87, 72], [127, 459, 87, 72], [235, 459, 87, 72],
            [345, 459, 87, 72], [457, 459, 87, 72]
        ]
    },
    death: {
        frames: [
            [610, 455, 88, 82], [713, 455, 88, 82], [816, 455, 88, 82],
            [919, 455, 100, 82], [1023, 455, 120, 82]
        ]
    },
    jump: {
        frames: [
            [16, 573, 88, 76], [128, 573, 88, 76], [240, 573, 88, 76],
            [352, 573, 88, 76], [464, 573, 88, 76]
        ]
    },
    crouch: {
        frames: [[594, 573, 90, 76], [707, 573, 90, 76], [820, 573, 90, 76], [933, 573, 90, 76]]
    },
    interact: {
        frames: [[16, 677, 88, 78], [127, 677, 88, 78], [238, 677, 88, 78], [349, 677, 88, 78]]
    },
    carryItem: {
        frames: [[433, 677, 88, 78], [544, 677, 88, 78], [655, 677, 88, 78], [766, 677, 88, 78]]
    },
    useItem: {
        frames: [[822, 677, 64, 78], [930, 677, 64, 78], [1002, 677, 64, 78], [1072, 677, 64, 78]]
    }
};

const spiderAnimationFrameMap = {
    walkRight: {
        loop: true,
        frames: [
            [0, 42, 96, 98], [96, 42, 96, 98], [192, 42, 96, 98],
            [288, 42, 96, 98], [384, 42, 96, 98], [480, 42, 96, 98]
        ]
    },
    walkLeft: {
        loop: true,
        frames: [
            [600, 42, 92, 98], [692, 42, 92, 98], [784, 42, 92, 98],
            [876, 42, 92, 98], [968, 42, 92, 98], [1060, 42, 92, 98]
        ]
    },
    idle: {
        loop: true,
        frames: [
            [0, 184, 110, 96], [110, 184, 110, 96], [220, 184, 110, 96],
            [330, 184, 110, 96], [440, 184, 110, 96]
        ]
    },
    prepareJump: {
        frames: [
            [600, 184, 110, 96], [710, 184, 110, 96], [820, 184, 110, 96],
            [930, 184, 110, 96], [1040, 184, 110, 96]
        ]
    },
    jump: {
        frames: [
            [0, 328, 110, 106], [110, 328, 110, 106], [220, 328, 110, 106],
            [330, 328, 110, 106], [440, 328, 110, 106]
        ]
    },
    webAttack: {
        frames: [
            [600, 328, 92, 106], [692, 328, 92, 106],
            [784, 328, 92, 106], [968, 328, 92, 106]
        ]
    },
    takeDamage: {
        frames: [
            [0, 476, 110, 108], [110, 476, 110, 108], [220, 476, 110, 108],
            [330, 476, 110, 108], [440, 476, 110, 108]
        ]
    },
    dying: {
        frames: [
            [600, 476, 92, 108], [692, 476, 92, 108], [784, 476, 92, 108],
            [876, 476, 92, 108], [968, 476, 92, 108], [1060, 476, 92, 108]
        ]
    },
    deathExplosion: {
        frames: [
            [0, 624, 96, 144], [96, 624, 96, 144], [192, 624, 96, 144],
            [288, 624, 96, 144], [384, 624, 96, 144], [480, 624, 96, 144]
        ]
    },
    webEffects: {
        frames: [
            [600, 624, 110, 144], [710, 624, 110, 144], [820, 624, 110, 144],
            [930, 624, 110, 144], [1040, 624, 110, 144]
        ]
    },
    webProjectile: {
        frames: [[876, 328, 92, 106]]
    },
    webImpact: {
        frames: [[1060, 328, 92, 106]]
    }
};
const sootSpiderAnimationFrameMap = {
    walk: {
        loop: true,
        cropPaddingY: 12,
        frames: [
            [0, 32, 145, 73, 72, 73], [145, 32, 128, 73, 64, 73],
            [273, 32, 123, 73, 61, 73], [396, 32, 116, 73, 58, 73],
            [512, 32, 119, 73, 59, 73], [631, 32, 126, 73, 63, 73],
            [757, 32, 128, 73, 64, 73], [885, 32, 127, 73, 63, 73],
            [1012, 32, 140, 73, 70, 73]
        ]
    },
    run: {
        loop: true,
        cropPaddingY: 12,
        frames: [
            [0, 132, 173, 78, 98, 78], [173, 132, 144, 78, 72, 78],
            [317, 132, 138, 78, 69, 78], [455, 132, 143, 78, 71, 78],
            [598, 132, 143, 78, 71, 78], [741, 132, 147, 78, 73, 78],
            [888, 132, 160, 78, 80, 78]
        ]
    },
    attack: {
        cropPaddingY: 12,
        frames: [
            [0, 238, 143, 82, 71, 82], [143, 234, 138, 86, 69, 86],
            [281, 234, 125, 86, 62, 86], [406, 234, 122, 86, 61, 86],
            [528, 234, 141, 86, 70, 86], [669, 234, 152, 86, 76, 86],
            [821, 234, 141, 86, 70, 86], [962, 238, 142, 82, 71, 82]
        ]
    },
    jump: {
        cropPaddingY: 12,
        frames: [
            [0, 460, 145, 90, 72, 90], [145, 460, 138, 90, 69, 90],
            [283, 460, 150, 90, 75, 90], [433, 460, 145, 90, 72, 90],
            [578, 460, 162, 90, 81, 90], [740, 460, 133, 90, 66, 90],
            [873, 460, 125, 90, 62, 90], [998, 460, 130, 90, 65, 90]
        ]
    },
    spitWeb: {
        cropPaddingY: 12,
        frames: [
            [0, 350, 145, 82, 72, 82], [145, 350, 136, 82, 68, 82],
            [281, 350, 129, 82, 64, 82], [410, 350, 122, 82, 61, 82],
            [532, 350, 216, 82, 72, 82]
        ]
    },
    webProjectile: {
        cropPaddingY: 12,
        frames: [[668, 350, 82, 82]]
    },
    webImpact: {
        cropPaddingY: 12,
        frames: [[740, 335, 140, 97]]
    },
    webEffects: {
        cropPaddingY: 12,
        frames: [
            [740, 335, 140, 97, 70, 97],
            [880, 335, 144, 97, 72, 97],
            [1024, 335, 128, 97, 64, 97]
        ]
    },
    death: {
        cropPaddingY: 12,
        frames: [
            [0, 574, 148, 80, 74, 80], [148, 574, 145, 80, 72, 80],
            [293, 574, 141, 80, 70, 80], [434, 574, 137, 80, 68, 80],
            [571, 574, 134, 80, 67, 80], [705, 574, 151, 80, 75, 80],
            [856, 574, 149, 80, 74, 80], [1005, 594, 147, 66, 73, 66]
        ]
    },
    idle: {
        loop: true,
        cropPaddingY: 12,
        frames: [
            [0, 687, 140, 81, 70, 81], [140, 687, 132, 81, 66, 81],
            [272, 687, 135, 81, 67, 81], [407, 687, 125, 81, 62, 81],
            [532, 687, 118, 81, 59, 81], [650, 687, 126, 81, 63, 81],
            [776, 687, 126, 81, 63, 81], [902, 687, 130, 81, 65, 81],
            [1032, 687, 120, 81, 60, 81]
        ]
    }
};
const matriarchSpiderAnimationFrameMap = {
    walkRight: {
        loop: true,
        cropPaddingY: 12,
        frames: [
            [0, 312, 112, 80, 56, 80], [112, 312, 104, 80, 52, 80],
            [216, 312, 103, 80, 49, 80], [319, 312, 99, 80, 46, 80],
            [418, 312, 158, 80, 69, 80]
        ]
    },
    walkLeft: {
        loop: true,
        cropPaddingY: 12,
        frames: [
            [592, 312, 112, 80], [704, 312, 112, 80], [816, 312, 112, 80],
            [928, 312, 112, 80], [1040, 312, 112, 80]
        ]
    },
    idle: {
        loop: true,
        cropPaddingY: 12,
        frames: [
            [0, 410, 110, 67, 55, 67], [110, 410, 110, 67, 55, 67],
            [220, 410, 110, 67, 55, 67], [330, 410, 110, 67, 55, 67],
            [440, 410, 110, 67, 55, 67]
        ]
    },
    prepareJump: {
        cropPaddingY: 12,
        frames: [
            [592, 410, 112, 67, 56, 67], [704, 410, 112, 67, 56, 67],
            [816, 410, 112, 67, 56, 67], [928, 410, 112, 67, 56, 67],
            [1040, 410, 112, 67, 56, 67]
        ]
    },
    jump: {
        cropPaddingY: 12,
        frames: [
            [0, 502, 112, 68, 56, 68], [112, 502, 109, 68, 54, 68],
            [221, 502, 103, 68, 51, 68], [324, 502, 105, 68, 52, 68],
            [429, 502, 129, 68, 64, 68]
        ]
    },
    webAttack: {
        cropPaddingY: 12,
        frames: [
            [592, 500, 112, 70], [704, 500, 112, 70],
            [816, 500, 112, 70], [928, 500, 112, 70]
        ]
    },
    webProjectile: {
        cropPaddingY: 12,
        frames: [[1040, 500, 112, 70]]
    },
    webImpact: {
        cropPaddingY: 12,
        frames: [[592, 697, 102, 71]]
    },
    takeDamage: {
        cropPaddingY: 12,
        frames: [
            [0, 610, 116, 64, 58, 64], [116, 610, 116, 64, 58, 64],
            [232, 605, 116, 69, 58, 69], [348, 605, 116, 69, 58, 69],
            [464, 605, 116, 69, 58, 69]
        ]
    },
    dying: {
        cropPaddingY: 12,
        frames: [
            [592, 610, 92, 64, 46, 64], [684, 610, 92, 64, 46, 64],
            [776, 605, 92, 69, 46, 69], [868, 605, 92, 69, 46, 69],
            [960, 605, 92, 69, 46, 69], [1052, 605, 92, 69, 46, 69]
        ]
    },
    deathExplosion: {
        cropPaddingY: 12,
        frames: [
            [0, 690, 96, 78], [96, 690, 96, 78], [192, 690, 96, 78],
            [288, 690, 96, 78], [384, 690, 96, 78], [480, 690, 96, 78]
        ]
    },
    webEffects: {
        cropPaddingY: 12,
        frames: [
            [592, 697, 102, 71, 51, 71], [694, 697, 96, 71, 42, 71],
            [790, 697, 92, 71, 40, 71], [882, 697, 82, 71, 34, 71],
            [964, 697, 83, 71, 31, 71], [1037, 697, 115, 71, 15, 71]
        ]
    }
};
const spiderAnimationSpeedMultiplier = 0.672;
const animationFrameCropCache = new WeakMap();

function getAnimationFrameCrop(spriteSheet, animationFrameMap, animationName, frameIndex) {
    const animation = animationFrameMap[animationName];
    const frame = animation.frames[frameIndex];
    if (!spriteSheet.complete || spriteSheet.naturalWidth === 0) {
        return {
            x: frame[0],
            y: frame[1],
            width: frame[2],
            height: frame[3],
            offsetX: 0,
            offsetY: 0
        };
    }
    let crops = animationFrameCropCache.get(spriteSheet);
    if (!crops) {
        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = spriteSheet.naturalWidth;
        cropCanvas.height = spriteSheet.naturalHeight;
        const cropContext = cropCanvas.getContext('2d');
        cropContext.drawImage(spriteSheet, 0, 0);
        const pixels = cropContext.getImageData(
            0,
            0,
            cropCanvas.width,
            cropCanvas.height
        ).data;
        crops = Object.fromEntries(Object.entries(animationFrameMap).map(([name, animation]) => [
            name,
            animation.frames.map(([x, y, width, height]) => {
                const paddingY = animation.cropPaddingY || 0;
                const cropTop = Math.max(0, y - paddingY);
                const cropBottom = Math.min(cropCanvas.height, y + height + paddingY);
                let minX = x + width;
                let minY = cropBottom;
                let maxX = x - 1;
                let maxY = cropTop - 1;
                for (let sourceY = cropTop; sourceY < cropBottom; sourceY += 1) {
                    for (let sourceX = x; sourceX < x + width; sourceX += 1) {
                        const pixelOffset = (sourceY * cropCanvas.width + sourceX) * 4;
                        if (pixels[pixelOffset + 3] <= 16) {
                            continue;
                        }
                        if (sourceY < y) {
                            const red = pixels[pixelOffset];
                            const green = pixels[pixelOffset + 1];
                            const blue = pixels[pixelOffset + 2];
                            const isSheetLabel = (
                                red > 210 && green > 210 && blue > 210
                            ) || (blue > red * 1.35 && blue > green * 1.1);
                            if (isSheetLabel) {
                                continue;
                            }
                        }
                        minX = Math.min(minX, sourceX);
                        minY = Math.min(minY, sourceY);
                        maxX = Math.max(maxX, sourceX);
                        maxY = Math.max(maxY, sourceY);
                    }
                }
                if (maxX < minX || maxY < minY) {
                    return { x, y, width, height, offsetX: 0, offsetY: 0 };
                }
                return {
                    x: minX,
                    y: minY,
                    width: maxX - minX + 1,
                    height: maxY - minY + 1,
                    offsetX: minX - x,
                    offsetY: minY - y,
                    frameWidth: width,
                    frameHeight: height
                };
            })
        ]));
        animationFrameCropCache.set(spriteSheet, crops);
    }
    return crops[animationName][frameIndex];
}

function isVisualHitFlashActive(timer) {
    return timer > 0 && !reducedVisualEffects;
}

const entityShadowRows = [
    { inset: 5, offsetY: -1, alpha: 0.42 },
    { inset: 2, offsetY: 0, alpha: 0.72 },
    { inset: 0, offsetY: 1, alpha: 0.52 },
    { inset: 6, offsetY: 2, alpha: 0.28 }
];

function getPlayerAttackSpriteScale(character, frame) {
    const openingFrames = character === 'woman' ? 1 : 3;
    return frame < openingFrames
        ? playerAttackSpriteScale * playerAttackOpeningSpriteScale
        : playerAttackSpriteScale;
}

function drawSwordSprite(x, y, angle, scale = 1, isWoman = false) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(scale, scale);
    const bladeOutline = isWoman ? '#47364b' : '#263238';
    const bladeMetal = isWoman ? '#a9a4b7' : '#8b9b9d';
    const bladeLight = isWoman ? '#f1e8f5' : '#e5eee8';

    ctx.fillStyle = isWoman ? '#332437' : '#211a1a';
    ctx.fillRect(-5, -2, 3, 5);
    ctx.fillRect(-3, -3, 2, 7);
    ctx.fillRect(-2, -2, 3, 5);
    ctx.fillStyle = isWoman ? '#7a476e' : '#75452c';
    ctx.fillRect(-4, -1, 4, 3);
    ctx.fillStyle = isWoman ? '#c98caa' : '#b17b39';
    ctx.fillRect(-3, -1, 1, 1);
    ctx.fillRect(-1, 1, 1, 1);
    ctx.fillStyle = isWoman ? '#f1c8dd' : '#e5c875';
    ctx.fillRect(-5, -1, 1, 3);

    ctx.fillStyle = isWoman ? '#493348' : '#34251b';
    ctx.fillRect(0, -6, 3, 13);
    ctx.fillRect(2, -4, 2, 9);
    ctx.fillStyle = isWoman ? '#a96691' : '#9a7138';
    ctx.fillRect(0, -5, 2, 11);
    ctx.fillRect(2, -3, 2, 7);
    ctx.fillStyle = isWoman ? '#f1c8dd' : '#e8c96f';
    ctx.fillRect(1, -4, 1, 3);
    ctx.fillRect(2, 2, 1, 2);

    ctx.fillStyle = isWoman ? '#56374e' : '#49301d';
    ctx.fillRect(3, -2, 4, 5);
    ctx.fillRect(4, -4, 2, 2);
    ctx.fillRect(4, 3, 2, 2);
    ctx.fillStyle = isWoman ? '#e6b2cf' : '#d6b45e';
    ctx.fillRect(4, -1, 2, 3);
    ctx.fillRect(5, -3, 1, 2);
    ctx.fillRect(5, 3, 1, 2);
    if (isWoman) {
        ctx.fillStyle = '#fff0f7';
        ctx.fillRect(4, -1, 1, 1);
        ctx.fillRect(5, 0, 1, 1);
        ctx.fillStyle = '#df8fba';
        ctx.fillRect(5, -1, 1, 2);
        ctx.fillStyle = '#fff0c7';
        ctx.fillRect(6, -2, 1, 1);
        ctx.fillRect(6, 2, 1, 1        );
    }
    ctx.fillStyle = bladeOutline;
    ctx.fillRect(6, -3, 17, 7);
    ctx.fillRect(23, -2, 4, 5);
    ctx.fillRect(27, -1, 3, 3);
    ctx.fillRect(30, 0, 2, 1);
    ctx.fillStyle = bladeMetal;
    ctx.fillRect(7, -2, 16, 5);
    ctx.fillRect(23, -1, 4, 3);
    ctx.fillRect(27, 0, 3, 1);
    ctx.fillStyle = bladeLight;
    ctx.fillRect(8, -2, 13, 1);
    ctx.fillRect(23, -1, 3, 1);
    ctx.fillStyle = '#536970';
    ctx.fillRect(8, 1, 15, 1);
    ctx.fillRect(23, 0, 4, 1);
    ctx.fillStyle = '#c8d4ca';
    ctx.fillRect(9, 0, 14, 1);
    if (isWoman) {
        ctx.fillStyle = '#d9a6cf';
        ctx.fillRect(10, 1, 10, 1);
        ctx.fillStyle = '#fff4f8';
        ctx.fillRect(11, -1, 8, 1);
        ctx.fillStyle = '#f2c6df';
        ctx.fillRect(7, -3, 2, 1);
        ctx.fillRect(7, 2, 2, 1);
        ctx.fillRect(21, -1, 2, 1);
    }

    ctx.restore();
}

let susanoPixelCanvas = null;
const susanoPixelScale = 0.8;

function releaseSusanoPixelCanvas() {
    if (!susanoPixelCanvas) return;
    susanoPixelCanvas.width = 0;
    susanoPixelCanvas.height = 0;
    susanoPixelCanvas = null;
}

function drawPixelatedSusanoLayer(drawLayer) {
    if (!susanoPixelCanvas) {
        susanoPixelCanvas = document.createElement('canvas');
        susanoPixelCanvas.width = Math.ceil(canvas.width * susanoPixelScale);
        susanoPixelCanvas.height = Math.ceil(canvas.height * susanoPixelScale);
    }

    const pixelContext = susanoPixelCanvas.getContext('2d');
    pixelContext.setTransform(1, 0, 0, 1, 0, 0);
    pixelContext.clearRect(0, 0, susanoPixelCanvas.width, susanoPixelCanvas.height);
    const originalContext = ctx;
    const transform = originalContext.getTransform();
    pixelContext.setTransform(
        transform.a * susanoPixelScale,
        transform.b * susanoPixelScale,
        transform.c * susanoPixelScale,
        transform.d * susanoPixelScale,
        transform.e * susanoPixelScale,
        transform.f * susanoPixelScale
    );

    try {
        ctx = pixelContext;
        drawLayer();
    } finally {
        ctx = originalContext;
    }

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(susanoPixelCanvas, 0, 0, canvas.width, canvas.height);
    ctx.restore();
}

function drawSusanoSpirit(centerX, centerY) {
    if (!susanoSpiritSprite.complete || susanoSpiritSprite.naturalWidth === 0) return;

    ctx.save();
    ctx.globalAlpha = 0.58 + Math.sin(player.animTime * 2.4) * 0.025;
    const width = 146;
    const height = width * susanoSpiritSprite.naturalHeight / susanoSpiritSprite.naturalWidth;
    ctx.drawImage(susanoSpiritSprite, centerX - width / 2, centerY - height / 2, width, height);

    ctx.restore();
}

let playerAuraFrameBottoms = null;
let spritePixelReadWarningShown = false;

function readSpritePixelData(context, width, height) {
    try {
        return context.getImageData(0, 0, width, height).data;
    } catch (error) {
        if (error.name !== 'SecurityError') {
            throw error;
        }
        if (!spritePixelReadWarningShown) {
            console.warn('O navegador bloqueou a leitura de pixels de um sprite; o jogo usará os limites dos quadros.');
            spritePixelReadWarningShown = true;
        }
        return null;
    }
}

function getSpriteFrameGridBounds(sheet, rowCount, columnCount, rowCrops) {
    const frameWidth = sheet.naturalWidth / columnCount;
    const frameHeight = sheet.naturalHeight / rowCount;
    return Array.from({ length: rowCount }, (_, row) => (
        Array.from({ length: columnCount }, (_, column) => {
            const crop = rowCrops[row];
            const frameLeft = column * frameWidth;
            const frameTop = row * frameHeight;
            const left = Math.floor(frameLeft + crop.left * frameWidth);
            const right = Math.ceil(frameLeft + crop.right * frameWidth);
            const top = Math.floor(frameTop + crop.top * frameHeight);
            const bottom = Math.ceil(frameTop + crop.bottom * frameHeight);
            return {
                x: left,
                y: top,
                width: right - left,
                height: bottom - top
            };
        })
    ));
}

function getPlayerAuraFrameBottoms() {
    if (playerAuraFrameBottoms) {
        return playerAuraFrameBottoms;
    }

    const frameWidth = playerAuraSprite.naturalWidth / 4;
    const frameHeight = playerAuraSprite.naturalHeight / 2;
    const boundsCanvas = document.createElement('canvas');
    boundsCanvas.width = playerAuraSprite.naturalWidth;
    boundsCanvas.height = playerAuraSprite.naturalHeight;
    const boundsContext = boundsCanvas.getContext('2d', { willReadFrequently: true });
    boundsContext.drawImage(playerAuraSprite, 0, 0);
    const alpha = readSpritePixelData(boundsContext, boundsCanvas.width, boundsCanvas.height);
    if (!alpha) {
        playerAuraFrameBottoms = Array(8).fill(frameHeight);
        return playerAuraFrameBottoms;
    }

    playerAuraFrameBottoms = Array.from({ length: 8 }, (_, frameIndex) => {
        const column = frameIndex % 4;
        const row = Math.floor(frameIndex / 4);
        const left = Math.floor(column * frameWidth);
        const right = Math.ceil((column + 1) * frameWidth);
        const top = Math.floor(row * frameHeight);
        const bottom = Math.ceil((row + 1) * frameHeight);
        let visibleBottom = top;

        for (let y = top; y < bottom; y++) {
            for (let x = left; x < right; x++) {
                if (alpha[(y * boundsCanvas.width + x) * 4 + 3] > 32) {
                    visibleBottom = y + 1;
                }
            }
        }

        return visibleBottom - top;
    });
    return playerAuraFrameBottoms;
}

function drawPlayerAura(centerX, bottomY) {
    if (!playerAuraSprite.complete || playerAuraSprite.naturalWidth === 0) return;

    const frameWidth = playerAuraSprite.naturalWidth / 4;
    const frameHeight = playerAuraSprite.naturalHeight / 2;
    const width = 58.19;
    const height = width * frameHeight / frameWidth;
    const pulse = 0.82 + Math.sin(player.animTime * 4) * 0.08;
    const frameIndex = player.conquestAuraTier - 1;
    const visibleFrameBottom = getPlayerAuraFrameBottoms()[frameIndex];
    const destinationY = bottomY - visibleFrameBottom / frameHeight * height;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = pulse;
    ctx.drawImage(
        playerAuraSprite,
        (frameIndex % 4) * frameWidth,
        Math.floor(frameIndex / 4) * frameHeight,
        frameWidth,
        frameHeight,
        centerX - width / 2,
        destinationY,
        width,
        height
    );
    ctx.restore();
}

function getPlayerHealthBarRatio() {
    return Math.max(0, Math.min(1, player.health / player.maxHealth));
}

function drawPlayerHealthBar() {
    const centerX = player.x + player.size / 2;
    const centerY = player.y + player.size / 2;
    const width = 22;
    const height = 3;
    const x = Math.round(centerX - width / 2);
    const y = Math.round(centerY - Math.max(12, (player.collisionHeight || player.size) / 2) - 5);
    const ratio = getPlayerHealthBarRatio();
    const fillWidth = Math.round((width - 2) * ratio);
    const fillColor = ratio <= 0.25 ? '#ef5350' : ratio <= 0.5 ? '#ffd54f' : '#66d17a';

    ctx.fillStyle = 'rgba(10, 12, 14, 0.9)';
    ctx.fillRect(x - 1, y - 1, width + 2, height + 2);
    ctx.fillStyle = '#303438';
    ctx.fillRect(x, y, width, height);
    if (fillWidth > 0) {
        ctx.fillStyle = fillColor;
        ctx.fillRect(x + 1, y + 1, fillWidth, height - 2);
    }
}

function drawEntityShadow(centerX, groundY, width, opacity) {
    const alignedCenterX = Math.round(centerX * renderPixelScale) / renderPixelScale;
    const alignedGroundY = Math.round(groundY * renderPixelScale) / renderPixelScale;
    for (const row of entityShadowRows) {
        const rowWidth = Math.max(
            4 / renderPixelScale,
            Math.round((width - row.inset * 2) * renderPixelScale) / renderPixelScale
        );
        ctx.fillStyle = `rgba(3, 4, 7, ${opacity * row.alpha})`;
        ctx.fillRect(
            Math.round((alignedCenterX - rowWidth / 2) * renderPixelScale) / renderPixelScale,
            alignedGroundY + row.offsetY / renderPixelScale,
            rowWidth,
            1 / renderPixelScale
        );
    }
}

function drawPlayer() {
    drawEntityShadow(
        player.x + player.size / 2,
        player.y + player.size - 1,
        player.size * 1.35,
        0.3
    );
    const step = player.moving ? Math.sin(player.animTime * 14) : 0;
    const bob = Math.abs(step) > 0.55 ? -0.4 : 0;
    const leftStep = step > 0.25 ? 1 : 0;
    const rightStep = step < -0.25 ? 1 : 0;
    const weaponBob = Math.sin(player.animTime * 9) * (player.moving ? 1 : 0.5);
    const isWoman = player.character === 'woman';
    if (player.susanoActive) {
        const centerX = player.x + player.size / 2;
        const centerY = player.y + player.size / 2;
        drawPixelatedSusanoLayer(() => drawSusanoSpirit(centerX, centerY));
    }
    if (player.counterAttackTimer > 0) {
        ctx.strokeStyle = `rgba(183, 239, 244, ${0.3 + player.counterAttackTimer * 0.45})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(
            player.x + player.size / 2,
            player.y + player.size / 2,
            12 + player.counterAttackTimer * 2,
            0,
            Math.PI * 2
        );
        ctx.stroke();
    }
    if (player.dashActive) {
        const centerX = player.x + player.size / 2;
        const centerY = player.y + player.size / 2;
        ctx.save();
        ctx.globalAlpha = Math.min(0.65, player.dashTimer / player.dashDuration);
        ctx.strokeStyle = '#b9e8e8';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(
            centerX - player.dashDirectionX * 24,
            centerY - player.dashDirectionY * 24
        );
        ctx.lineTo(centerX, centerY);
        ctx.stroke();
        ctx.restore();
    }
    const dodgeProgress = player.dodgeTimer > 0
        ? 1 - player.dodgeTimer / 0.34
        : 0;
    if (player.dodgeTimer > 0) {
        const centerX = player.x + player.size / 2;
        const centerY = player.y + player.size / 2;
        const trailX = -player.dodgeDirectionX;
        const trailY = -player.dodgeDirectionY;
        ctx.save();
        ctx.globalAlpha = 0.45 * (1 - dodgeProgress);
        ctx.fillStyle = '#a8dce0';
        ctx.fillRect(centerX + trailX * 7 - 2, centerY + trailY * 7 - 1, 4, 2);
        ctx.globalAlpha = 0.25 * (1 - dodgeProgress);
        ctx.fillRect(centerX + trailX * 12 - 1, centerY + trailY * 12, 3, 1);
        ctx.restore();
    }
    ctx.save();
    ctx.translate(
        Math.round((player.x + player.size / 2 + player.dodgeDirectionX * dodgeProgress * 4) * renderPixelScale) / renderPixelScale,
        Math.round((player.y + player.size / 2 + bob + player.dodgeDirectionY * dodgeProgress * 4) * renderPixelScale) / renderPixelScale
    );
    ctx.scale(player.spriteFacingX, 1);
    ctx.scale(isWoman ? 1.1 : 1, isWoman ? 1.1 : 1);
    if (player.dodgeTimer > 0) {
        ctx.scale(1.08, 0.9);
    }
    if (player.dashActive) {
        ctx.scale(1.2, 0.85);
    }
    const x = -7;
    const y = -7;

    if (!isWoman && !(malePlayerAnimationSheet.complete && malePlayerAnimationSheet.naturalWidth > 0)) {
        ctx.beginPath();
        ctx.moveTo(x + 4, y + 1);
        ctx.lineTo(x + 10, y + 1);
        ctx.lineTo(x + 12, y + 3);
        ctx.lineTo(x + 12, y + 6);
        ctx.lineTo(x + 14, y + 7);
        ctx.lineTo(x + 13, y + 11);
        ctx.lineTo(x + 11, y + 13);
        ctx.lineTo(x + 11, y + 15);
        ctx.lineTo(x + 9, y + 16);
        ctx.lineTo(x + 8, y + 14);
        ctx.lineTo(x + 6, y + 16);
        ctx.lineTo(x + 4, y + 15);
        ctx.lineTo(x + 4, y + 13);
        ctx.lineTo(x + 2, y + 11);
        ctx.lineTo(x + 1, y + 8);
        ctx.lineTo(x + 3, y + 6);
        ctx.lineTo(x + 3, y + 3);
        ctx.closePath();
        ctx.clip();
    }

    if (isWoman) {
        if (femalePlayerAnimationSheet.complete && femalePlayerAnimationSheet.naturalWidth > 0) {
            const isSwordAttack = swordEquipped && player.attackTimer > 0;
            const row = isSwordAttack ? 1 : 0;
            const frame = isSwordAttack
                ? Math.min(13, Math.floor(
                    (1 - player.attackTimer / playerAttackAnimationDuration) * 14
                ))
                : player.moving
                    ? Math.floor(player.animTime * 10) % 14
                    : 0;
            const bounds = getFemalePlayerAnimationFrameBounds()[row][frame];
            const attackScale = isSwordAttack
                ? getPlayerAttackSpriteScale('woman', frame)
                : 1;
            const spriteHeight = femalePlayerSpriteHeight * attackScale;
            const spriteWidth = bounds.width / bounds.height * spriteHeight;
            ctx.drawImage(
                femalePlayerAnimationSheet,
                bounds.x,
                bounds.y,
                bounds.width,
                bounds.height,
                -spriteWidth / 2,
                -spriteHeight / 2,
                spriteWidth,
                spriteHeight
            );
        } else {
            drawFemalePlayerSprite(x, y, leftStep, rightStep);
        }
    } else if (malePlayerAnimationSheet.complete && malePlayerAnimationSheet.naturalWidth > 0) {
        const isSwordAttack = swordEquipped && player.maleAttackAnimationTimer > 0;
        const useNewSwordAttack = isSwordAttack
            && playerAttackAnimationSheet.complete
            && playerAttackAnimationSheet.naturalWidth > 0;
        const row = isSwordAttack ? 1 : 0;
        const frame = useNewSwordAttack
            ? Math.min(
                playerAttackAnimationFrameCount - 1,
                Math.floor(
                    (1 - player.maleAttackAnimationTimer / maleAttackAnimationDuration)
                    * playerAttackAnimationFrameCount
                )
            )
            : isSwordAttack
                ? Math.min(
                    13,
                    Math.floor(
                        (1 - player.maleAttackAnimationTimer / maleAttackAnimationDuration) * 14
                    )
                )
            : player.moving
                ? Math.floor(player.animTime * 5) % 14
                : 0;
        const spriteHeight = player.collisionHeight || 28;
        const attackScale = isSwordAttack
            ? getPlayerAttackSpriteScale('man', frame)
            : 1;
        if (useNewSwordAttack) {
            const bounds = getPlayerAttackAnimationFrameBounds()[frame];
            const sourceWidth = bounds.sourceRight - bounds.sourceX;
            const sourceHeight = bounds.sourceBottom - bounds.sourceY;
            const scale = spriteHeight / bounds.bodyHeight * attackScale;
            const bodyCenterX = bounds.bodyX + bounds.bodyWidth / 2 - bounds.sourceX;
            const bodyCenterY = bounds.bodyY + bounds.bodyHeight / 2 - bounds.sourceY;
            ctx.drawImage(
                playerAttackAnimationSheet,
                bounds.sourceX,
                bounds.sourceY,
                sourceWidth,
                sourceHeight,
                -bodyCenterX * scale,
                -bodyCenterY * scale,
                sourceWidth * scale,
                sourceHeight * scale
            );
        } else if (isSwordAttack) {
            const bounds = getMalePlayerAnimationFrameBounds()[row][frame];
            const frameWidth = malePlayerAnimationSheet.naturalWidth / 14;
            const frameHeight = malePlayerAnimationSheet.naturalHeight / 2;
            const sourceX = Math.floor(frame * frameWidth);
            const sourceY = row * frameHeight;
            const sourceRight = Math.ceil((frame + 1) * frameWidth);
            const scale = spriteHeight / bounds.height * attackScale;
            const bodyCenterX = bounds.x - sourceX + bounds.width / 2;
            const bodyCenterY = bounds.y - sourceY + bounds.height / 2;
            ctx.drawImage(
                malePlayerAnimationSheet,
                sourceX,
                sourceY,
                sourceRight - sourceX,
                frameHeight,
                -bodyCenterX * scale,
                -bodyCenterY * scale,
                (sourceRight - sourceX) * scale,
                frameHeight * scale
            );
        } else {
            const bounds = getMalePlayerAnimationFrameBounds()[row][frame];
            const spriteWidth = bounds.width / bounds.height * spriteHeight;
            ctx.drawImage(
                malePlayerAnimationSheet,
                bounds.x,
                bounds.y,
                bounds.width,
                bounds.height,
                -spriteWidth / 2,
                -spriteHeight / 2,
                spriteWidth,
                spriteHeight
            );
        }
    } else {
    ctx.fillStyle = '#120f0d';
    ctx.fillRect(x + 3, y + 14, 8, 1);

    ctx.fillStyle = isWoman ? '#704515' : '#35231c';
    ctx.fillRect(x + 4, y + 1, 6, 1);
    ctx.fillRect(x + 2, y + 2, 10, 2);
    ctx.fillRect(x + 1, y + 4, 2, 3);
    ctx.fillRect(x + 11, y + 4, 2, 3);
    ctx.fillRect(x + 3, y + 7, 2, 1);
    ctx.fillRect(x + 10, y + 7, 2, 1);
    ctx.fillStyle = isWoman ? '#c18a32' : '#70412b';
    ctx.fillRect(x + 5, y + 2, 5, 1);
    ctx.fillRect(x + 3, y + 3, 3, 2);
    ctx.fillRect(x + 9, y + 3, 2, 2);
    ctx.fillRect(x + 2, y + 5, 1, 2);
    ctx.fillRect(x + 11, y + 5, 1, 2);
    ctx.fillStyle = isWoman ? '#f3cf61' : '#a97943';
    ctx.fillRect(x + 4, y + 2, 3, 1);
    ctx.fillRect(x + 9, y + 3, 2, 1);
    ctx.fillStyle = isWoman ? '#f0c654' : '#a9673e';
    ctx.fillRect(x + 4, y + 3, 3, 1);
    ctx.fillRect(x + 8, y + 2, 2, 1);
    ctx.fillStyle = isWoman ? '#ffe083' : '#9b6240';
    ctx.fillRect(x + 3, y + 4, 1, 2);
    ctx.fillRect(x + 9, y + 2, 1, 1);
    ctx.fillStyle = isWoman ? '#d99d3d' : '#513025';
    ctx.fillRect(x + 2, y + 4, 1, 2);
    ctx.fillRect(x + 10, y + 3, 1, 1);

    ctx.fillStyle = '#9a6547';
    ctx.fillRect(x + 4, y + 4, 7, 3);
    ctx.fillStyle = '#d9a77b';
    ctx.fillRect(x + 5, y + 4, 5, 3);
    ctx.fillRect(x + 6, y + 7, 3, 1);
    ctx.fillStyle = '#f0c49a';
    ctx.fillRect(x + 6, y + 4, 3, 1);
    ctx.fillStyle = '#754638';
    ctx.fillRect(x + 4, y + 6, 1, 1);
    ctx.fillRect(x + 10, y + 6, 1, 1);
    ctx.fillStyle = '#493026';
    ctx.fillRect(x + 5, y + 5, 1, 1);
    ctx.fillRect(x + 9, y + 5, 1, 1);
    ctx.fillStyle = '#ead2a6';
    ctx.fillRect(x + 6, y + 5, 1, 1);
    ctx.fillRect(x + 10, y + 5, 1, 1);
    ctx.fillStyle = '#b77957';
    ctx.fillRect(x + 7, y + 6, 1, 1);
    ctx.fillStyle = '#694034';
    ctx.fillRect(x + 6, y + 7, 4, 1);
    ctx.fillStyle = '#db997d';
    ctx.fillRect(x + 7, y + 7, 2, 1);
    ctx.fillStyle = '#fff0c7';
    ctx.fillRect(x + 6, y + 4, 2, 1);
    ctx.fillStyle = '#593b2c';
    ctx.fillRect(x + 5, y + 5, 1, 1);
    ctx.fillRect(x + 9, y + 5, 1, 1);
    ctx.fillStyle = '#bd785d';
    ctx.fillRect(x + 4, y + 6, 1, 1);
    ctx.fillRect(x + 10, y + 6, 1, 1);
    ctx.fillStyle = '#f2c494';
    ctx.fillRect(x + 7, y + 6, 1, 1);

    if (isWoman) {
        ctx.fillStyle = '#704515';
        ctx.fillRect(x + 3, y + 5, 2, 4);
        ctx.fillRect(x + 10, y + 5, 2, 4);
        ctx.fillRect(x + 2, y + 7, 2, 2);
        ctx.fillRect(x + 11, y + 7, 2, 2);
        ctx.fillStyle = '#c18a32';
        ctx.fillRect(x + 3, y + 6, 1, 2);
        ctx.fillRect(x + 11, y + 6, 1, 2);
        ctx.fillStyle = '#f0c654';
        ctx.fillRect(x + 10, y + 2, 2, 1);
        ctx.fillRect(x + 4, y + 3, 2, 1);
    }

    ctx.fillStyle = '#343a32';
    ctx.fillRect(x + 2, y + 7, 3, 4);
    ctx.fillRect(x + 10, y + 7, 3, 4);
    ctx.fillStyle = '#566448';
    ctx.fillRect(x + 4, y + 8, 7, 4);
    ctx.fillStyle = '#75835b';
    ctx.fillRect(x + 5, y + 8, 2, 2);
    ctx.fillRect(x + 9, y + 8, 1, 2);
    ctx.fillStyle = '#394638';
    ctx.fillRect(x + 7, y + 8, 1, 3);
    ctx.fillStyle = '#9b7544';
    ctx.fillRect(x + 3, y + 9, 2, 2);
    ctx.fillStyle = '#c8a15e';
    ctx.fillRect(x + 4, y + 9, 1, 1);
    ctx.fillStyle = '#c29a52';
    ctx.fillRect(x + 5, y + 11, 6, 1);
    ctx.fillStyle = '#ecd17d';
    ctx.fillRect(x + 7, y + 11, 2, 1);
    ctx.fillStyle = '#29342e';
    ctx.fillRect(x + 4, y + 8, 1, 2);
    ctx.fillRect(x + 10, y + 8, 1, 2);
    ctx.fillStyle = '#a9b27a';
    ctx.fillRect(x + 5, y + 9, 1, 1);
    ctx.fillRect(x + 9, y + 9, 1, 1);
    ctx.fillStyle = '#f0d789';
    ctx.fillRect(x + 6, y + 11, 1, 1);
    ctx.fillRect(x + 9, y + 11, 1, 1);
    ctx.fillStyle = '#303a31';
    ctx.fillRect(x + 4, y + 8, 1, 3);
    ctx.fillRect(x + 10, y + 8, 1, 3);
    ctx.fillStyle = '#91a16d';
    ctx.fillRect(x + 5, y + 8, 1, 1);
    ctx.fillRect(x + 9, y + 8, 1, 1);
    ctx.fillStyle = '#d6b66a';
    ctx.fillRect(x + 6, y + 10, 1, 1);
    ctx.fillRect(x + 8, y + 10, 1, 1);
    ctx.fillStyle = '#45352a';
    ctx.fillRect(x + 4, y + 12, 8, 1);
    ctx.fillStyle = '#d5ae5e';
    ctx.fillRect(x + 6, y + 12, 4, 1);
    ctx.fillStyle = '#f4df9a';
    ctx.fillRect(x + 7, y + 12, 1, 1);

    if (isWoman) {
        ctx.fillStyle = '#55243f';
        ctx.fillRect(x + 3, y + 8, 2, 3);
        ctx.fillRect(x + 10, y + 8, 2, 3);
        ctx.fillStyle = '#a33b68';
        ctx.fillRect(x + 4, y + 8, 7, 4);
        ctx.fillRect(x + 5, y + 7, 5, 1);
        ctx.fillStyle = '#d96b91';
        ctx.fillRect(x + 5, y + 8, 2, 2);
        ctx.fillRect(x + 8, y + 9, 2, 2);
        ctx.fillStyle = '#f2c66d';
        ctx.fillRect(x + 7, y + 9, 1, 3);
        ctx.fillRect(x + 5, y + 11, 5, 1);
        ctx.fillStyle = '#783555';
        ctx.fillRect(x + 4, y + 12, 8, 2);
        ctx.fillRect(x + 3, y + 13, 10, 1);
        ctx.fillStyle = '#c14d79';
        ctx.fillRect(x + 5, y + 12, 6, 1);
        ctx.fillRect(x + 4, y + 13, 2, 1);
        ctx.fillRect(x + 10, y + 13, 2, 1);
        ctx.fillStyle = '#f2c66d';
        ctx.fillRect(x + 7, y + 12, 1, 2);

        ctx.fillStyle = '#704515';
        ctx.fillRect(x + 3, y + 5, 2, 4);
        ctx.fillRect(x + 10, y + 5, 2, 4);
        ctx.fillRect(x + 2, y + 7, 2, 2);
        ctx.fillRect(x + 11, y + 7, 2, 2);
        ctx.fillStyle = '#c18a32';
        ctx.fillRect(x + 3, y + 6, 1, 2);
        ctx.fillRect(x + 11, y + 6, 1, 2);
        ctx.fillStyle = '#f0c654';
        ctx.fillRect(x + 10, y + 2, 2, 1);
        ctx.fillRect(x + 4, y + 3, 2, 1);
    }

    if (!isWoman) {
        ctx.fillStyle = '#343b31';
        ctx.fillRect(x + 5, y + 8, 1, 3);
        ctx.fillRect(x + 6, y + 9, 1, 2);
        ctx.fillStyle = '#a06f3f';
        ctx.fillRect(x + 5, y + 8, 1, 1);
        ctx.fillRect(x + 6, y + 9, 1, 1);
        ctx.fillStyle = '#dbb766';
        ctx.fillRect(x + 7, y + 9, 2, 2);
        ctx.fillStyle = '#f4df9a';
        ctx.fillRect(x + 7, y + 9, 1, 1);
        ctx.fillStyle = '#c08b50';
        ctx.fillRect(x + 2, y + 8, 2, 2);
        ctx.fillRect(x + 11, y + 8, 2, 2);
        ctx.fillStyle = '#e4c27d';
        ctx.fillRect(x + 2, y + 8, 1, 1);
        ctx.fillRect(x + 12, y + 8, 1, 1);
    }

    ctx.fillStyle = '#30342f';
    ctx.fillRect(x + 5, y + 12 + leftStep, 2, 1);
    ctx.fillRect(x + 9, y + 12 + rightStep, 2, 1);
    ctx.fillStyle = '#526044';
    ctx.fillRect(x + 5, y + 13 + leftStep, 2, 1);
    ctx.fillRect(x + 9, y + 13 + rightStep, 2, 1);
    ctx.fillStyle = '#704a2c';
    ctx.fillRect(x + 4, y + 14 + leftStep, 4, 1);
    ctx.fillRect(x + 8, y + 14 + rightStep, 4, 1);
    ctx.fillStyle = '#bd8b4f';
    ctx.fillRect(x + 5, y + 14 + leftStep, 2, 1);
    ctx.fillRect(x + 9, y + 14 + rightStep, 2, 1);
    ctx.fillStyle = '#d9c28b';
    ctx.fillRect(x + 5, y + 13 + leftStep, 1, 1);
    ctx.fillRect(x + 9, y + 13 + rightStep, 1, 1);

    if (isWoman) {
        ctx.fillStyle = '#55243f';
        ctx.fillRect(x + 4, y + 11, 8, 1);
        ctx.fillRect(x + 3, y + 12, 10, 2);
        ctx.fillStyle = '#a33b68';
        ctx.fillRect(x + 5, y + 11, 6, 1);
        ctx.fillRect(x + 4, y + 12, 2, 1);
        ctx.fillRect(x + 10, y + 12, 2, 1);
        ctx.fillStyle = '#d96b91';
        ctx.fillRect(x + 5, y + 12, 1, 1);
        ctx.fillRect(x + 9, y + 12, 1, 1);
        ctx.fillStyle = '#f2c66d';
        ctx.fillRect(x + 7, y + 11, 1, 3);
        ctx.fillRect(x + 4, y + 13, 2, 1);
        ctx.fillRect(x + 10, y + 13, 2, 1);
        ctx.fillStyle = '#45251f';
        ctx.fillRect(x + 4, y + 14 + leftStep, 4, 1);
        ctx.fillRect(x + 8, y + 14 + rightStep, 4, 1);
        ctx.fillStyle = '#bd8b4f';
        ctx.fillRect(x + 5, y + 14 + leftStep, 2, 1);
        ctx.fillRect(x + 9, y + 14 + rightStep, 2, 1);
    }

    if (gearOwned.armor) {
        ctx.fillStyle = '#26343a';
        ctx.fillRect(x + 4, y + 7, 2, 2);
        ctx.fillRect(x + 10, y + 7, 2, 2);
        ctx.fillRect(x + 5, y + 8, 6, 4);
        ctx.fillRect(x + 5, y + 11, 6, 1);
        ctx.fillStyle = '#657c80';
        ctx.fillRect(x + 4, y + 7, 1, 1);
        ctx.fillRect(x + 11, y + 7, 1, 1);
        ctx.fillRect(x + 6, y + 8, 4, 3);
        ctx.fillRect(x + 5, y + 9, 1, 2);
        ctx.fillRect(x + 10, y + 9, 1, 2);
        ctx.fillStyle = '#b8c9bb';
        ctx.fillRect(x + 4, y + 7, 1, 1);
        ctx.fillRect(x + 6, y + 8, 4, 1);
        ctx.fillRect(x + 5, y + 9, 1, 2);
        ctx.fillRect(x + 10, y + 9, 1, 2);
        ctx.fillStyle = '#d8d6be';
        ctx.fillRect(x + 7, y + 8, 2, 2);
        ctx.fillStyle = '#d4a64f';
        ctx.fillRect(x + 7, y + 10, 2, 2);
        ctx.fillRect(x + 6, y + 12, 4, 1);
        ctx.fillStyle = '#8f6635';
        ctx.fillRect(x + 8, y + 10, 1, 2);
    }
    }

    ctx.restore();

    const auraCenterX = Math.round(
        (player.x + player.size / 2 + player.dodgeDirectionX * dodgeProgress * 4) * renderPixelScale
    ) / renderPixelScale;
    if (scrollInventory.conquista > 0 && player.conquestAuraTier > 0) {
        const collisionBounds = getCollisionBounds(player);
        drawPlayerAura(
            auraCenterX,
            collisionBounds.bottom + (player.collisionHeight || player.size) * 0.2
        );
    }

    if (bowOwned && !swordEquipped) {
        drawPlayerBow(bob);
    }

    if (shieldBlocking && gearOwned.shield) {
        const angle = Math.atan2(player.facingY, player.facingX);
        ctx.save();
        ctx.translate(
            player.x + player.size / 2,
            player.y + player.size / 2
        );
        ctx.rotate(angle);
        ctx.fillStyle = '#1d282c';
        ctx.fillRect(8, -6, 7, 8);
        ctx.fillRect(9, 2, 5, 2);
        ctx.fillRect(10, 4, 3, 2);
        ctx.fillRect(11, 6, 1, 1);
        ctx.fillStyle = '#9b6135';
        ctx.fillRect(9, -5, 5, 7);
        ctx.fillRect(10, 2, 3, 2);
        ctx.fillRect(11, 4, 1, 1);
        ctx.fillStyle = '#4d7780';
        ctx.fillRect(10, -5, 3, 6);
        ctx.fillRect(11, 1, 2, 2);
        ctx.fillRect(11, 3, 1, 1);
        ctx.fillStyle = '#a9c7bd';
        ctx.fillRect(10, -5, 1, 5);
        ctx.fillRect(11, 1, 1, 2);
        ctx.fillStyle = '#e3c36b';
        ctx.fillRect(12, -3, 2, 2);
        ctx.fillRect(11, -2, 3, 1);
        ctx.fillStyle = '#f4e3a0';
        ctx.fillRect(12, -3, 1, 1);
        ctx.restore();
    }
    if (player.poisonTimer > 0) {
        drawToxicSmoke(
            player.x + player.size / 2,
            player.y + player.size / 2,
            player.animTime
        );
    }
    if (player.burnTimer > 0) {
        const centerX = player.x + player.size / 2;
        const centerY = player.y + player.size / 2;
        ctx.save();
        ctx.globalAlpha = 0.55 + Math.sin(player.animTime * 18) * 0.2;
        ctx.fillStyle = '#f27132';
        ctx.fillRect(centerX - 10, centerY - 5, 2, 4);
        ctx.fillRect(centerX + 7, centerY + 1, 2, 4);
        ctx.fillStyle = '#ffd06a';
        ctx.fillRect(centerX - 9, centerY - 7, 1, 3);
        ctx.fillRect(centerX + 8, centerY - 3, 1, 3);
        ctx.restore();
    }
    drawPlayerHealthBar();
}

function drawToxicSmoke(centerX, centerY, animTime) {
    const puffs = [
        { phase: 0, offsetX: -9, scale: 1.05 },
        { phase: 0.125, offsetX: 6, scale: 1.2 },
        { phase: 0.25, offsetX: 11, scale: 0.95 },
        { phase: 0.375, offsetX: -4, scale: 1.25 },
        { phase: 0.5, offsetX: -11, scale: 1.1 },
        { phase: 0.625, offsetX: 4, scale: 1.3 },
        { phase: 0.75, offsetX: 9, scale: 1 },
        { phase: 0.875, offsetX: -5, scale: 1.15 }
    ];
    const pixelPattern = [
        [-2, 0], [-1, -1], [0, -1], [1, -1], [2, 0],
        [-1, 0], [0, 0], [1, 0], [-1, 1], [0, 1]
    ];
    const cycle = (animTime * 0.72) % 1;

    ctx.save();
    for (const [index, puff] of puffs.entries()) {
        const progress = (cycle + puff.phase) % 1;
        const drift = Math.sin(animTime * 2.7 + puff.phase * 9) * 3;
        const pixelSize = Math.max(2, Math.round((2 + progress * 1.5) * puff.scale));
        const x = Math.round((centerX + puff.offsetX + drift) / pixelSize) * pixelSize;
        const y = Math.round((centerY + 8 - progress * 30) / pixelSize) * pixelSize;
        const opacity = Math.sin(progress * Math.PI) * (index % 2 === 0 ? 0.48 : 0.38);
        for (const [pixelIndex, [offsetX, offsetY]] of pixelPattern.entries()) {
            const pixelX = x + offsetX * pixelSize;
            const pixelY = y + offsetY * pixelSize;
            ctx.fillStyle = pixelIndex % 4 === 0
                ? `rgba(190, 218, 103, ${opacity * 0.58})`
                : `rgba(76, 126, 47, ${opacity})`;
            ctx.fillRect(pixelX, pixelY, pixelSize, pixelSize);
        }
    }
    ctx.restore();
}

function drawPlayerBow(bob) {
    const angle = Math.atan2(player.facingY, player.facingX);
    ctx.save();
    ctx.translate(
        player.x + player.size / 2 + player.facingX * 7,
        player.y + player.size / 2 + bob + player.facingY * 7
    );
    ctx.rotate(angle + Math.PI / 2);
    ctx.scale(1.5, 1.5);
    ctx.fillStyle = '#38251d';
    ctx.fillRect(-1, -7, 2, 2);
    ctx.fillRect(-2, -5, 2, 2);
    ctx.fillRect(-3, -3, 2, 2);
    ctx.fillRect(-3, -1, 2, 2);
    ctx.fillRect(-3, 1, 2, 2);
    ctx.fillRect(-2, 3, 2, 2);
    ctx.fillRect(-1, 5, 2, 2);
    ctx.fillStyle = '#b8733f';
    ctx.fillRect(0, -6, 1, 2);
    ctx.fillRect(-1, -4, 1, 2);
    ctx.fillRect(-2, -2, 1, 4);
    ctx.fillRect(-1, 2, 1, 2);
    ctx.fillRect(0, 4, 1, 2);
    ctx.fillStyle = '#e3b56f';
    ctx.fillRect(1, -6, 1, 2);
    ctx.fillRect(0, -3, 1, 2);
    ctx.fillRect(-1, -1, 1, 2);
    ctx.fillRect(0, 2, 1, 2);
    ctx.fillRect(1, 4, 1, 2);
    ctx.fillStyle = '#ded8c4';
    ctx.fillRect(1, -5, 1, 10);
    ctx.fillStyle = '#5a3827';
    ctx.fillRect(-1, -1, 3, 2);
    ctx.fillStyle = '#e2bd6c';
    ctx.fillRect(0, -1, 1, 2);
    ctx.restore();
}

function drawPlayerArrows() {
    for (const arrow of arrows) {
        ctx.save();
        ctx.translate(arrow.x, arrow.y);
        ctx.rotate(arrow.angle);
        ctx.fillStyle = '#5b3926';
        ctx.fillRect(-5, 0, 9, 1);
        ctx.fillStyle = '#d6d0b9';
        ctx.fillRect(2, 0, 3, 1);
        ctx.fillRect(4, -1, 2, 1);
        ctx.fillRect(4, 1, 2, 1);
        ctx.fillStyle = '#9d3d3d';
        ctx.fillRect(-5, -1, 2, 1);
        ctx.fillRect(-5, 1, 2, 1);
        ctx.restore();
    }
}

function drawFemalePlayerSprite(x, y, leftStep, rightStep) {
    const hitFlash = !reducedVisualEffects && player.damageCooldown > 0
        && Math.floor(player.animTime * 30) % 2 === 0;
    const ink = hitFlash ? '#fff0d0' : '#171823';
    const hair = hitFlash ? '#fff0d0' : '#332044';
    const hairLight = hitFlash ? '#fff8e9' : '#8547a4';
    const skin = hitFlash ? '#fff0d0' : '#d99b7e';
    const skinLight = hitFlash ? '#fff8e9' : '#f3c39d';
    const cloth = hitFlash ? '#fff0d0' : '#24606a';
    const clothLight = hitFlash ? '#fff8e9' : '#4c99a0';
    const metal = hitFlash ? '#fff8e9' : '#aebdc0';

    ctx.fillStyle = ink;
    ctx.fillRect(x + 4, y + 1, 7, 1);
    ctx.fillRect(x + 3, y + 2, 9, 5);
    ctx.fillRect(x + 2, y + 5, 3, 8);
    ctx.fillRect(x + 11, y + 5, 3, 9);
    ctx.fillRect(x + 3, y + 10, 2, 4);
    ctx.fillRect(x + 12, y + 11, 2, 4);
    ctx.fillRect(x + 4, y + 14, 3, 6);
    ctx.fillRect(x + 9, y + 14, 3, 6);
    ctx.fillRect(x + 3, y + 19, 5, 2);
    ctx.fillRect(x + 8, y + 19, 5, 2);

    ctx.fillStyle = '#45304d';
    ctx.fillRect(x + 3, y + 3, 2, 8);
    ctx.fillRect(x + 12, y + 3, 2, 9);
    ctx.fillRect(x + 4, y + 14, 2, 4 + leftStep);
    ctx.fillRect(x + 10, y + 14, 2, 4 + rightStep);
    ctx.fillRect(x + 3, y + 10, 1, 4);
    ctx.fillStyle = hair;
    ctx.fillRect(x + 4, y + 1, 7, 5);
    ctx.fillRect(x + 3, y + 3, 2, 4);
    ctx.fillRect(x + 11, y + 3, 2, 4);
    ctx.fillRect(x + 12, y + 9, 1, 3);
    ctx.fillStyle = hairLight;
    ctx.fillRect(x + 5, y + 1, 4, 1);
    ctx.fillRect(x + 4, y + 2, 2, 1);
    ctx.fillRect(x + 3, y + 5, 1, 3);
    ctx.fillRect(x + 12, y + 5, 1, 3);
    ctx.fillStyle = '#c28bd2';
    ctx.fillRect(x + 6, y + 2, 2, 1);
    ctx.fillRect(x + 4, y + 8, 1, 2);
    ctx.fillRect(x + 12, y + 10, 1, 2);
    ctx.fillStyle = '#5b3470';
    ctx.fillRect(x + 4, y + 10, 1, 3);
    ctx.fillRect(x + 12, y + 12, 1, 2);
    ctx.fillStyle = '#e6a9e1';
    ctx.fillRect(x + 5, y + 3, 2, 1);
    ctx.fillStyle = '#291b37';
    ctx.fillRect(x + 12, y + 13, 1, 2);
    ctx.fillRect(x + 11, y + 15, 2, 1);
    ctx.fillStyle = '#75418a';
    ctx.fillRect(x + 12, y + 14, 1, 2);
    ctx.fillRect(x + 11, y + 16, 2, 1);
    ctx.fillStyle = '#bc78c7';
    ctx.fillRect(x + 12, y + 15, 1, 1);

    ctx.fillStyle = '#f1d18a';
    ctx.fillRect(x + 6, y, 3, 1);
    ctx.fillRect(x + 7, y - 1, 1, 2);
    ctx.fillStyle = '#fff0bd';
    ctx.fillRect(x + 7, y, 1, 1);
    ctx.fillStyle = '#d7a94e';
    ctx.fillRect(x + 6, y + 1, 3, 1);
    ctx.fillStyle = '#fff2c2';
    ctx.fillRect(x + 6, y + 1, 1, 1);
    ctx.fillStyle = '#d981a9';
    ctx.fillRect(x + 10, y + 2, 1, 1);
    ctx.fillStyle = '#fff0bd';
    ctx.fillRect(x + 10, y + 2, 1, 1);
    ctx.fillStyle = '#f4c1d7';
    ctx.fillRect(x + 4, y + 3, 1, 1);
    ctx.fillRect(x + 11, y + 3, 1, 1);

    ctx.fillStyle = skin;
    ctx.fillRect(x + 5, y + 3, 6, 4);
    ctx.fillRect(x + 4, y + 4, 8, 2);
    ctx.fillStyle = skinLight;
    ctx.fillRect(x + 5, y + 3, 3, 1);
    ctx.fillRect(x + 5, y + 4, 1, 1);
    ctx.fillStyle = '#583341';
    ctx.fillRect(x + 6, y + 5, 2, 1);
    ctx.fillRect(x + 9, y + 5, 2, 1);
    ctx.fillStyle = '#4c2e3a';
    ctx.fillRect(x + 6, y + 5, 1, 1);
    ctx.fillRect(x + 9, y + 5, 1, 1);
    ctx.fillStyle = '#fff0d5';
    ctx.fillRect(x + 7, y + 5, 1, 1);
    ctx.fillRect(x + 10, y + 5, 1, 1);
    ctx.fillStyle = '#d98789';
    ctx.fillRect(x + 5, y + 6, 1, 1);
    ctx.fillRect(x + 10, y + 6, 1, 1);
    ctx.fillStyle = '#a95f61';
    ctx.fillRect(x + 7, y + 6, 2, 1);
    ctx.fillStyle = '#f2c6aa';
    ctx.fillRect(x + 8, y + 6, 1, 1);

    ctx.fillStyle = '#392a37';
    ctx.fillRect(x + 3, y + 7, 3, 3);
    ctx.fillRect(x + 10, y + 7, 3, 3);
    ctx.fillStyle = skin;
    ctx.fillRect(x + 4, y + 8, 2, 3);
    ctx.fillRect(x + 10, y + 8, 2, 3);
    ctx.fillStyle = '#f0c68b';
    ctx.fillRect(x + 4, y + 9, 1, 1);
    ctx.fillRect(x + 11, y + 9, 1, 1);
    ctx.fillStyle = '#e6b2c4';
    ctx.fillRect(x + 4, y + 10, 1, 1);
    ctx.fillRect(x + 11, y + 10, 1, 1);
    ctx.fillStyle = '#40304f';
    ctx.fillRect(x + 2, y + 7, 2, 2);
    ctx.fillRect(x + 12, y + 7, 2, 2);
    ctx.fillStyle = '#b68bd0';
    ctx.fillRect(x + 3, y + 7, 1, 1);
    ctx.fillRect(x + 12, y + 7, 1, 1);
    ctx.fillStyle = '#f5d477';
    ctx.fillRect(x + 3, y + 9, 1, 1);
    ctx.fillRect(x + 12, y + 10, 1, 1);

    ctx.fillStyle = '#17323a';
    ctx.fillRect(x + 5, y + 7, 6, 7);
    ctx.fillRect(x + 4, y + 8, 8, 4);
    ctx.fillStyle = cloth;
    ctx.fillRect(x + 6, y + 8, 4, 5);
    ctx.fillRect(x + 5, y + 9, 6, 3);
    ctx.fillStyle = clothLight;
    ctx.fillRect(x + 6, y + 8, 2, 2);
    ctx.fillRect(x + 9, y + 9, 1, 2);
    ctx.fillStyle = '#c4d2cc';
    ctx.fillRect(x + 4, y + 8, 2, 2);
    ctx.fillRect(x + 10, y + 8, 2, 2);
    ctx.fillStyle = metal;
    ctx.fillRect(x + 4, y + 8, 1, 1);
    ctx.fillRect(x + 11, y + 8, 1, 1);
    ctx.fillStyle = '#f2d184';
    ctx.fillRect(x + 7, y + 9, 2, 3);
    ctx.fillStyle = '#fff0bd';
    ctx.fillRect(x + 7, y + 9, 1, 1);
    ctx.fillStyle = '#d7b76d';
    ctx.fillRect(x + 5, y + 12, 6, 1);
    ctx.fillStyle = '#fff0bd';
    ctx.fillRect(x + 7, y + 12, 2, 1);
    ctx.fillStyle = '#dce8df';
    ctx.fillRect(x + 6, y + 7, 1, 1);
    ctx.fillRect(x + 9, y + 7, 1, 1);
    ctx.fillStyle = '#6b455c';
    ctx.fillRect(x + 5, y + 11, 1, 1);
    ctx.fillRect(x + 10, y + 11, 1, 1);
    ctx.fillStyle = '#17323a';
    ctx.fillRect(x + 6, y + 7, 1, 1);
    ctx.fillRect(x + 9, y + 7, 1, 1);
    ctx.fillStyle = '#f1d18a';
    ctx.fillRect(x + 7, y + 7, 2, 1);
    ctx.fillStyle = '#d7e5d7';
    ctx.fillRect(x + 5, y + 10, 1, 1);
    ctx.fillRect(x + 10, y + 10, 1, 1);
    ctx.fillStyle = '#e29ab7';
    ctx.fillRect(x + 6, y + 11, 1, 1);
    ctx.fillRect(x + 9, y + 11, 1, 1);

    ctx.fillStyle = '#49324d';
    ctx.fillRect(x + 4, y + 13, 8, 2);
    ctx.fillStyle = '#65416d';
    ctx.fillRect(x + 4, y + 14, 2, 2);
    ctx.fillRect(x + 10, y + 14, 2, 2);
    ctx.fillStyle = '#d2ad63';
    ctx.fillRect(x + 5, y + 13, 6, 1);
    ctx.fillStyle = '#fff0bd';
    ctx.fillRect(x + 7, y + 13, 2, 1);
    ctx.fillStyle = '#b5658d';
    ctx.fillRect(x + 6, y + 12, 1, 1);
    ctx.fillRect(x + 9, y + 12, 1, 1);
    ctx.fillStyle = '#3d4850';
    ctx.fillRect(x + 5, y + 15 + leftStep, 2, 3);
    ctx.fillRect(x + 9, y + 15 + rightStep, 2, 3);
    ctx.fillStyle = '#7c8790';
    ctx.fillRect(x + 5, y + 16 + leftStep, 2, 1);
    ctx.fillRect(x + 9, y + 16 + rightStep, 2, 1);
    ctx.fillStyle = '#aebdc0';
    ctx.fillRect(x + 6, y + 16 + leftStep, 1, 1);
    ctx.fillRect(x + 10, y + 16 + rightStep, 1, 1);
    ctx.fillStyle = '#392a37';
    ctx.fillRect(x + 3, y + 19 + leftStep, 5, 2);
    ctx.fillRect(x + 8, y + 19 + rightStep, 5, 2);
    ctx.fillStyle = '#96704e';
    ctx.fillRect(x + 4, y + 19 + leftStep, 3, 1);
    ctx.fillRect(x + 9, y + 19 + rightStep, 3, 1);
    ctx.fillStyle = '#d2ad63';
    ctx.fillRect(x + 4, y + 18 + leftStep, 3, 1);
    ctx.fillRect(x + 9, y + 18 + rightStep, 3, 1);
    ctx.fillStyle = '#fff0bd';
    ctx.fillRect(x + 5, y + 18 + leftStep, 1, 1);
    ctx.fillRect(x + 10, y + 18 + rightStep, 1, 1);
    ctx.fillStyle = '#271e2d';
    ctx.fillRect(x + 3, y + 14, 1, 2);
    ctx.fillRect(x + 12, y + 14, 1, 2);
    ctx.fillStyle = '#563353';
    ctx.fillRect(x + 4, y + 14, 8, 2);
    ctx.fillRect(x + 3, y + 15, 10, 1);
    ctx.fillStyle = '#8d4e83';
    ctx.fillRect(x + 5, y + 14, 6, 1);
    ctx.fillRect(x + 4, y + 15, 2, 1);
    ctx.fillRect(x + 10, y + 15, 2, 1);
    ctx.fillStyle = '#d6b66a';
    ctx.fillRect(x + 6, y + 15, 4, 1);
    ctx.fillStyle = '#fff0bd';
    ctx.fillRect(x + 7, y + 15, 2, 1);
    ctx.fillStyle = '#a9c6bd';
    ctx.fillRect(x + 7, y + 16, 2, 1);
    ctx.fillStyle = '#f0d78d';
    ctx.fillRect(x + 8, y + 17, 1, 1);

    if (gearOwned.armor) {
        ctx.fillStyle = '#71838d';
        ctx.fillRect(x + 5, y + 8, 2, 2);
        ctx.fillRect(x + 9, y + 8, 2, 2);
        ctx.fillRect(x + 6, y + 9, 4, 3);
        ctx.fillStyle = '#d2d5ce';
        ctx.fillRect(x + 5, y + 8, 1, 1);
        ctx.fillRect(x + 10, y + 8, 1, 1);
        ctx.fillRect(x + 7, y + 9, 2, 1);
        ctx.fillStyle = '#d0a94f';
        ctx.fillRect(x + 7, y + 10, 2, 2);
        ctx.fillStyle = '#8f344b';
        ctx.fillRect(x + 7, y + 11, 2, 1);
    }

    if (hitFlash) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 5, y + 4, 1, 1);
        ctx.fillRect(x + 10, y + 7, 1, 2);
    }
}

function getFemalePlayerAnimationFrameBounds() {
    if (femalePlayerAnimationFrameBounds) {
        return femalePlayerAnimationFrameBounds;
    }

    const sheet = femalePlayerAnimationSheet;
    const frameWidth = sheet.naturalWidth / 14;
    const frameHeight = sheet.naturalHeight / 2;
    const boundsCanvas = document.createElement('canvas');
    boundsCanvas.width = sheet.naturalWidth;
    boundsCanvas.height = sheet.naturalHeight;
    const boundsContext = boundsCanvas.getContext('2d', { willReadFrequently: true });
    boundsContext.drawImage(sheet, 0, 0);
    const alpha = readSpritePixelData(boundsContext, boundsCanvas.width, boundsCanvas.height);
    if (!alpha) {
        femalePlayerAnimationFrameBounds = getSpriteFrameGridBounds(sheet, 2, 14, [
            { left: 0, right: 1, top: 0.298, bottom: 0.923 },
            { left: 0, right: 1, top: 0.257, bottom: 0.845 }
        ]);
        return femalePlayerAnimationFrameBounds;
    }

    femalePlayerAnimationFrameBounds = Array.from({ length: 2 }, (_, row) => (
        Array.from({ length: 14 }, (_, column) => {
            const left = Math.floor(column * frameWidth);
            const right = Math.ceil((column + 1) * frameWidth);
            const top = row * frameHeight;
            const bottom = (row + 1) * frameHeight;
            let minX = right;
            let maxX = left - 1;
            let minY = bottom;
            let maxY = top - 1;

            for (let y = top; y < bottom; y++) {
                for (let x = left; x < right; x++) {
                    if (alpha[(y * boundsCanvas.width + x) * 4 + 3] === 0) continue;
                    minX = Math.min(minX, x);
                    maxX = Math.max(maxX, x);
                    minY = Math.min(minY, y);
                    maxY = Math.max(maxY, y);
                }
            }

            return maxX < minX
                ? { x: left, y: top, width: frameWidth, height: frameHeight }
                : {
                    x: minX,
                    y: minY,
                    width: maxX - minX + 1,
                    height: maxY - minY + 1
                };
        })
    ));
    return femalePlayerAnimationFrameBounds;
}

function getMalePlayerAnimationFrameBounds() {
    if (malePlayerAnimationFrameBounds) {
        return malePlayerAnimationFrameBounds;
    }

    const sheet = malePlayerAnimationSheet;
    const frameWidth = sheet.naturalWidth / 14;
    const frameHeight = sheet.naturalHeight / 2;
    const boundsCanvas = document.createElement('canvas');
    boundsCanvas.width = sheet.naturalWidth;
    boundsCanvas.height = sheet.naturalHeight;
    const boundsContext = boundsCanvas.getContext('2d', { willReadFrequently: true });
    boundsContext.drawImage(sheet, 0, 0);
    const alpha = readSpritePixelData(boundsContext, boundsCanvas.width, boundsCanvas.height);
    if (!alpha) {
        malePlayerAnimationFrameBounds = getSpriteFrameGridBounds(sheet, 2, 14, [
            { left: 0.05, right: 0.95, top: 0.49, bottom: 0.89 },
            { left: 0, right: 1, top: 0.369, bottom: 0.795 }
        ]);
        return malePlayerAnimationFrameBounds;
    }

    malePlayerAnimationFrameBounds = Array.from({ length: 2 }, (_, row) => (
        Array.from({ length: 14 }, (_, column) => {
            const left = Math.floor(column * frameWidth);
            const right = Math.ceil((column + 1) * frameWidth);
            const top = row * frameHeight;
            const bottom = (row + 1) * frameHeight;
            let minX = right;
            let maxX = left - 1;
            let minY = bottom;
            let maxY = top - 1;

            for (let y = top; y < bottom; y++) {
                for (let x = left; x < right; x++) {
                    const pixelIndex = (y * boundsCanvas.width + x) * 4;
                    if (alpha[pixelIndex + 3] <= 32) continue;
                    if (
                        row === 1
                        && alpha[pixelIndex + 2] > alpha[pixelIndex] * 1.35
                        && alpha[pixelIndex + 2] > alpha[pixelIndex + 1] * 1.15
                        && alpha[pixelIndex + 2] > 80
                    ) {
                        continue;
                    }
                    minX = Math.min(minX, x);
                    maxX = Math.max(maxX, x);
                    minY = Math.min(minY, y);
                    maxY = Math.max(maxY, y);
                }
            }

            return maxX < minX
                ? { x: left, y: top, width: frameWidth, height: frameHeight }
                : {
                    x: minX,
                    y: minY,
                    width: maxX - minX + 1,
                    height: maxY - minY + 1
                };
        })
    ));
    return malePlayerAnimationFrameBounds;
}

function getPlayerAttackAnimationFrameBounds() {
    if (playerAttackAnimationFrameBounds) {
        return playerAttackAnimationFrameBounds;
    }

    const sheet = playerAttackAnimationSheet;
    const boundsCanvas = document.createElement('canvas');
    boundsCanvas.width = sheet.naturalWidth;
    boundsCanvas.height = sheet.naturalHeight;
    const boundsContext = boundsCanvas.getContext('2d', { willReadFrequently: true });
    boundsContext.drawImage(sheet, 0, 0);
    const alpha = readSpritePixelData(boundsContext, boundsCanvas.width, boundsCanvas.height);
    if (!alpha) {
        const frameBounds = [
            { source: [9, 448, 121, 619], body: [11, 456, 115, 616] },
            { source: [154, 445, 268, 620], body: [156, 452, 264, 617] },
            { source: [312, 445, 419, 620], body: [314, 452, 416, 617] },
            { source: [498, 482, 636, 619], body: [500, 488, 633, 616] },
            { source: [696, 492, 882, 620], body: [698, 494, 872, 617] },
            { source: [911, 453, 1078, 620], body: [913, 467, 1070, 617] },
            { source: [1104, 491, 1290, 620], body: [1106, 493, 1283, 617] },
            { source: [1309, 453, 1483, 612], body: [1362, 465, 1476, 600] },
            { source: [1512, 491, 1696, 620], body: [1514, 493, 1686, 617] },
            { source: [1706, 491, 1869, 620], body: [1708, 493, 1863, 617] },
            { source: [1872, 491, 2013, 620], body: [1874, 493, 2004, 617] },
            { source: [2047, 491, 2172, 620], body: [2049, 493, 2171, 617] }
        ];
        const scaleX = sheet.naturalWidth / 2172;
        const scaleY = sheet.naturalHeight / 724;
        playerAttackAnimationFrameBounds = frameBounds.map(({ source, body }) => ({
            sourceX: Math.floor(source[0] * scaleX),
            sourceY: Math.floor(source[1] * scaleY),
            sourceRight: Math.min(sheet.naturalWidth, Math.ceil(source[2] * scaleX)),
            sourceBottom: Math.min(sheet.naturalHeight, Math.ceil(source[3] * scaleY)),
            bodyX: body[0] * scaleX,
            bodyY: body[1] * scaleY,
            bodyWidth: (body[2] - body[0] + 1) * scaleX,
            bodyHeight: (body[3] - body[1] + 1) * scaleY
        }));
        return playerAttackAnimationFrameBounds;
    }

    const width = boundsCanvas.width;
    const height = boundsCanvas.height;
    const frameWidth = width / playerAttackAnimationFrameCount;
    const frameHeight = height / 2;
    const rowTop = frameHeight;
    const visited = new Uint8Array(width * height);
    const components = [];
    const isOpaque = (index) => alpha[index + 3] > 32;
    const isBlueEffect = (index) => (
        alpha[index + 2] > alpha[index] * 1.35
        && alpha[index + 2] > alpha[index + 1] * 1.15
        && alpha[index + 2] > 80
    );

    for (let startY = rowTop; startY < height; startY++) {
        for (let startX = 0; startX < width; startX++) {
            const start = startY * width + startX;
            if (visited[start] || !isOpaque(start * 4)) continue;

            const queue = [start];
            visited[start] = 1;
            let minX = width;
            let maxX = -1;
            let minY = height;
            let maxY = -1;
            let bodyMinX = width;
            let bodyMaxX = -1;
            let bodyMinY = height;
            let bodyMaxY = -1;
            let pixelCount = 0;

            for (let queueIndex = 0; queueIndex < queue.length; queueIndex++) {
                const index = queue[queueIndex];
                const x = index % width;
                const y = Math.floor(index / width);
                const pixelIndex = index * 4;
                pixelCount++;
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);

                if (!isBlueEffect(pixelIndex)) {
                    bodyMinX = Math.min(bodyMinX, x);
                    bodyMaxX = Math.max(bodyMaxX, x);
                    bodyMinY = Math.min(bodyMinY, y);
                    bodyMaxY = Math.max(bodyMaxY, y);
                }

                for (let offsetY = -1; offsetY <= 1; offsetY++) {
                    for (let offsetX = -1; offsetX <= 1; offsetX++) {
                        const nextX = x + offsetX;
                        const nextY = y + offsetY;
                        if (
                            nextX < 0 || nextX >= width
                            || nextY < rowTop || nextY >= height
                        ) {
                            continue;
                        }

                        const next = nextY * width + nextX;
                        if (visited[next]) continue;
                        visited[next] = 1;
                        if (isOpaque(next * 4)) queue.push(next);
                    }
                }
            }

            if (pixelCount > 5000 && bodyMaxX >= bodyMinX && bodyMaxY >= bodyMinY) {
                components.push({
                    minX,
                    maxX,
                    minY,
                    maxY,
                    bodyMinX,
                    bodyMaxX,
                    bodyMinY,
                    bodyMaxY,
                    pixelCount,
                    centerX: (bodyMinX + bodyMaxX + 1) / 2
                });
            }
        }
    }

    components.sort((first, second) => second.pixelCount - first.pixelCount);
    const attackFrames = components
        .slice(0, playerAttackAnimationFrameCount)
        .sort((first, second) => first.centerX - second.centerX);

    if (attackFrames.length !== playerAttackAnimationFrameCount) {
        throw new Error('Não foi possível identificar todos os quadros do ataque do jogador.');
    }

    playerAttackAnimationFrameBounds = attackFrames.map((bounds) => ({
        sourceX: Math.max(0, bounds.minX - 2),
        sourceRight: Math.min(width, bounds.maxX + 3),
        sourceY: Math.max(rowTop, bounds.minY - 2),
        sourceBottom: Math.min(height, bounds.maxY + 3),
        bodyX: bounds.bodyMinX,
        bodyY: bounds.bodyMinY,
        bodyWidth: bounds.bodyMaxX - bounds.bodyMinX + 1,
        bodyHeight: bounds.bodyMaxY - bounds.bodyMinY + 1
    }));
    return playerAttackAnimationFrameBounds;
}

function drawSwordAttack() {
    if (!player || player.character === 'man' || player.attackTimer <= 0) {
        return;
    }

    const progress = 1 - player.attackTimer / playerAttackAnimationDuration;
    const angle = Math.atan2(player.attackFacingY, player.attackFacingX);
    const swing = (progress - 0.5) * 1.6;
    drawSwordSprite(
        player.x + player.size / 2 + Math.cos(angle + swing) * 5,
        player.y + player.size / 2 + Math.sin(angle + swing) * 5,
        angle + swing,
        0.85,
        player.character === 'woman'
    );
}

function drawSpearAttack() {
    if (!spearOwned || !player || player.spearAttackTimer <= 0) {
        return;
    }
    const progress = 1 - player.spearAttackTimer / 0.36;
    const pullback = progress < 0.2 ? progress / 0.2 : 1;
    const thrustProgress = Math.max(0, Math.min(1, (progress - 0.2) / 0.4));
    const recoveryProgress = Math.max(0, Math.min(1, (progress - 0.6) / 0.4));
    const thrust = 1 - Math.pow(1 - thrustProgress, 3);
    const offset = progress < 0.2
        ? -3 * pullback
        : progress < 0.6
            ? -3 + thrust * 17
            : 14 * (1 - recoveryProgress);
    const tilt = progress < 0.2
        ? -0.12 * pullback
        : progress > 0.6 ? 0.1 * (1 - recoveryProgress) : 0.04;
    const angle = Math.atan2(player.spearFacingY, player.spearFacingX);
    const centerX = player.x + player.size / 2;
    const centerY = player.y + player.size / 2;
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle + tilt);
    ctx.translate(offset, 0);
    ctx.strokeStyle = '#85562e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(23, 0);
    ctx.stroke();
    ctx.strokeStyle = '#c49358';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(2, -0.5);
    ctx.lineTo(21, -0.5);
    ctx.stroke();
    ctx.fillStyle = '#d9e3d0';
    ctx.beginPath();
    ctx.moveTo(27, 0);
    ctx.lineTo(22, -2.5);
    ctx.lineTo(23, 0);
    ctx.lineTo(22, 2.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function drawBoss(enemy) {
    const centerX = enemy.x + enemy.size / 2;
    const centerY = enemy.y + enemy.size / 2;
    const isDragon = enemy.bossType === 'dragon';
    const isReaper = enemy.bossType === 'grimReaper';
    const phaseTwo = enemy.phaseTwo;
    const isWeak = enemy.weaknessTimer > 0;
    const bob = snapRenderPixel(Math.sin(enemy.animTime * (enemy.moving ? 8 : 3)) * 1.2);
    const bossLabelY = centerY - 50;
    const bossName = enemy.bossType === 'throneGuardian'
        ? enemy.isFemale ? 'GUARDIÃ DO TRONO' : 'GUARDIÃO DO TRONO'
        : isDragon
        ? enemy.isFemale ? 'DRAGOA' : 'DRAGÃO'
        : isReaper
            ? enemy.isFemale ? 'CEIFADORA' : 'CEIFADOR'
            : enemy.isFemale ? 'GOLEM FÊMEA' : 'GOLEM DE LAVA';
    const title = isWeak
        ? 'VULNERÁVEL!'
        : `${bossName}${phaseTwo ? ' · FASE II' : ''}`;
    drawPixelGlow(
        centerX,
        centerY,
        52,
        isWeak ? 'rgba(117, 239, 222, 0.48)'
            : enemy.bossType === 'throneGuardian' ? 'rgba(198, 180, 118, 0.28)'
                : isDragon ? 'rgba(194, 57, 67, 0.2)'
                    : isReaper ? 'rgba(109, 82, 153, 0.3)' : 'rgba(255, 105, 28, 0.2)',
        5
    );
    ctx.font = phaseTwo ? '6px monospace' : '7px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#1a130e';
    ctx.fillText(title, centerX + 1, bossLabelY + 1);
    ctx.fillStyle = isWeak ? '#9df9e9'
        : enemy.bossType === 'throneGuardian' ? '#f0d98a'
            : isDragon ? '#ffd09b' : isReaper ? '#d9c4ff' : '#ffce73';
    ctx.fillText(title, centerX, bossLabelY);
    ctx.font = '5px monospace';
    ctx.fillStyle = '#f5e8c7';
    ctx.fillText(`${Math.ceil(enemy.health)} / ${enemy.maxHealth} vida`, centerX, bossLabelY + 8);
    ctx.textAlign = 'start';

    ctx.save();
    ctx.translate(
        snapRenderPixel(enemy.x + enemy.size / 2),
        snapRenderPixel(enemy.y + enemy.size / 2 + bob)
    );
    const bossScale = isDragon ? 2.55 : 64 / 28;
    const isLavaGolem = enemy.bossType === 'lavaGolem';
    ctx.scale(isReaper ? bossScale : enemy.spriteFacingX * bossScale, bossScale);
    const flash = isVisualHitFlashActive(enemy.hitFlash);

    const spriteFrames = bossSpriteFrames[enemy.bossType];
    const spriteAnimationTime = isDragon ? enemy.spriteAnimTime : enemy.animTime;
    const spriteFramesPerSecond = isDragon ? 12 : 10;
    const spriteFrame = spriteFrames && spriteFrames.length > 0
        ? spriteFrames[isReaper ? 0 : Math.floor(spriteAnimationTime * spriteFramesPerSecond) % spriteFrames.length]
        : null;
    if (spriteFrame && spriteFrame.complete && spriteFrame.naturalWidth > 0) {
        if (isReaper) {
            const directionRow = Math.abs(enemy.facingX) > Math.abs(enemy.facingY)
                ? enemy.facingX < 0 ? 2 : 3
                : enemy.facingY < 0 ? 1 : 0;
            const frameColumn = Math.floor(enemy.animTime * (enemy.moving ? 8 : 3)) % 4;
            const sourceX = [40, 214, 388, 556][frameColumn];
            const sourceY = [56, 234, 410, 574][directionRow];
            const sourceHeight = directionRow < 2 ? 176 : 160;
            const spriteScale = 28 / Math.max(180, sourceHeight);
            const spriteWidth = 180 * spriteScale;
            const spriteHeight = sourceHeight * spriteScale;
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(
                spriteFrame,
                sourceX,
                sourceY,
                180,
                sourceHeight,
                -spriteWidth / 2,
                -spriteHeight / 2,
                spriteWidth,
                spriteHeight
            );
        } else {
            const spriteScale = Math.min(
                28 / spriteFrame.naturalWidth,
                28 / spriteFrame.naturalHeight
            );
            const spriteWidth = spriteFrame.naturalWidth * spriteScale;
            const spriteHeight = spriteFrame.naturalHeight * spriteScale;
            const sourceXInset = isLavaGolem ? 3 : 0;
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(
                spriteFrame,
                sourceXInset,
                0,
                spriteFrame.naturalWidth - sourceXInset * 2,
                spriteFrame.naturalHeight,
                -spriteWidth / 2,
                -spriteHeight / 2,
                spriteWidth,
                spriteHeight
            );
        }
    } else if (isReaper) {
        ctx.fillStyle = '#19151f';
        ctx.beginPath();
        ctx.moveTo(0, -15);
        ctx.lineTo(7, -9);
        ctx.lineTo(8, 1);
        ctx.lineTo(13, 10);
        ctx.lineTo(4, 8);
        ctx.lineTo(0, 12);
        ctx.lineTo(-5, 8);
        ctx.lineTo(-13, 10);
        ctx.lineTo(-8, 1);
        ctx.lineTo(-7, -9);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = flash ? '#fff1dc' : '#a84562';
        ctx.fillRect(-4, -3, 2, 1);
        ctx.fillRect(2, -3, 2, 1);
        ctx.strokeStyle = '#c9d1df';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-10, 9);
        ctx.lineTo(10, -12);
        ctx.lineTo(15, -15);
        ctx.lineTo(13, -8);
        ctx.stroke();
    } else if (enemy.bossType === 'throneGuardian') {
        const stride = enemy.moving ? Math.sin(enemy.animTime * 9) * 1.5 : 0;
        const pulse = (Math.sin(enemy.animTime * (phaseTwo ? 11 : 6)) + 1) / 2;
        const warningFlash = enemy.veinPulseWarning > 0;
        ctx.fillStyle = '#211f20';
        ctx.fillRect(-12, 9, 24, 3);
        ctx.fillStyle = flash ? '#fff1dc' : '#302d2b';
        ctx.fillRect(-12, -9, 24, 19);
        ctx.fillRect(-16, -6, 7, 13);
        ctx.fillRect(9, -6, 7, 13);
        ctx.fillRect(-10, 7 + stride, 8, 6);
        ctx.fillRect(2, 7 - stride, 8, 6);
        ctx.fillStyle = flash ? '#fff8e9' : '#45413a';
        ctx.fillRect(-11, -10, 22, 18);
        ctx.fillRect(-15, -6, 6, 11);
        ctx.fillRect(9, -6, 6, 11);
        ctx.fillRect(-9, 6 + stride, 7, 5);
        ctx.fillRect(2, 6 - stride, 7, 5);
        ctx.fillStyle = '#81745a';
        ctx.fillRect(-9, -9, 18, 5);
        ctx.fillRect(-10, -2, 20, 7);
        ctx.fillRect(-14, -5, 4, 2);
        ctx.fillRect(10, -5, 4, 2);
        ctx.fillStyle = '#a49670';
        ctx.fillRect(-8, -8, 7, 2);
        ctx.fillRect(2, -8, 6, 2);
        ctx.fillRect(-8, -1, 5, 2);
        ctx.fillRect(3, -1, 5, 2);
        ctx.fillStyle = '#585146';
        ctx.fillRect(-8, 3, 5, 3);
        ctx.fillRect(3, 3, 5, 3);
        ctx.fillRect(-8, 7 + stride, 5, 2);
        ctx.fillRect(3, 7 - stride, 5, 2);
        ctx.fillStyle = '#a2977b';
        ctx.fillRect(-13, -4, 2, 6);
        ctx.fillRect(11, -4, 2, 6);
        ctx.fillRect(-7, 9 + stride, 4, 1);
        ctx.fillRect(3, 9 - stride, 4, 1);
        ctx.fillStyle = '#252421';
        ctx.fillRect(-6, -13, 12, 5);
        ctx.fillRect(-8, -12, 4, 5);
        ctx.fillRect(4, -12, 4, 5);
        ctx.fillStyle = '#71634a';
        ctx.fillRect(-5, -12, 10, 4);
        ctx.fillRect(-7, -11, 3, 3);
        ctx.fillRect(4, -11, 3, 3);
        ctx.fillStyle = '#d1b869';
        ctx.fillRect(-4, -12, 8, 2);
        ctx.fillRect(-8, -11, 3, 1);
        ctx.fillRect(5, -11, 3, 1);
        ctx.fillRect(-2, -9, 4, 1);
        ctx.fillStyle = '#252421';
        ctx.fillRect(-5, -7, 10, 3);
        ctx.fillStyle = warningFlash ? '#ffb64f' : '#16191a';
        ctx.fillRect(-3, -6, 6, 2);
        ctx.fillStyle = warningFlash ? '#fff0a0' : '#b14d34';
        ctx.fillRect(-2, -6, 2, 1);
        ctx.fillRect(1, -6, 2, 1);
        ctx.fillStyle = '#34302a';
        ctx.fillRect(-11, -4, 3, 10);
        ctx.fillRect(8, -4, 3, 10);
        ctx.fillStyle = '#c9ac5b';
        ctx.fillRect(-10, -3, 2, 7);
        ctx.fillRect(8, -3, 2, 7);
        ctx.fillStyle = '#e0cf9a';
        ctx.fillRect(-10, -2, 1, 4);
        ctx.fillRect(9, -2, 1, 4);
        ctx.fillStyle = '#282622';
        ctx.fillRect(-1, -3, 2, 9);
        ctx.fillRect(-5, 0, 10, 2);
        ctx.fillStyle = '#c9ac5b';
        ctx.fillRect(-1, -3, 2, 8);
        ctx.fillRect(-5, 0, 10, 2);
        ctx.fillStyle = phaseTwo ? '#ff8f3c' : '#f3d982';
        ctx.fillRect(-2, -2, 4, 6);
        ctx.fillStyle = '#fff0b0';
        ctx.fillRect(-1, -1, 2, 4);
        ctx.fillStyle = '#a54e35';
        ctx.fillRect(-3, 5, 2, 1 + pulse);
        ctx.fillRect(2, 4, 2, 1 + pulse);
        ctx.fillStyle = '#d1b869';
        ctx.fillRect(-12, -8, 3, 2);
        ctx.fillRect(9, -8, 3, 2);
        ctx.fillStyle = '#3e3931';
        ctx.fillRect(-11, 6, 5, 2);
        ctx.fillRect(6, 6, 5, 2);
        ctx.fillStyle = '#b44c32';
        ctx.fillRect(-7, -3, 1, 3);
        ctx.fillRect(6, -1, 1, 4);
        ctx.fillStyle = '#f0d98a';
        ctx.fillRect(-6, -3, 1, 2);
        ctx.fillRect(5, -1, 1, 3);
        if (phaseTwo) {
            ctx.fillStyle = `rgba(255, 119, 52, ${0.22 + pulse * 0.25})`;
            ctx.fillRect(-2, -2, 4, 6);
            ctx.fillStyle = '#fff0a0';
            ctx.fillRect(-1, -1, 2, 4);
        }
    } else if (isDragon) {
        const wingFlap = Math.sin(enemy.animTime * 10) * 2;
        const stride = enemy.moving ? Math.sin(enemy.animTime * 10) * 1.5 : 0;

        ctx.fillStyle = '#321e2a';
        ctx.fillRect(-4, 1, 8, 5);
        ctx.fillRect(-1, 4, 7, 2);
        ctx.fillStyle = '#71303d';
        ctx.fillRect(-7, -5 - wingFlap, 4, 3);
        ctx.fillRect(-11, -8 - wingFlap, 6, 4);
        ctx.fillRect(-15, -11 - wingFlap, 7, 4);
        ctx.fillRect(-18, -13 - wingFlap, 5, 4);
        ctx.fillRect(4, -5 - wingFlap, 4, 3);
        ctx.fillRect(5, -8 - wingFlap, 6, 4);
        ctx.fillRect(8, -11 - wingFlap, 7, 4);
        ctx.fillRect(13, -13 - wingFlap, 5, 4);
        ctx.fillStyle = '#351f32';
        ctx.fillRect(-15, -10 - wingFlap, 10, 1);
        ctx.fillRect(-17, -12 - wingFlap, 8, 1);
        ctx.fillRect(5, -10 - wingFlap, 10, 1);
        ctx.fillRect(9, -12 - wingFlap, 8, 1);
        ctx.fillStyle = '#a6414a';
        ctx.fillRect(-14, -10 - wingFlap, 7, 2);
        ctx.fillRect(-17, -12 - wingFlap, 4, 2);
        ctx.fillRect(7, -10 - wingFlap, 7, 2);
        ctx.fillRect(14, -12 - wingFlap, 4, 2);
        ctx.fillStyle = '#d16b58';
        ctx.fillRect(-8, -7 - wingFlap, 2, 2);
        ctx.fillRect(-12, -10 - wingFlap, 2, 2);
        ctx.fillRect(6, -7 - wingFlap, 2, 2);
        ctx.fillRect(10, -10 - wingFlap, 2, 2);

        ctx.fillStyle = '#492b39';
        ctx.fillRect(-8, -8, 3, 3);
        ctx.fillRect(-7, -5, 3, 5);
        ctx.fillRect(-8, 0, 3, 3);
        ctx.fillRect(5, -8, 3, 3);
        ctx.fillRect(6, -5, 3, 5);
        ctx.fillRect(5, 0, 3, 3);
        ctx.fillStyle = flash ? '#fff1d4' : '#b3444b';
        ctx.fillRect(-7, -7, 2, 2);
        ctx.fillRect(-6, -4, 2, 3);
        ctx.fillRect(-7, 1, 2, 1);
        ctx.fillRect(6, -7, 1, 2);
        ctx.fillRect(7, -4, 1, 3);
        ctx.fillRect(6, 1, 2, 1);
        ctx.fillStyle = '#3b2732';
        ctx.fillRect(-5, -3, 10, 9);
        ctx.fillStyle = flash ? '#fff1d4' : '#a83e49';
        ctx.fillRect(-4, -2, 8, 7);
        ctx.fillStyle = '#7d303d';
        ctx.fillRect(-3, -2, 2, 2);
        ctx.fillRect(1, -1, 2, 2);
        ctx.fillRect(-2, 2, 2, 2);
        ctx.fillStyle = '#d66d57';
        ctx.fillRect(-4, -1, 1, 2);
        ctx.fillRect(2, 1, 1, 2);
        ctx.fillStyle = '#eea45e';
        ctx.fillRect(-3, -4, 2, 1);
        ctx.fillRect(1, -3, 2, 1);
        ctx.fillRect(-2, 3, 2, 1);
        ctx.fillStyle = '#d27758';
        ctx.fillRect(-2, -1, 5, 5);
        ctx.fillRect(-1, 4, 4, 1);
        ctx.fillStyle = '#8d3543';
        ctx.fillRect(-5, 5 + stride, 4, 4);
        ctx.fillRect(2, 5 - stride, 4, 4);
        ctx.fillStyle = '#d27a58';
        ctx.fillRect(-6, 8 + stride, 4, 2);
        ctx.fillRect(2, 8 - stride, 4, 2);
        ctx.fillStyle = '#492b39';
        ctx.fillRect(-7, 3, 3, 2);
        ctx.fillRect(-9, 4, 3, 2);
        ctx.fillRect(-10, 5, 2, 2);
        ctx.fillStyle = '#692e3d';
        ctx.fillRect(1, -7, 5, 5);
        ctx.fillRect(3, -10, 4, 4);
        ctx.fillStyle = '#d87656';
        ctx.fillRect(4, -8, 4, 2);
        ctx.fillRect(5, -6, 3, 1);
        ctx.fillStyle = '#d4b68c';
        ctx.fillRect(1, -12, 2, 4);
        ctx.fillRect(5, -12, 2, 3);
        ctx.fillStyle = '#f0c66d';
        ctx.fillRect(4, -8, 2, 2);
        ctx.fillStyle = '#311e28';
        ctx.fillRect(5, -8, 1, 2);
        ctx.fillRect(7, -7, 1, 1);
        ctx.fillStyle = '#ead6ab';
        ctx.fillRect(5, -5, 1, 1);
        ctx.fillStyle = '#f5a452';
        ctx.fillRect(8, -5, 2, 2);
        ctx.fillRect(9, -6, 1, 2);
        ctx.fillStyle = '#532736';
        ctx.fillRect(-8, 6 + stride, 2, 2);
        ctx.fillRect(4, 6 - stride, 2, 2);
        ctx.fillRect(-12, 2, 3, 2);
        ctx.fillRect(-14, 1, 2, 2);
        ctx.fillStyle = '#d16b58';
        ctx.fillRect(-13, 2, 1, 1);
        ctx.fillRect(-15, 1, 2, 1);
        ctx.fillStyle = '#542532';
        ctx.fillRect(-2, -7, 2, 2);
        ctx.fillRect(1, -6, 2, 2);
        ctx.fillRect(-3, -5, 2, 2);
        ctx.fillStyle = '#e28b62';
        ctx.fillRect(-2, -6, 1, 1);
        ctx.fillRect(1, -5, 1, 1);
        ctx.fillStyle = '#602638';
        ctx.fillRect(-1, -9, 2, 3);
        ctx.fillRect(-2, -10, 2, 2);
        ctx.fillRect(1, -9, 2, 2);
        ctx.fillStyle = '#f0c66d';
        ctx.fillRect(-1, -7, 2, 2);
        ctx.fillStyle = '#7d303d';
        ctx.fillRect(-13, 3, 4, 2);
        ctx.fillRect(-16, 2, 4, 2);
        ctx.fillRect(-19, 1, 4, 2);
        ctx.fillStyle = '#d16b58';
        ctx.fillRect(-12, 3, 2, 1);
        ctx.fillRect(-16, 2, 2, 1);
        ctx.fillStyle = '#492b39';
        ctx.fillRect(-5, -1, 2, 2);
        ctx.fillRect(2, -2, 2, 2);
        ctx.fillStyle = '#f5a452';
        ctx.fillRect(-5, 0, 1, 1);
        ctx.fillRect(2, -1, 1, 1);
        ctx.fillStyle = '#612b3b';
        ctx.fillRect(-2, 0, 2, 1);
        ctx.fillRect(1, 1, 2, 1);
        ctx.fillRect(-1, 3, 2, 1);
        ctx.fillStyle = '#e38a62';
        ctx.fillRect(-2, 1, 1, 1);
        ctx.fillRect(2, 2, 1, 1);
        ctx.fillStyle = '#f0c66d';
        ctx.fillRect(-4, -4, 1, 1);
        ctx.fillRect(3, -3, 1, 1);
        ctx.fillStyle = '#492b39';
        ctx.fillRect(-4, 5, 2, 2);
        ctx.fillRect(2, 5, 2, 2);
    } else {
        const stride = enemy.moving ? Math.sin(enemy.animTime * 9) * 1.5 : 0;
        const lavaPulse = (Math.sin(enemy.animTime * 7) + 1) / 2;
        const jawOpen = (Math.sin(enemy.animTime * 4) + 1) * 1.5;

        ctx.fillStyle = '#171310';
        ctx.fillRect(-12, 9, 24, 3);

        // Wide shoulders, heavy torso, and separated stone legs.
        ctx.fillStyle = '#292c2d';
        ctx.fillRect(-12, -3, 6, 9);
        ctx.fillRect(7, -3, 6, 9);
        ctx.fillRect(-11, 4 + stride, 8, 6);
        ctx.fillRect(3, 4 - stride, 8, 6);
        ctx.fillRect(-8, -4, 16, 13);
        ctx.fillRect(-7, -7, 14, 12);
        ctx.fillStyle = flash ? '#fff1dc' : '#565957';
        ctx.fillRect(-11, -2, 5, 6);
        ctx.fillRect(7, -2, 5, 6);
        ctx.fillRect(-10, 5 + stride, 6, 3);
        ctx.fillRect(4, 5 - stride, 6, 3);
        ctx.fillRect(-7, -4, 14, 10);
        ctx.fillRect(-6, -6, 12, 8);
        ctx.fillStyle = flash ? '#fff8e9' : '#70716b';
        ctx.fillRect(-9, -3, 4, 3);
        ctx.fillRect(6, -3, 4, 3);
        ctx.fillRect(-8, 0, 3, 3);
        ctx.fillRect(5, 0, 3, 3);
        ctx.fillRect(-9, 6 + stride, 4, 1);
        ctx.fillRect(5, 6 - stride, 4, 1);

        ctx.fillStyle = '#4b504f';
        ctx.fillRect(-10, -1, 2, 3);
        ctx.fillRect(8, -1, 2, 3);
        ctx.fillRect(-8, 4, 5, 1);
        ctx.fillRect(3, 4, 5, 1);
        ctx.fillRect(-7, 8 + stride, 4, 1);
        ctx.fillRect(3, 8 - stride, 4, 1);
        ctx.fillStyle = '#7a7970';
        ctx.fillRect(-11, -2, 2, 2);
        ctx.fillRect(9, -2, 2, 2);
        ctx.fillRect(-9, 5 + stride, 2, 1);
        ctx.fillRect(7, 5 - stride, 2, 1);
        ctx.fillStyle = '#929188';
        ctx.fillRect(-10, -2, 1, 1);
        ctx.fillRect(10, -2, 1, 1);
        ctx.fillRect(-8, 6 + stride, 1, 1);
        ctx.fillRect(7, 6 - stride, 1, 1);
        ctx.fillStyle = '#414541';
        ctx.fillRect(-11, 1, 2, 2);
        ctx.fillRect(9, 1, 2, 2);
        ctx.fillRect(-7, -3, 3, 1);
        ctx.fillRect(4, -3, 3, 1);
        ctx.fillRect(-6, 5 + stride, 2, 1);
        ctx.fillRect(4, 5 - stride, 2, 1);
        ctx.fillStyle = '#7a7970';
        ctx.fillRect(-10, 2, 1, 1);
        ctx.fillRect(10, 2, 1, 1);
        ctx.fillRect(-6, 5 + stride, 1, 1);
        ctx.fillRect(5, 5 - stride, 1, 1);
        ctx.fillStyle = '#292c2d';
        ctx.fillRect(-14, -3, 2, 4);
        ctx.fillRect(12, -3, 2, 4);
        ctx.fillStyle = '#70716b';
        ctx.fillRect(-13, -3, 1, 2);
        ctx.fillRect(12, -3, 1, 2);
        ctx.fillStyle = '#373a3a';
        ctx.fillRect(-6, 10 + stride, 4, 2);
        ctx.fillRect(2, 10 - stride, 4, 2);
        ctx.fillStyle = '#626460';
        ctx.fillRect(-6, 10 + stride, 3, 1);
        ctx.fillRect(2, 10 - stride, 3, 1);
        ctx.fillStyle = '#4b504f';
        ctx.fillRect(-5, 11 + stride, 2, 1);
        ctx.fillRect(3, 11 - stride, 2, 1);
        ctx.fillRect(-10, 7 + stride, 2, 1);
        ctx.fillRect(8, 7 - stride, 2, 1);
        ctx.fillStyle = '#ff7627';
        ctx.fillRect(0, 12, 1, 1);

        ctx.fillStyle = '#373a3a';
        ctx.fillRect(-13, -1, 2, 5);
        ctx.fillRect(11, -1, 2, 5);
        ctx.fillRect(-10, 3, 20, 1);
        ctx.fillRect(-9, 8 + stride, 18, 1);
        ctx.fillStyle = '#7a7970';
        ctx.fillRect(-11, -2, 1, 2);
        ctx.fillRect(10, -2, 1, 2);
        ctx.fillRect(-8, 4, 3, 1);
        ctx.fillRect(5, 4, 3, 1);

        // A round, stepped stone head sits above the broad body.
        ctx.fillStyle = '#1d1916';
        ctx.fillRect(-4, -15, 8, 2);
        ctx.fillRect(-7, -13, 14, 2);
        ctx.fillRect(-9, -11, 18, 7);
        ctx.fillRect(-8, -4, 16, 2);
        ctx.fillRect(-6, -2, 12, 2);
        ctx.fillStyle = flash ? '#fff1dc' : '#626460';
        ctx.fillRect(-4, -14, 8, 2);
        ctx.fillRect(-7, -12, 14, 2);
        ctx.fillRect(-8, -10, 16, 5);
        ctx.fillRect(-7, -5, 14, 2);
        ctx.fillRect(-5, -3, 10, 2);
        ctx.fillStyle = flash ? '#fff8e9' : '#7a7970';
        ctx.fillRect(-5, -13, 4, 1);
        ctx.fillRect(2, -12, 4, 1);
        ctx.fillRect(-7, -9, 2, 2);
        ctx.fillRect(6, -8, 2, 2);
        ctx.fillRect(-6, -4, 3, 1);
        ctx.fillRect(3, -3, 2, 1);
        ctx.fillStyle = '#373a3a';
        ctx.fillRect(-8, -5, 16, 1);
        ctx.fillRect(-6, -2, 12, 1);
        ctx.fillStyle = '#929188';
        ctx.fillRect(-6, -12, 3, 1);
        ctx.fillRect(2, -11, 3, 1);
        ctx.fillRect(-8, -9, 1, 2);
        ctx.fillStyle = '#4b504f';
        ctx.fillRect(-8, -7, 2, 1);
        ctx.fillRect(6, -6, 2, 1);
        ctx.fillRect(-7, -3, 2, 1);
        ctx.fillStyle = '#929188';
        ctx.fillRect(-4, -14, 2, 1);
        ctx.fillRect(2, -13, 2, 1);
        ctx.fillRect(-9, -10, 1, 2);
        ctx.fillRect(8, -9, 1, 2);
        ctx.fillStyle = '#414541';
        ctx.fillRect(-5, -11, 2, 1);
        ctx.fillRect(3, -10, 2, 1);
        ctx.fillRect(-7, -6, 2, 1);
        ctx.fillRect(5, -5, 2, 1);
        ctx.fillStyle = '#7a7970';
        ctx.fillRect(-6, -11, 1, 1);
        ctx.fillRect(4, -10, 1, 1);

        // Glowing eyes and a jaw that moves independently of the attack animation.
        ctx.fillStyle = '#30221b';
        ctx.fillRect(-6, -8, 4, 3);
        ctx.fillRect(2, -8, 4, 3);
        ctx.fillStyle = '#b83b1d';
        ctx.fillRect(-5, -7, 3, 2);
        ctx.fillRect(2, -7, 3, 2);
        ctx.fillStyle = '#ff7627';
        ctx.fillRect(-4, -7, 2, 1);
        ctx.fillRect(3, -7, 2, 1);
        ctx.fillStyle = '#fff0a0';
        ctx.fillRect(-3, -7, 1, 1);
        ctx.fillRect(4, -7, 1, 1);
        ctx.fillStyle = '#373a3a';
        ctx.fillRect(-7, -9, 2, 1);
        ctx.fillRect(5, -9, 2, 1);
        ctx.fillRect(-5, -10, 3, 1);
        ctx.fillRect(2, -10, 3, 1);
        ctx.fillStyle = '#ffb33e';
        ctx.fillRect(-4, -6, 1, 1);
        ctx.fillRect(3, -6, 1, 1);
        ctx.fillStyle = '#1b100d';
        ctx.fillRect(-4, -3, 8, 3 + jawOpen);
        ctx.fillStyle = '#f6501e';
        ctx.fillRect(-3, -2, 6, 1);
        ctx.fillRect(-2, -1, 4, 1 + lavaPulse);
        ctx.fillStyle = '#ffe27a';
        ctx.fillRect(-1, -2, 2, 1);
        ctx.fillStyle = flash ? '#fff1dc' : '#626460';
        ctx.fillRect(-6, jawOpen - 1, 12, 3);
        ctx.fillRect(-4, jawOpen + 2, 8, 2);
        ctx.fillStyle = flash ? '#fff8e9' : '#7a7970';
        ctx.fillRect(-5, jawOpen - 1, 3, 1);
        ctx.fillRect(3, jawOpen - 1, 2, 1);
        ctx.fillStyle = '#373a3a';
        ctx.fillRect(-5, jawOpen + 1, 10, 1);
        ctx.fillStyle = '#929188';
        ctx.fillRect(-4, jawOpen + 2, 2, 1);
        ctx.fillStyle = '#b83b1d';
        ctx.fillRect(-2, jawOpen + 1, 1, 1);
        ctx.fillRect(2, jawOpen + 1, 1, 1);
        ctx.fillStyle = '#ff7627';
        ctx.fillRect(-3, jawOpen + 2, 1, 1);
        ctx.fillRect(3, jawOpen + 2, 1, 1);

        // Bright magma cracks run down the chest and across both arms.
        ctx.fillStyle = '#391d16';
        ctx.fillRect(-2, -1, 4, 9);
        ctx.fillRect(-7, 0, 2, 5);
        ctx.fillRect(5, -1, 2, 5);
        ctx.fillRect(-11, 0, 2, 4);
        ctx.fillRect(9, 0, 2, 4);
        ctx.fillStyle = '#b83b1d';
        ctx.fillRect(-1, 0, 2, 8);
        ctx.fillRect(-6, 1, 1, 4);
        ctx.fillRect(5, 0, 1, 4);
        ctx.fillRect(-10, 1, 1, 3);
        ctx.fillRect(9, 1, 1, 3);
        ctx.fillStyle = '#ff7627';
        ctx.fillRect(0, 1, 1, 6);
        ctx.fillRect(-5, 2, 1, 3);
        ctx.fillRect(6, 1, 1, 3);
        ctx.fillRect(-9, 2, 1, 2);
        ctx.fillRect(10, 2, 1, 2);
        ctx.fillStyle = '#b83b1d';
        ctx.fillRect(-10, 4, 1, 2 + lavaPulse);
        ctx.fillRect(9, 4, 1, 2 + lavaPulse);
        ctx.fillRect(-5, 6, 1, 2 + lavaPulse);
        ctx.fillRect(4, 6, 1, 2 + lavaPulse);
        ctx.fillRect(-1, 7, 1, 2 + lavaPulse);
        ctx.fillStyle = '#ff7627';
        ctx.fillRect(-10, 4, 1, 1 + lavaPulse);
        ctx.fillRect(9, 4, 1, 1 + lavaPulse);
        ctx.fillRect(-5, 6, 1, 1 + lavaPulse);
        ctx.fillRect(4, 6, 1, 1 + lavaPulse);
        ctx.fillRect(-1, 7, 1, 1 + lavaPulse);
        ctx.fillStyle = '#ffd36a';
        ctx.fillRect(0, 2 + lavaPulse, 1, 3);
        ctx.fillRect(-5, 2, 1, 2);
        ctx.fillRect(6, 1, 1, 2);
        ctx.fillRect(-9, 2, 1, 1);
        ctx.fillRect(10, 1, 1, 1);
        ctx.fillStyle = '#373a3a';
        ctx.fillRect(-8, 5, 4, 1);
        ctx.fillRect(4, 5, 4, 1);
        ctx.fillRect(-3, 7, 2, 1);
        ctx.fillRect(2, 7, 2, 1);
        ctx.fillStyle = '#929188';
        ctx.fillRect(-10, -1, 3, 1);
        ctx.fillRect(8, -1, 3, 1);

        ctx.fillStyle = '#b83b1d';
        ctx.fillRect(-12, 0, 1, 3);
        ctx.fillRect(11, 0, 1, 3);
        ctx.fillRect(-8, 4, 1, 2);
        ctx.fillRect(7, 4, 1, 2);
        ctx.fillRect(-4, 8 + stride, 1, 2);
        ctx.fillRect(3, 8 - stride, 1, 2);
        ctx.fillStyle = '#ff7627';
        ctx.fillRect(-12, 1, 1, 2);
        ctx.fillRect(11, 1, 1, 2);
        ctx.fillRect(-8, 5, 1, 2);
        ctx.fillRect(7, 5, 1, 2);
        ctx.fillRect(-4, 9 + stride, 1, 2);
        ctx.fillRect(3, 9 - stride, 1, 2);
        ctx.fillStyle = '#ffd36a';
        ctx.fillRect(-12, 1, 1, 1);
        ctx.fillRect(11, 1, 1, 1);
        ctx.fillRect(-8, 5, 1, 1);
        ctx.fillRect(7, 5, 1, 1);
    }

    ctx.restore();
    if (isDragon) {
        for (const fireball of enemy.fireballs) {
            const flicker = (Math.sin(fireball.animTime * 14) + 1) / 2;
            const fireX = fireball.x;
            const fireY = fireball.y;
            ctx.fillStyle = 'rgba(237, 76, 24, 0.24)';
            ctx.fillRect(fireX - 8, fireY - 8, 16, 16);
            ctx.fillStyle = '#9e2d1f';
            ctx.fillRect(fireX - 5, fireY - 5, 10, 10);
            ctx.fillStyle = '#ef6228';
            ctx.fillRect(fireX - 4, fireY - 4, 8, 8);
            ctx.fillRect(fireX - 3, fireY - 7 + flicker, 5, 3);
            ctx.fillRect(fireX - 2, fireY + 4 - flicker, 5, 3);
            ctx.fillStyle = '#ffad38';
            ctx.fillRect(fireX - 3, fireY - 3, 6, 6);
            ctx.fillStyle = '#fff0a0';
            ctx.fillRect(fireX - 1, fireY - 2, 3, 4);
        }
    }
    if (isDragon) {
        drawEnemyAttack(enemy);
    }
}

function drawEnemyAura(enemy) {
    const auraColors = {
        spider: 'rgba(185, 101, 190, 0.18)',
        sootSpider: 'rgba(112, 82, 72, 0.26)',
        matriarch: 'rgba(208, 192, 154, 0.24)',
        troll: 'rgba(132, 190, 103, 0.15)',
        ogre: 'rgba(236, 125, 67, 0.18)',
        ashHound: 'rgba(175, 99, 56, 0.2)',
        stainedSentinel: 'rgba(117, 184, 200, 0.22)'
    };
    const color = enemy.creatureType === 'spider' && enemy.isFemale
        ? 'rgba(205, 130, 190, 0.22)'
        : auraColors[enemy.creatureType];
    if (!color || isVisualHitFlashActive(enemy.hitFlash)) {
        return;
    }
    const centerX = enemy.x + enemy.size / 2;
    const centerY = enemy.y + enemy.size / 2;
    const radius = enemy.size * (enemy.creatureType === 'ogre' ? 1.2 : 0.9);
    drawPixelGlow(centerX, centerY, radius, color, 3);
}

function getEnemySpriteScale(enemy, nativeHeight) {
    const height = (enemy.heightBlocks || 1) * tileSize;
    const scale = height / nativeHeight;
    return enemy.heightBlocks === 1 ? Math.min(1, scale) : scale;
}

function getGoblinSpriteScale(enemy) {
    return getEnemySpriteScale(enemy, 100) * 1.15 * 1.15;
}

function snapRenderPixel(value) {
    return Math.round(value * renderPixelScale) / renderPixelScale;
}

function positionEnemySpriteAtHeight(enemy, localBottom, nativeHeight) {
    const scale = getEnemySpriteScale(enemy, nativeHeight);
    ctx.translate(
        snapRenderPixel(enemy.x + enemy.size / 2),
        snapRenderPixel(enemy.y + tileSize - 3)
    );
    ctx.scale(enemy.spriteFacingX * scale, scale);
    ctx.translate(0, -localBottom);
}

function drawFloorNpc(npc) {
    const centerX = npc.x + npc.size / 2;
    const floorY = npc.y + tileSize - 2;
    drawEntityShadow(centerX, floorY, 24, 0.36);
    ctx.save();
    ctx.translate(centerX, floorY);
    const idle = Math.round(Math.sin(performance.now() * 0.004) * 1.1);
    ctx.fillStyle = '#18191d';
    ctx.fillRect(-6, -23 + idle, 12, 17);
    ctx.fillRect(-8, -18 + idle, 16, 11);
    ctx.fillStyle = '#332a25';
    ctx.fillRect(-4, -7, 3, 5);
    ctx.fillRect(1, -7, 3, 5);
    ctx.fillStyle = '#6f4a32';
    ctx.fillRect(-4, -3, 4, 2);
    ctx.fillRect(1, -3, 4, 2);
    ctx.fillStyle = '#d9b795';
    ctx.fillRect(-4, -24 + idle, 8, 7);
    ctx.fillRect(-5, -22 + idle, 2, 4);
    ctx.fillRect(3, -22 + idle, 2, 4);
    ctx.fillStyle = '#4b3329';
    ctx.fillRect(-5, -26 + idle, 10, 3);
    ctx.fillRect(-4, -27 + idle, 8, 2);
    ctx.fillStyle = '#241c1b';
    ctx.fillRect(-3, -22 + idle, 2, 1);
    ctx.fillRect(2, -22 + idle, 2, 1);
    ctx.fillStyle = '#fff0bd';
    ctx.fillRect(-2, -23 + idle, 1, 1);
    ctx.fillRect(2, -23 + idle, 1, 1);
    ctx.fillStyle = '#704632';
    ctx.fillRect(-2, -19 + idle, 4, 1);
    if (npc.id === 'lia') {
        ctx.fillStyle = '#294c4a';
        ctx.fillRect(-5, -18 + idle, 10, 11);
        ctx.fillRect(-7, -15 + idle, 3, 8);
        ctx.fillRect(4, -15 + idle, 3, 8);
        ctx.fillStyle = '#49817a';
        ctx.fillRect(-3, -17 + idle, 6, 7);
        ctx.fillRect(-5, -14 + idle, 10, 3);
        ctx.fillStyle = '#b7d4be';
        ctx.fillRect(-2, -16 + idle, 1, 5);
        ctx.fillRect(1, -15 + idle, 1, 4);
        ctx.fillStyle = '#d8b86c';
        ctx.fillRect(5, -14 + idle, 5, 5);
        ctx.fillStyle = '#f2e3b2';
        ctx.fillRect(6, -13 + idle, 3, 3);
        ctx.fillStyle = '#8b6340';
        ctx.fillRect(6, -12 + idle, 2, 1);
        ctx.fillStyle = '#d3a66d';
        ctx.fillRect(-4, -26 + idle, 8, 2);
        ctx.fillRect(-3, -28 + idle, 6, 2);
        ctx.fillStyle = '#80aaa0';
        ctx.fillRect(-6, -21 + idle, 2, 5);
        ctx.fillRect(4, -21 + idle, 2, 5);
        ctx.fillStyle = '#203b3a';
        ctx.fillRect(-4, -17 + idle, 1, 8);
        ctx.fillRect(3, -17 + idle, 1, 8);
        ctx.fillStyle = '#d5c28a';
        ctx.fillRect(-1, -14 + idle, 2, 3);
        ctx.fillStyle = '#fff0bd';
        ctx.fillRect(-1, -14 + idle, 1, 1);
        ctx.fillStyle = '#654b34';
        ctx.fillRect(5, -14 + idle, 1, 5);
        ctx.fillRect(10, -14 + idle, 1, 5);
        ctx.fillStyle = '#87b9ae';
        ctx.fillRect(-3, -28 + idle, 2, 1);
        ctx.fillRect(2, -27 + idle, 2, 1);
        ctx.fillStyle = '#fff0bd';
        ctx.fillRect(7, -13 + idle, 1, 1);
    } else if (npc.id === 'oren') {
        const forgeFlicker = Math.round(Math.sin(performance.now() * 0.018) * 2);
        ctx.fillStyle = '#49382b';
        ctx.fillRect(-24, -10, 11, 12);
        ctx.fillStyle = '#202020';
        ctx.fillRect(-22, -9, 7, 7);
        ctx.fillStyle = '#b94627';
        ctx.fillRect(-20, -8, 3, 5 + forgeFlicker);
        ctx.fillStyle = '#f6a83c';
        ctx.fillRect(-19, -7, 2, 4 + forgeFlicker);
        ctx.fillStyle = '#654c37';
        ctx.fillRect(11, -6, 12, 4);
        ctx.fillStyle = '#b7b7aa';
        ctx.fillRect(13, -9, 9, 4);
        ctx.fillRect(16, -12, 5, 3);
        ctx.fillStyle = '#49443d';
        ctx.fillRect(14, -2, 2, 4);
        ctx.fillRect(20, -2, 2, 4);
        ctx.fillStyle = '#ffcb68';
        ctx.fillRect(-22, -13 - forgeFlicker, 1, 1);
        ctx.fillRect(-16, -14 + forgeFlicker, 1, 1);
        ctx.fillStyle = '#68402b';
        ctx.fillRect(-6, -18 + idle, 12, 11);
        ctx.fillRect(-8, -15 + idle, 3, 8);
        ctx.fillRect(5, -15 + idle, 3, 8);
        ctx.fillStyle = '#a86d3e';
        ctx.fillRect(-4, -17 + idle, 8, 8);
        ctx.fillStyle = '#d0a45f';
        ctx.fillRect(-3, -16 + idle, 6, 2);
        ctx.fillRect(-2, -12 + idle, 4, 1);
        ctx.fillStyle = '#634333';
        ctx.fillRect(-3, -14 + idle, 6, 5);
        ctx.fillStyle = '#c2b9a2';
        ctx.fillRect(7, -22 + idle, 2, 14);
        ctx.fillRect(4, -24 + idle, 8, 4);
        ctx.fillStyle = '#eef0d6';
        ctx.fillRect(5, -23 + idle, 5, 1);
        ctx.fillStyle = '#92704d';
        ctx.fillRect(-5, -26 + idle, 10, 3);
        ctx.fillRect(-4, -28 + idle, 8, 2);
        ctx.fillStyle = '#aeb8b3';
        ctx.fillRect(-5, -27 + idle, 10, 1);
        ctx.fillStyle = '#76543b';
        ctx.fillRect(-3, -8, 7, 2);
        ctx.fillStyle = '#3d3029';
        ctx.fillRect(-3, -20 + idle, 6, 2);
        ctx.fillRect(-4, -19 + idle, 8, 2);
        ctx.fillStyle = '#8b5a37';
        ctx.fillRect(-3, -19 + idle, 6, 1);
        ctx.fillStyle = '#d1a26d';
        ctx.fillRect(-1, -21 + idle, 1, 1);
        ctx.fillRect(3, -16 + idle, 1, 1);
        ctx.fillStyle = '#4c3426';
        ctx.fillRect(-4, -16 + idle, 2, 1);
        ctx.fillRect(3, -16 + idle, 2, 1);
        ctx.fillStyle = '#ead9a1';
        ctx.fillRect(6, -22 + idle, 1, 1);
        ctx.fillStyle = '#563b2b';
        ctx.fillRect(-3, -10 + idle, 6, 1);
        ctx.fillStyle = '#d0a45f';
        ctx.fillRect(-2, -10 + idle, 1, 1);
    } else {
        ctx.fillStyle = '#26354b';
        ctx.fillRect(-5, -18 + idle, 10, 11);
        ctx.fillRect(-8, -16 + idle, 4, 9);
        ctx.fillRect(5, -16 + idle, 4, 9);
        ctx.fillStyle = '#496782';
        ctx.fillRect(-3, -17 + idle, 6, 8);
        ctx.fillStyle = '#d8b86a';
        ctx.fillRect(-1, -16 + idle, 2, 5);
        ctx.fillRect(-4, -12 + idle, 8, 1);
        ctx.fillStyle = '#8f4735';
        ctx.fillRect(-7, -16 + idle, 3, 10);
        ctx.fillRect(4, -16 + idle, 3, 10);
        ctx.fillStyle = '#c77a4c';
        ctx.fillRect(-6, -15 + idle, 1, 6);
        ctx.fillRect(5, -15 + idle, 1, 6);
        ctx.fillStyle = '#d7b78a';
        ctx.fillRect(-5, -26 + idle, 10, 3);
        ctx.fillRect(-4, -28 + idle, 8, 2);
        ctx.fillStyle = '#29364a';
        ctx.fillRect(-6, -23 + idle, 2, 7);
        ctx.fillRect(4, -23 + idle, 2, 7);
        ctx.fillStyle = '#6c4935';
        ctx.fillRect(7, -18 + idle, 2, 9);
        ctx.fillRect(5, -20 + idle, 6, 3);
        ctx.fillStyle = '#f1d583';
        ctx.fillRect(7, -17 + idle, 2, 4);
        ctx.fillStyle = '#fff0a8';
        ctx.fillRect(7, -16 + idle, 1, 2);
        ctx.fillStyle = 'rgba(255, 195, 91, 0.22)';
        ctx.fillRect(4, -20 + idle, 8, 8);
        ctx.fillStyle = '#1b293b';
        ctx.fillRect(-4, -17 + idle, 1, 8);
        ctx.fillRect(3, -17 + idle, 1, 8);
        ctx.fillStyle = '#d6c98a';
        ctx.fillRect(-1, -14 + idle, 2, 3);
        ctx.fillStyle = '#f6df9a';
        ctx.fillRect(-1, -14 + idle, 1, 1);
        ctx.fillStyle = '#e0b56c';
        ctx.fillRect(-6, -18 + idle, 1, 2);
        ctx.fillRect(5, -18 + idle, 1, 2);
        ctx.fillStyle = '#f1d583';
        ctx.fillRect(8, -16 + idle, 1, 1);
        ctx.fillStyle = '#d7b78a';
        ctx.fillRect(-2, -27 + idle, 2, 1);
    }
    if (npc.id === 'lia') {
        ctx.fillStyle = '#183330';
        ctx.fillRect(4, -17 + idle, 2, 7);
        ctx.fillRect(5, -12 + idle, 4, 2);
        ctx.fillStyle = '#9ac7b2';
        ctx.fillRect(4, -17 + idle, 1, 5);
        ctx.fillRect(6, -12 + idle, 2, 1);
        ctx.fillStyle = '#f4d988';
        ctx.fillRect(7, -13 + idle, 1, 1);
        ctx.fillRect(7, -12 + idle, 1, 1);
        ctx.fillRect(6, -12 + idle, 3, 1);
    } else if (npc.id === 'oren') {
        ctx.fillStyle = '#432b20';
        ctx.fillRect(-3, -13 + idle, 6, 6);
        ctx.fillStyle = '#a86d3e';
        ctx.fillRect(-2, -12 + idle, 4, 4);
        ctx.fillStyle = '#d5a45f';
        ctx.fillRect(-1, -12 + idle, 1, 3);
        ctx.fillRect(1, -10 + idle, 1, 2);
        ctx.fillStyle = '#d9d2c2';
        ctx.fillRect(8, -23 + idle, 1, 7);
        ctx.fillRect(8, -24 + idle, 4, 1);
        ctx.fillStyle = '#68716e';
        ctx.fillRect(10, -23 + idle, 2, 2);
        ctx.fillStyle = '#f4e5c2';
        ctx.fillRect(8, -23 + idle, 1, 2);
    } else {
        ctx.fillStyle = '#4b2c2c';
        ctx.fillRect(-6, -17 + idle, 2, 8);
        ctx.fillRect(5, -17 + idle, 2, 8);
        ctx.fillStyle = '#d18a58';
        ctx.fillRect(-6, -15 + idle, 1, 5);
        ctx.fillRect(5, -15 + idle, 1, 5);
        ctx.fillStyle = '#ffe69a';
        ctx.fillRect(7, -18 + idle, 1, 2);
        ctx.fillRect(8, -17 + idle, 1, 2);
        ctx.fillStyle = '#e28d3d';
        ctx.fillRect(7, -15 + idle, 1, 1);
    }
    ctx.fillStyle = '#312720';
    ctx.fillRect(-4, -2, 4, 1);
    ctx.fillRect(1, -2, 4, 1);
    ctx.restore();
    if (getNearbyFloorNpc() === npc) {
        ctx.font = '6px monospace';
        ctx.textAlign = 'center';
        const label = `${npc.name} · G`;
        const width = Math.ceil(ctx.measureText(label).width) + 6;
        ctx.fillStyle = 'rgba(20, 17, 22, 0.9)';
        ctx.fillRect(centerX - width / 2 - 1, floorY - 38, width + 2, 10);
        ctx.strokeStyle = npc.color;
        ctx.lineWidth = 1 / renderPixelScale;
        ctx.strokeRect(centerX - width / 2 - 1, floorY - 38, width + 2, 10);
        ctx.fillStyle = '#fff4da';
        ctx.fillText(label, centerX, floorY - 31);
        ctx.textAlign = 'start';
    }
}

function drawEnemy(enemy) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.filter = 'contrast(1.32) saturate(1.16)';
    try {
        drawEnemyBody(enemy);
    } finally {
        ctx.restore();
    }
}

function getGoblinAnimationState(enemy) {
    if (enemy.dying) {
        return {
            name: 'death',
            progress: 1 - enemy.deathTimer / (enemy.deathAnimationDuration || 0.8)
        };
    }
    if (enemy.painTimer > 0) {
        return { name: 'takeDamage', progress: 1 - enemy.painTimer / 0.2 };
    }
    if (enemy.potionAction) {
        const animationName = enemy.potionAction === 'carry'
            ? 'carryItem'
            : enemy.potionAction === 'use' ? 'useItem' : enemy.potionAction;
        return {
            name: animationName,
            progress: 1 - enemy.potionActionTimer / enemy.potionActionDuration
        };
    }
    if (enemy.dodgeTimer > 0) {
        return { name: 'crouch', progress: 1 - enemy.dodgeTimer / 0.36 };
    }
    if (enemy.jumpTimer > 0) {
        return { name: 'jump', progress: 1 - enemy.jumpTimer / 0.36 };
    }
    if (enemy.defendTimer > 0 || enemy.shieldRaised) {
        return { name: 'defend', progress: 1 - enemy.defendTimer / 0.35 };
    }
    if (enemy.attackTimer > 0) {
        const attackId = enemy.creatureType === 'goblinRunner'
            ? 'passing-thrust'
            : 'scrap-slash';
        const attack = getCreatureAttackData(enemy, attackId);
        const duration = attack.warning + attack.execution;
        return {
            name: enemy.shieldDurability > 0 ? 'shieldAttack' : 'bladeAttack',
            progress: 1 - enemy.attackTimer / duration
        };
    }
    if (enemy.moving) {
        return {
            name: enemy.creatureType === 'goblinRunner' ? 'run' : 'walk',
            progress: enemy.animTime * 1.6,
            loop: true
        };
    }
    return { name: 'idle', progress: enemy.animTime * 0.8, loop: true };
}

function getGoblinAnimationFrameIndex(animation, state) {
    if (animation.loop || state.loop) {
        return Math.floor(
            state.progress * goblinAnimationSpeedMultiplier * animation.frames.length
        ) % animation.frames.length;
    }
    return Math.min(
        animation.frames.length - 1,
        Math.floor(Math.max(0, Math.min(0.99999, state.progress)) * animation.frames.length)
    );
}

function usesSpiderAnimation(enemy) {
    return ['spider', 'sootSpider', 'matriarch'].includes(enemy.creatureType);
}

function getSpiderAnimationState(enemy) {
    if (enemy.dying) {
        const progress = Math.max(0, Math.min(
            1,
            1 - enemy.deathTimer / (enemy.deathAnimationDuration || spiderDeathAnimationDuration)
        ));
        if (enemy.creatureType === 'sootSpider') {
            return { name: 'death', progress };
        }
        const explosionStart = 0.72;
        return progress < explosionStart
            ? { name: 'dying', progress: progress / explosionStart }
            : {
                name: 'deathExplosion',
                progress: (progress - explosionStart) / (1 - explosionStart)
            };
    }
    if (enemy.creatureType !== 'sootSpider' && enemy.painTimer > 0) {
        return { name: 'takeDamage', progress: 1 - enemy.painTimer / 0.2 };
    }
    if (enemy.spiderWebTimer > 0) {
        const attackId = enemy.creatureType === 'matriarch'
            ? 'web-capture'
            : enemy.creatureType === 'sootSpider' ? 'soot-thread' : 'capture-thread';
        const attack = getCreatureAttackData(enemy, attackId);
        const duration = attack.warning + attack.execution;
        return {
            name: enemy.creatureType === 'sootSpider' ? 'spitWeb' : 'webAttack',
            progress: 1 - enemy.spiderWebTimer / duration
        };
    }
    if (enemy.spiderLeapTimer > 0) {
        const attackId = enemy.creatureType === 'matriarch'
            ? 'collapse-leap'
            : enemy.creatureType === 'sootSpider' ? 'abrasive-leap' : 'rift-leap';
        const attack = getCreatureAttackData(enemy, attackId);
        const duration = attack.warning + attack.execution;
        const progress = 1 - enemy.spiderLeapTimer / duration;
        if (enemy.creatureType === 'sootSpider') {
            return { name: 'jump', progress };
        }
        const warningProgress = attack.warning / duration;
        return progress < warningProgress
            ? { name: 'prepareJump', progress: progress / warningProgress }
            : {
                name: 'jump',
                progress: (progress - warningProgress) / (1 - warningProgress)
            };
    }
    if (enemy.attackTimer > 0) {
        return {
            name: enemy.creatureType === 'sootSpider' ? 'attack' : 'jump',
            progress: 1 - enemy.attackTimer / 0.24
        };
    }
    if (enemy.moving) {
        const distanceToPlayer = Math.hypot(
            enemy.x + enemy.size / 2 - (player.x + player.size / 2),
            enemy.y + enemy.size / 2 - (player.y + player.size / 2)
        );
        return {
            name: enemy.creatureType === 'sootSpider'
                ? enemy.speed >= 35 && distanceToPlayer > tileSize * 4 ? 'run' : 'walk'
                : enemy.spriteFacingX < 0 ? 'walkLeft' : 'walkRight',
            progress: enemy.animTime * 1.6,
            loop: true
        };
    }
    return { name: 'idle', progress: enemy.animTime * 0.8, loop: true };
}

function getSpiderAnimationAssets(enemy) {
    if (enemy.creatureType === 'sootSpider') {
        return { spriteSheet: sootSpiderAnimationSheet, frameMap: sootSpiderAnimationFrameMap };
    }
    if (enemy.creatureType === 'matriarch') {
        return {
            spriteSheet: matriarchSpiderAnimationSheet,
            frameMap: matriarchSpiderAnimationFrameMap
        };
    }
    return { spriteSheet: spiderAnimationSheet, frameMap: spiderAnimationFrameMap };
}

function getSpiderAnimationFrameIndex(animation, state) {
    if (animation.loop || state.loop) {
        return Math.floor(
            state.progress * spiderAnimationSpeedMultiplier * animation.frames.length
        ) % animation.frames.length;
    }
    return Math.min(
        animation.frames.length - 1,
        Math.floor(Math.max(0, Math.min(0.99999, state.progress)) * animation.frames.length)
    );
}

function drawSpiderSpriteSheetAnimation(enemy) {
    const { spriteSheet, frameMap: animationFrameMap } = getSpiderAnimationAssets(enemy);
    if (!spriteSheet.complete || spriteSheet.naturalWidth === 0) {
        return false;
    }
    const state = getSpiderAnimationState(enemy);
    const animation = animationFrameMap[state.name];
    const frameIndex = getSpiderAnimationFrameIndex(animation, state);
    const frame = animation.frames[frameIndex];
    const sourceWidth = frame[2];
    const sourceHeight = frame[3];
    const crop = getAnimationFrameCrop(
        spriteSheet,
        animationFrameMap,
        state.name,
        frameIndex
    );
    const scale = getEnemySpriteScale(enemy, 100);
    const filters = [];
    if (isVisualHitFlashActive(enemy.hitFlash)) {
        filters.push('brightness(1.7)');
    }
    if (enemy.isFemale && enemy.creatureType !== 'matriarch') {
        filters.push('hue-rotate(25deg)', 'saturate(1.2)');
    }
    filters.push('contrast(1.32)', 'saturate(1.16)');

    ctx.save();
    ctx.filter = filters.join(' ');
    ctx.translate(
        snapRenderPixel(enemy.x + enemy.size / 2),
        snapRenderPixel(enemy.y + tileSize - 3)
    );
    const hasDirectionalFrames = ['walkLeft', 'walkRight'].includes(state.name);
    ctx.scale(
        (hasDirectionalFrames ? 1 : enemy.spriteFacingX) * scale,
        scale
    );
    ctx.drawImage(
        spriteSheet,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        -(frame[4] ?? sourceWidth / 2) + crop.offsetX,
        -(frame[5] ?? sourceHeight) + crop.offsetY,
        crop.width,
        crop.height
    );
    ctx.restore();
    return true;
}

function drawGoblinAnimation(enemy, spriteSheet, animationFrameMap) {
    if (!spriteSheet.complete || spriteSheet.naturalWidth === 0) {
        return false;
    }
    const state = getGoblinAnimationState(enemy);
    const animation = animationFrameMap[state.name];
    if (!animation) {
        throw new Error(`Animação de goblin desconhecida: ${state.name}.`);
    }
    const frameIndex = getGoblinAnimationFrameIndex(animation, state);
    const [sourceX, sourceY, sourceWidth, sourceHeight] = animation.frames[frameIndex];
    const crop = getAnimationFrameCrop(
        spriteSheet,
        animationFrameMap,
        state.name,
        frameIndex
    );
    const scale = getGoblinSpriteScale(enemy);
    ctx.save();
    ctx.translate(
        snapRenderPixel(enemy.x + enemy.size / 2),
        snapRenderPixel(enemy.y + tileSize - 3)
    );
    ctx.scale(enemy.spriteFacingX * scale, scale);
    ctx.drawImage(
        spriteSheet,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        -sourceWidth / 2 + crop.offsetX,
        -sourceHeight + crop.offsetY,
        crop.width,
        crop.height
    );
    ctx.restore();
    return true;
}

function usesGoblinAnimation(enemy) {
    return enemy.creatureType === 'goblin' || enemy.creatureType === 'goblinRunner';
}

function getGoblinAnimationAssets(enemy) {
    return enemy.creatureType === 'goblinRunner'
        ? { spriteSheet: goblinRunnerAnimationSheet, frameMap: goblinRunnerAnimationFrameMap }
        : { spriteSheet: goblinAnimationSheet, frameMap: goblinAnimationFrameMap };
}

function hasGoblinSpriteAttackAnimation(enemy) {
    if (!usesGoblinAnimation(enemy)) {
        return false;
    }
    const { spriteSheet, frameMap } = getGoblinAnimationAssets(enemy);
    return spriteSheet.complete
        && spriteSheet.naturalWidth > 0
        && frameMap.bladeAttack.frames.length > 0;
}

function drawEnemyBody(enemy) {
    const enemyShadowCenterX = enemy.x + enemy.size / 2;
    drawEntityShadow(
        enemyShadowCenterX,
        enemy.isBoss ? enemy.y + enemy.size : enemy.y + tileSize - 2,
        enemy.isBoss ? 44 : Math.min(38, enemy.size * 1.3),
        enemy.isBoss ? 0.38 : 0.32
    );
    if (enemy.isBoss) {
        drawBoss(enemy);
        return;
    }

    drawEnemyAura(enemy);
    const visualHeight = (enemy.heightBlocks || 1) * tileSize;
    const screenX = enemy.x + enemy.size / 2 - 8;
    const floorY = enemy.y + tileSize - 3;
    const screenY = floorY - visualHeight - 5;
    const goblinAnimationAssets = getGoblinAnimationAssets(enemy);
    if (usesGoblinAnimation(enemy)
        && drawGoblinAnimation(enemy, goblinAnimationAssets.spriteSheet, goblinAnimationAssets.frameMap)) {
        drawEnemyStatusMarkers(enemy, screenX, screenY);
        drawEnemyAttack(enemy);
        return;
    }
    if (['veinBat', 'basaltLizard', 'facelessScribe'].includes(enemy.creatureType)) {
        const pain = isVisualHitFlashActive(enemy.hitFlash);
        ctx.save();
        if (enemy.creatureType === 'facelessScribe') {
            positionEnemySpriteAtHeight(enemy, 31, 31);
            ctx.fillStyle = pain ? '#eee5f2' : '#1c1724';
            ctx.fillRect(-6, -29, 12, 27);
            ctx.fillRect(-8, -23, 16, 17);
            ctx.fillStyle = pain ? '#ffffff' : '#514360';
            ctx.fillRect(-5, -28, 10, 23);
            ctx.fillRect(-7, -21, 14, 11);
            ctx.fillStyle = '#211b2a';
            ctx.fillRect(-10, -20, 3, 10);
            ctx.fillRect(7, -20, 3, 10);
            ctx.fillStyle = '#c4a4ef';
            ctx.fillRect(-2, -26, 4, 9);
            ctx.fillRect(-1, -18, 2, 5);
            ctx.fillStyle = '#17131e';
            ctx.fillRect(-3, -28, 6, 6);
            ctx.fillStyle = enemy.glyphWarning > 0 ? '#f5d6ff' : '#8c6aac';
            ctx.fillRect(-1, -26, 2, 2);
            ctx.fillStyle = '#d7c0ef';
            ctx.fillRect(-4, -15, 2, 8);
            ctx.fillRect(3, -13, 2, 7);
            ctx.fillStyle = '#31263c';
            ctx.fillRect(-5, -5, 4, 3);
            ctx.fillRect(1, -5, 4, 3);
            ctx.fillStyle = '#b28bd7';
            ctx.fillRect(-6, -27, 1, 15);
            ctx.fillRect(5, -25, 1, 14);
            ctx.fillStyle = '#342a40';
            ctx.fillRect(-6, -5, 5, 3);
            ctx.fillRect(1, -5, 5, 3);
            ctx.fillStyle = '#211b2a';
            ctx.fillRect(-7, -27, 2, 16);
            ctx.fillRect(5, -26, 2, 15);
            ctx.fillStyle = '#7e669b';
            ctx.fillRect(-4, -23, 1, 7);
            ctx.fillRect(3, -20, 1, 5);
            ctx.fillStyle = '#e6d4ff';
            ctx.fillRect(-3, -14, 1, 1);
            ctx.fillRect(2, -11, 1, 1);
            ctx.fillStyle = '#7b5d91';
            ctx.fillRect(-7, -4, 3, 1);
            ctx.fillRect(4, -3, 3, 1);
            ctx.fillStyle = '#c4a4ef';
            ctx.fillRect(-3, -8, 1, 2);
            ctx.fillRect(2, -7, 1, 2);
            ctx.fillStyle = enemy.glyphWarning > 0 ? '#fff4bd' : '#9a7cb6';
            ctx.fillRect(-2, -25, 1, 1);
            ctx.fillRect(1, -23, 1, 1);
            ctx.fillRect(0, -20, 1, 1);
            ctx.fillStyle = pain ? '#ffffff' : '#c4a4ef';
            ctx.fillRect(-5, -11, 1, 4);
            ctx.fillRect(4, -10, 1, 3);
            ctx.fillRect(-3, -7, 6, 1);
        } else {
            positionEnemySpriteAtHeight(enemy, 15, 16);
            if (enemy.creatureType === 'veinBat') {
                const flap = enemy.echoWaveWarning > 0 ? 2 : Math.round(Math.sin(enemy.animTime * 14) * 2);
                ctx.fillStyle = pain ? '#f2e8dd' : '#28212e';
                ctx.fillRect(-5, -7, 10, 7);
                ctx.fillRect(-3, -10, 6, 6);
                ctx.fillRect(-4, -12, 2, 3);
                ctx.fillRect(2, -12, 2, 3);
                ctx.fillRect(-13, -9 - flap, 7, 3);
                ctx.fillRect(-11, -6, 5, 5);
                ctx.fillRect(6, -9 - flap, 7, 3);
                ctx.fillRect(6, -6, 5, 5);
                ctx.fillStyle = '#514052';
                ctx.fillRect(-10, -8 - flap, 5, 2);
                ctx.fillRect(5, -8 - flap, 5, 2);
                ctx.fillStyle = '#77566e';
                ctx.fillRect(-12, -7 - flap, 4, 1);
                ctx.fillRect(8, -7 - flap, 4, 1);
                ctx.fillStyle = '#342333';
                ctx.fillRect(-4, -4, 2, 3);
                ctx.fillRect(2, -4, 2, 3);
                ctx.fillStyle = '#d8a85e';
                ctx.fillRect(-2, -8, 1, 1);
                ctx.fillRect(1, -8, 1, 1);
                ctx.fillStyle = '#f4deb2';
                ctx.fillRect(-1, -2, 1, 1);
                ctx.fillRect(1, -2, 1, 1);
                ctx.fillStyle = '#17131c';
                ctx.fillRect(-13, -7 - flap, 2, 5);
                ctx.fillRect(11, -7 - flap, 2, 5);
                ctx.fillStyle = '#77566e';
                ctx.fillRect(-9, -6 - flap, 1, 3);
                ctx.fillRect(-6, -7 - flap, 1, 4);
                ctx.fillRect(5, -7 - flap, 1, 4);
                ctx.fillRect(8, -6 - flap, 1, 3);
                ctx.fillStyle = '#d8a85e';
                ctx.fillRect(-6, -9, 1, 1);
                ctx.fillRect(5, -9, 1, 1);
                ctx.fillStyle = '#f4deb2';
                ctx.fillRect(-1, -7, 1, 1);
                ctx.fillRect(1, -7, 1, 1);
                ctx.fillStyle = '#342333';
                ctx.fillRect(-1, -3, 2, 2);
                ctx.fillStyle = '#b27977';
                ctx.fillRect(-2, -5, 1, 1);
                ctx.fillRect(2, -5, 1, 1);
                ctx.fillStyle = '#d8a85e';
                ctx.fillRect(-10, -5 - flap, 2, 1);
                ctx.fillRect(8, -5 - flap, 2, 1);
                ctx.fillStyle = '#f4deb2';
                ctx.fillRect(-8, -4 - flap, 1, 1);
                ctx.fillRect(7, -4 - flap, 1, 1);
            } else {
                ctx.fillStyle = pain ? '#f3e8d8' : '#292725';
                ctx.fillRect(-13, -3, 7, 2);
                ctx.fillRect(-7, -7, 14, 7);
                ctx.fillRect(-4, -11, 9, 6);
                ctx.fillRect(5, -3, 8, 2);
                ctx.fillRect(-5, -1, 3, 3);
                ctx.fillRect(3, -1, 3, 3);
                ctx.fillStyle = '#62564b';
                ctx.fillRect(-6, -8, 12, 4);
                ctx.fillRect(-3, -12, 7, 3);
                ctx.fillRect(-11, -2, 4, 1);
                ctx.fillRect(7, -2, 4, 1);
                ctx.fillStyle = '#e17b35';
                ctx.fillRect(-4, -8, 2, 1);
                ctx.fillRect(2, -9, 2, 1);
                ctx.fillRect(4, -6, 2, 1);
                ctx.fillRect(-9, -4, 1, 1);
                ctx.fillRect(8, -4, 1, 1);
                ctx.fillStyle = '#191817';
                ctx.fillRect(-2, -10, 2, 1);
                ctx.fillStyle = '#a64c27';
                ctx.fillRect(-2, -5, 1, 1);
                ctx.fillRect(1, -4, 1, 1);
                ctx.fillStyle = '#191817';
                ctx.fillRect(-10, -5, 3, 1);
                ctx.fillRect(6, -6, 3, 1);
                ctx.fillStyle = '#d39a58';
                ctx.fillRect(-7, -6, 1, 1);
                ctx.fillRect(4, -7, 1, 1);
                ctx.fillStyle = '#292725';
                ctx.fillRect(-8, -1, 5, 1);
                ctx.fillRect(3, -1, 5, 1);
                ctx.fillStyle = '#9b4730';
                ctx.fillRect(-8, -3, 2, 1);
                ctx.fillRect(5, -4, 2, 1);
                ctx.fillStyle = '#e17b35';
                ctx.fillRect(-3, -7, 1, 1);
                ctx.fillRect(1, -8, 1, 1);
                ctx.fillStyle = '#191817';
                ctx.fillRect(-4, -10, 2, 1);
                ctx.fillRect(-1, -11, 2, 1);
                ctx.fillRect(2, -10, 2, 1);
                ctx.fillStyle = '#8a7863';
                ctx.fillRect(-5, -8, 2, 1);
                ctx.fillRect(-2, -9, 2, 1);
                ctx.fillRect(1, -9, 2, 1);
                ctx.fillStyle = '#d7a260';
                ctx.fillRect(-4, -7, 1, 1);
                ctx.fillRect(0, -8, 1, 1);
                ctx.fillRect(3, -7, 1, 1);
                ctx.fillStyle = '#392d25';
                ctx.fillRect(-7, 0, 3, 1);
                ctx.fillRect(4, 0, 3, 1);
                ctx.fillStyle = '#e17b35';
                ctx.fillRect(-7, 1, 1, 1);
                ctx.fillRect(6, 1, 1, 1);
                ctx.fillStyle = pain ? '#ffffff' : '#858073';
                ctx.fillRect(-5, -6, 2, 1);
                ctx.fillRect(-2, -8, 2, 1);
                ctx.fillRect(2, -7, 2, 1);
                ctx.fillStyle = '#277f84';
                ctx.fillRect(-1, -10, 2, 1);
                ctx.fillRect(0, -9, 1, 2);
            }
        }
        ctx.restore();
        drawEnemyStatusMarkers(enemy, screenX, screenY);
        drawEnemyAttack(enemy);
        return;
    }
    if (enemy.creatureType === 'ogre' && (enemy.slamWarning > 0 || enemy.slamImpactTimer > 0)) {
        const centerX = enemy.x + enemy.size / 2;
        const centerY = enemy.y + enemy.size / 2;
        const impactProgress = enemy.slamImpactTimer > 0 ? 1 - enemy.slamImpactTimer / 0.3 : 0;
        const pulse = getVisualPulse(enemy.animTime, 24);
        ctx.save();
        ctx.globalAlpha = enemy.slamWarning > 0 ? 0.28 + pulse * 0.2 : 0.6 * (1 - impactProgress);
        ctx.fillStyle = enemy.slamWarning > 0 ? '#ef762f' : '#f3c76a';
        ctx.strokeStyle = enemy.slamWarning > 0 ? '#ffd275' : '#fff0b0';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(centerX, centerY + 3, ogreSlamRadius + impactProgress * 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
    if (enemy.creatureType === 'ashHound' && enemy.dogPounceWarning > 0) {
        const centerX = enemy.x + enemy.size / 2;
        const centerY = enemy.y + enemy.size / 2;
        ctx.save();
        ctx.globalAlpha = 0.45 + (getVisualPulse(enemy.animTime, 28) - 0.5) * 0.3;
        ctx.strokeStyle = '#f1a65f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + enemy.dogPounceX * 38, centerY + enemy.dogPounceY * 38);
        ctx.stroke();
        ctx.restore();
    }
    if (enemy.creatureType === 'stainedSentinel' && enemy.sentinelBeamWarning > 0) {
        const centerX = enemy.x + enemy.size / 2;
        const centerY = enemy.y + enemy.size / 2;
        ctx.save();
        ctx.globalAlpha = 0.45 + (getVisualPulse(enemy.animTime, 26) - 0.5) * 0.4;
        ctx.strokeStyle = '#8ee9f0';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + enemy.sentinelBeamDirectionX * 155,
            centerY + enemy.sentinelBeamDirectionY * 155
        );
        ctx.stroke();
        ctx.strokeStyle = '#fff4bd';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
    }

    const healthPercent = Math.max(0, Math.min(1, enemy.displayHealth / enemy.maxHealth));
    const healthBarX = snapRenderPixel(screenX - 1);
    const healthBarY = snapRenderPixel(screenY - 5);
    const healthColor = healthPercent > 0.6
        ? '#79d46c' : healthPercent > 0.3 ? '#e5bd58' : '#ed6958';
    ctx.fillStyle = '#121116';
    ctx.fillRect(healthBarX - 1 / renderPixelScale, healthBarY - 1 / renderPixelScale, 18, 2);
    ctx.fillStyle = '#56302d';
    ctx.fillRect(healthBarX, healthBarY, 16, 4 / renderPixelScale);
    ctx.fillStyle = healthColor;
    ctx.fillRect(
        healthBarX,
        healthBarY,
        Math.max(0, snapRenderPixel(16 * healthPercent)),
        4 / renderPixelScale
    );
    ctx.fillStyle = 'rgba(255, 246, 208, 0.72)';
    ctx.fillRect(
        healthBarX,
        healthBarY,
        Math.max(0, snapRenderPixel(16 * healthPercent)),
        1 / renderPixelScale
    );

    ctx.fillStyle = 'rgba(10, 12, 10, 0.55)';
    ctx.fillRect(screenX + 1, floorY - 2, 12, 2);
    const isFemale = enemy.isFemale === true;
    if (usesSpiderAnimation(enemy)) {
        if (enemy.spiderLeapTimer > 0) {
            ctx.save();
            ctx.globalAlpha = 0.65;
            ctx.strokeStyle = '#d98bdc';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(enemy.x + enemy.size / 2, enemy.y + enemy.size / 2);
            ctx.lineTo(
                enemy.x + enemy.size / 2 + enemy.spiderLeapX,
                enemy.y + enemy.size / 2 + enemy.spiderLeapY
            );
            ctx.stroke();
            ctx.restore();
        }
        if (!drawSpiderSpriteSheetAnimation(enemy)) {
            const step = enemy.moving ? Math.sin(enemy.animTime * 14) : 0;
            ctx.save();
            positionEnemySpriteAtHeight(enemy, 14, 28);
            drawSpiderSprite(
                step,
                enemy.spiderLeapTimer > 0 || enemy.spiderWebTimer > 0,
                isVisualHitFlashActive(enemy.hitFlash),
                isFemale,
                enemy.creatureType === 'sootSpider',
                enemy.creatureType === 'matriarch'
            );
            ctx.restore();
        }
        if (enemy.isMiniBoss) {
            ctx.font = '6px monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#f4dfbb';
            ctx.fillText('MATRIARCA', enemy.x + enemy.size / 2, screenY - 5);
            ctx.textAlign = 'start';
        }
        drawEnemyStatusMarkers(enemy, screenX, screenY);
        drawEnemyAttack(enemy);
        return;
    }
    if (enemy.creatureType === 'ashHound' || enemy.creatureType === 'stainedSentinel') {
        const stride = enemy.moving ? Math.sin(enemy.animTime * 13) * 1.2 : 0;
        ctx.save();
        positionEnemySpriteAtHeight(
            enemy,
            enemy.creatureType === 'ashHound' ? 6 : 10,
            enemy.creatureType === 'ashHound' ? 14 : 19
        );
        if (enemy.painTimer > 0) {
            ctx.translate(0, -1);
        }
        if (enemy.creatureType === 'ashHound') {
            const ashDrift = Math.sin(enemy.animTime * 5) * 0.6;
            const crouch = enemy.dogPounceWarning > 0 ? 2 : 0;
            ctx.fillStyle = '#171514';
            ctx.fillRect(-10, 4, 17, 2);
            ctx.fillRect(-11, -3, 4, 4);
            ctx.fillRect(6, -6, 3, 2);
            ctx.fillStyle = isVisualHitFlashActive(enemy.hitFlash) ? '#f5e9d7' : '#292321';
            ctx.fillRect(-8, -3 + crouch, 12, 7);
            ctx.fillRect(-5, -5 + crouch, 8, 3);
            ctx.fillRect(2, -5, 6, 5);
            ctx.fillRect(5, -7, 3, 3);
            ctx.fillRect(-10, -1 + crouch, 4, 2);
            ctx.fillRect(-3, 2 - stride, 3, 4);
            ctx.fillRect(5, 1 + stride, 3, 4);
            ctx.fillRect(-5, -5 + crouch, 2, 2);
            ctx.fillRect(0, -5 + crouch, 2, 2);
            ctx.fillStyle = isVisualHitFlashActive(enemy.hitFlash) ? '#fff8e9' : '#615047';
            ctx.fillRect(-6, -4 + crouch, 7, 3);
            ctx.fillRect(3, -6, 4, 2);
            ctx.fillRect(-8, 0 + crouch, 8, 2);
            ctx.fillRect(-6, -1 + crouch, 6, 3);
            ctx.fillStyle = '#837267';
            ctx.fillRect(-4, -3 + crouch, 1, 1);
            ctx.fillRect(0, -2 + crouch, 1, 1);
            ctx.fillRect(2, -4, 1, 1);
            ctx.fillStyle = '#a95b37';
            ctx.fillRect(4, -3, 2, 1);
            ctx.fillStyle = '#b58a54';
            ctx.fillRect(-2, -4 + crouch, 5, 1);
            ctx.fillStyle = '#4b3027';
            ctx.fillRect(-9, -1 + crouch, 2, 2);
            ctx.fillRect(-11, -1 + crouch, 3, 1);
            ctx.fillStyle = '#b96c3e';
            ctx.fillRect(-6, -1 + crouch, 1, 1);
            ctx.fillStyle = '#35302d';
            ctx.fillRect(-1, -3 + crouch, 6, 2);
            ctx.fillRect(0, -2 + crouch, 4, 1);
            ctx.fillStyle = '#c79a5c';
            ctx.fillRect(0, -3 + crouch, 1, 1);
            ctx.fillStyle = '#a45b35';
            ctx.fillRect(-9, -4 + crouch, 2, 3);
            ctx.fillRect(-7, -5 + crouch, 2, 2);
            if (enemy.moving || enemy.dogPounceWarning > 0) {
                ctx.fillStyle = `rgba(183, 117, 75, ${0.28 + Math.sin(enemy.animTime * 10) * 0.08})`;
                ctx.fillRect(-12, -6 + ashDrift, 2, 2);
                ctx.fillRect(-9, -8 - ashDrift, 1, 1);
                ctx.fillRect(-5, -7 + ashDrift, 1, 1);
            }
            if (enemy.dogPounceWarning > 0) {
                ctx.fillStyle = '#f6c477';
                ctx.fillRect(5, -1, 1, 1);
                ctx.fillRect(7, -2, 1, 1);
            }
            ctx.fillStyle = '#37251f';
            ctx.fillRect(-6, -1 + crouch, 9, 2);
            ctx.fillRect(-5, 1 + crouch, 7, 1);
            ctx.fillStyle = '#b58a54';
            ctx.fillRect(-4, -1 + crouch, 1, 2);
            ctx.fillRect(1, -1 + crouch, 1, 2);
            ctx.fillStyle = '#e5c777';
            ctx.fillRect(-3, 0 + crouch, 1, 1);
            ctx.fillStyle = '#d7a975';
            ctx.fillRect(-8, -4 + crouch, 1, 2);
            ctx.fillRect(3, -6, 1, 1);
            ctx.fillStyle = '#f1a65f';
            ctx.fillRect(6, -5, 1, 1);
            ctx.fillRect(7, -5, 1, 1);
        } else {
            const prismPulse = (Math.sin(enemy.animTime * 7) + 1) / 2;
            ctx.fillStyle = '#1d2428';
            ctx.fillRect(-10, 7, 20, 3);
            ctx.fillStyle = isVisualHitFlashActive(enemy.hitFlash) ? '#fff8e9' : '#343c42';
            ctx.fillRect(-6, -8, 12, 16);
            ctx.fillRect(-10, -6, 4, 12);
            ctx.fillRect(6, -6, 4, 12);
            ctx.fillRect(-8, 6 + stride, 5, 4);
            ctx.fillRect(3, 6 - stride, 5, 4);
            ctx.fillStyle = '#252c31';
            ctx.fillRect(-7, -9, 14, 17);
            ctx.fillRect(-11, -7, 5, 13);
            ctx.fillRect(6, -7, 5, 13);
            ctx.fillStyle = '#647b7e';
            ctx.fillRect(-5, -7, 10, 4);
            ctx.fillRect(-8, -3, 16, 8);
            ctx.fillRect(-7, 5 + stride, 4, 2);
            ctx.fillRect(3, 5 - stride, 4, 2);
            ctx.fillStyle = '#8ba5a4';
            ctx.fillRect(-4, -7, 8, 1);
            ctx.fillRect(-7, -2, 14, 1);
            ctx.fillRect(-9, -5, 2, 8);
            ctx.fillRect(7, -5, 2, 8);
            ctx.fillStyle = '#8ed6dc';
            ctx.fillRect(-4, -5, 3, 3);
            ctx.fillRect(1, -5, 3, 3);
            ctx.fillStyle = '#23333a';
            ctx.fillRect(-3, -4, 1, 2);
            ctx.fillRect(2, -4, 1, 2);
            ctx.fillStyle = '#c66a8b';
            ctx.fillRect(-6, -2, 4, 5);
            ctx.fillRect(-5, -4, 2, 2);
            ctx.fillStyle = '#e5c777';
            ctx.fillRect(-1, -2, 2, 5);
            ctx.fillRect(-2, -4, 4, 2);
            ctx.fillStyle = '#599ba6';
            ctx.fillRect(2, -2, 4, 5);
            ctx.fillRect(3, -4, 2, 2);
            ctx.fillStyle = '#b6e4da';
            ctx.fillRect(-5, -1, 2, 2);
            ctx.fillRect(3, -1, 2, 2);
            ctx.fillStyle = '#a2e8e4';
            ctx.fillRect(-1, -5, 2, 7);
            ctx.fillRect(-7, -1, 3, 1);
            ctx.fillRect(5, 1, 3, 1);
            ctx.fillStyle = '#354850';
            ctx.fillRect(-2, 4, 4, 3);
            ctx.fillStyle = '#e3ca8b';
            ctx.fillRect(-1, 4, 2, 2);
            ctx.fillStyle = '#7cc5d2';
            ctx.fillRect(-11, -8, 2, 3);
            ctx.fillRect(9, -8, 2, 3);
            ctx.fillStyle = '#c3e9e2';
            ctx.fillRect(-10, -7, 1, 1);
            ctx.fillRect(10, -7, 1, 1);
            ctx.fillStyle = '#4a5656';
            ctx.fillRect(-12, -6, 2, 11);
            ctx.fillRect(10, -6, 2, 11);
            ctx.fillStyle = '#cfb76c';
            ctx.fillRect(-11, -2, 1, 3);
            ctx.fillRect(11, -2, 1, 3);
            ctx.fillStyle = `rgba(159, 239, 230, ${0.25 + prismPulse * 0.35})`;
            ctx.fillRect(-3, -1, 6, 4);
            ctx.fillStyle = '#efffd4';
            ctx.fillRect(-1, -1, 2, 2);
            if (enemy.sentinelBeamWarning > 0) {
                ctx.fillStyle = '#fff4bd';
                ctx.fillRect(-2, -3, 4, 4);
            }
            ctx.fillStyle = '#263d46';
            ctx.fillRect(-3, -2, 6, 6);
            ctx.fillStyle = `rgba(142, 214, 220, ${0.45 + prismPulse * 0.3})`;
            ctx.fillRect(-2, -1, 4, 4);
            ctx.fillStyle = '#efffd4';
            ctx.fillRect(-1, -1, 2, 2);
            ctx.fillStyle = '#a4d5d4';
            ctx.fillRect(-7, 1, 2, 1);
            ctx.fillRect(5, -2, 2, 1);
            ctx.fillStyle = '#e5c777';
            ctx.fillRect(-9, 4, 2, 1);
            ctx.fillRect(7, 3, 2, 1);
        }
        ctx.restore();
        drawEnemyStatusMarkers(enemy, screenX, screenY);
        drawEnemyAttack(enemy);
        return;
    }
    const pain = enemy.painTimer > 0;
    const painShake = pain && !reducedVisualEffects
        ? snapRenderPixel(Math.sin(enemy.animTime * 38) * 1.5)
        : 0;
    const bob = pain
        ? -1
        : enemy.moving ? snapRenderPixel(Math.sin(enemy.animTime * 14) * 1.2) : 0;
    const step = enemy.moving ? snapRenderPixel(Math.sin(enemy.animTime * 14)) : 0;
    const weaponBob = snapRenderPixel(pain
        ? Math.sin(enemy.animTime * 28) * 2
        : Math.sin(enemy.animTime * 9) * (enemy.moving ? 1 : 0.5));
    ctx.save();
    positionEnemySpriteAtHeight(
        enemy,
        enemy.creatureType === 'ogre' ? 19 : enemy.creatureType === 'troll' ? 16 : 9,
        enemy.creatureType === 'ogre' ? 31 : enemy.creatureType === 'troll' ? 25 : 18
    );
    ctx.translate(painShake, bob);
    if (pain) {
        ctx.rotate(Math.sin(enemy.animTime * 32) * 0.12);
    }
    const x = -7;
    const y = -9;
    if (enemy.creatureType === 'troll' || enemy.creatureType === 'ogre') {
        if (enemy.creatureType === 'troll') {
            drawTrollSprite(enemy, x, y, step, weaponBob, isFemale);
            drawTrollDetailPass(enemy, x, y, isFemale, Math.round(weaponBob * 0.35));
        } else {
            drawOgreSprite(enemy, x, y, step, weaponBob);
            drawOgreDetailPass(enemy, x, y);
        }
        ctx.restore();
        drawEnemyStatusMarkers(enemy, screenX, screenY);
        drawEnemyAttack(enemy);
        return;
    }
    if (isFemale) {
        drawFemaleGoblinSprite(enemy, x, y, step, weaponBob, pain);
        drawGoblinDetailPass(enemy, x, y, weaponBob, true, enemy.archetype === 'runner');
        ctx.restore();
        drawEnemyStatusMarkers(enemy, screenX, screenY);
        drawEnemyAttack(enemy);
        return;
    }

    ctx.fillStyle = '#2b2b1e';
    ctx.fillRect(x + 3, y + 14 + Math.max(0, step) * 1.5, 4, 2);
    ctx.fillRect(x + 10, y + 14 + Math.max(0, -step) * 1.5, 4, 2);
    ctx.fillStyle = '#54402a';
    ctx.fillRect(x + 2, y + 15 + Math.max(0, step) * 1.5, 5, 1);
    ctx.fillRect(x + 9, y + 15 + Math.max(0, -step) * 1.5, 5, 1);

    ctx.fillStyle = '#283024';
    ctx.fillRect(x + 3, y + 8, 10, 6);
    ctx.fillStyle = '#465b32';
    ctx.fillRect(x + 2, y + 9, 12, 4);
    ctx.fillStyle = '#617641';
    ctx.fillRect(x + 4, y + 8, 7, 4);
    ctx.fillStyle = '#78894a';
    ctx.fillRect(x + 5, y + 8, 4, 1);
    ctx.fillStyle = '#343d27';
    ctx.fillRect(x + 7, y + 9, 2, 4);
    ctx.fillStyle = '#7d8843';
    ctx.fillRect(x + 5, y + 9, 1, 2);
    ctx.fillRect(x + 10, y + 10, 1, 2);
    ctx.fillStyle = '#9aaa58';
    ctx.fillRect(x + 6, y + 9, 1, 1);
    ctx.fillStyle = '#39442b';
    ctx.fillRect(x + 5, y + 12, 6, 1);
    ctx.fillStyle = '#c8a452';
    ctx.fillRect(x + 7, y + 11, 2, 2);
    ctx.fillStyle = '#f0d77d';
    ctx.fillRect(x + 7, y + 11, 1, 1);
    ctx.fillStyle = '#92713a';
    ctx.fillRect(x + 3, y + 10, 2, 3);
    ctx.fillStyle = '#d0a94f';
    ctx.fillRect(x + 4, y + 10, 1, 2);
    ctx.fillStyle = '#92713a';
    ctx.fillRect(x + 2, y + 6, 2, 1);
    ctx.fillRect(x + 12, y + 6, 2, 1);
    ctx.fillStyle = '#c49b4c';
    ctx.fillRect(x + 2, y + 6, 1, 1);
    ctx.fillRect(x + 13, y + 6, 1, 1);

    ctx.fillStyle = '#36472b';
    ctx.fillRect(x + 1, y + 5, 3, 5);
    ctx.fillRect(x + 12, y + 5, 3, 5);
    ctx.fillStyle = '#54703a';
    ctx.fillRect(x + 2, y + 6, 2, 3);
    ctx.fillRect(x + 12, y + 6, 2, 3);

    ctx.fillStyle = isVisualHitFlashActive(enemy.hitFlash) ? '#e3c8a0' : '#34482b';
    ctx.fillRect(x + 3, y + 2, 9, 7);
    ctx.fillRect(x + 4, y + 1, 7, 1);
    ctx.fillStyle = isVisualHitFlashActive(enemy.hitFlash) ? '#fff0d0' : '#6f8545';
    ctx.fillRect(x + 4, y + 2, 6, 5);
    ctx.fillStyle = '#819450';
    ctx.fillRect(x + 5, y + 2, 4, 1);
    ctx.fillRect(x + 4, y + 3, 1, 2);
    ctx.fillStyle = '#4c6336';
    ctx.fillRect(x + 10, y + 3, 2, 4);

    ctx.fillStyle = isVisualHitFlashActive(enemy.hitFlash) ? '#fff2cf' : '#e9c35a';
    ctx.fillRect(x + 5, y + 4, 2, 2);
    ctx.fillRect(x + 9, y + 4, 2, 2);
    ctx.fillStyle = '#31251b';
    ctx.fillRect(x + 6, y + 4, 1, 2);
    ctx.fillRect(x + 10, y + 4, 1, 2);
    ctx.fillStyle = '#303721';
    ctx.fillRect(x + 7, y + 6, 3, 1);
    ctx.fillStyle = '#e0d0a0';
    ctx.fillRect(x + 6, y + 7, 1, 2);
    ctx.fillRect(x + 10, y + 7, 1, 2);
    ctx.fillStyle = '#9baa56';
    ctx.fillRect(x + 5, y + 3, 2, 1);
    ctx.fillRect(x + 9, y + 3, 2, 1);
    ctx.fillStyle = '#fff1a8';
    ctx.fillRect(x + 5, y + 4, 1, 1);
    ctx.fillRect(x + 9, y + 4, 1, 1);
    ctx.fillStyle = '#c4a34d';
    ctx.fillRect(x + 4, y + 7, 2, 1);
    ctx.fillRect(x + 10, y + 7, 2, 1);
    ctx.fillStyle = '#25301f';
    ctx.fillRect(x + 5, y + 8, 6, 1);
    ctx.fillStyle = '#71864a';
    ctx.fillRect(x + 4, y + 9, 2, 1);
    ctx.fillRect(x + 10, y + 9, 2, 1);
    ctx.fillStyle = '#d7bd70';
    ctx.fillRect(x + 6, y + 10, 1, 2);
    ctx.fillRect(x + 9, y + 10, 1, 2);
    ctx.fillStyle = '#506438';
    ctx.fillRect(x + 2, y + 8, 2, 1);
    ctx.fillRect(x + 12, y + 8, 2, 1);
    ctx.fillStyle = '#8c9a50';
    ctx.fillRect(x + 2, y + 9, 1, 1);
    ctx.fillRect(x + 13, y + 9, 1, 1);
    ctx.fillStyle = '#e8d99f';
    ctx.fillRect(x + 6, y + 7, 1, 1);
    ctx.fillRect(x + 10, y + 7, 1, 1);
    if (pain) {
        ctx.fillStyle = '#37251f';
        ctx.fillRect(x + 7, y + 6, 3, 2);
        ctx.fillStyle = '#c66e59';
        ctx.fillRect(x + 8, y + 7, 1, 1);
    }
    ctx.fillStyle = '#506536';
    ctx.fillRect(x + 1, y + 3, 3, 2);
    ctx.fillRect(x + 11, y + 3, 3, 2);

    ctx.fillStyle = '#303833';
    ctx.fillRect(x + 12, y + 9 + weaponBob, 2, 4);
    ctx.fillStyle = '#aeb6a0';
    ctx.fillRect(x + 13, y + 5 + weaponBob, 1, 5);
    ctx.fillStyle = '#eef0d2';
    ctx.fillRect(x + 13, y + 5 + weaponBob, 1, 2);
    ctx.fillStyle = '#b28a49';
    ctx.fillRect(x + 12, y + 4 + weaponBob, 3, 1);
    ctx.fillStyle = '#ead9a1';
    ctx.fillRect(x + 13, y + 5 + weaponBob, 1, 2);
    ctx.fillStyle = '#242c25';
    ctx.fillRect(x + 3, y + 13, 4, 1);
    ctx.fillRect(x + 10, y + 13, 4, 1);
    ctx.fillStyle = '#a98c5d';
    ctx.fillRect(x + 4, y + 14, 2, 1);
    ctx.fillRect(x + 11, y + 14, 2, 1);
    if (enemy.armorDurability > 0) {
        ctx.fillStyle = '#26343a';
        ctx.fillRect(x + 3, y + 8, 10, 5);
        ctx.fillStyle = '#657c80';
        ctx.fillRect(x + 4, y + 8, 8, 1);
        ctx.fillRect(x + 4, y + 12, 8, 1);
        ctx.fillStyle = '#b8c9bb';
        ctx.fillRect(x + 7, y + 9, 2, 3);
        ctx.fillStyle = '#d9e3d0';
        ctx.fillRect(x + 5, y + 9, 1, 2);
        ctx.fillRect(x + 10, y + 9, 1, 2);
        ctx.fillStyle = '#485b60';
        ctx.fillRect(x + 6, y + 12, 1, 1);
        ctx.fillRect(x + 9, y + 12, 1, 1);
        ctx.fillStyle = '#d4a64f';
        ctx.fillRect(x + 7, y + 10, 2, 1);
    }
    if (enemy.shieldDurability > 0) {
        ctx.fillStyle = '#49301d';
        ctx.fillRect(x + 14, y + 7, 2, 6);
        ctx.fillStyle = enemy.shieldRaised ? '#8fb5bc' : '#4d7780';
        ctx.fillRect(x + 14, y + 6, 4, 7);
        ctx.fillStyle = '#d5b96c';
        ctx.fillRect(x + 15, y + 8, 2, 3);
        ctx.fillStyle = '#bad8d2';
        ctx.fillRect(x + 14, y + 7, 1, 4);
        ctx.fillRect(x + 17, y + 7, 1, 4);
        ctx.fillStyle = '#e4cb7a';
        ctx.fillRect(x + 15, y + 7, 2, 1);
        ctx.fillRect(x + 15, y + 11, 2, 1);
        ctx.fillStyle = '#f5e6a5';
        ctx.fillRect(x + 15, y + 9, 1, 1);
        if (enemy.shieldRaised) {
            ctx.fillStyle = '#dff7e8';
            ctx.fillRect(x + 15, y + 5, 3, 1);
        }
    }
    drawGoblinDetailPass(enemy, x, y, weaponBob, false, enemy.archetype === 'runner');
    ctx.restore();

    drawEnemyStatusMarkers(enemy, screenX, screenY);
    drawEnemyAttack(enemy);
}

function drawTrollSprite(enemy, x, y, step, weaponBob, isFemale) {
    const flash = isVisualHitFlashActive(enemy.hitFlash);
    const skin = flash ? '#fff0d0' : isFemale ? '#9acb68' : '#8dbb51';
    const skinLight = flash ? '#fff8e9' : '#c2dc73';
    const skinShadow = flash ? '#f0d2bb' : '#557c3c';
    const helmet = flash ? '#ffffff' : '#aeb9b5';
    const helmetShadow = flash ? '#fff8e9' : '#4b5a57';
    const leftStep = Math.round(Math.max(0, step) * 1.5);
    const rightStep = Math.round(Math.max(0, -step) * 1.5);
    const bob = Math.round(weaponBob * 0.35);

    ctx.fillStyle = '#30492b';
    ctx.fillRect(x + 4, y + 17 + leftStep, 5, 6);
    ctx.fillRect(x + 12, y + 17 + rightStep, 5, 6);
    ctx.fillStyle = skinShadow;
    ctx.fillRect(x + 5, y + 18 + leftStep, 3, 5);
    ctx.fillRect(x + 13, y + 18 + rightStep, 3, 5);
    ctx.fillStyle = skin;
    ctx.fillRect(x + 6, y + 21 + leftStep, 2, 2);
    ctx.fillRect(x + 13, y + 21 + rightStep, 2, 2);
    ctx.fillStyle = '#29271f';
    ctx.fillRect(x + 2, y + 23 + leftStep, 8, 2);
    ctx.fillRect(x + 11, y + 23 + rightStep, 8, 2);
    ctx.fillStyle = '#5e4730';
    ctx.fillRect(x + 3, y + 23 + leftStep, 6, 1);
    ctx.fillRect(x + 12, y + 23 + rightStep, 6, 1);

    ctx.fillStyle = '#4b3626';
    ctx.fillRect(x + 8, y + 14 + bob, 7, 7);
    ctx.fillStyle = '#795335';
    ctx.fillRect(x + 9, y + 14 + bob, 5, 6);
    ctx.fillStyle = '#a27a4b';
    ctx.fillRect(x + 9, y + 15 + bob, 3, 1);
    ctx.fillStyle = '#3c3025';
    ctx.fillRect(x + 10, y + 19 + bob, 4, 1);

    ctx.fillStyle = skinShadow;
    ctx.fillRect(x + 3, y + 9 + bob, 5, 10);
    ctx.fillRect(x + 14, y + 9 + bob, 5, 10);
    ctx.fillStyle = skin;
    ctx.fillRect(x + 4, y + 10 + bob, 3, 8);
    ctx.fillRect(x + 15, y + 10 + bob, 3, 8);
    ctx.fillStyle = skinLight;
    ctx.fillRect(x + 4, y + 12 + bob, 1, 3);
    ctx.fillRect(x + 16, y + 12 + bob, 1, 3);

    ctx.fillStyle = '#34291f';
    ctx.fillRect(x + 5, y + 10 + bob, 12, 8);
    ctx.fillStyle = '#66503a';
    ctx.fillRect(x + 6, y + 10 + bob, 10, 6);
    ctx.fillStyle = '#927353';
    ctx.fillRect(x + 7, y + 11 + bob, 8, 4);
    ctx.fillStyle = '#c2a178';
    ctx.fillRect(x + 7, y + 11 + bob, 5, 1);
    ctx.fillStyle = '#493b2d';
    ctx.fillRect(x + 6, y + 15 + bob, 10, 2);
    ctx.fillStyle = '#342a21';
    ctx.fillRect(x + 7, y + 12 + bob, 1, 3);
    ctx.fillRect(x + 14, y + 12 + bob, 1, 3);

    ctx.fillStyle = skinShadow;
    ctx.fillRect(x + 14, y + 8 + bob, 4, 3);
    ctx.fillStyle = skin;
    ctx.fillRect(x + 15, y + 8 + bob, 3, 2);
    ctx.fillStyle = skinLight;
    ctx.fillRect(x + 16, y + 8 + bob, 2, 1);
    ctx.fillStyle = '#38512e';
    ctx.fillRect(x + 17, y + 10 + bob, 1, 1);

    ctx.fillStyle = '#39291e';
    ctx.fillRect(x + 13, y + 4 + weaponBob, 2, 12);
    ctx.fillStyle = '#765033';
    ctx.fillRect(x + 14, y + 3 + weaponBob, 2, 11);
    ctx.fillStyle = '#a77643';
    ctx.fillRect(x + 13, y + 3 + weaponBob, 4, 3);
    ctx.fillRect(x + 12, y + 2 + weaponBob, 4, 2);
    ctx.fillStyle = '#d0a46a';
    ctx.fillRect(x + 13, y + 3 + weaponBob, 2, 1);
    ctx.fillStyle = '#493321';
    ctx.fillRect(x + 14, y + 6 + weaponBob, 2, 1);

    ctx.fillStyle = skinShadow;
    ctx.fillRect(x + 2, y + 5 + bob, 5, 7);
    ctx.fillRect(x + 15, y + 5 + bob, 5, 7);
    ctx.fillStyle = skin;
    ctx.fillRect(x + 3, y + 6 + bob, 3, 5);
    ctx.fillRect(x + 16, y + 6 + bob, 3, 5);
    ctx.fillStyle = skinLight;
    ctx.fillRect(x + 3, y + 7 + bob, 1, 2);
    ctx.fillRect(x + 17, y + 7 + bob, 1, 2);
    ctx.fillStyle = skinShadow;
    ctx.fillRect(x + 4, y + 3 + bob, 13, 9);
    ctx.fillStyle = skin;
    ctx.fillRect(x + 5, y + 4 + bob, 11, 7);
    ctx.fillRect(x + 15, y + 6 + bob, 4, 3);
    ctx.fillStyle = skinLight;
    ctx.fillRect(x + 6, y + 5 + bob, 4, 2);
    ctx.fillRect(x + 8, y + 9 + bob, 5, 1);

    ctx.fillStyle = '#38512e';
    ctx.fillRect(x + 15, y + 7 + bob, 6, 3);
    ctx.fillStyle = skin;
    ctx.fillRect(x + 16, y + 7 + bob, 4, 2);
    ctx.fillStyle = skinLight;
    ctx.fillRect(x + 18, y + 7 + bob, 2, 1);
    ctx.fillStyle = skinShadow;
    ctx.fillRect(x + 17, y + 9 + bob, 4, 2);
    ctx.fillStyle = '#6d422f';
    ctx.fillRect(x + 15, y + 10 + bob, 5, 1);

    ctx.fillStyle = helmetShadow;
    ctx.fillRect(x + 7, y + bob, 8, 1);
    ctx.fillRect(x + 5, y + 1 + bob, 12, 1);
    ctx.fillRect(x + 4, y + 2 + bob, 15, 2);
    ctx.fillRect(x + 3, y + 4 + bob, 16, 2);
    ctx.fillStyle = '#687773';
    ctx.fillRect(x + 7, y + 1 + bob, 9, 1);
    ctx.fillRect(x + 5, y + 2 + bob, 12, 2);
    ctx.fillRect(x + 4, y + 4 + bob, 14, 1);
    ctx.fillStyle = helmet;
    ctx.fillRect(x + 8, y + 1 + bob, 6, 1);
    ctx.fillRect(x + 6, y + 2 + bob, 9, 1);
    ctx.fillRect(x + 5, y + 3 + bob, 10, 1);
    ctx.fillStyle = '#d8dfd6';
    ctx.fillRect(x + 8, y + 1 + bob, 3, 1);
    ctx.fillRect(x + 6, y + 2 + bob, 3, 1);
    ctx.fillStyle = '#394743';
    ctx.fillRect(x + 4, y + 5 + bob, 15, 1);
    ctx.fillStyle = '#c08d4c';
    ctx.fillRect(x + 7, y + 3 + bob, 1, 1);
    ctx.fillRect(x + 15, y + 3 + bob, 1, 1);

    if (enemy.armorDurability > 0) {
        ctx.fillStyle = '#34413a';
        ctx.fillRect(x + 4, y + 10 + bob, 4, 5);
        ctx.fillRect(x + 14, y + 10 + bob, 4, 5);
        ctx.fillStyle = '#9ca08a';
        ctx.fillRect(x + 5, y + 11 + bob, 2, 3);
        ctx.fillRect(x + 15, y + 11 + bob, 2, 3);
        ctx.fillStyle = '#d3c6a0';
        ctx.fillRect(x + 5, y + 11 + bob, 2, 1);
        ctx.fillRect(x + 15, y + 11 + bob, 2, 1);
    }
    if (enemy.shieldDurability > 0) {
        ctx.fillStyle = '#49301d';
        ctx.fillRect(x + 2, y + 10 + bob, 2, 8);
        ctx.fillStyle = enemy.shieldRaised ? '#8fb5bc' : '#4d7780';
        ctx.fillRect(x - 1, y + 10 + bob, 5, 8);
        ctx.fillStyle = '#d5b96c';
        ctx.fillRect(x, y + 12 + bob, 3, 4);
        ctx.fillStyle = '#bad8d2';
        ctx.fillRect(x - 1, y + 11 + bob, 1, 6);
        ctx.fillRect(x + 3, y + 11 + bob, 1, 6);
    }
}

function drawTrollDetailPass(enemy, x, y, isFemale, bob) {
    const flash = isVisualHitFlashActive(enemy.hitFlash);
    const skinLight = flash ? '#fff8e9' : '#c2dc73';
    const skinShadow = flash ? '#f0d2bb' : '#557c3c';
    const helmetHighlight = flash ? '#ffffff' : '#d8dfd6';
    const leatherLight = flash ? '#fff0d0' : '#c2a178';
    const contamination = flash ? '#fff8e9' : '#79a946';

    ctx.save();
    ctx.translate(0, bob);
    ctx.fillStyle = skinLight;
    ctx.fillRect(x + 9, y + 5, 5, 1);
    ctx.fillStyle = '#273028';
    ctx.fillRect(x + 10, y + 6, 4, 2);
    ctx.fillStyle = '#f2d66b';
    ctx.fillRect(x + 11, y + 6, 2, 1);
    ctx.fillStyle = '#20261e';
    ctx.fillRect(x + 12, y + 6, 1, 2);
    ctx.fillStyle = '#38251f';
    ctx.fillRect(x + 13, y + 11, 5, 1);
    ctx.fillRect(x + 14, y + 12, 4, 1);
    ctx.fillStyle = '#572e27';
    ctx.fillRect(x + 14, y + 11, 3, 1);
    ctx.fillStyle = '#e5d5a7';
    ctx.fillRect(x + 15, y + 11, 1, 1);
    ctx.fillStyle = flash ? '#ffffff' : isFemale ? '#e7c8b0' : '#8f6544';
    ctx.fillRect(x + 4, y + 6, 1, 2);
    ctx.fillRect(x + 16, y + 6, 1, 2);
    ctx.fillStyle = '#d8dfd6';
    ctx.fillRect(x + 7, y + 4, 1, 1);
    ctx.fillRect(x + 16, y + 4, 1, 1);
    ctx.fillStyle = helmetHighlight;
    ctx.fillRect(x + 8, y + 2, 3, 1);
    ctx.fillRect(x + 12, y + 3, 2, 1);

    ctx.fillStyle = '#382d25';
    ctx.fillRect(x + 6, y + 12, 3, 1);
    ctx.fillRect(x + 13, y + 13, 2, 1);
    ctx.fillStyle = leatherLight;
    ctx.fillRect(x + 7, y + 12, 2, 1);
    ctx.fillRect(x + 14, y + 14, 1, 1);
    ctx.fillStyle = '#493522';
    ctx.fillRect(x + 8, y + 14, 1, 2);
    ctx.fillRect(x + 15, y + 15, 1, 2);
    ctx.fillStyle = '#d0a46a';
    ctx.fillRect(x + 12, y + 12, 1, 1);
    ctx.fillRect(x + 6, y + 16, 1, 1);
    ctx.fillRect(x + 16, y + 17, 1, 1);
    ctx.fillStyle = '#293a27';
    ctx.fillRect(x + 5, y + 20, 2, 1);
    ctx.fillRect(x + 15, y + 20, 2, 1);
    ctx.fillStyle = flash ? '#fff0d0' : '#34462e';
    ctx.fillRect(x + 5, y + 12, 1, 2);
    ctx.fillRect(x + 16, y + 14, 2, 1);
    ctx.fillRect(x + 7, y + 16, 2, 1);
    ctx.fillStyle = contamination;
    ctx.fillRect(x + 6, y + 13, 1, 1);
    ctx.fillRect(x + 15, y + 14, 1, 1);
    ctx.fillRect(x + 9, y + 10, 1, 1);
    ctx.fillStyle = flash ? '#ffffff' : '#b5d65a';
    ctx.fillRect(x + 10, y + 9, 1, 1);
    ctx.fillRect(x + 15, y + 13, 1, 1);
    ctx.fillStyle = '#a87a48';
    ctx.fillRect(x + 4, y + 24, 4, 1);
    ctx.fillRect(x + 13, y + 24, 4, 1);
    ctx.fillStyle = '#322b23';
    ctx.fillRect(x + 8, y + 15, 1, 2);
    ctx.fillRect(x + 12, y + 15, 1, 2);
    ctx.fillStyle = flash ? '#fff8e9' : '#9a7955';
    ctx.fillRect(x + 8, y + 15, 1, 1);
    ctx.fillRect(x + 12, y + 15, 1, 1);
    ctx.restore();
}

function drawOgreSprite(enemy, x, y, step, weaponBob) {
    const flash = isVisualHitFlashActive(enemy.hitFlash);
    const skin = flash ? '#fff0d0' : '#577d3d';
    const skinLight = flash ? '#fff8e9' : '#8eaa55';
    const skinShade = flash ? '#f5d3b4' : '#35532e';
    const leftStep = Math.round(Math.max(0, step) * 2);
    const rightStep = Math.round(Math.max(0, -step) * 2);
    const slamWindup = enemy.slamWarning > 0
        ? 1 - enemy.slamWarning / 0.75
        : 0;
    const armLift = enemy.slamWarning > 0
        ? Math.round(slamWindup * 5)
        : enemy.slamImpactTimer > 0 ? -2 : 0;
    const bob = Math.round(weaponBob * 0.5);

    ctx.fillStyle = '#1c3020';
    ctx.fillRect(x + 2, y + 20 + leftStep, 9, 6);
    ctx.fillRect(x + 12, y + 20 + rightStep, 9, 6);
    ctx.fillStyle = '#35502b';
    ctx.fillRect(x + 4, y + 19 + leftStep, 6, 5);
    ctx.fillRect(x + 13, y + 19 + rightStep, 6, 5);
    ctx.fillStyle = skin;
    ctx.fillRect(x + 5, y + 20 + leftStep, 4, 4);
    ctx.fillRect(x + 14, y + 20 + rightStep, 4, 4);

    ctx.fillStyle = '#30251b';
    ctx.fillRect(x + 1, y + 24 + leftStep, 11, 4);
    ctx.fillRect(x + 12, y + 24 + rightStep, 11, 4);
    ctx.fillStyle = '#694526';
    ctx.fillRect(x + 2, y + 24 + leftStep, 9, 3);
    ctx.fillRect(x + 13, y + 24 + rightStep, 9, 3);
    ctx.fillStyle = '#9a6d3a';
    ctx.fillRect(x + 3, y + 24 + leftStep, 5, 1);
    ctx.fillRect(x + 15, y + 24 + rightStep, 5, 1);

    ctx.fillStyle = skinShade;
    ctx.fillRect(x + 1, y + 8 + bob, 6, 13);
    ctx.fillRect(x + 18, y + 8 + bob, 6, 13);
    ctx.fillStyle = skin;
    ctx.fillRect(x + 1, y + 11 + bob, 5, 9);
    ctx.fillRect(x + 19, y + 11 + bob, 5, 9);
    ctx.fillStyle = skinLight;
    ctx.fillRect(x + 1, y + 14 + bob, 2, 4);
    ctx.fillRect(x + 21, y + 14 + bob, 2, 4);
    ctx.fillStyle = skinShade;
    ctx.fillRect(x + 2, y + 18 + bob, 5, 3);
    ctx.fillRect(x + 18, y + 18 + bob, 5, 3);
    ctx.fillStyle = skin;
    ctx.fillRect(x + 3, y + 18 + bob + armLift, 4, 3);
    ctx.fillRect(x + 18, y + 18 + bob + armLift, 4, 3);
    ctx.fillStyle = skinLight;
    ctx.fillRect(x + 3, y + 19 + bob + armLift, 2, 1);
    ctx.fillRect(x + 19, y + 19 + bob + armLift, 2, 1);

    ctx.fillStyle = '#243a25';
    ctx.fillRect(x + 5, y + 8 + bob, 14, 14);
    ctx.fillStyle = '#64412d';
    ctx.fillRect(x + 6, y + 9 + bob, 12, 12);
    ctx.fillStyle = '#815638';
    ctx.fillRect(x + 7, y + 10 + bob, 10, 9);
    ctx.fillStyle = '#a4754b';
    ctx.fillRect(x + 8, y + 10 + bob, 7, 2);
    ctx.fillRect(x + 7, y + 13 + bob, 3, 1);
    ctx.fillRect(x + 15, y + 14 + bob, 2, 2);
    ctx.fillStyle = '#513724';
    ctx.fillRect(x + 10, y + 12 + bob, 2, 1);
    ctx.fillRect(x + 13, y + 16 + bob, 3, 1);

    ctx.fillStyle = '#2b3021';
    ctx.fillRect(x + 5, y + 17 + bob, 14, 5);
    ctx.fillStyle = '#c45124';
    ctx.fillRect(x + 5, y + 17 + bob, 14, 3);
    ctx.fillStyle = '#e07830';
    ctx.fillRect(x + 6, y + 17 + bob, 5, 2);
    ctx.fillStyle = '#aeb8b0';
    ctx.fillRect(x + 11, y + 16 + bob, 4, 4);
    ctx.fillStyle = '#e2e5d8';
    ctx.fillRect(x + 12, y + 17 + bob, 2, 2);
    ctx.fillStyle = '#762f1d';
    ctx.fillRect(x + 5, y + 20 + bob, 14, 2);

    ctx.save();
    ctx.translate(x + 12, y + 7);
    ctx.scale(1.2, 1.2);
    ctx.translate(-(x + 12), -(y + 7));
    ctx.fillStyle = '#243821';
    ctx.fillRect(x + 5, y + 4, 14, 7);
    ctx.fillStyle = skinShade;
    ctx.fillRect(x + 6, y + 4, 12, 6);
    ctx.fillStyle = skin;
    ctx.fillRect(x + 7, y + 5, 10, 5);
    ctx.fillStyle = skinLight;
    ctx.fillRect(x + 8, y + 5, 4, 2);
    ctx.fillRect(x + 7, y + 8, 2, 1);
    ctx.fillStyle = '#24351f';
    ctx.fillRect(x + 8, y + 7, 2, 2);
    ctx.fillRect(x + 14, y + 7, 2, 2);
    ctx.fillStyle = '#182719';
    ctx.fillRect(x + 9, y + 7, 1, 2);
    ctx.fillRect(x + 15, y + 7, 1, 2);
    ctx.fillStyle = '#426236';
    ctx.fillRect(x + 10, y + 10, 5, 2);
    ctx.fillStyle = '#263b27';
    ctx.fillRect(x + 8, y + 10, 9, 1);

    ctx.fillStyle = '#1b2422';
    ctx.fillRect(x + 4, y + 1, 16, 5);
    ctx.fillRect(x + 6, y - 1, 12, 4);
    ctx.fillRect(x + 9, y - 3, 6, 3);
    ctx.fillStyle = '#3e4a3d';
    ctx.fillRect(x + 5, y + 1, 14, 3);
    ctx.fillRect(x + 7, y - 1, 10, 3);
    ctx.fillRect(x + 10, y - 3, 4, 3);
    ctx.fillStyle = '#70785a';
    ctx.fillRect(x + 7, y, 3, 2);
    ctx.fillRect(x + 11, y - 2, 2, 3);
    ctx.fillRect(x + 15, y, 2, 2);

    ctx.fillStyle = '#202a27';
    ctx.fillRect(x + 2, y + 3, 20, 3);
    ctx.fillStyle = '#74785a';
    ctx.fillRect(x + 4, y + 3, 16, 1);
    ctx.fillStyle = '#39453d';
    ctx.fillRect(x + 4, y + 4, 16, 1);
    ctx.fillStyle = '#8c8c68';
    ctx.fillRect(x + 6, y + 3, 1, 1);
    ctx.fillRect(x + 17, y + 3, 1, 1);

    ctx.fillStyle = '#202a27';
    ctx.fillRect(x + 4, y + 5, 4, 5);
    ctx.fillRect(x + 16, y + 5, 4, 5);
    ctx.fillStyle = '#4e5945';
    ctx.fillRect(x + 5, y + 5, 2, 3);
    ctx.fillRect(x + 17, y + 5, 2, 3);
    ctx.fillStyle = '#89906a';
    ctx.fillRect(x + 5, y + 5, 1, 2);
    ctx.fillRect(x + 18, y + 5, 1, 2);

    ctx.fillStyle = '#1e2924';
    ctx.fillRect(x + 11, y - 2, 2, 7);
    ctx.fillStyle = '#89906a';
    ctx.fillRect(x + 11, y - 2, 1, 5);
    ctx.fillStyle = '#39453d';
    ctx.fillRect(x + 12, y, 1, 4);
    ctx.restore();

    if (enemy.armorDurability > 0) {
        ctx.fillStyle = '#26343a';
        ctx.fillRect(x + 4, y + 9 + bob, 6, 4);
        ctx.fillRect(x + 14, y + 9 + bob, 6, 4);
        ctx.fillStyle = '#71848a';
        ctx.fillRect(x + 5, y + 9 + bob, 4, 1);
        ctx.fillRect(x + 15, y + 9 + bob, 4, 1);
        ctx.fillStyle = '#c2d0c7';
        ctx.fillRect(x + 6, y + 10 + bob, 2, 2);
        ctx.fillRect(x + 16, y + 10 + bob, 2, 2);
        ctx.fillStyle = '#d2a950';
        ctx.fillRect(x + 5, y + 12 + bob, 4, 1);
        ctx.fillRect(x + 15, y + 12 + bob, 4, 1);
    }
    if (enemy.shieldDurability > 0) {
        ctx.fillStyle = '#49301d';
        ctx.fillRect(x + 20, y + 10 + bob, 2, 9);
        ctx.fillStyle = enemy.shieldRaised ? '#8fb5bc' : '#4d7780';
        ctx.fillRect(x + 21, y + 9 + bob, 5, 10);
        ctx.fillStyle = '#d5b96c';
        ctx.fillRect(x + 22, y + 11 + bob, 3, 6);
        ctx.fillStyle = '#bad8d2';
        ctx.fillRect(x + 21, y + 10 + bob, 1, 8);
        ctx.fillRect(x + 25, y + 10 + bob, 1, 8);
    }
}

function drawOgreDetailPass(enemy, x, y) {
    const flash = isVisualHitFlashActive(enemy.hitFlash);
    const skinShade = flash ? '#fff0d0' : '#35532e';
    const skinLight = flash ? '#fff8e9' : '#9ab363';
    const leatherLight = flash ? '#fff0d0' : '#b18150';
    const leatherDark = flash ? '#f5d3b4' : '#513724';

    ctx.save();
    ctx.translate(x + 12, y + 7);
    ctx.scale(1.2, 1.2);
    ctx.translate(-(x + 12), -(y + 7));
    ctx.fillStyle = flash ? '#ffffff' : '#a69f74';
    ctx.fillRect(x + 5, y + 3, 1, 1);
    ctx.fillRect(x + 18, y + 3, 1, 1);
    ctx.fillRect(x + 7, y + 1, 1, 1);
    ctx.fillRect(x + 16, y + 1, 1, 1);
    ctx.fillStyle = flash ? '#fff8e9' : '#333d34';
    ctx.fillRect(x + 5, y + 4, 1, 1);
    ctx.fillRect(x + 18, y + 4, 1, 1);
    ctx.fillStyle = flash ? '#ffffff' : '#9da271';
    ctx.fillRect(x + 11, y - 2, 1, 3);
    ctx.fillStyle = '#222c27';
    ctx.fillRect(x + 10, y + 5, 4, 1);

    ctx.fillStyle = flash ? '#fff8e9' : '#76924c';
    ctx.fillRect(x + 7, y + 6, 4, 1);
    ctx.fillRect(x + 14, y + 6, 3, 1);
    ctx.fillStyle = skinShade;
    ctx.fillRect(x + 8, y + 7, 2, 1);
    ctx.fillRect(x + 14, y + 7, 2, 1);
    ctx.fillStyle = flash ? '#ffffff' : '#e2c86f';
    ctx.fillRect(x + 8, y + 8, 1, 1);
    ctx.fillRect(x + 15, y + 8, 1, 1);
    ctx.fillStyle = '#172619';
    ctx.fillRect(x + 9, y + 8, 1, 1);
    ctx.fillRect(x + 15, y + 8, 1, 1);
    ctx.fillStyle = skinShade;
    ctx.fillRect(x + 7, y + 7, 3, 1);
    ctx.fillRect(x + 14, y + 7, 3, 1);
    ctx.fillStyle = flash ? '#fff8e9' : '#9c6e40';
    ctx.fillRect(x + 11, y + 8, 3, 2);
    ctx.fillStyle = flash ? '#ffffff' : '#c18c50';
    ctx.fillRect(x + 12, y + 9, 1, 1);
    ctx.fillStyle = skinShade;
    ctx.fillRect(x + 9, y + 11, 7, 1);
    ctx.fillRect(x + 10, y + 12, 5, 1);
    ctx.fillStyle = flash ? '#fff8e9' : '#ead9a5';
    ctx.fillRect(x + 8, y + 10, 2, 3);
    ctx.fillRect(x + 15, y + 10, 2, 3);
    ctx.fillStyle = flash ? '#ffffff' : '#f3e4c0';
    ctx.fillRect(x + 9, y + 10, 1, 1);
    ctx.fillRect(x + 15, y + 10, 1, 1);
    ctx.fillStyle = skinLight;
    ctx.fillRect(x + 10, y + 11, 1, 1);
    ctx.fillRect(x + 14, y + 11, 1, 1);
    ctx.restore();

    ctx.fillStyle = leatherLight;
    ctx.fillRect(x + 7, y + 10, 2, 1);
    ctx.fillRect(x + 15, y + 11, 2, 1);
    ctx.fillRect(x + 8, y + 14, 2, 1);
    ctx.fillRect(x + 14, y + 15, 2, 1);
    ctx.fillStyle = leatherDark;
    ctx.fillRect(x + 9, y + 14, 1, 2);
    ctx.fillRect(x + 14, y + 12, 1, 2);
    ctx.fillRect(x + 7, y + 16, 1, 2);
    ctx.fillRect(x + 16, y + 16, 1, 2);
    ctx.fillStyle = '#38271d';
    ctx.fillRect(x + 8, y + 12, 1, 3);
    ctx.fillRect(x + 15, y + 13, 1, 2);
    ctx.fillStyle = '#c18a50';
    ctx.fillRect(x + 9, y + 13, 3, 1);
    ctx.fillRect(x + 13, y + 15, 2, 1);
    ctx.fillStyle = flash ? '#fff8e9' : '#d0a36a';
    ctx.fillRect(x + 8, y + 12, 1, 1);
    ctx.fillRect(x + 16, y + 13, 1, 1);
    ctx.fillStyle = '#37291e';
    ctx.fillRect(x + 6, y + 19, 3, 1);
    ctx.fillRect(x + 15, y + 19, 3, 1);
    ctx.fillStyle = flash ? '#ffffff' : '#bd955c';
    ctx.fillRect(x + 7, y + 20, 1, 1);
    ctx.fillRect(x + 16, y + 20, 1, 1);

    ctx.fillStyle = flash ? '#ffffff' : '#f28a38';
    ctx.fillRect(x + 6, y + 17, 2, 1);
    ctx.fillRect(x + 8, y + 18, 2, 1);
    ctx.fillStyle = flash ? '#fff8e9' : '#7f351e';
    ctx.fillRect(x + 5, y + 19, 2, 1);
    ctx.fillRect(x + 17, y + 19, 2, 1);
    ctx.fillStyle = flash ? '#ffffff' : '#d8ded6';
    ctx.fillRect(x + 12, y + 16, 1, 1);
    ctx.fillRect(x + 12, y + 19, 1, 1);
    ctx.fillStyle = skinLight;
    ctx.fillRect(x + 2, y + 15, 1, 2);
    ctx.fillRect(x + 22, y + 15, 1, 2);
    ctx.fillStyle = skinShade;
    ctx.fillRect(x + 3, y + 18, 2, 1);
    ctx.fillRect(x + 20, y + 18, 2, 1);
    ctx.fillStyle = '#3a2a1c';
    ctx.fillRect(x + 4, y + 26, 7, 1);
    ctx.fillRect(x + 14, y + 26, 7, 1);
    ctx.fillStyle = flash ? '#fff8e9' : '#ad7b45';
    ctx.fillRect(x + 4, y + 25, 3, 1);
    ctx.fillRect(x + 14, y + 25, 3, 1);
}

function drawHeavyEnemyDetailPass(enemy, x, y) {
    const flash = isVisualHitFlashActive(enemy.hitFlash);
    if (enemy.creatureType === 'troll') {
        ctx.fillStyle = flash ? '#fff0d0' : '#31482f';
        ctx.fillRect(x + 7, y + 10, 1, 4);
        ctx.fillRect(x + 12, y + 10, 1, 3);
        ctx.fillStyle = flash ? '#fff8e9' : '#a5b96a';
        ctx.fillRect(x + 6, y + 10, 2, 1);
        ctx.fillRect(x + 12, y + 11, 2, 1);
        ctx.fillStyle = flash ? '#fff0d0' : '#3c5437';
        ctx.fillRect(x + 5, y + 13, 3, 1);
        ctx.fillRect(x + 13, y + 12, 2, 1);
        ctx.fillStyle = '#d5bf83';
        ctx.fillRect(x + 6, y + 16, 1, 1);
        ctx.fillRect(x + 13, y + 17, 1, 1);
        ctx.fillStyle = '#d7bc76';
        ctx.fillRect(x + 8, y + 3, 1, 1);
        ctx.fillRect(x + 13, y + 3, 1, 1);
        ctx.fillStyle = flash ? '#fff8e9' : '#6f8a52';
        ctx.fillRect(x + 6, y + 5, 2, 1);
        ctx.fillRect(x + 13, y + 6, 2, 1);
        ctx.fillStyle = flash ? '#fff0d0' : '#273a2a';
        ctx.fillRect(x + 8, y + 11, 1, 3);
        ctx.fillRect(x + 11, y + 10, 1, 4);
        ctx.fillStyle = flash ? '#ffffff' : '#b8c780';
        ctx.fillRect(x + 8, y + 12, 1, 1);
        ctx.fillRect(x + 11, y + 11, 1, 1);
        ctx.fillStyle = flash ? '#ffffff' : '#caa968';
        ctx.fillRect(x + 5, y + 15, 2, 1);
        ctx.fillRect(x + 13, y + 14, 2, 1);
        ctx.fillStyle = flash ? '#fff8e9' : '#587244';
        ctx.fillRect(x + 7, y + 17, 1, 2);
        ctx.fillRect(x + 12, y + 17, 1, 2);
    }
    if (enemy.isFemale) {
        ctx.fillStyle = flash ? '#fff8e9' : '#f2d28a';
        ctx.fillRect(x + 7, y + 1, 6, 1);
        ctx.fillRect(x + 8, y, 4, 1);
        ctx.fillStyle = flash ? '#ffffff' : '#db7890';
        ctx.fillRect(x + 10, y, 1, 2);
        ctx.fillStyle = flash ? '#fff8e9' : '#f3c1d0';
        ctx.fillRect(x + 5, y + 7, 1, 2);
        ctx.fillRect(x + 14, y + 8, 1, 2);
        ctx.fillStyle = flash ? '#ffffff' : '#d97996';
        ctx.fillRect(x + 7, y + 13, 1, 2);
        ctx.fillRect(x + 10, y + 13, 1, 2);
        ctx.fillStyle = flash ? '#fff8e9' : '#f2d28a';
        ctx.fillRect(x + 8, y + 14, 2, 1);
    }
}

function drawFemaleHeavyAccents(enemy, x, y) {
    const flash = isVisualHitFlashActive(enemy.hitFlash);
    const hair = flash ? '#fff8e9' : '#583747';
    const highlight = flash ? '#ffffff' : '#d88aa8';

    ctx.fillStyle = hair;
    ctx.fillRect(x + 4, y + 1, 2, 5);
    ctx.fillRect(x + 15, y + 1, 2, 5);
    ctx.fillRect(x + 5, y + 4, 1, 4);
    ctx.fillRect(x + 15, y + 4, 1, 4);
    ctx.fillStyle = highlight;
    ctx.fillRect(x + 5, y + 3, 1, 3);
    ctx.fillRect(x + 15, y + 3, 1, 3);

    ctx.fillStyle = flash ? '#fff8e9' : '#f2d28a';
    ctx.fillRect(x + 7, y + 1, 6, 1);
    ctx.fillStyle = flash ? '#ffffff' : '#d97996';
    ctx.fillRect(x + 9, y, 2, 2);
    ctx.fillRect(x + 6, y + 8, 1, 2);
    ctx.fillRect(x + 14, y + 8, 1, 2);
    ctx.fillStyle = flash ? '#ffffff' : '#f4d4a2';
    ctx.fillRect(x + 9, y + 14, 2, 2);
}

function drawGoblinDetailPass(enemy, x, y, weaponBob, isFemale, isRunner = false) {
    const flash = isVisualHitFlashActive(enemy.hitFlash);
    const seam = flash ? '#fff8e9' : isFemale ? '#e8a0b8' : '#9ca968';
    const leather = flash ? '#fff0d0' : isFemale ? '#5a303e' : '#493329';

    ctx.fillStyle = seam;
    ctx.fillRect(x + 5, y + 9, 1, 1);
    ctx.fillRect(x + 6, y + 10, 1, 1);
    ctx.fillRect(x + 10, y + 11, 1, 1);
    ctx.fillRect(x + 9, y + 12, 1, 1);
    ctx.fillStyle = leather;
    ctx.fillRect(x + 4, y + 12, 2, 1);
    ctx.fillRect(x + 10, y + 12, 2, 1);
    ctx.fillStyle = '#e2bd69';
    ctx.fillRect(x + 7, y + 12, 2, 1);
    ctx.fillRect(x + 7, y + 13, 1, 1);
    ctx.fillStyle = isFemale ? '#b9f1de' : '#e8d39a';
    ctx.fillRect(x + 4, y + 3, 1, 1);
    ctx.fillRect(x + 11, y + 3, 1, 1);
    ctx.fillStyle = isFemale ? '#f0bd74' : '#c58a50';
    ctx.fillRect(x + 6, y + 7, 1, 1);
    ctx.fillRect(x + 10, y + 7, 1, 1);
    ctx.fillStyle = flash ? '#fff8e9' : '#e4d8b6';
    ctx.fillRect(x + 13, y + 5 + weaponBob, 1, 1);
    ctx.fillStyle = flash ? '#ffffff' : isFemale ? '#eaf4c4' : '#657341';
    ctx.fillRect(x + 6, y + 14, 1, 1);
    ctx.fillRect(x + 11, y + 14, 1, 1);
    ctx.fillRect(x + 8, y + 15, 2, 1);
    ctx.fillStyle = flash ? '#fff8e9' : '#b87948';
    ctx.fillRect(x + 4, y + 4, 1, 2);
    ctx.fillRect(x + 11, y + 4, 1, 2);
    ctx.fillStyle = flash ? '#ffffff' : '#d2a64f';
    ctx.fillRect(x + 5, y + 11, 1, 1);
    ctx.fillRect(x + 11, y + 10, 1, 1);
    ctx.fillStyle = leather;
    ctx.fillRect(x + 5, y + 16, 2, 1);
    ctx.fillRect(x + 12, y + 16, 2, 1);
    ctx.fillStyle = flash ? '#ffffff' : '#d8c28c';
    ctx.fillRect(x + 13, y + 6 + weaponBob, 1, 1);
    if (isRunner) {
        ctx.fillStyle = '#211b19';
        ctx.fillRect(x + 1, y + 9, 4, 4);
        ctx.fillStyle = flash ? '#fff0d0' : '#633d28';
        ctx.fillRect(x + 2, y + 9, 3, 3);
        ctx.fillStyle = flash ? '#fff8e9' : '#a66f3b';
        ctx.fillRect(x + 2, y + 10, 2, 1);
        ctx.fillStyle = flash ? '#ffffff' : '#d2a64f';
        ctx.fillRect(x + 4, y + 10, 1, 1);
        ctx.fillStyle = flash ? '#fff0d0' : '#493329';
        ctx.fillRect(x + 5, y + 11, 1, 3);
        ctx.fillRect(x + 10, y + 11, 1, 3);
        ctx.fillStyle = flash ? '#ffffff' : '#b87948';
        ctx.fillRect(x + 4, y + 14, 3, 1);
        ctx.fillRect(x + 10, y + 14, 3, 1);
        ctx.fillStyle = flash ? '#fff8e9' : '#d8c28c';
        ctx.fillRect(x + 5, y + 15, 2, 1);
        ctx.fillRect(x + 10, y + 15, 2, 1);
        ctx.fillStyle = flash ? '#ffffff' : '#c58a50';
        ctx.fillRect(x + 6, y + 16, 1, 1);
        ctx.fillRect(x + 11, y + 16, 1, 1);
    } else {
        ctx.fillStyle = flash ? '#ffffff' : '#d2a64f';
        ctx.fillRect(x + 7, y + 13, 2, 1);
        ctx.fillStyle = flash ? '#fff8e9' : '#493329';
        ctx.fillRect(x + 5, y + 14, 1, 2);
        ctx.fillRect(x + 10, y + 14, 1, 2);
    }
    if (isFemale) {
        ctx.fillStyle = flash ? '#ffffff' : '#f3d184';
        ctx.fillRect(x + 6, y + 2, 4, 1);
        ctx.fillRect(x + 7, y + 1, 2, 1);
        ctx.fillStyle = flash ? '#fff8e9' : '#d87691';
        ctx.fillRect(x + 8, y + 2, 1, 1);
        ctx.fillStyle = flash ? '#ffffff' : '#f6c4d2';
        ctx.fillRect(x + 5, y + 8, 1, 1);
        ctx.fillRect(x + 12, y + 8, 1, 1);
        ctx.fillStyle = flash ? '#ffffff' : '#e8a0b8';
        ctx.fillRect(x + 7, y + 13, 1, 2);
        ctx.fillRect(x + 10, y + 13, 1, 2);
        ctx.fillStyle = flash ? '#ffffff' : '#f3d184';
        ctx.fillRect(x + 8, y + 14, 2, 1);
        ctx.fillStyle = flash ? '#fff8e9' : '#69364a';
        ctx.fillRect(x + 3, y + 5, 1, 5);
        ctx.fillRect(x + 12, y + 6, 1, 5);
        ctx.fillStyle = flash ? '#ffffff' : '#ee9fba';
        ctx.fillRect(x + 4, y + 6, 1, 2);
        ctx.fillRect(x + 11, y + 7, 1, 2);
        ctx.fillRect(x + 7, y + 10, 1, 2);
        ctx.fillRect(x + 9, y + 10, 1, 2);
    }
    if (isRunner) {
        const scarf = flash ? '#fff8e9' : '#c94736';
        const scarfLight = flash ? '#ffffff' : '#ffad57';
        ctx.fillStyle = '#281b20';
        ctx.fillRect(x - 2, y + 5, 6, 3);
        ctx.fillRect(x - 4, y + 6, 5, 2);
        ctx.fillRect(x - 8, y + 7, 6, 3);
        ctx.fillRect(x - 10, y + 8, 4, 2);
        ctx.fillStyle = scarf;
        ctx.fillRect(x - 3, y + 5, 5, 2);
        ctx.fillRect(x - 5, y + 6, 4, 1);
        ctx.fillRect(x - 4, y + 8, 3, 1);
        ctx.fillRect(x - 8, y + 7, 6, 2);
        ctx.fillRect(x - 10, y + 8, 4, 1);
        ctx.fillStyle = scarfLight;
        ctx.fillRect(x - 4, y + 6, 3, 1);
        ctx.fillRect(x - 3, y + 8, 2, 1);
        ctx.fillRect(x - 7, y + 7, 4, 1);
        ctx.fillRect(x - 9, y + 8, 2, 1);
        ctx.fillStyle = '#342720';
        ctx.fillRect(x + 4, y + 8, 8, 1);
        ctx.fillStyle = flash ? '#fff0d0' : '#d8a34e';
        ctx.fillRect(x + 6, y + 8, 4, 1);
        ctx.fillStyle = '#241a19';
        ctx.fillRect(x + 2, y + 12, 2, 4);
        ctx.fillRect(x + 11, y + 12, 2, 4);
        ctx.fillStyle = flash ? '#fff8e9' : '#c9d1c0';
        ctx.fillRect(x + 1, y + 11, 1, 3);
        ctx.fillRect(x + 12, y + 11, 1, 3);
        ctx.fillStyle = flash ? '#ffffff' : '#e5c777';
        ctx.fillRect(x + 1, y + 11, 1, 1);
        ctx.fillRect(x + 12, y + 11, 1, 1);
        ctx.fillStyle = '#29231f';
        ctx.fillRect(x + 3, y + 1, 10, 2);
        ctx.fillStyle = flash ? '#ffffff' : '#d8a34e';
        ctx.fillRect(x + 4, y + 1, 8, 1);
        ctx.fillStyle = flash ? '#ffffff' : '#ffcf70';
        ctx.fillRect(x + 6, y + 2, 4, 1);
        ctx.fillStyle = '#392d25';
        ctx.fillRect(x + 5, y + 6, 1, 1);
        ctx.fillRect(x + 10, y + 6, 1, 1);
    } else {
        ctx.fillStyle = '#283024';
        ctx.fillRect(x + 3, y + 1, 10, 2);
        ctx.fillRect(x + 4, y, 8, 1);
        ctx.fillStyle = flash ? '#fff8e9' : '#b5aa79';
        ctx.fillRect(x + 5, y + 1, 6, 1);
        ctx.fillStyle = flash ? '#ffffff' : '#d5ddd1';
        ctx.fillRect(x + 5, y - 1, 6, 1);
        ctx.fillRect(x + 3, y + 1, 2, 1);
        ctx.fillRect(x + 11, y + 1, 2, 1);
        ctx.fillStyle = flash ? '#ffffff' : '#d2a64f';
        ctx.fillRect(x + 7, y, 2, 1);
        ctx.fillStyle = '#293327';
        ctx.fillRect(x + 2, y + 9, 3, 4);
        ctx.fillRect(x + 12, y + 9, 3, 4);
        ctx.fillStyle = flash ? '#fff8e9' : '#9a9b70';
        ctx.fillRect(x + 3, y + 9, 2, 2);
        ctx.fillRect(x + 12, y + 9, 2, 2);
        ctx.fillStyle = flash ? '#ffffff' : '#d2a64f';
        ctx.fillRect(x + 4, y + 10, 1, 1);
        ctx.fillRect(x + 12, y + 10, 1, 1);
        ctx.fillStyle = '#30251d';
        ctx.fillRect(x + 5, y + 11, 8, 1);
        ctx.fillStyle = flash ? '#fff0d0' : '#b99045';
        ctx.fillRect(x + 7, y + 11, 3, 1);
        ctx.fillStyle = '#d8c28c';
        ctx.fillRect(x + 3, y + 14, 2, 1);
        ctx.fillRect(x + 12, y + 14, 2, 1);
    }
}

function drawHeavyEnemyEquipment(enemy, x, y) {
    if (enemy.armorDurability > 0) {
        ctx.fillStyle = '#26343a';
        ctx.fillRect(x + 5, y + 11, 10, 5);
        ctx.fillStyle = '#71848a';
        ctx.fillRect(x + 6, y + 11, 8, 1);
        ctx.fillRect(x + 6, y + 15, 8, 1);
        ctx.fillStyle = '#c2d0c7';
        ctx.fillRect(x + 9, y + 12, 2, 3);
        ctx.fillStyle = '#d2a950';
        ctx.fillRect(x + 8, y + 13, 4, 1);
    }
    if (enemy.shieldDurability > 0) {
        ctx.fillStyle = '#49301d';
        ctx.fillRect(x + 15, y + 8, 2, 8);
        ctx.fillStyle = enemy.shieldRaised ? '#8fb5bc' : '#4d7780';
        ctx.fillRect(x + 16, y + 7, 5, 9);
        ctx.fillStyle = '#d5b96c';
        ctx.fillRect(x + 17, y + 9, 3, 5);
        ctx.fillStyle = '#bad8d2';
        ctx.fillRect(x + 16, y + 8, 1, 7);
        ctx.fillRect(x + 20, y + 8, 1, 7);
        ctx.fillStyle = '#f5e6a5';
        ctx.fillRect(x + 18, y + 11, 1, 2);
    }
}

function drawEnemyStatusMarkers(enemy, screenX, screenY) {
    if (enemy.shieldBrokenTimer > 0) {
        const progress = Math.max(0, Math.min(1, enemy.shieldBrokenTimer / 1.2));
        ctx.save();
        ctx.fillStyle = 'rgba(24, 15, 9, 0.96)';
        ctx.fillRect(screenX - 10, screenY - 16, 36, 11);
        ctx.strokeStyle = '#ffd67c';
        ctx.lineWidth = 1;
        ctx.strokeRect(screenX - 10, screenY - 16, 36, 11);
        ctx.font = '7px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff1bc';
        ctx.fillText('ABERTO', screenX + 8, screenY - 12);
        ctx.fillStyle = '#4d3c2b';
        ctx.fillRect(screenX - 7, screenY - 7, 30, 1);
        ctx.fillStyle = '#ffcf5b';
        ctx.fillRect(screenX - 7, screenY - 7, 30 * progress, 1);
        ctx.restore();
    }
    if (enemy.creatureType === 'goblinRunner') {
        ctx.fillStyle = '#ffb84d';
        ctx.fillRect(screenX + 5, screenY + 2, 2, 2);
        ctx.fillRect(screenX + 9, screenY + 2, 2, 2);
        ctx.fillStyle = '#fff0bd';
        ctx.fillRect(screenX + 6, screenY + 2, 1, 1);
        ctx.fillRect(screenX + 10, screenY + 2, 1, 1);
    }
    if (enemy.shieldRaised && enemy.shieldDurability > 0) {
        ctx.fillStyle = '#b9eff3';
        ctx.fillRect(screenX + 1, screenY + 14, 2, 2);
        for (let index = 0; index < enemy.shieldDurability; index++) {
            ctx.fillRect(screenX + 4 + index * 3, screenY + 14, 2, 2);
        }
    }
}

function drawFemaleGoblinSprite(enemy, x, y, step, weaponBob, pain) {
    const bobLeft = Math.max(0, step) * 1.5;
    const bobRight = Math.max(0, -step) * 1.5;
    const skinShadow = isVisualHitFlashActive(enemy.hitFlash) ? '#f0d7c2' : '#5b8b45';
    const skinBase = isVisualHitFlashActive(enemy.hitFlash) ? '#fff0d0' : '#a4d96f';
    const skinLight = isVisualHitFlashActive(enemy.hitFlash) ? '#fff8e9' : '#c4ee8b';
    const skinHighlight = isVisualHitFlashActive(enemy.hitFlash) ? '#fff8e9' : '#e5ffc0';

    ctx.fillStyle = '#161a22';
    ctx.fillRect(x + 4, y + 15 + bobLeft, 3, 1);
    ctx.fillRect(x + 9, y + 15 + bobRight, 3, 1);
    ctx.fillStyle = '#4b3026';
    ctx.fillRect(x + 3, y + 16 + bobLeft, 5, 1);
    ctx.fillRect(x + 8, y + 16 + bobRight, 5, 1);

    ctx.fillStyle = '#292536';
    ctx.fillRect(x + 5, y + 11, 2, 4);
    ctx.fillRect(x + 9, y + 11, 2, 4);
    ctx.fillStyle = '#493746';
    ctx.fillRect(x + 5, y + 13 + bobLeft, 2, 2);
    ctx.fillRect(x + 9, y + 13 + bobRight, 2, 2);
    ctx.fillStyle = '#b6a68c';
    ctx.fillRect(x + 4, y + 14, 3, 1);
    ctx.fillRect(x + 9, y + 14, 3, 1);

    ctx.fillStyle = '#321f32';
    ctx.fillRect(x + 5, y + 10, 6, 5);
    ctx.fillRect(x + 4, y + 11, 8, 2);
    ctx.fillStyle = '#594057';
    ctx.fillRect(x + 6, y + 10, 4, 4);
    ctx.fillRect(x + 5, y + 12, 6, 2);
    ctx.fillStyle = '#896176';
    ctx.fillRect(x + 7, y + 11, 2, 4);
    ctx.fillStyle = '#bd9d75';
    ctx.fillRect(x + 5, y + 10, 1, 3);
    ctx.fillRect(x + 10, y + 10, 1, 3);
    ctx.fillStyle = '#7e263d';
    ctx.fillRect(x + 7, y + 11, 2, 2);
    ctx.fillStyle = '#ff6c70';
    ctx.fillRect(x + 7, y + 11, 1, 1);

    ctx.fillStyle = skinShadow;
    ctx.fillRect(x + 2, y + 7, 3, 5);
    ctx.fillRect(x + 11, y + 7, 3, 5);
    ctx.fillStyle = skinBase;
    ctx.fillRect(x + 3, y + 8, 2, 3);
    ctx.fillRect(x + 11, y + 8, 2, 3);
    ctx.fillStyle = skinLight;
    ctx.fillRect(x + 3, y + 8, 1, 2);
    ctx.fillRect(x + 12, y + 8, 1, 2);

    ctx.fillStyle = '#17151b';
    ctx.fillRect(x + 2, y + 6, 3, 2);
    ctx.fillRect(x + 11, y + 6, 3, 2);
    ctx.fillRect(x + 3, y + 4, 2, 4);
    ctx.fillRect(x + 11, y + 4, 2, 4);
    ctx.fillStyle = '#a27b3e';
    ctx.fillRect(x + 1, y + 5, 2, 2);
    ctx.fillRect(x + 13, y + 5, 2, 2);
    ctx.fillStyle = '#f0cd77';
    ctx.fillRect(x + 1, y + 5, 1, 1);
    ctx.fillRect(x + 14, y + 5, 1, 1);
    ctx.fillStyle = skinBase;
    ctx.fillRect(x + 2, y + 6, 2, 2);
    ctx.fillRect(x + 12, y + 6, 2, 2);

    ctx.fillStyle = '#1d1720';
    ctx.fillRect(x + 4, y + 1, 8, 1);
    ctx.fillRect(x + 3, y + 2, 10, 2);
    ctx.fillRect(x + 2, y + 4, 2, 5);
    ctx.fillRect(x + 12, y + 4, 2, 7);
    ctx.fillRect(x + 3, y + 8, 2, 4);
    ctx.fillRect(x + 11, y + 9, 2, 4);
    ctx.fillStyle = '#58352f';
    ctx.fillRect(x + 5, y + 1, 6, 1);
    ctx.fillRect(x + 4, y + 2, 8, 2);
    ctx.fillRect(x + 3, y + 4, 2, 3);
    ctx.fillRect(x + 12, y + 5, 1, 4);
    ctx.fillStyle = '#9c5a3f';
    ctx.fillRect(x + 6, y + 2, 4, 1);
    ctx.fillRect(x + 4, y + 3, 2, 1);
    ctx.fillRect(x + 12, y + 7, 1, 2);
    ctx.fillStyle = '#d18a56';
    ctx.fillRect(x + 7, y + 2, 2, 1);

    ctx.fillStyle = skinShadow;
    ctx.fillRect(x + 4, y + 3, 8, 6);
    ctx.fillStyle = skinBase;
    ctx.fillRect(x + 5, y + 3, 6, 5);
    ctx.fillRect(x + 4, y + 4, 8, 3);
    ctx.fillStyle = skinLight;
    ctx.fillRect(x + 5, y + 3, 4, 1);
    ctx.fillRect(x + 4, y + 4, 1, 2);
    ctx.fillRect(x + 5, y + 7, 2, 1);
    ctx.fillStyle = skinHighlight;
    ctx.fillRect(x + 5, y + 4, 2, 1);

    ctx.fillStyle = '#4b303e';
    ctx.fillRect(x + 5, y + 4, 3, 1);
    ctx.fillRect(x + 9, y + 4, 3, 1);
    ctx.fillStyle = '#f1cf69';
    ctx.fillRect(x + 5, y + 5, 2, 2);
    ctx.fillRect(x + 9, y + 5, 2, 2);
    ctx.fillStyle = '#281d2a';
    ctx.fillRect(x + 6, y + 5, 1, 2);
    ctx.fillRect(x + 10, y + 5, 1, 2);
    ctx.fillStyle = '#fff1a6';
    ctx.fillRect(x + 5, y + 5, 1, 1);
    ctx.fillRect(x + 9, y + 5, 1, 1);
    ctx.fillStyle = '#5b8b45';
    ctx.fillRect(x + 7, y + 7, 3, 1);
    ctx.fillStyle = '#df9a92';
    ctx.fillRect(x + 7, y + 8, 2, 1);

    ctx.fillStyle = '#202027';
    ctx.fillRect(x + 3, y + 8, 2, 4);
    ctx.fillRect(x + 11, y + 8, 2, 4);
    ctx.fillStyle = '#76516a';
    ctx.fillRect(x + 3, y + 8, 3, 2);
    ctx.fillRect(x + 10, y + 8, 3, 2);
    ctx.fillStyle = '#bd8b9a';
    ctx.fillRect(x + 4, y + 8, 2, 1);
    ctx.fillRect(x + 10, y + 8, 2, 1);
    ctx.fillRect(x + 5, y + 9, 1, 2);
    ctx.fillRect(x + 10, y + 9, 1, 2);
    ctx.fillStyle = '#f3c9bd';
    ctx.fillRect(x + 4, y + 9, 1, 1);
    ctx.fillRect(x + 11, y + 9, 1, 1);

    ctx.fillStyle = '#24232b';
    ctx.fillRect(x + 4, y + 9, 8, 4);
    ctx.fillStyle = '#a76b7d';
    ctx.fillRect(x + 5, y + 9, 6, 3);
    ctx.fillStyle = '#efb1a8';
    ctx.fillRect(x + 6, y + 9, 4, 1);
    ctx.fillRect(x + 5, y + 10, 2, 1);
    ctx.fillRect(x + 9, y + 10, 2, 1);
    ctx.fillStyle = '#633649';
    ctx.fillRect(x + 7, y + 10, 2, 2);
    ctx.fillStyle = '#912b3c';
    ctx.fillRect(x + 7, y + 9, 2, 2);
    ctx.fillStyle = '#ff7372';
    ctx.fillRect(x + 7, y + 9, 1, 1);
    ctx.fillStyle = '#b8a17a';
    ctx.fillRect(x + 6, y + 12, 4, 1);

    if (pain) {
        ctx.fillStyle = '#541f2a';
        ctx.fillRect(x + 7, y + 7, 3, 2);
        ctx.fillStyle = '#e58b83';
        ctx.fillRect(x + 8, y + 8, 1, 1);
    }

    ctx.fillStyle = '#303833';
    ctx.fillRect(x + 11, y + 11 + weaponBob, 2, 3);
    ctx.fillStyle = '#aeb6a0';
    ctx.fillRect(x + 12, y + 6 + weaponBob, 1, 6);
    ctx.fillStyle = '#eef0d2';
    ctx.fillRect(x + 12, y + 6 + weaponBob, 1, 2);
    ctx.fillStyle = '#b28a49';
    ctx.fillRect(x + 11, y + 5 + weaponBob, 3, 1);

    if (enemy.armorDurability > 0) {
        ctx.fillStyle = '#633649';
        ctx.fillRect(x + 4, y + 9, 8, 4);
        ctx.fillStyle = '#efb1a8';
        ctx.fillRect(x + 5, y + 9, 6, 1);
        ctx.fillRect(x + 5, y + 12, 6, 1);
        ctx.fillStyle = '#f3c9bd';
        ctx.fillRect(x + 7, y + 10, 2, 2);
        ctx.fillStyle = '#d4a64f';
        ctx.fillRect(x + 7, y + 10, 2, 1);
    }
    if (enemy.shieldDurability > 0) {
        ctx.fillStyle = '#49301d';
        ctx.fillRect(x + 14, y + 7, 2, 6);
        ctx.fillStyle = enemy.shieldRaised ? '#8fb5bc' : '#4d7780';
        ctx.fillRect(x + 14, y + 6, 4, 7);
        ctx.fillStyle = '#d5b96c';
        ctx.fillRect(x + 15, y + 8, 2, 3);
        ctx.fillStyle = '#bad8d2';
        ctx.fillRect(x + 14, y + 7, 1, 4);
        ctx.fillRect(x + 17, y + 7, 1, 4);
        ctx.fillStyle = '#f5e6a5';
        ctx.fillRect(x + 15, y + 9, 1, 1);
        if (enemy.shieldRaised) {
            ctx.fillStyle = '#dff7e8';
            ctx.fillRect(x + 15, y + 5, 3, 1);
        }
    }
}

function drawEnemyAttack(enemy) {
    if (enemy.isBoss && enemy.bossType === 'grimReaper') {
        return;
    }
    if (enemy.matriarchBroodWarning > 0 && matriarchArena) {
        ctx.save();
        ctx.globalAlpha = 0.4 + Math.sin(enemy.animTime * 30) * 0.25;
        ctx.strokeStyle = '#d9c48e';
        ctx.fillStyle = 'rgba(217, 196, 142, 0.12)';
        ctx.lineWidth = 2;
        for (const tunnel of matriarchArena.tunnels) {
            const centerX = (tunnel.spawn.x + 0.5) * tileSize;
            const centerY = (tunnel.spawn.y + 0.5) * tileSize;
            ctx.beginPath();
            ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }
        ctx.restore();
    }
    if (enemy.attackWarningTimer > 0) {
        const attack = getEnemyContactAttack(enemy);
        const centerX = enemy.x + enemy.size / 2;
        const centerY = enemy.y + enemy.size / 2;
        ctx.save();
        ctx.globalAlpha = 0.4 + Math.sin(enemy.animTime * 28) * 0.16;
        ctx.strokeStyle = enemy.isBoss ? '#ff8b52' : '#f3d37a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + enemy.facingX * attack.range, centerY + enemy.facingY * attack.range);
        ctx.stroke();
        ctx.restore();
    }
    if (enemy.isBoss && enemy.bossType === 'dragon' && enemy.wingSweepWarning > 0) {
        const attack = getCreatureAttackData(enemy, 'wing-sweep');
        const centerX = enemy.x + enemy.size / 2;
        const centerY = enemy.y + enemy.size / 2;
        ctx.save();
        ctx.globalAlpha = 0.45 + Math.sin(enemy.spriteAnimTime * 28) * 0.18;
        ctx.strokeStyle = '#ffae55';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + enemy.wingSweepDirectionX * attack.range,
            centerY + enemy.wingSweepDirectionY * attack.range
        );
        ctx.stroke();
        ctx.restore();
    }
    if (enemy.toxicBiteWarning > 0) {
        ctx.save();
        ctx.globalAlpha = 0.6 + Math.sin(enemy.animTime * 28) * 0.2;
        ctx.fillStyle = '#9bda59';
        ctx.fillRect(enemy.x + enemy.size / 2 - 3, enemy.y - 7, 6, 3);
        ctx.fillStyle = '#efffa7';
        ctx.fillRect(enemy.x + enemy.size / 2 - 1, enemy.y - 8, 2, 2);
        ctx.restore();
    }
    if (enemy.echoWaveWarning > 0) {
        const centerX = enemy.x + enemy.size / 2;
        const centerY = enemy.y + enemy.size / 2;
        ctx.save();
        ctx.globalAlpha = 0.6 + Math.sin(enemy.animTime * 28) * 0.2;
        ctx.strokeStyle = '#e6bf72';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + enemy.echoWaveDirectionX * 120,
            centerY + enemy.echoWaveDirectionY * 120
        );
        ctx.stroke();
        ctx.restore();
    }
    if (enemy.tailSweepWarning > 0) {
        ctx.save();
        ctx.globalAlpha = 0.45 + Math.sin(enemy.animTime * 25) * 0.18;
        ctx.strokeStyle = '#f0a04c';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(enemy.x + enemy.size / 2, enemy.y + enemy.size / 2, 35, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
    if (enemy.glyphWarning > 0) {
        ctx.save();
        ctx.globalAlpha = 0.48 + Math.sin(enemy.animTime * 24) * 0.2;
        ctx.strokeStyle = '#d4a3f4';
        ctx.fillStyle = 'rgba(170, 105, 211, 0.14)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(enemy.glyphTargetX, enemy.glyphTargetY, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(enemy.glyphTargetX - 10, enemy.glyphTargetY);
        ctx.lineTo(enemy.glyphTargetX + 10, enemy.glyphTargetY);
        ctx.moveTo(enemy.glyphTargetX, enemy.glyphTargetY - 10);
        ctx.lineTo(enemy.glyphTargetX, enemy.glyphTargetY + 10);
        ctx.stroke();
        ctx.restore();
    }
    if (enemy.shoulderBashWarning > 0) {
        const attack = getCreatureAttackData(enemy, 'shoulder-bash');
        const centerX = enemy.x + enemy.size / 2;
        const centerY = enemy.y + enemy.size / 2;
        ctx.save();
        ctx.globalAlpha = 0.45 + Math.sin(enemy.animTime * 24) * 0.2;
        ctx.strokeStyle = '#ffb34d';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + enemy.facingX * attack.range,
            centerY + enemy.facingY * attack.range
        );
        ctx.stroke();
        ctx.restore();
    }
    if (enemy.creatureType === 'goblinRunner' && enemy.runnerLungeWarning > 0) {
        ctx.save();
        ctx.strokeStyle = '#ffd276';
        ctx.globalAlpha = 0.55 + Math.sin(enemy.animTime * 28) * 0.2;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(
            enemy.x + enemy.size / 2,
            enemy.y + enemy.size / 2
        );
        ctx.lineTo(
            enemy.x + enemy.size / 2 + enemy.runnerLungeX * 24,
            enemy.y + enemy.size / 2 + enemy.runnerLungeY * 24
        );
        ctx.stroke();
        ctx.restore();
    }
    if (['spider', 'sootSpider', 'matriarch'].includes(enemy.creatureType)
        && !enemy.isBoss && enemy.attackTimer > 0) {
        const progress = Math.max(0, Math.min(1, 1 - enemy.attackTimer / 0.24));
        const radius = 5 + progress * 8;
        ctx.save();
        ctx.globalAlpha = 1 - progress * 0.6;
        ctx.strokeStyle = '#e9a2e2';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(
            enemy.x + enemy.size / 2,
            enemy.y + enemy.size / 2,
            radius,
            0,
            Math.PI * 2
        );
        ctx.stroke();
        for (let leg = 0; leg < 8; leg++) {
            const angle = leg * Math.PI / 4;
            ctx.beginPath();
            ctx.moveTo(
                enemy.x + enemy.size / 2 + Math.cos(angle) * (radius - 2),
                enemy.y + enemy.size / 2 + Math.sin(angle) * (radius - 2)
            );
            ctx.lineTo(
                enemy.x + enemy.size / 2 + Math.cos(angle) * radius,
                enemy.y + enemy.size / 2 + Math.sin(angle) * radius
            );
            ctx.stroke();
        }
        ctx.restore();
        return;
    }
    if (enemy.attackTimer <= 0) {
        return;
    }
    if (hasGoblinSpriteAttackAnimation(enemy)) {
        return;
    }

    const progress = 1 - enemy.attackTimer / 0.24;
    const angle = Math.atan2(enemy.facingY, enemy.facingX);
    const swing = (progress - 0.5) * 2.2;
    ctx.save();
    ctx.translate(
        enemy.x + enemy.size / 2,
        enemy.y + enemy.size / 2
    );
    ctx.rotate(angle + swing);
    if (enemy.isBoss) {
        const glow = enemy.bossType === 'dragon' ? '#ef7846' : '#ff9c34';
        ctx.fillStyle = 'rgba(237, 76, 40, 0.35)';
        ctx.fillRect(7, -6, 18, 12);
        ctx.fillStyle = glow;
        ctx.fillRect(10, -4, 13, 8);
        ctx.fillRect(14, -7, 8, 14);
        ctx.fillStyle = '#ffe29a';
        ctx.fillRect(15, -2, 8, 4);
        ctx.restore();
        return;
    }
    ctx.fillStyle = '#433323';
    ctx.fillRect(4, -1, 5, 2);
    ctx.fillStyle = '#a88143';
    ctx.fillRect(7, -3, 2, 6);
    ctx.fillStyle = '#c5cbb8';
    ctx.fillRect(9, -2, 7, 4);
    ctx.fillStyle = '#f4f0d0';
    ctx.fillRect(11, -1, 4, 1);
    ctx.restore();
}

function drawSpiderSprite(step, preparingLeap, hitFlash, isFemale, isSoot = false, isMatriarch = false) {
    ctx.save();
    const stride = Math.round(step * 1.5);
    const spread = preparingLeap ? 2 : 0;
    const shell = hitFlash ? '#fff1dd'
        : isMatriarch ? '#242018' : isSoot ? '#100f11'
            : isFemale ? '#241923' : '#201309';
    const carapace = hitFlash
        ? '#fff1dd'
        : isMatriarch ? preparingLeap ? '#fff0a8' : '#9b8b55'
            : isSoot ? preparingLeap ? '#ff7b32' : '#593020'
                : isFemale ? preparingLeap ? '#ff9fcf' : '#9b4e83'
                    : preparingLeap ? '#ffb34e' : '#99501f';
    const highlight = hitFlash ? '#ffffff'
        : isMatriarch ? '#fff2bd' : isSoot ? '#ff9850'
            : isFemale ? '#ffd0eb' : '#ffd17a';
    const abdomen = hitFlash ? '#fff8eb'
        : isMatriarch ? '#c1ae72' : isSoot ? '#643a2c'
            : isFemale ? '#bd7da5' : '#c16b2d';
    const abdomenLight = hitFlash ? '#ffffff'
        : isMatriarch ? '#fff0a8' : isSoot ? '#ff6c30'
            : isFemale ? '#ffd0eb' : '#ffd17a';
    const outline = hitFlash ? '#fff1dd'
        : isMatriarch ? '#12110e' : isSoot ? '#08090b' : '#100a08';
    const legs = [
        { side: -1, y: -4, kneeX: -7, kneeY: -11, footX: -12, footY: -12 },
        { side: -1, y: -2, kneeX: -10, kneeY: -7, footX: -14, footY: -7 },
        { side: -1, y: 1, kneeX: -10, kneeY: 5, footX: -14, footY: 7 },
        { side: -1, y: 3, kneeX: -7, kneeY: 10, footX: -11, footY: 12 },
        { side: 1, y: -4, kneeX: 7, kneeY: -11, footX: 12, footY: -12 },
        { side: 1, y: -2, kneeX: 10, kneeY: -7, footX: 14, footY: -7 },
        { side: 1, y: 1, kneeX: 10, kneeY: 5, footX: 14, footY: 7 },
        { side: 1, y: 3, kneeX: 7, kneeY: 10, footX: 11, footY: 12 }
    ];

    ctx.lineCap = 'square';
    for (const [index, leg] of legs.entries()) {
        const swing = stride * (index % 2 === 0 ? 1 : -1);
        const kneeX = leg.kneeX + leg.side * swing;
        const footX = leg.footX + leg.side * spread;
        ctx.lineWidth = 2.8;
        ctx.strokeStyle = '#24170f';
        ctx.beginPath();
        ctx.moveTo(leg.side * 1, leg.y);
        ctx.lineTo(kneeX, leg.kneeY);
        ctx.lineTo(footX, leg.footY);
        ctx.stroke();
        ctx.lineWidth = 1.1;
        ctx.strokeStyle = hitFlash ? '#ffffff'
            : isMatriarch ? '#e5d38f' : isSoot ? '#c65c2d' : '#d99650';
        ctx.beginPath();
        ctx.moveTo(leg.side * 2, leg.y);
        ctx.lineTo(kneeX, leg.kneeY);
        ctx.lineTo(footX - leg.side, leg.footY - Math.sign(leg.footY));
        ctx.stroke();
        ctx.fillStyle = isMatriarch ? '#544c38' : isSoot ? '#332821' : '#352116';
        ctx.fillRect(kneeX - 1, leg.kneeY - 1, 2, 2);
        if (isMatriarch && index % 2 === 0) {
            ctx.fillStyle = hitFlash ? '#ffffff' : '#d6c77e';
            ctx.fillRect(footX - leg.side, leg.footY - Math.sign(leg.footY), 2, 1);
        }
    }

    // Broad, marked abdomen and a narrower armored head make the spider silhouette readable.
    if (isFemale) {
        ctx.fillStyle = outline;
        ctx.fillRect(-13, -4, 3, 8);
        ctx.fillRect(-11, -7, 8, 14);
        ctx.fillRect(-8, -8, 9, 16);
        ctx.fillRect(-2, -6, 5, 12);
        ctx.fillStyle = hitFlash ? '#fff1dd' : isMatriarch ? '#a89a68'
            : isSoot ? '#503127' : '#d5b8d2';
        ctx.fillRect(-12, -4, 3, 8);
        ctx.fillRect(-10, -6, 8, 12);
        ctx.fillRect(-7, -7, 8, 14);
        ctx.fillRect(-1, -5, 4, 10);
        ctx.fillStyle = hitFlash ? '#ffffff' : '#f4d7ec';
        ctx.fillRect(-10, -5, 3, 2);
        ctx.fillRect(-6, -6, 3, 2);
        ctx.fillRect(-9, 4, 4, 1);
        ctx.fillStyle = hitFlash ? '#fff8eb' : '#8d557e';
        ctx.fillRect(-12, -1, 2, 2);
        ctx.fillRect(-4, 5, 3, 1);
    }
    ctx.fillStyle = outline;
    ctx.fillRect(-10, -4, 2, 8);
    ctx.fillRect(-8, -6, 8, 12);
    ctx.fillRect(-5, -7, 6, 14);
    ctx.fillRect(0, -5, 5, 10);
    ctx.fillStyle = shell;
    ctx.fillRect(-8, -5, 8, 10);
    ctx.fillRect(-5, -6, 6, 12);
    ctx.fillRect(0, -4, 4, 8);
    ctx.fillStyle = abdomen;
    ctx.fillRect(-7, -4, 5, 8);
    ctx.fillRect(-3, -5, 4, 10);
    ctx.fillStyle = highlight;
    ctx.fillRect(-6, -4, 3, 2);
    ctx.fillRect(-2, -3, 2, 2);
    ctx.fillRect(-5, 3, 3, 1);
    ctx.fillStyle = abdomenLight;
    ctx.fillRect(-4, -1, 2, 2);
    ctx.fillRect(-1, 2, 1, 1);
    ctx.fillStyle = isMatriarch ? '#51452b' : isSoot ? '#251616' : '#4a2b18';
    ctx.fillRect(-9, -2, 2, 4);
    ctx.fillRect(1, -3, 2, 6);

    ctx.fillStyle = shell;
    ctx.fillRect(1, -4, 6, 8);
    ctx.fillRect(3, -5, 4, 10);
    ctx.fillStyle = carapace;
    ctx.fillRect(2, -4, 5, 8);
    ctx.fillRect(4, -5, 3, 10);
    ctx.fillStyle = highlight;
    ctx.fillRect(3, -4, 2, 2);
    ctx.fillRect(5, -3, 1, 1);
    ctx.fillStyle = '#21150f';
    ctx.fillRect(6, -4, 2, 2);
    ctx.fillRect(6, -1, 2, 2);
    ctx.fillRect(5, 2, 2, 2);
    ctx.fillStyle = isMatriarch ? '#fff2bd' : isSoot ? '#ff7436' : '#f3c56c';
    ctx.fillRect(7, -4, 1, 1);
    ctx.fillRect(7, -1, 1, 1);
    ctx.fillRect(6, 2, 1, 1);
    ctx.fillStyle = isMatriarch ? '#75643b' : isSoot ? '#3d241d' : '#59351d';
    ctx.fillRect(-6, -1, 2, 2);
    ctx.fillRect(-2, 1, 2, 2);
    ctx.fillRect(-5, 4, 2, 1);
    ctx.fillRect(1, -2, 1, 4);
    ctx.fillStyle = abdomenLight;
    ctx.fillRect(-6, -3, 1, 1);
    ctx.fillRect(-1, -4, 1, 1);
    ctx.fillRect(2, -3, 1, 1);
    ctx.fillStyle = '#e7d5c8';
    ctx.fillRect(7, 4, 1, 2);
    ctx.fillRect(5, 4, 1, 2);
    ctx.fillStyle = '#3c2515';
    ctx.fillRect(4, 5, 1, 2);
    ctx.fillRect(7, 5, 1, 2);
    ctx.fillStyle = '#c28b55';
    ctx.fillRect(4, 6, 1, 1);
    ctx.fillRect(7, 6, 1, 1);
    ctx.fillStyle = hitFlash ? '#fff8eb' : '#422817';
    ctx.fillRect(-5, -3, 1, 6);
    ctx.fillRect(-2, -4, 1, 8);
    ctx.fillStyle = hitFlash ? '#ffffff' : '#d5a362';
    ctx.fillRect(-4, -3, 1, 1);
    ctx.fillRect(-3, 2, 1, 1);
    ctx.fillRect(-1, -2, 1, 1);
    ctx.fillStyle = hitFlash ? '#ffffff' : '#8c5a35';
    ctx.fillRect(-7, -1, 1, 1);
    ctx.fillRect(-6, 2, 1, 1);
    ctx.fillStyle = hitFlash ? '#ffffff' : '#ffe2a0';
    ctx.fillRect(7, -4, 1, 1);
    ctx.fillRect(7, -1, 1, 1);
    ctx.fillRect(6, 2, 1, 1);
    ctx.strokeStyle = hitFlash ? '#fff8eb' : '#d0a477';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(7, 4);
    ctx.lineTo(9, 6);
    ctx.moveTo(5, 4);
    ctx.lineTo(4, 6);
    ctx.stroke();
    ctx.fillStyle = hitFlash ? '#ffffff' : '#e0b55f';
    ctx.fillRect(-7, -2, 1, 1);
    ctx.fillRect(-5, 1, 1, 1);
    ctx.fillRect(-3, -2, 1, 1);
    ctx.fillStyle = hitFlash ? '#fff8eb' : '#a66b38';
    ctx.fillRect(-8, 0, 1, 2);
    ctx.fillRect(-4, 4, 1, 1);
    ctx.fillRect(-1, 4, 1, 1);
    ctx.fillStyle = hitFlash ? '#ffffff' : '#49301e';
    ctx.fillRect(3, -2, 1, 1);
    ctx.fillRect(5, 1, 1, 1);
    ctx.fillStyle = hitFlash ? '#fff8eb' : '#d8b873';
    ctx.fillRect(8, -3, 1, 1);
    ctx.fillRect(8, 0, 1, 1);
    ctx.fillRect(7, 3, 1, 1);
    ctx.strokeStyle = hitFlash ? '#ffffff' : '#d5a362';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(-7, -5);
    ctx.lineTo(-3, -6);
    ctx.moveTo(-7, 5);
    ctx.lineTo(-3, 6);
    ctx.stroke();
    if (isFemale) {
        ctx.fillStyle = hitFlash ? '#ffffff' : '#f2c1dc';
        ctx.fillRect(-4, -6, 2, 1);
        ctx.fillRect(-3, -5, 1, 1);
        ctx.fillRect(4, -6, 1, 1);
        ctx.fillStyle = hitFlash ? '#fff8eb' : '#ffd77f';
        ctx.fillRect(-1, -4, 2, 2);
        ctx.fillRect(-7, 4, 1, 1);
        ctx.fillStyle = hitFlash ? '#ffffff' : '#b76f9b';
        ctx.fillRect(-2, -5, 1, 2);
        ctx.fillStyle = hitFlash ? '#ffffff' : '#f2c1dc';
        ctx.fillRect(-8, -2, 2, 1);
        ctx.fillRect(-6, 2, 2, 1);
        ctx.fillStyle = hitFlash ? '#fff8eb' : '#ffd77f';
        ctx.fillRect(3, -2, 2, 2);
        ctx.fillStyle = hitFlash ? '#ffffff' : '#b76f9b';
        ctx.fillRect(4, -1, 1, 1);
    }
    if (isSoot) {
        ctx.fillStyle = hitFlash ? '#ffffff' : '#171214';
        ctx.fillRect(-8, -5, 3, 3);
        ctx.fillRect(-4, 5, 3, 2);
        ctx.fillRect(1, -6, 2, 3);
        ctx.fillStyle = hitFlash ? '#ffffff' : '#ff6c30';
        ctx.fillRect(-6, -2, 1, 4);
        ctx.fillRect(-3, -4, 1, 2);
        ctx.fillRect(-2, 2, 2, 1);
        ctx.fillRect(0, -3, 1, 2);
        ctx.fillStyle = hitFlash ? '#ffffff' : '#ffd17a';
        ctx.fillRect(-7, -1, 1, 1);
        ctx.fillRect(2, 3, 1, 1);
    }
    if (isMatriarch) {
        ctx.fillStyle = hitFlash ? '#fff1dd' : '#b8aa82';
        ctx.fillRect(-12, -5, 2, 10);
        ctx.fillRect(-10, -7, 8, 14);
        ctx.fillRect(-7, -8, 8, 16);
        ctx.fillStyle = hitFlash ? '#ffffff' : '#ddd1a7';
        ctx.fillRect(-9, -6, 5, 3);
        ctx.fillRect(-6, 5, 4, 2);
        ctx.fillStyle = hitFlash ? '#fff8eb' : '#827a5e';
        ctx.fillRect(-10, -1, 2, 1);
        ctx.fillRect(-7, 3, 1, 2);
        ctx.fillRect(-3, -5, 1, 2);
        ctx.strokeStyle = hitFlash ? '#ffffff' : '#d6c77e';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(-8, -3);
        ctx.lineTo(-4, -1);
        ctx.lineTo(-7, 2);
        ctx.moveTo(-3, -4);
        ctx.lineTo(-1, -1);
        ctx.lineTo(-4, 3);
        ctx.stroke();
        ctx.fillStyle = hitFlash ? '#ffffff' : '#efe0a5';
        ctx.fillRect(-9, -3, 1, 1);
        ctx.fillRect(-5, 1, 1, 1);
        ctx.fillRect(-3, -2, 1, 1);
        ctx.fillStyle = hitFlash ? '#fff8eb' : '#a67c53';
        ctx.fillRect(3, -6, 1, 1);
        ctx.fillRect(6, -5, 1, 1);
        ctx.fillRect(-11, 5, 1, 1);
        ctx.fillStyle = hitFlash ? '#ffffff' : '#242018';
        ctx.fillRect(-4, -11, 2, 4);
        ctx.fillRect(-1, -12, 2, 5);
        ctx.fillRect(3, -10, 2, 3);
        ctx.fillStyle = hitFlash ? '#ffffff' : '#fff0a8';
        ctx.fillRect(-3, -10, 1, 2);
        ctx.fillRect(0, -11, 1, 2);
        ctx.fillRect(4, -9, 1, 2);
        ctx.fillStyle = hitFlash ? '#ffffff' : '#5d4c32';
        ctx.fillRect(-9, -4, 2, 1);
        ctx.fillRect(-6, 5, 2, 1);
        ctx.fillRect(-2, 6, 2, 1);
        ctx.fillRect(3, -5, 2, 1);
        ctx.fillStyle = hitFlash ? '#ffffff' : '#d6c77e';
        ctx.fillRect(-8, -3, 1, 1);
        ctx.fillRect(-5, 4, 1, 1);
        ctx.fillRect(-1, 5, 1, 1);
        ctx.fillRect(4, -4, 1, 1);
    }
    if (isSoot) {
        ctx.fillStyle = hitFlash ? '#ffffff' : '#171214';
        ctx.fillRect(-9, -8, 3, 3);
        ctx.fillRect(-5, 6, 3, 2);
        ctx.fillRect(0, -8, 3, 3);
        ctx.fillStyle = hitFlash ? '#ffffff' : '#ff7436';
        ctx.fillRect(-8, -7, 1, 2);
        ctx.fillRect(-5, 5, 1, 2);
        ctx.fillRect(-1, -6, 1, 2);
        ctx.fillRect(1, -2, 1, 2);
        ctx.fillStyle = hitFlash ? '#ffffff' : '#ffbf63';
        ctx.fillRect(-7, -6, 1, 1);
        ctx.fillRect(0, -5, 1, 1);
        ctx.fillRect(-3, 1, 1, 1);
    } else if (isMatriarch) {
        ctx.fillStyle = hitFlash ? '#ffffff' : '#4a3e27';
        ctx.fillRect(-5, -12, 2, 5);
        ctx.fillRect(-2, -13, 2, 6);
        ctx.fillRect(1, -12, 2, 5);
        ctx.fillStyle = hitFlash ? '#ffffff' : '#fff0a8';
        ctx.fillRect(-4, -11, 1, 3);
        ctx.fillRect(-1, -12, 1, 3);
        ctx.fillRect(2, -11, 1, 3);
        ctx.fillStyle = hitFlash ? '#fff8eb' : '#f2d875';
        ctx.fillRect(-7, 0, 3, 1);
        ctx.fillRect(-4, 1, 2, 1);
        ctx.fillRect(-2, 2, 2, 1);
        ctx.fillRect(0, 3, 2, 1);
        ctx.fillStyle = hitFlash ? '#ffffff' : '#fff0a8';
        ctx.fillRect(-6, 0, 1, 1);
        ctx.fillRect(-2, 2, 1, 1);
        ctx.fillRect(1, 3, 1, 1);
    } else {
        ctx.fillStyle = hitFlash ? '#ffffff' : '#4a2b18';
        ctx.fillRect(-6, -2, 1, 4);
        ctx.fillRect(-3, -4, 1, 2);
        ctx.fillRect(0, 1, 1, 2);
        ctx.fillStyle = hitFlash ? '#ffffff' : '#ffd17a';
        ctx.fillRect(-6, -1, 1, 1);
        ctx.fillRect(-3, -3, 1, 1);
        ctx.fillRect(0, 1, 1, 1);
    }
    ctx.lineCap = 'butt';
    ctx.restore();
}

function drawWebCocoon(entity) {
    const radius = Math.max(7, Math.min(11, getCollisionRadius(entity) * 0.7));
    const centerX = entity.x + entity.size / 2;
    const centerY = entity.y + entity.size / 2;
    const { spriteSheet, frameMap } = getSpiderAnimationAssets(entity);
    if (frameMap.webEffects && spriteSheet.complete && spriteSheet.naturalWidth > 0) {
        const animation = frameMap.webEffects;
        const frameIndex = Math.floor((entity.animTime || 0) * 5) % animation.frames.length;
        const crop = getAnimationFrameCrop(
            spriteSheet,
            frameMap,
            'webEffects',
            frameIndex
        );
        ctx.save();
        ctx.globalAlpha = Math.min(0.9, 0.55 + entity.webbedTimer * 0.2);
        ctx.drawImage(
            spriteSheet,
            crop.x,
            crop.y,
            crop.width,
            crop.height,
            centerX - radius * 1.65,
            centerY - radius * 1.4,
            radius * 3.3,
            radius * 2.8
        );
        ctx.restore();
        return;
    }
    ctx.save();
    ctx.globalAlpha = Math.min(0.9, 0.55 + entity.webbedTimer * 0.2);
    ctx.strokeStyle = '#e4d6bd';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radius, radius * 0.78, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(centerX - radius * 0.75, centerY - radius * 0.55);
    ctx.lineTo(centerX + radius * 0.75, centerY + radius * 0.55);
    ctx.moveTo(centerX + radius * 0.75, centerY - radius * 0.55);
    ctx.lineTo(centerX - radius * 0.75, centerY + radius * 0.55);
    ctx.moveTo(centerX - radius, centerY);
    ctx.lineTo(centerX + radius, centerY);
    ctx.stroke();
    ctx.restore();
}

function drawSpiderWebEffects() {
    for (const spider of enemies) {
        if (!['spider', 'sootSpider', 'matriarch'].includes(spider.creatureType) || spider.dying) {
            continue;
        }
        if (spider.spiderWebTimer > 0 && spider.spiderWebTarget) {
            const target = spider.spiderWebTarget;
            const startX = spider.x + spider.size / 2;
            const startY = spider.y + spider.size / 2;
            const endX = target.x + target.size / 2;
            const endY = target.y + target.size / 2;
            const offset = Math.sin(spider.animTime * 34) * 2;
            ctx.save();
            ctx.globalAlpha = 0.82;
            ctx.strokeStyle = spider.creatureType === 'sootSpider'
                ? '#81756d' : spider.creatureType === 'matriarch' ? '#e5d69f' : '#eadfc9';
            ctx.lineWidth = spider.creatureType === 'matriarch' ? 2 : 1.5;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.moveTo(startX, startY);
            ctx.lineTo((startX + endX) / 2 - offset, (startY + endY) / 2 + offset);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            ctx.restore();

            const { spriteSheet, frameMap } = getSpiderAnimationAssets(spider);
            if (frameMap.webProjectile
                && spriteSheet.complete
                && spriteSheet.naturalWidth > 0) {
                const attackId = spider.creatureType === 'matriarch'
                    ? 'web-capture'
                    : 'capture-thread';
                const attack = getCreatureAttackData(spider, attackId);
                const duration = attack.warning + attack.execution;
                const progress = Math.max(
                    0,
                    Math.min(1, 1 - spider.spiderWebTimer / duration)
                );
                const executionProgress = Math.max(
                    0,
                    Math.min(1, (progress - attack.warning / duration)
                        / (attack.execution / duration))
                );
                if (executionProgress > 0 && executionProgress < 0.94) {
                    const crop = getAnimationFrameCrop(
                        spriteSheet,
                        frameMap,
                        'webProjectile',
                        0
                    );
                    const projectileX = startX + (endX - startX) * executionProgress;
                    const projectileY = startY + (endY - startY) * executionProgress;
                    const projectileSize = Math.max(12, tileSize * 0.9);
                    ctx.drawImage(
                        spriteSheet,
                        crop.x,
                        crop.y,
                        crop.width,
                        crop.height,
                        projectileX - projectileSize / 2,
                        projectileY - projectileSize / 2,
                        projectileSize,
                        projectileSize
                    );
                } else if (executionProgress >= 0.94) {
                    const crop = getAnimationFrameCrop(
                        spriteSheet,
                        frameMap,
                        'webImpact',
                        0
                    );
                    const impactSize = Math.max(16, tileSize * 1.3);
                    ctx.drawImage(
                        spriteSheet,
                        crop.x,
                        crop.y,
                        crop.width,
                        crop.height,
                        endX - impactSize / 2,
                        endY - impactSize / 2,
                        impactSize,
                        impactSize
                    );
                }
            }
        }
    }

    if (player.webbedTimer > 0) {
        drawWebCocoon(player);
    }
    for (const enemy of enemies) {
        if (enemy.webbedTimer > 0 && !enemy.dying) {
            drawWebCocoon(enemy);
        }
    }
}
