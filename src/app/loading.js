'use client';

export default function Loading() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100vw',
      backgroundColor: 'var(--bg-main)',
      color: 'var(--text-primary)',
      gap: '20px',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999
    }}>
      <div className="spinner" style={{ width: '50px', height: '50px' }}></div>
      <div style={{
        fontSize: '1.2rem',
        fontWeight: 600,
        letterSpacing: '1px',
        animation: 'pulse 1.5s infinite ease-in-out'
      }}>
        TRANSPASYS
      </div>
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(0.98); }
          50% { opacity: 1; transform: scale(1.02); }
        }
      `}</style>
    </div>
  );
}
