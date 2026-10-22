// Haversine formula to calculate distance between two coordinates in kilometers
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180);
}

// Simple mock geocoder that returns deterministic coordinates based on the string.
// Provides hardcoded accurate coordinates for major Indian cities for realism.
export async function geocodeAddress(address: string): Promise<{ lat: number, lng: number } | null> {
  const normalized = address.toLowerCase();
  
  // Real coordinates for major cities
  const cityMap: Record<string, {lat: number, lng: number}> = {
    'bengaluru': { lat: 12.9716, lng: 77.5946 },
    'bangalore': { lat: 12.9716, lng: 77.5946 },
    'mumbai': { lat: 19.0760, lng: 72.8777 },
    'delhi': { lat: 28.7041, lng: 77.1025 },
    'chennai': { lat: 13.0827, lng: 80.2707 },
    'hyderabad': { lat: 17.3850, lng: 78.4867 },
    'pune': { lat: 18.5204, lng: 73.8567 },
    'kolkata': { lat: 22.5726, lng: 88.3639 },
    'ahmedabad': { lat: 23.0225, lng: 72.5714 },
    'erode': { lat: 11.3410, lng: 77.7172 },
    'thindal': { lat: 11.3090, lng: 77.6750 },
    'perundurai': { lat: 11.2742, lng: 77.5805 },
    'surampatti': { lat: 11.3276, lng: 77.7262 }
  };

  for (const [city, coords] of Object.entries(cityMap)) {
    if (normalized.includes(city)) {
      // Simulate API latency
      await new Promise(r => setTimeout(r, 600));
      return coords;
    }
  }

  // If city not found, create a deterministic pseudorandom coordinate within India
  // India approx bounds: Lat 8 to 37, Lng 68 to 97
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = ((hash << 5) - hash) + normalized.charCodeAt(i);
    hash |= 0; 
  }
  
  // Normalize hash to 0-1
  const seed = Math.abs(hash) / 2147483647;
  
  const lat = 8 + (seed * (37 - 8));
  // Use a slightly different seed for lng
  const lngSeed = Math.abs((hash * 13) | 0) / 2147483647;
  const lng = 68 + (lngSeed * (97 - 68));

  await new Promise(r => setTimeout(r, 600));
  return { lat, lng };
}

// Driving distance using OSRM with fallback to Haversine * 1.3 (Detour Factor)
export async function calculateDrivingDistance(lat1: number, lon1: number, lat2: number, lon2: number): Promise<number> {
  try {
    const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`);
    const data = await res.json();
    if (data && data.routes && data.routes[0]) {
      return data.routes[0].distance / 1000; // OSRM returns meters
    }
  } catch(e) {
    console.warn("OSRM routing failed, falling back to straight line * 1.3");
  }
  return calculateDistance(lat1, lon1, lat2, lon2) * 1.3;
}
