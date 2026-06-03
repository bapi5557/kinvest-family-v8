"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, where, getDoc, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Expense, ExpenseCategory, FamilyMember } from "@/app/lib/types";
import { MobileNav } from "@/components/layout/MobileNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, ChevronRight, Trash2, DollarSign, Calendar as CalendarIcon, Tag } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES: ExpenseCategory[] = [
  'Electric Bill', 'LPG Cylinder', 'House Rent', 'Groceries', 'Medical', 'Education', 'Other Expenses'
];

export default function MemberProfile() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [member, setMember] = useState<FamilyMember | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAmount, setNewAmount] = useState("");
  const [newCategory, setNewCategory] = useState<ExpenseCategory>("Groceries");
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchMember = async () => {
      const docRef = doc(db, "members", id as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setMember({ id: docSnap.id, ...docSnap.data() } as FamilyMember);
      }
    };

    const q = query(
      collection(db, "expenses"), 
      where("memberId", "==", id),
      orderBy("date", "desc")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense)));
    });

    fetchMember();
    return unsub;
  }, [id]);

  const handleAddExpense = async () => {
    if (!newAmount || !member) return;
    try {
      await addDoc(collection(db, "expenses"), {
        memberId: member.id,
        memberName: member.name,
        amount: parseFloat(newAmount),
        category: newCategory,
        note: newNote,
        date: Date.now()
      });
      setNewAmount("");
      setNewNote("");
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error saving expense",
        description: "Please check your inputs and try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (confirm("Remove this transaction?")) {
      await deleteDoc(doc(db, "expenses", expenseId));
    }
  };

  if (!member) return <div className="p-10 text-center">Loading registry...</div>;

  const memberTotal = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-background">
      <header className="p-6 pt-10">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mb-4 -ml-2 text-muted-foreground">
          <ArrowLeft size={24} />
        </Button>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-headline font-bold text-foreground">{member.name}</h1>
            <p className="text-accent uppercase tracking-tighter text-sm font-semibold">{member.relationship}</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-muted-foreground uppercase block">Life Spending</span>
            <span className="text-2xl font-headline font-bold text-foreground">${memberTotal.toLocaleString()}</span>
          </div>
        </div>
      </header>

      <main className="px-6 space-y-6 fade-in">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full btn-cyan py-6 font-headline font-bold gap-2 rounded-2xl">
              <Plus className="w-5 h-5" />
              RECORD NEW EXPENSE
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-none">
            <DialogHeader>
              <DialogTitle className="font-headline">Add Expense for {member.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Amount ($)</label>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  value={newAmount} 
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="text-xl h-14 bg-card/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Category</label>
                <Select value={newCategory} onValueChange={(v) => setNewCategory(v as ExpenseCategory)}>
                  <SelectTrigger className="h-12 bg-card/50">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="glass-card">
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Short Note (Optional)</label>
                <Input 
                  placeholder="What was this for?" 
                  value={newNote} 
                  onChange={(e) => setNewNote(e.target.value)}
                  className="bg-card/50"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddExpense} className="btn-cyan w-full h-12 font-bold">
                CONFIRM TRANSACTION
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="space-y-4">
          <h2 className="text-lg font-headline font-semibold">Ledger History</h2>
          <div className="space-y-3">
            {expenses.map((expense) => (
              <Card key={expense.id} className="bg-card/40 border-white/5 horizontal-slide-enter">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-accent">
                      <Tag size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{expense.category}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-medium">{format(expense.date, 'MMMM d, yyyy')}</p>
                      {expense.note && <p className="text-xs text-muted-foreground italic mt-0.5">"{expense.note}"</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-headline font-bold text-foreground">-${expense.amount.toFixed(2)}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive/50 hover:text-destructive"
                      onClick={() => handleDeleteExpense(expense.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {expenses.length === 0 && (
              <div className="text-center py-20 text-muted-foreground italic">
                No transactions recorded yet.
              </div>
            )}
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}