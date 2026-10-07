# Projekt Next.js: Hooki React — useState, useContext i współdzielenie stanu

W tym bloku zajęć pogłębisz wiedzę o **hookach** React — funkcjach pozwalających komponentom funkcyjnym korzystać ze stanu, kontekstu i innych mechanizmów Reacta. Nauczysz się też, jak **współdzielić stan** między komponentami na kilka różnych sposobów.

---

## Krok 1: Czym są hooki? (przypomnienie i rozszerzenie)

Hooki to funkcje zaczynające się od `use...`, które pozwalają komponentom funkcyjnym „podłączyć się” do mechanizmów Reacta bez pisania klas.

### Najważniejsze hooki wbudowane w React

| Hook | Do czego służy |
|---|---|
| `useState` | dodaje stan do komponentu |
| `useEffect` | wykonuje efekty uboczne (np. pobranie danych, timer, subskrypcja) |
| `useContext` | odczytuje wartość z Context API |
| `useRef` | przechowuje wartość bez wywoływania ponownego renderu; dostęp do elementu DOM |
| `useMemo` | zapamiętuje wynik kosztownego obliczenia między renderami |
| `useCallback` | zapamiętuje funkcję, by nie była tworzona od nowa przy każdym renderze |
| `useActionState` | obsługa stanu formularzy ze Server Actions |

### Dwie żelazne zasady hooków

1. Wywołuj hooki **tylko na najwyższym poziomie** komponentu — nigdy w pętlach, warunkach ani zagnieżdżonych funkcjach.
2. Wywołuj hooki **tylko w komponentach funkcyjnych React** (lub w innych, własnych hookach).

```jsx
// ❌ ŹLE — warunkowe wywołanie hooka
if (someCondition) {
  const [x, setX] = useState(0);
}

// ✅ DOBRZE
const [x, setX] = useState(0);
if (someCondition) {
  // logika warunkowa, po wywołaniu hooka
}
```

---

## Krok 2: `useState` — wiele niezależnych zmiennych stanu

Jeśli komponent potrzebuje kilku zmiennych stanu, wywołujesz `useState` **wielokrotnie** — każde wywołanie jest niezależne i ma własną wartość początkową.

Rozbuduj `src/components/Counter.js`:

```jsx
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

      <label>
        Krok:{' '}
        <input
          type="number"
          value={step}
          onChange={(e) => setStep(Number(e.target.value))}
        />
      </label>

      <button onClick={() => setIsVisible(!isVisible)}>Pokaż/ukryj licznik</button>
    </div>
  );
}
```

> **Ważne:** argument przekazany do `useState(x)` to **wartość początkowa** pierwszego elementu zwróconej pary `[wartość, setter]` — nie „indeks” w jakiejś globalnej tablicy stanu. Każda instancja komponentu (`<Counter />`) ma własny, niezależny stan.

### Funkcyjna forma settera

Gdy nowa wartość stanu zależy od poprzedniej, bezpieczniej jest użyć formy funkcyjnej settera — szczególnie przy wielu szybkich aktualizacjach:

```jsx
setCount((prevCount) => prevCount + step);
```

---

## Krok 3: `useEffect` — reagowanie na zmiany stanu

`useEffect` pozwala wykonać kod „efektu ubocznego” po renderze (np. logowanie, timery, pobieranie danych).

```jsx
'use client';

import { useState, useEffect } from 'react';

export default function CounterWithLog() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('Licznik zmienił wartość na:', count);
  }, [count]); // efekt uruchamia się przy każdej zmianie "count"

  return (
    <div>
      <p>Wartość: {count}</p>
      <button onClick={() => setCount(count + 1)}>Zwiększ</button>
    </div>
  );
}
```

### Tablica zależności (`deps`)

| Zapis | Kiedy efekt się uruchamia |
|---|---|
| `useEffect(fn)` | po **każdym** renderze |
| `useEffect(fn, [])` | tylko **raz**, po pierwszym renderze |
| `useEffect(fn, [count])` | za każdym razem, gdy zmieni się `count` |

### Funkcja sprzątająca (cleanup)

```jsx
useEffect(() => {
  const interval = setInterval(() => console.log('tick'), 1000);
  return () => clearInterval(interval); // wywoływane przy odmontowaniu komponentu
}, []);
```

---

## Krok 4: Współdzielenie stanu — „lifting state up”

Stan utworzony przez `useState` jest **lokalny** dla komponentu — inne komponenty nie mają do niego bezpośredniego dostępu. Najprostszy sposób współdzielenia: przenieś stan do **wspólnego rodzica** i przekaż go w dół jako **propsy**.

Utwórz `src/components/CounterDisplay.js`:

