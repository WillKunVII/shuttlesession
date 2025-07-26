import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TournamentLayout } from "@/components/TournamentLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Play, Trophy, Users } from "lucide-react";

const Tournament = () => {
  const navigate = useNavigate();
  const [currentTournament, setCurrentTournament] = useState(null);

  useEffect(() => {
    // Check if there's an existing tournament in progress
    const tournament = localStorage.getItem('currentTournament');
    if (tournament) {
      try {
        setCurrentTournament(JSON.parse(tournament));
      } catch (error) {
        console.error('Error parsing tournament data:', error);
        localStorage.removeItem('currentTournament');
      }
    }
  }, []);

  const handleCreateTournament = () => {
    navigate('/app/tournament/setup');
  };

  const handleContinueTournament = () => {
    // Navigate to appropriate tournament stage
    if (currentTournament) {
      navigate('/app/tournament/groups');
    }
  };

  return (
    <TournamentLayout title="Tournament Dashboard" showCancelButton={!!currentTournament}>
      <div className="max-w-4xl mx-auto space-y-6">
        {!currentTournament ? (
          // No tournament in progress - show creation options
          <div className="space-y-6">
            <div className="text-center">
              <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">No Tournament in Progress</h2>
              <p className="text-muted-foreground">
                Create a new tournament with group stages and knockout rounds
              </p>
            </div>

            <Card className="max-w-md mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Create New Tournament</span>
                </CardTitle>
                <CardDescription>
                  Set up fixed pairs, groups, and manage a complete tournament
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleCreateTournament}
                  className="w-full"
                  size="lg"
                >
                  Start Tournament Setup
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Tournament in progress - show tournament status and continue options
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Trophy className="h-5 w-5" />
                      <span>{currentTournament.name || 'Current Tournament'}</span>
                    </CardTitle>
                    <CardDescription>Tournament in progress</CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {currentTournament.status?.replace('-', ' ').toUpperCase() || 'ACTIVE'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{currentTournament.pairs?.length || 0} Pairs</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                    <span>{currentTournament.numberOfGroups || 0} Groups</span>
                  </div>
                </div>

                <Button 
                  onClick={handleContinueTournament}
                  className="w-full"
                  size="lg"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Continue Tournament
                </Button>
              </CardContent>
            </Card>

            <div className="text-center text-sm text-muted-foreground">
              <p>Tournament data is automatically saved. You can exit and return anytime.</p>
            </div>
          </div>
        )}
      </div>
    </TournamentLayout>
  );
};

export default Tournament;