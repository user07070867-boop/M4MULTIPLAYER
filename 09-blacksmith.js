const blacksmithPanel = document.getElementById('blacksmithPanel');
const blacksmithGreeting = blacksmithPanel.querySelector('[data-blacksmith-greeting]');
const blacksmithTalk = blacksmithPanel.querySelector('[data-blacksmith-talk]');
const blacksmithForgeStage = blacksmithPanel.querySelector('[data-blacksmith-stage="forge"]');
const blacksmithMenuStage = blacksmithPanel.querySelector('[data-blacksmith-stage="menu"]');
const blacksmithIngredientA = blacksmithPanel.querySelector('[data-blacksmith-material="a"]');
const blacksmithIngredientB = blacksmithPanel.querySelector('[data-blacksmith-material="b"]');
const blacksmithQuantityA = blacksmithPanel.querySelector('[data-blacksmith-quantity="a"]');
const blacksmithQuantityB = blacksmithPanel.querySelector('[data-blacksmith-quantity="b"]');
const blacksmithResultPreview = blacksmithPanel.querySelector('[data-blacksmith-result]');
const blacksmithFeedback = blacksmithPanel.querySelector('[data-blacksmith-feedback]');
const blacksmithForgeButton = blacksmithPanel.querySelector('[data-blacksmith-action="confirm-forge"]');
const blacksmithToast = blacksmithPanel.querySelector('[data-blacksmith-toast]');
const blacksmithStateStorageKey = 'mm-blacksmith-state-v1';
let blacksmithMenuOpen = false;
let blacksmithForging = false;
let blacksmithLastInteractionFloor = null;
let discoveredBlacksmithRecipeIds = new Set();
let blacksmithToastTimer = null;

try {
    const storedBlacksmithState = JSON.parse(
        localStorage.getItem(blacksmithStateStorageKey) || '{}'
    );
    if (!storedBlacksmithState
        || typeof storedBlacksmithState !== 'object'
        || Array.isArray(storedBlacksmithState)
        || (storedBlacksmithState.discoveredRecipeIds !== undefined
            && (!Array.isArray(storedBlacksmithState.discoveredRecipeIds)
                || storedBlacksmithState.discoveredRecipeIds.some((id) => (
                    !materialRecipeData.some((recipe) => recipe.id === id)
                ))))
        || (storedBlacksmithState.lastInteractionFloor !== undefined
            && !Number.isInteger(storedBlacksmithState.lastInteractionFloor))) {
        throw new Error('Formato de salvamento do ferreiro inválido.');
    }
    discoveredBlacksmithRecipeIds = new Set(storedBlacksmithState.discoveredRecipeIds || []);
    blacksmithLastInteractionFloor = storedBlacksmithState.lastInteractionFloor ?? null;
} catch (error) {
    console.error('Não foi possível carregar o estado do ferreiro.', error);
}

function saveBlacksmithState() {
    try {
        localStorage.setItem(blacksmithStateStorageKey, JSON.stringify({
            discoveredRecipeIds: [...discoveredBlacksmithRecipeIds],
            lastInteractionFloor: blacksmithLastInteractionFloor
        }));
    } catch (error) {
        console.error('Não foi possível salvar o estado do ferreiro.', error);
    }
}

function clearBlacksmithMovementKeys() {
    for (const key of Object.keys(keys)) {
        keys[key] = false;
    }
}

function openBlacksmithMenu(npc) {
    if (!npc || npc.id !== 'oren') {
        throw new Error('O menu do ferreiro só pode ser aberto perto de Oren.');
    }
    blacksmithMenuOpen = true;
    blacksmithLastInteractionFloor = currentFloor;
    saveBlacksmithState();
    clearBlacksmithMovementKeys();
    blacksmithForging = false;
    blacksmithMenuStage.hidden = false;
    blacksmithForgeStage.hidden = true;
    blacksmithGreeting.textContent = blacksmithDialogues.greeting;
    blacksmithTalk.hidden = true;
    blacksmithPanel.classList.remove('is-forging');
    blacksmithPanel.hidden = false;
    blacksmithToast.hidden = true;
    refreshBlacksmithIngredientOptions();
    blacksmithPanel.querySelector('[data-blacksmith-action="forge"]').focus();
}

