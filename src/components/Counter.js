'use client';

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div>
      {isVisible && <p>Aktualna wartość: {count}</p>}

      <button onClick={() => setCount(count + step)}>Zwiększ o {step}</button>
      <button onClick={() => setCount(count - step)}>Zmniejsz o {step}</button>

      <div>
        <label>
          Krok:{' '}
          <input
            type="number"
            value={step}
            onChange={(e) => setStep(Number(e.target.value))}
          />
        </label>
      </div>

      <button onClick={() => setIsVisible(!isVisible)}>Pokaż/ukryj licznik</button>
    </div>
  );
}