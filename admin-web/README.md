# Pehra Admin Portal

The admin portal is a Vite-powered React app. It is configured for deployment
to Vercel from the `admin-web` directory.

## Deploy to Vercel

1. Import the repository in Vercel.
2. Set the project **Root Directory** to `admin-web`.
3. Vercel will use the included `vercel.json` configuration:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add this environment variable for the Production environment:
   - `VITE_API_BASE_URL` = `https://pehra-production.up.railway.app/api`
5. Deploy.

The API must allow requests from the deployed Vercel domain. The current
backend CORS configuration allows cross-origin requests.

## Local development

```bash
npm install
npm run dev
```

To use a different API locally, copy `.env.example` to `.env.local` and
change `VITE_API_BASE_URL`.

## Production check

```bash
npm run build
npm run preview
```

---

The sections below are the original Vite template notes.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
