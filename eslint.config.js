// Configuração Flat do ESLint v9 para Vite + React + TypeScript
// Comentários em português conforme padrão do projeto

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  // Ignorar artefatos de build e dependências
  { ignores: ["dist/**", "build/**", "coverage/**", "node_modules/**", "docs/**"] },
  // Globais p/ navegador e Node (aplicado a todos os arquivos)
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },


  // Regras JavaScript recomendadas pelo ESLint
  js.configs.recommended,

  // Regras TypeScript padrão (sem type-check, mais rápido e suficiente na maioria dos casos)
  ...tseslint.configs.recommended,

  // Regras específicas para arquivos TS/TSX (React)
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 2023,
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      // Regras de Hooks do React
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Boa prática no Vite/React Refresh
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true }
      ],
    },
  },
];

