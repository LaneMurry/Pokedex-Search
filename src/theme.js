import { createTheme } from '@mui/material';
import { TYPE_COLORS, typeTextColor } from './pokemonTypes.js';

// Shared dark drop shadow beneath the search and random buttons.
const BUTTON_SHADOW = '0 6px 16px rgba(0, 0, 0, 0.55), 0 2px 4px rgba(0, 0, 0, 0.45)';
const BUTTON_SHADOW_HOVER = '0 10px 22px rgba(0, 0, 0, 0.60), 0 3px 6px rgba(0, 0, 0, 0.50)';

// Default palette: dark blue-teal base with teal/cyan accents.
const DEFAULT_COLORS = {
  bg: '#06191f',
  paper: '#0b2a33',
  primary: '#2ee6c8',
  secondary: '#6fd3ff',
  text: '#d6f5f0',
  muted: '#7fa9b0',
  line: '#1c4a52',
  primaryContrast: '#041f1a',
  secondaryContrast: '#062028',
  titleColor: '#ffffff',
  titleShadow: '0 0 12px rgba(255, 255, 255, 0.35)',
  // Search field styling (see App.jsx).
  inputBackground: 'linear-gradient(135deg, rgba(255, 255, 255, 0.30) 0%, rgba(184, 198, 219, 0.62) 100%)',
  inputTextColor: '#f2f8ff',
  inputPlaceholderColor: '#bcd6de',
  inputLabelColor: '#cfe6ee',
  inputLabelFocusedColor: '#2ee6c8',
  inputBorderColor: 'rgba(214, 245, 240, 0.55)',
  inputBorderHoverColor: 'rgba(214, 245, 240, 0.85)',
  inputBorderFocusedColor: '#2ee6c8',
  // Dark at the bottom, fading up into a lighter greenish tone toward the top.
  pageGradient: 'linear-gradient(180deg, #17594a 0%, #0a2b2b 50%, #06191f 100%)',
  // Faint teal tint for the halftone dot screen layered over the page gradient.
  halftone: 'rgba(46, 230, 200, 0.12)',
  // Faint green tint plus a soft inner glow reads as a Game Boy screen.
  cardGradient: 'linear-gradient(180deg, #12352e 0%, #0a2622 100%)',
  glow: 'rgba(46, 230, 200, 0.10)',
  // Soft accent glow cast beneath the info card for separation from the page.
  cardGlow: 'rgba(46, 230, 200, 0.30)',
  divider: 'rgba(46, 230, 200, 0.65)',
  // Search = classic Game Boy (DMG) green.
  // Random = warm yellow → orange, so the pair reads as two distinct buttons.
  searchGradient: buttonGradient('#7fb31c'),
  searchGradientHover: buttonGradientHover('#7fb31c'),
  randomGradient: buttonGradient('#ee8130'),
  randomGradientHover: buttonGradientHover('#ee8130'),
  // Identical dark drop shadow under both buttons.
  buttonShadow: BUTTON_SHADOW,
  buttonShadowHover: BUTTON_SHADOW_HOVER,
};

// Standard system sans for body copy...
const sansStack =
  "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

// ...and a pixel face reserved for the page title ("VT323", loaded in index.html).
const pixelFont = "'VT323', ui-monospace, monospace";

// --- small hex color helpers ---------------------------------------------

function parseHex(hex) {
  const c = hex.replace('#', '');
  return {
    r: parseInt(c.slice(0, 2), 16),
    g: parseInt(c.slice(2, 4), 16),
    b: parseInt(c.slice(4, 6), 16),
  };
}

function toHex({ r, g, b }) {
  const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)));
  return `#${[r, g, b].map((n) => clamp(n).toString(16).padStart(2, '0')).join('')}`;
}

// Blend two colors; t=0 → a, t=1 → b.
function mix(a, b, t) {
  const ca = parseHex(a);
  const cb = parseHex(b);
  return toHex({
    r: ca.r + (cb.r - ca.r) * t,
    g: ca.g + (cb.g - ca.g) * t,
    b: ca.b + (cb.b - ca.b) * t,
  });
}

// Move a color toward white.
function lighten(hex, t) {
  return mix(hex, '#ffffff', t);
}

// Smooth two-stop button gradient from a single base color: a lighter top-left
// fading into a darker bottom-right.
function buttonGradient(base) {
  return `linear-gradient(135deg, ${lighten(base, 0.18)} 0%, ${mix(base, '#000000', 0.28)} 100%)`;
}

