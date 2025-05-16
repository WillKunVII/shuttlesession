
import { Trophy, X } from "lucide-react";

interface MemberRecordProps {
  wins: number;
  losses: number;
}

export function MemberRecord({ wins, losses }: MemberRecordProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center">
        <Trophy className="h-4 w-4 text-green-500 mr-1" />
        {wins || 0}
      </span>
      <span className="text-gray-500">–</span>
      <span className="flex items-center">
        <X className="h-4 w-4 text-red-500 mr-1" />
        {losses || 0}
      </span>
    </div>
  );
}
