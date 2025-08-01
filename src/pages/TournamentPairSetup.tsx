import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TournamentLayout } from '@/components/TournamentLayout';
import { TournamentPairManager } from '@/components/tournament/TournamentPairManager';
import { useTournament } from '@/hooks/useTournament';
import { suggestGroupCount } from '@/utils/tournamentUtils';
import { ArrowRight, Users } from 'lucide-react';

export const TournamentPairSetup: React.FC = () => {
  const navigate = useNavigate();
  const { currentTournament, saveTournament } = useTournament();

  // Debug logging
  React.useEffect(() => {
    console.log('TournamentPairSetup - currentTournament changed:', {
      tournament: currentTournament,
      pairCount: currentTournament?.pairs.length || 0,
      pairs: currentTournament?.pairs || []
    });
  }, [currentTournament]);

  // Force re-render when pairs change
  const [renderKey, setRenderKey] = React.useState(0);
  React.useEffect(() => {
    if (currentTournament) {
      setRenderKey(prev => prev + 1);
    }
  }, [currentTournament?.pairs?.length]);

  const handleProceedToGroups = async () => {
    if (!currentTournament) return;

    const pairCount = currentTournament.pairs.length;
    const suggestedGroups = suggestGroupCount(pairCount);

    // Update tournament with suggested group count
    const updatedTournament = {
      ...currentTournament,
      numberOfGroups: suggestedGroups,
      status: 'group-stage' as const,
      currentStage: 'setup' as const
    };

    try {
      await saveTournament(updatedTournament);
      navigate('/app/tournament/groups');
    } catch (error) {
      console.error('Error updating tournament:', error);
    }
  };

  // Use useMemo to ensure proper recalculation
  const pairCount = React.useMemo(() => currentTournament?.pairs.length || 0, [currentTournament?.pairs?.length]);
  const canProceed = React.useMemo(() => currentTournament && currentTournament.pairs.length >= 4, [currentTournament?.pairs?.length]);
  const suggestedGroups = React.useMemo(() => currentTournament ? suggestGroupCount(currentTournament.pairs.length) : 2, [currentTournament?.pairs?.length]);

  // Debug current state
  console.log('TournamentPairSetup render:', {
    canProceed,
    pairCount,
    currentTournament: !!currentTournament,
    renderKey
  });

  return (
    <TournamentLayout title={currentTournament?.name || 'Tournament Setup'} showCancelButton>
      <div className="grid grid-cols-1 md:grid-cols-[minmax(366px,1fr)_minmax(366px,1fr)] gap-4">
        <TournamentPairManager />
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              Setup Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Tournament Name:</span>
                <span className="font-medium">{currentTournament?.name}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pairs Added:</span>
                <span className="font-medium">{pairCount}</span>
              </div>

              {currentTournament && currentTournament.pairs.length > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Suggested Groups:</span>
                  <span className="font-medium">{suggestedGroups}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t">
              {!canProceed ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Add at least 4 pairs to proceed to group setup.
                  </p>
                  <Button disabled className="w-full" size="sm">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Continue to Groups
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Ready to proceed! Groups will be automatically created.
                  </p>
                  <Button onClick={handleProceedToGroups} className="w-full" size="sm">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Continue to Groups
                  </Button>
                </div>
              )}
            </div>

            <div className="pt-3 border-t">
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>• Pairs will be distributed evenly across groups</p>
                <p>• Each group plays round-robin matches</p>
                <p>• Top pairs advance to knockout stage</p>
                <p>• Handicaps are automatically calculated</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TournamentLayout>
  );
};