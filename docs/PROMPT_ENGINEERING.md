# Prompt engineering and development provenance

## What AI does—and does not do

Lovable was used as an AI-assisted development tool. The deployed Topic Coach currently serves curated local content. It does **not** send live AI Gateway requests, dynamically generate answers, or claim to be a runtime language-model tutor.

An earlier AI Gateway coach was replaced after the creator asked to leave features requiring money disabled. Paying to continue development was not treated as permission to restore paid AI calls. A historical server-only access-block migration remains, but is not evidence of active AI generation.

## Real prompts used during development

These excerpts come from the creator's development requests, not reconstructed model outputs:

> “Build a mobile-responsive 'Unofficial AZ-900 Smart Quiz & Flashcard Coach' web app … immediately show if it's correct or incorrect, along with a detailed, instant explanation of the concept.”

> “Prominently display a disclaimer text at the top and bottom: 'Unofficial Study Tool - Not affiliated with Microsoft.' Do not use any official Microsoft logos.”

> “Add an in-app feature that lets AZ-900 learners select a topic they find confusing … a plain-language explanation with a practical Azure example using AI Gateway.”

> “If anything requires money leave it.”

> “Build a syllabus page listing all AZ-900 domains with links to the matching flashcards and practice questions.”

> “Add a study plan page where learners pick domains and set a schedule, with a progress tracker across flashcards and questions.”

> “Add a cloud save so my study plan, flashcard progress and quiz results stay the same on my phone and laptop.”

## Why the prompts were purposeful

| Prompt property | Intended effect | Evidence/check |
|---|---|---|
| Named audience and exam | Keep learning content focused on beginner AZ-900 needs. | Local topic allowlist and syllabus mappings. |
| Required immediate feedback | Teach at the moment a misconception is exposed. | Quiz answer explanations and review. |
| Exact compliance constraints | Avoid implying official Microsoft affiliation. | Shared disclaimer; no official logos. |
| Practical examples | Connect a definition to a concrete Azure scenario. | Local coach example for each selectable topic. |
| Explicit cost constraint | Avoid paid runtime generation. | Browser-safe coach implementation; no gateway request. |
| Persistent progress request | Support returning to a study routine. | Account-isolated storage and cloud merge tests. |

## Iteration and evaluation

The work progressed from core cards/quizzes to topic filters and retries, then a local coach, domain navigation, planning, optional account sync and time tracking. Browser checks and automated tests were used to find implementation errors instead of accepting generated output uncritically.

Current evaluation is narrow: validation tests check available topics and reject unknown topics/extra input fields, while code review checks explanations and examples. They do not prove educational accuracy or measure model quality. There is no runtime model benchmark to report because runtime AI is disabled.

## Review prompt template (proposed; not an executed result)

> Review this AZ-900 study note against the current Microsoft Learn documentation. Identify factual claims, missing caveats and outdated terminology. Return the claim, a primary-source reference and a suggested beginner-friendly correction. Do not invent services, pricing, exam questions or exam-pass guarantees. Mark uncertainty rather than guessing.

This template is for future editorial review only; no paid feature has been enabled to execute it automatically.
