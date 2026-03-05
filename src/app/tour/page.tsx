'use client';

import React from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { TourSection } from '@/components/TourSchedule';

export default function TourPage() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-accent selection:text-white relative">
      <Navigation />
      <div className="pt-32 md:pt-40">
        <TourSection />
      </div>
      <Footer />
    </main>
  );
}