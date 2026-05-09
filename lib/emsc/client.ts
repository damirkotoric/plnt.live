import { emscMessageSchema } from './types';
import type { MapEvent } from '@/lib/usgs/types';

const WS_URL = 'wss://www.seismicportal.eu/standing_order/websocket';
const MIN_MAG = 2.5;
const RECONNECT_DELAY_MS = 3000;

export type EmscHandlers = {
  onEvent: (event: MapEvent) => void;
};

export function connectEmsc(handlers: EmscHandlers): () => void {
  let ws: WebSocket | null = null;
  let closed = false;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  const open = () => {
    if (closed) return;
    ws = new WebSocket(WS_URL);

    ws.onmessage = (e) => {
      try {
        const parsed = emscMessageSchema.parse(JSON.parse(e.data));
        const p = parsed.data.properties;
        if (p.mag === null || p.mag < MIN_MAG) return;
        handlers.onEvent({
          id: p.source_id,
          time: new Date(p.time).toISOString(),
          magnitude: p.mag,
          depth_km: p.depth,
          latitude: p.lat,
          longitude: p.lon,
          place: p.flynn_region,
        });
      } catch {
        // ignore malformed messages
      }
    };

    ws.onclose = () => {
      if (closed) return;
      reconnectTimer = setTimeout(open, RECONNECT_DELAY_MS);
    };

    ws.onerror = () => {
      ws?.close();
    };
  };

  open();

  return () => {
    closed = true;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    ws?.close();
  };
}
