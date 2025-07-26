import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Users } from 'lucide-react';
import { TournamentPair } from '@/types/tournament';
import { formatHandicap } from '@/utils/handicapUtils';
import { useTournament } from '@/hooks/useTournament';
import { useToast } from '@/hooks/use-toast';

interface TournamentPairCardProps {
  pair: TournamentPair;
}

export const TournamentPairCard: React.FC<TournamentPairCardProps> = ({ pair }) => {
  const { removePair } = useTournament();
  const { toast } = useToast();

  const handleRemove = async () => {
    try {
      await removePair(pair.id);
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
              onClick={handleRemove}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};