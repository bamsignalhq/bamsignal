/**
 * Signal ingestion module — Platform Implementation Phase 1.
 *
 * @see docs/architecture/SIGNAL_INGESTION.md
 */

export type {
  SignalIngestionStage,
  SignalIngestionStageDefinition,
  SignalIngestionContext,
  SignalIngestionResult,
  NormalizedTrustSignal,
  SignalIngestionClient,
  SignalIngestionPipeline
} from "./pipeline";

export {
  SIGNAL_INGESTION_PIPELINE,
  listIngestionStages,
  getIngestionStage
} from "./pipeline";
