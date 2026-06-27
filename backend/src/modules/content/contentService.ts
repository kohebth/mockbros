import { pool } from "../../db/client.js";
import { notFound } from "../../shared/errors.js";

function toFact(row: any) {
  return {
    id: row.id,
    key: row.fact_key,
    label: row.label,
    value: row.value_text,
    displayOrder: row.display_order,
    sourceSheet: row.source_sheet,
    sourceRow: row.source_row
  };
}

function toIndustry(row: any) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    displayOrder: row.display_order,
    professionCount: Number(row.profession_count ?? 0)
  };
}

function toProfession(row: any) {
  return {
    id: row.id,
    industryId: row.industry_id,
    industryName: row.industry_name,
    slug: row.slug,
    title: row.title,
    displayOrder: row.display_order
  };
}

export class ContentService {
  async listProductFacts() {
    const result = await pool.query(`
      SELECT id, fact_key, label, value_text, display_order, source_sheet, source_row
      FROM product_facts
      ORDER BY display_order ASC, label ASC
    `);

    return { facts: result.rows.map(toFact) };
  }

  async listIndustries() {
    const result = await pool.query(`
      SELECT
        i.id,
        i.slug,
        i.name,
        i.display_order,
        COUNT(p.id) AS profession_count
      FROM industries i
      LEFT JOIN professions p ON p.industry_id = i.id
      GROUP BY i.id
      ORDER BY i.display_order ASC, i.name ASC
    `);

    return { industries: result.rows.map(toIndustry) };
  }

  async listProfessions(industryId?: string) {
    const params: string[] = [];
    const where = industryId ? "WHERE p.industry_id = $1" : "";
    if (industryId) {
      params.push(industryId);
      const industry = await pool.query("SELECT id FROM industries WHERE id = $1", [industryId]);
      if (!industry.rowCount) {
        throw notFound("Industry not found");
      }
    }

    const result = await pool.query(
      `
        SELECT
          p.id,
          p.industry_id,
          i.name AS industry_name,
          p.slug,
          p.title,
          p.display_order
        FROM professions p
        LEFT JOIN industries i ON i.id = p.industry_id
        ${where}
        ORDER BY COALESCE(i.display_order, 9999) ASC, p.display_order ASC, p.title ASC
      `,
      params
    );

    return { professions: result.rows.map(toProfession) };
  }
}
