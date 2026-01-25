import { describe, it, expect, vi, beforeEach } from "vitest";
import { Player } from "../types/player";

// Helper to create test players
function createPlayer(
  id: number,
  name: string,
  gender: "male" | "female",
  overrides?: Partial<Player>
): Player {
  return {
    id,
    name,
    gender,
    waitingTime: 0,
    ...overrides,
  };
}

// Test the scoring functions directly by extracting their logic
describe("Queue Position Bonus", () => {
  const getQueuePositionBonus = (combination: Player[], poolPlayers: Player[]): number => {
    return combination.reduce((bonus, player) => {
      const position = poolPlayers.findIndex(p => p.id === player.id);
      if (position === 0 || position === 1) return bonus + 20;
      if (position === 2 || position === 3) return bonus + 15;
      if (position === 4 || position === 5) return bonus + 10;
      if (position === 6 || position === 7) return bonus + 5;
      return bonus;
    }, 0);
  };

  it("gives +20 bonus for players at positions 1-2", () => {
    const pool = [
      createPlayer(1, "Lady1", "female"),
      createPlayer(2, "Male1", "male"),
      createPlayer(3, "Male2", "male"),
      createPlayer(4, "Male3", "male"),
    ];
    
    // All 4 players from positions 0-3
    const combination = pool.slice(0, 4);
    const bonus = getQueuePositionBonus(combination, pool);
    
    // Pos 0: +20, Pos 1: +20, Pos 2: +15, Pos 3: +15 = 70
    expect(bonus).toBe(70);
  });

  it("gives lower bonus for players at later positions", () => {
    const pool = [
      createPlayer(1, "Player1", "male"),
      createPlayer(2, "Player2", "male"),
      createPlayer(3, "Player3", "male"),
      createPlayer(4, "Player4", "male"),
      createPlayer(5, "Player5", "female"),
      createPlayer(6, "Player6", "female"),
      createPlayer(7, "Player7", "female"),
      createPlayer(8, "Player8", "female"),
    ];
    
    // Select players from positions 4-7 (indices 4,5,6,7)
    const laterCombination = pool.slice(4, 8);
    const laterBonus = getQueuePositionBonus(laterCombination, pool);
    
    // Pos 4: +10, Pos 5: +10, Pos 6: +5, Pos 7: +5 = 30
    expect(laterBonus).toBe(30);
    
    // Compare with top positions
    const topCombination = pool.slice(0, 4);
    const topBonus = getQueuePositionBonus(topCombination, pool);
    
    // Pos 0: +20, Pos 1: +20, Pos 2: +15, Pos 3: +15 = 70
    expect(topBonus).toBe(70);
    
    // Top positions should score higher
    expect(topBonus).toBeGreaterThan(laterBonus);
  });

  it("prioritizes lady at position #1 with highest bonus", () => {
    const pool = [
      createPlayer(1, "Lady1", "female"), // Position 0 - should get +20
      createPlayer(2, "Male1", "male"),
      createPlayer(3, "Male2", "male"),
      createPlayer(4, "Lady2", "female"),
      createPlayer(5, "Male3", "male"),
      createPlayer(6, "Male4", "male"),
    ];
    
    // Combination including lady at position #1
    const withTopLady = [pool[0], pool[1], pool[2], pool[3]];
    const withTopLadyBonus = getQueuePositionBonus(withTopLady, pool);
    
    // Combination skipping lady at position #1
    const withoutTopLady = [pool[1], pool[2], pool[4], pool[5]];
    const withoutTopLadyBonus = getQueuePositionBonus(withoutTopLady, pool);
    
    // With top lady: 20 + 20 + 15 + 15 = 70
    expect(withTopLadyBonus).toBe(70);
    
    // Without top lady: 20 + 15 + 10 + 10 = 55
    expect(withoutTopLadyBonus).toBe(55);
    
    // Lady at #1 should make combination score higher
    expect(withTopLadyBonus).toBeGreaterThan(withoutTopLadyBonus);
  });
});

