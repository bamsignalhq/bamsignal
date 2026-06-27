import dotenv from "dotenv";
import { resolvePerformanceCertConfig } from "../../shared/performanceCertificationConfig.mjs";

dotenv.config();

const resolved = resolvePerformanceCertConfig(process.env);

export const config = {
  ...resolved,
  runId: resolved.runId
};
