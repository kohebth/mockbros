export type Industry = {
  id: string;
  name: string;
  roles: Role[];
};

export type Role = {
  id: string;
  name: string;
  slug: string;
  industryId: string;
  hasDictionary: boolean;
  hasQuestionBank?: boolean;
};

export type TestCard = {
  id: string;
  title: string;
  description: string;
  type: "entry" | "professional" | "ai-interview";
  hasQuestions?: boolean;
  relatedRoleSlug?: string;
};

export type CVAnalysisResult = {
  summary: string;
  strengths: string[];
  gaps: string[];
  matchedRoles: Array<{
    roleSlug: string;
    roleName: string;
    matchScore: number;
    gaps: string[];
  }>;
};

export type FAQItem = {
  id: string;
  question: string;
  answer: string;
  category?: string;
};
