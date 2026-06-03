
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Wallet } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Welcome back!",
        description: "Successfully authenticated with the family gateway.",
      });
      router.push('/');
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials or network error.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-pulse text-accent font-headline font-bold">VERIFYING GATEWAY...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
      <div className="mb-8 flex flex-col items-center text-center gap-2">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-accent shadow-xl shadow-primary/20">
          <Wallet size={32} />
        </div>
        <h1 className="text-3xl font-headline font-bold text-foreground mt-4">Kincash</h1>
        <p className="text-muted-foreground uppercase tracking-widest text-xs font-semibold">Family Financial Gateway</p>
      </div>

      <Card className="w-full max-w-md glass-card border-none">
        <CardHeader>
          <CardTitle className="font-headline">Sign In</CardTitle>
          <CardDescription>Access your family ledger</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-muted-foreground">Family Email</label>
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
              <label className="text-xs font-semibold uppercase text-muted-foreground">Gateway PIN / Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-card/50 h-12"
              />
            </div>
            <Button type="submit" className="w-full btn-cyan py-6 font-bold" disabled={loading}>
              {loading ? "AUTHENTICATING..." : "ENTER GATEWAY"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            New family? <Link href="/register" className="text-accent hover:underline">Create a registry</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
