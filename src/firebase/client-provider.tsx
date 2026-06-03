'use client';

import React, { useEffect, useState } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { AlertCircle, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { firebaseConfig } from './config';

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const [firebase, setFirebase] = useState<{
    firebaseApp: FirebaseApp;
    firestore: Firestore;
    auth: Auth;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isConfigDummy = firebaseConfig.apiKey === 'dummy-api-key';

  useEffect(() => {
    try {
      const instances = initializeFirebase();
      setFirebase(instances);
    } catch (err: any) {
      console.error("Firebase initialization failed:", err);
      setError(err.message || "Could not initialize Firebase core services.");
    }
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-6">
        <div className="flex flex-col items-center text-center gap-6 max-w-md glass-card p-8 rounded-2xl">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
            <AlertCircle size={32} />
          </div>
          <div>
            <h1 className="text-xl font-headline font-bold text-foreground">Configuration Error</h1>
            <p className="text-muted-foreground text-sm mt-2">The application encountered a terminal error while connecting to Firebase.</p>
            <div className="mt-4 p-3 bg-black/20 rounded-lg text-xs font-mono text-destructive break-all text-left">
              {error}
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
            RETRY INITIALIZATION
          </Button>
        </div>
      </div>
    );
  }

  if (isConfigDummy && !firebase) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-6">
        <div className="flex flex-col items-center text-center gap-4 max-w-md">
          <Terminal size={48} className="text-accent animate-pulse" />
          <h2 className="text-lg font-headline font-bold uppercase tracking-widest">Awaiting Config</h2>
          <p className="text-muted-foreground text-sm">
            Kincash is waiting for the Firebase configuration to be provided. 
            Ensure you have connected a project in the Firebase Console.
          </p>
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden mt-4">
            <div className="h-full bg-accent animate-[loading_2s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>
    );
  }

  if (!firebase) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          <p className="text-muted-foreground font-headline text-sm animate-pulse uppercase">Booting Financial Gateway...</p>
        </div>
      </div>
    );
  }

  return (
    <FirebaseProvider
      firebaseApp={firebase.firebaseApp}
      firestore={firebase.firestore}
      auth={firebase.auth}
    >
      {children}
    </FirebaseProvider>
  );
}
