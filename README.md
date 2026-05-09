# M0b
M0b is a full-stack TypeScript application with a React/Vite frontend and an Express backend.
The repository includes API routes for posts, artists, NFTs, community activity, and mock AI/content workflows.

## Deployment status
As of 2026-05-09, deployment is not configured in this repository:
- GitHub Actions workflows: none configured (`.github/workflows` is absent).
- GitHub Actions workflow runs on `main`: none.
- GitHub Deployments: none.
- GitHub Pages: not enabled.
- Current `main` commit verified during status check: `86cc24c422bb59c707a2b86b841932de4708b457`.

This means repository changes are currently pushed to GitHub, but there is no automated CI/CD or hosting target defined yet.

## Repository configuration
### Tech stack
- Frontend: React 18 + Vite 5 (`client/`)
- Backend: Express 4 + Node.js ESM (`server/`)
- Shared contracts/types: `shared/`
- Styling/UI: Tailwind CSS, Radix UI, and related UI utilities
- Tooling: TypeScript, esbuild, drizzle-kit

### Project structure
- `client/`: frontend app and UI components
- `server/`: API server, route registration, and runtime bootstrap
- `shared/`: shared schemas/types used by server and client
- `drizzle.config.ts`: Drizzle configuration
- `vite.config.ts`, `tailwind.config.ts`, `postcss.config.js`, `tsconfig.json`: build and tooling config

### NPM scripts
- `npm run dev`: starts the app in development mode using `tsx server/index.ts`
- `npm run build`: builds frontend assets with Vite, then bundles backend with esbuild into `dist/`
- `npm run start`: runs the production server from `dist/index.js`
- `npm run check`: TypeScript type-check
- `npm run db:push`: applies schema changes via drizzle-kit

### Runtime/build behavior
- Server listen configuration is in `server/index.ts`:
  - Host: `0.0.0.0`
  - Port: `process.env.PORT` (defaults to `5000`)
- Production static assets are served from `dist/public`.
- Backend production entrypoint is `dist/index.js`.

### Repository hygiene
Ignored paths are defined in `.gitignore` and include:
- `node_modules`
- `dist`
- `.DS_Store`
- `server/public`
- `vite.config.ts.*`
- `*.tar.gz`
