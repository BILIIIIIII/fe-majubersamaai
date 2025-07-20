
# MajuBersamaAI Frontend

This is the **React + TypeScript + Vite**–based frontend for the Hacktiv8 “MajubersamaAI” final project. It provides a minimal, high‑performance setup with hot reloading, ESLint rules, and easy configuration.

> **Note:** to run this frontend locally, you must also run the backend. You can find and clone it here:  
> **https://github.com/BILIIIIIII/be-majubersamaai**

---

## Table of Contents

1. [Prerequisites](#prerequisites)  
2. [Getting Started](#getting-started)  
3. [Running Frontend & Backend](#running-frontend--backend)  
4. [Available Scripts](#available-scripts)  
5. [ESLint Configuration](#eslint-configuration)  
   - [Type‑Aware Rules (Prod)](#type‑aware-rules-prod)  
   - [Optional React‑Specific Plugins](#optional-react‑specific-plugins)  
6. [Structure & Plugins](#structure--plugins)  
7. [License](#license)

---

## Prerequisites

- **Node.js** (v16+) and **npm** or **Yarn**  
- **Git**  
- A running copy of the **MajubersamaAI** backend (see link above)

---

## Getting Started

1. Clone this repository:  

   ```bash
   git clone https://github.com/BILIIIIIII/fe-majubersamaai.git
   cd fe-majubersamaai
2. Install dependencies:

   ```bash
   npm install
   # or
   bun install
   ```

3. Copy your environment variables (if any) into `.env.local`.

---

## Running Frontend & Backend

1. **Start the backend**

   ```bash
   cd ../be-majubersamaai
   npm install
   npm run dev
   ```

   By default, the backend runs at `http://localhost:8080`.

2. **Start the frontend**
   In a separate terminal:

   ```bash
   cd fe-majubersamaai
   npm run dev
   ```

   Visit `http://localhost:5173` in your browser.

---

## Available Scripts

* `npm run dev` – run Vite’s development server (HMR + fast refresh)
* `npm run build` – bundle for production
* `npm run serve` – locally preview your production build
* `npm run lint` – run ESLint across the project

---

## ESLint Configuration

This project ships with a basic ESLint setup. For a production‑grade app, enable type‑aware rules:

### Type‑Aware Rules (Prod)

```js
// eslint.config.js
import tseslint from "typescript-eslint";

export default tseslint.config([
  // ignore build output
  tseslint.globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Type‑checked, recommended rules
      ...tseslint.configs.recommendedTypeChecked,
      // (Optional) Stricter ruleset
      // ...tseslint.configs.strictTypeChecked,
      // (Optional) Stylistic rules
      // ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]);
```

### Optional React‑Specific Plugins

You can further strengthen linting with React‑focused rules:

```js
// eslint.config.js
import tseslint from "typescript-eslint";
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';

export default tseslint.config([
  tseslint.globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      reactX.configs['recommended-typescript'],
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]);
```

---

## Structure & Plugins

- **Vite** with HMR
- **React** + **TypeScript**
- Official plugins supported:

  - [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react) (Babel‑based Fast Refresh)
  - [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) (SWC‑based Fast Refresh)
