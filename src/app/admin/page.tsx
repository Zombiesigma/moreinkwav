
'use client';

import React from 'react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAuth, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { LogOut, Music, MapPin, Image as ImageIcon, User, LayoutDashboard, Activity, ShoppingBag, ClipboardList, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BandProfileForm } from '@/components/admin/BandProfileForm';
import { MusicManager } from '@/components/admin/MusicManager';
import { TourManager } from '@/components/admin/TourManager';
import { GalleryManager } from '@/components/admin/GalleryManager';
import { MerchManager } from '@/components/admin/MerchManager';
import { OrderManager } from '@/components/admin/OrderManager';
import { ChatManager } from '@/components/admin/ChatManager';
import { doc, collection } from 'firebase/firestore';

const DEFAULT_LOGO = "https://raw.githubusercontent.com/Zombiesigma/moreink/main/LOGO%20MORINK%20(White).jpg";

function AdminDashboardContent() {
  const auth = useAuth();
  const router = useRouter();
  const db = useFirestore();
  
  const profileRef = useMemoFirebase(() => doc(db, 'band_profile', 'mainProfile'), [db]);
  const { data: profile } = useDoc(profileRef);

  const albumsQuery = useMemoFirebase(() => collection(db, 'albums'), [db]);
  const tourQuery = useMemoFirebase(() => collection(db, 'tour_dates'), [db]);
  const photosQuery = useMemoFirebase(() => collection(db, 'photos'), [db]);
  const merchQuery = useMemoFirebase(() => collection(db, 'merch'), [db]);
  const ordersQuery = useMemoFirebase(() => collection(db, 'orders'), [db]);
  const chatQuery = useMemoFirebase(() => collection(db, 'chats'), [db]);

  const { data: albums } = useCollection(albumsQuery);
  const { data: tourDates } = useCollection(tourQuery);
  const { data: photos } = useCollection(photosQuery);
  const { data: merchItems } = useCollection(merchQuery);
  const { data: orders } = useCollection(ordersQuery);
  const { data: chats } = useCollection(chatQuery);

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/login');
  };

  const currentLogo = profile?.logoUrl || DEFAULT_LOGO;

  return (
    <div className="min-h-screen bg-black text-white relative flex flex-col selection:bg-muted selection:text-black">
      <div className="noise-overlay" />
      
      <header className="border-b border-white/10 p-6 flex justify-between items-center relative z-20 bg-[#1E201E]/90 backdrop-blur-xl sticky top-0">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <img 
              src={currentLogo} 
              className="h-10 md:h-12 w-auto grayscale contrast-125 brightness-150 transition-all duration-700 group-hover:grayscale-0 group-hover:brightness-200" 
              alt="Logo" 
            />
          </div>
          <div className="flex flex-col">
            <h1 className="font-headline text-2xl tracking-tight hidden sm:block leading-none text-muted">
              ADMIN
            </h1>
          </div>
        </div>
        <Button 
          variant="ghost" 
          onClick={handleSignOut}
          className="text-white/40 hover:text-muted font-headline tracking-widest uppercase flex items-center gap-2 group"
        >
          DISCONNECT <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
        </Button>
      </header>

      <main className="flex-grow p-6 md:p-12 relative z-10 max-w-7xl mx-auto w-full">
        <Tabs defaultValue="dashboard" className="space-y-12">
          <TabsList className="bg-white/5 border border-white/10 p-1 h-auto rounded-none grid grid-cols-2 md:flex md:flex-wrap gap-2">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-muted data-[state=active]:text-black rounded-none px-6 py-4 font-headline uppercase tracking-widest flex items-center gap-2 transition-all">
              <LayoutDashboard size={18} /> OVERVIEW
            </TabsTrigger>
            <TabsTrigger value="chats" className="data-[state=active]:bg-muted data-[state=active]:text-black rounded-none px-6 py-4 font-headline uppercase tracking-widest flex items-center gap-2 transition-all">
              <MessageSquare size={18} /> CHATS
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-muted data-[state=active]:text-black rounded-none px-6 py-4 font-headline uppercase tracking-widest flex items-center gap-2 transition-all">
              <ClipboardList size={18} /> ORDERS
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-muted data-[state=active]:text-black rounded-none px-6 py-4 font-headline uppercase tracking-widest flex items-center gap-2 transition-all">
              <User size={18} /> IDENTITY
            </TabsTrigger>
            <TabsTrigger value="music" className="data-[state=active]:bg-muted data-[state=active]:text-black rounded-none px-6 py-4 font-headline uppercase tracking-widest flex items-center gap-2 transition-all">
              <Music size={18} /> MUSIC
            </TabsTrigger>
            <TabsTrigger value="tour" className="data-[state=active]:bg-muted data-[state=active]:text-black rounded-none px-6 py-4 font-headline uppercase tracking-widest flex items-center gap-2 transition-all">
              <MapPin size={18} /> ROAD
            </TabsTrigger>
            <TabsTrigger value="gallery" className="data-[state=active]:bg-muted data-[state=active]:text-black rounded-none px-6 py-4 font-headline uppercase tracking-widest flex items-center gap-2 transition-all">
              <ImageIcon size={18} /> STAGE
            </TabsTrigger>
            <TabsTrigger value="merch" className="data-[state=active]:bg-muted data-[state=active]:text-black rounded-none px-6 py-4 font-headline uppercase tracking-widest flex items-center gap-2 transition-all">
              <ShoppingBag size={18} /> MERCH
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="animate-fade-in space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 md:gap-8">
              <div className="p-8 border border-white/10 bg-white/[0.02] group hover:bg-white/5 transition-all">
                <p className="text-5xl font-headline group-hover:text-muted transition-all text-glow">{chats?.length || 0}</p>
                <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 mt-2 flex items-center gap-2">
                  <MessageSquare size={12} /> CHATS
                </p>
              </div>
              <div className="p-8 border border-white/10 bg-white/[0.02] group hover:bg-white/5 transition-all">
                <p className="text-5xl font-headline group-hover:text-muted transition-all text-glow">{orders?.length || 0}</p>
                <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 mt-2 flex items-center gap-2">
                  <ClipboardList size={12} /> ORDERS
                </p>
              </div>
              <div className="p-8 border border-white/10 bg-white/[0.02] group hover:bg-white/5 transition-all">
                <p className="text-5xl font-headline group-hover:text-muted transition-all text-glow">{albums?.length || 0}</p>
                <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 mt-2 flex items-center gap-2">
                  <Music size={12} /> MUSIC
                </p>
              </div>
              <div className="p-8 border border-white/10 bg-white/[0.02] group hover:bg-white/5 transition-all">
                <p className="text-5xl font-headline group-hover:text-muted transition-all text-glow">{tourDates?.length || 0}</p>
                <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 mt-2 flex items-center gap-2">
                  <MapPin size={12} /> ROAD
                </p>
              </div>
              <div className="p-8 border border-white/10 bg-white/[0.02] group hover:bg-white/5 transition-all">
                <p className="text-5xl font-headline group-hover:text-muted transition-all text-glow">{photos?.length || 0}</p>
                <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 mt-2 flex items-center gap-2">
                  <ImageIcon size={12} /> STAGE
                </p>
              </div>
              <div className="p-8 border border-white/10 bg-white/[0.02] group hover:bg-white/5 transition-all">
                <p className="text-5xl font-headline group-hover:text-muted transition-all text-glow">{merchItems?.length || 0}</p>
                <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 mt-2 flex items-center gap-2">
                  <ShoppingBag size={12} /> MERCH
                </p>
              </div>
            </div>

            <div className="p-12 md:p-24 border border-white/10 bg-white/[0.02] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-muted group-hover:opacity-[0.05] transition-opacity">
                <Activity size={300} strokeWidth={0.5} />
              </div>
              <h3 className="text-6xl md:text-[8rem] font-headline mb-6 tracking-tighter animate-flicker leading-none relative z-10 text-muted">
                SYNC_OPTIMAL
              </h3>
              <div className="flex items-center gap-4 px-6 py-3 bg-white/5 border border-white/10 w-fit relative z-10">
                <Activity className="text-accent animate-pulse" size={20} />
                <span className="text-[10px] uppercase tracking-[0.5em] font-black">SYSTEM_OPTIMAL</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="chats" className="animate-fade-in"><ChatManager /></TabsContent>
          <TabsContent value="orders" className="animate-fade-in"><OrderManager /></TabsContent>
          <TabsContent value="profile" className="animate-fade-in"><BandProfileForm /></TabsContent>
          <TabsContent value="music" className="animate-fade-in"><MusicManager /></TabsContent>
          <TabsContent value="tour" className="animate-fade-in"><TourManager /></TabsContent>
          <TabsContent value="gallery" className="animate-fade-in"><GalleryManager /></TabsContent>
          <TabsContent value="merch" className="animate-fade-in"><MerchManager /></TabsContent>
        </Tabs>
      </main>

      <footer className="p-12 border-t border-white/5 text-center">
        <p className="text-white/10 text-[10px] uppercase tracking-[1em] font-black">MORE INK ADMIN // MMXXIV</p>
      </footer>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AdminGuard>
      <AdminDashboardContent />
    </AdminGuard>
  );
}
