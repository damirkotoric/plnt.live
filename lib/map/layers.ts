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

export function getQuakeLayer(): LayerSpecification {
  const styles = getComputedStyle(document.documentElement);
  const fresh = `hsl(${styles.getPropertyValue('--quake-fresh').trim()})`;
  const recent = `hsl(${styles.getPropertyValue('--quake-recent').trim()})`;
  const older = `hsl(${styles.getPropertyValue('--quake-older').trim()})`;

  return {
    id: 'quakes-circle',
    type: 'circle',
    source: 'quakes',
    paint: {
      'circle-radius': [
        'interpolate', ['linear'], ['get', 'magnitude'],
        2.5, 3,
        5, 7,
        7, 16,
        9, 28,
      ],
      'circle-color': [
        'interpolate', ['linear'], ['get', 'ageMinutes'],
        0, fresh,
        60, recent,
        360, older,
        1440, older,
      ],
      'circle-opacity': [
        'interpolate', ['linear'], ['get', 'ageMinutes'],
        0, 0.95,
        1440, 0.55,
      ],
      'circle-stroke-width': 1,
      'circle-stroke-color': 'hsl(0 0% 100% / 0.4)',
    },
  };
}

export function getPulseLayer(): LayerSpecification {
  const styles = getComputedStyle(document.documentElement);
  const fresh = `hsl(${styles.getPropertyValue('--quake-fresh').trim()})`;

  return {
    id: 'quakes-pulse',
    type: 'circle',
    source: 'pulses',
    paint: {
      'circle-radius': ['*', ['get', 'baseRadius'], ['get', 'pulseScale']],
      'circle-color': fresh,
      'circle-opacity': ['get', 'pulseOpacity'],
      'circle-stroke-width': 0,
    },
  };
}
