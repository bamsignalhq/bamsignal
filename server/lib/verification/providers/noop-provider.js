import { compareEmbeddings, hashEmbedding } from "./shared.js";

/** Deterministic no-op provider for CI / local without ML services. */
export function createNoopProvider() {
  const modelVersion = "noop-v1";
  return {
    id: "noop",
    modelVersion,
    async initialize() {},
    async detectFace(imageBytes) {
      return (imageBytes?.length || 0) >= 8000
        ? [{ box: { x: 0, y: 0, width: 1, height: 1 }, confidence: 1 }]
        : [];
    },
    async extractEmbedding(imageBytes) {
      return hashEmbedding(imageBytes, "noop", modelVersion, 64);
    },
    async compare(a, b) {
      return compareEmbeddings(a, b);
    },
    async verify(input) {
      const faces = await this.detectFace(input.selfieBytes);
      if (!faces.length) {
        return {
          ok: false,
          provider: "noop",
          modelVersion,
          facesDetected: 0,
          livenessPassed: false,
          matchConfidence: 0,
          reasonCode: "no_face"
        };
      }
      const selfieEmb = await this.extractEmbedding(input.selfieBytes);
      let best = 70;
      for (const photo of input.profilePhotoBytes || []) {
        const emb = await this.extractEmbedding(photo);
        best = Math.max(best, (await this.compare(selfieEmb, emb)).confidence);
      }
      return {
        ok: true,
        provider: "noop",
        modelVersion,
        facesDetected: 1,
        livenessPassed: true,
        matchConfidence: best,
        reasonCode: "ok",
        embedding: selfieEmb
      };
    }
  };
}
