import { pool, closeDb } from "./client.js";

async function reset() {
  await pool.query(`
    DROP TABLE IF EXISTS feedback_reports;
    DROP TABLE IF EXISTS interview_answers;
    DROP TABLE IF EXISTS interview_sessions;
    DROP TABLE IF EXISTS interview_questions;
    DROP TABLE IF EXISTS interview_templates;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS schema_migrations;
  `);
  console.log("Database reset complete");
}

reset()
  .then(() => closeDb())
  .catch(async (error) => {
    console.error(error);
    await closeDb();
    process.exit(1);
  });
