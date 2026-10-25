import { readStudy, writeStudy } from "./device-storage";
export type Flashcard = { term: string; tag: string; simple: string; example: string };

export const flashcards: Flashcard[] = [
  { term: "CapEx vs OpEx", tag: "Cloud Concepts", simple: "CapEx is buying stuff up front (like servers). OpEx is paying as you go for what you use — the cloud model.", example: "Buying a car = CapEx. Taking a taxi only when needed = OpEx." },
  { term: "IaaS", tag: "Service Models", simple: "Infrastructure as a Service: you rent virtual machines, storage and networks. You manage the OS and apps.", example: "Azure Virtual Machines." },
  { term: "PaaS", tag: "Service Models", simple: "Platform as a Service: Azure manages the servers and OS. You just bring your code and data.", example: "Azure App Service, Azure SQL Database." },
  { term: "SaaS", tag: "Service Models", simple: "Software as a Service: a finished app you just log in and use. The provider runs everything.", example: "Email or office apps in the browser." },
  { term: "Azure Regions", tag: "Architecture", simple: "A region is a geographic area with one or more datacenters close together, connected by a fast network.", example: "Pick a region near your users for lower latency." },
  { term: "Availability Zones", tag: "Architecture", simple: "Separate datacenters within one region, each with its own power, cooling and networking.", example: "Run copies of your app in 3 zones so one outage doesn't take you down." },
  { term: "Region Pairs", tag: "Architecture", simple: "Most regions are paired with another region in the same geography for disaster recovery.", example: "Updates roll out to one region of the pair at a time." },
  { term: "Shared Responsibility", tag: "Security", simple: "Security is split between you and the cloud provider. The more managed the service, the less you handle.", example: "You always own your data, accounts and devices." },
  { term: "High Availability", tag: "Cloud Benefits", simple: "Keeping services running with minimal downtime, often promised in an SLA as a percentage like 99.9%.", example: "99.99% uptime ≈ under an hour of downtime per year." },
  { term: "Elasticity", tag: "Cloud Benefits", simple: "Automatically adding or removing resources as demand changes, so you only pay for what you need.", example: "An online shop scales out on Black Friday, then back in." },
  { term: "Blob Storage", tag: "Storage", simple: "Object storage for unstructured data like photos, documents, backups and logs.", example: "Save customer-uploaded photos as blobs." },
  { term: "Storage Redundancy", tag: "Storage", simple: "ZRS copies data across availability zones in one region. GRS also copies data to a secondary region. Redundancy does not replace a backup strategy.", example: "Keep copies in separate locations so a failure doesn't destroy the only copy." },
  { term: "Azure Files", tag: "Storage", simple: "Managed file shares that multiple machines can access using standard file-sharing protocols.", example: "A shared folder for applications running on several machines." },
  { term: "Virtual Network", tag: "Networking", simple: "A private network for Azure resources. Subnets divide it into smaller parts; connectivity and access depend on configuration.", example: "Separate your app and database into different subnets." },
  { term: "Network Security Group", tag: "Networking", simple: "Rules that allow or deny inbound and outbound traffic for supported resources or subnets.", example: "Allow web traffic but restrict unnecessary incoming connections." },
  { term: "VPN vs ExpressRoute", tag: "Networking", simple: "VPN Gateway uses an encrypted connection over the internet. ExpressRoute uses private connectivity through a provider.", example: "Connect an office network to Azure over a site-to-site VPN." },
  { term: "Microsoft Entra ID", tag: "Identity", simple: "Microsoft's cloud identity service authenticates users and applications and supports single sign-on.", example: "One employee identity signs in to multiple cloud applications." },
  { term: "Azure RBAC", tag: "Identity", simple: "Role-based access control grants permissions at a scope such as a resource, resource group or subscription.", example: "Give a teammate read-only access to one resource group." },
  { term: "Policy vs Resource Locks", tag: "Governance", simple: "Azure Policy evaluates resources against organizational rules. Resource locks help prevent accidental deletion or changes.", example: "Require approved locations with Policy; protect a critical resource with a delete lock." },
  { term: "Cost Management", tag: "Cost Management", simple: "Analyze spending and create budgets with alerts. A budget does not automatically stop services when you reach its threshold.", example: "Receive an alert when your project approaches its monthly budget." },
];

export type Question = { q: string; options: string[]; answer: number; explanation: string; topic: string };

