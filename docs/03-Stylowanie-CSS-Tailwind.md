# Projekt Next.js: Stylowanie — CSS, CSS Modules i Tailwind CSS

W tym bloku nauczysz się różnych sposobów stylowania aplikacji Next.js: globalnych arkuszy CSS, modułowych stylów (**CSS Modules**) oraz frameworka **Tailwind CSS**, który jest już skonfigurowany w tym projekcie.

---

## Krok 1: Style globalne

Plik `src/app/globals.css` zawiera style dotyczące całej aplikacji (np. reset CSS, zmienne kolorów). Jest importowany raz, w `src/app/layout.js`:

```jsx
import "./globals.css";
```

Dodaj własną regułę na końcu pliku `globals.css`:

```css
.highlight {
  background-color: #fff59d;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
}
```

Użyj klasy w dowolnym komponencie:

```jsx
<span className="highlight">Ważna informacja</span>
```

---

## Krok 2: CSS Modules — style lokalne dla komponentu

CSS Modules pozwalają pisać style, które **nie kolidują** z innymi komponentami (nazwy klas są automatycznie unikalne).

Utwórz plik `src/components/Card.module.css`:

```css
.card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}
```

Zaktualizuj `src/components/Card.js`:

```jsx
import styles from './Card.module.css';

export default function Card({ title, children }) {
  return (
    <div className={styles.card}>
      <h2 className={styles.title}>{title}</h2>
      <div>{children}</div>
    </div>
  );
}
```

> Nazwa pliku modułu CSS **musi** kończyć się na `.module.css`.

---

## Krok 3: Tailwind CSS — stylowanie narzędziowe (utility-first)

Ten projekt ma już skonfigurowany Tailwind (`postcss.config.mjs`). Zamiast pisać własne klasy CSS, używasz gotowych klas narzędziowych bezpośrednio w JSX:

```jsx
export default function Badge({ children }) {
  return (
    <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
      {children}
    </span>
  );
}
```

### Najczęściej używane klasy Tailwind

| Kategoria | Przykładowe klasy |
|---|---|
| Odstępy | `p-4`, `px-2`, `py-1`, `m-4`, `gap-4` |
| Flexbox | `flex`, `flex-col`, `items-center`, `justify-between` |
| Kolory | `bg-blue-500`, `text-white`, `border-zinc-200` |
| Typografia | `text-lg`, `font-bold`, `leading-8` |
| Zaokrąglenia i cienie | `rounded-lg`, `shadow-md` |
| Warianty (dark mode, hover) | `dark:bg-black`, `hover:bg-blue-600` |

---

## Krok 4: Porównanie podejść — kiedy używać czego?

- **Style globalne** – reset, zmienne, style typografii dla całej strony.
- **CSS Modules** – gdy chcesz mieć pełną kontrolę nad CSS i unikać kolizji nazw klas, ale bez narzutu utility-first.
- **Tailwind CSS** – szybkie prototypowanie, spójny design system, mniej przełączania się między plikami.

W praktyce projekty często **łączą** te podejścia.

---

## Krok 5 (dla chętnych): Warianty i responsywność w Tailwind

Dodaj responsywny układ do strony głównej — jedna kolumna na telefonie, dwie na większym ekranie:

```jsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
  <Card title="Punkt 1">Treść 1</Card>
  <Card title="Punkt 2">Treść 2</Card>
</div>
```

Prefiksy `sm:`, `md:`, `lg:` aktywują style dopiero od danej szerokości ekranu.

---

## Szybka checklista

- [ ] Dodana własna reguła w `globals.css` i użyta w komponencie
- [ ] Utworzony `Card.module.css` i podpięty do komponentu `Card`
- [ ] Utworzony komponent `Badge` stylowany w Tailwind
- [ ] Wypróbowany responsywny grid z prefiksami `sm:`/`md:`

---

## Materiały

- Next.js — CSS: <https://nextjs.org/docs/app/building-your-application/styling/css>
- Next.js — CSS Modules: <https://nextjs.org/docs/app/building-your-application/styling/css#css-modules>
- Tailwind CSS — dokumentacja: <https://tailwindcss.com/docs>
