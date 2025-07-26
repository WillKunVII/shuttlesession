import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTournament } from '@/hooks/useTournament';
import { distributePairsToGroups, generateGroupMatches, suggestGroupCount } from '@/utils/tournamentUtils';
import { TournamentLayout } from '@/components/TournamentLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Trophy, ArrowRight } from 'lucide-react';
import { Tournament, TournamentGroup } from '@/types/tournament';

export default function TournamentGroups() {
  const navigate = useNavigate();
  const { currentTournament, saveTournament } = useTournament();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateGroups = async () => {
    if (!currentTournament) return;

    setIsGenerating(true);
    try {
      const groupCount = suggestGroupCount(currentTournament.pairs.length);
      const groups = distributePairsToGroups(currentTournament.pairs, groupCount);
      
      // Generate matches for each group
      const groupsWithMatches = groups.map(group => ({
        ...group,
        matches: generateGroupMatches(group)
      }));

      const updatedTournament: Tournament = {
        ...currentTournament,
        groups: groupsWithMatches,
        numberOfGroups: groupCount,
        status: 'group-stage',
        currentStage: 'groups',
        startedAt: Date.now()
      };

      await saveTournament(updatedTournament);
      console.log('Groups generated successfully');
    } catch (error) {
      console.error('Error generating groups:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleProceedToKnockout = () => {
    navigate('/tournament/knockout');
  };

  if (!currentTournament) {
    navigate('/tournament/setup');
    return null;
  }

  const hasGroups = currentTournament.groups && currentTournament.groups.length > 0;
  const totalMatches = hasGroups ? currentTournament.groups.reduce((sum, group) => sum + group.matches.length, 0) : 0;

  return (
    <TournamentLayout title="Tournament Groups" showCancelButton>
      <div className="space-y-6">
        {!hasGroups ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Group Stage Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  Ready to organize your {currentTournament.pairs.length} pairs into groups for round-robin play.
                </p>
                <p>
                  Suggested: <strong>{suggestGroupCount(currentTournament.pairs.length)} groups</strong> with approximately{' '}
                  <strong>{Math.ceil(currentTournament.pairs.length / suggestGroupCount(currentTournament.pairs.length))} pairs per group</strong>
                </p>
              </div>
              
              <Button 
                onClick={handleGenerateGroups} 
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? 'Generating Groups...' : 'Generate Groups & Matches'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4">
              {currentTournament.groups.map((group, index) => (
                <Card key={group.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Trophy className="h-5 w-5" />
                        {group.name}
                      </span>
                      <Badge variant="secondary">{group.pairs.length} pairs</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Pairs in this group:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {group.pairs.map((pair) => (
                            <div key={pair.id} className="flex items-center gap-2 p-2 bg-muted rounded text-sm">
                              <span>{pair.player1.name} & {pair.player2.name}</span>
                              <Badge variant="outline" className="text-xs">
                                H: {pair.pairHandicap > 0 ? '+' : ''}{pair.pairHandicap}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          Matches: {group.matches.length} total
                        </h4>
                        <div className="text-xs text-muted-foreground">
                          Each pair will play every other pair in their group once.
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Group Stage Ready</h3>
                    <p className="text-sm text-muted-foreground">
                      {currentTournament.groups.length} groups with {totalMatches} total matches generated
                    </p>
                  </div>
                  <Button onClick={handleProceedToKnockout} className="flex items-center gap-2">
                    Start Group Matches
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </TournamentLayout>
  );
}