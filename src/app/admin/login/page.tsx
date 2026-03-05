'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser, initiateEmailSignIn, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { doc } from 'firebase/firestore';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const adminDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'roles_admin', user.uid);
  }, [db, user]);

  const { data: adminDoc, isLoading: isAdminChecking } = useDoc(adminDocRef);

  useEffect(() => {
    if (user && !isUserLoading && adminDoc) {
      router.push('/admin');
    }
  }, [user, isUserLoading, adminDoc, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) return;

    setLoading(true);
    try {
      await initiateEmailSignIn(auth, cleanEmail, cleanPassword);
    } catch (error: any) {
      console.error("Admin Login Error:", error.code);
      let message = "Check your admin credentials.";
      if (error.code === 'auth/invalid-credential') {
        message = "Incorrect email or password for admin access.";
      }
      
      toast({
        variant: "destructive",
        title: "Login Gagal",
        description: message,
      });
      setLoading(false);
    }
  };

  if (isUserLoading || (user && isAdminChecking)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-white/20" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      <div className="noise-overlay" />
      
      <Card className="w-full max-w-md bg-[#1E201E] border-white/10 rounded-none shadow-2xl relative z-10 backdrop-blur-xl">
        <CardHeader className="text-center pt-12">
          <CardTitle className="font-headline text-5xl tracking-tighter text-white animate-flicker">
            ADMIN_ACCESS
          </CardTitle>
          <p className="text-[10px] uppercase tracking-[0.6em] text-white/40 mt-4">Authorized Beings Only</p>
        </CardHeader>
        <CardContent className="p-10">
          {user && !adminDoc && !isAdminChecking && (
            <div className="mb-8 p-4 border border-white/20 bg-white/5 text-white/60 text-xs uppercase tracking-widest text-center italic">
              LOGGED_IN_BUT_NOT_ADMIN
              <button 
                onClick={() => auth.signOut()}
                className="block w-full mt-2 underline opacity-50 hover:opacity-100"
              >
                SIGN_OUT
              </button>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.4em] font-black text-white/40">EMAIL</label>
              <div className="relative">
                <Mail className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
                <Input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent border-0 border-b-2 border-white/10 focus:border-white rounded-none h-14 pl-10 px-0 text-xl font-headline transition-all" 
                  placeholder="name@moreink.com"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.4em] font-black text-white/40">PASSWORD</label>
              <div className="relative">
                <Lock className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
                <Input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent border-0 border-b-2 border-white/10 focus:border-white rounded-none h-14 pl-10 px-0 text-xl font-headline transition-all" 
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
              className="w-full h-24 text-xl"
            >
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  ENTER_DASHBOARD
                  <ArrowRight className="ml-4 h-8 w-8 group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-12 text-center flex flex-col gap-4">
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
  );
}
