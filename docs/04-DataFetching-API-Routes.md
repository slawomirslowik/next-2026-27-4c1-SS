# Projekt Next.js: Pobieranie danych — Server Components i Route Handlers (API)

W tym bloku nauczysz się pobierać dane w komponentach serwerowych (`fetch` w Server Component) oraz tworzyć własne, proste endpointy API za pomocą **Route Handlers**.

---

## Krok 1: Pobieranie danych w Server Component

Domyślnie każdy `page.js` w App Routerze jest **Server Component** i może być funkcją `async`. Dzięki temu możemy bezpośrednio użyć `fetch` bez dodatkowych hooków.

Utwórz `src/app/posts/page.js`:

```jsx
async function getPosts() {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
  if (!res.ok) {
    throw new Error('Nie udało się pobrać danych');
  }
  return res.json();
}

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Lista postów</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </main>
  );
}
```

Sprawdź: <http://localhost:3000/posts>

---

## Krok 2: Cache i świeżość danych

Next.js domyślnie cachuje wyniki `fetch`. Aby wymusić dane „na żywo” przy każdym żądaniu:

```jsx
const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5', {
  cache: 'no-store',
});
```

Aby odświeżać dane co określony czas (np. co 60 sekund):

```jsx
const res = await fetch(url, { next: { revalidate: 60 } });
```

---

## Krok 3: Własne API — Route Handlers

Możesz stworzyć własny endpoint API wewnątrz katalogu `app`, tworząc plik `route.js`.

Utwórz `src/app/api/greetings/route.js`:

```jsx
export async function GET() {
  const data = [
    { id: 1, message: 'Cześć!' },
    { id: 2, message: 'Miłej nauki Next.js!' },
  ];

  return Response.json(data);
}
```

Sprawdź w przeglądarce: <http://localhost:3000/api/greetings>

> Plik `route.js` **nie może** współistnieć z `page.js` w tym samym folderze.

---

## Krok 4: Obsługa metody POST

Rozszerz `src/app/api/greetings/route.js`:

```jsx
export async function GET() {
  return Response.json([{ id: 1, message: 'Cześć!' }]);
}

export async function POST(request) {
  const body = await request.json();

  if (!body.message) {
    return Response.json({ error: 'Pole message jest wymagane' }, { status: 400 });
  }

  return Response.json({ id: Date.now(), message: body.message }, { status: 201 });
}
```

---

## Krok 5: Wywołanie własnego API z komponentu klienckiego

Utwórz `src/components/GreetingsFetcher.js`:

```jsx
'use client';

import { useState } from 'react';

export default function GreetingsFetcher() {
  const [greetings, setGreetings] = useState([]);

  async function loadGreetings() {
    const res = await fetch('/api/greetings');
    const data = await res.json();
    setGreetings(data);
  }

  return (
    <div>
      <button onClick={loadGreetings}>Pobierz powitania</button>
      <ul>
        {greetings.map((g) => (
          <li key={g.id}>{g.message}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Krok 6 (dla chętnych): Dynamiczne segmenty (`[id]`)

Utwórz `src/app/posts/[id]/page.js`, aby wyświetlać szczegóły pojedynczego posta:

```jsx
async function getPost(id) {
  const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
  return res.json();
}

export default async function PostPage({ params }) {
  const post = await getPost(params.id);

  return (
    <main style={{ padding: '2rem' }}>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </main>
  );
}
```

Sprawdź: <http://localhost:3000/posts/1>

---

## Szybka checklista

- [ ] Strona `/posts` pobiera i wyświetla dane z zewnętrznego API
- [ ] Zrozumiana różnica między `cache: 'no-store'` a `revalidate`
- [ ] Własny endpoint `GET /api/greetings` działa
- [ ] Dodana obsługa `POST` z walidacją danych wejściowych
- [ ] (opcjonalnie) dynamiczna strona `/posts/[id]`

---

## Materiały

- Next.js — Pobieranie danych: <https://nextjs.org/docs/app/building-your-application/data-fetching/fetching>
- Next.js — Route Handlers: <https://nextjs.org/docs/app/building-your-application/routing/route-handlers>
- JSONPlaceholder (darmowe testowe API): <https://jsonplaceholder.typicode.com/>
