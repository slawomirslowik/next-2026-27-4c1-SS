# Hosting projektu Next.js — Vercel

Next.js jest rozwijany przez firmę **Vercel**, dlatego to właśnie ich platforma hostingowa jest najlepiej dopasowana do tego frameworka — wdrożenie (deploy) działa "od ręki", bez dodatkowej konfiguracji serwera.

---

## Czy to jest darmowe?

Tak — Vercel oferuje plan **Hobby (Free)**, który w zupełności wystarcza na mały/edukacyjny projekt. Nie trzeba podawać karty płatniczej, żeby zacząć.

### Co zawiera darmowy plan (Hobby)
- Nielimitowana liczba projektów i deployów.
- Automatyczny HTTPS, własna subdomena `twoj-projekt.vercel.app`.
- Możliwość podpięcia własnej domeny (np. `mojastrona.pl`) — też za darmo (samo podpięcie domeny, domenę trzeba kupić osobno u dowolnego rejestratora).
- Automatyczny deploy po każdym `git push` (integracja z GitHub/GitLab/Bitbucket).
- Darmowe środowiska **preview** — każdy branch/PR dostaje swój osobny, tymczasowy adres do podglądu.
- Wsparcie dla Route Handlers (API), Server Actions, Image Optimization (z limitami), Edge Functions.
- Limity transferu/zasobów wystarczające na małe strony, projekty portfolio, aplikacje szkolne/ćwiczeniowe.

### Ograniczenia darmowego planu (dla małych projektów zwykle nieistotne)
- Limit **100 GB** transferu danych miesięcznie (tzw. Fast Data Transfer).
- Limity czasu wykonywania funkcji serverless (Route Handlers/Server Actions) — kilka do kilkunastu sekund na żądanie, co w zupełności wystarcza na typowe operacje (zapytania do bazy, wysyłka maila itp.).
- Plan Hobby jest przeznaczony **do użytku niekomercyjnego / osobistego** — zgodnie z regulaminem Vercel projekty komercyjne/firmowe powinny korzystać z płatnego planu **Pro** (dla zespołów, większego ruchu i wsparcia SLA).
- Brak niektórych zaawansowanych funkcji (np. zaawansowana analityka, hasła do stron preview) — dostępne w planach płatnych.

> **Wniosek:** dla projektu szkolnego/ćwiczeniowego z tego kursu plan darmowy jest w pełni wystarczający i to właśnie na nim zwykle się pracuje.

---

## Jak wdrożyć projekt Next.js na Vercel — krok po kroku

### Krok 1: Konto i repozytorium
1. Załóż konto na <https://vercel.com> — najwygodniej logując się przez konto GitHub.
2. Upewnij się, że projekt jest wypchnięty do repozytorium na GitHub (`git push`).

### Krok 2: Import projektu
1. W panelu Vercel kliknij **Add New... → Project**.
2. Wybierz repozytorium z projektem Next.js (np. `next-2026-27-4b1-SS`).
3. Vercel **automatycznie wykrywa framework Next.js** — nie trzeba ręcznie ustawiać komend budowania.
   - Build Command: `next build` (domyślnie)
   - Output Directory: `.next` (domyślnie)
   - Install Command: `npm install` / `pnpm install` / `yarn install` (wykrywane z `package.json`/lockfile)

### Krok 3: Zmienne środowiskowe
Jeśli projekt korzysta np. z połączenia do bazy danych lub kluczy API (np. w pliku `.env.local`), trzeba je dodać ręcznie w panelu:
- **Settings → Environment Variables**
- Dodaj te same klucze co w `.env.local` (np. `DATABASE_URL`, `API_KEY`)
- Pamiętaj: plik `.env.local` **nie jest** wysyłany do repozytorium (jest w `.gitignore`), więc Vercel go nie zobaczy automatycznie.

> **Projekt z Prisma (instrukcja `11`):** Vercel cache'uje zależności, przez co Prisma Client może nie zostać wygenerowany. Dodaj do `package.json` skrypt `"postinstall": "prisma generate"`, a migracje na bazie produkcyjnej uruchamiaj komendą `npx prisma migrate deploy`.

> **Projekt z logowaniem (instrukcja `12`):** dodaj także zmienną `AUTH_SECRET`.

### Krok 4: Deploy
1. Kliknij **Deploy**.
2. Po chwili projekt dostaje adres: `https://nazwa-projektu.vercel.app`.
3. Od teraz **każdy `git push` na branch główny (`main`)** automatycznie aktualizuje produkcyjną wersję strony.
4. Push na inny branch lub otwarcie Pull Requesta tworzy osobny **Preview Deployment** z unikalnym adresem — można go podesłać do sprawdzenia, zanim zmiany trafią na `main`.

### Krok 5 (opcjonalnie): własna domena
- **Settings → Domains** → wpisz swoją domenę i skonfiguruj rekordy DNS zgodnie z instrukcją Vercel (zwykle rekord `A` lub `CNAME` u rejestratora domeny).

---

## Alternatywy dla Vercel

Next.js można hostować też gdzie indziej, choć zwykle wymaga to więcej konfiguracji (szczególnie dla funkcji serverless/Edge):

| Platforma | Plan darmowy | Uwagi |
|---|---|---|
| **Netlify** | Tak | Dobre wsparcie dla Next.js przez plugin |
| **Cloudflare Pages** | Tak | Szybkie globalnie (Edge), dobra integracja z Next.js |
| **Railway** | Ograniczony (kredyty) | Łatwy hosting z bazą danych |
| **Render** | Tak (z usypianiem po bezczynności) | Prosta konfiguracja |
| **Własny VPS + Node.js** | Zależy od dostawcy VPS | Pełna kontrola, ale wymaga samodzielnej konfiguracji (`next start`, reverse proxy np. nginx, SSL) |

Dla celów nauki i małych projektów **Vercel pozostaje najprostszym wyborem** — zero konfiguracji, natywne wsparcie wszystkich funkcji Next.js (Server Actions, Route Handlers, Image Optimization, ISR).

---

## Szybka checklista wdrożenia

- [ ] Projekt wypchnięty na GitHub
- [ ] Konto na Vercel połączone z GitHub
- [ ] Projekt zaimportowany i wdrożony (Deploy)
- [ ] Dodane zmienne środowiskowe (jeśli projekt ich wymaga)
- [ ] Sprawdzony adres produkcyjny `*.vercel.app`
- [ ] (opcjonalnie) podpięta własna domena

---

## Materiały

- Vercel — Dokumentacja: <https://vercel.com/docs>
- Vercel — Cennik i plany: <https://vercel.com/pricing>
- Next.js — Deployment: <https://nextjs.org/docs/app/building-your-application/deploying>
- Vercel — Limity planu Hobby: <https://vercel.com/docs/limits/overview>
