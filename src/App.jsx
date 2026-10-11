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

function App() {
  const [pokemonName, setPokemonName] = useState('pichu');
  const [searchInput, setSearchInput] = useState('pichu');
  const [pokemonData, setPokemonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
          throw new Error('Pokemon not found! Try another name or ID.');
        }
        
        // Parse the JSON response
        const data = await response.json();
        
        // Update state with the fetched Pokemon data
        setPokemonData(data);
      } catch (err) {
        // Ignore aborts: they just mean a newer request took over
        if (err.name === 'AbortError') return;
        setError(err.message);
        setPokemonData(null);
      } finally {
        setLoading(false); // Hide loading spinner
      }
    };

    fetchPokemon();

    // Cancel the request if the effect re-runs or the component unmounts
    return () => controller.abort();
  }, [pokemonName]); // Dependency array: re-run when pokemonName changes

  // Handle search form submission
  // When user submits, update the pokemonName which triggers the API call
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setPokemonName(searchInput.trim());
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" align="center" gutterBottom>
        Pokemon Explorer
      </Typography>
      
      <Typography variant="body1" align="center" color="text.secondary" gutterBottom>
        How it works: We make HTTP requests to the PokeAPI endpoint and display the JSON response
      </Typography>

      {/* Search Form - User can search by Pokemon name or ID */}
      <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 2, mb: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
        <TextField
          label="Enter Pokemon name or ID"
          variant="outlined"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          sx={{ width: '300px' }}
          placeholder="e.g., pikachu, charizard, 25"
        />
        <Button type="submit" variant="contained" size="large">
          Search Pokemon
        </Button>
      </Box>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && !loading && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Pokemon Data Display */}
      {pokemonData && !loading && (
        <Card elevation={4} sx={{ borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <CardMedia
                component="img"
                image={pokemonData.sprites.front_default}
                alt={`${pokemonData.name} front`}
                sx={{ width: '100%', height: 250, objectFit: 'contain', p: 2 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
                {pokemonData.sprites.front_shiny && (
                  <img
                    src={pokemonData.sprites.front_shiny}
                    alt={`${pokemonData.name} shiny`}
                    style={{ width: 100, height: 100 }}
                  />
                )}
                {pokemonData.sprites.back_default && (
                  <img
                    src={pokemonData.sprites.back_default}
                    alt={`${pokemonData.name} back`}
                    style={{ width: 100, height: 100 }}
                  />
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <CardContent>
                <Typography variant="h4" component="h2" gutterBottom sx={{ textTransform: 'capitalize' }}>
                  {pokemonData.name}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip label={`ID: #${pokemonData.id}`} color="primary" />
                  <Chip label={`Height: ${pokemonData.height / 10} m`} variant="outlined" />
                  <Chip label={`Weight: ${pokemonData.weight / 10} kg`} variant="outlined" />
                  <Chip label={`Base XP: ${pokemonData.base_experience}`} variant="outlined" />
                </Box>
                
                <Typography variant="h6" gutterBottom>
                  Type(s):
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  {pokemonData.types.map((typeInfo) => (
                    <Chip
                      key={typeInfo.type.name}
                      label={typeInfo.type.name.toUpperCase()}
                      color="secondary"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  ))}
                </Box>
                
                <Typography variant="h6" gutterBottom>
                  Species:
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {pokemonData.species.name}
                </Typography>
                
                <Typography variant="h6" gutterBottom>
                  Abilities:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  {pokemonData.abilities.map((abilityInfo) => (
                    <Chip
                      key={abilityInfo.ability.name}
                      label={abilityInfo.ability.name.replace('-', ' ')}
                      variant="outlined"
                    />
                  ))}
                </Box>

                <Typography variant="h6" gutterBottom>
                  Base Stats:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                  {pokemonData.stats.map((statInfo) => (
                    <Box key={statInfo.stat.name} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body2" sx={{ minWidth: 120, textTransform: 'capitalize' }}>
                        {statInfo.stat.name.replace('-', ' ')}
                      </Typography>
                      <Chip label={statInfo.base_stat} size="small" color="primary" variant="outlined" />
                    </Box>
                  ))}
                </Box>

                <Typography variant="h6" gutterBottom>
                  Game Indices (Versions):
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  {pokemonData.game_indices.slice(0, 6).map((gameInfo) => (
                    <Chip
                      key={gameInfo.version.name}
                      label={gameInfo.version.name.replace('-', ' ')}
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>

                <Typography variant="h6" gutterBottom>
                  Moves (First 10):
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  {pokemonData.moves.slice(0, 10).map((moveInfo) => (
                    <Chip
                      key={moveInfo.move.name}
                      label={moveInfo.move.name.replace('-', ' ')}
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
