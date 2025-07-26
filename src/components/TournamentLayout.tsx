import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";

interface TournamentLayoutProps {
  children: ReactNode;
  title?: string;
  showCancelButton?: boolean;
}

export const TournamentLayout = ({ 
  children, 
  title = "Tournament Mode",
  showCancelButton = true
}: TournamentLayoutProps) => {
  const navigate = useNavigate();

  const handleCancelTournament = () => {
    // Clear any tournament data
    localStorage.removeItem('currentTournament');
    localStorage.removeItem('tournamentState');
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Tournament Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/app')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Exit Tournament</span>
              </Button>
              <h1 className="text-xl font-semibold">{title}</h1>
            </div>
            
            {showCancelButton && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Cancel Tournament
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Tournament?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently cancel the current tournament and delete all progress.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Tournament</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleCancelTournament}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Cancel Tournament
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </header>

      {/* Tournament Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};