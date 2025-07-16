/**
 * RainViewer API integration for animated radar maps
 * Based on the free RainViewer API: https://www.rainviewer.com/api.html
 */

interface RainViewerAPIResponse {
  radar: {
    past: RainViewerFrame[];
    nowcast: RainViewerFrame[];
  };
  host: string;
  version: string;
}

interface RainViewerFrame {
  time: number;
  path: string;
}

/**
 * Fetches the latest radar data from RainViewer API
 * @returns RainViewer API response with past and forecast frames
 */
export async function fetchRainViewerData(): Promise<RainViewerAPIResponse | null> {
  try {
    const response = await fetch('https://api.rainviewer.com/public/weather-maps.json');
    
    if (!response.ok) {
      throw new Error(`RainViewer API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching RainViewer data:', error);
    return null;
  }
}

/**
 * Creates a tile layer URL for a specific radar frame
 * @param host - RainViewer API host
 * @param path - Path to the radar frame
 * @param options - Options for the radar display
 * @returns URL for the tile layer
 */
export function getRainViewerTileUrl(
  host: string,
  path: string,
  options: {
    color?: number;
    smooth?: number;
    snow?: number;
    opacity?: number;
  } = {}
): string {
  const {
    color = 4,
    smooth = 1,
    snow = 1,
    opacity = 0.7
  } = options;
  
  return `https://${host}${path}/${color}/${smooth}_${snow}/${opacity}/{z}/{x}/{y}/256.png`;
}
