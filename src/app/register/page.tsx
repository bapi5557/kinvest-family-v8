'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Wallet, Info, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { firebaseConfig } from '@/firebase/config';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const isConfigDummy = firebaseConfig.apiKey === 'dummy-api-key';

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isConfigDummy) {
      toast({
        title: "Configuration Missing",
        description: "Please connect a real Firebase project in the Studio UI first.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Firebase requires at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "The confirmation password does not match.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        toast({
          title: "Registry Created",
          description: "Welcome to Kincash!",
        });
        router.push('/');
      }
    } catch (error: any) {
      let message = "An error occurred during registration.";
      if (error.code === 'auth/operation-not-allowed') {
        message = "Email/Password sign-in is disabled in your Firebase Console.";
      } else if (error.code === 'auth/email-already-in-use') {
        message = "This family email is already registered.";
      }
      toast({
        title: "Registration Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
      <div className="mb-8 flex flex-col items-center text-center gap-2">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-accent shadow-xl shadow-primary/20">
          <Wallet size={32} />
        </div>
        <h1 className="text-3xl font-headline font-bold text-foreground mt-4">Kincash</h1>
        <p className="text-muted-foreground uppercase tracking-widest text-xs font-semibold">Join the Financial Hub</p>
      </div>

      {isConfigDummy && (
        <Card className="max-w-md w-full mb-6 border-amber-500/20 bg-amber-500/5">
          <CardContent className="pt-6">
            <div className="flex gap-3 text-amber-500">
              <Info className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="space-y-4">
                <div>
                  <p className="font-bold uppercase text-xs mb-1">Step 1: Connect Project</p>
                  <p className="text-xs">Click the "Connect" button in the Studio interface.</p>
                </div>
                <div>
                  <p className="font-bold uppercase text-xs mb-1">Step 2: Enable Services</p>
                  <ul className="text-xs list-disc list-inside space-y-1">
                    <li>Enable **Email/Password** in Firebase Auth.</li>
                    <li>Create a **Firestore** database in test mode.</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!isConfigDummy && (
        <div className="max-w-md w-full mb-6 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-500">
          <CheckCircle2 className="w-4 h-4" />
          <p className="text-[10px] font-bold uppercase tracking-widest">Firebase Gateway Active</p>
        </div>
      )}

      <Card className="w-full max-w-md glass-card border-none">
        <CardHeader>
          <CardTitle className="font-headline">Create Registry</CardTitle>
          <CardDescription>Setup your shared family account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-muted-foreground">Shared Family Email</label>
              <Input
                type="email"
                placeholder="family@kincash.app"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-card/50 h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-muted-foreground">PIN / Password (min 6 chars)</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-card/50 h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-muted-foreground">Confirm PIN</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-card/50 h-12"
              />
            </div>
            <Button type="submit" className="w-full btn-cyan py-6 font-bold" disabled={loading || isConfigDummy}>
              {loading ? "INITIALIZING..." : "CREATE FAMILY REGISTRY"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            Already have an account? <Link href="/login" className="text-accent hover:underline">Sign in</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}