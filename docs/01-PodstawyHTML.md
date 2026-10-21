# Streszczenie: Podstawy HTML

HTML (HyperText Markup Language) to język znaczników opisujący strukturę treści na stronie internetowej. W Next.js piszemy go głównie w formie JSX wewnątrz komponentów React, ale leżące u podstaw zasady HTML pozostają takie same.

---

## Struktura dokumentu HTML

```html
<!DOCTYPE html>
<html lang="pl">
  <head>
    <meta charset="UTF-8" />
    <title>Tytuł strony</title>
  </head>
  <body>
    <h1>Witaj świecie</h1>
  </body>
</html>
```

- `<!DOCTYPE html>` — deklaracja, że dokument używa HTML5.
- `<html>` — korzeń dokumentu, atrybut `lang` określa język (ważne dla SEO i czytników ekranu).
- `<head>` — metadane: tytuł, kodowanie, linki do CSS, SEO (nie renderuje się na stronie).
- `<body>` — właściwa, widoczna zawartość strony.

> W Next.js strukturę `<html>`/`<body>` definiuje się raz w `src/app/layout.js` — nie powtarza się jej na każdej podstronie.

---

## Anatomia znacznika (tagu)

```html
<a href="https://example.com" target="_blank">Link</a>
```

- `<a>` — nazwa znacznika (tagu otwierającego)
- `href`, `target` — **atrybuty** (dodatkowe informacje/konfiguracja)
- `Link` — zawartość (treść) elementu
- `</a>` — znacznik zamykający

Niektóre znaczniki są **samozamykające** (nie mają treści ani osobnego tagu zamykającego): `<img />`, `<br />`, `<input />`, `<hr />`.

---

## Podział na elementy blokowe i liniowe (inline)

### Elementy blokowe (block-level)
- Zawsze zaczynają się od nowej linii i zajmują całą dostępną szerokość.
- Mogą zawierać inne elementy blokowe i liniowe.
- Mają „fizyczny” wpływ na układ strony (można im ustawiać `width`, `height`, `margin`, `padding` w każdym kierunku).

Przykłady: `<div>`, `<p>`, `<h1>`–`<h6>`, `<ul>`, `<ol>`, `<li>`, `<form>`, `<section>`, `<article>`, `<header>`, `<footer>`, `<nav>`, `<main>`, `<table>`

### Elementy liniowe (inline)
- Nie zaczynają się od nowej linii — „płyną” w tekście, zajmują tylko tyle miejsca, ile potrzeba.
- Nie da się im sensownie ustawić `width`/`height` ani pionowego `margin` (chyba że zmienimy `display`).
- Mogą zawierać zwykle tylko inne elementy liniowe lub tekst.

Przykłady: `<span>`, `<a>`, `<strong>`, `<em>`, `<b>`, `<i>`, `<label>`, `<img>` (inline, ale zachowuje się trochę inaczej — "inline-block"), `<button>` (domyślnie `inline-block`)

### Tabelka porównawcza

| Cecha | Blokowy (`block`) | Liniowy (`inline`) |
|---|---|---|
| Nowa linia przed/po | Tak | Nie |
| Zajmuje całą szerokość | Tak (domyślnie) | Nie, tylko tyle ile treść |
| `width` / `height` działa | Tak | Nie (bez zmiany `display`) |
| Pionowy `margin`/`padding` | Tak | Częściowo (nie wpływa na układ wokół) |
| Przykład | `<div>`, `<p>` | `<span>`, `<a>` |

> W CSS/Tailwind można to zmienić dowolnie: `display: block`, `display: inline`, `display: inline-block`, `display: flex` itd. — podział "blokowy/liniowy" to tylko domyślne zachowanie znacznika.

---

## Najważniejsze grupy znaczników

### Nagłówki i tekst
```html
<h1>Nagłówek główny</h1>
<h2>Podnagłówek</h2>
<p>Akapit tekstu.</p>
<strong>Pogrubienie (ważność)</strong>
<em>Wyróżnienie (kursywa)</em>
<br />  <!-- złamanie linii -->
<hr />  <!-- linia pozioma -->
```

