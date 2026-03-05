'use client';

import React from 'react';
import { useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { 
  Loader2, 
  Package, 
  User, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Truck, 
  Clock,
  Trash2,
  Mail,
  Phone,
  Printer,
  Info,
  ExternalLink,
  Banknote
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export function OrderManager() {
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  
  const ordersQuery = useMemoFirebase(() => query(collection(db, 'orders'), orderBy('createdAt', 'desc')), [db]);
  const { data: orders, isLoading } = useCollection(ordersQuery);

  const updateStatus = (orderId: string, newStatus: string) => {
    const orderRef = doc(db, 'orders', orderId);
    updateDocumentNonBlocking(orderRef, { status: newStatus });
    
    toast({
      title: "STATUS_SYNCED",
      description: `Order ${orderId} is now ${newStatus.toUpperCase()}.`,
    });

    if (newStatus === 'confirmed') {
      setTimeout(() => {
        router.push(`/admin/print/${orderId}`);
      }, 500);
    }
  };

  const deleteOrder = (orderId: string) => {
    if (confirm('Disconnect this order from the void forever?')) {
      const orderRef = doc(db, 'orders', orderId);
      deleteDocumentNonBlocking(orderRef);
      toast({
        title: "ORDER_DISCONNECTED",
        description: "Order removed from database.",
      });
    }
  };

  const handlePrint = (orderId: string) => {
    router.push(`/admin/print/${orderId}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-500/20 text-green-500 border-green-500/20 rounded-none uppercase font-black text-[8px] tracking-widest">COMPLETED</Badge>;
      case 'shipped': return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/20 rounded-none uppercase font-black text-[8px] tracking-widest">SHIPPED</Badge>;
      case 'confirmed': return <Badge className="bg-accent/20 text-accent border-accent/20 rounded-none uppercase font-black text-[8px] tracking-widest">CONFIRMED</Badge>;
      default: return <Badge className="bg-muted/20 text-muted border-muted/20 rounded-none uppercase font-black text-[8px] tracking-widest animate-pulse">PENDING</Badge>;
    }
  };

  if (isLoading) return (
    <div className="flex justify-center py-40">
      <Loader2 className="animate-spin h-12 w-12 text-muted/20" />
    </div>
  );

  return (
    <div className="space-y-12">
      <div className="flex items-end justify-between border-b border-white/10 pb-6">
        <div>
          <h2 className="text-4xl font-headline tracking-tighter text-muted">MATERIAL_TRANSACTIONS</h2>
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 mt-2">Managing Beings Frequencies</p>
        </div>
        <div className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-black">
          {orders?.length || 0} TOTAL_SYNC
        </div>
      </div>

      <div className="grid gap-10">
        {orders?.map((order) => {
          const s = order.shippingDetails;
          return (
            <Card key={order.id} className="bg-[#1E201E] border-white/5 rounded-none overflow-hidden hover:border-muted/30 transition-all duration-500 shadow-2xl group relative">
              <div className="grid lg:grid-cols-12 gap-0">
                
                {/* Status & ID Column */}
                <div className="lg:col-span-3 p-8 bg-black/40 border-r border-white/5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Clock size={12} className="text-white/20" />
                      <span className="text-[8px] uppercase tracking-widest text-white/20 font-black">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-xl font-headline tracking-tighter text-muted mb-4 break-all">
                      {order.id}
                    </h4>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(order.status)}
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 rounded-none border-white/10 hover:bg-white hover:text-black transition-all"
                        onClick={() => handlePrint(order.id)}
                        title="RE-PRINT_LABEL"
                      >
                        <Printer size={14} />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="pt-8 grid grid-cols-2 gap-2">
                    <Button 
                      size="sm" 
                      variant="impact" 
                      className="h-12 px-4 text-[10px] col-span-2 bg-accent text-white border-accent" 
                      onClick={() => updateStatus(order.id, 'confirmed')}
                    >
                      CONFIRM & PRINT <ExternalLink size={12} className="ml-2" />
                    </Button>
                    <Button size="sm" variant="impactOutline" className="h-10 px-4 text-[10px]" onClick={() => updateStatus(order.id, 'shipped')}>SHIP</Button>
                    <Button size="sm" variant="impactOutline" className="h-10 px-4 text-[10px]" onClick={() => updateStatus(order.id, 'completed')}>DONE</Button>
                  </div>
                </div>

                {/* Order Content & Pricing */}
                <div className="lg:col-span-5 p-8 flex flex-col justify-between">
                  <div className="space-y-8">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 flex items-center justify-center bg-white/5 border border-white/10 shrink-0">
                        <Package size={20} className="text-muted" />
                      </div>
                      <div>
                        <p className="text-[8px] uppercase tracking-widest text-white/20 font-black mb-1">MATERIAL_ITEM</p>
                        <h5 className="text-2xl font-headline tracking-tight text-white">{order.merchName}</h5>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 flex items-center justify-center bg-white/5 border border-white/10 shrink-0">
                        <User size={20} className="text-muted" />
                      </div>
                      <div>
                        <p className="text-[8px] uppercase tracking-widest text-white/20 font-black mb-1">BEING_ENTITY</p>
                        <h5 className="text-xl font-headline text-white">{s?.fullName}</h5>
                        <div className="flex flex-col gap-1 mt-2">
                          <div className="flex items-center gap-2 text-white/40 text-xs"><Mail size={12} /> {order.userEmail}</div>
                          <div className="flex items-center gap-2 text-white/40 text-xs"><Phone size={12} /> {s?.phone}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Overview - Admin View */}
                  <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-6">
                    <div className="p-3 bg-white/5 border border-white/10 flex items-center gap-3">
                      <Banknote className="text-muted" size={16} />
                      <div>
                        <p className="text-[7px] uppercase tracking-widest text-white/20 font-black">TOTAL_REVENUE</p>
                        <p className="font-headline text-xl text-muted leading-none">{order.price}</p>
                      </div>
                    </div>
                    <div className="text-[8px] uppercase tracking-[0.4em] text-accent font-black">
                      SYNC_PAYMENT: COD
                    </div>
                  </div>
                </div>

                {/* Detailed Shipping Details */}
                <div className="lg:col-span-4 p-8 bg-white/[0.01] border-l border-white/5 relative">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 flex items-center justify-center bg-white/5 border border-white/10 shrink-0">
                      <MapPin size={20} className="text-muted" />
                    </div>
                    <div className="flex-grow">
                      <p className="text-[8px] uppercase tracking-widest text-white/20 font-black mb-1">DESTINATION_VOID</p>
                      <div className="space-y-1">
                        <p className="text-sm font-body italic text-white/60 leading-tight">
                          {s?.address}
                        </p>
                        <div className="text-[10px] uppercase font-black tracking-widest text-white/40">
                          {s?.rt && `RT ${s.rt}`} {s?.rw && `RW ${s.rw}`} {s?.subDistrict && `| ${s.subDistrict}`}
                        </div>
                        <p className="text-xs font-headline uppercase text-muted">
                          {s?.city}, {s?.postalCode}
                        </p>
                      </div>

                      {s?.notes && (
                        <div className="mt-4 p-3 bg-white/5 border border-white/5 rounded-none flex gap-3">
                          <Info size={14} className="text-accent flex-shrink-0" />
                          <p className="text-[10px] italic text-white/40 leading-tight">"{s.notes}"</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => deleteOrder(order.id)}
                    className="absolute bottom-4 right-4 text-white/10 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>

              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
