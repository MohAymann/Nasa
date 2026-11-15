'use client';
import Navigation from './Navigation';

export default function AppShell({ children }) {
  return (
    <div style={{ display: 'flex', height: '100dvh', overflow: 'hidden' }}>
      <Navigation />
      <main style={{ flex: 1, overflowY: 'auto', background: '#09090b' }}>
        {children}
      </main>
    </div>
  );
}
