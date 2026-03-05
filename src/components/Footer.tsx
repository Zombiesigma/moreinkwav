"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';

const FOOTER_LINKS = [
  { name: 'SOUNDS', href: '/' },
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

export function Footer() {
  const db = useFirestore();
  const profileRef = useMemoFirebase(() => doc(db, 'band_profile', 'mainProfile'), [db]);
  const { data: profile } = useDoc(profileRef);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const SocialIcon = ({ href, icon: Icon, label }: any) => {
    if (!href) return null;
    return (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-white/40 hover:text-muted transition-all duration-300 hover:scale-125 transform"
        aria-label={label}
      >
        <Icon size={28} />
      </a>
    );
  };

  return (
    <footer className="relative bg-[#1E201E] pt-32 pb-12 px-6 overflow-hidden border-t border-white/5">
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-black via-black/80 to-transparent pointer-events-none z-10" />
      
      <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-[0.05] z-0">
        <div className="absolute -bottom-20 -right-20 w-[600px] h-[600px] bg-accent blur-[180px] rounded-full" />
      </div>

      <div className="absolute -bottom-6 md:-bottom-10 left-0 w-full pointer-events-none select-none overflow-hidden opacity-[0.03] z-0">
        <h2 className="text-[30vw] md:text-[25vw] font-headline tracking-tighter leading-none whitespace-nowrap -mb-6 md:-mb-12 text-muted">
          MORE INK. MORE INK.
        </h2>
      </div>

      <div className="max-w-7xl mx-auto relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-24 mb-24">
          
          <div className="lg:col-span-5 space-y-12">
            <div className="flex flex-col gap-8">
              <img 
                src={profile?.logoUrl || DEFAULT_LOGO} 
                alt="More Ink Logo" 
                className="h-12 md:h-20 w-auto object-contain self-start grayscale brightness-150 contrast-125"
              />
              <p className="text-muted/40 font-body text-xl md:text-3xl italic leading-relaxed max-w-md">
                "Original sound from the heart of Ciputat. <span className="text-muted/70">Unfiltered vibrations</span> since 2023."
              </p>
            </div>
            
            <div className="space-y-4 flex flex-col items-start">
              <div className="flex items-center gap-4 text-white/20 group cursor-default">
                <MapPin size={18} className="group-hover:text-accent transition-colors" />
                <span className="text-[10px] uppercase tracking-[0.5em] font-black">CIPUTAT, ID</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <h4 className="text-[10px] uppercase tracking-[1em] text-muted/40 font-black mb-12">EXPLORE</h4>
            <ul className="space-y-6">
              {FOOTER_LINKS.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="group flex items-center gap-4 text-white/40 hover:text-muted transition-all font-headline text-2xl md:text-4xl tracking-widest uppercase leading-none"
                  >
                    {link.name}
                    <ArrowUpRight size={18} className="opacity-0 -translate-y-2 translate-x-2 group-hover:opacity-100 group-hover:text-muted group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h4 className="text-[10px] uppercase tracking-[1em] text-muted/40 font-black mb-12">CONNECT</h4>
            <div className="flex flex-wrap items-center gap-8 md:gap-10">
              <SocialIcon 
                href={profile?.socialLinks?.instagram} 
                icon={InstagramIcon} 
                label="INSTAGRAM" 
              />
              <SocialIcon 
                href={profile?.socialLinks?.spotify} 
                icon={SpotifyIcon} 
                label="SPOTIFY" 
              />
              <SocialIcon 
                href={profile?.socialLinks?.appleMusic} 
                icon={AppleMusicIcon} 
                label="APPLE_MUSIC" 
              />
              <SocialIcon 
                href={profile?.socialLinks?.youtube} 
                icon={YoutubeIcon} 
                label="YOUTUBE" 
              />
              <SocialIcon 
                href={profile?.socialLinks?.tiktok} 
                icon={TiktokIcon} 
                label="TIKTOK" 
              />
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="text-[10px] uppercase tracking-[0.6em] text-muted/20 font-black flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-4">
            <span>&copy; 2024 MORE INK.</span>
          </div>
          
          <button 
            onClick={scrollToTop}
            className="text-[10px] uppercase tracking-[0.4em] font-black text-white/20 hover:text-muted transition-all flex items-center gap-4 group"
          >
            BACK TO TOP
            <div className="w-12 h-[1px] bg-white/20 group-hover:w-20 group-hover:bg-muted transition-all duration-700"></div>
          </button>
        </div>
      </div>
    </footer>
  );
}
