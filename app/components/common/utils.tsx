"use server"

import {
  competition,
  course,
  umpire,
  player,
  competitionCourse,
  umpireCourse,
  SelectCompetition,
  SelectUmpire,
  SelectUmpireCourse,
  SelectCourse,
  SelectPlayer,
} from "@/app/lib/db/schema"
import { db } from "@/app/lib/db/db"
import { eq } from "drizzle-orm"

// 選手一覧情報を取得する関数
export async function getPlayerList(): Promise<{
  players: SelectPlayer[]
}> {
  const players: SelectPlayer[] = await db.select().from(player)
  return { players }
}

// 採点者一覧情報を取得する関数
export async function getUmpireList(): Promise<{
  umpires: SelectUmpire[]
}> {
  const umpires: SelectUmpire[] = await db.select().from(umpire)
  return { umpires }
}

// 大会一覧情報を取得する関数
export async function getCompetitionList(): Promise<{
  competitions: SelectCompetition[]
}> {
  const competitions: SelectCompetition[] = await db.select().from(competition)
  return { competitions }
}

// コース・採点者割当一覧を取得する関数
export async function getRawAssignList(): Promise<{
  assigns: SelectUmpireCourse[]
}> {
  const assigns: SelectUmpireCourse[] = await db.select().from(umpireCourse)
  return { assigns }
}

// コース一覧情報を取得する関数
export async function getCourseList(): Promise<{
  selectCourses: SelectCourse[]
}> {
  const selectCourses: SelectCourse[] = await db.select().from(course)
  return { selectCourses }
}

// 大会IDからコース一覧を取得する関数
export async function getCompetitionCourseList(competitionId: number): Promise<{
  selectCourses: SelectCourse[]
}> {
  const selectCourses = await db
    .select({
      id: course.id,
      name: course.name,
      field: course.field,
      fieldValid: course.fieldValid,
      mission: course.mission,
      missionValid: course.missionValid,
      point: course.point,
      createdAt: course.createdAt,
    })
    .from(course)
    .innerJoin(competitionCourse,
      eq(course.id, competitionCourse.courseId),
    )
    .where(eq(competitionCourse.competitionId, competitionId))

  return { selectCourses }
}
