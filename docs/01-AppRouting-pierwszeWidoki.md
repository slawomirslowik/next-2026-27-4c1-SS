# Projekt Next.js: Podstawy App Routera i Layouty

W tym projekcie nauczysz się podstaw tworzenia aplikacji w Next.js z użyciem **App Routera**, routingu opartego na folderach oraz **layoutów**.

> **Ważne (dla tej wersji projektu):**
> To może być nowsza wersja Next.js z różnicami względem starszej dokumentacji.
> Przed implementacją sprawdź lokalne materiały: `node_modules/next/dist/docs/` oraz komunikaty deprecacji.

---

## Wymagania wstępne

- Node.js (LTS)
- npm
- Visual Studio Code
- Utworzony projekt Next.js (z katalogiem `app/`)

Uruchomienie projektu:

```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem: <http://localhost:3000>

---

## Krok 1: Struktura katalogu `app` i hierarchia layoutów

W App Routerze Next.js routing opiera się na plikach i folderach wewnątrz katalogu `app`.

- `layout.js` – wspólny układ (np. nagłówek, stopka, menu) dla stron w danym katalogu i jego podkatalogach.
- `page.js` – treść konkretnej podstrony.
- `globals.css` – style globalne projektu.

`{children}` w `layout.js` jest miejscem, gdzie renderuje się aktualna podstrona (`page.js`).

> **Dobra praktyka – nazewnictwo funkcji komponentów:**
> O tym, pod jakim adresem URL dostępna jest strona, decyduje **ścieżka pliku** (`app/about/page.js` → `/about`), a nie nazwa funkcji wewnątrz niego. Dzięki temu w każdym pliku `page.js` czy `layout.js` możesz (technicznie) użyć dowolnej nazwy funkcji – nawet tej samej w kilku plikach – i aplikacja nadal zadziała poprawnie.
>
> Mimo to **nie powielaj nazw funkcji** między plikami i nadawaj im czytelne, unikalne nazwy (konwencja `PascalCase`, zgodna z rolą pliku), ponieważ:
> - ułatwia to czytanie kodu i szybkie zorientowanie się „co to za komponent” (np. w React DevTools, gdzie wszystkie komponenty o nazwie `Page` wyglądałyby identycznie),
> - ułatwia debugowanie – komunikaty błędów i stack trace pokazują nazwę funkcji, a nie ścieżkę pliku,
> - zapobiega pomyłkom przy kopiowaniu kodu między plikami (łatwo zapomnieć o zmianie nazwy).
>
> Przykład dobrego nazewnictwa w tym projekcie: `HomePage` (`app/page.js`), `AboutPage` (`app/about/page.js`), `RootLayout` (`app/layout.js`).

> **Dobra praktyka – struktura pojedynczego pliku:**
> Zarówno w `page.js`, jak i `layout.js` warto zachować stałą, czytelną kolejność elementów w pliku:
>
> 1. **Importy** – zawsze na samej górze pliku (najpierw paczki zewnętrzne/Next.js, np. `next/link`, `next/image`, potem komponenty i moduły własne projektu).
> 2. **Stałe/konfiguracja eksportowane przez plik** – specjalne, rozpoznawane przez Next.js pola, np.:
>    - `export const metadata = { title: '...', description: '...' }` – ustawia tytuł i opis strony (zamiast ręcznego tagu `<title>`),
>    - `export const dynamic`, `export const revalidate` – sterują sposobem renderowania/cache'owania strony (poznasz je w kolejnych dokumentach, przy pobieraniu danych).
> 3. **Funkcja komponentu** (`export default function ...`) – główna logika i JSX, zwracana na końcu pliku.
>
> Przykładowy szkielet pliku `page.js`:
>
> ```jsx
> // 1. Importy
> import Link from 'next/link';
>
> // 2. Konfiguracja/pola specjalne Next.js (opcjonalnie)
> export const metadata = {
>   title: 'O nas',
> };
>
> // 3. Funkcja komponentu
> export default function AboutPage() {
>   return (
>     <main>
>       <h1>O nas</h1>
>       <Link href="/">Wróć na stronę główną</Link>
>     </main>
>   );
> }
> ```
>
> Taki podział (importy → konfiguracja → komponent) obowiązuje w praktyce w większości projektów Next.js/React i ułatwia innym osobom szybkie odnalezienie się w kodzie.

---

## Krok 2: Pierwsza podstrona (strona główna)

Otwórz plik `app/page.js` i zamień jego zawartość na:

```jsx
export default function HomePage() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Witaj na naszej stronie głównej!</h1>
      <p>To jest pierwsza strona stworzona w Next.js z App Routerem.</p>
    </main>
  );
}
```

Zapisz plik i sprawdź wynik w przeglądarce: <http://localhost:3000>

---

## Krok 3: Modyfikacja wspólnego layoutu

Otwórz `app/layout.js` i dodaj wspólne elementy interfejsu (np. nagłówek):

```jsx
export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body>
        <header style={{ background: '#f0f0f0', padding: '1rem' }}>
          <nav>
            <strong>Moja Aplikacja Szkolna</strong>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
```

Od teraz nagłówek będzie widoczny na stronach korzystających z tego layoutu.

---

## Krok 4: Dodanie podstrony „O nas”

Utwórz folder `app/about` i plik `app/about/page.js`:

```jsx
export default function AboutPage() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>O nas</h1>
      <p>Dowiedz się więcej o naszej szkolnej inicjatywie!</p>
    </main>
  );
}
```

Sprawdź stronę: <http://localhost:3000/about>

---

## Krok 5: Nawigacja komponentem `Link`

Wróć do `app/page.js`, zaimportuj `Link` i dodaj przejście do podstrony:

```jsx
import Link from 'next/link';

export default function HomePage() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Witaj na naszej stronie głównej!</h1>
      <p>To jest pierwsza strona stworzona w Next.js z App Routerem.</p>
      <Link href="/about">Przejdź do strony O nas</Link>
    </main>
  );
}
```

Dzięki `Link` nawigacja jest płynna i bez pełnego przeładowania strony.

---

## Krok 6 (dla chętnych): Grupy routingu i osobny layout

Jeśli chcesz wydzielić sekcję z innym layoutem (np. landing page lub panel), użyj **grupy routingu**: folder w nawiasach, np. `(marketing)`.

### Przykładowa struktura

```text
app/
├── layout.js
├── page.js
└── (marketing)/
    ├── layout.js
    └── landing/
        └── page.js
```

- Folder `(marketing)` **nie pojawia się w URL**.
- Adres strony będzie: <http://localhost:3000/landing>

---

## Szybka checklista

- [ ] `app/page.js` działa jako strona główna
- [ ] `app/layout.js` zawiera wspólny nagłówek
- [ ] `app/about/page.js` renderuje stronę „O nas”
- [ ] link z `/` do `/about` działa
- [ ] (opcjonalnie) utworzona grupa routingu `(marketing)`

---

## Materiały

- Learn Next.js: <https://nextjs.org/learn>
- Dokumentacja App Router: <https://nextjs.org/docs/app>

