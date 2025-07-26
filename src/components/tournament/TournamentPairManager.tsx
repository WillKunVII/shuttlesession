import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Users } from 'lucide-react';
import { TournamentPairCard } from './TournamentPairCard';
import { useTournament } from '@/hooks/useTournament';
import { useToast } from '@/hooks/use-toast';

export const TournamentPairManager: React.FC = () => {
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [player1Handicap, setPlayer1Handicap] = useState(0);
  const [player2Handicap, setPlayer2Handicap] = useState(0);
  const { currentTournament, addPair, loading } = useTournament();
  const { toast } = useToast();

  const handleAddPair = async () => {
    if (!player1Name.trim() || !player2Name.trim()) {
      toast({
        title: "Missing players",
        description: "Please enter both player names.",
        variant: "destructive"
      });
      return;
    }

    if (player1Name.trim() === player2Name.trim()) {
      toast({
        title: "Invalid pair",
        description: "Players must have different names.",
        variant: "destructive"
      });
      return;
    }

    // Check for duplicate pairs
    const existingPair = currentTournament?.pairs.find(pair => 
      (pair.player1.name === player1Name.trim() && pair.player2.name === player2Name.trim()) ||
      (pair.player1.name === player2Name.trim() && pair.player2.name === player1Name.trim())
    );

    if (existingPair) {
      toast({
        title: "Duplicate pair",
        description: "This pair already exists in the tournament.",
        variant: "destructive"
      });
      return;
    }

    try {
      await addPair(player1Name.trim(), player2Name.trim(), player1Handicap, player2Handicap);
      setPlayer1Name('');
      setPlayer2Name('');
      setPlayer1Handicap(0);
      setPlayer2Handicap(0);
      toast({
        title: "Pair added",
        description: `${player1Name} & ${player2Name} added to tournament.`
      });
    } catch (error) {
      console.error('Error adding pair:', error);
      toast({
        title: "Error",
        description: "Failed to add pair to tournament.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            Tournament Pairs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="player1">Player 1</Label>
              <div className="flex gap-2">
                <Input
                  id="player1"
                  value={player1Name}
                  onChange={(e) => setPlayer1Name(e.target.value)}
                  placeholder="Enter player name"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPair()}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={player1Handicap}
                  onChange={(e) => setPlayer1Handicap(Number(e.target.value))}
                  placeholder="HC"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPair()}
                  className="w-16"
                  min="-20"
                  max="20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="player2">Player 2</Label>
              <div className="flex gap-2">
                <Input
                  id="player2"
                  value={player2Name}
                  onChange={(e) => setPlayer2Name(e.target.value)}
                  placeholder="Enter player name"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPair()}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={player2Handicap}
                  onChange={(e) => setPlayer2Handicap(Number(e.target.value))}
                  placeholder="HC"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPair()}
                  className="w-16"
                  min="-20"
                  max="20"
                />
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleAddPair} 
            disabled={loading || !player1Name.trim() || !player2Name.trim()}
            size="sm"
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Pair
          </Button>

          {currentTournament && currentTournament.pairs.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Current Pairs ({currentTournament.pairs.length})
              </p>
              <div className="grid gap-2">
                {currentTournament.pairs.map((pair) => (
                  <TournamentPairCard key={pair.id} pair={pair} />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};