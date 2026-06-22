/**
 * Canonical Express app — all API routes and middleware mount here.
 * Start the process via server/production.js only (Docker, Coolify, npm start).
 */
import express from "express";
import path from "node:path";
import { corsMiddleware } from "./cors.js";
import { PAYSTACK_WEBHOOK_MOUNT_PATHS } from "./services/paystackWebhookHandler.js";
import { livenessPayload, readinessPayload } from "./services/readiness.js";
import { requireDiagnosticsAccess } from "./services/diagnosticsAccess.js";
import {
  logAlertableEvent,
  logReadyCheckFailed,
  observabilityContext,
  requestContextMiddleware
} from "./services/observability.js";
import { sanitizeApiErrorForLog } from "./services/errorResponse.js";
import { paystackRouter } from "./routes/paystack.js";
import { handleContactNodeRequest } from "./services/contactMail.js";
import { mountHandler } from "./mountHandler.js";
import identityHandler from "../api/auth/identity.js";
import pinLoginHandler from "../api/auth/pin-login.js";
import pinResetHandler from "../api/auth/pin-reset.js";
import emailCodeHandler from "../api/auth/email-code.js";
import loginSecurityHandler from "../api/auth/login-security.js";
import playReviewerFinishHandler from "../api/auth/play-reviewer-finish.js";
import paystackVerifyHandler from "../api/paystack/verify.js";
import consultationPaymentHandler from "./routes/consultationPayment.js";
import calendarHandler from "./routes/calendar.js";
import meetingLinkHandler from "./routes/meetingLink.js";
import conciergeEmailHandler from "./routes/conciergeEmail.js";
import conciergeWhatsappHandler from "./routes/conciergeWhatsapp.js";
import conciergePersistenceHandler from "./routes/conciergePersistence.js";
import paystackConnectivityHandler from "../api/diagnostics/paystack-connectivity.js";
import viewSecurityHandler from "../api/diagnostics/view-security.js";
import functionSecurityHandler from "../api/diagnostics/function-security.js";
import memberDataHandler from "../api/member/data.js";
import memberPhotosHandler from "../api/member/photos.js";
import memberVoiceHandler from "../api/member/voice.js";
import cityHomeHandler from "../api/city/home.js";
import citySpotlightHandler from "../api/city/spotlight.js";
import citySpotlightEventHandler from "../api/city/spotlight-event.js";
import adminCityHomeHandler from "../api/admin/city-home.js";
import adminCitySpotlightHandler from "../api/admin/city-spotlight.js";
import adminMembersHandler from "../api/admin/members.js";
import adminConsentHandler from "../api/admin/consent.js";
import adminBootstrapHandler from "../api/admin/bootstrap.js";
import adminModerationHandler from "../api/admin/moderation.js";
import hardSetupHandler from "../api/hard/setup.js";
import whatsappVerifyStartHandler from "../api/verify/whatsapp/start.js";
import whatsappVerifyConfirmHandler from "../api/verify/whatsapp/confirm.js";
import whatsappVerifyWebhookHandler from "../api/verify/whatsapp/webhook.js";
import verificationSubmissionsHandler from "../api/verify/submissions.js";
import { buildSitemapXml, getRobotsTxt } from "./seoSitemap.js";

/**
 * @param {{ distDir?: string | null }} [options]
 * @returns {import("express").Express}
 */
