
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";

// Mock data
const members = [
  { id: 1, name: "Sarah Johnson", status: "active", level: "advanced", gender: "female" },
  { id: 2, name: "Mike Smith", status: "active", level: "intermediate", gender: "male" },
  { id: 3, name: "Emma Wilson", status: "inactive", level: "beginner", gender: "female" },
  { id: 4, name: "John Davis", status: "active", level: "advanced", gender: "male" },
  { id: 5, name: "Lisa Brown", status: "active", level: "intermediate", gender: "female" },
];

export default function Members() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberGender, setNewMemberGender] = useState<"male" | "female">("male");

  const handleAddMember = () => {
    // Here you would add the new member to your state or database
    setIsDialogOpen(false);
    setNewMemberName("");
    setNewMemberGender("male");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Members</h1>
        <p className="text-muted-foreground">Manage club members</p>
      </div>
      
      <div className="flex justify-end">
        <Button onClick={() => setIsDialogOpen(true)}>Add Member</Button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b">
              <tr>
                <th className="px-6 py-3 text-sm font-semibold">Name</th>
                <th className="px-6 py-3 text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-sm font-semibold">Level</th>
                <th className="px-6 py-3 text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {members.map(member => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{member.name}</td>
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
                  <td className="px-6 py-4">
                    <Button variant="ghost" size="sm">Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Member</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Enter member name"
              />
            </div>

            <div className="space-y-2">
              <Label>Gender</Label>
              <RadioGroup 
                value={newMemberGender}
                onValueChange={(value) => setNewMemberGender(value as "male" | "female")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female">Female</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMember} disabled={!newMemberName}>
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
