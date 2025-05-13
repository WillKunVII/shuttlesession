
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const SplashScreen = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const handleStartSession = () => {
    navigate("/session");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-app-primary-500 to-app-primary-700 text-neutral-000 p-6">
      <div className="text-center animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="bg-neutral-000 p-3 rounded-full">
            <img 
              src="/lovable-uploads/55cb3b3b-e914-4a52-861a-cd69e1ec3f02.png" 
              alt="ShuttleSession Logo" 
              width="64" 
              height="64" 
              className="rounded-full"
            />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold mb-2">ShuttleSession</h1>
        <p className="text-xl mb-8 opacity-90">Badminton Session Management</p>
        
        <div className={`max-w-md mx-auto space-y-4 ${isMobile ? 'px-4' : 'px-8'}`}>
          <p className="text-lg opacity-80 mb-6">
            Create games, manage player queues and keep your badminton sessions running smoothly.
          </p>
          
          <Button 
            onClick={handleStartSession} 
            className="w-full py-6 text-lg bg-neutral-000 text-app-primary-700 hover:bg-neutral-100 transition-colors"
          >
            Start Session
          </Button>
        </div>
      </div>
      
      <div className="mt-auto pt-8 text-center opacity-70 text-sm">
        <p>© 2025 ShuttleSession</p>
      </div>
    </div>
  );
};

export default SplashScreen;
