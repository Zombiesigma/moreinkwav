"use client";

import React from 'react';
import { MapPin, ArrowRight, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';

export function TourSection() {
  const db = useFirestore();
  const tourQuery = useMemoFirebase(() => query(collection(db, 'tour_dates'), orderBy('date', 'asc')), [db]);
  const { data: shows, isLoading } = useCollection(tourQuery);

  return (
    <section id="tour" className="py-24 md:py-48 px-6 bg-black relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-muted/[0.03] blur-[80px] md:blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-32 gap-6">
          <div className="animate-fade-in text-center md:text-left">
            <h2 className="text-6xl sm:text-8xl md:text-[11rem] font-headline tracking-tighter text-glow mb-6 stain-header warm-stain">THE ROAD</h2>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-40">
            <Loader2 className="animate-spin h-12 w-12 md:h-16 md:w-16 text-muted/10" />
          </div>
        ) : (
          <div className="grid gap-6 md:gap-8">
            {shows?.map((show, idx) => {
              const showDate = new Date(show.date);
              const day = showDate.toLocaleDateString('en-GB', { day: '2-digit' });
              const month = showDate.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase();
              
              return (
                <div 
                  key={show.id} 
                  className="group relative flex flex-col md:flex-row md:items-center justify-between p-8 md:p-14 bg-white/[0.02] border border-white/5 hover:bg-muted hover:text-black transition-all duration-700 ease-in-out overflow-hidden"
                >
                  <div className="absolute inset-0 bg-muted opacity-0 group-hover:animate-pulse pointer-events-none transition-opacity duration-300" style={{ mixBlendMode: 'difference' }} />
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 md:gap-24 mb-8 md:mb-0 relative z-10">
                    <div className="flex flex-col items-start sm:items-center justify-center border-l-4 border-muted pl-6 md:pl-12 group-hover:border-black transition-colors min-w-[100px] md:min-w-[120px]">
                      <span className="font-headline text-5xl md:text-9xl tracking-tighter leading-none text-muted group-hover:text-black transition-colors">{day}</span>
                      <span className="text-[10px] md:text-sm uppercase tracking-[0.6em] font-black opacity-40 group-hover:opacity-100">/{month}</span>
                    </div>

                    <div className="space-y-3">
                       <div className="flex items-center gap-3 text-muted/20 group-hover:text-black/60 text-[8px] md:text-[12px] uppercase tracking-[0.5em] font-black">
                         <MapPin className="h-4 w-4 md:h-5 md:w-5" />
                         <span>{show.city}</span>
                       </div>
                       <h3 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-headline tracking-tight uppercase leading-tight md:leading-[0.85] group-hover:translate-x-3 transition-transform duration-500 text-muted group-hover:text-black">
                         {show.venueName}
                       </h3>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-between md:justify-end gap-6 md:gap-20 pt-8 border-t border-white/5 md:border-0 md:pt-0 relative z-10">
                    <span className={cn(
                      "text-[8px] md:text-[12px] uppercase tracking-[0.6em] md:tracking-[0.8em] font-black px-4 py-2 md:px-6 md:py-3 border w-full sm:w-auto text-center transition-all duration-500",
                      show.isUpcoming 
                        ? "border-muted/20 text-muted group-hover:border-black/20 group-hover:text-black" 
                        : "border-white/10 text-white/10"
                    )}>
                      {show.isUpcoming ? 'AVAILABLE' : 'PASSED'}
                    </span>
                    
                    <Button 
                      asChild
                      variant="impact"
                      size="xl"
                      className="w-full sm:w-auto group-hover:bg-black group-hover:text-muted h-16 md:h-24"
                    >
                      <a href={show.ticketPurchaseUrl} target="_blank">
                        DETAILS
                        <ArrowRight className="ml-4 h-6 w-6 md:h-7 md:w-7 group-hover:translate-x-3 transition-transform" />
                      </a>
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {(!shows || shows.length === 0) && (
              <div className="flex flex-col items-center py-24 md:py-48 border border-dashed border-white/10 opacity-20">
                <CalendarIcon size={40} className="mb-6 text-muted" />
                <p className="font-headline text-lg md:text-3xl uppercase tracking-[0.4em] text-center px-6 text-muted">NO SHOWS SCHEDULED</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
