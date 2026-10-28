'use client';

import { useState } from 'react';
import TickTimer from './TickTimer';

export default function TimerToggle() {
  const [showTimer, setShowTimer] = useState(true);

  return (
    <div>
      <button onClick={() => setShowTimer(!showTimer)}>
        {showTimer ? 'Ukryj timer' : 'Pokaż timer'}
      </button>
      {showTimer && <TickTimer />}
    </div>
  );
}
