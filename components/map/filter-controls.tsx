'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { Sliders } from '@phosphor-icons/react';
import { TIME_WINDOWS, MAG_THRESHOLDS, type Filters } from '@/lib/filters';
import { cn } from '@/lib/utils';

type Props = { filters: Filters; onChange: (next: Filters) => void };

export function FilterControls({ filters, onChange }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const update = (next: Filters) => {
    onChange(next);
    const sp = new URLSearchParams(params);
    sp.set('hours', String(next.hours));
    sp.set('mag', String(next.minMag));
    startTransition(() => {
      router.replace(`?${sp.toString()}`, { scroll: false });
    });
  };

  const currentTimeLabel = TIME_WINDOWS.find((t) => t.hours === filters.hours)?.label ?? '24h';
  const currentMagLabel = MAG_THRESHOLDS.find((m) => m.value === filters.minMag)?.label ?? 'M2.5+';

  return (
    <div className="rounded-lg bg-background/80 backdrop-blur border border-border">
      {/* Mobile collapsed trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex sm:hidden items-center gap-2 px-3 py-2 text-xs"
      >
        <Sliders size={14} />
        <span className="font-medium">{currentTimeLabel} · {currentMagLabel}</span>
      </button>

      {/* Expanded panel — always shown on sm+, toggled on mobile */}
      <div className={cn('flex-col gap-2 p-2', open ? 'flex' : 'hidden sm:flex')}>
        <SegmentedGroup
          options={TIME_WINDOWS.map((t) => ({ label: t.label, value: t.hours }))}
          value={filters.hours}
          onChange={(v) => update({ ...filters, hours: v })}
        />
        <SegmentedGroup
          options={MAG_THRESHOLDS.map((m) => ({ label: m.label, value: m.value }))}
          value={filters.minMag}
          onChange={(v) => update({ ...filters, minMag: v })}
        />
      </div>
    </div>
  );
}

function SegmentedGroup<T extends number>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'px-2.5 py-1.5 text-xs rounded-md transition-colors min-w-[44px]',
            value === o.value
              ? 'bg-foreground text-background'
              : 'text-muted-foreground hover:bg-muted active:bg-muted'
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
