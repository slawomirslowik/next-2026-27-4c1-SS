'use client';

import { useState } from 'react';
import CounterDisplay from './CounterDisplay';
import CounterButtons from './CounterButtons';

export default function CounterDashboard() {
  const [count, setCount] = useState(0); // stan "mieszka" tutaj

  return (
    <div>
      <CounterDisplay count={count} />
      <CounterButtons count={count} setCount={setCount} />
    </div>
  );
}
