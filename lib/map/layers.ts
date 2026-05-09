import type { LayerSpecification, SourceSpecification } from 'maplibre-gl';

export const STATIC_SOURCES: Record<string, SourceSpecification> = {
  plates: {
    type: 'geojson',
    data: '/data/plates.json',
  },
  faults: {
    type: 'geojson',
    data: '/data/faults.json',
  },
};

export function getStaticLayers(): LayerSpecification[] {
  const styles = getComputedStyle(document.documentElement);
  const plateColor = `hsl(${styles.getPropertyValue('--map-plate').trim()})`;
  const faultColor = `hsl(${styles.getPropertyValue('--map-fault').trim()})`;

  return [
    {
      id: 'plates-line',
      type: 'line',
      source: 'plates',
      paint: {
        'line-color': plateColor,
        'line-width': ['interpolate', ['linear'], ['zoom'], 0, 0.4, 6, 1.2],
        'line-opacity': 0.6,
      },
    },
    {
      id: 'faults-line',
      type: 'line',
      source: 'faults',
      minzoom: 4,
      paint: {
        'line-color': faultColor,
        'line-width': ['interpolate', ['linear'], ['zoom'], 4, 0.3, 10, 1],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 4, 0, 6, 0.7],
      },
    },
  ];
}
