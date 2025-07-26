import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit3, Save, X } from 'lucide-react';
import { useTournament } from '@/hooks/useTournament';
import { formatHandicap, isValidHandicap } from '@/utils/handicapUtils';
import { generatePlayerId } from '@/utils/playerIdGenerator';
import { useToast } from '@/hooks/use-toast';

interface HandicapEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const HandicapEditor: React.FC<HandicapEditorProps> = ({ open, onOpenChange }) => {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerHandicap, setNewPlayerHandicap] = useState('0');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingHandicap, setEditingHandicap] = useState('');
  
  const { handicaps, updateHandicap } = useTournament();
  const { toast } = useToast();

  const handleAddPlayer = async () => {
    if (!newPlayerName.trim()) {
      toast({
        title: "Missing name",
        description: "Please enter a player name.",
        variant: "destructive"
      });
      return;
    }

    const handicapValue = parseInt(newPlayerHandicap);
    if (!isValidHandicap(handicapValue)) {
      toast({
        title: "Invalid handicap",
        description: "Handicap must be an integer between -20 and +20.",
        variant: "destructive"
      });
      return;
    }

    // Check for duplicate names
    const existingPlayer = handicaps.find(h => h.playerName.toLowerCase() === newPlayerName.trim().toLowerCase());
    if (existingPlayer) {
      toast({
        title: "Player exists",
        description: "A player with this name already exists.",
        variant: "destructive"
      });
      return;
    }

    try {
      await updateHandicap(generatePlayerId(), newPlayerName.trim(), handicapValue);
      setNewPlayerName('');
      setNewPlayerHandicap('0');
      toast({
        title: "Player added",
        description: `${newPlayerName} added with handicap ${formatHandicap(handicapValue)}.`
      });
    } catch (error) {
      console.error('Error adding player:', error);
      toast({
        title: "Error",
        description: "Failed to add player.",
        variant: "destructive"
      });
    }
  };

  const handleEditStart = (playerId: number, currentHandicap: number) => {
    setEditingId(playerId);
    setEditingHandicap(currentHandicap.toString());
  };

  const handleEditSave = async (playerId: number, playerName: string) => {
    const handicapValue = parseInt(editingHandicap);
    if (!isValidHandicap(handicapValue)) {
      toast({
        title: "Invalid handicap",
        description: "Handicap must be an integer between -20 and +20.",
        variant: "destructive"
      });
      return;
    }

    try {
      await updateHandicap(playerId, playerName, handicapValue);
      setEditingId(null);
      setEditingHandicap('');
      toast({
        title: "Handicap updated",
        description: `${playerName}'s handicap updated to ${formatHandicap(handicapValue)}.`
      });
    } catch (error) {
      console.error('Error updating handicap:', error);
      toast({
        title: "Error",
        description: "Failed to update handicap.",
        variant: "destructive"
      });
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingHandicap('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Player Handicaps</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add new player */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Plus className="h-5 w-5" />
                Add Player
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="playerName">Player Name</Label>
                  <Input
                    id="playerName"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    placeholder="Enter player name"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddPlayer()}
                  />
                </div>
                <div>
                  <Label htmlFor="playerHandicap">Handicap (-20 to +20)</Label>
                  <Input
                    id="playerHandicap"
                    type="number"
                    min="-20"
                    max="20"
                    value={newPlayerHandicap}
                    onChange={(e) => setNewPlayerHandicap(e.target.value)}
                    placeholder="0"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddPlayer()}
                  />
                </div>
              </div>
              <Button 
                onClick={handleAddPlayer} 
                disabled={!newPlayerName.trim()}
                size="sm"
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Player
              </Button>
            </CardContent>
          </Card>

          {/* Existing players */}
          {handicaps.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Current Players ({handicaps.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {handicaps.map((handicap) => (
                    <div key={handicap.playerId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{handicap.playerName}</span>
                        <Badge variant="outline">
                          {formatHandicap(handicap.handicap)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {editingId === handicap.playerId ? (
                          <>
                            <Input
                              type="number"
                              min="-20"
                              max="20"
                              value={editingHandicap}
                              onChange={(e) => setEditingHandicap(e.target.value)}
                              className="w-20 h-8"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              onClick={() => handleEditSave(handicap.playerId, handicap.playerName)}
                              className="h-8 w-8 p-0"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleEditCancel}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditStart(handicap.playerId, handicap.handicap)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {handicaps.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No players added yet. Add players above to manage their handicaps.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
