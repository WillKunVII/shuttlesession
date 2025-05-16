
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
  const sortedCourts = getSortedCourts();

  return (
    <div className="bg-white rounded-xl shadow-sm p-3">
      <h2 className="text-xl font-semibold mb-3">Court Status</h2>
      <div className="flex flex-col space-y-3">
        {sortedCourts.map(court => (
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
