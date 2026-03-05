'use client';

import React, { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, doc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Loader2, Calendar, Link as LinkIcon, Music } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadToGithub } from '@/app/actions/github-upload';

export function MusicManager() {
  const db = useFirestore();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const albumsQuery = useMemoFirebase(() => query(collection(db, 'albums'), orderBy('releaseDate', 'desc')), [db]);
  const { data: albums, isLoading } = useCollection(albumsQuery);

  const handleAddAlbum = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const date = formData.get('date') as string;
    const spotifyUrl = formData.get('spotifyUrl') as string;
    const file = formData.get('cover') as File;

    if (!title || !date || file.size === 0) {
      toast({ 
        variant: "destructive", 
        title: "DATA_INCOMPLETE", 
        description: "Title, Release Date, and Cover Art are required for resonance." 
      });
      return;
    }

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      const coverUrl = await uploadToGithub(uploadFormData);

      const albumId = `album-${Date.now()}`;
      const albumRef = doc(db, 'albums', albumId);
      
      const albumData = {
        id: albumId,
        title,
        coverArtUrl: coverUrl,
        releaseDate: date,
        spotifyUrl: spotifyUrl || '',
        description: 'Synced Release',
        lastUpdated: new Date().toISOString()
      };

      setDoc(albumRef, albumData)
        .then(() => toast({ title: "ALBUM_INITIALIZED", description: `${title} has been synced to the void.` }))
        .catch(err => {
           errorEmitter.emit('permission-error', new FirestorePermissionError({
             path: albumRef.path,
             operation: 'create',
             requestResourceData: albumData
           }));
        });
      
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Transmission Failed", description: error.message });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAlbum = (id: string) => {
    const albumRef = doc(db, 'albums', id);
    deleteDoc(albumRef);
    toast({ title: "ALBUM_DISCONNECTED", description: "The album has been removed from the void." });
  };

  return (
    <div className="space-y-16">
      <Card className="bg-white/5 border-white/10 rounded-none overflow-hidden relative backdrop-blur-xl">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-muted opacity-20" />
        <CardHeader className="pt-10">
          <CardTitle className="font-headline text-4xl tracking-tighter text-muted">INITIALIZE_ALBUM</CardTitle>
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 mt-2">Inject New Resonance Into The Void</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddAlbum} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4 group">
                <label className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-black group-focus-within:text-muted transition-colors">ALBUM_TITLE</label>
                <Input 
                  name="title" 
                  placeholder="The Void Echoes..."
                  className="bg-transparent border-0 border-b-2 border-white/10 rounded-none h-14 text-2xl font-headline focus:border-muted transition-all placeholder:text-white/5" 
                />
              </div>
              <div className="space-y-4 group">
                <label className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-black group-focus-within:text-muted transition-colors">RELEASE_DATE</label>
                <Input 
                  name="date" 
                  type="date" 
                  className="bg-transparent border-0 border-b-2 border-white/10 rounded-none h-14 text-2xl font-headline focus:border-muted transition-all invert opacity-60" 
                />
              </div>
            </div>

            <div className="space-y-4 group">
              <label className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-black group-focus-within:text-muted transition-colors">SPOTIFY_URL (OPTIONAL)</label>
              <div className="relative">
                <LinkIcon className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
                <Input 
                  name="spotifyUrl" 
                  placeholder="https://open.spotify.com/album/..."
                  className="bg-transparent border-0 border-b-2 border-white/10 rounded-none h-14 pl-10 px-0 text-xl font-body focus:border-muted transition-all placeholder:text-white/5" 
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-black">COVER_ART (VISUAL_IDENTITY)</label>
              <Input 
                name="cover" 
                type="file" 
                accept="image/*" 
                className="bg-white/5 border-white/10 rounded-none cursor-pointer h-14 file:bg-transparent file:border-0 file:text-muted file:font-headline file:mr-4" 
              />
            </div>

            <Button 
              disabled={uploading} 
              variant="impact"
              size="xl"
              className="w-full h-24 text-2xl"
            >
              {uploading ? (
                <Loader2 className="animate-spin h-8 w-8" />
              ) : (
                <><Plus className="mr-4 h-8 w-8" /> SYNC_ALBUM_TO_VOID</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-12">
        <div className="flex items-end justify-between border-b border-white/10 pb-6">
          <h3 className="text-5xl font-headline tracking-tighter text-muted">EXISTING_RESONANCE</h3>
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 mb-1">Synced Albums</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin h-12 w-12 text-muted/10" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16">
            {albums?.map(album => (
              <div key={album.id} className="group relative bg-[#1E201E] border border-white/5 overflow-hidden animate-fade-in hover:border-muted/30 transition-all duration-700 shadow-2xl">
                <div className="relative aspect-square overflow-hidden bg-black">
                  <img 
                    src={album.coverArtUrl} 
                    alt={album.title}
                    className="w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-100 group-hover:scale-105 transition-all duration-1000"
                  />
                  
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      onClick={() => handleDeleteAlbum(album.id)}
                      className="rounded-none h-12 w-12 border border-white/20 shadow-xl"
                    >
                      <Trash2 size={20} />
                    </Button>
                  </div>

                  <div className="absolute bottom-6 left-6 bg-muted text-black font-headline px-4 py-2 text-xs tracking-widest shadow-[6px_6px_0px_rgba(0,0,0,0.5)] z-20">
                    {album.releaseDate}
                  </div>
                </div>
                
                <div className="p-10">
                  <h4 className="font-headline text-4xl uppercase tracking-tighter leading-tight group-hover:text-glow transition-all text-muted">{album.title}</h4>
                  {album.spotifyUrl && (
                    <div className="mt-6 flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/20 italic border-t border-white/5 pt-4">
                      <LinkIcon size={12} className="text-muted/40" /> {album.spotifyUrl.substring(0, 40)}...
                    </div>
                  )}
                </div>
              </div>
            ))}

            {(!albums || albums.length === 0) && (
              <div className="col-span-full py-32 border-2 border-dashed border-white/5 text-center flex flex-col items-center justify-center opacity-10">
                <Music size={48} className="mb-6 text-muted" />
                <p className="font-headline text-3xl uppercase tracking-widest">NO_RESONANCE_FOUND</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
