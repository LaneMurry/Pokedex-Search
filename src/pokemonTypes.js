// Pokemon type data shared by the type UI and the theme system.
//
// TYPE_COLORS powers the theme palettes (see theme.js) and typeTextColor picks
// readable label text. TYPE_IDS + typeImageUrl point at the official type
// cards/symbols served by the PokeAPI sprites repo, so the type UI needs no
// vendored icon paths.

// Standard Pokemon type colors.
export const TYPE_COLORS = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
};

// PokeAPI's numeric type IDs, in canonical order (matches /api/v2/type/).
// Used to build the artwork URLs below when only a type name is available.
export const TYPE_IDS = {
  normal: 1,
  fighting: 2,
  flying: 3,
  poison: 4,
  ground: 5,
  rock: 6,
  bug: 7,
  ghost: 8,
  steel: 9,
  fire: 10,
  water: 11,
  grass: 12,
  electric: 13,
  psychic: 14,
  ice: 15,
  dragon: 16,
  dark: 17,
  fairy: 18,
};

// Official type artwork from the PokeAPI sprites repo. `small` returns the
// 60x60 symbol (for compact spots like the theme menu); otherwise the 200x40
// Scarlet/Violet type card (name + symbol).
export function typeImageUrl(id, small = false) {
  const base =
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-ix/scarlet-violet';
  return `${base}${small ? '/small' : ''}/${id}.png`;
}

// Choose a readable text color for a chip filled with the given background.
export function typeTextColor(hex) {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16) / 255;
  const g = parseInt(c.slice(2, 4), 16) / 255;
  const b = parseInt(c.slice(4, 6), 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.6 ? '#08110f' : '#ffffff';
}
