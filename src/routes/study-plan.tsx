import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarDays, CheckCircle2, Clock, Layers, ListChecks, Pencil, Save } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { syllabusDomains, domainById } from "@/lib/syllabus";
import { emptyActivity, loadActivity, loadPlan, localDate, planSchema, savePlan, scheduledSessions, studyCoverage, type StudyActivity, type StudyPlan } from "@/lib/study-plan";
import { STUDY_REFRESHED } from "@/lib/device-storage";
import { useCloudSave } from "@/components/CloudSave";

export const Route = createFileRoute("/study-plan")({
  head: () => ({ meta: [
    { title: "Study Plan — AZ-900 Unofficial Study Coach" },
    { name: "description", content: "Plan your AZ-900 study domains, schedule sessions and track flashcard and question coverage on this device." },
    { property: "og:title", content: "Study Plan — AZ-900 Unofficial Study Coach" },
    { property: "og:description", content: "A personal Azure Fundamentals study schedule with domain-by-domain progress." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: StudyPlanner,
});

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
function displayDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function StudyPlanner() {
  const { userId } = useCloudSave();
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [draft, setDraft] = useState<StudyPlan>({ domains: ["cloud", "architecture", "management"], start: "", end: "", days: [1, 3, 5], time: "18:00", minutes: 20 });
  const [activity, setActivity] = useState<StudyActivity>(emptyActivity);
  const [editing, setEditing] = useState(true);
  const [error, setError] = useState("");
  const [today, setToday] = useState("");
  useEffect(() => {
    const refresh = () => {
      const saved = loadPlan(); setPlan(saved); setActivity(loadActivity());
      if (!editing || !plan) { if (saved) setDraft(saved); setEditing(!saved); }
    };
    window.addEventListener(STUDY_REFRESHED, refresh);
    return () => window.removeEventListener(STUDY_REFRESHED, refresh);
  }, [editing, plan]);
  useEffect(() => {
    const saved = loadPlan();
    const now = new Date();
    const end = new Date(now); end.setDate(end.getDate() + 14);
    setToday(localDate(now));
    setDraft(saved ?? { domains: ["cloud", "architecture", "management"], start: localDate(now), end: localDate(end), days: [1, 3, 5], time: "18:00", minutes: 20 });
    setPlan(saved); setEditing(!saved); setActivity(loadActivity());
    const refresh = () => { setActivity(loadActivity()); setToday(localDate()); };
    window.addEventListener("focus", refresh); window.addEventListener("storage", refresh);
    return () => { window.removeEventListener("focus", refresh); window.removeEventListener("storage", refresh); };
  }, []);
  const coverage = plan ? studyCoverage(plan.domains, activity) : null;
  const sessions = plan ? scheduledSessions(plan) : [];
  const upcoming = sessions.filter((session) => session.date >= today);
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = planSchema.safeParse(draft);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Check your schedule."); return; }
    if (!scheduledSessions(parsed.data).length) { setError("No sessions fall on those dates. Choose another day or a longer date range."); return; }
    if (!savePlan(parsed.data)) { setError("Your plan could not be saved. Allow device storage and try again."); return; }
    setPlan(parsed.data); setDraft(parsed.data); setEditing(false); setError(""); setActivity(loadActivity());
  };

  return <div className="space-y-6 pb-6">
    <PageHeader title="My study plan" right={<CalendarDays className="h-5 w-5 text-primary" />} />
    {editing ? <form onSubmit={submit} className="space-y-6">
      <fieldset className="space-y-3">
        <legend className="mb-3 text-base font-semibold">Choose your domains</legend>
        {syllabusDomains.map((domain, index) => <label key={domain.id} className="flex cursor-pointer items-start gap-3 rounded-lg border bg-card p-4">
          <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-primary" checked={draft.domains.includes(domain.id)} onChange={(event) => setDraft({ ...draft, domains: event.target.checked ? [...draft.domains, domain.id] : draft.domains.filter((id) => id !== domain.id) })} />
          <span><span className="mb-1 block text-xs font-semibold text-primary">Domain {index + 1} · {domain.weight}</span><span className="text-sm font-semibold">{domain.title}</span></span>
        </label>)}
      </fieldset>
      <section className="space-y-4 border-t pt-5">
        <h2 className="text-base font-semibold">Set your schedule</h2>
        <div className="grid grid-cols-2 gap-3">
          <label className="min-w-0 space-y-2 text-sm font-semibold">Start date<input aria-label="Start date" type="date" required value={draft.start} onChange={(event) => setDraft({ ...draft, start: event.target.value })} className="block h-12 w-full min-w-0 rounded-md border bg-card px-2 text-sm font-normal" /></label>
          <label className="min-w-0 space-y-2 text-sm font-semibold">Target date<input aria-label="Target date" type="date" required min={draft.start} value={draft.end} onChange={(event) => setDraft({ ...draft, end: event.target.value })} className="block h-12 w-full min-w-0 rounded-md border bg-card px-2 text-sm font-normal" /></label>
        </div>
        <fieldset><legend className="mb-2 text-sm font-semibold">Study days</legend><div className="grid grid-cols-7 gap-1">
          {weekdays.map((day, index) => <Button key={day} type="button" variant={draft.days.includes(index) ? "default" : "outline"} aria-pressed={draft.days.includes(index)} className="h-11 px-0 text-xs" onClick={() => setDraft({ ...draft, days: draft.days.includes(index) ? draft.days.filter((item) => item !== index) : [...draft.days, index] })}>{day}</Button>)}
        </div></fieldset>
        <div className="grid grid-cols-2 gap-3">
          <label className="min-w-0 space-y-2 text-sm font-semibold">Local time<input type="time" required value={draft.time} onChange={(event) => setDraft({ ...draft, time: event.target.value })} className="block h-12 w-full min-w-0 rounded-md border bg-card px-2 text-sm font-normal" /></label>
          <label className="min-w-0 space-y-2 text-sm font-semibold">Minutes per session<input type="number" min={5} max={120} required value={draft.minutes} onChange={(event) => setDraft({ ...draft, minutes: Number(event.target.value) })} className="block h-12 w-full rounded-md border bg-card px-3 font-normal" /></label>
        </div>
      </section>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2"><Button type="submit" className="h-12 flex-1"><Save /> Save study plan</Button>{plan && <Button variant="outline" type="button" className="h-12" onClick={() => { setDraft(plan); setEditing(false); setError(""); }}>Cancel</Button>}</div>
    </form> : plan && coverage && <>
      <section className="space-y-4 border-b pb-5">
        <div className="flex items-center justify-between gap-3"><h2 className="font-semibold">Study coverage</h2><Button variant="ghost" size="icon" aria-label="Edit study plan" title="Edit study plan" onClick={() => setEditing(true)}><Pencil /></Button></div>
        <div className="flex items-end justify-between"><p className="text-4xl font-bold text-primary">{coverage.percent}%</p><span className="text-sm text-muted-foreground">{coverage.reviewed + coverage.answered} / {coverage.cards + coverage.questions} items</span></div>
        <progress aria-label="Overall study coverage" max={100} value={coverage.percent} className="h-2 w-full overflow-hidden rounded-full accent-primary" />
        <div className="grid grid-cols-2 gap-3 text-sm"><p><Layers className="mb-2 h-5 w-5 text-primary" /><strong>{coverage.reviewed}/{coverage.cards}</strong> cards reviewed</p><p><ListChecks className="mb-2 h-5 w-5 text-primary" /><strong>{coverage.answered}/{coverage.questions}</strong> questions answered</p></div>
        <p className="flex items-center gap-2 text-sm text-success"><CheckCircle2 className="h-4 w-4" />{coverage.correct}/{coverage.questions} questions answered correctly at least once</p>
      </section>
      <section className="space-y-4">
        <div><h2 className="font-semibold">Your schedule</h2><p className="mt-1 text-sm text-muted-foreground">{displayDate(plan.start)} – {displayDate(plan.end)} · {sessions.length} sessions</p><p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><Clock className="h-4 w-4" />{plan.time} local time · {plan.minutes} min/session</p></div>
        {upcoming.length ? <ol className="space-y-3">{upcoming.slice(0, 6).map((session) => <li key={session.date} className="border-l-2 border-accent pl-3"><p className="text-xs font-semibold text-primary">{session.date === today ? "Today" : displayDate(session.date)}</p><p className="mt-1 text-sm font-medium">{domainById(session.domain)?.title}</p></li>)}</ol> : <p className="text-sm text-muted-foreground">Your scheduled dates have ended. Edit your plan to continue studying.</p>}
        {upcoming.length > 6 && <details><summary className="cursor-pointer text-sm font-semibold text-primary">{upcoming.length - 6} more sessions</summary><ol className="mt-3 space-y-3">{upcoming.slice(6).map((session) => <li key={session.date} className="text-sm"><strong>{displayDate(session.date)}</strong><p className="text-muted-foreground">{domainById(session.domain)?.title}</p></li>)}</ol></details>}
      </section>
      <section className="space-y-5 border-t pt-5"><h2 className="font-semibold">Domain progress</h2>
        {plan.domains.map((id) => {
          const progress = studyCoverage([id], activity);
          return <div key={id} className="space-y-3 border-b pb-5">
            <h3 className="text-sm font-semibold">{domainById(id)?.title}</h3>
            <progress aria-label={`${domainById(id)?.title} coverage`} max={100} value={progress.percent} className="h-2 w-full accent-primary" />
            <p className="text-xs text-muted-foreground">{progress.reviewed}/{progress.cards} cards · {progress.answered}/{progress.questions} questions · {progress.percent}% covered</p>
            <div className="grid grid-cols-2 gap-2"><Button asChild variant="outline" className="h-11"><Link to="/flashcards" search={{ domain: id }}><Layers /> Flashcards</Link></Button><Button asChild className="h-11"><Link to="/quiz" search={{ domain: id }}><ListChecks /> Practice</Link></Button></div>
          </div>;
        })}
      </section>
    </>}
    <p className="text-xs leading-relaxed text-muted-foreground">{userId ? "Cloud saving enabled" : "Saved on this device only"} · No reminder notifications. Coverage counts unique cards flipped and questions answered, not exam readiness.</p>
  </div>;
}