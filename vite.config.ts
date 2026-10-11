import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { site } from './src/site.config';

const escape = (text: string) => text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Fills %SITE_TITLE% and %SITE_DESCRIPTION% in index.html from src/site.config.ts. */
function siteMeta(): Plugin {
  return {
    name: 'site-meta',
    transformIndexHtml: (html) =>
      html.replaceAll('%SITE_TITLE%', escape(`${site.title} — ${site.fullName}`)).replaceAll('%SITE_DESCRIPTION%', escape(site.description)),
  };
}

// Modes:
//   npm run dev   → --mode mock: local stand-in for Supabase with dummy data
//   npm run prod  → development mode against the real Supabase in .env
//   npm run build → production build against the real Supabase in .env
export default defineConfig(({ command, mode }) => {
  if (command === 'build' && mode !== 'mock') {
    const env = loadEnv(mode, fileURLToPath(new URL('.', import.meta.url)), 'VITE_');
    if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_PUBLISHABLE_KEY) {
      throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env — the production build must point at the real Supabase project.');
    }
  }

  return {
    plugins: [react(), tailwindcss(), siteMeta()],
    build: {
      rolldownOptions: {
        // Two pages: the public site (/) and the hidden admin (/goku/).
        input: {
          site: fileURLToPath(new URL('./index.html', import.meta.url)),
          goku: fileURLToPath(new URL('./goku/index.html', import.meta.url)),
        },
      },
    },
  };
});
