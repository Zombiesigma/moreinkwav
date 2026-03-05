"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

const DEFAULT_LOGO = "https://raw.githubusercontent.com/Zombiesigma/moreink/main/LOGO%20MORINK%20(White).jpg";

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  const db = useFirestore();
  const profileRef = useMemoFirebase(() => doc(db, 'band_profile', 'mainProfile'), [db]);
  const { data: profile } = useDoc(profileRef);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 2000);

    const removeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 3500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[100] bg-black flex items-center justify-center transition-opacity duration-[1500ms] ease-in-out",
        isFading ? "opacity-0 pointer-events-none" : "opacity-100"
      )}
    >
      <div className="relative z-10 text-center px-6 flex flex-col items-center w-full max-w-lg mx-auto">
        <img 
          src={profile?.logoUrl || DEFAULT_LOGO} 
          alt="More Ink. Logo" 
          className="w-full max-w-[240px] sm:max-w-[400px] md:max-w-[500px] animate-flicker grayscale brightness-125 object-contain"
        />
      </div>
    </div>
  );
}
