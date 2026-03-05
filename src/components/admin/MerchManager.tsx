'use client';

import React, { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, doc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ShoppingBag, Plus, Trash2, Loader2, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadToGithub } from '@/app/actions/github-upload';

export function MerchManager() {
  const db = useFirestore();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const merchQuery = useMemoFirebase(() => query(collection(db, 'merch'), orderBy('createdAt', 'desc')), [db]);
  const { data: merchItems, isLoading } = useCollection(merchQuery);

  const handleAddMerch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const price = formData.get('price') as string;
    const description = formData.get('description') as string;
    const file = formData.get('image') as File;

    if (!name || !price || file.size === 0) {
      toast({ 
        variant: "destructive", 
        title: "DATA_INCOMPLETE", 
        description: "Name, Price, and Image are required for merchandise resonance." 
      });
      return;
    }

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      const imageUrl = await uploadToGithub(uploadFormData);

      const merchId = `merch-${Date.now()}`;
      const merchRef = doc(db, 'merch', merchId);
      
      const merchData = {
        id: merchId,
        name,
        price,
        description: description || '',
        imageUrl,
        createdAt: new Date().toISOString()
      };

      setDoc(merchRef, merchData)
        .then(() => toast({ title: "MERCH_CAPTURED", description: `${name} synced to the void.` }))
        .catch(err => {
           errorEmitter.emit('permission-error', new FirestorePermissionError({
             path: merchRef.path,
             operation: 'create',
             requestResourceData: merchData
           }));
        });
      
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Upload Failed", description: error.message });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMerch = (id: string) => {
    if (confirm('Disconnect this item from the collection?')) {
      deleteDoc(doc(db, 'merch', id));
      toast({ title: "MERCH_DISCONNECTED", description: "Item removed from the void." });
    }
  };

  return (
    <div className="space-y-16">
      <Card className="bg-white/5 border-white/10 rounded-none overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-muted opacity-20" />
        <CardHeader className="pt-10">
          <CardTitle className="font-headline text-4xl tracking-tighter text-muted uppercase">CREATE_GOODS</CardTitle>
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 mt-2">Inject New Material Resonance</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddMerch} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4 group">
                <label className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-black group-focus-within:text-muted transition-colors">PRODUCT_NAME</label>
                <Input name="name" placeholder="e.g. VOID T-SHIRT" className="bg-transparent border-0 border-b-2 border-white/10 rounded-none h-14 font-headline text-2xl focus:border-muted transition-all" />
              </div>
              <div className="space-y-4 group">
                <label className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-black group-focus-within:text-muted transition-colors">PRICE (IDR)</label>
                <Input name="price" placeholder="e.g. 250K" className="bg-transparent border-0 border-b-2 border-white/10 rounded-none h-14 font-headline text-2xl focus:border-muted transition-all" />
              </div>
            </div>

            <div className="space-y-4 group">
              <label className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-black group-focus-within:text-muted transition-colors">DESCRIPTION</label>
              <Textarea name="description" placeholder="A brief material whisper..." className="bg-transparent border-2 border-white/10 rounded-none min-h-[120px] p-6 font-body text-xl focus:border-muted transition-all" />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-black">PRODUCT_VISUAL (IMAGE)</label>
              <Input name="image" type="file" accept="image/*" className="bg-white/5 border-white/10 rounded-none h-14 file:bg-transparent file:border-0 file:text-muted file:font-headline file:mr-4" />
            </div>

            <Button disabled={uploading} variant="impact" size="xl" className="w-full h-24 text-2xl">
              {uploading ? <Loader2 className="animate-spin h-8 w-8" /> : <><ShoppingBag className="mr-4 h-8 w-8" /> SYNC_TO_COLLECTION</>}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-12">
        <div className="flex items-end justify-between border-b border-white/10 pb-6">
          <h3 className="text-5xl font-headline tracking-tighter text-muted">MATERIAL_VAULT</h3>
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 mb-1">Active Goods</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {merchItems?.map((item, idx) => (
            <div key={item.id} className="group relative bg-[#1E201E] border border-white/5 overflow-hidden animate-fade-in hover:border-muted/30 transition-all duration-700 shadow-2xl">
              <div className="relative aspect-[4/5] overflow-hidden bg-black">
                <img src={item.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" alt={item.name} />
                
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <Button variant="destructive" size="icon" onClick={() => handleDeleteMerch(item.id)} className="h-10 w-10 rounded-none border border-white/20 shadow-xl">
                    <Trash2 size={16} />
                  </Button>
                </div>
                
                <div className="absolute bottom-6 left-6 bg-muted text-black font-headline px-4 py-2 text-xl shadow-[6px_6px_0px_rgba(0,0,0,0.5)] z-20">
                  {item.price}
                </div>

                <div className="absolute top-6 left-6 text-[8px] uppercase tracking-[0.4em] font-black text-white/20 border border-white/10 px-3 py-1">
                  ITEM_VOID_0{idx + 1}
                </div>
              </div>
              <div className="p-8">
                <h4 className="font-headline text-3xl uppercase tracking-tighter text-muted group-hover:text-glow transition-all truncate">{item.name}</h4>
                <p className="text-white/20 text-[10px] uppercase tracking-widest mt-4 font-black">ID: {item.id.substring(0, 12)}...</p>
              </div>
            </div>
          ))}

          {(!merchItems || merchItems.length === 0) && !isLoading && (
            <div className="col-span-full py-40 border-2 border-dashed border-white/5 text-center flex flex-col items-center justify-center opacity-10">
              <ShoppingBag size={60} className="mb-6 text-muted" />
              <p className="font-headline text-3xl uppercase tracking-widest">NO_WEARABLES_SYNCED</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
