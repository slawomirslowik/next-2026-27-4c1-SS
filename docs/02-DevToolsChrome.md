# DevTools w przeglądarce Chrome

Narzędzia deweloperskie Chrome (DevTools) to zestaw narzędzi wbudowanych w przeglądarkę, pozwalających analizować, debugować i modyfikować stronę na żywo. Niezbędne przy pracy z Next.js/React.

**Otwieranie:** `F12`, `Ctrl+Shift+I`, lub prawy przycisk myszy na stronie → *Zbadaj* ("Inspect").

---

## Przegląd najważniejszych zakładek

| Zakładka | Do czego służy |
|---|---|
| **Elements** | Podgląd i edycja drzewa DOM oraz stylów CSS na żywo |
| **Console** | Logi (`console.log`), błędy JS, uruchamianie kodu JS w locie |
| **Sources** | Przeglądanie plików źródłowych, ustawianie breakpointów, debugowanie JS krok po kroku |
| **Network** | Podgląd wszystkich żądań sieciowych (HTML, CSS, JS, API, obrazy) |
| **Application** | Przechowywanie danych: cookies, localStorage, sessionStorage, cache, Service Workers |
| **Performance** | Analiza wydajności renderowania, nagrywanie i analiza klatek |
| **Lighthouse** | Automatyczny audyt: wydajność, dostępność, SEO, best practices |
| **Memory** | Analiza zużycia pamięci, wykrywanie wycieków |
| **Security** | Informacje o certyfikacie HTTPS, mieszanej treści (mixed content) |

---

## Zakładka Elements — i czym jest DOM

**DOM (Document Object Model)** to reprezentacja dokumentu HTML w pamięci przeglądarki jako **drzewo obiektów**. Każdy znacznik HTML staje się węzłem (node), który JavaScript może odczytywać i modyfikować (np. `document.querySelector`).

W zakładce **Elements** widzisz:
- Aktualny stan DOM (może różnić się od "widoku źródła strony", bo DOM zawiera zmiany wprowadzone przez JS po załadowaniu — typowe dla aplikacji React/Next.js, które renderują dynamicznie).
- Panel **Styles** — wszystkie reguły CSS zastosowane do zaznaczonego elementu, z możliwością edycji na żywo (np. zmiana koloru, żeby sprawdzić, jak wygląda).
- Panel **Computed** — finalne, wyliczone wartości stylów (po uwzględnieniu dziedziczenia, specyficzności itd.).
- Zakładka **Layout** — podgląd modelu pudełkowego (box model): `margin`, `border`, `padding`, `content`.

**Przydatne skróty:**
- Kliknięcie ikony strzałki (▭ z kursorem) + najechanie na element strony → zaznacza go w drzewie DOM.
- `Ctrl+F` w panelu Elements → szukanie elementu po selektorze CSS, tekście lub XPath.
- Podwójne kliknięcie na tekst/atrybut → edycja na żywo (zmiany znikają po odświeżeniu strony).

---

## Zakładka Console

- `console.log()`, `console.warn()`, `console.error()`, `console.table()` — wypisywanie informacji z kodu.
- Czerwone komunikaty = błędy JS (np. `TypeError`, `undefined is not a function`) — kluczowe przy debugowaniu komponentów React.
- Można tu też **wpisywać i wykonywać kod JS** bezpośrednio na stronie (np. `document.title` albo wywołanie funkcji globalnej).
- Filtrowanie logów: `Errors`, `Warnings`, `Info`, `Logs` — przydatne, gdy konsola jest zaśmiecona.

---

## Zakładka Network — analiza żądań sieciowych

Pokazuje **każde** żądanie wysłane przez stronę: dokumenty HTML, pliki CSS/JS, obrazy, fonty, zapytania `fetch`/`XHR` do API.

### Najważniejsze kolumny
| Kolumna | Znaczenie |
|---|---|
| Name | Nazwa pliku / endpointu |
| Status | Kod odpowiedzi HTTP (200, 404, 500 itd.) |
| Type | Typ zasobu (`document`, `script`, `xhr`, `fetch`, `img`) |
| Size | Rozmiar odpowiedzi (i transferu) |
| Time | Czas trwania żądania |
| Waterfall | Wizualizacja osi czasu (kiedy żądanie się zaczęło/skończyło) |

### Jak z tego korzystać
1. Otwórz zakładkę **Network** *przed* wykonaniem akcji (np. przed wysłaniem formularza), żeby zobaczyć żądanie w czasie rzeczywistym.
2. Kliknij na konkretne żądanie, aby zobaczyć:
   - **Headers** — nagłówki żądania i odpowiedzi, metoda HTTP (`GET`/`POST`...), status.
   - **Payload** / **Request** — dane wysłane (np. treść formularza, JSON wysłany do API).
   - **Response** — treść odpowiedzi serwera (np. JSON zwrócony przez Route Handler w Next.js).
   - **Cookies** — jakie ciasteczka zostały wysłane/ustawione w ramach tego żądania.
   - **Timing** — szczegółowy rozkład czasu (DNS, połączenie, oczekiwanie na odpowiedź - TTFB, pobieranie).
3. Filtrowanie: pasek filtrów (`Fetch/XHR`, `JS`, `CSS`, `Img`, `All`) oraz pole tekstowe do wpisania frazy/adresu.
4. **Preserve log** — zachowuje listę żądań mimo przeładowania strony/nawigacji (przydatne przy testowaniu przekierowań).
5. **Throttling** — symulacja wolnego internetu (np. "Slow 3G"), by sprawdzić zachowanie aplikacji przy słabym łączu.
6. Ikona 🚫 (Disable cache) — wymusza pobieranie zasobów na nowo, pomijając cache przeglądarki (ważne przy testowaniu zmian w plikach statycznych).

