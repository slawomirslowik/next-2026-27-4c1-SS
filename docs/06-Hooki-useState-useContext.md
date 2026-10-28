# Hooki React — useState, useContext i współdzielenie stanu

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
| `useActionState` | obsługa stanu formularzy ze Server Actions (poznasz w instrukcji `10-Formularze-ServerActions.md`) |

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

`CounterWithLog` to **osobny, nowy komponent** — nie jest to rozbudowa pliku `Counter.js` z Kroku 2. Utwórz nowy plik `src/components/CounterWithLog.js`:

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

Aby zobaczyć ten komponent na stronie, trzeba go **zaimportować i wstawić w JSX** — sam utworzenie pliku nie wystarczy. Dodaj go np. do `src/app/page.js`:

```jsx
import CounterWithLog from '@/components/CounterWithLog';

export default function HomePage() {
  return (
    <main style={{ padding: '2rem' }}>
      {/* ...pozostała zawartość strony... */}
      <CounterWithLog />
    </main>
  );
}
```

Po zapisaniu otwórz stronę w przeglądarce i **konsolę DevTools** (`F12` → zakładka Console, patrz instrukcja `02-DevToolsChrome.md`). Przy każdym kliknięciu „Zwiększ” powinien pojawić się nowy wpis `Licznik zmienił wartość na: ...` — to dowód, że efekt uruchamia się po renderze, jako reakcja na zmianę `count`.

> Jest to komponent **niezależny** od `Counter` z Kroku 2 — ma własny, osobny stan `count`. Dodanie `<CounterWithLog />` obok `<Counter />` na tej samej stronie nie wpłynie na działanie `Countera` i odwrotnie.

### Tablica zależności (`deps`)

| Zapis | Kiedy efekt się uruchamia |
|---|---|
| `useEffect(fn)` | po **każdym** renderze |
| `useEffect(fn, [])` | tylko **raz**, po pierwszym renderze |
| `useEffect(fn, [count])` | za każdym razem, gdy zmieni się `count` |

---

## Krok 4: Funkcja sprzątająca (cleanup) — `TickTimer`

Niektóre efekty uruchamiają coś, co trzeba później **posprzątać** — np. timer, który inaczej będzie tykał w nieskończoność, nawet gdy komponent zniknie ze strony. Służy do tego **funkcja zwracana** przez `useEffect`:

```jsx
useEffect(() => {
  const interval = setInterval(() => console.log('tick'), 1000);
  return () => clearInterval(interval); // wywoływane przy odmontowaniu komponentu
}, []);
```

React wywołuje tę funkcję zwrotną w dwóch sytuacjach:
1. Tuż **przed ponownym uruchomieniem** tego samego efektu (gdy zmieni się coś z tablicy zależności).
2. Gdy komponent zostaje **odmontowany** (znika ze strony — np. przechodzisz na inną podstronę).

Bez funkcji sprzątającej `setInterval` działałby dalej nawet po usunięciu komponentu z ekranu — to częsty błąd nazywany **wyciekiem pamięci (memory leak)**.

Zobacz to na żywo — utwórz `src/components/TickTimer.js`:

```jsx
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
  }, []); // pusta tablica — efekt uruchamia się tylko raz, przy pierwszym renderze

  return <p>Upłynęło sekund: {tick}</p>;
}
```

Aby przetestować działanie cleanup, potrzebny jest komponent rodzica, który potrafi **pokazać i ukryć** `TickTimer` (czyli go zamontować/odmontować). Utwórz `src/components/TimerToggle.js`:

```jsx
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
```

Dodaj `<TimerToggle />` do `src/app/page.js` (analogicznie jak `CounterWithLog` powyżej) i otwórz konsolę DevTools:

