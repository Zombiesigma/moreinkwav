'use client';

import React, { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ImageIcon, Plus, Trash2, Loader2, Calendar, MapPin, X, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadToGithub } from '@/app/actions/github-upload';

export function GalleryManager() {
  const db = useFirestore();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const galleryQuery = useMemoFirebase(() => query(collection(db, 'photos'), orderBy('createdAt', 'desc')), [db]);
  const { data: photos, isLoading } = useCollection(galleryQuery);

  const handleCreateEntry = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const venue = formData.get('venue') as string;
    const date = formData.get('date') as string;
    const description = formData.get('description') as string;
    const file = formData.get('photo') as File;

    if (!title || file.size === 0) {
      toast({ variant: "destructive", title: "DATA_INCOMPLETE", description: "Title and Main Image are required." });
      return;
    }

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      const imageUrl = await uploadToGithub(uploadFormData);

      const photoId = `stage-${Date.now()}`;
      const photoRef = doc(db, 'photos', photoId);
      
      const photoData = {
        id: photoId,
        imageUrl,
        galleryImages: [],
        title,
        venue: venue || '',
        date: date || '',
        description: description || '',
        createdAt: new Date().toISOString()
      };

      setDoc(photoRef, photoData)
        .then(() => toast({ title: "LOG_CREATED", description: "New stage frequency initialized." }))
        .catch(err => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: photoRef.path,
            operation: 'create',
            requestResourceData: photoData
          }));
        });

      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: error.message });
    } finally {
      setUploading(false);
    }
  };

  const handleAddPhotos = async (entryId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const entry = photos?.find(p => p.id === entryId);
      const currentGallery = entry?.galleryImages || [];
      const newUrls = [...currentGallery];

      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);
        const url = await uploadToGithub(formData);
        newUrls.push(url);
      }

      const photoRef = doc(db, 'photos', entryId);
      updateDocumentNonBlocking(photoRef, { galleryImages: newUrls });
      
      toast({ title: "GALLERY_EXPANDED", description: `${files.length} frames synced to event archive.` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Upload Failed", description: error.message });
    } finally {
      setUploading(false);
    }
  };

  const removePhotoFromGallery = (entryId: string, urlToRemove: string) => {
    const entry = photos?.find(p => p.id === entryId);
    if (!entry) return;

    const updatedGallery = (entry.galleryImages || []).filter((url: string) => url !== urlToRemove);
    const photoRef = doc(db, 'photos', entryId);
    updateDocumentNonBlocking(photoRef, { galleryImages: updatedGallery });
    toast({ title: "FRAME_REMOVED", description: "Photo disconnected from archive." });
  };

  const handleDeleteEntry = (id: string) => {
    if (confirm('Permanently wipe this event archive from the void?')) {
      deleteDoc(doc(db, 'photos', id));
    }
  };

  return (
    <div className="space-y-16">
      {/* Create New Event Archive */}
      <Card className="bg-white/5 border-white/10 rounded-none relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-accent opacity-20" />
        <CardHeader className="pt-10">
          <CardTitle className="font-headline text-4xl tracking-tighter text-muted">INITIALIZE_STAGE_LOG</CardTitle>
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 mt-2">Creating a New Performance Resonance</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateEntry} className="space-y-10">
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-4 group">
                <label className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-black group-focus-within:text-muted transition-colors">EVENT_TITLE</label>
                <Input name="title" placeholder="e.g. Ciputat Chaos 2024" className="bg-transparent border-0 border-b-2 border-white/10 rounded-none h-14 font-headline text-2xl focus:border-muted transition-all" required />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-black">MAIN_COVER_IMAGE</label>
                <Input name="photo" type="file" accept="image/*" className="bg-white/5 border-white/10 rounded-none h-14" required />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-4 group">
                <label className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-black group-focus-within:text-muted transition-colors">VENUE_NAME</label>
                <div className="relative">
                  <MapPin className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
                  <Input name="venue" placeholder="e.g. THE VOID CLUB" className="bg-transparent border-0 border-b-2 border-white/10 rounded-none h-14 pl-10 px-0 text-xl font-headline focus:border-muted transition-all" />
                </div>
              </div>
              <div className="space-y-4 group">
                <label className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-black group-focus-within:text-muted transition-colors">EVENT_DATE</label>
                <div className="relative">
                  <Calendar className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
                  <Input name="date" type="date" className="bg-transparent border-0 border-b-2 border-white/10 rounded-none h-14 pl-10 px-0 text-xl font-headline invert opacity-60 focus:border-muted transition-all" />
                </div>
              </div>
            </div>

            <div className="space-y-4 group">
              <label className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-black group-focus-within:text-muted transition-colors flex items-center gap-2">
                <FileText size={12} /> STAGE_STORY / DESCRIPTION
              </label>
              <Textarea 
                name="description" 
                placeholder="A brief material whisper from the pit... describe the energy, the crowd, and the sound." 
                className="bg-transparent border-2 border-white/10 rounded-none min-h-[150px] p-6 font-body text-xl focus:border-muted transition-all" 
              />
            </div>

            <Button disabled={uploading} variant="impact" size="xl" className="w-full h-24">
              {uploading ? <Loader2 className="animate-spin h-8 w-8" /> : <><Plus size={24} className="mr-4" /> CREATE_EVENT_LOG</>}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing Archives List */}
      <div className="space-y-12">
        <div className="flex items-end justify-between border-b border-white/10 pb-6">
          <h3 className="text-5xl font-headline tracking-tighter text-muted">STAGE_VAULT</h3>
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 mb-1">Active Event Logs</p>
        </div>

        <div className="grid grid-cols-1 gap-12">
          {photos?.map(entry => (
            <div key={entry.id} className="bg-[#1E201E] border border-white/5 p-8 md:p-12 relative group shadow-2xl">
              <div className="flex flex-col md:flex-row gap-12">
                {/* Cover Preview */}
                <div className="w-full md:w-1/3 space-y-6">
                  <div className="relative aspect-video overflow-hidden border border-white/10">
                    <img src={entry.imageUrl} className="w-full h-full object-cover grayscale brightness-50" alt={entry.title} />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-[8px] uppercase tracking-[0.5em] font-black border border-white/20 px-4 py-2 bg-black/40 backdrop-blur-sm">PRIMARY_COVER</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-black flex items-center gap-2">
                      <Plus size={12} /> ADD_GALLERY_PHOTOS
                    </label>
                    <Input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      onChange={(e) => handleAddPhotos(entry.id, e.target.files)}
                      disabled={uploading}
                      className="bg-white/5 border-white/10 rounded-none cursor-pointer file:bg-transparent file:text-muted file:font-headline"
                    />
                  </div>

                  <Button variant="destructive" size="sm" onClick={() => handleDeleteEntry(entry.id)} className="w-full rounded-none h-12 uppercase tracking-widest text-[10px] font-black">
                    <Trash2 size={14} className="mr-2" /> DELETE_ARCHIVE
                  </Button>
                </div>

                {/* Entry Info & Gallery List */}
                <div className="flex-grow space-y-8">
                  <div className="border-b border-white/10 pb-6">
                    <h4 className="font-headline text-4xl text-muted uppercase tracking-tighter mb-2">{entry.title}</h4>
                    <div className="flex flex-wrap gap-6 text-[10px] uppercase tracking-widest text-white/20 font-black mb-4">
                      <span className="flex items-center gap-2"><MapPin size={12} /> {entry.venue}</span>
                      <span className="flex items-center gap-2"><Calendar size={12} /> {entry.date}</span>
                      <span className="flex items-center gap-2"><ImageIcon size={12} /> {(entry.galleryImages?.length || 0) + 1} FRAMES</span>
                    </div>
                    {entry.description && (
                      <p className="text-white/40 italic font-body text-sm line-clamp-3">
                        "{entry.description}"
                      </p>
                    )}
                  </div>

                  {/* Gallery Grid Mini */}
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                    {entry.galleryImages?.map((url: string, idx: number) => (
                      <div key={idx} className="relative aspect-square border border-white/10 overflow-hidden group/item">
                        <img src={url} className="w-full h-full object-cover grayscale" alt="Gallery" />
                        <button 
                          onClick={() => removePhotoFromGallery(entry.id, url)}
                          className="absolute inset-0 bg-red-500/80 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <X size={16} className="text-white" />
                        </button>
                      </div>
                    ))}
                    {(!entry.galleryImages || entry.galleryImages.length === 0) && (
                      <div className="col-span-full py-8 border-2 border-dashed border-white/5 text-center flex flex-col items-center justify-center opacity-10">
                        <p className="text-[8px] uppercase tracking-widest">NO_ADDITIONAL_FRAMES</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {(!photos || photos.length === 0) && !isLoading && (
            <div className="py-40 border-2 border-dashed border-white/5 text-center flex flex-col items-center justify-center opacity-10">
              <ImageIcon size={60} className="mb-6 text-muted" />
              <p className="font-headline text-3xl uppercase tracking-widest">THE_VAULT_IS_EMPTY</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
