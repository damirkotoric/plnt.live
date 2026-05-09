import { z } from 'zod';

export const usgsFeatureSchema = z.object({
  type: z.literal('Feature'),
  id: z.string(),
  properties: z
    .object({
      mag: z.number().nullable(),
      place: z.string().nullable(),
      time: z.number(),
      type: z.string(),
      status: z.string().nullable(),
      tsunami: z.number(),
      felt: z.number().nullable(),
    })
    .passthrough(),
  geometry: z.object({
    type: z.literal('Point'),
    coordinates: z.tuple([z.number(), z.number(), z.number().nullable()]),
  }),
});

export const usgsFeedSchema = z.object({
  type: z.literal('FeatureCollection'),
  features: z.array(usgsFeatureSchema),
});

export type UsgsFeature = z.infer<typeof usgsFeatureSchema>;

export type MapEvent = {
  id: string;
  time: string;
  magnitude: number;
  depth_km: number | null;
  latitude: number;
  longitude: number;
  place: string | null;
};

export type EventRow = {
  id: string;
  time: string;
  magnitude: number;
  depth_km: number | null;
  latitude: number;
  longitude: number;
  place: string | null;
  type: string;
  status: string | null;
  tsunami: boolean;
  felt_count: number | null;
  raw: unknown;
};
