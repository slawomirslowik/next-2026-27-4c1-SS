# Integracja z bazą danych w Next.js

Next.js samo w sobie **nie zawiera** bazy danych — to framework do budowania frontendu i warstwy API (Route Handlers, Server Actions). Bazę danych trzeba dobrać i podłączyć osobno. Ten plik pokazuje, jak to zrobić oraz jakie opcje hostingu bazy są darmowe (w tym na Vercel).

---

## Czy na Vercel można postawić darmową bazę danych?

**Tak** — Vercel oferuje własną usługę **Vercel Storage** (dawniej "Vercel Postgres/KV") z darmowym poziomem (Hobby), a dodatkowo świetnie integruje się z zewnętrznymi darmowymi bazami w chmurze. W praktyce masz dwie drogi:

### 1. Vercel Storage (natywne, w panelu projektu)
Dostępne w zakładce **Storage** w panelu Vercel, bezpośrednio podłączane do projektu (zmienne środowiskowe konfigurują się automatycznie):

| Usługa | Typ | Plan darmowy |
|---|---|---|
| **Neon (Postgres)** | Relacyjna SQL | Tak — mały limit przechowywania i godzin obliczeniowych |
| **Upstash (Redis / KV)** | Klucz-wartość | Tak — limit liczby zapytań dziennie |
| **Edge Config** | Prosty, szybki store do odczytu | Tak — do małych, rzadko zmienianych danych (np. feature flags) |
| **Blob** | Przechowywanie plików (obrazy, pliki) | Tak — limit miejsca i transferu |

> Vercel obecnie dostarcza te bazy **poprzez partnerów** (Neon, Upstash) — w panelu wygląda to jak jedna, zintegrowana usługa, ale fizycznie dane leżą u partnera.

### 2. Zewnętrzne darmowe bazy w chmurze (niezależne od Vercel)
Równie popularne podejście — zakładasz bazę samodzielnie u dostawcy i łączysz się z nią przez connection string:

| Dostawca | Typ bazy | Darmowy plan |
|---|---|---|
| **Neon** (neon.tech) | PostgreSQL (serverless) | Tak, hojny limit na start |
| **Supabase** | PostgreSQL + dodatki (auth, storage, realtime) | Tak |
| **PlanetScale** | MySQL (serverless, bez darmowego planu od 2024 — sprawdź aktualny cennik) | Zależnie od promocji |
| **MongoDB Atlas** | NoSQL (dokumentowa) | Tak — klaster M0 za darmo na stałe |
| **Turso** | SQLite (edge, rozproszone) | Tak |

**Rekomendacja dla małego projektu edukacyjnego:** **Neon** lub **Supabase** (PostgreSQL) — darmowe, dobrze udokumentowane, świetnie współpracują z Next.js i Prisma.

> **Uwaga:** darmowe plany baz w chmurze często mają "usypianie" przy braku aktywności (np. Neon/Supabase) — pierwsze zapytanie po przerwie może być wolniejsze (tzw. cold start). To normalne i akceptowalne w projekcie szkolnym.

---

## Jak podłączyć bazę danych do Next.js — podejścia

### Opcja A: ORM — Prisma (najczęściej polecane)

**Prisma** to warstwa ORM (Object-Relational Mapping) — pozwala operować na bazie danych za pomocą zwykłych funkcji JS zamiast pisać surowe zapytania SQL.

#### Instalacja
```bash
npm install prisma --save-dev
npm install @prisma/client
npx prisma init
```

To tworzy plik `prisma/schema.prisma` oraz `.env` z placeholderem `DATABASE_URL`.

