import React, { useEffect, useRef, useState } from 'react';
import { CaretDown, Check, Funnel, X } from '@phosphor-icons/react';

const toggleValue = (values, value) => (
  values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value]
);

function FilterMenu({ label, options = [], selected = [], onChange }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const count = selected.length;

  useEffect(() => {
    const handleClickAway = (event) => {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    };

    document.addEventListener('mousedown', handleClickAway);
    return () => document.removeEventListener('mousedown', handleClickAway);
  }, []);

  return (
    <div className="relative w-full sm:w-auto" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`h-9 w-full sm:w-[150px] inline-flex items-center justify-between gap-2 rounded-xl border px-2.5 text-[10px] font-accent uppercase tracking-widest transition-all ${
          count
            ? 'bg-[#FF1F44]/10 border-[#FF1F44]/30 text-[#FF1F44] shadow-[0_0_14px_rgba(255,31,68,0.08)]'
            : 'bg-[#111] border-white/10 text-[#AAAAAA] hover:bg-white/5 hover:text-[#F5EBE0]'
        }`}
      >
        <span className="truncate">{count ? `${label} (${count})` : label}</span>
        <CaretDown
          size={13}
          weight="bold"
          className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-full min-w-[200px] overflow-hidden rounded-xl border border-white/10 bg-[#0D0D0D] shadow-[0_14px_40px_rgba(0,0,0,0.55)]">
          <div className="max-h-56 overflow-y-auto p-1.5">
            {options.length === 0 ? (
              <div className="px-3 py-3 text-[10px] font-accent uppercase tracking-widest text-[#AAAAAA]/60">
                No options
              </div>
            ) : (
              options.map((option) => {
                const value = String(option);
                const checked = selected.includes(value);

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onChange(toggleValue(selected, value))}
                    className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[10px] font-accent uppercase tracking-wider transition-colors ${
                      checked
                        ? 'bg-[#FF1F44]/12 text-[#F5EBE0]'
                        : 'text-[#AAAAAA] hover:bg-white/[0.05] hover:text-[#F5EBE0]'
                    }`}
                  >
                    <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${
                      checked ? 'border-[#FF1F44] bg-[#FF1F44]' : 'border-white/15 bg-white/[0.03]'
                    }`}>
                      {checked && <Check size={10} weight="bold" className="text-white" />}
                    </span>
                    <span className="truncate">{value}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AnimeFilterBar({
  selectedYears,
  setSelectedYears,
  selectedStudios,
  setSelectedStudios,
  releaseYears = [],
  studios = [],
  onClear,
}) {
  const hasActive = selectedYears.length > 0 || selectedStudios.length > 0;

  return (
    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
      
      <div className="grid w-full grid-cols-1 gap-3 sm:flex sm:w-auto sm:items-center">
        <FilterMenu
          label="Year"
          options={releaseYears}
          selected={selectedYears}
          onChange={setSelectedYears}
        />
        <FilterMenu
          label="Studio"
          options={studios}
          selected={selectedStudios}
          onChange={setSelectedStudios}
        />
        {hasActive && (
          <button
            type="button"
            onClick={onClear}
            className="h-9 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-[10px] font-accent uppercase tracking-widest text-[#F5EBE0] transition-colors hover:bg-white/[0.08] sm:w-9"
            aria-label="Clear filters"
          >
            <X size={13} weight="bold" className="mx-auto" />
          </button>
        )}
      </div>
    </div>
  );
}

export default AnimeFilterBar;
