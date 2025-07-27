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
      } catch (err: any) {
        setError(err.message || 'Failed to load messages');
      } finally {
        setLoading(false);
      }
    }
    fetchMessages();
  }, [user_id]);

  return (
    <div className="glass-card p-6 max-w-2xl mx-auto mt-10 animate-fadeInUp">
      <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
        Inbox
        <span className="ml-2 bg-[var(--spr-blue)]/20 text-[var(--spr-blue)] px-3 py-1 rounded-full text-xs font-semibold">
          {messages.filter(m => !m.read).length} New
        </span>
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
              className={`flex items-start p-4 rounded-lg shadow-lg transition-all border-l-4 ${
                msg.type === 'emergency'
                  ? 'bg-red-900/80 border-red-500'
                  : 'bg-white/10 border-[var(--spr-blue)]'
              }`}
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
