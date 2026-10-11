import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  CardMedia, 
  Grid,
  Box,
  CircularProgress,
  Alert,
  Divider,
  Chip
} from '@mui/material';

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

  return (
    <Container component="main" maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" align="center" gutterBottom>
        Pokemon Explorer
      </Typography>
      
      <Typography variant="body1" align="center" color="text.secondary" gutterBottom>
        How it works: We make HTTP requests to the PokeAPI endpoint and display the JSON response
      </Typography>

      {/* Search Form - User can search by Pokemon name or ID */}
      <Box component="form" role="search" onSubmit={handleSearch} sx={{ display: 'flex', gap: 2, mb: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
        <TextField
          label="Enter Pokemon name or ID"
          variant="outlined"
          type="search"
          required
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          sx={{ width: '300px' }}
          placeholder="e.g., pikachu, charizard, 25"
        />
        <Button type="submit" variant="contained" size="large">
          Search Pokemon
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
        <Card elevation={4} sx={{ borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              {pokemonData.sprites.front_default && (
                <CardMedia
                  component="img"
                  image={pokemonData.sprites.front_default}
                  alt={`Front sprite of ${pokemonData.name}`}
                  sx={{ width: '100%', height: 250, objectFit: 'contain', p: 2 }}
                />
              )}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
                {pokemonData.sprites.front_shiny && (
                  <img
                    src={pokemonData.sprites.front_shiny}
                    alt={`Shiny sprite of ${pokemonData.name}`}
                    style={{ width: 100, height: 100 }}
                  />
                )}
                {pokemonData.sprites.back_default && (
                  <img
                    src={pokemonData.sprites.back_default}
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
                
                <Typography variant="h6" component="h3" gutterBottom>
                  Type(s):
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  {pokemonData.types.map((typeInfo) => (
                    <Chip
                      key={typeInfo.type.name}
                      label={typeInfo.type.name.toUpperCase()}
                      color="secondary"
                    />
                  ))}
                </Box>
                
                <Typography variant="h6" component="h3" gutterBottom>
                  Species:
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {pokemonData.species.name}
                </Typography>
                
                <Typography variant="h6" component="h3" gutterBottom>
                  Abilities:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  {pokemonData.abilities.map((abilityInfo) => (
                    <Chip
                      key={abilityInfo.ability.name}
                      label={abilityInfo.ability.name.replaceAll('-', ' ')}
                      variant="outlined"
                    />
                  ))}
                </Box>

                <Typography variant="h6" component="h3" gutterBottom>
                  Base Stats:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                  {pokemonData.stats.map((statInfo) => (
                    <Box key={statInfo.stat.name} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body2" sx={{ minWidth: 120, textTransform: 'capitalize' }}>
                        {statInfo.stat.name.replaceAll('-', ' ')}
                      </Typography>
                      <Chip label={statInfo.base_stat} size="small" color="primary" variant="outlined" />
                    </Box>
                  ))}
                </Box>

                <Typography variant="h6" component="h3" gutterBottom>
                  Game Indices (Versions):
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  {pokemonData.game_indices.slice(0, 6).map((gameInfo) => (
                    <Chip
                      key={gameInfo.version.name}
                      label={gameInfo.version.name.replaceAll('-', ' ')}
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>

                <Typography variant="h6" component="h3" gutterBottom>
                  Moves (First 10):
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  {pokemonData.moves.slice(0, 10).map((moveInfo) => (
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
  );
}

export default App