- Po załadowaniu strony zobaczysz w konsoli `Timer wystartował`, a licznik sekund będzie rósł co sekundę.
- Po kliknięciu „Ukryj timer” komponent `TickTimer` zostaje odmontowany — React wywołuje funkcję sprzątającą i w konsoli pojawi się `Timer posprzątany (clearInterval)`. Licznik **przestaje się zwiększać** w tle.
- Po ponownym kliknięciu „Pokaż timer” `TickTimer` montuje się od nowa — efekt uruchamia się ponownie, licznik startuje od zera.

> **Bez `return () => clearInterval(interval)`** timer działałby dalej nawet po kliknięciu „Ukryj timer” — po prostu nie byłoby go widać na ekranie, ale nadal zużywałby zasoby w tle. To właśnie obrazuje, po co jest funkcja sprzątająca.

---

## Krok 5: Współdzielenie stanu — „lifting state up”

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

#### Jak dokładnie wygląda przepływ stanu „od rodzica w dół”

```
CounterDashboard  (tu żyje stan: count, setCount)
├─ba CounterDisplay   ← otrzymuje props: count
└─ba CounterButtons   ← otrzymuje props: count, setCount
```

- `CounterDisplay` i `CounterButtons` **same w sobie nie mają żadnego `useState`** — cały stan „mieszka” wyłącznie w `CounterDashboard`.
- Rodzic przekazuje wartość `count` do `CounterDisplay` (`<CounterDisplay count={count} />`) — to jest właśnie **przepływ w dół**.
- Rodzic przekazuje też `setCount` do `CounterButtons` (`<CounterButtons count={count} setCount={setCount} />`) — dzięki temu dziecko **nie modyfikuje stanu samodzielnie**, tylko wywołuje funkcję otrzymaną od rodzica (`onClick={() => setCount(count + 1)}`), co powoduje ponowny render **całego** `CounterDashboard` wraz z jego dziećmi.
- Dzięki temu `CounterDisplay` **zawsze** pokazuje aktualną wartość, mimo że sam jej nie przechowuje — dostaje ją na nowo przy każdym renderze rodzica.

**Jak to zobaczyć w projekcie:** w `src/app/page.js` znajduje się sekcja „Krok 5: CounterDashboard (lifting state up)” z użytym komponentem `<CounterDashboard />`. Otwórz stronę główną i kliknij „Zwiększ”/„Zmniejsz” — przycisk znajduje się w `CounterButtons`, ale wartość zmienia się w `CounterDisplay`, chociaż to dwa zupełnie osobne pliki/komponenty. To właśnie dowodzi, że działa przekazywanie stanu przez wspólnego rodzica.

---

## Krok 6: `useContext` — współdzielenie stanu bez „prop drilling”

Gdy wiele zagnieżdżonych komponentów potrzebuje tego samego stanu, przekazywanie propsów przez wiele poziomów („prop drilling”) staje się niewygodne. Rozwiązaniem jest **Context API**.

### 6.1. Utwórz kontekst

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

### 6.2. Owiń drzewo komponentów providerem

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

### 6.3. Użyj kontekstu w dowolnym, zagnieżdżonym komponencie

```jsx
'use client';

import { useCounter } from '@/context/CounterContext';

export function AnyNestedComponent() {
  const { count, setCount } = useCounter();
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

Teraz **dowolny** komponent w drzewie opakowanym przez `CounterProvider` ma dostęp do tego samego `count` i `setCount` — bez przekazywania propsów przez pośrednie komponenty.

#### Jak to dokładnie wykonać — krok po kroku

Powyższy fragment jest poglądowy (`AnyNestedComponent` to przykładowa nazwa). Aby zobaczyć realny efekt na własnej stronie, potrzebujesz **co najmniej dwóch** osobnych, niepowiązanych ze sobą propsami komponentów korzystających z `useCounter()` — dopiero wtedy widać sens kontekstu.

**a) Utwórz `src/components/ContextCounterDisplay.js`:**

```jsx
'use client';

import { useCounter } from '@/context/CounterContext';

