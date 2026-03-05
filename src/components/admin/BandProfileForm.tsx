
'use client';

import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Save, Plus, Trash2, Image as ImageIcon, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadToGithub } from '@/app/actions/github-upload';

const formSchema = z.object({
  heroHeadline: z.string().min(1, "Headline required"),
  heroTagline: z.string().min(1, "Tagline required"),
  heroImageUrl: z.string().optional(),
  heroVideoUrl: z.string().optional(),
  stageVideoUrl: z.string().optional(),
  logoUrl: z.string().optional(),
  galleryTitle: z.string().optional(),
  gallerySubtitle: z.string().optional(),
  biography: z.string().min(10, "Biography minimal 10 karakter."),
  contactEmail: z.string().email("Email tidak valid."),
  contactPhone: z.string().optional(),
  bookingInfo: z.string().optional(),
  members: z.array(z.object({
    name: z.string().min(1, "Name required"),
    role: z.string().min(1, "Role required"),
    photoUrl: z.string().optional()
  })),
  socialLinks: z.object({
    instagram: z.string().optional(),
    spotify: z.string().optional(),
    youtube: z.string().optional(),
    appleMusic: z.string().optional(),
    tiktok: z.string().optional(),
  })
});

const DEFAULT_LOGO = "https://raw.githubusercontent.com/Zombiesigma/moreink/main/LOGO%20MORINK%20(White).jpg";

