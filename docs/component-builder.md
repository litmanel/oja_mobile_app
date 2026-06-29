# component-builder.md

Conventions for building UI components in Oja Market. Every component follows this contract.

---

## Component anatomy

```
features/<domain>/presentation/widgets/
  listing_card.dart          # component
  listing_card_test.dart     # widget test lives alongside
```

Shared, cross-domain components go in `shared/widgets/`.

---

## Component contract

Every component must:

1. Accept only typed parameters — no `Map<String, dynamic>` props
2. Be independently testable with `WidgetTester`
3. Use `context.l10n` for all visible strings
4. Respect `MediaQuery` — never hardcode pixel widths
5. Enforce minimum 44×44 px touch target on any tappable element
6. Handle three states explicitly: **data**, **loading**, **error**

---

## Template

```dart
import 'package:flutter/material.dart';
import 'package:oja/l10n/l10n.dart';
import 'package:oja/shared/theme/oja_theme.dart';

class ListingCard extends StatelessWidget {
  const ListingCard({
    super.key,
    required this.listing,
    required this.onContactTap,
  });

  final Listing listing;
  final VoidCallback onContactTap;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final theme = OjaTheme.of(context);

    return Card(
      color: theme.colorWhite,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: theme.colorBorder, width: 0.5),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _ListingImage(imageUrl: listing.imageUrl),
          _ListingBody(listing: listing, l10n: l10n, theme: theme),
          _ListingFooter(
            listing: listing,
            onContactTap: onContactTap,
            l10n: l10n,
            theme: theme,
          ),
        ],
      ),
    );
  }
}
```

Break large `build` methods into private sub-widgets (`_ListingImage`, `_ListingBody`), not helper methods. Sub-widgets memoize correctly; helper methods re-run on every build.

---

## Status chip

The three chip variants map directly to listing and shop states. Never create an ad-hoc chip outside this component.

```dart
enum ChipVariant { available, verified, flagged, closed }

class OjaChip extends StatelessWidget {
  const OjaChip({super.key, required this.variant, required this.label});

  final ChipVariant variant;
  final String label;

  @override
  Widget build(BuildContext context) {
    final (bg, fg) = switch (variant) {
      ChipVariant.available => (OjaColors.ojaGreenLight, OjaColors.ojaGreen),
      ChipVariant.verified  => (OjaColors.ojaGoldLight,  const Color(0xFF5C4000)),
      ChipVariant.flagged   => (OjaColors.ojaRedLight,   OjaColors.ojaRed),
      ChipVariant.closed    => (OjaColors.harmattan,     OjaColors.barkMid),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: fg.withOpacity(0.4), width: 0.5),
      ),
      child: Text(label,
        style: TextStyle(
          fontFamily: 'NotoSans',
          fontSize: 12,
          fontWeight: FontWeight.w500,
          color: fg,
        ),
      ),
    );
  }
}
```

---

## Primary button

```dart
class OjaPrimaryButton extends StatelessWidget {
  const OjaPrimaryButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.isLoading = false,
  });

  final String label;
  final VoidCallback? onPressed;
  final bool isLoading;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 48,
      child: ElevatedButton(
        onPressed: isLoading ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: OjaColors.ogeOrange,
          foregroundColor: Colors.white,
          disabledBackgroundColor: OjaColors.ogeTint,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          elevation: 0,
        ),
        child: isLoading
          ? const SizedBox(width: 18, height: 18,
              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
          : Text(label,
              style: const TextStyle(
                fontFamily: 'PlusJakartaSans', fontSize: 14, fontWeight: FontWeight.w600)),
      ),
    );
  }
}
```

---

## Loading and error states

Components that fetch data use a consistent three-state pattern via Riverpod:

```dart
ref.watch(listingsProvider).when(
  data:    (listings) => ListingsGrid(listings: listings),
  loading: () => const ListingsGridSkeleton(),   // skeleton, not spinner
  error:   (e, _)  => OjaErrorState(
    message: context.l10n.errorLoadListings,
    onRetry: () => ref.invalidate(listingsProvider),
  ),
);
```

Use skeleton screens (shimmer placeholders matching the card shape) for loading states, not a centred spinner. Spinners without context disorient users on slow connections.

---

## Empty state

```dart
class OjaEmptyState extends StatelessWidget {
  const OjaEmptyState({super.key, required this.message, this.cta, this.onCtaTap});

  final String message;
  final String? cta;
  final VoidCallback? onCtaTap;
  // Render: icon + message + optional CTA button
}
```

Empty states are invitations to act, not error messages. Copy goes through `l10n`.

---

## Checklist before PR

- [ ] All visible strings use `context.l10n`
- [ ] Yoruba string added to `app_yo.arb`
- [ ] Touch targets ≥ 44×44 px
- [ ] Three states handled (data / loading / error)
- [ ] Widget test written
- [ ] No hardcoded colours — only `OjaColors` constants
- [ ] No hardcoded pixel widths
