import { Driver, Session, Position, Lap, Pit, Telemetry, Interval } from '../types';

const BASE_URL = 'https://api.openf1.org/v1';

export async function getLatestSession(): Promise<Session | null> {
  try {
    const response = await fetch(`${BASE_URL}/sessions?session_name=Race`);
    if (!response.ok) return null;
    const sessions: Session[] = await response.json();
    return sessions.sort((a, b) => b.session_key - a.session_key)[0] || null;
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

export async function getLatestPositions(session_key: number): Promise<Position[]> {
  try {
    const response = await fetch(`${BASE_URL}/positions?session_key=${session_key}`);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching positions:', error);
    return [];
  }
}

export async function getLatestLaps(session_key: number): Promise<Lap[]> {
  try {
    const response = await fetch(`${BASE_URL}/laps?session_key=${session_key}`);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching laps:', error);
    return [];
  }
}

export async function getPits(session_key: number): Promise<Pit[]> {
  try {
    const pitResponse = await fetch(`${BASE_URL}/pit?session_key=${session_key}`);
    if (pitResponse.ok) {
        const data = await pitResponse.json();
        return Array.isArray(data) ? data : [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching pits:', error);
    return [];
  }
}

export async function getLatestTelemetry(session_key: number, driver_number: number): Promise<Telemetry | null> {
  try {
    const response = await fetch(`${BASE_URL}/car_data?session_key=${session_key}&driver_number=${driver_number}`);
    const data: Telemetry[] = await response.json();
    return data[data.length - 1] || null;
  } catch (error) {
    console.error(`Error fetching telemetry for driver ${driver_number}:`, error);
    return null;
  }
}

export async function getLatestIntervals(session_key: number): Promise<Interval[]> {
  try {
    const response = await fetch(`${BASE_URL}/intervals?session_key=${session_key}`);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching intervals:', error);
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
