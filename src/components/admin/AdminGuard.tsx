'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase, useAuth } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2, ShieldAlert, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();

  const adminDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'roles_admin', user.uid);
  }, [db, user]);

  const { data: adminDoc, isLoading: isAdminLoading } = useDoc(adminDocRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      // Redirect to main login with a redirect back to admin
      router.push('/login?redirect=/admin');
    }
  }, [user, isUserLoading, router]);

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/login');
  };

  if (isUserLoading || (user && isAdminLoading)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-white/20" />
      </div>
    );
  }

  if (!user) {
    return null; 
  }

  if (!adminDoc) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="noise-overlay" />
        <ShieldAlert className="h-24 w-24 text-muted mb-8 animate-pulse relative z-10" />
        <h1 className="text-5xl font-headline mb-4 tracking-tighter relative z-10 uppercase">UNAUTHORIZED_BEING</h1>
        <p className="text-white/40 font-body text-xl max-w-md mb-12 italic uppercase tracking-widest relative z-10">
          Your identity does not match the administrative authority of the void. 
          <br/><span className="text-[10px] mt-6 block opacity-20">UID: {user.uid}</span>
        </p>
        <div className="flex flex-col gap-4 relative z-10 w-full max-w-xs">
          <Button 
            onClick={handleSignOut}
            className="bg-[#1E201E] text-white border border-white/10 font-headline h-20 px-12 rounded-none hover:bg-white hover:text-black w-full tracking-widest text-lg transition-all"
          >
            DISCONNECT_SESSION
          </Button>
          <Button 
            variant="ghost"
            onClick={() => router.push('/')}
            className="text-white/20 hover:text-white uppercase tracking-widest text-[10px]"
          >
            ← RETURN_TO_VOID
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
