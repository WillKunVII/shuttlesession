

## Plan: Fix Auto-Pick to Prioritize Player Preferences

### Problem

The auto-pick algorithm has two core issues causing unfair matchups:

1. **Preferences are a binary filter, not a scoring factor** -- `playerAcceptsGameType` only checks pass/fail. Players with no preferences set (`[]`) accept everything, so the algorithm happily puts a "Mixed-only" player into an Open game with 3 preference-less players, because the game type defaults to Open when no one objects.

2. **Queue position bonus overpowers everything** -- Queue position gives up to +80 pts total (4 players x +20), while gender balance only gives +15 and variety gives +10. The algorithm almost always picks the top 4 in queue regardless of whether they form a good match.

---

### Solution

Three targeted changes to `src/utils/gameSelection.ts` and `src/utils/gameValidation.ts`:

---

### Change 1: Add Preference Satisfaction Scoring

**File: `src/utils/gameSelection.ts`**

Add a new `getPreferenceSatisfactionBonus` function that rewards combinations where the chosen game type matches each player's explicit preferences:

- Player's top preference matches the game type: **+10 pts per player**
- Player has the game type in their preferences (but not first): **+5 pts per player**
- Player has no preferences set (accepts anything): **+0 pts**
- Player's preferences don't include the game type: **-50 pts** (hard penalty, should be caught by validation but acts as safety net)

Maximum possible: +40 pts for a 4-player combination where everyone's top preference is satisfied.

Wire this into `calculateEnhancedScore` alongside the existing bonuses.

---

### Change 2: Rebalance Scoring Weights

**File: `src/utils/gameSelection.ts`**

Reduce queue position bonus and increase preference/gender weights so preferences actually matter:

| Factor | Current | New |
|--------|---------|-----|
| Queue pos 1-2 | +20 each | +10 each |
| Queue pos 3-4 | +15 each | +8 each |
| Queue pos 5-6 | +10 each | +6 each |
| Queue pos 7-8 | +5 each | +3 each |
| Gender balance (2M+2L) | +15 | +20 |
| Gender balance (4L) | +10 | +15 |
| Preference satisfaction | N/A | up to +40 |
| Repeat penalty base | 50 | 50 (unchanged) |

This shifts the max queue bonus from 80 down to 40, while preference satisfaction can contribute up to 40, making them equally weighted.

---

### Change 3: Increase Combination Sampling

**File: `src/utils/gameSelection.ts`**

Increase the random combination count from 20 to 40 per anchor player to improve the chance of finding preference-satisfying matches in larger pools. The performance budget (2 seconds) stays the same and acts as a natural cap.

---

### Technical Details

**New function in `gameSelection.ts`:**

```typescript
function getPreferenceSatisfactionBonus(
  combination: Player[],
  piggybackPairs?: Array<{ master: number; partner: number }>
): number {
  const prefEnabled = localStorage.getItem("enablePlayerPreferences") === "true";
  if (!prefEnabled) return 0;

  const gameType = determineBestGameTypeWithPiggyback(combination, piggybackPairs);
  if (!gameType) return -100; // No valid game type possible

  let bonus = 0;
  for (const player of combination) {
    const prefs = player.playPreferences || [];
    if (prefs.length === 0) continue; // No preference set, neutral

    const prefIndex = prefs.indexOf(gameType as any);
    if (prefIndex === 0) {
      bonus += 10; // Top preference matched
    } else if (prefIndex > 0) {
      bonus += 5;  // Secondary preference matched
    } else {
      bonus -= 50; // Preference violated (safety net)
    }
  }
  return bonus;
}
```

**Modified `calculateEnhancedScore`:** Add `preferenceSatisfactionBonus` to the total score calculation.

**Modified `getQueuePositionBonus`:** Reduce values to +10/+8/+6/+3.

**Modified `getGenderBalanceBonus`:** Increase to +20 for 2M+2L, +15 for 4L.

**Modified `generateRandomCombinations`:** Change count parameter from 20 to 40.

---

### Files Changed

| File | Change |
|------|--------|
| `src/utils/gameSelection.ts` | Add preference scoring function, rebalance weights, increase sampling |

No other files need changes -- the preference data already flows through the Player type correctly.

