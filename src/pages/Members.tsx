import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Member } from "@/types/member";
import { MemberForm } from "@/components/members/MemberForm";
import { MemberList } from "@/components/members/MemberList";
import { DeleteConfirmDialog } from "@/components/members/DeleteConfirmDialog";
import { DashboardProvider, useDashboard } from "@/contexts/DashboardContext";

// Empty initial members list
const initialMembers: Member[] = [];
export default function Members() {
  return (
    <DashboardProvider>
      <MembersPageContent />
    </DashboardProvider>
  );
}

function MembersPageContent() {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<number | null>(null);
  const [preferencesEnabled, setPreferencesEnabled] = useState(false);

  const { updateActivePlayerInfo } = useDashboard();

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
    setEditMode(false);
    setEditingMember(null);
    setIsDialogOpen(true);
  };
  const handleEditClick = (member: Member) => {
    setEditingMember(member);
    setEditMode(true);
    setIsDialogOpen(true);
  };
  const handleSaveMember = (memberData: Omit<Member, "id" | "wins" | "losses">) => {
    if (editMode && editingMember) {
      // Update existing member
      const updatedMembers = members.map(member => member.id === editingMember.id ? {
        ...member,
        name: memberData.name,
        gender: memberData.gender,
        isGuest: memberData.isGuest,
        playPreferences: preferencesEnabled ? memberData.playPreferences : member.playPreferences
      } : member);
      setMembers(updatedMembers);
      toast.success("Member updated successfully");
      // --- SYNC if player is active ---
      updateActivePlayerInfo({
        name: memberData.name,
        gender: memberData.gender,
        isGuest: memberData.isGuest,
        playPreferences: preferencesEnabled ? memberData.playPreferences : [],
      });
    } else {
      // Add new member
      const newMember = {
        id: Date.now(),
        name: memberData.name,
        gender: memberData.gender,
        isGuest: memberData.isGuest,
        wins: 0,
        losses: 0,
        playPreferences: preferencesEnabled ? memberData.playPreferences : []
      };
      setMembers([...members, newMember]);
      toast.success("Member added successfully");
      // --- SYNC new member if player is active ---
      updateActivePlayerInfo({
        name: memberData.name,
        gender: memberData.gender,
        isGuest: memberData.isGuest,
        playPreferences: preferencesEnabled ? memberData.playPreferences : [],
      });
    }
    setIsDialogOpen(false);
    setEditMode(false);
    setEditingMember(null);
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
  return <div className="space-y-6 w-full col-span-full">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-2xl font-bold mb-2 text-shuttle-lightBlue">Members</h1>
          <p className="text-shuttle-lightBlue">Manage club members</p>
        </div>
        
        <Button onClick={handleAddMember} className="text-shuttle-primary bg-shuttle-lightBlue">Add Member</Button>
      </div>
      
      <MemberList members={sortedMembers} isScoreKeepingEnabled={isScoreKeepingEnabled} preferencesEnabled={preferencesEnabled} onEditMember={handleEditClick} onDeleteMember={confirmDeleteMember} />

      {/* Add/Edit Member Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <MemberForm isEditMode={editMode} initialMember={editingMember} preferencesEnabled={preferencesEnabled} onSave={handleSaveMember} onCancel={() => setIsDialogOpen(false)} />
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog isOpen={isAlertDialogOpen} onClose={() => setIsAlertDialogOpen(false)} onConfirm={handleDeleteMember} />
    </div>;
}
