'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl, { Map as MapLibreMap, MapOptions, GeoJSONSource } from 'maplibre-gl';
import { useTheme } from 'next-themes';
import { LIGHT_STYLE, DARK_STYLE } from '@/lib/map/styles';
import { STATIC_SOURCES, getStaticLayers, getQuakeLayer, getPulseLayer } from '@/lib/map/layers';
import { eventsToGeoJSON } from '@/lib/events/geojson';
import { getPulseEvents, pulsesToGeoJSON } from '@/lib/events/pulse';
import { getSupabasePublic } from '@/lib/supabase/public';
import { LiveCounter } from '@/components/map/live-counter';
import type { MapEvent } from '@/lib/usgs/types';
import 'maplibre-gl/dist/maplibre-gl.css';

type Props = { initialEvents: MapEvent[] };

function getStyle(theme: string | undefined) {
  return theme === 'dark' ? DARK_STYLE : LIGHT_STYLE;
}

export function MapCanvas({ initialEvents }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const eventsRef = useRef<MapEvent[]>(initialEvents);
  const [events, setEvents] = useState<MapEvent[]>(initialEvents);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Keep ref in sync for style.load closure
  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Init map once
  useEffect(() => {
    if (!mounted || !containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: getStyle(resolvedTheme),
      center: [0, 20],
      zoom: 1.5,
      attributionControl: { compact: true },
    } as MapOptions);

    map.on('style.load', () => {
      map.setProjection({ type: 'globe' });

      // Static sources
      for (const [id, source] of Object.entries(STATIC_SOURCES)) {
        if (!map.getSource(id)) map.addSource(id, source);
      }

      // Quake + pulse sources
      if (!map.getSource('quakes')) {
        map.addSource('quakes', {
          type: 'geojson',
          data: eventsToGeoJSON(eventsRef.current),
        });
      }
      if (!map.getSource('pulses')) {
        map.addSource('pulses', {
          type: 'geojson',
          data: pulsesToGeoJSON([], 0),
        });
      }

      // Static layers
      for (const layer of getStaticLayers()) {
        if (!map.getLayer(layer.id)) map.addLayer(layer);
      }

      // Pulse layer (below quake dots)
      const pulseLayer = getPulseLayer();
      if (!map.getLayer(pulseLayer.id)) map.addLayer(pulseLayer);

      // Quake layer (on top)
      const quakeLayer = getQuakeLayer();
      if (!map.getLayer(quakeLayer.id)) map.addLayer(quakeLayer);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // Theme change → swap style (style.load handler re-adds layers)
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setStyle(getStyle(resolvedTheme));
  }, [resolvedTheme]);

  // Update quake source whenever events change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const src = map.getSource('quakes') as GeoJSONSource | undefined;
    if (src) src.setData(eventsToGeoJSON(events));
  }, [events]);

  // Pulse animation loop
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    let raf = 0;
    const PERIOD_MS = 2000;
    const start = performance.now();

    const tick = (now: number) => {
      const t = ((now - start) % PERIOD_MS) / PERIOD_MS;
      const src = map.getSource('pulses') as GeoJSONSource | undefined;
      if (src) {
        src.setData(pulsesToGeoJSON(getPulseEvents(eventsRef.current), t));
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mounted]);

  // Realtime subscription
  useEffect(() => {
    const supabase = getSupabasePublic();
    const channel = supabase
      .channel('events-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'events' },
        (payload) => {
          const row = payload.new as MapEvent;
          setEvents((prev) => {
            if (prev.some((e) => e.id === row.id)) return prev;
            return [row, ...prev];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'events' },
        (payload) => {
          const row = payload.new as MapEvent;
          setEvents((prev) => prev.map((e) => (e.id === row.id ? row : e)));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <>
      <div ref={containerRef} className="h-screen w-screen" />
      <div className="absolute top-4 left-4 z-10">
        <LiveCounter events={events} />
      </div>
    </>
  );
}
