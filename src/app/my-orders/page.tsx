'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { useFirestore, useCollection, useUser, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { Loader2, Package, Clock, Truck, CheckCircle2, MapPin, MessageSquare, ArrowRight, CheckCircle, History, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function MyOrdersPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login?redirect=/my-orders');
    }
  }, [user, isUserLoading, router]);

  const ordersQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'orders'),
      where('userId', '==', user.uid)
    );
  }, [db, user]);

  const { data: rawOrders, isLoading: isOrdersLoading, error } = useCollection(ordersQuery);

  const sortedOrders = useMemo(() => {
    if (!rawOrders) return [];
    return [...rawOrders].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [rawOrders]);

  const activeOrders = useMemo(() => sortedOrders.filter(o => o.status !== 'completed'), [sortedOrders]);
  const completedOrders = useMemo(() => sortedOrders.filter(o => o.status === 'completed'), [sortedOrders]);

  const handleConfirmReceipt = (orderId: string) => {
    if (!confirm('Have you received this material resonance?')) return;
    
    setConfirmingId(orderId);
    const orderRef = doc(db, 'orders', orderId);
    
    updateDocumentNonBlocking(orderRef, { status: 'completed' });
    
    toast({
      title: "RESONANCE_COMPLETE",
      description: "Item and identity verified. Thank you for being part of the sound.",
    });
    
    setTimeout(() => setConfirmingId(null), 1000);
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-muted/20" />
      </div>
    );
  }

  if (!user) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="text-green-500" size={20} />;
      case 'shipped': return <Truck className="text-blue-500" size={20} />;
      case 'confirmed': return <Package className="text-accent" size={20} />;
      default: return <Clock className="text-muted animate-pulse" size={20} />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'RECEIVED';
      case 'shipped': return 'ON THE ROAD';
      case 'confirmed': return 'SINKING...';
      default: return 'PENDING';
    }
  };

  const OrderCard = ({ order }: { order: any }) => (
    <Card key={order.id} className="bg-[#1E201E]/50 border-white/5 rounded-none overflow-hidden hover:border-muted/20 transition-all duration-500 backdrop-blur-xl group">
      <CardContent className="p-0">
        <div className="p-8 md:p-12 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-2">
            <h3 className="font-headline text-2xl md:text-3xl tracking-tight text-white uppercase">{order.id}</h3>
          </div>
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-3">
            {getStatusIcon(order.status)}
            <span className="text-[10px] uppercase tracking-[0.5em] font-black">
              {getStatusLabel(order.status)}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-12 gap-0">
          <div className="md:col-span-7 p-8 md:p-12 space-y-10 border-r border-white/5">
            <div className="flex gap-6">
              <div className="h-12 w-12 flex items-center justify-center bg-white/5 border border-white/10 shrink-0">
                <Package className="text-muted" size={24} />
              </div>
              <div>
                <p className="text-2xl md:text-4xl font-headline text-muted uppercase leading-none">{order.merchName}</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="h-12 w-12 flex items-center justify-center bg-white/5 border border-white/10 shrink-0">
                <MapPin className="text-muted" size={24} />
              </div>
              <div>
                <p className="text-sm md:text-lg font-body italic text-white/60 leading-tight">
                  {order.shippingDetails?.fullName}<br/>
                  {order.shippingDetails?.address}<br/>
                  {order.shippingDetails?.city}, {order.shippingDetails?.postalCode}
                </p>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 p-8 md:p-12 bg-white/[0.01] flex flex-col justify-between">
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-black text-white/20">
                  <span>PRICE</span>
                  <span className="text-white/60 font-headline">{order.price}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-black text-white/20">
                  <span>SHIPPING</span>
                  <span className="text-accent font-headline">FREE</span>
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                  <span className="text-3xl md:text-4xl font-headline text-muted text-glow">{order.price}</span>
                </div>
              </div>
            </div>

            <div className="mt-12 flex flex-col gap-4">
              {order.status === 'shipped' && (
                <Button 
                  variant="impact" 
                  disabled={confirmingId === order.id}
                  className="h-16 text-lg group"
                  onClick={() => handleConfirmReceipt(order.id)}
                >
                  {confirmingId === order.id ? <Loader2 className="animate-spin" /> : <>CONFIRM_RECEIPT <CheckCircle className="ml-3 group-hover:scale-125 transition-transform" /></>}
                </Button>
              )}
              <Button variant="outline" className="h-14 rounded-none border-white/10 text-[10px] tracking-[0.4em] font-black uppercase hover:bg-white hover:text-black transition-all" asChild>
                <Link href="/contact">
                  <MessageSquare className="mr-3 h-4 w-4" /> CONTACT_ADMIN
                </Link>
              </Button>
              <p className="text-[9px] uppercase tracking-[0.3em] text-white/10 text-center">
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <main className="min-h-screen bg-black text-white selection:bg-muted selection:text-black relative">
      <Navigation />
      <div className="noise-overlay" />
      
      <div className="pt-32 md:pt-48 pb-24 px-6 max-w-5xl mx-auto">
        <header className="mb-12 md:mb-20 animate-fade-in">
          <h1 className="text-5xl md:text-9xl font-headline tracking-tighter text-glow text-muted leading-none uppercase mb-4">MY_ORDERS</h1>
          <div className="h-1 w-24 bg-accent" />
        </header>

        {isOrdersLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin h-12 w-12 text-muted/10" />
          </div>
        ) : error ? (
          <div className="py-20 text-center">
            <p className="text-red-500 font-headline text-2xl uppercase">ERROR_SYNCING</p>
          </div>
        ) : sortedOrders.length > 0 ? (
          <Tabs defaultValue="active" className="space-y-12 animate-fade-in [animation-delay:200ms]">
            <TabsList className="bg-white/5 border border-white/10 p-1 h-auto rounded-none flex w-full sm:w-fit">
              <TabsTrigger value="active" className="flex-1 sm:flex-none data-[state=active]:bg-muted data-[state=active]:text-black rounded-none px-8 py-4 font-headline uppercase tracking-widest flex items-center gap-2 transition-all">
                <Activity size={16} /> ACTIVE ({activeOrders.length})
              </TabsTrigger>
              <TabsTrigger value="received" className="flex-1 sm:flex-none data-[state=active]:bg-muted data-[state=active]:text-black rounded-none px-8 py-4 font-headline uppercase tracking-widest flex items-center gap-2 transition-all">
                <History size={16} /> RECEIVED ({completedOrders.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-12">
              {activeOrders.length > 0 ? (
                activeOrders.map((order) => <OrderCard key={order.id} order={order} />)
              ) : (
                <div className="py-24 border-2 border-dashed border-white/5 text-center flex flex-col items-center justify-center opacity-20">
                  <Package size={48} className="mb-6" />
                  <p className="font-headline text-2xl uppercase">NO_ACTIVE_ORDERS</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="received" className="space-y-12">
              {completedOrders.length > 0 ? (
                completedOrders.map((order) => <OrderCard key={order.id} order={order} />)
              ) : (
                <div className="py-24 border-2 border-dashed border-white/5 text-center flex flex-col items-center justify-center opacity-20">
                  <History size={48} className="mb-6" />
                  <p className="font-headline text-2xl uppercase">NO_COMPLETED_RESONANCE</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="py-32 border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-center opacity-20 animate-fade-in">
            <Package size={64} className="mb-8 text-muted" />
            <h2 className="text-3xl md:text-5xl font-headline mb-4 uppercase tracking-tighter">EMPTY_COLLECTION</h2>
            <Button variant="impact" onClick={() => router.push('/merch')} className="h-16 px-12 mt-8">
              DISCOVER MERCH <ArrowRight className="ml-4" />
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
