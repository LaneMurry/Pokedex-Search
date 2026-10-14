import { useState, useEffect, useMemo } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Card,
  CardContent,
  Grid,
  Box,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  ThemeProvider
} from '@mui/material';
import { TYPE_COLORS, TYPE_IDS, typeImageUrl } from './pokemonTypes.js';
import { createAppTheme } from './theme.js';

// localStorage key for the chosen theme (a Pokemon type name, or absent = default)
const THEME_KEY = 'pokemon-theme';

// Sorted list of type names available as themes
const THEME_TYPES = Object.keys(TYPE_COLORS).sort();

// Highest Pokemon ID PokeAPI currently knows about (Gen 1-9)
const MAX_POKEMON_ID = 1025;

// Shared "pixel button" look: the page title's pixel font (VT323; see
// index.html), a white label, square corners and a dark text shadow. Gradients
// and shadows stay per button.
const PIXEL_BUTTON_BASE = {
  fontFamily: "'VT323', ui-monospace, monospace",
  fontWeight: 400,
  fontSize: '1.15rem',
  letterSpacing: '0.06em',
  borderRadius: '2px',
  color: '#ffffff',
  textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
};

// Turn an HTTP status code into a message a human can understand.
// PokeAPI is a free public API, so it can occasionally be slow (429) or down (5xx).
function friendlyStatusError(status) {
  if (status === 404) {
    return 'Pokemon not found! Try another name or ID.';
  }
  if (status === 429) {
    return 'PokeAPI is busy — please wait a moment and try again.';
  }
  if (status >= 500) {
    return 'PokeAPI is unavailable right now. Please try again later.';
  }
  return `Something went wrong (HTTP ${status}).`;
}

