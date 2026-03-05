'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2, Printer, ArrowLeft, Scissors, Box, MapPinned, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminGuard } from '@/components/admin/AdminGuard';

function PrintOrderContent() {
  const { orderId } = useParams();
  const router = useRouter();
  const db = useFirestore();

  const orderRef = useMemoFirebase(() => {
    if (!db || !orderId) return null;
    return doc(db, 'orders', orderId as string);
  }, [db, orderId]);

  const { data: order, isLoading } = useDoc(orderRef);

  useEffect(() => {
    if (order && !isLoading) {
      // Small delay to ensure any potential UI toasts are ignored by the browser's initial print capture
      const timer = setTimeout(() => {
        window.print();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [order, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-muted/20" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="font-headline text-5xl mb-8">ORDER_NOT_FOUND</h1>
        <Button onClick={() => router.back()} variant="impact">RETURN_TO_VOID</Button>
      </div>
    );
  }

  const { shippingDetails: s } = order;

  return (
    <div className="min-h-screen bg-white text-black p-0 md:p-4 font-sans print:p-0 print:bg-white">
      {/* UI Controls (Hidden on Print) */}
      <div className="max-w-xl mx-auto mb-4 flex justify-between items-center print:hidden bg-zinc-100 p-3 border border-black/5">
        <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2 font-headline uppercase tracking-widest text-[10px]">
          <ArrowLeft size={14} /> BACK_TO_ADMIN
        </Button>
        <Button onClick={() => window.print()} className="bg-black text-white hover:bg-zinc-800 rounded-none font-headline uppercase tracking-widest text-[10px] px-4">
          <Printer size={14} className="mr-2" /> PRINT
        </Button>
      </div>

      {/* Shipping Label (The actual printable part) - Optimized for A6/Small Label */}
      <div className="max-w-xl mx-auto border-[4px] border-black p-6 md:p-8 relative overflow-hidden bg-white shadow-none">
        
        {/* Header Branding - More Compact */}
        <div className="flex justify-between items-end border-b-[4px] border-black pb-4 mb-6">
          <div>
            <h1 className="font-headline text-4xl leading-none tracking-tighter mb-1">MORE iNK.</h1>
            <p className="text-[8px] uppercase tracking-[0.4em] font-black">ORIGINAL_SOUND_FROM_CIPUTAT</p>
          </div>
          <div className="text-right flex flex-col items-end">
            <div className="bg-black text-white px-3 py-1 font-headline text-xl mb-1">
              RESI_VOID
            </div>
            <p className="text-[10px] font-mono font-bold leading-none opacity-40">{order.id.substring(0, 15)}</p>
          </div>
        </div>

        {/* Sender Info (From) - Scaled Down */}
        <div className="mb-6 grid grid-cols-12 gap-4">
          <div className="col-span-1 flex flex-col items-center">
             <div className="w-6 h-6 bg-black flex items-center justify-center text-white mb-1">
                <Box size={12} />
             </div>
             <div className="w-[1px] flex-grow bg-black/10" />
          </div>
          <div className="col-span-11">
            <p className="text-[8px] font-black uppercase tracking-[0.3em] mb-1 text-black/40">SENDER // PENGIRIM</p>
            <div>
              <h2 className="font-headline text-xl mb-0.5 leading-none">MORE iNK. OFFICIAL</h2>
              <p className="text-[10px] font-bold uppercase leading-tight">Ciputat, South Tangerang, Banten, 15411</p>
            </div>
          </div>
        </div>

        {/* Recipient Info (To) - BIG BUT REASONABLE */}
        <div className="mb-6 p-6 border-[3px] border-black bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
             <MapPinned size={120} strokeWidth={1} />
          </div>

          <div className="relative z-10">
            <p className="text-[8px] font-black uppercase tracking-[0.3em] mb-4 bg-black text-white inline-block px-3 py-1">RECIPIENT // PENERIMA</p>
            <div className="space-y-4">
              <div>
                <h2 className="font-headline text-4xl md:text-5xl leading-[0.9] mb-2 tracking-tighter uppercase">{s?.fullName}</h2>
                <p className="text-2xl font-bold font-mono tracking-tighter border-y border-black py-2 inline-block">
                  {s?.phone}
                </p>
              </div>
              
              <div className="space-y-3">
                <p className="text-lg md:text-xl font-bold uppercase leading-snug italic decoration-black underline underline-offset-4">
                  {s?.address}
                </p>
                
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-3 border-t border-black/10">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase opacity-40">RT / RW</span>
                    <span className="text-base font-black uppercase tracking-tighter">{s?.rt || "00"} / {s?.rw || "00"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase opacity-40">SUB_DISTRICT</span>
                    <span className="text-base font-black uppercase tracking-tighter">{s?.subDistrict || "-"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase opacity-40">CITY / KOTA</span>
                    <span className="text-base font-black uppercase bg-black text-white px-1.5">{s?.city}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase opacity-40">ZIP</span>
                    <span className="text-base font-black tracking-widest border border-black px-1.5">{s?.postalCode}</span>
                  </div>
                </div>

                {s?.notes && (
                  <div className="mt-4 p-3 bg-zinc-50 border-l-[6px] border-black">
                    <div className="flex items-center gap-1.5 mb-1">
                       <Info size={12} className="text-black" />
                       <p className="text-[8px] font-black uppercase tracking-[0.2em]">VOID_PATOKAN:</p>
                    </div>
                    <p className="text-sm font-bold italic leading-tight">{s.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Item Content - Slimmer */}
        <div className="border-t-[4px] border-black pt-4 flex justify-between items-center">
          <div className="flex-grow">
            <p className="text-[8px] font-black uppercase tracking-[0.3em] mb-1 text-black/40">CONTENTS // ISI_PAKET</p>
            <div className="flex items-center gap-3">
               <div className="h-3 w-3 bg-black rounded-full" />
               <h3 className="font-headline text-2xl uppercase tracking-tighter leading-none">{order.merchName}</h3>
            </div>
          </div>
          <div className="text-right flex-shrink-0 ml-4">
             <div className="h-16 w-16 border-[2px] border-black flex flex-col items-center justify-center p-1">
                <p className="text-[7px] font-black uppercase text-center leading-[0.9] mb-0.5">VOID<br/>STUFF</p>
                <div className="h-[1px] w-full bg-black mb-0.5" />
                <p className="text-[7px] font-black uppercase text-center leading-[0.9]">FRAGILE</p>
             </div>
          </div>
        </div>

        {/* Footer cut line - More compact */}
        <div className="mt-8 pt-4 border-t border-dashed border-black/20 flex items-center justify-center gap-3 opacity-30">
           <Scissors size={14} className="-rotate-90" />
           <div className="h-[1px] bg-black/20 flex-grow" />
           <p className="text-[7px] font-black tracking-[0.8em] uppercase">CUT_ALONG_VOID_LINE</p>
           <div className="h-[1px] bg-black/20 flex-grow" />
        </div>

      </div>

      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-hidden, .noise-overlay, .scan-line, [data-radix-toast-viewport] {
            display: none !important;
          }
          @page {
            margin: 0.5cm;
          }
        }
      `}</style>
    </div>
  );
}

export default function PrintOrderPage() {
  return (
    <AdminGuard>
      <PrintOrderContent />
    </AdminGuard>
  );
}
