# Formularze i Server Actions

W tym bloku nauczysz się obsługiwać formularze w Next.js na dwa sposoby: po stronie klienta (kontrolowane komponenty) oraz nowocześniej — za pomocą **Server Actions**, czyli funkcji wykonywanych bezpośrednio na serwerze bez tworzenia osobnego API.

---

## Krok 1: Prosty formularz kontrolowany (przypomnienie)

```jsx
'use client';

import { useState } from 'react';

export default function ContactFormClient() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    console.log('Wysłano:', email);
    setSent(true);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Twój e-mail"
        required
      />
      <button type="submit">Wyślij</button>
      {sent && <p>Dziękujemy za zgłoszenie!</p>}
    </form>
  );
}
```

To podejście wymaga ręcznej obsługi wysyłki (np. przez `fetch` do własnego API).

---

## Krok 2: Server Actions — formularz bez API

Server Actions pozwalają napisać funkcję serwerową, którą formularz wywołuje bezpośrednio przez atrybut `action`.

Utwórz `src/app/contact/page.js`:

```jsx
async function submitContact(formData) {
  'use server';

  const name = formData.get('name');
  const email = formData.get('email');

  // Tu normalnie zapisalibyśmy dane np. do bazy danych
  console.log('Nowe zgłoszenie:', { name, email });
}

export default function ContactPage() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Kontakt</h1>
      <form action={submitContact}>
        <div>
          <label htmlFor="name">Imię</label>
          <input id="name" name="name" type="text" required />
        </div>
        <div>
          <label htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" required />
        </div>
        <button type="submit">Wyślij</button>
      </form>
    </main>
  );
}
```

Dyrektywa `'use server'` wewnątrz funkcji oznacza, że kod wykonuje się **na serwerze**. Ten zapis działa, bo `ContactPage` jest Server Componentem (brak `'use client'`).

> **Sprawdź w DevTools:** otwórz zakładkę **Network** i wyślij formularz. Zobaczysz żądanie `POST` z nagłówkiem `Next-Action` — tak wygląda wywołanie Server Action "od środka". Komunikat z `console.log` pojawi się w **terminalu** (`npm run dev`), a nie w konsoli przeglądarki.

---

## Krok 3: Walidacja i komunikat zwrotny (`useActionState`)

Aby wyświetlić informację zwrotną po wysłaniu formularza, użyj hooka `useActionState` (React 19).

`useActionState` działa tylko w **Client Component** (`'use client'`), a w takim pliku nie wolno definiować funkcji z `'use server'`. Dlatego akcję przenosimy do **osobnego pliku**.

Utwórz `src/app/contact/actions.js`:

```js
'use server';

// useActionState przekazuje DWA argumenty: poprzedni stan i dane formularza
export async function submitContact(prevState, formData) {
  const email = formData.get('email');

  if (!email || !email.includes('@')) {
    return { success: false, message: 'Podaj poprawny adres e-mail.' };
  }

  return { success: true, message: 'Dziękujemy za zgłoszenie!' };
}
```

Zaktualizuj `src/app/contact/page.js`:

```jsx
'use client';

import { useActionState } from 'react';
import { submitContact } from './actions';

export default function ContactPage() {
  const [state, formAction, isPending] = useActionState(submitContact, { message: '' });

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Kontakt</h1>
      <form action={formAction}>
        <input name="email" type="email" placeholder="Twój e-mail" required />
        <button type="submit" disabled={isPending}>
          {isPending ? 'Wysyłanie...' : 'Wyślij'}
        </button>
      </form>
      {state.message && <p>{state.message}</p>}
    </main>
  );
}
```

> **Zasada:** `'use server'` *wewnątrz funkcji* (jak w Kroku 2) działa tylko w Server Component. Jeśli formularz jest Client Componentem, akcja musi leżeć w osobnym pliku z `'use server'` na górze.

---

## Krok 3b: Formularz z metodą `GET` — wyszukiwarka

