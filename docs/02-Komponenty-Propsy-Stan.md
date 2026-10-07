# Projekt Next.js: Komponenty, propsy i stan (interaktywność)

W poprzednim bloku zajęć poznałeś strukturę katalogu `app`, layouty oraz podstawowy routing plikowy. Teraz nauczysz się tworzyć własne **komponenty React**, przekazywać do nich dane (**propsy**) oraz dodawać **interaktywność** za pomocą stanu (`useState`).

> **Ważne (dla tej wersji projektu):**
> Sprawdź lokalne materiały: `node_modules/next/dist/docs/` oraz komunikaty deprecacji przed implementacją.

---

## Krok 1: Czym jest komponent?

Komponent to zwykła funkcja JavaScript, która zwraca JSX (opis interfejsu). Domyślnie wszystkie komponenty w App Routerze są **Server Components** — renderują się na serwerze i nie mogą używać stanu ani zdarzeń przeglądarki (np. `onClick`).

---

## Krok 2: Pierwszy komponent wielokrotnego użytku

Utwórz folder `src/components` i plik `src/components/Card.js`:

```jsx
export default function Card({ title, children }) {
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: '1rem' }}>
      <h2>{title}</h2>
      <div>{children}</div>
    </div>
  );
}
```

Użyj go na stronie „O nas” (`src/app/about/page.js`):

```jsx
import Card from '@/components/Card';

export default function AboutPage() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>O nas</h1>
      <Card title="Nasza misja">
        <p>Dowiedz się więcej o naszej szkolnej inicjatywie!</p>
      </Card>
    </main>
  );
}
```

`title` i `children` to **propsy** — dane przekazywane od rodzica do komponentu potomnego.

---

## Krok 3: Propsy — przekazywanie różnych danych

Propsy mogą być tekstem, liczbą, obiektem, tablicą, a nawet funkcją. Przykład komponentu wyświetlającego listę:

```jsx
function StudentList({ students }) {
  return (
    <ul>
      {students.map((s) => (
        <li key={s.id}>{s.name}</li>
      ))}
    </ul>
  );
}
```

> **Uwaga:** przy renderowaniu list w React każdy element musi mieć unikalny prop `key`.

---

## Krok 4: Client Components — kiedy potrzebny jest stan?

Jeśli komponent ma reagować na kliknięcia, zmiany w formularzu itp., musi być **Client Component**. Oznaczamy go dyrektywą `"use client"` na początku pliku.

Utwórz `src/components/Counter.js`:

```jsx
'use client';

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Aktualna wartość: {count}</p>
      <button onClick={() => setCount(count + 1)}>Zwiększ</button>
      <button onClick={() => setCount(count - 1)}>Zmniejsz</button>
    </div>
  );
}
```

Dodaj komponent do strony głównej (`src/app/page.js`):

```jsx
import Counter from '@/components/Counter';
// ...
<Counter />
```

---

## Krok 5: Obsługa formularza (stan kontrolowany)

Utwórz `src/components/GreetingForm.js`:

```jsx
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
```

To jest tzw. **kontrolowany komponent** — wartość pola `input` jest w pełni zarządzana przez stan React.

---

## Krok 6 (dla chętnych): Komponenty złożone z wieloma stanami

Spróbuj połączyć `Counter` i `GreetingForm` w jeden komponent `Dashboard`, w którym oba stany działają niezależnie od siebie.

---

## Szybka checklista

- [ ] Utworzony komponent `Card` przyjmujący propsy `title` i `children`
- [ ] Komponent `Card` użyty na stronie „O nas”
- [ ] Utworzony `Counter` z dyrektywą `"use client"` i `useState`
- [ ] `Counter` działa na stronie głównej
- [ ] Utworzony kontrolowany formularz `GreetingForm`

---

## Materiały

- React — Twój pierwszy komponent: <https://react.dev/learn/your-first-component>
- React — Przekazywanie propsów: <https://react.dev/learn/passing-props-to-a-component>
- React — Stan komponentu: <https://react.dev/learn/state-a-components-memory>
- Next.js — Client i Server Components: <https://nextjs.org/docs/app/building-your-application/rendering/client-components>
