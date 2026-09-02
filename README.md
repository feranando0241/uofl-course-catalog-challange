# UofL Course Catalog

> A modern, interactive course catalog for the **University of Louisville** — built as a submission for the UofL Integrative Design and Development Programmer Coding Challenge.

[![Deploy to GitHub Pages](https://github.com/andreslopez/uofl-course-catalog-challenge/actions/workflows/deploy.yml/badge.svg)](https://github.com/andreslopez/uofl-course-catalog-challenge/actions/workflows/deploy.yml)

**🔗 Live Demo:** [andreslopez.github.io/uofl-course-catalog-challenge](https://andreslopez.github.io/uofl-course-catalog-challenge)

---

## Overview

This application ingests the provided `catalog dev.csv` dataset (~8,494 rows), converts it to a structured JSON format via a Python script, and renders it as a beautiful, searchable, filterable, and paginated Single Page Application (SPA).

### Key Design Decisions

- **Deduplication**: The CSV contains multiple rows per course (one per section). The Python converter deduplicates by `CRSE_ID`, producing **2,775 unique courses**.
- **Client-side everything**: No backend server needed — the JSON is served as a static file alongside the built React app, making GitHub Pages hosting trivial.
- **Fuzzy search via Fuse.js**: Supports typo-tolerant search across course titles, descriptions, subjects, and catalog numbers.
- **UofL brand identity**: Cardinal Red (`#AD0000`), Charcoal Black (`#1A1A1A`), and clean neutrals — consistent with the University of Louisville visual identity.

---

## Features

| Feature | Details |
|---|---|
| **Course Cards** | Subject badge, catalog number, course title, academic career tag |
|  **Fuzzy Search** | Real-time search via Fuse.js across all fields with typo tolerance |
|  **Subject Filter** | Dropdown populated from all unique departments in the dataset |
|  **Pagination** | 12 cards/page with smart ellipsis navigation (232 pages total) |
| **Search Highlighting** | Matched terms highlighted in card descriptions |
|  **Responsive Design** | Mobile-first grid: 1 → 2 → 3 → 4 columns |
|  **Accessibility** | ARIA roles, labels, `aria-live` regions, keyboard navigation |
|  **GitHub Actions CI/CD** | Auto-deploys to GitHub Pages on every push to `main` |
|  **Unit Tests** | Python tests for the converter; Vitest tests for filter/search logic |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 + Custom Design System |
| Icons | Lucide React |
| Fuzzy Search | Fuse.js |
| Data Pipeline | Python 3 (stdlib: `csv`, `json`, `os`) |
| Testing | Vitest (JS) + `unittest` (Python) |
| Deployment | GitHub Pages via GitHub Actions |

---

## Project Structure

```text
uofl-course-catalog-challenge/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD: build + deploy to GitHub Pages
├── scripts/
│   ├── convert_csv_to_json.py  # CSV → JSON converter (run once)
│   └── test_converter.py       # Python unittest suite
├── public/
│   └── data/
│       └── courses.json        # Generated: 2,775 unique courses
├── src/
│   ├── components/
│   │   ├── Header.jsx          # Logo + title + course count
│   │   ├── CourseCard.jsx      # Individual course card with highlight
│   │   ├── CourseList.jsx      # Responsive grid + loading/empty/error states
│   │   ├── SearchBar.jsx       # Fuzzy search input
│   │   ├── SubjectFilter.jsx   # Department dropdown
│   │   └── Pagination.jsx      # Page controls with ellipsis
│   ├── hooks/
│   │   └── useCourseCatalog.js # Central state: load, search, filter, paginate
│   ├── utils/
│   │   └── filterCourses.js    # Pure filter/search/pagination utilities
│   ├── tests/
│   │   ├── setup.js            # Vitest setup
│   │   └── filterCourses.test.js # 20+ unit tests
│   ├── App.jsx                 # Root layout
│   ├── index.css               # Full design system (tokens, animations, components)
│   └── main.jsx                # React DOM entry point
├── index.html                  # SEO-optimized HTML shell
├── vite.config.js              # Vite + Tailwind + Vitest config
└── package.json                # Scripts and dependencies
```

---

## Local Setup & Installation

### Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.9
- **npm** ≥ 9

### 1. Clone the repository

```bash
git clone https://github.com/andreslopez/uofl-course-catalog-challenge.git
cd uofl-course-catalog-challenge
```

### 2. Install JavaScript dependencies

```bash
npm install
```

### 3. Generate the JSON data file

The CSV file must be present at one of:
- `Agents_and_Plan/catalog dev[8][56].csv` (in project root)
- `~/Desktop/catalog dev[8][56].csv` (fallback)

```bash
# Option A: npm script
npm run convert

# Option B: direct Python
python3 scripts/convert_csv_to_json.py
```

This writes `public/data/courses.json` (~2,775 unique courses).

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:5173/uofl-course-catalog-challenge/](http://localhost:5173/uofl-course-catalog-challenge/)

---

## Running Tests

### JavaScript unit tests (Vitest)

```bash
# Run once
npm run test

# Watch mode (re-runs on file changes)
npm run test:watch

# Interactive UI
npm run test:ui
```

### Python unit tests

```bash
python -m unittest scripts/test_converter.py -v
```

---

## Production Build

```bash
npm run build
```

Output is in `dist/`. Preview the production build locally:

```bash
npm run preview
```

---

## Deployment

### Automatic (GitHub Actions)

Every push to `main` triggers the CI workflow (`.github/workflows/deploy.yml`) which:
1. Runs the Python CSV converter
2. Installs npm dependencies
3. Runs JS tests
4. Builds the Vite bundle
5. Deploys `dist/` to the `gh-pages` branch

### Manual deploy

```bash
npm run deploy
```

---

## Evaluation Checklist

| Requirement | Status |
|---|---|
| Page title: "UofL Course Catalog" |
| ≥ 10 cards on initial load |
| Subject, Catalog Number, Description on each card |
| Search bar |
| Subject/department filter |
| Pagination |
| CSV → JSON conversion script |
| Responsive mobile-first design |
| Unit tests |
| GitHub Pages deployment |
| README with setup instructions |

---

## License

This project was created as a submission for the **UofL Integrative Design and Development Programmer Coding Challenge**.  
© University of Louisville.
