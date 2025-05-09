"use server"

// サーバ上で動かす関数類

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
import { signIn } from "@/auth"
import { AuthError } from "next-auth"
import { useFormState } from "react-dom"
import { redirect } from "next/navigation"
import { Router } from "next/router"

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

// signInのformState
export type FormState =
  | {
    errors?: {
      username?: string[]
      password?: string[]
    }
    message?: string
  }
  | undefined

// サーバアクションのサインイン
export async function signInAction(state: FormState, formData: FormData) {
  "use server"
  try {
    // redirectがうまく走らない為、サインイン後にclient側でリダイレクトする
    await signIn("credentials", { redirect: false, username: formData.get("username"), password: formData.get("password") })
    return {
      success: true,
      message: "サインインに成功しました",
    }
  } catch (error) {
    // Redirectエラーは無視する
    // これはNextAuthの仕様で、サインイン後にリダイレクトするために発生するエラー
    console.log("error: ", error)
    if (error instanceof Error && error.message === "NEXT_REDIRECT") { throw error }
    // それ以外のエラーはサインイン失敗とする
    if (error instanceof AuthError) {
      return {
        success: false,
        message: "サインインに失敗しました",
      }
    }
  }
}