export default function ContextCounterDisplay() {
  const { count } = useCounter();
  return <p>Wartość z kontekstu: {count}</p>;
}
```

**b) Utwórz `src/components/ContextCounterButton.js`:**

```jsx
'use client';

import { useCounter } from '@/context/CounterContext';

export default function ContextCounterButton() {
  const { count, setCount } = useCounter();
  return <button onClick={() => setCount(count + 1)}>Zwiększ (kontekst)</button>;
}
```

**c) Użyj obu komponentów w `src/app/page.js` — bez przekazywania żadnych propsów.**

Żeby lepiej było widać na stronie, że to dwa **osobne pliki/komponenty** połączone tylko kontekstem, opakuj je w kolorowe ramki z podpisem nazwy pliku:

```jsx
import ContextCounterDisplay from '@/components/ContextCounterDisplay';
import ContextCounterButton from '@/components/ContextCounterButton';

export default function HomePage() {
  return (
    <main style={{ padding: '2rem' }}>
      {/* ...pozostała zawartość strony... */}

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
    </main>
  );
}
```

**d) Przetestuj:** kliknij „Zwiększ (kontekst)”. Mimo że `ContextCounterDisplay` i `ContextCounterButton` to **dwa zupełnie osobne komponenty**, nieznające się nawzajem i niepołączone propsami, oba „widzą” ten sam `count` — bo czerpią go z `CounterProvider`, który (dzięki Krokowi 6.2) opakowuje całą aplikację w `layout.js`.

> **Różnica względem Kroku 5 (lifting state up):** tam stan musiał „przepływać” przez propsy od rodzica (`CounterDashboard`) do dzieci (`CounterDisplay`, `CounterButtons`). Tutaj `ContextCounterDisplay` i `ContextCounterButton` mogą znajdować się **gdziekolwiek** w drzewie komponentów — nawet bardzo głęboko zagnieżdżone, w zupełnie różnych gałęziach — i nadal mają dostęp do tego samego stanu przez `useCounter()`, bez przekazywania niczego „po drodze”.

---

## Krok 7: Kiedy używać czego?

| Sytuacja | Rozwiązanie |
|---|---|
| Stan potrzebny tylko w jednym komponencie | `useState` lokalnie |
| Rodzic i jego bezpośrednie dzieci | `useState` w rodzicu + propsy (lifting state up) |
| Wiele zagnieżdżonych komponentów, „prop drilling” | `useContext` + Provider |
| Stan globalny całej aplikacji, niepowiązane komponenty, złożona logika | zewnętrzna biblioteka stanu (np. Zustand, Redux) — temat na kolejne zajęcia |

---

## Krok 8 (dla chętnych): Własny hook

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
- [ ] Utworzony i podpięty do strony `CounterWithLog` (efekt reagujący na zmianę `count`)
- [ ] Rozumiem tablicę zależności w `useEffect` (`[]`, `[count]`, brak tablicy)
- [ ] Utworzone `TickTimer` i `TimerToggle` — przetestowane działanie funkcji sprzątającej (log w konsoli przy odmontowaniu)
- [ ] Zaimplementowany `CounterDashboard` ze stanem podniesionym do rodzica
- [ ] Utworzony `CounterContext` i działające współdzielenie stanu przez `useContext`
- [ ] Utworzone `ContextCounterDisplay` i `ContextCounterButton` — dwa niezależne komponenty współdzielące stan z kontekstu
- [ ] (opcjonalnie) Utworzony własny hook `useCounterLogic`

---

## Materiały

- React — `useState`: <https://react.dev/reference/react/useState>
- React — `useEffect`: <https://react.dev/reference/react/useEffect>
- React — `useContext`: <https://react.dev/reference/react/useContext>
- React — Współdzielenie stanu (Sharing State Between Components): <https://react.dev/learn/sharing-state-between-components>
- React — Pisanie własnych hooków: <https://react.dev/learn/reusing-logic-with-custom-hooks>
