import { beforeEach, describe, expect, it } from "vitest";
import { applySnapshot, emptySnapshot, loadQuizRuns, mergeStudy, readSnapshot, recordQuizResult } from "@/lib/cloud-study";
import { recordCard, savePlan } from "@/lib/study-plan";
import { setStudyOwner } from "@/lib/device-storage";
import { flashcards } from "@/lib/content";

beforeEach(() => { localStorage.clear(); setStudyOwner(null); });
describe("Cross-device study saving", () => {
  it("merges flashcard and question progress without losing either device's work", () => {
    const phone = emptySnapshot(); phone.activity.cards = ["IaaS"]; phone.activity.answered = ["Question A"];
    const laptop = emptySnapshot(); laptop.activity.cards = ["PaaS"]; laptop.activity.correct = ["Question A"]; laptop.activity.answered = ["Question A"];
    const merged = mergeStudy(phone, laptop);
    expect(merged.activity).toEqual({ cards: ["IaaS", "PaaS"], answered: ["Question A"], correct: ["Question A"] });
    expect(mergeStudy(laptop, phone)).toEqual(merged);
    expect(mergeStudy(merged, phone)).toEqual(merged);
  });
  it("preserves guest data and separates accounts on the same device", () => {
    recordCard("IaaS");
    setStudyOwner("account-a"); recordCard("PaaS");
    setStudyOwner("account-b"); expect(readSnapshot().activity.cards).toEqual([]);
    setStudyOwner("account-a"); expect(readSnapshot().activity.cards).toEqual(["PaaS"]);
    setStudyOwner(null); expect(readSnapshot().activity.cards).toEqual(["IaaS"]);
  });
  it("keeps both devices' quiz results and counts repeated syncing only once", () => {
    recordQuizResult(["Question A"], [true]); const phone = readSnapshot();
    localStorage.clear(); recordQuizResult(["Question B"], [false]); const laptop = readSnapshot();
    const merged = mergeStudy(phone, laptop);
    expect(merged.runs).toHaveLength(2);
    expect(merged.progress.attempts).toBe(2);
    expect(mergeStudy(merged, phone).runs).toHaveLength(2);
    applySnapshot(merged); expect(loadQuizRuns()).toHaveLength(2);
  });
  it("keeps the latest plan when an older device reconnects", () => {
    const older = emptySnapshot(); older.plan = { domains: ["cloud"], days: [1], start: "2026-10-26", end: "2026-11-01", time: "18:00", minutes: 20 }; older.planUpdatedAt = "2026-10-23T18:00:00.000Z";
    const newer = emptySnapshot(); newer.plan = { ...older.plan, domains: ["management"], time: "19:30" }; newer.planUpdatedAt = "2026-10-23T19:00:00.000Z";
    expect(mergeStudy(newer, older).plan).toEqual(newer.plan);
    expect(mergeStudy(older, newer).plan).toEqual(newer.plan);
  });
  it("imports a pre-existing device plan without inventing flashcard completion", () => {
    savePlan({ domains: ["cloud"], days: [1], start: "2026-10-26", end: "2026-11-01", time: "18:00", minutes: 20 });
    localStorage.removeItem("az900-plan-updated");
    const merged = mergeStudy(emptySnapshot(), readSnapshot());
    expect(merged.plan?.domains).toEqual(["cloud"]);
    expect(merged.activity.cards).toHaveLength(0);
    expect(flashcards.length).toBeGreaterThan(0);
  });
});