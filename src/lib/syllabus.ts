import { z } from "zod";
import { flashcards, questions } from "./content";

export const studySearch = z.object({ domain: z.enum(["cloud", "architecture", "management"]).optional().catch(undefined) });
export type DomainId = "cloud" | "architecture" | "management";
export const syllabusDomains = [
  {
    id: "cloud" as const, title: "Describe cloud concepts", weight: "25–30%",
    sections: [
      { title: "Cloud computing", topics: "Cloud models, shared responsibility, consumption-based pricing and serverless" },
      { title: "Cloud benefits", topics: "Availability, scalability, reliability, predictability, security, governance and manageability" },
      { title: "Cloud service types", topics: "IaaS, PaaS, SaaS and their use cases" },
    ],
    cardTags: ["Cloud Concepts", "Service Models", "Security", "Cloud Benefits"],
    questionTopics: ["Cloud Models", "Service Models", "Security"],
  },
  {
    id: "architecture" as const, title: "Describe Azure architecture and services", weight: "35–40%",
    sections: [
      { title: "Core architecture", topics: "Regions, region pairs, sovereign regions, zones, datacenters, resources, resource groups, subscriptions and management groups" },
      { title: "Compute and networking", topics: "VMs, scale sets, availability sets, Virtual Desktop, containers, Functions, app hosting, VNets, subnets, peering, DNS, VPN, ExpressRoute and endpoints" },
      { title: "Storage", topics: "Storage services, tiers, redundancy, accounts, AzCopy, Storage Explorer, File Sync, Azure Migrate and Data Box" },
      { title: "Identity, access and security", topics: "Entra ID, Domain Services, SSO, MFA, passwordless, external identities, Conditional Access, RBAC, Zero Trust, defense in depth and Defender for Cloud" },
    ],
    cardTags: ["Architecture", "Storage", "Networking", "Identity"],
    questionTopics: ["Architecture", "Core Services", "Storage", "Networking", "Identity"],
  },
  {
    id: "management" as const, title: "Describe Azure management and governance", weight: "30–35%",
    sections: [
      { title: "Cost management", topics: "Cost factors, pricing calculator, Cost Management and tags" },
      { title: "Governance and compliance", topics: "Microsoft Purview, Azure Policy and resource locks" },
      { title: "Management and deployment", topics: "Azure portal, Cloud Shell, CLI, PowerShell, Azure Arc, infrastructure as code, ARM and ARM templates" },
      { title: "Monitoring", topics: "Azure Advisor, Service Health, Azure Monitor, Log Analytics, alerts and Application Insights" },
    ],
    cardTags: ["Governance", "Cost Management"],
    questionTopics: ["Governance", "Cost Management"],
  },
];

export function domainById(id?: DomainId) { return syllabusDomains.find((domain) => domain.id === id); }
export function domainFlashcards(id?: DomainId) {
  const domain = domainById(id);
  return domain ? flashcards.filter((card) => domain.cardTags.includes(card.tag)) : flashcards;
}
export function domainQuestions(id?: DomainId) {
  const domain = domainById(id);
  return domain ? questions.filter((question) => domain.questionTopics.includes(question.topic)) : questions;
}