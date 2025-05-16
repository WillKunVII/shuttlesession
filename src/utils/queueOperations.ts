import { nanoid } from "nanoid";
import { Player } from "@/types/playerTypes";

// Add player to queue
export function createNewPlayer(player: Omit<Player, "id" | "waitingTime">): Player {
  return {
    id: nanoid(),
    name: player.name,
    gender: player.gender,
    isGuest: player.isGuest,
    waitingTime: 0,
    wins: player.wins || 0,
    losses: player.losses || 0
  };
}

// Load player win/loss records if score keeping is enabled
export function loadPlayerRecords(queue: Player[]): Player[] {
  if (localStorage.getItem("scoreKeeping") === "true") {
    const membersData = localStorage.getItem("members");
    if (membersData) {
      try {
        const members = JSON.parse(membersData);
        
        // Update queue players with win/loss data from members
        return queue.map((player: Player) => {
          const member = members.find((m: any) => m.name === player.name);
          if (member) {
            return {
              ...player,
              wins: member.wins || 0,
              losses: member.losses || 0
            };
          }
          return player;
        });
      } catch (e) {
        console.error("Error loading members data for win/loss records", e);
      }
    }
  }
  return queue;
}
