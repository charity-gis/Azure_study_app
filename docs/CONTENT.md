# Learning content and official references

> Unofficial Study Tool - Not affiliated with Microsoft.

## Current content

The source contains 20 flashcards, 15 original practice questions and 20 local coach topics. Examples include CapEx/OpEx, IaaS/PaaS/SaaS, regions, availability zones, shared responsibility, storage, networking, identity, governance and cost management.

- `src/lib/content.ts`: card definitions and question bank.
- `src/lib/coach-topics.ts`: practical examples and local explanation selection.
- `src/lib/syllabus.ts`: domain outlines and filters.

The domain outline lists all three AZ-900 areas, but the available practice material does not cover every objective. Questions are custom study questions, not copied official exam items or exam dumps.

## Official references

Use Microsoft's current pages as the source of truth. These are reference links in the documentation; adding this guide does not change the in-app syllabus buttons.

- [AZ-900 study guide and skills measured](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-900)
- [Azure Fundamentals certification](https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/)
- [Describe cloud concepts learning path](https://learn.microsoft.com/en-us/training/paths/microsoft-azure-fundamentals-describe-cloud-concepts/)
- [Describe Azure architecture and services learning path](https://learn.microsoft.com/en-us/training/paths/azure-fundamentals-describe-azure-architecture-services/)
- [Describe Azure management and governance learning path](https://learn.microsoft.com/en-us/training/paths/describe-azure-management-governance/)
- [Azure pricing calculator](https://azure.microsoft.com/en-us/pricing/calculator/)
- [Azure shared responsibility](https://learn.microsoft.com/en-us/azure/security/fundamentals/shared-responsibility)

The app currently displays cloud concepts 25–30%, architecture/services 35–40%, and management/governance 30–35%. Recheck the official study guide before submission because exam objectives and weights can change. These links are not evidence of a completed independent content audit.

## Editorial checklist

1. Map each new card/question to a current exam objective.
2. Check terminology and claims against primary documentation.
3. Include important caveats: budgets are alerts, not spending caps; private connectivity is not inherently encrypted; supported zone behavior varies by service.
4. Write exactly one defensible best answer per multiple-choice item.
5. Explain why the correct answer fits the scenario.
6. Avoid guaranteed prices, availability promises or pass predictions.
7. Update shared filters and tests when content expands.
8. Ask a knowledgeable reviewer to approve changes before presenting them as validated.
