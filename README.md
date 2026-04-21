# GitHub Homepage Starter

A bold single-page starter for a GitHub personal homepage, built with React, TypeScript, and Vite.

## Local development

```bash
npm install
npm run dev
```

## Customize content

Update the placeholder copy and links in `src/siteData.ts`.

## Deploy to a GitHub personal homepage

1. Create a repository named `<your-github-username>.github.io`.
2. Push this project to that repository.
3. In GitHub, enable Pages with `GitHub Actions`.
4. Push to `main` to trigger `.github/workflows/deploy.yml`.

If you need to publish under a project path instead of the personal root domain, set `VITE_BASE_PATH` in the workflow or build environment.
