
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetClose, 
  SheetContent, 
  SheetDescription, 
  SheetFooter, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function AddPlayerButton() {
  const [name, setName] = useState("");
  const [skill, setSkill] = useState("");
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="sm">
          <Plus size={16} className="mr-2" />
          Add Player
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add New Player</SheetTitle>
          <SheetDescription>
            Add a new player to the queue for today's session
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Player Name</Label>
            <Input 
              id="name" 
              placeholder="Enter player name" 
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="skill">Skill Level</Label>
            <Select value={skill} onValueChange={setSkill}>
              <SelectTrigger id="skill">
                <SelectValue placeholder="Select skill level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit" disabled={!name || !skill}>
              Add to Queue
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
