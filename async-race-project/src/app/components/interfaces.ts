export interface Car {
  id: number;
  name: string;
  color: string;
}

export interface CarRace {
  id: number;
  name: string;
  startTime: number;
  endTime: number | null;
}

export interface WinnersList {
  id: number;
  name: string;
  position: number;
  wins: number;
  time: number;
}

export interface DriveResponse {
  status: 'stopped' | 'completed' | string;
}
