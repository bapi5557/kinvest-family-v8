"use client";

import { MobileNav } from "@/components/layout/MobileNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Lock, 
  FileText, 
  Share2, 
  Database, 
  Moon, 
  LogOut, 
  ChevronRight,
  ShieldCheck,
  Smartphone
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { toast } = useToast();

  const handleExport = () => {
    toast({
      title: "Generating PDF Report",
      description: "Your document is being prepared for export.",
    });
  };

  const handleBackup = () => {
    toast({
      title: "Backup Initialized",
      description: "Firestore synchronization in progress.",
    });
  };

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-background">
      <header className="p-6 pt-10">
        <h1 className="text-3xl font-headline font-bold text-foreground">Preferences</h1>
        <p className="text-muted-foreground">Kincash System Controls</p>
      </header>

      <main className="px-6 space-y-6 fade-in">
        {/* Account Section */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase text-accent tracking-widest ml-1">Family Security</h2>
          <Card className="bg-card/40 border-white/5 divide-y divide-white/5 overflow-hidden">
            <div className="p-4 flex items-center justify-between hover:bg-card/60 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-accent">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold">Family Profile</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Shared Account Settings</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </div>
            <div className="p-4 flex items-center justify-between hover:bg-card/60 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-accent">
                  <Lock size={18} />
                </div>
                <p className="text-sm font-semibold">Change Gateway PIN</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </div>
          </Card>
        </section>

        {/* Studio Section */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase text-accent tracking-widest ml-1">Document Studio</h2>
          <Card className="bg-card/40 border-white/5 divide-y divide-white/5 overflow-hidden">
            <div 
              className="p-4 flex items-center justify-between hover:bg-card/60 transition-colors cursor-pointer"
              onClick={handleExport}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-accent">
                  <FileText size={18} />
                </div>
                <p className="text-sm font-semibold">Export PDF Report</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </div>
            <div className="p-4 flex items-center justify-between hover:bg-card/60 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-accent">
                  <Share2 size={18} />
                </div>
                <p className="text-sm font-semibold">Share with Family</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </div>
          </Card>
        </section>

        {/* System Section */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase text-accent tracking-widest ml-1">System</h2>
          <Card className="bg-card/40 border-white/5 divide-y divide-white/5 overflow-hidden">
            <div 
              className="p-4 flex items-center justify-between hover:bg-card/60 transition-colors cursor-pointer"
              onClick={handleBackup}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-accent">
                  <Database size={18} />
                </div>
                <p className="text-sm font-semibold">Cloud Sync & Backup</p>
              </div>
              <div className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/20">LIVE</div>
            </div>
            <div className="p-4 flex items-center justify-between hover:bg-card/60 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-accent">
                  <Moon size={18} />
                </div>
                <p className="text-sm font-semibold">System Dark Mode</p>
              </div>
              <Switch checked={true} />
            </div>
          </Card>
        </section>

        <Button variant="ghost" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 h-14 border border-destructive/10">
          <LogOut size={18} className="mr-2" />
          TERMINATE SESSION
        </Button>

        <div className="flex flex-col items-center justify-center gap-1 py-4 opacity-30">
          <ShieldCheck size={20} />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Kincash Enterprise v1.0.4</p>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}