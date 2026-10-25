import { questions, type Question } from "./content";
import { domainQuestions, type DomainId } from "./syllabus";

export function practiceQuestions(topic: string, count: number, domain?: DomainId): Question[] {
  const available = domain ? domainQuestions(domain) : questions;
  const pool = topic === "All topics" ? available : available.filter((q) => q.topic === topic);
  return pool.slice(0, count);
}

export function missedQuestions(session: Question[], results: boolean[]): Question[] {
  return session.filter((_, index) => results[index] === false);
}