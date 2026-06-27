import path from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";
import type { PoolClient } from "pg";
import { closeDb, pool } from "./client.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultWorkbookPath = path.resolve(dirname, "../../../Mock Bros - Product Build Sheet.xlsx");
const workbookPath = path.resolve(process.cwd(), process.argv.slice(2).join(" ") || defaultWorkbookPath);

type Row = unknown[];

type AssessmentImport = {
  slug: string;
  title: string;
  kind: "entry" | "profession";
  testType?: string | null;
  level?: string | null;
  industryId?: string | null;
  professionId?: string | null;
  description?: string | null;
  sourceSheet: string;
  sourceRow?: number | null;
};

const optionKeys = ["A", "B", "C", "D"] as const;

function cellText(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return String(value).trim();
}

function slugify(value: string) {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "item";
}

function worksheetRows(workbook: XLSX.WorkBook, sheetName: string) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error(`Workbook sheet not found: ${sheetName}`);
  }
  return XLSX.utils.sheet_to_json<Row>(sheet, { header: 1, raw: true, defval: null });
}

function parseScoreBand(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (value instanceof Date) {
    return { min: value.getMonth() + 1, max: value.getDate() };
  }

  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) {
      return { min: parsed.m, max: parsed.d };
    }
  }

  const text = cellText(value);
  const match = text.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (!match) {
    return null;
  }

  return {
    min: Number(match[1]),
    max: Number(match[2])
  };
}

async function upsertFact(client: PoolClient, key: string, label: string, value: string, order: number, row: number) {
  await client.query(
    `
      INSERT INTO product_facts (fact_key, label, value_text, display_order, source_sheet, source_row)
      VALUES ($1, $2, $3, $4, 'Fact Sheet', $5)
      ON CONFLICT (fact_key)
      DO UPDATE SET label = EXCLUDED.label,
                    value_text = EXCLUDED.value_text,
                    display_order = EXCLUDED.display_order,
                    source_sheet = EXCLUDED.source_sheet,
                    source_row = EXCLUDED.source_row,
                    updated_at = now()
    `,
    [key, label, value || null, order, row]
  );
}

async function upsertIndustry(client: PoolClient, name: string, order: number, row?: number | null) {
  const slug = slugify(name);
  const result = await client.query(
    `
      INSERT INTO industries (slug, name, display_order, source_sheet, source_row)
      VALUES ($1, $2, $3, 'Industry', $4)
      ON CONFLICT (slug)
      DO UPDATE SET name = EXCLUDED.name,
                    display_order = EXCLUDED.display_order,
                    source_sheet = EXCLUDED.source_sheet,
                    source_row = EXCLUDED.source_row,
                    updated_at = now()
      RETURNING id, slug
    `,
    [slug, name, order, row ?? null]
  );
  return result.rows[0] as { id: string; slug: string };
}

async function upsertProfession(
  client: PoolClient,
  industryId: string | null,
  title: string,
  displayOrder: number,
  row?: number | null,
  slugPrefix?: string
) {
  const baseSlug = slugPrefix ? `${slugify(slugPrefix)}-${slugify(title)}` : slugify(title);
  const result = await client.query(
    `
      INSERT INTO professions (industry_id, slug, title, display_order, source_sheet, source_row)
      VALUES ($1, $2, $3, $4, 'Industry', $5)
      ON CONFLICT (slug)
      DO UPDATE SET industry_id = EXCLUDED.industry_id,
                    title = EXCLUDED.title,
                    display_order = EXCLUDED.display_order,
                    source_sheet = EXCLUDED.source_sheet,
                    source_row = EXCLUDED.source_row,
                    updated_at = now()
      RETURNING id, slug
    `,
    [industryId, baseSlug, title, displayOrder, row ?? null]
  );
  return result.rows[0] as { id: string; slug: string };
}

async function upsertAssessment(client: PoolClient, input: AssessmentImport) {
  const result = await client.query(
    `
      INSERT INTO assessments (
        slug,
        title,
        assessment_kind,
        test_type,
        level,
        industry_id,
        profession_id,
        description,
        is_active,
        source_sheet,
        source_row
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, $9, $10)
      ON CONFLICT (slug)
      DO UPDATE SET title = EXCLUDED.title,
                    assessment_kind = EXCLUDED.assessment_kind,
                    test_type = EXCLUDED.test_type,
                    level = EXCLUDED.level,
                    industry_id = EXCLUDED.industry_id,
                    profession_id = EXCLUDED.profession_id,
                    description = EXCLUDED.description,
                    is_active = EXCLUDED.is_active,
                    source_sheet = EXCLUDED.source_sheet,
                    source_row = EXCLUDED.source_row,
                    updated_at = now()
      RETURNING id
    `,
    [
      input.slug,
      input.title,
      input.kind,
      input.testType ?? null,
      input.level ?? null,
      input.industryId ?? null,
      input.professionId ?? null,
      input.description ?? null,
      input.sourceSheet,
      input.sourceRow ?? null
    ]
  );
  return result.rows[0].id as string;
}

