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
      <div className={`${styles['custom-scrollbar']} absolute inset-0 p-10 flex flex-col h-full z-10 overflow-y-auto`}>
        {children}
      </div>
    </div>
  );
});

const Cover = React.forwardRef(({ username, rank, profilePicture }, ref) => {
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
        
        {profilePicture && (
          <div className={styles.coverProfileFrame}>
            <img src={profilePicture} alt={username} className={styles.coverProfileImage} />
          </div>
        )}
        
        <div className={styles.kanjiVertical}>思い出のアルバム</div>
        
        <div className="flex flex-col items-center gap-1">
           <p className={styles.brandFooter}>SenseiSuggest<span>™</span></p>
           {rank && <p className={styles.userRank}>{rank} RANK</p>}
        </div>

        <div className={styles.waxSeal}></div>
      </div>
    </div>
  );
});

const FlipPhotoItem = ({ photo }) => {
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
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.7, type: "spring", stiffness: 80, damping: 20 }}
        style={{ willChange: 'transform' }}
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

const ScrapbookBook = ({ entries = [], username, rank, profilePicture }) => {
  const bookRef = useRef();

  // 1. Group and Prepare Entries
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

  // 2. Build a Flat Array of Pages to prevent react-pageflip crashes
  const pages = [];

  // Front Cover
  pages.push(<Cover key="cover-front" username={username} rank={rank} profilePicture={profilePicture} />);

  // Empty State Pages
  if (entries.length === 0) {
    pages.push(
      <Page key="empty-1">
        <div className="flex flex-col items-center justify-center h-full text-center p-6">
           <p className="font-display text-[#dd0426] text-xl uppercase tracking-widest mb-4">Blank Chronicle</p>
           <p className="font-hand text-[#8b4513]/60 text-lg leading-relaxed">
             Your journey is just beginning.<br/>Capture your first memories from any anime details page.
           </p>
        </div>
      </Page>
    );
    pages.push(
      <Page key="empty-2">
         <div className="flex flex-col items-center justify-center h-full opacity-30">
            <div className="w-40 h-px bg-[#dd0426] mb-6"></div>
            <p className="font-accent text-[9px] uppercase tracking-[0.4em] text-[#8b4513] text-center">
              Reserved for your<br/>future legends
            </p>
            <div className="w-40 h-px bg-[#dd0426] mt-6"></div>
         </div>
      </Page>
    );
  }

  // Anime Content Pages
  animeGroupKeys.forEach((key) => {
    const animeItems = groups[key].items;
    const itemsPerPage = 2;
    const pagesNeeded = Math.ceil(animeItems.length / itemsPerPage);
    
    for (let i = 0; i < pagesNeeded; i++) {
      const chunk = animeItems.slice(i * itemsPerPage, (i + 1) * itemsPerPage);
      pages.push(
        <Page key={`${key}-page-${i}`}>
          <div className="text-center mb-8 border-b border-[#dd0426]/30 pb-4">
            <h2 className="font-display text-lg font-black text-[#dd0426] tracking-[0.1em] uppercase px-4 leading-tight">
              {groups[key].name}
            </h2>
            <p className="text-[9px] font-accent uppercase tracking-widest opacity-40 mt-1">
              Collection — Part {i + 1}
            </p>
          </div>
          
          <div className="flex-grow space-y-10 flex flex-col items-center">
            {chunk.map((photo) => (
              <FlipPhotoItem key={photo.id || photo.screenshotUrl} photo={photo} />
            ))}
          </div>  
        </Page>
      );
    }
  });

  // Back Cover
  pages.push(<Cover key="cover-back" username={username} rank={rank} profilePicture={profilePicture} />);

  return (
    <div className="flex justify-center my-16 perspective-2000 relative">
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
        key={entries.length}
      >
        {pages}
      </HTMLFlipBook>
    </div>
  );
};

export default ScrapbookBook;
