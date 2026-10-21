# Protokół HTTP i metody HTTP

**HTTP (HyperText Transfer Protocol)** to protokół, w którym przeglądarka (klient) i serwer wymieniają się danymi. Każda wymiana to para: **żądanie (request)** od klienta i **odpowiedź (response)** od serwera. Metody HTTP (zwane też "czasownikami HTTP") określają, jaką operację klient chce wykonać. Znajomość ich właściwości jest kluczowa przy projektowaniu API (np. w Next.js Route Handlers) oraz formularzy HTML.

---

## Budowa adresu URL

```
https://www.example.com:443/produkty/42?kolor=czerwony&strona=2#opinie
└─┬─┘   └──────┬──────┘ └┬┘ └────┬─────┘ └────────┬─────────┘ └─┬──┘
protokół      domena       port  ścieżka     parametry zapytania  fragment
```

| Część | Znaczenie | W Next.js |
|---|---|---|
| Protokół | `http` lub `https` | — |
| Domena | Adres serwera | — |
| Port | Domyślnie 80 (HTTP) / 443 (HTTPS), lokalnie np. `3000` | `localhost:3000` |
| Ścieżka | Wskazuje zasób | Odpowiada folderom w `src/app/` |
| Parametry (query string) | Pary `klucz=wartość` po `?`, rozdzielone `&` | `searchParams` |
| Fragment | Miejsce na stronie (po `#`), **nie jest wysyłany** do serwera | — |

---

## Budowa żądania i odpowiedzi

**Żądanie** (to wysyła przeglądarka):
```http
POST /api/zadania HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Cookie: sesja=abc123

{"tytul": "Nauczyć się HTTP"}
```

**Odpowiedź** (to odsyła serwer):
```http
HTTP/1.1 201 Created
Content-Type: application/json
Set-Cookie: ostatnia_wizyta=2026-10-15

{"id": 7, "tytul": "Nauczyć się HTTP"}
```

Każde z nich ma:
1. **Linię startową** — w żądaniu metoda + ścieżka, w odpowiedzi kod statusu.
2. **Nagłówki (headers)** — metadane w formie `Nazwa: wartość`.
3. **Treść (body)** — opcjonalna, np. JSON, HTML, dane formularza.

### Najważniejsze nagłówki
| Nagłówek | Znaczenie |
|---|---|
| `Content-Type` | Format treści (`application/json`, `text/html`, `multipart/form-data`) |
| `Cookie` / `Set-Cookie` | Przesyłanie ciasteczek do serwera / ustawianie ich przez serwer |
| `Authorization` | Dane uwierzytelniające (np. token) |
| `Location` | Adres przekierowania (przy kodach 3xx) |
| `Cache-Control` | Zasady cache'owania odpowiedzi |

> Wszystkie te elementy zobaczysz na żywo w DevTools → **Network** (instrukcja `02-DevToolsChrome.md`).

---

## HTTP a HTTPS

**HTTPS** to HTTP z szyfrowaniem (TLS). Bez niego każdy pośrednik w sieci (np. w publicznym Wi-Fi) może podejrzeć lub zmienić przesyłane dane — włącznie z hasłami i ciasteczkami sesji. Dlatego:
- metoda `POST` sama w sobie **nie szyfruje** danych — ukrywa je tylko przed paskiem adresu,
- formularze logowania muszą działać wyłącznie przez HTTPS,
- Vercel (instrukcja `13-Hosting-Vercel.md`) włącza HTTPS automatycznie.

---

## Lista podstawowych metod

| Metoda | Przeznaczenie | Ma body (treść) | Typowy kod odpowiedzi |
|---|---|---|---|
| `GET` | Pobranie zasobu | Nie (zwykle) | 200 OK |
| `POST` | Utworzenie nowego zasobu / wykonanie akcji | Tak | 201 Created / 200 OK |
| `PUT` | Pełna aktualizacja (zastąpienie) zasobu | Tak | 200 OK / 204 No Content |
| `PATCH` | Częściowa aktualizacja zasobu | Tak | 200 OK |
| `DELETE` | Usunięcie zasobu | Zwykle nie | 200 OK / 204 No Content |
| `HEAD` | Jak `GET`, ale bez treści odpowiedzi (same nagłówki) | Nie | 200 OK |
| `OPTIONS` | Sprawdzenie, jakie metody/nagłówki są dozwolone (np. CORS preflight) | Nie | 204 No Content |

---

## Idempotentność

**Metoda idempotentna** to taka, której wielokrotne wykonanie z tymi samymi danymi daje **ten sam efekt końcowy**, co wykonanie jej raz (niezależnie od liczby powtórzeń).

### Idempotentne
- **`GET`** — samo pobranie danych nie zmienia stanu serwera, niezależnie ile razy je wykonamy.
- **`PUT`** — jeśli wyślemy `PUT /user/5 { name: "Jan" }` 10 razy, stan końcowy będzie identyczny jak po jednym wywołaniu (zasób zostaje "ustawiony" na konkretną wartość).
- **`DELETE`** — usunięcie zasobu, który już nie istnieje, nadal daje ten sam efekt (zasobu nie ma). Pierwsze wywołanie usuwa, kolejne nic nie zmieniają (choć kod odpowiedzi może się różnić, np. 404 przy kolejnych próbach).
- **`HEAD`, `OPTIONS`** — nie zmieniają stanu serwera.