export const questions: Question[] = [
  { topic: "Cloud Models", q: "A company wants to stop buying physical servers and instead pay monthly for only the compute it uses. Which expense model is this?", options: ["Capital Expenditure (CapEx)", "Operational Expenditure (OpEx)", "Fixed Expenditure", "Depreciating Expenditure"], answer: 1, explanation: "Pay-as-you-go cloud spending is OpEx: no big upfront purchase, costs are billed as you consume resources. CapEx is the up-front purchase of physical assets like servers that depreciate over time." },
  { topic: "Service Models", q: "Your developers want to deploy a web app without managing the operating system, patches, or servers. Which service model fits best?", options: ["IaaS", "PaaS", "SaaS", "On-premises"], answer: 1, explanation: "PaaS (e.g. Azure App Service) handles the OS, runtime and infrastructure, so developers focus only on code. IaaS would require managing the OS; SaaS is a finished app, not a place to deploy your own code." },
  { topic: "Architecture", q: "What is the main purpose of Availability Zones?", options: ["Reduce your monthly bill", "Protect apps from a single datacenter failure within a region", "Store data in another country", "Speed up internet downloads"], answer: 1, explanation: "Availability Zones are physically separate datacenters inside one region, each with independent power, cooling and networking. Spreading resources across zones keeps your app running if one datacenter fails." },
  { topic: "Security", q: "Under the Shared Responsibility Model, which item is ALWAYS the customer's responsibility, regardless of service type?", options: ["Physical datacenter security", "Host operating system patching", "Their data and user accounts", "Network hardware"], answer: 2, explanation: "In IaaS, PaaS and SaaS alike, the customer always owns their information and data, devices, and accounts/identities. Physical datacenters, hosts and network hardware are the provider's job." },
  { topic: "Core Services", q: "Which Azure service lets you run code in response to events without managing any servers?", options: ["Azure Virtual Machines", "Azure Functions", "Azure Virtual Network", "Azure Blob Storage"], answer: 1, explanation: "Azure Functions is a serverless compute service: your code runs when triggered (an HTTP request, a timer, a queue message) and you pay only for execution time. VMs require you to manage servers." },
  { topic: "Storage", q: "Which service best fits storing photos and other unstructured objects?", options: ["Azure Blob Storage", "Azure Virtual Network", "Microsoft Entra ID", "Azure Policy"], answer: 0, explanation: "Blob Storage holds unstructured objects such as photos, documents and logs. A VNet handles networking, Entra ID manages identities, and Policy evaluates compliance." },
  { topic: "Storage", q: "Which redundancy option keeps copies across availability zones within one region?", options: ["Locally redundant storage (LRS)", "Azure Files", "Zone-redundant storage (ZRS)", "A resource lock"], answer: 2, explanation: "ZRS replicates data across availability zones in a region. LRS keeps replicas in a single physical location. File shares and locks are not redundancy options." },
  { topic: "Storage", q: "An application needs a managed file share accessible from multiple machines. Which service fits?", options: ["Azure Policy", "Azure DNS", "Azure RBAC", "Azure Files"], answer: 3, explanation: "Azure Files offers managed file shares using standard file-sharing protocols. Blob Storage instead stores objects, while Policy, DNS and RBAC solve different problems." },
  { topic: "Networking", q: "What is the primary purpose of an Azure Virtual Network?", options: ["Manage identities", "Provide a private network for Azure resources", "Analyze spending", "Enforce tagging rules"], answer: 1, explanation: "A VNet provides private networking for Azure resources and can connect to other networks. Subnets segment it, and security configuration controls permitted connectivity." },
  { topic: "Networking", q: "Which feature filters inbound and outbound network traffic with allow or deny rules?", options: ["Network Security Group", "Azure Cost Management", "Microsoft Entra ID", "Azure Files"], answer: 0, explanation: "An NSG uses rules to filter traffic for supported resources or subnets. It controls network traffic rather than user authentication or spending." },
  { topic: "Networking", q: "A company wants private connectivity to Azure through a connectivity provider. What should it use?", options: ["A resource lock", "Blob Storage", "ExpressRoute", "Azure Policy"], answer: 2, explanation: "ExpressRoute provides private connectivity through a provider. VPN Gateway instead connects over an encrypted VPN across the public internet." },
  { topic: "Identity", q: "Which service provides cloud identity management and single sign-on?", options: ["Azure Files", "Azure Monitor", "Azure Virtual Network", "Microsoft Entra ID"], answer: 3, explanation: "Microsoft Entra ID authenticates users and applications and supports single sign-on. Azure RBAC determines permissions to Azure resources after authentication." },
  { topic: "Identity", q: "How can an administrator grant permissions only within one resource group?", options: ["Create a storage account", "Assign an Azure RBAC role at resource group scope", "Add an NSG rule", "Set a budget"], answer: 1, explanation: "An Azure RBAC role assignment combines a principal, role and scope. Assigning it at resource group scope limits the permissions to that group and its resources." },
  { topic: "Governance", q: "Which feature evaluates resources against organizational configuration rules?", options: ["Azure Policy", "Azure Files", "ExpressRoute", "Microsoft Entra ID"], answer: 0, explanation: "Azure Policy evaluates resource compliance and, depending on the policy effect, can report, deny or remediate configurations. Resource locks instead protect against accidental changes or deletion." },
  { topic: "Cost Management", q: "What happens when spending reaches an Azure budget threshold?", options: ["Resources are always deleted", "The monthly bill becomes fixed", "An alert can be sent; services do not automatically stop", "Storage redundancy changes"], answer: 2, explanation: "Budgets monitor spending and notify recipients at configured thresholds. A budget alone does not cap consumption or shut down resources; any automated action requires additional configuration." },
];

export const STORAGE_KEY = "az900-coach";
export type Progress = { lastScore: number | null; attempts: number; cardsSeen: number };
export const defaultProgress: Progress = { lastScore: null, attempts: 0, cardsSeen: 0 };

export function loadProgress(): Progress {
  try { return { ...defaultProgress, ...JSON.parse(readStudy(STORAGE_KEY) || "{}") }; }
  catch { return defaultProgress; }
}
export function saveProgress(p: Partial<Progress>) {
  try { writeStudy(STORAGE_KEY, JSON.stringify({ ...loadProgress(), ...p })); } catch { /* Keep study usable without device storage. */ }
}
export function readyScore(p: Progress) {
  const quiz = p.lastScore ?? 0;
  const cards = Math.min(p.cardsSeen / flashcards.length, 1) * 100;
  return Math.round(quiz * 0.7 + cards * 0.3);
}
