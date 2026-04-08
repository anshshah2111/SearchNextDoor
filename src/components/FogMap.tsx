"use client";

import { useEffect, useRef, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { tileIdToBounds } from "@/lib/tiles";

// CartoDB dark matter tiles — free, no token needed
const DARK_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  name: "Dark Matter",
  sources: {
    carto: {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
        "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
        "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    },
  },
  layers: [
    {
      id: "carto-tiles",
      type: "raster",
      source: "carto",
      minzoom: 0,
      maxzoom: 20,
    },
  ],
};

// Heat map color gradient based on visit count
const HEAT_COLORS: [number, string, number][] = [
  // [minVisits, color, opacity]
  [1, "#7B68EE", 0.0],   // just revealed — no heat overlay
  [2, "#7B68EE", 0.15],  // faint lavender
  [4, "#00B4D8", 0.25],  // teal
  [7, "#52B788", 0.35],  // green
  [12, "#F4A261", 0.45], // golden
  [20, "#E76F51", 0.55], // amber hotspot
];

interface FogMapProps {
  heatMap: Record<string, number>; // { tileId: visitCount }
  currentPosition?: [number, number] | null; // [lat, lng]
  walkPath?: [number, number][]; // array of [lat, lng]
  center?: [number, number]; // [lng, lat] for maplibre
  zoom?: number;
  interactive?: boolean;
  className?: string;
}

export default function FogMap({
  heatMap,
  currentPosition,
  walkPath,
  center = [-122.3035, 47.6553], // UW campus [lng, lat]
  zoom = 14,
  interactive = true,
  className = "",
}: FogMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  // Build GeoJSON features for fog and heat layers
  const buildFeatures = useCallback(
    (tiles: Record<string, number>) => {
      // We need to generate fog tiles for the visible area
      // For revealed tiles, we show heat based on visit count
      // For unrevealed, we show dark fog

      const revealedFeatures: GeoJSON.Feature[] = [];

      for (const [tileId, visitCount] of Object.entries(tiles)) {
        const coords = tileIdToBounds(tileId);
        if (visitCount >= 1) {
          revealedFeatures.push({
            type: "Feature",
            properties: { visitCount, tileId },
            geometry: { type: "Polygon", coordinates: [coords] },
          });
        }
      }

      return { revealedFeatures };
    },
    []
  );

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: DARK_STYLE,
      center,
      zoom,
      minZoom: 10,
      maxZoom: 18,
      interactive,
      attributionControl: false,
    });

    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      "bottom-left"
    );

    map.on("load", () => {
      // Fog layer — dark semi-transparent overlay covering the whole world
      // This gets "punched through" by revealed tiles (using the heat layer on top)
      map.addSource("fog", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [-180, -85],
                [180, -85],
                [180, 85],
                [-180, 85],
                [-180, -85],
              ],
            ],
          },
        },
      });

      map.addLayer({
        id: "fog-layer",
        type: "fill",
        source: "fog",
        paint: {
          "fill-color": "#0a0a0a",
          "fill-opacity": 0.85,
        },
      });

      // Revealed tiles layer — punches holes in the fog
      map.addSource("revealed", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      // The "hole punch" — revealed tiles that clear the fog
      // We achieve this by drawing revealed tiles with the same dark color at 0 opacity
      // Actually, we need a different approach: draw the fog with holes
      // MapLibre doesn't support mask layers, so we'll use the revealed tiles
      // to draw OVER the fog with the base map visible
      // Best approach: remove fog from revealed areas by using a composite
      // Since we can't do true masking, we'll draw revealed tiles as "clear" patches
      // by matching the fog layer's behavior

      // Clear layer — draws over fog with transparent fill to "reveal" the map
      // We use a trick: we can't truly cut holes in the fog, but we can draw
      // the revealed tiles over the fog with very low opacity to make them visible
      map.addLayer({
        id: "revealed-clear",
        type: "fill",
        source: "revealed",
        paint: {
          "fill-color": "#0a0a0a",
          "fill-opacity": 0, // fully transparent — reveals the map underneath the fog
        },
      });

      // Heat glow layer — color overlay on revealed tiles based on visit count
      map.addSource("heat", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addLayer({
        id: "heat-layer",
        type: "fill",
        source: "heat",
        paint: {
          "fill-color": [
            "interpolate",
            ["linear"],
            ["get", "visitCount"],
            1, "#7B68EE",
            2, "#7B68EE",
            4, "#00B4D8",
            7, "#52B788",
            12, "#F4A261",
            20, "#E76F51",
          ],
          "fill-opacity": [
            "interpolate",
            ["linear"],
            ["get", "visitCount"],
            1, 0.05,
            2, 0.15,
            4, 0.25,
            7, 0.35,
            12, 0.45,
            20, 0.55,
          ],
        },
      });

      // Walk path line
      map.addSource("walk-path", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: [] },
        },
      });

      map.addLayer({
        id: "walk-path-line",
        type: "line",
        source: "walk-path",
        paint: {
          "line-color": "#F4A261",
          "line-width": 3,
          "line-opacity": 0.8,
        },
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
      });

      mapRef.current = map;

      // Initial update
      updateLayers(map, heatMap);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update layers when heatMap changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    updateLayers(map, heatMap);
  }, [heatMap]);

  // Update user position marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !currentPosition) return;

    const [lat, lng] = currentPosition;

    if (!markerRef.current) {
      // Create a glowing dot marker
      const el = document.createElement("div");
      el.className = "user-marker";
      el.style.cssText = `
        width: 16px;
        height: 16px;
        background: #F4A261;
        border: 3px solid #fff;
        border-radius: 50%;
        box-shadow: 0 0 12px rgba(244, 162, 97, 0.6);
      `;
      markerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(map);
    } else {
      markerRef.current.setLngLat([lng, lat]);
    }

    // Pan to user
    map.easeTo({ center: [lng, lat], duration: 500 });
  }, [currentPosition]);

  // Update walk path
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !walkPath || !map.getSource("walk-path")) return;

    const coords = walkPath.map(([lat, lng]) => [lng, lat]);
    (map.getSource("walk-path") as maplibregl.GeoJSONSource).setData({
      type: "Feature",
      properties: {},
      geometry: { type: "LineString", coordinates: coords },
    });
  }, [walkPath]);

  return <div ref={containerRef} className={`w-full h-full ${className}`} />;
}

