'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, useUser, initiateEmailSignUp, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Lock, Mail, ArrowRight, Loader2, UserPlus, User, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { doc } from 'firebase/firestore';
import { Navigation } from '@/components/Navigation';

export default function FanRegisterPage() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const auth = useAuth();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const redirectPath = searchParams.get('redirect') || '/';

  // Perbaikan: Kita pastikan user tidak langsung di-redirect jika proses registrasi sedang berjalan
  useEffect(() => {
    if (user && !isUserLoading && !loading) {
      router.push(redirectPath);
    }
  }, [user, isUserLoading, router, redirectPath, loading]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !email || !password) {
      toast({
        variant: "destructive",
        title: "INCOMPLETE_DATA",
        description: "All parameters are required for synchronization.",
      });
      return;
    }

    setLoading(true);
    try {
      const userCredential = await initiateEmailSignUp(auth, email, password);
      const newUser = userCredential.user;

      // Sinkronisasi data profil ke Firestore
      const userProfileRef = doc(db, 'users', newUser.uid);

      setDocumentNonBlocking(userProfileRef, {
        uid: newUser.uid,
        email: newUser.email,
        fullName: fullName,
        phone: phone,
        role: 'fan',
        createdAt: new Date().toISOString(),
      }, { merge: true });

      toast({
        title: "INITIALIZED",
        description: "Your identity is synced. Welcome to the void, " + fullName + ".",
      });

      // Tunggu sebentar agar state auth stabil sebelum pindah halaman
      setTimeout(() => {
        router.push(redirectPath);
      }, 1000);
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "Something went wrong in the void.",
      });
      setLoading(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-muted/20" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white relative flex flex-col">
      <Navigation />
      <div className="noise-overlay" />
      <div className="scan-line" />
      
      <div className="flex-grow flex items-center justify-center p-6 pt-32 pb-20">
        <Card className="w-full max-w-md bg-[#1E201E]/80 border-white/10 rounded-none shadow-2xl relative z-10 backdrop-blur-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-20" />
          
          <CardHeader className="text-center pt-16 pb-10">
            <div className="flex justify-center mb-8">
              <div className="p-6 bg-white/5 border border-white/10 rounded-full animate-pulse relative">
                <UserPlus className="text-muted h-10 w-10" />
                <div className="absolute inset-0 border border-accent/20 rounded-full animate-ping" />
              </div>
            </div>
            <CardTitle className="font-headline text-6xl tracking-tighter text-white animate-flicker leading-none">
              JOIN_VOID
            </CardTitle>
            <p className="text-[10px] uppercase tracking-[0.6em] text-white/40 mt-6">INITIALIZE NEW IDENTITY</p>
          </CardHeader>

          <CardContent className="p-10 md:p-14">
            <form onSubmit={handleRegister} className="space-y-8">
              <div className="space-y-3 group">
                <label className="text-[10px] uppercase tracking-[0.4em] font-black text-white/40 group-focus-within:text-muted transition-colors">BEING_FULL_NAME</label>
                <div className="relative">
                  <User className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
                  <Input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-transparent border-0 border-b-2 border-white/10 focus:border-muted focus:ring-0 rounded-none h-12 pl-10 px-0 text-xl font-headline transition-all placeholder:text-white/5" 
                    placeholder="REAL_NAME"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3 group">
                <label className="text-[10px] uppercase tracking-[0.4em] font-black text-white/40 group-focus-within:text-muted transition-colors">VOICE_LINE_PHONE</label>
                <div className="relative">
                  <Phone className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
                  <Input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-transparent border-0 border-b-2 border-white/10 focus:border-muted focus:ring-0 rounded-none h-12 pl-10 px-0 text-xl font-headline transition-all placeholder:text-white/5" 
                    placeholder="+62_ID"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3 group">
                <label className="text-[10px] uppercase tracking-[0.4em] font-black text-white/40 group-focus-within:text-muted transition-colors">IDENTITY_EMAIL</label>
                <div className="relative">
                  <Mail className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
                  <Input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-transparent border-0 border-b-2 border-white/10 focus:border-muted focus:ring-0 rounded-none h-12 pl-10 px-0 text-xl font-headline transition-all placeholder:text-white/5" 
                    placeholder="fan@moreink.com"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-3 group">
                <label className="text-[10px] uppercase tracking-[0.4em] font-black text-white/40 group-focus-within:text-muted transition-colors">SECURE_ACCESS_KEY</label>
                <div className="relative">
                  <Lock className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
                  <Input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-transparent border-0 border-b-2 border-white/10 focus:border-muted focus:ring-0 rounded-none h-12 pl-10 px-0 text-xl font-headline transition-all placeholder:text-white/5" 
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                variant="impact"
                size="xl"
                className="w-full h-24 text-2xl group overflow-hidden mt-8"
              >
                {loading ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  <span className="relative z-10 flex items-center gap-4">
                    SYNC_IDENTITY <ArrowRight className="h-8 w-8 group-hover:translate-x-3 transition-transform" />
                  </span>
                )}
                <div className="absolute inset-0 bg-muted translate-y-full group-hover:translate-y-0 transition-transform duration-700 opacity-10" />
              </Button>
            </form>
            
            <div className="mt-16 text-center flex flex-col gap-6">
              <button 
                onClick={() => router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`)}
                className="text-[10px] uppercase tracking-[0.4em] text-white/20 hover:text-muted transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                ALREADY_IDENTIFIED? LOGIN_HERE
              </button>
              <div className="h-px w-12 bg-white/5 mx-auto" />
              <button 
                onClick={() => router.push('/')}
                className="text-[10px] uppercase tracking-[0.4em] text-white/20 hover:text-white transition-colors"
              >
                ← RETURN_HOME
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
