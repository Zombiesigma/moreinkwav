"use client";

import React from 'react';
import { useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc, query, orderBy } from 'firebase/firestore';
import { Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function GallerySection() {
  const db = useFirestore();
  const galleryQuery = useMemoFirebase(() => query(collection(db, 'photos'), orderBy('createdAt', 'desc')), [db]);
  const { data: photos, isLoading } = useCollection(galleryQuery);

  const profileRef = useMemoFirebase(() => doc(db, 'band_profile', 'mainProfile'), [db]);
  const { data: profile } = useDoc(profileRef);

  const stageVideo = profile?.stageVideoUrl;

  return (
    <section id="gallery" className="relative bg-black overflow-hidden">
      <div className="relative h-[70vh] md:h-[85vh] flex items-center overflow-hidden px-6 border-b border-white/5">
        <div className="scan-line" />
        
        <div className="absolute inset-0 z-0 bg-black">
          {stageVideo ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover grayscale brightness-[0.3] contrast-[1.4] transition-all duration-1000 animate-fade-in"
            >
              <source src={stageVideo} type="video/mp4" />
            </video>
          ) : (
             <div className="absolute inset-0 bg-black opacity-[0.03] z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-accent blur-[200px] rounded-full" />
             </div>
          )}
        </div>
        
        <div className="absolute inset-0 z-1 ink-gradient opacity-90" />
        
        <div className="max-w-7xl mx-auto w-full relative z-10 pt-20 md:pt-32">
          <div className="flex flex-col lg:flex-row items-baseline justify-between gap-10 animate-fade-in">
            <div className="relative">
              <h2 className="text-7xl sm:text-9xl md:text-[13rem] font-headline tracking-tighter text-glow leading-[0.8] stain-header accent-stain">
                {profile?.galleryTitle || "STAGE"}
              </h2>
            </div>
            <div className="lg:text-right max-w-sm">
               <div className="h-[2px] w-24 bg-accent mb-8 lg:ml-auto"></div>
               <p className="text-white/40 italic text-xl md:text-3xl font-body leading-relaxed">
                {profile?.gallerySubtitle || "Moments from the heart of the sound."}
               </p>
            </div>
          </div>
        </div>
      </div>

      <div className="py-24 md:py-48 px-6 relative z-10 max-w-7xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-40">
            <Loader2 className="animate-spin h-20 w-20 text-white/10" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12">
            {photos?.map((photo, idx) => {
              const isLarge = idx % 5 === 0;
              const isMedium = idx % 3 === 0 && !isLarge;

              return (
                <Link 
                  href={`/gallery/${photo.id}`}
                  key={photo.id} 
                  className={`relative overflow-hidden group bg-[#1E201E] border border-white/10 animate-fade-in
                    ${isLarge ? 'md:col-span-8 aspect-[16/9]' : isMedium ? 'md:col-span-6 aspect-square' : 'md:col-span-4 aspect-[4/5]'}
                  `}
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <img 
                    src={photo.imageUrl} 
                    alt={photo.title}
                    className="w-full h-full object-cover grayscale contrast-125 brightness-[0.4] transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-105 group-hover:brightness-100"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 flex flex-col justify-end p-8 md:p-14 backdrop-blur-[1px]">
                    <div className="translate-y-12 group-hover:translate-y-0 transition-transform duration-700 ease-out">
                      <h4 className="text-4xl md:text-6xl font-headline text-white leading-none uppercase mb-6 text-glow">{photo.title}</h4>
                      <div className="flex items-center gap-2 text-accent font-headline tracking-widest text-xs">
                        VIEW_GALLERY <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
            
            {(!photos || photos.length === 0) && (
              <div className="col-span-full flex flex-col items-center py-48 border-2 border-dashed border-white/5 opacity-10">
                <p className="font-headline text-4xl md:text-6xl uppercase tracking-[0.4em] text-center px-4">THE_STAGE_IS_EMPTY</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