---

## Zakładka Application — Cookies i magazyny danych

### Czym są cookies (ciasteczka)?
**Cookies** to małe pliki tekstowe (klucz-wartość) przechowywane przez przeglądarkę, wysyłane automatycznie do serwera przy każdym żądaniu do danej domeny. Służą m.in. do:
- utrzymywania sesji zalogowanego użytkownika,
- zapamiętywania preferencji (np. motyw ciemny/jasny),
- śledzenia i analityki (np. Google Analytics).

**Ważne atrybuty cookie:**
| Atrybut | Znaczenie |
|---|---|
| `Expires` / `Max-Age` | Kiedy ciasteczko wygasa (brak = sesyjne, znika po zamknięciu przeglądarki) |
| `HttpOnly` | Niedostępne z poziomu JavaScript (`document.cookie`) — ochrona przed XSS |
| `Secure` | Wysyłane tylko przez HTTPS |
| `SameSite` | Kontrola wysyłania ciasteczka przy żądaniach z innych domen (`Strict`, `Lax`, `None`) — ochrona przed CSRF |

W Next.js cookies odczytuje się/ustawia np. przez funkcję `cookies()` z `next/headers` w Server Components/Actions.

### Gdzie znaleźć cookies w DevTools
Zakładka **Application** → sekcja **Storage** → **Cookies** → wybór domeny. Widać tabelę ze wszystkimi ciasteczkami, ich wartościami i atrybutami. Można je tu też ręcznie usunąć/edytować.

### Pozostałe magazyny danych w Application
- **Local Storage** — dane trwałe (zostają po zamknięciu przeglądarki), dostępne przez `localStorage.setItem()/getItem()`, bez automatycznego wysyłania do serwera.
- **Session Storage** — jak Local Storage, ale dane znikają po zamknięciu karty/przeglądarki.
- **IndexedDB** — baza danych NoSQL po stronie przeglądarki, do większych ilości danych.
- **Cache Storage** — cache używany np. przez Service Workers (PWA).
- Przycisk **Clear site data** — czyści wszystkie powyższe magazyny dla danej domeny (przydatne przy debugowaniu "dziwnych" błędów spowodowanych starymi danymi zapisanymi w przeglądarce).

---

## Typowy workflow debugowania w Next.js

1. **Console** — sprawdź, czy nie ma czerwonych błędów JS/React (np. błąd hydratacji).
2. **Network** → filtr `Fetch/XHR` — sprawdź, czy żądanie do API/Route Handlera poszło, jaki ma status i co zwróciło w **Response**.
3. **Elements** — sprawdź, czy wyrenderowany DOM wygląda tak, jak oczekujesz, i czy klasy CSS/Tailwind się zastosowały.
4. **Application → Cookies** — sprawdź, czy sesja/cookie faktycznie zostały ustawione po logowaniu.
5. **Sources** — w razie potrzeby ustaw breakpoint w kodzie JS i przejdź krok po kroku (`Step over`, `Step into`).

> **Pamiętaj:** `console.log` w Server Component, Server Action lub Route Handlerze wykonuje się **na serwerze** — wynik zobaczysz w terminalu z `npm run dev`, a nie w konsoli przeglądarki.

---

## Rozpoznawanie żądań Next.js w zakładce Network

| Co widzisz | Co to jest |
|---|---|
| `GET` typu `document` | Pełne załadowanie strony (pierwsze wejście, odświeżenie) |
| `GET` z parametrem `?_rsc=...` | Nawigacja przez `<Link>` — Next.js pobiera tylko dane komponentów serwerowych (RSC), bez przeładowania strony |
| `POST` z nagłówkiem `Next-Action` | Wywołanie **Server Action** (np. wysłanie formularza) |
| `GET`/`POST` na `/api/...` | Wywołanie Twojego **Route Handlera** |

---

## Rozszerzenie React Developer Tools

Oficjalne rozszerzenie do Chrome (do zainstalowania z Chrome Web Store) dodaje dwie zakładki:

- **⚛️ Components** — drzewo komponentów React (zamiast drzewa DOM). Po kliknięciu komponentu widać jego **propsy**, **stan** (`useState`) i wartości kontekstu — można je też edytować na żywo. Właśnie dlatego warto nadawać komponentom unikalne nazwy (patrz instrukcja `04`).
- **⚛️ Profiler** — nagrywa rendery i pokazuje, które komponenty renderują się za często lub za wolno.

> W zakładce Components zobaczysz tylko **Client Components** — Server Components renderują się na serwerze, więc w przeglądarce nie mają stanu do podejrzenia.

---

## Szybka checklista

- [ ] Potrafię otworzyć DevTools i zaznaczyć element strony w zakładce Elements
- [ ] Rozumiem, czym jest DOM i czym różni się od źródła strony
- [ ] Potrafię znaleźć żądanie w Network i sprawdzić jego metodę, status, payload i odpowiedź
- [ ] Potrafię odnaleźć i usunąć cookies w zakładce Application
- [ ] Zainstalowane rozszerzenie React Developer Tools

---

## Materiały

- Chrome DevTools — dokumentacja oficjalna: <https://developer.chrome.com/docs/devtools>
- MDN — Cookies: <https://developer.mozilla.org/pl/docs/Web/HTTP/Cookies>
- MDN — DOM: <https://developer.mozilla.org/pl/docs/Web/API/Document_Object_Model>
- Next.js — `cookies()`: <https://nextjs.org/docs/app/api-reference/functions/cookies>
- React Developer Tools: <https://react.dev/learn/react-developer-tools>
