import React, { useRef, useState } from 'react';
import HTMLFlipBook from 'react-pageflip';
import styles from './Scrapbook.module.css';
import { motion as Motion } from 'framer-motion';

const Page = React.forwardRef(({ children }, ref) => {
  return (
    <div className={styles.parchmentBase} ref={ref} data-density="soft" style={{ 
      height: '100%',
      boxShadow: 'inset 0 0 30px rgba(0,0,0,0.1), 5px 0 0 #dccfb2' 
    }}>
      <div className={styles.burntEdges}></div>
      <div className="absolute inset-0 p-10 flex flex-col h-full z-10">
        {children}
      </div>
    </div>
  );
});

const Cover = React.forwardRef(({ username, rank }, ref) => {
  return (
    <div className={styles.scrapbookCover} ref={ref} data-density="hard" style={{
       boxShadow: 'inset 0 0 100px rgba(0,0,0,0.9), 5px 0 0 #dccfb2'
    }}>
      <div className={styles.coverFrame}>
        <div className={`${styles.corner} ${styles.cornerTL}`}></div>
        <div className={`${styles.corner} ${styles.cornerTR}`}></div>
        <div className={`${styles.corner} ${styles.cornerBL}`}></div>
        <div className={`${styles.corner} ${styles.cornerBR}`}></div>
        


        <div className="flex flex-col items-center">
           <h1 className={styles.coverTitle}>Scrapbook</h1>
           <p className={styles.ownerName}>{username || 'THE VOYAGER'}</p>
        </div>
        
        <div className={styles.kanjiVertical}>思い出のアルバム</div>
        
        <div className="flex flex-col items-center gap-1">
           <p className={styles.brandFooter}>SenseiSuggest<span>™</span></p>
           {rank && <p className={styles.userRank}>{rank} RANK</p>}
        </div>

        <div className={styles.waxSeal}>
           <span className="opacity-70 text-[8px] tracking-tighter">HANKO</span>
        </div>
      </div>
    </div>
  );
});

const FlipPhotoItem = ({ photo }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className={styles.photoFrameWrapper}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <Motion.div 
        className={styles.photoFrameInner}
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100, damping: 20 }}
      >
        <div className={styles.photoFront}>
          <div className={styles.washiTape}></div>
          <img src={photo.screenshotUrl} alt="" className={styles.fullImage} />
        </div>

        <div className={styles.photoBack}>
          <div className={styles.washiTape}></div>
          {photo.screenshotDescription ? (
            <p className={styles.calligraphyText}>{photo.screenshotDescription}</p>
          ) : (
            <p className={styles.calligraphyText} style={{ opacity: 0.3 }}>Empty Page...</p>
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

const ScrapbookBook = ({ entries = [], username, rank }) => {
  const bookRef = useRef();

  const groups = entries.reduce((acc, entry) => {
    const key = entry.animeId || entry.anime?.animeName || 'Unknown';
    if (!acc[key]) {
      acc[key] = {
        name: entry.anime?.animeName || `Anime #${entry.animeId}`,
        items: []
      };
    }
    acc[key].items.push(entry);
    return acc;
  }, {});

  const animeGroupKeys = Object.keys(groups);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
         <div className="w-72 h-96 bg-[#111] rounded-sm border border-white/5 flex flex-col items-center justify-center shadow-2xl relative">
            <div className="absolute inset-4 border border-[#dd0426]/20"></div>
            <p className="text-[#dd0426] font-display font-black text-xl mb-4 tracking-widest uppercase">Empty Journal</p>
            <p className="text-[#dccfb2] opacity-40 font-mono text-center px-8 text-xs leading-loose">
               No memories have been recorded yet. Visit an Anime page to begin your chronicle.
            </p>
         </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center my-16 perspective-2000 relative">
      {/* Physical Spiral Spine Overlay */}
      <div className={styles.physicalSpine}>
        {[...Array(18)].map((_, i) => (
          <div key={i} className={styles.spiralRing}></div>
        ))}
      </div>

      <HTMLFlipBook 
        width={550} 
        height={750} 
        size="fixed"
        minWidth={450}
        maxWidth={700}
        minHeight={650}
        maxHeight={900}
        maxShadowOpacity={0.8}
        showCover={true}
        mobileScrollSupport={true}
        flippingTime={1000}
        usePortrait={false}
        startZIndex={0}
        autoSize={true}
        ref={bookRef}
        className="shadow-2xl mx-auto transform -translate-x-[10px]"
      >
        <Cover username={username} rank={rank}>Scrapbook Cover</Cover>

        {animeGroupKeys.map((key, index) => (
          <Page key={key}>
            <div className="text-center mb-6 border-b border-[#dd0426]/30 pb-4">
              <h2 className="font-display text-lg font-black text-[#dd0426] tracking-[0.1em] uppercase px-4 leading-tight">
                {groups[key].name}
              </h2>
            </div>
            
            <div className="flex-grow overflow-y-auto pr-6 space-y-12 custom-scrollbar">
              {groups[key].items.slice(0, 6).map((photo) => (
                <FlipPhotoItem key={photo.id || photo.screenshotUrl} photo={photo} />
              ))}
            </div>
            
            <div className="absolute bottom-6 left-0 right-0 text-center font-mono text-[10px] text-[#8b4513]/40 tracking-widest uppercase">
              Chronicle Page {index + 1}
            </div>
          </Page>
        ))}
        
        <Cover username={username} rank={rank}>Back Cover</Cover>
      </HTMLFlipBook>
    </div>
  );
};

export default ScrapbookBook;
