# zshzzz · kinetic exhibit

Personal homepage as a small exhibition: kinetic type installation, terminal apparatus, room-tone vinyl, and two toys.

**Stack:** React · TypeScript · Vite

## Develop

```bash
npm install
npm run dev
```

## Customize

Edit `src/siteData.ts`:

- `kineticLines` — full-bleed type wall
- `hotspots` — exhibition labels on the hero
- `profile` / `manifesto` — short note copy
- `contactLinks` — signal section

## Structure

| Chapter | Content |
|---------|---------|
| Installation | Kinetic type + hotspots |
| Note | Short bio |
| Apparatus | Interactive terminal |
| Sound | Clock + WebAudio vinyl |
| Exhibits | Game of Life + Snake |
| Signal | Contact |

Accent toggle (top-right `·`): **void** (pure mono) / **ink** (acid lime).

## Deploy (GitHub Pages)

```bash
npm run build:pages
```

Publish `docs/` from branch `main`.
