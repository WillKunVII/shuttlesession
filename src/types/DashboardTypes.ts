
export interface CourtPlayer {
  id: number;
  name: string;
  gender: "male" | "female";
  isGuest?: boolean;
}

export interface Court {
  id: number;
  name: string;
  status: "available" | "occupied";
  players: CourtPlayer[];
  timeRemaining: number;
}
