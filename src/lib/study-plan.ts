import { z } from "zod";
import { readStudy, writeStudy } from "./device-storage";
import { flashcards, questions } from "./content";
import { domainFlashcards, domainQuestions, type DomainId } from "./syllabus";

export const PLAN_KEY = "az900-study-plan";
export const ACTIVITY_KEY = "az900-study-activity";
const domainSchema = z.enum(["cloud", "architecture", "management"]);
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}, "Choose a valid date.");
export const planSchema = z.object({
  domains: z.array(domainSchema).min(1).transform((items) => [...new Set(items)]),
  start: dateSchema,
  end: dateSchema,
  days: z.array(z.number().int().min(0).max(6)).min(1).transform((items) => [...new Set(items)]),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  minutes: z.number().int().min(5).max(120),
}).refine((plan) => plan.end >= plan.start, { message: "Target date must be on or after your start date." })
  .refine((plan) => (Date.parse(`${plan.end}T12:00:00Z`) - Date.parse(`${plan.start}T12:00:00Z`)) / 86400000 <= 365, { message: "Choose a schedule within one year." });
export type StudyPlan = z.infer<typeof planSchema>;
const activitySchema = z.object({ cards: z.array(z.string()), answered: z.array(z.string()), correct: z.array(z.string()) });
export type StudyActivity = z.infer<typeof activitySchema>;
export const emptyActivity: StudyActivity = { cards: [], answered: [], correct: [] };

export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function loadPlan(): StudyPlan | null {
  try { return planSchema.parse(JSON.parse(readStudy(PLAN_KEY) || "null")); } catch { return null; }
}
export function savePlan(plan: StudyPlan): boolean {
  try { writeStudy("az900-plan-updated", new Date().toISOString(), false); writeStudy(PLAN_KEY, JSON.stringify(planSchema.parse(plan))); return true; } catch { return false; }
}
export function loadActivity(): StudyActivity {
  try { return activitySchema.parse(JSON.parse(readStudy(ACTIVITY_KEY) || "null")); } catch { return { cards: [], answered: [], correct: [] }; }
}
function storeActivity(activity: StudyActivity) {
  try { writeStudy(ACTIVITY_KEY, JSON.stringify(activity)); } catch { /* Device storage may be unavailable. */ }
}
export function recordCard(term: string) {
  if (!flashcards.some((card) => card.term === term)) return;
  const activity = loadActivity();
  activity.cards = [...new Set([...activity.cards, term])];
  storeActivity(activity);
}
export function recordAnswer(question: string, correct: boolean) {
  if (!questions.some((item) => item.q === question)) return;
  const activity = loadActivity();
  activity.answered = [...new Set([...activity.answered, question])];
  if (correct) activity.correct = [...new Set([...activity.correct, question])];
  storeActivity(activity);
}
export function studyCoverage(domains: DomainId[], activity: StudyActivity) {
  const cards = domains.flatMap(domainFlashcards);
  const quiz = domains.flatMap(domainQuestions);
  const reviewed = cards.filter((card) => activity.cards.includes(card.term)).length;
  const answered = quiz.filter((question) => activity.answered.includes(question.q)).length;
  const correct = quiz.filter((question) => activity.correct.includes(question.q)).length;
  const total = cards.length + quiz.length;
  return { reviewed, answered, correct, cards: cards.length, questions: quiz.length, percent: total ? Math.round((reviewed + answered) / total * 100) : 0 };
}
export function scheduledSessions(plan: StudyPlan) {
  const sessions: { date: string; domain: DomainId }[] = [];
  const parsed = planSchema.safeParse(plan);
  if (!parsed.success) return sessions;
  const current = new Date(`${plan.start}T12:00:00Z`);
  for (let index = 0; index <= 365; index++) {
    const date = current.toISOString().slice(0, 10);
    if (date > plan.end) break;
    if (plan.days.includes(current.getUTCDay())) {
      const domain = parsed.data.domains[sessions.length % parsed.data.domains.length];
      if (domain) sessions.push({ date, domain });
    }
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return sessions;
}