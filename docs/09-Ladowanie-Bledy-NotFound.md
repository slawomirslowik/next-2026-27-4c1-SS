# Stany ładowania i obsługa błędów — `loading.js`, `error.js`, `not-found.js`

W instrukcji `08-DataFetching-API-Routes.md` strony pobierały dane z zewnętrznego API. W prawdziwej aplikacji trzeba jeszcze obsłużyć dwie sytuacje: **dane się ładują** (użytkownik nie powinien patrzeć na pustą stronę) oraz **coś poszło nie tak** (API nie odpowiada, rekord nie istnieje). App Router rozwiązuje to **specjalnymi plikami** umieszczanymi obok `page.js`.

> **Ważne (dla tej wersji projektu):** przykłady są zgodne z lokalną dokumentacją Next.js 16 (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/`). W starszych materiałach z internetu `error.js` używa funkcji `reset` — w tej wersji zalecana jest `retry`.

---

## Przegląd plików specjalnych

| Plik | Kiedy jest wyświetlany | Server / Client |
|---|---|---|
| `loading.js` | Podczas ładowania `page.js` w danym folderze | Server (domyślnie) |
| `error.js` | Gdy w `page.js` (lub komponentach w nim) zostanie rzucony błąd | **Client** (`'use client'` wymagane) |
| `not-found.js` | Gdy wywołasz funkcję `notFound()` lub adres nie istnieje | Server (domyślnie) |
| `global-error.js` | Gdy błąd wystąpi w głównym `layout.js` | **Client**, musi zawierać `<html>` i `<body>` |

Struktura przykładowego folderu:
```text
src/app/posts/
├── page.js
├── loading.js
├── error.js
└── [id]/
    ├── page.js
    └── not-found.js
```

---

## Krok 1: Ekran ładowania — `loading.js`

Utwórz `src/app/posts/loading.js`:

```jsx
export default function PostsLoading() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Lista postów</h1>
      <p>Ładowanie danych...</p>
    </main>
  );
}
```

Next.js automatycznie „owija” `page.js` w komponent `<Suspense>` i pokazuje `loading.js`, dopóki asynchroniczny `page.js` nie skończy pobierać danych.

**Jak to przetestować?** Dodaj sztuczne opóźnienie w `src/app/posts/page.js`:
```js
await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sekundy
```
albo włącz w DevTools → **Network** throttling „Slow 3G”.

### Szkielet (skeleton) zamiast tekstu — z Tailwind
```jsx
export default function PostsLoading() {
  return (
    <main className="p-8 space-y-3">
      {[1, 2, 3, 4, 5].map((n) => (
        <div key={n} className="h-5 w-2/3 animate-pulse rounded bg-zinc-200" />
      ))}
    </main>
  );
}
```

---

## Krok 2: Obsługa błędów — `error.js`

Utwórz `src/app/posts/error.js`:

```jsx
'use client'; // error.js MUSI być Client Componentem

export default function PostsError({ error, retry }) {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Ups, coś poszło nie tak</h1>
      <p>Nie udało się wczytać listy postów.</p>
      <button onClick={() => retry()}>Spróbuj ponownie</button>
    </main>
  );
}
```

- `error` — obiekt rzuconego błędu. W wersji produkcyjnej jego treść jest ukrywana (żeby nie zdradzać szczegółów serwera), dlatego nie wyświetlaj `error.message` jako jedynej informacji dla użytkownika.
- `retry()` — ponownie pobiera dane i renderuje stronę. Jeśli tym razem się uda, ekran błędu znika.

**Jak to przetestować?** W `getPosts()` z instrukcji `08` zmień adres na nieistniejący — funkcja rzuci `throw new Error('Nie udało się pobrać danych')`, a Next.js pokaże `error.js` zamiast całej aplikacji. Nagłówek z `layout.js` pozostanie widoczny.

> `error.js` łapie błędy z `page.js` i komponentów **poniżej** w tym samym folderze, ale **nie** z `layout.js` w tym samym folderze. Błędy głównego layoutu obsługuje `src/app/global-error.js`.

---

## Krok 3: Strona „nie znaleziono” — `notFound()` i `not-found.js`

Gdy użytkownik wejdzie na `/posts/99999`, API zwróci pusty wynik. Zamiast pokazywać pustą stronę, wywołaj `notFound()`.

`src/app/posts/[id]/page.js`:
```jsx
import { notFound } from 'next/navigation';

async function getPost(id) {
  const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Błąd serwera'); // to obsłuży error.js
  return res.json();
}

export default async function PostPage({ params }) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    notFound(); // przerywa renderowanie i pokazuje not-found.js
  }

  return (
    <main style={{ padding: '2rem' }}>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </main>
  );
}
```

`src/app/posts/[id]/not-found.js`:
```jsx
import Link from 'next/link';

export default function PostNotFound() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Nie znaleziono posta</h1>
      <p>Post o podanym numerze nie istnieje.</p>
      <Link href="/posts">Wróć do listy postów</Link>
    </main>
  );
}
```

Strona zwróci kod HTTP **404** — sprawdź to w DevTools → **Network** (kolumna *Status*).

### Globalna strona 404
Plik `src/app/not-found.js` obsługuje **każdy** nieistniejący adres w aplikacji (np. `/literowka`).

---

## Kiedy co się wyświetla — podsumowanie

| Sytuacja | Co widzi użytkownik | Kod HTTP |
|---|---|---|
| Dane się pobierają | `loading.js` | 200 |
| `fetch` / zapytanie do bazy rzuciło błąd | `error.js` | 500 |
| `notFound()` w kodzie | najbliższy `not-found.js` | 404 |
| Nieistniejący adres | `src/app/not-found.js` | 404 |
| Błąd w głównym `layout.js` | `global-error.js` | 500 |

> **Uwaga:** błędy **walidacji formularza** (np. „hasło za krótkie”) to nie są błędy aplikacji — nie rzucaj ich przez `throw`, tylko zwracaj jako komunikat z Server Action (`useActionState`, instrukcja `10-Formularze-ServerActions.md`). `error.js` jest na błędy nieoczekiwane.

---

## Szybka checklista

- [ ] Dodany `loading.js` dla `/posts` i przetestowany (opóźnienie lub throttling)
- [ ] Dodany `error.js` z przyciskiem „Spróbuj ponownie” (`retry`)
- [ ] Strona `/posts/[id]` wywołuje `notFound()` dla nieistniejącego posta
- [ ] Dodany `not-found.js` dla posta oraz globalny `src/app/not-found.js`
- [ ] Sprawdzone w DevTools kody statusu 200 / 404

---

## Materiały

- Next.js — `loading.js`: <https://nextjs.org/docs/app/api-reference/file-conventions/loading>
- Next.js — `error.js`: <https://nextjs.org/docs/app/api-reference/file-conventions/error>
- Next.js — `not-found.js`: <https://nextjs.org/docs/app/api-reference/file-conventions/not-found>
- Next.js — `notFound()`: <https://nextjs.org/docs/app/api-reference/functions/not-found>
