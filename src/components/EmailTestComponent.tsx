import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, CheckCircle, AlertTriangle, Loader } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const EmailTestComponent: React.FC = () => {
  const [testEmail, setTestEmail] = useState('');
  const [testType, setTestType] = useState<'rejection' | 'custom'>('rejection');
  const [customSubject, setCustomSubject] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  const testRejectionEmail = async () => {
    setLoading(true);
    setResult(null);

    try {
      // Call the database function to test rejection email
      const { data, error } = await supabase.rpc('test_email_function', {
        p_test_email: testEmail
      });

      if (error) throw error;

      setResult({
        success: true,
        message: data || 'Test email sent successfully',
      });
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || 'Failed to send test email',
        details: error
      });
    } finally {
      setLoading(false);
    }
  };

  const testCustomEmail = async () => {
    setLoading(true);
    setResult(null);

    try {
      // Call the Edge Function directly
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: testEmail,
          subject: customSubject || 'SPR-HOA Test Email',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #2953A6, #6bb7e3); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1>🏖️ Sandpiper Run HOA</h1>
                <p>Email System Test</p>
              </div>
              <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; color: #333;">
                <h2>Hello!</h2>
                <p>${customMessage || 'This is a test email from the SPR-HOA portal email system.'}</p>
                <p>If you received this email, the email notification system is working correctly.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #666; font-size: 14px;">
                  This is a test message from the Sandpiper Run HOA Portal.<br>
                  Sent at: ${new Date().toLocaleString()}
                </p>
              </div>
            </div>
          `
        }
      });

      if (error) throw error;

      setResult({
        success: true,
        message: 'Custom test email sent successfully',
        details: data
      });
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || 'Failed to send custom test email',
        details: error
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (testType === 'rejection') {
      testRejectionEmail();
    } else {
      testCustomEmail();
    }
  };

  const checkEmailLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_logs')
        .select('*')
        .in('log_type', ['email_sent', 'email_error'])
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      console.log('Recent email logs:', data);
      alert('Email logs printed to console. Check browser developer tools.');
    } catch (error: any) {
      console.error('Error fetching email logs:', error);
      alert('Error fetching email logs: ' + error.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 max-w-2xl mx-auto"
    >
      <div className="flex items-center space-x-3 mb-6">
        <Mail className="h-6 w-6 text-blue-400" />
        <h2 className="text-2xl font-bold text-white">Email System Test</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Address */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Test Email Address
          </label>
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300"
            placeholder="admin@example.com"
          />
        </div>

        {/* Test Type */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Test Type
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setTestType('rejection')}
              className={`p-4 rounded-lg border-2 transition-all ${
                testType === 'rejection'
                  ? 'bg-red-500/20 border-red-500/50 text-red-300'
                  : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
              }`}
            >
              <div className="font-medium">Photo Rejection</div>
              <div className="text-sm opacity-80">Test rejection email template</div>
            </button>
            <button
              type="button"
              onClick={() => setTestType('custom')}
              className={`p-4 rounded-lg border-2 transition-all ${
                testType === 'custom'
                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                  : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
              }`}
            >
              <div className="font-medium">Custom Email</div>
              <div className="text-sm opacity-80">Test custom message</div>
            </button>
          </div>
        </div>

        {/* Custom Email Fields */}
        {testType === 'custom' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Subject (Optional)
              </label>
              <input
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300"
                placeholder="Custom test subject"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Message (Optional)
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300 resize-none"
                placeholder="Custom test message"
              />
            </div>
          </motion.div>
        )}

        {/* Submit Button */}
        <div className="flex items-center space-x-4">
          <button
            type="submit"
            disabled={loading || !testEmail}
            className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-600 text-white font-semibold rounded-xl hover:from-blue-400 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                <span>Send Test Email</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={checkEmailLogs}
            className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors"
          >
            View Logs
          </button>
        </div>
      </form>

      {/* Result Display */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-6 p-4 rounded-lg border ${
            result.success
              ? 'bg-green-500/20 border-green-500/30'
              : 'bg-red-500/20 border-red-500/30'
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
              {result.details && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm opacity-80">
                    View Details
                  </summary>
                  <pre className="mt-2 p-2 bg-black/20 rounded text-xs overflow-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <h3 className="text-blue-300 font-medium mb-2">Testing Instructions</h3>
        <ul className="text-blue-200 text-sm space-y-1">
          <li>• Use a real email address you can access</li>
          <li>• Check both inbox and spam folders</li>
          <li>• Photo rejection tests the full database workflow</li>
          <li>• Custom email tests the Edge Function directly</li>
          <li>• View logs to troubleshoot any issues</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default EmailTestComponent;
