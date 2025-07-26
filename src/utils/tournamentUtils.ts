/**
 * Tournament management utilities for group generation and seeding
 */

import { TournamentPair, TournamentGroup, TournamentMatch, GroupStanding } from '@/types/tournament';

/**
 * Generate optimal number of groups based on number of pairs
 */
export const suggestGroupCount = (pairCount: number): number => {
  if (pairCount <= 4) return 1;
  if (pairCount <= 8) return 2;
  if (pairCount <= 12) return 3;
  if (pairCount <= 16) return 4;
  if (pairCount <= 24) return 6;
  return Math.ceil(pairCount / 4); // Default to 4 pairs per group
};

/**
 * Distribute pairs evenly across groups
 */
export const distributePairsToGroups = (
  pairs: TournamentPair[],
  groupCount: number
): TournamentGroup[] => {
  const groups: TournamentGroup[] = [];
  
  // Create empty groups
  for (let i = 0; i < groupCount; i++) {
    groups.push({
      id: `group-${i + 1}`,
      name: `Group ${String.fromCharCode(65 + i)}`, // A, B, C, etc.
      pairs: [],
      matches: [],
      standings: []
    });
  }

  // Distribute pairs evenly
  pairs.forEach((pair, index) => {
    const groupIndex = index % groupCount;
    const updatedPair = { ...pair, groupId: groups[groupIndex].id };
    groups[groupIndex].pairs.push(updatedPair);
  });

  return groups;
};

/**
 * Generate all round-robin matches for a group
 */
export const generateGroupMatches = (group: TournamentGroup): TournamentMatch[] => {
  const matches: TournamentMatch[] = [];
  const pairs = group.pairs;

  // Generate all possible pair combinations
  for (let i = 0; i < pairs.length; i++) {
    for (let j = i + 1; j < pairs.length; j++) {
      const match: TournamentMatch = {
        id: `${group.id}-match-${i}-${j}`,
        pair1: pairs[i],
        pair2: pairs[j],
        stage: 'group',
        roundName: group.name,
        isCompleted: false
      };
      matches.push(match);
    }
  }

  return matches;
};

/**
 * Calculate group standings from match results
 */
export const calculateGroupStandings = (
  group: TournamentGroup,
  matches: TournamentMatch[]
): GroupStanding[] => {
  const standings: Record<string, GroupStanding> = {};

  // Initialize standings for each pair
  group.pairs.forEach(pair => {
    standings[pair.id] = {
      pairId: pair.id,
      pair,
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      pointsScored: 0,
      pointsConceded: 0,
      pointDifferential: 0,
      position: 0
    };
  });

  // Process completed matches
  matches
    .filter(match => match.isCompleted && (match.pair1.groupId === group.id || match.pair2.groupId === group.id))
    .forEach(match => {
      const pair1Standing = standings[match.pair1.id];
      const pair2Standing = standings[match.pair2.id];

      if (pair1Standing && pair2Standing) {
        pair1Standing.matchesPlayed++;
        pair2Standing.matchesPlayed++;

        const pair1Score = match.pair1AdjustedScore || 0;
        const pair2Score = match.pair2AdjustedScore || 0;

        pair1Standing.pointsScored += pair1Score;
        pair1Standing.pointsConceded += pair2Score;
        pair2Standing.pointsScored += pair2Score;
        pair2Standing.pointsConceded += pair1Score;

        // Determine winner and update wins/losses
        if (match.winnerId === match.pair1.id) {
          pair1Standing.wins++;
          pair2Standing.losses++;
        } else {
          pair2Standing.wins++;
          pair1Standing.losses++;
        }
      }
    });

  // Calculate point differentials
  Object.values(standings).forEach(standing => {
    standing.pointDifferential = standing.pointsScored - standing.pointsConceded;
  });

  // Sort standings and assign positions
  const sortedStandings = Object.values(standings).sort((a, b) => {
    // Primary: wins (descending)
    if (a.wins !== b.wins) return b.wins - a.wins;
    
    // Secondary: point differential (descending)
    if (a.pointDifferential !== b.pointDifferential) {
      return b.pointDifferential - a.pointDifferential;
    }
    
    // Tertiary: points scored (descending)
    return b.pointsScored - a.pointsScored;
  });

  // Assign positions
  sortedStandings.forEach((standing, index) => {
    standing.position = index + 1;
  });

  return sortedStandings;
};

/**
 * Check if group stage is complete
 */
export const isGroupStageComplete = (groups: TournamentGroup[], matches: TournamentMatch[]): boolean => {
  return groups.every(group => {
    const groupMatches = matches.filter(match => 
      match.stage === 'group' && 
      (match.pair1.groupId === group.id || match.pair2.groupId === group.id)
    );
    return groupMatches.every(match => match.isCompleted);
  });
};

/**
 * Get qualified pairs from each group for knockout stage
 */
export const getQualifiedPairs = (
  groups: TournamentGroup[],
  matches: TournamentMatch[],
  qualifiersPerGroup: number = 2
): TournamentPair[] => {
  const qualifiedPairs: TournamentPair[] = [];

  groups.forEach(group => {
    const standings = calculateGroupStandings(group, matches);
    const groupQualifiers = standings
      .slice(0, qualifiersPerGroup)
      .map(standing => standing.pair);
    qualifiedPairs.push(...groupQualifiers);
  });

  return qualifiedPairs;
};