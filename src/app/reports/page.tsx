"use client";

import { useEffect, useState } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Expense } from "@/app/lib/types";
import { MobileNav } from "@/components/layout/MobileNav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Sparkles, BarChart, PieChart, Info } from "lucide-react";
import { smartSpendingInsights, SmartSpendingInsightsOutput } from "@/ai/flows/smart-spending-insights";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart as ReBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, Pie, PieChart as RePieChart } from "recharts";

export default function ReportsPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [aiResult, setAiResult] = useState<SmartSpendingInsightsOutput | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "expenses"), orderBy("date", "desc"));
    return onSnapshot(q, (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense)));
    });
  }, []);

  const categoryTotals = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
  const COLORS = ['#85DAE8', '#395B96', '#546E7A', '#78909C', '#B0BEC5', '#CFD8DC', '#ECEFF1'];

  const getAiInsights = async () => {
    if (Object.keys(categoryTotals).length === 0) return;
    setLoadingAi(true);
    try {
      const result = await smartSpendingInsights({
        monthlySpending: categoryTotals,
        spendingHistorySummary: `Total expenses recorded: ${expenses.length}. Total amount: $${expenses.reduce((a, b) => a + b.amount, 0)}`,
        familyMembers: Array.from(new Set(expenses.map(e => e.memberName)))
      });
      setAiResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-background">
      <header className="p-6 pt-10">
        <h1 className="text-3xl font-headline font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">Spending patterns & AI insights</p>
      </header>

      <main className="px-6 space-y-6 fade-in">
        <Card className="glass-card border-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-headline text-accent">Kincash AI Assistant</CardTitle>
                <CardDescription>Generative spending analysis</CardDescription>
              </div>
              <Sparkles className="text-accent animate-pulse" />
            </div>
          </CardHeader>
          <CardContent>
            {!aiResult ? (
              <Button 
                onClick={getAiInsights} 
                disabled={loadingAi || Object.keys(categoryTotals).length === 0}
                className="w-full btn-cyan font-bold"
              >
                {loadingAi ? "ANALYZING LEDGER..." : "GENERATE SMART INSIGHTS"}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <h4 className="text-xs font-bold uppercase text-accent mb-2">Spending Analysis</h4>
                  <p className="text-sm leading-relaxed text-foreground/90">{aiResult.spendingAnalysis}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-accent">Personalized Tips</h4>
                  {aiResult.savingsTips.map((tip, i) => (
                    <div key={i} className="flex gap-2 items-start text-xs bg-card/50 p-2 rounded-lg border border-white/5">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={() => setAiResult(null)} className="w-full text-muted-foreground">Reset Analysis</Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full grid grid-cols-2 bg-card border border-white/5">
            <TabsTrigger value="overview">Category View</TabsTrigger>
            <TabsTrigger value="history">Member View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-4">
            <Card className="bg-card/40 border-none">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Expenses by Category</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1E232E', border: 'none', borderRadius: '8px' }}
                        itemStyle={{ color: '#85DAE8' }}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground italic">No data to visualize</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="mt-4">
             <Card className="bg-card/40 border-none">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Expense Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {chartData.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>{item.name}</span>
                        <span className="font-bold">${item.value.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-accent" 
                          style={{ width: `${(item.value / expenses.reduce((a,b)=>a+b.amount,0)) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <MobileNav />
    </div>
  );
}