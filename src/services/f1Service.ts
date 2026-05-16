import { Driver, Session, Position, Lap, Pit, Telemetry, Interval } from '../types';

const BASE_URL = 'https://api.openf1.org/v1';

export async function getLatestSession(): Promise<Session | null> {
  try {
    const response = await fetch(`${BASE_URL}/sessions?session_name=Race`);
    if (!response.ok) return null;
    const sessions: Session[] = await response.json();
    if (sessions && Array.isArray(sessions) && sessions.length > 0) {
      // Prioritize the user's suggested session key if it exists in the active list
      const preferred = sessions.find(s => s.session_key === 9839);
      if (preferred) return preferred;
      return sessions.sort((a, b) => b.session_key - a.session_key)[0];
    }
    
    // Fallback: search for any recent session if "Race" isn't active
    const fallbackResponse = await fetch(`${BASE_URL}/sessions`);
    const fallbackSessions: Session[] = await fallbackResponse.json();
    if (fallbackSessions && Array.isArray(fallbackSessions) && fallbackSessions.length > 0) {
      return fallbackSessions.sort((a, b) => b.session_key - a.session_key)[0];
    }
    return null;
  } catch (error) {
    console.error('Error fetching latest session:', error);
    return null;
  }
}

export async function getDrivers(session_key: number): Promise<Driver[]> {
  try {
    const response = await fetch(`${BASE_URL}/drivers?session_key=${session_key}`);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return [];
  }
}

export async function getLatestPositions(session_key: number, dateAfter?: string): Promise<Position[]> {
  try {
    let url = `${BASE_URL}/positions?session_key=${session_key}`;
    if (dateAfter) url += `&date>=${dateAfter}`;
    const response = await fetch(url);
    if (response.status === 429 || response.status === 404) return [];
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
}

export async function getLatestLaps(session_key: number, dateAfter?: string): Promise<Lap[]> {
  try {
    let url = `${BASE_URL}/laps?session_key=${session_key}`;
    if (dateAfter) url += `&date>=${dateAfter}`;
    const response = await fetch(url);
    if (response.status === 429 || response.status === 404) return [];
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
}

export async function getPits(session_key: number, dateAfter?: string): Promise<Pit[]> {
  try {
    let url = `${BASE_URL}/pit?session_key=${session_key}`;
    if (dateAfter) url += `&date>=${dateAfter}`;
    const response = await fetch(url);
    if (response.status === 429 || response.status === 404) return [];
    if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    }
    return [];
  } catch (error) {
    return [];
  }
}

export async function getLatestTelemetry(session_key: number, driver_number: number, dateAfter?: string): Promise<Telemetry | null> {
  try {
    let url = `${BASE_URL}/car_data?session_key=${session_key}&driver_number=${driver_number}`;
    if (dateAfter) url += `&date>=${dateAfter}`;
    const response = await fetch(url);
    if (response.status === 429 || response.status === 404) return null;
    if (!response.ok) return null;
    const data: Telemetry[] = await response.json();
    return data && data.length > 0 ? data[data.length - 1] : null;
  } catch (error) {
    return null;
  }
}

export async function getLatestIntervals(session_key: number, dateAfter?: string): Promise<Interval[]> {
  try {
    let url = `${BASE_URL}/intervals?session_key=${session_key}`;
    if (dateAfter) url += `&date>=${dateAfter}`;
    const response = await fetch(url);
    if (response.status === 429 || response.status === 404) return [];
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
}

export function generateMockData(): { 
  drivers: Driver[], 
  positions: Position[], 
  laps: Lap[], 
  telemetry: Record<number, Telemetry>,
  intervals: Interval[]
} {
  const driverNums = [1, 4, 44, 16, 81, 63, 11, 14, 27, 22, 7, 15];
  const names = ['Verstappen', 'Norris', 'Hamilton', 'Leclerc', 'Piastri', 'Russell', 'Perez', 'Alonso', 'Hulkenberg', 'Tsunoda', 'Sonny Hayes', 'Joshua Pearce'];
  const acronyms = ['VER', 'NOR', 'HAM', 'LEC', 'PIA', 'RUS', 'PER', 'ALO', 'HUL', 'TSU', 'HAY', 'PEA'];
  const teams = ['Red Bull', 'McLaren', 'Mercedes', 'Ferrari', 'McLaren', 'Mercedes', 'Red Bull', 'Aston Martin', 'Haas', 'RB', 'APXGP', 'APXGP'];
  const colors = ['3671C6', 'FF8000', '27F4D2', 'E80020', 'FF8000', '27F4D2', '3671C6', '229971', 'B6BABD', '6692FF', 'D4AF37', 'D4AF37'];

  const drivers = driverNums.map((num, i) => ({
    driver_number: num,
    full_name: names[i],
    name_acronym: acronyms[i],
    team_name: teams[i],
    team_colour: colors[i],
    country_code: 'INT'
  }));

  const positions = driverNums.map((num, i) => ({
    session_key: 0,
    meeting_key: 0,
    driver_number: num,
    date: new Date().toISOString(),
    position: i + 1
  }));

  const laps = driverNums.map(num => ({
    session_key: 0,
    meeting_key: 0,
    driver_number: num,
    lap_number: 12,
    lap_duration: 84.123 + Math.random(),
    i1_speed: 280 + Math.random() * 20,
    i2_speed: 240 + Math.random() * 20,
    st_speed: 310 + Math.random() * 20,
    is_pit_out_lap: false
  }));

  const telemetry: Record<number, Telemetry> = {};
  driverNums.forEach(num => {
    telemetry[num] = {
      speed: 180 + Math.random() * 140,
      rpm: 10000 + Math.random() * 2000,
      gear: Math.floor(Math.random() * 8) + 1,
      throttle: Math.random() * 100,
      brake: Math.random() > 0.8 ? Math.random() * 100 : 0,
      drs: Math.random() > 0.5 ? 12 : 0,
      date: new Date().toISOString(),
      driver_number: num
    };
  });

  const intervals = driverNums.map((num, i) => ({
    gap_to_leader: i === 0 ? null : (i * 1.5 + Math.random()).toFixed(3),
    interval: i === 0 ? null : (1.5 + Math.random()).toFixed(3),
    driver_number: num,
    date: new Date().toISOString()
  }));

  return { drivers, positions, laps, telemetry, intervals };
}
