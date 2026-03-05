'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

/**
 * @fileOverview Inisialisasi SDK Firebase.
 * Menggunakan config eksplisit untuk memastikan stabilitas di lingkungan Vercel.
 */
export function initializeFirebase() {
  // Jika sudah ada app yang terinisialisasi, gunakan yang sudah ada
  if (getApps().length > 0) {
    return getSdks(getApp());
  }

  // Gunakan config statis secara eksplisit.
  // Ini menghindari kegagalan deteksi lingkungan di platform non-Firebase (Vercel).
  const firebaseApp = initializeApp(firebaseConfig);

  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
