
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Edit, Trash2, Info } from "lucide-react";
import { Member } from "@/types/member";
import { MemberRecord } from "./MemberRecord";

interface MemberListProps {
  members: Member[];
  isScoreKeepingEnabled: boolean;
  preferencesEnabled: boolean;
  onEditMember: (member: Member) => void;
  onDeleteMember: (memberId: number) => void;
}

export function MemberList({
  members,
  isScoreKeepingEnabled,
  preferencesEnabled,
  onEditMember,
  onDeleteMember
}: MemberListProps) {
  return (
    <div className="bg-card rounded-xl shadow-sm overflow-hidden">
      <ScrollArea className="h-[calc(100vh-16rem)]">
        {/* Mobile Card Layout */}
        <div className="block md:hidden p-3 space-y-3">
          {members.map(member => (
            <div key={member.id} className="bg-background border rounded-lg p-4">
              {/* Row 1: Name, Gender, Actions */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className={`h-3 w-3 rounded-full shrink-0 ${member.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`}></span>
                  <span className="font-medium truncate">{member.name}</span>
                  {member.isGuest && (
                    <span className="text-xs bg-muted px-1.5 py-0.5 rounded shrink-0">Guest</span>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEditMember(member)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDeleteMember(member.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Row 2: Stats (conditional) */}
              {isScoreKeepingEnabled && (
                <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                  <MemberRecord wins={member.wins} losses={member.losses} />
                  <span className={`font-mono font-medium ${
                    (member.rating ?? 1000) >= 1100 ? "text-green-600" :
                    (member.rating ?? 1000) <= 900 ? "text-red-500" : ""
                  }`}>
                    Rating: {member.rating ?? 1000}
                  </span>
                </div>
              )}
              
              {/* Row 3: Preferences (conditional) */}
              {preferencesEnabled && member.playPreferences && member.playPreferences.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {member.playPreferences.map(pref => (
                    <Badge key={pref} variant="outline" className="text-xs">{pref}</Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop Table Layout */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold">Name</th>
                <th className="px-4 py-3 text-sm font-semibold">Gender</th>
                {isScoreKeepingEnabled && (
                  <th className="px-4 py-3 text-sm font-semibold">Record</th>
                )}
                {isScoreKeepingEnabled && (
                  <th className="px-4 py-3 text-sm font-semibold">
                    <div className="flex items-center gap-1">
                      Rating
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="font-normal">
                              ELO rating reflects skill level based on game results. 
                              All players start at 1000. Beating higher-rated opponents gains more points, 
                              while losing to lower-rated opponents costs more.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </th>
                )}
                {preferencesEnabled && (
                  <th className="px-4 py-3 text-sm font-semibold">Play Preferences</th>
                )}
                <th className="px-4 py-3 text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {members.map(member => (
                <tr key={member.id} className="hover:bg-muted/50">
                  <td className="px-4 py-4 font-medium">
                    {member.name}
                    {member.isGuest && (
                      <span className="ml-2 text-xs bg-muted px-1 py-0.5 rounded">Guest</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-block h-3 w-3 rounded-full ${member.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`}></span>
                  </td>
                  {isScoreKeepingEnabled && (
                    <td className="px-4 py-4">
                      <MemberRecord wins={member.wins} losses={member.losses} />
                    </td>
                  )}
                  {isScoreKeepingEnabled && (
                    <td className="px-4 py-4">
                      <span className={`font-mono text-sm font-medium ${
                        (member.rating ?? 1000) >= 1100 ? "text-green-600" :
                        (member.rating ?? 1000) <= 900 ? "text-red-500" : ""
                      }`}>
                        {member.rating ?? 1000}
                      </span>
                    </td>
                  )}
                  {preferencesEnabled && (
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {member.playPreferences && member.playPreferences.length > 0 ? (
                          member.playPreferences.map((pref) => (
                            <Badge key={pref} variant="outline" className="text-xs">
                              {pref}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">None</span>
                        )}
                      </div>
                    </td>
                  )}
                  <td className="px-4 py-4">
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => onEditMember(member)}>
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => onDeleteMember(member.id)}>
                        <Trash2 className="h-4 w-4 mr-1" /> Remove
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ScrollArea>
    </div>
  );
}
