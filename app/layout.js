import './globals.css';
import { StoreProvider } from '@/lib/store';
import AppShell from '@/components/AppShell';

export const metadata = {
  title: 'AstroHealth — Astronaut Health Monitor',
  description: 'Health monitoring software for astronauts on space missions — NASA Space Apps Challenge',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <AppShell>{children}</AppShell>
        </StoreProvider>
      </body>
    </html>
  );
}