#### Definicja modelu (`prisma/schema.prisma`)
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Zadanie {
  id        Int      @id @default(autoincrement())
  tytul     String
  zrobione  Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

#### Zmienna środowiskowa (`.env.local` lub `.env`)
```
DATABASE_URL="postgresql://uzytkownik:haslo@host:5432/nazwa_bazy?sslmode=require"
```
Connection string dostajesz z panelu Neon/Supabase po utworzeniu bazy.

#### Migracja (tworzy tabele w bazie)
```bash
npx prisma migrate dev --name init
```

#### Klient Prisma i użycie w kodzie
Kod klienta (`src/lib/prisma.js`) oraz pełny przykład użycia w Server Actions znajdziesz niżej, w sekcji **„Pełny przykład”**. Ten sam klient działa też w Route Handlerze — jeśli potrzebujesz jawnego API (np. dla aplikacji mobilnej):

```js
// src/app/api/zadania/route.js
import { prisma } from '@/lib/prisma';

export async function GET() {
  const zadania = await prisma.zadanie.findMany();
  return Response.json(zadania);
}
```

---

### Opcja B: Supabase SDK (bez ORM, bez Prisma)

Jeśli wybierzesz Supabase, możesz zamiast Prisma użyć ich oficjalnego klienta JS — dodatkowo dostajesz gotowe uwierzytelnianie (auth) i storage na pliki.

```bash
npm install @supabase/supabase-js
```

```js
// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
```

```js
// użycie w Route Handler
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase.from('zadania').select('*');
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}
```

---

## Pełny przykład: formularz działający na realnych danych z bazy

Poniżej kompletny, działający przykład "od zera" — lista zadań (`Zadanie`) z formularzem dodawania i przyciskiem usuwania, operujący na prawdziwym rekordzie w bazie przez Prisma + Server Actions (bez pisania osobnego API).

### 1. Model w `prisma/schema.prisma`
```prisma
model Zadanie {
  id        Int      @id @default(autoincrement())
  tytul     String
  zrobione  Boolean  @default(false)
  createdAt DateTime @default(now())
}
```
Po dodaniu modelu uruchom migrację:
```bash
npx prisma migrate dev --name dodaj_zadanie
```

### 2. Klient Prisma — `src/lib/prisma.js`
```js
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```
> Singleton zapobiega tworzeniu wielu połączeń do bazy podczas hot-reload w trybie deweloperskim.

### 3. Server Actions — `src/app/zadania/actions.js`
```js
'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function dodajZadanie(formData) {
  const tytul = formData.get('tytul')?.toString().trim();

  if (!tytul) {
    return; // prosta walidacja — pusty tytuł ignorujemy
  }

  await prisma.zadanie.create({
    data: { tytul },
  });

  // odświeża dane na stronie /zadania po zapisie do bazy
  revalidatePath('/zadania');
}

export async function przelaczZrobione(id, aktualnyStan) {
  await prisma.zadanie.update({
    where: { id },
    data: { zrobione: !aktualnyStan },
  });
  revalidatePath('/zadania');
}

export async function usunZadanie(id) {
  await prisma.zadanie.delete({ where: { id } });
  revalidatePath('/zadania');
}
```

> Dyrektywa `'use server'` na **górze pliku** oznacza wszystkie eksportowane funkcje jako Server Actions — nie trzeba jej powtarzać w każdej funkcji.

### 4. Strona z listą i formularzem — `src/app/zadania/page.js`
To jest **Server Component** — dane pobierane są bezpośrednio z bazy podczas renderowania na serwerze (bez `useEffect`, bez `fetch`).

```jsx
import { prisma } from '@/lib/prisma';
import { dodajZadanie, przelaczZrobione, usunZadanie } from './actions';

export default async function ZadaniaPage() {
  const zadania = await prisma.zadanie.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Lista zadań</h1>

      <form action={dodajZadanie} style={{ marginBottom: '1.5rem' }}>
        <input
          name="tytul"
          type="text"
          placeholder="Nowe zadanie..."
          required
        />
        <button type="submit">Dodaj</button>
      </form>

      {zadania.length === 0 && <p>Brak zadań — dodaj pierwsze powyżej.</p>}

      <ul>
        {zadania.map((zadanie) => (
          <li key={zadanie.id}>
            <span
              style={{
                textDecoration: zadanie.zrobione ? 'line-through' : 'none',
              }}
            >
              {zadanie.tytul}
            </span>

            <form
              action={przelaczZrobione.bind(null, zadanie.id, zadanie.zrobione)}
              style={{ display: 'inline' }}
            >
              <button type="submit">
                {zadanie.zrobione ? 'Cofnij' : 'Zrobione'}
              </button>
            </form>

            <form
              action={usunZadanie.bind(null, zadanie.id)}
              style={{ display: 'inline' }}
            >
              <button type="submit">Usuń</button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

### Jak to działa — krok po kroku
1. `ZadaniaPage` to funkcja `async` — Next.js pozwala Server Componentom bezpośrednio `await`ować zapytania do bazy (tu: `prisma.zadanie.findMany()`).
2. Formularz dodawania ma `action={dodajZadanie}` — to Server Action, więc wysyłka (zawsze `POST`) i zapis do bazy dzieją się **w całości na serwerze**, bez pisania `fetch` ani Route Handlera.
3. `revalidatePath('/zadania')` mówi Next.js: "dane się zmieniły, odśwież cache strony `/zadania`" — dzięki temu po dodaniu/usunięciu zadania lista od razu pokazuje aktualny stan bazy.
4. Przyciski "Zrobione"/"Usuń" to osobne mini-formularze z `action={funkcja.bind(null, id, ...)}` — pozwala to przekazać dodatkowy argument (np. `id` rekordu) do Server Action wywoływanej przez konkretny przycisk na liście.

> To jest pełny cykl CRUD (Create, Read, Update, Delete) na realnych obiektach z bazy danych — bez pisania osobnego REST API, zgodnie z podejściem Next.js App Router.

---

## Relacje między tabelami

W prawdziwej aplikacji tabele są powiązane, np. każde zadanie ma autora (relacja **jeden-do-wielu**: jeden użytkownik → wiele zadań):

```prisma
model User {
  id      Int       @id @default(autoincrement())
  email   String    @unique
  zadania Zadanie[]
}

model Zadanie {
  id       Int     @id @default(autoincrement())
  tytul    String
  zrobione Boolean @default(false)
  autor    User    @relation(fields: [autorId], references: [id], onDelete: Cascade)
  autorId  Int
}
```

- `autorId` to **klucz obcy** zapisany w tabeli `Zadanie`.
- `onDelete: Cascade` — usunięcie użytkownika usuwa też jego zadania.

Pobieranie danych razem z powiązanymi rekordami:
```js
// zadania wraz z danymi autora
const zadania = await prisma.zadanie.findMany({ include: { autor: true } });

// tylko zadania konkretnego użytkownika
const moje = await prisma.zadanie.findMany({ where: { autorId: 1 } });
```

> Pełniejszy model `User` (z hasłem i rolą) pojawia się w instrukcji `12-Autoryzacja-Logowanie.md`.

---

## Walidacja danych wejściowych (`zod`)

Atrybuty `required` czy `minLength` w HTML można łatwo obejść, więc dane trzeba **zawsze** sprawdzić na serwerze. Biblioteka `zod` pozwala opisać oczekiwany kształt danych w jednym miejscu:

```bash
npm install zod
```

```js
'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const ZadanieSchema = z.object({
  tytul: z.string().trim().min(3, 'Tytuł musi mieć co najmniej 3 znaki.').max(100),
});

