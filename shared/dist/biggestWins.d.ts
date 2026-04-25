import type { BiggestWinsResult, SessionRecord } from "./types";
/**
 * Computes Phase 2 "biggest wins" metrics from sessions (last 90d window for month-over-month).
 */
export declare function computeBiggestWins(sessions: SessionRecord[], nowMs?: number): BiggestWinsResult;
//# sourceMappingURL=biggestWins.d.ts.map