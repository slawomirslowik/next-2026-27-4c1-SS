import Link from 'next/link';
import Counter from '@/components/Counter';
import Card from '@/components/Card';

export default function HomePage() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Witaj na naszej stronie głównej!</h1>
      <p>To jest pierwsza strona stworzona w Next.js z App Routerem.</p>
      <Link href="/about">Przejdź do strony O nas</Link>
       <Card title="Licznik odwiedzin">
        <Counter />
      </Card>
    </main>
  );
}