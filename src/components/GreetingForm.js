'use client';

import { useState } from 'react';

export default function GreetingForm() {
  const [name, setName] = useState('');

  return (
    <div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Podaj swoje imię"
      />
      {name && <p>Witaj, {name}!</p>}
    </div>
  );
}
