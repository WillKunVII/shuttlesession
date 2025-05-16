
import { useState, useEffect } from "react";
import { CourtStatus } from "@/components/CourtStatus";
import { useCourtManagement } from "@/hooks/useCourtManagement";

interface CourtSectionProps {
  assignToFreeCourt: (courtId: number) => void;
  handleEndGameClick: (courtId: number) => void;
  isNextGameReady: () => boolean;
}

export function CourtSection({ 
  assignToFreeCourt, 
  handleEndGameClick, 
  isNextGameReady 
}: CourtSectionProps) {
  const { courts, getSortedCourts } = useCourtManagement();
  const [localCourts, setLocalCourts] = useState(getSortedCourts());
  
  // Update courts when they change
  useEffect(() => {
    // Function to update courts
    const updateCourts = () => {
      const currentCourts = getSortedCourts();
      setLocalCourts(currentCourts);
    };
    
    // Set up periodic refresh
    const intervalId = setInterval(updateCourts, 1000);
    
    // Initial update
    updateCourts();
    
    return () => clearInterval(intervalId);
  }, [getSortedCourts]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-3">
      <h2 className="text-xl font-semibold mb-3">Court Status</h2>
      <div className="flex flex-col space-y-3">
        {localCourts.map(court => (
          <CourtStatus 
            key={court.id} 
            court={court} 
            onAssign={() => assignToFreeCourt(court.id)} 
            onEndGame={() => handleEndGameClick(court.id)} 
            nextGameReady={isNextGameReady()} 
          />
        ))}
      </div>
    </div>
  );
}
