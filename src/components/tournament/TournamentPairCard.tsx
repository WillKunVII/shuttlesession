import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Trash2, Users, Edit, Check, X } from 'lucide-react';
import { TournamentPair } from '@/types/tournament';
import { formatHandicap } from '@/utils/handicapUtils';
import { useTournament } from '@/hooks/useTournament';
import { useToast } from '@/hooks/use-toast';

interface TournamentPairCardProps {
  pair: TournamentPair;
}

export const TournamentPairCard: React.FC<TournamentPairCardProps> = ({ pair }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editPlayer1Name, setEditPlayer1Name] = useState(pair.player1.name);
  const [editPlayer2Name, setEditPlayer2Name] = useState(pair.player2.name);
  const [editPlayer1Handicap, setEditPlayer1Handicap] = useState(pair.player1.handicap);
  const [editPlayer2Handicap, setEditPlayer2Handicap] = useState(pair.player2.handicap);
  const { removePair, updatePair } = useTournament();
  const { toast } = useToast();

  const handleEdit = () => {
    setIsEditing(true);
    setEditPlayer1Name(pair.player1.name);
    setEditPlayer2Name(pair.player2.name);
    setEditPlayer1Handicap(pair.player1.handicap);
    setEditPlayer2Handicap(pair.player2.handicap);
  };

  const handleSave = async () => {
    if (!editPlayer1Name.trim() || !editPlayer2Name.trim()) {
      toast({
        title: "Missing players",
        description: "Please enter both player names.",
        variant: "destructive"
      });
      return;
    }

    if (editPlayer1Name.trim() === editPlayer2Name.trim()) {
      toast({
        title: "Invalid pair",
        description: "Players must have different names.",
        variant: "destructive"
      });
      return;
    }

    try {
      await updatePair(pair.id, editPlayer1Name.trim(), editPlayer2Name.trim(), editPlayer1Handicap, editPlayer2Handicap);
      setIsEditing(false);
      toast({
        title: "Pair updated",
        description: `Pair updated successfully.`
      });
    } catch (error) {
      console.error('Error updating pair:', error);
      toast({
        title: "Error",
        description: "Failed to update pair.",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditPlayer1Name(pair.player1.name);
    setEditPlayer2Name(pair.player2.name);
    setEditPlayer1Handicap(pair.player1.handicap);
    setEditPlayer2Handicap(pair.player2.handicap);
  };

  const handleRemove = async () => {
    try {
      await removePair(pair.id);
      setIsEditing(false);
      toast({
        title: "Pair removed",
        description: `${pair.player1.name} & ${pair.player2.name} removed from tournament.`
      });
    } catch (error) {
      console.error('Error removing pair:', error);
      toast({
        title: "Error",
        description: "Failed to remove pair from tournament.",
        variant: "destructive"
      });
    }
  };

  if (isEditing) {
    return (
      <Card className="p-3">
        <CardContent className="p-0">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Edit Pair</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex gap-2">
                <Input
                  value={editPlayer1Name}
                  onChange={(e) => setEditPlayer1Name(e.target.value)}
                  placeholder="Player 1 name"
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={editPlayer1Handicap}
                  onChange={(e) => setEditPlayer1Handicap(Number(e.target.value))}
                  placeholder="HC"
                  className="w-16"
                  min="-20"
                  max="20"
                />
              </div>
              <div className="flex gap-2">
                <Input
                  value={editPlayer2Name}
                  onChange={(e) => setEditPlayer2Name(e.target.value)}
                  placeholder="Player 2 name"
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={editPlayer2Handicap}
                  onChange={(e) => setEditPlayer2Handicap(Number(e.target.value))}
                  placeholder="HC"
                  className="w-16"
                  min="-20"
                  max="20"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                Total: {formatHandicap(editPlayer1Handicap + editPlayer2Handicap)}
              </Badge>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleRemove}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleCancel}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleSave}
                  className="h-8 w-8 p-0 text-green-600 hover:text-green-600"
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-3">
      <CardContent className="p-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <span className="font-medium">{pair.player1.name}</span>
              <Badge variant="outline" className="text-xs">
                {formatHandicap(pair.player1.handicap)}
              </Badge>
              <span className="text-muted-foreground">&</span>
              <span className="font-medium">{pair.player2.name}</span>
              <Badge variant="outline" className="text-xs">
                {formatHandicap(pair.player2.handicap)}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              Total: {formatHandicap(pair.pairHandicap)}
            </Badge>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleEdit}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};