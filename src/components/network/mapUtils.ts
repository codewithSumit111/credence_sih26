export interface StationCoords {
  id: string;
  name: string;
  code: string;
  lat: number;
  lng: number;
  division?: string;
}

export const RAILWAY_STATIONS: Record<string, StationCoords> = {
  'NGP': { id: 'ST-NGP', name: 'Nagpur Junction', code: 'NGP', lat: 21.1458, lng: 79.0882, division: 'Nagpur' },
  'WR': { id: 'ST-WR', name: 'Wardha Junction', code: 'WR', lat: 20.7453, lng: 78.6022, division: 'Nagpur' },
  'BD': { id: 'ST-BD', name: 'Badnera Junction', code: 'BD', lat: 20.8660, lng: 77.7479, division: 'Bhusawal' },
  'AK': { id: 'ST-AK', name: 'Akola Junction', code: 'AK', lat: 20.7059, lng: 77.0082, division: 'Bhusawal' },
  'BSL': { id: 'ST-BSL', name: 'Bhusawal Junction', code: 'BSL', lat: 21.0455, lng: 75.7628, division: 'Bhusawal' },
  'PUNE': { id: 'ST-PUNE', name: 'Pune Junction', code: 'PUNE', lat: 18.5284, lng: 73.8738, division: 'Pune' },
  'LNL': { id: 'ST-LNL', name: 'Lonavala', code: 'LNL', lat: 18.7513, lng: 73.4072, division: 'Pune' },
  'MMR': { id: 'ST-MMR', name: 'Manmad Junction', code: 'MMR', lat: 20.2543, lng: 74.4371, division: 'Bhusawal' },
};

// Fallback logic to get coordinates for a block section like NGP-BSL
export function getSectionCoordinates(section: string): { start: [number, number], end: [number, number] } | null {
  const parts = section.split('-');
  if (parts.length >= 2) {
    const startSt = RAILWAY_STATIONS[parts[0]];
    const endSt = RAILWAY_STATIONS[parts[1]];
    if (startSt && endSt) {
      return {
        start: [startSt.lat, startSt.lng],
        end: [endSt.lat, endSt.lng],
      };
    }
  }
  // Default fallback to center of Maharashtra if not found
  return null;
}
