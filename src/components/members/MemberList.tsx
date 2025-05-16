
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, X, Edit, Trash2 } from "lucide-react";
import { Member } from "@/types/member";

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
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <ScrollArea className="h-[calc(100vh-16rem)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b">
              <tr>
                <th className="px-6 py-3 text-sm font-semibold">Name</th>
                <th className="px-6 py-3 text-sm font-semibold">Gender</th>
                {isScoreKeepingEnabled && (
                  <th className="px-6 py-3 text-sm font-semibold">Record</th>
                )}
                {preferencesEnabled && (
                  <th className="px-6 py-3 text-sm font-semibold">Play Preferences</th>
                )}
                <th className="px-6 py-3 text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {members.map(member => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">
                    {member.name}
                    {member.isGuest && (
                      <span className="ml-2 text-xs bg-gray-100 px-1 py-0.5 rounded">Guest</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block h-3 w-3 rounded-full ${member.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`}></span>
                  </td>
                  {isScoreKeepingEnabled && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center">
                          <Trophy className="h-4 w-4 text-green-500 mr-1" />
                          {member.wins || 0}
                        </span>
                        <span className="text-gray-500">–</span>
                        <span className="flex items-center">
                          <X className="h-4 w-4 text-red-500 mr-1" />
                          {member.losses || 0}
                        </span>
                      </div>
                    </td>
                  )}
                  {preferencesEnabled && (
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {member.playPreferences && member.playPreferences.length > 0 ? (
                          member.playPreferences.map((pref) => (
                            <Badge key={pref} variant="outline" className="text-xs">
                              {pref}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-gray-400 text-sm">None</span>
                        )}
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => onEditMember(member)}>
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => onDeleteMember(member.id)}>
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
