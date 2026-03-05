'use client';

import React from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { AboutSection } from '@/components/AboutSection';

export default function SoulPage() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-accent selection:text-black relative">
      <Navigation />
      
      {/* Scrollable atmospheric background for the whole page */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#141E57]/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#948979]/5 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 pt-32 md:pt-40">
        <AboutSection />
      </div>

      <Footer />
    </main>
  );
}
