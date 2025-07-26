import { useState, useEffect, useCallback } from 'react';
import { Tournament, TournamentPair, TournamentPlayer, HandicapRecord } from '@/types/tournament';
import { TournamentDB } from '@/utils/indexedDb/tournamentDB';
import { DatabaseManager } from '@/utils/indexedDb/database';
import { calculatePairHandicap } from '@/utils/handicapUtils';
import { generateId, generatePlayerId } from '@/utils/playerIdGenerator';

export const useTournament = () => {
  const [currentTournament, setCurrentTournament] = useState<Tournament | null>(null);
  const [handicaps, setHandicaps] = useState<HandicapRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const dbManager = new DatabaseManager();
  const tournamentDB = new TournamentDB(dbManager);

  // Load current tournament from storage
  useEffect(() => {
    const loadTournament = async () => {
      try {
        const tournamentData = localStorage.getItem('currentTournament');
        if (tournamentData) {
          const tournament = JSON.parse(tournamentData);
          setCurrentTournament(tournament);
        }
      } catch (error) {
        console.error('Error loading tournament:', error);
      }
    };

    loadTournament();
  }, []);

  // Load handicaps
  const loadHandicaps = useCallback(async () => {
    try {
      await dbManager.init();
      const allHandicaps = await tournamentDB.getAllHandicaps();
      setHandicaps(allHandicaps);
    } catch (error) {
      console.error('Error loading handicaps:', error);
    }
  }, []);

  useEffect(() => {
    loadHandicaps();
  }, [loadHandicaps]);

  // Save tournament to storage and DB
  const saveTournament = useCallback(async (tournament: Tournament) => {
    try {
      setLoading(true);
      // Update state immediately for UI responsiveness
      setCurrentTournament(tournament);
      localStorage.setItem('currentTournament', JSON.stringify(tournament));
      // Save to DB asynchronously without blocking UI
      await dbManager.init();
      await tournamentDB.saveTournament(tournament);
      console.log('Tournament saved successfully:', tournament);
    } catch (error) {
      console.error('Error saving tournament:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new tournament
  const createTournament = useCallback(async (name: string) => {
    const tournament: Tournament = {
      id: generateId(),
      name,
      status: 'setup',
      numberOfGroups: 2,
      pairs: [],
      groups: [],
      createdAt: Date.now(),
      currentStage: 'setup'
    };

    await saveTournament(tournament);
    return tournament;
  }, [saveTournament]);

  // Update player handicap
  const updateHandicap = useCallback(async (playerId: number, playerName: string, handicap: number) => {
    try {
      await dbManager.init();
      const handicapRecord: HandicapRecord = {
        playerId,
        playerName,
        handicap,
        lastUpdated: Date.now()
      };
      
      await tournamentDB.saveHandicap(handicapRecord);
      await loadHandicaps();

      // Update tournament pairs if tournament exists
      if (currentTournament) {
        const updatedPairs = currentTournament.pairs.map(pair => {
          let updated = false;
          const newPair = { ...pair };

          if (pair.player1.name === playerName) {
            newPair.player1 = { ...pair.player1, handicap };
            updated = true;
          }
          if (pair.player2.name === playerName) {
            newPair.player2 = { ...pair.player2, handicap };
            updated = true;
          }

          if (updated) {
            newPair.pairHandicap = calculatePairHandicap(newPair.player1.handicap, newPair.player2.handicap);
          }

          return newPair;
        });

        const updatedTournament = {
          ...currentTournament,
          pairs: updatedPairs
        };

        await saveTournament(updatedTournament);
      }
    } catch (error) {
      console.error('Error updating handicap:', error);
      throw error;
    }
  }, [currentTournament, loadHandicaps, saveTournament]);

  // Add pair to tournament
  const addPair = useCallback(async (player1Name: string, player2Name: string, player1Handicap: number = 0, player2Handicap: number = 0) => {
    if (!currentTournament) {
      console.error('No current tournament found');
      return;
    }

    console.log('Adding pair:', { player1Name, player2Name, player1Handicap, player2Handicap });

    const player1: TournamentPlayer = {
      id: generatePlayerId(),
      name: player1Name,
      handicap: player1Handicap
    };

    const player2: TournamentPlayer = {
      id: generatePlayerId(),
      name: player2Name,
      handicap: player2Handicap
    };

    const pair: TournamentPair = {
      id: generateId(),
      player1,
      player2,
      pairHandicap: calculatePairHandicap(player1Handicap, player2Handicap)
    };

    const updatedTournament = {
      ...currentTournament,
      pairs: [...currentTournament.pairs, pair]
    };

    console.log('Updated tournament pairs count:', updatedTournament.pairs.length);

    await saveTournament(updatedTournament);

    // Save individual handicaps to database
    try {
      await updateHandicap(player1.id, player1Name, player1Handicap);
      await updateHandicap(player2.id, player2Name, player2Handicap);
      console.log('Pair added and handicaps saved successfully');
    } catch (error) {
      console.error('Error saving handicaps:', error);
      // Don't throw here as the pair was already added successfully
    }
  }, [currentTournament, saveTournament, updateHandicap]);

  // Update pair in tournament
  const updatePair = useCallback(async (pairId: string, player1Name: string, player2Name: string, player1Handicap: number, player2Handicap: number) => {
    if (!currentTournament) return;

    const pairHandicap = calculatePairHandicap(player1Handicap, player2Handicap);

    const updatedPairs = currentTournament.pairs.map(pair => {
      if (pair.id === pairId) {
        return {
          ...pair,
          player1: { ...pair.player1, name: player1Name, handicap: player1Handicap },
          player2: { ...pair.player2, name: player2Name, handicap: player2Handicap },
          pairHandicap
        };
      }
      return pair;
    });

    const updatedTournament = {
      ...currentTournament,
      pairs: updatedPairs
    };

    await saveTournament(updatedTournament);

    // Update individual handicaps in database
    const pair = currentTournament.pairs.find(p => p.id === pairId);
    if (pair) {
      await updateHandicap(pair.player1.id, player1Name, player1Handicap);
      await updateHandicap(pair.player2.id, player2Name, player2Handicap);
    }
  }, [currentTournament, saveTournament, updateHandicap]);

  // Remove pair from tournament
  const removePair = useCallback(async (pairId: string) => {
    if (!currentTournament) return;

    const updatedTournament = {
      ...currentTournament,
      pairs: currentTournament.pairs.filter(pair => pair.id !== pairId)
    };

    await saveTournament(updatedTournament);
  }, [currentTournament, saveTournament]);


  // Get player handicap by name
  const getPlayerHandicap = useCallback((playerName: string): number => {
    const handicapRecord = handicaps.find(h => h.playerName === playerName);
    return handicapRecord?.handicap || 0;
  }, [handicaps]);

  // Clear current tournament
  const clearTournament = useCallback(() => {
    localStorage.removeItem('currentTournament');
    setCurrentTournament(null);
  }, []);

  return {
    currentTournament,
    handicaps,
    loading,
    createTournament,
    addPair,
    updatePair,
    removePair,
    updateHandicap,
    getPlayerHandicap,
    clearTournament,
    saveTournament
  };
};