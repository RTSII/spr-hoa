import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Inbox,
  Mail,
  MailOpen,
  Trash2,
  Archive,
  Camera,
  AlertTriangle,
  CheckCircle,
  X,
  Eye,
  Clock,
  User
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface SiteMessage {
  id: string;
  sender_type: 'system' | 'admin' | 'user';
  message_type: 'notification' | 'photo_rejection' | 'photo_approval' | 'alert' | 'general';
  subject: string;
  content: string;
  is_read: boolean;
  is_archived: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  read_at?: string;
  metadata?: any;
}

interface SiteInboxProps {
  onClose?: () => void;
  isModal?: boolean;
}

const SiteInbox: React.FC<SiteInboxProps> = ({ onClose, isModal = false }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<SiteMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<SiteMessage | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_messages')
        .select('*')
        .eq('recipient_user_id', user?.id)
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase.rpc('mark_message_as_read', {
        p_message_id: messageId
      });

      if (error) throw error;

      // Update local state
      setMessages(prev => prev.map(msg =>
        msg.id === messageId ? { ...msg, is_read: true, read_at: new Date().toISOString() } : msg
      ));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const archiveMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('site_messages')
        .update({ is_archived: true, archived_at: new Date().toISOString() })
        .eq('id', messageId)
        .eq('recipient_user_id', user?.id);

      if (error) throw error;

      // Remove from local state
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      setSelectedMessage(null);
    } catch (error) {
      console.error('Error archiving message:', error);
    }
  };

  const getMessageIcon = (message: SiteMessage) => {
    switch (message.message_type) {
      case 'photo_rejection':
        return <Camera className="h-4 w-4 text-red-400" />;
      case 'photo_approval':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'alert':
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      default:
        return <Mail className="h-4 w-4 text-blue-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-400 bg-red-500/20';
      case 'high':
        return 'text-orange-400 bg-orange-500/20';
      case 'medium':
        return 'text-blue-400 bg-blue-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  const filteredMessages = messages.filter(message => {
    switch (filter) {
      case 'unread':
        return !message.is_read;
      case 'read':
        return message.is_read;
      default:
        return true;
    }
  });

  const unreadCount = messages.filter(msg => !msg.is_read).length;

  const handleMessageClick = (message: SiteMessage) => {
    setSelectedMessage(message);
    if (!message.is_read) {
      markAsRead(message.id);
    }
  };

  const InboxContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <Inbox className="h-6 w-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Site Inbox</h2>
          {unreadCount > 0 && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {isModal && (
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex space-x-1 p-4 border-b border-white/10">
        {[
          { key: 'all', label: 'All', count: messages.length },
          { key: 'unread', label: 'Unread', count: unreadCount },
          { key: 'read', label: 'Read', count: messages.length - unreadCount }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === tab.key
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Message List */}
        <div className="w-1/2 border-r border-white/10 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/60">
              <Inbox className="h-12 w-12 mb-4 opacity-50" />
              <p>No messages found</p>
            </div>
          ) : (
            <div className="space-y-1 p-4">
              {filteredMessages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    selectedMessage?.id === message.id
                      ? 'bg-blue-500/20 border border-blue-500/30'
                      : message.is_read
                      ? 'bg-white/5 hover:bg-white/10'
                      : 'bg-blue-500/10 hover:bg-blue-500/15 border border-blue-500/20'
                  }`}
                  onClick={() => handleMessageClick(message)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getMessageIcon(message)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`text-sm font-medium truncate ${
                          message.is_read ? 'text-white/80' : 'text-white'
                        }`}>
                          {message.subject}
                        </p>
                        <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(message.priority)}`}>
                          {message.priority}
                        </span>
                      </div>
                      <p className="text-white/60 text-sm truncate mb-2">
                        {message.content}
                      </p>
                      <div className="flex items-center justify-between text-xs text-white/50">
                        <span className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{message.sender_type}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(message.created_at).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>
                    {!message.is_read && (
                      <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Message Detail */}
        <div className="w-1/2 overflow-y-auto">
          {selectedMessage ? (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  {getMessageIcon(selectedMessage)}
                  <h3 className="text-xl font-semibold text-white">
                    {selectedMessage.subject}
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(selectedMessage.priority)}`}>
                    {selectedMessage.priority}
                  </span>
                  <button
                    onClick={() => archiveMessage(selectedMessage.id)}
                    className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded"
                    title="Archive"
                  >
                    <Archive className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4 text-sm text-white/70">
                  <span className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>From: {selectedMessage.sender_type}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(selectedMessage.created_at).toLocaleString()}</span>
                  </span>
                  {selectedMessage.read_at && (
                    <span className="flex items-center space-x-1">
                      <MailOpen className="h-4 w-4" />
                      <span>Read: {new Date(selectedMessage.read_at).toLocaleString()}</span>
                    </span>
                  )}
                </div>

                <div className="prose prose-invert max-w-none">
                  <div className="text-white/90 leading-relaxed whitespace-pre-wrap">
                    {selectedMessage.content}
                  </div>
                </div>

                {/* Metadata for photo rejections */}
                {selectedMessage.message_type === 'photo_rejection' && selectedMessage.metadata && (
                  <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <h4 className="text-red-400 font-medium mb-2">Photo Rejection Details</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-white/60">Photo Title:</span>
                        <span className="text-white ml-2">{selectedMessage.metadata.photo_title}</span>
                      </div>
                      <div>
                        <span className="text-white/60">Photo Type:</span>
                        <span className="text-white ml-2">{selectedMessage.metadata.photo_type}</span>
                      </div>
                      <div>
                        <span className="text-white/60">Rejection Reason:</span>
                        <span className="text-white ml-2">{selectedMessage.metadata.rejection_reason}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-white/60">
              <div className="text-center">
                <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a message to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/20 w-full max-w-5xl h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <InboxContent />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="glass-card p-0 h-[600px] overflow-hidden">
      <InboxContent />
    </div>
  );
};

export default SiteInbox;
