'use client';

import { useState, useEffect } from 'react';

export default function TickTimer() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    console.log('Timer wystartował');

    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 1000);

    return () => {
      console.log('Timer posprzątany (clearInterval)');
      clearInterval(interval);
    };
  }, []);

  return <p>Upłynęło sekund: {tick}</p>;
}
