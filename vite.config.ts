import dotenv from "dotenv";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

dotenv.config();

const appBuildId =
  process.env.VITE_APP_BUILD_ID ||
  process.env.GITHUB_SHA?.slice(0, 8) ||
  "1.0.11-14";

function contactApiDevPlugin(): Plugin {
  return {
    name: "bamsignal-contact-api",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split("?")[0];
        if (url !== "/api/contact" && url !== "/api/auth/email-code" && url !== "/api/member/photos") {
          next();
          return;
        }
        if (req.method !== "POST") {
          next();
          return;
        }

        const chunks: Buffer[] = [];
        req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        req.on("end", async () => {
          try {
            const body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
            if (url === "/api/contact") {
              const { handleContactPost, sendContactJson } = await import("./server/services/contactMail.js");
              const result = await handleContactPost(body);
              sendContactJson(res, 200, result);
              return;
            }

            if (url === "/api/member/photos") {
              const memberPhotosHandler = (await import("./api/member/photos.js")).default;
              const query = Object.fromEntries(new URL(req.url || "", "http://localhost").searchParams);
              await memberPhotosHandler(
                {
                  method: "POST",
                  query,
                  headers: { authorization: req.headers.authorization || "" },
                  body
                },
                {
                  status(code: number) {
                    res.statusCode = code;
                    return this;
                  },
                  setHeader(name: string, value: string) {
                    res.setHeader(name, value);
                  },
                  json(payload: unknown) {
                    res.setHeader("Content-Type", "application/json");
                    res.end(JSON.stringify(payload));
                  },
                  end() {
                    res.end();
                  },
                  headersSent: false
                }
              );
              return;
            }

            const { handleSignupEmailCodeRequest, SignupOtpError } = await import(
              "./server/services/signupOtp.js"
            );
            const result = await handleSignupEmailCodeRequest(body);
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(result));
          } catch (error) {
            if (url === "/api/contact") {
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
              return;
            }

            const { SignupOtpError } = await import("./server/services/signupOtp.js");
            if (error instanceof SignupOtpError) {
              res.statusCode = error.status;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ ok: false, error: error.message }));
              return;
            }

            const { SignupIdentityError } = await import("./server/services/signupIdentity.js");
            if (error instanceof SignupIdentityError) {
              res.statusCode = error.status;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ ok: false, error: error.message, field: error.field }));
              return;
            }

            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                ok: false,
                error: "We couldn't send the code right now. Wait a minute and try again, or check your spam folder."
              })
            );
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
  define: {
    __APP_BUILD_ID__: JSON.stringify(appBuildId)
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          supabase: ["@supabase/supabase-js"],
          capacitor: ["@capacitor/app", "@capacitor/browser", "@capacitor/core", "@capacitor/push-notifications"],
          icons: ["lucide-react"],
          photoSafety: [
            "tesseract.js",
            "jsqr",
            "@tensorflow-models/blazeface",
            "@tensorflow/tfjs-core",
            "@tensorflow/tfjs-converter",
            "@tensorflow/tfjs-backend-webgl"
          ]
        }
      }
    }
  },
  server: {
    port: 5173
  }
});
