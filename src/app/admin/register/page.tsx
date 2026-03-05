'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser, initiateEmailSignUp, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { doc } from 'firebase/firestore';

export default function AdminRegisterPage() {
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      const userCredential = await initiateEmailSignUp(auth, email, password);
      const newUser = userCredential.user;

      // Create Admin Role & Profile
      const userProfileRef = doc(db, 'users', newUser.uid);
      const adminRoleRef = doc(db, 'roles_admin', newUser.uid);

      setDocumentNonBlocking(userProfileRef, {
        uid: newUser.uid,
        email: newUser.email,
        role: 'admin',
        createdAt: new Date().toISOString(),
      }, { merge: true });

      setDocumentNonBlocking(adminRoleRef, {
        uid: newUser.uid,
        assignedAt: new Date().toISOString(),
      }, { merge: true });

      toast({
        title: "INITIALIZING",
        description: "Welcome to the void. Admin access granted.",
      });

      router.push('/admin');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "Something went wrong.",
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
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden text-white">
      <div className="noise-overlay" />
      
      <Card className="w-full max-w-md bg-white/[0.02] border-white/10 rounded-none shadow-2xl relative z-10 backdrop-blur-xl">
        <CardHeader className="text-center pt-12">
          <CardTitle className="font-headline text-5xl tracking-tighter animate-flicker">
            JOIN_THE_VOID
          </CardTitle>
          <p className="text-[10px] uppercase tracking-[0.6em] text-white/40 mt-4">Become a New Entity</p>
        </CardHeader>
        <CardContent className="p-10">
          <form onSubmit={handleRegister} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.4em] font-black text-white/40">EMAIL</label>
              <div className="relative">
                <Mail className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
                <Input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent border-0 border-b-2 border-white/10 focus:border-white rounded-none h-14 pl-10 px-0 text-xl font-headline transition-all placeholder:text-white/10" 
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
                  className="bg-transparent border-0 border-b-2 border-white/10 focus:border-white rounded-none h-14 pl-10 px-0 text-xl font-headline transition-all placeholder:text-white/10" 
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-20 bg-white text-black hover:invert transition-all text-xl font-headline tracking-widest rounded-none shadow-[10px_10px_0px_rgba(255,255,255,0.1)] group"
            >
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  INITIALIZE_VOID
                  <ArrowRight className="ml-4 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-12 text-center flex flex-col gap-4">
            <button 
              onClick={() => router.push('/admin/login')}
              className="text-[10px] uppercase tracking-[0.4em] text-white/20 hover:text-white transition-colors"
            >
              ALREADY_HAVE_ACCESS? LOGIN
            </button>
            <button 
              onClick={() => router.push('/')}
              className="text-[10px] uppercase tracking-[0.4em] text-white/20 hover:text-white transition-colors"
            >
              ← RETURN_TO_VOID
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
