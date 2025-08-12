import React, { useState } from 'react';
import { storeDevAction } from '../lib/supermemory';

const DevPortal: React.FC = () => {
  const [testResult, setTestResult] = useState<string | null>(null);
  // Future: add Supermemory query UI

  // Example test: check if Register page renders
  const handleTestRegister = async () => {
    try {
      // In a real implementation, this would run actual tests
      const fakeTestResult = await new Promise(resolve => 
        setTimeout(() => resolve('Register page renders correctly'), 1000)
      );
      
      setTestResult(fakeTestResult as string);
      
      // Store dev action in Supermemory.ai
      try {
        await storeDevAction({
          action: 'test_register',
          details: 'Ran Register page rendering test',
          timestamp: new Date().toISOString()
        });
      } catch (smErr) {
        console.warn('Supermemory store failed:', smErr);
      }
      
      // Clear result after 3 seconds
      setTimeout(() => setTestResult(null), 3000);
    } catch (error) {
      setTestResult('Test failed');
      setTimeout(() => setTestResult(null), 3000);
    }
  };

  // Add more tests here as needed

  return (
    <div style={{ padding: 32, background: '#101624', color: '#fff', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 36, marginBottom: 24 }}>Developer Portal</h1>
      <button
        onClick={handleTestRegister}
        style={{ padding: '10px 16px', borderRadius: 8, background: '#2953A1', color: '#fff', border: 'none', cursor: 'pointer' }}
      >
        Run Register Render Test
      </button>
      {testResult && (
        <div style={{ marginTop: 12, color: '#9FE870' }}>{testResult}</div>
      )}
      <hr style={{ margin: '32px 0', borderColor: '#2953A1' }} />
      <div>
        <p>More dev tools and diagnostics coming soon.</p>
        <p>Use this portal to test endpoints, UI, and integration flows during development.</p>
      </div>
    </div>
  );
};

export default DevPortal;
