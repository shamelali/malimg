export type UserPosition = {
  latitude: number;
  longitude: number;
  accuracy?: number;
  source: 'native' | 'browser' | 'demo';
};

type CapacitorWindow = Window & {
  Capacitor?: {
    isNativePlatform?: () => boolean;
  };
};

export async function getUserPosition(): Promise<UserPosition> {
  if (typeof window !== 'undefined' && (window as CapacitorWindow).Capacitor?.isNativePlatform?.()) {
    try {
      const { Geolocation } = await import('@capacitor/geolocation');
      const permissions = await Geolocation.checkPermissions();
      if (permissions.location !== 'granted') {
        const request = await Geolocation.requestPermissions();
        if (request.location === 'denied') throw new Error('Location permission denied');
      }
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 6000
      });
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy ?? undefined,
        source: 'native'
      };
    } catch {
      // Fall through to browser/demo behavior.
    }
  }

  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    return new Promise<UserPosition>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy ?? undefined,
            source: 'browser'
          });
        },
        () => resolve({ latitude: 2.02509, longitude: 103.34437, source: 'demo' }),
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 30_000 }
      );
    });
  }

  return { latitude: 2.02509, longitude: 103.34437, source: 'demo' };
}
