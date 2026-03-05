'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ShieldAlert, RefreshCw } from 'lucide-react';

/**
 * @fileOverview Global Error Boundary untuk menangkap client-side exceptions.
 * Menghindari crash total dengan tampilan "Void Recovery".
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error ke konsol untuk debugging internal
    console.error('Void Exception Detected:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center text-white">
      <div className="noise-overlay" />
      <div className="relative z-10 space-y-8 animate-fade-in">
        <div className="flex justify-center">
          <div className="p-8 bg-white/5 border border-white/10 rounded-full animate-pulse">
            <ShieldAlert size={64} className="text-muted" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-5xl md:text-7xl font-headline tracking-tighter text-glow">VOID_ERROR</h1>
          <p className="text-[10px] uppercase tracking-[0.5em] text-white/40">The frequency has been interrupted</p>
        </div>

        <div className="max-w-md mx-auto p-6 border border-white/5 bg-white/[0.02] text-xs font-mono text-white/20 break-all">
          {error.message || 'UNKNOWN_EXCEPTION_IN_THE_VOID'}
        </div>

        <Button 
          onClick={() => reset()}
          variant="impact"
          size="xl"
          className="h-20 px-12 group"
        >
          RESET_RESONANCE <RefreshCw size={20} className="ml-4 group-hover:rotate-180 transition-transform duration-700" />
        </Button>
      </div>
    </div>
  );
}
