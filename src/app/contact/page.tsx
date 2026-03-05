'use client';

import React from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowRight, Mail, Phone, MapPin } from 'lucide-react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

export default function ContactPage() {
  const db = useFirestore();
  const profileRef = useMemoFirebase(() => doc(db, 'band_profile', 'mainProfile'), [db]);
  const { data: profile } = useDoc(profileRef);

  return (
    <main className="min-h-screen bg-black text-white selection:bg-accent selection:text-white relative">
      <Navigation />
      
      <div className="pt-32 md:pt-48 pb-12 md:pb-24 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-start">
          <div className="animate-fade-in">
            <p className="text-[10px] uppercase tracking-[0.8em] md:tracking-[1em] text-accent mb-6 font-black">GET_CONNECTED</p>
            <h1 className="text-5xl sm:text-8xl md:text-[10rem] font-headline tracking-tighter text-glow leading-none stain-header accent-stain mb-8 md:mb-12">
              CONTACT
            </h1>
            
            <div className="space-y-8 md:space-y-12 mt-12 md:mt-20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 group">
                <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center bg-[#1E201E] border border-white/10 group-hover:border-accent transition-colors">
                  <Mail className="text-white/40 group-hover:text-accent transition-colors h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div>
                  <p className="text-[8px] md:text-[10px] uppercase tracking-widest text-white/20 mb-1">RESONANCE_EMAIL</p>
                  <p className="text-lg md:text-2xl font-headline tracking-widest break-all">
                    {profile?.contactEmail || 'VOID@MOREINK.COM'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 group">
                <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center bg-[#1E201E] border border-white/10 group-hover:border-accent transition-colors">
                  <Phone className="text-white/40 group-hover:text-accent transition-colors h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div>
                  <p className="text-[8px] md:text-[10px] uppercase tracking-widest text-white/20 mb-1">VOICE_LINE</p>
                  <p className="text-lg md:text-2xl font-headline tracking-widest">
                    {profile?.contactPhone || '+62_RESONANCE'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 group">
                <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center bg-[#1E201E] border border-white/10 group-hover:border-accent transition-colors">
                  <MapPin className="text-white/40 group-hover:text-accent transition-colors h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div>
                  <p className="text-[8px] md:text-[10px] uppercase tracking-widest text-white/20 mb-1">ORIGIN_VOID</p>
                  <p className="text-lg md:text-2xl font-headline tracking-widest">CIPUTAT, SOUTH TANGERANG</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-16 border-2 md:border-4 border-white rounded-none bg-[#1E201E] relative overflow-hidden group mt-8 lg:mt-0">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent opacity-5 blur-3xl group-hover:opacity-20 transition-opacity" />
            
            <form className="space-y-8 md:space-y-10 relative z-10">
              <div className="space-y-2">
                <label className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] font-black text-white/40">IDENTIFICATION_NAME</label>
                <Input className="bg-transparent border-0 border-b-2 border-white/10 focus:border-accent rounded-none h-12 md:h-14 px-0 text-lg md:text-xl font-headline transition-all placeholder:text-white/5" placeholder="YOUR_NAME" />
              </div>
              <div className="space-y-2">
                <label className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] font-black text-white/40">VOICE_CHANNEL_EMAIL</label>
                <Input type="email" className="bg-transparent border-0 border-b-2 border-white/10 focus:border-accent rounded-none h-12 md:h-14 px-0 text-lg md:text-xl font-headline transition-all placeholder:text-white/5" placeholder="EMAIL_ADDRESS" />
              </div>
              <div className="space-y-2">
                <label className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] font-black text-white/40">RESONANCE_MESSAGE</label>
                <Textarea className="bg-transparent border-0 border-b-2 border-white/10 focus:border-accent rounded-none min-h-[120px] md:min-h-[150px] px-0 text-lg md:text-xl font-headline resize-none transition-all placeholder:text-white/5" placeholder="WRITE_TO_THE_VOID..." />
              </div>
              <Button variant="impact" size="xl" className="w-full h-20 md:h-24 text-xl md:text-2xl group">
                SEND_TO_VOID <ArrowRight className="ml-4 h-6 w-6 md:h-8 md:w-8 group-hover:translate-x-3 transition-transform text-accent" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}