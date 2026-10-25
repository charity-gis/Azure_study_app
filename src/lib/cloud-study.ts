import { z } from "zod";
import { defaultProgress, loadProgress, STORAGE_KEY } from "./content";
import { ACTIVITY_KEY, loadActivity, loadPlan, PLAN_KEY, planSchema } from "./study-plan";
import { readStudy, writeStudy } from "./device-storage";

export const QUIZ_KEY = "az900-quiz-history";
export const PLAN_TIME_KEY = "az900-plan-updated";
export const quizRunSchema = z.object({ id: z.string().uuid(), at: z.string().datetime(), score: z.number().int().min(0).max(100), questions: z.array(z.string()).min(1), results: z.array(z.boolean()) }).refine((run) => run.questions.length === run.results.length);
export type QuizRun = z.infer<typeof quizRunSchema>;
export const cloudStudySchema = z.object({
  plan: planSchema.nullable(), planUpdatedAt: z.string().datetime().nullable(),
  activity: z.object({ cards: z.array(z.string()), answered: z.array(z.string()), correct: z.array(z.string()) }),
  progress: z.object({ lastScore: z.number().min(0).max(100).nullable(), attempts: z.number().int().nonnegative(), cardsSeen: z.number().int().nonnegative() }),
  runs: z.array(quizRunSchema),
});
export type CloudStudy = z.infer<typeof cloudStudySchema>;
export function loadQuizRuns(): QuizRun[] {
  try { return z.array(quizRunSchema).parse(JSON.parse(readStudy(QUIZ_KEY) || "[]")); } catch { return []; }
}
export function recordQuizResult(questions: string[], results: boolean[]) {
  const run: QuizRun = { id: crypto.randomUUID(), at: new Date().toISOString(), questions, results, score: Math.round(results.filter(Boolean).length / results.length * 100) };
  writeStudy(QUIZ_KEY, JSON.stringify([...loadQuizRuns(), quizRunSchema.parse(run)]));
}
export function readSnapshot(): CloudStudy {
  let stamp: string | null = null;
  try { stamp = readStudy(PLAN_TIME_KEY); } catch { /* unavailable device storage */ }
  const plan = loadPlan();
  return cloudStudySchema.parse({ plan, planUpdatedAt: stamp || (plan ? "1970-01-01T00:00:00.000Z" : null), activity: loadActivity(), progress: loadProgress(), runs: loadQuizRuns() });
}
export function mergeStudy(a: CloudStudy, b: CloudStudy): CloudStudy {
  const latestPlan = (b.planUpdatedAt ?? "") > (a.planUpdatedAt ?? "") ? b : a;
  const union = (x: string[], y: string[]) => [...new Set([...x, ...y])].sort();
  const runs = [...new Map([...a.runs, ...b.runs].map((run) => [run.id, run])).values()].sort((x, y) => x.at.localeCompare(y.at) || x.id.localeCompare(y.id));
  return {
    plan: latestPlan.plan, planUpdatedAt: latestPlan.planUpdatedAt,
    activity: { cards: union(a.activity.cards, b.activity.cards), answered: union(a.activity.answered, b.activity.answered), correct: union(a.activity.correct, b.activity.correct) },
    progress: { cardsSeen: Math.max(a.progress.cardsSeen, b.progress.cardsSeen), attempts: Math.max(a.progress.attempts, b.progress.attempts, runs.length), lastScore: runs.at(-1)?.score ?? a.progress.lastScore ?? b.progress.lastScore },
    runs,
  };
}
export function applySnapshot(snapshot: CloudStudy) {
  writeStudy(PLAN_KEY, JSON.stringify(snapshot.plan), false);
  writeStudy(PLAN_TIME_KEY, snapshot.planUpdatedAt ?? "", false);
  writeStudy(ACTIVITY_KEY, JSON.stringify(snapshot.activity), false);
  writeStudy(STORAGE_KEY, JSON.stringify(snapshot.progress), false);
  writeStudy(QUIZ_KEY, JSON.stringify(snapshot.runs), false);
}
export function emptySnapshot(): CloudStudy { return { plan: null, planUpdatedAt: null, activity: { cards: [], answered: [], correct: [] }, progress: { ...defaultProgress }, runs: [] }; }