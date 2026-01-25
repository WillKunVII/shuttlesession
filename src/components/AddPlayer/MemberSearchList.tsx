import { Member } from "@/types/member";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MemberSearchListProps {
  members: Member[];
  searchQuery: string;
  sessionNameSet: Set<string>;
  onSelectMember: (member: Member) => void;
}

export function MemberSearchList({
  members,
  searchQuery,
  sessionNameSet,
  onSelectMember,
}: MemberSearchListProps) {
  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (searchQuery.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">Start typing to search for members</p>
      </div>
    );
  }

  if (filteredMembers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">No members found matching "{searchQuery}"</p>
        <p className="text-xs mt-1">Create a new member below</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[200px]">
      <div className="space-y-2">
        {filteredMembers.map((member) => {
          const isInSession = sessionNameSet.has(member.name.trim().toLowerCase());
          
          return (
            <div
              key={member.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                isInSession
                  ? "bg-muted/50 border-muted cursor-not-allowed opacity-60"
                  : "bg-card hover:bg-accent/50 border-border cursor-pointer"
              }`}
              onClick={() => !isInSession && onSelectMember(member)}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`h-3 w-3 rounded-full flex-shrink-0 ${
                    member.gender === "male" ? "bg-blue-500" : "bg-pink-500"
                  }`}
                />
                <div>
                  <span className="font-medium text-foreground">{member.name}</span>
                  <div className="flex gap-2 mt-0.5">
                    {member.isGuest && (
                      <span className="text-xs bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded">
                        Guest
                      </span>
                    )}
                    {member.playPreferences && member.playPreferences.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {member.playPreferences.join(", ")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {isInSession ? (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <UserCheck size={16} />
                  <span className="text-xs font-medium">In Session</span>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  className="flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectMember(member);
                  }}
                >
                  <UserPlus size={14} className="mr-1" />
                  Add
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
