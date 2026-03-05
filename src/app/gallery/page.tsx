'use client';

import React from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { GallerySection } from '@/components/PhotoGallery';

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-accent selection:text-white relative">
      <Navigation />
      <div className="pt-32 md:pt-40">
        <GallerySection />
      </div>
      <Footer />
    </main>
  );
}