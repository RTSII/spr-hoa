import React, { useState } from 'react';

const DevPortal: React.FC = () => {
  const [testResult, setTestResult] = useState<string | null>(null);

  // Example test: check if Register page renders
  const handleTestRegister = async () => {
    try {
      const res = await fetch('/register');
      if (res.ok) {
        setTestResult('Register page is reachable (HTTP 200)');
      } else {
        setTestResult(`Register page error: HTTP ${res.status}`);
      }
    } catch (err) {
      setTestResult('Error fetching /register: ' + (err as Error).message);
    }
  };

  // Add more tests here as needed

  return (
    <div style={{ padding: 32, background: '#101624', color: '#fff', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 36, marginBottom: 24 }}>Developer Portal</h1>
      <button
        style={{
          background: '#2953A1',
          color: '#fff',
          padding: '12px 32px',
          borderRadius: 8,
          fontSize: 18,
          border: 'none',
          cursor: 'pointer',
          marginBottom: 16
        }}
        onClick={handleTestRegister}
      >
        Test Register Page
      </button>
      {testResult && <div style={{ marginTop: 24, fontSize: 20 }}>{testResult}</div>}
      <hr style={{ margin: '32px 0', borderColor: '#2953A1' }} />
      <div>
        <p>More dev tools and diagnostics coming soon.</p>
        <p>Use this portal to test endpoints, UI, and integration flows during development.</p>
      </div>
    </div>
  );
};

export default DevPortal;
