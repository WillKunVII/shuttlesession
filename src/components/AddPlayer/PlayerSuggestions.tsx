
import { Member } from "@/types/member";
import { Label } from "@/components/ui/label";

interface PlayerSuggestionsProps {
  members: Member[];
  queueNameSet: Set<string>;
  name: string;
  show: boolean;
  onSelect: (member: Member) => void;
}

export function PlayerSuggestions({ members, queueNameSet, name, show, onSelect }: PlayerSuggestionsProps) {
  if (!show || members.length === 0) return null;

  return (
    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
      {members.map(member => {
        const isInQueue = queueNameSet.has(member.name.trim().toLowerCase());
        return (
          <div
            key={member.id}
            className={`px-4 py-2 cursor-pointer flex items-center ${
              isInQueue ? "text-gray-400 bg-gray-50" : "hover:bg-gray-100"
            }`}
            onClick={() => !isInQueue && onSelect(member)}
            style={{ pointerEvents: isInQueue ? "none" : "auto" }}
            data-testid={`suggest-${member.name}`}
          >
            <span className={`h-2 w-2 rounded-full mr-2 ${member.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`}></span>
            <span className="text-lg font-semibold">{member.name}</span>
            {member.isGuest && (
              <span className="ml-2 text-xs bg-gray-100 px-1 py-0.5 rounded">Guest</span>
            )}
            {isInQueue && (
              <span className="ml-2 text-xs bg-yellow-200 text-yellow-900 font-semibold px-2 py-0.5 rounded">
                In Queue
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
