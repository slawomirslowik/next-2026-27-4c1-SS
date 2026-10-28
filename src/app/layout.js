import { CounterProvider } from '@/context/CounterContext';

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body>
        <header style={{ background: '#f0f0f0', padding: '1rem' }}>
          <nav>
            <strong>Moja Aplikacja Szkolna</strong>
          </nav>
        </header>
        <CounterProvider>{children}</CounterProvider>
      </body>
    </html>
  );
}