import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { z } from "zod";
export default defineConfig({
  plugins: [react()],
  server: {
    port: z.coerce
      .number()
      .int()
      .min(1)
      .max(65535)
      .parse(process.env.APP_PORT ?? 4310),
    strictPort: true,
    proxy: { "/api": process.env.API_TARGET ?? "http://localhost:3001" },
  },
});
