import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    // O plugin basicSsl() foi removido daqui
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["vite.svg"],
      manifest: {
        name: "Meu Aplicativo de Estoque",
        short_name: "EstoqueApp",
        description: "Gerenciador de estoque PWA",
        theme_color: "#0D47A1",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        icons: [
          {
            src: "vite.svg",
            sizes: "any",
            type: "image/svg+xml",
          },
        ],
      },
    }),
  ],
  // 🔥 Bloco adicionado para corrigir o erro "UNKNOWN" no drive S:\
  server: {
    watch: {
      usePolling: true,
    },
  },
});
