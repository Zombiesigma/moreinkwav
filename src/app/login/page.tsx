'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, useUser, initiateEmailSignIn } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Lock, Mail, ArrowRight, Loader2, Music } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Navigation } from '@/components/Navigation';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const redirectPath = searchParams.get('redirect') || '/';

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push(redirectPath);
    }
  }, [user, isUserLoading, router, redirectPath]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      await initiateEmailSignIn(auth, email, password);
      toast({
        title: "SYNCED",
        description: "Welcome back. Identity verified.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: error.message || "Invalid parameters.",
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
    <div className="flex-grow flex items-center justify-center p-6 pt-32">
      <Card className="w-full max-w-md bg-[#1E201E]/80 border-white/10 rounded-none shadow-2xl relative z-10 backdrop-blur-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-muted to-transparent opacity-20" />
        
        <CardHeader className="text-center pt-16 pb-10">
          <div className="flex justify-center mb-8">
            <div className="p-6 bg-white/5 border border-white/10 rounded-full animate-pulse relative">
              <Music className="text-muted h-10 w-10" />
              <div className="absolute inset-0 border border-muted/20 rounded-full animate-ping" />
            </div>
          </div>
          <CardTitle className="font-headline text-6xl tracking-tighter text-white animate-flicker leading-none">
            LOGIN
          </CardTitle>
        </CardHeader>

        <CardContent className="p-10 md:p-14">
          <form onSubmit={handleLogin} className="space-y-10">
            <div className="space-y-4 group">
              <label className="text-[10px] uppercase tracking-[0.4em] font-black text-white/40 group-focus-within:text-muted transition-colors">EMAIL</label>
              <div className="relative">
                <Mail className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
                <Input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent border-0 border-b-2 border-white/10 focus:border-muted focus:ring-0 rounded-none h-14 pl-10 px-0 text-2xl font-headline transition-all placeholder:text-white/5" 
                  placeholder="fan@moreink.com"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-4 group">
              <label className="text-[10px] uppercase tracking-[0.4em] font-black text-white/40 group-focus-within:text-muted transition-colors">PASSWORD</label>
              <div className="relative">
                <Lock className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
                <Input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent border-0 border-b-2 border-white/10 focus:border-muted focus:ring-0 rounded-none h-14 pl-10 px-0 text-2xl font-headline transition-all placeholder:text-white/5" 
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
              className="w-full h-24 text-2xl group overflow-hidden"
            >
              {loading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <span className="relative z-10 flex items-center gap-4">
                  ENTER <ArrowRight className="h-8 w-8 group-hover:translate-x-3 transition-transform" />
                </span>
              )}
              <div className="absolute inset-0 bg-muted translate-y-full group-hover:translate-y-0 transition-transform duration-700 opacity-10" />
            </Button>
          </form>
          
          <div className="mt-16 text-center flex flex-col gap-6">
            <button 
              onClick={() => router.push(`/register?redirect=${encodeURIComponent(redirectPath)}`)}
              className="text-[10px] uppercase tracking-[0.4em] text-white/20 hover:text-muted transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              NEW ENTITY? REGISTER
            </button>
            <div className="h-px w-12 bg-white/5 mx-auto" />
            <button 
              onClick={() => router.push('/')}
              className="text-[10px] uppercase tracking-[0.4em] text-white/20 hover:text-white transition-colors"
            >
              ← RETURN HOME
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function FanLoginPage() {
  return (
    <main className="min-h-screen bg-black text-white relative flex flex-col">
      <Navigation />
      <div className="noise-overlay" />
      <div className="scan-line" />
      
      <Suspense fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-muted/20" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </main>
  );
}
