'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Disable admin registration via UI, redirect to home
    router.push('/');
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white font-headline text-xl animate-pulse">ACCESS_RESTRICTED</div>
    </div>
  );
}
