import type { Industry } from "./types";

const AVAILABLE_ROLE_SLUGS = [
  "brand-executive",
  "backend-developer",
  "java-developer",
  "data-scientist",
];

function createRole(name: string, industryId: string) {
  const slug = name
    .toLowerCase()
    .replace(/[&/]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return {
    id: `${industryId}-${slug}`,
    name,
    slug,
    industryId,
    hasDictionary: AVAILABLE_ROLE_SLUGS.includes(slug),
  };
}

export const industries: Industry[] = [
  {
    id: "marketing",
    name: "Marketing",
    roles: [
      "Brand Executive",
      "Marketing Executive",
      "Digital Marketing Specialist",
      "Performance Marketing Specialist",
      "Trade Marketing Executive",
      "Marketing Manager",
    ].map((r) => createRole(r, "marketing")),
  },
  {
    id: "sales",
    name: "Sales / Kinh doanh",
    roles: [
      "Sales Executive",
      "Account Executive",
      "Business Development Executive",
      "Sales Representative",
      "Key Account Manager",
      "Sales Manager",
      "Regional Sales Manager",
    ].map((r) => createRole(r, "sales")),
  },
  {
    id: "hr",
    name: "Human Resources / Nhân sự",
    roles: [
      "HR Executive",
      "Talent Acquisition Specialist",
      "C&B Specialist",
      "HRBP",
      "L&D Executive",
      "Employer Branding Specialist",
      "HR Manager",
    ].map((r) => createRole(r, "hr")),
  },
  {
    id: "finance",
    name: "Finance / Kế toán / Kiểm toán",
    roles: [
      "Accountant",
      "General Accountant",
      "Chief Accountant",
      "Finance Analyst",
      "Internal Auditor",
      "Tax Specialist",
      "Finance Manager",
      "CFO",
    ].map((r) => createRole(r, "finance")),
  },
  {
    id: "it",
    name: "Information Technology / IT",
    roles: [
      "Full-stack Developer",
      "Frontend Developer",
      "Backend Developer",
      "Java Developer",
      "DevOps Engineer",
      "System Admin",
      "IT Support",
      "QA Tester",
    ].map((r) => createRole(r, "it")),
  },
  {
    id: "data",
    name: "Data / AI / Analytics",
    roles: [
      "Data Analyst",
      "Business Intelligence Analyst",
      "Data Engineer",
      "Data Scientist",
      "Machine Learning Engineer",
      "AI Engineer",
    ].map((r) => createRole(r, "data")),
  },
  {
    id: "design",
    name: "Design / Creative",
    roles: [
      "Graphic Designer",
      "UI Designer",
      "UX Designer",
      "Product Designer",
      "Art Director",
      "Creative Director",
      "Motion Designer",
    ].map((r) => createRole(r, "design")),
  },
  {
    id: "content",
    name: "Content / Media / Truyền thông",
    roles: [
      "Content Writer",
      "Copywriter",
      "Social Media Executive",
      "PR Executive",
      "Communications Specialist",
      "Editor",
      "Video Producer",
    ].map((r) => createRole(r, "content")),
  },
];

export const allRoles = industries.flatMap((i) => i.roles);

export function findRoleBySlug(slug: string) {
  return allRoles.find((r) => r.slug === slug);
}

export function findIndustryByRoleSlug(slug: string) {
  return industries.find((i) => i.roles.some((r) => r.slug === slug));
}

export const availableRoleSlugs = AVAILABLE_ROLE_SLUGS;
