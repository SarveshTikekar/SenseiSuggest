import React, { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { ImageSquare, Plus, Trash } from '@phosphor-icons/react';
import styles from './Scrapbook.module.css';

const PhotoItem = ({ photo, onRemove }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className={styles.photoFrameWrapper}
      onClick={() => setIsFlipped(!isFlipped)}
      onMouseEnter={() => window.innerWidth > 1024 && setIsFlipped(true)}
      onMouseLeave={() => window.innerWidth > 1024 && setIsFlipped(false)}
    >
      <Motion.div 
        className={styles.photoFrameInner}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, rotateY: isFlipped ? 180 : 0 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 25 }}
        style={{ willChange: 'transform' }}
      >
        {/* Front Side: Full Image */}
        <div className={styles.photoFront}>
          <div className={styles.washiTape}></div>
          <img src={photo.screenshotUrl} alt="" className={styles.fullImage} />
          
          <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center z-20">
            <button 
              onClick={(e) => { e.stopPropagation(); onRemove(photo.id); }}
              className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-colors shadow-lg"
            >
              <Trash size={24} />
            </button>
          </div>
        </div>

        {/* Back Side: Calligraphy Text & Date */}
        <div className={styles.photoBack}>
          <div className={styles.washiTape}></div>
          {photo.screenshotDescription ? (
            <p className={styles.calligraphyText}>{photo.screenshotDescription}</p>
          ) : (
            <p className={styles.calligraphyText} style={{ opacity: 0.5 }}>No caption provided.</p>
          )}
          {photo.created_at && (
            <span className={styles.createdAtDate}>
              {new Date(photo.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </Motion.div>
    </div>
  );
};

const UploadSlot = ({ onUpload, disabled }) => {
  const fileInputRef = React.useRef(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (disabled) return;
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div 
      className={`${styles.photoFrameWrapper} ${styles.emptySlot} ${isDragActive ? styles.dropzoneActive : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} flex flex-col`}
      style={{ padding: '12px', background: 'white', borderRadius: '4px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' }}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => !disabled && fileInputRef.current?.click()}
    >
      <div className={styles.washiTape} style={{ background: 'rgba(170,170,170,0.3)' }}></div>
      <input 
        type="file" 
        ref={fileInputRef}
        className="hidden" 
        accept="image/*" 
        onChange={handleChange}
        disabled={disabled}
      />
      
      {/* Made the Upload UI highly visible */}
      <div className="flex flex-col items-center justify-center p-4 bg-black/5 rounded-[2px] w-full h-full border border-dashed border-[#dd0426]/40 hover:bg-[#dd0426]/10 transition-colors">
        <Plus size={40} className="text-[#dd0426] mb-3" weight="bold" />
        <p className="text-center text-sm font-accent uppercase tracking-widest text-[#dd0426]">
          {disabled ? "Scrapbook Full" : "Click or Drag to Upload"}
        </p>
        <p className="text-center text-[10px] mt-2 opacity-60 font-accent uppercase tracking-widest text-black">
          Limit 6 per anime • Supports WebP/JPG/PNG
        </p>
      </div>
    </div>
  );
};

const ScrapbookGrid = ({ photos = [], onUpload, onRemove, loading }) => {
  const MAX_SLOTS = 6;
  const emptySlotsCount = Math.max(0, MAX_SLOTS - photos.length);
  
  return (
    <div className={styles.scrapbookContainer}>
      <div className={styles.parchmentBase}>
        <div className={styles.burntEdges}></div>
        
        <div className="p-8 text-center border-b border-[#dd0426]/20 mx-8">
           <h3 className="font-display text-3xl text-[#dd0426] tracking-widest uppercase">
             Cinematic Memories
           </h3>
           <p className="text-[#8b4513] mt-2 opacity-80 font-calligraphy text-4xl leading-none">
             Capture and preserve your favorite scenes.
           </p>
        </div>

        <div className={styles.scrapbookPage}>
          <AnimatePresence>
            {photos.map(photo => (
              <PhotoItem key={photo.id} photo={photo} onRemove={onRemove} />
            ))}
          </AnimatePresence>

          {/* Render empty slots */}
          {Array.from({ length: emptySlotsCount }).map((_, index) => (
            <UploadSlot 
              key={`empty-${index}`} 
              index={index}
              onUpload={onUpload} 
              disabled={loading || photos.length >= MAX_SLOTS} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScrapbookGrid;
