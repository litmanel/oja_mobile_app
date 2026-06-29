export const tokensJson =  
{
  "meta": {
    "name": "Oja Ogbomoso Design System",
    "version": "1.0.0",
    "description": "Material Design 3 token system for Oja Ogbomoso — a hyperlocal mobile marketplace for Ogbomoso, Nigeria.",
    "framework": "Flutter + Material Design 3",
    "seedColor": "#E65100"
  },

  "color": {
    "seed": "#E65100",

    "primary": {
      "DEFAULT":     "#BF360C",
      "onPrimary":   "#FFFFFF",
      "container":   "#FFCCBC",
      "onContainer": "#6D1F00"
    },
    "secondary": {
      "DEFAULT":     "#795548",
      "onSecondary": "#FFFFFF",
      "container":   "#D7CCC8",
      "onContainer": "#3E2723"
    },
    "tertiary": {
      "DEFAULT":     "#F57F17",
      "onTertiary":  "#FFFFFF",
      "container":   "#FFF9C4",
      "onContainer": "#7C5800"
    },
    "error": {
      "DEFAULT":     "#B00020",
      "onError":     "#FFFFFF",
      "container":   "#FFDAD6",
      "onContainer": "#410002"
    },
    "success": {
      "DEFAULT":     "#2E7D32",
      "onSuccess":   "#FFFFFF",
      "container":   "#C8E6C9",
      "onContainer": "#003300"
    },
    "warning": {
      "DEFAULT":     "#E65100",
      "onWarning":   "#FFFFFF",
      "container":   "#FFE0B2",
      "onContainer": "#6D2900"
    },

    "neutral": {
      "50":  "#FAFAFA",
      "100": "#F5F5F5",
      "200": "#EEEEEE",
      "300": "#E0E0E0",
      "400": "#BDBDBD",
      "500": "#9E9E9E",
      "600": "#757575",
      "700": "#616161",
      "800": "#424242",
      "900": "#212121"
    },

    "background": {
      "DEFAULT":    "#FFFBFF",
      "onDefault":  "#1C1B1F",
      "surface":    "#FFFBFF",
      "onSurface":  "#1C1B1F",
      "surfaceVariant":   "#F5DED5",
      "onSurfaceVariant": "#53433F",
      "outline":          "#85736F",
      "outlineVariant":   "#D8C2BC"
    },

    "whatsapp": "#25D366",
    "flutterwave": "#F5A623",
    "paystack": "#00C3F7"
  },

  "typography": {
    "fontFamily": {
      "display": "Sora",
      "body":    "Inter",
      "mono":    "JetBrains Mono"
    },
    "scale": {
      "displayLarge":   { "size": "57px", "lineHeight": "64px", "weight": "400", "tracking": "-0.25px" },
      "displayMedium":  { "size": "45px", "lineHeight": "52px", "weight": "400", "tracking": "0px" },
      "displaySmall":   { "size": "36px", "lineHeight": "44px", "weight": "400", "tracking": "0px" },
      "headlineLarge":  { "size": "32px", "lineHeight": "40px", "weight": "500", "tracking": "0px" },
      "headlineMedium": { "size": "28px", "lineHeight": "36px", "weight": "500", "tracking": "0px" },
      "headlineSmall":  { "size": "24px", "lineHeight": "32px", "weight": "500", "tracking": "0px" },
      "titleLarge":     { "size": "22px", "lineHeight": "28px", "weight": "500", "tracking": "0px" },
      "titleMedium":    { "size": "16px", "lineHeight": "24px", "weight": "500", "tracking": "0.15px" },
      "titleSmall":     { "size": "14px", "lineHeight": "20px", "weight": "500", "tracking": "0.1px" },
      "bodyLarge":      { "size": "16px", "lineHeight": "24px", "weight": "400", "tracking": "0.5px" },
      "bodyMedium":     { "size": "14px", "lineHeight": "20px", "weight": "400", "tracking": "0.25px" },
      "bodySmall":      { "size": "12px", "lineHeight": "16px", "weight": "400", "tracking": "0.4px" },
      "labelLarge":     { "size": "14px", "lineHeight": "20px", "weight": "500", "tracking": "0.1px" },
      "labelMedium":    { "size": "12px", "lineHeight": "16px", "weight": "500", "tracking": "0.5px" },
      "labelSmall":     { "size": "11px", "lineHeight": "16px", "weight": "500", "tracking": "0.5px" }
    }
  },

  "spacing": {
    "0":   "0px",
    "1":   "4px",
    "2":   "8px",
    "3":   "12px",
    "4":   "16px",
    "5":   "20px",
    "6":   "24px",
    "8":   "32px",
    "10":  "40px",
    "12":  "48px",
    "16":  "64px",
    "20":  "80px",
    "24":  "96px"
  },

  "borderRadius": {
    "none":   "0px",
    "xs":     "4px",
    "sm":     "8px",
    "md":     "12px",
    "lg":     "16px",
    "xl":     "28px",
    "full":   "9999px"
  },

  "elevation": {
    "level0": "none",
    "level1": "0px 1px 2px rgba(0,0,0,0.12)",
    "level2": "0px 2px 6px rgba(0,0,0,0.14)",
    "level3": "0px 4px 8px rgba(0,0,0,0.16)",
    "level4": "0px 6px 10px rgba(0,0,0,0.18)",
    "level5": "0px 8px 12px rgba(0,0,0,0.20)"
  },

  "iconSize": {
    "sm":  "16px",
    "md":  "20px",
    "lg":  "24px",
    "xl":  "32px",
    "2xl": "48px"
  },

  "breakpoints": {
    "compact":  "0px",
    "medium":   "600px",
    "expanded": "840px"
  },

  "motion": {
    "duration": {
      "short1":  "50ms",
      "short2":  "100ms",
      "short3":  "150ms",
      "short4":  "200ms",
      "medium1": "250ms",
      "medium2": "300ms",
      "medium3": "350ms",
      "medium4": "400ms",
      "long1":   "450ms",
      "long2":   "500ms"
    },
    "easing": {
      "standard":          "cubic-bezier(0.2, 0, 0, 1)",
      "standardDecelerate":"cubic-bezier(0, 0, 0, 1)",
      "standardAccelerate":"cubic-bezier(0.3, 0, 1, 1)",
      "emphasized":        "cubic-bezier(0.2, 0, 0, 1)",
      "emphasizedDecelerate":"cubic-bezier(0.05, 0.7, 0.1, 1)",
      "emphasizedAccelerate":"cubic-bezier(0.3, 0, 0.8, 0.15)"
    }
  },

  "components": {
    "button": {
      "filled": {
        "background":   "{color.primary.DEFAULT}",
        "foreground":   "{color.primary.onPrimary}",
        "borderRadius": "{borderRadius.full}",
        "paddingH":     "{spacing.6}",
        "paddingV":     "{spacing.2}",
        "height":       "40px",
        "typography":   "{typography.scale.labelLarge}"
      },
      "tonal": {
        "background":   "{color.secondary.container}",
        "foreground":   "{color.secondary.onContainer}",
        "borderRadius": "{borderRadius.full}"
      },
      "outlined": {
        "background":   "transparent",
        "foreground":   "{color.primary.DEFAULT}",
        "border":       "1px solid {color.background.outline}",
        "borderRadius": "{borderRadius.full}"
      },
      "text": {
        "background":   "transparent",
        "foreground":   "{color.primary.DEFAULT}"
      },
      "whatsapp": {
        "background":   "{color.whatsapp}",
        "foreground":   "#FFFFFF",
        "borderRadius": "{borderRadius.full}"
      }
    },

    "card": {
      "elevated": {
        "background":   "{color.background.surface}",
        "elevation":    "{elevation.level1}",
        "borderRadius": "{borderRadius.md}"
      },
      "filled": {
        "background":   "{color.background.surfaceVariant}",
        "elevation":    "none",
        "borderRadius": "{borderRadius.md}"
      },
      "outlined": {
        "background":   "{color.background.surface}",
        "border":       "1px solid {color.background.outlineVariant}",
        "borderRadius": "{borderRadius.md}"
      }
    },

    "productCard": {
      "imageHeight":  "160px",
      "borderRadius": "{borderRadius.md}",
      "padding":      "{spacing.3}",
      "badge": {
        "available":   { "background": "{color.success.container}", "color": "{color.success.onContainer}" },
        "outOfStock":  { "background": "{color.neutral.200}", "color": "{color.neutral.700}" }
      }
    },

    "chip": {
      "height":       "32px",
      "paddingH":     "{spacing.3}",
      "borderRadius": "{borderRadius.sm}",
      "border":       "1px solid {color.background.outlineVariant}",
      "selectedBg":   "{color.secondary.container}",
      "selectedFg":   "{color.secondary.onContainer}"
    },

    "bottomNavBar": {
      "height":      "80px",
      "background":  "{color.background.surface}",
      "activeColor": "{color.secondary.DEFAULT}",
      "inactiveColor": "{color.neutral.500}"
    },

    "searchBar": {
      "height":       "56px",
      "background":   "{color.background.surfaceVariant}",
      "borderRadius": "{borderRadius.full}",
      "paddingH":     "{spacing.4}"
    },

    "textField": {
      "filled": {
        "background":   "{color.background.surfaceVariant}",
        "borderRadius": "{borderRadius.xs} {borderRadius.xs} 0 0",
        "activeIndicator": "{color.primary.DEFAULT}"
      },
      "outlined": {
        "background":   "transparent",
        "border":       "1px solid {color.background.outline}",
        "focusBorder":  "2px solid {color.primary.DEFAULT}",
        "borderRadius": "{borderRadius.xs}"
      }
    }
  },

  "vendor": {
    "verificationBadge": {
      "pending":  { "color": "{color.warning.DEFAULT}", "bg": "{color.warning.container}" },
      "verified": { "color": "{color.success.DEFAULT}", "bg": "{color.success.container}" }
    }
  },

  "payment": {
    "flutterwave": { "brand": "#F5A623", "label": "Pay with Flutterwave" },
    "paystack":    { "brand": "#00C3F7", "label": "Pay with Paystack" }
  }
} as const;