function closeBlacksmithMenu(sayGoodbye = true) {
    if (!blacksmithMenuOpen) return;
    blacksmithMenuOpen = false;
    blacksmithForging = false;
    clearTimeout(blacksmithToastTimer);
    blacksmithPanel.classList.remove('is-forging');
    blacksmithPanel.hidden = true;
    blacksmithForgeButton.disabled = false;
    activeFloorNpcInteraction = null;
    if (sayGoodbye) {
        info.textContent = `Oren: ${blacksmithDialogues.goodbye}`;
    }
    canvas.focus();
}

function setBlacksmithStage(stage) {
    blacksmithMenuStage.hidden = stage !== 'menu';
    blacksmithForgeStage.hidden = stage !== 'forge';
    if (stage === 'forge') {
        refreshBlacksmithIngredientOptions();
        blacksmithIngredientA.focus();
    } else {
        blacksmithPanel.querySelector('[data-blacksmith-action="forge"]').focus();
    }
}

function getBlacksmithInventoryCount(materialId) {
    return (collectedMaterials[materialId] || 0)
        + (craftedItemQuantities[materialId] || 0);
}

function getBlacksmithMaterialName(materialId) {
    return creatureMaterialDataById[materialId]?.name || materialId;
}

function refreshBlacksmithIngredientOptions() {
    const previousA = blacksmithIngredientA.value;
    const previousB = blacksmithIngredientB.value;
    const ingredientIds = new Set(materialRecipeData.flatMap((recipe) => (
        recipe.ingredients.map((ingredient) => ingredient.materialId)
    )));
    const availableIds = [...ingredientIds]
        .filter((materialId) => getBlacksmithInventoryCount(materialId) > 0)
        .sort((first, second) => getBlacksmithMaterialName(first).localeCompare(
            getBlacksmithMaterialName(second),
            'pt-BR'
        ));
    const fillSelect = (select, emptyLabel, previousValue) => {
        select.replaceChildren(new Option(emptyLabel, ''));
        for (const materialId of availableIds) {
            const option = new Option(
                `${getBlacksmithMaterialName(materialId)} · ${getBlacksmithInventoryCount(materialId)} no inventário`,
                materialId
            );
            select.add(option);
        }
        if (availableIds.includes(previousValue)) {
            select.value = previousValue;
        }
    };
    fillSelect(blacksmithIngredientA, 'Escolha um material', previousA);
    fillSelect(blacksmithIngredientB, 'Vazio', previousB);
    if (!blacksmithIngredientA.value) {
        blacksmithQuantityA.value = '1';
    }
    if (!blacksmithIngredientB.value) {
        blacksmithQuantityB.value = '0';
    }
    updateBlacksmithRecipePreview();
}

function getBlacksmithCost(recipe) {
    if (!blacksmithConfig.useRecipeCostsAndDifficulty || !recipe.cost) {
        return null;
    }
    return recipe.cost;
}

function blacksmithRecipeMatchesSelection(recipe, selection) {
    if (recipe.type === 'same') {
        return selection.materialA === recipe.ingredients[0].materialId
            && !selection.materialB
            && selection.quantityB === 0
            && selection.quantityA === recipe.ingredients[0].quantity;
    }
    if (recipe.type !== 'mix') {
        return false;
    }
    const [first, second] = recipe.ingredients;
    return selection.quantityA === 1
        && selection.quantityB === 1
        && ((selection.materialA === first.materialId && selection.materialB === second.materialId)
            || (selection.materialA === second.materialId && selection.materialB === first.materialId));
}

function getBlacksmithSelection() {
    return {
        materialA: blacksmithIngredientA.value,
        materialB: blacksmithIngredientB.value,
        quantityA: Number(blacksmithQuantityA.value),
        quantityB: Number(blacksmithQuantityB.value)
    };
}

