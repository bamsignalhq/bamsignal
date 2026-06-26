import dotenv from "dotenv";

/** Load .env.local then .env for certification runners (staging profile). */
export function loadCertificationEnvironment() {
  dotenv.config({ path: ".env.local" });
  dotenv.config();
}
