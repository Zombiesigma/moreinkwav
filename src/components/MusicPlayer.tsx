"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Play, ExternalLink, ChevronRight, ChevronLeft, Music as MusicIcon } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';

export function MusicSection() {
  const db = useFirestore();
  const albumsQuery = useMemoFirebase(() => query(collection(db, 'albums'), orderBy('releaseDate', 'desc')), [db]);
  const { data: albums, isLoading } = useCollection(albumsQuery);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth * 0.8;
      const scrollTo = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      scrollContainerRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (isLoading || !albums || albums.length === 0) return;

    const interval = setInterval(() => {
      if (!isPaused && scrollContainerRef.current) {
        const { scrollLeft, clientWidth, scrollWidth } = scrollContainerRef.current;
        const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 50;

        if (isAtEnd) {
          scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scroll('right');
        }
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [isPaused, isLoading, albums]);

  return (
    <section id="music" className="py-32 md:py-64 relative bg-black overflow-hidden border-t border-white/5">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.05]">
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-muted blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-accent blur-[150px] rounded-full opacity-30" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 px-6">
        <div className="mb-20 md:mb-40 flex flex-col lg:flex-row lg:items-end justify-between gap-12">
          <div className="animate-fade-in text-center lg:text-left">
            <h2 className="text-7xl sm:text-9xl md:text-[14rem] font-headline tracking-tighter text-glow leading-[0.75] stain-header warm-stain text-muted">SOUNDS</h2>
          </div>
          
          <div className="flex flex-col items-center lg:items-end gap-8">
            <p className="text-muted/60 italic text-lg md:text-2xl font-body max-w-xs text-center lg:text-right leading-relaxed">
              Material frequencies frozen in time.
            </p>
            <div className="flex gap-4">
               <Button 
                 variant="ghost" 
                 size="icon" 
                 onClick={() => scroll('left')}
                 className="h-16 w-16 rounded-none border border-white/10 hover:bg-muted hover:text-black transition-all group"
               >
                 <ChevronLeft size={32} className="group-hover:scale-110 transition-transform text-muted" />
               </Button>
               <Button 
                 variant="ghost" 
                 size="icon" 
                 onClick={() => scroll('right')}
                 className="h-16 w-16 rounded-none border border-white/10 hover:bg-muted hover:text-black transition-all group"
               >
                 <ChevronRight size={32} className="group-hover:scale-110 transition-transform text-muted" />
               </Button>
            </div>
          </div>
        </div>
      </div>

      <div 
        className="relative z-10 mt-12"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {isLoading ? (
          <div className="w-full flex justify-center py-40">
            <Loader2 className="animate-spin h-20 w-20 text-muted/5" />
          </div>
        ) : albums && albums.length > 0 ? (
          <div 
            ref={scrollContainerRef}
            className="flex gap-8 md:gap-20 overflow-x-auto no-scrollbar snap-x snap-mandatory px-6 md:px-24 pb-20"
          >
            {albums.map((album, idx) => (
              <div 
                key={album.id} 
                className="group relative flex-shrink-0 w-[88vw] sm:w-[55vw] md:w-[40vw] lg:w-[32vw] flex flex-col bg-[#1E201E] border border-white/5 overflow-hidden animate-fade-in snap-center hover:border-accent/40 transition-all duration-700 shadow-2xl"
                style={{ animationDelay: `${idx * 0.15}s` }}
              >
                <div className="relative aspect-square overflow-hidden bg-black">
                  <img 
                    src={album.coverArtUrl} 
                    alt={album.title}
                    className="w-full h-full object-cover grayscale contrast-[1.3] brightness-75 transition-all duration-1000 group-hover:grayscale-0 group-hover:brightness-100 group-hover:scale-110"
                  />
                  
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center backdrop-blur-md">
                    <Button 
                      asChild
                      variant="impact" 
                      size="xl" 
                      className="scale-90 group-hover:scale-100 transition-transform duration-500 h-20 md:h-24 px-12"
                    >
                      <a 
                        href={album.spotifyUrl || "#"} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-4"
                      >
                        LISTEN NOW <Play className="fill-current h-6 w-6" />
                      </a>
                    </Button>
                  </div>

                  <div className="absolute bottom-6 left-6 bg-muted text-black font-headline px-4 py-2 text-xs md:text-sm tracking-widest shadow-[6px_6px_0px_rgba(0,0,0,0.5)] z-20">
                    {album.releaseDate}
                  </div>
                </div>

                <div className="p-8 md:p-12 flex flex-col flex-grow relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5 text-muted">
                    <MusicIcon size={80} strokeWidth={1} />
                  </div>
                  
                  <h3 className="text-3xl md:text-5xl font-headline tracking-tight uppercase leading-none mb-6 group-hover:text-glow transition-all relative z-10 text-muted">
                    {album.title}
                  </h3>
                  
                  <div className="mt-auto pt-8 border-t border-white/5 flex justify-end items-center relative z-10">
                    <ExternalLink size={18} className="text-white/10 group-hover:text-accent transition-colors" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-6">
            <div className="w-full text-center py-40 md:py-60 border-2 border-dashed border-white/5 opacity-20">
              <h3 className="font-headline text-3xl md:text-5xl uppercase tracking-[0.4em] mb-6 text-muted">EMPTY_VOID</h3>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
