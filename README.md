# Apache Phoenix Website

The official website for Apache Phoenix, built with modern web technologies to provide a fast, accessible, and maintainable web presence.

---

## Table of Contents

- [Content Editing](#content-editing)
- [Development](#development)
  - [Prerequisites](#prerequisites)
  - [Technology Stack](#technology-stack)
  - [Project Architecture](#project-architecture)
  - [Getting Started](#getting-started)
  - [Development Workflow](#development-workflow)
  - [Building for Production](#building-for-production)
  - [Deployment](#deployment)
  - [Troubleshooting](#troubleshooting)

---

## Content Editing

Most landing pages store content in Markdown (`.md`) or JSON (`.json`) files located in `app/pages/_landing/[page-name]/`. Docs content lives under `app/pages/_docs/` and is authored in MDX.

Examples:

- `app/pages/_landing/mailing-lists/content.md` - Markdown content for a landing page
- `app/pages/_landing/team/developers.json` - JSON data for the team page
- `app/pages/_landing/news/events.json` - JSON data for news/events
- `app/pages/_docs/docs/_mdx/(multi-page)/...` - MDX content for documentation
- `phoenix-version.ts` - Shared Phoenix version constant used in docs/PDF cover

---

## Development

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js version 22
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify installation: `node --version` (should show v22.12+)

- npm
  - Comes bundled with Node.js
  - Verify installation: `npm --version`

### Technology Stack

This website uses modern web technologies. Here is what each one does (with Java analogies):

#### Core Framework

- React Router - full-stack web framework with SSG
  - Handles routing (similar to Spring MVC controllers)
  - Provides server-side rendering for better performance and SEO
  - Enables progressive enhancement
  - [Documentation](https://reactrouter.com/)

#### Documentation Framework

- Fumadocs - documentation framework used for the docs section
  - Provides MDX-based docs structure and navigation
  - Lives alongside landing pages in the same React Router app
  - Supports multi-page and single-page docs from the same MDX sources
  - [Documentation](https://fumadocs.com/)

#### Progressive Enhancement

The website uses progressive enhancement ([learn more](https://reactrouter.com/explanation/progressive-enhancement)), which means:

- With JavaScript enabled: users get a SPA experience
  - Fast page transitions without full page reloads
  - Smooth animations and interactive features
  - Enhanced user experience

- Without JavaScript: users still get a fully functional website
  - All links and forms work via traditional HTML
  - Content remains accessible
  - Better behavior for search engines and assistive tools

This approach ensures the website works for all users, regardless of browser capabilities or connection speed.

#### UI Components

- shadcn/ui - pre-built, accessible UI components
  - Similar to component libraries like PrimeFaces or Vaadin
  - Provides buttons, cards, navigation menus, and more
  - [Documentation](https://ui.shadcn.com/)

#### Styling

- TailwindCSS - utility-first CSS framework
  - Apply classes directly in components instead of maintaining large CSS files
  - Example: `className="text-blue-500 font-bold"` makes blue, bold text

#### Code Quality Tools

- TypeScript - typed superset of JavaScript
  - Similar to Java's type system
  - Catches errors at compile-time instead of runtime
  - Provides better autocomplete and IDE support

- ESLint + Prettier - linting and formatting
  - ESLint analyzes code for potential errors and style issues
  - Prettier enforces consistent formatting
  - `npm run lint:fix` handles both linting and markdown formatting
  - Configuration files: `eslint.config.js` and `prettier.config.js`

### Project Architecture

The project follows a clear directory structure with separation of concerns:

```text
phoenix-site/
├── app/                               # Application source code
│   ├── ui/                            # Reusable UI primitives
│   ├── components/                    # Reusable components with business logic
│   ├── pages/                         # Full pages
│   │   ├── _landing/                  # Landing pages + layout
│   │   └── _docs/                     # Documentation pages (Fumadocs)
│   ├── routes/                        # Route definitions
│   ├── routes.ts                      # Main routing configuration
│   ├── root.tsx                       # Root layout component
│   └── app.css                        # Global styles
│
├── build/                             # Generated files (do not edit)
├── public/                            # Static files copied to build output
├── scripts/                           # Helper scripts (e.g. generate-language.ts)
├── e2e-tests/                         # Playwright tests
├── unit-tests/                        # Vitest tests
├── phoenix-version.ts                 # Shared Phoenix version constant
└── package.json                       # Scripts and dependencies
```

#### Key Principles

1. UI components (`app/ui`) are pure, reusable building blocks with no page-level business logic.
2. Business components (`app/components`) can be shared across multiple pages.
3. Pages (`app/pages`) compose UI + business components into complete routes.
4. Routes (`app/routes`) map URLs to pages and define route-level metadata.
5. Two layout systems exist in one app:
   - Landing pages under `app/pages/_landing/`
   - Docs pages under `app/pages/_docs/`
6. Documentation versions:
   - Multi-page docs in `app/pages/_docs/docs/_mdx/(multi-page)/` are the source of truth.
   - Single-page docs in `app/pages/_docs/docs/_mdx/single-page/` aggregate from multi-page docs.

#### Important Conventions

##### Custom Link Component

Always use the custom Link component from `@/components/link` instead of importing Link directly from `react-router`.

The Phoenix website includes both React-routed pages and static/legacy pages. The custom Link component automatically decides whether to use client-side navigation or trigger a full page load.

Correct usage:

```typescript
import { Link } from "@/components/link";

export const MyComponent = () => <Link to="/team">Team</Link>;
```

Wrong usage:

```typescript
import { Link } from "react-router";

export const MyComponent = () => <Link to="/team">Team</Link>;
```

The ESLint configuration includes `custom/no-react-router-link` to enforce this convention.

### Getting Started

#### 1. Install Dependencies

```bash
npm install
```

This downloads all required packages from npm.

#### 2. Generate Docs Metadata and Language Pages

Before starting the development server, generate docs metadata and generated language pages:

```bash
npm run generate-language
npm run fumadocs-init
```

`generate-language` updates generated docs pages (for example grammar/functions/datatypes). `fumadocs-init` refreshes Fumadocs metadata and page maps.

#### 3. Start Development Server

```bash
npm run dev
```

This starts a local development server with:

- Hot Module Replacement (HMR): updates without full page reload
- Default URL: `http://localhost:5173`

### Development Workflow

#### Making Changes

1. Edit code in `app/`.
2. Save the file and verify updates in browser.
3. Check terminal output and browser console for errors.

#### Common Tasks

Add a new page:

1. Create directory in `app/pages/my-new-page/`
2. Add `index.tsx` in that directory
3. Add a route file in `app/routes/`
4. Register it in `app/routes.ts`

Add a new documentation page:

1. Create a `.mdx` file in `app/pages/_docs/docs/_mdx/(multi-page)/`.
2. Add it to the relevant `meta.json` in that docs section.
3. If needed in the single-page docs, include it from `app/pages/_docs/docs/_mdx/single-page/index.mdx`.
4. Run `npm run fumadocs-init`.

Update content:

- Edit the relevant `.md`, `.mdx`, or `.json` file.

Add a UI component:

- Check existing shadcn/ui primitives first.
- Add custom components only when needed.

Check code quality:

```bash
npm run lint
```

Fix linting and formatting issues:

```bash
npm run lint:fix
```

### Testing

The project uses [Vitest](https://vitest.dev/) for unit testing and [Playwright](https://playwright.dev/) for e2e testing.

#### Export Documentation PDF

The docs PDF export is implemented as a Playwright e2e test in `e2e-tests/export-pdf.spec.ts`. It renders single-page docs in both light and dark themes to produce static PDF assets.

The export quality depends heavily on print styles in `app/app.css` (`@media print` rules).

The displayed Phoenix version on the PDF cover is sourced from `phoenix-version.ts` (`PHOENIX_VERSION`) and consumed by `app/pages/_docs/docs/index.tsx`.

Manual command:

```bash
npm run export-pdf
```

#### Run Tests

```bash
# Run all tests
npm test

# Run unit tests once (CI mode)
npm run test:unit:run

# Run unit tests with UI
npm run test:unit:ui

# Run e2e tests
npm run test:e2e

# Run e2e tests with UI
npm run test:e2e:ui
```

### Building for Production

Before merging or deploying, run the full CI pipeline:

```bash
npm run ci
```

Current CI sequence:

1. `npm run generate-language`
2. `npm run fumadocs-init`
3. `npm run lint`
4. `npm run typecheck`
5. `npm run test:unit:run`
6. `npx playwright install`
7. `npm run test:e2e`
8. `npm run build`

For Linux runners, `./build.sh` can bootstrap Node/npm with nvm and then execute the full CI flow.

Generated files are located under the `build/` directory.

### Deployment

#### Static Hosting

Since this site uses SSG, deploy `build/client/` to any static host:

- Apache HTTP Server
- Nginx
- GitHub Pages
- Any CDN/static object storage

### Troubleshooting

#### TypeScript Types Are Broken

If you see type errors related to React Router `+types`, regenerate them:

```bash
npx react-router typegen
```

#### Port Already in Use

If `npm run dev` fails because port 5173 is in use:

```bash
lsof -ti:5173 | xargs kill -9
```

Or change the port in `vite.config.ts`.

#### Build Fails

1. Clear generated files:

   ```bash
   rm -rf build/ node_modules/ .vite/ .react-router/ .source/
   ```

2. Reinstall dependencies:

   ```bash
   npm install
   ```

3. Try building again:

   ```bash
   npm run build
   ```

---

## Additional Resources

- React Router: https://reactrouter.com/
- Fumadocs: https://fumadocs.com/
- Progressive Enhancement: https://reactrouter.com/explanation/progressive-enhancement
- shadcn/ui: https://ui.shadcn.com/
- TailwindCSS: https://tailwindcss.com/
- TypeScript Handbook: https://www.typescriptlang.org/docs/

---

Built for the Apache Phoenix community.
