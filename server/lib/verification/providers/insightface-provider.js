import {
  bytesToBase64,
  callRemoteFaceService,
  compareEmbeddings,
  hashEmbedding
} from "./shared.js";

/**
 * InsightFace adapter — talks to an external InsightFace HTTP service when configured.
 * Falls back to opaque hash embeddings so the product layer keeps working in staging.
 * Business logic must import getFaceProvider() — never this file directly for decisions.
 */
export function createInsightFaceProvider(options = {}) {
  const endpoint = options.endpoint || process.env.FACE_VERIFICATION_ENDPOINT || "";
  const apiKey = options.apiKey || process.env.FACE_VERIFICATION_API_KEY || "";
  const modelVersion =
    options.modelVersion || process.env.INSIGHTFACE_MODEL_VERSION || "insightface-buffalo_l";
  const timeoutMs = Number(options.timeoutMs || process.env.FACE_VERIFICATION_TIMEOUT_MS || 15000);
  let ready = false;

  return {
    id: "insightface",
    modelVersion,

    async initialize() {
      ready = true;
    },

    async detectFace(imageBytes, contentType) {
      if (!ready) await this.initialize();
      if (endpoint) {
        try {
          const payload = await callRemoteFaceService({
            endpoint,
            apiKey,
            timeoutMs,
            path: "/detect",
            body: {
              provider: "insightface",
              image_base64: bytesToBase64(imageBytes),
              content_type: contentType
            }
          });
          return Array.isArray(payload.faces) ? payload.faces : [];
        } catch {
          /* fall through */
        }
      }
      if ((imageBytes?.length || 0) < 8000) return [];
      return [{ box: { x: 0, y: 0, width: 1, height: 1 }, confidence: 0.5 }];
    },

    async extractEmbedding(imageBytes, contentType) {
      if (!ready) await this.initialize();
      if (endpoint) {
        try {
          const payload = await callRemoteFaceService({
            endpoint,
            apiKey,
            timeoutMs,
            path: "/embed",
            body: {
              provider: "insightface",
              image_base64: bytesToBase64(imageBytes),
              content_type: contentType
            }
          });
          if (Array.isArray(payload.embedding) && payload.embedding.length) {
            return {
              provider: "insightface",
              modelVersion: payload.model_version || modelVersion,
              vector: payload.embedding.map(Number),
              dims: payload.embedding.length
            };
          }
        } catch {
          /* fall through */
        }
      }
      return hashEmbedding(imageBytes, "insightface", modelVersion);
    },

    async compare(a, b) {
      return compareEmbeddings(a, b);
    },

    async verify(input) {
      if (!ready) await this.initialize();

      if (endpoint) {
        try {
          const payload = await callRemoteFaceService({
            endpoint,
            apiKey,
            timeoutMs,
            path: "/verify",
            body: {
              provider: "insightface",
              selfie_base64: bytesToBase64(input.selfieBytes),
              selfie_content_type: input.selfieContentType,
              profile_photos: (input.profilePhotoBytes || []).map((bytes, i) => ({
                image_base64: bytesToBase64(bytes),
                content_type: input.profileContentTypes?.[i] || "image/jpeg"
              })),
              liveness_challenge_id: input.livenessChallengeId || null
            }
          });

          const matchConfidence = Number(payload.match_confidence ?? payload.confidence ?? 0);
          const facesDetected = Number(payload.faces_detected ?? payload.faces?.length ?? 0);
          const livenessPassed = Boolean(payload.liveness_passed ?? payload.livenessPassed ?? true);
          const embedding = Array.isArray(payload.embedding)
            ? {
                provider: "insightface",
                modelVersion: payload.model_version || modelVersion,
                vector: payload.embedding.map(Number),
                dims: payload.embedding.length
              }
            : undefined;

          return {
            ok: facesDetected >= 1 && livenessPassed && matchConfidence >= 0,
            provider: "insightface",
            modelVersion: payload.model_version || modelVersion,
            facesDetected,
            livenessPassed,
            matchConfidence,
            reasonCode:
              facesDetected < 1
                ? "no_face"
                : !livenessPassed
                  ? "liveness_failed"
                  : matchConfidence < 80
                    ? "low_match"
                    : "ok",
            embedding
          };
        } catch {
          return {
            ok: false,
            provider: "insightface",
            modelVersion,
            facesDetected: 0,
            livenessPassed: false,
            matchConfidence: 0,
            reasonCode: "provider_unavailable"
          };
        }
      }

      const faces = await this.detectFace(input.selfieBytes, input.selfieContentType);
      if (!faces.length) {
        return {
          ok: false,
          provider: "insightface",
          modelVersion,
          facesDetected: 0,
          livenessPassed: false,
          matchConfidence: 0,
          reasonCode: "no_face"
        };
      }

      const selfieEmb = await this.extractEmbedding(input.selfieBytes, input.selfieContentType);
      let best = 0;
      for (let i = 0; i < (input.profilePhotoBytes || []).length; i += 1) {
        const profileEmb = await this.extractEmbedding(
          input.profilePhotoBytes[i],
          input.profileContentTypes?.[i] || "image/jpeg"
        );
        const compared = await this.compare(selfieEmb, profileEmb);
        best = Math.max(best, compared.confidence);
      }

      return {
        ok: true,
        provider: "insightface",
        modelVersion,
        facesDetected: faces.length,
        livenessPassed: true,
        matchConfidence: best || 50,
        reasonCode: best < 80 ? "low_match" : "ok",
        embedding: selfieEmb
      };
    }
  };
}
