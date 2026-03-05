'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Loader2, ArrowLeft, Calendar, MapPin, Camera, Quote, Zap, Share2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * @fileOverview Halaman detail arsip panggung yang telah dibersihkan dari label log sistem.
 */
export default function StageDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const stageRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, 'photos', id as string);
  }, [db, id]);

  const { data: stage, isLoading } = useDoc(stageRef);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const progress = (scrollLeft / (scrollWidth - clientWidth)) * 100;
      setScrollProgress(progress);
    }
  };

  useEffect(() => {
    if (isLoading || !stage) return;

    const interval = setInterval(() => {
      if (!isPaused && scrollRef.current) {
        const { scrollLeft, clientWidth, scrollWidth } = scrollRef.current;
        const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 50;

        if (isAtEnd) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: clientWidth * 0.7, behavior: 'smooth' });
        }
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [isPaused, isLoading, stage]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="relative">
          <Loader2 className="h-20 w-20 animate-spin text-muted/10" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-3 w-3 bg-accent rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!stage) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="noise-overlay" />
        <h1 className="font-headline text-7xl mb-8 tracking-tighter">NOT_FOUND</h1>
        <Button onClick={() => router.push('/gallery')} variant="impact" size="xl">BACK_TO_GALLERY</Button>
      </div>
    );
  }

  const allPhotos = [stage.imageUrl, ...(stage.galleryImages || [])];

  return (
    <main className="min-h-screen bg-black text-white selection:bg-muted selection:text-black relative flex flex-col overflow-x-hidden industrial-grid">
      <Navigation />
      
      <section className="pt-32 md:pt-44 relative group/header">
        <div className="px-6 md:px-16 mb-8 md:mb-12 flex flex-col md:flex-row justify-between items-start md:items-end relative z-10 gap-6">
           <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl md:text-7xl font-headline tracking-[0.15em] text-muted leading-none uppercase">{stage.title}</h2>
           </div>
           
           <div className="w-full md:w-auto flex flex-col items-end gap-4">
              <div className="flex items-center gap-6 md:gap-10 text-[10px] uppercase tracking-[0.5em] text-white/30 font-black">
                <span className="flex items-center gap-2 cursor-default"><Camera size={14} /> {allPhotos.length} FRAMES</span>
              </div>
              <div className="w-full md:w-64 h-1 bg-white/5 relative mt-2 md:mt-4 overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-accent transition-all duration-300 ease-out"
                  style={{ width: `${scrollProgress}%` }}
                />
              </div>
           </div>
        </div>

        <div className="relative">
          <div 
            ref={scrollRef}
            onScroll={handleScroll}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory gap-4 md:gap-16 px-6 md:px-16 pb-12 md:pb-24 cursor-crosshair group/gallery scroll-smooth"
          >
            {allPhotos.map((url, idx) => (
              <div 
                key={idx} 
                className="flex-shrink-0 w-[92vw] md:w-[80vw] lg:w-[70vw] aspect-video bg-[#1E201E] border border-white/10 snap-center overflow-hidden relative shadow-[20px_20px_40px_rgba(0,0,0,0.8)] md:shadow-[40px_40px_80px_rgba(0,0,0,0.9)] transition-all duration-1000 group-hover/gallery:opacity-30 hover:!opacity-100 hover:scale-[1.015] group/photo"
              >
                <img 
                  src={url} 
                  className="w-full h-full object-cover grayscale contrast-125 brightness-90 transition-all duration-1000 group-hover/gallery:grayscale group-hover/gallery:brightness-[0.2] hover:!grayscale-0 hover:!brightness-100 group-hover/photo:scale-105" 
                  alt={`Stage Frame ${idx + 1}`}
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/photo:opacity-100 transition-opacity duration-500" />
                
                <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 text-right opacity-0 group-hover/photo:opacity-100 transition-all duration-700 translate-y-4 group-hover/photo:translate-y-0">
                   <div className="flex gap-2 md:gap-4 mb-4">
                      <Button variant="ghost" size="icon" className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-black/40 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 backdrop-blur-md">
                        <Maximize2 size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-black/40 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 backdrop-blur-md">
                        <Share2 size={16} />
                      </Button>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex-grow bg-[#000000] border-t border-white/5 relative">
        <div className="noise-overlay opacity-[0.03]" />
        
        <div className="px-6 md:px-16 max-w-[1600px] mx-auto py-12 md:py-48">
          <div className="grid lg:grid-cols-12 gap-12 md:gap-32">
            
            <div className="lg:col-span-8 space-y-12 md:space-y-20 animate-fade-in">
              <div className="relative inline-block group">
                <h1 className="text-5xl sm:text-8xl md:text-[12rem] font-headline tracking-tight text-glow-warm leading-[0.75] uppercase mb-8 md:mb-16 stain-header warm-stain">
                  {stage.title}
                </h1>
              </div>

              {stage.description ? (
                <div className="relative p-8 md:p-32 bg-[#1E201E] border border-white/10 shadow-[30px_30px_60px_rgba(0,0,0,0.8)] md:shadow-[60px_60px_120px_rgba(0,0,0,0.8)] group overflow-hidden transition-all duration-700 hover:border-accent/20">
                  <div className="absolute top-0 left-0 w-1 md:w-1.5 h-full bg-accent opacity-20 group-hover:opacity-100 transition-all duration-1000" />
                  <Quote className="absolute top-6 right-6 md:top-12 md:right-16 h-16 w-16 md:h-32 md:w-32 text-white/[0.03] -rotate-12 transition-transform duration-1000 group-hover:rotate-0 group-hover:scale-110" />
                  
                  <div className="space-y-8 md:space-y-12 relative z-10">
                    <p className="text-xl sm:text-3xl md:text-6xl font-body italic leading-[1.3] text-muted/90 font-light first-letter:text-7xl md:first-letter:text-9xl first-letter:font-headline first-letter:text-accent first-letter:mr-4 md:first-letter:mr-6 first-letter:float-left first-letter:mt-2 md:first-letter:mt-4">
                      {stage.description}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-20 md:py-32 border-4 border-dashed border-white/[0.03] flex items-center justify-center opacity-30 group hover:opacity-100 transition-opacity">
                   <p className="font-headline text-xl md:text-3xl tracking-[0.8em] text-white/20">NO_DESCRIPTION</p>
                </div>
              )}
            </div>

            <div className="lg:col-span-4 space-y-8 md:space-y-16 lg:pt-48 animate-fade-in [animation-delay:300ms]">
              <div className="p-8 md:p-12 bg-[#1E201E] border border-white/10 relative overflow-hidden group shadow-2xl transition-all duration-700 hover:border-white/20">
                <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-accent/5 blur-[80px] md:blur-[120px] rounded-full opacity-50 transition-opacity duration-1000 group-hover:opacity-100" />
                
                <div className="space-y-10 md:space-y-16 relative z-10">
                  <div className="space-y-4 md:space-y-6 pb-6 md:pb-10 border-b border-white/5">
                    <div className="text-[9px] uppercase tracking-[0.5em] text-accent font-black flex items-center gap-4">
                       <div className="w-4 h-px bg-accent" /> DATE
                    </div>
                    <div className="flex items-center gap-4 md:gap-6 text-muted group-hover:translate-x-3 transition-transform duration-700">
                      <Calendar size={20} className="text-accent/60 md:size-6" />
                      <span className="text-2xl md:text-4xl font-headline tracking-[0.1em]">{stage.date || 'NOT_SPECIFIED'}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4 md:space-y-6 pb-6 md:pb-10 border-b border-white/5">
                    <div className="text-[9px] uppercase tracking-[0.5em] text-accent font-black flex items-center gap-4">
                       <div className="w-4 h-px bg-accent" /> VENUE
                    </div>
                    <div className="flex items-center gap-4 md:gap-6 text-muted group-hover:translate-x-3 transition-transform duration-700">
                      <MapPin size={20} className="text-accent/60 md:size-6" />
                      <span className="text-2xl md:text-4xl font-headline tracking-[0.1em] uppercase truncate">{stage.venue || 'THE VOID'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 md:gap-12 pt-4 md:pt-6">
                     <div className="space-y-2 group/stat">
                        <p className="text-4xl md:text-5xl font-headline text-muted leading-none transition-all group-hover/stat:text-glow group-hover/stat:text-white">{allPhotos.length}</p>
                        <p className="text-[9px] uppercase tracking-[0.3em] text-white/30 font-black">PHOTOS</p>
                     </div>
                     <div className="flex items-end justify-end">
                        <Camera size={48} className="text-white/[0.02] group-hover:text-accent transition-all duration-1000 transform group-hover:rotate-12 group-hover:scale-110 md:size-16" strokeWidth={0.5} />
                     </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 md:gap-6">
                <Button 
                  onClick={() => router.push('/gallery')}
                  variant="impact" 
                  size="xl"
                  className="w-full h-20 md:h-24 flex items-center justify-between px-8 md:px-12 group"
                >
                  <span className="text-lg md:text-xl font-headline uppercase tracking-[0.3em]">BACK_TO_LIST</span>
                  <ArrowLeft size={20} className="group-hover:-translate-x-4 transition-transform duration-500 md:size-6" />
                </Button>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
