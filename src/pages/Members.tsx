
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Mock data
const members = [
  { id: 1, name: "Sarah Johnson", email: "sarah@example.com", status: "active", level: "advanced", joinDate: "Jan 2023" },
  { id: 2, name: "Mike Smith", email: "mike@example.com", status: "active", level: "intermediate", joinDate: "Feb 2023" },
  { id: 3, name: "Emma Wilson", email: "emma@example.com", status: "inactive", level: "beginner", joinDate: "Mar 2023" },
  { id: 4, name: "John Davis", email: "john@example.com", status: "active", level: "advanced", joinDate: "Dec 2022" },
  { id: 5, name: "Lisa Brown", email: "lisa@example.com", status: "active", level: "intermediate", joinDate: "Apr 2023" },
];

export default function Members() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Members</h1>
        <p className="text-muted-foreground">Manage club members</p>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search members..." 
            className="pl-8"
          />
        </div>
        <Button>Add Member</Button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b">
              <tr>
                <th className="px-6 py-3 text-sm font-semibold">Name</th>
                <th className="px-6 py-3 text-sm font-semibold">Email</th>
                <th className="px-6 py-3 text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-sm font-semibold">Level</th>
                <th className="px-6 py-3 text-sm font-semibold">Join Date</th>
                <th className="px-6 py-3 text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {members.map(member => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${member.name}`} alt={member.name} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{member.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{member.email}</td>
                  <td className="px-6 py-4">
                    <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                      {member.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline">
                      {member.level}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{member.joinDate}</td>
                  <td className="px-6 py-4">
                    <Button variant="ghost" size="sm">Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
