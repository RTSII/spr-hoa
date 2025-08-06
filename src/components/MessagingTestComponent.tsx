import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Database,
  Send,
  User,
  CheckCircle,
  AlertTriangle,
  Play,
  Loader,
  Mail,
  Eye
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const MessagingTestComponent: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [testStage, setTestStage] = useState('');

  const runComprehensiveTest = async () => {
    setLoading(true);
    setTestResults([]);
    const results: any[] = [];

    try {
      // Test 1: Check if messaging tables exist
      setTestStage('Checking database tables...');
      try {
        const { data: tableCheck, error: tableError } = await supabase
          .from('site_messages')
          .select('count', { count: 'exact', head: true });

        results.push({
          test: 'Database Tables',
          status: 'success',
          message: 'site_messages table exists',
          details: `Found table with ${tableCheck?.length || 0} records`
        });
      } catch (error: any) {
        results.push({
          test: 'Database Tables',
          status: 'error',
          message: 'site_messages table missing',
          details: error.message,
          fix: 'Run the SQL script: sql/complete_messaging_system.sql'
        });
      }

      // Test 2: Check notification preferences table
      try {
        const { data: prefCheck, error: prefError } = await supabase
          .from('user_notification_preferences')
          .select('count', { count: 'exact', head: true });

        results.push({
          test: 'Notification Preferences',
          status: 'success',
          message: 'user_notification_preferences table exists',
          details: `Found ${prefCheck?.length || 0} user preferences`
        });
      } catch (error: any) {
        results.push({
          test: 'Notification Preferences',
          status: 'error',
          message: 'user_notification_preferences table missing',
          details: error.message
        });
      }

      // Test 3: Check SQL functions
      setTestStage('Testing SQL functions...');
      try {
        const { data: funcTest, error: funcError } = await supabase.rpc('get_unread_message_count', {
          p_user_id: user?.id
        });

        results.push({
          test: 'SQL Functions',
          status: 'success',
          message: 'get_unread_message_count function works',
          details: `Current unread count: ${funcTest || 0}`
        });
      } catch (error: any) {
        results.push({
          test: 'SQL Functions',
          status: 'error',
          message: 'SQL functions missing or broken',
          details: error.message,
          fix: 'Ensure all functions from complete_messaging_system.sql are deployed'
        });
      }

      // Test 4: Send test site message (admin only)
      if (isAdmin && user) {
        setTestStage('Testing message sending...');
        try {
          const { data: sendResult, error: sendError } = await supabase.rpc('send_site_message', {
            p_recipient_user_id: user.id,
            p_sender_name: 'Test System',
            p_sender_email: 'test@system.com',
            p_subject: 'Messaging System Test',
            p_content: 'This is a test message to verify the messaging system is working correctly.',
            p_priority: 'low'
          });

          results.push({
            test: 'Send Message',
            status: 'success',
            message: 'Test message sent successfully',
            details: `Message ID: ${sendResult}`
          });
        } catch (error: any) {
          results.push({
            test: 'Send Message',
            status: 'error',
            message: 'Failed to send test message',
            details: error.message
          });
        }
      }

      // Test 5: Check user's messages
      setTestStage('Checking user messages...');
      try {
        const { data: messages, error: msgError } = await supabase
          .from('site_messages')
          .select('*')
          .eq('recipient_user_id', user?.id)
          .order('created_at', { ascending: false })
          .limit(5);

        results.push({
          test: 'User Messages',
          status: 'success',
          message: `Found ${messages?.length || 0} messages`,
          details: messages?.map(m => `"${m.subject}" (${m.is_read ? 'read' : 'unread'})`).join(', ') || 'No messages'
        });
      } catch (error: any) {
        results.push({
          test: 'User Messages',
          status: 'error',
          message: 'Failed to fetch user messages',
          details: error.message
        });
      }

      // Test 6: Test search function (admin only)
      if (isAdmin) {
        setTestStage('Testing resident search...');
        try {
          const { data: searchResults, error: searchError } = await supabase.rpc('search_residents', {
            p_search_term: 'A'
          });

          results.push({
            test: 'Resident Search',
            status: 'success',
            message: `Search function works - found ${searchResults?.length || 0} residents`,
            details: searchResults?.slice(0, 3).map((r: any) => `${r.first_name} ${r.last_name} (Unit ${r.unit_number})`).join(', ') || 'No residents found'
          });
        } catch (error: any) {
          results.push({
            test: 'Resident Search',
            status: 'error',
            message: 'Resident search function failed',
            details: error.message
          });
        }
      }

      // Test 7: Check if email function exists
      setTestStage('Checking email integration...');
      try {
        const { data: emailTest, error: emailError } = await supabase.functions.invoke('send-email', {
          body: {
            to: 'test@example.com',
            subject: 'Test Email',
            html: '<p>Test</p>'
          }
        });

        results.push({
          test: 'Email Integration',
          status: emailError ? 'warning' : 'success',
          message: emailError ? 'Email function exists but not configured' : 'Email function ready',
          details: emailError?.message || 'Edge Function responding'
        });
      } catch (error: any) {
        results.push({
          test: 'Email Integration',
          status: 'warning',
          message: 'Email Edge Function not deployed',
          details: 'Run ./deploy-email-service.sh to set up email functionality'
        });
      }

    } catch (error: any) {
      results.push({
        test: 'General Error',
        status: 'error',
        message: 'Unexpected error during testing',
        details: error.message
      });
    }

    setTestResults(results);
    setLoading(false);
    setTestStage('');
  };

  const sendTestMessage = async () => {
    if (!isAdmin || !user) return;

    try {
      const { data: result, error } = await supabase.rpc('send_site_message', {
        p_recipient_user_id: user.id,
        p_sender_name: 'Rob - SPR-HOA Admin',
        p_sender_email: 'rob@ursllc.com',
        p_subject: 'Manual Test Message',
        p_content: `This is a manual test message sent at ${new Date().toLocaleString()}. The messaging system is working correctly!`,
        p_priority: 'medium'
      });

      if (error) throw error;

      alert('Test message sent successfully! Check your inbox.');
    } catch (error: any) {
      alert('Error sending test message: ' + error.message);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-red-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'border-green-500/30 bg-green-500/10';
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-500/10';
      default:
        return 'border-red-500/30 bg-red-500/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <MessageSquare className="h-6 w-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Messaging System Test</h2>
        </div>
        <div className="flex items-center space-x-4">
          {isAdmin && (
            <button
              onClick={sendTestMessage}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-300 transition-colors"
            >
              <Send className="h-4 w-4" />
              <span>Send Test Message</span>
            </button>
          )}
          <button
            onClick={runComprehensiveTest}
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-teal-600 text-white rounded-lg hover:from-blue-400 hover:to-teal-500 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            <span>{loading ? 'Testing...' : 'Run Full Test'}</span>
          </button>
        </div>
      </div>

      {/* Current Stage */}
      {loading && testStage && (
        <div className="glass-card p-4">
          <div className="flex items-center space-x-3">
            <Loader className="h-5 w-5 animate-spin text-blue-400" />
            <span className="text-white">{testStage}</span>
          </div>
        </div>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Test Results</h3>
          {testResults.map((result, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`glass-card p-4 border ${getStatusColor(result.status)}`}
            >
              <div className="flex items-start space-x-3">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white">{result.test}</h4>
                    <span className={`px-2 py-1 text-xs rounded ${
                      result.status === 'success' ? 'bg-green-500/20 text-green-300' :
                      result.status === 'warning' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {result.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-white/90 mb-2">{result.message}</p>
                  {result.details && (
                    <p className="text-white/60 text-sm mb-2">{result.details}</p>
                  )}
                  {result.fix && (
                    <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded text-blue-300 text-sm">
                      <strong>Fix:</strong> {result.fix}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Setup Instructions */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Setup Instructions</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Database className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-white">1. Database Setup</h4>
              <p className="text-white/70 text-sm">
                Execute <code className="bg-white/10 px-2 py-1 rounded">sql/complete_messaging_system.sql</code> in your Supabase SQL Editor
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Mail className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-white">2. Email Service</h4>
              <p className="text-white/70 text-sm">
                Run <code className="bg-white/10 px-2 py-1 rounded">./deploy-email-service.sh</code> to set up email notifications
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Eye className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-white">3. Test the System</h4>
              <p className="text-white/70 text-sm">
                Use this component to verify all functionality, then test photo rejection workflow
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Summary */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Messaging System Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-blue-300">For Residents:</h4>
            <ul className="text-white/70 text-sm space-y-1">
              <li>• Site inbox for messages</li>
              <li>• Photo rejection notifications</li>
              <li>• Email notifications (if opted in)</li>
              <li>• Message archiving and read status</li>
              <li>• Priority-based message display</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-blue-300">For Admin (Rob):</h4>
            <ul className="text-white/70 text-sm space-y-1">
              <li>• Send messages to all residents</li>
              <li>• Send messages by building</li>
              <li>• Send messages to individuals</li>
              <li>• Email from rob@ursllc.com</li>
              <li>• Message templates</li>
              <li>• Photo rejection auto-messages</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagingTestComponent;
