import { db } from "@/lib/db/db"
import {
  challenge,
  competition,
  course,
  type InsertChallenge,
  type InsertCompetition,
  type InsertCourse,
  type InsertJudge,
  type InsertPlayer,
  judge,
  player,
} from "@/lib/db/schema"

export async function createCompetition(data: Omit<InsertCompetition, "id">) {
  return await db
    .insert(competition)
    .values(data)
    .returning({ id: competition.id })
}

export async function createCourse(data: Omit<InsertCourse, "id">) {
  return await db.insert(course).values(data).returning({ id: course.id })
}

export async function createPlayer(data: Omit<InsertPlayer, "id">) {
  return await db.insert(player).values(data).returning({ id: player.id })
}

export async function createJudge(data: Omit<InsertJudge, "id">) {
  return await db.insert(judge).values(data).returning({ id: judge.id })
}

export async function createChallenge(data: Omit<InsertChallenge, "id">) {
  return await db.insert(challenge).values(data)
}