export function BandProfileForm() {
  const db = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  
  const profileRef = useMemoFirebase(() => doc(db, 'band_profile', 'mainProfile'), [db]);
  const { data: profile, isLoading } = useDoc(profileRef);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      heroHeadline: 'MORE iNK.',
      heroTagline: 'ORIGINAL',
      heroImageUrl: '',
      heroVideoUrl: '',
      stageVideoUrl: '',
      logoUrl: DEFAULT_LOGO,
      galleryTitle: 'STAGE',
      gallerySubtitle: 'Moments Captured in the Void',
      biography: '',
      contactEmail: '',
      contactPhone: '',
      bookingInfo: '',
      members: [{ name: '', role: '', photoUrl: '' }],
      socialLinks: { instagram: '', spotify: '', youtube: '', appleMusic: '', tiktok: '' }
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "members"
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        heroHeadline: profile.heroHeadline || 'MORE iNK.',
        heroTagline: profile.heroTagline || 'ORIGINAL',
        heroImageUrl: profile.heroImageUrl || '',
        heroVideoUrl: profile.heroVideoUrl || '',
        stageVideoUrl: profile.stageVideoUrl || '',
        logoUrl: profile.logoUrl || DEFAULT_LOGO,
        galleryTitle: profile.galleryTitle || 'STAGE',
        gallerySubtitle: profile.gallerySubtitle || 'Moments Captured in the Void',
        biography: profile.biography || '',
        contactEmail: profile.contactEmail || '',
        contactPhone: profile.contactPhone || '',
        bookingInfo: profile.bookingInfo || '',
        members: profile.members || [{ name: '', role: '', photoUrl: '' }],
        socialLinks: profile.socialLinks || { instagram: '', spotify: '', youtube: '', appleMusic: '', tiktok: '' }
      });
    }
  }, [profile, form]);

  const handleFileUpload = async (fieldName: any, file: File | undefined) => {
    if (!file) return;
    
    const isVideo = file.type.startsWith('video/');
    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;

    if (file.size > maxSize) {
      toast({ 
        variant: "destructive", 
        title: "File Too Large", 
        description: `Maksimal ukuran file adalah ${isVideo ? '50MB' : '10MB'}.` 
      });
      return;
    }

    setUploadingField(fieldName);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const url = await uploadToGithub(formData);
      
      form.setValue(fieldName, url, { 
        shouldDirty: true, 
        shouldValidate: true,
        shouldTouch: true 
      });
      
      toast({ title: "ASSET_CAPTURED", description: "Identity sync initiated." });
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Upload Gagal", 
        description: error.message || "Gagal mengunggah file ke storage." 
      });
    } finally {
      setUploadingField(null);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    const cleanData = JSON.parse(JSON.stringify({
      ...values,
      id: 'mainProfile',
      lastUpdated: new Date().toISOString()
    }));

    try {
      setDocumentNonBlocking(profileRef, cleanData, { merge: true });
      toast({ title: "TRANSMISSION_SUCCESS", description: "Band profile updated globally." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sync Error", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin h-12 w-12 text-white/20" /></div>;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-16 text-white">
        
        <div className="space-y-8 border-b border-white/10 pb-12">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-2xl font-headline tracking-tighter uppercase">BRAND_IDENTITY</h3>
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/20">The face of the void</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="w-full md:w-1/3 space-y-4">
               <FormLabel className="text-[10px] uppercase tracking-[0.4em] text-white/40">OFFICIAL_LOGOTYPE</FormLabel>
               <div className="relative group aspect-square bg-white/5 border border-white/10 overflow-hidden">
                  {uploadingField === 'logoUrl' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
                      <Loader2 className="animate-spin h-10 w-10 text-white" />
                    </div>
                  )}
                  <img 
                    src={form.watch('logoUrl') || DEFAULT_LOGO} 
                    className="w-full h-full object-contain p-8 grayscale group-hover:grayscale-0 transition-all duration-700" 
                    alt="Logo Preview"
                  />
                  <label className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer backdrop-blur-sm">
                    <Plus size={32} />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload('logoUrl', e.target.files?.[0])} disabled={!!uploadingField} />
                  </label>
               </div>
            </div>
            
            <div className="w-full md:w-2/3 grid gap-8">
              <FormField control={form.control} name="heroHeadline" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] uppercase tracking-[0.4em] text-white/40">HERO_HEADLINE</FormLabel>
                  <FormControl><Input className="bg-transparent border-b-2 border-white/10 rounded-none h-14 text-xl font-headline focus:border-white transition-all" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="heroTagline" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] uppercase tracking-[0.4em] text-white/40">HERO_TAGLINE</FormLabel>
                  <FormControl><Input className="bg-transparent border-b-2 border-white/10 rounded-none h-14 text-xl font-headline focus:border-white transition-all" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>
        </div>

        <div className="space-y-8 border-b border-white/10 pb-12">
          <h3 className="text-2xl font-headline tracking-tighter uppercase">VOID_VISUALS</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <FormLabel className="text-[10px] uppercase tracking-[0.4em] text-white/40 flex items-center gap-2"><Video size={14} /> HERO_VIDEO</FormLabel>
              <div className="relative aspect-video bg-white/5 border border-white/10 group overflow-hidden">
                {form.watch('heroVideoUrl') ? (
                  <video src={form.watch('heroVideoUrl')} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/10 italic text-[10px] tracking-widest">NO_VIDEO_SYNCED</div>
                )}
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer">
                  {uploadingField === 'heroVideoUrl' ? <Loader2 className="animate-spin" /> : <Plus size={32} />}
                  <input type="file" className="hidden" accept="video/mp4" onChange={(e) => handleFileUpload('heroVideoUrl', e.target.files?.[0])} disabled={!!uploadingField} />
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <FormLabel className="text-[10px] uppercase tracking-[0.4em] text-white/40 flex items-center gap-2"><Video size={14} /> STAGE_VIDEO</FormLabel>
              <div className="relative aspect-video bg-white/5 border border-white/10 group overflow-hidden">
                {form.watch('stageVideoUrl') ? (
                  <video src={form.watch('stageVideoUrl')} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/10 italic text-[10px] tracking-widest">NO_VIDEO_SYNCED</div>
                )}
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer">
                  {uploadingField === 'stageVideoUrl' ? <Loader2 className="animate-spin" /> : <Plus size={32} />}
                  <input type="file" className="hidden" accept="video/mp4" onChange={(e) => handleFileUpload('stageVideoUrl', e.target.files?.[0])} disabled={!!uploadingField} />
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <FormLabel className="text-[10px] uppercase tracking-[0.4em] text-white/40 flex items-center gap-2"><ImageIcon size={14} /> HERO_POSTER</FormLabel>
              <div className="relative aspect-video bg-white/5 border border-white/10 group overflow-hidden">
                {form.watch('heroImageUrl') ? (
                  <img src={form.watch('heroImageUrl')} className="w-full h-full object-cover grayscale brightness-50" alt="Hero Preview" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/10 italic text-[10px] tracking-widest">NO_IMAGE_SYNCED</div>
                )}
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer">
                  {uploadingField === 'heroImageUrl' ? <Loader2 className="animate-spin" /> : <Plus size={32} />}
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload('heroImageUrl', e.target.files?.[0])} disabled={!!uploadingField} />
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8 border-b border-white/10 pb-12">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-headline tracking-tighter uppercase">THE_BEINGS</h3>
            <Button type="button" onClick={() => append({ name: '', role: '', photoUrl: '' })} variant="impact" size="sm" className="h-10 px-6 text-[10px]"><Plus size={14} className="mr-2" /> ADD_MEMBER</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-6 p-6 bg-[#1E201E] border border-white/5 group">
                <div className="w-24 h-24 flex-shrink-0 relative bg-white/5 border border-white/10 overflow-hidden">
                  {form.watch(`members.${index}.photoUrl`) ? (
                    <img src={form.watch(`members.${index}.photoUrl`)} className="w-full h-full object-cover grayscale" alt="Member" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/10"><ImageIcon size={32} /></div>
                  )}
                  <label className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer">
                    {uploadingField === `members.${index}.photoUrl` ? <Loader2 className="animate-spin w-4 h-4" /> : <Plus size={16} />}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(`members.${index}.photoUrl`, e.target.files?.[0])} disabled={!!uploadingField} />
                  </label>
                </div>
                <div className="flex-grow space-y-3">
                   <Input placeholder="NAME" {...form.register(`members.${index}.name` as const)} className="bg-transparent border-0 border-b border-white/10 rounded-none h-8 font-headline text-lg focus:border-white p-0" />
                   <Input placeholder="ROLE" {...form.register(`members.${index}.role` as const)} className="bg-transparent border-0 border-b border-white/5 rounded-none h-6 text-[10px] uppercase tracking-widest focus:border-white p-0 text-white/40" />
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-white/10 hover:text-red-500 transition-colors"><Trash2 size={16} /></Button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8 border-b border-white/10 pb-12">
          <h3 className="text-2xl font-headline tracking-tighter uppercase">SOCIAL_CHANNELS</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <FormField control={form.control} name="socialLinks.instagram" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase tracking-[0.4em] text-white/40">INSTAGRAM_URL</FormLabel>
                <FormControl><Input className="bg-transparent border-b border-white/10 rounded-none h-10 focus:border-white transition-all" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="socialLinks.spotify" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase tracking-[0.4em] text-white/40">SPOTIFY_URL</FormLabel>
                <FormControl><Input className="bg-transparent border-b border-white/10 rounded-none h-10 focus:border-white transition-all" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="socialLinks.youtube" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase tracking-[0.4em] text-white/40">YOUTUBE_URL</FormLabel>
                <FormControl><Input className="bg-transparent border-b border-white/10 rounded-none h-10 focus:border-white transition-all" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="socialLinks.appleMusic" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase tracking-[0.4em] text-white/40">APPLE_MUSIC_URL</FormLabel>
                <FormControl><Input className="bg-transparent border-b border-white/10 rounded-none h-10 focus:border-white transition-all" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="socialLinks.tiktok" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase tracking-[0.4em] text-white/40">TIKTOK_URL</FormLabel>
                <FormControl><Input className="bg-transparent border-b border-white/10 rounded-none h-10 focus:border-white transition-all" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </div>

        <div className="space-y-12">
          <FormField control={form.control} name="biography" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] uppercase tracking-[0.4em] text-white/40">THE_SOUL_STORY (BIO)</FormLabel>
              <FormControl><Textarea placeholder="The unfiltered sound flows..." className="bg-transparent border-2 border-white/10 rounded-none min-h-[200px] p-6 text-xl font-headline focus:border-white transition-all leading-relaxed" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="sticky bottom-8 z-30">
          <Button 
            type="submit" 
            disabled={isSubmitting || !!uploadingField}
            variant="impact"
            size="xl"
            className="w-full h-24 text-2xl"
          >
            {isSubmitting ? <Loader2 className="animate-spin h-8 w-8" /> : <><Save className="mr-4 h-8 w-8" /> SYNC_ENTIRE_VOID</>}
          </Button>
        </div>
      </form>
    </Form>
  );
}