async function upsertCategory(
  client: PoolClient,
  assessmentId: string,
  kind: "classification" | "topic",
  name: string,
  displayOrder: number
) {
  const result = await client.query(
    `
      INSERT INTO assessment_categories (assessment_id, category_kind, slug, name, display_order)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (assessment_id, category_kind, slug)
      DO UPDATE SET name = EXCLUDED.name,
                    display_order = LEAST(assessment_categories.display_order, EXCLUDED.display_order),
                    updated_at = now()
      RETURNING id
    `,
    [assessmentId, kind, slugify(name), name, displayOrder]
  );
  return result.rows[0].id as string;
}

async function upsertQuestion(
  client: PoolClient,
  assessmentId: string,
  categoryId: string | null,
  order: number,
  questionText: string,
  explanation: string | null,
  sourceSheet: string,
  sourceRow: number
) {
  const result = await client.query(
    `
      INSERT INTO assessment_questions (
        assessment_id,
        category_id,
        question_order,
        question_text,
        explanation,
        source_sheet,
        source_row
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (assessment_id, question_order)
      DO UPDATE SET category_id = EXCLUDED.category_id,
                    question_text = EXCLUDED.question_text,
                    explanation = EXCLUDED.explanation,
                    source_sheet = EXCLUDED.source_sheet,
                    source_row = EXCLUDED.source_row,
                    updated_at = now()
      RETURNING id
    `,
    [assessmentId, categoryId, order, questionText, explanation, sourceSheet, sourceRow]
  );
  return result.rows[0].id as string;
}

async function upsertOptions(client: PoolClient, questionId: string, values: string[], correctKey: string) {
  await client.query("UPDATE assessment_question_options SET is_correct = false, updated_at = now() WHERE question_id = $1", [
    questionId
  ]);

  for (const [index, key] of optionKeys.entries()) {
    const text = values[index];
    if (!text) {
      continue;
    }
    await client.query(
      `
        INSERT INTO assessment_question_options (question_id, option_key, option_order, option_text, is_correct)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (question_id, option_key)
        DO UPDATE SET option_order = EXCLUDED.option_order,
                      option_text = EXCLUDED.option_text,
                      is_correct = EXCLUDED.is_correct,
                      updated_at = now()
      `,
      [questionId, key, index + 1, text, key === correctKey]
    );
  }
}

async function upsertScoreBand(
  client: PoolClient,
  assessmentId: string,
  minScore: number,
  maxScore: number,
  label: string,
  displayOrder: number,
  row: number
) {
  await client.query(
    `
      INSERT INTO assessment_score_bands (assessment_id, min_score, max_score, label, display_order, source_sheet, source_row)
      VALUES ($1, $2, $3, $4, $5, 'Entry Questions', $6)
      ON CONFLICT (assessment_id, min_score, max_score)
      DO UPDATE SET label = EXCLUDED.label,
                    display_order = EXCLUDED.display_order,
                    source_sheet = EXCLUDED.source_sheet,
                    source_row = EXCLUDED.source_row,
                    updated_at = now()
    `,
    [assessmentId, minScore, maxScore, label, displayOrder, row]
  );
}

async function importFactSheet(client: PoolClient, workbook: XLSX.WorkBook) {
  const rows = worksheetRows(workbook, "Fact Sheet");
  let order = 0;
  for (let index = 1; index < rows.length; index += 1) {
    const label = cellText(rows[index][1]);
    if (!label) {
      continue;
    }
    order += 1;
    await upsertFact(client, slugify(label), label, cellText(rows[index][2]), order, index + 1);
  }
  return order;
}

async function importIndustries(client: PoolClient, workbook: XLSX.WorkBook) {
  const rows = worksheetRows(workbook, "Industry");
  let industryCount = 0;
  let professionCount = 0;

  for (let index = 1; index < rows.length; index += 1) {
    const industryName = cellText(rows[index][0]);
    const professionsText = cellText(rows[index][1]);
    if (!industryName || !professionsText) {
      continue;
    }

    industryCount += 1;
    const industry = await upsertIndustry(client, industryName, industryCount, index + 1);
    const professions = professionsText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    for (const [professionIndex, professionTitle] of professions.entries()) {
      professionCount += 1;
      await upsertProfession(client, industry.id, professionTitle, professionIndex + 1, index + 1);
    }
  }

  return { industryCount, professionCount };
}

