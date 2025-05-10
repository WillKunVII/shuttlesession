
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

// Empty initial members list
const initialMembers: Member[] = [];

export type Member = {
  id: number;
  name: string;
  status: "active" | "inactive";
  gender: "male" | "female";
  isGuest: boolean;
};

export default function Members() {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberGender, setNewMemberGender] = useState<"male" | "female">("male");
  const [isGuest, setIsGuest] = useState(false);

  // Load members from localStorage on component mount
  useEffect(() => {
    const savedMembers = localStorage.getItem("clubMembers");
    if (savedMembers) {
      try {
        setMembers(JSON.parse(savedMembers));
      } catch (e) {
        console.error("Error parsing members from localStorage", e);
      }
    }
  }, []);

  // Save members to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("clubMembers", JSON.stringify(members));
  }, [members]);

  const handleAddMember = () => {
    if (newMemberName) {
      const newMember = {
        id: Date.now(),
        name: newMemberName,
        gender: newMemberGender,
        status: "active" as const,
        isGuest
      };
      
      setMembers([...members, newMember]);
      setIsDialogOpen(false);
      setNewMemberName("");
      setNewMemberGender("male");
      setIsGuest(false);
      
      toast.success("Member added successfully");
    }
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
        <ScrollArea className="h-[calc(100vh-16rem)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b">
                <tr>
                  <th className="px-6 py-3 text-sm font-semibold">Name</th>
                  <th className="px-6 py-3 text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-sm font-semibold">Gender</th>
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
                      <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                        {member.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block h-3 w-3 rounded-full ${member.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`}></span>
                    </td>
                    <td className="px-6 py-4">
                      <Button variant="ghost" size="sm">Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollArea>
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
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="guest" 
                checked={isGuest}
                onCheckedChange={(checked) => setIsGuest(checked === true)}
              />
              <Label htmlFor="guest">Guest</Label>
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
