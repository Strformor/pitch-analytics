export interface Player {
  PlayerID: number;
  Name: string;
  Position: string;
  Age: number;
  Nationality: string;
  Appearances: number;
  Goals: number;
  Assists: number;
  YellowCards: number;
  RedCards: number;
  MinutesPlayed: number;
}

export interface SharedSnapshot {
  id: string;
  players: Player[];
  created_at: string;
  label?: string;
}
