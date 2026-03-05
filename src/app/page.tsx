'use client';

import React, { useEffect, useRef } from 'react';
import { Navigation } from '@/components/Navigation';
import { MusicSection } from '@/components/MusicPlayer';
import { SplashScreen } from '@/components/SplashScreen';
import { Footer } from '@/components/Footer';
import { ChevronDown, MapPin } from 'lucide-react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

export default function Home() {
  const db = useFirestore();
  const profileRef = useMemoFirebase(() => doc(db, 'band_profile', 'mainProfile'), [db]);
  const { data: profile } = useDoc(profileRef);

  const heroVideo = profile?.heroVideoUrl;
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observerOptions = {
      root: null,
      threshold: 0.1,
      rootMargin: "0px"
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    const currentRefs = sectionsRef.current;
    currentRefs.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => {
      currentRefs.forEach((section) => {
        if (section) observer.unobserve(section);
      });
    };
  }, [profile]);

  return (
    <main className="min-h-screen bg-black text-white selection:bg-muted selection:text-black relative">
      <SplashScreen />
      <Navigation />

      <section className="relative h-[100svh] flex items-center justify-center overflow-hidden px-4">
        <div className="scan-line" />
        
        <div className="absolute inset-0 z-0 bg-black">
          {heroVideo ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover grayscale brightness-[0.35] contrast-[1.4] transition-all duration-1000 animate-fade-in"
            >
              <source src={heroVideo} type="video/mp4" />
            </video>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-tr from-[#1E201E] to-black" />
          )}
        </div>
        
        <div className="absolute inset-0 z-1 ink-gradient opacity-90" />
        
        <div className="relative z-10 text-center w-full max-w-7xl mx-auto px-4 translate-y-16 md:translate-y-24">
          <div className="animate-float mb-8 md:mb-16 flex justify-center">
            <h1 className="text-[24vw] sm:text-[20vw] md:text-[14vw] lg:text-[13rem] font-headline tracking-tighter leading-[0.7] text-glow animate-flicker stain-header warm-stain cursor-default select-none text-muted">
              {profile?.heroHeadline || "MORE iNK."}
            </h1>
          </div>
          
          <div className="flex flex-col items-center gap-6 mb-12 md:mb-24 opacity-0 animate-fade-in [animation-delay:800ms] [animation-fill-mode:forwards]">
            <div className="flex items-center gap-4 md:gap-12">
              <div className="hidden sm:block h-[1px] w-16 md:w-32 bg-muted/20"></div>
              <p className="text-[14px] sm:text-xl md:text-4xl font-headline tracking-[0.6em] md:tracking-[1em] uppercase text-muted italic text-center px-4 text-glow-warm">
                {profile?.heroTagline || "ORIGINAL"}
              </p>
              <div className="hidden sm:block h-[1px] w-16 md:w-32 bg-muted/20"></div>
            </div>
            
            <div className="flex items-center gap-2 text-muted/30 text-[10px] uppercase tracking-[0.4em] font-black">
              CIPUTAT, ID
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10 opacity-0 animate-fade-in [animation-delay:2000ms] [animation-fill-mode:forwards]">
           <a href="#music" className="text-white/10 hover:text-muted transition-all flex flex-col items-center p-2 sm:p-4 group">
              <ChevronDown className="h-8 w-8 sm:h-16 sm:w-16 animate-bounce" />
           </a>
        </div>
      </section>

      <section 
        ref={(el) => { sectionsRef.current[0] = el; }}
        className="relative z-10 reveal-on-scroll"
      >
        <MusicSection />
      </section>

      <Footer />
    </main>
  );
}