```jsx
export default function CounterDisplay({ count }) {
  return <p>Aktualna wartość: {count}</p>;
}
```

Utwórz `src/components/CounterButtons.js`:

```jsx
'use client';

export default function CounterButtons({ count, setCount }) {
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Zwiększ</button>
      <button onClick={() => setCount(count - 1)}>Zmniejsz</button>
    </div>
  );
}
```

Utwórz `src/components/CounterDashboard.js` — rodzic trzymający stan:

```jsx
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
```

**Zasada:** dane płyną w dół (props), zmiany płyną w górę (wywołanie przekazanej funkcji settera).

---

## Krok 5: `useContext` — współdzielenie stanu bez „prop drilling”

Gdy wiele zagnieżdżonych komponentów potrzebuje tego samego stanu, przekazywanie propsów przez wiele poziomów („prop drilling”) staje się niewygodne. Rozwiązaniem jest **Context API**.

### 5.1. Utwórz kontekst

Utwórz `src/context/CounterContext.js`:

```jsx
'use client';

import { createContext, useContext, useState } from 'react';

const CounterContext = createContext(null);

export function CounterProvider({ children }) {
  const [count, setCount] = useState(0);

  return (
    <CounterContext.Provider value={{ count, setCount }}>
      {children}
    </CounterContext.Provider>
  );
}

export function useCounter() {
  const context = useContext(CounterContext);
  if (!context) {
    throw new Error('useCounter musi być używany wewnątrz CounterProvider');
  }
  return context;
}
```

### 5.2. Owiń drzewo komponentów providerem

W `src/app/layout.js` (lub w dowolnym miejscu, gdzie potrzebny jest wspólny stan):

```jsx
import { CounterProvider } from '@/context/CounterContext';

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body>
        <CounterProvider>
          {children}
        </CounterProvider>
      </body>
    </html>
  );
}
```

### 5.3. Użyj kontekstu w dowolnym, zagnieżdżonym komponencie

```jsx
'use client';

import { useCounter } from '@/context/CounterContext';

export function AnyNestedComponent() {
  const { count, setCount } = useCounter();
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

Teraz **dowolny** komponent w drzewie opakowanym przez `CounterProvider` ma dostęp do tego samego `count` i `setCount` — bez przekazywania propsów przez pośrednie komponenty.

---

## Krok 6: Kiedy używać czego?

| Sytuacja | Rozwiązanie |
|---|---|
| Stan potrzebny tylko w jednym komponencie | `useState` lokalnie |
| Rodzic i jego bezpośrednie dzieci | `useState` w rodzicu + propsy (lifting state up) |
| Wiele zagnieżdżonych komponentów, „prop drilling” | `useContext` + Provider |
| Stan globalny całej aplikacji, niepowiązane komponenty, złożona logika | zewnętrzna biblioteka stanu (np. Zustand, Redux) — temat na kolejne zajęcia |

---

## Krok 7 (dla chętnych): Własny hook

Możesz wydzielić logikę licznika do **własnego hooka**, aby łatwo używać jej w wielu komponentach:

```jsx
'use client';

import { useState } from 'react';

export function useCounterLogic(initialValue = 0, step = 1) {
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount((prev) => prev + step);
  const decrement = () => setCount((prev) => prev - step);
  const reset = () => setCount(initialValue);

  return { count, increment, decrement, reset };
}
```

Użycie:

```jsx
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
```

> Własne hooki to zwykłe funkcje zaczynające się od `use`, które mogą wewnątrz wywoływać inne hooki (`useState`, `useEffect` itd.). Pozwalają ponownie wykorzystywać logikę bez powielania kodu.

---

## Szybka checklista

- [ ] Rozumiem, że `useState(x)` — `x` to wartość początkowa, nie „indeks”
- [ ] Potrafię użyć wielu niezależnych `useState` w jednym komponencie
- [ ] Rozumiem tablicę zależności w `useEffect` (`[]`, `[count]`, brak tablicy)
- [ ] Zaimplementowany `CounterDashboard` ze stanem podniesionym do rodzica
- [ ] Utworzony `CounterContext` i działające współdzielenie stanu przez `useContext`
- [ ] (opcjonalnie) Utworzony własny hook `useCounterLogic`

---

## Materiały

- React — `useState`: <https://react.dev/reference/react/useState>
- React — `useEffect`: <https://react.dev/reference/react/useEffect>
- React — `useContext`: <https://react.dev/reference/react/useContext>
- React — Współdzielenie stanu (Sharing State Between Components): <https://react.dev/learn/sharing-state-between-components>
- React — Pisanie własnych hooków: <https://react.dev/learn/reusing-logic-with-custom-hooks>