function evaluateBlacksmithSelection() {
    const selection = getBlacksmithSelection();
    if (!selection.materialA
        || !Number.isInteger(selection.quantityA)
        || selection.quantityA < 1
        || !Number.isInteger(selection.quantityB)
        || selection.quantityB < 0
        || (selection.materialB && selection.materialA === selection.materialB)) {
        return { status: 'invalid' };
    }
    const recipe = materialRecipeData.find((candidate) => (
        blacksmithRecipeMatchesSelection(candidate, selection)
    ));
    if (!recipe) {
        const matchingIngredientSet = materialRecipeData.some((candidate) => {
            if (candidate.type === 'same') {
                return selection.materialA === candidate.ingredients[0].materialId
                    && !selection.materialB
                    && selection.quantityB === 0;
            }
            return candidate.ingredients.some((ingredient) => (
                ingredient.materialId === selection.materialA
            )) && candidate.ingredients.some((ingredient) => (
                ingredient.materialId === selection.materialB
            ));
        });
        if (matchingIngredientSet) {
            return { status: 'quantity' };
        }
        return { status: 'invalid' };
    }
    for (const ingredient of recipe.ingredients) {
        const chosenQuantity = ingredient.materialId === selection.materialA
            ? selection.quantityA
            : selection.quantityB;
        if (chosenQuantity > getBlacksmithInventoryCount(ingredient.materialId)) {
            return { status: 'insufficient', recipe };
        }
    }
    const cost = getBlacksmithCost(recipe);
    if (cost && oreCoinBalance[cost.resource] < cost.amount) {
        return { status: 'insufficient', recipe };
    }
    if (!getBlacksmithInventoryCapacityResult(recipe).fits) {
        return { status: 'full', recipe };
    }
    return { status: 'ready', recipe };
}

function getBlacksmithInventoryCapacityResult(recipe) {
    const occupied = getOccupiedInventorySlotCount();
    if (occupied >= blacksmithConfig.inventorySlotCapacity) {
        return { fits: false, full: true };
    }
    const nextMaterials = { ...collectedMaterials };
    const nextCraftedItems = { ...craftedItemQuantities };
    for (const ingredient of recipe.ingredients) {
        let remaining = ingredient.quantity;
        const materialCount = nextMaterials[ingredient.materialId] || 0;
        const consumedMaterials = Math.min(materialCount, remaining);
        if (consumedMaterials > 0) {
            nextMaterials[ingredient.materialId] -= consumedMaterials;
            remaining -= consumedMaterials;
            if (nextMaterials[ingredient.materialId] === 0) {
                delete nextMaterials[ingredient.materialId];
            }
        }
        if (remaining > 0) {
            nextCraftedItems[ingredient.materialId] -= remaining;
            if (nextCraftedItems[ingredient.materialId] <= 0) {
                delete nextCraftedItems[ingredient.materialId];
            }
        }
    }
    const resultMaterial = getMaterialRecipeResultMaterial(recipe);
    if (resultMaterial) {
        nextMaterials[resultMaterial.id] = (nextMaterials[resultMaterial.id] || 0) + 1;
    } else {
        nextCraftedItems[recipe.result.id] = (nextCraftedItems[recipe.result.id] || 0) + 1;
    }
    const fixedSlots = inventoryItems.querySelectorAll(
        '.equipment-slot:not([hidden]), .inventory-scroll-slot:not([hidden])'
    ).length;
    const resultingSlots = fixedSlots
        + Object.values(nextMaterials).filter((quantity) => quantity > 0).length
        + Object.values(nextCraftedItems).filter((quantity) => quantity > 0).length;
    return {
        fits: resultingSlots <= blacksmithConfig.inventorySlotCapacity,
        full: false
    };
}

function getBlacksmithForgeFailure(result) {
    if (result.status === 'full') {
        return blacksmithDialogues.full;
    }
    if (result.status === 'insufficient') {
        return blacksmithDialogues.insufficient;
    }
    if (result.status === 'quantity') {
        return 'Quantidade incorreta. Confira a receita e as unidades de cada ingrediente.';
    }
    return blacksmithDialogues.invalid;
}

