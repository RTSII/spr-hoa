import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Users,
  Search,
  Building,
  User,
  Mail,
  MessageSquare,
  Check,
  X,
  Loader,
  AlertTriangle,
  CheckCircle,
  Plus,
  LayoutTemplate,
  Eye,
  Trash2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface Resident {
  user_id: string;
  first_name: string;
  last_name: string;
  unit_number: string;
  email: string;
  directory_opt_in: boolean;
}

interface MessageTemplate {
  id: string;
  template_name: string;
  subject_template: string;
  content_template: string;
  is_default: boolean;
}

const AdminMessaging: React.FC = () => {
  const { user } = useAuth();
  const [recipients, setRecipients] = useState<Resident[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Resident[]>([]);
  const [recipientMode, setRecipientMode] = useState<'all' | 'building' | 'individual'>('individual');
  const [selectedBuilding, setSelectedBuilding] = useState('');

  // Message composition
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [sendSiteInbox, setSendSiteInbox] = useState(true);

  // Templates
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showTemplates, setShowTemplates] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_message_templates')
        .select('*')
        .order('is_default', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const performSearch = async () => {
    setSearchLoading(true);
    try {
      const { data, error } = await supabase.rpc('search_residents', {
        p_search_term: searchTerm
      });

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching residents:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const getRecipientCount = async () => {
    try {
      let recipientIds: string[] = [];

      switch (recipientMode) {
        case 'all':
          const { data: allData, error: allError } = await supabase.rpc('get_all_recipients');
          if (allError) throw allError;
          recipientIds = allData || [];
          break;

        case 'building':
          if (selectedBuilding) {
            const { data: buildingData, error: buildingError } = await supabase.rpc('get_building_recipients', {
              p_building: selectedBuilding
            });
            if (buildingError) throw buildingError;
            recipientIds = buildingData || [];
          }
          break;

        case 'individual':
          recipientIds = selectedRecipients;
          break;
      }

      return recipientIds.length;
    } catch (error) {
      console.error('Error getting recipient count:', error);
      return 0;
    }
  };

  const applyTemplate = (template: MessageTemplate) => {
    setSubject(template.subject_template);
    setContent(template.content_template);
    setSelectedTemplate(template.id);
    setShowTemplates(false);
  };

  const toggleRecipient = (userId: string) => {
    setSelectedRecipients(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSendMessage = async () => {
    if (!subject.trim() || !content.trim()) {
      setResult({
        success: false,
        message: 'Please enter both subject and content'
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      let recipientIds: string[] = [];

      // Get recipient IDs based on mode
      switch (recipientMode) {
        case 'all':
          const { data: allData, error: allError } = await supabase.rpc('get_all_recipients');
          if (allError) throw allError;
          recipientIds = allData || [];
          break;

        case 'building':
          if (!selectedBuilding) {
            throw new Error('Please select a building');
          }
          const { data: buildingData, error: buildingError } = await supabase.rpc('get_building_recipients', {
            p_building: selectedBuilding
          });
          if (buildingError) throw buildingError;
          recipientIds = buildingData || [];
          break;

        case 'individual':
          if (selectedRecipients.length === 0) {
            throw new Error('Please select at least one recipient');
          }
          recipientIds = selectedRecipients;
          break;
      }

      if (recipientIds.length === 0) {
        throw new Error('No recipients found for the selected criteria');
      }

      // Send site inbox messages
      if (sendSiteInbox) {
        const { data: siteResult, error: siteError } = await supabase.rpc('send_bulk_site_messages', {
          p_recipient_user_ids: recipientIds,
          p_sender_user_id: user?.id,
          p_sender_name: 'SPR Admin',
          p_sender_email: 'admin@sandpiperrun.com',
          p_subject: subject,
          p_content: content,
          p_priority: priority,
          p_metadata: {
            sent_via: 'admin_messaging',
            recipient_mode: recipientMode,
            building: selectedBuilding || null
          }
        });

        if (siteError) throw siteError;
      }

      // Email functionality removed - use AdminEmailSystem for emails

      setResult({
        success: true,
        message: `Message sent successfully to ${recipientIds.length} recipient(s)`,
        details: {
          recipientCount: recipientIds.length,
          siteInbox: sendSiteInbox,
          mode: recipientMode
        }
      });

      // Clear form
      setSubject('');
      setContent('');
      setSelectedRecipients([]);
      setSearchTerm('');
      setSearchResults([]);
      setSelectedTemplate('');

    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || 'Failed to send message',
        details: error
      });
    } finally {
      setLoading(false);
    }
  };

  const getRecipientSummary = () => {
    switch (recipientMode) {
      case 'all':
        return 'All opted-in residents';
      case 'building':
        return selectedBuilding ? `All residents in Building ${selectedBuilding}` : 'Select a building';
      case 'individual':
        return `${selectedRecipients.length} selected resident(s)`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <MessageSquare className="h-6 w-6 text-blue-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Send Site Inbox Message</h2>
            <p className="text-white/70 text-sm">Send messages to residents' portal inbox from SPR Admin</p>
          </div>
        </div>
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
        >
          <LayoutTemplate className="h-4 w-4" />
          <span>Templates</span>
        </button>
      </div>

      {/* Templates Panel */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-4"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Message Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white/10 rounded-lg p-4 cursor-pointer hover:bg-white/20 transition-colors"
                  onClick={() => applyTemplate(template)}
                >
                  <h4 className="font-semibold text-white">{template.template_name}</h4>
                  <p className="text-white/70 text-sm mt-1">{template.subject_template}</p>
                  <p className="text-white/50 text-xs mt-2 line-clamp-2">
                    {template.content_template.substring(0, 100)}...
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recipient Selection */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Select Recipients</h3>

          {/* Recipient Mode Selection */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-3 gap-2">
              {[
                { mode: 'all', icon: Users, label: 'All Residents' },
                { mode: 'building', icon: Building, label: 'By Building' },
                { mode: 'individual', icon: User, label: 'Individual' }
              ].map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setRecipientMode(mode as any)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    recipientMode === mode
                      ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                      : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-5 w-5 mx-auto mb-1" />
                  <div className="text-sm">{label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Building Selection */}
          {recipientMode === 'building' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-white mb-2">
                Select Building
              </label>
              <select
                value={selectedBuilding}
                onChange={(e) => setSelectedBuilding(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              >
                <option value="">Choose a building...</option>
                <option value="A">Building A</option>
                <option value="B">Building B</option>
                <option value="C">Building C</option>
                <option value="D">Building D</option>
              </select>
            </div>
          )}

          {/* Individual Search */}
          {recipientMode === 'individual' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or unit number..."
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                />
                {searchLoading && (
                  <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50 animate-spin" />
                )}
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {searchResults.map((resident) => (
                    <div
                      key={resident.user_id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedRecipients.includes(resident.user_id)
                          ? 'bg-blue-500/20 border-blue-500/50'
                          : 'bg-white/5 border-white/20 hover:bg-white/10'
                      }`}
                      onClick={() => toggleRecipient(resident.user_id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium">
                            {resident.first_name} {resident.last_name}
                          </div>
                          <div className="text-white/70 text-sm">
                            Unit {resident.unit_number} • {resident.email}
                          </div>
                        </div>
                        {selectedRecipients.includes(resident.user_id) && (
                          <Check className="h-5 w-5 text-blue-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Recipients Summary */}
              {selectedRecipients.length > 0 && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="text-blue-300 text-sm">
                    {selectedRecipients.length} recipient(s) selected
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recipient Summary */}
          <div className="mt-4 p-3 bg-white/10 rounded-lg">
            <div className="text-white/80 text-sm">
              <strong>Sending to:</strong> {getRecipientSummary()}
            </div>
          </div>
        </div>

        {/* Message Composition */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Compose Message</h3>

          <div className="space-y-4">
            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Subject *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Message subject..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Message Content *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type your message here..."
                rows={8}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 resize-none"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Message Type Info */}
            <div className="p-4 bg-white/10 rounded-lg border border-white/20">
              <div className="text-white/80 text-sm">
                <strong>Site Inbox Messages</strong><br/>
                Messages sent to residents' portal inbox from SPR Admin.<br/>
                For emails, use the separate Email System.
              </div>
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={loading || !subject.trim() || !content.trim()}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-600 text-white font-semibold rounded-lg hover:from-blue-400 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Result Display */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`glass-card p-4 border ${
            result.success
              ? 'border-green-500/30 bg-green-500/10'
              : 'border-red-500/30 bg-red-500/10'
          }`}
        >
          <div className="flex items-start space-x-3">
            {result.success ? (
              <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`font-medium ${
                result.success ? 'text-green-300' : 'text-red-300'
              }`}>
                {result.message}
              </p>
              {result.details && result.success && (
                <div className="mt-2 text-sm text-white/70">
                  <div>Recipients: {result.details.recipientCount}</div>
                  <div>Site Inbox: {result.details.siteInbox ? 'Yes' : 'No'}</div>
                  <div>Email: {result.details.email ? 'Yes' : 'No'}</div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminMessaging;
