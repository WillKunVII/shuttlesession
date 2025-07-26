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
    <TournamentLayout title="Tournament Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-[minmax(366px,1fr)_minmax(366px,1fr)] gap-4">
        {currentTournament ? (
          <Card className="p-4">
            <CardHeader className="px-0 pt-0 pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Continue Tournament
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 space-y-3">
              <div>
                <p className="font-medium">{currentTournament.name}</p>
                <Badge variant="secondary" className="capitalize mt-1">
                  {currentTournament.status.replace('-', ' ')}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Pairs</p>
                  <p className="font-medium">{currentTournament.pairs.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Groups</p>
                  <p className="font-medium">{currentTournament.numberOfGroups}</p>
                </div>
              </div>
              <Button onClick={handleContinueTournament} className="w-full" size="sm">
                Continue Tournament
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="p-4">
            <CardHeader className="px-0 pt-0 pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Plus className="h-5 w-5 text-primary" />
                Create New Tournament
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 space-y-3">
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  • Group stage with round-robin matches
                </p>
                <p className="text-muted-foreground">
                  • Top pairs advance to knockout stage
                </p>
                <p className="text-muted-foreground">
                  • Single elimination bracket
                </p>
              </div>
              <Button onClick={handleCreateTournament} className="w-full" size="sm">
                Create Tournament
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </TournamentLayout>
  );
};

export default Tournament;