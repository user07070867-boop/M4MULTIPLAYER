const GAME_BALANCE = Object.freeze({
    visual: Object.freeze({
        actorAnimationSpeedMultiplier: 1.6,
        playerAttackAnimationSpeedMultiplier: 1.2
    }),
    bow: Object.freeze({
        damage: 12,
        cooldownSeconds: 1,
        projectileSpeed: 210,
        range: 220,
        startingAmmo: 24,
        maxAmmo: 36,
        ammoPickup: 8,
        ammoDropChance: 0.3,
        ammoBundleSize: 12,
        ammoBundleCost: 8
    }),
    economy: Object.freeze({
        upgradeCostGrowth: 1.32,
        potionDropMultiplier: 0.7,
        oreDropWeights: Object.freeze({ copper: 66.5, emerald: 0.15 }),
        upgradeBaseCosts: Object.freeze({ sword: 4, shield: 3, armor: 5 }),
        fixedCosts: Object.freeze({
            spear: 12,
            bow: 12,
            dash: 15,
            potion: 12
        }),
        potionCapacity: 3,
        botStartingPotions: 2,
        sword: Object.freeze({
            fullGainLevels: 5,
            fullGain: 2,
            reducedGainLevels: 5,
            reducedGain: 1,
            highLevelEvery: 2,
            highLevelGain: 1
        }),
        shield: Object.freeze({
            initialDurability: 30,
            fullGainLevels: 3,
            fullGain: 20,
            reducedGain: 10
        }),
        armor: Object.freeze({
            initialDurability: 50,
            fullGainLevels: 3,
            fullDurabilityGain: 25,
            reducedDurabilityGain: 10,
            fullDefenseLevels: 3,
            fullDefenseGain: 3,
            reducedDefenseGain: 2
        })
    }),
    shop: Object.freeze({
        items: Object.freeze({
            sword: Object.freeze({ nivelMinimo: 1 }), // [a revisar]
            shield: Object.freeze({ nivelMinimo: 1 }), // [a revisar]
            armor: Object.freeze({ nivelMinimo: 1 }), // [a revisar]
            spear: Object.freeze({ nivelMinimo: 3 }), // [a revisar]
            bow: Object.freeze({ nivelMinimo: 5 }), // [a revisar]
            arrows: Object.freeze({ nivelMinimo: 1 }), // [a revisar]
            dash: Object.freeze({ nivelMinimo: 10 }), // [a revisar]
            potion: Object.freeze({ nivelMinimo: 1 }) // [a revisar]
        }),
        showLockedItems: true
    }),
    bot: Object.freeze({
        // [a revisar] Limiares, chances e tempos iniciais de recuo.
        retreat: Object.freeze({
            enabled: true,
            triggers: Object.freeze({
                lowHealth: true,
                outnumbered: true,
                higherLevelEnemy: true,
                noResources: true,
                environmentalDanger: true
            }),
            lowHealthRatio: 0.3,
            returnHealthRatio: 0.65,
            enemyCountThreshold: 2,
            enemyDangerDistance: 150,
            higherEnemyLevelDifference: 4,
            baseChancePercent: 30,
            maximumChancePercent: 85,
            severityCurve: 1.5,
            bossChanceMultiplier: 0.5,
            cooldownSeconds: 18,
            maximumConsecutiveRetreats: 3,
            minimumDurationSeconds: 1.5,
            safeDistance: 190,
            perceptionDistance: 220,
            useHealingItem: true,
            debug: false,
            forceTrigger: 'none'
        }),
        // [a revisar] Alcances, chances e limites para atacar objetos.
        objects: Object.freeze({
            enabled: true,
            perceptionDistance: 180,
            immediateThreatDistance: 150,
            quietTimeSeconds: 2,
            attackRange: 26,
            stuckSeconds: 3,
            stuckDistance: 3,
            blockedPathCorridor: 1.25,
            baseChancePercent: Object.freeze({
                blocked: 80,
                trapped: 90,
                resource: 25,
                cover: 35
            }),
            attacksPerInterval: 2,
            intervalSeconds: 60,
            debug: false,
            forceTrigger: 'none'
        })
    }),
    enemies: Object.freeze({
        defaultDamage: 10,
        healthScalingPerFloor: 0.17,
        damageScalingPerFloor: 0.16,
        killGoalsByFiveFloorBand: Object.freeze([6, 11, 16, 21, 20])
    }),
    bosses: Object.freeze({
        standardPowerMultiplier: 1.5,
        finalPowerMultiplier: 1.9,
        intelligenceMultiplier: 1.4,
        healthScalingPerFloor: 0.015,
        damageScalingPerFloor: 0.02,
        weaknessAttackThreshold: 3,
        phaseOneWeaknessSeconds: 2.3,
        phaseTwoWeaknessSeconds: 1.7,
        meleeBlockChance: 0.25,
        arrowBlockChance: 0.5,
        finalPhaseCount: 3,
        finalPhaseWeaknessSeconds: 1.2,
        finalPhasePulseCooldownMultiplier: 0.7,
        finalPhasePulseWarningMultiplier: 0.9,
        finalPhaseWarningMultiplier: 0.9,
        finalPhaseContactCooldownMultiplier: 0.55,
        finalPhaseFireballCooldownMultiplier: 0.42,
        finalPhaseWingCooldownMultiplier: 0.55,
        finalPhaseLavaCooldownMultiplier: 0.5,
        finalPhaseRockCooldownMultiplier: 0.48,
        finalPhaseEruptionCooldownMultiplier: 0.55,
        reaperScytheWarningSeconds: 0.9,
        reaperPhaseTwoWarningMultiplier: 0.85,
        reaperBotDashWarningSeconds: 0.85,
        reaperDamageMultiplier: 0.8
    })
});
