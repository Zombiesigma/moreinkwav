
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, MessageSquare, User, Send, Clock, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ChatManager() {
  const db = useFirestore();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const sessionsQuery = useMemoFirebase(() => query(collection(db, 'chats'), orderBy('lastUpdated', 'desc')), [db]);
  const { data: sessions, isLoading: isSessionsLoading } = useCollection(sessionsQuery);

  const messagesQuery = useMemoFirebase(() => {
    if (!db || !selectedUserId) return null;
    return query(
      collection(db, 'chats', selectedUserId, 'messages'),
      orderBy('createdAt', 'asc')
    );
  }, [db, selectedUserId]);

  const { data: messages, isLoading: isMessagesLoading } = useCollection(messagesQuery);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !selectedUserId) return;

    const text = reply.trim();
    setReply('');

    const messageData = {
      senderId: 'admin',
      text,
      isAdmin: true,
      createdAt: new Date().toISOString()
    };

    const sessionRef = doc(db, 'chats', selectedUserId);
    const messagesRef = collection(db, 'chats', selectedUserId, 'messages');

    addDocumentNonBlocking(messagesRef, messageData);
    
    setDocumentNonBlocking(sessionRef, {
      lastMessage: text,
      lastUpdated: new Date().toISOString()
    }, { merge: true });
  };

  const activeSession = sessions?.find(s => s.userId === selectedUserId);

  return (
    <div className="grid lg:grid-cols-12 gap-8 h-[70vh]">
      {/* Session List */}
      <Card className="lg:col-span-4 bg-white/5 border-white/10 rounded-none overflow-hidden flex flex-col">
        <CardHeader className="border-b border-white/10 bg-black/40">
          <CardTitle className="font-headline text-2xl text-muted uppercase tracking-tighter">THREADS</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-y-auto no-scrollbar flex-grow">
          {isSessionsLoading ? (
            <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-muted/20" /></div>
          ) : sessions && sessions.length > 0 ? (
            sessions.map(session => (
              <button
                key={session.userId}
                onClick={() => setSelectedUserId(session.userId)}
                className={cn(
                  "w-full p-6 border-b border-white/5 text-left transition-all group relative overflow-hidden",
                  selectedUserId === session.userId ? "bg-white/10" : "hover:bg-white/[0.03]"
                )}
              >
                {selectedUserId === session.userId && <div className="absolute left-0 top-0 h-full w-1 bg-accent" />}
                <div className="flex justify-between items-start mb-2">
                  <span className="font-headline text-lg uppercase tracking-tight text-white group-hover:text-glow transition-all truncate">
                    {session.userName || session.userEmail}
                  </span>
                  <span className="text-[8px] font-black text-white/20 mt-1">
                    {new Date(session.lastUpdated).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs italic text-white/40 truncate line-clamp-1 pr-4">
                  "{session.lastMessage}"
                </p>
              </button>
            ))
          ) : (
            <div className="p-20 text-center opacity-10">
              <MessageSquare size={48} className="mx-auto mb-4" />
              <p className="font-headline text-xl">EMPTY</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chat Window */}
      <Card className="lg:col-span-8 bg-white/5 border-white/10 rounded-none overflow-hidden flex flex-col relative">
        {selectedUserId ? (
          <>
            <CardHeader className="border-b border-white/10 bg-black/40 flex flex-row justify-between items-center px-8 py-6">
              <div>
                <CardTitle className="font-headline text-2xl text-muted uppercase tracking-tighter">
                  {activeSession?.userName || 'LOADING...'}
                </CardTitle>
                <p className="text-[8px] uppercase tracking-widest text-white/20 font-black">UID: {selectedUserId}</p>
              </div>
              <div className="flex items-center gap-3 text-accent animate-pulse">
                <div className="h-2 w-2 rounded-full bg-accent" />
                <span className="text-[10px] font-black uppercase tracking-widest">ACTIVE_SESSION</span>
              </div>
            </CardHeader>

            <div 
              ref={scrollRef}
              className="flex-grow overflow-y-auto p-8 space-y-8 no-scrollbar scroll-smooth bg-black/20"
            >
              {isMessagesLoading ? (
                <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin" /></div>
              ) : messages?.map(msg => (
                <div 
                  key={msg.id} 
                  className={cn(
                    "flex flex-col max-w-[80%]",
                    msg.isAdmin ? "self-end items-end" : "self-start items-start"
                  )}
                >
                  <div className={cn(
                    "text-[8px] uppercase tracking-widest font-black mb-2 opacity-20 flex items-center gap-2",
                    msg.isAdmin ? "flex-row-reverse" : "flex-row"
                  )}>
                    {msg.isAdmin ? <ShieldCheck size={10} /> : <User size={10} />}
                    {msg.isAdmin ? 'YOU (ADMIN)' : 'FAN'}
                  </div>
                  <div className={cn(
                    "p-5 text-lg font-body italic leading-relaxed shadow-xl",
                    msg.isAdmin 
                      ? "bg-muted text-black border-r-4 border-black" 
                      : "bg-white/5 border-l-4 border-accent text-white/80"
                  )}>
                    {msg.text}
                  </div>
                  <span className="text-[7px] mt-2 opacity-10 font-black uppercase">{new Date(msg.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendReply} className="p-8 border-t border-white/10 bg-black/40">
              <div className="flex gap-4">
                <Input 
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Respond to the being..."
                  className="bg-transparent border-0 border-b-2 border-white/10 focus:border-muted rounded-none h-16 text-xl font-headline transition-all"
                />
                <Button type="submit" variant="impact" size="icon" className="h-16 w-16 shrink-0">
                  <Send size={24} />
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-center p-20 opacity-10">
            <MessageSquare size={120} strokeWidth={0.5} className="mb-8" />
            <h3 className="font-headline text-4xl uppercase tracking-widest">SELECT_A_THREAD</h3>
            <p className="mt-4 text-xs uppercase tracking-widest">Awaiting interaction from the void</p>
          </div>
        )}
      </Card>
    </div>
  );
}
