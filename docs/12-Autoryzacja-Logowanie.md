# Autoryzacja i logowanie użytkowników w Next.js

Next.js **nie ma wbudowanego systemu logowania** — podobnie jak z bazą danych, trzeba dodać osobną bibliotekę. Najpopularniejszym wyborem w ekosystemie Next.js jest **Auth.js** (dawniej NextAuth.js). Ten przykład **wymaga** integracji z bazą danych (patrz `11-IntegracjaZBazaDanych.md`), ponieważ konta użytkowników i sesje trzeba gdzieś trwale przechowywać.

---

## Podstawowe pojęcia

| Pojęcie | Znaczenie |
|---|---|
| **Autentykacja (authentication)** | Potwierdzenie, *kim* jest użytkownik (logowanie: email + hasło, Google, GitHub...) |
| **Autoryzacja (authorization)** | Sprawdzenie, *co* zalogowany użytkownik może robić (np. tylko admin widzi panel) |
| **Sesja (session)** | Informacja przechowywana po zalogowaniu, pozwalająca rozpoznać użytkownika przy kolejnych żądaniach |
| **Hashowanie hasła** | Hasła **nigdy** nie zapisujemy w bazie jawnym tekstem — zapisujemy jego "hash" (nieodwracalny skrót), np. przez bibliotekę `bcrypt` |
| **JWT (JSON Web Token)** | Zaszyfrowany token reprezentujący sesję, często przechowywany w ciasteczku (`cookie`) |

---

## Wybór biblioteki

| Biblioteka | Charakterystyka |
|---|---|
| **Auth.js (NextAuth.js v5)** | Najpopularniejsza w Next.js, darmowa, open-source, wsparcie dla logowania email/hasło, Google, GitHub itd. |
| **Clerk** | Gotowe UI logowania "z pudełka", darmowy plan dla małych projektów, mniej kodu do napisania |
| **Supabase Auth** | Jeśli już używasz Supabase jako bazy — logowanie jest wbudowane |
| **Lucia Auth** | Lekka, w pełni ręczna kontrola (więcej kodu, więcej elastyczności) |

W tym przykładzie użyjemy **Auth.js**, bo jest standardem w ekosystemie Next.js i dobrze integruje się z Prisma.

---

## Krok 1: Model użytkownika w Prisma

Przy logowaniu email + hasło i sesji w ciasteczku JWT wystarczy **jeden własny model** `User`. Rozszerz `prisma/schema.prisma`:

```prisma
model User {
  id            Int       @id @default(autoincrement())
  name          String?
  email         String    @unique
  passwordHash  String
  rola          String    @default("user")   // "user" lub "admin"
  createdAt     DateTime  @default(now())
}
```

> **Logowanie przez Google/GitHub (OAuth)** wymaga dodatkowo **adaptera Prisma** (`@auth/prisma-adapter`) i jego gotowego schematu: modele `User`, `Account`, `Session`, `VerificationToken` z identyfikatorami typu `String`. To osobny wariant; schemat znajdziesz w dokumentacji adaptera (link na dole). W tym przykładzie adaptera **nie używamy**.

Po dodaniu modelu:
```bash
npx prisma migrate dev --name dodaj_uzytkownika
```

---

## Krok 2: Instalacja

```bash
npm install next-auth@beta bcryptjs
```

> Używamy `bcryptjs` (czysty JavaScript) zamiast `bcrypt`. `bcrypt` to moduł natywny, który często nie kompiluje się na Windows i sprawia problemy przy wdrożeniu na Vercel.

Wygeneruj klucz szyfrujący sesje i zapisz go w `.env.local` jako `AUTH_SECRET`:

```bash
npx auth secret
```

> Auth.js v5 jest w fazie beta. Przed instalacją sprawdź na <https://authjs.dev>, czy aktualna wersja wspiera Twoją wersję Next.js.

---

## Krok 3: Konfiguracja Auth.js — `src/auth.js`

```js
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: 'jwt' },
  pages: { signIn: '/logowanie' },
  callbacks: {
    // przy logowaniu kopiujemy id i rolę użytkownika do tokenu JWT...
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.rola = user.rola;
      }
      return token;
    },
    // ...a z tokenu do obiektu sesji dostępnego w aplikacji
    session({ session, token }) {
      session.user.id = token.id;
      session.user.rola = token.rola;
      return session;
    },
  },
  providers: [
    Credentials({
      name: 'Email i hasło',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Hasło', type: 'password' },
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) return null;

        const poprawneHaslo = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!poprawneHaslo) return null;

        // Zwrócony obiekt trafia do tokenu sesji
        return { id: String(user.id), name: user.name, email: user.email, rola: user.rola };
      },
    }),
  ],
});
```

