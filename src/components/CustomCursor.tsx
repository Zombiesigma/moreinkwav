'use client';

import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * @fileOverview Komponen Custom Cursor yang dioptimalkan untuk menghindari hydration mismatch.
 * Menggunakan elemen CSS div murni sebagai kursor untuk stabilitas maksimal.
 */
export function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    
    // Nonaktifkan di perangkat mobile
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice && window.innerWidth < 1024) return;

    const onMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    const handleHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = 
        target.closest('button') || 
        target.closest('a') || 
        target.closest('[role="button"]') ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.classList.contains('cursor-pointer');
      
      setIsHovering(!!isInteractive);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseover', handleHover, { passive: true });
    window.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('mouseup', onMouseUp, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', handleHover);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  // Mencegah rendering di server untuk menghindari mismatch atribut transform
  if (!mounted) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] hidden lg:block overflow-hidden print:hidden">
      <div 
        ref={cursorRef}
        className={cn(
          "fixed top-0 left-0 w-8 h-8 -ml-4 -mt-4 transition-all duration-75 ease-out z-[9999] flex items-center justify-center will-change-transform",
          isClicking && "scale-75",
          isHovering && "scale-150"
        )}
      >
        {/* Cursor Body: Minimalist Ring */}
        <div className={cn(
          "w-full h-full border border-muted rounded-full transition-all duration-300",
          isHovering ? "bg-muted/20 border-white" : "bg-transparent border-white/20"
        )} />
        
        {/* Cursor Core: Dot */}
        <div className={cn(
          "absolute w-1 h-1 bg-white rounded-full transition-transform duration-300",
          isHovering && "scale-0"
        )} />
      </div>
    </div>
  );
}
