import type { InterviewQuestion } from "../types";

export const interviewQuestions: InterviewQuestion[] = [
  {
    id: "se-001",
    interviewType: "software_engineer",
    targetRole: "Software Engineer",
    difficulty: "easy",
    questionText:
      "Tell me about a technical project you are proud of. What tradeoffs did you make?",
    rubricHint:
      "Look for clear context, technical ownership, tradeoff reasoning, and measurable outcome.",
    strongAnswerSignals: [
      "Explains project context clearly",
      "Names specific technical decisions",
      "Discusses tradeoffs",
      "Mentions outcome or impact",
    ],
    weakAnswerSignals: [
      "Only describes technology names",
      "No explanation of personal contribution",
      "No tradeoff or result",
    ],
  },
  {
    id: "se-002",
    interviewType: "software_engineer",
    targetRole: "Software Engineer",
    difficulty: "medium",
    questionText:
      "Describe a time you had to debug a difficult production issue. What was your approach?",
    rubricHint:
      "Look for systematic debugging process, root cause analysis, collaboration, and prevention measures.",
    strongAnswerSignals: [
      "Describes systematic approach to debugging",
      "Identifies root cause clearly",
      "Mentions collaboration with team",
      "Discusses prevention or monitoring after fix",
    ],
    weakAnswerSignals: [
      "Vague description of the bug",
      "No mention of debugging process",
      "No follow-up or prevention steps",
    ],
  },
  {
    id: "se-003",
    interviewType: "software_engineer",
    targetRole: "Software Engineer",
    difficulty: "hard",
    questionText:
      "How would you design a system that needs to handle 10x traffic growth? Walk me through your thought process.",
    rubricHint:
      "Look for scalability thinking, bottleneck identification, caching/queueing strategies, and cost awareness.",
    strongAnswerSignals: [
      "Identifies current bottlenecks first",
      "Proposes horizontal scaling strategies",
      "Mentions caching, CDN, or queue-based solutions",
      "Discusses monitoring and gradual rollout",
    ],
    weakAnswerSignals: [
      "Only says add more servers",
      "No mention of database scaling",
      "No cost or complexity consideration",
    ],
  },
  {
    id: "pm-001",
    interviewType: "product_manager",
    targetRole: "Product Manager",
    difficulty: "easy",
    questionText:
      "Tell me about a product feature you shipped. How did you decide what to build?",
    rubricHint:
      "Look for user research, prioritization framework, stakeholder alignment, and success metrics.",
    strongAnswerSignals: [
      "References user feedback or data",
      "Explains prioritization rationale",
      "Mentions cross-functional collaboration",
      "Shares measurable outcome",
    ],
    weakAnswerSignals: [
      "No mention of user needs",
      "Feature described without reasoning",
      "No success metric or outcome",
    ],
  },
  {
    id: "pm-002",
    interviewType: "product_manager",
    targetRole: "Product Manager",
    difficulty: "medium",
    questionText:
      "How do you prioritize features when you have limited engineering resources?",
    rubricHint:
      "Look for frameworks like RICE/ICE, stakeholder management, data-driven decisions, and clear communication.",
    strongAnswerSignals: [
      "Uses a prioritization framework",
      "Balances user impact vs effort",
      "Communicates tradeoffs to stakeholders",
      "Provides concrete example",
    ],
    weakAnswerSignals: [
      "No framework mentioned",
      "Says everything is a priority",
      "No example from experience",
    ],
  },
  {
    id: "pm-003",
    interviewType: "product_manager",
    targetRole: "Product Manager",
    difficulty: "hard",
    questionText:
      "Your key metric dropped 20% this week. Walk me through how you would investigate and respond.",
    rubricHint:
      "Look for structured investigation, hypothesis formation, data analysis, and action planning.",
    strongAnswerSignals: [
      "Checks if data is accurate first",
      "Segments the drop by user cohort or feature",
      "Forms hypotheses and tests them",
      "Communicates findings and action plan",
    ],
    weakAnswerSignals: [
      "Jumps to solutions without investigation",
      "No data-driven approach",
      "Panics without structured thinking",
    ],
  },
  {
    id: "sales-001",
    interviewType: "sales",
    targetRole: "Sales Representative",
    difficulty: "easy",
    questionText:
      "Tell me about a deal you closed that you are proud of. What made it successful?",
    rubricHint:
      "Look for relationship building, understanding customer needs, overcoming objections, and deal impact.",
    strongAnswerSignals: [
      "Explains customer discovery process",
      "Describes objection handling",
      "Quantifies deal value or impact",
      "Shows follow-through and relationship building",
    ],
    weakAnswerSignals: [
      "No detail on customer needs",
      "Deal described without personal contribution",
      "No numbers or impact mentioned",
    ],
  },
  {
    id: "sales-002",
    interviewType: "sales",
    targetRole: "Sales Representative",
    difficulty: "medium",
    questionText:
      "How do you handle a prospect who says your product is too expensive?",
    rubricHint:
      "Look for value-based selling, active listening, reframing techniques, and negotiation skills.",
    strongAnswerSignals: [
      "Acknowledges the concern genuinely",
      "Reframes price as investment or ROI",
      "Asks discovery questions to understand budget",
      "Offers flexible solutions without undermining value",
    ],
    weakAnswerSignals: [
      "Immediately offers discount",
      "Gets defensive about pricing",
      "No attempt to understand the objection",
    ],
  },
  {
    id: "sales-003",
    interviewType: "sales",
    targetRole: "Sales Representative",
    difficulty: "hard",
    questionText:
      "Describe a time you lost a major deal. What did you learn and what would you do differently?",
    rubricHint:
      "Look for honest reflection, root cause analysis, lessons learned, and behavior change.",
    strongAnswerSignals: [
      "Honest about what went wrong",
      "Identifies specific mistakes or gaps",
      "Describes concrete changes made afterward",
      "Shows growth mindset",
    ],
    weakAnswerSignals: [
      "Blames external factors only",
      "No reflection or learning",
      "Avoids discussing the loss in detail",
    ],
  },
  {
    id: "bh-001",
    interviewType: "general_behavioral",
    targetRole: "General",
    difficulty: "easy",
    questionText:
      "Tell me about a time you worked effectively in a team. What was your role?",
    rubricHint:
      "Look for clear role description, collaboration, conflict handling, and team outcome.",
    strongAnswerSignals: [
      "Defines personal role clearly",
      "Describes collaboration with specific team members",
      "Mentions how conflicts or disagreements were handled",
      "Shares team outcome or achievement",
    ],
    weakAnswerSignals: [
      "Uses we without defining personal contribution",
      "No specific example",
      "No outcome mentioned",
    ],
  },
  {
    id: "bh-002",
    interviewType: "general_behavioral",
    targetRole: "General",
    difficulty: "medium",
    questionText:
      "Describe a situation where you had to manage a conflict with a coworker. How did you resolve it?",
    rubricHint:
      "Look for empathy, active listening, constructive approach, and positive resolution.",
    strongAnswerSignals: [
      "Describes the conflict objectively",
      "Shows empathy for the other person",
      "Explains steps taken to resolve",
      "Shares positive outcome or lesson",
    ],
    weakAnswerSignals: [
      "Blames the other person entirely",
      "No resolution described",
      "Avoids the conflict instead of addressing it",
    ],
  },
  {
    id: "bh-003",
    interviewType: "general_behavioral",
    targetRole: "General",
    difficulty: "hard",
    questionText:
      "Tell me about a time you failed at something important. What did you learn?",
    rubricHint:
      "Look for vulnerability, honest reflection, specific lessons, and demonstrated growth.",
    strongAnswerSignals: [
      "Shares a genuine failure, not a disguised success",
      "Explains what went wrong specifically",
      "Describes concrete lessons learned",
      "Shows how behavior changed afterward",
    ],
    weakAnswerSignals: [
      "Picks a trivial or fake failure",
      "No real reflection",
      "No evidence of growth or change",
    ],
  },
];
