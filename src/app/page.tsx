"use client";

import { useEffect, useState } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Expense, FamilyMember } from "@/app/lib/types";
import { MobileNav } from "@/components/layout/MobileNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Wallet, TrendingUp, Users as UsersIcon, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";

export default function Dashboard() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const qMembers = query(collection(db, "members"), orderBy("name"));
    const qExpenses = query(collection(db, "expenses"), orderBy("date", "desc"));

    const unsubMembers = onSnapshot(qMembers, (snapshot) => {
      setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FamilyMember)));
    });

    const unsubExpenses = onSnapshot(qExpenses, (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense)));
      setLoading(false);
    });

    return () => {
      unsubMembers();
      unsubExpenses();
    };
  }, []);

  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const currentMonthExpenses = expenses.filter(e => {
    const date = new Date(e.date);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });
  const monthTotal = currentMonthExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-background">
      <header className="p-6 pt-10">
        <h1 className="text-3xl font-headline font-bold text-foreground">Kincash</h1>
        <p className="text-muted-foreground mt-1">Family Financial Gateway</p>
      </header>

      <main className="px-6 space-y-6 fade-in">
        {/* Total Summary Card */}
        <Card className="glass-card border-none overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wallet size={80} />
          </div>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
              Monthly Family Spending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-headline font-bold text-accent">
              ${monthTotal.toLocaleString()}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <TrendingUp className="text-emerald-400 w-4 h-4" />
              <span className="text-xs text-muted-foreground">Budget: $5,000</span>
            </div>
            <Progress value={(monthTotal / 5000) * 100} className="mt-2 h-1.5 bg-muted" />
          </CardContent>
        </Card>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-primary/20 border-primary/30">
            <CardContent className="p-4 flex flex-col gap-1">
              <UsersIcon className="text-accent w-5 h-5 mb-1" />
              <span className="text-xs text-muted-foreground">Members</span>
              <span className="text-xl font-headline font-bold">{members.length}</span>
            </CardContent>
          </Card>
          <Card className="bg-secondary border-none">
            <CardContent className="p-4 flex flex-col gap-1">
              <TrendingUp className="text-accent w-5 h-5 mb-1" />
              <span className="text-xs text-muted-foreground">Total Exp</span>
              <span className="text-xl font-headline font-bold">${totalExpense.toLocaleString()}</span>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-headline font-semibold">Recent Ledger</h2>
            <Link href="/members">
              <Button variant="link" className="text-accent text-xs p-0">View All</Button>
            </Link>
          </div>
          
          <div className="space-y-3">
            {expenses.slice(0, 5).map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-4 rounded-xl bg-card/40 border border-white/5 horizontal-slide-enter">
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">{expense.category}</span>
                  <span className="text-xs text-muted-foreground">{expense.memberName} • {format(expense.date, 'MMM d')}</span>
                </div>
                <div className="font-headline font-bold text-accent">
                  -${expense.amount.toFixed(2)}
                </div>
              </div>
            ))}
            {expenses.length === 0 && !loading && (
              <div className="text-center py-10 text-muted-foreground italic">
                No records yet. Start by adding a member.
              </div>
            )}
          </div>
        </div>

        <Link href="/members" className="block">
          <Button className="w-full btn-cyan py-6 font-headline font-bold gap-2">
            <PlusCircle className="w-5 h-5" />
            RECORD EXPENSE
          </Button>
        </Link>
      </main>

      <MobileNav />
    </div>
  );
}