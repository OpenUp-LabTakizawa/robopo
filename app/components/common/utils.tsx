"use server"

import { competition, umpire, SelectCompetition, SelectUmpire, SelectUmpireCourse, umpireCourse, SelectCourse, course, SelectPlayer, player } from "@/app/lib/db/schema"
import { BASE_URL } from "@/app/lib/const"
import { db } from "@/app/lib/db/db"

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
