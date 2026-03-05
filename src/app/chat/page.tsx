
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useUser, useCollection, useMemoFirebase, setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc, serverTimestamp } from 'firebase/firestore';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader2, Send, MessageCircle, User, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FanChatPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login?redirect=/chat');
    }
  }, [user, isUserLoading, router]);

  const messagesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'chats', user.uid, 'messages'),
      orderBy('createdAt', 'asc')
    );
  }, [db, user]);

  const { data: messages, isLoading: isMessagesLoading } = useCollection(messagesQuery);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    const text = message.trim();
    setMessage('');

    const messageData = {
      senderId: user.uid,
      text,
      isAdmin: false,
      createdAt: new Date().toISOString()
    };

    const sessionRef = doc(db, 'chats', user.uid);
    const messagesRef = collection(db, 'chats', user.uid, 'messages');

    addDocumentNonBlocking(messagesRef, messageData);
    
    setDocumentNonBlocking(sessionRef, {
      userId: user.uid,
      userEmail: user.email,
      userName: user.displayName || 'Anonymous Being',
      lastMessage: text,
      lastUpdated: new Date().toISOString()
    }, { merge: true });
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-muted/20" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-black text-white relative flex flex-col">
      <Navigation />
      <div className="noise-overlay" />
      
      <div className="pt-32 md:pt-48 pb-12 px-6 flex-grow flex flex-col max-w-5xl mx-auto w-full">
        <header className="mb-12 animate-fade-in flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl md:text-8xl font-headline tracking-tighter text-glow text-muted uppercase leading-none mb-2">VOICE_LINE</h1>
            <p className="text-[10px] uppercase tracking-[0.5em] text-white/30 font-black">Direct communication with More Ink.</p>
          </div>
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-3">
            <ShieldCheck size={16} className="text-accent" />
            <span className="text-[10px] uppercase tracking-[0.4em] font-black">ENCRYPTED_VOID</span>
          </div>
        </header>

        <Card className="flex-grow bg-[#1E201E]/50 border-white/10 rounded-none flex flex-col overflow-hidden backdrop-blur-xl shadow-2xl relative h-[60vh] md:h-[70vh]">
          <div 
            ref={scrollRef}
            className="flex-grow overflow-y-auto p-6 md:p-10 space-y-6 md:space-y-8 no-scrollbar scroll-smooth"
          >
            {isMessagesLoading ? (
              <div className="h-full flex items-center justify-center opacity-20">
                <Loader2 className="animate-spin h-12 w-12" />
              </div>
            ) : messages && messages.length > 0 ? (
              messages.map((msg, idx) => (
                <div 
                  key={msg.id} 
                  className={cn(
                    "flex flex-col max-w-[85%] md:max-w-[70%] animate-fade-in",
                    msg.isAdmin ? "self-start items-start" : "self-end items-end text-right"
                  )}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className={cn(
                    "text-[8px] uppercase tracking-[0.3em] font-black mb-2 opacity-30 flex items-center gap-2",
                    msg.isAdmin ? "flex-row" : "flex-row-reverse"
                  )}>
                    {msg.isAdmin ? <ShieldCheck size={10} className="text-accent" /> : <User size={10} />}
                    {msg.isAdmin ? 'ADMIN' : 'YOU'}
                  </div>
                  <div className={cn(
                    "p-4 md:p-6 text-sm md:text-xl font-body italic leading-relaxed",
                    msg.isAdmin 
                      ? "bg-white/5 border-l-4 border-accent text-muted" 
                      : "bg-muted text-black border-r-4 border-black"
                  )}>
                    {msg.text}
                  </div>
                  <div className="text-[7px] uppercase mt-2 opacity-20 font-black tracking-widest">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                <MessageCircle size={64} className="mb-6" />
                <p className="font-headline text-2xl uppercase tracking-widest">START_THE_VIBRATION</p>
                <p className="text-[10px] mt-2 uppercase tracking-widest">Send a message to the band</p>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="p-6 md:p-10 border-t border-white/10 bg-black/40">
            <div className="flex gap-4">
              <Input 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write to the void..."
                className="bg-transparent border-0 border-b-2 border-white/10 focus:border-muted rounded-none h-14 md:h-20 px-0 text-lg md:text-2xl font-headline transition-all placeholder:text-white/5"
              />
              <Button 
                type="submit" 
                variant="impact" 
                size="icon" 
                className="h-14 w-14 md:h-20 md:w-20 shrink-0"
                disabled={!message.trim()}
              >
                <Send size={24} className="md:size-8" />
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <Footer />
    </main>
  );
}
