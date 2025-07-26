import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight } from 'lucide-react';
import { TournamentLayout } from '@/components/TournamentLayout';
import { useTournament } from '@/hooks/useTournament';

export const TournamentSetup: React.FC = () => {
  const [tournamentName, setTournamentName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const { createTournament } = useTournament();

  const handleCreateTournament = async () => {
    if (!tournamentName.trim()) return;
    
    setIsCreating(true);
    
    try {
      await createTournament(tournamentName.trim());
      navigate('/app/tournament/setup/pairs');
    } catch (error) {
      console.error('Error creating tournament:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    navigate('/app/tournament');
  };

  return (
    <TournamentLayout title="Tournament Setup" showCancelButton={false}>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create New Tournament</CardTitle>
            <CardDescription>
              Set up your tournament with group stages and knockout rounds
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="tournamentName">Tournament Name</Label>
              <Input
                id="tournamentName"
                placeholder="e.g., Spring Championship 2025"
                value={tournamentName}
                onChange={(e) => setTournamentName(e.target.value)}
                disabled={isCreating}
              />
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Tournament Format</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Fixed doubles pairs (no individual matchmaking)</li>
                <li>• Group stage with round-robin matches</li>
                <li>• Knockout stage with seeded bracket</li>
                <li>• Handicap system for fair competition</li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={isCreating}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateTournament}
                disabled={!tournamentName.trim() || isCreating}
                className="flex-1"
              >
                {isCreating ? "Creating..." : "Next: Add Pairs"}
                {!isCreating && <ArrowRight className="h-4 w-4 ml-2" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </TournamentLayout>
  );
};

export default TournamentSetup;