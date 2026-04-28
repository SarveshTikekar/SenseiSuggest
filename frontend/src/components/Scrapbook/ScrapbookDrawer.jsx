import React, { useState } from 'react';
import { motion as Motion, AnimatePresence, useDragControls } from 'framer-motion';
import { CaretUp, CaretDown, Notebook, PencilSimple as Pencil } from '@phosphor-icons/react';
import ScrapbookGrid from './ScrapbookGrid';

const ScrapbookDrawer = ({ photos, onUpload, onRemove, loading }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Drawer Overlay for Mobile/Tablet */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100]">
        <Motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={(e, info) => {
            if (info.offset.y < -50) setIsOpen(true);
            if (info.offset.y > 50) setIsOpen(false);
          }}
          animate={{ y: isOpen ? 0 : 'calc(100% - 60px)' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="bg-[#0D0D0D] border-t border-[#DD0426]/30 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Pull Handle / Header */}
          <div 
            className="flex flex-col items-center py-4 cursor-pointer relative"
            onClick={() => setIsOpen(!isOpen)}
          >
            {/* Spiral Rings (Scribble Pad Aesthetic) */}
            <div className="absolute -top-1 left-0 right-0 flex justify-around px-8 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="w-4 h-6 bg-gradient-to-b from-[#333] to-[#111] rounded-full border border-white/5 shadow-lg" />
              ))}
            </div>

            <div className="w-16 h-1.5 bg-[#DD0426] rounded-full mb-3 mt-2 animate-pulse shadow-[0_0_10px_rgba(221,4,38,0.5)]" />
            <div className="flex items-center gap-3">
              <Notebook size={20} weight="bold" className="text-[#DD0426]" />
              <Pencil size={18} weight="bold" className="text-[#DD0426]/60 -ml-1" />
              <span className="font-display text-sm tracking-widest uppercase text-[#F5EBE0]">
                Anime Scrapbook
              </span>
              {isOpen ? <CaretDown size={16} /> : <CaretUp size={16} />}
            </div>
          </div>

          {/* Content */}
          <div className="flex-grow overflow-y-auto px-4 pb-12 space-y-12">
            {Object.entries(
              photos.reduce((acc, p) => {
                const key = p.animeId || p.anime?.animeName || 'Personal';
                if (!acc[key]) acc[key] = { name: p.anime?.animeName || 'Memories', items: [] };
                acc[key].items.push(p);
                return acc;
              }, {})
            ).map(([key, group]) => (
              <div key={key} className="space-y-4">
                <div className="flex items-center gap-3 px-4">
                  <div className="w-1.5 h-6 bg-[#DD0426]" />
                  <h4 className="font-display text-sm text-[#F5EBE0] uppercase tracking-wider">{group.name}</h4>
                </div>
                <ScrapbookGrid 
                  photos={group.items} 
                  onUpload={onUpload} 
                  onRemove={onRemove} 
                  loading={loading} 
                />
              </div>
            ))}
          </div>
        </Motion.div>
      </div>

      {/* Standard Grid for Desktop */}
      <div className="hidden lg:block mt-20">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-px bg-[#DD0426]" />
          <h3 className="text-4xl font-display font-black text-[#F5EBE0] tracking-tight uppercase">
            Anime Scrapbook
          </h3>
        </div>
        <ScrapbookGrid 
          photos={photos} 
          onUpload={onUpload} 
          onRemove={onRemove} 
          loading={loading} 
        />
      </div>
    </>
  );
};

export default ScrapbookDrawer;
