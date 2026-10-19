import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const base = env.VITE_PUBLIC_PATH || (command === 'serve' && mode !== 'production' ? '/' : '');
  if (!/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(base)) {
    throw new Error('Defina VITE_PUBLIC_PATH com o caminho público real, começando e terminando com /, em .env.production.');
  }
  if (command === 'build') {
    let api;
    try { api = new URL(env.VITE_API_URL); } catch { /* validated below */ }
    if (!api || api.protocol !== 'https:' || api.username || api.password || api.search || api.hash || api.pathname !== '/' || /^(localhost|127\.|\[::1\])/.test(api.hostname)) {
      throw new Error('Defina VITE_API_URL com a origem HTTPS pública da API, sem /api, credenciais ou parâmetros.');
    }
  }
  return {
    base,
    plugins: [react(), tailwindcss(), {
      name: 'apache-spa',
      generateBundle() {
        this.emitFile({ type: 'asset', fileName: '.htaccess', source: `Options -MultiViews\nDirectoryIndex index.html\nRewriteEngine On\nRewriteBase ${base}\nRewriteRule ^index\\.html$ - [L]\nRewriteCond %{REQUEST_FILENAME} !-f\nRewriteCond %{REQUEST_FILENAME} !-d\nRewriteRule ^ index.html [L]\n` });
      }
    }]
  };
});
