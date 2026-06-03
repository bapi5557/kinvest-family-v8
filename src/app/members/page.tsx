"use client";

import { useEffect, useState } from "react";
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, updateDoc, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FamilyMember } from "@/app/lib/types";
import { MobileNav } from "@/components/layout/MobileNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, UserPlus, MoreVertical, Edit2, Trash2, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function MembersPage() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [newRel, setNewRel] = useState("");
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "members"), orderBy("name"));
    return onSnapshot(q, (snapshot) => {
      setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FamilyMember)));
    });
  }, []);

  const handleAddMember = async () => {
    if (!newName) return;
    await addDoc(collection(db, "members"), {
      name: newName,
      relationship: newRel,
      createdAt: Date.now()
    });
    setNewName("");
    setNewRel("");
    setIsDialogOpen(false);
  };

  const handleUpdateMember = async () => {
    if (!editingMember || !newName) return;
    await updateDoc(doc(db, "members", editingMember.id), {
      name: newName,
      relationship: newRel
    });
    setEditingMember(null);
    setNewName("");
    setNewRel("");
    setIsDialogOpen(false);
  };

  const handleDeleteMember = async (id: string) => {
    if (confirm("Delete this member and their history?")) {
      await deleteDoc(doc(db, "members", id));
    }
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.relationship.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-background">
      <header className="p-6 pt-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground">Registry</h1>
          <p className="text-muted-foreground">Manage family roster</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="icon" className="btn-cyan rounded-full w-12 h-12">
              <Plus className="w-6 h-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-none">
            <DialogHeader>
              <DialogTitle className="font-headline">{editingMember ? 'Edit Profile' : 'New Member'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input 
                placeholder="Full Name" 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)}
              />
              <Input 
                placeholder="Relationship (e.g. Father, Daughter)" 
                value={newRel} 
                onChange={(e) => setNewRel(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button onClick={editingMember ? handleUpdateMember : handleAddMember} className="btn-cyan w-full">
                {editingMember ? 'Save Changes' : 'Create Registry Entry'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="px-6 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            className="pl-10 bg-card/50 border-white/5 focus-visible:ring-accent" 
            placeholder="Search family..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <main className="px-6 space-y-3 fade-in">
        {filteredMembers.map((member) => (
          <div key={member.id} className="group relative">
            <Link href={`/members/${member.id}`} className="block">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-card/60 hover:bg-card border border-white/5 transition-all">
                <Avatar className="w-12 h-12 border-2 border-accent/20">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {member.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-headline font-semibold text-foreground">{member.name}</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{member.relationship}</p>
                </div>
              </div>
            </Link>
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <MoreVertical size={18} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-card border-none">
                  <DropdownMenuItem onClick={() => {
                    setEditingMember(member);
                    setNewName(member.name);
                    setNewRel(member.relationship);
                    setIsDialogOpen(true);
                  }}>
                    <Edit2 className="w-4 h-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteMember(member.id)}>
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}

        {filteredMembers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
            <UserPlus size={48} className="opacity-20" />
            <p>No members found in your family tree.</p>
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  );
}