# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server
npm run build     # Build production bundle
npm start         # Start production server
npm run lint      # Run Next.js linting
npm test          # Run Jest test suite
```

To run a single test file:
```bash
npx jest src/components/__tests__/CookieBanner.test.js
```

## Architecture

**Conversor PDF BR** is a client-side-only file conversion tool (no backend). Files are never uploaded — all conversions happen in the browser using JavaScript libraries.

- **Framework**: Next.js (Pages Router, not App Router) with React 19
- **Styling**: Tailwind CSS v4 via `@tailwindcss/postcss`; dark mode is the default (`defaultTheme="dark"` in `_app.js`)
- **Path alias**: `@/*` → `./src/*`

### Conversion Pipeline

All three converters follow the same pattern:
1. File selected via input or drag-and-drop → FileReader API reads it
2. Library parses the file into an HTML string
3. `html2pdf.js` renders that HTML to a downloadable PDF

| Route | Accepts | Parser |
|---|---|---|
| `/conversores/word-para-pdf` | .doc, .docx, .txt | Mammoth.js (docx→HTML) |
| `/conversores/excel-para-pdf` | .xls, .xlsx, .csv | SheetJS/xlsx (→HTML table) |
| `/conversores/jpg-para-pdf` | .jpg, .jpeg, .png | FileReader DataURL → `<img>` |

Both `html2pdf.js` and `mammoth` are loaded with dynamic `import()` calls to keep the initial bundle small.

### Key Files

- `src/pages/_app.js` — wraps all pages with `ThemeProvider`, `Navbar`, `Footer`, `CookieBanner`, and Vercel Analytics
- `src/pages/_document.js` — sets dark mode class on `<html>` by default
- `src/styles/globals.css` — Tailwind v4 imports + CSS custom properties for theming
- `src/components/__tests__/` — Jest + Testing Library tests (jsdom environment)

### Testing

`jest.setup.js` patches `window.matchMedia` (required by `next-themes`). Tests live in `src/components/__tests__/`.

### Deployment

No environment variables required. Deployed on Vercel at `https://www.converterpdfbr.com.br/`. Google AdSense script is injected in `_app.js`.
