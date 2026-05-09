export const TIME_WINDOWS = [
  { label: '1h', hours: 1 },
  { label: '6h', hours: 6 },
  { label: '24h', hours: 24 },
  { label: '7d', hours: 168 },
] as const;

export const MAG_THRESHOLDS = [
  { label: 'M2.5+', value: 2.5 },
  { label: 'M4.5+', value: 4.5 },
  { label: 'M6+', value: 6 },
] as const;

export const DEFAULT_HOURS = 24;
export const DEFAULT_MAG = 2.5;

export type Filters = { hours: number; minMag: number };

export function parseFilters(searchParams: { hours?: string; mag?: string }): Filters {
  const validHours = TIME_WINDOWS.map((t) => t.hours) as readonly number[];
  const validMags = MAG_THRESHOLDS.map((m) => m.value) as readonly number[];

  const hours = searchParams.hours ? Number(searchParams.hours) : DEFAULT_HOURS;
  const minMag = searchParams.mag ? Number(searchParams.mag) : DEFAULT_MAG;

  return {
    hours: validHours.includes(hours) ? hours : DEFAULT_HOURS,
    minMag: validMags.includes(minMag) ? minMag : DEFAULT_MAG,
  };
}