function updateBlacksmithRecipePreview() {
    const result = evaluateBlacksmithSelection();
    const previousImage = blacksmithResultPreview.querySelector('img');
    if (result.status === 'ready' || result.status === 'full') {
        const { recipe } = result;
        blacksmithResultPreview.replaceChildren();
        const icon = document.createElement('img');
        icon.src = `assets/crafting-items/${recipe.id}.png`;
        icon.alt = '';
        icon.className = 'blacksmith-result-icon';
        const name = document.createElement('strong');
        name.textContent = recipe.result.name;
        const detail = document.createElement('span');
        detail.textContent = `${recipe.type === 'same' ? 'Igual' : 'Mix'} · ${recipe.id}`;
        blacksmithResultPreview.append(icon, name, detail);
        blacksmithFeedback.textContent = result.status === 'full'
            ? blacksmithDialogues.full
            : '';
        if (getBlacksmithCost(recipe)) {
            const cost = getBlacksmithCost(recipe);
            blacksmithFeedback.textContent = `Custo: ${cost.amount} ${oreTypes.find((ore) => ore.id === cost.resource)?.name || cost.resource}.`;
        }
        blacksmithForgeButton.disabled = blacksmithForging || result.status === 'full';
        return;
    }

    blacksmithForgeButton.disabled = true;
    if (result.recipe && previousImage
        && ['insufficient', 'full'].includes(result.status)) {
        blacksmithResultPreview.replaceChildren(previousImage);
    } else {
        blacksmithResultPreview.innerHTML = '<span class="blacksmith-result-placeholder">Sem resultado</span>';
    }
    blacksmithFeedback.textContent = getBlacksmithForgeFailure(result);
}

function playBlacksmithAnvilSound() {
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextConstructor) return;
    if (!creatureAudioContext) {
        creatureAudioContext = new AudioContextConstructor();
    }
    if (creatureAudioContext.state === 'suspended') {
        creatureAudioContext.resume().catch((error) => {
            console.error('Não foi possível ativar o som da forja.', error);
        });
    }
    const oscillator = creatureAudioContext.createOscillator();
    const gain = creatureAudioContext.createGain();
    const now = creatureAudioContext.currentTime;
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(190, now);
    oscillator.frequency.exponentialRampToValueAtTime(75, now + 0.13);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    oscillator.connect(gain);
    gain.connect(creatureAudioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.19);
}

function showBlacksmithCraftedItem(recipe) {
    const icon = document.createElement('img');
    icon.src = `assets/crafting-items/${recipe.id}.png`;
    icon.alt = '';
    const text = document.createElement('span');
    text.textContent = `Item criado: ${recipe.result.name}`;
    blacksmithToast.replaceChildren(icon, text);
    blacksmithToast.hidden = false;
    clearTimeout(blacksmithToastTimer);
    blacksmithToastTimer = setTimeout(() => {
        blacksmithToast.hidden = true;
    }, 4200);
}

function commitBlacksmithRecipe(recipe) {
    const check = getBlacksmithInventoryCapacityResult(recipe);
    if (!check.fits) {
        blacksmithFeedback.textContent = blacksmithDialogues.full;
        blacksmithGreeting.textContent = blacksmithDialogues.full;
        return false;
    }
    const nextMaterials = { ...collectedMaterials };
    const nextCraftedItems = { ...craftedItemQuantities };
    for (const ingredient of recipe.ingredients) {
        let remaining = ingredient.quantity;
        const materialCount = nextMaterials[ingredient.materialId] || 0;
        const consumedMaterials = Math.min(materialCount, remaining);
        if (consumedMaterials > 0) {
            nextMaterials[ingredient.materialId] -= consumedMaterials;
            remaining -= consumedMaterials;
            if (nextMaterials[ingredient.materialId] === 0) {
                delete nextMaterials[ingredient.materialId];
            }
        }
        if (remaining > 0) {
            nextCraftedItems[ingredient.materialId] -= remaining;
            if (nextCraftedItems[ingredient.materialId] <= 0) {
                delete nextCraftedItems[ingredient.materialId];
            }
        }
    }
    const resultMaterial = getMaterialRecipeResultMaterial(recipe);
    if (resultMaterial) {
        nextMaterials[resultMaterial.id] = (nextMaterials[resultMaterial.id] || 0) + 1;
    } else {
        nextCraftedItems[recipe.result.id] = (nextCraftedItems[recipe.result.id] || 0) + 1;
    }

    const cost = getBlacksmithCost(recipe);
    if (cost) {
        oreCoinBalance[cost.resource] -= cost.amount;
    }
    collectedMaterials = nextMaterials;
    craftedItemQuantities = nextCraftedItems;
    updateMaterialInventoryHud();
    if (cost) {
        updateOreCoinHud();
    }
    if (blacksmithConfig.recipeDiscoveryMode === 'success') {
        discoveredBlacksmithRecipeIds.add(recipe.id);
        saveBlacksmithState();
    }
    playBlacksmithAnvilSound();
    blacksmithPanel.classList.add('is-forging');
    setTimeout(() => blacksmithPanel.classList.remove('is-forging'), 520);
    blacksmithGreeting.textContent = blacksmithDialogues.success;
    blacksmithFeedback.textContent = blacksmithDialogues.success;
    showBlacksmithCraftedItem(recipe);
    info.textContent = `Oren: ${blacksmithDialogues.success}`;
    refreshBlacksmithIngredientOptions();
    return true;
}

