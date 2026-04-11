import { db } from "@/app/lib/db/db"
import {
  challenge,
  competition,
  competitionCourse,
  competitionJudge,
  competitionPlayer,
  course,
  type InsertChallenge,
  type InsertCompetition,
  type InsertCompetitionCourse,
  type InsertCompetitionJudge,
  type InsertCompetitionPlayer,
  type InsertCourse,
  type InsertJudge,
  type InsertPlayer,
  judge,
  player,
} from "@/app/lib/db/schema"

export async function createCompetition(data: Omit<InsertCompetition, "id">) {
  return await db.insert(competition).values(data)
}

export async function createCourse(data: Omit<InsertCourse, "id">) {
  return await db.insert(course).values(data)
}

export async function createPlayer(data: Omit<InsertPlayer, "id">) {
  return await db.insert(player).values(data)
}

export async function createJudge(data: Omit<InsertJudge, "id">) {
  return await db.insert(judge).values(data)
}

export async function createChallenge(data: Omit<InsertChallenge, "id">) {
  return await db.insert(challenge).values(data)
}

export async function insertCompetitionCourse(
  data: Omit<InsertCompetitionCourse, "id">,
) {
  return await db.insert(competitionCourse).values(data)
}

export async function insertCompetitionPlayer(
  data: Omit<InsertCompetitionPlayer, "id">,
) {
  return await db.insert(competitionPlayer).values(data)
}

export async function insertCompetitionJudge(
  data: Omit<InsertCompetitionJudge, "id">,
) {
  return await db.insert(competitionJudge).values(data)
}
