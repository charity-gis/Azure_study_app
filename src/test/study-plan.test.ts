import { beforeEach, describe, expect, it } from "vitest";
import { domainFlashcards, domainQuestions } from "@/lib/syllabus";
import { ACTIVITY_KEY, loadActivity, loadPlan, planSchema, recordAnswer, recordCard, savePlan, scheduledSessions, studyCoverage, type StudyPlan } from "@/lib/study-plan";

const plan: StudyPlan = { domains: ["cloud", "management"], start: "2026-10-26", end: "2026-11-01", days: [1, 3, 5], time: "18:00", minutes: 20 };
beforeEach(() => localStorage.clear());
describe("Study plan", () => {
  it("saves selected domains and schedule on the device", () => {
    expect(savePlan(plan)).toBe(true);
    expect(loadPlan()).toEqual(plan);
  });
  it("schedules only chosen weekdays and rotates chosen domains", () => {
    expect(scheduledSessions(plan)).toEqual([
      { date: "2026-10-26", domain: "cloud" },
      { date: "2026-10-28", domain: "management" },
      { date: "2026-10-30", domain: "cloud" },
    ]);
  });
  it("requires at least one domain", () => { expect(planSchema.safeParse({ ...plan, domains: [] }).success).toBe(false); });
  it("requires at least one study day", () => { expect(planSchema.safeParse({ ...plan, days: [] }).success).toBe(false); });
  it("rejects a target before the start", () => { expect(planSchema.safeParse({ ...plan, end: "2026-10-25" }).success).toBe(false); });
  it("rejects impossible calendar dates", () => { expect(planSchema.safeParse({ ...plan, start: "2026-02-30" }).success).toBe(false); });
  it("tracks unique flashcards and questions within selected domains", () => {
    const card = domainFlashcards("management")[0];
    const question = domainQuestions("management")[0];
    const other = domainQuestions("cloud")[0];
    if (!card || !question || !other) throw new Error("Missing study content");
    recordCard(card.term); recordCard(card.term);
    recordAnswer(question.q, false); recordAnswer(question.q, true); recordAnswer(question.q, false);
    recordAnswer(other.q, true);
    expect(studyCoverage(["management"], loadActivity())).toEqual({ reviewed: 1, answered: 1, correct: 1, cards: 2, questions: 2, percent: 50 });
  });
  it("combines flashcard and question coverage to reach completion", () => {
    domainFlashcards("management").forEach((card) => recordCard(card.term));
    domainQuestions("management").forEach((question) => recordAnswer(question.q, false));
    expect(studyCoverage(["management"], loadActivity()).percent).toBe(100);
    expect(studyCoverage(["management"], loadActivity()).correct).toBe(0);
  });
  it("recovers safely from invalid device data", () => {
    localStorage.setItem(ACTIVITY_KEY, '{"cards":4}');
    expect(loadActivity()).toEqual({ cards: [], answered: [], correct: [] });
  });
});