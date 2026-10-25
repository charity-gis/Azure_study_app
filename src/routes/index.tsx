import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, CalendarDays, ChevronRight, Layers, ListChecks, Sparkles, Trophy } from "lucide-react";
import { defaultProgress, loadProgress, readyScore, type Progress } from "@/lib/content";
import { STUDY_REFRESHED } from "@/lib/device-storage";
import { loadQuizRuns, type QuizRun } from "@/lib/cloud-study";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AZ-900 Smart Quiz & Flashcard Coach (Unofficial)" },
      { name: "description", content: "Unofficial AZ-900 study coach: friendly flashcards and an instant-feedback mock quiz." },
      { property: "og:title", content: "AZ-900 Smart Quiz & Flashcard Coach (Unofficial)" },
      { property: "og:description", content: "Friendly flashcards and an instant-feedback mock quiz for AZ-900 prep." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [p, setP] = useState<Progress>(defaultProgress);
  const [runs, setRuns] = useState<QuizRun[]>([]);
  useEffect(() => {
    const refresh = () => { setP(loadProgress()); setRuns(loadQuizRuns()); };
    refresh(); window.addEventListener(STUDY_REFRESHED, refresh);
    return () => window.removeEventListener(STUDY_REFRESHED, refresh);
  }, []);
  const score = readyScore(p);
  const r = 52, c = 2 * Math.PI * r;

  return (
    <div className="space-y-6 py-5">
      <div>
        <p className="text-sm font-medium text-muted-foreground">AZ-900 Study Coach</p>
        <h1 className="text-2xl font-bold">Ready to level up? <Sparkles className="inline h-5 w-5 text-accent" /></h1>
      </div>

      <section className="bg-hero relative overflow-hidden rounded-3xl p-6 text-primary-foreground shadow-card">
        <div className="flex items-center gap-5">
          <svg viewBox="0 0 120 120" className="h-28 w-28 shrink-0 -rotate-90">
            <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor" strokeOpacity=".2" strokeWidth="10" />
            <circle cx="60" cy="60" r={r} fill="none" className="stroke-accent transition-all duration-700" strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (score / 100) * c} />
            <text x="60" y="68" textAnchor="middle" className="rotate-90 fill-current font-bold" style={{ fontSize: 26, transformOrigin: "60px 60px" }}>{score}%</text>
          </svg>
          <div>
            <p className="text-xs uppercase tracking-widest opacity-80">Mock Ready Score</p>
            <p className="mt-1 text-xl font-semibold">{score >= 80 ? "Exam ready!" : score >= 50 ? "Getting there" : "Just starting"}</p>
            <p className="mt-2 text-sm opacity-80">Last quiz: {p.lastScore === null ? "—" : `${p.lastScore}%`} · Cards: {p.cardsSeen}</p>
          </div>
        </div>
      </section>

      <div className="space-y-3">
        <ModeCard to="/study-plan" icon={<CalendarDays className="h-6 w-6" />} title="My Study Plan" desc="Your domains, weekly schedule and study progress." />
        <ModeCard to="/syllabus" icon={<BookOpen className="h-6 w-6" />} title="AZ-900 Syllabus" desc="Exam domains and matching study sets." />
        <ModeCard to="/flashcards" icon={<Layers className="h-6 w-6" />} title="Flashcard Coach" desc="Tap to flip core Azure concepts in plain English." />
        <ModeCard to="/quiz" icon={<ListChecks className="h-6 w-6" />} title="Smart Quiz Builder" desc="Topic practice, instant feedback and missed-question review." />
        <ModeCard to="/coach" icon={<Sparkles className="h-6 w-6" />} title="Topic Coach" desc="Plain-language explanations and practical Azure examples." />
      </div>

      <div className="flex items-center gap-3 rounded-2xl bg-secondary p-4 text-sm text-secondary-foreground">
        <Trophy className="h-5 w-5 shrink-0 text-primary" />
        Aim for 80%+ on the mock quiz before booking your exam.
      </div>
      {runs.length > 0 && <section className="space-y-3 border-t pt-5"><h2 className="font-semibold">Recent quiz results</h2>{runs.slice(-5).reverse().map((run) => <details key={run.id} className="rounded-lg border bg-card p-3"><summary className="cursor-pointer text-sm font-semibold">{run.score}% · {run.questions.length} questions · {new Date(run.at).toLocaleDateString()}</summary><ul className="mt-3 space-y-3">{run.questions.map((question, index) => <li key={index} className="text-sm"><span className={run.results[index] ? "text-success" : "text-destructive"}>{run.results[index] ? "Correct" : "Missed"}</span><p className="mt-1 text-muted-foreground">{question}</p></li>)}</ul></details>)}</section>}
    </div>
  );
}

function ModeCard({ to, icon, title, desc }: { to: "/flashcards" | "/quiz" | "/coach" | "/syllabus" | "/study-plan"; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Link to={to} className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-card transition active:scale-[.98]">
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-secondary text-primary">{icon}</div>
      <div className="flex-1">
        <h2 className="font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </Link>
  );
}
