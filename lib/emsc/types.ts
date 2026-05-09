import { z } from 'zod';

export const emscMessageSchema = z.object({
  action: z.enum(['create', 'update']),
  data: z.object({
    id: z.string(),
    properties: z
      .object({
        source_id: z.string(),
        time: z.string(),
        lat: z.number(),
        lon: z.number(),
        depth: z.number().nullable(),
        mag: z.number().nullable(),
        flynn_region: z.string().nullable(),
      })
      .passthrough(),
  }),
});

export type EmscMessage = z.infer<typeof emscMessageSchema>;
