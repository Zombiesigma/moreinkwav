'use client';

import React, { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, doc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MapPin, Plus, Trash2, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function TourManager() {
  const db = useFirestore();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const tourQuery = useMemoFirebase(() => query(collection(db, 'tour_dates'), orderBy('date', 'asc')), [db]);
  const { data: shows, isLoading } = useCollection(tourQuery);

  const handleAddShow = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const venue = formData.get('venue') as string;
    const city = formData.get('city') as string;
    const date = formData.get('date') as string;
    const ticketUrl = formData.get('ticketUrl') as string;

    if (!venue || !city || !date) {
      toast({ variant: "destructive", title: "DATA_INCOMPLETE", description: "Venue, City, and Date are required." });
      return;
    }

    setSubmitting(true);
    const showId = `show-${Date.now()}`;
    const showRef = doc(db, 'tour_dates', showId);
    
    const showData = {
      id: showId,
      venueName: venue,
      city,
      date: new Date(date).toISOString(),
      isUpcoming: new Date(date) >= new Date(),
      ticketPurchaseUrl: ticketUrl || '#',
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(showRef, showData);
      toast({ title: "ROAD_UPDATED", description: `Show at ${venue} added.` });
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: showRef.path,
        operation: 'create',
        requestResourceData: showData
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteShow = async (id: string) => {
    if (confirm('Remove this show from the road map?')) {
      try {
        await deleteDoc(doc(db, 'tour_dates', id));
        toast({ title: "SHOW_REMOVED", description: "Tour date deleted." });
      } catch (err) {
        toast({ variant: "destructive", title: "Error", description: "Failed to delete show." });
      }
    }
  };

  return (
    <div className="space-y-12">
      <Card className="bg-white/5 border-white/10 rounded-none overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-accent opacity-20" />
        <CardHeader className="pt-10">
          <CardTitle className="font-headline text-4xl tracking-tighter text-muted uppercase">ADD_ROAD_STOP</CardTitle>
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 mt-2">Expanding the tour frequency</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddShow} className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2 group">
                <label className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-black group-focus-within:text-muted transition-colors">VENUE</label>
                <Input name="venue" placeholder="e.g. THE PIT" className="bg-transparent border-0 border-b-2 border-white/10 rounded-none h-12 font-headline text-xl focus:border-muted transition-all" required />
              </div>
              <div className="space-y-2 group">
                <label className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-black group-focus-within:text-muted transition-colors">CITY</label>
                <Input name="city" placeholder="e.g. CIPUTAT" className="bg-transparent border-0 border-b-2 border-white/10 rounded-none h-12 font-headline text-xl focus:border-muted transition-all" required />
              </div>
              <div className="space-y-2 group">
                <label className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-black group-focus-within:text-muted transition-colors">DATE</label>
                <Input name="date" type="date" className="bg-transparent border-0 border-b-2 border-white/10 rounded-none h-12 font-headline text-xl focus:border-muted transition-all invert opacity-60" required />
              </div>
              <div className="space-y-2 group">
                <label className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-black group-focus-within:text-muted transition-colors">TICKET_URL</label>
                <Input name="ticketUrl" placeholder="https://..." className="bg-transparent border-0 border-b-2 border-white/10 rounded-none h-12 font-body text-sm focus:border-muted transition-all" />
              </div>
            </div>
            
            <Button disabled={submitting} variant="impact" size="xl" className="w-full h-20 text-xl">
              {submitting ? <Loader2 className="animate-spin" /> : <><Plus className="mr-4" /> ADD_TO_ROAD</>}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-8">
        <div className="flex items-end justify-between border-b border-white/10 pb-6">
          <h3 className="text-5xl font-headline tracking-tighter text-muted uppercase">ACTIVE_ROAD</h3>
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 mb-1">Scheduled resonance</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin h-12 w-12 text-white/10" /></div>
        ) : (
          <div className="grid gap-4">
            {shows?.map(show => (
              <div key={show.id} className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-8 bg-[#1E201E] border border-white/5 hover:border-muted/30 transition-all duration-500 shadow-xl">
                <div className="flex items-center gap-8 mb-6 sm:mb-0">
                  <div className="font-headline text-4xl text-muted/40 border-r border-white/10 pr-8">
                    {new Date(show.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}
                  </div>
                  <div>
                    <h4 className="font-headline text-3xl uppercase tracking-tighter text-muted group-hover:text-glow transition-all">{show.venueName}</h4>
                    <p className="text-[10px] tracking-[0.5em] text-white/20 uppercase font-black mt-1 flex items-center gap-2"><MapPin size={10} /> {show.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                  <span className={cn(
                    "text-[8px] font-black uppercase tracking-widest px-4 py-2 border",
                    show.isUpcoming ? "border-accent/40 text-accent" : "border-white/5 text-white/5"
                  )}>
                    {show.isUpcoming ? 'UPCOMING' : 'PASSED'}
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteShow(show.id)} className="text-white/10 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>
            ))}

            {(!shows || shows.length === 0) && (
              <div className="py-32 border-2 border-dashed border-white/5 text-center flex flex-col items-center justify-center opacity-10">
                <CalendarIcon size={48} className="mb-6 text-muted" />
                <p className="font-headline text-3xl uppercase tracking-widest">ROAD_IS_EMPTY</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
