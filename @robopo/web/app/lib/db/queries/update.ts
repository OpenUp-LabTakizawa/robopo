import { eq } from "drizzle-orm"
import { db } from "@/app/lib/db/db"
import { course } from "@/app/lib/db/schema"

export async function updateCourse(
  id: number,
  data: Partial<typeof course.$inferInsert>,
) {
  return await db.update(course).set(data).where(eq(course.id, id))
}
