# Projekt Next.js: Formularze i Server Actions

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

Dyrektywa `'use server'` wewnątrz funkcji oznacza, że kod wykonuje się **na serwerze**, nawet jeśli formularz jest renderowany po stronie klienta.

---

## Krok 3: Walidacja i komunikat zwrotny (`useFormState` / `useActionState`)

Aby wyświetlić informację zwrotną po wysłaniu formularza, użyj hooka `useActionState` (React 19 / Next.js).

Zaktualizuj `src/app/contact/page.js`:

```jsx
'use client';

import { useActionState } from 'react';

async function submitContact(prevState, formData) {
  'use server';

  const email = formData.get('email');

  if (!email || !email.includes('@')) {
    return { success: false, message: 'Podaj poprawny adres e-mail.' };
  }

  return { success: true, message: 'Dziękujemy za zgłoszenie!' };
}

export default function ContactPage() {
  const [state, formAction] = useActionState(submitContact, { message: '' });

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Kontakt</h1>
      <form action={formAction}>
        <input name="email" type="email" placeholder="Twój e-mail" required />
        <button type="submit">Wyślij</button>
      </form>
      {state.message && <p>{state.message}</p>}
    </main>
  );
}
```

> Uwaga: dokładna nazwa hooka (`useFormState` vs `useActionState`) zależy od wersji React/Next.js w projekcie — sprawdź `node_modules/next/dist/docs/` oraz komunikaty deprecacji w konsoli.

---

## Krok 4: Wysyłka formularza do własnego Route Handlera (alternatywa)

Jeśli wolisz jawne API (np. do integracji z aplikacją mobilną), możesz połączyć formularz kliencki z endpointem z poprzedniego bloku zajęć (`/api/greetings`):

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
- [ ] Dodana walidacja i komunikat zwrotny
- [ ] (opcjonalnie) formularz wysyła dane do własnego API (`/api/greetings`)
- [ ] (opcjonalnie) przekierowanie po wysłaniu formularza

---

## Materiały

- Next.js — Server Actions i formularze: <https://nextjs.org/docs/app/building-your-application/data-fetching/forms-and-mutations>
- React — `useActionState`: <https://react.dev/reference/react/useActionState>
- Next.js — `redirect`: <https://nextjs.org/docs/app/api-reference/functions/redirect>
