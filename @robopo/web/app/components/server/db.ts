"use server"

import { eq } from "drizzle-orm"
import { db } from "@/app/lib/db/db"
import {
  competition,
  competitionCourse,
  competitionPlayer,
  competitionUmpire,
  course,
  player,
  type SelectCompetition,
  type SelectCompetitionCourse,
  type SelectCompetitionUmpire,
  type SelectCourse,
  type SelectPlayer,
  type SelectUmpire,
  umpire,
} from "@/app/lib/db/schema"

// Get player list
export async function getPlayerList(): Promise<SelectPlayer[]> {
  return await db.select().from(player)
}

// Get umpire list
export async function getUmpireList(): Promise<SelectUmpire[]> {
  return await db.select().from(umpire)
}

// Get competition list
export async function getCompetitionList(): Promise<{
  competitions: SelectCompetition[]
}> {
  const competitions: SelectCompetition[] = await db.select().from(competition)
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
      zekken: player.zekken,
      qr: player.qr,
      createdAt: player.createdAt,
    })
    .from(player)
    .innerJoin(competitionPlayer, eq(player.id, competitionPlayer.playerId))
    .where(eq(competitionPlayer.competitionId, competitionId))

  return { players }
}

// Get competition-umpire assignment list
export async function getCompetitionUmpireAssignList(): Promise<{
  competitionUmpireList: SelectCompetitionUmpire[]
}> {
  const competitionUmpireList: SelectCompetitionUmpire[] = await db
    .select()
    .from(competitionUmpire)
  return { competitionUmpireList }
}

// Get umpires by competition ID
export async function getCompetitionUmpireList(competitionId: number): Promise<{
  umpires: SelectUmpire[]
}> {
  const umpires: SelectUmpire[] = await db
    .select({
      id: umpire.id,
      name: umpire.name,
      createdAt: umpire.createdAt,
    })
    .from(umpire)
    .innerJoin(competitionUmpire, eq(umpire.id, competitionUmpire.umpireId))
    .where(eq(competitionUmpire.competitionId, competitionId))

  return { umpires }
}
