'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

/**
 * @fileOverview Listener global untuk error Firebase.
 * Sekarang menggunakan Toast daripada 'throw' langsung untuk menghindari crash aplikasi yang tidak perlu.
 */
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      console.error('Firestore Error Captured:', error);
      
      // Menampilkan toast alih-alih meledakkan aplikasi
      toast({
        variant: "destructive",
        title: "ACCESS_DENIED",
        description: "Your frequency does not have enough authority for this action.",
      });
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  return null;
}