/** Update the fog, revealed, and heat layers */
function updateLayers(
  map: maplibregl.Map,
  heatMap: Record<string, number>
) {
  const revealedFeatures: GeoJSON.Feature[] = [];

  for (const [tileId, visitCount] of Object.entries(heatMap)) {
    const coords = tileIdToBounds(tileId);
    revealedFeatures.push({
      type: "Feature",
      properties: { visitCount, tileId },
      geometry: { type: "Polygon", coordinates: [coords] },
    });
  }

  const fc: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: revealedFeatures,
  };

  // Build fog with holes for revealed tiles
  const fogWithHoles: GeoJSON.Feature = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates: [
        // Outer ring — the whole world
        [
          [-180, -85],
          [180, -85],
          [180, 85],
          [-180, 85],
          [-180, -85],
        ],
        // Inner rings — holes for each revealed tile
        ...revealedFeatures.map(
          (f) => (f.geometry as GeoJSON.Polygon).coordinates[0]
        ),
      ],
    },
  };

  const fogSource = map.getSource("fog") as maplibregl.GeoJSONSource;
  if (fogSource) fogSource.setData(fogWithHoles);

  const heatSource = map.getSource("heat") as maplibregl.GeoJSONSource;
  if (heatSource) heatSource.setData(fc);

  const revealedSource = map.getSource("revealed") as maplibregl.GeoJSONSource;
  if (revealedSource) revealedSource.setData(fc);
}