### Listy
```html
<ul>                 <!-- lista nieuporządkowana -->
  <li>Element 1</li>
  <li>Element 2</li>
</ul>

<ol>                 <!-- lista uporządkowana (numerowana) -->
  <li>Krok 1</li>
  <li>Krok 2</li>
</ol>
```

### Linki i obrazy
```html
<a href="/o-nas">Przejdź do strony O nas</a>
<img src="/logo.png" alt="Logo firmy" width="120" height="40" />
```
- `alt` jest **wymagany** dla dostępności (czytniki ekranu) i SEO.

### Formularze
```html
<form action="/wyslij" method="post">
  <label for="imie">Imię</label>
  <input id="imie" name="imie" type="text" required />

  <select name="miasto">
    <option value="wwa">Warszawa</option>
    <option value="krk">Kraków</option>
  </select>

  <textarea name="wiadomosc"></textarea>

  <button type="submit">Wyślij</button>
</form>
```
Typowe typy `<input>`: `text`, `email`, `password`, `number`, `checkbox`, `radio`, `date`, `file`, `submit`.

> Atrybuty `action` (adres, na który trafiają dane) i `method` (`get` lub `post`) omówione są w instrukcji `03-MetodyHTTP.md`. Dane wysyłane są tylko z pól, które mają atrybut `name`.

### Tabele
```html
<table>
  <thead>
    <tr><th>Imię</th><th>Wiek</th></tr>
  </thead>
  <tbody>
    <tr><td>Jan</td><td>20</td></tr>
  </tbody>
</table>
```

### Elementy semantyczne (HTML5)
```html
<header>Nagłówek strony/sekcji</header>
<nav>Nawigacja</nav>
<main>Główna treść strony</main>
<section>Sekcja tematyczna</section>
<article>Samodzielny fragment treści (np. post na blogu)</article>
<aside>Treść poboczna (np. sidebar)</aside>
<footer>Stopka</footer>
```
Elementy semantyczne poprawiają **dostępność (accessibility)** i **SEO** — opisują *znaczenie* treści, a nie tylko jej wygląd (w przeciwieństwie do generycznego `<div>`).

---

## Atrybuty globalne (dostępne na większości znaczników)

| Atrybut | Przeznaczenie |
|---|---|
| `id` | Unikalny identyfikator elementu |
| `class` (w JSX: `className`) | Klasa CSS |
| `style` | Style inline |
| `title` | Dymek z podpowiedzią po najechaniu myszką |
| `data-*` | Niestandardowe dane (np. `data-id="5"`) |
| `hidden` | Ukrywa element |
| `tabindex` | Kolejność nawigacji klawiaturą (Tab) |

---

## HTML w Next.js / React (JSX)

- `class` → `className`
- `for` → `htmlFor`
- Atrybuty w camelCase: `onclick` → `onClick`, `maxlength` → `maxLength`
- Każdy znacznik musi być poprawnie zamknięty (również samozamykające: `<img />`, `<br />`)
- Komentarze: `{/* tak komentujemy w JSX */}`

---

## Szybka checklista

- [ ] Znam strukturę dokumentu (`<html>`, `<head>`, `<body>`)
- [ ] Potrafię wskazać różnicę między elementem blokowym a liniowym
- [ ] Znam podstawowe znaczniki: nagłówki, akapity, listy, linki, obrazy, tabele
- [ ] Potrafię zbudować formularz z `label`, `input`, `select`, `button`
- [ ] Używam znaczników semantycznych (`header`, `main`, `nav`, `footer`) zamiast samych `div`
- [ ] Znam różnice zapisu HTML vs JSX (`className`, `htmlFor`)

---

## Materiały

- MDN — HTML elements reference: <https://developer.mozilla.org/pl/docs/Web/HTML/Element>
- MDN — Block vs inline: <https://developer.mozilla.org/en-US/docs/Web/HTML/Block-level_elements>
- web.dev — Semantyka HTML: <https://web.dev/learn/html/semantic-html>
