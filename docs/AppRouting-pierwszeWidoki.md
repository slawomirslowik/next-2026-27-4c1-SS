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
- Dokumentacja App Router: <https://nextjs.org/docs/app>Projekt Next.js: Podstawy App Routera i Layouty

​W tym projekcie nauczysz się podstaw tworzenia aplikacji webowych za pomocą frameworka Next.js, korzystania z routingu opartego na folderach oraz zarządzania układem stron (layoutami).

​Krok 1: Struktura katalogu app i hierarchia layoutów
​Next.js używa routingu opartego na plikach i folderach wewnątrz katalogu app.
    ​layout.js (Layout główny/rodzic): 
        Plik ten definiuje wspólny układ dla aplikacji (np. menu, stopka, nagłówek) i otacza wszystkie podstrony znajdujące się w danym katalogu oraz jego podkatalogach. Komponent {children} wewnątrz layoutu jest dynamicznie podmieniany na treść aktualnej podstrony (page.js).
    ​page.js: Unikalna treść danej podstrony.
    ​globals.css: Globalne style CSS dla projektu.

​Krok 2: Tworzenie pierwszej podstrony (Strona Główna)

​Otwórz folder projektu za pomocą edytora VS Code.

​Otwórz plik app/page.js.

​Usuń całą istniejącą zawartość i zamień ją na następujący kod:

​export default function HomePage() {
return (
<main style={{ padding: '2rem' }}>
<h1>Witaj na naszej stronie głównej!</h1>
<p>To jest pierwsza strona stworzona w Next.js z App Routerem.</p>
</main>
);
}

​Zapisz plik. W terminalu uruchom serwer deweloperski komendą npm run dev, a następnie odwiedź http://localhost:3000 w przeglądarce.

​Krok 3: Modyfikacja wspólnego Layoutu

​Otwórz plik app/layout.js.

​Zauważ parametr children. Możesz dodać stałe elementy (np. nagłówek z menu), które pojawią się automatycznie na każdej podstronie korzystającej z tego layoutu:

​export default function RootLayout({ children }) {
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

​Krok 4: Dodanie nowej podstrony (Podstrona "O nas")

​Przejdź do folderu app.

​Utwórz nowy folder o nazwie about.

​Wewnątrz folderu about utwórz plik page.js z następującą zawartością:


​export default function AboutPage() {
return (
<main style={{ padding: '2rem' }}>
<h1>O nas</h1>
<p>Dowiedz się więcej o naszej szkolnej inicjatywie!</p>
</main>
);
}


​Sprawdź działanie w przeglądarce pod adresem http://localhost:3000/about. Strona ta automatycznie odziedziczy nagłówek z pliku app/layout.js.

​Krok 5: Nawigacja za pomocą komponentu Link

​Aby unikać pełnego przeładowywania strony, w Next.js stosujemy dedykowany komponent Link.
​Wróć do pliku app/page.js.

​Zaimportuj Link i zaktualizuj kod strony głównej, dodając odnośnik:

​import Link from 'next/link';
​export default function HomePage() {
return (
<main style={{ padding: '2rem' }}>
<h1>Witaj na naszej stronie głównej!</h1>
<p>To jest pierwsza strona stworzona w Next.js z App Routerem.</p>
<Link href="/about">Przejdź do strony O nas</Link>
</main>
);
}

​Krok 6 (Dla zaawansowanych): Osobny layout i Grupy Routingu (folder)

​Co w sytuacji, gdy chcesz stworzyć osobną sekcję (np. panel administracyjny lub osobną podstronę landing page), która nie ma dziedziczyć wyglądu (np. menu) z głównego layoutu?
​W Next.js służą do tego Grupy Routingu. Tworzy się je, dając nazwę folderu w nawiasach okrągłych, np. (dashboard).

​Zasada działania: Nazwa w nawiasach okrągłych nie pojawia się w adresie URL. Służy wyłącznie do organizacji kodu w projekcie.
​Dzięki temu możesz stworzyć odrębny plik layout.js wewnątrz takiego folderu, który nadpisze lub odetnie standardowy układ dla podstron w tej grupie.

​Przykład struktury katalogów:

app/
├── layout.js          	<-- Główny layout (z menu)
├── page.js            	<-- Strona główna ( / )
└── (marketing)/       	<-- Folder w nawiasach (niewidoczny w URL)
├── layout.js      	<-- ODRĘBNY layout (np. bez głównego menu)
└── landing/
└── page.js

​Jak wygląda adres URL dla powyższej struktury?
Wpisujesz w przeglądarce po prostu http://localhost:3000/landing (pomijając całkowicie folder (marketing) w ścieżce).

​Materiały źródłowe i dokumentacja

​Przewodnik przygotowany w oparciu o oficjalne źródła:

​Oficjalny kurs Next.js (Learn Next.js): https://nextjs.org/learn

​Dokumentacja App Router w Next.js - Routing i Layouty: https://nextjs.org/docs/app

