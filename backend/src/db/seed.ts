import { pool, closeDb } from "./client.js";

const templates = [
  {
    slug: "software-engineer",
    title: "Software Engineer Interview",
    targetRole: "Software Engineer",
    difficulty: "junior",
    description: "Practice technical depth, debugging, ownership, and tradeoff questions.",
    questions: [
      {
        text: "Tell me about a technical project you are proud of. What tradeoffs did you make?",
        rubric: "Look for clear context, technical ownership, tradeoff reasoning, and measurable outcome."
      },
      {
        text: "How do you debug a production issue when logs are incomplete?",
        rubric: "Look for systematic diagnosis, customer impact awareness, and communication under pressure."
      },
      {
        text: "Explain a time you disagreed with a teammate about implementation.",
        rubric: "Look for collaboration, reasoning, openness to evidence, and constructive resolution."
      }
    ]
  },
  {
    slug: "product-manager",
    title: "Product Manager Interview",
    targetRole: "Product Manager",
    difficulty: "junior",
    description: "Practice prioritization, user insight, metrics, and product judgment.",
    questions: [
      {
        text: "Tell me about a product decision you made using user feedback.",
        rubric: "Look for user evidence, prioritization logic, and clear product outcome."
      },
      {
        text: "How would you prioritize three urgent feature requests with limited engineering time?",
        rubric: "Look for business impact, user value, effort, risk, and stakeholder communication."
      },
      {
        text: "What metric would you use to measure whether a mock interview feature is successful?",
        rubric: "Look for one clear metric, supporting metrics, and why they map to product value."
      }
    ]
  },
  {
    slug: "sales",
    title: "Sales Interview",
    targetRole: "Sales Representative",
    difficulty: "junior",
    description: "Practice discovery, objection handling, negotiation, and closing stories.",
    questions: [
      {
        text: "Tell me about a time you handled a difficult customer objection.",
        rubric: "Look for listening, diagnosis, value framing, and a concrete result."
      },
      {
        text: "How do you prepare before speaking with a new prospect?",
        rubric: "Look for research, hypothesis building, discovery questions, and next-step planning."
      },
      {
        text: "Describe a deal or project where persistence changed the outcome.",
        rubric: "Look for resilience, ethics, follow-up discipline, and business impact."
      }
    ]
  },
  {
    slug: "general-behavioral",
    title: "General Behavioral Interview",
    targetRole: "General Candidate",
    difficulty: "junior",
    description: "Practice teamwork, conflict, leadership, and communication answers.",
    questions: [
      {
        text: "Tell me about a time you worked with a difficult teammate.",
        rubric: "Look for empathy, ownership, communication, and resolution."
      },
      {
        text: "Describe a time you failed. What did you learn?",
        rubric: "Look for accountability, reflection, and behavior change."
      },
      {
        text: "What is one strength you bring to a team, and how have you used it?",
        rubric: "Look for self-awareness, specific evidence, and team impact."
      }
    ]
  }
];

async function seed() {
  for (const template of templates) {
    const result = await pool.query(
      `
        INSERT INTO interview_templates (slug, title, target_role, difficulty, description)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (slug)
        DO UPDATE SET
          title = EXCLUDED.title,
          target_role = EXCLUDED.target_role,
          difficulty = EXCLUDED.difficulty,
          description = EXCLUDED.description,
          updated_at = now()
        RETURNING id
      `,
      [template.slug, template.title, template.targetRole, template.difficulty, template.description]
    );

    const templateId = result.rows[0].id;

    for (const [index, question] of template.questions.entries()) {
      await pool.query(
        `
          INSERT INTO interview_questions (
            template_id,
            question_order,
            question_text,
            rubric_hint,
            expected_duration_seconds
          )
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (template_id, question_order)
          DO UPDATE SET
            question_text = EXCLUDED.question_text,
            rubric_hint = EXCLUDED.rubric_hint,
            expected_duration_seconds = EXCLUDED.expected_duration_seconds,
            updated_at = now()
        `,
        [templateId, index + 1, question.text, question.rubric, 120]
      );
    }
  }

  console.log(`Seeded ${templates.length} interview templates`);
}

seed()
  .then(() => closeDb())
  .catch(async (error) => {
    console.error(error);
    await closeDb();
    process.exit(1);
  });
