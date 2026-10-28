import Link from 'next/link';
import Counter from '@/components/Counter';
import Card from '@/components/Card';
import GreetingForm from '@/components/GreetingForm';
import CounterWithLog from '@/components/CounterWithLog';
import TimerToggle from '@/components/TimerToggle';
import CounterDashboard from '@/components/CounterDashboard';
import ContextCounterDisplay from '@/components/ContextCounterDisplay';
import ContextCounterButton from '@/components/ContextCounterButton';
import SimpleCounter from '@/components/SimpleCounter';

export default function HomePage() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Witaj na naszej stronie głównej!</h1>
      <p>To jest pierwsza strona stworzona w Next.js z App Routerem.</p>
      <Link href="/about">Przejdź do strony O nas</Link>
       <Card title="Licznik odwiedzin">
        <Counter />
      </Card>
      <GreetingForm />

      <h2>Krok 3: CounterWithLog (useEffect)</h2>
      <CounterWithLog />

      <h2>Krok 4: TimerToggle + TickTimer (cleanup)</h2>
      <TimerToggle />

      <h2>Krok 5: CounterDashboard (lifting state up)</h2>
      <CounterDashboard />

      <h2>Krok 6: Context (ContextCounterDisplay + ContextCounterButton)</h2>
      <p style={{ fontSize: '0.9rem', color: '#555' }}>
        Poniżej dwa <strong>osobne, niepowiązane propsami komponenty</strong> (dwa osobne pliki).
        Łączy je wyłącznie wspólny <code>CounterContext</code> z <code>layout.js</code>.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ border: '2px solid #2563eb', borderRadius: 8, padding: '1rem', flex: '1 1 200px' }}>
          <p style={{ fontWeight: 'bold', color: '#2563eb', margin: 0 }}>
            Plik: ContextCounterDisplay.js
          </p>
          <ContextCounterDisplay />
        </div>
        <div style={{ border: '2px solid #16a34a', borderRadius: 8, padding: '1rem', flex: '1 1 200px' }}>
          <p style={{ fontWeight: 'bold', color: '#16a34a', margin: 0 }}>
            Plik: ContextCounterButton.js
          </p>
          <ContextCounterButton />
        </div>
      </div>
      <p style={{ fontSize: '0.85rem', color: '#777' }}>
        Kliknij przycisk w zielonej ramce (ContextCounterButton) — wartość w niebieskiej ramce
        (ContextCounterDisplay) zmieni się automatycznie, mimo że to dwa różne komponenty.
      </p>

      <h2>Krok 8 (dla chętnych): własny hook useCounterLogic</h2>
      <p style={{ fontSize: '0.9rem', color: '#555' }}>
        Komponent <code>SimpleCounter</code> nie zawiera własnego <code>useState</code> —
        cała logika licznika (stan oraz funkcje <code>increment</code>/<code>decrement</code>/<code>reset</code>)
        jest wydzielona do własnego hooka <code>useCounterLogic</code> (plik <code>src/hooks/useCounterLogic.js</code>).
      </p>
      <SimpleCounter />
    </main>
  );
}