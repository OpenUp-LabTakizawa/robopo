import { db } from "@/app/lib/db/db"
import { course } from "@/app/lib/db/schema"
import { eq } from "drizzle-orm"

export async function updateCourse(
  id: number,
  data: Partial<typeof course.$inferInsert>,
) {
  const result = await db.update(course).set(data).where(eq(course.id, id))
  return result
}
