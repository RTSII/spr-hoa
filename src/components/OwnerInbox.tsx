import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

export type InboxMessage = {
  id: string;
  title: string;
  body: string;
  sent_at: string;
  type: 'emergency' | 'notice' | 'info';
  read?: boolean;
};

const alertIcon = (
  <svg className="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M4.93 19h14.14c1.54 0 2.5-1.67 1.94-3.09l-7.07-15.18A2 2 0 0012 2a2 2 0 00-1.94 1.73L2.99 15.91C2.43 17.33 3.39 19 4.93 19z"/></svg>
);

const infoIcon = (
  <svg className="w-6 h-6 text-[var(--spr-blue)] mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01"/></svg>
);

const OwnerInbox: React.FC<{ user_id: string }> = ({ user_id }) => {
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markingRead, setMarkingRead] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMessages() {
      setLoading(true);
      setError('');
      try {
        // Get owner profile id from user_id
        const { data: owner, error: ownerError } = await supabase
          .from('owner_profiles')
          .select('id')
          .eq('user_id', user_id)
          .maybeSingle();
        if (ownerError || !owner) throw new Error('Could not find owner profile.');
        // Fetch messages for this owner or broadcast
        const { data, error: msgError } = await supabase
          .from('owner_messages')
          .select('*')
          .or(`owner_id.eq.${owner.id},broadcast.eq.true`)
          .order('sent_at', { ascending: false });
        if (msgError) throw msgError;
        setMessages(
          data.sort((a: InboxMessage, b: InboxMessage) => {
            if ((a.read ? 1 : 0) !== (b.read ? 1 : 0)) return a.read ? 1 : -1;
            if (a.type !== b.type) return a.type === 'emergency' ? -1 : 1;
            return 0;
          })
        );
        // Optionally, mark all as read when inbox is opened
        const unreadIds = data.filter((msg: InboxMessage) => !msg.read).map((msg: InboxMessage) => msg.id);
        if (unreadIds.length > 0) {
          markMessagesRead(unreadIds);
        }
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string') {
          setError((err as any).message);
        } else {
          setError('Failed to load messages');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchMessages();
  }, [user_id]);

  // Mark messages as read in Supabase
  const markMessagesRead = async (ids: string[]) => {
    setMarkingRead(ids[0] || null);
    try {
      await supabase.from('owner_messages').update({ read: true }).in('id', ids);
      setMessages(prev => prev.map(msg => ids.includes(msg.id) ? { ...msg, read: true } : msg));
    } catch (err) {
      // Silently fail for now
    } finally {
      setMarkingRead(null);
    }
  };

  return (
    <div className="glass-card p-8 space-y-6">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        Owner Inbox
        {messages.some(m => !m.read) && (
          <span className="ml-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full animate-pulse" aria-label="Unread messages">
            {messages.filter(m => !m.read).length} unread
          </span>
        )}
      </h2>
      {loading ? (
        <div className="text-white/70 text-center">Loading...</div>
      ) : error ? (
        <div className="text-red-400 text-center">{error}</div>
      ) : (
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-white/70 text-center">No messages yet.</div>
          )}
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              tabIndex={0}
              role="article"
              aria-label={msg.type === 'emergency' ? `Emergency: ${msg.title}` : msg.title}
              className={`flex items-start p-4 rounded-lg shadow-lg transition-all border-l-4 outline-none group focus:ring-2 focus:ring-[var(--spr-blue)] focus:ring-offset-2 focus:ring-offset-black ${
                msg.type === 'emergency'
                  ? 'bg-red-900/80 border-red-500'
                  : msg.read
                    ? 'bg-white/10 border-[var(--spr-blue)]'
                    : 'bg-white/20 border-[var(--spr-blue)] shadow-[0_0_16px_2px_rgba(41,83,166,0.4)] animate-glow'
              } ${!msg.read ? 'hover:shadow-[0_0_24px_4px_rgba(41,83,166,0.6)] cursor-pointer' : ''}`}
              style={{transition: 'box-shadow 0.3s, border-color 0.3s'}}
            >
              <div className="flex-shrink-0 mt-1">
                {msg.type === 'emergency' ? alertIcon : infoIcon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${msg.type === 'emergency' ? 'text-red-300' : 'text-[var(--spr-blue)]'}`}>{msg.title}</span>
                  <span className="ml-auto text-xs text-white/50">{new Date(msg.sent_at).toLocaleString()}</span>
                </div>
                <div className="text-white/90 mt-1">{msg.body}</div>
                {msg.type === 'emergency' && (
                  <div className="mt-2 text-xs text-red-200 italic">This is an emergency/short-notice alert. Residents will be notified by email{` and SMS (future)`}.</div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
      <div className="mt-8 text-xs text-white/60 text-center">
        <span className="block">For emergencies (e.g. elevator out of service, water/power shut-off), residents will receive email and (future) SMS notifications.</span>
      </div>
    </div>
  );
};

export default OwnerInbox;
