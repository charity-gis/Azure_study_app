import { z } from "zod";
import { flashcards } from "./content";

export const coachTopics = flashcards.map((card) => card.term);
const azureExamples: Record<string, string> = {
  "CapEx vs OpEx": "A small business rents Azure Virtual Machines instead of buying servers. Compute usage is an operating expense; stopping and deallocating a VM stops compute charges, but disks and other resources may still cost money.",
  "IaaS": "A company moves an existing application to Azure Virtual Machines. Azure maintains the physical hardware, while the company patches the guest operating system and secures its application.",
  "PaaS": "A developer deploys a booking website to Azure App Service. Azure manages the underlying servers and operating system; the developer manages the code, configuration, data and access.",
  "SaaS": "Employees use Microsoft 365 in their browsers. They use a finished application instead of deploying it to Azure VMs, but their organization still manages users and access to its data.",
  "Azure Regions": "A business serving users in Kenya compares Azure regions for latency, service availability and data residency requirements before choosing where to host its app.",
  "Availability Zones": "A shop deploys supported, zone-redundant Azure services so one zone failing need not stop the whole service. Zone support and deployment options vary by service and region.",
  "Region Pairs": "A business evaluates Azure Storage geo-redundancy to keep a second copy in another region. Pairing alone does not automatically replicate every app; recovery must be planned for each service, and some newer regions are unpaired.",
  "Shared Responsibility": "For an Azure VM, you patch the guest operating system. With Azure App Service, Azure handles the underlying OS. In both cases, you still protect your data, identities and access settings.",
  "High Availability": "A business runs multiple app instances behind Azure Load Balancer instead of relying on one VM. The actual availability commitment depends on the service SLA and its required configuration.",
  "Elasticity": "A ticket website uses Azure App Service autoscale to add instances during a busy sale and remove them afterward. Autoscale needs configured rules and a supported plan.",
  "Blob Storage": "A learning app saves uploaded lesson videos in Azure Blob Storage. Each video is an object; access controls determine who can read it.",
  "Storage Redundancy": "A business chooses ZRS for supported Azure Storage data to spread copies across zones. GRS adds a secondary-region copy asynchronously, so recent writes may be lost during a disaster.",
  "Azure Files": "Several Azure VMs mount the same Azure Files share to access shared documents. Permissions and network settings still control who can open the files.",
  "Virtual Network": "An app VM and database VM use separate subnets in an Azure Virtual Network. The organization configures routing and security rules to permit only the connections it needs.",
  "Network Security Group": "An administrator applies an NSG to a VM subnet to allow required web traffic and restrict management traffic. Rule priority matters: lower-numbered rules are evaluated first.",
  "VPN vs ExpressRoute": "A branch office uses Azure VPN Gateway for encrypted connectivity over the internet. A larger organization chooses ExpressRoute for private provider connectivity; private does not mean encrypted by default.",
  "Microsoft Entra ID": "Employees sign in to an Azure-connected application with Microsoft Entra ID. Authentication checks who they are; authorization decides what they can do.",
  "Azure RBAC": "An administrator assigns the Reader role to a teammate at resource-group scope. The teammate can view those Azure resources but cannot edit them using that role alone.",
  "Policy vs Resource Locks": "Azure Policy denies deployments in unapproved locations. A CanNotDelete lock protects a critical resource from deletion, but still allows permitted changes.",
  "Cost Management": "A team sets an Azure budget alert at 80% of its planned spend. The alert warns the team; the budget alone does not shut down resources or prevent more charges.",
};

export function topicExplanation(topic: string) {
  const card = flashcards.find((item) => item.term === topic);
  const example = azureExamples[topic];
  if (!card || !example) return null;
  return { topic: card.term, category: card.tag, explanation: card.simple, example };
}
export const explanationInput = z.object({
  topic: z.string().min(1).max(100).refine((topic) => coachTopics.includes(topic), "Select an available Azure topic."),
}).strict();