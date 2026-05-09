'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl, { Map as MapLibreMap, MapOptions, GeoJSONSource } from 'maplibre-gl';
import { useTheme } from 'next-themes';
import { LIGHT_STYLE, DARK_STYLE } from '@/lib/map/styles';
import { STATIC_SOURCES, getStaticLayers, getQuakeLayer, getPulseLayer } from '@/lib/map/layers';
import { eventsToGeoJSON } from '@/lib/events/geojson';
import { getPulseEvents, pulsesToGeoJSON } from '@/lib/events/pulse';
import { fetchRecentEvents } from '@/lib/events/fetch';
import { getSupabasePublic } from '@/lib/supabase/public';
import { connectEmsc } from '@/lib/emsc/client';
import { LiveCounter } from '@/components/map/live-counter';
import { FilterControls } from '@/components/map/filter-controls';
import { EventDetail } from '@/components/map/event-detail';
import type { MapEvent } from '@/lib/usgs/types';
import type { Filters } from '@/lib/filters';
import 'maplibre-gl/dist/maplibre-gl.css';

type Props = {
  initialEvents: MapEvent[];
  initialFilters: Filters;
  initialCenter?: [number, number];
};

function getStyle(theme: string | undefined) {
  return theme === 'dark' ? DARK_STYLE : LIGHT_STYLE;
}

export function MapCanvas({ initialEvents, initialFilters, initialCenter = [0, 20] }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const eventsRef = useRef<MapEvent[]>(initialEvents);
  const [events, setEvents] = useState<MapEvent[]>(initialEvents);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const filtersRef = useRef<Filters>(initialFilters);
  const [selected, setSelected] = useState<MapEvent | null>(null);
  const [connected, setConnected] = useState(false);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Keep refs in sync
  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Refetch when filters change
  useEffect(() => {
    let cancelled = false;
    fetchRecentEvents(filters.hours, filters.minMag).then((rows) => {
      if (!cancelled) setEvents(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [filters.hours, filters.minMag]);

  // Init map once
  useEffect(() => {
    if (!mounted || !containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: getStyle(resolvedTheme),
      center: initialCenter,
      zoom: 3,
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

    map.on('click', 'quakes-circle', (e) => {
      const feature = e.features?.[0];
      if (!feature) return;
      const id = feature.properties?.id;
      const event = eventsRef.current.find((x) => x.id === id);
      if (event) setSelected(event);
    });

    map.on('mouseenter', 'quakes-circle', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'quakes-circle', () => {
      map.getCanvas().style.cursor = '';
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

  // Supabase realtime subscription
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
            const f = filtersRef.current;
            if (row.magnitude < f.minMag) return prev;
            const ageMs = Date.now() - new Date(row.time).getTime();
            if (ageMs > f.hours * 60 * 60 * 1000) return prev;
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
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // EMSC WebSocket for sub-5s event push
  useEffect(() => {
    const disconnect = connectEmsc({
      onEvent: (incoming) => {
        setEvents((prev) => {
          const f = filtersRef.current;
          if (incoming.magnitude < f.minMag) return prev;
          const ageMs = Date.now() - new Date(incoming.time).getTime();
          if (ageMs > f.hours * 60 * 60 * 1000) return prev;
          const idx = prev.findIndex((e) => e.id === incoming.id);
          if (idx === -1) return [incoming, ...prev];
          const next = [...prev];
          next[idx] = incoming;
          return next;
        });
      },
    });
    return disconnect;
  }, []);

  return (
    <>
      <div ref={containerRef} className="h-screen w-screen" />
      <div className="absolute top-3 left-3 right-16 sm:right-auto z-10">
        <LiveCounter events={events} connected={connected} />
      </div>
      <div className="absolute bottom-10 left-3 right-3 sm:left-auto sm:right-4 sm:bottom-10 z-10">
        <FilterControls filters={filters} onChange={setFilters} />
      </div>
      {events.length === 0 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <div className="rounded-lg bg-background/90 backdrop-blur border border-border px-4 py-3 text-sm text-center max-w-xs">
            No quakes match these filters.
            <br />
            <span className="text-muted-foreground text-xs">Try widening the time window or lowering the magnitude.</span>
          </div>
        </div>
      )}
      <EventDetail event={selected} onClose={() => setSelected(null)} />
    </>
  );
}
