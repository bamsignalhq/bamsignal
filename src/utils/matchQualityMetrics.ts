import { countEvent, countEventToday } from "./analytics";

export type MatchQualityMetrics = {
  conversationsStarted: number;
  conversationsStartedToday: number;
  signalsSent: number;
  signalsAccepted: number;
  matchRatePercent: number;
  conversationRatePercent: number;
  reportRatePercent: number;
  mutualInterestRatePercent: number;
  updatedAt: string;
};

export function getMatchQualityMetrics(): MatchQualityMetrics {
  const signalsSent = countEvent("signal_sent");
  const signalsAccepted = countEvent("signal_accepted");
  const conversationsStarted = countEvent("message_started");
  const conversationsStartedToday = countEventToday("message_started");
  const reports = countEvent("safety_report");

  const matchRatePercent =
    signalsSent > 0 ? Math.round((signalsAccepted / signalsSent) * 100) : 0;
  const conversationRatePercent =
    signalsAccepted > 0 ? Math.round((conversationsStarted / signalsAccepted) * 100) : 0;
  const reportRatePercent =
    signalsSent > 0 ? Math.round((reports / signalsSent) * 100) : 0;
  const mutualInterestRatePercent = matchRatePercent;

  return {
    conversationsStarted,
    conversationsStartedToday,
    signalsSent,
    signalsAccepted,
    matchRatePercent,
    conversationRatePercent,
    reportRatePercent,
    mutualInterestRatePercent,
    updatedAt: new Date().toISOString()
  };
}
