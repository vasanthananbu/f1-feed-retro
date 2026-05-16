export interface Driver {
  driver_number: number;
  full_name: string;
  name_acronym: string;
  team_name: string;
  team_colour: string;
  headshot_url?: string;
  country_code: string;
}

export interface Telemetry {
  speed: number;
  rpm: number;
  gear: number;
  throttle: number;
  brake: number;
  drs: number;
  date: string;
  driver_number: number;
}

export interface Interval {
  gap_to_leader: string | null;
  interval: string | null;
  driver_number: number;
  date: string;
}

export interface Position {
  session_key: number;
  meeting_key: number;
  driver_number: number;
  date: string;
  position: number;
}

export interface Lap {
  session_key: number;
  meeting_key: number;
  driver_number: number;
  lap_number: number;
  lap_duration: number | null;
  i1_speed: number | null;
  i2_speed: number | null;
  st_speed: number | null;
  is_pit_out_lap: boolean;
}

export interface Pit {
  session_key: number;
  meeting_key: number;
  driver_number: number;
  date: string;
  lap_number: number;
  pit_duration: number | null;
}

export interface Session {
  session_key: number;
  meeting_key: number;
  session_name: string;
  session_type: string;
  year: number;
  location: string;
  country_name: string;
  date_start: string;
}

export interface SideQuest {
  id: string;
  type: 'MOMENT' | 'POLL' | 'QUIZ';
  title: string;
  description: string;
  options?: string[];
  correctOption?: number;
  timestamp: string;
  isCompleted?: boolean;
  userAnswer?: number;
}

export interface AppNotification {
  id: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING';
  message: string;
  timestamp: string;
}

export interface KeyMoment {
  id: string;
  type: 'OVERTAKE' | 'FASTEST_LAP' | 'ACCIDENT' | 'WINNER' | 'PIT_STOP';
  driverName?: string;
  teamColour?: string;
  message: string;
}

export interface LiveState {
  drivers: Record<number, Driver>;
  positions: Record<number, number>;
  laps: Record<number, Lap>;
  pits: Record<number, Pit[]>;
  penalties: Record<number, string[]>;
  telemetry: Record<number, Telemetry>;
  intervals: Record<number, Interval>;
  sideQuests: SideQuest[];
  notifications: AppNotification[];
  keyMoments: KeyMoment[];
  keyMomentHistory: KeyMoment[];
  fanStats: {
    xp: number;
    level: number;
    influence: number;
  };
  lastUpdate: string;
  session: Session | null;
}