Server Actions zawsze wysyłają dane jako `POST` — nie da się ich użyć z `GET`. Jeśli chcesz, żeby dane formularza trafiły do adresu URL jako parametry (np. żeby wynik dało się zapisać w zakładkach albo udostępnić linkiem), użyj zwykłego formularza HTML z `method="get"`.

Przykład prostej wyszukiwarki, `src/app/szukaj/page.js`:

```jsx
export default async function SzukajPage({ searchParams }) {
  // w Next.js 15+ `searchParams` to Promise
  const { q: query = '' } = await searchParams;

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Wyszukiwarka</h1>
      <form action="/szukaj" method="get">
        <input name="q" type="text" defaultValue={query} placeholder="Czego szukasz?" />
        <button type="submit">Szukaj</button>
      </form>
      {query && <p>Wyniki dla frazy: <strong>{query}</strong></p>}
    </main>
  );
}
```

Po wysłaniu formularza przeglądarka przejdzie na adres np. `/szukaj?q=nextjs`, a komponent strony odczyta parametr `q` z `searchParams` — bez żadnego `'use server'` ani `fetch`.

### Różnica między `GET` a `POST` w formularzu

| Cecha | `method="get"` | `method="post"` / Server Action |
|---|---|---|
| Gdzie trafiają dane | W adresie URL (`?q=...`) | W treści żądania (niewidoczne w URL) |
| Można zapisać w zakładkach / udostępnić link | Tak | Nie |
| Limit rozmiaru danych | Mały (ograniczenia URL) | Praktycznie brak |
| Dane wrażliwe (hasła, dane osobowe) | Niezalecane | Właściwy wybór |
| Typowe zastosowanie | Wyszukiwarki, filtry, sortowanie | Logowanie, zapis/edycja danych, formularze kontaktowe |
| Wspierane przez Server Actions | Nie | Tak |

**Zasada praktyczna:** jeśli formularz tylko *odczytuje* lub *filtruje* dane i warto, by stan był widoczny w adresie URL — użyj `GET`. Jeśli formularz *zapisuje*, *zmienia* lub *usuwa* dane (lub zawiera dane wrażliwe) — użyj `POST` (lub Server Action, które i tak wymusza `POST`).

---

## Krok 4: Wysyłka formularza do własnego Route Handlera (alternatywa)

Jeśli wolisz jawne API (np. do integracji z aplikacją mobilną), możesz połączyć formularz kliencki z endpointem z instrukcji `08-DataFetching-API-Routes.md` (`/api/greetings`):

```jsx
'use client';

export default function QuickMessageForm() {
  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    await fetch('/api/greetings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: formData.get('message') }),
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="message" placeholder="Twoja wiadomość" required />
      <button type="submit">Wyślij</button>
    </form>
  );
}
```

---

## Krok 5 (dla chętnych): Przekierowanie po wysłaniu formularza

W Server Action możesz użyć funkcji `redirect` z `next/navigation`, aby po zapisaniu danych przenieść użytkownika np. na stronę z podziękowaniem:

```jsx
import { redirect } from 'next/navigation';

async function submitContact(formData) {
  'use server';
  // zapisanie danych...
  redirect('/dziekujemy');
}
```

---

## Szybka checklista

- [ ] Działa prosty formularz kontrolowany po stronie klienta
- [ ] Działa formularz oparty na Server Action (`'use server'`)
- [ ] Dodana walidacja i komunikat zwrotny (`useActionState`, akcja w osobnym pliku)
- [ ] Działa formularz z `method="get"` (wyszukiwarka) i rozumiesz różnicę GET vs POST
- [ ] (opcjonalnie) formularz wysyła dane do własnego API (`/api/greetings`)
- [ ] (opcjonalnie) przekierowanie po wysłaniu formularza

---

## Materiały

- Next.js — Server Actions i formularze: <https://nextjs.org/docs/app/building-your-application/data-fetching/forms-and-mutations>
- React — `useActionState`: <https://react.dev/reference/react/useActionState>
- Next.js — `redirect`: <https://nextjs.org/docs/app/api-reference/functions/redirect>
