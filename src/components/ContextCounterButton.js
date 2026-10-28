'use client';

import { useCounter } from '@/context/CounterContext';

export default function ContextCounterButton() {
  const { count, setCount } = useCounter();
  return <button onClick={() => setCount(count + 1)}>Zwiększ (kontekst)</button>;
}