### Route Handler — `src/app/api/auth/[...nextauth]/route.js`
```js
import { handlers } from '@/auth';

export const { GET, POST } = handlers;
```

---

## Krok 4: Rejestracja nowego użytkownika (Server Action)

`src/app/rejestracja/actions.js`:
```js
'use server';

import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

// useActionState wywołuje akcję z DWOMA argumentami: (poprzedniStan, formData)
export async function zarejestrujUzytkownika(prevState, formData) {
  const email = formData.get('email')?.toString();
  const haslo = formData.get('haslo')?.toString();

  if (!email || !haslo || haslo.length < 8) {
    return { success: false, message: 'Podaj email i hasło (min. 8 znaków).' };
  }

  const istniejacy = await prisma.user.findUnique({ where: { email } });
  if (istniejacy) {
    return { success: false, message: 'Konto z tym adresem już istnieje.' };
  }

  const passwordHash = await bcrypt.hash(haslo, 10);

  await prisma.user.create({
    data: { email, passwordHash },
  });

  return { success: true, message: 'Konto utworzone — możesz się zalogować.' };
}
```

`src/app/rejestracja/page.js`:
```jsx
'use client';

import { useActionState } from 'react';
import { zarejestrujUzytkownika } from './actions';

export default function RejestracjaPage() {
  const [state, formAction] = useActionState(zarejestrujUzytkownika, {});

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Rejestracja</h1>
      <form action={formAction}>
        <input name="email" type="email" placeholder="Email" required />
        <input name="haslo" type="password" placeholder="Hasło" required minLength={8} />
        <button type="submit">Zarejestruj się</button>
      </form>
      {state.message && <p>{state.message}</p>}
    </main>
  );
}
```

---

## Krok 5: Formularz logowania

`src/app/logowanie/page.js`:
```jsx
'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function LogowaniePage() {
  const [blad, setBlad] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    const wynik = await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('haslo'),
      redirect: false,
    });

    if (wynik?.error) {
      setBlad('Nieprawidłowy email lub hasło.');
    } else {
      window.location.href = '/panel';
    }
  }

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Logowanie</h1>
      <form onSubmit={handleSubmit}>
        <input name="email" type="email" placeholder="Email" required />
        <input name="haslo" type="password" placeholder="Hasło" required />
        <button type="submit">Zaloguj się</button>
      </form>
      {blad && <p style={{ color: 'red' }}>{blad}</p>}
    </main>
  );
}
```

---

## Krok 6: Ochrona strony (autoryzacja) — Server Component

`src/app/panel/page.js`:
```jsx
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function PanelPage() {
  const session = await auth();

  if (!session) {
    redirect('/logowanie');
  }

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Panel użytkownika</h1>
      <p>Witaj, {session.user.email}!</p>
    </main>
  );
}
```

### Wylogowanie — przykład przycisku
```jsx
'use client';
import { signOut } from 'next-auth/react';

export function PrzyciskWyloguj() {
  return <button onClick={() => signOut()}>Wyloguj się</button>;
}
```

### Ograniczanie dostępu wg roli (autoryzacja)
Model `User` ma pole `rola`, a callbacki z Kroku 3 przekazują je do sesji. W komponencie serwerowym możesz więc sprawdzić:
```jsx
if (session.user.rola !== 'admin') {
  redirect('/brak-dostepu');
}
```

---

## Krok 7: Ochrona wielu stron naraz — `src/proxy.js`

Sprawdzanie sesji w każdej stronie osobno łatwo pominąć. Plik `proxy.js` (w starszych wersjach Next.js nazywał się `middleware.js`) uruchamia się **przed** obsłużeniem żądania i może przekierować niezalogowanych użytkowników.

`src/proxy.js`:
```js
import { auth } from '@/auth';

export default auth((request) => {
  if (!request.auth) {
    const url = new URL('/logowanie', request.nextUrl.origin);
    return Response.redirect(url);
  }
});

// proxy działa tylko dla ścieżek pasujących do matchera
export const config = {
  matcher: ['/panel/:path*', '/zadania/:path*'],
};
```

> `proxy.js` to wygoda i pierwsza linia obrony. **Nie zastępuje** sprawdzania sesji w Server Actions i Route Handlerach — patrz Krok 8.

---

## Krok 8: Sprawdzanie sesji w Server Action

Server Action to publiczny endpoint `POST` — da się go wywołać z pominięciem Twojego formularza. Dlatego **każda** akcja zmieniająca dane musi sama sprawdzić, kto ją wywołuje.

