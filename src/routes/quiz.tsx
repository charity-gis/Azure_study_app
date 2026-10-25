import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Home } from "lucide-react";
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis, ReferenceLine } from "recharts";
import { questions, loadProgress, saveProgress, type Question } from "@/lib/content";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { missedQuestions, practiceQuestions } from "@/lib/practice";
import { domainById, domainQuestions, studySearch } from "@/lib/syllabus";
import { recordAnswer } from "@/lib/study-plan";
import { recordQuizResult } from "@/lib/cloud-study";

export const Route = createFileRoute("/quiz")({
  validateSearch: studySearch,
  head: () => ({
    meta: [
      { title: "Smart Quiz Builder — AZ-900 Mock Exam (Unofficial)" },
      { name: "description", content: "Personalized AZ-900 practice by topic with instant feedback, missed-question retries and a readiness tracker." },
      { property: "og:title", content: "Smart Quiz Builder — AZ-900 Mock Exam (Unofficial)" },
      { property: "og:description", content: "Practice Azure topics, review missed answers and track your quiz score." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Quiz,
});

function Quiz() {
  const { domain } = Route.useSearch();
  return <QuizSession key={domain ?? "all"} domain={domain} />;
}

function QuizSession({ domain }: { domain: "cloud" | "architecture" | "management" | undefined }) {
  const availableQuestions = domainQuestions(domain);
  const [session, setSession] = useState<Question[]>([]);
  const [topic, setTopic] = useState("All topics");
  const [count, setCount] = useState(5);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const done = session.length > 0 && results.length === session.length && picked === null;
  const q = session[idx];

  const begin = (items: Question[]) => { setSession(items); setIdx(0); setPicked(null); setResults([]); };

  const choose = (o: number) => {
    if (picked !== null || !q) return;
    setPicked(o);
    recordAnswer(q.q, o === q.answer);
    setResults((r) => [...r, o === q.answer]);
  };
  const next = () => {
    if (idx + 1 >= session.length) {
      const pct = Math.round((results.filter(Boolean).length / session.length) * 100);
      saveProgress({ lastScore: pct, attempts: loadProgress().attempts + 1 });
      recordQuizResult(session.map((question) => question.q), results);
    } else setIdx(idx + 1);
    setPicked(null);
  };
  const restart = () => begin([]);

  if (done) return <Results session={session} results={results} onRestart={restart} onRetryMissed={() => begin(missedQuestions(session, results))} />;

  if (!q) {
    const available = practiceQuestions(topic, count, domain).length;
    return (
      <div className="space-y-6 pb-6">
        <PageHeader title="Build your practice" />
        <Button asChild variant="link" className="px-0"><Link to="/study-plan">My study plan</Link></Button>
        {domain && <div className="space-y-2"><p className="text-sm font-semibold text-primary">{domainById(domain)?.title}</p><Link to="/syllabus" className="text-sm text-primary underline">Back to syllabus</Link></div>}
        <div className="space-y-2">
          <label htmlFor="quiz-topic" className="text-sm font-semibold">Topic</label>
          <select id="quiz-topic" value={topic} onChange={(e) => setTopic(e.target.value)} className="h-12 w-full rounded-md border border-input bg-card px-3 text-sm">
            {["All topics", ...new Set(availableQuestions.map((item) => item.topic))].map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold">Question limit</legend>
          <div className="flex gap-2">{[5, 10, questions.length].map((n) => <Button key={n} variant={count === n ? "default" : "outline"} onClick={() => setCount(n)} className="h-11 flex-1" aria-pressed={count === n}>{n === questions.length ? "All" : n}</Button>)}</div>
        </fieldset>
        <p className="text-sm text-muted-foreground">{available} questions · {topic}</p>
        <Button className="h-12 w-full" onClick={() => begin(practiceQuestions(topic, count, domain))} disabled={available === 0}>Start practice <ArrowRight /></Button>
      </div>
    );
  }

  return (
    <div className="pb-6">
      <PageHeader title="Smart Quiz" right={<span className="text-sm font-medium text-muted-foreground">{idx + 1}/{session.length}</span>} />
      <Button asChild variant="link" className="mb-3 px-0"><Link to="/study-plan">My study plan</Link></Button>
      <div className="mb-5 flex gap-1.5">
        {session.map((_, k) => (
          <div key={k} className={`h-1.5 flex-1 rounded-full ${k < results.length ? (results[k] ? "bg-success" : "bg-destructive") : k === idx ? "bg-primary" : "bg-secondary"}`} />
        ))}
      </div>

      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">{q.topic}</span>
      <h2 className="mt-3 text-lg font-semibold leading-snug">{q.q}</h2>

      <div className="mt-5 space-y-3">
        {q.options.map((opt, o) => {
          const isAns = o === q.answer, isPick = o === picked;
          const state = picked === null ? "bg-card" : isAns ? "bg-success/10 border-success" : isPick ? "bg-destructive/10 border-destructive" : "bg-card opacity-60";
          return (
            <Button variant="outline" key={o} onClick={() => choose(o)} disabled={picked !== null}
              className={`flex h-auto min-h-16 w-full items-center gap-3 whitespace-normal rounded-lg border-2 border-transparent p-4 text-left shadow-card transition disabled:opacity-100 ${state}`}>
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-secondary text-xs font-bold">{String.fromCharCode(65 + o)}</span>
              <span className="flex-1 text-sm font-medium">{opt}</span>
              {picked !== null && isAns && <CheckCircle2 className="h-5 w-5 text-success" />}
              {picked !== null && isPick && !isAns && <XCircle className="h-5 w-5 text-destructive" />}
            </Button>
          );
        })}
      </div>

      {picked !== null && (
        <div className="mt-5 animate-in fade-in slide-in-from-bottom-2 rounded-2xl bg-card p-5 shadow-card">
          <p className={`flex items-center gap-2 font-semibold ${picked === q.answer ? "text-success" : "text-destructive"}`}>
            {picked === q.answer ? <><CheckCircle2 className="h-5 w-5" /> Correct!</> : <><XCircle className="h-5 w-5" /> Not quite</>}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{q.explanation}</p>
          <Button onClick={next} className="mt-4 h-12 w-full">
            {idx + 1 >= session.length ? "See my results" : "Next question"} <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function Results({ session, results, onRestart, onRetryMissed }: { session: Question[]; results: boolean[]; onRestart: () => void; onRetryMissed: () => void }) {
  const correct = results.filter(Boolean).length;
  const pct = Math.round((correct / results.length) * 100);
  const data = [
    { name: "Your score", value: pct, key: "you" },
    { name: "Target", value: 80, key: "target" },
  ];
  return (
    <div className="space-y-5 pb-6">
      <PageHeader title="Readiness Tracker" />
      <Button asChild variant="link" className="px-0"><Link to="/study-plan">My study plan</Link></Button>
      <div className="bg-hero rounded-3xl p-6 text-center text-primary-foreground shadow-card">
        <p className="text-xs uppercase tracking-widest opacity-80">Final score</p>
        <p className="mt-1 text-5xl font-bold">{pct}%</p>
        <p className="mt-2 text-sm opacity-90">{correct} of {results.length} correct · {pct >= 80 ? "You're on track for exam day!" : "Review the flashcards and try again."}</p>
      </div>
      <div className="rounded-2xl bg-card p-4 shadow-card">
        <h3 className="mb-3 font-semibold">Readiness vs. target</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis domain={[0, 100]} tickLine={false} axisLine={false} fontSize={12} />
              <ReferenceLine y={80} strokeDasharray="4 4" stroke="var(--color-accent)" />
              <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                {data.map((d) => <Cell key={d.key} fill={d.key === "you" ? (pct >= 80 ? "var(--color-success)" : "var(--color-primary)") : "var(--color-secondary)"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex gap-1.5">
          {results.map((r, k) => (
            <div key={k} className={`flex-1 rounded-lg py-2 text-center text-xs font-semibold ${r ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>Q{k + 1}</div>
          ))}
        </div>
      </div>
      {correct < results.length && <Button onClick={onRetryMissed} className="h-12 w-full"><RotateCcw /> Retry {results.length - correct} missed questions</Button>}
      <section className="space-y-3">
        <h3 className="font-semibold">Answer review</h3>
        {session.map((question, index) => <details key={`${question.q}-${index}`} className="rounded-lg border bg-card p-4">
          <summary className="cursor-pointer text-sm font-semibold"><span className={results[index] ? "text-success" : "text-destructive"}>Q{index + 1} · {results[index] ? "Correct" : "Missed"}</span><span className="mt-1 block">{question.q}</span></summary>
          <p className="mt-3 text-sm font-semibold">{question.options[question.answer]}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{question.explanation}</p>
        </details>)}
      </section>
      <div className="flex gap-3">
        <Button onClick={onRestart} className="h-12 flex-1"><RotateCcw className="h-4 w-4" /> New practice</Button>
        <Link to="/" className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-card font-semibold shadow-card"><Home className="h-4 w-4" /> Dashboard</Link>
      </div>
    </div>
  );
}
