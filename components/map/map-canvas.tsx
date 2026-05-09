'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl, { Map as MapLibreMap, MapOptions } from 'maplibre-gl';
import { useTheme } from 'next-themes';
import { LIGHT_STYLE, DARK_STYLE } from '@/lib/map/styles';
import 'maplibre-gl/dist/maplibre-gl.css';

function getStyle(theme: string | undefined) {
  return theme === 'dark' ? DARK_STYLE : LIGHT_STYLE;
}

export function MapCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: getStyle(resolvedTheme),
      center: [0, 20],
      zoom: 1.5,
      attributionControl: { compact: true },
    } as MapOptions);

    map.on('load', () => {
      map.setProjection({ type: 'globe' });
    });

    map.addControl(
      new maplibregl.NavigationControl({ visualizePitch: false }),
      'bottom-left'
    );

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [mounted]);

  useEffect(() => {
    if (!mapRef.current) return;
    const style = getStyle(resolvedTheme);
    mapRef.current.setStyle(style);
    mapRef.current.once('style.load', () => {
      mapRef.current?.setProjection({ type: 'globe' });
    });
  }, [resolvedTheme]);

  return <div ref={containerRef} className="h-screen w-screen" />;
}
