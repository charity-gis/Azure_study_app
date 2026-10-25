import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Lightbulb, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { coachTopics, topicExplanation } from "@/lib/coach-topics";

export const Route = createFileRoute("/coach")({
  head: () => ({ meta: [
    { title: "Topic Coach — AZ-900 Study (Unofficial)" },
    { name: "description", content: "Understand confusing Azure fundamentals topics with free plain-language study notes and practical Azure examples." },
    { property: "og:title", content: "Topic Coach — AZ-900 Study (Unofficial)" },
    { property: "og:description", content: "Plain-language Azure explanations and practical examples for AZ-900 learners." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Coach,
});

function Coach() {
  const [topic, setTopic] = useState("Shared Responsibility");
  const [notes, setNotes] = useState(() => topicExplanation("Shared Responsibility"));

  return <div className="space-y-5 pb-6">
    <PageHeader title="Topic Coach" right={<BookOpen className="h-5 w-5 text-primary" />} />
    <div className="space-y-2">
      <label htmlFor="coach-topic" className="text-sm font-semibold">Which topic feels confusing?</label>
      <select id="coach-topic" value={topic} onChange={(event) => setTopic(event.target.value)} className="h-12 w-full rounded-md border border-input bg-card px-3 text-sm">
        {coachTopics.map((item) => <option key={item}>{item}</option>)}
      </select>
    </div>
    <Button className="h-12 w-full" onClick={() => setNotes(topicExplanation(topic))}><Lightbulb /> Explain this topic</Button>
    {notes && <section aria-live="polite" className="space-y-4 border-t pt-5">
      <p className="text-xs font-semibold text-primary">{notes.category}</p>
      <h2 className="break-words text-lg font-semibold">{notes.topic}</h2>
      <div className="space-y-2"><h3 className="text-sm font-semibold">In plain language</h3><p className="text-sm leading-7">{notes.explanation}</p></div>
      <div className="space-y-2 border-l-2 border-accent pl-4"><h3 className="flex items-center gap-2 text-sm font-semibold"><Lightbulb className="h-4 w-4 text-accent" /> Practical example</h3><p className="text-sm leading-7">{notes.example}</p></div>
      <p className="border-t pt-3 text-xs text-muted-foreground">Study notes · Check current service details against Microsoft Learn.</p>
    </section>}
  </div>;
}