function App() {
  const [pokemonName, setPokemonName] = useState('pichu');
  const [searchInput, setSearchInput] = useState('pichu');
  const [pokemonData, setPokemonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Bumped by the "Try again" button to re-run the fetch for the same Pokemon
  const [attempt, setAttempt] = useState(0);

  // Selected theme: a Pokemon type name, or null for the site default.
  // Restored from localStorage on load, validated so a stale/garbage value
  // (or storage being unavailable) just falls back to the default theme.
  const [themeType, setThemeType] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      return saved && Object.hasOwn(TYPE_COLORS, saved) ? saved : null;
    } catch {
      return null;
    }
  });
  // Element the theme menu is anchored to (null = menu closed)
  const [themeMenuAnchor, setThemeMenuAnchor] = useState(null);

  // Persist the choice so it survives a reload. Wrapped in try/catch because
  // some browsers block localStorage (private mode, disabled storage).
  useEffect(() => {
    try {
      if (themeType) {
        localStorage.setItem(THEME_KEY, themeType);
      } else {
        localStorage.removeItem(THEME_KEY);
      }
    } catch {
      // Ignore: theme just won't persist, which is safe.
    }
  }, [themeType]);

  // Rebuild the theme whenever the chosen type changes.
  const theme = useMemo(() => createAppTheme(themeType), [themeType]);

  // Fetch Pokemon data from the PokeAPI when pokemonName changes
  // useEffect runs when the component mounts and whenever pokemonName updates
  useEffect(() => {
    // AbortController lets us cancel the in-flight request if the effect
    // re-runs (e.g. the user searches again) or the component unmounts,
    // so an outdated response can never overwrite a newer one.
    const controller = new AbortController();

    const fetchPokemon = async () => {
      setLoading(true); // Show loading spinner
      setError(null);   // Clear any previous errors
      
      try {
        // Build the API URL with the pokemon name (lowercase and URL-encoded
        // so special characters can't corrupt the request path)
        const apiUrl = `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(pokemonName.toLowerCase())}`;
        
        // Make the HTTP GET request to the PokeAPI
        const response = await fetch(apiUrl, { signal: controller.signal });
        
        // Check if the request was successful
        if (!response.ok) {
          throw new Error(friendlyStatusError(response.status));
        }
        
        // Parse the JSON response
        const data = await response.json();
        
        // Update state with the fetched Pokemon data
        setPokemonData(data);
      } catch (err) {
        // Ignore aborts: they just mean a newer request took over
        if (err.name === 'AbortError') return;

        // When fetch can't reach the network at all it throws a TypeError,
        // so mention the connection rather than showing raw browser text
        if (err instanceof TypeError) {
          setError('Cannot reach PokeAPI — check your internet connection and try again.');
        } else {
          setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
        }
        setPokemonData(null);
      } finally {
        // Don't clear the spinner for a request that was superseded/unmounted,
        // otherwise an aborted request can hide the spinner for the current one.
        if (!controller.signal.aborted) setLoading(false); // Hide loading spinner
      }
    };

    fetchPokemon();

    // Cancel the request if the effect re-runs or the component unmounts
    return () => controller.abort();
  }, [pokemonName, attempt]); // Re-run on a new Pokemon, or when "Try again" is clicked

  // Handle search form submission
  // When user submits, update the pokemonName which triggers the API call
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setPokemonName(searchInput.trim());
    }
  };

  // Re-run the fetch for the same Pokemon after a temporary failure
  const handleRetry = () => {
    setAttempt((prev) => prev + 1);
  };

  // Show a random Pokemon. Changing pokemonName triggers the fetch effect,
  // and bumping attempt forces a refetch even if the same ID comes up twice.
  const handleRandom = () => {
    const id = Math.floor(Math.random() * MAX_POKEMON_ID) + 1;
    setSearchInput(String(id)); // keep the text field in sync
    setPokemonName(String(id)); // triggers the existing fetch effect
    setAttempt((prev) => prev + 1);
  };

  // Theme menu: open/close and apply the chosen type (null = default)
  const openThemeMenu = (e) => setThemeMenuAnchor(e.currentTarget);
  const closeThemeMenu = () => setThemeMenuAnchor(null);
  const chooseTheme = (type) => {
    setThemeType(type);
    closeThemeMenu();
  };

  // Text announced to screen readers when search results change (see live region below)
  const statusMessage = error && !loading
    ? error
    : pokemonData && !loading
      ? `Showing ${pokemonData.name}`
      : '';

  // Friendly display values — PokeAPI can return null for some fields
  const heightText = pokemonData?.height != null ? `${pokemonData.height / 10} m` : '—';
  const weightText = pokemonData?.weight != null ? `${pokemonData.weight / 10} kg` : '—';
  const baseXpText = pokemonData?.base_experience ?? '—';

  // Shared style for the search and random buttons: one simple format in every
  // theme — pixel font, white label, a smooth two-stop gradient and a dark drop
  // shadow that deepens on hover.
  const buttonSx = (gradient, gradientHover) => ({
    ...PIXEL_BUTTON_BASE,
    background: gradient,
    boxShadow: theme.custom.buttonShadow,
    '&:hover': {
      background: gradientHover,
      boxShadow: theme.custom.buttonShadowHover,
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container component="main" maxWidth="md" sx={{ py: 4 }}>
      {/* Theme picker: fixed top-right button that opens a menu of type themes */}
      <Box sx={{ position: 'fixed', top: 12, right: 12, zIndex: 1200 }}>
        <Button
          onClick={openThemeMenu}
          aria-haspopup="true"
          aria-expanded={Boolean(themeMenuAnchor)}
          aria-controls={themeMenuAnchor ? 'theme-menu' : undefined}
          sx={{
            ...PIXEL_BUTTON_BASE,
            background:
              'linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0%, rgba(0, 0, 0, 0.35) 100%)',
            border: '1px solid rgba(214, 245, 240, 0.4)',
            '&:hover': {
              background:
                'linear-gradient(135deg, rgba(255, 255, 255, 0.28) 0%, rgba(0, 0, 0, 0.45) 100%)',
            },
          }}
        >
          theme
        </Button>
        <Menu
          id="theme-menu"
          anchorEl={themeMenuAnchor}
          open={Boolean(themeMenuAnchor)}
          onClose={closeThemeMenu}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem selected={themeType === null} onClick={() => chooseTheme(null)}>
            <ListItemIcon sx={{ minWidth: 34 }}>
              <Box
                sx={{
                  width: 18,
                  height: 18,
                  borderRadius: '2px',
                  background: 'linear-gradient(135deg, #9bbc0f 0%, #0f380f 100%)',
                }}
              />
            </ListItemIcon>
            <ListItemText primary="Default" />
          </MenuItem>
          {THEME_TYPES.map((type) => (
            <MenuItem key={type} selected={themeType === type} onClick={() => chooseTheme(type)}>
              <ListItemIcon sx={{ minWidth: 34 }}>
                <img src={typeImageUrl(TYPE_IDS[type], true)} alt="" width={20} height={20} />
              </ListItemIcon>
              <ListItemText primary={type} sx={{ textTransform: 'capitalize' }} />
            </MenuItem>
          ))}
        </Menu>
      </Box>
      <Typography
        variant="h3"
        component="h1"
        align="center"
        gutterBottom
        sx={{ fontSize: { xs: '1.9rem', sm: '2.6rem', md: '3.2rem' } }}
      >
        Pokemon Explorer
      </Typography>

      {/* Search Form - User can search by Pokemon name or ID */}
      <Box component="form" role="search" onSubmit={handleSearch} sx={{ display: 'flex', gap: 2, mt: 5, mb: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
        <TextField
          label="Enter Pokemon name or ID"
          variant="outlined"
          type="search"
          required
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          sx={{
            width: '300px',
            '& .MuiOutlinedInput-root': {
              // Themed translucent gradient so the page background shows
              // through; derived per theme for contrast (see theme.js).
              background: theme.custom.inputBackground,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.custom.inputBorderColor,
                // MUI nudges this fieldset up 5px for the label notch, which
                // leaves a gap above the background. Align it with the field
                // so the gradient meets the border.
                top: 0,
              },
              // Drop the notch MUI cuts into the top border for the label,
              // since the label now sits above the box, not on the border.
              '& .MuiOutlinedInput-notchedOutline legend': {
                display: 'none',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.custom.inputBorderHoverColor,
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.custom.inputBorderFocusedColor,
              },
            },
            // Field text stays readable on the themed translucent gradient.
            '& .MuiInputBase-input': {
              color: theme.custom.inputTextColor,
            },
            '& .MuiInputBase-input::placeholder': {
              color: theme.custom.inputPlaceholderColor,
              opacity: 1,
            },
            // Sit the label above the box instead of on its border. Both the
            // resting and shrunk states use the same transform so it never
            // jumps when the field gains or loses focus.
            '& .MuiInputLabel-root': {
              color: theme.custom.inputLabelColor,
              transform: 'translate(0, -28px) scale(1)',
            },
            '& .MuiInputLabel-root.MuiInputLabel-shrink': {
              transform: 'translate(0, -28px) scale(1)',
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: theme.custom.inputLabelFocusedColor,
            },
          }}
          placeholder="e.g., pikachu, charizard, 25"
        />
        <Button
          type="submit"
          variant="contained"
          size="large"
          sx={buttonSx(theme.custom.searchGradient, theme.custom.searchGradientHover)}
        >
          search
        </Button>
        <Button
          type="button"
          variant="contained"
          size="large"
          onClick={handleRandom}
          disabled={loading}
          sx={{
            ...buttonSx(theme.custom.randomGradient, theme.custom.randomGradientHover),
            '&.Mui-disabled': {
              color: 'rgba(255, 255, 255, 0.6)',
            },
          }}
        >
          random
        </Button>
      </Box>

      {/* Visually hidden live region: announces search results/failures to
          screen readers without changing the visible layout */}
      <Box
        role="status"
        aria-live="polite"
        sx={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {statusMessage}
      </Box>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress aria-label="Loading Pokemon data" />
        </Box>
      )}

      {/* Error State */}
      {error && !loading && (
        <Alert
          severity="error"
          sx={{ mb: 4 }}
          action={
            <Button color="inherit" size="small" onClick={handleRetry}>
              Try again
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Pokemon Data Display */}
      {pokemonData && !loading && (
        <Card>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              {pokemonData.sprites?.front_default && (
                <img
                  src={pokemonData.sprites?.front_default}
                  alt={`Front sprite of ${pokemonData.name}`}
                  style={{ width: '100%', height: 250, objectFit: 'contain', padding: 8 }}
                />
              )}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
                {pokemonData.sprites?.front_shiny && (
                  <img
                    src={pokemonData.sprites?.front_shiny}
                    alt={`Shiny sprite of ${pokemonData.name}`}
                    style={{ width: 100, height: 100 }}
                  />
                )}
                {pokemonData.sprites?.back_default && (
                  <img
                    src={pokemonData.sprites?.back_default}
                    alt={`Back sprite of ${pokemonData.name}`}
                    style={{ width: 100, height: 100 }}
                  />
                )}
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <CardContent>
                <Typography variant="h4" component="h2" gutterBottom sx={{ textTransform: 'capitalize' }}>
                  {pokemonData.name}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip label={`ID: #${pokemonData.id}`} color="primary" />
                  <Chip label={`Height: ${heightText}`} variant="outlined" />
                  <Chip label={`Weight: ${weightText}`} variant="outlined" />
                  <Chip label={`Base XP: ${baseXpText}`} variant="outlined" />
                </Box>
                
                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" component="h3" gutterBottom>
                  Type(s):
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  {(pokemonData.types ?? []).map((typeInfo) => {
                    const name = typeInfo.type.name;
                    // Prefer the id from the API's own URL; fall back to the
                    // name map for safety.
                    const id = typeInfo.type.url.match(/\/(\d+)\/?$/)?.[1] ?? TYPE_IDS[name];
                    return (
                      <img
                        key={name}
                        src={typeImageUrl(id)}
                        alt={name}
                        height={40}
                        style={{ height: 40, width: 'auto' }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    );
                  })}
                </Box>
                
                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" component="h3" gutterBottom>
                  Species:
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {pokemonData.species?.name}
                </Typography>
                
                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" component="h3" gutterBottom>
                  Abilities:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  {(pokemonData.abilities ?? []).map((abilityInfo) => (
                    <Chip
                      key={abilityInfo.ability.name}
                      label={abilityInfo.ability.name.replaceAll('-', ' ')}
                      variant="outlined"
                    />
                  ))}
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" component="h3" gutterBottom>
                  Base Stats:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                  {(pokemonData.stats ?? []).map((statInfo) => (
                    <Box key={statInfo.stat.name} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body2" sx={{ minWidth: 120, textTransform: 'capitalize' }}>
                        {statInfo.stat.name.replaceAll('-', ' ')}
                      </Typography>
                      <Chip label={statInfo.base_stat} size="small" color="primary" variant="outlined" />
                    </Box>
                  ))}
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" component="h3" gutterBottom>
                  Game Indices (Versions):
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  {(pokemonData.game_indices ?? []).slice(0, 6).map((gameInfo) => (
                    <Chip
                      key={gameInfo.version.name}
                      label={gameInfo.version.name.replaceAll('-', ' ')}
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" component="h3" gutterBottom>
                  Moves (First 10):
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  {(pokemonData.moves ?? []).slice(0, 10).map((moveInfo) => (
                    <Chip
                      key={moveInfo.move.name}
                      label={moveInfo.move.name.replaceAll('-', ' ')}
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
              </CardContent>
            </Grid>
          </Grid>
        </Card>
      )}
    </Container>
    </ThemeProvider>
  );
}

export default App
