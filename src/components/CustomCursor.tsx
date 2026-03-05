'use client';

import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * @fileOverview Komponen Custom Cursor yang dioptimalkan.
 * Menghilangkan titik putih dan lingkaran berat untuk performa maksimal.
 */
export function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    
    // Nonaktifkan di perangkat mobile/layar sentuh
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice && window.innerWidth < 1024) return;

    const onMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        // Gunakan translate3d untuk akselerasi GPU
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

  if (!mounted) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] hidden lg:block overflow-hidden">
      <div 
        ref={cursorRef}
        className={cn(
          "fixed top-0 left-0 w-12 h-12 -ml-6 -mt-6 transition-transform duration-75 ease-out z-[9999] flex items-center justify-center will-change-transform",
          isClicking && "scale-90 rotate-6",
          isHovering && "scale-125"
        )}
      >
        <div className="relative w-full h-full flex items-center justify-center">
            <img 
              src="/cur/cursor.png" 
              alt="Cursor" 
              className={cn(
                "w-full h-full object-contain mix-blend-difference transition-opacity duration-300",
                !isLoaded ? "opacity-0" : "opacity-100"
              )}
              onLoad={() => setIsLoaded(true)}
            />
        </div>
      </div>
    </div>
  );
}
