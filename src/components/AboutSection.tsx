"use client";

import React from 'react';
import { User, Quote, History } from 'lucide-react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';

export function AboutSection() {
  const db = useFirestore();
  const profileRef = useMemoFirebase(() => doc(db, 'band_profile', 'mainProfile'), [db]);
  const { data: profile } = useDoc(profileRef);

  const heroVideo = profile?.heroVideoUrl;

  const defaultMembers = [
    { name: 'BINTANG', role: 'VOCALS & GUITAR', photoUrl: '' },
    { name: 'MURING LVIRO', role: 'GUITAR', photoUrl: '' },
    { name: 'ILHAN BARIEF', role: 'BASS', photoUrl: '' },
    { name: 'DON ZAPATA', role: 'DRUMS', photoUrl: '' },
  ];

  const members = profile?.members && profile.members.length > 0 ? profile.members : defaultMembers;

  return (
    <section id="about" className="relative bg-black overflow-hidden">
      <div className="relative h-[70vh] md:h-[85vh] flex items-center overflow-hidden px-6 border-b border-white/5">
        <div className="scan-line" />
        
        <div className="absolute inset-0 z-0 bg-black">
          {heroVideo && (
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover grayscale brightness-[0.3] contrast-[1.4] transition-all duration-1000 animate-fade-in"
            >
              <source src={heroVideo} type="video/mp4" />
            </video>
          )}
        </div>
        
        <div className="absolute inset-0 z-1 ink-gradient opacity-90" />
        
        <div className="max-w-7xl mx-auto w-full relative z-10 pt-20 md:pt-32">
          <div className="flex flex-col border-l-2 border-muted/20 pl-8 md:pl-16 animate-fade-in">
             <h2 className="text-7xl sm:text-9xl md:text-[15rem] font-headline tracking-tighter text-glow-warm leading-[0.8] mb-8 text-muted">
               THE <span className="text-white">SOUL</span>
             </h2>
             <p className="text-muted/60 text-lg md:text-3xl italic font-body max-w-2xl leading-relaxed">
               Beyond the ink, there is a frequency. Born from the heart of Ciputat.
             </p>
          </div>
        </div>
      </div>

      <div className="py-24 md:py-48 px-6 relative z-10 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-16 md:gap-32 items-start mb-32 md:mb-64">
          <div className="lg:col-span-7 space-y-12 md:space-y-20 animate-fade-in">
            <div className="space-y-8">
               <div className="text-xl md:text-4xl font-body leading-[1.6] text-muted italic font-light">
                 {profile?.biography || `Formed in 2023, More Ink. emerged as a raw response to the silence of the modern world. We don't just play sounds; we craft vibrations that sink deep into the soul.`}
               </div>
            </div>

            <div className="p-8 md:p-16 bg-[#1E201E] border border-white/5 relative group overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-1 h-full bg-muted opacity-20 group-hover:opacity-100 transition-opacity" />
              <Quote className="text-muted/10 absolute top-8 right-8 h-20 w-20 md:h-32 md:w-32 rotate-12" />
              <p className="text-xl md:text-3xl font-headline tracking-widest text-muted leading-relaxed relative z-10">
                "We are the ink on a blank page. Unfiltered, permanent, and original."
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-12 animate-fade-in [animation-delay:400ms]">
            <div className="grid gap-8">
              <div className="p-10 border border-white/5 bg-white/[0.02] flex flex-col gap-4">
                 <span className="text-4xl md:text-6xl font-headline tracking-tighter text-muted">EST. MMXXIII</span>
              </div>
              <div className="p-10 border border-white/5 bg-white/[0.02] flex flex-col gap-4">
                 <span className="text-4xl md:text-6xl font-headline tracking-tighter text-muted">CIPUTAT, ID</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-24 md:pt-48 border-t border-white/5">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-32 gap-8">
            <h3 className="text-5xl md:text-8xl font-headline tracking-tighter leading-none">THE <span className="text-muted">BEINGS</span></h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {members.map((member: any, idx: number) => (
              <div 
                key={member.name} 
                className="group relative flex flex-col bg-[#1E201E] border border-white/5 animate-fade-in hover:border-muted/30 transition-all duration-700 overflow-hidden"
                style={{ animationDelay: `${idx * 0.15}s` }}
              >
                <div className="relative aspect-[4/5] grayscale contrast-125 transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-105 bg-black">
                  {member.photoUrl ? (
                    <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-5">
                      <User size={80} strokeWidth={1} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1E201E] via-transparent to-transparent opacity-60" />
                </div>

                <div className="p-8 flex flex-col gap-2 relative">
                  <h4 className="text-2xl md:text-4xl font-headline tracking-tight uppercase leading-none group-hover:text-muted transition-all">
                    {member.name}
                  </h4>
                  <p className="text-muted text-[10px] md:text-xs uppercase tracking-[0.5em] font-black mt-2">
                    {member.role}
                  </p>
                </div>
                
                <div className="absolute -bottom-4 -right-4 w-24 h-24 border-r-2 border-b-2 border-white/5 group-hover:border-muted/20 transition-all" />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-48 flex flex-col items-center text-center animate-fade-in">
           <div className="w-24 h-[1px] bg-muted/20 mb-12"></div>
           <p className="text-2xl md:text-5xl font-headline italic text-muted/40 group cursor-default">
            "MISS YOU <span className="group-hover:text-muted transition-colors">ALL ;*</span>"
           </p>
        </div>
      </div>
    </section>
  );
}
