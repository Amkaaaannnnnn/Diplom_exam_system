import { addExamAssignment } from "../prisma/migrations/add_exam_assignment.js"
import { fixQuestionExamRelations } from "../prisma/migrations/fix_question_exam_relations.js"
import { addSubjectTypeField } from "../prisma/migrations/add_subject_type_field.js"
import { addResultTable } from "../prisma/migrations/add_result_table.js"
import { ensureResultTable } from "../prisma/migrations/ensure_result_table.js"

async function runMigrations() {
  console.log("Running migrations...")

  try {
    // Run migrations in sequence
    await addExamAssignment()
    await fixQuestionExamRelations()
    await addSubjectTypeField()
    await addResultTable()
    await ensureResultTable()

    console.log("All migrations completed successfully.")
  } catch (error) {
    console.error("Error running migrations:", error)
  }
}

runMigrations()
