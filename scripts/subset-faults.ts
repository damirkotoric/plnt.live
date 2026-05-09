import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

type FaultFeature = {
  type: 'Feature';
  properties: {
    name?: string | null;
    net_slip_rate?: string | null;
    slip_rate?: string | null;
    [key: string]: unknown;
  };
  geometry: unknown;
};

/** Parse GEM tuple format "(value,min,max)" → number or null */
function parseTuple(val: string | null | undefined): number | null {
  if (!val) return null;
  const match = val.match(/^\(([^,]*)/);
  if (!match || !match[1]) return null;
  const n = parseFloat(match[1]);
  return isNaN(n) ? null : n;
}

const inputPath = join(process.cwd(), 'public/data/faults-raw.json');
const outputPath = join(process.cwd(), 'public/data/faults.json');

const raw = JSON.parse(readFileSync(inputPath, 'utf-8'));
const features: FaultFeature[] = raw.features ?? [];

const filtered = features.filter((f) => {
  const slip = parseTuple(f.properties.net_slip_rate) ?? parseTuple(f.properties.slip_rate) ?? 0;
  const hasName = !!f.properties.name && String(f.properties.name).trim().length > 0;
  return slip >= 1 || hasName;
});

const output = {
  type: 'FeatureCollection',
  features: filtered.map((f) => ({
    type: 'Feature',
    properties: {
      name: f.properties.name ?? null,
      slip_rate: parseTuple(f.properties.net_slip_rate) ?? parseTuple(f.properties.slip_rate) ?? null,
    },
    geometry: f.geometry,
  })),
};

writeFileSync(outputPath, JSON.stringify(output));
console.log(`Subset: ${features.length} → ${filtered.length} faults`);
console.log(`Output size: ${(JSON.stringify(output).length / 1024 / 1024).toFixed(2)}MB`);
