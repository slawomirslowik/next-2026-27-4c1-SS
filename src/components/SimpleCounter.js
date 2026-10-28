'use client';

import { useCounterLogic } from '@/hooks/useCounterLogic';

export default function SimpleCounter() {
  const { count, increment, decrement, reset } = useCounterLogic(0, 2);

  return (
    <div>
      <p>{count}</p>
      <button onClick={increment}>+2</button>
      <button onClick={decrement}>-2</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