```js
'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function usunZadanie(id) {
  const session = await auth();

  if (!session) {
    throw new Error('Musisz być zalogowany.');
  }

  if (session.user.rola !== 'admin') {
    throw new Error('Brak uprawnień do usuwania zadań.');
  }

  await prisma.zadanie.delete({ where: { id } });
  revalidatePath('/zadania');
}
```

---

## Jak zarządza się modelami w Next.js?

To ważne pytanie: **Next.js sam w sobie nie ma pojęcia "modelu"** — to framework frontendowy/API, nie ORM. Modelami danych zarządza **warstwa ORM, którą wybierzesz** (w naszych przykładach: Prisma). Oto jak to działa w praktyce:

### 1. Jedno źródło prawdy: `prisma/schema.prisma`
Wszystkie modele (tabele) definiujesz w jednym pliku `schema.prisma` — to jest "serce" zarządzania danymi:
```prisma
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  zadania Zadanie[]   // relacja jeden-do-wielu
}

model Zadanie {
  id       Int     @id @default(autoincrement())
  tytul    String
  autor    User    @relation(fields: [autorId], references: [id])
  autorId  Int
}
```

### 2. Migracje — synchronizacja modelu ze strukturą bazy
Gdy zmienisz model (dodasz pole, nową tabelę, relację), musisz wygenerować i zastosować **migrację** — plik SQL opisujący zmianę:
```bash
npx prisma migrate dev --name dodaj_relacje_user_zadanie
```
Prisma automatycznie:
- generuje plik migracji w `prisma/migrations/`,
- wykonuje go na bazie danych (tworzy/zmienia tabele),
- regeneruje **Prisma Client** (typowany interfejs JS do modeli).

### 3. Prisma Client — jak używasz modeli w kodzie
Po migracji Prisma generuje gotowe, w pełni otypowane metody dla każdego modelu:
```js
await prisma.user.findMany();
await prisma.user.create({ data: { email: 'a@b.pl' } });
await prisma.zadanie.findMany({ where: { autorId: 1 }, include: { autor: true } });
```
Nie piszesz SQL ręcznie — operujesz na obiektach JS, a Prisma tłumaczy to na zapytania do bazy.

### 4. Podgląd danych — Prisma Studio
Wbudowane GUI do przeglądania/edycji rekordów bez pisania kodu:
```bash
npx prisma studio
```
Otwiera się w przeglądarce pod `http://localhost:5555`.

### Podsumowanie przepływu zarządzania modelami
```
schema.prisma (definicja modeli)
        ↓  npx prisma migrate dev
baza danych (rzeczywiste tabele)
        ↓  automatyczna generacja
Prisma Client (typowane metody w JS)
        ↓  import w kodzie
Route Handlers / Server Actions / Server Components
```

---

## Bezpieczeństwo — najważniejsze zasady

- **Nigdy** nie przechowuj haseł jawnym tekstem — zawsze hashuj (`bcryptjs`, `argon2`).
- Sesje/JWT trzymaj w ciasteczkach z atrybutami `HttpOnly` i `Secure` (Auth.js robi to domyślnie).
- Waliduj dane wejściowe zarówno po stronie klienta, jak i **zawsze** po stronie serwera (Server Action/Route Handler) — walidację w przeglądarce można łatwo obejść.
- Rozróżniaj autentykację (czy jesteś zalogowany) od autoryzacji (co wolno Ci robić) — sprawdzaj rolę/uprawnienia osobno przy każdej chronionej akcji, nie tylko przy wejściu na stronę.
- Zmienne typu `AUTH_SECRET` (klucz szyfrujący sesje Auth.js) trzymaj wyłącznie w zmiennych środowiskowych (`.env.local`, Vercel → Environment Variables), nigdy w repozytorium.

---

## Szybka checklista

- [ ] Model `User` (z polem `rola`) dodany i zmigrowany
- [ ] Skonfigurowany Auth.js (`src/auth.js`) i `AUTH_SECRET` w `.env.local`
- [ ] Działa rejestracja (hasło zapisywane jako hash)
- [ ] Działa logowanie i wylogowanie
- [ ] Strona `/panel` niedostępna bez logowania
- [ ] `proxy.js` chroni wybrane ścieżki
- [ ] Server Actions sprawdzają sesję i rolę

---

## Materiały

- Auth.js — Dokumentacja: <https://authjs.dev>
- Auth.js — Adapter Prisma: <https://authjs.dev/reference/adapter/prisma>
- Prisma — Zarządzanie schematem i migracje: <https://www.prisma.io/docs/orm/prisma-migrate>
- Prisma Studio: <https://www.prisma.io/docs/orm/tools/prisma-studio>
- bcryptjs (hashowanie haseł): <https://www.npmjs.com/package/bcryptjs>
- Next.js — `proxy.js`: <https://nextjs.org/docs/app/api-reference/file-conventions/proxy>
