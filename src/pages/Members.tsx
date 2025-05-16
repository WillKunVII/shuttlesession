import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Edit, Save, X, Trash2, Trophy, Award } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PlayPreference, Member } from "@/types/member";

// Empty initial members list
const initialMembers: Member[] = [];

export default function Members() {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberGender, setNewMemberGender] = useState<"male" | "female">("male");
  const [isGuest, setIsGuest] = useState(false);
  const [playPreferences, setPlayPreferences] = useState<PlayPreference[]>([]);
  const [preferencesEnabled, setPreferencesEnabled] = useState(false);
  
  // Edit mode states
  const [editMode, setEditMode] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<number | null>(null);

  // Load members from localStorage on component mount
  useEffect(() => {
    const enablePref = localStorage.getItem("enablePlayerPreferences");
    setPreferencesEnabled(enablePref === "true");

    const savedMembers = localStorage.getItem("clubMembers");
    if (savedMembers) {
      try {
        // Check if members have wins/losses fields, add if not
        const parsedMembers = JSON.parse(savedMembers);
        const updatedMembers = parsedMembers.map((member: any) => ({
          ...member,
          // Remove status field if it exists
          status: undefined,
          wins: member.wins !== undefined ? member.wins : 0,
          losses: member.losses !== undefined ? member.losses : 0,
          playPreferences: member.playPreferences || []
        }));
        setMembers(updatedMembers);
        // Save the updated members back to localStorage
        localStorage.setItem("clubMembers", JSON.stringify(updatedMembers));
      } catch (e) {
        console.error("Error parsing members from localStorage", e);
      }
    }
  }, []);

  // Save members to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("clubMembers", JSON.stringify(members));
  }, [members]);

  // Sort members alphabetically by name
  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => a.name.localeCompare(b.name));
  }, [members]);

  const handleAddMember = () => {
    if (newMemberName) {
      const newMember = {
        id: Date.now(),
        name: newMemberName,
        gender: newMemberGender,
        isGuest,
        wins: 0,
        losses: 0,
        playPreferences: preferencesEnabled ? playPreferences : []
      };
      
      setMembers([...members, newMember]);
      setIsDialogOpen(false);
      setNewMemberName("");
      setNewMemberGender("male");
      setIsGuest(false);
      setPlayPreferences([]);
      
      toast.success("Member added successfully");
    }
  };

  const handleEditClick = (member: Member) => {
    setEditingMember(member);
    setNewMemberName(member.name);
    setNewMemberGender(member.gender);
    setIsGuest(member.isGuest);
    setPlayPreferences(member.playPreferences || []);
    setEditMode(true);
    setIsDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingMember && newMemberName) {
      const updatedMembers = members.map(member => 
        member.id === editingMember.id 
          ? {
              ...member,
              name: newMemberName,
              gender: newMemberGender,
              isGuest: isGuest,
              playPreferences: preferencesEnabled ? playPreferences : member.playPreferences
            }
          : member
      );
      
      setMembers(updatedMembers);
      setIsDialogOpen(false);
      setEditMode(false);
      setEditingMember(null);
      
      toast.success("Member updated successfully");
    }
  };

  const handleCancelEdit = () => {
    setIsDialogOpen(false);
    setEditMode(false);
    setEditingMember(null);
    // Reset form states
    setNewMemberName("");
    setNewMemberGender("male");
    setIsGuest(false);
    setPlayPreferences([]);
  };
  
  const togglePreference = (preference: PlayPreference) => {
    if (playPreferences.includes(preference)) {
      setPlayPreferences(playPreferences.filter(p => p !== preference));
    } else {
      setPlayPreferences([...playPreferences, preference]);
    }
  };

  const confirmDeleteMember = (memberId: number) => {
    setMemberToDelete(memberId);
    setIsAlertDialogOpen(true);
  };

  const handleDeleteMember = () => {
    if (memberToDelete !== null) {
      const updatedMembers = members.filter(member => member.id !== memberToDelete);
      setMembers(updatedMembers);
      setIsAlertDialogOpen(false);
      setMemberToDelete(null);
      toast.success("Member removed successfully");
    }
  };

  // Check if score keeping is enabled
  const isScoreKeepingEnabled = localStorage.getItem("scoreKeeping") === "true";

  return (
    <div className="space-y-6 w-full col-span-full">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-2xl font-bold mb-2">Members</h1>
          <p className="text-muted-foreground">Manage club members</p>
        </div>
        
        <Button onClick={() => {
          setEditMode(false);
          setNewMemberName("");
          setNewMemberGender("male");
          setIsGuest(false);
          setPlayPreferences([]);
          setIsDialogOpen(true);
        }}>Add Member</Button>
      </div>
      
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
                {sortedMembers.map(member => (
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
                        <Button variant="ghost" size="sm" onClick={() => handleEditClick(member)}>
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => confirmDeleteMember(member.id)}>
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

      {/* Add/Edit Member Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editMode ? "Edit Member" : "Add New Member"}</DialogTitle>
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
            
            {/* Play preferences */}
            {preferencesEnabled && (
              <div className="space-y-2">
                <Label>Play Preferences</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="open-play" 
                      checked={playPreferences.includes("Open")}
                      onCheckedChange={() => togglePreference("Open")}
                    />
                    <Label htmlFor="open-play">Open Play (any combination)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="mixed-play" 
                      checked={playPreferences.includes("Mixed")}
                      onCheckedChange={() => togglePreference("Mixed")}
                    />
                    <Label htmlFor="mixed-play">Mixed Play (male/female pairs)</Label>
                  </div>
                  {newMemberGender === "female" && (
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="ladies-play" 
                        checked={playPreferences.includes("Ladies")}
                        onCheckedChange={() => togglePreference("Ladies")}
                      />
                      <Label htmlFor="ladies-play">Ladies Play (females only)</Label>
                    </div>
                  )}
                </div>
              </div>
            )}
            
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
            {editMode ? (
              <>
                <Button variant="outline" onClick={handleCancelEdit}>
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
                <Button onClick={handleSaveEdit} disabled={!newMemberName}>
                  <Save className="h-4 w-4 mr-1" /> Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddMember} disabled={!newMemberName}>
                  Add Member
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove the member from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsAlertDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDeleteMember}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
