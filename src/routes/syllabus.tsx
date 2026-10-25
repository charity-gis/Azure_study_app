import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Layers, ListChecks, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { syllabusDomains, domainFlashcards, domainQuestions } from "@/lib/syllabus";

export const Route = createFileRoute("/syllabus")({
  head: () => ({ meta: [
    { title: "AZ-900 Syllabus — Unofficial Study Coach" },
    { name: "description", content: "Explore all three AZ-900 exam domains, their weights, syllabus topics and matching flashcards and practice questions." },
    { property: "og:title", content: "AZ-900 Syllabus — Unofficial Study Coach" },
    { property: "og:description", content: "Azure Fundamentals exam domains with topic outlines and linked study practice." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Syllabus,
});

function Syllabus() {
  return <div className="space-y-6 pb-6">
    <PageHeader title="AZ-900 Syllabus" right={<BookOpen className="h-5 w-5 text-primary" />} />
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">Skills measured from July 20, 2026</p>
      <p className="text-sm leading-relaxed text-muted-foreground">The full exam outline is below. Linked study sets cover the topics currently available in this app, not every exam objective.</p>
      <a className="inline-flex items-center gap-2 text-sm font-semibold text-primary underline underline-offset-4" href="https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-900" target="_blank" rel="noreferrer">Microsoft Learn study guide <ExternalLink className="h-4 w-4" /></a>
    </div>
    {syllabusDomains.map((domain, index) => <section key={domain.id} className="space-y-4 border-t pt-5">
      <div className="flex items-center justify-between gap-3"><span className="text-xs font-semibold uppercase text-primary">Domain {index + 1}</span><span className="text-sm font-semibold text-muted-foreground">{domain.weight}</span></div>
      <h2 className="text-xl font-semibold leading-snug">{domain.title}</h2>
      <ul className="space-y-4">{domain.sections.map((section) => <li key={section.title}><h3 className="text-sm font-semibold">{section.title}</h3><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{section.topics}</p></li>)}</ul>
      <div className="grid grid-cols-2 gap-2">
        <Button asChild variant="outline" className="h-auto min-h-12 whitespace-normal"><Link to="/flashcards" search={{ domain: domain.id }}><Layers className="shrink-0" />{domainFlashcards(domain.id).length} flashcards</Link></Button>
        <Button asChild className="h-auto min-h-12 whitespace-normal"><Link to="/quiz" search={{ domain: domain.id }}><ListChecks className="shrink-0" />{domainQuestions(domain.id).length} questions</Link></Button>
      </div>
    </section>)}
  </div>;
}