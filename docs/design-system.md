# design-system.md

Visual language for Oja Market. Grounded in the physical world of Nigerian open-air markets.

Design token files: `oja-design-tokens.json`, `oja-design-system.css`

---

## Colour

### Primary

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-oge-orange` | `#C45C1A` | CTA buttons, focus rings, nav indicator |
| `--color-oge-deep` | `#8B3A0E` | Pressed / active state |
| `--color-oge-tint` | `#F5E6D3` | Ghost button fills, tag backgrounds |

### Supporting

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-oja-green` | `#2E6B4F` | Available status, confirmed states |
| `--color-oja-green-light` | `#EAF3E7` | Available chip background |
| `--color-oja-gold` | `#D4A017` | Verified Vendor badge **only** |
| `--color-oja-gold-light` | `#FDF7E8` | Verified badge background |
| `--color-oja-red` | `#8C1C1C` | Flagged listings, suspension notices |
| `--color-oja-red-light` | `#F9EDED` | Flagged / error state background |

**Rule:** Oja Gold appears only on the Verified Vendor badge. Using it elsewhere dilutes the referral mechanic.

### Neutrals

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bark` | `#1A1410` | Primary text |
| `--color-bark-mid` | `#5C4A3A` | Secondary text, metadata |
| `--color-bark-light` | `#A08878` | Placeholder, disabled, tertiary |
| `--color-harmattan` | `#F2EDE8` | App background |
| `--color-white` | `#FFFFFF` | Cards, inputs |
| `--color-border` | `#D4C0A8` | Dividers, card outlines |

**Why Harmattan instead of white:** Reduces glare for buyers browsing outdoors in direct sunlight — the primary use context. Eliminates the need for card drop shadows, saving render budget.

---

## Typography

### Typefaces

| Role | Font | Why |
|------|------|-----|
| Display / headings | Plus Jakarta Sans | Geometric, confident, sharp at large sizes on mid-range screens |
| Body / Yoruba text | Noto Sans | Only widely available face with full Yoruba diacritic coverage |

**Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700&family=Noto+Sans:wght@400;500&display=swap');
```

### Scale

| Level | Font | Size | Weight | Usage |
|-------|------|------|--------|-------|
| Hero | Plus Jakarta Sans | 22px | 700 | App name, screen titles |
| Listing title | Plus Jakarta Sans | 17px | 600 | Product names, shop names |
| Price | Plus Jakarta Sans | 17px | 600 | Listing prices |
| Body | Noto Sans | 14px | 400 | Descriptions, metadata |
| Body (Yoruba) | Noto Sans | 14px | 400 | All Yoruba strings — line-height 1.7 |
| Chip | Noto Sans | 12px | 500 | Status badges |
| Eyebrow | Noto Sans | 11px | 400 | Category labels, section headers |
| Caption | Noto Sans | 11px | 400 | Timestamps, secondary metadata |

**Yoruba line-height is 1.7, not 1.6.** Tonal diacritics (à á â) stack above the cap height and clip at tighter values on older Android WebView builds.

---

## Spacing

```
xs:  4px   — icon gaps, tight inline spacing
sm:  8px   — internal component padding
md:  12px  — component gaps
lg:  16px  — card padding, section gaps
xl:  24px  — screen horizontal padding
2xl: 32px  — section separation
3xl: 48px  — major screen sections
```

---

## Border radius

```
sm:   4px  — chips, small badges
md:   8px  — buttons, inputs, small cards
lg:   12px — listing cards, vendor cards
xl:   16px — bottom sheets, modals
pill: 999px — status chips
```

---

## Components

### Listing card

Structure: image (4:3) → eyebrow → title + price → meta → footer (chip + contact button).  
Background: `--color-white`. Border: `0.5px solid --color-border`. Radius: `lg`.

### Status chips

Three semantic states — never mix:

| Chip | Background | Text |
|------|-----------|------|
| Available | `--color-oja-green-light` | `--color-oja-green` |
| Verified | `--color-oja-gold-light` | `#5C4000` |
| Flagged | `--color-oja-red-light` | `--color-oja-red` |

### Buttons

**Primary (Contact vendor):** `--color-oge-orange` fill, white text, radius `md`.  
**Ghost:** `--color-oge-tint` fill, `--color-oge-deep` text, `0.5px` border.  
**Featured card accent:** `2px solid --color-oge-orange` border only — the only 2px border in the system.

### Focus ring

`2px solid --color-oge-orange`, `outline-offset: 2px`. Applied globally via `:focus-visible`. Never remove without replacement.

---

## Dark mode

Dark mode inverts surfaces, not brand colours.

| Token | Light | Dark |
|-------|-------|------|
| `--color-harmattan` | `#F2EDE8` | `#1E1812` |
| `--color-white` | `#FFFFFF` | `#2A211A` |
| `--color-bark` | `#1A1410` | `#F0E8DF` |
| `--color-bark-mid` | `#5C4A3A` | `#C0A898` |
| `--color-oge-orange` | `#C45C1A` | `#C45C1A` (unchanged) |
| `--color-oja-gold` | `#D4A017` | `#D4A017` (unchanged) |

---

## Rules

1. One colour per semantic role. No colour doing two jobs.
2. Never place text on a coloured background using `--color-bark` or black — use the matching dark stop from that colour's family.
3. All user-facing strings via `context.l10n` — never hardcoded.
4. App bundle must remain ≤40 MB — no web fonts that aren't already in the import above.
5. Minimum touch target: 44×44 px.
