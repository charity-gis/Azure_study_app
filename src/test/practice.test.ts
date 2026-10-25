import { describe, expect, it } from "vitest";
import { questions } from "@/lib/content";
import { missedQuestions, practiceQuestions } from "@/lib/practice";

describe("Personalized practice", () => {
  it("limits a mixed practice session to five questions", () => {
    expect(practiceQuestions("All topics", 5)).toHaveLength(5);
  });
  it("includes only the selected topic", () => {
    const selected = practiceQuestions("Security", 10);
    expect(selected.length).toBeGreaterThan(0);
    expect(selected.every((q) => q.topic === "Security")).toBe(true);
  });
  it("retries only incorrectly answered questions", () => {
    expect(missedQuestions(questions.slice(0, 3), [true, false, true])).toEqual([questions[1]]);
  });
});