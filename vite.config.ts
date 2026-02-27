{
  "lote": 5,
  "status": "pending",
  "file_path": "vite.config.ts",
  "created_at": "2026-02-27T05:36:29.422Z",
  "file_content": "import { defineConfig } from 'vite'\nimport path from 'path'\nimport tailwindcss from '@tailwindcss/vite'\nimport react from '@vitejs/plugin-react'\n\nexport default defineConfig({\n  plugins: [\n    // The React and Tailwind plugins are both required for Make, even if\n    // Tailwind is not being actively used – do not remove them\n    react(),\n    tailwindcss(),\n  ],\n  resolve: {\n    alias: {\n      // Alias @ to the src directory\n      '@': path.resolve(__dirname, './src'),\n    },\n  },\n\n  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.\n  assetsInclude: ['**/*.svg', '**/*.csv'],\n})\n"
}