describe("Gender Balance Bonus", () => {
  const getGenderBalanceBonus = (combination: Player[]): number => {
    const males = combination.filter(p => p.gender === 'male').length;
    const females = combination.filter(p => p.gender === 'female').length;
    
    if (males === 2 && females === 2) return 15;
    if (females === 4) return 10;
    return 0;
  };

  it("gives +15 bonus for 2M+2L mixed game", () => {
    const mixedGame = [
      createPlayer(1, "Male1", "male"),
      createPlayer(2, "Male2", "male"),
      createPlayer(3, "Lady1", "female"),
      createPlayer(4, "Lady2", "female"),
    ];
    
    expect(getGenderBalanceBonus(mixedGame)).toBe(15);
  });

  it("gives +10 bonus for 4L ladies game", () => {
    const ladiesGame = [
      createPlayer(1, "Lady1", "female"),
      createPlayer(2, "Lady2", "female"),
      createPlayer(3, "Lady3", "female"),
      createPlayer(4, "Lady4", "female"),
    ];
    
    expect(getGenderBalanceBonus(ladiesGame)).toBe(10);
  });

  it("gives 0 bonus for 3M+1L unbalanced game", () => {
    const unbalancedGame = [
      createPlayer(1, "Male1", "male"),
      createPlayer(2, "Male2", "male"),
      createPlayer(3, "Male3", "male"),
      createPlayer(4, "Lady1", "female"),
    ];
    
    expect(getGenderBalanceBonus(unbalancedGame)).toBe(0);
  });

  it("gives 0 bonus for 4M open game", () => {
    const openGame = [
      createPlayer(1, "Male1", "male"),
      createPlayer(2, "Male2", "male"),
      createPlayer(3, "Male3", "male"),
      createPlayer(4, "Male4", "male"),
    ];
    
    expect(getGenderBalanceBonus(openGame)).toBe(0);
  });

  it("prefers 2M+2L over 3M+1L when both are valid", () => {
    const mixedGame = [
      createPlayer(1, "Male1", "male"),
      createPlayer(2, "Male2", "male"),
      createPlayer(3, "Lady1", "female"),
      createPlayer(4, "Lady2", "female"),
    ];
    
    const unbalancedGame = [
      createPlayer(1, "Male1", "male"),
      createPlayer(2, "Male2", "male"),
      createPlayer(3, "Male3", "male"),
      createPlayer(4, "Lady1", "female"),
    ];
    
    const mixedBonus = getGenderBalanceBonus(mixedGame);
    const unbalancedBonus = getGenderBalanceBonus(unbalancedGame);
    
    expect(mixedBonus).toBeGreaterThan(unbalancedBonus);
    expect(mixedBonus - unbalancedBonus).toBe(15); // 15 point advantage
  });
});

describe("Combined Scoring Scenarios", () => {
  const getQueuePositionBonus = (combination: Player[], poolPlayers: Player[]): number => {
    return combination.reduce((bonus, player) => {
      const position = poolPlayers.findIndex(p => p.id === player.id);
      if (position === 0 || position === 1) return bonus + 20;
      if (position === 2 || position === 3) return bonus + 15;
      if (position === 4 || position === 5) return bonus + 10;
      if (position === 6 || position === 7) return bonus + 5;
      return bonus;
    }, 0);
  };

  const getGenderBalanceBonus = (combination: Player[]): number => {
    const males = combination.filter(p => p.gender === 'male').length;
    const females = combination.filter(p => p.gender === 'female').length;
    if (males === 2 && females === 2) return 15;
    if (females === 4) return 10;
    return 0;
  };

  const getTotalBonus = (combination: Player[], pool: Player[]): number => {
    return getQueuePositionBonus(combination, pool) + getGenderBalanceBonus(combination);
  };

  it("scenario: lady at #1 with 2M+2L scores highest", () => {
    const pool = [
      createPlayer(1, "Lady1", "female"),  // Pos 0
      createPlayer(2, "Male1", "male"),     // Pos 1
      createPlayer(3, "Male2", "male"),     // Pos 2
      createPlayer(4, "Lady2", "female"),   // Pos 3
      createPlayer(5, "Male3", "male"),     // Pos 4
      createPlayer(6, "Male4", "male"),     // Pos 5
    ];
    
    // Best combo: Lady1, Male1, Male2, Lady2 (positions 0-3, 2M+2L)
    const bestCombo = [pool[0], pool[1], pool[2], pool[3]];
    
    // Alt combo: Male1, Male2, Male3, Male4 (positions 1,2,4,5, 4M)
    const altCombo = [pool[1], pool[2], pool[4], pool[5]];
    
    const bestScore = getTotalBonus(bestCombo, pool);
    const altScore = getTotalBonus(altCombo, pool);
    
    // Best: Queue(20+20+15+15=70) + Gender(15) = 85
    expect(bestScore).toBe(85);
    
    // Alt: Queue(20+15+10+10=55) + Gender(0) = 55
    expect(altScore).toBe(55);
    
    expect(bestScore).toBeGreaterThan(altScore);
  });

  it("scenario: skipping lady at #1 for 3M+1L scores lower", () => {
    const pool = [
      createPlayer(1, "Lady1", "female"),  // Pos 0
      createPlayer(2, "Male1", "male"),     // Pos 1
      createPlayer(3, "Male2", "male"),     // Pos 2
      createPlayer(4, "Male3", "male"),     // Pos 3
      createPlayer(5, "Lady2", "female"),   // Pos 4
    ];
    
    // Combo with lady at #1: Lady1, Male1, Male2, Lady2 (2M+2L)
    const withLady1 = [pool[0], pool[1], pool[2], pool[4]];
    
    // Combo skipping lady at #1: Male1, Male2, Male3, Lady2 (3M+1L)
    const skipLady1 = [pool[1], pool[2], pool[3], pool[4]];
    
    const withLady1Score = getTotalBonus(withLady1, pool);
    const skipLady1Score = getTotalBonus(skipLady1, pool);
    
    // With Lady1: Queue(20+20+15+10=65) + Gender(15) = 80
    expect(withLady1Score).toBe(80);
    
    // Skip Lady1: Queue(20+15+15+10=60) + Gender(0) = 60
    expect(skipLady1Score).toBe(60);
    
    // Including lady at #1 should score 20 points higher
    expect(withLady1Score - skipLady1Score).toBe(20);
  });
});
