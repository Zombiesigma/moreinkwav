
'use client';

import React from 'react';
import { useFirestore, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MapPin, Plus, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function TourManager() {
  const db = useFirestore();
  const { toast } = useToast();

  const tourQuery = useMemoFirebase(() => collection(db, 'tour_dates'), [db]);
  const { data: shows, isLoading } = useCollection(tourQuery);

  const handleAddShow = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const venue = formData.get('venue') as string;
    const city = formData.get('city') as string;
    const date = formData.get('date') as string;

    if (!venue || !city || !date) return;

    const showId = `${date}-${venue.toLowerCase().replace(/\s+/g, '-')}`;
    const showRef = doc(db, 'tour_dates', showId);
    
    const showData = {
      id: showId,
      venueName: venue,
      city,
      country: 'ID',
      date: new Date(date).toISOString(),
      isUpcoming: true,
      ticketPurchaseUrl: '#',
    };

    setDoc(showRef, showData)
      .then(() => toast({ title: "ROAD_UPDATED", description: `Show at ${venue} added.` }))
      .catch(err => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: showRef.path,
          operation: 'create',
          requestResourceData: showData
        }));
      });

    (e.target as HTMLFormElement).reset();
  };

  const handleDeleteShow = (id: string) => {
    deleteDoc(doc(db, 'tour_dates', id));
  };

  return (
    <div className="space-y-12">
      <Card className="bg-white/5 border-white/10 rounded-none">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">ADD_ROAD_STOP</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddShow} className="grid md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.4em] text-white/40">VENUE</label>
              <Input name="venue" className="bg-transparent border-b-2 border-white/10 rounded-none h-12 font-headline" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.4em] text-white/40">CITY</label>
              <Input name="city" className="bg-transparent border-b-2 border-white/10 rounded-none h-12 font-headline" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.4em] text-white/40">DATE</label>
              <Input name="date" type="date" className="bg-transparent border-b-2 border-white/10 rounded-none h-12 font-headline" />
            </div>
            <Button variant="brush" size="lg" className="h-12 w-full text-xs">
              ADD_STOP
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {shows?.map(show => (
          <div key={show.id} className="flex items-center justify-between p-6 border border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-8">
              <div className="font-headline text-3xl text-white/20">
                {new Date(show.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}
              </div>
              <div>
                <h4 className="font-headline text-2xl uppercase">{show.venueName}</h4>
                <p className="text-[10px] tracking-widest text-white/40 uppercase">{show.city}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => handleDeleteShow(show.id)} className="text-red-500 hover:bg-red-500/10">
              <Trash2 size={18} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