export function createApp(options = {}) {
  const { distDir = null } = options;
  const app = express();

  app.use((req, res, next) => {
    const host = String(req.headers.host || "");
    if (host.startsWith("www.")) {
      const apex = host.replace(/^www\./i, "");
      return res.redirect(301, `https://${apex}${req.originalUrl}`);
    }
    next();
  });

  app.use(corsMiddleware);
  app.use(requestContextMiddleware);

  app.use((req, res, next) => {
    if (PAYSTACK_WEBHOOK_MOUNT_PATHS.includes(req.path)) {
      express.raw({ type: "application/json" })(req, res, () => {
        req.rawBody = req.body;
        next();
      });
      return;
    }
    express.json({ limit: "12mb" })(req, res, next);
  });

  app.get("/health", (_req, res) => {
    res.status(200).json(livenessPayload());
  });

  app.head("/health", (_req, res) => {
    res.status(200).end();
  });

  app.get("/ready", async (req, res) => {
    const access = await requireDiagnosticsAccess(req);
    const payload = await readinessPayload({ detailed: access.ok });
    if (!payload.ready) {
      logReadyCheckFailed(
        observabilityContext(req, {
          path: "/ready",
          detailed: access.ok,
          ready: false
        })
      );
    }
    res.status(payload.ready ? 200 : 503).json(payload);
  });

  app.head("/ready", async (req, res) => {
    const payload = await readinessPayload({ detailed: false });
    if (!payload.ready) {
      logReadyCheckFailed(
        observabilityContext(req, {
          path: "/ready",
          method: "HEAD",
          ready: false
        })
      );
    }
    res.status(payload.ready ? 200 : 503).end();
  });

  app.post("/api/contact", handleContactNodeRequest);
  mountHandler(app, "post", "/api/auth/email-code", emailCodeHandler);
  mountHandler(app, "post", "/api/auth/pin-login", pinLoginHandler);
  mountHandler(app, "post", "/api/auth/pin-reset", pinResetHandler);
  mountHandler(app, "post", "/api/auth/login-security", loginSecurityHandler);
  mountHandler(app, "post", "/api/auth/play-reviewer-finish", playReviewerFinishHandler);
  mountHandler(app, "post", "/api/auth/identity", identityHandler);
  mountHandler(app, "post", "/api/verify/whatsapp/start", whatsappVerifyStartHandler);
  mountHandler(app, "post", "/api/verify/whatsapp/confirm", whatsappVerifyConfirmHandler);
  mountHandler(app, "post", "/api/verify/whatsapp/webhook", whatsappVerifyWebhookHandler);
  mountHandler(app, "post", "/api/verify/submissions", verificationSubmissionsHandler);
  mountHandler(app, "get", "/api/verify/submissions", verificationSubmissionsHandler);
  mountHandler(app, "post", "/api/member/data", memberDataHandler);
  mountHandler(app, "post", "/api/member/photos", memberPhotosHandler);
  mountHandler(app, "post", "/api/member/voice", memberVoiceHandler);
  mountHandler(app, "post", "/api/paystack/verify", paystackVerifyHandler);
  mountHandler(app, "post", "/api/consultation-payment", consultationPaymentHandler);
  mountHandler(app, "post", "/api/calendar", calendarHandler);
  mountHandler(app, "get", "/api/calendar", calendarHandler);
  mountHandler(app, "post", "/api/meeting-link", meetingLinkHandler);
  mountHandler(app, "post", "/api/concierge-email", conciergeEmailHandler);
  mountHandler(app, "post", "/api/concierge-whatsapp", conciergeWhatsappHandler);
  mountHandler(app, "post", "/api/concierge-persistence", conciergePersistenceHandler);
  mountHandler(app, "get", "/api/diagnostics/paystack-connectivity", paystackConnectivityHandler);
  mountHandler(app, "get", "/api/diagnostics/view-security", viewSecurityHandler);
  mountHandler(app, "post", "/api/diagnostics/view-security", viewSecurityHandler);
  mountHandler(app, "get", "/api/diagnostics/function-security", functionSecurityHandler);
  mountHandler(app, "post", "/api/diagnostics/function-security", functionSecurityHandler);
  mountHandler(app, "post", "/api/admin/city-home", adminCityHomeHandler);
  mountHandler(app, "post", "/api/admin/members", adminMembersHandler);
  mountHandler(app, "post", "/api/admin/consent", adminConsentHandler);
  mountHandler(app, "post", "/api/admin/bootstrap", adminBootstrapHandler);
  mountHandler(app, "post", "/api/admin/moderation", adminModerationHandler);
  mountHandler(app, "get", "/api/hard/setup", hardSetupHandler);
  mountHandler(app, "post", "/api/hard/setup", hardSetupHandler);
  mountHandler(app, "get", "/api/admin/city-spotlight", adminCitySpotlightHandler);
  mountHandler(app, "get", "/api/city/home", cityHomeHandler);
  mountHandler(app, "get", "/api/city/spotlight", citySpotlightHandler);
  mountHandler(app, "post", "/api/city/spotlight-event", citySpotlightEventHandler);
  app.use(paystackRouter);

  app.get("/sitemap.xml", (_req, res) => {
    res.type("application/xml").send(buildSitemapXml());
  });

  app.get("/robots.txt", (_req, res) => {
    res.type("text/plain").send(getRobotsTxt());
  });

  if (distDir) {
    app.use(
      express.static(distDir, {
        index: false,
        maxAge: "1d",
        setHeaders(res, filePath) {
          if (filePath.includes(`${path.sep}assets${path.sep}`)) {
            res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
          }
        }
      })
    );

    app.use((req, res, next) => {
      if (req.method !== "GET" && req.method !== "HEAD") return next();
      if (req.path.startsWith("/api/") || req.path.startsWith("/webhooks/")) return next();
      if (req.path === "/" || req.path.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache");
      }
      res.sendFile(path.join(distDir, "index.html"), (error) => {
        if (error) next(error);
      });
    });
  }

  app.use((error, req, res, _next) => {
    const sanitized = sanitizeApiErrorForLog(error);
    logAlertableEvent(
      "unhandled_request_error",
      observabilityContext(req, {
        path: req.path,
        method: req.method,
        error: sanitized.message,
        errorCategory: sanitized.category
      })
    );
    if (!res.headersSent) {
      res.status(500).json({ ok: false, error: "Internal server error" });
    }
  });

  return app;
}
