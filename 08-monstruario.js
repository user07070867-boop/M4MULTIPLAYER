const bestiaryPanel = document.getElementById('bestiaryPanel');
const bestiaryContent = document.getElementById('bestiaryContent');
const bestiaryOpenButton = document.getElementById('bestiaryOpenButton');
const bestiaryCloseButton = document.getElementById('bestiaryCloseButton');
let bestiaryOpen = false;
const bestiaryDiscoveryStorageKey = 'mm-mm-bestiary-discoveries-v1';
const bestiaryDiscoveryStatus = document.getElementById('bestiaryDiscoveryStatus');
const bestiaryInGameOpenButton = document.getElementById('bestiaryInGameOpenButton');
let discoveredCreatureIds = new Set();
const bestiaryCustomStorageKey = 'mm-mm-bestiary-custom-entries-v1';
let bestiaryCustomEntries = [];

function escapeBestiaryText(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]);
}

function createBestiaryPortrait(entry, kind = 'creature') {
    const palette = entry.colors || {};
    const type = entry.portraitKind || entry.creatureType || entry.id || kind;
    const name = (entry.name || '').toLocaleLowerCase('pt-BR');
    const characterPalette = name.includes('lia')
        ? { primary: '#294c4a', secondary: '#203b3a', accent: '#d8b86c' }
        : name.includes('oren')
            ? { primary: '#68402b', secondary: '#3e291f', accent: '#c2b9a2' }
            : name.includes('nara')
                ? { primary: '#59454f', secondary: '#302531', accent: '#d98e64' }
                : {};
    const primary = palette.primary || characterPalette.primary
        || (kind === 'npc' ? '#3d6870' : '#81704b');
    const secondary = palette.secondary || characterPalette.secondary || '#29241d';
    const accent = palette.accent || characterPalette.accent || '#e2bd6c';
    let figure;

    if (/spider|arachnid|matriarch/i.test(type)) {
        figure = `<g fill="${secondary}" stroke="${primary}" stroke-width="5" stroke-linecap="square">
            <path d="M47 48 24 31 12 35M45 58 20 57 10 67M49 68 27 82 14 79M69 48 92 31 104 35M71 58 96 57 106 67M67 68 89 82 102 79"/>
            <ellipse cx="58" cy="58" rx="18" ry="15"/><ellipse cx="80" cy="61" rx="11" ry="12"/>
        </g><circle cx="78" cy="57" r="3" fill="${accent}"/><circle cx="86" cy="57" r="3" fill="${accent}"/>`;
    } else if (/bat|flying/i.test(type)) {
        figure = `<path d="M59 60 39 38 40 56 18 42 25 72 46 79 60 70 74 79 95 72 102 42 80 56 81 38Z" fill="${primary}" stroke="${secondary}" stroke-width="5" stroke-linejoin="miter"/>
            <rect x="54" y="46" width="13" height="27" fill="${secondary}"/><rect x="55" y="55" width="4" height="4" fill="${accent}"/><rect x="63" y="55" width="4" height="4" fill="${accent}"/>`;
    } else if (/lizard|reptile/i.test(type)) {
        figure = `<path d="M35 64 18 80 42 76 52 72M79 65 101 79 97 64 83 57" fill="${primary}" stroke="${secondary}" stroke-width="5" stroke-linejoin="miter"/>
            <path d="M34 59 50 42 79 45 93 58 81 74 48 75Z" fill="${primary}" stroke="${secondary}" stroke-width="5"/>
            <rect x="73" y="49" width="5" height="5" fill="${accent}"/><path d="M45 71 40 86M76 72 82 85" stroke="${secondary}" stroke-width="6"/>`;
    } else {
        const npc = kind === 'npc' || /lia|oren|nara/i.test(entry.name || '');
        figure = `<path d="M43 40 27 50 31 76 40 73M77 40 93 50 89 76 80 73" fill="${primary}" stroke="${secondary}" stroke-width="5"/>
            <path d="M43 59 36 88 84 88 77 59Z" fill="${primary}" stroke="${secondary}" stroke-width="5"/>
            <rect x="50" y="24" width="21" height="25" fill="${npc ? '#d9b795' : accent}" stroke="${secondary}" stroke-width="4"/>
            <path d="M47 27 51 18 70 18 75 29 69 25 51 26Z" fill="${npc ? accent : secondary}"/>
            <rect x="54" y="34" width="3" height="3" fill="${secondary}"/><rect x="65" y="34" width="3" height="3" fill="${secondary}"/>
            <path d="M49 87 46 101M71 87 74 101" stroke="${secondary}" stroke-width="8"/>
            ${npc ? `<path d="M38 52 26 70M82 52 94 70" stroke="${accent}" stroke-width="4"/>` : `<path d="M31 57 21 67" stroke="${accent}" stroke-width="5"/>`}`;
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 116 116" shape-rendering="crispEdges">
        <rect width="116" height="116" fill="#171411"/>
        <path d="M0 81 27 68 53 83 84 65 116 80V116H0Z" fill="#30271d"/>
        <path d="M12 16H34M83 16h21M9 96h18M91 96h15" stroke="${accent}" stroke-width="2" opacity=".6"/>
        ${figure}
    </svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

try {
    const storedCustomEntries = JSON.parse(localStorage.getItem(bestiaryCustomStorageKey) || '[]');
    if (!Array.isArray(storedCustomEntries)
        || storedCustomEntries.some((entry) => (
            !entry || typeof entry.id !== 'string'
            || !['enemy', 'npc', 'event'].includes(entry.type)
            || typeof entry.name !== 'string'
            || typeof entry.region !== 'string'
            || typeof entry.description !== 'string'
        ))) {
        throw new Error('Formato de registros personalizados do monstruário inválido.');
    }
    bestiaryCustomEntries = storedCustomEntries;
} catch (error) {
    console.error('Não foi possível carregar os registros personalizados do monstruário.', error);
}

try {
    const storedDiscoveries = JSON.parse(localStorage.getItem(bestiaryDiscoveryStorageKey) || '[]');
    if (!Array.isArray(storedDiscoveries)
        || storedDiscoveries.some((id) => !creatureDataByType[
            bestiaryEntries.find((entry) => entry.id === id)?.creatureType
        ])) {
        throw new Error('Formato de descobertas do bestiário inválido.');
    }
    discoveredCreatureIds = new Set(storedDiscoveries);
} catch (error) {
    console.error('Não foi possível carregar as descobertas do bestiário.', error);
}

function discoverBestiaryCreature(creatureType) {
    const entry = bestiaryEntries.find((candidate) => candidate.creatureType === creatureType);
    if (!entry || discoveredCreatureIds.has(entry.id)) {
        return false;
    }
    discoveredCreatureIds.add(entry.id);
    try {
        localStorage.setItem(
            bestiaryDiscoveryStorageKey,
            JSON.stringify([...discoveredCreatureIds])
        );
    } catch (error) {
        console.error('Não foi possível salvar as descobertas do bestiário.', error);
    }
    if (bestiaryDiscoveryStatus) {
        bestiaryDiscoveryStatus.hidden = false;
        bestiaryDiscoveryStatus.textContent = `Nova entrada: ${entry.name}. ${entry.strategy}`;
    }
    return true;
}

function formatBestiaryDropTable(entry) {
    return entry.dropTable.map((drop) => {
        const material = creatureMaterialDataById[drop.id];
        if (drop.id !== 'coin' && !material) {
            throw new Error(`Drop ${drop.id} sem nome cadastrado para ${entry.name}.`);
        }
        const itemName = drop.id === 'coin' ? 'Moedas' : material.name;
        const quantity = drop.min === drop.max
            ? `${drop.min}`
            : `${drop.min}–${drop.max}`;
        const chance = new Intl.NumberFormat('pt-BR', {
            style: 'percent',
            maximumFractionDigits: 0
        }).format(drop.chance);
        return `${itemName}: ${chance} de chance, ${quantity} por ocorrência`;
    }).join('; ');
}

function formatBestiaryFloors(floors) {
    return floors.map((range) => (
        Array.isArray(range) ? `${range[0]}–${range[1]}` : `${range}`
    )).join(', ');
}

function formatBestiaryStatRange(entry, stat) {
    const spawnFloors = entry.spawn.floors.flatMap((range) => (
        Array.isArray(range)
            ? Array.from({ length: range[1] - range[0] + 1 }, (_, index) => range[0] + index)
            : [range]
    ));
    if (isBossCreatureType(entry.creatureType)) {
        return `${entry.stats[stat]} (base; escala de chefe aplicada em combate)`;
    }
    const scaledValues = spawnFloors.map((floor) => (
        getCreatureScaledStat(entry.creatureType, stat, floor)
    ));
    const minimum = Math.min(...scaledValues);
    const maximum = Math.max(...scaledValues);
    return minimum === maximum ? `${minimum}` : `${minimum}–${maximum}`;
}

function formatBestiaryResistance(type, value) {
    const labels = {
        physical: 'física',
        frontalPhysical: 'física frontal',
        fire: 'fogo',
        poison: 'veneno'
    };
    const percentage = new Intl.NumberFormat('pt-BR', {
        style: 'percent',
        maximumFractionDigits: 0
    }).format(value);
    return `${labels[type] || type}: ${percentage}`;
}

function formatBestiaryAttack(attack) {
    const details = [];
    if (Number.isFinite(attack.warning)) {
        details.push(`aviso ${attack.warning}s`);
    }
    if (Number.isFinite(attack.execution)) {
        details.push(`execução ${attack.execution}s`);
    }
    if (Number.isFinite(attack.recovery)) {
        details.push(`recuperação ${attack.recovery}s`);
    }
    if (Number.isFinite(attack.cooldown) && attack.cooldown > 0) {
        details.push(`recarga ${attack.cooldown}s`);
    }
    if (Number.isFinite(attack.range)) {
        details.push(`alcance ${attack.range}px`);
    }
    if (Number.isFinite(attack.radius) && attack.radius > 0) {
        details.push(`área ${attack.radius}px`);
    }
    if (Number.isFinite(attack.damage) && attack.damage > 0) {
        details.push(`dano ${attack.damage}× o dano-base`);
    }
    if (attack.status) {
        const status = typeof attack.status === 'string'
            ? attack.status.replace(/-/g, ' ')
            : `${attack.status.type.replace(/-/g, ' ')}${attack.status.duration
                ? ` por ${attack.status.duration}s` : ''}`;
        details.push(status);
    }
    const name = attack.id.replace(/-/g, ' ');
    return `<li><strong>${escapeBestiaryText(name)}</strong>: ${details.length
        ? escapeBestiaryText(details.join(' · '))
        : '[a revisar]'}</li>`;
}

function formatBestiaryCraftingLinks(entry) {
    const droppedMaterialIds = entry.dropTable
        .filter((drop) => drop.id !== 'coin')
        .map((drop) => drop.id);
    const recipes = materialRecipeData.filter((recipe) => (
        recipe.ingredients.some((ingredient) => droppedMaterialIds.includes(ingredient.materialId))
    ));
    if (recipes.length === 0) {
        return '<p>Nenhuma receita do catálogo usa diretamente os materiais listados desta criatura.</p>';
    }
    return `<ul>${recipes.map((recipe) => {
        const ingredients = recipe.ingredients.map((ingredient) => {
            const material = creatureMaterialDataById[ingredient.materialId];
            const materialName = material ? material.name : `${ingredient.materialId} [a revisar]`;
            return `${ingredient.quantity}× ${escapeBestiaryText(materialName)}`;
        }).join(' + ');
        return `<li><strong>${escapeBestiaryText(recipe.id)}</strong> · ${recipe.type === 'same' ? 'Igual' : 'Mix'}: `
            + `${ingredients} → ${escapeBestiaryText(recipe.result.name)}</li>`;
    }).join('')}</ul>`;
}

function formatBestiaryCurrentData(entry) {
    const height = Number.isFinite(entry.heightBlocks)
        ? `${entry.heightBlocks} bloco(s)` : '[a revisar]';
    const resistances = Object.entries(entry.resistances)
        .map(([type, value]) => formatBestiaryResistance(type, value))
        .join(' · ');
    return `<p>PV: ${formatBestiaryStatRange(entry, 'health')} · Dano: `
        + `${formatBestiaryStatRange(entry, 'damage')} · Defesa: ${entry.stats.defense} · `
        + `Velocidade: ${entry.stats.speed} · Alcance: ${entry.stats.range}px · Altura: ${height}.</p>`
        + `<p>Resistências (redução): ${resistances || '[a revisar]'}.</p>`
        + `<p>Andares: ${formatBestiaryFloors(entry.spawn.floors)}.</p>`;
}

function formatBestiaryFarmCard(material, visibleCreatureEntries) {
    const sources = visibleCreatureEntries.flatMap((entry) => (
        entry.dropTable.filter((drop) => drop.id === material.id).map((drop) => {
            const quantity = drop.min === drop.max ? `${drop.min}` : `${drop.min}–${drop.max}`;
            const chance = new Intl.NumberFormat('pt-BR', {
                style: 'percent',
                maximumFractionDigits: 0
            }).format(drop.chance);
            return `<li>${escapeBestiaryText(entry.name)} · andares ${formatBestiaryFloors(entry.spawn.floors)}: `
                + `${chance}, ${quantity} por ocorrência</li>`;
        })
    ));
    const relatedRecipes = materialRecipeData.filter((recipe) => (
        recipe.ingredients.some((ingredient) => ingredient.materialId === material.id)
    ));
    const hasCatalogSource = bestiaryEntries.some((entry) => (
        entry.dropTable.some((drop) => drop.id === material.id)
    ));
    const sourceList = sources.length
        ? `<ul>${sources.join('')}</ul>`
        : hasCatalogSource
            ? '<p>Fonte ainda não descoberta no monstruário.</p>'
            : '<p>Fonte direta em inimigos: não cadastrada [a revisar].</p>';
    const recipeList = relatedRecipes.length
        ? `<ul>${relatedRecipes.map((recipe) => (
            `<li>${escapeBestiaryText(recipe.id)} · ${recipe.type === 'same' ? 'Igual' : 'Mix'} `
            + `→ ${escapeBestiaryText(recipe.result.name)}</li>`
        )).join('')}</ul>`
        : '<p>Sem uso como ingrediente nas receitas cadastradas.</p>';
    return `<article class="bestiary-farm-card" data-farm-card>
        <h4>${escapeBestiaryText(material.name)}</h4>
        <p>${escapeBestiaryText(material.description)}</p>
        <h5>Fontes de farm</h5>${sourceList}
        <h5>Receitas do Ferreiro</h5>${recipeList}
    </article>`;
}

function renderBestiary() {
    const visibleEntries = bestiaryEntries.filter((entry) => (
        gameState === 'menu' || discoveredCreatureIds.has(entry.id)
    ));
    const regions = [...new Set(visibleEntries.map((entry) => entry.region))];
    const entriesByRegion = regions.map((region) => {
        const entries = visibleEntries
            .filter((entry) => entry.region === region)
            .map((entry) => `
                <details class="bestiary-entry">
                    <summary>
                        <img class="bestiary-portrait" src="${createBestiaryPortrait(entry)}"
                            alt="Retrato em pixel art: ${escapeBestiaryText(entry.name)}">
                        <span class="bestiary-entry-heading">
                            <span>${entry.name}</span>
                            <span class="bestiary-entry-status">${entry.displayCategory} · ${entry.status}</span>
                        </span>
                        <span class="bestiary-entry-toggle" aria-hidden="true">＋</span>
                    </summary>
                    <dl class="bestiary-facts">
                        <div><dt>Identidade e apelidos</dt><dd>${entry.name} · ${entry.aliases}</dd></div>
                        <div><dt>Categoria e ameaça</dt><dd>${entry.displayCategory}</dd></div>
                        <div><dt>Habitat e aparição</dt><dd>${entry.habitat}</dd></div>
                        <div><dt>Aparência</dt><dd>${entry.appearance}</dd></div>
                        <div><dt>Comportamento</dt><dd>${entry.behavior}</dd></div>
                        <div><dt>História</dt><dd>${entry.lore}</dd></div>
                        <div><dt>Atributos reais do jogo</dt><dd>${formatBestiaryCurrentData(entry)}</dd></div>
                        <div><dt>Ataques e habilidades reais</dt><dd><ul>${entry.attacks.map(formatBestiaryAttack).join('')}</ul></dd></div>
                        <div><dt>Fraquezas e estratégia</dt><dd>${entry.strategy}</dd></div>
                        <div><dt>Espólios reais · farm</dt><dd>${formatBestiaryDropTable(entry)}</dd></div>
                        <div><dt>Materiais e receitas relacionadas</dt><dd>${formatBestiaryCraftingLinks(entry)}</dd></div>
                        <div><dt>Notas visuais e sonoras</dt><dd>${entry.design}</dd></div>
                    </dl>
                </details>
            `).join('');
        return `<section class="bestiary-region" data-bestiary-region><h3>${region}</h3>${entries}</section>`;
    }).join('');

    const summaryRows = visibleEntries.map((entry) => `
        <tr>
            <th scope="row">${entry.name}</th>
            <td>${entry.region.split(' · ')[0]}</td>
            <td>${entry.displayCategory}</td>
            <td>${formatBestiaryStatRange(entry, 'health')}</td>
            <td>${entry.strategy}</td>
        </tr>
    `).join('');
    const savedEvents = bestiaryCustomEntries
        .filter((entry) => entry.type === 'event')
        .map((entry) => `
            <article class="bestiary-event bestiary-custom-event">
                <img class="bestiary-portrait bestiary-custom-event-portrait"
                    src="${createBestiaryPortrait(entry)}" alt="">
                <div>
                    <h4>${escapeBestiaryText(entry.name)}</h4>
                    <p><strong>${escapeBestiaryText(entry.floor || entry.region)}</strong></p>
                    ${entry.participants ? `<p><strong>Envolvidos:</strong> ${escapeBestiaryText(entry.participants)}</p>` : ''}
                    ${entry.description ? `<p>${escapeBestiaryText(entry.description)}</p>` : ''}
                    ${entry.reward ? `<p><strong>Recompensa:</strong> ${escapeBestiaryText(entry.reward)}</p>` : ''}
                </div>
            </article>
        `).join('');
    const events = bestiaryEvents.map((event) => `
        <article class="bestiary-event">
            <h4>${event.title}</h4>
            <p><strong>Andar ${event.floor} · encontro jogável</strong></p>
            <p>${event.description}</p>
            ${event.rewardScroll ? `<p>Recompensa: ${scrollTypes.find((scroll) => scroll.id === event.rewardScroll)?.name || event.rewardScroll}.</p>` : ''}
        </article>
    `).join('') + savedEvents;
    const farmCards = creatureMaterialData
        .map((material) => formatBestiaryFarmCard(material, visibleEntries)).join('');
    const renderNewContentEntry = (entry) => `
        <article class="bestiary-proposal" data-proposal-kind="${entry.type.startsWith('NPC') ? 'npc' : 'enemy'}">
            <img class="bestiary-portrait bestiary-proposal-portrait"
                src="${createBestiaryPortrait({
                    name: entry.name,
                    id: entry.name,
                    portraitKind: entry.type.startsWith('NPC')
                        ? 'humanoid'
                        : /morcego/i.test(entry.name) ? 'bat' : /lagarto/i.test(entry.name) ? 'lizard' : 'humanoid'
                }, entry.type.startsWith('NPC') ? 'npc' : 'creature')}"
                alt="Retrato em pixel art: ${escapeBestiaryText(entry.name)}">
            <div class="bestiary-proposal-content">
                <h4>${entry.name} <span>${entry.type}</span></h4>
            <p><strong>${entry.region}</strong></p>
            <p><strong>Função:</strong> ${entry.role}</p>
            <p><strong>Lore:</strong> ${entry.lore}</p>
            <p><strong>Mecânica:</strong> ${entry.mechanic}</p>
            <p><strong>Recompensa:</strong> ${entry.reward}</p>
            </div>
        </article>
    `;
    const enemyContentEntries = bestiaryNewContentEntries
        .filter((entry) => !entry.type.startsWith('NPC'))
        .map(renderNewContentEntry).join('');
    const npcContentEntries = bestiaryNewContentEntries
        .filter((entry) => entry.type.startsWith('NPC'))
        .map(renderNewContentEntry).join('');
    const renderSavedEntry = (entry) => {
        const safeName = escapeBestiaryText(entry.name);
        const details = [
            entry.category && `<p><strong>Categoria:</strong> ${escapeBestiaryText(entry.category)}</p>`,
            entry.role && `<p><strong>Função:</strong> ${escapeBestiaryText(entry.role)}</p>`,
            entry.floor && `<p><strong>Andar:</strong> ${escapeBestiaryText(entry.floor)}</p>`,
            entry.participants && `<p><strong>Envolvidos:</strong> ${escapeBestiaryText(entry.participants)}</p>`,
            entry.appearance && `<p><strong>Aparência:</strong> ${escapeBestiaryText(entry.appearance)}</p>`,
            entry.behavior && `<p><strong>Comportamento:</strong> ${escapeBestiaryText(entry.behavior)}</p>`,
            entry.stats && `<p><strong>Atributos:</strong> ${escapeBestiaryText(entry.stats)}</p>`,
            entry.strategy && `<p><strong>Estratégia:</strong> ${escapeBestiaryText(entry.strategy)}</p>`,
            entry.lore && `<p><strong>História:</strong> ${escapeBestiaryText(entry.lore)}</p>`,
            entry.mechanic && `<p><strong>Mecânica:</strong> ${escapeBestiaryText(entry.mechanic)}</p>`,
            entry.description && `<p>${escapeBestiaryText(entry.description)}</p>`,
            entry.reward && `<p><strong>Recompensa:</strong> ${escapeBestiaryText(entry.reward)}</p>`
        ].filter(Boolean).join('');
        const typeLabel = { enemy: 'Inimigo', npc: 'NPC', event: 'Evento' }[entry.type];
        const proposalClass = entry.type === 'npc' ? ' bestiary-proposal' : '';
        const proposalKind = entry.type === 'npc' ? ' data-proposal-kind="npc"' : '';
        return `<article class="bestiary-custom-entry${proposalClass}"${proposalKind}
            data-custom-entry-id="${escapeBestiaryText(entry.id)}">
            <img class="bestiary-portrait" src="${createBestiaryPortrait(entry, entry.type === 'npc' ? 'npc' : 'creature')}"
                alt="Retrato em pixel art: ${safeName}">
            <div class="bestiary-custom-copy">
                <span class="bestiary-eyebrow">${typeLabel}</span>
                <h4>${safeName}</h4>
                <p class="bestiary-custom-region">${escapeBestiaryText(entry.region)}</p>
                ${details}
                <button class="bestiary-remove-entry" type="button" data-remove-entry="${escapeBestiaryText(entry.id)}">
                    Remover ficha
                </button>
            </div>
        </article>`;
    };
    const savedEntries = bestiaryCustomEntries.map(renderSavedEntry).join('');
    const savedEnemies = bestiaryCustomEntries.filter((entry) => entry.type === 'enemy');
    const savedNpcs = bestiaryCustomEntries.filter((entry) => entry.type === 'npc');
    const savedEnemyCards = savedEnemies.map(renderSavedEntry).join('');
    const savedNpcCards = savedNpcs.map(renderSavedEntry).join('');
    const visibleEnemyCount = visibleEntries.length + savedEnemies.length;

    bestiaryContent.innerHTML = `
        <section class="bestiary-toolbar" aria-label="Navegação do monstruário">
            <label class="bestiary-search">
                <span>Buscar no arquivo</span>
                <input type="search" data-bestiary-search placeholder="Nome, região, ataque..." autocomplete="off">
            </label>
            <div class="bestiary-filters" role="group" aria-label="Filtrar conteúdo">
                <button type="button" data-bestiary-filter="all" aria-pressed="true">Tudo</button>
                <button type="button" data-bestiary-filter="creatures" aria-pressed="false">Inimigos</button>
                <button type="button" data-bestiary-filter="npcs" aria-pressed="false">NPCs</button>
                <button type="button" data-bestiary-filter="encounters" aria-pressed="false">Eventos</button>
                <button type="button" data-bestiary-filter="allies" aria-pressed="false">Criaturas extras</button>
                <button type="button" data-bestiary-filter="farm" aria-pressed="false">Farm de materiais</button>
                <button type="button" data-bestiary-filter="summary" aria-pressed="false">Resumo</button>
                <button type="button" data-bestiary-filter="additions" aria-pressed="false">Adicionar</button>
            </div>
            <p class="bestiary-results" data-bestiary-results role="status" aria-live="polite"></p>
        </section>
        <section class="bestiary-intro bestiary-section" data-bestiary-section="overview">
            <div class="bestiary-intro-heading">
                <div>
                    <span class="bestiary-eyebrow">REGISTRO DE CAMPO · 20 ANDARES</span>
                    <h3>Ecossistema da masmorra</h3>
                </div>
                <div class="bestiary-stat-chips">
                    <span>${visibleEnemyCount} inimigos cadastrados</span>
                    <span>Minas 1–9</span>
                    <span>Castelo 10–20</span>
                </div>
            </div>
            <div class="bestiary-intro-copy">
                <p><strong>MM&amp;MM</strong> é um RPG de ação em 2D, com câmera superior e pixel art. A descida começa em ruínas subterrâneas e minas antigas; a partir do décimo andar, a jornada sobe para um castelo construído sobre esses túneis.</p>
                <p>Durante séculos, a coroa escavou os veios minerais e aproveitou o calor profundo para alimentar forjas e experimentos. As galerias abandonadas viraram abrigo para goblins e aranhas. Mais abaixo, a atividade despertou o golem de lava; a contaminação subiu até o castelo, alterando trolls e ogros e reanimando suas defesas. O Ceifador guarda a consequência mais grave desse passado.</p>
                <p>As três criaturas novas e os três NPCs de apoio já fazem parte do jogo nos andares indicados. O Guardião do Trono é uma alternativa ao chefe final, escolhida em metade das partidas do andar 20. As fichas separam atributos-base, escalonamento, resistências, aparição e tabela real de drops, lida dos dados de combate.</p>
                <p>Lia oferece pistas, Oren combina materiais na forja e Nara propõe um desafio opcional. Interaja com eles usando G quando estiver próximo; a prévia da forja mostra o resultado e qualquer custo antes de confirmar.</p>
            </div>
            <div class="bestiary-legend"><span>Ameaças: comum · elite · minichefe · chefe</span><span>Abra uma ficha para consultar dados de combate, estratégia e drops.</span></div>
        </section>
        <section class="bestiary-section bestiary-creature-index" data-bestiary-section="creatures">
            <header class="bestiary-section-heading">
                <div><span class="bestiary-eyebrow">CATÁLOGO</span><h3>Inimigos</h3></div>
                <span>${visibleEnemyCount} fichas</span>
            </header>
            ${entriesByRegion}
            ${savedEnemyCards ? `<section class="bestiary-region" data-bestiary-region><h3>Fichas personalizadas</h3>${savedEnemyCards}</section>` : ''}
        </section>
        <section class="bestiary-region bestiary-section" data-bestiary-section="summary" ${visibleEntries.length === 0 ? 'hidden' : ''}>
            <h3>Tabela-resumo</h3>
            <div class="bestiary-table-wrap">
                <table class="bestiary-table">
                    <thead><tr><th>Nome</th><th>Região</th><th>Ameaça</th><th>PV base</th><th>Fraqueza principal</th></tr></thead>
                    <tbody>${summaryRows}</tbody>
                </table>
            </div>
            <p class="bestiary-footnote">* PV e dano base recebem a escala dos andares; o Guardião do Trono compartilha o multiplicador do chefe final. A Matriarca do Tear protege um ninho opcional no andar 8 e não conta para a meta principal.</p>
        </section>
        <section class="bestiary-region bestiary-section" data-bestiary-section="encounters" ${gameState !== 'menu' && visibleEntries.length === 0 ? 'hidden' : ''}>
            <h3>Encontros especiais</h3>
            <div class="bestiary-events">${events}</div>
        </section>
        <section class="bestiary-region bestiary-section" data-bestiary-section="npcs">
            <h3>NPCs</h3>
            <p class="bestiary-footnote">Personagens de apoio com locais e interações.</p>
            <div class="bestiary-proposals">${npcContentEntries}${savedNpcCards}</div>
        </section>
        <section class="bestiary-region bestiary-section" data-bestiary-section="allies">
            <h3>Criaturas extras</h3>
            <p class="bestiary-footnote">Criaturas ativas com locais, mecânicas e recompensas.</p>
            <div class="bestiary-proposals">${enemyContentEntries}</div>
        </section>
        <section class="bestiary-region bestiary-section" data-bestiary-section="farm">
            <h3>Farm de materiais e cadeia de receitas</h3>
            <p class="bestiary-footnote">Fontes, andares, chances e quantidades vêm dos drops reais dos inimigos; as saídas são cruzadas com o catálogo de receitas do Ferreiro.</p>
            <div class="bestiary-farm-grid">${farmCards}</div>
        </section>
        <section class="bestiary-region bestiary-section bestiary-additions" data-bestiary-section="additions">
            <div class="bestiary-section-heading">
                <div><span class="bestiary-eyebrow">ARQUIVO PESSOAL</span><h3>Adicionar fichas</h3></div>
                <span>${bestiaryCustomEntries.length} registros salvos</span>
            </div>
            <p class="bestiary-footnote">Crie fichas próprias de inimigos, NPCs ou eventos. Os registros ficam salvos neste navegador e não alteram o balanceamento do jogo.</p>
            <div class="bestiary-custom-tabs" role="group" aria-label="Tipo de ficha a adicionar">
                <button type="button" data-custom-type="enemy" aria-pressed="true">＋ Inimigo</button>
                <button type="button" data-custom-type="npc" aria-pressed="false">＋ NPC</button>
                <button type="button" data-custom-type="event" aria-pressed="false">＋ Evento</button>
            </div>
            <form class="bestiary-custom-form" data-custom-entry-form>
                <label>Nome da ficha
                    <input name="name" type="text" maxlength="60" required placeholder="Ex.: Guardião da ponte">
                </label>
                <label>Local ou região
                    <input name="region" type="text" maxlength="80" required placeholder="Ex.: Minas antigas · andar 4">
                </label>
                <fieldset data-custom-fields="enemy">
                    <legend>Ficha de inimigo</legend>
                    <label>Tipo de ameaça
                        <input name="category" type="text" maxlength="50" placeholder="Comum, elite, chefe...">
                    </label>
                    <label>Retrato
                        <select name="portraitKind">
                            <option value="humanoid">Humanoide</option>
                            <option value="spider">Aracnídeo</option>
                            <option value="bat">Voador</option>
                            <option value="lizard">Réptil</option>
                        </select>
                    </label>
                    <label>Aparência
                        <textarea name="appearance" maxlength="500" rows="2" required placeholder="Silhueta, cores e detalhes marcantes"></textarea>
                    </label>
                    <label>Comportamento e ataques
                        <textarea name="behavior" maxlength="700" rows="3" required placeholder="Como se move, ataca e reage"></textarea>
                    </label>
                    <label>Atributos
                        <input name="stats" type="text" maxlength="160" required placeholder="PV, dano, defesa e velocidade">
                    </label>
                    <label>Estratégia e fraquezas
                        <textarea name="strategy" maxlength="500" rows="2" required placeholder="Como enfrentar a criatura"></textarea>
                    </label>
                    <label>Espólios
                        <input name="reward" type="text" maxlength="160" placeholder="Itens, moedas ou materiais">
                    </label>
                </fieldset>
                <fieldset data-custom-fields="npc" hidden disabled>
                    <legend>Ficha de NPC</legend>
                    <label>Função
                        <input name="role" type="text" maxlength="80" required placeholder="Guia, comerciante, ferreiro...">
                    </label>
                    <input name="portraitKind" type="hidden" value="humanoid">
                    <label>História
                        <textarea name="lore" maxlength="700" rows="3" required placeholder="Quem é e o que procura"></textarea>
                    </label>
                    <label>Interação ou serviço
                        <textarea name="mechanic" maxlength="500" rows="2" required placeholder="Como o jogador pode interagir"></textarea>
                    </label>
                    <label>Recompensa ou custo
                        <input name="reward" type="text" maxlength="160" placeholder="Serviço, item ou preço">
                    </label>
                </fieldset>
                <fieldset data-custom-fields="event" hidden disabled>
                    <legend>Ficha de evento</legend>
                    <label>Andar ou momento
                        <input name="floor" type="text" maxlength="40" required placeholder="Ex.: andar 8">
                    </label>
                    <label>Retrato
                        <select name="portraitKind">
                            <option value="humanoid">Humanoide</option>
                            <option value="spider">Aracnídeo</option>
                            <option value="bat">Voador</option>
                            <option value="lizard">Réptil</option>
                        </select>
                    </label>
                    <label>Personagens envolvidos
                        <input name="participants" type="text" maxlength="160" placeholder="Inimigos, NPCs ou facções">
                    </label>
                    <label>Descrição do acontecimento
                        <textarea name="description" maxlength="700" rows="3" required placeholder="O que acontece e como participar"></textarea>
                    </label>
                    <label>Recompensa
                        <input name="reward" type="text" maxlength="160" placeholder="Opcional">
                    </label>
                </fieldset>
                <button class="bestiary-save-entry" type="submit">Salvar ficha</button>
                <p class="bestiary-custom-status" data-custom-entry-status role="status" aria-live="polite"></p>
            </form>
            <div class="bestiary-custom-list" data-custom-entry-list>
                ${savedEntries || '<p class="bestiary-custom-empty">Nenhuma ficha personalizada ainda. Use as abas acima para criar a primeira.</p>'}
            </div>
        </section>
    `;

    const filterButtons = [...bestiaryContent.querySelectorAll('[data-bestiary-filter]')];
    const searchInput = bestiaryContent.querySelector('[data-bestiary-search]');
    const resultsStatus = bestiaryContent.querySelector('[data-bestiary-results]');
    let activeFilter = 'all';
    const updateBestiaryView = () => {
        const query = searchInput.value.trim().toLocaleLowerCase('pt-BR');
        let matchedEntries = 0;
        let matchedEncounters = 0;
        let matchedAllies = 0;
        let matchedCustom = 0;
        let matchedFarmMaterials = 0;
        const sections = [...bestiaryContent.querySelectorAll('[data-bestiary-section]')];
        for (const section of sections) {
            const sectionType = section.dataset.bestiarySection;
            const matchesFilter = activeFilter === 'all'
                || sectionType === activeFilter
                || (sectionType === 'allies' && activeFilter === 'creatures');
            let hasMatches = true;
            if (sectionType === 'creatures') {
                for (const region of section.querySelectorAll('[data-bestiary-region]')) {
                    const entries = [...region.querySelectorAll('.bestiary-entry, .bestiary-custom-entry')];
                    const visibleInRegion = entries.filter((entry) => {
                        const matches = !query
                            || entry.textContent.toLocaleLowerCase('pt-BR').includes(query);
                        entry.hidden = !matches;
                        if (matches && matchesFilter) {
                            matchedEntries += 1;
                        }
                        return matches;
                    }).length;
                    region.hidden = visibleInRegion === 0;
                }
                hasMatches = matchedEntries > 0;
            } else if (sectionType === 'encounters'
                || sectionType === 'allies'
                || sectionType === 'npcs') {
                const selector = sectionType === 'encounters'
                    ? '.bestiary-event'
                    : '.bestiary-proposal';
                let visibleCards = 0;
                for (const card of section.querySelectorAll(selector)) {
                    const matchesProposalKind = !['allies', 'npcs'].includes(sectionType)
                        || activeFilter === 'all'
                        || (sectionType === 'allies'
                            && ['allies', 'creatures'].includes(activeFilter)
                            && card.dataset.proposalKind === 'enemy')
                        || (sectionType === 'npcs'
                            && activeFilter === 'npcs'
                            && card.dataset.proposalKind === 'npc');
                    const matches = matchesProposalKind && (!query
                        || card.textContent.toLocaleLowerCase('pt-BR').includes(query));
                    card.hidden = !matches;
                    if (matches) {
                        visibleCards += 1;
                        if (matchesFilter && sectionType === 'encounters') {
                            matchedEncounters += 1;
                        } else if (matchesFilter && sectionType !== 'npcs') {
                            matchedAllies += 1;
                        }
                    }
                }
                hasMatches = visibleCards > 0;
            } else if (sectionType === 'additions') {
                for (const card of section.querySelectorAll('.bestiary-custom-entry')) {
                    const matches = !query
                        || card.textContent.toLocaleLowerCase('pt-BR').includes(query);
                    card.hidden = !matches;
                    if (matches) {
                        matchedCustom += 1;
                    }
                }
            } else if (sectionType === 'farm') {
                for (const card of section.querySelectorAll('[data-farm-card]')) {
                    const matches = !query
                        || card.textContent.toLocaleLowerCase('pt-BR').includes(query);
                    card.hidden = !matches;
                    if (matches) {
                        matchedFarmMaterials += 1;
                    }
                }
                hasMatches = matchedFarmMaterials > 0;
            } else if (sectionType === 'summary') {
                let visibleRows = 0;
                for (const row of section.querySelectorAll('tbody tr')) {
                    const matches = !query
                        || row.textContent.toLocaleLowerCase('pt-BR').includes(query);
                    row.hidden = !matches;
                    if (matches) {
                        visibleRows += 1;
                    }
                }
                hasMatches = visibleRows > 0;
            } else if (sectionType === 'overview') {
                hasMatches = !query
                    || section.textContent.toLocaleLowerCase('pt-BR').includes(query);
            }
            section.hidden = !matchesFilter || !hasMatches;
        }
        resultsStatus.textContent = query
            ? `${matchedEntries} ${matchedEntries === 1 ? 'criatura' : 'criaturas'} · `
                + `${matchedEncounters} ${matchedEncounters === 1 ? 'encontro' : 'encontros'} · `
                + `${matchedAllies} ${matchedAllies === 1 ? 'NPC/conteúdo extra' : 'NPCs/conteúdos extras'} · `
                + `${matchedCustom} ${matchedCustom === 1 ? 'ficha pessoal' : 'fichas pessoais'} · `
                + `${matchedFarmMaterials} ${matchedFarmMaterials === 1 ? 'material' : 'materiais'}`
            : `${visibleEntries.length} fichas descobertas neste arquivo.`;
    };

    for (const button of filterButtons) {
        button.addEventListener('click', () => {
            activeFilter = button.dataset.bestiaryFilter;
            for (const filterButton of filterButtons) {
                filterButton.setAttribute(
                    'aria-pressed',
                    String(filterButton === button)
                );
            }
            updateBestiaryView();
        });
    }
    searchInput.addEventListener('input', updateBestiaryView);

    let activeCustomType = 'enemy';
    const customTypeButtons = [...bestiaryContent.querySelectorAll('[data-custom-type]')];
    const customForm = bestiaryContent.querySelector('[data-custom-entry-form]');
    const customStatus = bestiaryContent.querySelector('[data-custom-entry-status]');
    const persistCustomEntries = (entries) => {
        try {
            localStorage.setItem(bestiaryCustomStorageKey, JSON.stringify(entries));
            return true;
        } catch (error) {
            console.error('Não foi possível salvar as fichas personalizadas.', error);
            customStatus.textContent = 'Não foi possível salvar. Verifique o espaço disponível no navegador.';
            return false;
        }
    };
    const selectCustomType = (type) => {
        activeCustomType = type;
        for (const button of customTypeButtons) {
            button.setAttribute('aria-pressed', String(button.dataset.customType === type));
        }
        for (const fields of bestiaryContent.querySelectorAll('[data-custom-fields]')) {
            const isActive = fields.dataset.customFields === type;
            fields.hidden = !isActive;
            fields.disabled = !isActive;
        }
        customStatus.textContent = '';
    };
    for (const button of customTypeButtons) {
        button.addEventListener('click', () => selectCustomType(button.dataset.customType));
    }
    selectCustomType(activeCustomType);
    customForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(customForm);
        const value = (name) => String(formData.get(name) || '').trim();
        const name = value('name');
        const region = value('region');
        if (!name || !region) {
            customStatus.textContent = 'Preencha o nome e o local da ficha.';
            return;
        }
        const entry = {
            id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            type: activeCustomType,
            name,
            region,
            portraitKind: value('portraitKind') || 'humanoid'
        };
        if (activeCustomType === 'enemy') {
            Object.assign(entry, {
                category: value('category'),
                appearance: value('appearance'),
                behavior: value('behavior'),
                stats: value('stats'),
                strategy: value('strategy'),
                reward: value('reward')
            });
        } else if (activeCustomType === 'npc') {
            Object.assign(entry, {
                role: value('role'),
                lore: value('lore'),
                mechanic: value('mechanic'),
                reward: value('reward')
            });
        } else {
            Object.assign(entry, {
                floor: value('floor'),
                participants: value('participants'),
                description: value('description'),
                reward: value('reward')
            });
        }
        const updatedEntries = [...bestiaryCustomEntries, entry];
        if (!persistCustomEntries(updatedEntries)) {
            return;
        }
        bestiaryCustomEntries = updatedEntries;
        renderBestiary();
        bestiaryContent.querySelector('[data-bestiary-filter="additions"]').click();
        bestiaryContent.querySelector('[data-custom-entry-status]').textContent = 'Ficha salva neste navegador.';
    });
    bestiaryContent.addEventListener('click', (event) => {
        const removeButton = event.target.closest('[data-remove-entry]');
        if (!removeButton) {
            return;
        }
        const updatedEntries = bestiaryCustomEntries.filter((entry) => (
            entry.id !== removeButton.dataset.removeEntry
        ));
        if (!persistCustomEntries(updatedEntries)) {
            return;
        }
        bestiaryCustomEntries = updatedEntries;
        renderBestiary();
        bestiaryContent.querySelector('[data-bestiary-filter="additions"]').click();
        bestiaryContent.querySelector('[data-custom-entry-status]').textContent = 'Ficha removida.';
    });
    updateBestiaryView();
}

function setBestiaryOpen(open) {
    bestiaryOpen = open;
    bestiaryPanel.hidden = !open;
    startScreen.hidden = open || gameState !== 'menu';
    if (open) {
        renderBestiary();
        bestiaryCloseButton.focus();
    } else {
        (gameState === 'menu' ? bestiaryOpenButton : bestiaryInGameOpenButton)?.focus();
    }
}

bestiaryOpenButton.addEventListener('click', () => setBestiaryOpen(true));
if (bestiaryInGameOpenButton) {
    bestiaryInGameOpenButton.addEventListener('click', () => setBestiaryOpen(true));
}
bestiaryCloseButton.addEventListener('click', () => setBestiaryOpen(false));
