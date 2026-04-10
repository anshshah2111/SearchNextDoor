/**
 * Tile math for the fog/heat map.
 * Uses slippy map tile coordinates at zoom 16 (~100m grid cells).
 */

const TILE_ZOOM = 16;

/** Convert lat/lng to a tile ID string like "16/10508/22873" */
export function latLngToTileId(lat: number, lng: number): string {
  const n = Math.pow(2, TILE_ZOOM);
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  return `${TILE_ZOOM}/${x}/${y}`;
}

/** Convert a tile ID back to its bounding box as a GeoJSON polygon coordinate ring */
export function tileIdToBounds(
  tileId: string
): [number, number][] {
  const [, xStr, yStr] = tileId.split("/");
  const x = parseInt(xStr, 10);
  const y = parseInt(yStr, 10);
  const n = Math.pow(2, TILE_ZOOM);

  const lngW = (x / n) * 360 - 180;
  const lngE = ((x + 1) / n) * 360 - 180;
  const latN = tileToLat(y, n);
  const latS = tileToLat(y + 1, n);

  // Return as [lng, lat] pairs (GeoJSON format), closed ring
  return [
    [lngW, latN],
    [lngE, latN],
    [lngE, latS],
    [lngW, latS],
    [lngW, latN],
  ];
}

function tileToLat(y: number, n: number): number {
  const latRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n)));
  return (latRad * 180) / Math.PI;
}

/** Get the center point of a tile */
export function tileIdToCenter(tileId: string): [number, number] {
  const bounds = tileIdToBounds(tileId);
  const lngCenter = (bounds[0][0] + bounds[1][0]) / 2;
  const latCenter = (bounds[0][1] + bounds[2][1]) / 2;
  return [lngCenter, latCenter];
}

/** Generate tile IDs in a radius around a center point */
export function getTilesInRadius(
  centerLat: number,
  centerLng: number,
  radiusMeters: number
): string[] {
  const tiles: string[] = [];
  // Approximate degrees per meter at this latitude
  const latDeg = radiusMeters / 111320;
  const lngDeg = radiusMeters / (111320 * Math.cos((centerLat * Math.PI) / 180));

  const minLat = centerLat - latDeg;
  const maxLat = centerLat + latDeg;
  const minLng = centerLng - lngDeg;
  const maxLng = centerLng + lngDeg;

  // Step through the grid
  const step = 0.001; // ~100m
  for (let lat = minLat; lat <= maxLat; lat += step) {
    for (let lng = minLng; lng <= maxLng; lng += step) {
      const id = latLngToTileId(lat, lng);
      if (!tiles.includes(id)) {
        tiles.push(id);
      }
    }
  }
  return tiles;
}

export { TILE_ZOOM };
