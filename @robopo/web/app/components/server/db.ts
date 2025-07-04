"use server"

import { db } from "@/app/lib/db/db"
import {
  type SelectCompetition,
  type SelectCompetitionCourse,
  type SelectCourse,
  type SelectPlayer,
  type SelectUmpire,
  competition,
  competitionCourse,
  competitionPlayer,
  course,
  player,
  umpire,
} from "@/app/lib/db/schema"
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

// コース一覧情報を取得する関数
export async function getCourseList(): Promise<{
  courses: SelectCourse[]
}> {
  const courses: SelectCourse[] = await db.select().from(course)
  return { courses }
}

// 大会IDからコースを取得する関数
export async function getCompetitionCourseList(competitionId: number): Promise<{
  competitionCourses: SelectCourse[]
}> {
  const competitionCourses = await db
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
    .innerJoin(competitionCourse, eq(course.id, competitionCourse.courseId))
    .where(eq(competitionCourse.competitionId, competitionId))

  return { competitionCourses }
}

// 大会とその使用コースの一覧を取得する
export async function getCompetitionCourseAssignList(): Promise<{
  competitionCourseList: SelectCompetitionCourse[]
}> {
  const competitionCourseList: SelectCompetitionCourse[] = await db
    .select()
    .from(competitionCourse)
  return { competitionCourseList }
}

// 大会IDから参加選手を取得する
export async function getCompetitionPlayerList(competitionId: number): Promise<{
  players: SelectPlayer[]
}> {
  const players: SelectPlayer[] = await db
    .select({
      id: player.id,
      name: player.name,
      furigana: player.furigana,
      zekken: player.zekken,
      qr: player.qr,
      createdAt: player.createdAt,
    })
    .from(player)
    .innerJoin(competitionPlayer, eq(player.id, competitionPlayer.playerId))
    .where(eq(competitionPlayer.competitionId, competitionId))

  return { players }
}
