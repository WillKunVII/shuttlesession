
import { Player } from "@/types/player";
import { PlayerCard } from "./PlayerCard";
import { getMedalDisplay } from "./medalUtils";

interface MedalGroupProps {
  medalIndex: number;
  players: Player[];
}

export function MedalGroup({ medalIndex, players }: MedalGroupProps) {
  const { icon, color, name } = getMedalDisplay(medalIndex);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className={`font-bold ${color}`}>
          {name} Medal
          {players.length > 1 ? " Winners" : " Winner"}
        </h3>
      </div>
      
      <div className="space-y-2">
        {players.map((player) => (
          <PlayerCard key={player.name} player={player} />
        ))}
      </div>
    </div>
  );
}