function confirmBlacksmithForge() {
    if (blacksmithForging) return;
    const result = evaluateBlacksmithSelection();
    if (result.status !== 'ready') {
        blacksmithFeedback.textContent = getBlacksmithForgeFailure(result);
        blacksmithGreeting.textContent = ['insufficient', 'full'].includes(result.status)
            ? getBlacksmithForgeFailure(result)
            : result.status === 'invalid' ? blacksmithDialogues.invalid : '';
        return;
    }
    const capacity = getBlacksmithInventoryCapacityResult(result.recipe);
    if (!capacity.fits) {
        blacksmithFeedback.textContent = blacksmithDialogues.full;
        blacksmithGreeting.textContent = blacksmithDialogues.full;
        return;
    }
    const difficulty = blacksmithConfig.useRecipeCostsAndDifficulty
        ? result.recipe.difficulty || 0
        : 0;
    const duration = Math.max(
        0,
        difficulty * blacksmithConfig.difficultyMillisecondsPerPoint
    );
    if (duration === 0) {
        commitBlacksmithRecipe(result.recipe);
        return;
    }
    blacksmithForging = true;
    blacksmithForgeButton.disabled = true;
    blacksmithPanel.classList.add('is-forging');
    blacksmithFeedback.textContent = 'Forjando... Não toque em nada.';
    setTimeout(() => {
        blacksmithPanel.classList.remove('is-forging');
        blacksmithForging = false;
        const currentResult = evaluateBlacksmithSelection();
        if (currentResult.status !== 'ready' || currentResult.recipe.id !== result.recipe.id) {
            blacksmithFeedback.textContent = getBlacksmithForgeFailure(currentResult);
            blacksmithForgeButton.disabled = true;
            return;
        }
        commitBlacksmithRecipe(result.recipe);
        updateBlacksmithRecipePreview();
    }, duration);
}

function blacksmithConversationLine() {
    if (blacksmithConfig.recipeDiscoveryMode === 'success') {
        const knownRecipes = materialRecipeData.filter((recipe) => (
            discoveredBlacksmithRecipeIds.has(recipe.id)
        )).map((recipe) => recipe.result.name);
        return knownRecipes.length > 0
            ? blacksmithDialogues.recipesKnown.replace('{recipes}', knownRecipes.join(', '))
            : 'Ainda não provou que sabe usar a forja. Traga materiais e descubra uma receita.';
    }
    return blacksmithDialogues.conversation[
        Math.floor(Math.random() * blacksmithDialogues.conversation.length)
    ];
}

blacksmithPanel.addEventListener('click', (event) => {
    const action = event.target.closest('[data-blacksmith-action]')?.dataset.blacksmithAction;
    if (!action) return;
    if (action === 'exit') {
        closeBlacksmithMenu();
    } else if (action === 'forge') {
        blacksmithTalk.hidden = true;
        setBlacksmithStage('forge');
    } else if (action === 'back') {
        setBlacksmithStage('menu');
    } else if (action === 'talk') {
        blacksmithTalk.textContent = blacksmithConversationLine();
        blacksmithTalk.hidden = false;
    } else if (action === 'confirm-forge') {
        confirmBlacksmithForge();
    }
});

for (const input of [
    blacksmithIngredientA,
    blacksmithIngredientB,
    blacksmithQuantityA,
    blacksmithQuantityB
]) {
    input.addEventListener('input', updateBlacksmithRecipePreview);
    input.addEventListener('change', updateBlacksmithRecipePreview);
}