async function importEntryQuestions(client: PoolClient, workbook: XLSX.WorkBook) {
  const rows = worksheetRows(workbook, "Entry Questions");
  const assessmentId = await upsertAssessment(client, {
    slug: "eq-entry-test",
    title: "EQ Test",
    kind: "entry",
    testType: "EQ Test",
    description: "Entry emotional intelligence assessment from the product build sheet.",
    sourceSheet: "Entry Questions",
    sourceRow: 1
  });

  let questionOrder = 0;
  let bandOrder = 0;

  for (let index = 2; index < rows.length; index += 1) {
    const row = rows[index];
    const scoreBand = parseScoreBand(row[8]);
    const resultLabel = cellText(row[9]);
    if (scoreBand && resultLabel) {
      bandOrder += 1;
      await upsertScoreBand(client, assessmentId, scoreBand.min, scoreBand.max, resultLabel, bandOrder, index + 1);
    }

    const categoryName = cellText(row[0]);
    const questionText = cellText(row[1]);
    const options = [cellText(row[2]), cellText(row[3]), cellText(row[4]), cellText(row[5])];
    const correctKey = cellText(row[6]).toUpperCase();

    if (!categoryName || !questionText || options.some((option) => !option) || !optionKeys.includes(correctKey as any)) {
      continue;
    }

    questionOrder += 1;
    const categoryId = await upsertCategory(client, assessmentId, "classification", categoryName, questionOrder);
    const questionId = await upsertQuestion(
      client,
      assessmentId,
      categoryId,
      questionOrder,
      questionText,
      null,
      "Entry Questions",
      index + 1
    );
    await upsertOptions(client, questionId, options, correctKey);
  }

  return { questionCount: questionOrder, scoreBandCount: bandOrder };
}

async function getDataAiIndustryId(client: PoolClient) {
  const result = await client.query("SELECT id FROM industries WHERE slug = $1", ["data-ai-analytics"]);
  if (result.rowCount) {
    return result.rows[0].id as string;
  }
  const industry = await upsertIndustry(client, "Data / AI / Analytics", 999, null);
  return industry.id;
}

async function importProfessionQuestions(client: PoolClient, workbook: XLSX.WorkBook) {
  const rows = worksheetRows(workbook, "Profession Questions");
  const level = cellText(rows[0]?.[1]) || "junior";
  const position = cellText(rows[1]?.[1]) || "AI / Data Scientist";
  const industryId = await getDataAiIndustryId(client);
  const profession = await upsertProfession(client, industryId, position, 999, 2);

  const assessmentId = await upsertAssessment(client, {
    slug: `profession-${slugify(position)}-${slugify(level)}`,
    title: `${position} ${level} assessment`,
    kind: "profession",
    testType: "Profession Questions",
    level,
    industryId,
    professionId: profession.id,
    description: `Role-specific multiple-choice assessment for ${position} (${level}).`,
    sourceSheet: "Profession Questions",
    sourceRow: 1
  });

  let questionOrder = 0;
  for (let index = 4; index < rows.length; index += 1) {
    const row = rows[index];
    const topic = cellText(row[0]);
    const questionText = cellText(row[1]);
    const options = [cellText(row[2]), cellText(row[3]), cellText(row[4]), cellText(row[5])];
    const correctKey = cellText(row[6]).toUpperCase();
    const explanation = cellText(row[7]);

    if (!topic || !questionText || options.some((option) => !option) || !optionKeys.includes(correctKey as any)) {
      continue;
    }

    questionOrder += 1;
    const categoryId = await upsertCategory(client, assessmentId, "topic", topic, questionOrder);
    const questionId = await upsertQuestion(
      client,
      assessmentId,
      categoryId,
      questionOrder,
      questionText,
      explanation || null,
      "Profession Questions",
      index + 1
    );
    await upsertOptions(client, questionId, options, correctKey);
  }

  return { profession: position, level, questionCount: questionOrder };
}

async function main() {
  const workbook = XLSX.readFile(workbookPath, { cellDates: true });
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const facts = await importFactSheet(client, workbook);
    const industries = await importIndustries(client, workbook);
    const entry = await importEntryQuestions(client, workbook);
    const profession = await importProfessionQuestions(client, workbook);
    await client.query("COMMIT");

    console.log(
      JSON.stringify(
        {
          workbookPath,
          facts,
          industries,
          entry,
          profession
        },
        null,
        2
      )
    );
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await closeDb();
  }
}

main().catch(async (error) => {
  console.error(error);
  await closeDb();
  process.exit(1);
});
