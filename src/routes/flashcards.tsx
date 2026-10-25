import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, RotateCw, Lightbulb } from "lucide-react";
import { flashcards as allFlashcards, loadProgress, saveProgress } from "@/lib/content";
import { domainById, domainFlashcards, studySearch } from "@/lib/syllabus";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { recordCard } from "@/lib/study-plan";

export const Route = createFileRoute("/flashcards")({
  validateSearch: studySearch,
  head: () => ({
    meta: [
      { title: "Flashcard Coach — AZ-900 Study (Unofficial)" },
      { name: "description", content: "Swipe through friendly flashcards on CapEx vs OpEx, IaaS/PaaS/SaaS, regions and more." },
      { property: "og:title", content: "Flashcard Coach — AZ-900 Study (Unofficial)" },
      { property: "og:description", content: "Friendly, swipeable flashcards on core Azure concepts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Flashcards,
});

function Flashcards() {
  const { domain } = Route.useSearch();
  return <FlashcardSet key={domain ?? "all"} domain={domain} />;
}

function FlashcardSet({ domain }: { domain: "cloud" | "architecture" | "management" | undefined }) {
  const flashcards = domainFlashcards(domain);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const startX = useRef<number | null>(null);
  const card = flashcards[i];

  useEffect(() => {
    if (flipped && card) recordCard(card.term);
  }, [flipped, card]);

  useEffect(() => {
    const seen = loadProgress().cardsSeen;
    const globalIndex = allFlashcards.findIndex((item) => item.term === card?.term);
    if (globalIndex + 1 > seen) saveProgress({ cardsSeen: globalIndex + 1 });
  }, [i, card?.term]);

  const go = (d: number) => {
    setFlipped(false);
    setI((x) => (x + d + flashcards.length) % flashcards.length);
  };

  if (!card) return null;

  return (
    <div className="pb-6">
      <PageHeader title="Flashcard Coach" right={<span className="text-sm font-medium text-muted-foreground">{i + 1}/{flashcards.length}</span>} />
      <Button asChild variant="link" className="mb-3 px-0"><Link to="/study-plan">My study plan</Link></Button>
      {domain && <div className="mb-4 space-y-2"><p className="text-sm font-semibold text-primary">{domainById(domain)?.title}</p><Link to="/syllabus" className="text-sm text-primary underline">Back to syllabus</Link></div>}
      <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${((i + 1) / flashcards.length) * 100}%` }} />
      </div>

      <div
        className="flip h-[420px] cursor-pointer select-none"
        role="button"
        tabIndex={0}
        aria-label={`Flip ${card.term} flashcard`}
        aria-pressed={flipped}
        onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setFlipped((f) => !f); } }}
        onClick={() => setFlipped((f) => !f)}
        onTouchStart={(e) => (startX.current = e.touches[0]?.clientX ?? null)}
        onTouchEnd={(e) => {
          if (startX.current === null) return;
          const touch = e.changedTouches[0];
          if (!touch) return;
          const dx = touch.clientX - startX.current;
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
          startX.current = null;
        }}
      >
        <div className={`flip-inner relative h-full ${flipped ? "flipped" : ""}`}>
          <div className="flip-face bg-hero absolute inset-0 flex flex-col justify-between rounded-3xl p-7 text-primary-foreground shadow-card">
            <span className="w-fit rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold">{card.tag}</span>
            <h2 className="text-3xl font-bold leading-tight">{card.term}</h2>
            <p className="flex items-center gap-2 text-sm opacity-80"><RotateCw className="h-4 w-4" /> Tap to flip · Swipe for next</p>
          </div>
          <div className="flip-face flip-back absolute inset-0 flex flex-col gap-4 rounded-3xl bg-card p-7 shadow-card">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">{card.term}</span>
            <p className="text-lg leading-relaxed">{card.simple}</p>
            <div className="mt-auto rounded-2xl bg-warning p-4 text-sm text-warning-foreground">
              <p className="mb-1 flex items-center gap-1.5 font-semibold"><Lightbulb className="h-4 w-4" /> Think of it like</p>
              {card.example}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <button onClick={() => go(-1)} className="flex h-12 flex-1 items-center justify-center gap-1 rounded-xl bg-card font-semibold shadow-card"><ChevronLeft className="h-5 w-5" /> Prev</button>
        <button onClick={() => go(1)} className="flex h-12 flex-1 items-center justify-center gap-1 rounded-xl bg-primary font-semibold text-primary-foreground shadow-card">Next <ChevronRight className="h-5 w-5" /></button>
      </div>
    </div>
  );
}