function buttonGradientHover(base) {
  return `linear-gradient(135deg, ${lighten(base, 0.30)} 0%, ${mix(base, '#000000', 0.12)} 100%)`;
}

function withAlpha(hex, alpha) {
  const { r, g, b } = parseHex(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function hexToHsl(hex) {
  const { r, g, b } = parseHex(hex);
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;

  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) {
      h = (gn - bn) / d + (gn < bn ? 6 : 0);
    } else if (max === gn) {
      h = (bn - rn) / d + 2;
    } else {
      h = (rn - gn) / d + 4;
    }
    h *= 60;
  }
  return { h, s, l };
}

function hslToHex({ h, s, l }) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) {
    r = c; g = x;
  } else if (h < 120) {
    r = x; g = c;
  } else if (h < 180) {
    g = c; b = x;
  } else if (h < 240) {
    g = x; b = c;
  } else if (h < 300) {
    r = x; b = c;
  } else {
    r = c; b = x;
  }

  return toHex({ r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 });
}

// Lighten a color while nudging its hue, for a soft companion tone.
function shiftLighten(hex, hueDelta, lightDelta) {
  const { h, s, l } = hexToHsl(hex);
  return hslToHex({
    h: (h + hueDelta + 360) % 360,
    s: Math.min(1, s * 1.05),
    l: Math.min(0.9, l + lightDelta),
  });
}

// Build a palette set from a single type color seed. The cards and UI stay
// dark (a deep tint of the type color) so their text stays readable, while the
// page background takes on the type color itself.
function colorsFromSeed(seed) {
  const dark = mix('#040c0f', seed, 0.12);
  const paper = mix(dark, seed, 0.22);
  const line = mix(dark, seed, 0.5);
  const text = lighten(mix(seed, '#ffffff', 0.55), 0.35);
  const muted = mix(text, dark, 0.45);
  const primary = seed;
  const secondary = lighten(seed, 0.4);

  // Page background: the type color softening into a lighter, slightly
  // hue-shifted version of itself.
  const pageSoft = shiftLighten(seed, 20, 0.22);
  const pageGradient = `linear-gradient(180deg, ${seed} 0%, ${mix(seed, pageSoft, 0.5)} 55%, ${pageSoft} 100%)`;

  // Readable heading color for the bright type-colored page.
  const titleColor = typeTextColor(seed);
  const titleShadow =
    titleColor === '#ffffff'
      ? '0 0 12px rgba(255, 255, 255, 0.35)'
      : '0 0 10px rgba(255, 255, 255, 0.45)';

  // Search field: a light frosted fill with dark text reads well on any of the
  // medium-to-bright type-colored pages. The label sits on the page itself, so
  // it uses the page-contrast color.
  const inputText = mix('#000000', seed, 0.35);
  const inputBackground = `linear-gradient(135deg, ${withAlpha('#ffffff', 0.72)} 0%, ${withAlpha(lighten(seed, 0.85), 0.86)} 100%)`;
  const inputEdge = mix('#000000', seed, 0.45);

  // Two distinct button hues derived from the seed: search shifts cool,
  // random shifts warm. Both are darkened so white label text stays readable
  // and the buttons pop against the bright type-colored page.
  const searchBase = shiftLighten(seed, -35, -0.20);
  const randomBase = shiftLighten(seed, 40, -0.20);

  return {
    bg: seed,
    paper,
    primary,
    secondary,
    primaryContrast: mix(primary, '#000000', 0.8),
    secondaryContrast: mix(secondary, '#000000', 0.8),
    // Title sits on the bright type-colored page, so pick a readable color for
    // the heading rather than always white.
    titleColor,
    titleShadow,
    inputBackground,
    inputTextColor: inputText,
    inputPlaceholderColor: mix(inputText, '#ffffff', 0.45),
    inputLabelColor: titleColor,
    inputLabelFocusedColor: titleColor,
    inputBorderColor: withAlpha(inputEdge, 0.28),
    inputBorderHoverColor: withAlpha(inputEdge, 0.45),
    inputBorderFocusedColor: mix(seed, '#000000', 0.35),
    text,
    muted,
    line,
    pageGradient,
    // Halftone dots contrast with the bright type-colored page: dark dots on
    // light themes, light dots on darker ones (titleColor already resolves this).
    halftone: withAlpha(titleColor, 0.10),
    cardGradient: `linear-gradient(180deg, ${mix(paper, seed, 0.14)} 0%, ${mix(paper, '#000000', 0.15)} 100%)`,
    glow: withAlpha(seed, 0.14),
    // Neutral white under-glow for type themes (kept off the default palette).
    cardGlow: withAlpha('#ffffff', 0.35),
    divider: withAlpha(seed, 0.65),
    // Two distinct buttons: search is a cool-shifted hue, random a warm-shifted
    // one (see searchBase/randomBase above).
    searchGradient: buttonGradient(searchBase),
    searchGradientHover: buttonGradientHover(searchBase),
    randomGradient: buttonGradient(randomBase),
    randomGradientHover: buttonGradientHover(randomBase),
    // Identical dark drop shadow under both buttons.
    buttonShadow: BUTTON_SHADOW,
    buttonShadowHover: BUTTON_SHADOW_HOVER,
  };
}

