import dotenv from "dotenv";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

dotenv.config();

function contactApiDevPlugin(): Plugin {
  return {
    name: "bamsignal-contact-api",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split("?")[0];
        if (url !== "/api/contact" || req.method !== "POST") {
          next();
          return;
        }

        const chunks: Buffer[] = [];
        req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        req.on("end", async () => {
          try {
            const body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
            const { handleContactPost, sendContactJson } = await import("./server/services/contactMail.js");
            const result = await handleContactPost(body);
            sendContactJson(res, 200, result);
          } catch (error) {
            const { ContactError, sendContactJson } = await import("./server/services/contactMail.js");
            if (error instanceof ContactError) {
              sendContactJson(res, error.status, {
                ok: false,
                error: error.message,
                detail: error.detail
              });
              return;
            }

            sendContactJson(res, 500, {
              ok: false,
              error: error instanceof Error ? error.message : "Support email failed"
            });
          }
        });
        req.on("error", () => {
          res.statusCode = 500;
          res.end("Request error");
        });
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), contactApiDevPlugin()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          supabase: ["@supabase/supabase-js"],
          capacitor: ["@capacitor/app", "@capacitor/browser", "@capacitor/core", "@capacitor/push-notifications"],
          icons: ["lucide-react"]
        }
      }
    }
  },
  server: {
    port: 5173
  }
});
