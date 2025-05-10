
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
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-shuttle-blue to-shuttle-darkBlue text-white p-6">
      <div className="text-center animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="bg-white p-3 rounded-full">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 6L7 12H17L12 6Z" fill="#4361EE" />
              <path d="M12 18L7 12H17L12 18Z" fill="#4361EE" />
            </svg>
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
            className="w-full py-6 text-lg bg-white text-shuttle-blue hover:bg-gray-100 transition-colors hover:text-shuttle-darkBlue"
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
