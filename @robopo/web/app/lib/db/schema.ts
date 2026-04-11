import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core"

export const competition = pgTable("competition", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
})

export const course = pgTable("course", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  field: text("field"),
  fieldValid: boolean("fieldvalid").default(false).notNull(),
  mission: text("mission"),
  missionValid: boolean("missionvalid").default(false).notNull(),
  point: text("point"),
  courseOutRule: text("course_out_rule").default("keep").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
})

export const player = pgTable("player", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  furigana: text("furigana"),
  bibNumber: text("bib_number"),
  qr: text("qr"),
  createdAt: timestamp("created_at").defaultNow(),
})

export const judge = pgTable("judge", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
})

export const challenge = pgTable("challenge", {
  id: serial("id").primaryKey(),
  firstResult: integer("first_result").notNull(),
  retryResult: integer("retry_result"),
  detail: text("detail"),
  competitionId: integer("competition_id")
    .notNull()
    .references(() => competition.id, { onDelete: "cascade" }),
  courseId: integer("course_id")
    .notNull()
    .references(() => course.id, { onDelete: "cascade" }),
  playerId: integer("player_id")
    .notNull()
    .references(() => player.id, { onDelete: "cascade" }),
  judgeId: integer("judge_id").references(() => judge.id),
  createdAt: timestamp("created_at").defaultNow(),
})

export const competitionCourse = pgTable("competition_course", {
  id: serial("id").primaryKey(),
  competitionId: integer("competition_id")
    .notNull()
    .references(() => competition.id, { onDelete: "cascade" }),
  courseId: integer("course_id")
    .notNull()
    .references(() => course.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
})

export const competitionPlayer = pgTable("competition_player", {
  id: serial("id").primaryKey(),
  competitionId: integer("competition_id")
    .notNull()
    .references(() => competition.id, { onDelete: "cascade" }),
  playerId: integer("player_id")
    .notNull()
    .references(() => player.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
})

export const competitionJudge = pgTable("competition_judge", {
  id: serial("id").primaryKey(),
  competitionId: integer("competition_id")
    .notNull()
    .references(() => competition.id, { onDelete: "cascade" }),
  judgeId: integer("judge_id")
    .notNull()
    .references(() => judge.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
})

// Better Auth tables
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  username: text("username").unique(),
  displayUsername: text("display_username"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export type InsertCompetition = typeof competition.$inferInsert
export type SelectCompetition = typeof competition.$inferSelect

export type InsertCourse = typeof course.$inferInsert
export type SelectCourse = typeof course.$inferSelect

export type InsertPlayer = typeof player.$inferInsert
export type SelectPlayer = typeof player.$inferSelect

export type InsertJudge = typeof judge.$inferInsert
export type SelectJudge = typeof judge.$inferSelect

export type InsertChallenge = typeof challenge.$inferInsert
export type SelectChallenge = typeof challenge.$inferSelect

export type InsertCompetitionCourse = typeof competitionCourse.$inferInsert
export type SelectCompetitionCourse = typeof competitionCourse.$inferSelect

export type InsertCompetitionPlayer = typeof competitionPlayer.$inferInsert
export type SelectCompetitionPlayer = typeof competitionPlayer.$inferSelect

export type InsertCompetitionJudge = typeof competitionJudge.$inferInsert
export type SelectCompetitionJudge = typeof competitionJudge.$inferSelect

export type SelectPlayerWithCompetition = {
  id: number
  name: string
  furigana: string | null
  bibNumber: string | null
  competitionId: number | null
  competitionName: string[] | null
}

export type SelectJudgeWithCompetition = {
  id: number
  name: string
  competitionId: number | null
  competitionName: string[] | null
}

export type SelectCourseWithCompetition = {
  id: number
  name: string
  description: string | null
  createdAt: Date | null
  competitionId: number | null
  competitionName: string[] | null
}
