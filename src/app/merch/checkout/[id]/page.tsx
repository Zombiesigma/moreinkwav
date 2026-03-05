'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFirestore, useDoc, useUser, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ShoppingBag, MessageSquare, ShieldCheck, Truck, HelpCircle, MapPin, CreditCard, ReceiptText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function CheckoutPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push(`/login?redirect=/merch/checkout/${id}`);
    }
  }, [user, isUserLoading, router, id]);

  const merchRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, 'merch', id as string);
  }, [db, id]);

  const { data: item, isLoading: isItemLoading } = useDoc(merchRef);

  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    address: '',
    rt: '',
    rw: '',
    subDistrict: '',
    city: '',
    postalCode: '',
    notes: ''
  });

  if (isUserLoading || isItemLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="relative">
          <Loader2 className="h-12 w-12 md:h-16 md:w-16 animate-spin text-muted/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-2 w-2 bg-muted rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (!item) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="font-headline text-5xl md:text-6xl mb-8 tracking-tighter uppercase">ITEM_NOT_FOUND</h1>
        <Button variant="impact" onClick={() => router.push('/merch')}>RETURN_TO_COLLECTION</Button>
      </div>
    );
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.fullName || !address.phone || !address.address || !address.city) {
      toast({ variant: "destructive", title: "INCOMPLETE", description: "All primary identification fields are required." });
      return;
    }

    setSubmitting(true);
    const orderId = `order-${Date.now()}`;
    const orderRef = doc(db, 'orders', orderId);

    const orderData = {
      id: orderId,
      userId: user.uid,
      userEmail: user.email,
      merchId: item.id,
      merchName: item.name,
      price: item.price,
      status: 'pending',
      shippingDetails: address,
      createdAt: new Date().toISOString()
    };

    try {
      setDocumentNonBlocking(orderRef, orderData, { merge: true });
      toast({
        title: "SUCCESS",
        description: "Your order is recorded. Redirecting...",
      });
      setTimeout(() => {
        router.push('/my-orders');
      }, 2000);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-muted selection:text-black relative">
      <Navigation />
      <div className="noise-overlay" />
      <div className="scan-line" />
      
      <div className="pt-24 md:pt-48 pb-12 md:pb-24 px-4 sm:px-6 max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          
          <div className="lg:col-span-5 space-y-6 animate-fade-in">
             <div className="relative border-l-2 border-muted/20 pl-4 md:pl-8">
               <h1 className="text-4xl sm:text-6xl md:text-8xl font-headline tracking-tighter text-glow mb-0 text-muted leading-none uppercase">ORDER</h1>
               <h2 className="text-2xl sm:text-4xl md:text-6xl font-headline tracking-tighter text-white/20 leading-none uppercase">CHECKOUT</h2>
             </div>

             <Card className="bg-[#1E201E] border-white/5 rounded-none overflow-hidden group shadow-2xl">
                <div className="relative aspect-video sm:aspect-video lg:aspect-square overflow-hidden bg-black">
                  <Image 
                    src={item.imageUrl} 
                    alt={item.name} 
                    fill 
                    className="object-cover grayscale contrast-[1.2] brightness-75 group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" 
                  />
                </div>
                <CardContent className="p-5 sm:p-8 md:p-10 space-y-5 md:space-y-8">
                  <div className="flex flex-col gap-1 md:gap-2">
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-headline text-muted uppercase tracking-tighter leading-tight">{item.name}</h3>
                    <p className="text-white/40 italic font-body text-xs sm:text-base md:text-lg leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10 space-y-3 md:space-y-4">
                    <div className="flex justify-between items-center text-[9px] sm:text-[10px] uppercase tracking-widest font-black text-white/20">
                      <span>PRICE</span>
                      <span className="text-white/60 font-headline text-base md:text-lg">{item.price}</span>
                    </div>
                    <div className="flex justify-between items-center text-[9px] sm:text-[10px] uppercase tracking-widest font-black text-white/20">
                      <span>SHIPPING</span>
                      <span className="text-accent font-headline text-base md:text-lg">FREE</span>
                    </div>
                    <div className="pt-4 border-t-2 border-white/5 flex justify-between items-end">
                      <div>
                        <p className="text-3xl sm:text-4xl md:text-5xl font-headline tracking-tighter text-muted text-glow leading-none">
                          {item.price}
                        </p>
                      </div>
                      <ReceiptText className="text-white/5 h-12 w-12 md:h-16 md:w-16 mb-[-5px]" strokeWidth={1} />
                    </div>
                  </div>
                </CardContent>
             </Card>
          </div>

          <div className="lg:col-span-7 animate-fade-in [animation-delay:200ms]">
            <Card className="bg-white/[0.01] border border-white/10 rounded-none p-5 sm:p-10 md:p-16 relative overflow-hidden backdrop-blur-xl shadow-2xl">
               <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-muted/5 blur-[80px] md:blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
               
               <form onSubmit={handleCheckout} className="space-y-8 md:space-y-12 relative z-10">
                 <div className="space-y-8 md:space-y-10">
                    <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                      <div className="h-8 w-8 md:h-10 md:w-10 flex items-center justify-center bg-white/5 border border-white/10">
                        <MapPin size={14} className="text-muted md:size-4" />
                      </div>
                      <div>
                        <span className="text-sm sm:text-base md:text-xl font-headline tracking-widest uppercase">SHIPPING DETAILS</span>
                      </div>
                    </div>

                    <div className="grid gap-6 md:gap-8">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                          <div className="space-y-2 group">
                            <label className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] font-black text-white/40 group-focus-within:text-muted transition-colors">FULL NAME</label>
                            <Input 
                              value={address.fullName}
                              onChange={(e) => setAddress({...address, fullName: e.target.value})}
                              className="bg-transparent border-0 border-b border-white/10 focus:border-muted focus:ring-0 rounded-none h-11 md:h-14 px-0 text-base sm:text-lg md:text-2xl font-headline transition-all placeholder:text-white/5" 
                              placeholder="REAL_NAME"
                              required
                            />
                          </div>
                          <div className="space-y-2 group">
                            <label className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] font-black text-white/40 group-focus-within:text-muted transition-colors">PHONE</label>
                            <Input 
                              value={address.phone}
                              onChange={(e) => setAddress({...address, phone: e.target.value})}
                              className="bg-transparent border-0 border-b border-white/10 focus:border-muted focus:ring-0 rounded-none h-11 md:h-14 px-0 text-base sm:text-lg md:text-2xl font-headline transition-all placeholder:text-white/5" 
                              placeholder="+62_ID"
                              required
                            />
                          </div>
                       </div>

                       <div className="space-y-2 group">
                         <label className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] font-black text-white/40 group-focus-within:text-muted transition-colors">ADDRESS</label>
                         <Input 
                           value={address.address}
                           onChange={(e) => setAddress({...address, address: e.target.value})}
                           className="bg-transparent border-0 border-b border-white/10 focus:border-muted focus:ring-0 rounded-none h-11 md:h-14 px-0 text-base sm:text-lg md:text-2xl font-headline transition-all placeholder:text-white/5" 
                           placeholder="STREET / HOUSE NO"
                           required
                         />
                       </div>

                       <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                          <div className="space-y-2 group">
                            <label className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] font-black text-white/40 group-focus-within:text-muted transition-colors">RT</label>
                            <Input 
                              value={address.rt}
                              onChange={(e) => setAddress({...address, rt: e.target.value})}
                              className="bg-transparent border-0 border-b border-white/10 focus:border-muted focus:ring-0 rounded-none h-11 px-0 text-base md:text-xl font-headline transition-all placeholder:text-white/5" 
                              placeholder="000"
                            />
                          </div>
                          <div className="space-y-2 group">
                            <label className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] font-black text-white/40 group-focus-within:text-muted transition-colors">RW</label>
                            <Input 
                              value={address.rw}
                              onChange={(e) => setAddress({...address, rw: e.target.value})}
                              className="bg-transparent border-0 border-b border-white/10 focus:border-muted focus:ring-0 rounded-none h-11 px-0 text-base md:text-xl font-headline transition-all placeholder:text-white/5" 
                              placeholder="000"
                            />
                          </div>
                          <div className="col-span-2 space-y-2 group">
                            <label className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] font-black text-white/40 group-focus-within:text-muted transition-colors">SUB DISTRICT</label>
                            <Input 
                              value={address.subDistrict}
                              onChange={(e) => setAddress({...address, subDistrict: e.target.value})}
                              className="bg-transparent border-0 border-b border-white/10 focus:border-muted focus:ring-0 rounded-none h-11 px-0 text-base md:text-xl font-headline transition-all placeholder:text-white/5" 
                              placeholder="KELURAHAN / KECAMATAN"
                            />
                          </div>
                       </div>

                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-10">
                          <div className="space-y-2 group">
                            <label className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] font-black text-white/40 group-focus-within:text-muted transition-colors">CITY</label>
                            <Input 
                              value={address.city}
                              onChange={(e) => setAddress({...address, city: e.target.value})}
                              className="bg-transparent border-0 border-b border-white/10 focus:border-muted focus:ring-0 rounded-none h-11 px-0 text-base md:text-xl font-headline transition-all placeholder:text-white/5" 
                              placeholder="CITY"
                              required
                            />
                          </div>
                          <div className="space-y-2 group">
                            <label className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] font-black text-white/40 group-focus-within:text-muted transition-colors">POSTAL CODE</label>
                            <Input 
                              value={address.postalCode}
                              onChange={(e) => setAddress({...address, postalCode: e.target.value})}
                              className="bg-transparent border-0 border-b border-white/10 focus:border-muted focus:ring-0 rounded-none h-11 px-0 text-base md:text-xl font-headline transition-all placeholder:text-white/5" 
                              placeholder="ZIP"
                              required
                            />
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-6 md:space-y-10">
                    <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                      <div className="h-8 w-8 md:h-10 md:w-10 flex items-center justify-center bg-white/5 border border-white/10">
                        <CreditCard size={14} className="text-muted md:size-4" />
                      </div>
                      <div>
                        <span className="text-sm sm:text-base md:text-xl font-headline tracking-widest uppercase">PAYMENT METHOD</span>
                      </div>
                    </div>
                    
                    <div className="p-4 sm:p-6 border border-muted/20 bg-white/[0.02] flex items-center gap-4 sm:gap-6 group hover:border-muted transition-all cursor-default">
                       <div className="h-10 w-10 sm:h-12 sm:w-12 bg-muted text-black flex items-center justify-center font-headline text-base sm:text-xl shrink-0">COD</div>
                       <div className="flex-grow min-w-0">
                          <p className="font-headline text-base sm:text-lg uppercase tracking-widest truncate">CASH ON ARRIVAL</p>
                       </div>
                       <div className="h-4 w-4 rounded-full border-2 border-muted flex items-center justify-center p-0.5 shrink-0">
                          <div className="h-full w-full bg-muted rounded-full" />
                       </div>
                    </div>
                 </div>

                 <div className="pt-4">
                   <Button 
                     type="submit" 
                     disabled={submitting}
                     variant="impact" 
                     size="xl" 
                     className="w-full h-16 sm:h-20 md:h-28 text-xl sm:text-2xl md:text-3xl group relative overflow-hidden"
                   >
                     {submitting ? (
                       <Loader2 className="animate-spin h-5 w-5 md:h-8 md:w-8" />
                     ) : (
                       <span className="relative z-10 flex items-center justify-center gap-3 md:gap-6">
                          CONFIRM ORDER <ShoppingBag className="h-5 w-5 sm:h-7 sm:w-7 md:h-10 md:w-10 text-accent transition-transform group-hover:scale-125" />
                       </span>
                     )}
                     <div className="absolute inset-0 bg-muted translate-y-full group-hover:translate-y-0 transition-transform duration-700 opacity-10" />
                   </Button>
                 </div>
               </form>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
