import {runGoalCoachAgent, type AnalyzeGoalOptions} from "@/lib/ai/goalCoachAgent";
import type {AnalyzeGoalResult} from "@/types/tasks";

export async function analyzeGoal(
  goal: string,
  options?: AnalyzeGoalOptions,
): Promise<AnalyzeGoalResult> {
  return runGoalCoachAgent(goal, options);
}