export async function dodajZadanie(prevState, formData) {
  const wynik = ZadanieSchema.safeParse({ tytul: formData.get('tytul') });

  if (!wynik.success) {
    return { success: false, message: wynik.error.issues[0].message };
  }

  await prisma.zadanie.create({ data: wynik.data });
  revalidatePath('/zadania');
  return { success: true, message: 'Dodano zadanie.' };
}
```

> Sygnatura `(prevState, formData)` pasuje do hooka `useActionState` (instrukcja `10-Formularze-ServerActions.md`) — dzięki temu komunikat można wyświetlić pod formularzem.

---

## Obsługa błędów zapytań

Zapytanie do bazy może się nie udać: baza jest uśpiona, rekord już nie istnieje albo naruszono unikalność (np. drugi użytkownik z tym samym e-mailem). Warto to obsłużyć zamiast pokazywać użytkownikowi surowy błąd:

```js
import { Prisma } from '@prisma/client';

try {
  await prisma.user.create({ data: { email } });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return { success: false, message: 'Ten e-mail jest już zajęty.' };
    }
    if (error.code === 'P2025') {
      return { success: false, message: 'Rekord nie istnieje.' };
    }
  }
  throw error; // nieznany błąd — obsłuży go plik error.js (instrukcja 09-Ladowanie-Bledy-NotFound.md)
}
```

| Kod Prisma | Znaczenie |
|---|---|
| `P2002` | Naruszenie unikalności (`@unique`) |
| `P2025` | Nie znaleziono rekordu do aktualizacji/usunięcia |
| `P2003` | Naruszenie klucza obcego (relacji) |

---

## Konfiguracja zmiennych środowiskowych na Vercel

Connection string do bazy (`DATABASE_URL`) **nigdy** nie powinien trafić do repozytorium Git:

1. Lokalnie: trzymaj go w `.env.local` (plik jest w `.gitignore`).
2. Na Vercel: **Settings → Environment Variables** → dodaj `DATABASE_URL` z tą samą wartością (lub osobną bazą produkcyjną, jeśli chcesz oddzielić dane testowe od produkcyjnych).
3. Jeśli korzystasz z integracji Vercel Storage (Neon/Upstash przez panel Vercel) — zmienne dodają się **automatycznie** po kliknięciu "Connect" do projektu.

---

## Podsumowanie — co wybrać na start

| Potrzeba | Rekomendacja |
|---|---|
| Prosta baza relacyjna (SQL), nauka ORM | **Neon + Prisma** |
| Baza + gotowe logowanie użytkowników | **Supabase** |
| Dane w formie dokumentów/NoSQL | **MongoDB Atlas** |
| Bardzo proste klucz-wartość (np. licznik, cache) | **Upstash (Redis/KV)** przez Vercel Storage |

Dla kursu i małych projektów: **Neon (PostgreSQL) + Prisma** to najczęstszy, dobrze udokumentowany wybór, w pełni darmowy na start i łatwo integrowalny zarówno lokalnie, jak i na Vercel.

---

## Szybka checklista

- [ ] Założona darmowa baza (np. Neon) i `DATABASE_URL` w `.env.local`
- [ ] Zainstalowana Prisma, zdefiniowany model `Zadanie`, wykonana migracja
- [ ] Utworzony klient `src/lib/prisma.js`
- [ ] Działa strona `/zadania` z dodawaniem, oznaczaniem i usuwaniem zadań
- [ ] Dodana walidacja `zod` i obsługa błędów zapytań
- [ ] (opcjonalnie) relacja `User` → `Zadanie`
- [ ] Dane podejrzane w Prisma Studio (`npx prisma studio`)

---

## Materiały

- Prisma — Dokumentacja: <https://www.prisma.io/docs>
- Neon — Darmowy PostgreSQL: <https://neon.tech>
- Supabase — Dokumentacja: <https://supabase.com/docs>
- Vercel Storage — Przegląd: <https://vercel.com/docs/storage>
- Next.js — Connecting to Databases: <https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating>
