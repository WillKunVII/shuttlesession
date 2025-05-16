
import { Player } from "@/types/player";
import { MedalGroup } from "./MedalGroup";

interface PlayerRankingsProps {
  topPlayers: Array<Player[]>;
}

export function PlayerRankings({ topPlayers }: PlayerRankingsProps) {
  return (
    <>
      {topPlayers.map((playerGroup, index) => 
        playerGroup.length > 0 && (
          <MedalGroup 
            key={index} 
            medalIndex={index} 
            players={playerGroup} 
          />
        )
      )}
    </>
  );
}
