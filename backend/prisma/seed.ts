import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const templates = [
  {
    slug: "software-engineer",
    title: "Software Engineer Interview",
    targetRole: "Software Engineer",
    difficulty: "junior",
    description: "Practice common software engineering interview questions covering technical projects, debugging skills, and teamwork.",
    questions: [
      {
        questionOrder: 1,
        questionText: "Tell me about a technical project you are proud of. What tradeoffs did you make?",
        rubricHint: "Look for specific technical decisions, clear tradeoff analysis, and outcome awareness",
        expectedDurationSeconds: 180,
      },
      {
        questionOrder: 2,
        questionText: "How do you debug a production issue when logs are incomplete?",
        rubricHint: "Evaluate systematic debugging approach, tool knowledge, and communication during incidents",
        expectedDurationSeconds: 150,
      },
      {
        questionOrder: 3,
        questionText: "Explain a time you disagreed with a teammate about implementation. How did you resolve it?",
        rubricHint: "Assess conflict resolution, technical communication, and collaborative problem-solving",
        expectedDurationSeconds: 150,
      },
    ],
  },
  {
    slug: "product-manager",
    title: "Product Manager Interview",
    targetRole: "Product Manager",
    difficulty: "mid",
    description: "Practice product management interview questions covering product strategy, prioritization, and stakeholder management.",
    questions: [
      {
        questionOrder: 1,
        questionText: "How would you prioritize features for a new product launch with limited engineering resources?",
        rubricHint: "Evaluate framework usage (RICE, ICE), data-driven thinking, and stakeholder consideration",
        expectedDurationSeconds: 180,
      },
      {
        questionOrder: 2,
        questionText: "Describe a product you improved. What metrics did you use to measure success?",
        rubricHint: "Look for clear metrics definition, impact measurement, and iterative improvement mindset",
        expectedDurationSeconds: 180,
      },
      {
        questionOrder: 3,
        questionText: "How do you handle disagreements between engineering and design teams?",
        rubricHint: "Assess mediation skills, empathy for different perspectives, and decision-making process",
        expectedDurationSeconds: 150,
      },
    ],
  },
  {
    slug: "sales",
    title: "Sales Interview",
    targetRole: "Sales Representative",
    difficulty: "junior",
    description: "Practice sales interview questions covering client relationships, objection handling, and closing techniques.",
    questions: [
      {
        questionOrder: 1,
        questionText: "Walk me through your approach to qualifying a new sales lead.",
        rubricHint: "Evaluate qualification methodology (BANT, MEDDIC), questioning skills, and efficiency",
        expectedDurationSeconds: 150,
      },
      {
        questionOrder: 2,
        questionText: "How do you handle a prospect who says 'Your product is too expensive'?",
        rubricHint: "Assess objection handling technique, value articulation, and negotiation skills",
        expectedDurationSeconds: 150,
      },
      {
        questionOrder: 3,
        questionText: "Describe your most challenging sales deal. What did you learn from it?",
        rubricHint: "Look for resilience, strategic thinking, relationship building, and learning agility",
        expectedDurationSeconds: 180,
      },
    ],
  },
  {
    slug: "general-behavioral",
    title: "General Behavioral Interview",
    targetRole: "General",
    difficulty: "junior",
    description: "Practice common behavioral interview questions that apply to any role, focusing on leadership, teamwork, and problem-solving.",
    questions: [
      {
        questionOrder: 1,
        questionText: "Tell me about a time you had to learn something new quickly to complete a project.",
        rubricHint: "Evaluate learning agility, resourcefulness, and ability to deliver under uncertainty",
        expectedDurationSeconds: 150,
      },
      {
        questionOrder: 2,
        questionText: "Describe a situation where you failed. What did you learn and how did you recover?",
        rubricHint: "Assess self-awareness, growth mindset, accountability, and resilience",
        expectedDurationSeconds: 180,
      },
      {
        questionOrder: 3,
        questionText: "Give an example of when you took initiative beyond your job description.",
        rubricHint: "Look for proactiveness, ownership mentality, and impact on team or organization",
        expectedDurationSeconds: 150,
      },
    ],
  },
];

async function main() {
  console.log("Seeding database...");

  for (const t of templates) {
    const template = await prisma.interviewTemplate.upsert({
      where: { slug: t.slug },
      update: {
        title: t.title,
        targetRole: t.targetRole,
        difficulty: t.difficulty,
        description: t.description,
      },
      create: {
        slug: t.slug,
        title: t.title,
        targetRole: t.targetRole,
        difficulty: t.difficulty,
        description: t.description,
      },
    });

    const sessionIds = (
      await prisma.interviewSession.findMany({
        where: { templateId: template.id },
        select: { id: true },
      })
    ).map((s) => s.id);

    if (sessionIds.length > 0) {
      await prisma.feedbackReport.deleteMany({ where: { sessionId: { in: sessionIds } } });
      await prisma.interviewAnswer.deleteMany({ where: { sessionId: { in: sessionIds } } });
      await prisma.interviewSession.deleteMany({ where: { id: { in: sessionIds } } });
    }

    await prisma.interviewQuestion.deleteMany({ where: { templateId: template.id } });

    for (const q of t.questions) {
      await prisma.interviewQuestion.create({
        data: {
          templateId: template.id,
          questionOrder: q.questionOrder,
          questionText: q.questionText,
          rubricHint: q.rubricHint,
          expectedDurationSeconds: q.expectedDurationSeconds,
        },
      });
    }

    console.log(`  Seeded: ${template.title} (${t.questions.length} questions)`);
  }

  const totalQuestions = await prisma.interviewQuestion.count();
  console.log(`Seed complete. ${templates.length} templates, ${totalQuestions} questions total.`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