### Nieidempotentne
- **`POST`** — każde wywołanie zwykle tworzy **nowy** zasób lub wykonuje akcję ponownie (np. wysłanie formularza kontaktowego 3 razy = 3 nowe wpisy w bazie, 3 wysłane maile).
- **`PATCH`** — zależnie od implementacji, często nieidempotentny (np. `PATCH { licznik: +1 }` — wykonanie 3 razy zwiększy licznik 3 razy, a nie raz).

> **Dlaczego to ważne?** Przeglądarki i biblioteki (np. `fetch`, axios) mogą bezpiecznie *ponawiać* (retry) żądania idempotentne w razie błędu sieci, bez ryzyka duplikowania danych. Żądań `POST` nie powinno się automatycznie ponawiać bez dodatkowych zabezpieczeń (np. idempotency key).

---

## Bezpieczeństwo (safe methods)

**Metoda bezpieczna** to taka, która **nie zmienia stanu serwera** — służy wyłącznie do odczytu.

- Bezpieczne: `GET`, `HEAD`, `OPTIONS`
- Niebezpieczne (zmieniają stan): `POST`, `PUT`, `PATCH`, `DELETE`

Każda metoda bezpieczna jest też idempotentna, ale nie odwrotnie (np. `PUT` jest idempotentny, lecz niebezpieczny, bo zmienia dane).

---

## Cacheable (czy odpowiedź można cache'ować)

- `GET` i `HEAD` — domyślnie **cache'owalne** przez przeglądarki/proxy (jeśli nagłówki na to pozwalają).
- `POST` — cache'owalny tylko w rzadkich, specyficznych przypadkach.
- `PUT`, `PATCH`, `DELETE` — zasadniczo niecache'owalne.

---

## Przykład w Next.js (Route Handler)

```js
// src/app/api/zadania/route.js

export async function GET(request) {
  // odczyt listy zadań — bezpieczne, idempotentne
  return Response.json({ zadania: [] });
}

export async function POST(request) {
  const dane = await request.json();
  // utworzenie nowego zadania — nieidempotentne
  return Response.json({ id: 1, ...dane }, { status: 201 });
}

export async function PUT(request) {
  const dane = await request.json();
  // pełna aktualizacja zadania o danym id — idempotentne
  return Response.json(dane);
}

export async function DELETE(request) {
  // usunięcie zadania — idempotentne
  return new Response(null, { status: 204 });
}
```

---

## Szybkie podsumowanie

| Metoda | Bezpieczna | Idempotentna | Ma body żądania |
|---|---|---|---|
| GET | ✅ | ✅ | ❌ |
| HEAD | ✅ | ✅ | ❌ |
| OPTIONS | ✅ | ✅ | ❌ |
| PUT | ❌ | ✅ | ✅ |
| DELETE | ❌ | ✅ | ❌ (zwykle) |
| POST | ❌ | ❌ | ✅ |
| PATCH | ❌ | ❌ (zwykle) | ✅ |

---

## Kody statusu odpowiedzi

Kod statusu to trzycyfrowa liczba w odpowiedzi serwera. Pierwsza cyfra określa grupę:

| Grupa | Znaczenie | Najczęstsze kody |
|---|---|---|
| **1xx** | Informacyjne | rzadko spotykane w praktyce |
| **2xx** | Sukces | `200 OK`, `201 Created`, `204 No Content` |
| **3xx** | Przekierowanie | `301 Moved Permanently`, `302 Found`, `304 Not Modified` (użyj wersji z cache) |
| **4xx** | Błąd po stronie **klienta** | `400 Bad Request` (złe dane), `401 Unauthorized` (niezalogowany), `403 Forbidden` (brak uprawnień), `404 Not Found`, `405 Method Not Allowed` |
| **5xx** | Błąd po stronie **serwera** | `500 Internal Server Error`, `502 Bad Gateway`, `503 Service Unavailable` |

> **Różnica 401 vs 403:** `401` — "nie wiem, kim jesteś, zaloguj się"; `403` — "wiem, kim jesteś, ale nie masz do tego dostępu".

W Route Handlerze kod statusu ustawiasz drugim argumentem:
```js
return Response.json({ error: 'Pole tytul jest wymagane' }, { status: 400 });
```

---

## Szybka checklista

- [ ] Potrafię rozebrać adres URL na części (domena, ścieżka, parametry)
- [ ] Rozumiem budowę żądania i odpowiedzi (linia startowa, nagłówki, body)
- [ ] Wiem, dlaczego HTTPS jest konieczny przy logowaniu
- [ ] Znam metody GET, POST, PUT, PATCH, DELETE i ich zastosowania
- [ ] Rozumiem pojęcia: metoda bezpieczna, idempotentna
- [ ] Rozpoznaję grupy kodów statusu (2xx, 3xx, 4xx, 5xx)

---

## Materiały

- MDN — Metody HTTP: <https://developer.mozilla.org/pl/docs/Web/HTTP/Methods>
- MDN — Kody statusu HTTP: <https://developer.mozilla.org/pl/docs/Web/HTTP/Status>
- MDN — Przegląd HTTP: <https://developer.mozilla.org/pl/docs/Web/HTTP/Overview>
- MDN — Idempotentność: <https://developer.mozilla.org/en-US/docs/Glossary/Idempotent>
- RFC 9110 (HTTP Semantics): <https://httpwg.org/specs/rfc9110.html>
