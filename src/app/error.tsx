'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'system-ui, sans-serif',
      backgroundColor: '#fff5f5',
    }}>
      <h1 style={{ color: '#e53e3e', marginBottom: '10px' }}>Lỗi ứng dụng</h1>
      <p style={{ color: '#744210', marginBottom: '20px' }}>
        {error.message || 'Có lỗi không mong muốn xảy ra'}
      </p>
      <button
        onClick={() => reset()}
        style={{
          padding: '10px 20px',
          backgroundColor: '#e53e3e',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        Thử lại
      </button>
    </div>
  );
}
