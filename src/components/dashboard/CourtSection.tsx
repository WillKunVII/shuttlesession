
import { useState, useEffect } from "react";
import { CourtStatus } from "@/components/CourtStatus";
import { useCourtManagement } from "@/hooks/useCourtManagement";
import { useGameAssignment } from "@/hooks/useGameAssignment";

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
  const { getSortedCourts } = useCourtManagement();
  const [courts, setCourts] = useState(getSortedCourts());
  
  // Update courts when they change
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCourts(getSortedCourts());
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [getSortedCourts]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-3">
      <h2 className="text-xl font-semibold mb-3">Court Status</h2>
      <div className="flex flex-col space-y-3">
        {courts.map(court => (
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
