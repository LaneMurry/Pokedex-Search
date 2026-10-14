# Pokédex Search

A small Pokédex web app built with **React + Vite + Material UI**. Type a Pokémon
name or national dex ID and it fetches the details from
[PokéAPI](https://pokeapi.co) and renders them as a clean, responsive card.

<p align="left">
  <img alt="React" src="https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white" />
  <img alt="MUI" src="https://img.shields.io/badge/MUI-9-007fff?logo=mui&logoColor=white" />
  <img alt="PokéAPI" src="https://img.shields.io/badge/Data-Pok%C3%A9API-ee1515" />
</p>

## Features

- **Search by name or ID** — try `pikachu`, `charizard`, or `25`.
- **Sprite gallery** — front, shiny, and back sprites when available.
- **Rich detail view** — ID, height, weight, base XP, types, species, abilities,
  base stats, the games it appears in, and its first 10 moves.
- **Loading & error states** — a spinner while fetching and a friendly
  "Try again" alert when something goes wrong.
- **Resilient requests** — in-flight fetches are cancelled with an
  `AbortController`, so a slow earlier search can never overwrite a newer one.
- **Accessible** — semantic landmarks, an `aria-live` status region that
  announces results/failures, and labelled controls and images.
- **Content-Security-Policy** — a strict CSP is injected into production builds
  at build time, and a retro pixel Game Boy–style theme (with selectable
  per-Pokémon-type color themes) ties the UI together.

## Tech stack

| Layer      | Choice                                       |
| ---------- | -------------------------------------------- |
| UI         | React 19                                     |
| Build tool | Vite 8 (`@vitejs/plugin-react`)              |
| Components | Material UI 9 + Emotion                      |
| Data       | [PokéAPI](https://pokeapi.co) (public, free) |
| Linting    | ESLint 10 + `eslint-plugin-react-hooks`      |

## Getting started

```bash
# install dependencies
npm install

# start the dev server with hot module reloading
npm run dev
```

### Other commands

```bash
npm run build     # production build into dist/
npm run preview   # preview the production build locally
npm run lint      # run ESLint over the project
```

## How it works

1. `src/App.jsx` holds the search form and result card.
2. Submitting the form updates `pokemonName`, which triggers a `useEffect` that
   fetches `https://pokeapi.co/api/v2/pokemon/<name-or-id>`.
3. The JSON response is stored in state and rendered with MUI components.
4. If the request to PokéAPI fails, the status code (404, 429, 5xx, …) is mapped
   to a helpful message, and the **Try again** button re-runs the fetch.

The production CSP (see `vite.config.js`) restricts scripts to same-origin,
allows the styles Emotion injects, and permits images and API calls only from
`pokeapi.co` and `raw.githubusercontent.com`.

## Project structure

```
learning-react/
├─ public/              # static assets (favicon, self-hosted VT323 font)
├─ src/
│  ├─ App.jsx           # search form, data fetching, result card
│  ├─ theme.js          # MUI theme: default Game Boy palette + type themes
│  ├─ pokemonTypes.js   # type colors/ids + official artwork URLs
│  └─ main.jsx          # app entry point
├─ index.html           # HTML shell (title: Pokémon Explorer)
├─ vite.config.js       # Vite config + production CSP plugin
└─ eslint.config.js     # ESLint flat config
```

## Notes

- This is a learning project focused on React data fetching, hooks, and MUI.
