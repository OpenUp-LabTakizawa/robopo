"use server"

import { eq } from "drizzle-orm"
import { db } from "@/app/lib/db/db"
import {
  getCompetitionWithCourse,
  groupByCompetition,
} from "@/app/lib/db/queries/queries"
import {
  competition,
  competitionCourse,
  competitionJudge,
  competitionPlayer,
  course,
  judge,
  player,
  type SelectCompetition,
  type SelectCompetitionCourse,
  type SelectCompetitionJudge,
  type SelectCompetitionWithCourse,
  type SelectCourse,
  type SelectJudgeWithUsername,
  type SelectPlayer,
  user,
} from "@/app/lib/db/schema"

// Get player list
export async function getPlayerList(): Promise<SelectPlayer[]> {
  return await db.select().from(player)
}

// Get judge list (with username from user table)
export async function getJudgeList(): Promise<SelectJudgeWithUsername[]> {
  return await db
    .select({
      id: judge.id,
      note: judge.note,
      userId: judge.userId,
      createdAt: judge.createdAt,
      username: user.username,
    })
    .from(judge)
    .innerJoin(user, eq(judge.userId, user.id))
    .then((rows) => rows.map((r) => ({ ...r, username: r.username ?? "" })))
}

// Get competition list
export async function getCompetitionList(): Promise<{
  competitions: SelectCompetition[]
}> {
  const competitions: SelectCompetition[] = await db.select().from(competition)
  return { competitions }
}

// Get competition list with course info
export async function getCompetitionWithCourseList(): Promise<{
  competitions: SelectCompetitionWithCourse[]
}> {
  const competitions = groupByCompetition(await getCompetitionWithCourse())
  return { competitions }
}

// Get course list
export async function getCourseList(): Promise<{
  courses: SelectCourse[]
}> {
  const courses: SelectCourse[] = await db.select().from(course)
  return { courses }
}

// Get courses by competition ID
export async function getCompetitionCourseList(competitionId: number): Promise<{
  competitionCourses: SelectCourse[]
}> {
  const competitionCourses = await db
    .select({
      id: course.id,
      name: course.name,
      description: course.description,
      field: course.field,
      fieldValid: course.fieldValid,
      mission: course.mission,
      missionValid: course.missionValid,
      point: course.point,
      courseOutRule: course.courseOutRule,
      isConfigured: course.isConfigured,
      createdAt: course.createdAt,
    })
    .from(course)
    .innerJoin(competitionCourse, eq(course.id, competitionCourse.courseId))
    .where(eq(competitionCourse.competitionId, competitionId))

  return { competitionCourses }
}

// Get competition-course assignment list
export async function getCompetitionCourseAssignList(): Promise<{
  competitionCourseList: SelectCompetitionCourse[]
}> {
  const competitionCourseList: SelectCompetitionCourse[] = await db
    .select()
    .from(competitionCourse)
  return { competitionCourseList }
}

// Get players by competition ID
export async function getCompetitionPlayerList(competitionId: number): Promise<{
  players: SelectPlayer[]
}> {
  const players: SelectPlayer[] = await db
    .select({
      id: player.id,
      name: player.name,
      furigana: player.furigana,
      bibNumber: player.bibNumber,
      qr: player.qr,
      note: player.note,
      createdAt: player.createdAt,
    })
    .from(player)
    .innerJoin(competitionPlayer, eq(player.id, competitionPlayer.playerId))
    .where(eq(competitionPlayer.competitionId, competitionId))

  return { players }
}

// Get competition-judge assignment list
export async function getCompetitionJudgeAssignList(): Promise<{
  competitionJudgeList: SelectCompetitionJudge[]
}> {
  const competitionJudgeList: SelectCompetitionJudge[] = await db
    .select()
    .from(competitionJudge)
  return { competitionJudgeList }
}

// Get judges by competition ID (with username from user table)
export async function getCompetitionJudgeList(competitionId: number): Promise<{
  judges: SelectJudgeWithUsername[]
}> {
  const rows = await db
    .select({
      id: judge.id,
      note: judge.note,
      userId: judge.userId,
      createdAt: judge.createdAt,
      username: user.username,
    })
    .from(judge)
    .innerJoin(user, eq(judge.userId, user.id))
    .innerJoin(competitionJudge, eq(judge.id, competitionJudge.judgeId))
    .where(eq(competitionJudge.competitionId, competitionId))

  return {
    judges: rows.map((r) => ({ ...r, username: r.username ?? "" })),
  }
}
