import { describe, it, expect } from "vitest";
import { flashcards, questions } from "@/lib/content";
import { syllabusDomains, domainFlashcards, domainQuestions, studySearch } from "@/lib/syllabus";
import { practiceQuestions } from "@/lib/practice";

describe("Syllabus study sets", () => {
  it("lists all three AZ-900 domains", () => {
    expect(syllabusDomains.map((domain) => domain.id)).toEqual(["cloud", "architecture", "management"]);
  });
  it("maps every existing card and question to exactly one domain", () => {
    const cards = syllabusDomains.flatMap((domain) => domainFlashcards(domain.id));
    const quiz = syllabusDomains.flatMap((domain) => domainQuestions(domain.id));
    expect(cards).toHaveLength(flashcards.length);
    expect(new Set(cards).size).toBe(flashcards.length);
    expect(quiz).toHaveLength(questions.length);
    expect(new Set(quiz).size).toBe(questions.length);
  });
  it("limits practice to the selected domain and topic", () => {
    expect(practiceQuestions("All topics", 15, "management").map((q) => q.topic)).toEqual(["Governance", "Cost Management"]);
    expect(practiceQuestions("Storage", 1, "architecture")).toHaveLength(1);
    expect(practiceQuestions("Storage", 5, "cloud")).toHaveLength(0);
  });
  it("ignores invalid domain links", () => {
    expect(studySearch.parse({ domain: "invalid" }).domain).toBeUndefined();
  });
});