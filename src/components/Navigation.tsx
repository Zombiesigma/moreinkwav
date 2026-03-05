"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X, LogOut, Menu } from 'lucide-react';
import { useFirestore, useDoc, useMemoFirebase, useUser, useAuth } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const NAV_ITEMS = [
  { name: 'SOUND', href: '/' },
  { name: 'ROAD', href: '/tour' },
  { name: 'STAGE', href: '/gallery' },
  { name: 'MERCH', href: '/merch' },
  { name: 'SOUL', href: '/soul' },
  { name: 'CONTACT', href: '/contact' },
];

const DEFAULT_LOGO = "https://raw.githubusercontent.com/Zombiesigma/moreink/main/LOGO%20MORINK%20(White).jpg";

const InstagramIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const SpotifyIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm5.508 17.302c-.216.354-.675.466-1.028.249-2.812-1.718-6.353-2.107-10.521-1.154-.404.093-.808-.163-.9-.567-.093-.404.163-.808.567-.9 4.563-1.044 8.467-.6 11.605 1.296.353.217.465.676.248 1.029zm1.47-3.253c-.272.443-.834.582-1.277.31-3.218-1.977-8.123-2.553-11.929-1.398-.498.151-1.03-.135-1.181-.633-.151-.498.135-1.03.633-1.181 4.356-1.322 9.776-.67 13.464 1.595.443.272.582.834.31 1.277zm.127-3.41c-3.859-2.292-10.222-2.503-13.942-1.373-.593.18-1.22-.155-1.4-.748-.18-.593.155-1.22.748-1.4 4.274-1.298 11.303-1.05 15.746 1.587.533.317.708 1.005.392 1.538-.316.533-1.005.708-1.538.392z"/>
  </svg>
);

const YoutubeIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const AppleMusicIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm4.5 15.25c0 1.242-1.008 2.25-2.25 2.25s-2.25-1.008-2.25-2.25 1.008-2.25 2.25-2.25c.315 0 .608.065.875.182V8.5l-4.5 1.125v6.625c0 1.242-1.008 2.25-2.25 2.25s-2.25-1.008-2.25-2.25 1.008-2.25 2.25-2.25c.315 0 .608.065.875.182V6.5l6.75-1.688v10.438z"/>
  </svg>
);

const TiktokIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.03 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-.1-.01-.5.03-1.76.54-3.46 1.57-4.89 1.21-1.8 3.16-3.06 5.27-3.36V8.83c-1.09.19-2.12.74-2.87 1.53-.69.81-1.09 1.83-1.11 2.88-.02.2-.01.4-.01.6 0 1.1.41 2.17 1.15 3.01.74.84 1.8 1.37 2.92 1.48 1.12.11 2.28-.18 3.2-.82.81-.56 1.31-1.43 1.45-2.41.04-.41.04-.83.04-1.24.02-3.44-.01-6.89.01-10.33z"/>
  </svg>
);

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [nearFooter, setNearFooter] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  
  const db = useFirestore();
  const auth = useAuth();
  const { user } = useUser();
  const profileRef = useMemoFirebase(() => doc(db, 'band_profile', 'mainProfile'), [db]);
  const { data: profile } = useDoc(profileRef);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 80;
      setScrolled(isScrolled);

      const threshold = 800; 
      const totalHeight = document.documentElement.scrollHeight;
      const currentScroll = window.scrollY + window.innerHeight;
      const isNearBottom = currentScroll >= totalHeight - threshold;
      setNearFooter(isNearBottom);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/');
  };

  const isHome = pathname === '/';
  const isTransparent = isHome && !scrolled;

  const dynamicNavItems = [...NAV_ITEMS];
  if (user) {
    dynamicNavItems.push({ name: 'ORDERS', href: '/my-orders' });
  }

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-[60] transition-all duration-1000 ease-in-out px-6 md:px-16",
          isTransparent 
            ? "py-12 md:py-20 bg-transparent" 
            : nearFooter
              ? "py-4 md:py-6 bg-[#1E201E]/95 border-b border-muted/20 backdrop-blur-3xl shadow-2xl"
              : "py-4 md:py-6 bg-black/95 border-b border-white/5 backdrop-blur-2xl shadow-2xl"
        )}
      >
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <Link 
            href="/" 
            className="relative group transition-transform active:scale-90"
          >
            <div className="flex items-center">
              <img 
                src={profile?.logoUrl || DEFAULT_LOGO} 
                alt="Logo" 
                className={cn(
                  "transition-all duration-1000 ease-in-out object-contain grayscale brightness-150 contrast-125",
                  "group-hover:grayscale-0 group-hover:brightness-200 group-hover:scale-110",
                  isTransparent ? "h-20 md:h-28" : "h-10 md:h-14"
                )}
              />
            </div>
          </Link>
          
          <div className="hidden lg:flex items-center gap-14">
            {dynamicNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "text-[11px] uppercase tracking-[1em] font-black transition-all py-2 relative group",
                    isActive ? "text-muted" : "text-white/30 hover:text-muted"
                  )}
                >
                  {item.name}
                  <span className={cn(
                    "absolute -bottom-1 left-0 h-[2px] bg-muted transition-all duration-700 ease-in-out shadow-glow",
                    isActive ? "w-full" : "w-0 group-hover:w-full"
                  )} />
                </Link>
              );
            })}
            
            <div className="h-8 w-px bg-white/10 mx-2" />

            {!user ? (
              <Link href="/login">
                <Button variant="impact" className="h-12 px-10 text-[10px] tracking-[0.5em]">
                  LOGIN
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-6">
                <Button 
                  onClick={handleSignOut}
                  variant="ghost" 
                  className="text-white/20 hover:text-red-500 transition-all p-2"
                >
                  <LogOut size={20} />
                </Button>
              </div>
            )}
          </div>
          
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="h-12 px-6 border-none shadow-none active:scale-95 transition-all bg-white/5 text-muted hover:bg-white/10"
                >
                  <Menu size={20} className="mr-2" />
                  <span className="text-[10px] uppercase tracking-[0.4em] font-black">MENU</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0 border-0 bg-[#000000] w-full flex flex-col [&>button]:hidden">
                <div className="noise-overlay" />
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <SheetDescription className="sr-only">Access More Ink.</SheetDescription>

                <div className="absolute top-10 right-10 z-[70]">
                  <SheetClose asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-16 w-16 hover:bg-white/5 text-muted transition-all shadow-2xl border border-white/5 active:scale-90 rounded-full"
                    >
                      <X size={32} strokeWidth={2} />
                    </Button>
                  </SheetClose>
                </div>

                <div className="relative z-10 h-full flex flex-col p-10 pt-40 overflow-y-auto no-scrollbar">
                  <div className="flex flex-col gap-4">
                    {dynamicNavItems.map((item, idx) => {
                      const isActive = pathname === item.href;
                      return (
                        <SheetClose key={item.name} asChild>
                          <Link 
                            href={item.href}
                            className={cn(
                              "flex items-baseline gap-8 py-4 group transition-all duration-700",
                              isActive ? "text-muted translate-x-6" : "text-white/40 hover:text-muted hover:translate-x-6"
                            )}
                          >
                            <span className={cn(
                              "text-3xl italic leading-none transition-colors duration-700",
                              isActive ? "text-accent" : "text-white/5 group-hover:text-accent/20"
                            )}>
                              0{idx + 1}
                            </span>
                            <span className="text-5xl sm:text-7xl font-headline tracking-tighter uppercase leading-none text-glow">
                              {item.name}
                            </span>
                          </Link>
                        </SheetClose>
                      );
                    })}
                    
                    {user && (
                      <div className="mt-12 pt-12 border-t border-white/10">
                        <Button 
                          onClick={handleSignOut}
                          variant="impact"
                          size="xl"
                          className="w-full h-24 text-2xl group"
                        >
                          SIGN_OUT <LogOut className="ml-6 h-8 w-8 group-hover:translate-x-4 transition-transform duration-500" />
                        </Button>
                      </div>
                    )}
                    
                    {!user && (
                      <SheetClose asChild>
                        <Link href="/login" className="mt-12">
                          <Button variant="impact" size="xl" className="w-full h-24 text-2xl">
                            LOGIN
                          </Button>
                        </Link>
                      </SheetClose>
                    )}
                  </div>

                  <div className="mt-auto pt-20 pb-10 flex flex-col items-center gap-12">
                    <div className="flex gap-6 w-full flex-wrap justify-center">
                        {[
                          { icon: InstagramIcon, href: profile?.socialLinks?.instagram },
                          { icon: SpotifyIcon, href: profile?.socialLinks?.spotify },
                          { icon: YoutubeIcon, href: profile?.socialLinks?.youtube },
                          { icon: TiktokIcon, href: profile?.socialLinks?.tiktok }
                        ].map((social, idx) => (
                          <a 
                            key={idx}
                            href={social.href || "#"} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-20 h-20 flex items-center justify-center bg-white/[0.03] border border-white/5 text-white/20 hover:text-accent hover:border-accent/40 transition-all duration-500 hover:-translate-y-2"
                          >
                            <social.icon size={32} />
                          </a>
                        ))}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </>
  );
}