// Create the MUI theme. Called with no type for the site default, or with a
// Pokemon type name (e.g. 'fire') for a themed variant.
export function createAppTheme(typeName) {
  const seed = typeName && TYPE_COLORS[typeName];
  const colors = seed ? colorsFromSeed(seed) : DEFAULT_COLORS;

  const theme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: colors.primary,
        contrastText: colors.primaryContrast,
      },
      secondary: {
        main: colors.secondary,
        contrastText: colors.secondaryContrast,
      },
      background: {
        default: colors.bg,
        paper: colors.paper,
      },
      text: {
        primary: colors.text,
        secondary: colors.muted,
      },
      divider: colors.line,
    },
    shape: {
      // Square corners everywhere for the pixel look.
      borderRadius: 0,
    },
    typography: {
      fontFamily: sansStack,
      h3: {
        // Pixel title. Font size is set responsively in App.jsx.
        fontFamily: pixelFont,
        fontWeight: 400,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        lineHeight: 1.15,
        color: colors.titleColor,
        textShadow: colors.titleShadow,
      },
      h4: {
        fontWeight: 700,
        textTransform: 'capitalize',
        letterSpacing: '0.02em',
      },
      h6: {
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        fontSize: '0.95rem',
      },
      button: {
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundImage: `radial-gradient(${colors.halftone} 1px, transparent 1.5px), ${colors.pageGradient}`,
            backgroundSize: '12px 12px, 100% 100%',
            backgroundAttachment: 'fixed',
            minHeight: '100vh',
          },
        },
      },
      MuiCard: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            position: 'relative',
            border: `2px solid ${colors.line}`,
            backgroundColor: 'transparent',
            backgroundImage: colors.cardGradient,
            boxShadow: `0 0 8px ${colors.cardGlow}, 0 6px 20px ${colors.cardGlow}, inset 0 0 0 4px rgba(0, 0, 0, 0.35), inset 0 0 60px ${colors.glow}`,
            // Subtle horizontal scanlines over the whole screen.
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              backgroundImage:
                'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.16) 0px, rgba(0, 0, 0, 0.16) 1px, rgba(0, 0, 0, 0) 1px, rgba(0, 0, 0, 0) 3px)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            fontWeight: 600,
            letterSpacing: '0.03em',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 0,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 0,
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: colors.divider,
            borderBottomWidth: 2,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 0,
          },
        },
      },
    },
    // Extra values consumed directly in App.jsx for the custom buttons and
    // the search field.
    custom: {
      pageGradient: colors.pageGradient,
      searchGradient: colors.searchGradient,
      searchGradientHover: colors.searchGradientHover,
      randomGradient: colors.randomGradient,
      randomGradientHover: colors.randomGradientHover,
      buttonShadow: colors.buttonShadow,
      buttonShadowHover: colors.buttonShadowHover,
      inputBackground: colors.inputBackground,
      inputTextColor: colors.inputTextColor,
      inputPlaceholderColor: colors.inputPlaceholderColor,
      inputLabelColor: colors.inputLabelColor,
      inputLabelFocusedColor: colors.inputLabelFocusedColor,
      inputBorderColor: colors.inputBorderColor,
      inputBorderHoverColor: colors.inputBorderHoverColor,
      inputBorderFocusedColor: colors.inputBorderFocusedColor,
    },
  });

  return theme;
}
