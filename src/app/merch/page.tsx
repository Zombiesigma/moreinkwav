'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Loader2, Tag, ArrowRight } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase, useDoc, useUser } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function MerchPage() {
  const db = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  
  const merchQuery = useMemoFirebase(() => query(collection(db, 'merch'), orderBy('createdAt', 'desc')), [db]);
  const { data: merchItems, isLoading } = useCollection(merchQuery);

  const profileRef = useMemoFirebase(() => doc(db, 'band_profile', 'mainProfile'), [db]);
  const { data: profile } = useDoc(profileRef);

  const handleCollect = (itemId: string) => {
    if (!user) {
      router.push(`/login?redirect=/merch/checkout/${itemId}`);
    } else {
      router.push(`/merch/checkout/${itemId}`);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-muted selection:text-black relative">
      <Navigation />
      
      <section className="relative h-[70vh] md:h-[85vh] flex items-center overflow-hidden px-6 border-b border-white/5">
        <div className="scan-line" />
        
        <div className="absolute inset-0 z-0 bg-black">
          {profile?.heroVideoUrl ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover grayscale brightness-[0.25] contrast-[1.4] transition-all duration-1000"
            >
              <source src={profile.heroVideoUrl} type="video/mp4" />
            </video>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-tr from-[#1E201E] to-black opacity-60" />
          )}
        </div>
        
        <div className="absolute inset-0 z-1 ink-gradient opacity-90" />
        
        <div className="max-w-7xl mx-auto w-full relative z-10 pt-20 md:pt-32">
          <div className="flex flex-col border-l-2 border-muted/20 pl-8 md:pl-16 animate-fade-in">
             <h1 className="text-7xl sm:text-9xl md:text-[15rem] font-headline tracking-tighter text-glow-warm leading-[0.8] mb-8 text-muted stain-header warm-stain">
               MERCH
             </h1>
             <p className="text-muted/40 text-lg md:text-3xl italic font-body max-w-2xl leading-relaxed">
              Material to carry the ink with you. Limited editions.
             </p>
          </div>
        </div>
      </section>

      <div className="py-24 md:py-48 px-6 relative z-10 max-w-7xl mx-auto">
        <div className="mb-20 md:mb-32 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h2 className="text-4xl md:text-7xl font-headline tracking-tighter uppercase leading-none mb-4">THE <span className="text-muted">COLLECTION</span></h2>
            <div className="h-[2px] w-24 bg-accent"></div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-40">
            <Loader2 className="animate-spin h-16 w-16 text-muted/10" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-12 md:gap-24">
            {merchItems?.map((item, idx) => (
              <div 
                key={item.id} 
                className="group relative flex flex-col bg-[#1E201E] border border-white/5 overflow-hidden animate-fade-in hover:border-muted/30 transition-all duration-700 shadow-2xl" 
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-black">
                  <Image 
                    src={item.imageUrl} 
                    alt={item.name} 
                    fill 
                    className="object-cover grayscale contrast-[1.2] brightness-90 transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-105 group-hover:brightness-100"
                    data-ai-hint="band merchandise"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1E201E] via-transparent to-transparent opacity-60" />
                  
                  <div className="absolute top-8 right-8 bg-muted text-black font-headline px-6 py-3 text-2xl md:text-3xl tracking-widest shadow-[8px_8px_0px_rgba(0,0,0,0.5)] group-hover:shadow-[8px_8px_0px_rgba(236,223,204,0.2)] transition-all">
                    {item.price}
                  </div>
                </div>

                <div className="p-10 md:p-16 flex flex-col flex-grow relative">
                  <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-muted pointer-events-none">
                    <Tag size={120} strokeWidth={1} />
                  </div>
                  
                  <h3 className="text-4xl md:text-6xl font-headline tracking-tighter uppercase leading-none mb-6 group-hover:text-glow transition-all text-muted">
                    {item.name}
                  </h3>
                  
                  <p className="text-muted/40 text-sm md:text-xl mb-12 font-body leading-relaxed flex-grow italic">
                    {item.description}
                  </p>
                  
                  <Button 
                    onClick={() => handleCollect(item.id)}
                    variant="impact" 
                    size="xl" 
                    className="w-full h-24 text-2xl group/btn overflow-hidden relative"
                  >
                    <span className="relative z-10 flex items-center gap-4">
                      COLLECT <ShoppingBag className="h-6 w-6 text-accent" />
                    </span>
                    <div className="absolute inset-0 bg-accent translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                  </Button>
                </div>
                
                <div className="absolute -bottom-4 -right-4 w-24 h-24 border-r-2 border-b-2 border-white/5 group-hover:border-muted/20 transition-all" />
              </div>
            ))}

            {(!merchItems || merchItems.length === 0) && (
              <div className="col-span-full py-48 border-2 border-dashed border-white/5 text-center flex flex-col items-center justify-center opacity-20">
                <ShoppingBag size={64} className="mb-8 text-muted" />
                <h2 className="text-4xl md:text-6xl font-headline mb-4 tracking-tighter">EMPTY</h2>
              </div>
            )}
          </div>
        )}

        <div className="mt-48 flex flex-col items-center text-center animate-fade-in">
           <div className="w-24 h-[1px] bg-muted/20 mb-12"></div>
           <p className="text-2xl md:text-5xl font-headline italic text-muted/40 max-w-2xl leading-tight">
            "WEAR THE <span className="text-muted">INK</span>, BECOME THE <span className="text-muted">VIBRATION</span>."
           </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
