/**
 * Handicap calculation utilities for tournament matches
 */

import { TournamentPair } from '@/types/tournament';

/**
 * Calculate pair handicap from individual player handicaps
 */
export const calculatePairHandicap = (player1Handicap: number, player2Handicap: number): number => {
  return player1Handicap + player2Handicap;
};

/**
 * Calculate handicap-adjusted scores for a match
 */
export const calculateAdjustedScores = (
  pair1Score: number,
  pair2Score: number,
  pair1Handicap: number,
  pair2Handicap: number
): { pair1Adjusted: number; pair2Adjusted: number } => {
  // Apply handicap: positive handicap adds points, negative handicap subtracts points
  const pair1Adjusted = Math.max(0, pair1Score + pair1Handicap);
  const pair2Adjusted = Math.max(0, pair2Score + pair2Handicap);

  return {
    pair1Adjusted,
    pair2Adjusted
  };
};

/**
 * Determine winner based on adjusted scores
 */
export const determineWinner = (
  pair1: TournamentPair,
  pair2: TournamentPair,
  pair1Score: number,
  pair2Score: number,
  handicapOverride?: { pair1Handicap: number; pair2Handicap: number }
): {
  winnerId: string;
  pair1Adjusted: number;
  pair2Adjusted: number;
} => {
  const pair1Handicap = handicapOverride?.pair1Handicap ?? pair1.pairHandicap;
  const pair2Handicap = handicapOverride?.pair2Handicap ?? pair2.pairHandicap;

  const { pair1Adjusted, pair2Adjusted } = calculateAdjustedScores(
    pair1Score,
    pair2Score,
    pair1Handicap,
    pair2Handicap
  );

  const winnerId = pair1Adjusted > pair2Adjusted ? pair1.id : pair2.id;

  return {
    winnerId,
    pair1Adjusted,
    pair2Adjusted
  };
};

/**
 * Get handicap differential between two pairs
 */
export const getHandicapDifferential = (pair1Handicap: number, pair2Handicap: number): number => {
  return Math.abs(pair1Handicap - pair2Handicap);
};

/**
 * Format handicap display (show + for positive, - for negative)
 */
export const formatHandicap = (handicap: number): string => {
  if (handicap === 0) return '0';
  return handicap > 0 ? `+${handicap}` : `${handicap}`;
};

/**
 * Validate handicap value (typically between -20 and +20)
 */
export const isValidHandicap = (handicap: number): boolean => {
  return Number.isInteger(handicap) && handicap >= -20 && handicap <= 20;
};